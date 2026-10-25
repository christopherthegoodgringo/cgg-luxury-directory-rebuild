self.addEventListener("push", event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) { data = { body: event.data ? event.data.text() : "" }; }
  const title = data.title || "CGG Luxury Directory";
  const options = {
    body: data.body || "You have a new traveler update.",
    icon: "./icons/cgg-notification.png",
    badge: "./icons/cgg-notification.png",
    data: { url: data.url || "./" },
    tag: data.tag || "cgg-traveler-notification",
    renotify: false
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener("notificationclick", event => {
  event.notification.close();
  const target = new URL(event.notification.data && event.notification.data.url || "./", self.location.origin).href;
  event.waitUntil((async () => {
    const clientsList = await clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of clientsList) {
      if (client.url.startsWith(self.location.origin) && "focus" in client) {
        await client.focus();
        client.postMessage({ type: "CGG_NOTIFICATION_CLICK", url: target });
        return;
      }
    }
    if (clients.openWindow) await clients.openWindow(target);
  })());
});
