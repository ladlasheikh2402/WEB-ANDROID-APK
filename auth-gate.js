/* ══════════════════════════════════════════════════════════════
   ACCOUNT BUTTON + PROFILE PANEL — index.html only
   Every section (Home, About, Tools, Methods, Contact) is public —
   nothing on the site requires an account to view. An account is
   only needed for account-specific actions, like saving a
   favourite (see favourites.js), which redirect to login.html on
   their own when needed.

   This file just owns the navbar's Sign In / Account button: shows
   "Sign In" when signed out, and a premium avatar chip with the
   visitor's name when signed in, opening a small profile dropdown
   (photo, name, email, a My Favourites shortcut, Sign Out).

   Wired to real Firebase Authentication via firebase-auth.js
   (window.LadlaAuth). "Am I logged in" is driven by Firebase's own
   onAuthStateChanged — the small localStorage flag below is only a
   same-tab cache so other code (like favourites.js) can check
   synchronously without awaiting a promise every time.

   window.LadlaAuthGate exposes isLoggedIn()/whenAuthKnown() so
   other scripts (favourites.js) can reuse the exact same
   sign-in check instead of racing Firebase's own async state.
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var LS_LOGGED_IN = 'ls_demo_logged_in';
  var cachedLoggedIn = localStorage.getItem(LS_LOGGED_IN) === '1';

  function isLoggedIn() { return cachedLoggedIn; }

  function setCachedState(loggedIn) {
    cachedLoggedIn = loggedIn;
    if (loggedIn) localStorage.setItem(LS_LOGGED_IN, '1');
    else localStorage.removeItem(LS_LOGGED_IN);
    refreshNavBtn();
  }

  /* Firebase needs a moment after a page load before it knows who is signed
     in. Until its FIRST answer arrives, "am I logged in?" is only a guess
     (the cache above). whenAuthKnown() lets code that must not guess — like
     deciding whether a favourite click should redirect to login — wait for
     the real answer (with a timeout, so a slow/blocked Firebase can't
     freeze the page). */
  var authResolved = false;
  var authWaiters = [];

  function whenAuthKnown(cb, timeoutMs) {
    if (authResolved) { cb(); return; }
    var done = false;
    function once() { if (done) return; done = true; cb(); }
    authWaiters.push(once);
    setTimeout(once, timeoutMs || 4000);
  }

  function hookFirebaseAuthState() {
    if (!window.LadlaAuth) {
      window.addEventListener('ladla-auth-ready', hookFirebaseAuthState, { once: true });
      return;
    }
    window.LadlaAuth.onAuthChange(function (user) {
      setCachedState(!!user);
      if (!authResolved) {
        authResolved = true;
        authWaiters.splice(0).forEach(function (fn) { fn(); });
      }
    });
  }
  hookFirebaseAuthState();

  // Let other scripts on this page (favourites.js) reuse this exact,
  // race-safe sign-in check instead of reading Firebase's raw (and,
  // right after page load, possibly not-yet-resolved) auth state directly.
  window.LadlaAuthGate = {
    isLoggedIn: isLoggedIn,
    whenAuthKnown: whenAuthKnown
  };

  function signOut() {
    if (window.LadlaAuth) window.LadlaAuth.signOutUser();
    setCachedState(false);
  }

  /* ── navbar Sign In / Account button ── */
  var navBtn = document.getElementById('navSigninBtn');
  var navItem = navBtn ? navBtn.closest('.nav-signin-item') : null;
  var profilePanel = null;

  function firstName(name) {
    return String(name || '').trim().split(/\s+/)[0] || 'Account';
  }

  function ensureProfilePanel() {
    if (profilePanel || !navItem) return;
    navItem.classList.add('nav-signin-item-relative');

    profilePanel = document.createElement('div');
    profilePanel.className = 'nav-profile-panel';
    profilePanel.innerHTML =
      '<div class="npp-header">' +
        '<img class="npp-avatar" alt="" style="display:none;">' +
        '<div class="npp-initial" style="display:none;"></div>' +
        '<div class="npp-info">' +
          '<div class="npp-name"></div>' +
          '<div class="npp-email"></div>' +
        '</div>' +
      '</div>' +
      '<div class="npp-fav-group">' +
        '<button type="button" class="npp-link npp-fav-toggle">' +
          '<i class="bi bi-heart-fill"></i> My Favourites' +
          '<i class="bi bi-chevron-down npp-fav-chevron"></i>' +
        '</button>' +
        '<div class="npp-fav-submenu">' +
          '<a href="#my-tools" class="npp-sub-link" data-fav-target="my-tools" data-fav-btn="toolsFavFilterBtn">' +
            '<i class="bi bi-tools"></i> Tools' +
          '</a>' +
          '<a href="#my-projects" class="npp-sub-link" data-fav-target="my-projects" data-fav-btn="methodsFavFilterBtn">' +
            '<i class="bi bi-code-slash"></i> Methods' +
          '</a>' +
        '</div>' +
      '</div>' +
      '<button type="button" class="npp-signout"><i class="bi bi-box-arrow-right"></i> Sign Out</button>';
    navItem.appendChild(profilePanel);

    // "My Favourites" expands/collapses its own Tools/Methods submenu —
    // doesn't close the whole profile panel by itself.
    var favGroup = profilePanel.querySelector('.npp-fav-group');
    profilePanel.querySelector('.npp-fav-toggle').addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      favGroup.classList.toggle('open');
    });

    // Each sub-link jumps to its section (reusing the site's own
    // section-nav, same as clicking Tools/Methods in the menu) and, if
    // it isn't already active, switches on that section's own
    // "My Favourites" filter chip so the saved items show immediately.
    Array.prototype.forEach.call(profilePanel.querySelectorAll('.npp-sub-link'), function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        closeProfilePanel();
        var sectionTarget = link.getAttribute('data-fav-target');
        var filterBtnId = link.getAttribute('data-fav-btn');
        var sectionLink = document.querySelector('.navbar-nav .nav-btn[data-target="' + sectionTarget + '"]');
        if (sectionLink) sectionLink.click();
        var favBtn = document.getElementById(filterBtnId);
        if (favBtn && !favBtn.classList.contains('active')) favBtn.click();
      });
    });

    profilePanel.querySelector('.npp-signout').addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      signOut();
      closeProfilePanel();
      var home = document.getElementById('home');
      if (home) home.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function updateProfilePanel() {
    if (!profilePanel || !window.LadlaAuth) return;
    var profile = window.LadlaAuth.getUserProfile();
    if (!profile) return;
    var avatar = profilePanel.querySelector('.npp-avatar');
    var initial = profilePanel.querySelector('.npp-initial');
    profilePanel.querySelector('.npp-name').textContent = profile.name || 'Signed in';
    profilePanel.querySelector('.npp-email').textContent = profile.email || '';
    if (profile.photoURL) {
      avatar.src = profile.photoURL;
      avatar.style.display = 'block';
      initial.style.display = 'none';
    } else {
      initial.textContent = (profile.name || profile.email || '?').trim().charAt(0).toUpperCase();
      initial.style.display = 'flex';
      avatar.style.display = 'none';
    }
  }

  function onOutsideClick(e) {
    if (!profilePanel) return;
    if (profilePanel.contains(e.target) || (navBtn && navBtn.contains(e.target))) return;
    closeProfilePanel();
  }

  function openProfilePanel() {
    ensureProfilePanel();
    updateProfilePanel();
    profilePanel.classList.add('open');
    document.addEventListener('click', onOutsideClick);
  }

  function closeProfilePanel() {
    if (!profilePanel) return;
    profilePanel.classList.remove('open');
    document.removeEventListener('click', onOutsideClick);
  }

  // Small avatar/initial chip rendered INSIDE the nav button itself once
  // signed in — this plus the .signin-nav-btn-premium class (glowing
  // gradient border + shimmer, see style.css) is what gives the button
  // its "premium account chip" look instead of a plain icon + label.
  function ensureNavAvatar() {
    if (!navBtn) return null;
    var avatarEl = navBtn.querySelector('.nav-btn-avatar');
    if (avatarEl) return avatarEl;
    avatarEl = document.createElement('span');
    avatarEl.className = 'nav-btn-avatar';
    avatarEl.innerHTML = '<img alt="" style="display:none;"><span class="nav-btn-avatar-initial"></span>';
    navBtn.insertBefore(avatarEl, navBtn.firstChild);
    return avatarEl;
  }

  function updateNavAvatar(profile) {
    var avatarEl = ensureNavAvatar();
    if (!avatarEl) return;
    var img = avatarEl.querySelector('img');
    var initialEl = avatarEl.querySelector('.nav-btn-avatar-initial');
    if (profile && profile.photoURL) {
      img.src = profile.photoURL;
      img.style.display = 'block';
      initialEl.style.display = 'none';
    } else {
      initialEl.textContent = (profile && (profile.name || profile.email) || '?').trim().charAt(0).toUpperCase();
      initialEl.style.display = 'flex';
      img.style.display = 'none';
    }
  }

  function refreshNavBtn() {
    if (!navBtn) return;
    var label = navBtn.querySelector('span:not(.nav-btn-avatar):not(.nav-btn-avatar-initial)');
    var icon = navBtn.querySelector('i');
    if (!label || !icon) return;
    if (isLoggedIn()) {
      var profile = window.LadlaAuth ? window.LadlaAuth.getUserProfile() : null;
      label.textContent = profile && profile.name ? firstName(profile.name) : 'Account';
      icon.className = 'bi bi-chevron-down signin-nav-arrow';
      navBtn.classList.add('signin-nav-btn-premium');
      updateNavAvatar(profile);
      updateProfilePanel();
    } else {
      label.textContent = 'Sign In';
      icon.className = 'bi bi-box-arrow-in-right signin-nav-arrow';
      navBtn.classList.remove('signin-nav-btn-premium');
      closeProfilePanel();
    }
  }
  refreshNavBtn();

  if (navBtn) {
    navBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (isLoggedIn()) {
        ensureProfilePanel();
        if (profilePanel.classList.contains('open')) closeProfilePanel();
        else openProfilePanel();
      } else {
        if (window.PG) window.PG.go('login'); else window.location.hash = '#/login';
      }
    });
  }

  /* ── land on the right section after coming back from login.html /
     signup.html (e.g. after signing in specifically to save a
     favourite): if the URL has a #section hash, trigger the site's
     own real nav link for it (same one the mobile bottom nav reuses)
     so its normal section-switch logic runs, then clean the hash out
     of the address bar. ── */
  document.addEventListener('DOMContentLoaded', function () {
    var hash = window.location.hash ? window.location.hash.slice(1) : '';
    if (!hash || hash === 'home' || hash.charAt(0) === '/') return;   // '#/login', '#/privacy-policy' … belong to router.js — leave them alone

    whenAuthKnown(function () {
      var realLink = document.querySelector('.navbar-nav .nav-btn[data-target="' + hash + '"]');
      if (realLink) {
        realLink.click();
      } else {
        var section = document.getElementById(hash);
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    });
  });

})();