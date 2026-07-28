const CACHE = 'evergreen-v5';
const OFFLINE = [
  './',
  'index.html',
  'css/main.css',
  'js/data.js',
  'js/app.js',
  'js/templates.js',
  'manifest.json',
  'admin.html',
  'css/admin.css',
  'js/admin.js',
  'photos/dolmabahce.jpg',
  'photos/hagia-sofia.jpg',
  'photos/cistern.jpg',
  'photos/suleymaniye.jpg',
  'photos/balat.jpg',
  'photos/hammam.jpg',
  'photos/ali-ocakbasi.jpg',
  'photos/panoramic.jpg',
  'photos/firuze.jpg',
  'photos/liman.jpg',
  'photos/park-fora.jpg',
  'photos/istiklal.jpg',
  'photos/moxy-lobby.jpg',
  'photos/moxy-interior.jpg',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(OFFLINE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (!e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
      return cached || network;
    })
  );
});
