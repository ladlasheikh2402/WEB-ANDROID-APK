/* ══════════════════════════════════════════════════════════════
   FIREBASE AUTH — shared module for login.html / signup.html /
   the sign-in gate modal on index.html.

   This reuses the SAME Firebase project already wired up on your
   homepage for the live views/users counter — no new service, no
   new account needed. It just turns on real Authentication on top
   of it.

   ⚠️ ONE-TIME SETUP REQUIRED IN THE FIREBASE CONSOLE
   (console.firebase.google.com → your "ladla-sheikh-website" project):

     1. Build → Authentication → "Get started"
     2. Sign-in method tab → enable:
          • Email/Password
          • Google   (just toggle it on, pick a support email)
        Facebook needs a Facebook Developer App first — skip it
        for now, the button will tell users it's coming soon.
     3. Build → Realtime Database → Rules — make sure signed-in
        users can write their own profile + usernames stay unique.
        A reasonable starting rule set:

        {
          "rules": {
            "users": {
              "$uid": {
                ".read": true,
                ".write": "auth != null && auth.uid === $uid"
              }
            },
            "usernames": {
              "$username": {
                ".read": true,
                ".write": "auth != null && (!data.exists() || data.val() === auth.uid)"
              }
            },
            "favourites": {
              "$uid": {
                ".read": "auth != null && auth.uid === $uid",
                ".write": "auth != null && auth.uid === $uid"
              }
            },
            "views": { ".read": true, ".write": true },
            "liveUsers": { ".read": true, ".write": true },
            "connections": { ".read": true, ".write": true }
          }
        }

   That's it — no server, no backend code to write. Everything
   below talks directly to Firebase from the browser.
   ══════════════════════════════════════════════════════════════ */

import {
  initializeApp, getApps, getApp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signOut,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  updateProfile, sendPasswordResetEmail,
  GoogleAuthProvider, FacebookAuthProvider, GithubAuthProvider, OAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo, deleteUser, RecaptchaVerifier, signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getDatabase, ref, get, set, remove, onValue, child
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// same config already used on index.html for the views/live counter
const firebaseConfig = {
  apiKey: "AIzaSyDYvoNHUNoSkzd44NelOhWhOHVtTnKeTsQ",
  authDomain: "ladla-sheikh-signinsignup.firebaseapp.com",
  databaseURL: "https://ladla-sheikh-signinsignup-default-rtdb.firebaseio.com",
  projectId: "ladla-sheikh-signinsignup",
  storageBucket: "ladla-sheikh-signinsignup.firebasestorage.app",
  messagingSenderId: "586952595897",
  appId: "1:586952595897:web:9a6ce0fe0cd203afe0fe68",
  measurementId: "G-YMN3T8G2F7"
};

// getApp() reuses the instance if this page already initialized
// Firebase elsewhere (e.g. the views counter on index.html) instead
// of throwing a "duplicate app" error.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const googleProvider = new GoogleAuthProvider();
// always show Google's account picker, even if the browser is already
// signed into one Google account — otherwise Google silently reuses
// that account instead of letting the visitor choose/switch.
googleProvider.setCustomParameters({ prompt: 'select_account' });
const facebookProvider = new FacebookAuthProvider();
const githubProvider = new GithubAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

var ERROR_MESSAGES = {
  'auth/email-already-in-use': 'That email is already registered — try signing in instead.',
  'auth/invalid-email': 'That email address doesn\u2019t look right.',
  'auth/missing-email': 'Please enter your email address.',
  'auth/weak-password': 'Please use at least 8 characters.',
  'auth/user-not-found': 'No account found with that email or username.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/invalid-credential': 'Incorrect email/username or password.',
  'auth/too-many-requests': 'Too many attempts — please wait a moment and try again.',
  'auth/popup-closed-by-user': 'Sign-in was cancelled.',
  'auth/popup-blocked': 'Your browser blocked the sign-in pop-up — please allow pop-ups for this site and try again.',
  'auth/cancelled-popup-request': 'Sign-in was cancelled — please try again.',
  'auth/operation-not-supported-in-this-environment': 'This browser (e.g. an in-app browser like WhatsApp/Instagram/Facebook) doesn\u2019t support Google sign-in. Please open this site in Chrome or Safari instead.',
  'auth/network-request-failed': 'Network error — check your connection and try again.',
  'auth/operation-not-allowed': 'This sign-in method isn\u2019t turned on yet in the Firebase console.',
  'custom/username-taken': 'That username is already taken — try another one.',
  'custom/sign-in-required': 'Please sign in to save favourites.'
};

function friendlyError(code) {
  return ERROR_MESSAGES[code] || 'Something went wrong. Please try again.';
}

function usernameKey(username) {
  return String(username || '').trim().toLowerCase();
}

async function isUsernameTaken(username) {
  var snap = await get(child(ref(db), 'usernames/' + usernameKey(username)));
  return snap.exists();
}

async function emailForUsername(username) {
  var key = usernameKey(username);
  var mapSnap = await get(child(ref(db), 'usernames/' + key));
  if (!mapSnap.exists()) { var e = new Error('user not found'); e.code = 'auth/user-not-found'; throw e; }
  var uid = mapSnap.val();
  var emailSnap = await get(child(ref(db), 'users/' + uid + '/email'));
  if (!emailSnap.exists()) { var e2 = new Error('user not found'); e2.code = 'auth/user-not-found'; throw e2; }
  return emailSnap.val();
}

async function signUpWithEmail(opts) {
  var name = opts.name, username = opts.username, email = opts.email, password = opts.password;
  var key = usernameKey(username);

  if (await isUsernameTaken(key)) {
    var e = new Error('username taken'); e.code = 'custom/username-taken'; throw e;
  }

  var cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });

  await set(ref(db, 'users/' + cred.user.uid), {
    name: name,
    username: key,
    email: email,
    provider: 'password',
    createdAt: Date.now()
  });
  await set(ref(db, 'usernames/' + key), cred.user.uid);

  return cred.user;
}

