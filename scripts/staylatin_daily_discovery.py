#!/usr/bin/env python3
"""Discover at most one verified hotel/hostel in Tunja and Santa Marta per run.

Requires BRAVE_SEARCH_API_KEY. Publishes only candidates with a working Expedia
or Trip.com property profile, a separate official property website, and an
official-site Open Graph photo. Fails closed when any requirement is uncertain.
"""
import hashlib, html, json, os, re, sys, time
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote, urlparse
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "staylatin" / "index.html"
OUT = ROOT / "staylatin" / "auto-discovered-stays.json"
API_KEY = os.environ.get("BRAVE_SEARCH_API_KEY", "").strip()
if not API_KEY:
    print("Missing required repository secret BRAVE_SEARCH_API_KEY; no listings changed.", file=sys.stderr)
    sys.exit(2)

class MetaParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.meta = {}; self.title = False; self.title_parts = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag.lower() == "meta":
            k = (a.get("property") or a.get("name") or "").lower()
            if k and a.get("content"): self.meta[k] = a["content"].strip()
        if tag.lower() == "title": self.title = True
    def handle_endtag(self, tag):
        if tag.lower() == "title": self.title = False
    def handle_data(self, data):
        if self.title: self.title_parts.append(data.strip())

def get(url, headers=None, timeout=18):
    req = Request(url, headers={"User-Agent":"StayLatinDirectoryBot/1.0 (+https://christopherthegoodgringo.github.io/cgg-luxury-directory-rebuild/)","Accept":"text/html,application/json,*/*", **(headers or {})})
    try:
        with urlopen(req, timeout=timeout) as res:
            return res.status, res.geturl(), res.read(1_500_000).decode("utf-8", "replace")
    except (HTTPError, URLError, TimeoutError, ValueError) as exc:
        return getattr(exc, "code", 0) or 0, url, ""

def search(q, count=20):
    url = "https://api.search.brave.com/res/v1/web/search?q=" + quote(q) + "&count=" + str(count) + "&country=co&search_lang=es"
    status, _, body = get(url, {"X-Subscription-Token": API_KEY, "Accept":"application/json"})
    if status != 200:
        raise RuntimeError("Brave Search request failed (HTTP %s); no listings changed." % status)
    data = json.loads(body)
    return data.get("web", {}).get("results", [])

def clean_name(title):
    s = re.sub(r"\s*[|–—-]\s*(Expedia|Trip\.com).*$", "", title, flags=re.I)
    s = re.sub(r"\s*[-|:]?\s*(Hotel Information|Reviews|Deals|Photos|Book online).*$", "", s, flags=re.I)
    s = re.sub(r"\s*[-|:]?\s*(Expedia\.com|Trip\.com).*$", "", s, flags=re.I)
    return html.unescape(s).strip(" -|:·")

def valid_booking_url(url):
    host = urlparse(url).netloc.lower().split(":")[0]
    path = urlparse(url).path.lower()
    if host == "expedia.com" or host.endswith(".expedia.com"):
        return ".hotel-information" in path or bool(re.search(r"\.h\d+", path))
    if host == "trip.com" or host.endswith(".trip.com"):
        return "/hotels/" in path and "/hotel-detail-" in path
    return False

def is_excluded_host(url):
    host = urlparse(url).netloc.lower().split(":")[0]
    blocked = ("expedia.", "trip.com", "booking.com", "hostelworld.com", "tripadvisor.", "hotels.com", "agoda.", "kayak.", "google.", "facebook.com", "instagram.com", "youtube.com", "wikipedia.org")
    return not host or any(x in host for x in blocked)

def fetch_page(url):
    status, final_url, body = get(url)
    if status < 200 or status >= 400 or not body:
        return None
    p = MetaParser(); p.feed(body)
    title = " ".join(p.title_parts).strip()
    image = p.meta.get("og:image") or p.meta.get("twitter:image")
    desc = p.meta.get("og:description") or p.meta.get("description") or ""
    if image and image.startswith("//"): image = "https:" + image
    if image and urlparse(image).scheme != "https": image = ""
    return {"url": final_url, "title": title, "image": image, "description": re.sub(r"\s+", " ", html.unescape(desc)).strip()}

