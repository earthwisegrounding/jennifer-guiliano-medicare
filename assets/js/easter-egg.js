/* =========================================================================
   PRIVATE GAG — NOT FOR THE REAL SITE.
   Press and hold either "p" in "Medicare Supplement" (home page) for 10 seconds.
   To remove it completely, delete:
     1. this file
     2. assets/media/milkshake.mp4
     3. the <script src="./assets/js/easter-egg.js"> tag in index.html
     4. the <span class="egg"> wrapper around "pp" in index.html
   ========================================================================= */
(function () {
  "use strict";

  var trigger = document.querySelector(".egg");
  if (!trigger) return;

  var HOLD_MS = 10000;
  var VIDEO_SRC = "./assets/media/milkshake.mp4";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- styles (kept in here so the gag is one file) ---------- */
  var css = [
    ".egg{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;touch-action:none;position:relative;cursor:text}",
    ".egg.egg-shake{animation:egg-shake .1s infinite}",
    "@keyframes egg-shake{0%{left:0;top:0}25%{left:calc(var(--q,1)*1px);top:calc(var(--q,1)*-1px)}50%{left:calc(var(--q,1)*-1px);top:calc(var(--q,1)*1px)}75%{left:calc(var(--q,1)*1px);top:0}100%{left:0;top:0}}",
    ".egg-stage{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:radial-gradient(circle at 50% 50%,rgba(30,14,40,.92) 0%,rgba(0,0,0,.985) 70%);opacity:0;transition:opacity .6s ease}",
    ".egg-stage.on{opacity:1}",
    ".egg-stage canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}",
    ".egg-stage canvas.back{z-index:1}.egg-stage canvas.front{z-index:3}",
    ".egg-spot{position:absolute;z-index:0;width:min(120vmin,1100px);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,rgba(240,180,60,.45) 0%,rgba(240,180,60,0) 60%);animation:egg-pulse 1.2s ease-in-out infinite alternate}",
    "@keyframes egg-pulse{from{transform:scale(.9)}to{transform:scale(1.08)}}",
    ".egg-frame{position:relative;z-index:2;width:min(78vmin,620px);aspect-ratio:1;border-radius:28px;overflow:hidden;box-shadow:0 0 0 6px #f0b43c,0 0 60px 10px rgba(240,180,60,.55),0 40px 80px rgba(0,0,0,.6);transform:scale(.2) rotate(-12deg);opacity:0;transition:transform .7s cubic-bezier(.2,1.6,.4,1),opacity .4s ease}",
    ".egg-stage.on .egg-frame{transform:scale(1) rotate(0);opacity:1}",
    ".egg-frame video{display:block;width:100%;height:100%;object-fit:cover;background:#000}",
    ".egg-close{position:absolute;z-index:4;top:18px;right:18px;min-width:56px;min-height:56px;border-radius:999px;border:2px solid rgba(255,255,255,.8);background:rgba(0,0,0,.4);color:#fff;font:700 1.05rem/1 system-ui,sans-serif;padding:0 20px;cursor:pointer}",
    ".egg-sound{position:absolute;z-index:4;bottom:28px;left:50%;transform:translateX(-50%);min-height:56px;border-radius:999px;border:0;background:#f0b43c;color:#0f2e2a;font:700 1.1rem/1 system-ui,sans-serif;padding:0 26px;cursor:pointer}"
  ].join("\n");
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  /* ---------- press-and-hold detection ---------- */
  var holdTimer = null, rampTimer = null, startedAt = 0, primed = null, running = false;

  function prime() {
    // Create and "unlock" the video inside the user's gesture so it can play with sound later.
    if (primed) return;
    primed = document.createElement("video");
    primed.src = VIDEO_SRC;
    primed.preload = "auto";
    primed.playsInline = true;
    primed.volume = 0; // silent unlock; volume is restored when the show starts
    var p = primed.play();
    if (p && p.then) p.then(function () { primed.pause(); primed.currentTime = 0; }).catch(function () {});
    else { primed.pause(); }
  }

  function ramp() {
    // From 4s on, the letters start to tremble, getting stronger as 10s approaches.
    var t = Date.now() - startedAt;
    if (t > 4000 && !reduceMotion) {
      trigger.classList.add("egg-shake");
      trigger.style.setProperty("--q", (1 + (t - 4000) / 1500).toFixed(2));
    }
  }

  function start(e) {
    if (running) return;
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    try { trigger.setPointerCapture(e.pointerId); } catch (err) {}
    prime();
    startedAt = Date.now();
    rampTimer = setInterval(ramp, 100);
    holdTimer = setTimeout(function () { cancel(); launch(); }, HOLD_MS);
  }

  function cancel() {
    clearTimeout(holdTimer); clearInterval(rampTimer);
    holdTimer = rampTimer = null;
    trigger.classList.remove("egg-shake");
    trigger.style.removeProperty("--q");
  }

  trigger.addEventListener("pointerdown", start);
  ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (ev) {
    trigger.addEventListener(ev, function () { if (holdTimer) cancel(); });
  });
  trigger.addEventListener("contextmenu", function (e) { e.preventDefault(); });

  /* ---------- confetti ---------- */
  var COLORS = ["#f0b43c", "#a8431e", "#1f5a4e", "#f7dccd", "#ffffff", "#e8943a", "#dde8df", "#ff4f81", "#4fc3ff"];

  function Confetti(canvas) {
    var ctx = canvas.getContext("2d"), parts = [], raf = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    function size() { canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); window.addEventListener("resize", size);
    function add(x, y, n, spread, power, angle) {
      for (var i = 0; i < n; i++) {
        var a = (angle !== undefined ? angle : Math.random() * Math.PI * 2) + (Math.random() - .5) * spread;
        var v = power * (.45 + Math.random() * .75);
        parts.push({
          x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
          w: 6 + Math.random() * 8, h: 4 + Math.random() * 6,
          r: Math.random() * Math.PI, vr: (Math.random() - .5) * .35,
          c: COLORS[(Math.random() * COLORS.length) | 0], life: 0, max: 160 + Math.random() * 120,
          round: Math.random() < .25
        });
      }
      if (!raf) raf = requestAnimationFrame(tick);
    }
    function tick() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i];
        p.vx *= .985; p.vy = p.vy * .985 + .22; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++;
        if (p.life > p.max || p.y > innerHeight + 40) { parts.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = Math.min(1, (p.max - p.life) / 40);
        ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.scale(1, Math.cos(p.life * .15));
        ctx.fillStyle = p.c;
        if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2.4, 0, Math.PI * 2); ctx.fill(); }
        else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      raf = parts.length ? requestAnimationFrame(tick) : 0;
    }
    return { add: add, stop: function () { parts = []; window.removeEventListener("resize", size); } };
  }

  /* ---------- the show ---------- */
  function launch() {
    running = true;
    var stage = document.createElement("div");
    stage.className = "egg-stage";
    stage.setAttribute("role", "dialog");
    stage.setAttribute("aria-modal", "true");
    stage.setAttribute("aria-label", "Surprise video");
    stage.innerHTML =
      '<div class="egg-spot" aria-hidden="true"></div>' +
      '<canvas class="back" aria-hidden="true"></canvas>' +
      '<div class="egg-frame"></div>' +
      '<canvas class="front" aria-hidden="true"></canvas>' +
      '<button class="egg-close" type="button">Close</button>';

    var video = primed || document.createElement("video");
    primed = null;
    video.src = video.src || VIDEO_SRC;
    video.playsInline = true;
    video.controls = false;
    video.currentTime = 0;
    stage.querySelector(".egg-frame").appendChild(video);
    document.body.appendChild(stage);
    var lastFocus = document.activeElement;
    var closeBtn = stage.querySelector(".egg-close");

    var back = Confetti(stage.querySelector("canvas.back"));
    var front = Confetti(stage.querySelector("canvas.front"));
    var timers = [];

    requestAnimationFrame(function () { stage.classList.add("on"); closeBtn.focus(); });

    function frameBox() { return stage.querySelector(".egg-frame").getBoundingClientRect(); }

    function burstFromBehind(n) {
      // Confetti fired from behind the video, spraying out past its edges.
      var b = frameBox(), cx = b.left + b.width / 2, cy = b.top + b.height / 2;
      back.add(cx, cy, n, Math.PI * 2, Math.max(b.width, b.height) / 26);
    }
    function burstFromEdges() {
      var b = frameBox();
      [[b.left, b.top, -2.36], [b.right, b.top, -.79], [b.left, b.bottom, 2.36], [b.right, b.bottom, .79]].forEach(function (c) {
        front.add(c[0], c[1], 30, .9, 16, c[2]);
      });
    }
    function cannons() {
      // Side cannons from the bottom corners of the screen.
      front.add(0, innerHeight, 70, .5, 26, -1.05);
      front.add(innerWidth, innerHeight, 70, .5, 26, -2.09);
    }

    if (!reduceMotion) {
      timers.push(setTimeout(function () { burstFromBehind(220); cannons(); }, 450));
      timers.push(setTimeout(burstFromEdges, 900));
      timers.push(setInterval(function () { burstFromBehind(45); }, 700));
      timers.push(setTimeout(function () { cannons(); }, 2600));
    }

    function playIt() {
      video.muted = false;
      video.volume = 1;
      var p = video.play();
      if (p && p.catch) p.catch(function () {
        // Browser blocked sound: play muted and offer a button for sound.
        video.muted = true; video.play();
        var btn = document.createElement("button");
        btn.className = "egg-sound"; btn.type = "button"; btn.textContent = "Tap for sound 🔊";
        btn.addEventListener("click", function () { video.muted = false; video.currentTime = 0; video.play(); btn.remove(); });
        stage.appendChild(btn);
      });
    }
    timers.push(setTimeout(playIt, 500));

    video.addEventListener("ended", function () {
      if (!reduceMotion) { burstFromBehind(260); burstFromEdges(); cannons(); }
      timers.push(setTimeout(close, 2600));
    });

    function close() {
      timers.forEach(function (t) { clearTimeout(t); clearInterval(t); });
      stage.classList.remove("on");
      document.removeEventListener("keydown", onKey);
      setTimeout(function () {
        video.pause(); back.stop(); front.stop(); stage.remove(); running = false;
        if (lastFocus && lastFocus.focus) lastFocus.focus();
      }, 600);
    }
    function onKey(e) { if (e.key === "Escape") close(); if (e.key === "Tab") { e.preventDefault(); closeBtn.focus(); } }
    document.addEventListener("keydown", onKey);
    closeBtn.addEventListener("click", close);
    stage.addEventListener("click", function (e) { if (e.target === stage) close(); });
  }
})();