function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password).then(function (cred) { return cred.user; });
}

async function signInWithUsername(username, password) {
  var email = await emailForUsername(username);
  return signInWithEmail(email, password);
}

function profileFromUser(user, providerName) {
  return {
    providerName: providerName,
    name: user.displayName || '',
    email: user.email || '',
    photoURL: user.photoURL || ''
  };
}

// STEP 1 — just find out which account the person picked. This signs them
// into Firebase (so we know who they are) but does NOT touch our database
// yet — nothing is created or attached until confirmSocialSignIn() runs.
// That's what lets the UI show "Continue as {name}? / Cancel" in between,
// instead of an account appearing the instant a Google/Facebook account is
// selected.
//
// This uses signInWithPopup on every device, desktop and mobile alike.
// An earlier version switched to signInWithRedirect on mobile — redirect
// sends the whole page away to Google and back, and depends on
// sessionStorage surviving that round trip. Modern mobile browsers
// (Safari's ITP, Chrome's storage partitioning) and in-app browsers
// (WhatsApp/Instagram/Facebook) routinely block or wall off that storage,
// which is exactly what throws Firebase's "missing initial state" error —
// and since the page had already navigated away, our confirm modal never
// got a chance to show either. Popup keeps everything on the same page
// (like it already did on desktop), so neither problem happens, and the
// one genuine dead end — Google refusing to sign in inside an in-app
// browser at all — now surfaces as a clear, catchable error instead of a
// silent redirect failure (see auth/operation-not-supported-in-this-environment
// in the error messages above).
async function beginSocialAuth(provider, providerName) {
  const cred = await signInWithPopup(auth, provider);
  return profileFromUser(cred.user, providerName);
}

