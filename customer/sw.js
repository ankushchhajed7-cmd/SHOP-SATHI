/* ShopSathi customer service worker — v1.0.9 (network-first, offline cache) */
const CACHE = 'ss-customer-v1.0.9';
const CORE = ['./', './index.html', './manifest.json', '../shared/theme.css', '../shared/config.js', '../shared/i18n.js', '../shared/common.js', '../icons/icon-192.png', '../icons/icon-512.png'];
const CDN = /^https:\/\/(www\.gstatic\.com\/firebasejs|cdnjs\.cloudflare\.com|unpkg\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//;

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).catch(() => {}));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k.indexOf('ss-customer-') === 0 && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const same = new URL(r.url).origin === location.origin;
  if (!same && !CDN.test(r.url)) return; // Firebase data calls ko SW nahi chhoota
  e.respondWith(
    fetch(r).then((res) => {
      if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(r, cp)); }
      return res;
    }).catch(() => caches.match(r, { ignoreSearch: same }).then((m) => m || (r.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => {
    for (const c of cs) { if ('focus' in c) return c.focus(); }
    return self.clients.openWindow('./');
  }));
});
