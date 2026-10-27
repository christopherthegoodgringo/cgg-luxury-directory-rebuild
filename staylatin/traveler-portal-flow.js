/* StayLatin traveler portal flow: arrange existing modules in a clear, traveler-first sequence. */
(function () {
  "use strict";
  function arrange() {
    const dashboard = document.getElementById("travelerDashboard");
    if (!dashboard || dashboard.dataset.flowArranged === "true") return;
    const favorites = document.getElementById("travelerListingActions");
    const toolkit = document.getElementById("travelerToolkit");
    const journal = document.getElementById("travelerJournal");
    const introductions = document.getElementById("travelerIntroductions");
    const messages = document.getElementById("privateMessagingPanel");
    const lounge = document.getElementById("travelerLounge");
    const security = document.getElementById("travelerAccountSecurity");
    const stats = dashboard.querySelector(".dashboard-stats");
    // Keep quick actions immediately after the overview, then personal planning tools,
    // then the social area. The toolkit scripts create their sections dynamically.
    if (stats && favorites) stats.insertAdjacentElement("afterend", favorites);
    if (favorites && toolkit) favorites.insertAdjacentElement("afterend", toolkit);
    if (toolkit && journal) toolkit.insertAdjacentElement("afterend", journal);
    // Keep the member directory ahead of messaging and the Traveler Lounge.
    if (introductions && messages) introductions.insertAdjacentElement("afterend", messages);
    if (messages && lounge) messages.insertAdjacentElement("afterend", lounge);
    // Account and password controls are important, but belong at the end rather than
    // interrupting the travel and community experience.
    const lastSocial = lounge || messages || introductions || journal || toolkit || favorites || stats;
    if (security && lastSocial) lastSocial.insertAdjacentElement("afterend", security);
    dashboard.dataset.flowArranged = "true";
  }
  function start() {
    arrange();
    // Toolkit markup is inserted by a deferred sibling script; retry briefly on
    // normal DOM mutations without timers or network dependencies.
    const dashboard = document.getElementById("travelerDashboard");
    if (!dashboard || typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(function () {
      const toolkit = document.getElementById("travelerToolkit");
      const journal = document.getElementById("travelerJournal");
      if (toolkit && journal) {
        dashboard.dataset.flowArranged = "false";
        arrange();
        observer.disconnect();
      }
    });
    observer.observe(dashboard, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();