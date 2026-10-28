#!/usr/bin/env python3
"""Discover at most one hotel/hostel per city in CITIES per run (17 Latin American countries).

Free and keyless: candidates come from OpenStreetMap (Overpass API) and must have an
official https website and a usable Open Graph photo on that site. Each listing links
to Expedia and Trip.com search results for the property. Fails closed when uncertain.
"""
import hashlib, html, json, os, re, sys, time
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote, urlencode, urlparse
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "staylatin" / "index.html"
OUT = ROOT / "staylatin" / "auto-discovered-stays.json"
# (city, country, Brave country code, Brave search language)
PLACEHOLDER_IMAGE = "assets/hotel-placeholder.svg"
CITIES = [
    ("Tunja", "Colombia", "co", "es"), ("Santa Marta", "Colombia", "co", "es"), ("Cartagena", "Colombia", "co", "es"),
    ("Oaxaca", "Mexico", "mx", "es"), ("San José", "Costa Rica", "cr", "es"), ("San Salvador", "El Salvador", "sv", "es"),
    ("Antigua Guatemala", "Guatemala", "gt", "es"), ("Roatán", "Honduras", "hn", "es"), ("Granada", "Nicaragua", "ni", "es"),
    ("Panama City", "Panama", "pa", "es"), ("Santo Domingo", "Dominican Republic", "do", "es"),
    ("Buenos Aires", "Argentina", "ar", "es"), ("La Paz", "Bolivia", "bo", "es"), ("Rio de Janeiro", "Brazil", "br", "pt"),
    ("Santiago", "Chile", "cl", "es"), ("Quito", "Ecuador", "ec", "es"), ("Asunción", "Paraguay", "py", "es"),
    ("Cusco", "Peru", "pe", "es"), ("Montevideo", "Uruguay", "uy", "es"),
]

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

def overpass_hotels(city, cc):
    q = ('[out:json][timeout:60];area["ISO3166-1"="%s"]->.c;area(area.c)["name"="%s"]->.a;'
         '(nwr["tourism"~"^(hotel|hostel|guest_house)$"]["website"](area.a););out tags 200;') % (cc.upper(), city)
    req = Request("https://overpass-api.de/api/interpreter", data=urlencode({"data": q}).encode(),
                  headers={"User-Agent": "StayLatinDiscovery/1.0 (christopherthegoodgringo)"})
    with urlopen(req, timeout=90) as resp:
        return json.loads(resp.read().decode("utf-8")).get("elements", [])

def choose_for_city(city, country, cc, lang, existing):
    for el in overpass_hotels(city, cc):
        tags = el.get("tags", {})
        name = str(tags.get("name") or "").strip()
        website = str(tags.get("website") or "").strip()
        if len(name) < 4 or len(name) > 100 or not website.startswith("https://"): continue
        if (name.casefold().strip(), city.casefold()) in existing: continue
        if is_excluded_host(website): continue
        site = fetch_page(website)
        if not site: continue
        name_tokens = [t for t in re.findall(r"[a-z0-9]+", name.casefold()) if len(t) >= 4]
        site_identity = (site["title"] + " " + urlparse(site["url"]).netloc).casefold()
        if not name_tokens or not any(token in site_identity for token in name_tokens): continue
        if site["image"]:
            img_status, img_final, _ = get(site["image"], timeout=12)
            if img_status < 200 or img_status >= 400: img_final = PLACEHOLDER_IMAGE
            photo_note = "official site photo"
        else:
            img_final = PLACEHOLDER_IMAGE
            photo_note = "placeholder photo (none on official site)"
        desc = site["description"] or str(tags.get("description") or "")
        desc = re.sub(r"\s+", " ", html.unescape(desc)).strip()[:300]
        if len(desc) < 35: continue
        stay_type = "Hostel" if tags.get("tourism") == "hostel" else "Boutique hotel"
        pid = int(hashlib.sha256((name.casefold()+"|"+city.casefold()).encode()).hexdigest()[:7], 16) + 100000000
        query = quote(name + " " + city)
        return {
            "id": pid, "name": name, "city": city + ", " + country, "country": country,
            "type": stay_type, "vibe": "Culture", "desc": desc,
            "image": img_final, "imageFallback": PLACEHOLDER_IMAGE,
            "tag": "Basic", "tier": "Basic", "tierFeature": "Standard property profile",
            "website": site["url"],
            "expedia": "https://www.expedia.com/Hotel-Search?destination=" + query,
            "trip": "https://www.trip.com/hotels/list?keywords=" + query,
            "note": "Official property website; " + photo_note + "; Expedia and Trip.com search links",
            "discoverySource": "OpenStreetMap; official website checked " + time.strftime("%Y-%m-%d", time.gmtime())
        }
    print("No sufficiently verified new property found for %s; skipping rather than guessing." % city)
    return None

def main():
    existing, extra = read_existing()
    added = []
    for city, country, cc, lang in CITIES:
        try:
            item = choose_for_city(city, country, cc, lang, existing)
        except Exception as exc:
            print("Discovery for %s did not complete safely: %s" % (city, exc), file=sys.stderr)
            continue
        if item:
            extra.append(item)
            existing.add((item["name"].casefold().strip(), city.casefold()))
            added.append({"name": item["name"], "city": item["city"], "type": item["type"], "profile": item.get("expedia") or item.get("trip")})
    if added:
        OUT.write_text(json.dumps(extra, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("Verified new StayLatin properties:", json.dumps(added, ensure_ascii=False))
    else:
        print("No verified new properties met every requirement; no data changed.")

if __name__ == "__main__":
    main()