def read_existing():
    raw = INDEX.read_text(encoding="utf-8")
    block = re.search(r"const\s+stays\s*=\s*\[(.*?)\n\];", raw, re.S)
    existing = set()
    if block:
        for name, city in re.findall(r'name\s*:\s*"([^"]+)"\s*,\s*city\s*:\s*"([^"]+)"', block.group(1)):
            existing.add((name.casefold().strip(), city.split(",")[0].casefold().strip()))
    extra = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else []
    for x in extra:
        existing.add((str(x.get("name","")).casefold().strip(), str(x.get("city","")).split(",")[0].casefold().strip()))
    return existing, extra

def choose_for_city(city, existing):
    city_q = '"%s" Colombia hotel hostel Expedia Trip.com' % city
    results = search(city_q, 20)
    for result in results:
        title = str(result.get("title") or "")
        booking = str(result.get("url") or "")
        if not valid_booking_url(booking): continue
        name = clean_name(title)
        if len(name) < 4 or len(name) > 100: continue
        if any(x in name.casefold() for x in ("best hotels", "cheap hotels", "hotels in", "hostels in", "hotel deals")): continue
        if (name.casefold().strip(), city.casefold()) in existing: continue
        # Confirm the specific property profile resolves and identifies the same property.
        status, final_booking, booking_html = get(booking)
        if status < 200 or status >= 400 or not booking_html: continue
        parsed = MetaParser(); parsed.feed(booking_html)
        page_title = " ".join(parsed.title_parts).casefold()
        if page_title and not any(token in page_title for token in name.casefold().split()[:2]): continue
        # Locate a distinct official property site, not a booking aggregator or directory.
        official = None
        for site_result in search('"%s" "%s" official hotel website' % (name, city), 10):
            candidate = str(site_result.get("url") or "")
            if candidate.startswith("https://") and not is_excluded_host(candidate):
                official = candidate; break
        if not official: continue
        site = fetch_page(official)
        if not site or not site["image"]: continue
        # Require the official-looking site to identify the property in its title or domain.
        name_tokens = [t for t in re.findall(r"[a-z0-9]+", name.casefold()) if len(t) >= 4]
        site_identity = (site["title"] + " " + urlparse(site["url"]).netloc).casefold()
        if not name_tokens or not any(token in site_identity for token in name_tokens): continue
        # Verify the photo URL is accessible; never substitute an unrelated stock photo.
        img_status, img_final, _ = get(site["image"], timeout=12)
        if img_status < 200 or img_status >= 400: continue
        kind_text = (name + " " + title + " " + str(result.get("description") or "")).casefold()
        stay_type = "Hostel" if any(w in kind_text for w in ("hostel", "hostal", "albergue")) else "Boutique hotel"
        desc = site["description"] or str(result.get("description") or "")
        desc = re.sub(r"\s+", " ", html.unescape(desc)).strip()[:300]
        if len(desc) < 35: continue
        pid = int(hashlib.sha256((name.casefold()+"|"+city.casefold()).encode()).hexdigest()[:7], 16) + 100000000
        item = {
            "id": pid, "name": name, "city": city + ", Colombia", "country": "Colombia",
            "type": stay_type, "vibe": "Culture", "desc": desc,
            "image": img_final, "imageFallback": img_final,
            "tag": "Basic", "tier": "Basic", "tierFeature": "Standard property profile",
            "website": site["url"],
            "expedia": final_booking if "expedia.com" in urlparse(final_booking).netloc.lower() else "",
            "trip": final_booking if "trip.com" in urlparse(final_booking).netloc.lower() else "",
            "note": "Official property website and verified " + ("Expedia" if "expedia.com" in urlparse(final_booking).netloc.lower() else "Trip.com") + " property profile",
            "discoverySource": "Brave Search; profile and official website checked " + time.strftime("%Y-%m-%d", time.gmtime())
        }
        return item
    print("No sufficiently verified new property found for %s; skipping rather than guessing." % city)
    return None

def main():
    existing, extra = read_existing()
    added = []
    for city in ("Tunja", "Santa Marta"):
        try:
            item = choose_for_city(city, existing)
        except Exception as exc:
            print("Discovery for %s did not complete safely: %s" % (city, exc), file=sys.stderr)
            continue
        if item:
            extra.append(item)
            existing.add((item["name"].casefold().strip(), city.casefold()))
            added.append({"name": item["name"], "city": city, "type": item["type"], "profile": item.get("expedia") or item.get("trip")})
    if added:
        OUT.write_text(json.dumps(extra, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("Verified new StayLatin properties:", json.dumps(added, ensure_ascii=False))
    else:
        print("No verified new properties met every requirement; no data changed.")

if __name__ == "__main__":
    main()
