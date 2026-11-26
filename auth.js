/* ══════════════════════════════════════════════════════════════
   AUTH PAGES — shared JS (login.html + signup.html)

   Wired to real Firebase Authentication via firebase-auth.js
   (window.LadlaAuth). See the setup checklist at the top of
   firebase-auth.js — sign-in methods need to be turned on once
   in the Firebase console before this will work end to end.
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';
  /* mountable: router.js calls this every time #/login or #/signup is shown (root = #view-auth) */
  window.AuthPages = window.AuthPages || { mounts: [] };
  window.AuthPages.mounts.push(function (root, ctx) {
  function byId(id) { return root.querySelector('#' + id); }

  // phone sign-in keeps one global reCAPTCHA verifier: drop the stale one that points at the previous view
  function dropRecaptcha() {
    if (window.recaptchaVerifier) { try { window.recaptchaVerifier.clear(); } catch (e) {} window.recaptchaVerifier = null; }
  }
  dropRecaptcha();
  ctx.onUnmount(function () {
    dropRecaptcha();
    var o = byId('socialConfirmOverlay');   // "confirm account" popup lives on <body>
    if (o) o.classList.remove('open');
  });

  function authReady() {
    return !!window.LadlaAuth;
  }

  /* ── password show/hide toggle ── */
  root.querySelectorAll('.auth-toggle-visibility').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = byId(btn.dataset.target);
      if (!input) return;
      var showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';
      btn.innerHTML = showing
        ? '<i class="bi bi-eye"></i>'
        : '<i class="bi bi-eye-slash"></i>';
    });
  });

  /* ── clear a field's error state as soon as the user edits it ── */
  root.querySelectorAll('.auth-form input').forEach(function (input) {
    input.addEventListener('input', function () {
      input.classList.remove('error');
      var wrap = input.closest('.fld, .contactX-group');
      var next = wrap && wrap.nextElementSibling;
      if (next && next.classList.contains('auth-field-error')) {
        next.classList.remove('show');
      }
    });
  });

  /* ── generic field error helper ── */
  function setFieldError(inputEl, errorEl, message) {
    if (message) {
      inputEl.classList.add('error');
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('show');
      }
    } else {
      inputEl.classList.remove('error');
      if (errorEl) errorEl.classList.remove('show');
    }
  }

  function showToast(toastEl, type, message) {
    if (!toastEl) return;
    toastEl.className = 'auth-toast show ' + type;
    toastEl.innerHTML =
      '<i class="bi ' + (type === 'error' ? 'bi-exclamation-circle' : 'bi-check-circle') + '"></i>' +
      '<span>' + message + '</span>';
  }

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ── where to send the visitor once they're signed in.
     login.html / signup.html get opened as login.html?next=about-me
     (auth-gate.js sets that when it redirects a signed-out visitor
     away from a gated section), so bounce back to that same section
     on the homepage instead of just the homepage's top. ── */
  function postAuthRedirect() {
    // Tell the homepage's gate (auth-gate.js) straight away that this visitor is signed in,
    // so it doesn't bounce them back to the login view while Firebase is still loading.
    try { localStorage.setItem('ls_demo_logged_in', '1'); } catch (e) {}
    var next = ctx.params.get('next');
    return next ? '#' + next : '#home';
  }

  // keep ?next=… when the visitor hops between the "Sign Up" and "Sign in"
  // links, so they still land on the section they originally wanted
  (function keepNextOnSwitchLinks() {
    var next = ctx.params.get('next');
    if (!next) return;
    root.querySelectorAll('.auth-switch a').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href && href.indexOf('?') === -1) link.setAttribute('href', href + '?next=' + encodeURIComponent(next));
    });
  })();

  // Don't navigate the instant a sign-in/sign-up promise resolves — on some
  // mobile browsers the persisted session hasn't finished writing to
  // storage yet, so the *next* page's own auth check can read an
  // empty/not-yet-restored state and bounce straight back to the login
  // form. Wait for Firebase to actually confirm the signed-in user via
  // onAuthChange before leaving this page (with a short safety-net timeout
  // in case that callback is ever missed).
  function redirectAfterAuth() {
    var navigated = false;
    function goNow() {
      if (navigated) return;
      navigated = true;
      if (unsubscribe) unsubscribe();
      if (ctx.alive()) ctx.go(postAuthRedirect());
    }
    var unsubscribe = window.LadlaAuth.onAuthChange(function (user) {
      if (user) goNow();
    });
    setTimeout(goNow, 1200);
  }

  function passwordStrength(pw) {
    // simple, honest strength check — length + variety, nothing fancy
    var score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score; // 0–4
  }

  /* ── email / username toggle link (login form) ── */
  var loginToggleMode = byId('loginToggleMode');
  var loginEmailGroup = byId('loginEmailGroup');
  var loginUsernameGroup = byId('loginUsernameGroup');
  var usingUsername = false;

  if (loginToggleMode) {
    loginToggleMode.addEventListener('click', function () {
      usingUsername = !usingUsername;
      loginEmailGroup.style.display = usingUsername ? 'none' : 'block';
      loginUsernameGroup.style.display = usingUsername ? 'block' : 'none';
      loginToggleMode.textContent = usingUsername ? 'Continue with email' : 'Continue with username';
      setFieldError(byId('loginEmail'), byId('loginEmailError'), '');
      setFieldError(byId('loginUsername'), byId('loginEmailError'), '');
    });
  }

  /* ══════════════════════════════════════════════
     LOGIN FORM
     ══════════════════════════════════════════════ */
  var loginForm = byId('loginForm');
  if (loginForm) {
    var loginEmail = byId('loginEmail');
    var loginUsername = byId('loginUsername');
    var loginPassword = byId('loginPassword');
    var loginToast = byId('loginToast');
    var loginBtn = byId('loginSubmitBtn');

    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;

      if (usingUsername) {
        if (loginUsername.value.trim().length < 3) {
          setFieldError(loginUsername, byId('loginEmailError'), 'Enter your username.');
          valid = false;
        } else {
          setFieldError(loginUsername, byId('loginEmailError'), '');
        }
      } else {
        if (!EMAIL_RE.test(loginEmail.value.trim())) {
          setFieldError(loginEmail, byId('loginEmailError'), 'Enter a valid email address.');
          valid = false;
        } else {
          setFieldError(loginEmail, byId('loginEmailError'), '');
        }
      }

      if (loginPassword.value.length < 1) {
        setFieldError(loginPassword, byId('loginPasswordError'), 'Enter your password.');
        valid = false;
      } else {
        setFieldError(loginPassword, byId('loginPasswordError'), '');
      }

      if (!valid) return;

      if (!authReady()) {
        showToast(loginToast, 'error', 'Still loading — please try again in a second.');
        return;
      }

      loginBtn.classList.add('loading');
      loginBtn.disabled = true;

      var signInCall = usingUsername
        ? window.LadlaAuth.signInWithUsername(loginUsername.value.trim(), loginPassword.value)
        : window.LadlaAuth.signInWithEmail(loginEmail.value.trim(), loginPassword.value);

      signInCall.then(function () {
        showToast(loginToast, 'success', 'Welcome back — redirecting…');
        redirectAfterAuth();
      }).catch(function (err) {
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;
        showToast(loginToast, 'error', window.LadlaAuth.friendlyError(err.code));
      });
    });

    /* ── FORGOT PASSWORD ──
       Uses whatever is typed in the email (or username) box above, sends
       Firebase's reset email, then locks the link for 30s so it can't be
       spammed. The success message is the same whether or not an account
       exists, so this can't be used to find out who has an account. ── */
    var forgotLink = byId('forgotPasswordLink') || loginForm.querySelector('.auth-link');
    if (forgotLink) {
      var forgotBusy = false;
      var forgotLabel = forgotLink.textContent;

      var lockForgot = function (seconds) {
        forgotBusy = true;
        forgotLink.style.opacity = '.6';
        forgotLink.style.pointerEvents = 'none';
        var left = seconds;
        forgotLink.textContent = 'Resend in ' + left + 's';
        var timer = setInterval(function () {
          left--;
          if (left <= 0) {
            clearInterval(timer);
            unlockForgot();
          } else {
            forgotLink.textContent = 'Resend in ' + left + 's';
          }
        }, 1000);
      };
      var unlockForgot = function () {
        forgotBusy = false;
        forgotLink.style.opacity = '';
        forgotLink.style.pointerEvents = '';
        forgotLink.textContent = forgotLabel;
      };

      forgotLink.addEventListener('click', function (e) {
        e.preventDefault();
        if (forgotBusy) return;

        var field = usingUsername ? loginUsername : loginEmail;
        var errEl = byId('loginEmailError');
        var value = field.value.trim();

        if (!value || (!usingUsername && !EMAIL_RE.test(value))) {
          setFieldError(field, errEl, usingUsername
            ? 'Enter your username first, then tap \u201cForgot password?\u201d.'
            : 'Enter your email address first, then tap \u201cForgot password?\u201d.');
          field.focus();
          return;
        }
        setFieldError(field, errEl, '');

        if (!authReady()) {
          showToast(loginToast, 'error', 'Still loading — please try again in a second.');
          return;
        }

        forgotBusy = true;
        forgotLink.textContent = 'Sending…';
        forgotLink.style.pointerEvents = 'none';

        var onSent = function () {
          showToast(loginToast, 'success',
            'If an account matches, a password reset link is on its way. Check your inbox (and spam folder).');
          lockForgot(30);
        };

        window.LadlaAuth.resetPassword(value).then(onSent).catch(function (err) {
          if (err && err.code === 'auth/user-not-found') {
            onSent();                     // same message — don't reveal which accounts exist
          } else {
            unlockForgot();
            showToast(loginToast, 'error', window.LadlaAuth.friendlyError(err && err.code));
          }
        });
      });
    }
  }

  /* ══════════════════════════════════════════════
     SIGNUP FORM
     ══════════════════════════════════════════════ */
  var signupForm = byId('signupForm');
  if (signupForm) {
    var suName = byId('signupName');
    var suUsername = byId('signupUsername');
    var suEmail = byId('signupEmail');
    var suPassword = byId('signupPassword');
    var suConfirm = byId('signupConfirm');
    var suTerms = byId('signupTerms');
    var suToast = byId('signupToast');
    var suBtn = byId('signupSubmitBtn');
    var strengthBar = byId('pwStrengthBar');
    var strengthLabel = byId('pwStrengthLabel');

    if (suPassword && strengthBar) {
      var labels = ['Very weak', 'Weak', 'Okay', 'Good', 'Strong'];
      var colors = ['#e5484d', '#f08a24', '#e5b400', '#46a758', '#2f9e5d'];
      suPassword.addEventListener('input', function () {
        var score = passwordStrength(suPassword.value);
        var pct = suPassword.value.length ? (score / 4) * 100 : 0;
        strengthBar.style.width = pct + '%';
        strengthBar.style.background = colors[score];
        strengthLabel.textContent = suPassword.value.length ? labels[score] : '';
      });
    }

    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;

      if (suName.value.trim().length < 2) {
        setFieldError(suName, byId('signupNameError'), 'Enter your full name.');
        valid = false;
      } else {
        setFieldError(suName, byId('signupNameError'), '');
      }

      var USERNAME_RE = /^[a-zA-Z0-9_.]{3,20}$/;
      if (!USERNAME_RE.test(suUsername.value.trim())) {
        setFieldError(suUsername, byId('signupUsernameError'), '3-20 characters: letters, numbers, _ or . only.');
        valid = false;
      } else {
        setFieldError(suUsername, byId('signupUsernameError'), '');
      }

      if (!EMAIL_RE.test(suEmail.value.trim())) {
        setFieldError(suEmail, byId('signupEmailError'), 'Enter a valid email address.');
        valid = false;
      } else {
        setFieldError(suEmail, byId('signupEmailError'), '');
      }

      if (suPassword.value.length < 8) {
        setFieldError(suPassword, byId('signupPasswordError'), 'Use at least 8 characters.');
        valid = false;
      } else {
        setFieldError(suPassword, byId('signupPasswordError'), '');
      }

      if (suConfirm.value !== suPassword.value || suConfirm.value === '') {
        setFieldError(suConfirm, byId('signupConfirmError'), 'Passwords don\'t match.');
        valid = false;
      } else {
        setFieldError(suConfirm, byId('signupConfirmError'), '');
      }

      if (suTerms && !suTerms.checked) {
        showToast(suToast, 'error', 'Please agree to the Privacy Policy to continue.');
        valid = false;
      }

      if (!valid) return;

      if (!authReady()) {
        showToast(suToast, 'error', 'Still loading — please try again in a second.');
        return;
      }

      suBtn.classList.add('loading');
      suBtn.disabled = true;

      window.LadlaAuth.signUpWithEmail({
        name: suName.value.trim(),
        username: suUsername.value.trim(),
        email: suEmail.value.trim(),
        password: suPassword.value
      }).then(function () {
        showToast(suToast, 'success', 'Account created — redirecting…');
        redirectAfterAuth();
      }).catch(function (err) {
        suBtn.classList.remove('loading');
        suBtn.disabled = false;
        if (err.code === 'custom/username-taken') {
          setFieldError(suUsername, byId('signupUsernameError'), window.LadlaAuth.friendlyError(err.code));
        } else {
          showToast(suToast, 'error', window.LadlaAuth.friendlyError(err.code));
        }
      });
    });
  }

  /* ══════════════════════════════════════════════
     SOCIAL BUTTONS (Google / Facebook / GitHub / Apple)
     Google + Facebook + GitHub call real Firebase popups once
     those providers are turned on in the console (see
     firebase-auth.js). Apple needs an Apple Developer account +
     extra Firebase/Apple config, so it stays informational for now.
     ══════════════════════════════════════════════ */
  /* ══════════════════════════════════════════════
     SOCIAL SIGN-IN CONFIRMATION MODAL
     Shown after Google/Facebook/GitHub hands back a chosen account
     (via popup on desktop, or after returning from a redirect on
     mobile) and BEFORE we actually create/attach anything on our
     side. Picking an account is no longer the final step — tapping
     Cancel here leaves nothing behind.
     ══════════════════════════════════════════════ */
  function ensureSocialConfirmModal() {
    if (document.getElementById('socialConfirmOverlay')) return;

    var style = document.createElement('style');
    style.textContent =
      '#socialConfirmOverlay{position:fixed;inset:0;background:rgba(4,4,14,.86);' +
      'backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);display:none;' +
      'align-items:center;justify-content:center;z-index:9999;padding:18px;}' +
      '#socialConfirmOverlay.open{display:flex;}' +
      '@keyframes socialConfirmIn{from{opacity:0;transform:translateY(14px) scale(.96);}' +
      'to{opacity:1;transform:translateY(0) scale(1);}}' +
      '@keyframes socialConfirmShimmer{0%{background-position:-160% 0;}100%{background-position:260% 0;}}' +
      '#socialConfirmCard{position:relative;width:100%;max-width:392px;max-height:90vh;' +
      'display:flex;flex-direction:column;' +
      'background:linear-gradient(170deg,#171730 0%,#100f26 50%,#0a0918 100%);' +
      'border:1px solid rgba(217,164,65,.35);border-radius:6px;padding:6px;' +
      'text-align:center;font-family:inherit;color:#f2ede0;overflow:hidden;' +
      'box-shadow:0 30px 70px rgba(0,0,0,.6),0 0 0 1px rgba(0,0,0,.4),inset 0 0 0 1px rgba(255,255,255,.03);' +
      'animation:socialConfirmIn .32s cubic-bezier(.19,1,.22,1);}' +
      '#socialConfirmInnerFrame{position:relative;border:1px solid rgba(217,164,65,.22);' +
      'border-radius:3px;display:flex;flex-direction:column;overflow:hidden;flex:1;min-height:0;}' +
      '#socialConfirmCard::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;' +
      'background:linear-gradient(90deg,transparent,#e8c079 15%,#fff3d0 50%,#e8c079 85%,transparent);' +
      'z-index:2;}' +
      '#socialConfirmBrand{display:flex;align-items:center;justify-content:center;gap:10px;flex-shrink:0;' +
      'padding:24px 28px 6px;font-family:Georgia,\'Times New Roman\',serif;font-size:12.5px;' +
      'letter-spacing:3px;text-transform:uppercase;color:#e8c079;font-weight:400;}' +
      '#socialConfirmBrand .rule{flex:1;height:1px;' +
      'background:linear-gradient(90deg,transparent,rgba(232,192,121,.5));max-width:38px;}' +
      '#socialConfirmBrand .rule.right{background:linear-gradient(90deg,rgba(232,192,121,.5),transparent);}' +
      '#socialConfirmBrand i{color:#e8c079;font-size:13px;}' +
      '#socialConfirmBody{padding:10px 30px 28px;overflow-y:auto;' +
      'scrollbar-width:thin;scrollbar-color:#c9a04e rgba(255,255,255,.05);}' +
      '#socialConfirmBody::-webkit-scrollbar{width:7px;}' +
      '#socialConfirmBody::-webkit-scrollbar-track{background:rgba(255,255,255,.04);' +
      'border-radius:10px;}' +
      '#socialConfirmBody::-webkit-scrollbar-thumb{' +
      'background:linear-gradient(180deg,#f2d38c,#c9a04e);border-radius:10px;' +
      'border:1px solid rgba(0,0,0,.15);}' +
      '#socialConfirmBody::-webkit-scrollbar-thumb:hover{' +
      'background:linear-gradient(180deg,#fff3d0,#e8c079);}' +
      '#socialConfirmAvatarWrap{position:relative;width:92px;height:92px;margin:12px auto 20px;}' +
      '#socialConfirmAvatarWrap::before{content:"";position:absolute;inset:-6px;border-radius:50%;' +
      'border:1px solid rgba(217,164,65,.3);}' +
      '#socialConfirmPhoto{width:92px;height:92px;border-radius:50%;object-fit:cover;' +
      'display:block;border:2px solid #e8c079;' +
      'box-shadow:0 0 0 3px rgba(10,9,24,1),0 0 22px rgba(217,164,65,.25);}' +
      '#socialConfirmInitial{width:92px;height:92px;border-radius:50%;display:flex;' +
      'align-items:center;justify-content:center;font-family:Georgia,\'Times New Roman\',serif;' +
      'font-size:36px;font-weight:400;color:#e8c079;' +
      'background:linear-gradient(150deg,#232345,#14142c);border:2px solid #e8c079;' +
      'box-shadow:0 0 0 3px rgba(10,9,24,1),0 0 22px rgba(217,164,65,.25);}' +
      '#socialConfirmProviderBadge{position:absolute;bottom:-3px;right:-3px;width:30px;height:30px;' +
      'border-radius:50%;background:#0a0918;border:2px solid #e8c079;display:flex;' +
      'align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,.5);}' +
      '#socialConfirmEyebrow{font-size:10.5px;letter-spacing:2px;opacity:.5;margin:0 0 8px;' +
      'text-transform:uppercase;font-weight:600;}' +
      '#socialConfirmName{font-family:Georgia,\'Times New Roman\',serif;font-size:21px;margin:0 0 4px;' +
      'font-weight:400;line-height:1.35;color:#fdf6e6;}' +
      '#socialConfirmEmail{font-size:12.5px;opacity:.55;margin:0 0 20px;word-break:break-all;' +
      'letter-spacing:.3px;}' +
      '.socialConfirmOrnament{display:flex;align-items:center;justify-content:center;gap:10px;' +
      'margin:0 0 20px;color:rgba(232,192,121,.5);}' +
      '.socialConfirmOrnament .line{flex:1;height:1px;background:rgba(232,192,121,.22);}' +
      '.socialConfirmOrnament .mark{font-size:11px;}' +
      '#socialConfirmAllow{font-family:Georgia,\'Times New Roman\',serif;font-size:14px;' +
      'font-style:italic;margin:0 0 12px;text-align:left;color:#e0d8c3;opacity:.9;}' +
      '#socialConfirmAllow strong{color:#e8c079;font-style:normal;}' +
      '#socialConfirmPermList{list-style:none;margin:0 0 18px;padding:0;text-align:left;}' +
      '#socialConfirmPermList li{display:flex;gap:11px;align-items:center;font-size:12.5px;' +
      'opacity:.82;margin-bottom:9px;line-height:1.4;letter-spacing:.2px;}' +
      '#socialConfirmPermList i{color:#e8c079;font-size:14px;width:16px;text-align:center;flex-shrink:0;}' +
      '#socialConfirmTrustNote{display:flex;gap:10px;align-items:flex-start;text-align:left;' +
      'background:rgba(232,192,121,.05);border:1px solid rgba(232,192,121,.18);border-radius:4px;' +
      'padding:13px 15px;margin:0 0 18px;font-size:11.5px;line-height:1.6;opacity:.85;}' +
      '#socialConfirmTrustNote i{color:#e8c079;font-size:14px;margin-top:1px;flex-shrink:0;}' +
      '#socialConfirmTrustNote strong{opacity:1;color:#fdf6e6;}' +
      '#socialConfirmDesc{font-size:12.5px;line-height:1.7;opacity:.7;margin:0 0 4px;text-align:left;' +
      'letter-spacing:.15px;}' +
      '#socialConfirmDesc strong{color:#e8c079;font-weight:600;}' +
      '#socialConfirmList{list-style:none;margin:14px 0 22px;padding:0;text-align:left;}' +
      '#socialConfirmList li{display:flex;gap:11px;align-items:flex-start;font-size:12px;' +
      'opacity:.68;margin-bottom:10px;line-height:1.55;}' +
      '#socialConfirmList i{color:#c9a86a;margin-top:2px;flex-shrink:0;}' +
      '#socialConfirmLegal{font-size:10.5px;line-height:1.7;opacity:.45;margin:0 0 22px;text-align:left;' +
      'font-style:italic;}' +
      '#socialConfirmLegal a{color:#e8c079;text-decoration:none;border-bottom:1px solid rgba(232,192,121,.4);' +
      'font-style:normal;}' +
      '#socialConfirmActions{display:flex;flex-direction:column;gap:12px;margin-top:2px;}' +
      '#socialConfirmActions button{width:100%;padding:14px 18px;border-radius:3px;' +
      'font-size:12.5px;font-weight:600;cursor:pointer;transition:transform .15s ease,box-shadow .15s ease;' +
      'display:flex;align-items:center;justify-content:center;gap:9px;' +
      'text-transform:uppercase;letter-spacing:2px;}' +
      '#socialConfirmActions button:active{transform:scale(.98);}' +
      '#socialConfirmContinue{position:relative;overflow:hidden;' +
      'background:linear-gradient(100deg,#c9a04e 0%,#f2d38c 20%,#e8c079 40%,#c9a04e 60%,#f2d38c 80%,#c9a04e 100%);' +
      'background-size:250% 100%;animation:socialConfirmShimmer 3.5s linear infinite;' +
      'color:#1a1408;border:1px solid rgba(255,244,214,.6);' +
      'box-shadow:0 8px 20px rgba(201,160,78,.3);}' +
      '#socialConfirmContinue:hover{box-shadow:0 8px 26px rgba(201,160,78,.45);}' +
      '#socialConfirmCancel{background:transparent;color:rgba(242,237,224,.6);' +
      'border:1px solid rgba(232,192,121,.28);font-weight:500;letter-spacing:2px;}' +
      '#socialConfirmCancel:hover{background:rgba(232,192,121,.06);color:#e8c079;}' +
      '#socialConfirmFooter{display:flex;align-items:center;justify-content:center;gap:7px;' +
      'margin-top:20px;font-size:10px;opacity:.4;letter-spacing:.8px;font-style:italic;}' +
      '#socialConfirmFooter i{color:#e8c079;}';
    document.head.appendChild(style);

    var overlay = document.createElement('div');
    overlay.id = 'socialConfirmOverlay';
    overlay.innerHTML =
      '<div id="socialConfirmCard">' +
        '<div id="socialConfirmInnerFrame">' +
          '<div id="socialConfirmBrand"><span class="rule"></span><i class="bi bi-gem"></i><span>Ladla Sheikh</span><span class="rule right"></span></div>' +
          '<div id="socialConfirmBody">' +
            '<div id="socialConfirmAvatarWrap">' +
              '<img id="socialConfirmPhoto" alt="" style="display:none;">' +
              '<div id="socialConfirmInitial" style="display:none;"></div>' +
              '<div id="socialConfirmProviderBadge"></div>' +
            '</div>' +
            '<p id="socialConfirmEyebrow">You\u2019re signing in as</p>' +
            '<h3 id="socialConfirmName"></h3>' +
            '<p id="socialConfirmEmail"></p>' +
            '<div class="socialConfirmOrnament"><span class="line"></span><span class="mark">&#10022;</span><span class="line"></span></div>' +
            '<p id="socialConfirmAllow">This will allow <strong>Ladla Sheikh</strong> to:</p>' +
            '<ul id="socialConfirmPermList">' +
              '<li><i class="bi bi-person-vcard-fill"></i><span>See your name and profile photo</span></li>' +
              '<li><i class="bi bi-envelope-fill"></i><span>See your primary email address</span></li>' +
            '</ul>' +
            '<div id="socialConfirmTrustNote">' +
              '<i class="bi bi-shield-exclamation"></i>' +
              '<span>Make sure you trust <strong>Ladla Sheikh</strong>. You may be sharing this info with the site. You can remove access at any time from your account settings.</span>' +
            '</div>' +
            '<p id="socialConfirmDesc">' +
              'You\u2019re about to continue to <strong>Ladla Sheikh</strong> using the account above. ' +
              'A few points worth knowing beforehand:' +
            '</p>' +
            '<ul id="socialConfirmList">' +
              '<li><i class="bi bi-check-circle-fill"></i><span>We\u2019ll only receive your <strong>name, email address and profile photo</strong> — nothing else from your account.</span></li>' +
              '<li><i class="bi bi-check-circle-fill"></i><span>Your password is <strong>never shared</strong> with us — it stays with your provider.</span></li>' +
              '<li><i class="bi bi-check-circle-fill"></i><span>If this is your first time here, a new Ladla Sheikh account will be created for this identity.</span></li>' +
            '</ul>' +
            '<p id="socialConfirmLegal">' +
              'By continuing, you agree to Ladla Sheikh\u2019s <a href="#/privacy">Privacy Policy</a> and Terms of Service.' +
            '</p>' +
            '<div id="socialConfirmActions">' +
              '<button type="button" id="socialConfirmContinue"><i class="bi bi-shield-lock-fill"></i><span>Continue</span></button>' +
              '<button type="button" id="socialConfirmCancel"><span>Cancel</span></button>' +
            '</div>' +
            '<div id="socialConfirmFooter"><i class="bi bi-lock-fill"></i><span>Secured by Firebase Authentication</span></div>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
  }

  var SOCIAL_PROVIDER_META = {
    google:   { icon: 'bi-google',   color: '#4285F4', bg: '#ffffff' },
    facebook: { icon: 'bi-facebook', color: '#ffffff', bg: '#1877F2' },
    github:   { icon: 'bi-github',   color: '#ffffff', bg: '#24292e' },
    apple:    { icon: 'bi-apple',    color: '#ffffff', bg: '#000000' }
  };

  function showSocialConfirm(profile, onContinue, onCancel) {
    ensureSocialConfirmModal();
    var overlay = document.getElementById('socialConfirmOverlay');
    var photo = document.getElementById('socialConfirmPhoto');
    var initialEl = document.getElementById('socialConfirmInitial');
    var badgeEl = document.getElementById('socialConfirmProviderBadge');
    var nameEl = document.getElementById('socialConfirmName');
    var emailEl = document.getElementById('socialConfirmEmail');
    var continueBtn = document.getElementById('socialConfirmContinue');
    var cancelBtn = document.getElementById('socialConfirmCancel');

    if (profile.photoURL) {
      photo.src = profile.photoURL;
      photo.style.display = 'block';
      initialEl.style.display = 'none';
    } else {
      photo.style.display = 'none';
      initialEl.textContent = (profile.name || profile.email || '?').trim().charAt(0).toUpperCase();
      initialEl.style.display = 'flex';
    }

    var meta = SOCIAL_PROVIDER_META[profile.providerName] || SOCIAL_PROVIDER_META.google;
    badgeEl.style.background = meta.bg;
    badgeEl.innerHTML = '<i class="bi ' + meta.icon + '" style="color:' + meta.color + ';font-size:14px;"></i>';

    nameEl.textContent = profile.name || 'this account';
    emailEl.textContent = profile.email || '';

    function cleanup() {
      overlay.classList.remove('open');
      continueBtn.removeEventListener('click', handleContinue);
      cancelBtn.removeEventListener('click', handleCancel);
    }
    function handleContinue() { cleanup(); onContinue(); }
    function handleCancel() { cleanup(); onCancel(); }

    continueBtn.addEventListener('click', handleContinue);
    cancelBtn.addEventListener('click', handleCancel);
    overlay.classList.add('open');
  }

  // Runs the shared "confirm or cancel" step for a profile that just came
  // back from Google/Facebook/GitHub's sign-in pop-up.
  function handleSocialProfile(profile, toastEl) {
    if (!profile) return;
    var allowCreate = byId('signupForm') !== null;

    showSocialConfirm(profile, function onContinue() {
      window.LadlaAuth.confirmSocialSignIn(allowCreate).then(function () {
        showToast(toastEl, 'success', 'Signed in — redirecting…');
        redirectAfterAuth();
      }).catch(function (err) {
        window.LadlaAuth.cancelSocialSignIn();
        showToast(toastEl, 'error', window.LadlaAuth.friendlyError(err.code));
      });
    }, function onCancel() {
      window.LadlaAuth.cancelSocialSignIn();
      showToast(toastEl, 'error', 'Sign-in cancelled.');
    });
  }

  root.querySelectorAll('[data-social]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var provider = btn.dataset.social;
      var toast = btn.closest('.auth-card, .auth-card-login').querySelector('.auth-toast');

      if (!authReady()) {
        showToast(toast, 'error', 'Still loading — please try again in a second.');
        return;
      }

      if (provider === 'Google' || provider === 'Facebook' || provider === 'GitHub' || provider === 'Apple') {
        var call = provider === 'Google' ? window.LadlaAuth.signInWithGoogle()
                  : provider === 'Facebook' ? window.LadlaAuth.signInWithFacebook()
                  : provider === 'Apple' ? window.LadlaAuth.signInWithApple()
                  : window.LadlaAuth.signInWithGithub();

        call.then(function (profile) {
          handleSocialProfile(profile, toast);
        }).catch(function (err) {
          showToast(toast, 'error', window.LadlaAuth.friendlyError(err.code));
        });
      }
    });
  });

  /* ══════════════════════════════════════════════
     PHONE SIGN-IN / SIGN-UP
     Uses Firebase Phone Auth (SMS code) via window.LadlaAuth.
     Same panel/flow on both login.html and signup.html — Firebase
     Phone Auth doesn't distinguish "sign in" from "sign up": a
     verified phone number is simply signed in, creating the
     account on first use automatically.
     ══════════════════════════════════════════════ */
  var phoneContinueBtn = byId('phoneContinueBtn');
  if (phoneContinueBtn) {
    var socialStack = byId('socialStack');
    var emailDivider = root.querySelector('.auth-divider'); // "or sign in/up with email" — same class on both pages
    var phoneAuthPanel = byId('phoneAuthPanel');
    var phoneAuthBack = byId('phoneAuthBack');
    var phoneToast = byId('phoneToast');
    var phoneNumberInput = byId('phoneNumber');
    var phoneCodeGroup = byId('phoneCodeGroup');
    var phoneCodeInput = byId('phoneCode');
    var sendCodeBtn = byId('sendCodeBtn');
    var verifyCodeBtn = byId('verifyCodeBtn');
    var authCard = root.querySelector('.auth-card, .auth-card-login');

    function showPhonePanel(show) {
      socialStack.style.display = show ? 'none' : 'flex';
      if (emailDivider) emailDivider.style.display = show ? 'none' : 'flex';
      var authForm = byId('loginForm') || byId('signupForm');
      if (authForm) authForm.style.display = show ? 'none' : 'flex';
      var switchLine = root.querySelector('.auth-switch');
      if (switchLine) switchLine.style.display = show ? 'none' : 'block';
      if (authCard) authCard.classList.toggle('phone-mode', show);
      phoneAuthPanel.classList.toggle('open', show);
    }

    phoneContinueBtn.addEventListener('click', function () { showPhonePanel(true); });
    phoneAuthBack.addEventListener('click', function () { showPhonePanel(false); });

    sendCodeBtn.addEventListener('click', function () {
      var phone = phoneNumberInput.value.trim();
      if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
        setFieldError(phoneNumberInput, byId('phoneNumberError'),
          'Include your country code, e.g. +923001234567.');
        return;
      }
      setFieldError(phoneNumberInput, byId('phoneNumberError'), '');

      if (!authReady()) {
        showToast(phoneToast, 'error', 'Still loading — please try again in a second.');
        return;
      }

      sendCodeBtn.classList.add('loading');
      sendCodeBtn.disabled = true;

      window.LadlaAuth.sendPhoneCode(phone, 'recaptcha-container').then(function () {
        sendCodeBtn.classList.remove('loading');
        sendCodeBtn.disabled = false;
        sendCodeBtn.style.display = 'none';
        phoneCodeGroup.style.display = 'block';
        verifyCodeBtn.style.display = 'inline-flex';
        showToast(phoneToast, 'success', 'Code sent — check your SMS messages.');
      }).catch(function (err) {
        sendCodeBtn.classList.remove('loading');
        sendCodeBtn.disabled = false;
        showToast(phoneToast, 'error', window.LadlaAuth.friendlyError(err.code));
      });
    });

    verifyCodeBtn.addEventListener('click', function () {
      var code = phoneCodeInput.value.trim();
      if (code.length < 4) {
        setFieldError(phoneCodeInput, byId('phoneCodeError'), 'Enter the code you received.');
        return;
      }
      setFieldError(phoneCodeInput, byId('phoneCodeError'), '');

      verifyCodeBtn.classList.add('loading');
      verifyCodeBtn.disabled = true;

      window.LadlaAuth.confirmPhoneCode(code, byId('signupForm') !== null).then(function () {
        showToast(phoneToast, 'success', 'Signed in — redirecting…');
        redirectAfterAuth();
      }).catch(function (err) {
        verifyCodeBtn.classList.remove('loading');
        verifyCodeBtn.disabled = false;
        showToast(phoneToast, 'error', window.LadlaAuth.friendlyError(err.code));
      });
    });
  }
  });
})();
