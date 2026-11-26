/* ═══════════════════════════════════════════════════════
   LADLA SHEIKH — SERVICE WORKER  (sw.js)  v2
   - the site opens offline (cached home page + core files)
   - pages: network first (you always get the newest deploy), cache only when offline
   - css / js / images: instant from cache, refreshed in the background
   - never touches other websites (Firebase, YouTube, GitHub downloads), audio/video or .apk/.zip files
═══════════════════════════════════════════════════════ */

const CACHE_NAME = 'ladla-sheikh-v3';

/* Small core set. A missing file can NOT break the install (each one is added separately). */
const CORE_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/site.css',
  '/animations.css',
  '/courses.css',
  '/auth-pro.css',
  '/legal.css',
  '/router.css',
  '/site.js',
  '/animations.js',
  '/luxury.js',
  '/courses.js',
  '/favourites.js',
  '/auth-gate.js',
  '/firebase-auth.js',
  '/auth.js',
  '/auth-glass.js',
  '/auth-typing.js',
  '/legal.js',
  '/router.js',
  '/visitor-counter.js',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png'
];

const SKIP_EXT = /\.(mp3|mp4|webm|m4a|ogg|wav|apk|xapk|zip|rar|7z|exe|msi|iso)$/i;

/* ── INSTALL ── */
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return Promise.all(CORE_FILES.map(function (url) {
        return cache.add(url).catch(function () { /* file not found: ignore */ });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

/* ── ACTIVATE: delete old caches ── */
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* ── FETCH ── */
self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;          // other websites: browser handles it
  if (req.headers.has('range')) return;                      // audio / video streaming
  if (SKIP_EXT.test(url.pathname)) return;                   // music, videos, downloads
  if (url.pathname.indexOf('/__/') === 0) return;            // firebase auth helper paths

  /* pages: network first -> cached home page when offline */
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(function (res) {
        if (res && res.status === 200 && (url.pathname === '/' || url.pathname === '/index.html')) {
          var copy = res.clone();
          caches.open(CACHE_NAME).then(function (c) { c.put('/index.html', copy); });
        }
        return res;
      }).catch(function () {
        return caches.match('/index.html').then(function (hit) { return hit || caches.match('/'); });
      })
    );
    return;
  }

  /* css / js / images / fonts: cache first, refresh in the background */
  event.respondWith(
    caches.match(req).then(function (cached) {
      var network = fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var copy = res.clone();
          caches.open(CACHE_NAME).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || network;
    })
  );
});
