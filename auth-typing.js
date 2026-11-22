/* ══════════════════════════════════════════════════════════════
   AUTH TYPING — chat sawal ek ek karke "type" hote hain
   avatar pop -> "typing…" dots -> bubble mein text type hota hai
   -> phir us step ke input slide ho kar aate hain -> agla sawal.
   Kisi bhi input par click/focus ho ya form submit ho to sab foran
   poora dikh jata hai. "Reduce motion" par animation nahi hoti.
   (Login/signup logic auth.js mein hai — yeh file usay nahi chhoti.)
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var form = document.querySelector('.auth-form');
  if (!form) return;
  var steps = Array.prototype.slice.call(form.querySelectorAll('.step'));
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!steps.length || reduce) return;

  var items = steps.map(function (step) {
    var bubble = step.querySelector('.chat-bubble');
    var row = step.querySelector('.chat-row');
    if (!bubble || !row) return null;
    var text = bubble.textContent.trim();
    bubble.innerHTML = '<span class="tw-ghost"></span><span class="tw-live" aria-hidden="true"></span>';
    bubble.firstChild.textContent = text;          // full text keeps the size + stays readable for screen readers
    var dots = document.createElement('div');
    dots.className = 'tw-dots';
    dots.setAttribute('aria-hidden', 'true');
    dots.innerHTML = '<i></i><i></i><i></i>';
    row.appendChild(dots);
    return { step: step, text: text, live: bubble.lastChild };
  }).filter(Boolean);

  form.classList.add('tw-on');

  var timers = [], done = false;
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

  function finish() {
    if (done) return;
    done = true;
    timers.forEach(clearTimeout);
    items.forEach(function (p) {
      p.step.classList.remove('tw-wait');
      p.step.classList.add('tw-started', 'tw-ready');
      p.live.textContent = p.text;
      p.live.classList.remove('tw-caret');
    });
    form.classList.add('tw-done');
  }

  function run(i) {
    if (done) return;
    if (i >= items.length) { form.classList.add('tw-done'); return; }
    var p = items[i];
    p.step.classList.add('tw-started', 'tw-wait');       // avatar pops, "typing…" dots
    later(function () {
      p.step.classList.remove('tw-wait');                // bubble opens, text types out
      p.live.classList.add('tw-caret');
      var n = 0;
      (function tick() {
        if (done) return;
        n++;
        p.live.textContent = p.text.slice(0, n);
        if (n < p.text.length) {
          later(tick, 9 + Math.random() * 9);
        } else {
          p.live.classList.remove('tw-caret');
          p.step.classList.add('tw-ready');              // this step's inputs slide in
          later(function () { run(i + 1); }, 260);
        }
      })();
    }, 550);
  }

  form.addEventListener('focusin', finish);
  form.addEventListener('pointerdown', finish);
  form.addEventListener('submit', finish);
  later(function () { run(0); }, 200);
})();