// STEP 2a — the person tapped "Continue" on the confirm card. Now we
// actually attach/create the account in our database.
async function confirmSocialSignIn(allowCreate) {
  const user = auth.currentUser;
  if (!user) {
    const e = new Error('No pending sign-in');
    e.code = 'auth/user-not-found';
    throw e;
  }

  const userRef = child(ref(db), 'users/' + user.uid);
  const existing = await get(userRef);
  const isNewUser = !existing.exists();

  if (isNewUser && !allowCreate) {
    // logging in, not signing up — don't create an account for a Google/
    // Facebook/GitHub identity we've never seen before.
    try { await deleteUser(user); } catch (deleteErr) {}
    const e = new Error('No account found');
    e.code = 'auth/user-not-found';
    throw e;
  }

  if (isNewUser) {
    var providerId = (user.providerData[0] && user.providerData[0].providerId) || 'unknown';
    await set(ref(db, 'users/' + user.uid), {
      name: user.displayName || '',
      email: user.email || '',
      provider: providerId.replace('.com', ''),
      createdAt: Date.now()
    });
  }
  return user;
}

// STEP 2b — the person tapped "Cancel" on the confirm card. If this was a
// brand-new sign-in (no profile in our database yet), remove the Firebase
// auth user entirely so nothing is left behind; otherwise just sign them
// back out.
async function cancelSocialSignIn() {
  const user = auth.currentUser;
  if (!user) return;
  const existing = await get(child(ref(db), 'users/' + user.uid));
  if (!existing.exists()) {
    try { await deleteUser(user); return; } catch (deleteErr) {}
  }
  await signOut(auth);
}

function signInWithGoogle() { return beginSocialAuth(googleProvider, 'google'); }
function signInWithFacebook() { return beginSocialAuth(facebookProvider, 'facebook'); }
function signInWithGithub() { return beginSocialAuth(githubProvider, 'github'); }
function signInWithApple() { return beginSocialAuth(appleProvider, 'apple'); }

let phoneConfirmation = null;
async function sendPhoneCode(phone, recaptchaContainerId) {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, { size: 'invisible' });
  }
  phoneConfirmation = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
  return phoneConfirmation;
}

async function confirmPhoneCode(code, allowCreate) {
  if (!phoneConfirmation) { const e = new Error('No phone verification in progress'); e.code = 'auth/missing-verification-code'; throw e; }
  const cred = await phoneConfirmation.confirm(code);
  const existing = await get(child(ref(db), 'users/' + cred.user.uid));
  const isNewUser = getAdditionalUserInfo(cred)?.isNewUser === true;

  if (isNewUser && allowCreate === false) {
    try { await deleteUser(cred.user); } catch (deleteErr) {}
    const e = new Error('No account found'); e.code = 'auth/user-not-found'; throw e;
  }
  if (!existing.exists()) {
    await set(ref(db, 'users/' + cred.user.uid), {
      name: cred.user.displayName || '', email: cred.user.email || '',
      phone: cred.user.phoneNumber || '', provider: 'phone', createdAt: Date.now()
    });
  }
  phoneConfirmation = null;
  return cred.user;
}

function signOutUser() {
  return signOut(auth);
}

/* Forgot password. Accepts an email OR a username (usernames are looked up
   in the database and turned into the account's email first).
   The reset link opens Firebase's own "choose a new password" page, and — when
   this site's domain is in Firebase → Authentication → Settings → Authorized
   domains — shows a "Continue" button that brings the person back to login.html.
   If that domain isn't authorized (or the page is opened as a local file),
   Firebase rejects the continue-URL, so we quietly retry without it. */
async function resetPassword(identifier) {
  var value = String(identifier || '').trim();
  if (!value) { var e = new Error('missing email'); e.code = 'auth/missing-email'; throw e; }

  var email = value.indexOf('@') > -1 ? value : await emailForUsername(value);

  try {
    await sendPasswordResetEmail(auth, email, {
      url: window.location.origin + '/login.html',
      handleCodeInApp: false
    });
  } catch (err) {
    var code = err && err.code;
    if (code === 'auth/unauthorized-continue-uri' ||
        code === 'auth/invalid-continue-uri' ||
        code === 'auth/missing-continue-uri') {
      await sendPasswordResetEmail(auth, email);
    } else {
      throw err;
    }
  }
}

