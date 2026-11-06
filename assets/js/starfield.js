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

  /* Kundenwunsch 06.11. abends: Himmel auffälliger und realistischer.
     Mehr Sterne, leichte Farbtöne (blauweiß/warm wie echte Sterne),
     kräftigeres Funkeln und einige helle Sterne mit Lichtkreuz. */
  var LAYER_SPECS = [
    { depth: .35, density: .00026, size: [.5, 1.2], alpha: [.3, .65], drift: 5, cap: 420 },
    { depth: .65, density: .00016, size: [.8, 1.8], alpha: [.45, .85], drift: 10, cap: 300 },
    { depth: 1.0, density: .00008, size: [1.2, 2.6], alpha: [.6, 1], drift: 17, cap: 160 }
  ];
  var STAR_TINTS = ['#dfe6ff', '#dfe6ff', '#dfe6ff', '#ffffff', '#b9d0ff', '#cfe0ff', '#ffe6c2', '#ffd9a8'];
  var glints = [];          // helle Sterne mit Lichtkreuz

  function rand(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    layers = LAYER_SPECS.map(function (spec) {
      var count = Math.min(spec.cap, Math.round(W * H * spec.density));
      var stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * W, y: Math.random() * H,
          r: rand(spec.size[0], spec.size[1]),
          a: rand(spec.alpha[0], spec.alpha[1]),
          tw: Math.random() * Math.PI * 2,          // Twinkle-Phase
          tws: rand(.3, 1.6),                       // Twinkle-Speed
          twa: Math.random() < .3 ? .55 : .25,      // manche funkeln deutlich
          c: STAR_TINTS[Math.floor(Math.random() * STAR_TINTS.length)]
        });
      }
      return { spec: spec, stars: stars };
    });
    glints = [];
    var gc = Math.max(4, Math.min(12, Math.round(W * H / 160000)));
    for (var g = 0; g < gc; g++) {
      glints.push({ x: Math.random() * W, y: Math.random() * H, r: rand(1.4, 2.4), len: rand(7, 14),
        tw: Math.random() * 6.28, tws: rand(.25, .7), c: STAR_TINTS[Math.floor(Math.random() * 5)] });
    }
    if (reduced) drawStatic();
  }

  function drawStatic() {
    ctx.clearRect(0, 0, W, H);
    layers.forEach(function (layer) {
      layer.stars.forEach(function (s) {
        ctx.globalAlpha = s.a;
        ctx.fillStyle = s.c;
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
      ctx.strokeStyle = '#cfeaff';
      layer.stars.forEach(function (s) {
        s.x -= layer.spec.drift * d * dt;              // langsamer Grunddrift
        if (s.x < -4) { s.x = W + 4; s.y = Math.random() * H; }
        s.tw += s.tws * dt;
        var a = s.a * (1 - s.twa + s.twa * Math.sin(s.tw));
        ctx.fillStyle = s.c;
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

    // Helle Sterne mit Lichtkreuz, langsam pulsierend
    if (warp.power < .02) {
      glints.forEach(function (g) {
        g.x -= 3 * dt; if (g.x < -20) { g.x = W + 20; g.y = Math.random() * H; }
        g.tw += g.tws * dt;
        var k = .55 + .45 * Math.sin(g.tw);
        var x = g.x + pointer.x * 16, y = g.y + pointer.y * 11;
        ctx.globalAlpha = .85 * k + .15;
        var halo = ctx.createRadialGradient(x, y, 0, x, y, g.r * 4);
        halo.addColorStop(0, g.c); halo.addColorStop(1, 'rgba(160,190,255,0)');
        ctx.fillStyle = halo;
        ctx.beginPath(); ctx.arc(x, y, g.r * 4, 0, 6.2832); ctx.fill();
        ctx.globalAlpha = .55 * k;
        ctx.strokeStyle = g.c; ctx.lineWidth = .8;
        var L = g.len * (.6 + .4 * k);
        ctx.beginPath(); ctx.moveTo(x - L, y); ctx.lineTo(x + L, y); ctx.moveTo(x, y - L); ctx.lineTo(x, y + L); ctx.stroke();
      });
    }

    // Sternschnuppen
    if (!warp.power && Math.random() < dt / 9) spawnMeteor();
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

  /* ---------- Vorbeifliegende Schiffe ----------
     Kundenwunsch 06.11.: Der Dreier-Verband bleibt. Dazu fliegen Miniaturen
     der eigenen Ausstellungs- und Vermietmodelle (freigestellte Fotos, je
     10 bis 20 KB) als kleine, realistisch beleuchtete Schiffe: Triebwerks-
     glühen, leichte Schräglage, Tiefe über Größe, Helligkeit und Unschärfe.
     Geladen werden die Bilder erst kurz vor dem ersten Flug. */
  var MODELS = [
    { src: '/sotg-vorschau/assets/img/mini-falke.webp', w: 320, h: 226, size: [90, 150], dir: 1,
      engines: [{ x: .03, y: .47, s: .30 }] },
    { src: '/sotg-vorschau/assets/img/mini-snowspeeder.webp', w: 300, h: 131, size: [80, 130], dir: -1,
      engines: [{ x: .97, y: .5, s: .26 }] },
    { src: '/sotg-vorschau/assets/img/mini-naboo.webp', w: 260, h: 178, size: [70, 115], dir: -1,
      engines: [{ x: .97, y: .1, s: .16 }, { x: .97, y: .9, s: .16 }] }
  ];
  var FORMATION = '<svg viewBox="0 0 140 80" width="92" aria-hidden="true"><g fill="#93a0c0"><path d="M70 6l26 8-26 8-10-8z"/><path d="M40 34l26 8-26 8-10-8z"/><path d="M96 52l26 8-26 8-10-8z"/></g><g fill="#4de3ff"><circle cx="88" cy="14" r="2"/><circle cx="58" cy="42" r="2"/><circle cx="114" cy="60" r="2"/></g></svg>';
  var shipLayer = document.getElementById('shiplayer');
  if (!shipLayer && !reduced) {
    shipLayer = document.createElement('div');
    shipLayer.id = 'shiplayer';
    shipLayer.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(shipLayer, document.body.firstChild);
  }
  var shipTimer = 0, flights = 0, order = [];
  function nextModel() {
    if (!order.length) {
      order = [0, 1, 2, 'f'];
      for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = order[i]; order[i] = order[j]; order[j] = t; }
    }
    return order.shift();
  }

  /* Flughöhe mit möglichst viel freiem Himmel wählen: Bilder, Karten und
     Panels verdecken die Schiffe (sie liegen hinter dem Inhalt). */
  var COVER = 'img,picture,video,iframe,.card,.tile,.ti-card,.hud-panel,.btn,.hero,.hero__media,.site-header,.kenny-launcher,.sticky-cta';
  /* Liefert eine Höhe in vh mit genug freiem Himmel oder null (dann später nochmal versuchen) */
  function pickY(lo, hi) {
    var vw = window.innerWidth, vh = window.innerHeight, rects = [];
    document.querySelectorAll(COVER).forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw && r.width > 0) rects.push(r);
    });
    var best = [], bestFree = -1;
    for (var y = lo; y <= hi; y += 4) {
      var py = vh * y / 100, free = 0;
      for (var i = 0; i < 12; i++) {
        var px = vw * (i + .5) / 12, hit = false;
        for (var k = 0; k < rects.length && !hit; k++) {
          var r = rects[k];
          hit = px >= r.left && px <= r.right && py >= r.top - 30 && py <= r.bottom + 30;
        }
        if (!hit) free++;
      }
      if (free > bestFree) { bestFree = free; best = [y]; } else if (free === bestFree) best.push(y);
    }
    if (bestFree < 5) return null;
    return best[Math.floor(Math.random() * best.length)] + rand(-1, 1);
  }

  function flyFormation(y) {
    var host = document.createElement('div');
    host.innerHTML = FORMATION;
    var el = host.firstChild;
    var ltr = Math.random() < .5;
    var scale = rand(.55, .85), dur = rand(18, 26);
    el.style.top = y + 'vh';
    el.style[ltr ? 'left' : 'right'] = '-160px';
    shipLayer.appendChild(el);
    var flip = ltr ? '' : 'scaleX(-1) ';
    var dx = window.innerWidth + 340;
    var anim = el.animate([
      { transform: flip + 'translateX(0) scale(' + scale + ')', opacity: 0 },
      { opacity: .85, offset: .07 }, { opacity: .85, offset: .93 },
      { transform: flip + 'translateX(' + (ltr ? dx : -dx) + 'px) scale(' + scale + ')', opacity: 0 }
    ], { duration: dur * 1000, easing: 'linear' });
    anim.onfinish = function () { el.remove(); };
  }

  function flyModel(m, y0) {
    var depth = Math.random();                       // 0 = weit weg, 1 = nah
    var wpx = Math.round(m.size[0] + (m.size[1] - m.size[0]) * depth);
    if (window.innerWidth < 700) wpx = Math.round(wpx * .7);
    var hpx = Math.round(wpx * m.h / m.w);
    var el = document.createElement('div');
    el.className = 'mini-ship';
    el.style.width = wpx + 'px'; el.style.height = hpx + 'px';
    // Ferne Schiffe: dunkler, bläulicher, leicht unscharf (Tiefe)
    el.style.setProperty('--ms-b', (.55 + .35 * depth).toFixed(2));
    el.style.setProperty('--ms-blur', ((1 - depth) * .8).toFixed(2) + 'px');
    m.engines.forEach(function (e, i) {
      var g = document.createElement('span');
      g.className = 'mini-ship__engine';
      var gs = Math.round(wpx * e.s);
      g.style.width = gs + 'px'; g.style.height = gs + 'px';
      g.style.left = (e.x * 100) + '%'; g.style.top = (e.y * 100) + '%';
      g.style.animationDelay = (-i * .13) + 's';
      el.appendChild(g);
    });
    var img = document.createElement('img');
    img.src = m.src; img.alt = ''; img.decoding = 'async';
    img.width = wpx; img.height = hpx;
    el.appendChild(img);
    var ltr = m.dir === 1;
    var y1 = y0 + rand(-4, 4);                      // leicht steigend oder sinkend
    el.style.top = y0 + 'vh';
    el.style[ltr ? 'left' : 'right'] = -(wpx + 40) + 'px';
    shipLayer.appendChild(el);
    var dist = window.innerWidth + wpx * 2 + 80;
    var dyPx = (y1 - y0) / 100 * window.innerHeight;
    var bank = (dyPx > 0 ? 1 : -1) * rand(2, 5) * (ltr ? 1 : -1);
    var s0 = .86 + depth * .06, s1 = s0 + rand(.08, .18);   // kommt beim Vorbeiflug etwas näher
    var dur = (26 - depth * 10) * 1000;               // nahe Schiffe sind schneller
    var sign = ltr ? 1 : -1;
    var anim = el.animate([
      { transform: 'translate(0,0) rotate(0deg) scale(' + s0 + ')', opacity: 0 },
      { opacity: 1, offset: .08 },
      { transform: 'translate(' + (sign * dist * .5) + 'px,' + (dyPx * .5) + 'px) rotate(' + bank + 'deg) scale(' + ((s0 + s1) / 2) + ')', offset: .5 },
      { opacity: 1, offset: .92 },
      { transform: 'translate(' + (sign * dist) + 'px,' + dyPx + 'px) rotate(0deg) scale(' + s1 + ')', opacity: 0 }
    ], { duration: dur, easing: 'linear' });
    anim.onfinish = function () { el.remove(); };
  }

  function flyShip() {
    if (!shipLayer || document.hidden || warp.power > .02) { scheduleShip(); return; }
    var y = pickY(10, 74);
    if (y === null) { clearTimeout(shipTimer); shipTimer = setTimeout(flyShip, 4000); return; } // gerade kein freier Himmel
    var k = nextModel();
    if (k === 'f') flyFormation(y); else flyModel(MODELS[k], y);
    flights++;
    scheduleShip();
  }
  function scheduleShip() {
    clearTimeout(shipTimer);
    shipTimer = setTimeout(flyShip, flights ? rand(14000, 26000) : rand(5000, 9000));
  }
  if (shipLayer && !reduced && 'animate' in document.documentElement) {
    // Bilder vorab im Leerlauf laden, damit das erste Schiff nicht aufploppt
    setTimeout(function () { MODELS.forEach(function (m) { var i = new Image(); i.src = m.src; }); }, 2500);
    scheduleShip();
  }

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
  /* Test-Hilfe: SOTG.flyShip(0|1|2|'f') startet sofort einen Vorbeiflug */
  window.SOTG.flyShip = function (k, y) { if (!shipLayer) return; y = y == null ? (pickY(10, 74) || 40) : y; k === 'f' ? flyFormation(y) : flyModel(MODELS[k || 0], y); };

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
