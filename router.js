/* ══════════════════════════════════════════════════════════════
   ROUTER — login, signup, privacy policy, terms and data-deletion
   now live inside index.html (no separate page load).

   #/login   #/signup   #/privacy-policy   #/terms-of-service   #/data-deletion
   #/login?next=about-me   → after sign-in the visitor lands on that section.

   • Page markup comes from the <template id="tpl-…"> blocks at the bottom of index.html.
   • auth-pro.css + auth.js + auth-glass.js + auth-typing.js are loaded only when
     login/signup opens (auth-pro.css is global, so it is removed again on close).
   • Normal <a href="login.html"> links keep working (crawlers, middle-click, no-JS):
     a plain left click is intercepted and opened in-page instead.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var FILES = {
    'login.html': 'login', 'signup.html': 'signup',
    'privacy-policy.html': 'privacy-policy', 'terms-of-service.html': 'terms-of-service', 'data-deletion.html': 'data-deletion'
  };
  var TYPE = { 'login': 'auth', 'signup': 'auth', 'privacy-policy': 'legal', 'terms-of-service': 'legal', 'data-deletion': 'legal' };
  var AUTH_CSS = 'auth-pro.css';
  var AUTH_JS = ['auth.js', 'auth-glass.js', 'auth-typing.js'];
  var FONTS = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Inter:wght@400;500;600&display=swap';

  var root = null, cur = null, savedY = 0, savedTitle = '', authLink = null, authLoaded = null, legalOff = null, token = 0;

  function parseHash() {
    var m = /^#\/([a-z-]+)(?:\?(.*))?$/.exec(location.hash || '');
    if (!m || !TYPE[m[1]]) return null;
    return { route: m[1], qs: new URLSearchParams(m[2] || '') };
  }
  function fileOf(u) { return (u.pathname.split('/').pop() || ''); }

  /* ── assets ── */
  function ensureFonts() {
    if (document.getElementById('pgFonts')) return;
    var l = document.createElement('link'); l.id = 'pgFonts'; l.rel = 'stylesheet'; l.href = FONTS; document.head.appendChild(l);
  }
  function loadAuthCss() {
    ensureFonts();
    if (authLoaded) return authLoaded;
    authLink = document.createElement('link'); authLink.rel = 'stylesheet'; authLink.href = AUTH_CSS; authLink.id = 'pgAuthCss';
    authLoaded = new Promise(function (res) {
      var done = false; function fin() { if (!done) { done = true; res(); } }
      authLink.onload = fin; authLink.onerror = fin; setTimeout(fin, 4000);
    });
    document.head.appendChild(authLink);
    return authLoaded;
  }
  function dropAuthCss() {
    if (authLink) { authLink.remove(); authLink = null; authLoaded = null; }
    document.body.classList.remove('ag-played');
    clearTimeout(window.__agTimer);
  }
  function loadScript(src) {
    return new Promise(function (res) {
      var s = document.createElement('script'); s.src = src; s.async = false;
      s.onload = s.onerror = function () { s.remove(); res(); };
      document.head.appendChild(s);
    });
  }
  function runAuthScripts() {
    return AUTH_JS.reduce(function (p, src) { return p.then(function () { return loadScript(src); }); }, Promise.resolve());
  }
  function removeExtras() {
    ['socialConfirmOverlay', 'socialConfirmStyle'].forEach(function (id) { var el = document.getElementById(id); if (el) el.remove(); });
  }

  /* the little mouse-parallax that used to be an inline <script> in login.html / signup.html */
  function bindParallax() {
    var a = root.querySelector('.ap-aside'), w = root.querySelector('.ap-wall');
    if (!a || !w || !matchMedia('(hover:hover)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    a.addEventListener('pointermove', function (e) {
      var r = a.getBoundingClientRect();
      w.style.setProperty('--tx', (((e.clientX - r.left) / r.width - 0.5) * -26).toFixed(1) + 'px');
      w.style.setProperty('--ty', (((e.clientY - r.top) / r.height - 0.5) * -18).toFixed(1) + 'px');
    });
    a.addEventListener('pointerleave', function () { w.style.setProperty('--tx', '0px'); w.style.setProperty('--ty', '0px'); });
  }

  /* ── open / close ── */
  function open(r) {
    var tpl = document.getElementById('tpl-' + r.route);
    if (!tpl) return;
    var my = ++token, type = TYPE[r.route];
    if (!cur) {
      savedY = window.pageYOffset || 0; savedTitle = document.title;
      document.documentElement.classList.add('pg-mode');
    }
    cur = r;
    if (legalOff) { legalOff(); legalOff = null; }
    removeExtras();
    root.style.visibility = 'hidden';
    root.textContent = '';
    root.appendChild(tpl.content.cloneNode(true));
    document.body.classList.toggle('legal-page', type === 'legal');
    document.title = tpl.getAttribute('data-title') || document.title;
    window.scrollTo(0, 0);

    var ready = type === 'auth' ? loadAuthCss() : Promise.resolve(dropAuthCss());
    ready.then(function () {
      if (my !== token) return;
      document.body.classList.remove('ag-played');
      if (type === 'auth') {
        return runAuthScripts().then(function () { if (my === token) bindParallax(); });
      }
      if (window.PGLegal) legalOff = window.PGLegal(root);
    }).then(function () { if (my === token) root.style.visibility = ''; });
  }

  function goSection(target) {
    if (!target || target === 'home') { window.scrollTo(0, savedY); return; }
    var link = document.querySelector('.navbar-nav .nav-btn[data-target="' + target + '"]');
    if (link) link.click();
    else { var el = document.getElementById(target); if (el) el.scrollIntoView({ block: 'start' }); }
  }

  function close(target, fromHistory) {
    if (!cur) return;
    token++; cur = null;
    root.textContent = '';
    if (legalOff) { legalOff(); legalOff = null; }
    removeExtras(); dropAuthCss();
    document.body.classList.remove('legal-page');
    document.documentElement.classList.remove('pg-mode');
    document.title = savedTitle;
    if (!fromHistory && /^#\//.test(location.hash) && history.replaceState) { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} }
    root.style.visibility = '';
    requestAnimationFrame(function () { goSection(target); });
  }

  function go(route, query) {
    if (!TYPE[route]) return;
    var qs = new URLSearchParams(query || {});
    if (cur && TYPE[route] === 'auth' && !qs.has('next') && cur.qs.get('next')) qs.set('next', cur.qs.get('next'));
    var h = '#/' + route + (qs.toString() ? '?' + qs.toString() : '');
    if (location.hash === h) { sync(); return; }
    location.hash = h;
  }

  function sync() {
    var r = parseHash();
    if (r) { if (cur && cur.route === r.route && cur.qs.toString() === r.qs.toString()) return; open(r); }
    else if (cur) close(null, true);
  }

  /* ── clicks: open the in-page version of the old links ── */
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    var href = a.getAttribute('href'); if (!href) return;
    var inView = !!(root && root.contains(a));

    if (inView && href.charAt(0) === '#') {                       // table-of-contents / in-page anchors: scroll, don't change the URL
      e.preventDefault();
      var el = href.length > 1 ? document.getElementById(href.slice(1)) : null;
      if (el) el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      return;
    }
    var u; try { u = new URL(href, location.href); } catch (x) { return; }
    if (u.origin !== location.origin) return;
    var file = fileOf(u);
    if (FILES[file]) { e.preventDefault(); go(FILES[file], u.searchParams); return; }
    if (inView && (file === '' || file === 'index.html')) { e.preventDefault(); close(u.hash ? u.hash.slice(1) : ''); }
  }, true);

  window.PG = {
    go: go,
    close: close,
    afterAuth: function (next) { close(next || ''); },
    query: function (k) { return cur ? cur.qs.get(k) : null; },
    current: function () { return cur && cur.route; }
  };

  function start() {
    root = document.getElementById('pgRoot');
    if (!root) return;
    window.addEventListener('hashchange', sync);
    sync();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
