/* ══════════════════════════════════════════════════════════════════════
   LADLA SHEIKH — animations.js
   Poori site ki animations, ek ek cheez ke hisaab se (1-1 karke).
   Asli code (script.js, auth-gate.js ...) ko bilkul nahi chhoota — yeh
   sirf upar se animate karta hai. Agar yeh file hata do, site pehle jaisi.

   Kaise kaam karta hai
   • Web Animations API: element.animate() — sirf translate / scale /
     rotate / opacity / clip-path. `transform` ko haath nahi lagate, is
     liye aapke CSS transforms se takrao nahi hota.
   • Animation ke baad element apni asli state par wapas — koi "chhupi
     hui" state nahi, JS fail ho to bhi site poori nazar aati hai.
   • Splash screen jaate hi shuru hota hai.
   • Sections jab nav se khulte hain to dobara chalte hain (jaise AOS mirror).
   • Device ke hisaab se: phone (≤600) halki aur tez, tablet (≤1024) darmiyani,
     desktop poori (parallax, cursor glow, spotlight, magnetic buttons).
     Touch par tap-feedback, mouse par hover effects.
   • "Reduce motion" on ho to kuch bhi nahi chalta.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!Element.prototype.animate || !('IntersectionObserver' in window)) return;

  var EASE   = 'cubic-bezier(.22,1,.36,1)';
  var SPRING = 'cubic-bezier(.34,1.56,.64,1)';
  var FINE   = matchMedia('(hover: hover) and (pointer: fine)').matches;

  function $(s, r)  { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* device ke hisaab se: doori, raftar, har item ke beech waqfa */
  function P() {
    var w = window.innerWidth;
    if (w <= 600)  return { d: 22, dur: 560, step: 55, cap: 7, tf: .85 };   // phone
    if (w <= 1024) return { d: 32, dur: 660, step: 65, cap: 8, tf: .95 };   // tablet
    return               { d: 46, dur: 800, step: 80, cap: 9, tf: 1 };      // desktop
  }

  function shown(el) {
    if (!el) return false;
    var cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    return el.offsetParent !== null || cs.position === 'fixed';
  }

  /* ── animation ki qisme ── (end frame hamesha element ki asli state) */
  var KINDS = {
    up:    function (p) { return { f: [{ opacity: 0, translate: '0 ' + p.d + 'px', scale: .97 }] }; },
    down:  function (p) { return { f: [{ opacity: 0, translate: '0 -' + p.d + 'px' }] }; },
    left:  function (p) { return { f: [{ opacity: 0, translate: (-p.d * 1.4) + 'px 0' }] }; },
    right: function (p) { return { f: [{ opacity: 0, translate: (p.d * 1.4) + 'px 0' }] }; },
    pop:   function ()  { return { f: [{ opacity: 0, scale: .3 }], ease: SPRING, m: .8 }; },
    zoom:  function ()  { return { f: [{ opacity: 0, scale: .86 }] }; },
    fade:  function ()  { return { f: [{ opacity: 0 }], m: 1.2 }; },
    draw:  function ()  { return { f: [{ opacity: 0, scale: '0 1' }] }; },
    card:  function (p) { return { f: [{ opacity: 0, translate: '0 ' + (p.d * 1.2) + 'px', scale: .9, rotate: '-2.5deg' }] }; },
    wipe:  function (p) { return { f: [{ opacity: 0, clipPath: 'inset(0 100% 0 0)', translate: (-p.d * .4) + 'px 0' },
                                       { opacity: 1, clipPath: 'inset(0 0% 0 0)', translate: '0 0' }], m: 1.1 }; },
    track: function ()  { return { f: [{ opacity: 0, scale: 1.06, letterSpacing: '.16em' }], m: 1.5 }; },
    rise:  function ()  { return { f: [{ opacity: 0, scale: .94, clipPath: 'inset(100% -90px -90px -90px)' },
                                       { opacity: 1, scale: 1,   clipPath: 'inset(-90px -90px -90px -90px)' }], m: 1.6 }; }
  };

  function go(el, kind, delay) {
    if (!el || !el.animate) return;
    var p = P(), k = KINDS[kind](p);
    // ek hi keyframe ho to browser usay "end" samajhta hai — isliye saaf "start" + khali "end"
    var frames = (k.f.length === 1) ? [k.f[0], {}] : k.f;
    try {
      return el.animate(frames, {
        duration: Math.round(p.dur * (k.m || 1)),
        delay: Math.max(0, Math.round(delay || 0)),
        easing: k.ease || EASE,
        fill: 'backwards'
      });
    } catch (e) { /* purana browser — chhor do */ }
    return null;
  }

  /* ── FLASH FIX ──
     Element animation se pehle `.ls-pre` (opacity 0) mein chhupa rehta hai.
     launch() usay usi pal khol kar animate karta hai — "pehle dikha phir
     animate" wala jhatka khatam. `.ls-go` entry ke dauran CSS transitions
     band rakhta hai taake woh WAAPI animation se na takrayen. */
  function launch(el, kind, delay) {
    if (!el) return;
    el.classList.add('ls-go');
    el.classList.remove('ls-pre');
    var a = go(el, kind, delay);
    function done() { el.classList.remove('ls-go'); }
    if (a && a.finished) a.finished.then(done, done); else setTimeout(done, 2500);
  }
  function hidePre(list) { list.forEach(function (el) { el.classList.add('ls-pre'); }); }
  function clearPre(list) { list.forEach(function (el) { el.classList.remove('ls-pre'); }); }

  var HERO_SEL = '.nh-grid, .nh-orb, .nh-corner, .nh-welcome, .nh-welcome span, .nh-bigname, .nh-photo-glow, ' +
                 '.nh-photo, .nh-typing, .nh-skill, .nh-desc-desktop, .nh-desc-mobile, .nh-icon-btn, ' +
                 '.nh-contact-btn, .nh-strip';
  var CHROME_SEL = '.navbar, .navbar-brand, .navbar .dropdown > a, .navbar-nav .menu-item, .mobile-bottom-nav .mbn-item';

  /* number ginti (0 → 100+) */
  function countUp(el, delay) {
    var raw = el.getAttribute('data-ls-text') || el.textContent;
    el.setAttribute('data-ls-text', raw);
    var m = raw.trim().match(/^(\d+)([\s\S]*)$/);
    if (!m) return;
    var target = +m[1], rest = m[2], dur = 1300;
    el.textContent = '0' + rest;
    setTimeout(function () {
      var t0 = null;
      (function tick(ts) {
        if (t0 === null) t0 = ts;
        var k = Math.min((ts - t0) / dur, 1), e = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(target * e) + rest;
        if (k < 1) requestAnimationFrame(tick); else el.textContent = raw;
      })(performance.now());
    }, delay);
  }

  /* ══════════════════════════════════════════════════════════════
     1. HERO — ek ek cheez, ek tarteeb se
     ══════════════════════════════════════════════════════════════ */
  function hero() {
    var home = $('#home');
    if (!home || !shown(home)) return;
    var p = P(), s = p.step * p.tf, T = function (n) { return n * p.tf; };
    function each(sel, kind, t0, gap) {
      $$(sel, home).filter(shown).forEach(function (el, i) { launch(el, kind, t0 + i * gap); });
    }
    each('.nh-grid', 'fade', T(0), 0);
    each('.nh-orb', 'fade', T(0), 120);
    each('.nh-corner', 'zoom', T(120), 140);
    each('.nh-welcome', 'down', T(160), 0);
    each('.nh-welcome span', 'draw', T(520), 0);
    each('.nh-bigname', 'track', T(380), 0);
    each('.nh-photo-glow', 'fade', T(650), 0);
    each('.nh-photo', 'rise', T(700), 0);
    each('.nh-typing', 'left', T(950), 0);
    each('.nh-skill', 'left', T(1050), s * 1.5);
    each('.nh-desc-desktop, .nh-desc-mobile', 'up', T(1200), 0);
    each('.nh-icon-btn', 'pop', T(1380), s * 1.4);
    each('.nh-contact-btn', 'zoom', T(1650), 0);
    each('.nh-strip', 'draw', T(1750), 0);
    clearPre($$(HERO_SEL, home));   // jo dikhte hi nahi (mobile/desktop alag) unhe bhi khol do
  }

  /* ══════════════════════════════════════════════════════════════
     2. NAVBAR + MOBILE BOTTOM NAV (splash ke baad)
     ══════════════════════════════════════════════════════════════ */
  function chrome() {
    var p = P(), s = p.step;
    var nav = $('.navbar');
    if (nav && shown(nav)) {
      launch(nav, 'down', 0);
      $$('.navbar-brand, .navbar .dropdown > a', nav).filter(shown).forEach(function (el, i) { launch(el, 'pop', 200 + i * s); });
      $$('.navbar-nav .menu-item', nav).filter(shown).forEach(function (el, i) { launch(el, 'down', 260 + i * s * 1.3); });
    }
    $$('.mobile-bottom-nav .mbn-item').filter(shown).forEach(function (el, i) { launch(el, 'pop', 300 + i * s * 1.3); });
    clearPre($$(CHROME_SEL));
  }

  /* ══════════════════════════════════════════════════════════════
     3. SECTIONS — scroll par ek ek cheez (IntersectionObserver)
        [selector, kind, ek-saath-ke-extra]
     ══════════════════════════════════════════════════════════════ */
  var isLegal = !!$('.legal-shell') && !$('#home');

  var RULES = isLegal ? [
    ['.auth-topbar',               'down'],
    ['.legal-shell > h1',          'wipe'],
    ['.legal-updated',             'up'],
    ['.legal-shell > p',           'up'],
    ['.legal-toc',                 'zoom'],
    ['.legal-shell > h2',          'left'],
    ['.legal-shell > h3',          'left'],
    ['.legal-shell > ul > li, .legal-shell > ol > li', 'up']
  ] : [
    ['.heading',                   'wipe'],
    ['.section-subtitle',          'up'],
    ['.section-search',            'zoom'],
    /* about */
    ['.about-badge',               'pop'],
    ['.about-role',                'left'],
    ['.about-name',                'wipe'],
    ['.about-text',                'up'],
    ['.about-stat-box',            'pop', 'count'],
    ['.about-info-list li',        'left'],
    ['.about-btn-primary',         'zoom'],
    ['.about-socials a',           'pop'],
    /* tools + methods */
    ['.tool-card-pro',             'card', 'icon'],
    ['.project-card-pro',          'side', 'icon'],
    /* contact */
    ['.contact-info-card',         'pop'],
    ['.contactX-left',             'left'],
    ['.contactX-right > h2, .contactX-subtext', 'up'],
    ['.contactX-right form > *',   'up'],
    ['.contactX-btn',              'zoom'],
    ['.contactX-socials a',        'pop'],
    /* footer */
    ['.footer-col',                'up'],
    ['.footer-social a',           'pop'],
    ['.footer-bottom',             'fade']
  ];

  var ready = false;
  var targets = [];
  var io = new IntersectionObserver(onIO, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });

  function byPos(a, b) {
    var ra = a.target.getBoundingClientRect(), rb = b.target.getBoundingClientRect();
    return (Math.round(ra.top / 40) - Math.round(rb.top / 40)) || (ra.left - rb.left);
  }

  function onIO(entries) {
    if (!ready) return;
    var batch = [];
    entries.forEach(function (e) {
      var st = e.target._ls;
      if (!st) return;
      if (e.isIntersecting) { if (!st.done) batch.push(e); }
      // section/filter ki wajah se chhup gaya = agli dafa phir animate ho
      else if (e.target.offsetParent === null) { st.done = false; e.target.classList.add('ls-pre'); }
    });
    if (!batch.length) return;
    batch.sort(byPos);
    var p = P();
    batch.forEach(function (e, i) {
      e.target._ls.done = true;
      play(e.target, Math.min(i, p.cap) * p.step, i);
    });
  }

  function play(el, delay, i) {
    var st = el._ls, kind = st.kind, p = P();
    if (kind === 'side') {
      kind = (p.d <= 22) ? 'up' : ((siblingIndex(el) % 2) ? 'right' : 'left');
    }
    launch(el, kind, delay);

    if (st.extra === 'count') {
      var h = $('h3', el); if (h) countUp(h, delay + 250);
    }
    if (st.extra === 'icon') {
      $$('.tcp-icon-frame, .tcp-premium, .ppc-tag', el).forEach(function (c, n) { go(c, 'pop', delay + 260 + n * 70); });
    }
  }

  function siblingIndex(el) {
    var list = $$(':scope > .' + (el.className.split(/\s+/)[0]), el.parentNode).filter(shown);
    return Math.max(0, list.indexOf(el));
  }

  function register() {
    RULES.forEach(function (r) {
      $$(r[0]).forEach(function (el) {
        if (el._ls || el.hasAttribute('data-aos')) return;   // AOS wale ko double animate nahi karna
        el._ls = { kind: r[1], extra: r[2] || '', done: false };
        el.classList.add('ls-pre');
        targets.push(el);
        io.observe(el);
      });
    });
  }

  /* ══════════════════════════════════════════════════════════════
     4. SECTION BADALNA (nav click) — hero dobara, baqi IO se
     ══════════════════════════════════════════════════════════════ */
  function watchSections() {
    $$('.page-section').forEach(function (sec) {
      var was = shown(sec);
      new MutationObserver(function () {
        var now = shown(sec);
        if (now && !was) {
          // taaza dikhne wale section ke items pehle chhupao (isi microtask mein, paint se pehle), phir IO se ek ek khulein
          if (sec.id === 'home') { hidePre($$(HERO_SEL, sec)); requestAnimationFrame(hero); }
          targets.forEach(function (el) {
            if (sec.contains(el)) { el._ls.done = false; el.classList.add('ls-pre'); io.unobserve(el); io.observe(el); }
          });
          resetProgress();
          setTimeout(rescue, 1500);
        }
        was = now;
      }).observe(sec, { attributes: true, attributeFilter: ['style', 'class'] });
    });
  }

  /* ══════════════════════════════════════════════════════════════
     5. EXTRAS: progress bar · cursor glow · parallax · spotlight ·
        magnetic buttons · tap feedback · menu items
     ══════════════════════════════════════════════════════════════ */
  var bar;
  function setupProgress() {
    bar = document.createElement('div');
    bar.id = 'ls-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    var tick = false;
    function upd() {
      var h = document.documentElement, max = h.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ')';
      tick = false;
    }
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  }
  function resetProgress() { if (bar) bar.style.transform = 'scaleX(0)'; }

  function setupDesktopFx() {
    if (!FINE) return;

    /* cursor glow */
    var glow = document.createElement('div');
    glow.id = 'ls-cursor'; glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);
    var gx = 0, gy = 0, cx = 0, cy = 0, graf = 0;
    function gtick() {
      cx += (gx - cx) * .14; cy += (gy - cy) * .14;
      glow.style.translate = cx.toFixed(1) + 'px ' + cy.toFixed(1) + 'px';
      graf = (Math.abs(gx - cx) > .5 || Math.abs(gy - cy) > .5) ? requestAnimationFrame(gtick) : 0;
    }

    /* hero parallax */
    var home = $('#home'), tx = 0, ty = 0, px = 0, py = 0, praf = 0;
    function ptick() {
      px += (tx - px) * .07; py += (ty - py) * .07;
      home.style.setProperty('--hx', px.toFixed(3));
      home.style.setProperty('--hy', py.toFixed(3));
      praf = (Math.abs(tx - px) > .002 || Math.abs(ty - py) > .002) ? requestAnimationFrame(ptick) : 0;
    }

    var spotRaf = 0, lastEv = null;
    window.addEventListener('mousemove', function (e) {
      if (window.innerWidth <= 900) return;
      gx = e.clientX; gy = e.clientY; glow.classList.add('on');
      if (!graf) graf = requestAnimationFrame(gtick);
      if (home && shown(home)) {
        tx = (e.clientX / window.innerWidth - .5) * 2;
        ty = (e.clientY / window.innerHeight - .5) * 2;
        if (!praf) praf = requestAnimationFrame(ptick);
      }
      lastEv = e;
      if (!spotRaf) spotRaf = requestAnimationFrame(function () {
        spotRaf = 0;
        var c = lastEv.target.closest && lastEv.target.closest('.tool-card-pro, .project-card-pro, .contact-info-card, .about-stat-box');
        if (c) {
          var r = c.getBoundingClientRect();
          c.style.setProperty('--mx', (lastEv.clientX - r.left) + 'px');
          c.style.setProperty('--my', (lastEv.clientY - r.top) + 'px');
        }
      });
    }, { passive: true });
    document.addEventListener('mouseleave', function () { glow.classList.remove('on'); });

    /* magnetic buttons */
    var MAG = '.nh-contact-btn, .about-btn-primary, .contactX-btn, .nh-icon-btn, .ppc-btn';
    document.addEventListener('mousemove', function (e) {
      var b = e.target.closest && e.target.closest(MAG);
      if (!b) return;
      var r = b.getBoundingClientRect();
      b.style.translate = ((e.clientX - r.left - r.width / 2) * .22).toFixed(1) + 'px ' +
                          ((e.clientY - r.top - r.height / 2) * .32).toFixed(1) + 'px';
    }, { passive: true });
    document.addEventListener('mouseout', function (e) {
      var b = e.target.closest && e.target.closest(MAG);
      if (b && !b.contains(e.relatedTarget)) b.style.translate = '';
    });
  }

  /* touch / pen: dabane par dhans kar spring se wapas */
  function setupTap() {
    var TAP = '.tool-card-pro, .project-card-pro, .contact-info-card, .about-stat-box, .nh-icon-btn, ' +
              '.nh-contact-btn, .nh-skill, .about-btn-primary, .about-socials a, .ppc-btn, .contactX-btn, ' +
              '.mbn-item, .footer-social a, .contactX-socials a';
    var held = null;
    document.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      var el = e.target.closest && e.target.closest(TAP);
      if (!el) return;
      held = el;
      el._tap = el.animate([{ scale: 1 }, { scale: el.matches('.tool-card-pro, .project-card-pro') ? .975 : .93 }],
                           { duration: 110, easing: 'ease-out', fill: 'forwards' });
    }, { passive: true });
    function release() {
      if (!held) return;
      var el = held; held = null;
      var from = getComputedStyle(el).scale;
      if (el._tap) el._tap.cancel();
      el.animate([{ scale: from === 'none' ? '.95' : from }, { scale: 1 }], { duration: 480, easing: SPRING });
    }
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (n) { document.addEventListener(n, release, { passive: true }); });
    window.addEventListener('scroll', release, { passive: true });
  }

  /* mobile bottom nav: chuna hua icon uchhalta hai */
  function setupBottomNav() {
    document.addEventListener('click', function (e) {
      var it = e.target.closest && e.target.closest('.mbn-item');
      if (!it) return;
      var ic = $('.mbn-center-icon', it) || $('i', it);
      if (ic) ic.animate([{ scale: .6, translate: '0 6px' }, { scale: 1.3, translate: '0 -7px', offset: .55 }, { scale: 1, translate: '0 0' }],
                         { duration: 560, easing: EASE });
    });
  }

  /* offcanvas menu + dropdown kholne par items ek ek karke */
  function setupMenus() {
    var off = document.getElementById('offcanvasNavbar2');
    if (off) off.addEventListener('shown.bs.offcanvas', function () {
      $$('.nav-item', off).filter(shown).forEach(function (el, i) { go(el, 'right', i * 60); });
    });
    document.addEventListener('shown.bs.dropdown', function (e) {
      var menu = e.target.parentNode && $('.dropdown-menu', e.target.parentNode);
      if (menu) $$('.dropdown-item', menu).filter(shown).forEach(function (el, i) { go(el, 'right', i * 55); });
    });
  }

  /* ══════════════════════════════════════════════════════════════
     6. SHURUAT — splash jaane ke baad
     ══════════════════════════════════════════════════════════════ */
  function afterSplash(cb) {
    var sp = document.getElementById('splash');
    if (!sp || !document.body.contains(sp)) { cb(); return; }
    var fired = false;
    function fire() { if (!fired) { fired = true; cb(); } }
    new MutationObserver(function () {
      if (sp.classList.contains('vanish')) setTimeout(fire, 300);      // fade-out ke beech hi shuru
    }).observe(sp, { attributes: true, attributeFilter: ['class'] });
    new MutationObserver(function () { if (!document.body.contains(sp)) fire(); })
      .observe(document.body, { childList: true });
    setTimeout(fire, 9000);                                              // safety
  }

  /* safety net: koi element IO ki wajah se chhupa reh jaye to baad mein khol do */
  function rescue() {
    if (!ready) return;
    var vh = window.innerHeight;
    targets.forEach(function (el) {
      if (!el.classList.contains('ls-pre') || !shown(el)) return;
      var r = el.getBoundingClientRect();
      if (r.width && r.bottom > 0 && r.top < vh * 0.9) { el._ls.done = true; launch(el, 'fade', 0); }
    });
  }

  function start() {
    ready = true;
    if (isLegal) {
      targets.forEach(function (el) { io.unobserve(el); io.observe(el); });
      return;
    }
    chrome();
    hero();
    setTimeout(rescue, 3000);
    targets.forEach(function (el) { io.unobserve(el); io.observe(el); });   // abhi nazar aane wale ab chalein
  }

  function init() {
    setupProgress();
    register();
    if (!isLegal) { hidePre($$(HERO_SEL)); hidePre($$(CHROME_SEL)); }
    if (!isLegal) { watchSections(); setupDesktopFx(); setupTap(); setupBottomNav(); setupMenus(); }
    else setupTap();
    afterSplash(start);
  }

  function safeInit() {
    try {
      init();
      var rt;
      window.addEventListener('scroll', function () { clearTimeout(rt); rt = setTimeout(rescue, 700); }, { passive: true });
    } catch (err) {
      // kuch bhi bigde to saari cheezein wapas dikha do — site kabhi khali nahi rahegi
      $$('.ls-pre').forEach(function (el) { el.classList.remove('ls-pre'); });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', safeInit);
  else safeInit();
})();