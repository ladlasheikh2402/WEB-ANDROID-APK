/* ══════════════════════════════════════════════════════════════
   ROUTER.JS — login / signup / privacy / terms / data-deletion now live INSIDE index.html
   (no more separate .html files => no page loads => nothing to go blank in the Android app).

   #/login  #/signup  (+ ?next=about-me)   -> #view-auth  (filled from <template id="tpl-login|tpl-signup">)
   #/privacy  #/terms  #/data-deletion     -> <section id="view-…">
   any other hash (#about-me, #my-tools …) -> the normal one-page site

   Old links still work: login.html / signup.html redirect here.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var html = document.documentElement;
  var authRoot = document.getElementById('view-auth');
  var siteTitle = document.title;

  var ROUTES = {
    'login':         { kind: 'auth',  tpl: 'tpl-login',  title: 'Sign In | Ladla Sheikh' },
    'signup':        { kind: 'auth',  tpl: 'tpl-signup', title: 'Create Account | Ladla Sheikh' },
    'privacy':       { kind: 'legal', view: 'view-privacy',       title: 'Privacy Policy | Ladla Sheikh' },
    'terms':         { kind: 'legal', view: 'view-terms',         title: 'Terms of Service | Ladla Sheikh' },
    'data-deletion': { kind: 'legal', view: 'view-data-deletion', title: 'Delete your data | Ladla Sheikh' }
  };

  var state = { name: null, unmounts: [], token: 0, siteScroll: 0 };

  // site.css has scroll-behavior:smooth -> force an instant jump when swapping views
  function jump(y) { window.scrollTo({ top: y, left: 0, behavior: 'instant' }); }

  function parse() {
    var h = location.hash || '';
    if (h.indexOf('#/') !== 0) return null;
    var rest = h.slice(2), q = rest.indexOf('?');
    var name = (q > -1 ? rest.slice(0, q) : rest).replace(/\/+$/, '');
    if (!ROUTES.hasOwnProperty(name)) return null;
    return { name: name, route: ROUTES[name], params: new URLSearchParams(q > -1 ? rest.slice(q + 1) : '') };
  }

  function unmountAuth() {
    var fns = state.unmounts; state.unmounts = [];
    fns.forEach(function (fn) { try { fn(); } catch (e) {} });
    if (authRoot) { authRoot.innerHTML = ''; authRoot.className = 'route-view'; authRoot.hidden = true; }
  }

  function mountAuth(r) {
    var tpl = document.getElementById(r.route.tpl);
    if (!tpl || !authRoot) return;
    authRoot.innerHTML = '';
    authRoot.className = 'route-view';
    authRoot.appendChild(tpl.content.cloneNode(true));
    authRoot.hidden = false;
    var token = ++state.token;
    var ctx = {
      params: r.params,
      go: function (hash) { location.replace(hash); },          // replace: "Back" doesn't return to a finished sign-in
      onUnmount: function (fn) { state.unmounts.push(fn); },
      alive: function () { return state.token === token && state.name === r.name; }
    };
    ((window.AuthPages && window.AuthPages.mounts) || []).forEach(function (mount) {
      try { mount(authRoot, ctx); } catch (e) { if (window.console) console.error('[router] mount failed', e); }
    });
  }

  function hideLegal() {
    Array.prototype.forEach.call(document.querySelectorAll('.route-view.legal-page'), function (el) { el.hidden = true; });
  }

  function apply() {
    var r = parse();
    var cameFromRoute = !!state.name;

    unmountAuth();
    hideLegal();
    html.classList.remove('route-auth', 'route-legal');
    state.token++;

    if (r) {
      if (!cameFromRoute) state.siteScroll = window.pageYOffset || 0;   // remember where you were on the home page
      state.name = r.name;
      html.classList.add(r.route.kind === 'auth' ? 'route-auth' : 'route-legal');
      if (r.route.kind === 'auth') mountAuth(r);
      else { var v = document.getElementById(r.route.view); if (v) v.hidden = false; }
      document.title = r.route.title;
      jump(0);
    } else {
      state.name = null;
      document.title = siteTitle;
      if (cameFromRoute) {
        var id = (location.hash || '').slice(1);
        var el = id ? document.getElementById(id) : null;
        requestAnimationFrame(function () {
          if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
          else jump(state.siteScroll);
        });
      }
    }

    html.classList.remove('route-pending');
    try { window.dispatchEvent(new Event('routechange')); } catch (e) {}
  }

  /* While a route page is open the home sections are hidden, so header/footer links such as #about-me
     must first switch back to the site. Capture phase = runs before site.js' own click handlers. */
  document.addEventListener('click', function (e) {
    if (!state.name) return;
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href === '#' || href.indexOf('#/') === 0 || href.indexOf('#lg-') === 0) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    location.hash = href;
  }, true);

  window.addEventListener('hashchange', apply);
  apply();

  window.Router = { go: function (path) { location.hash = '#/' + path; }, current: function () { return state.name; } };
})();