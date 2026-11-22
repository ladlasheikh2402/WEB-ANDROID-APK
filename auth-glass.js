/* ══════════════════════════════════════════════════════════════
   AUTH GLASS — arrow buttons + premium animation ka JS hissa
   1. Arrow button  = "agla field" (aakhri par form submit)
   2. Mouse parallax: photo aur glass cards mouse ke saath halke hilte hain
   3. Card par mouse ke peeche chalti roshni (spotlight)
   4. Buttons par click ripple
   (Asli login/signup logic auth.js mein hai — yeh file usay nahi chhoti.)
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  /* mountable: router.js calls this every time #/login or #/signup is shown (root = #view-auth) */
  window.AuthPages = window.AuthPages || { mounts: [] };
  window.AuthPages.mounts.push(function (root, ctx) {

  /* ── 1. arrow = next field ── */
  root.querySelectorAll('.fld-next').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var form = btn.closest('form');
      var current = btn.closest('.fld').querySelector('input');
      if (!form || !current) return;

      // sirf nazar aane wale fields (username/email toggle mein ek chhupa hota hai)
      var inputs = Array.prototype.filter.call(
        form.querySelectorAll('.fld input'),
        function (el) { return el.offsetParent !== null; }
      );
      var next = inputs[inputs.indexOf(current) + 1];

      if (next) {
        next.focus();
      } else if (form.requestSubmit) {
        form.requestSubmit();
      } else {
        form.querySelector('[type="submit"]').click();
      }
    });
  });

  /* ── 1b. brand-wall: soft parallax inside the left panel (was an inline <script> in login/signup.html) ── */
  (function () {
    var a = root.querySelector('.ap-aside'), w = root.querySelector('.ap-wall');
    if (!a || !w || !matchMedia('(hover:hover)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    a.addEventListener('pointermove', function (e) {
      var r = a.getBoundingClientRect();
      w.style.setProperty('--tx', (((e.clientX - r.left) / r.width - 0.5) * -26).toFixed(1) + 'px');
      w.style.setProperty('--ty', (((e.clientY - r.top) / r.height - 0.5) * -18).toFixed(1) + 'px');
    });
    a.addEventListener('pointerleave', function () { w.style.setProperty('--tx', '0px'); w.style.setProperty('--ty', '0px'); });
  })();

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;   // animation nahi chahiye to yahin ruk jao

  var body = root;   // the ag-played class now lives on #view-auth (was <body>)

  /* intro khatam hone ke baad intro-animations band (taake email/username
     toggle karne par field dobara na "aaye") */
  var playedTimer = setTimeout(function () { body.classList.add('ag-played'); }, 4800);
  ctx.onUnmount(function () { clearTimeout(playedTimer); });
  var toggle = root.querySelector('#loginToggleMode');
  if (toggle) toggle.addEventListener('click', function () {
    clearTimeout(playedTimer);
    body.classList.add('ag-played');
  });

  /* ── 2. parallax (sirf mouse wale desktop par) ── */
  var scene = root.querySelector('.ag-scene');
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (scene && fine) {
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    var tick = function () {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      scene.style.setProperty('--nx', cx.toFixed(3));
      scene.style.setProperty('--ny', cy.toFixed(3));
      if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };
    var onMove = function (e) {
      if (window.innerWidth <= 900) return;
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    ctx.onUnmount(function () { window.removeEventListener('mousemove', onMove); if (raf) cancelAnimationFrame(raf); });
  }

  /* ── 3. card spotlight ── */
  var card = root.querySelector('.auth-card, .auth-card-login');
  if (card && fine) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--sx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--sy', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* ── 4. ripple ── */
  root.addEventListener('click', function (e) {
    var host = e.target.closest && e.target.closest('.fld-next, .auth-submit, .social-btn');
    if (!host) return;
    var r = host.getBoundingClientRect();
    var size = Math.max(r.width, r.height);
    var dot = document.createElement('span');
    dot.className = 'ag-ripple';
    dot.style.width = dot.style.height = size + 'px';
    dot.style.left = (e.clientX - r.left - size / 2) + 'px';
    dot.style.top = (e.clientY - r.top - size / 2) + 'px';
    host.appendChild(dot);
    dot.addEventListener('animationend', function () { dot.remove(); });
  });
  });
})();
