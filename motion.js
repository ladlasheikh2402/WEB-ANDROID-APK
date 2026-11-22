/* ══════════════════════════════════════════════════════════════
   MOTION.JS — animation layer (loads after site.js / luxury.js)
   1. Install popup: iOS steps, swipe-down to dismiss on phones, Esc to
      close, "installed" toast, and a preview link (?install=1)
   2. Scroll reveals for everything that is not already a card
   3. Typing "chat" greeting in the contact form (like auth-typing.js)
   4. Ripple on round / small buttons (luxury.js already does .btn)
   5. Soft mouse parallax for the hero sparkles only
   6. Icons pop in, images are uncovered bottom -> top (see motion.css)
      (the hero portrait and arch are NOT touched — they stay still)
   Nothing here replaces site.js logic; it only adds on top.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }

  /* ───────── 1. INSTALL POPUP ───────── */
  (function install() {
    var card = $('#installCard');
    if (!card) return;
    var no = $('#installNo'), yes = $('#installYes');

    var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !navigator.standalone &&
      !(window.matchMedia && matchMedia('(display-mode: standalone)').matches);
    if (ios) {
      card.classList.add('is-ios');
      if (no) no.textContent = 'Got it';
    }

    /* preview: open  yoursite/?install=1  to see the popup straight away */
    if (/[?&]install=1\b/.test(location.search) || location.hash === '#install-preview') {
      setTimeout(function () { card.classList.add('show'); }, 900);
    }

    /* Esc = "Maybe later" */
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && card.classList.contains('show') && no) no.click();
    });

    /* phones: swipe the sheet down to dismiss */
    var startY = 0, dy = 0, dragging = false;
    card.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button')) return;
      if (window.innerWidth > 520) return;
      dragging = true; startY = e.clientY; dy = 0;
      card.classList.add('is-drag');
    });
    window.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      dy = Math.max(0, e.clientY - startY);
      card.style.transform = 'translateY(' + dy + 'px)';
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      card.classList.remove('is-drag');
      card.style.transform = '';
      if (dy > 80 && no) no.click();
    }
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    /* "installed" toast */
    window.addEventListener('appinstalled', function () {
      var t = doc.createElement('div');
      t.className = 'ic-toast';
      t.setAttribute('role', 'status');
      t.innerHTML = '<span class="tick"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>App installed — find it on your home screen';
      doc.body.appendChild(t);
      requestAnimationFrame(function () { requestAnimationFrame(function () { t.classList.add('show'); }); });
      setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 700); }, 3800);
    });
  })();

  if (reduce) return;                                   // everything below is motion

  /* ───────── 2. SCROLL REVEALS ───────── */
  if ('IntersectionObserver' in window) {
    var SKIP = '.hero, #home, .splash, .site-header, .footer-mark, .rv, [data-mx]';
    var plan = [
      ['.about-copy > :not(.stats):not(.info)', 'up', 90],
      ['.stats > *', 'zoom', 110],
      ['.info > *', 'up', 80],
      ['.section-search-wrap', 'up', 0],
      ['.contact-info > *', 'up', 90],
      ['.contact-list li', 'left', 100],
      ['.connect', 'up', 0],
      ['.form-grid > .field', 'up', 70],
      ['.form-actions', 'up', 0],
      ['.footer-brand', 'up', 0],
      ['.footer-col', 'up', 110],
      ['.footer-bottom', 'up', 0],
      /* images: uncovered from the bottom edge up to the top */
      ['.tcp-icon-frame img, .ppc-image > img, .connect img', 'img', 80, 'mod3'],
      /* social icons pop in one after another */
      ['.soc a', 'pop', 120, 'sib'],
      /* legal pages */
      ['.legal-toc', 'left', 0],
      ['.legal-shell > h2', 'up', 0],
      ['.legal-note', 'zoom', 0]
    ];
    var tagged = [];
    plan.forEach(function (row) {
      $$(row[0]).forEach(function (el, i) {
        if (el.matches(SKIP) || el.closest('.hero, .splash, .site-header, .mobile-menu')) return;
        var n = row[3] === 'sib' ? Array.prototype.indexOf.call(el.parentNode.children, el)
              : row[3] === 'mod3' ? i % 3 : i;
        el.setAttribute('data-mx', row[1]);
        el.style.setProperty('--mxd', (Math.min(n, 6) * row[2]) + 'ms');
        tagged.push(el);
      });
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        el.classList.add('mx-in');
        var wait = 2000 + (parseFloat(el.style.getPropertyValue('--mxd')) || 0);
        setTimeout(function () {                      // finished: hand control back to the element's own CSS
          el.removeAttribute('data-mx');
          el.classList.remove('mx-in');
          el.style.removeProperty('--mxd');
        }, wait);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });

    if (tagged.length) {
      root.classList.add('mx-on');
      tagged.forEach(function (el) { io.observe(el); });
      /* safety net: never leave anything hidden */
      setTimeout(function () {
        $$('[data-mx]').forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.top < innerHeight && r.bottom > 0) { el.classList.add('mx-in'); }
        });
      }, 4000);
    }
  }

  /* ───────── 3. TYPING CHAT (contact form) ───────── */
  (function chat() {
    var form = $('.form-card');
    if (!form) return;
    var MSG = 'Have a question or an idea? Send me a message — I would love to hear from you.';
    var box = doc.createElement('div');
    box.className = 'mx-chat';
    box.setAttribute('aria-label', 'Greeting');
    box.innerHTML =
      '<span class="av"><img src="images/footer-img.png" alt="" width="38" height="38" onerror="this.style.display=\'none\'"></span>' +
      '<div class="bub"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="txt"></span></div>';
    form.insertBefore(box, form.firstChild);
    var txt = $('.txt', box);
    txt.textContent = MSG;                              // full text first: no layout jump, readable without JS motion

    var started = false, timers = [];
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function finish() { timers.forEach(clearTimeout); txt.textContent = MSG; txt.classList.remove('caret'); box.className = 'mx-chat is-in is-done'; }
    function run() {
      if (started) return; started = true;
      var bb = $('.bub', box); bb.style.minHeight = bb.offsetHeight + 'px';   // reserve the final height so nothing jumps while typing
      box.classList.add('is-in');
      later(function () {
        box.classList.add('is-typing');                  // "typing…" dots
        later(function () {
          box.classList.remove('is-typing'); box.classList.add('is-done');
          txt.classList.add('caret'); txt.textContent = '';
          var n = 0;
          (function tick() {
            n++; txt.textContent = MSG.slice(0, n);
            if (n < MSG.length) later(tick, 16 + Math.random() * 16);
            else txt.classList.remove('caret');
          })();
        }, 1100);
      }, 500);
    }
    box.classList.remove('is-done');
    if ('IntersectionObserver' in window) {
      var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { o.disconnect(); run(); } }, { threshold: 0.35 });
      o.observe(form);
    } else { finish(); }
    form.addEventListener('focusin', function () { if (started) finish(); else { started = true; finish(); } });
  })();

  /* ───────── 4. RIPPLE on small / round buttons ───────── */
  doc.addEventListener('click', function (e) {
    var host = e.target.closest && e.target.closest('.soc a, .tcp-btn, .ppc-btn, .install-card .btn, .ic-x');
    if (!host) return;
    var cs = getComputedStyle(host);
    if (cs.position === 'static') host.style.position = 'relative';
    var oldOverflow = host.style.overflow;
    host.style.overflow = 'hidden';
    var r = host.getBoundingClientRect(), d = Math.max(r.width, r.height);
    var dot = doc.createElement('span');
    dot.className = 'ripple-dot';
    dot.style.cssText = 'width:' + d + 'px;height:' + d + 'px;left:' + (e.clientX - r.left - d / 2) + 'px;top:' + (e.clientY - r.top - d / 2) + 'px';
    host.appendChild(dot);
    setTimeout(function () { dot.remove(); host.style.overflow = oldOverflow; }, 700);   // give the ping ring room again
  });

  /* touch: makes :active feedback instant on iOS too */
  doc.addEventListener('touchstart', function () {}, { passive: true });

  /* ───────── 5. soft parallax: hero sparkles only ───────── */
  if (fine) {
    var sparks = $$('.hero .spark');
    var hero = $('.hero');
    if (hero && sparks.length) {
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
      var step = function () {
        cx += (tx - cx) * 0.07; cy += (ty - cy) * 0.07;
        sparks.forEach(function (s, i) {
          var depth = 8 + (i % 4) * 7;
          s.style.translate = (cx * depth).toFixed(1) + 'px ' + (cy * depth).toFixed(1) + 'px';
        });
        raf = (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) ? requestAnimationFrame(step) : 0;
      };
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
        if (!raf) raf = requestAnimationFrame(step);
      }, { passive: true });
      hero.addEventListener('mouseleave', function () { tx = ty = 0; if (!raf) raf = requestAnimationFrame(step); });
    }
  }
})();