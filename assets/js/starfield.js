/* Stars of the Galaxy — Sternenfeld, Sternschnuppen, kleine Schiffe im Hintergrund, Warp.
   Vanilla JS, GPU-schonend: Canvas-Repaints sind bewusst simpel gehalten,
   Schiffe laufen als WAAPI-Transforms. Respektiert prefers-reduced-motion. */
(function () {
  'use strict';

  /* nofx-Parameter erzwingt den Reduced-Motion-Pfad (Debug/A11y-Test) */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    /[?&]nofx/.test(window.location.search);
  var canvas = document.getElementById('starfield');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
  var layers = [];          // 3 Parallax-Ebenen
  var meteors = [];         // aktive Sternschnuppen
  var pointer = { x: 0, y: 0, tx: 0, ty: 0 }; // geglättete Maus-Parallaxe
  var running = false, rafId = 0;
  var warp = { active: false, power: 0, target: 0, done: null }; // 0..1 Streifenstärke

  var LAYER_SPECS = [
    { depth: .35, density: .00016, size: [.5, 1.1], alpha: [.25, .55], drift: 4 },
    { depth: .65, density: .00010, size: [.8, 1.6], alpha: [.35, .75], drift: 8 },
    { depth: 1.0, density: .00005, size: [1.1, 2.2], alpha: [.5, 1], drift: 13 }
  ];

  function rand(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    layers = LAYER_SPECS.map(function (spec) {
      var count = Math.min(240, Math.round(W * H * spec.density));
      var stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * W, y: Math.random() * H,
          r: rand(spec.size[0], spec.size[1]),
          a: rand(spec.alpha[0], spec.alpha[1]),
          tw: Math.random() * Math.PI * 2,          // Twinkle-Phase
          tws: rand(.3, 1.4)                        // Twinkle-Speed
        });
      }
      return { spec: spec, stars: stars };
    });
    if (reduced) drawStatic();
  }

  function drawStatic() {
    ctx.clearRect(0, 0, W, H);
    layers.forEach(function (layer) {
      layer.stars.forEach(function (s) {
        ctx.globalAlpha = s.a;
        ctx.fillStyle = '#dfe6ff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 6.2832);
        ctx.fill();
      });
    });
    ctx.globalAlpha = 1;
  }

  var last = 0;
  function frame(t) {
    if (!running) return;
    var dt = Math.min((t - last) / 1000, .05); last = t;

    // Maus-Parallaxe glätten
    pointer.x += (pointer.tx - pointer.x) * .04;
    pointer.y += (pointer.ty - pointer.y) * .04;

    // Warp-Stärke Richtung Ziel bewegen
    warp.power += (warp.target - warp.power) * (warp.target > warp.power ? .08 : .045);
    if (warp.done && warp.target > 0 && warp.power > .92) { var cb = warp.done; warp.done = null; cb(); }
    if (warp.target === 0 && warp.power < .01) warp.power = 0;

    ctx.clearRect(0, 0, W, H);
    var cx = W / 2, cy = H / 2;

    layers.forEach(function (layer) {
      var d = layer.spec.depth;
      var ox = pointer.x * 14 * d, oy = pointer.y * 10 * d;
      ctx.fillStyle = '#dfe6ff';
      ctx.strokeStyle = '#cfeaff';
      layer.stars.forEach(function (s) {
        s.x -= layer.spec.drift * d * dt;              // langsamer Grunddrift
        if (s.x < -4) { s.x = W + 4; s.y = Math.random() * H; }
        s.tw += s.tws * dt;
        var a = s.a * (.75 + .25 * Math.sin(s.tw));
        var x = s.x + ox, y = s.y + oy;
        if (warp.power > .02) {
          // Hyperraum: Sterne zu Streifen Richtung Zentrum ziehen
          var dx = x - cx, dy = y - cy;
          var len = warp.power * warp.power * 0.22 * d;
          ctx.globalAlpha = Math.min(1, a + warp.power * .4);
          ctx.lineWidth = s.r * (1 - warp.power * .4);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + dx * len, y + dy * len);
          ctx.stroke();
        } else {
          ctx.globalAlpha = a;
          ctx.beginPath();
          ctx.arc(x, y, s.r, 0, 6.2832);
          ctx.fill();
        }
      });
    });

    // Sternschnuppen
    if (!warp.power && Math.random() < dt / 14) spawnMeteor();
    for (var i = meteors.length - 1; i >= 0; i--) {
      var m = meteors[i];
      m.x += m.vx * dt; m.y += m.vy * dt; m.life -= dt;
      if (m.life <= 0 || m.x > W + 60 || m.y > H + 60) { meteors.splice(i, 1); continue; }
      var fade = Math.min(1, m.life / .5);
      ctx.globalAlpha = .8 * fade;
      var g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * .09, m.y - m.vy * .09);
      g.addColorStop(0, '#fff');
      g.addColorStop(1, 'rgba(140,200,255,0)');
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx * .09, m.y - m.vy * .09);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    rafId = requestAnimationFrame(frame);
  }

  function spawnMeteor() {
    var fromTop = Math.random() < .7;
    meteors.push({
      x: fromTop ? rand(W * .2, W) : -30,
      y: fromTop ? -30 : rand(0, H * .4),
      vx: rand(260, 480), vy: rand(140, 260),
      life: rand(.8, 1.4)
    });
  }

  function start() {
    if (running || reduced) return;
    running = true; last = performance.now();
    rafId = requestAnimationFrame(frame);
  }
  function stop() { running = false; cancelAnimationFrame(rafId); }

  /* ---------- Vorbeifliegende Schiffe (Kundenwunsch 06.11.2026) ----------
     Nur noch: der Dreier-Verband kleiner Aufklärer und kleine graue
     Silhouetten der eigenen Vermiet-Modelle (Speeder, Frachter).
     Erstes Schiff nach 20–40 s, Bilder nur ~3 KB, kein Einfluss auf den Seitenaufbau. */
  var SHIPS = [
    '<svg viewBox="0 0 140 80" width="92" aria-hidden="true"><g fill="#93a0c0"><path d="M70 6l26 8-26 8-10-8z"/><path d="M40 34l26 8-26 8-10-8z"/><path d="M96 52l26 8-26 8-10-8z"/></g><g fill="#4de3ff"><circle cx="88" cy="14" r="2"/><circle cx="58" cy="42" r="2"/><circle cx="114" cy="60" r="2"/></g></svg>',
    '<img src="/sotg-vorschau/assets/img/silhouette-speeder.webp" width="110" height="46" alt="" decoding="async">',
    '<img src="/sotg-vorschau/assets/img/silhouette-frachter.webp" width="96" height="68" alt="" decoding="async">'
  ];
  var shipLayer = document.getElementById('shiplayer');
  if (!shipLayer && !reduced) {
    shipLayer = document.createElement('div');
    shipLayer.id = 'shiplayer';
    shipLayer.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(shipLayer, document.body.firstChild);
  }
  var shipTimer = 0, shipIdx = Math.floor(Math.random() * SHIPS.length);

  function flyShip() {
    if (!shipLayer || document.hidden) { scheduleShip(); return; }
    var host = document.createElement('div');
    host.innerHTML = SHIPS[shipIdx++ % SHIPS.length];
    var el = host.firstChild;
    var isFormation = el.tagName.toLowerCase() === 'svg';
    var ltr = isFormation ? Math.random() < .5 : true;   // Silhouetten fliegen in Blickrichtung (nach rechts)
    var y = rand(8, 55);
    var scale = rand(.55, .85);
    var dur = rand(18, 26);
    el.style.top = y + 'vh';
    el.style[ltr ? 'left' : 'right'] = '-160px';
    shipLayer.appendChild(el);
    var flip = ltr ? '' : 'scaleX(-1) ';
    var dx = (window.innerWidth + 340) * (ltr ? 1 : -1);
    var peak = isFormation ? .85 : .5;
    var anim = el.animate([
      { transform: flip + 'translateX(0) scale(' + scale + ')', opacity: 0 },
      { opacity: peak, offset: .07 },
      { opacity: peak, offset: .93 },
      { transform: flip + 'translateX(' + (ltr ? dx : -dx) + 'px) scale(' + scale + ')', opacity: 0 }
    ], { duration: dur * 1000, easing: 'linear' });
    anim.onfinish = function () { el.remove(); };
    scheduleShip();
  }
  function scheduleShip() {
    clearTimeout(shipTimer);
    shipTimer = setTimeout(flyShip, rand(20000, 40000));
  }
  if (shipLayer && !reduced && 'animate' in document.documentElement) scheduleShip();

  /* ---------- Öffentliche API ---------- */
  window.SOTG = window.SOTG || {};
  window.SOTG.warpOut = function (cb) {  // Sprung IN den Hyperraum (Seitenwechsel)
    if (reduced || !running) { cb && cb(); return; }
    warp.target = 1; warp.done = cb || null;
  };
  window.SOTG.warpIn = function () {     // Ankunft: Streifen -> Sterne
    if (reduced || !running) return;
    warp.power = 1; warp.target = 0;
  };
  window.SOTG.starfieldPaused = function (p) { p ? stop() : start(); };

  /* ---------- Events ---------- */
  var lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    // Mobile Adressleiste ändert nur die Höhe — dann nicht alles neu würfeln
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    resize();
  }, { passive: true });
  if (!reduced) {
    window.addEventListener('pointermove', function (e) {
      pointer.tx = (e.clientX / window.innerWidth - .5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - .5) * 2;
    }, { passive: true });
    if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
      window.addEventListener('deviceorientation', function (e) {
        if (e.gamma == null) return;
        pointer.tx = Math.max(-1, Math.min(1, e.gamma / 30));
        pointer.ty = Math.max(-1, Math.min(1, (e.beta - 40) / 30));
      }, { passive: true });
    }
  }
  document.addEventListener('visibilitychange', function () {
    if (reduced) return;
    document.hidden ? stop() : start();
  });

  resize();
  if (!reduced) {
    start();
    // Hyperraum-Ankunft beim ersten Laden der Sitzung
    try {
      if (!sessionStorage.getItem('sotg-warped')) {
        sessionStorage.setItem('sotg-warped', '1');
        window.SOTG.warpIn();
      } else if (sessionStorage.getItem('sotg-transit')) {
        sessionStorage.removeItem('sotg-transit');
        window.SOTG.warpIn();
      }
    } catch (e) { /* Storage evtl. blockiert */ }
  }
})();
