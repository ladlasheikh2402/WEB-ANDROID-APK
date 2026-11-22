/* Visitor counter — same Firebase project and database paths as before
   (views, liveUsers, connections). Only change: it no longer throws when the
   on-page counters aren't in the DOM (they were commented out in index.html). */
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, set, push, onDisconnect, increment, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDwXU_K62YrpRWbmjNSwkEy8y_lF9e-KgY",
  authDomain: "ladla-sheikh-website.firebaseapp.com",
  databaseURL: "https://ladla-sheikh-website-default-rtdb.firebaseio.com",
  projectId: "ladla-sheikh-website",
  storageBucket: "ladla-sheikh-website.firebasestorage.app",
  messagingSenderId: "900009013391",
  appId: "1:900009013391:web:94579ccaec6354721440fa",
  measurementId: "G-WWWV91QSYV"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app);
const viewsRef = ref(db, "views");
const liveRef = ref(db, "liveUsers");
const connectionsRef = ref(db, "connections");

update(ref(db), { views: increment(1) });

const userRef = push(connectionsRef);
set(userRef, true);
onDisconnect(userRef).remove();

onValue(connectionsRef, (snapshot) => { set(liveRef, snapshot.exists() ? snapshot.size : 0); });

function show(id, val) { const el = document.getElementById(id); if (el) el.textContent = val ?? 0; }
onValue(viewsRef, (snap) => show("totalViews", snap.val()));
onValue(liveRef, (snap) => show("liveUsers", snap.val()));