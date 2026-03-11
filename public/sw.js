var CACHE = "scriptify-v3";
var ASSETS = ["/", "/profil", "/kesfet", "/topluluk", "/mesajlar", "/uret", "/bildirimler", "/arama"];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (e.request.url.includes("/api/")) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        var clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Push notification
self.addEventListener("push", e => {
  var data = {};
  try { data = e.data.json(); } catch (_) {}
  var title = data.title || "Scriptify";
  var body = data.body || "Yeni bildirim";
  var icon = "/icon-192.png";
  var badge = "/icon-192.png";
  var url = data.url || "/bildirimler";
  e.waitUntil(
    self.registration.showNotification(title, { body, icon, badge, data: { url } })
  );
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  var url = e.notification.data?.url || "/bildirimler";
  e.waitUntil(clients.matchAll({ type: "window" }).then(cs => {
    var found = cs.find(c => c.url === url && "focus" in c);
    if (found) return found.focus();
    return clients.openWindow(url);
  }));
});