/* ══════════════════════════════════════════════════════════════
   FAVOURITES / BOOKMARKS
   Signed-in users can bookmark a tool or method from index.html.
   Stored at favourites/{uid}/{toolId} = true in the Realtime
   Database — needs this matching rule in Firebase → Realtime
   Database → Rules:

     "favourites": {
       "$uid": {
         ".read": "auth != null && auth.uid === $uid",
         ".write": "auth != null && auth.uid === $uid"
       }
     }
   ══════════════════════════════════════════════════════════════ */

function requireUser() {
  var user = auth.currentUser;
  if (!user) {
    var e = new Error('Sign in required');
    e.code = 'custom/sign-in-required';
    throw e;
  }
  return user;
}

function favouritesRef(uid) {
  return ref(db, 'favourites/' + uid);
}

// Adds/removes a single item from the signed-in user's favourites and
// returns the NEW state (true = now favourited, false = now removed).
async function toggleFavourite(toolId) {
  var user = requireUser();
  var itemRef = child(favouritesRef(user.uid), toolId);
  var snap = await get(itemRef);
  if (snap.exists()) {
    await remove(itemRef);
    return false;
  }
  await set(itemRef, true);
  return true;
}

// One-time read of every ID the signed-in user has favourited, as
// { toolId: true, ... }. Empty object if signed out or nothing saved yet.
async function getFavourites() {
  var user = auth.currentUser;
  if (!user) return {};
  var snap = await get(favouritesRef(user.uid));
  return snap.exists() ? snap.val() : {};
}

// Live subscription to the signed-in user's favourites — fires immediately
// with the current state and again on every change (e.g. another open tab
// toggling one). Returns an unsubscribe function. If nobody's signed in,
// calls back once with {} and returns a no-op unsubscribe.
function onFavouritesChange(cb) {
  var user = auth.currentUser;
  if (!user) { cb({}); return function () {}; }
  return onValue(favouritesRef(user.uid), function (snap) {
    cb(snap.exists() ? snap.val() : {});
  });
}

/* ══════════════════════════════════════════════════════════════
   USER PROFILE
   Basic info to show on a profile card/dropdown once signed in —
   whatever Firebase already has on the current user, no extra
   database read needed.
   ══════════════════════════════════════════════════════════════ */
function getUserProfile() {
  var user = auth.currentUser;
  if (!user) return null;
  var providerId = (user.providerData[0] && user.providerData[0].providerId) || 'password';
  return {
    uid: user.uid,
    name: user.displayName || '',
    email: user.email || '',
    photoURL: user.photoURL || '',
    provider: providerId.replace('.com', '')
  };
}

window.LadlaAuth = {
  auth: auth,
  onAuthChange: function (cb) { return onAuthStateChanged(auth, cb); },
  getCurrentUser: function () { return auth.currentUser; },
  signUpWithEmail: signUpWithEmail,
  signInWithEmail: signInWithEmail,
  signInWithUsername: signInWithUsername,
  signInWithGoogle: signInWithGoogle,
  signInWithFacebook: signInWithFacebook,
  signInWithGithub: signInWithGithub,
  signInWithApple: signInWithApple,
  confirmSocialSignIn: confirmSocialSignIn,
  cancelSocialSignIn: cancelSocialSignIn,
  sendPhoneCode: sendPhoneCode,
  confirmPhoneCode: confirmPhoneCode,
  signOutUser: signOutUser,
  resetPassword: resetPassword,
  friendlyError: friendlyError,
  toggleFavourite: toggleFavourite,
  getFavourites: getFavourites,
  onFavouritesChange: onFavouritesChange,
  getUserProfile: getUserProfile
};

// let classic (non-module) scripts loaded around the same time know
// the auth module has finished setting up
window.dispatchEvent(new Event('ladla-auth-ready'));