/* Service worker minimal: cache GET same-origin supaya kamus & halaman tetap jalan offline. */
const CACHE = 'office-assistant-v1';
const PRECACHE = ['/', '/kamus', '/rumus', '/bersihkan', '/dokumen', '/presentasi', '/template', '/manifest.webmanifest', '/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // allSettled: satu URL gagal tidak menggagalkan instalasi seluruh SW.
      .then((cache) => Promise.allSettled(PRECACHE.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ||
        fetch(request)
          .then((response) => {
            // Hanya simpan respons sukses 200; respons error/ partial jangan menempel di cache.
            if (response.status === 200 && response.type === 'basic') {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => caches.match('/'))
    )
  );
});
