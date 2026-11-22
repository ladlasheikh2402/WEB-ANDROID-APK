/* ══════════════════════════════════════════════════════════════
   LUXURY.JS — extra polish layer (does not touch site.js)
   1. Gold dust: slow, glowing brass particles floating up the hero
      (paused when off-screen / tab hidden; fewer on phones)
   2. Cursor ring: a soft brass ring that follows the mouse and
      swells over links, buttons and cards (mouse devices only)
   Both are skipped when "reduce motion" is on.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  /* install popup: the X closes it like "Maybe later" */
  var xBtn = document.getElementById('installX'), later = document.getElementById('installNo');
  if (xBtn && later) xBtn.addEventListener('click', function () { later.click(); });

  /* soft ripple on every button press */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.btn');
    if (!b || reduce) return;
    var r = b.getBoundingClientRect(), d = Math.max(r.width, r.height);
    var dot = document.createElement('span');
    dot.className = 'ripple-dot';
    dot.style.cssText = 'width:' + d + 'px;height:' + d + 'px;left:' + (e.clientX - r.left - d / 2) + 'px;top:' + (e.clientY - r.top - d / 2) + 'px';
    b.appendChild(dot);
    setTimeout(function () { dot.remove(); }, 700);
  });

  /* image loading shimmer: cards show a soft glow instead of a blank/broken box,
     and each image fades in when it arrives (helps on slow mobile networks) */
  document.querySelectorAll('.tool-card-pro img, .project-card-pro img, .about-photo img').forEach(function (img) {
    if (img.complete && img.naturalWidth > 0) return;
    var box = img.parentElement;
    img.classList.add('ls-pending'); box.classList.add('ls-skel');
    var done = function (ok) {
      img.classList.remove('ls-pending'); box.classList.remove('ls-skel');
      if (!ok) box.classList.add('ls-failed');
    };
    img.addEventListener('load', function () { done(true); }, { once: true });
    img.addEventListener('error', function () { done(false); }, { once: true });
  });

  /* back-to-top button with a scroll-progress ring */
  var top = document.createElement('button');
  top.id = 'gx-top'; top.type = 'button'; top.setAttribute('aria-label', 'Back to top');
  top.innerHTML = '<svg viewBox="0 0 44 44" aria-hidden="true"><circle class="bg" cx="22" cy="22" r="19"/><circle class="fg" cx="22" cy="22" r="19"/></svg><i class="bi bi-arrow-up"></i>';
  document.body.appendChild(top);
  var fg = top.querySelector('.fg'), C = 2 * Math.PI * 19, ticking = false;
  fg.style.strokeDasharray = C;
  var paintTop = function () {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    fg.style.strokeDashoffset = C * (1 - p);
    top.classList.toggle('show', window.scrollY > 700);
    ticking = false;
  };
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(paintTop); } }, { passive: true });
  top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  paintTop();

  if (reduce) return;

  /* ── 1. gold dust ── */
  var host = document.querySelector('.hero-bg');
  if (host) {
    var cv = document.createElement('canvas');
    cv.className = 'gx-dust';
    cv.setAttribute('aria-hidden', 'true');
    host.appendChild(cv);
    var ctx = cv.getContext('2d');
    var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.5), P = [], raf = 0, visible = true;

    var make = function (initial) {
      return {
        x: Math.random() * W, y: initial ? Math.random() * H : H + 12,
        r: 0.6 + Math.random() * 1.8, vy: 0.14 + Math.random() * 0.36,
        vx: (Math.random() - 0.5) * 0.16, ph: Math.random() * 6.28, sp: 0.012 + Math.random() * 0.02
      };
    };
    var resize = function () {
      var r = host.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(64, Math.max(16, W / 22)));
      P = []; for (var i = 0; i < n; i++) P.push(make(true));
    };
    var frame = function () {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        p.y -= p.vy; p.x += p.vx + Math.sin(p.ph) * 0.12; p.ph += p.sp;
        if (p.y < -12) P[i] = p = make(false);
        var a = 0.22 + 0.55 * (0.5 + 0.5 * Math.sin(p.ph * 2));
        ctx.fillStyle = 'rgba(255,79,163,' + (a * 0.16).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3.4, 0, 6.283); ctx.fill();
        ctx.fillStyle = 'rgba(200,190,255,' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    };
    var run = function () { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); };
    var stop = function () { if (raf) { cancelAnimationFrame(raf); raf = 0; } };

    resize();
    var t; window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(resize, 200); });
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : run(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; visible ? run() : stop(); }).observe(host);
    }
    run();
  }

  /* ── 2. cursor ring ── */
  if (fine) {
    var ring = document.createElement('div');
    ring.id = 'gx-ring'; ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ring);
    var tx = -100, ty = -100, x = -100, y = -100, rr = 0;
    var loop = function () {
      x += (tx - x) * 0.2; y += (ty - y) * 0.2;
      ring.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      rr = (Math.abs(tx - x) > 0.2 || Math.abs(ty - y) > 0.2) ? requestAnimationFrame(loop) : 0;
    };
    window.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY; ring.classList.add('gx-on');
      if (!rr) rr = requestAnimationFrame(loop);
    }, { passive: true });
    document.addEventListener('mouseleave', function () { ring.classList.remove('gx-on'); });
    document.addEventListener('mouseover', function (e) {
      var hot = e.target.closest && e.target.closest('a, button, [role="button"], .tool-card-pro, .project-card-pro, input, textarea, select, label');
      ring.classList.toggle('gx-hot', !!hot);
    });
    document.addEventListener('mousedown', function () { ring.classList.add('gx-down'); });
    document.addEventListener('mouseup', function () { ring.classList.remove('gx-down'); });
  }
})();