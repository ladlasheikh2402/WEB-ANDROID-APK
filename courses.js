/* ═══════════════════════════════════════════════════════════
   COURSES — sirf is CONFIG ko edit karna hai (ya course-builder.html use karein).
   Part 1 (free) ki video yahin `yt` mein. Baqi paid parts ki videos Firebase mein
   hotī hain (password ke baad hi milti hain). YouTube link ya mp4 link, dono chalte hain.
   ═══════════════════════════════════════════════════════════ */
const COURSE_CONFIG = {
  logo: "images/footer-img.png",
  instructor: { name: "Ladla Sheikh", role: "Sheikh Ali Ahmad · Web Developer & Designer",
    links: [["bi-youtube","https://www.youtube.com/@ladla.sheikh.2402"],["bi-telegram","https://t.me/+94FrpOJan0plZGQ0"],["bi-whatsapp","https://whatsapp.com/channel/0029Vao1lnR1nozDF8jBNh3B"]] },
  whatsapp: "923143702270",
  firebase: {
    apiKey: "AIzaSyDwXU_K62YrpRWbmjNSwkEy8y_lF9e-KgY",
    authDomain: "ladla-sheikh-website.firebaseapp.com",
    databaseURL: "https://ladla-sheikh-website-default-rtdb.firebaseio.com",
    projectId: "ladla-sheikh-website",
    appId: "1:900009013391:web:94579ccaec6354721440fa"
  },
  protect: true,                                // screen-capture rukawatein on/off (tab chhodne par black, PrintScreen, Ctrl+S/P/U)
  watermark: false,                             // video par chalta hua naam/ID: true karne se wapas aa jata hai
  courses: [
    {
      id: "web-dev",
      title: "Full Stack Web Development Course",
      hl: "Web Development",                    // hero title mein gradient se chamakne wale lafz
      tag: "Web Development",
      thumb: "images/course-thumb.png",
      desc: "Zero se full stack developer tak — HTML se le kar frontend, backend aur database tak, step by step.",
      learn: [
        { i: "bi-filetype-html", t: "HTML5", d: "Page structure, semantic tags, forms", c: "#ff8c42" },
        { i: "bi-filetype-css", t: "CSS3", d: "Styling, colors, typography, animations", c: "#42a5ff" },
        { i: "bi-grid-1x2-fill", t: "Flexbox & Grid", d: "Modern, professional page layouts", c: "#c084fc" },
        { i: "bi-phone-fill", t: "Responsive Design", d: "Mobile-first sites for every screen", c: "#f472b6" },
        { i: "bi-bootstrap-fill", t: "Bootstrap & UI", d: "Build beautiful UI in less time", c: "#a78bfa" },
        { i: "bi-filetype-js", t: "JavaScript ES6+", d: "Core language, functions, arrays, objects", c: "#ffd60a" },
        { i: "bi-cursor-fill", t: "DOM & Events", d: "Make pages interactive and dynamic", c: "#fbbf24" },
        { i: "bi-lightning-charge-fill", t: "Async JS & APIs", d: "Promises, async/await, fetch, JSON", c: "#facc15" },
        { i: "bi-github", t: "Git & GitHub", d: "Version control and teamwork", c: "#ff6e50" },
        { i: "bi-terminal-fill", t: "Dev Tools & Debugging", d: "VS Code, DevTools, fix bugs fast", c: "#fb923c" },
        { i: "bi-boxes", t: "React.js", d: "Components, hooks, state, routing", c: "#61dafb" },
        { i: "bi-node-plus-fill", t: "Node.js", d: "Server-side JavaScript and npm", c: "#6ed25a" },
        { i: "bi-signpost-split-fill", t: "Express.js", d: "Routes, middleware, REST APIs", c: "#dcdceb" },
        { i: "bi-plug-fill", t: "REST API Design", d: "CRUD, validation, error handling", c: "#34d399" },
        { i: "bi-database-fill", t: "MongoDB & Mongoose", d: "NoSQL database, models, queries", c: "#4ade80" },
        { i: "bi-table", t: "SQL & MySQL", d: "Relational databases and queries", c: "#ff78a0" },
        { i: "bi-shield-lock-fill", t: "Authentication", d: "Login, JWT, password hashing, roles", c: "#38bdf8" },
        { i: "bi-bug-fill", t: "Web Security", d: "Safe code, CORS, input validation", c: "#f87171" },
        { i: "bi-cloud-arrow-up-fill", t: "Deployment", d: "Put your site live on the internet", c: "#60a5fa" },
        { i: "bi-rocket-takeoff-fill", t: "Real Projects", d: "Portfolio, apps and a final full stack project", c: "#e879f9" }
      ],      // ⬇ 100 lessons. Apni videos badalne ke liye course-builder.html se naya `parts` bana kar yahan paste karein
      parts: [
        { mod: "Module 1: Getting Started", title: "Course Introduction & Roadmap", free: true, yt: "e7MAhD9m-hM" },
        { title: "What is Web Development?", free: true, yt: "e7MAhD9m-hM" },
        { title: "Setting Up Your Computer", free: true, yt: "e7MAhD9m-hM" },
        { title: "Installing VS Code & Extensions", free: true, yt: "e7MAhD9m-hM" },
        { title: "How the Internet & Browsers Work", free: true, yt: "e7MAhD9m-hM" },
        { title: "Your First Web Page", free: true, yt: "e7MAhD9m-hM" },
        { mod: "Module 2: HTML", title: "HTML Structure & Tags" },
        { title: "Text, Links & Images" },
        { title: "Lists & Tables" },
        { title: "Forms & Inputs" },
        { title: "Semantic HTML" },
        { title: "Audio, Video & Embeds" },
        { title: "HTML Best Practices" },
        { title: "Mini Project: Portfolio Page (Part 1)" },
        { title: "Mini Project: Portfolio Page (Part 2)" },
        { title: "HTML Revision & Practice" },
        { mod: "Module 3: CSS", title: "CSS Basics & Selectors" },
        { title: "Colors, Fonts & Text" },
        { title: "Box Model" },
        { title: "Display & Positioning" },
        { title: "Flexbox (Part 1)" },
        { title: "Flexbox (Part 2)" },
        { title: "CSS Grid" },
        { title: "Responsive Design & Media Queries" },
        { title: "Transitions & Animations" },
        { title: "Bootstrap Framework" },
        { title: "Project: Responsive Landing Page" },
        { title: "CSS Revision & Practice" },
        { mod: "Module 4: JavaScript", title: "JavaScript Introduction" },
        { title: "Variables & Data Types" },
        { title: "Operators & Conditions" },
        { title: "Loops" },
        { title: "Functions" },
        { title: "Arrays" },
        { title: "Array Methods (map, filter, reduce)" },
        { title: "Objects" },
        { title: "ES6 Features" },
        { title: "Scope & Hoisting" },
        { title: "Error Handling" },
        { title: "Closures" },
        { title: "Async JS: Callbacks" },
        { title: "Promises" },
        { title: "Async / Await" },
        { title: "Fetch API & JSON" },
        { mod: "Module 5: DOM & Projects", title: "What is the DOM?" },
        { title: "Selecting & Changing Elements" },
        { title: "Events" },
        { title: "Forms & Validation with JS" },
        { title: "Local Storage" },
        { title: "Project: To-Do App" },
        { title: "Project: Weather App" },
        { title: "Project: Quiz App" },
        { title: "Project: Calculator" },
        { title: "JavaScript Revision & Practice" },
        { mod: "Module 6: Git & GitHub", title: "Git Basics" },
        { title: "Commits & Branches" },
        { title: "Merge & Conflicts" },
        { title: "GitHub & Pull Requests" },
        { title: "Hosting a Site on GitHub Pages" },
        { mod: "Module 7: React", title: "React Introduction & Setup" },
        { title: "JSX & Components" },
        { title: "Props" },
        { title: "State & useState" },
        { title: "Events in React" },
        { title: "Conditional Rendering & Lists" },
        { title: "useEffect" },
        { title: "Forms in React" },
        { title: "React Router" },
        { title: "Context API" },
        { title: "Custom Hooks" },
        { title: "API Calls in React" },
        { title: "Project: React Dashboard (Part 1)" },
        { title: "Project: React Dashboard (Part 2)" },
        { mod: "Module 8: Node.js & Express", title: "Node.js Introduction" },
        { title: "Modules & npm" },
        { title: "Express Setup" },
        { title: "Routing" },
        { title: "Middleware" },
        { title: "REST API Basics" },
        { title: "CRUD API (Part 1)" },
        { title: "CRUD API (Part 2)" },
        { title: "File Uploads" },
        { title: "Environment Variables & Config" },
        { mod: "Module 9: Databases", title: "Database Basics" },
        { title: "MongoDB Setup & Atlas" },
        { title: "CRUD in MongoDB" },
        { title: "Mongoose Models" },
        { title: "Relationships & Population" },
        { title: "Queries & Filtering" },
        { title: "Pagination & Search" },
        { title: "Connecting React with the Backend" },
        { mod: "Module 10: Authentication & Security", title: "Password Hashing" },
        { title: "JWT Authentication" },
        { title: "Protected Routes" },
        { title: "Roles & Permissions" },
        { title: "Web Security Basics" },
        { mod: "Module 11: Deployment & Final Project", title: "Preparing for Production" },
        { title: "Deploying Frontend (Vercel)" },
        { title: "Deploying Backend & Database" },
        { title: "Final Project & Next Steps" }
      ]
    }
  ]
};

