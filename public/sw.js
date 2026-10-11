const CACHE = 'senaryo-studio-shell-v2';
const SHELL = ['/uret', '/offline.html', '/studio-mark.svg', '/manifest.json'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL))); });
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('senaryo-studio-shell-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  // Private pages, API, auth, database and external requests are never cached.
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => {
      const cache = await caches.open(CACHE);
      return (url.pathname === '/uret' && await cache.match('/uret')) || await cache.match('/offline.html');
    }));
    return;
  }
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/fonts/') || SHELL.includes(url.pathname)) {
    event.respondWith(caches.open(CACHE).then(async cache => {
      const hit = await cache.match(request);
      if (hit) return hit;
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') await cache.put(request, response.clone());
      return response;
    }));
  }
});
