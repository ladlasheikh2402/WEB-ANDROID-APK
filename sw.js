/* Ladla Sheikh — service worker v3
   • HTML / JS / CSS / JSON  → NETWORK FIRST (always the newest code; cached copy only when offline)
   • images, audio, fonts     → cache first (fast, saved as they are used)
   • never touches other sites (Firebase, Google, YouTube …) and never caches video / audio ranges
   Why: the old worker served the previous index.html / scripts first, so after an update the app could mix
   old and new files (e.g. old script + new page) and the Sign In button stopped opening the login page. */
const VERSION = 'v3';
const SHELL_CACHE = 'ladla-shell-' + VERSION;
const RUNTIME_CACHE = 'ladla-runtime-' + VERSION;
const SHELL = [
  '/',
  '/index.html',
  '/images/Hero-image.png',
  '/favicon.svg',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/favicon-48x48.png',
  '/favicon-96x96.png',
  '/apple-touch-icon.png',
  '/manifest.json',
  '/site.css',
  '/animations.css',
  '/courses.css',
  '/router.css',
  '/legal.css',
  '/site.js',
  '/courses.js',
  '/luxury.js',
  '/favourites.js',
  '/firebase-auth.js',
  '/auth-gate.js',
  '/visitor-counter.js',
  '/animations.js',
  '/legal.js',
  '/router.js',
  '/auth-pro.css',
  '/auth.js',
  '/auth-glass.js',
  '/auth-typing.js',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      // one by one: a single missing file must never make the whole install fail
      Promise.all(SHELL.map((url) => cache.add(new Request(url, { cache: 'reload' })).catch(() => null)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const isCode = (url, req) => req.mode === 'navigate' || /\.(?:html|js|css|json|webmanifest)$/i.test(url.pathname) || url.pathname === '/';

function networkFirst(req, cacheName) {
  return fetch(req)
    .then((res) => {
      if (res && res.status === 200 && res.type === 'basic') {
        const copy = res.clone();
        caches.open(cacheName).then((c) => c.put(req, copy)).catch(() => {});
      }
      return res;
    })
    .catch(() =>
      caches.match(req, { ignoreSearch: true }).then((hit) => hit || (req.mode === 'navigate' ? caches.match('/index.html') : Response.error()))
    );
}

function cacheFirst(req) {
  return caches.match(req).then((hit) => {
    if (hit) return hit;
    return fetch(req).then((res) => {
      if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
        const copy = res.clone();
        caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy)).catch(() => {});
      }
      return res;
    });
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (req.headers.has('range')) return;                       // audio / video streaming: let the browser handle it
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;           // Firebase, Google, fonts … untouched
  if (isCode(url, req)) event.respondWith(networkFirst(req, SHELL_CACHE));
  else event.respondWith(cacheFirst(req));
});