(function () {
  const root = document.querySelector('#my-courses .crs-root');
  if (!root) return;
  const sec = document.getElementById('my-courses');
  const C = COURSE_CONFIG, $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const store = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  const done = c => store.get('crs_done_' + c.id, []);
  const ytId = u => { u = String(u || '').trim(); if (/^[\w-]{11}$/.test(u)) return u; const m = u.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/); return m ? m[1] : null; };
  const uid = () => { let u = store.get('crs_uid', null); if (!u) { u = Math.random().toString(36).slice(2, 8).toUpperCase(); store.set('crs_uid', u); } return u; };
  const logo = () => `<img src="${esc(C.logo)}" alt="" onerror="this.style.display='none'">`;

  async function hash(id, pass) {
    const b = new TextEncoder().encode(id + ':' + String(pass).trim().toUpperCase());
    const d = await crypto.subtle.digest('SHA-256', b);
    return [...new Uint8Array(d)].map(x => x.toString(16).padStart(2, '0')).join('');
  }
  window.courseHash = hash;

  /* ── Firebase (sirf zaroorat par load) ── */
  let fbp;
  const fb = () => fbp || (fbp = (async () => {
    const A = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const D = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
    return { db: D.getDatabase(A.initializeApp(C.firebase, 'courses')), ref: D.ref, get: D.get };
  })());
  async function fetchAccess(c, h) {
    const { db, ref, get } = await fb();
    const s = await get(ref(db, `courseAccess/${c.id}/${h}`));
    return s.exists() ? s.val() : null;
  }

  /* ── YouTube IFrame API ── */
  let ytp;
  const loadYT = () => ytp || (ytp = new Promise(res => {
    if (window.YT && YT.Player) return res();
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev && prev(); res(); };
    const t = document.createElement('script'); t.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(t);
  }));

  /* ── screen-capture rukawatein (deterrents) ── */
  let wmTimer;
  const inPlayer = () => !!root.querySelector('.crs-video-wrap');
  const guardOn = () => C.protect && inPlayer();
  function blackout(msg, ms) {
    const b = $('.crs-black', root); if (!b) return;
    b.querySelector('b').textContent = msg; b.classList.add('show');
    if (ms) setTimeout(() => b.classList.remove('show'), ms);
  }
  document.addEventListener('visibilitychange', () => {
    if (!guardOn()) return;
    if (document.hidden) { pauseAll(); blackout('Video paused — page par wapis aayein'); }
    else { const b = $('.crs-black', root); b && b.classList.remove('show'); }
  });
  document.addEventListener('keydown', e => {
    if (!guardOn()) return;
    const k = e.key, ctrl = e.ctrlKey || e.metaKey;
    if (k === 'PrintScreen') { try { navigator.clipboard.writeText(' '); } catch (x) {} blackout('Screenshot allowed nahi hai', 2000); }
    if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(k)) blackout('Screenshot allowed nahi hai', 2000);
    if (ctrl && ['s', 'p', 'u'].includes(k.toLowerCase())) e.preventDefault();
  });
  sec.addEventListener('contextmenu', e => { if (C.protect && inPlayer() && !/INPUT|TEXTAREA/.test(e.target.tagName)) e.preventDefault(); });
  let pauseAll = () => {};

  function startWM(wrap) {
    clearInterval(wmTimer);
    if (!C.protect || !C.watermark) return;
    const txt = C.instructor.name + ' • ' + uid();
    const els = [0, 1].map(() => { const e = document.createElement('div'); e.className = 'crs-wm'; wrap.appendChild(e); return e; });
    const mv = () => els.forEach(e => { e.textContent = txt; e.style.top = (8 + Math.random() * 78) + '%'; e.style.left = (4 + Math.random() * 58) + '%'; });
    mv(); wmTimer = setInterval(() => { if (!wrap.isConnected) clearInterval(wmTimer); else mv(); }, 5000);
  }

  /* ── landing page ── */
  const secs = c => c.parts.reduce((t, p) => { const [m, x] = String(p.duration || '0:0').split(':'); return t + (+m || 0) * 60 + (+x || 0); }, 0);
  const groups = c => { const g = []; c.parts.forEach((p, i) => { if (p.mod || !g.length) g.push({ name: p.mod || 'Lessons', idx: [] }); g[g.length - 1].idx.push(i); }); return g; };
  const TIP = '<div class="crs-tip"><span><i class="bi bi-hand-index-thumb-fill"></i> Module par click karein — uske lessons khulenge</span><button class="crs-expall" type="button">Open all</button></div>';
  function expAll(box, btn, set) {
    const ams = [...box.querySelectorAll('.crs-am')], open = ams.some(a => !a.classList.contains('open'));
    ams.forEach(a => { a.classList.toggle('open', open); if (set && a.dataset.g !== undefined) open ? set.add(+a.dataset.g) : set.delete(+a.dataset.g); });
    btn.textContent = open ? 'Close all' : 'Open all';
  }
  const mn = n => n.replace(/^Module\s*\d+\s*[:\-–]\s*/i, '');
  let teardown = () => {};
  const toTop = () => { const y = root.getBoundingClientRect().top + window.scrollY - 96; window.scrollTo({ top: Math.max(0, y), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); };
  function renderGrid(scroll) {
    teardown(); teardown = () => {}; clearInterval(wmTimer);
    root.innerHTML = C.courses.map(c => {
      const un = !!store.get('crs_key_' + c.id, null), t = secs(c), dn = done(c).length, last = store.get('crs_last_' + c.id, 0), res = dn > 0 || last > 0, pct = Math.round(dn / c.parts.length * 100), freeN = c.parts.filter(p => p.free).length, ttl = c.hl ? esc(c.title).replace(esc(c.hl), m => '<b>' + m + '</b>') : esc(c.title), lr = (c.learn || []).map(x => typeof x === 'string' ? { i: 'bi-check-circle-fill', t: x, d: '', c: '#ce55fd' } : x);
      return `<div class="crs-course" data-id="${esc(c.id)}">
      <section class="glass crs-hero crs-prem"><div class="crs-hero-l">
        <div class="crs-toprow"><span class="crs-pill"><i class="bi bi-gem"></i> Premium Course</span><span class="crs-lvl"><i class="bi bi-bar-chart-fill"></i> Beginner Friendly</span></div>
        <h2>${ttl}</h2><p>${esc(c.desc)}</p>
        <ul class="crs-pts"><li><i class="bi bi-check-circle-fill"></i>Zero se full stack developer tak, step by step</li><li><i class="bi bi-check-circle-fill"></i>Real projects ke saath practical learning</li>
          <li><i class="bi bi-check-circle-fill"></i>${freeN} lessons bilkul free — pehle dekhein, phir unlock karein</li><li><i class="bi bi-check-circle-fill"></i>Mobile aur computer dono par dekhein</li></ul>
        <div class="crs-stats"><div class="crs-stat"><i class="bi bi-collection-play-fill"></i><b>${c.parts.length}</b><small>Video Lessons</small></div>
          <div class="crs-stat">${t ? `<i class="bi bi-clock-fill"></i><b>${t >= 3600 ? Math.floor(t / 3600) + 'h ' + Math.round(t % 3600 / 60) + 'm' : Math.max(1, Math.round(t / 60)) + ' min'}</b><small>Total Time</small>` : '<i class="bi bi-badge-hd-fill"></i><b>HD</b><small>Quality</small>'}</div>
          <div class="crs-stat"><i class="bi bi-gift-fill"></i><b>${freeN} Free</b><small>Lessons</small></div>
          <div class="crs-stat"><i class="bi bi-infinity"></i><b>Lifetime</b><small>Access</small></div></div>
        <div class="crs-cta">${res ? `<button class="crs-btn primary shine" data-a="resume"><i class="bi bi-play-fill"></i> Resume Lesson ${Math.min(last, c.parts.length - 1) + 1}</button>` : '<button class="crs-btn primary shine" data-a="free"><i class="bi bi-play-fill"></i> Watch Free Lesson</button>'}
          <button class="crs-btn ghost" data-a="main">${un ? '<i class="bi bi-unlock-fill"></i> Continue Learning' : '<i class="bi bi-lock-fill"></i> Unlock Full Course'}</button></div>${dn ? `<div class="crs-resume"><div class="crs-bar"><i style="width:${pct}%"></i></div><small>${dn} of ${c.parts.length} lessons watched · ${pct}%</small></div>` : ''}</div>
        <div class="crs-hero-r">
          <span class="crs-fl f1"><i class="bi bi-filetype-js"></i></span><span class="crs-fl f2"><i class="bi bi-boxes"></i></span><span class="crs-fl f3"><i class="bi bi-node-plus-fill"></i></span><span class="crs-fl f4"><i class="bi bi-database-fill"></i></span>
          <div class="crs-prevwrap"><div class="crs-prev" data-a="free"><img class="th" src="${esc(c.thumb || '')}" alt="" onerror="this.remove()">
            <span class="crs-ribbon"><i class="bi bi-gift-fill"></i> ${freeN} Free Lessons</span>
            <span class="crs-play"><i class="bi bi-play-fill"></i></span>
            <span class="crs-logo-badge">${logo()}${esc(C.instructor.name)}</span></div></div></div></section>
      <section class="glass crs-sec crs-learnbox"><h3><span class="crs-hi"><i class="bi bi-lightbulb-fill"></i></span> What You'll Learn <small>${lr.length} skills</small></h3>
        <div class="crs-lgrid">${lr.map(x => `<div class="crs-lc" style="--c:${esc(x.c)};--ca:${esc(x.c)}40"><span class="crs-li"><i class="bi ${esc(x.i)}"></i></span><div><b>${esc(x.t)}</b>${x.d ? `<small>${esc(x.d)}</small>` : ''}</div></div>`).join('')}</div></section>
      <div class="crs-two"><div class="crs-col">
        <section class="glass crs-sec"><h3><span class="crs-hi"><i class="bi bi-award-fill"></i></span> This Course Includes</h3>
          <ul class="crs-inc gold">${[['bi-play-btn-fill', c.parts.length + ' HD video lessons'], ['bi-folder-fill', groups(c).length + ' structured modules'], ['bi-infinity', 'Lifetime access'], ['bi-phone-fill', 'Mobile aur computer dono par'], ['bi-graph-up-arrow', 'Progress tracking'], ['bi-code-square', 'Practical projects ke saath']].map(r => `<li><span class="crs-ii"><i class="bi ${r[0]}"></i></span>${esc(r[1])}</li>`).join('')}</ul></section>
        <section class="glass crs-sec"><h3><span class="crs-hi"><i class="bi bi-people-fill"></i></span> Who Is This For?</h3>
          <ul class="crs-inc">${[['bi-check2-circle', 'Koi coding experience zaroori nahi'], ['bi-emoji-smile-fill', 'Beginners jo zero se shuru karna chahte hain'], ['bi-mortarboard-fill', 'Students jo job ya freelancing chahte hain'], ['bi-brush-fill', 'Designers jo developer banna chahte hain']].map(r => `<li><span class="crs-ii"><i class="bi ${r[0]}"></i></span>${esc(r[1])}</li>`).join('')}</ul></section></div>
        <section class="glass crs-sec crs-curr"><div class="crs-curr-in"><h3><span class="crs-hi"><i class="bi bi-list-check"></i></span> Course Content <small>${c.parts.length} lessons · ${groups(c).length} modules</small></h3>${groups(c).length > 1 ? TIP : ''}
          <div class="crs-acc">${groups(c).map((g, gi) => `<div class="crs-am ${gi === 0 ? 'open' : ''}"><button class="crs-ah"><span class="crs-ai">${gi + 1}</span><b>${esc(mn(g.name))}</b><small>${g.idx.length} lessons</small><i class="bi bi-chevron-down"></i></button>
            <div class="crs-ab"><div class="crs-abi">${g.idx.map(i => { const p = c.parts[i]; return `<button class="crs-row" data-i="${i}"><span class="crs-num">${i + 1}</span><span class="crs-pt">${esc(p.title)}<small>${esc(p.duration || '')}</small></span>
              ${p.free ? '<span class="crs-free">Free</span>' : un ? '<i class="bi bi-unlock-fill" style="color:#4ade80"></i>' : '<i class="bi bi-lock-fill" style="color:#ffd36b"></i>'}</button>`; }).join('')}</div></div></div>`).join('')}</div></div></section></div></div>`;
    }).join('') + `<section class="glass crs-inst"><span class="crs-av">${logo()}</span><div><em><i class="bi bi-patch-check-fill"></i> Your Instructor</em><b>${esc(C.instructor.name)}</b><span>${esc(C.instructor.role)}</span></div>
      ${C.instructor.links.map(l => `<a href="${esc(l[1])}" target="_blank" rel="noopener"><i class="bi ${l[0]}"></i></a>`).join('')}</section>`;
    root.querySelectorAll('.crs-course').forEach(el => {
      const c = C.courses.find(x => x.id === el.dataset.id);
      el.querySelectorAll('[data-a="free"]').forEach(b => b.onclick = () => { store.set('crs_last_' + c.id, 0); openCourse(c.id); });
      const rb = $('[data-a="resume"]', el); if (rb) rb.onclick = () => openCourse(c.id);
      $('[data-a="main"]', el).onclick = () => store.get('crs_key_' + c.id, null) ? openCourse(c.id) : unlockModal(c, () => openCourse(c.id));
      el.querySelectorAll('.crs-row').forEach(b => b.onclick = () => { store.set('crs_last_' + c.id, +b.dataset.i); openCourse(c.id); });
      el.querySelectorAll('.crs-ah').forEach(h => h.onclick = () => h.parentNode.classList.toggle('open'));
      const ex = $('.crs-expall', el); if (ex) ex.onclick = () => expAll($('.crs-acc', el), ex);
    });
    if (scroll === true) toTop();
  }

  /* ── player ── */
  async function openCourse(id) {
    const c = C.courses.find(x => x.id === id); if (!c) return;
    teardown();
    c.urls = null;
    const saved = store.get('crs_key_' + id, null);
    if (saved) { try { c.urls = await fetchAccess(c, saved); if (!c.urls) store.del('crs_key_' + id); } catch (e) {} }
    let cur = Math.min(store.get('crs_last_' + id, 0), c.parts.length - 1), yt = null, tk = 0;
    root.innerHTML = `<div class="glass crs-hd"><button class="crs-back"><i class="bi bi-arrow-left"></i> Back</button>${logo()}
        <div class="crs-hd-t"><b>${esc(c.title)}</b><span class="crs-prog"></span><div class="crs-bar"><i></i></div></div></div>
      <div class="crs-player"><div>
        <div class="crs-video-wrap"><video controls playsinline preload="metadata" controlsList="nodownload nofullscreen" disablePictureInPicture></video>
          <div class="crs-ytwrap"><div id="crs-ytp"></div></div><div class="crs-shield"></div>
          <button class="crs-fs" aria-label="Fullscreen"><i class="bi bi-arrows-fullscreen"></i></button>
          <div class="crs-black"><i class="bi bi-eye-slash-fill"></i><b></b></div><div class="crs-overlay"></div></div>
        <div class="glass crs-info"><div class="crs-chips"></div><h2></h2><p></p>
          <div class="crs-nav"><button data-d="-1"><i class="bi bi-skip-backward-fill"></i> Previous</button>
            <button data-d="1">Next <i class="bi bi-skip-forward-fill"></i></button></div></div></div>
        <aside class="glass crs-list"><div class="crs-list-in"><div class="crs-list-head">Course Content<small>${c.parts.length} lessons</small></div>
          <div class="crs-search"><i class="bi bi-search"></i><input type="search" placeholder="Lesson dhoondein…" autocomplete="off"></div><div class="crs-tipbox"></div>
          <div class="crs-parts"></div></div></aside></div>`;
    const wrap = $('.crs-video-wrap', root), v = $('video', root), ov = $('.crs-overlay', root), yw = $('.crs-ytwrap', root);
    /* ── fullscreen, YouTube jaisa ──────────────────────────────────────────────
       Phone par: native fullscreen + landscape lock → video khud rotate ho jati hai.
       Lock na chale (iPhone / kuch browsers) to pseudo-fullscreen + CSS rotate.
       (Native fullscreen ke andar CSS transform browser allow nahi karta, isliye
        lock fail ho to native se bahar aa kar pseudo mode use hota hai.)          */
    const fsBtn = $('.crs-fs', root), html = document.documentElement, reqFS = wrap.requestFullscreen || wrap.webkitRequestFullscreen;
    const isFS = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
    const canLock = !!(screen.orientation && screen.orientation.lock);
    const touchDev = matchMedia('(pointer:coarse)').matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const portrait = () => window.innerHeight > window.innerWidth;
    const ac = new AbortController(), sg = { signal: ac.signal };
    let fsOn = false, switching = false, pushed = false;
    const fsIcon = on => { fsBtn.innerHTML = on ? '<i class="bi bi-fullscreen-exit"></i>' : '<i class="bi bi-arrows-fullscreen"></i>'; fsBtn.setAttribute('aria-label', on ? 'Exit fullscreen' : 'Fullscreen'); };
    function fit() {
      wrap.style.setProperty('--vw', window.innerWidth + 'px'); wrap.style.setProperty('--vh', window.innerHeight + 'px');
      wrap.classList.toggle('crs-rot', fsOn && touchDev && wrap.classList.contains('crs-pfs') && portrait());
    }
    function pseudoFS() {
      wrap.classList.add('crs-pfs', 'crs-fsin'); html.classList.add('crs-noscroll');
      try { history.pushState({ crsFS: 1 }, ''); pushed = true; } catch (e) {}
    }
    async function enterFS() {
      if (fsOn) return;
      fsOn = true; switching = true;
      let native = false;
      if (reqFS && !(touchDev && portrait() && !canLock)) {
        try { await reqFS.call(wrap); } catch (e) {}
        native = isFS();
        if (native && touchDev && portrait()) {
          try { await screen.orientation.lock('landscape'); }
          catch (e) { try { await (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (x) {} native = false; }
        }
      }
      if (!native) pseudoFS();
      switching = false; fsIcon(true); fit();
    }
    function exitFS() {
      if (!fsOn) return;
      fsOn = false;
      try { if (isFS()) { const p = (document.exitFullscreen || document.webkitExitFullscreen).call(document); p && p.catch && p.catch(() => {}); } } catch (e) {}
      try { screen.orientation && screen.orientation.unlock && screen.orientation.unlock(); } catch (e) {}
      wrap.classList.remove('crs-pfs', 'crs-rot', 'crs-fsin'); html.classList.remove('crs-noscroll'); fsIcon(false);
      if (pushed) { pushed = false; try { history.back(); } catch (e) {} }
    }
    const fsSync = () => {
      if (!wrap.isConnected) return exitFS();
      if (switching) return;
      if (fsOn && !isFS() && !wrap.classList.contains('crs-pfs')) return exitFS();   // Esc / system back in native fullscreen
      fit();
    };
    fsBtn.onclick = () => fsOn ? exitFS() : enterFS();
    ['fullscreenchange', 'webkitfullscreenchange'].forEach(ev => document.addEventListener(ev, fsSync, sg));
    window.addEventListener('resize', fsSync, sg);
    window.addEventListener('orientationchange', () => setTimeout(fsSync, 250), sg);
    window.addEventListener('popstate', () => { if (fsOn && pushed) { pushed = false; exitFS(); } }, sg);   // phone ka back button
    wrap.addEventListener('animationend', e => { if (e.target === wrap) wrap.classList.remove('crs-fsin'); }, sg);
    document.addEventListener('keydown', e => {
      if (!wrap.isConnected || /INPUT|TEXTAREA/.test((e.target || {}).tagName || '')) return;
      if (e.key === 'Escape' && fsOn && wrap.classList.contains('crs-pfs')) exitFS();
      else if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey) fsBtn.click();
    }, sg);
    teardown = () => { exitFS(); ac.abort(); };
    v.addEventListener('contextmenu', e => e.preventDefault());
    $('.crs-back', root).onclick = () => renderGrid(true);
    startWM(wrap);
    pauseAll = () => { try { v.pause(); yt && yt.pauseVideo && yt.pauseVideo(); } catch (e) {} };

    const locked = i => !c.parts[i].free && !c.urls;
    const srcOf = i => { const p = c.parts[i]; return p.free ? (p.yt || p.src) : (c.urls || {})['p' + (i + 1)]; };
    const G = groups(c), openG = new Set([G.findIndex(g => g.idx.includes(cur))]), sin = $('.crs-search input', root);
    if (G.length > 1) $('.crs-tipbox', root).innerHTML = TIP;
    sin.oninput = () => { const t = sin.value.trim().toLowerCase();
      root.querySelectorAll('.crs-parts .crs-am').forEach(am => { let any = false;
        am.querySelectorAll('.crs-part').forEach(b => { const m = !t || b.textContent.toLowerCase().includes(t); b.style.display = m ? '' : 'none'; any = any || m; });
        am.style.display = any ? '' : 'none'; am.classList.toggle('open', t ? any : (G.length === 1 || openG.has(+am.dataset.g))); }); };
    const reduceMo = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const toVideo = () => { const y = wrap.getBoundingClientRect().top + window.scrollY - 90; window.scrollTo({ top: Math.max(0, y), behavior: reduceMo ? 'auto' : 'smooth' }); };
    function list() {
      const d = done(c), pb = $('.crs-parts', root), prevTop = pb.scrollTop, had = pb.childElementCount > 0;
      const btn = i => { const p = c.parts[i]; return `<button class="crs-part ${i === cur ? 'active' : ''} ${d.includes(i) ? 'done' : ''} ${locked(i) ? 'locked' : ''}" data-i="${i}">
        <span class="crs-num">${d.includes(i) ? '<i class="bi bi-check-lg"></i>' : locked(i) ? '<i class="bi bi-lock-fill"></i>' : i + 1}</span>
        <span class="crs-pt">${esc(p.title)}<small>Lesson ${i + 1}${p.duration ? ' · ' + esc(p.duration) : ''}</small></span>
        ${p.free ? '<span class="crs-free">Free</span>' : ''}</button>`; };
      $('.crs-parts', root).innerHTML = G.map((g, gi) => `<div class="crs-am ${G.length === 1 || openG.has(gi) ? 'open' : ''}${g.idx.every(i => d.includes(i)) ? ' all' : ''}" data-g="${gi}">` +
        (G.length > 1 ? `<button class="crs-ah"><span class="crs-ai">${gi + 1}</span><b>${esc(mn(g.name))}</b><small>${g.idx.filter(i => d.includes(i)).length}/${g.idx.length}</small><i class="bi bi-chevron-down"></i></button>` : '') +
        `<div class="crs-ab"><div class="crs-abi">${g.idx.map(btn).join('')}</div></div></div>`).join('');
      if (had) pb.scrollTop = prevTop;                       // re-render par user ki scroll position na hile
      $('.crs-prog', root).textContent = `${d.length} of ${c.parts.length} lessons watched · ${Math.round(d.length / c.parts.length * 100)}%`;
      $('.crs-bar i', root).style.width = (d.length / c.parts.length * 100) + '%';
      const box = $('.crs-parts', root), a = $('.crs-part.active', root);
      if (a && box.scrollHeight > box.clientHeight + 4) {   // active lesson sirf tab center ho jab nazar se bahar ho (ya pehli baar)
        const br = box.getBoundingClientRect(), ar = a.getBoundingClientRect();
        if (!had || ar.top < br.top || ar.bottom > br.bottom) box.scrollTop += (ar.top - br.top) - (box.clientHeight - a.offsetHeight) / 2;
      }
      root.querySelectorAll('.crs-part').forEach(b => b.onclick = () => { play(+b.dataset.i); if (matchMedia('(max-width: 1000px)').matches) toVideo(); });   // phone par list video ke neeche hai → video par wapas le jao
      if (sin.value) sin.oninput();
      root.querySelectorAll('.crs-parts .crs-ah').forEach(h => h.onclick = () => { const am = h.parentNode, g = +am.dataset.g; am.classList.toggle('open') ? openG.add(g) : openG.delete(g); });
    }
    const msg = (icon, t, s) => { ov.innerHTML = `<i class="bi ${icon}"></i><b>${t}</b><span>${s}</span>`; ov.classList.add('show'); };
    function play(i) {
      cur = i; openG.add(G.findIndex(g => g.idx.includes(i))); store.set('crs_last_' + id, i); const my = ++tk, p = c.parts[i], s = srcOf(i), y = ytId(s);
      $('h2', root).textContent = `Lesson ${i + 1}: ${p.title}`;
      $('.crs-info p', root).textContent = c.desc;
      $('.crs-chips', root).innerHTML = `<span><i class="bi bi-collection-play"></i>Lesson ${i + 1} of ${c.parts.length}</span>${p.duration ? `<span><i class="bi bi-clock"></i>${esc(p.duration)}</span>` : ''}<span class="${p.free ? 'cf' : 'cp'}"><i class="bi ${p.free ? 'bi-gift' : 'bi-gem'}"></i>${p.free ? 'Free Preview' : 'Premium'}</span>`;
      root.querySelectorAll('.crs-nav button').forEach(b => b.disabled = !c.parts[i + +b.dataset.d]);
      ov.classList.remove('show'); pauseAll(); yw.style.display = 'none'; v.style.display = 'block';
      if (locked(i)) {
        v.removeAttribute('src'); v.load();
        ov.innerHTML = `${logo()}<b>Yeh lesson locked hai</b><span>Password dal kar poora course unlock karein.</span><button class="crs-btn primary"><i class="bi bi-key-fill"></i> Enter Password</button>`;
        $('.crs-btn', ov).onclick = () => unlockModal(c, () => openCourse(id)); ov.classList.add('show');
      } else if (!s) { v.removeAttribute('src'); msg('bi-hourglass-split', 'Video jald aa rahi hai', 'Is lesson ki video abhi add nahi hui.');
      } else if (y) {
        v.removeAttribute('src'); v.load(); v.style.display = 'none'; yw.style.display = 'block';
        loadYT().then(() => {
          if (my !== tk) return;
          if (yt && yt.loadVideoById) return yt.loadVideoById(y);
          yt = new YT.Player('crs-ytp', { host: 'https://www.youtube-nocookie.com', videoId: y,
            playerVars: { rel: 0, modestbranding: 1, playsinline: 1, iv_load_policy: 3, disablekb: 1, fs: 0, autoplay: 1 },
            events: { onStateChange: e => { if (e.data === 0) ended(); }, onError: () => msg('bi-exclamation-triangle-fill', 'Video load nahi hui', 'YouTube video private ya embed band hai. Unlisted rakhein.') } });
        }).catch(() => msg('bi-wifi-off', 'YouTube load nahi hua', 'Internet check karein.'));
      } else { v.src = s; v.load(); v.play().catch(() => {}); }
      list();
    }
    function ended() {
      const d = done(c); if (!d.includes(cur)) { d.push(cur); store.set('crs_done_' + id, d); }
      list(); if (c.parts[cur + 1]) play(cur + 1);
    }
    v.onerror = () => { if (!locked(cur) && srcOf(cur) && !ytId(srcOf(cur))) msg('bi-exclamation-triangle-fill', 'Video load nahi hui', 'Internet check karein ya dobara try karein.'); };
    v.onended = ended;
    root.querySelectorAll('.crs-nav button').forEach(b => b.onclick = () => play(cur + +b.dataset.d));
    const ex = $('.crs-expall', root.querySelector('.crs-list')); if (ex) ex.onclick = () => expAll($('.crs-parts', root), ex, openG);
    toTop();
    play(cur);
  }

  /* ── password modal ── */
  let tries = 0, lockUntil = 0;
  function unlockModal(c, onDone) {
    const m = document.createElement('div'); m.className = 'crs-modal show';
    const wa = 'https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(`Assalam o Alaikum! Mujhe "${c.title}" ka password chahiye.`);
    m.innerHTML = `<div class="glass crs-card"><button class="crs-x" aria-label="Close"><i class="bi bi-x-lg"></i></button>
      <div class="crs-ring">${logo()}</div><h4>Unlock Full Course</h4>
      <p class="crs-sub">${c.parts.filter(p => p.free).length} lessons free hain. Baqi lessons dekhne ke liye apna password dalein.</p>
      <div class="crs-field"><i class="bi bi-key-fill"></i><input class="pw" type="password" placeholder="Enter your password" autocomplete="off">
        <button class="crs-eye" type="button" aria-label="Show"><i class="bi bi-eye"></i></button></div>
      <div class="crs-msg"></div>
      <button class="crs-btn primary shine crs-go"><i class="bi bi-unlock-fill"></i> Unlock Now</button>
      <div class="crs-or">password nahi hai?</div>
      <a class="crs-btn ghost" href="${wa}" target="_blank" rel="noopener"><i class="bi bi-whatsapp"></i> Get Password on WhatsApp</a>
      <div class="crs-secure"><i class="bi bi-shield-check"></i>Secured with Firebase</div></div>`;
    document.body.appendChild(m);
    const close = () => m.remove(), msg = $('.crs-msg', m), inp = $('.pw', m);
    inp.focus();
    $('.crs-x', m).onclick = close; m.onclick = e => { if (e.target === m) close(); };
    async function unlock() {
      if (!inp.value.trim()) { msg.className = 'crs-msg err'; msg.textContent = 'Password likhein.'; return; }
      const wait = Math.ceil((lockUntil - Date.now()) / 1000);
      if (wait > 0) { msg.className = 'crs-msg err'; msg.textContent = `Bohat ghalat koshishein. ${wait}s baad try karein.`; return; }
      msg.className = 'crs-msg'; msg.textContent = 'Checking…';
      try {
        const h = await hash(c.id, inp.value), urls = await fetchAccess(c, h);
        if (urls) {
          store.set('crs_key_' + c.id, h);
          msg.className = 'crs-msg ok'; msg.textContent = '✓ Course unlock ho gaya!';
          setTimeout(() => { close(); onDone && onDone(); }, 600);
        } else { if (++tries >= 5) { lockUntil = Date.now() + 30000; tries = 0; } msg.className = 'crs-msg err'; msg.textContent = 'Password ghalat hai.'; }
      } catch (e) { msg.className = 'crs-msg err'; msg.textContent = 'Connection masla. Internet check karein (ya Firebase rules).'; }
    }
    $('.crs-go', m).onclick = unlock;
    $('.crs-eye', m).onclick = () => { const h = inp.type === 'password'; inp.type = h ? 'text' : 'password'; $('.crs-eye i', m).className = 'bi ' + (h ? 'bi-eye-slash' : 'bi-eye'); };
    m.onkeydown = e => { if (e.key === 'Enter') unlock(); else if (e.key === 'Escape') close(); };
  }

  renderGrid();
})();