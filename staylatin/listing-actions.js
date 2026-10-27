/* StayLatin listing card actions: localStorage + optional Supabase traveler profile sync. */
(function (global) {
  const STORAGE = {
    favorites: "staylatin-saved",
    trips: "staylatin-trips",
    compare: "staylatin-compare",
    been: "staylatin-been",
    map: "staylatin-map",
    alerts: "staylatin-alerts",
    invites: "staylatin-invites",
    favoriteDetails: "staylatin-favorite-details",
    prices: "staylatin-price-checks"
  };
  const SIGNIN = "traveler-signin.html";
  const MAX_COMPARE = 3;

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch (_) {
      return fallback;
    }
  }
  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
  }
  function listingSnapshot(item) {
    if (!item) return null;
    return {
      id: item.id,
      listing_key: String(item.id),
      name: item.name || "",
      city: item.city || "",
      country: item.country || "",
      type: item.type || "",
      vibe: item.vibe || "",
      tier: item.tier || item.tag || "",
      image: (Array.isArray(item.images) && item.images[0]) || item.image || "",
      website: item.website || "",
      expedia: item.expedia || item.expediaUrl || "",
      trip: item.trip || item.tripUrl || ""
    };
  }
  function getFavorites() {
    const saved = readJson(STORAGE.favorites, []);
    return Array.isArray(saved) ? saved.map(Number).filter(n => !Number.isNaN(n)) : [];
  }
  function setFavorites(ids) {
    writeJson(STORAGE.favorites, ids);
  }
  function getFavoriteDetails() {
    const rows = readJson(STORAGE.favoriteDetails, []);
    return Array.isArray(rows) ? rows : [];
  }
  function setFavoriteDetails(rows) { writeJson(STORAGE.favoriteDetails, rows); }
  function upsertFavoriteDetail(snap) {
    if (!snap) return;
    const rows = getFavoriteDetails().filter(x => Number(x.id) !== Number(snap.id));
    rows.unshift(snap);
    setFavoriteDetails(rows.slice(0, 200));
  }
  function removeFavoriteDetail(id) {
    setFavoriteDetails(getFavoriteDetails().filter(x => Number(x.id) !== Number(id)));
  }
  function getTrips() {
    const data = readJson(STORAGE.trips, {});
    return data && typeof data === "object" && !Array.isArray(data) ? data : {};
  }
  function setTrips(trips) { writeJson(STORAGE.trips, trips); }
  function getCompare() {
    const rows = readJson(STORAGE.compare, []);
    return Array.isArray(rows) ? rows : [];
  }
  function setCompare(rows) { writeJson(STORAGE.compare, rows.slice(0, MAX_COMPARE)); }
  function getBeen() {
    const rows = readJson(STORAGE.been, []);
    return Array.isArray(rows) ? rows : [];
  }
  function setBeen(rows) { writeJson(STORAGE.been, rows); }
  function getMapPins() {
    const rows = readJson(STORAGE.map, []);
    return Array.isArray(rows) ? rows : [];
  }
  function setMapPins(rows) { writeJson(STORAGE.map, rows); }
  function getAlerts() {
    const rows = readJson(STORAGE.alerts, []);
    return Array.isArray(rows) ? rows : [];
  }
  function setAlerts(rows) { writeJson(STORAGE.alerts, rows); }
  function getPriceChecks() { const rows = readJson(STORAGE.prices, []); return Array.isArray(rows) ? rows : []; }
  function setPriceChecks(rows) { writeJson(STORAGE.prices, rows.slice(0, 200)); }
  function getInvites() {
    const rows = readJson(STORAGE.invites, []);
    return Array.isArray(rows) ? rows : [];
  }
  function setInvites(rows) { writeJson(STORAGE.invites, rows.slice(0, 40)); }

  function toast(message) {
    let el = document.getElementById("slActionToast");
    if (!el) {
      el = document.createElement("div");
      el.id = "slActionToast";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      el.style.cssText = "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:9999;background:#112e27;color:#f7f4ec;padding:12px 18px;border-radius:999px;font:650 13px/1.3 Inter,system-ui,sans-serif;box-shadow:0 10px 28px rgba(17,46,39,.35);max-width:min(92vw,440px);text-align:center;opacity:0;transition:opacity .2s ease";
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.style.opacity = "1";
    clearTimeout(el._hide);
    el._hide = setTimeout(() => { el.style.opacity = "0"; }, 2600);
  }

  function supabaseClient() {
    const cfg = global.STAYLATIN_SUPABASE_CONFIG;
    if (!cfg?.url || !cfg?.anonKey || !global.supabase?.createClient) return null;
    if (!global.__staylatinListingActionsClient) {
      global.__staylatinListingActionsClient = global.supabase.createClient(cfg.url, cfg.anonKey);
    }
    return global.__staylatinListingActionsClient;
  }

  async function currentUserId() {
    const db = supabaseClient();
    if (!db) return null;
    try {
      const { data } = await db.auth.getSession();
      return data?.session?.user?.id || null;
    } catch (_) {
      return null;
    }
  }

  async function cloudUpsert(actionType, snap, extraPayload) {
    const userId = await currentUserId();
    if (!userId || !snap) return { synced: false, signedIn: false };
    const db = supabaseClient();
    const payload = Object.assign({}, snap, extraPayload || {});
    try {
      const { error } = await db.from("staylatin_traveler_listing_actions").upsert({
        user_id: userId,
        listing_key: String(snap.listing_key || snap.id),
        action_type: actionType,
        payload,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id,listing_key,action_type" });
      if (error) throw error;
      return { synced: true, signedIn: true };
    } catch (err) {
      return { synced: false, signedIn: true, error: err };
    }
  }

  async function cloudRemove(actionType, listingKey) {
    const userId = await currentUserId();
    if (!userId) return { synced: false, signedIn: false };
    const db = supabaseClient();
    try {
      const { error } = await db.from("staylatin_traveler_listing_actions")
        .delete()
        .eq("user_id", userId)
        .eq("listing_key", String(listingKey))
        .eq("action_type", actionType);
      if (error) throw error;
      return { synced: true, signedIn: true };
    } catch (err) {
      return { synced: false, signedIn: true, error: err };
    }
  }

  function guestNote(signedIn) {
    if (signedIn) return "";
    return " Saved on this device — sign in to sync to your traveler profile.";
  }

  async function toggleFavorite(item) {
    const snap = listingSnapshot(item);
    let favs = getFavorites();
    const id = Number(snap.id);
    const on = favs.includes(id);
    favs = on ? favs.filter(x => x !== id) : favs.concat(id);
    setFavorites(favs);
    if (on) removeFavoriteDetail(id); else upsertFavoriteDetail(snap);
    const cloud = on ? await cloudRemove("favorite", id) : await cloudUpsert("favorite", snap);
    toast((on ? "Removed from favorites." : "Saved to favorites.") + guestNote(cloud.signedIn));
    return { active: !on, synced: cloud.synced, signedIn: cloud.signedIn };
  }

  async function saveToTrip(item, boardName) {
    const snap = listingSnapshot(item);
    const board = (boardName || "My trip").trim() || "My trip";
    const trips = getTrips();
    if (!Array.isArray(trips[board])) trips[board] = [];
    if (!trips[board].some(x => Number(x.id) === Number(snap.id))) trips[board].push(snap);
    setTrips(trips);
    const cloud = await cloudUpsert("trip", snap, { board_name: board, boards: Object.keys(trips).filter(b => (trips[b] || []).some(x => Number(x.id) === Number(snap.id))) });
    toast("Added to trip board \"" + board + "\"." + guestNote(cloud.signedIn));
    return { board, synced: cloud.synced, signedIn: cloud.signedIn };
  }

  async function toggleCompare(item) {
    const snap = listingSnapshot(item);
    let rows = getCompare();
    const idx = rows.findIndex(x => Number(x.id) === Number(snap.id));
    if (idx >= 0) {
      rows.splice(idx, 1);
      setCompare(rows);
      await cloudRemove("compare", snap.id);
      toast("Removed from compare.");
      return { active: false, rows };
    }
    if (rows.length >= MAX_COMPARE) {
      toast("Compare is limited to 3 stays. Remove one first.");
      return { active: false, rows, full: true };
    }
    rows.push(snap);
    setCompare(rows);
    const cloud = await cloudUpsert("compare", snap);
    toast("Pinned for compare (" + rows.length + "/3)." + guestNote(cloud.signedIn));
    return { active: true, rows, synced: cloud.synced, signedIn: cloud.signedIn };
  }

  async function toggleBeen(item) {
    const snap = listingSnapshot(item);
    let rows = getBeen();
    const idx = rows.findIndex(x => Number(x.id) === Number(snap.id));
    if (idx >= 0) {
      rows.splice(idx, 1);
      setBeen(rows);
      await cloudRemove("been", snap.id);
      toast("Removed from Been here.");
      return { active: false };
    }
    rows.unshift(Object.assign({}, snap, { visited_at: new Date().toISOString().slice(0, 10) }));
    setBeen(rows);
    const cloud = await cloudUpsert("been", snap, { visited_at: rows[0].visited_at });
    toast("Marked as Been here." + guestNote(cloud.signedIn));
    return { active: true, synced: cloud.synced, signedIn: cloud.signedIn };
  }

  async function toggleMapPin(item) {
    const snap = listingSnapshot(item);
    let rows = getMapPins();
    const idx = rows.findIndex(x => Number(x.id) === Number(snap.id));
    if (idx >= 0) {
      rows.splice(idx, 1);
      setMapPins(rows);
      await cloudRemove("map", snap.id);
      toast("Removed map pin.");
      return { active: false };
    }
    rows.unshift(snap);
    setMapPins(rows);
    const cloud = await cloudUpsert("map", snap);
    toast("Pinned on your shortlist map." + guestNote(cloud.signedIn));
    return { active: true, synced: cloud.synced, signedIn: cloud.signedIn };
  }

  async function savePriceCheck(item) {
    const snap = listingSnapshot(item);
    if (!snap) return { saved: false };
    const checkedAt = new Date().toISOString();
    const rows = getPriceChecks().filter(x => Number(x.id) !== Number(snap.id));
    rows.unshift(Object.assign({}, snap, { checked_at: checkedAt, rate_estimate: item.rateEstimate || "Check dates" }));
    setPriceChecks(rows);
    const cloud = await cloudUpsert("price_check", snap, { checked_at: checkedAt, rate_estimate: item.rateEstimate || "Check dates" });
    toast("Price check saved for " + snap.name + "." + guestNote(cloud.signedIn));
    return { saved: true, synced: cloud.synced, signedIn: cloud.signedIn };
  }

  async function toggleAlert(item) {
    const snap = listingSnapshot(item);
    let rows = getAlerts();
    const idx = rows.findIndex(x => Number(x.id) === Number(snap.id));
    if (idx >= 0) {
      rows.splice(idx, 1);
      setAlerts(rows);
      await cloudRemove("alert", snap.id);
      toast("Alert removed.");
      return { active: false };
    }
    rows.unshift(snap);
    setAlerts(rows);
    const cloud = await cloudUpsert("alert", snap);
    toast("You'll be notified about listing updates (profile watch)." + guestNote(cloud.signedIn));
    return { active: true, synced: cloud.synced, signedIn: cloud.signedIn };
  }

  async function inviteFriend(item) {
    const snap = listingSnapshot(item);
    const url = new URL(global.location.href);
    url.hash = "stay-" + snap.id;
    const link = url.toString();
    const text = "Join me looking at " + snap.name + " in " + snap.city + " on StayLatin — " + link;
    const wa = "https://wa.me/?text=" + encodeURIComponent(text);
    const mail = "mailto:?subject=" + encodeURIComponent(snap.name + " on StayLatin") + "&body=" + encodeURIComponent(text);
    const invites = getInvites();
    invites.unshift(Object.assign({}, snap, { invited_at: new Date().toISOString(), link }));
    setInvites(invites);
    await cloudUpsert("invite", snap, { link, invited_at: invites[0].invited_at });
    return { text, link, wa, mail, snap };
  }

  async function pullCloudIntoLocal() {
    const userId = await currentUserId();
    if (!userId) return false;
    const db = supabaseClient();
    try {
      const { data, error } = await db.from("staylatin_traveler_listing_actions")
        .select("listing_key,action_type,payload,updated_at")
        .eq("user_id", userId)
        .limit(1000);
      if (error) throw error;
      const rows = data || [];
      const favs = new Set(getFavorites());
      const trips = getTrips();
      const compare = [];
      const been = [];
      const map = [];
      const alerts = [];
      const prices = [];
      const invites = [];
      rows.forEach(row => {
        const p = Object.assign({ id: Number(row.listing_key), listing_key: row.listing_key }, row.payload || {});
        if (!p.name) p.name = "Stay #" + row.listing_key;
        if (row.action_type === "favorite") { favs.add(Number(row.listing_key)); upsertFavoriteDetail(p); }
        if (row.action_type === "trip") {
          const board = (p.board_name || "My trip").trim() || "My trip";
          if (!Array.isArray(trips[board])) trips[board] = [];
          if (!trips[board].some(x => Number(x.id) === Number(p.id))) trips[board].push(p);
        }
        if (row.action_type === "compare" && compare.length < MAX_COMPARE) compare.push(p);
        if (row.action_type === "been") been.push(p);
        if (row.action_type === "map") map.push(p);
        if (row.action_type === "alert") alerts.push(p);
        if (row.action_type === "price_check") prices.push(p);
        if (row.action_type === "invite") invites.push(p);
      });
      setFavorites([...favs]);
      setTrips(trips);
      setCompare(compare);
      setBeen(been);
      setMapPins(map);
      setAlerts(alerts);
      setPriceChecks(prices);
      if (invites.length) setInvites(invites.concat(getInvites()).slice(0, 40));
      return true;
    } catch (_) {
      return false;
    }
  }

  async function pushLocalToCloud() {
    const userId = await currentUserId();
    if (!userId) return false;
    const jobs = [];
    getFavorites().forEach(id => jobs.push(cloudUpsert("favorite", { id, listing_key: String(id), name: "Stay #" + id })));
    const trips = getTrips();
    Object.keys(trips).forEach(board => {
      (trips[board] || []).forEach(item => jobs.push(cloudUpsert("trip", listingSnapshot(item) || item, { board_name: board })));
    });
    getCompare().forEach(item => jobs.push(cloudUpsert("compare", listingSnapshot(item) || item)));
    getBeen().forEach(item => jobs.push(cloudUpsert("been", listingSnapshot(item) || item, { visited_at: item.visited_at })));
    getMapPins().forEach(item => jobs.push(cloudUpsert("map", listingSnapshot(item) || item)));
    getAlerts().forEach(item => jobs.push(cloudUpsert("alert", listingSnapshot(item) || item)));
    getPriceChecks().forEach(item => jobs.push(cloudUpsert("price_check", listingSnapshot(item) || item, { checked_at: item.checked_at, rate_estimate: item.rate_estimate })));
    await Promise.allSettled(jobs);
    return true;
  }

  async function syncOnSignIn() {
    await pullCloudIntoLocal();
    await pushLocalToCloud();
  }

  function stateFor(id) {
    const n = Number(id);
    const trips = getTrips();
    const inTrip = Object.keys(trips).some(b => (trips[b] || []).some(x => Number(x.id) === n));
    return {
      favorite: getFavorites().includes(n),
      trip: inTrip,
      compare: getCompare().some(x => Number(x.id) === n),
      been: getBeen().some(x => Number(x.id) === n),
      map: getMapPins().some(x => Number(x.id) === n),
      alert: getAlerts().some(x => Number(x.id) === n)
    };
  }

  global.StayLatinListingActions = {
    STORAGE, MAX_COMPARE, SIGNIN,
    getFavorites, setFavorites, getFavoriteDetails, getTrips, setTrips, getCompare, setCompare,
    getBeen, setBeen, getMapPins, setMapPins, getAlerts, setAlerts, getPriceChecks, setPriceChecks, getInvites, setInvites,
    listingSnapshot, toast, currentUserId, stateFor,
    toggleFavorite, saveToTrip, toggleCompare, toggleBeen, toggleMapPin, toggleAlert, savePriceCheck, inviteFriend,
    syncOnSignIn, pullCloudIntoLocal, pushLocalToCloud, cloudUpsert, cloudRemove
  };
})(window);
