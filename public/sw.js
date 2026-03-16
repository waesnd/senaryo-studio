var CACHE_NAME = "scriptify-midnight-v1";
var STATIC_CACHE = "scriptify-static-v1";
var API_CACHE = "scriptify-api-v1";

// Önbelleğe alınacak statik sayfalar
var STATIC_ASSETS = [
  "/",
  "/profil",
  "/kesfet",
  "/topluluk",
  "/mesajlar",
  "/uret",
  "/bildirimler",
  "/arama",
];

// Önbelleğe alınacak statik dosyalar
var STATIC_FILES = [
  "/logo.png",
  "/icon-192.png",
  "/icon-512.png",
  "/manifest.json",
];

// ── INSTALL ──────────────────────────────────────────────────────────────────
self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(c =>
        c.addAll(STATIC_FILES).catch(() => {})
      ),
      caches.open(CACHE_NAME).then(c =>
        c.addAll(STATIC_ASSETS).catch(() => {})
      ),
    ])
  );
});

// ── ACTIVATE ─────────────────────────────────────────────────────────────────
self.addEventListener("activate", e => {
  var VALID = [CACHE_NAME, STATIC_CACHE, API_CACHE];
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => !VALID.includes(k))
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", e => {
  var url = e.request.url;
  var method = e.request.method;

  // Sadece GET isteklerini yönet
  if(method !== "GET") return;

  // Supabase & Cloudinary & harici API'ları atla
  if(
    url.includes("supabase.co") ||
    url.includes("cloudinary.com") ||
    url.includes("googleapis.com") ||
    url.includes("fonts.gstatic.com")
  ) return;

  // /api/ rotalarını atla — her zaman network'ten al
  if(url.includes("/api/")) return;

  // Statik dosyalar → Cache First
  if(
    url.includes(".png") ||
    url.includes(".jpg") ||
    url.includes(".ico") ||
    url.includes(".svg") ||
    url.includes("manifest.json")
  ){
    e.respondWith(
      caches.match(e.request).then(cached => {
        if(cached) return cached;
        return fetch(e.request).then(res => {
          if(res && res.ok){
            var clone = res.clone();
            caches.open(STATIC_CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        }).catch(() => cached);
      })
    );
    return;
  }

  // Next.js _next/static → Cache First
  if(url.includes("/_next/static/")){
    e.respondWith(
      caches.match(e.request).then(cached => {
        if(cached) return cached;
        return fetch(e.request).then(res => {
          if(res && res.ok){
            var clone = res.clone();
            caches.open(STATIC_CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // Sayfa navigasyonları → Network First, fallback cache
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if(res && res.ok){
          var clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => {
        return caches.match(e.request).then(cached => {
          if(cached) return cached;
          // Offline fallback — ana sayfa
          return caches.match("/");
        });
      })
  );
});

// ── PUSH BİLDİRİMLERİ ────────────────────────────────────────────────────────
self.addEventListener("push", e => {
  var data = {};
  try { data = e.data.json(); } catch(_) {}

  var title = data.title || "Scriptify";
  var body  = data.body  || "Yeni bir bildirim var";
  var icon  = data.icon  || "/icon-192.png";
  var badge = "/icon-192.png";
  var url   = data.url   || "/bildirimler";
  var tag   = data.tag   || "scriptify-notification";

  var options = {
    body,
    icon,
    badge,
    tag,
    data: { url },
    vibrate: [100, 50, 100],
    actions: [
      { action: "open",    title: "Aç"     },
      { action: "dismiss", title: "Kapat"  },
    ],
  };

  e.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ── BİLDİRİM TIKLAMA ─────────────────────────────────────────────────────────
self.addEventListener("notificationclick", e => {
  e.notification.close();

  if(e.action === "dismiss") return;

  var url = e.notification.data?.url || "/bildirimler";

  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then(cs => {
        // Aynı URL açıksa focus et
        var found = cs.find(c => {
          try { return new URL(c.url).pathname === new URL(url, self.location.origin).pathname; }
          catch(_) { return false; }
        });
        if(found && "focus" in found) return found.focus();
        // Yoksa yeni pencere aç
        if(clients.openWindow) return clients.openWindow(url);
      })
  );
});

// ── BACKGROUND SYNC (opsiyonel) ───────────────────────────────────────────────
self.addEventListener("sync", e => {
  if(e.tag === "sync-data"){
    // Offline'dayken biriken işlemler varsa gönder
    e.waitUntil(
      caches.open("scriptify-sync").then(c =>
        c.keys().then(keys => {
          // Bekleyen istekleri işle
          return Promise.all(keys.map(req =>
            c.match(req).then(res => {
              if(res) return fetch(req).then(() => c.delete(req)).catch(() => {});
            })
          ));
        })
      )
    );
  }
});

// ── MESAJ KANALI ─────────────────────────────────────────────────────────────
self.addEventListener("message", e => {
  if(e.data && e.data.type === "SKIP_WAITING"){
    self.skipWaiting();
  }
  if(e.data && e.data.type === "CLEAR_CACHE"){
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
  }
});
