const CACHE = 'gia-studio-v9';
const SHELL = [
  './', './index.html', './manifest.webmanifest', './assets/icons/favicon.svg',
  './css/tokens.css', './css/base.css', './css/layout.css', './css/components.css',
  './css/views/home.css', './css/views/figures.css', './css/views/figure.css',
  './css/views/community.css', './css/views/account.css',
  './js/app.js', './js/core/router.js', './js/core/store.js', './js/core/utils.js',
  './js/data/figures.js', './js/components/icons.js', './js/components/nav.js',
  './js/components/toast.js', './js/components/figureCard.js', './js/components/modal.js',
  './js/components/search.js', './js/components/portrait.js', './js/components/rating.js',
  './js/components/states.js', './js/views/home.js', './js/views/figures.js',
  './js/views/figure.js', './js/views/asistente.js',
  './js/views/account.js', './js/views/notfound.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('gia-studio-') && key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(request).then((response) => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(request, copy));
    }
    return response;
  }).catch(async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') return caches.match('./index.html');
    throw new Error('Recurso no disponible sin conexión');
  }));
});
