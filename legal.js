/* LEGAL.JS — "On this page" list for the Privacy / Terms views (inside index.html)
   - highlights the section you are reading (only for the legal view that is currently shown)
   - TOC / in-page links scroll smoothly WITHOUT touching the URL hash (the hash holds the route, e.g. #/privacy) */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var tocs = Array.prototype.slice.call(document.querySelectorAll('.legal-toc')).map(function (toc) {
    var map = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]')).map(function (a) {
      return { a: a, el: document.getElementById(a.getAttribute('href').slice(1)) };
    }).filter(function (m) { return m.el; });
    return { toc: toc, map: map, current: null };
  }).filter(function (t) { return t.map.length; });

  function set(t, a) {
    if (t.current === a) return;
    if (t.current) { t.current.classList.remove('is-active'); t.current.removeAttribute('aria-current'); }
    t.current = a; a.classList.add('is-active'); a.setAttribute('aria-current', 'location');
    var ol = a.closest('ol');                       // phone: keep the active chip centred in its row
    if (ol && ol.scrollWidth > ol.clientWidth && getComputedStyle(ol).display === 'flex') {
      ol.scrollTo({ left: a.parentNode.offsetLeft - (ol.clientWidth - a.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
    }
  }

  var ticking = false;
  function update() {
    ticking = false;
    tocs.forEach(function (t) {
      if (!t.toc.offsetParent) return;              // that legal view is hidden right now
      var best = t.map[0];
      t.map.forEach(function (m) { if (m.el.getBoundingClientRect().top <= window.innerHeight * 0.32) best = m; });
      set(t, best.a);
    });
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.legal-page a[href^="#lg-"]');
    if (!a) return;
    var el = document.getElementById(a.getAttribute('href').slice(1));
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  });

  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update);
  window.addEventListener('routechange', update);
  update();
})();
