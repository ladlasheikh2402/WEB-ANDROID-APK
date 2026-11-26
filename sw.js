/* ═══════════════════════════════════════════════════════
   LADLA SHEIKH — SERVICE WORKER  (sw.js)
   Version: 1.0
   - Caches website for offline use
   - Fast loading on repeat visits
═══════════════════════════════════════════════════════ */

const CACHE_NAME = 'ladla-sheikh-v2';

/* Files to cache on install */
const CACHE_FILES = [
  '/',
  '/index.html',
  '/site.css',
  '/site.js',
  '/courses.css',
  '/courses.js',
  '/luxury.js',
  '/visitor-counter.js',
  '/router.css',
  '/router.js',
  '/legal.css',
  '/legal.js',
  '/auth-pro.css',
  '/auth-typing.js',
  '/data-deletion.html',
  '/auth-gate.js',
  '/auth.js',
  '/favicon-96x96.png',
  '/firebase-auth.js',
  '/auth-glass.js',
  '/favourites.js',
  '/animations.css',
  '/animations.js',
  '/ladla-sheikh-banner.png',
  '/privacy-policy.html',
  '/signup.html',
  '/splash192.jpg',
  '/splash512.jpg',
  '/terms-of-service.html',
  '/web-app-manifest-192x192.png',
  '/login.html',
  '/sitemap.xml',
  '/manifest.json',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/Name of Allah.mp3',
  '/google-search.png',
  '/web-app-manifest-512x512.png',
  '/images/10.png',
  '/images/11.png',
  '/images/12.png',
  '/images/13.png',
  '/images/14.png',
  '/images/15.png',
  '/images/16.png',
  '/images/17.png',
  '/images/18.png',
  '/images/19.png',
  '/images/2.png',
  '/images/20.png',
  '/images/3.png',
  '/images/4.png',
  '/images/5.png',
  '/images/6.png',
  '/images/7.png',
  '/images/8.png',
  '/images/9.png',
  '/images/AD Maker.png',
  '/images/Add Music.png',
  '/images/Ali Ahmad.jpg',
  '/images/Alight Motion.png',
  '/images/App Lock.png',
  '/images/CamScanner.png',
  '/images/form-image.jpg',
  '/images/Gallery Plus.png',
  '/images/Hero-image.png',
  '/images/Ladla Sheikh.png',
  '/images/Ladla_Sheikh_WhatsApp.jpg',
  '/images/Lucky-patter.png',
  '/images/Magic Eraser.png',
  '/images/Netflix.png',
  '/images/Nord VPN.png',
  '/images/Photo Lab.png',
  '/images/PhotoLeap.png',
  '/images/SHAREit.png',
  '/images/Sheikh Ali Ahmad.jpg',
  '/images/Sheikh Ali.jpeg',
  '/images/Sheikh Ali.jpg',
  '/images/Snapchat-premium.png',
  '/images/Spotify.png',
  '/images/Urdu Designer.png',
  '/images/Video Downloader.png',
  '/images/about-img.png',
  '/images/about-image.png', 
  '/images/about.jpg',
  '/images/app-cloner.png',
  '/images/appcreator.jpeg',
  '/images/avee-player.png',
  '/images/bg and object-remove.png',
  '/images/capcut-premium.jpeg',
  '/images/capcut-pro.jpeg',
  '/images/clone-app.png',
  '/images/easypaisa-fake-ss.jpeg',
  '/images/easypaisa.png',
  '/images/edit-screenshot.png',
  '/images/evee-player.png',
  '/images/facemoji.png',
  '/images/facepic.png',
  '/images/fake-chat.png',
  '/images/fitroom.png',
  '/images/footer-img.png',
  '/images/grok-ai.png',
  '/images/hero-bg.jpg',
  '/images/hero-person.png',
  '/images/image.png',
  '/images/inshot-premium.jpeg',
  '/images/inshot-pro.webp',
  '/images/instagram.png',
  '/images/kinemaster-premium.jpeg',
  '/images/kinemaster-pro.jpeg',
  '/images/ladla-og.png',
  '/images/ladla-sheikh-whatsapp.jpeg',
  '/images/lightroom-premium.png',
  '/images/lock-apk.png',
  '/images/mobile-lock-apk.png',
  '/images/mobile-lock.png',
  '/images/mobile-reset-apk.png',
  '/images/mobile-virus.png',
  '/images/own-toolkit.jpeg',
  '/images/patcher.png',
  '/images/photo-editor.png',
  '/images/photoshop.png',
  '/images/picsart.png',
  '/images/pixellab-pro.png',
  '/images/sheikh-designer.jpg',
  '/images/sheikh-enhancer.jpeg',
  '/images/sheikh-enhancer.png',
  '/images/sheikh.jpg',
  '/images/simdatabase.jpg',
  '/images/simdatabase2.png',
  '/images/snaptube.png',
  '/images/splash-screen.png',
  '/images/telegram-fake-chat.png',
  '/images/telegram-premium.png',
  '/images/tiktok-live.jpeg',
  '/images/tiktok-pro.jpeg',
  '/images/tiktok-service.png',
  '/images/toolkit-gen.jpeg',
  '/images/uk-account.png',
  '/images/virus-apk.png',
  '/images/wa-beta.jpeg',
  '/images/wa-beta.png',
  '/images/wa-meta.png',
  '/images/whatsapp-fake-chat.jpg',
  '/images/whatsapp-fake-chat.png',
  '/images/without-update.png',
  '/images/youtube.png'
];

/* ── INSTALL: cache all files ── */
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('[SW] Caching files...');
      // add one by one so a single missing file can never break the whole install
      return Promise.all(CACHE_FILES.map(function (u) { return cache.add(u).catch(function () {}); }));
    })
  );
  self.skipWaiting();
});

/* ── ACTIVATE: remove old caches ── */
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          })
      );
    })
  );
  self.clients.claim();
});

/* ── FETCH: serve from cache, fallback to network ── */
self.addEventListener('fetch', function (e) {
  /* Skip non-GET and chrome-extension requests */
  if (e.request.method !== 'GET') return;
  if (e.request.url.startsWith('chrome-extension')) return;

  e.respondWith(
    caches.match(e.request).then(function (cached) {
      if (cached) {
        /* Serve from cache — also update in background */
        fetch(e.request).then(function (response) {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(e.request, response);
            });
          }
        }).catch(function () {});
        return cached;
      }

      /* Not in cache — fetch from network */
      return fetch(e.request).then(function (response) {
        if (!response || response.status !== 200) return response;

        /* Cache new resources */
        var responseClone = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(e.request, responseClone);
        });
        return response;
      }).catch(function () {
        /* Offline fallback */
        return caches.match('/index.html');
      });
    })
  );
});

