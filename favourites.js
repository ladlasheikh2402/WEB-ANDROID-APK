/* ══════════════════════════════════════════════════════════════
   FAVOURITES / BOOKMARKS — index.html only
   Adds a heart/bookmark button to every card in #my-tools AND
   #my-projects (Methods), lets a signed-in visitor save items to
   their favourites (stored in Firebase — see toggleFavourite() etc.
   in firebase-auth.js), and adds a "My Favourites" toggle next to
   each section's search bar to filter down to just the saved ones.

   Whether a click should be treated as signed-in reuses auth-gate.js's
   own whenAuthKnown()/isLoggedIn() (window.LadlaAuthGate) — the same
   race-safe check the account button uses — instead of reading
   Firebase's raw current-user state directly, which right after a
   page load can still say "signed out" for a second even when the
   visitor really is signed in (and would otherwise send an already
   signed-in visitor to login.html by mistake).

   A genuinely signed-out visitor tapping a heart is sent to
   login.html, remembering which section to land back on afterward.
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // One config per section this feature runs on.
  var SECTIONS = [
    {
      idPrefix: 'tool-',
      gridSelector: '.tools-grid',
      cardSelector: '.tool-card-pro',
      titleSelector: 'h3',
      iconAnchorSelector: '.tcp-icon-frame',
      anchorCorner: 'icon',          // heart sits on the round icon's corner
      searchInputId: 'toolsSearchInput',
      emptyId: 'toolsSearchEmpty',
      termId: 'toolsSearchTerm',
      filterBtnId: 'toolsFavFilterBtn',
      sectionTarget: 'my-tools',
      noFavText: 'favourites'
    },
    {
      idPrefix: 'method-',
      gridSelector: '.projects-grid',
      cardSelector: '.project-card-pro',
      titleSelector: 'h3',
      iconAnchorSelector: '.ppc-image',
      anchorCorner: 'image',         // heart sits top-right of the screenshot
      searchInputId: 'methodsSearchInput',
      emptyId: 'methodsSearchEmpty',
      termId: 'methodsSearchTerm',
      filterBtnId: 'methodsFavFilterBtn',
      sectionTarget: 'my-projects',
      noFavText: 'favourites'
    }
  ];

  function slugify(text) {
    return String(text || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'item';
  }

  function isSignedIn() {
    return window.LadlaAuthGate ? window.LadlaAuthGate.isLoggedIn()
      : !!(window.LadlaAuth && window.LadlaAuth.getCurrentUser());
  }

  // Runs cb() once we're sure whether the visitor is really signed in —
  // waiting briefly for Firebase's first real answer if it hasn't arrived
  // yet, rather than guessing. Falls back to an immediate check if
  // auth-gate.js somehow isn't on the page.
  function whenSignInKnown(cb) {
    if (window.LadlaAuthGate) { window.LadlaAuthGate.whenAuthKnown(cb); }
    else { cb(); }
  }

  function initSection(cfg) {
    var grid = document.querySelector(cfg.gridSelector);
    if (!grid) return;

    var cards = Array.prototype.slice.call(grid.querySelectorAll(cfg.cardSelector));
    if (!cards.length) return;

    cards.forEach(function (card) {
      var titleEl = card.querySelector(cfg.titleSelector);
      var toolId = cfg.idPrefix + (card.getAttribute('data-fav-slug') || card.id || slugify(titleEl ? titleEl.textContent : ''));
      card.setAttribute('data-fav-id', toolId);

      var anchor = card.querySelector(cfg.iconAnchorSelector);
      if (!anchor || anchor.querySelector('.tcp-fav-btn')) return;
      anchor.style.position = 'relative';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tcp-fav-btn tcp-fav-btn-' + cfg.anchorCorner;
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label', 'Save to favourites');
      btn.innerHTML = '<i class="bi bi-heart"></i>';
      anchor.appendChild(btn);

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        handleFavClick(cfg, card, btn, toolId);
      });
    });

    setupFavouritesFilter(cfg, cards);
    watchAuthAndSync(cfg, cards);
  }

  function setCardFavState(card, isFav) {
    var btn = card.querySelector('.tcp-fav-btn');
    card.classList.toggle('is-fav', isFav);
    if (!btn) return;
    btn.classList.toggle('active', isFav);
    btn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
    btn.setAttribute('aria-label', isFav ? 'Remove from favourites' : 'Save to favourites');
    btn.innerHTML = '<i class="bi ' + (isFav ? 'bi-heart-fill' : 'bi-heart') + '"></i>';
  }

  // one-shot pop animation when the visitor saves / un-saves an item
  function playHeartBurst(btn, isFav) {
    btn.classList.remove('burst', 'burst-off');
    void btn.offsetWidth; // restart the animation
    btn.classList.add(isFav ? 'burst' : 'burst-off');
    setTimeout(function () { btn.classList.remove('burst', 'burst-off'); }, 800);
  }

  function goToSignIn(cfg) {
    window.location.hash = '#/login?next=' + encodeURIComponent(cfg.sectionTarget);
  }

  function handleFavClick(cfg, card, btn, toolId) {
    btn.disabled = true;
    whenSignInKnown(function () {
      if (!isSignedIn()) {
        btn.disabled = false;
        goToSignIn(cfg);
        return;
      }
      window.LadlaAuth.toggleFavourite(toolId).then(function (isFav) {
        setCardFavState(card, isFav);
        playHeartBurst(btn, isFav);
        recomputeVisibility(cfg);
      }).catch(function () {
        // sign-out happened between the click and the toggle (rare) —
        // treat it the same as a signed-out click.
        goToSignIn(cfg);
      }).finally(function () {
        btn.disabled = false;
      });
    });
  }

  // Keeps every heart in sync with the signed-in user's saved favourites,
  // live — including a favourite toggled from another open tab — and
  // re-subscribes whenever sign-in state itself changes.
  function watchAuthAndSync(cfg, cards) {
    var unsubscribeFaves = null;

    function resubscribe() {
      if (unsubscribeFaves) unsubscribeFaves();
      unsubscribeFaves = window.LadlaAuth.onFavouritesChange(function (faves) {
        cards.forEach(function (card) {
          setCardFavState(card, !!faves[card.getAttribute('data-fav-id')]);
        });
        recomputeVisibility(cfg);
      });
    }

    function whenReady() {
      if (!window.LadlaAuth) {
        window.addEventListener('ladla-auth-ready', whenReady, { once: true });
        return;
      }
      resubscribe();
      window.LadlaAuth.onAuthChange(function () { resubscribe(); });
    }
    whenReady();
  }

  var showFavOnlyBySection = {};

  function setupFavouritesFilter(cfg, cards) {
    var searchWrap = document.getElementById(cfg.searchInputId);
    searchWrap = searchWrap ? searchWrap.closest('.section-search-wrap') : null;
    if (!searchWrap || document.getElementById(cfg.filterBtnId)) return;

    var chip = document.createElement('button');
    chip.type = 'button';
    chip.id = cfg.filterBtnId;
    chip.className = 'tools-fav-filter';
    chip.innerHTML = '<i class="bi bi-heart"></i><span>My Favourites</span>';
    searchWrap.appendChild(chip);

    chip.addEventListener('click', function () {
      whenSignInKnown(function () {
        if (!isSignedIn()) { goToSignIn(cfg); return; }
        showFavOnlyBySection[cfg.idPrefix] = !showFavOnlyBySection[cfg.idPrefix];
        chip.classList.toggle('active', showFavOnlyBySection[cfg.idPrefix]);
        recomputeVisibility(cfg);
      });
    });

    var searchInput = document.getElementById(cfg.searchInputId);
    if (searchInput) searchInput.addEventListener('input', function () { recomputeVisibility(cfg); });
  }

  // Combines a section's own search box and its favourites toggle into one
  // recompute, so the two filters layer instead of fighting each other.
  // Self-contained rather than trusting script.js's separate search
  // listener to have already run first.
  function recomputeVisibility(cfg) {
    var grid = document.querySelector(cfg.gridSelector);
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll(cfg.cardSelector));
    var searchInput = document.getElementById(cfg.searchInputId);
    var emptyMsg = document.getElementById(cfg.emptyId);
    var termEl = document.getElementById(cfg.termId);
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var showFavOnly = !!showFavOnlyBySection[cfg.idPrefix];
    var visibleCount = 0;

    cards.forEach(function (card) {
      var matchesSearch = query === '' || card.textContent.toLowerCase().indexOf(query) !== -1;
      var matchesFav = !showFavOnly || card.classList.contains('is-fav');
      var visible = matchesSearch && matchesFav;
      if (card.hasAttribute('data-off')) { card.style.display = visible ? '' : 'none'; return; }   // hidden by a category chip
      card.style.display = visible ? '' : 'none';
      if (visible) visibleCount++;
    });

    document.dispatchEvent(new CustomEvent('ladla:filtered', { detail: cfg.gridSelector }));
    if (!emptyMsg) return;
    if (visibleCount === 0 && (query !== '' || showFavOnly)) {
      if (termEl) termEl.textContent = query !== '' ? searchInput.value.trim() : cfg.noFavText;
      emptyMsg.classList.add('active');
    } else {
      emptyMsg.classList.remove('active');
    }
  }

  function init() {
    SECTIONS.forEach(initSection);
  }

  // lets site.js re-run the combined filter after a category chip changes
  window.LadlaFavourites = {
    refresh: function (gridSelector) {
      SECTIONS.forEach(function (cfg) { if (cfg.gridSelector === gridSelector) recomputeVisibility(cfg); });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();