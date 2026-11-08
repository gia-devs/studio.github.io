const CACHE = 'gia-studio-aion-v14';
const SHELL = [
  './', './index.html', './manifest.webmanifest', './assets/icons/favicon.svg', './img/B2.png', './img/tabaqueria.png',
  './css/tokens.css', './css/base.css', './css/layout.css', './css/components.css',
  './css/views/home.css', './css/views/figures.css', './css/views/figure.css',
  './css/views/community.css',
  './js/app.js', './js/core/router.js', './js/core/store.js', './js/core/utils.js',
  './js/data/figures.js', './js/components/icons.js', './js/components/nav.js',
  './js/components/toast.js', './js/components/figureCard.js', './js/components/modal.js',
  './js/components/search.js', './js/components/portrait.js', './js/components/rating.js',
  './js/components/states.js', './js/views/home.js', './js/views/figures.js',
  './js/views/figure.js', './js/views/asistente.js',
  './js/views/notfound.js', './js/aion/normalize.js', './js/aion/data.js',
  './js/aion/intents.js', './js/aion/templates.js', './js/aion/memory.js',
  './js/aion/engine.js', './js/aion/ui.js', './js/aion/tests.js'
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
  event.respondWith(caches.match(request).then((cached) => cached || (request.mode === 'navigate' ? caches.match('./index.html') : Response.error())));
});
