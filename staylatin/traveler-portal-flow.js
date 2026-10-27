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
    // Overview first, then planning tools and journal; favorites sit immediately
    // before traveler introductions as requested.
    let previous = stats;
    [toolkit, journal, favorites, introductions, messages, lounge].forEach(function (section) {
      if (section && previous) {
        previous.insertAdjacentElement("afterend", section);
        previous = section;
      } else if (section && !previous) {
        dashboard.appendChild(section);
        previous = section;
      }
    });
    // Account settings stay accessible at the end, away from the travel flow.
    if (security) (previous || dashboard).insertAdjacentElement("afterend", security);
    dashboard.dataset.flowArranged = "true";
  }
  function start() {
    arrange();
    const dashboard = document.getElementById("travelerDashboard");
    if (!dashboard || typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(function () {
      if (document.getElementById("travelerToolkit") && document.getElementById("travelerJournal")) {
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