/* ═════════════════════════════════════════════════════════════
   LADLA SHEIKH — site.js  (index.html only)
   Splash cleanup · header & mobile menu · section navigation +
   scroll-spy · scroll reveal · tools filters & "show more" ·
   contact form · audio toggle · install prompt · service worker.
   favourites.js / auth-gate.js / firebase-auth.js are separate.
   ═════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ── 1. splash cleanup (animation itself is pure CSS) ── */
  var splash = $('#splash');
  function endSplash() {
    if (!splash) return;
    root.classList.remove('splash-on');
    if (splash.parentNode) splash.parentNode.removeChild(splash);
    splash = null;
  }
  if (splash) {
    if (root.classList.contains('splash-on')) {
      var skip = $('.sp-skip', splash);
      var t = setTimeout(endSplash, 4900);
      var cnt = $('#spCount', splash), rail = $('.sp-rail i', splash), raf = 0, t0 = performance.now() + 400, dur = 3300;
      function tickCount(now) {
        var p = Math.min(Math.max((now - t0) / dur, 0), 1);
        var e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        if (cnt) cnt.textContent = String(Math.round(e * 100)).padStart(2, '0');
        if (rail) { rail.style.animation = 'none'; rail.style.transform = 'scaleX(' + e + ')'; }
        if (p < 1) raf = requestAnimationFrame(tickCount);
      }
      raf = requestAnimationFrame(tickCount);
      if (skip) skip.addEventListener('click', function () {
        clearTimeout(t); cancelAnimationFrame(raf);
        splash.classList.add('is-skipping');
        var hero = $('.hero'); if (hero) hero.style.setProperty('--d', '.75s');
        setTimeout(endSplash, 700);
      });
      doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && splash && skip) skip.click(); });
    } else { endSplash(); }
  }

  /* ── 2. header state ── */
  var header = $('#siteHeader');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  /* ── 3. mobile menu (focus management, Esc, trap, scroll lock) ── */
  var menuBtn = $('#menuBtn'), menu = $('#mobileMenu'), lastFocus = null;
  function menuFocusables() { return [menuBtn].concat($$('a, button', menu)); }
  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { lastFocus = doc.activeElement; menu.removeAttribute('inert'); var first = $('a', menu); if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 50); }
    else { menu.setAttribute('inert', ''); if (lastFocus && lastFocus.focus) menuBtn.focus({ preventScroll: true }); }
  }
  if (menuBtn && menu) {
    menu.setAttribute('inert', '');
    menuBtn.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
    doc.addEventListener('keydown', function (e) {
      if (!root.classList.contains('menu-open')) return;
      if (e.key === 'Escape') { setMenu(false); return; }
      if (e.key === 'Tab') {
        var f = menuFocusables(), a = f[0], z = f[f.length - 1];
        if (e.shiftKey && doc.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && doc.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    });
    window.matchMedia('(min-width: 921px)').addEventListener('change', function (m) { if (m.matches && root.classList.contains('menu-open')) setMenu(false); });
  }

  /* ── 4. section navigation (anchors + scroll-spy) ── */
  var ids = ['home', 'about-me', 'my-tools', 'my-projects', 'my-courses', 'contact-me'];
  var sections = ids.map(function (id) { return doc.getElementById(id); }).filter(Boolean);
  var links = $$('.nav-btn[data-target]');

  function setActive(id) {
    links.forEach(function (a) {
      var on = a.getAttribute('data-target') === id;
      a.classList.toggle('is-active', on);
      if (on && a.closest('.navbar-nav, .mobile-menu')) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  function goTo(id, instant) {
    var el = doc.getElementById(id);
    if (!el) return false;
    el.scrollIntoView({ behavior: (reduce || instant) ? 'auto' : 'smooth', block: 'start' });
    return true;
  }
  links.forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('data-target');
      if (!doc.getElementById(id)) return;
      e.preventDefault();
      if (root.classList.contains('menu-open')) setMenu(false);
      goTo(id);
      if (history.replaceState) history.replaceState(null, '', id === 'home' ? location.pathname + location.search : '#' + id);
    });
  });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }
  setActive('home');
  var h = location.hash.slice(1);
  if (h && doc.getElementById(h)) window.addEventListener('load', function () { goTo(h, true); });

  /* ── 5. scroll reveal ── */
  var rv = $$('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add('in'); }); }

  /* ── 6. tools: category chips + "show more" (search & ♥ filter live in favourites.js) ── */
  var PAGE = 12;
  var grid = $('.tools-grid');
  var cards = grid ? $$('.tool-card-pro', grid) : [];
  var state = { f: 'all', all: false };
  var moreBtn = $('#toolsMore'), countEl = $('#toolsCount'), searchEl = $('#toolsSearchInput');

  function matchesFilter(c) {
    if (state.f === 'all') return true;
    if (state.f === 'soon') return c.getAttribute('data-status') === 'soon';
    return c.getAttribute('data-cat') === state.f;          // free | premium
  }
  function paginate() {
    if (!grid) return;
    var searching = (searchEl && searchEl.value.trim() !== '') || ($('#toolsFavFilterBtn') && $('#toolsFavFilterBtn').classList.contains('active'));
    var shown = 0, total = 0;
    cards.forEach(function (c) {
      c.removeAttribute('data-more');
      if (c.hasAttribute('data-off') || c.style.display === 'none') return;
      total++;
      if (!searching && !state.all && shown >= PAGE) c.setAttribute('data-more', '');
      else shown++;
    });
    if (moreBtn) {
      var rest = total - shown;
      moreBtn.parentNode.hidden = rest <= 0;
      moreBtn.querySelector('span').textContent = 'Show ' + rest + ' more';
    }
    if (countEl) countEl.textContent = 'Showing ' + shown + ' of ' + total;
  }
  function applyFilter() {
    cards.forEach(function (c) { if (matchesFilter(c)) c.removeAttribute('data-off'); else c.setAttribute('data-off', ''); });
    if (window.LadlaFavourites) window.LadlaFavourites.refresh('.tools-grid'); else paginate();
  }
  $$('.filter-row .chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      $$('.filter-row .chip').forEach(function (x) { x.setAttribute('aria-pressed', x === chip ? 'true' : 'false'); });
      state.f = chip.getAttribute('data-filter'); state.all = false;
      applyFilter();
    });
  });
  if (moreBtn) moreBtn.addEventListener('click', function () { state.all = true; paginate(); });
  doc.addEventListener('ladla:filtered', function (e) { if (e.detail === '.tools-grid') paginate(); });
  paginate();

  /* ── 7. contact form ── */
  var form = $('#contactForm');
  if (form) {
    var phone = $('#phone'), phoneErr = $('#phoneError'), iti = null;
    function load(tag, attrs) { var el = doc.createElement(tag); for (var k in attrs) el[k] = attrs[k]; (tag === 'link' ? doc.head : doc.body).appendChild(el); return el; }
    var itiStarted = false;
    function startIti() {
      if (itiStarted) return; itiStarted = true;
      load('link', { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/css/intlTelInput.css' });
      var s = load('script', { src: 'https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/intlTelInput.min.js', async: true });
      s.onload = function () {
        if (!window.intlTelInput) return;
        iti = window.intlTelInput(phone, { initialCountry: 'pk', separateDialCode: true, preferredCountries: ['pk', 'ae', 'sa', 'us'], utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js' });
      };
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { startIti(); o.disconnect(); } }, { rootMargin: '400px' }).observe(form);
    } else { startIti(); }
    phone.addEventListener('focus', startIti);

    function phoneOk() {
      if (iti && iti.isValidNumber) return iti.isValidNumber();
      return /^[0-9 ()+\-]{7,18}$/.test(phone.value.trim());      // fallback if the library failed to load
    }
    function fieldError(input, msg) {
      var f = input.closest('.field'); if (!f) return;
      var e = $('.field-error', f); if (e) e.textContent = msg || '';
      f.classList.toggle('invalid', !!msg); input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    }
    var status = $('#formStatus'), submit = $('#contactSubmit');
    function say(msg, kind) { status.textContent = msg; status.className = 'form-status ' + (kind || ''); }

    $$('input[required], textarea[required]', form).forEach(function (inp) {
      inp.addEventListener('blur', function () { if (inp !== phone) check(inp); });
      inp.addEventListener('input', function () { if (inp.closest('.field').classList.contains('invalid')) { inp === phone ? null : check(inp); } });
    });
    phone.addEventListener('input', function () { if (phoneOk()) { phoneErr.style.display = 'none'; phone.classList.remove('error'); phone.removeAttribute('aria-invalid'); } });
    function check(inp) {
      if (inp.validity.valueMissing) { fieldError(inp, 'This field is required.'); return false; }
      if (inp.type === 'email' && inp.validity.typeMismatch) { fieldError(inp, 'Enter a valid email address, like name@example.com.'); return false; }
      fieldError(inp, ''); return true;
    }

    form.addEventListener('submit', function (e) {
      var ok = true, firstBad = null;
      $$('input[required], textarea[required]', form).forEach(function (inp) {
        if (inp === phone) return;
        if (!check(inp)) { ok = false; firstBad = firstBad || inp; }
      });
      if (!phoneOk()) { ok = false; phoneErr.style.display = 'block'; phone.classList.add('error'); phone.setAttribute('aria-invalid', 'true'); firstBad = firstBad || phone; }
      if (!ok) { e.preventDefault(); say('Please fix the highlighted fields.', 'err'); if (firstBad) firstBad.focus(); return; }

      var c = iti && iti.getSelectedCountryData ? iti.getSelectedCountryData() : null;
      $('#countryData').value = c ? c.name + ' (+' + c.dialCode + ')' : '';
      if (iti && iti.getNumber) { try { phone.value = iti.getNumber(); } catch (x) {} }

      // Send in the background to the SAME formsubmit.co endpoint the page already uses.
      if (!window.fetch) return;                       // old browser → normal form post
      e.preventDefault();
      submit.classList.add('is-loading'); submit.disabled = true; say('Sending…');
      var data = new FormData(form);
      fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok && String(res.j.success) !== 'false') {
            form.reset(); say('Message sent. I’ll reply by email as soon as I can.', 'ok');
          } else { say('The message could not be sent. Email ladlasheikh2402@gmail.com instead.', 'err'); }
        })
        .catch(function () { form.submit(); })        // network/CORS problem → fall back to the normal post
        .then(function () { submit.classList.remove('is-loading'); submit.disabled = false; });
    });
  }

  /* ── 8. background audio: autoplays (first tap if the browser blocks it) + pause/volume dock ── */
  var audio = $('#aw-audio'), awGroups = $$('.aw');
  if (audio && awGroups.length) {
    var vol = parseFloat(store('ls_vol')); if (isNaN(vol) || vol < 0 || vol > 1) vol = .6;
    audio.volume = vol;
    var broken = false;
    var paintAudio = function () {
      var on = !audio.paused && !broken;
      awGroups.forEach(function (g) {
        var btn = $('.aw-btn', g), rng = $('.aw-vol', g), ic = $('i', btn);
        btn.classList.toggle('playing', on); btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        btn.setAttribute('aria-label', broken ? 'Audio unavailable' : (on ? 'Pause background audio' : 'Play background audio'));
        btn.disabled = broken; if (broken) btn.title = 'Audio file not found';
        ic.className = !on ? 'bi bi-volume-mute-fill' : (vol === 0 ? 'bi bi-volume-off-fill' : (vol < .5 ? 'bi bi-volume-down-fill' : 'bi bi-volume-up-fill'));
        rng.value = Math.round(vol * 100); rng.setAttribute('aria-valuetext', Math.round(vol * 100) + ' percent');
      });
    };
    audio.addEventListener('error', function () { broken = true; paintAudio(); }, true);
    var srcEl = audio.querySelector('source'); if (srcEl) srcEl.addEventListener('error', function () { broken = true; paintAudio(); });
    audio.addEventListener('play', paintAudio); audio.addEventListener('pause', paintAudio);
    awGroups.forEach(function (g) {
      $('.aw-btn', g).addEventListener('click', function () {
        if (audio.paused) { audio.play().then(function () { store('ls_audio', '1'); try { sessionStorage.removeItem('ls_audio_off'); } catch (e) {} }).catch(function () { paintAudio(); }); }
        else { audio.pause(); store('ls_audio', '0'); try { sessionStorage.setItem('ls_audio_off', '1'); } catch (e) {} }   // paused by the visitor → stay quiet this session
      });
      $('.aw-vol', g).addEventListener('input', function (e) {
        vol = Math.max(0, Math.min(1, e.target.value / 100)); audio.volume = vol; store('ls_vol', String(vol)); paintAudio();
      });
    });
    paintAudio();

    /* autoplay: try right away; browsers usually block it, so the first real tap / key press starts it */
    var userOff = false; try { userOff = sessionStorage.getItem('ls_audio_off') === '1'; } catch (e) {}
    var armed = false, evs = ['click', 'touchend', 'keydown'];
    function firstGesture(e) {
      if (e && e.target && e.target.closest && e.target.closest('.aw-dock')) return;      // the dock button handles itself
      if (e && e.type === 'keydown' && e.key === 'Escape') return;
      if (!audio.paused || broken) return disarm();
      audio.play().catch(function () {});
    }
    function disarm() { if (!armed) return; armed = false; evs.forEach(function (n) { doc.removeEventListener(n, firstGesture, true); }); }
    function arm() { if (armed) return; armed = true; evs.forEach(function (n) { doc.addEventListener(n, firstGesture, true); }); }
    audio.addEventListener('play', disarm);
    if (!userOff) {
      var p = audio.play();
      if (p && p.catch) p.catch(function () { arm(); });
      else arm();
    }
  }

  /* ── 9. install prompt (only when the browser offers it; never nags) ── */
  var card = $('#installCard'), deferred = null;
  function dismissedRecently() { var t = +store('ls_install_dismissed') || 0; return Date.now() - t < 14 * 864e5; }
  function showInstall() { if (card && !dismissedRecently()) setTimeout(function () { card.classList.add('show'); }, 14000); }
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; showInstall(); });
  window.addEventListener('appinstalled', function () { if (card) card.classList.remove('show'); store('ls_install_dismissed', String(Date.now() * 2)); });
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.navigator.standalone && !(window.matchMedia && matchMedia('(display-mode: standalone)').matches);
  if (card && ios) {
    var tx = $('#installText'); if (tx) tx.textContent = 'Tap Share, then “Add to Home Screen”.';
    var yes = $('#installYes'); if (yes) yes.hidden = true;
    showInstall();
  }
  if (card) {
    $('#installYes').addEventListener('click', function () {
      if (!deferred) return; deferred.prompt();
      deferred.userChoice.then(function () { deferred = null; card.classList.remove('show'); });
    });
    $('#installNo').addEventListener('click', function () { card.classList.remove('show'); store('ls_install_dismissed', String(Date.now())); });
  }

  /* ── 9b. premium motion layer ── */
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;

  // (a) typed hero text — lightweight, no library; static when motion is reduced
  var typed = $('#typed');
  if (typed) {
    var words = (typed.getAttribute('data-words') || '').split('|').filter(Boolean);
    if (words.length && !reduce) {
      var wi = 0, ci = words[0].length, del = true, live = true;
      var heroEl = $('#home');
      if ('IntersectionObserver' in window && heroEl) new IntersectionObserver(function (es) { live = es[0].isIntersecting; }).observe(heroEl);
      var tick = function () {
        if (!live || doc.hidden) { setTimeout(tick, 400); return; }
        var w = words[wi], t = del ? 34 : 70;
        ci += del ? -1 : 1;
        typed.textContent = w.slice(0, ci);
        if (!del && ci === w.length) { del = true; t = 1700; }
        else if (del && ci <= 0) { del = false; wi = (wi + 1) % words.length; ci = 0; t = 320; }
        setTimeout(tick, t);
      };
      setTimeout(tick, root.classList.contains('splash-on') ? 6100 : 2600);
    }
  }

  // (b) scroll progress bar
  var bar = $('#progress'), ticking = false;
  function paintProgress() {
    var max = doc.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0).toFixed(4) + ')';
    ticking = false;
  }
  if (bar && !reduce) window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(paintProgress); } }, { passive: true });

  // (c) sliding nav pill
  var navUl = $('.navbar-nav'), prim = $('.primary'), pill = null;
  if (navUl && prim) {
    pill = doc.createElement('span'); pill.className = 'nav-pill'; pill.setAttribute('aria-hidden', 'true'); prim.insertBefore(pill, prim.firstChild);
    var movePill = function () {
      var a = $('.nav-btn.is-active', navUl);
      if (!a || !a.offsetWidth) { pill.classList.remove('on'); return; }
      pill.style.width = a.offsetWidth + 'px';
      pill.style.transform = 'translateX(' + (a.getBoundingClientRect().left - prim.getBoundingClientRect().left) + 'px)';
      pill.classList.add('on');
    };
    var mo = new MutationObserver(movePill);
    $$('.nav-btn', navUl).forEach(function (a) { mo.observe(a, { attributes: true, attributeFilter: ['class'] }); });
    window.addEventListener('resize', movePill);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(movePill);
    window.addEventListener('load', movePill); movePill();
  }

  // (d) split headings into masked words
  function splitWords(el) {
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = doc.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(doc.createTextNode(' ')); return; }
            var o = doc.createElement('span'); o.className = 'wd'; o.setAttribute('aria-hidden', 'true');
            var inn = doc.createElement('span'); inn.textContent = p; inn.style.setProperty('--i', i++);
            o.appendChild(inn); frag.appendChild(o);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(el);
  }
  var heads = $$('.sec-head h2, .contact-info h2, .about-copy h3');
  heads.forEach(function (h) { splitWords(h); h.classList.add('split'); });
  if ('IntersectionObserver' in window && !reduce) {
    var hio = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); hio.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: .2 });
    heads.forEach(function (h) { hio.observe(h); });
  } else { heads.forEach(function (h) { h.classList.add('in'); }); }

  // (d2) section numbers (01–04): their own slot + their own entrance, independent of the heading words
  var numHeads = $$('.sec-head');
  if ('IntersectionObserver' in window && !reduce) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('num-in'); nio.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -12% 0px', threshold: .12 });
    numHeads.forEach(function (n) { nio.observe(n); });
  } else { numHeads.forEach(function (n) { n.classList.add('num-in'); }); }

  // (e) staggered card reveal (class removed afterwards so hover transitions stay snappy)
  if ('IntersectionObserver' in window && !reduce) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var c = en.target; cio.unobserve(c); c.classList.add('in');
        setTimeout(function () { c.classList.remove('rv', 'in'); c.style.removeProperty('--rd'); }, 1100);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: .08 });
    $$('.tool-card-pro, .project-card-pro').forEach(function (c, i) {
      c.classList.add('rv'); c.style.setProperty('--rd', ((i % 4) * 70) + 'ms'); cio.observe(c);
    });
  }

  // (f) count-up numbers
  $$('[data-count]').forEach(function (el) {
    var end = parseInt(el.getAttribute('data-count'), 10);
    if (reduce || !('IntersectionObserver' in window) || isNaN(end)) return;
    el.textContent = '0';
    new IntersectionObserver(function (es, o) {
      if (!es[0].isIntersecting) return; o.disconnect();
      var t0 = performance.now(), dur = 1500;
      (function step(t) {
        var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * e);
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }, { threshold: .6 }).observe(el);
  });

  // (g) pointer effects (mouse devices only): card spotlight + hero parallax
  if (fine) {
    $$('.tools-grid, .projects-grid').forEach(function (g) {
      g.addEventListener('pointermove', function (e) {
        var c = e.target.closest && e.target.closest('.tool-card-pro, .project-card-pro');
        if (!c) return;
        var r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    });
  }

  /* ── 9c. more motion ── */
  // '#' links on cards stay '#', but never jump the page to the top
  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.tcp-btn[href="#"], .ppc-btn[href="#"]');
    if (a) e.preventDefault();
  });

  // magnetic buttons (mouse only)
  if (fine && !reduce) {
    $$('.btn-primary, .btn-line, .cta-contact').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty('--bx', ((e.clientX - r.left - r.width / 2) * .18).toFixed(1) + 'px');
        b.style.setProperty('--by', ((e.clientY - r.top - r.height / 2) * .28).toFixed(1) + 'px');
      }, { passive: true });
      b.addEventListener('pointerleave', function () { b.style.setProperty('--bx', '0px'); b.style.setProperty('--by', '0px'); });
    });
  }



  /* ── 9c. v2.2 extras ── */
  var ap = $('.about-photo');
  if (ap) {
    if ('IntersectionObserver' in window && !reduce) new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { ap.classList.add('in'); o.disconnect(); } }, { threshold: .15 }).observe(ap);
    else ap.classList.add('in');
  }

  // placeholder "#" links never jump the page to the top
  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.tcp-btn[href="#"], .ppc-btn[href="#"]');
    if (a) e.preventDefault();
  });

  // footer wordmark: words rise when it scrolls into view
  var fm = $('.footer-mark');
  if (fm && typeof splitWords === 'function') {
    splitWords(fm); fm.classList.add('split');
    if ('IntersectionObserver' in window && !reduce) {
      new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { fm.classList.add('in'); o.disconnect(); } }, { threshold: .3 }).observe(fm);
    } else { fm.classList.add('in'); }
  }

  // footer wordmark: scaled so it spans exactly from the "©" to the end of "Delete your data"
  function fitFooterMark() {
    var mark = $('.footer-mark'), bar = $('.footer-bottom');
    if (!mark || !bar) return;
    var target = bar.getBoundingClientRect().width;
    if (!target) return;
    mark.style.width = target + 'px';
    mark.style.fontSize = '100px';
    var range = doc.createRange(); range.selectNodeContents(mark);
    var w = range.getBoundingClientRect().width;
    if (w) mark.style.fontSize = (100 * target / w).toFixed(2) + 'px';
  }
  fitFooterMark();
  window.addEventListener('resize', fitFooterMark);
  window.addEventListener('load', fitFooterMark);
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(fitFooterMark);

  // tools: cards pop in when a filter / "show more" changes what is visible
  function popVisible(onlyNew) {
    if (reduce) return;
    var n = 0;
    cards.forEach(function (c) {
      if (c.hasAttribute('data-off') || c.hasAttribute('data-more') || c.style.display === 'none') return;
      if (onlyNew && !c.__wasHidden) return;
      c.style.setProperty('--pd', Math.min(n++, 12) * 45 + 'ms');
      c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop');
      c.addEventListener('animationend', function h() { c.classList.remove('pop'); c.removeEventListener('animationend', h); });
    });
  }
  $$('.filter-row .chip').forEach(function (chip) { chip.addEventListener('click', function () { setTimeout(function () { popVisible(false); }, 30); }); });
  if (moreBtn) moreBtn.addEventListener('click', function () { setTimeout(function () { popVisible(true); }, 30); }, true);
  if (moreBtn) moreBtn.addEventListener('mousedown', function () { cards.forEach(function (c) { c.__wasHidden = c.hasAttribute('data-more'); }); });
  if (moreBtn) moreBtn.addEventListener('keydown', function () { cards.forEach(function (c) { c.__wasHidden = c.hasAttribute('data-more'); }); });
  if (moreBtn) moreBtn.addEventListener('touchstart', function () { cards.forEach(function (c) { c.__wasHidden = c.hasAttribute('data-more'); }); }, { passive: true });

  // mouse devices: 3D card tilt + magnetic primary buttons
  if (fine && !reduce) {
    $$('.tool-card-pro, .project-card-pro').forEach(function (c) {
      c.classList.add('tilt');
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        c.style.setProperty('--ry', (px * 7).toFixed(2) + 'deg'); c.style.setProperty('--rx', (-py * 7).toFixed(2) + 'deg'); c.style.setProperty('--ty', '-4px');
      }, { passive: true });
      c.addEventListener('pointerleave', function () { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); c.style.setProperty('--ty', '0px'); });
    });
    $$('.btn-primary, .cta-contact').forEach(function (b) {
      b.classList.add('mag');
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .22).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * .3).toFixed(1) + 'px)';
      }, { passive: true });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  // hero marquee reacts to scrolling (faster while you scroll, reverses upward)
  var track = $('.marq-track');
  if (track && !reduce && track.animate) {
    var anim = track.getAnimations()[0], lastY = window.scrollY, rate = 1, target = 1;
    window.addEventListener('scroll', function () {
      var dy = window.scrollY - lastY; lastY = window.scrollY;
      target = Math.max(-4, Math.min(5, 1 + dy * .12)); 
    }, { passive: true });
    (function loop() {
      rate += (1 - rate) * .0 + (target - rate) * .08; target += (1 - target) * .06;
      if (anim) anim.updatePlaybackRate(Math.abs(rate) < .15 ? .15 * (rate < 0 ? -1 : 1) : rate);
      requestAnimationFrame(loop);
    })();
  }

  /* ── 10. service worker (same /sw.js as before) ── */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
  }
})();