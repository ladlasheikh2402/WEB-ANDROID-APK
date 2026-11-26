/* LEGAL.JS — highlights the current section in the "On this page" list (privacy / terms).
   Inside index.html the router calls window.PGLegal(root) each time a legal page opens and
   calls the returned function when it closes. On the old standalone pages it runs by itself. */
(function () {
  'use strict';
  function init(scope) {
    scope = scope || document;
    var toc = scope.querySelector('.legal-toc');
    if (!toc) return function () {};
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var map = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]')).map(function (a) {
      return { a: a, el: document.getElementById(a.getAttribute('href').slice(1)) };
    }).filter(function (m) { return m.el; });
    if (!map.length) return function () {};

    var current = null, ticking = false;
    function set(a) {
      if (current === a) return;
      if (current) { current.classList.remove('is-active'); current.removeAttribute('aria-current'); }
      current = a; a.classList.add('is-active'); a.setAttribute('aria-current', 'location');
      var ol = a.closest('ol');                       // phone: keep the active chip centred in its row
      if (ol && ol.scrollWidth > ol.clientWidth && getComputedStyle(ol).display === 'flex') {
        ol.scrollTo({ left: a.parentNode.offsetLeft - (ol.clientWidth - a.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
      }
    }
    function update() {
      ticking = false;
      var best = map[0];
      map.forEach(function (m) { if (m.el.getBoundingClientRect().top <= window.innerHeight * 0.32) best = m; });
      set(best.a);
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    update();
    return function dispose() { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', update); };
  }
  window.PGLegal = init;
  if (document.querySelector('.legal-toc')) init(document);   // old standalone page
})();
