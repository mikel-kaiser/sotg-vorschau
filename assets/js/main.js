/* Stars of the Galaxy — globale Interaktionen.
   Erwartet: gsap + ScrollTrigger (lokal, defer davor geladen), starfield.js. */
(function () {
  'use strict';
  /* nofx-Parameter erzwingt den Reduced-Motion-Pfad (Debug/A11y-Test) */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    /[?&]nofx/.test(window.location.search);
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');
  window.SOTG = window.SOTG || {};

  /* ================= Sprache =================
     Seitensprache aus <html lang>. Alle UI-Texte aus JS stehen hier. */
  var LANG = (document.documentElement.lang || 'de').slice(0, 2).toLowerCase();
  if (!/^(de|en|nl|fr)$/.test(LANG)) LANG = 'de';
  var LOCALE = { de: 'de-DE', en: 'en-GB', nl: 'nl-NL', fr: 'fr-FR' }[LANG];
  var T = {
    de: {
      days: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'], tomorrow: 'morgen',
      t: function (h) { return h + '\u00a0Uhr'; },
      openNow: function (c, hol) { return hol ? hol + ' · heute geöffnet bis ' + c : 'Jetzt geöffnet · heute bis ' + c; },
      opensToday: function (o, hol) { return hol ? hol + ' · heute ab ' + o + ' geöffnet' : 'Heute ab ' + o + ' geöffnet'; },
      closedOpens: function (d, o) { return 'Geschlossen · öffnet ' + d + ' um ' + o; },
      pause: function (g, d) { return g + ' · wieder geöffnet ab ' + d; },
      closed: 'Aktuell geschlossen',
      sending: 'Übertragung läuft …', send: 'Übertragung senden',
      sentOk: '<strong>&gt;&gt; Übertragung gesendet_</strong>Deine Nachricht hat unsere Basis erreicht. Wir funken zurück, meist innerhalb von 1–2 Tagen.',
      sentFail: '<strong>&gt;&gt; Übertragung gestört_</strong>Das hat leider nicht geklappt. Schreib uns direkt an <a href="mailto:info@starsofthegalaxy.de">info@starsofthegalaxy.de</a>.'
    },
    en: {
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], tomorrow: 'tomorrow',
      t: function (h) { return h + ':00'; },
      openNow: function (c, hol) { return hol ? hol + ' · open today until ' + c : 'Open now · until ' + c + ' today'; },
      opensToday: function (o, hol) { return hol ? hol + ' · open today from ' + o : 'Opens today at ' + o; },
      closedOpens: function (d, o) { return 'Closed · opens ' + d + ' at ' + o; },
      pause: function (g, d) { return g + ' · open again from ' + d; },
      closed: 'Currently closed',
      sending: 'Transmitting …', send: 'Send transmission',
      sentOk: '<strong>&gt;&gt; Transmission received_</strong>Your message has reached our base. We’ll radio back, usually within 1–2 days.',
      sentFail: '<strong>&gt;&gt; Transmission jammed_</strong>Sorry, that didn’t work. Please email us directly at <a href="mailto:info@starsofthegalaxy.de">info@starsofthegalaxy.de</a>.'
    },
    nl: {
      days: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'], tomorrow: 'morgen',
      t: function (h) { return h + '.00\u00a0uur'; },
      openNow: function (c, hol) { return hol ? hol + ' · vandaag geopend tot ' + c : 'Nu geopend · vandaag tot ' + c; },
      opensToday: function (o, hol) { return hol ? hol + ' · vandaag geopend vanaf ' + o : 'Vandaag geopend vanaf ' + o; },
      closedOpens: function (d, o) { return 'Gesloten · opent ' + d + ' om ' + o; },
      pause: function (g, d) { return g + ' · weer geopend vanaf ' + d; },
      closed: 'Momenteel gesloten',
      sending: 'Bezig met verzenden …', send: 'Bericht verzenden',
      sentOk: '<strong>&gt;&gt; Bericht ontvangen_</strong>Je bericht heeft onze basis bereikt. We seinen terug, meestal binnen 1–2 dagen.',
      sentFail: '<strong>&gt;&gt; Verbinding verstoord_</strong>Dat is helaas niet gelukt. Mail ons direct via <a href="mailto:info@starsofthegalaxy.de">info@starsofthegalaxy.de</a>.'
    },
    fr: {
      days: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'], tomorrow: 'demain',
      t: function (h) { return h + '\u00a0h'; },
      openNow: function (c, hol) { return hol ? hol + ' · ouvert aujourd’hui jusqu’à\u00a0' + c : 'Ouvert · aujourd’hui jusqu’à\u00a0' + c; },
      opensToday: function (o, hol) { return hol ? hol + ' · ouvert aujourd’hui à partir de\u00a0' + o : 'Ouvre aujourd’hui à\u00a0' + o; },
      closedOpens: function (d, o) { return 'Fermé · ouvre ' + d + ' à\u00a0' + o; },
      pause: function (g, d) { return g + ' · réouverture le ' + d; },
      closed: 'Actuellement fermé',
      sending: 'Transmission en cours …', send: 'Envoyer le message',
      sentOk: '<strong>&gt;&gt; Message reçu_</strong>Votre message est bien arrivé à la base. Nous vous répondons, en général sous 1 à 2 jours.',
      sentFail: '<strong>&gt;&gt; Transmission perturbée_</strong>Désolés, cela n’a pas fonctionné. Écrivez-nous directement à <a href="mailto:info@starsofthegalaxy.de">info@starsofthegalaxy.de</a>.'
    }
  }[LANG];
  window.SOTG.lang = LANG;

  /* ================= Öffnungszeiten =================
     Immer Do/Fr 12–18, Sa 10–18, So 12–17, auch an Feiertagen.
     Feiertage von Mo bis Mi: ebenfalls geöffnet, 12–17 Uhr (Thomas, 13.11.2026).
     Immer geschlossen: 24.–26.12. und 31.12.
     Schließzeiten (z. B. Weihnachtspause) und Extra-Tage pflegt der Betreiber
     in /assets/js/news-config.js (window.SOTG_SONDERZEITEN). */
  var HOURS = { 0: [12, 17], 4: [12, 18], 5: [12, 18], 6: [10, 18] };
  var HOLIDAY_HOURS = [12, 17];
  var DAY_SHORT = T.days;
  var HOL_NAMES = {
    neujahr: ['Neujahr', 'New Year’s Day', 'Nieuwjaarsdag', 'Jour de l’An'],
    karfreitag: ['Karfreitag', 'Good Friday', 'Goede Vrijdag', 'Vendredi saint'],
    ostersonntag: ['Ostersonntag', 'Easter Sunday', 'Eerste Paasdag', 'Dimanche de Pâques'],
    ostermontag: ['Ostermontag', 'Easter Monday', 'Tweede Paasdag', 'Lundi de Pâques'],
    arbeit: ['Tag der Arbeit', 'Labour Day', 'Dag van de Arbeid', 'Fête du Travail'],
    himmelfahrt: ['Christi Himmelfahrt', 'Ascension Day', 'Hemelvaartsdag', 'Ascension'],
    pfingstsonntag: ['Pfingstsonntag', 'Whit Sunday', 'Eerste Pinksterdag', 'Dimanche de Pentecôte'],
    pfingstmontag: ['Pfingstmontag', 'Whit Monday', 'Tweede Pinksterdag', 'Lundi de Pentecôte'],
    fronleichnam: ['Fronleichnam', 'Corpus Christi', 'Sacramentsdag', 'Fête-Dieu'],
    einheit: ['Tag der Deutschen Einheit', 'German Unity Day', 'Dag van de Duitse Eenheid', 'Fête de l’Unité allemande'],
    allerheiligen: ['Allerheiligen', 'All Saints’ Day', 'Allerheiligen', 'Toussaint'],
    weihnacht1: ['1. Weihnachtstag', 'Christmas Day', 'Eerste Kerstdag', 'Noël'],
    weihnacht2: ['2. Weihnachtstag', 'Boxing Day', 'Tweede Kerstdag', 'Lendemain de Noël']
  };
  var LI = { de: 0, en: 1, nl: 2, fr: 3 }[LANG];
  var CLOSED_MD = { '12-24': 1, '12-25': 1, '12-26': 1, '12-31': 1 }; // Weihnachten und Silvester

  function ymd(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function addDays(d, n) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); return x; }
  function easter(y) { // anonymer gregorianischer Algorithmus
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4,
      f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
      i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
      month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(y, month - 1, day);
  }
  var holCache = {};
  function holidays(y) { // gesetzliche Feiertage NRW
    if (holCache[y]) return holCache[y];
    var e = easter(y), map = {};
    map[y + '-01-01'] = 'neujahr'; map[y + '-05-01'] = 'arbeit'; map[y + '-10-03'] = 'einheit';
    map[y + '-11-01'] = 'allerheiligen'; map[y + '-12-25'] = 'weihnacht1'; map[y + '-12-26'] = 'weihnacht2';
    [[-2, 'karfreitag'], [0, 'ostersonntag'], [1, 'ostermontag'], [39, 'himmelfahrt'], [49, 'pfingstsonntag'],
      [50, 'pfingstmontag'], [60, 'fronleichnam']].forEach(function (o) { map[ymd(addDays(e, o[0]))] = o[1]; });
    holCache[y] = map; return map;
  }
  function sonder() { return window.SOTG_SONDERZEITEN || {}; }
  function text(v) { return (v && typeof v === 'object') ? (v[LANG] || v.de || '') : (v || ''); }
  function dayInfo(date) {
    var key = ymd(date), cfg = sonder(), i;
    var zu = cfg.geschlossen || [];
    for (i = 0; i < zu.length; i++) {
      if (zu[i].von && zu[i].bis && key >= zu[i].von && key <= zu[i].bis) return { hours: null, pause: zu[i] };
    }
    var holId = holidays(date.getFullYear())[key];
    var hours = HOURS[date.getDay()] || null;
    if (!hours && holId) hours = HOLIDAY_HOURS;
    if (CLOSED_MD[key.slice(5)]) hours = null;
    var extra = cfg.zusaetzlichGeoeffnet || [];
    for (i = 0; i < extra.length; i++) {
      if (extra[i].datum === key && extra[i].von && extra[i].bis) hours = [extra[i].von, extra[i].bis];
    }
    return { hours: hours, hol: holId ? HOL_NAMES[holId][LI] : '' };
  }
  function dateLabel(d) {
    try { return d.toLocaleDateString(LOCALE, { weekday: 'short', day: 'numeric', month: 'numeric' }); }
    catch (e) { return DAY_SHORT[d.getDay()] + ' ' + d.getDate() + '.' + (d.getMonth() + 1) + '.'; }
  }
  window.SOTG.dayInfo = dayInfo;

  /* Pure Function — testbar via SOTG.openStatus(new Date('2026-11-01T14:00')) */
  window.SOTG.openStatus = function (now) {
    now = now || new Date();
    var hour = now.getHours() + now.getMinutes() / 60;
    var today = dayInfo(now);
    var h = today.hours;
    if (h && hour >= h[0] && hour < h[1]) return { open: true, text: T.openNow(T.t(h[1]), today.hol) };
    if (h && hour < h[0]) return { open: false, text: T.opensToday(T.t(h[0]), today.hol) };
    for (var i = 1; i <= 60; i++) {
      var d = addDays(now, i), info = dayInfo(d);
      if (info.hours) {
        if (today.pause) return { open: false, text: T.pause(text(today.pause.grund), dateLabel(d)) };
        var label = i === 1 ? T.tomorrow : (i < 7 ? DAY_SHORT[d.getDay()] : dateLabel(d));
        return { open: false, text: T.closedOpens(label, T.t(info.hours[0])) };
      }
    }
    return { open: false, text: T.closed };
  };

  function paintStatus() {
    var s = window.SOTG.openStatus();
    document.querySelectorAll('[data-open-status]').forEach(function (el) {
      // Nur bei echter Änderung schreiben — sonst melden Screenreader
      // die Live-Region minütlich neu, obwohl nichts passiert ist.
      if (el.textContent !== s.text) el.textContent = s.text;
      el.classList.toggle('is-open', s.open);
      el.classList.toggle('is-closed', !s.open);
    });
    // Heutige Zeile in Öffnungszeiten-Tabellen markieren
    var d = new Date().getDay();
    document.querySelectorAll('[data-day]').forEach(function (row) {
      row.classList.toggle('is-today', Number(row.getAttribute('data-day')) === d);
    });
  }
  paintStatus();
  setInterval(paintStatus, 60000);

  /* ================= Header ================= */
  var header = document.querySelector('.site-header');
  var lastCompact = false;
  window.addEventListener('scroll', function () {
    var c = window.scrollY > 60;
    if (c !== lastCompact && header) { header.classList.toggle('is-compact', c); lastCompact = c; }
  }, { passive: true });

  var toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.site-nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ================= GSAP Scroll-Storytelling ================= */
  if (window.gsap && window.ScrollTrigger && !reduced) {
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('[data-reveal]').forEach(function (el, i) {
      gsap.to(el, {
        opacity: 1, y: 0, duration: .8, ease: 'power2.out',
        delay: (el.getAttribute('data-reveal-delay') || 0) * 1,
        scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        onComplete: function () { el.classList.add('revealed'); }
      });
    });

    document.querySelectorAll('.divider-beam').forEach(function (el) {
      gsap.to(el, {
        scaleX: 1, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });

    // Hochzählende Zahlen (im Zahlenformat der Seitensprache)
    var fmt = new Intl.NumberFormat(LOCALE);
    document.querySelectorAll('[data-count-to]').forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count-to'));
      var decimals = Number(el.getAttribute('data-decimals') || 0);
      var obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 1.8, ease: 'power1.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate: function () {
          el.textContent = decimals
            ? obj.v.toLocaleString(LOCALE, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
            : fmt.format(Math.round(obj.v));
        }
      });
    });

    // Sanfter Parallax für Hero-/Sektionerbilder
    document.querySelectorAll('.hero__media img, [data-parallax]').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: img.closest('section') || img, start: 'top bottom', end: 'bottom top', scrub: .6 }
      });
    });
  } else {
    // Ohne GSAP/mit reduced motion: alles sofort sichtbar, Zahlen final
    document.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('revealed'); });
    document.querySelectorAll('.divider-beam').forEach(function (el) { el.classList.add('beam-on'); });
    var fmt2 = new Intl.NumberFormat(LOCALE);
    document.querySelectorAll('[data-count-to]').forEach(function (el) {
      var t = parseFloat(el.getAttribute('data-count-to'));
      var dec = Number(el.getAttribute('data-decimals') || 0);
      el.textContent = dec ? t.toLocaleString(LOCALE, { minimumFractionDigits: dec, maximumFractionDigits: dec }) : fmt2.format(t);
    });
  }

  /* ================= Warp-Seitenübergang ================= */
  function internalLink(a) {
    return a.origin === location.origin && !a.hash && a.target !== '_blank' &&
      !a.hasAttribute('download') && a.getAttribute('href') !== null;
  }
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented) return; // z. B. Galerie-Lightbox, Easter Egg
    if (reduced) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    var a = e.target.closest('a');
    if (!a || !internalLink(a) || a.closest('.gallery')) return;
    e.preventDefault();
    var href = a.href;
    document.body.classList.add('warping');
    try { sessionStorage.setItem('sotg-transit', '1'); } catch (err) {}
    var navigated = false;
    function go() { if (!navigated) { navigated = true; location.href = href; } }
    if (window.SOTG.warpOut) { window.SOTG.warpOut(go); }
    setTimeout(go, 420); // Fallback: nie träge wirken
  });
  // bfcache-Restore: Veil sicher entfernen
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) document.body.classList.remove('warping');
  });

  /* ================= Galerie-Lightbox ================= */
  var lb = document.getElementById('lightbox');
  if (lb && typeof lb.showModal === 'function') {
    var lbImg = lb.querySelector('img');
    var lbCap = lb.querySelector('figcaption');
    document.querySelectorAll('.gallery a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var img = a.querySelector('img');
        lbImg.src = a.getAttribute('href');
        lbImg.srcset = a.getAttribute('data-srcset') || '';
        lbImg.alt = img ? img.alt : '';
        if (lbCap) lbCap.textContent = img ? img.alt : '';
        lb.showModal();
      });
    });
    lb.addEventListener('click', function (e) {
      var r = lbImg.getBoundingClientRect();
      var inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside || e.target.classList.contains('lightbox__close')) lb.close();
    });
  }

  /* ================= Kontakt-Formular (Funkspruch) ================= */
  var form = document.querySelector('form[data-transmission]');
  if (form) {
    form.addEventListener('submit', function (e) {
      if (!window.fetch) return; // Fallback: normaler POST an contact.php
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = T.sending; }
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (data) { showTransmission(form, data.ok); if (data.ok) form.reset(); })
        .catch(function () { showTransmission(form, false); })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = btn.getAttribute('data-label') || T.send; }
        });
    });
  }
  function showTransmission(form, ok) {
    var old = form.parentNode.querySelector('.transmission');
    if (old) old.remove();
    var div = document.createElement('div');
    div.className = 'transmission' + (ok ? '' : ' is-error');
    div.setAttribute('data-typing', '');
    div.setAttribute('role', 'status');
    div.innerHTML = ok ? T.sentOk : T.sentFail;
    form.parentNode.insertBefore(div, form);
    div.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  }
  // Nach klassischem POST-Redirect (?sent=1)
  if (/[?&]sent=1/.test(location.search) && form) showTransmission(form, true);
  if (/[?&]sent=0/.test(location.search) && form) showTransmission(form, false);

  /* ================= Easter Egg: Droide ================= */
  var DROID_SVG = '<svg class="droid-run" viewBox="0 0 120 90" aria-hidden="true">' +
    '<line x1="78" y1="10" x2="86" y2="26" stroke="#4de3ff" stroke-width="2"/><circle cx="77" cy="8" r="3" fill="#4de3ff"/>' +
    '<rect x="30" y="24" width="62" height="34" rx="6" fill="#9aa7c4"/>' +
    '<rect x="36" y="30" width="18" height="10" rx="2" fill="#0a0e1f"/><circle cx="45" cy="35" r="3.4" fill="#ff8c1f"/>' +
    '<rect x="60" y="30" width="24" height="4" rx="2" fill="#5f6c8f"/><rect x="60" y="38" width="16" height="4" rx="2" fill="#5f6c8f"/>' +
    '<g class="wheel"><circle cx="46" cy="68" r="14" fill="#2a3350" stroke="#4de3ff" stroke-width="2"/><line x1="46" y1="56" x2="46" y2="80" stroke="#4de3ff" stroke-width="2"/><line x1="34" y1="68" x2="58" y2="68" stroke="#4de3ff" stroke-width="2"/></g>' +
    '<g class="wheel"><circle cx="82" cy="68" r="10" fill="#2a3350" stroke="#4de3ff" stroke-width="2"/><line x1="82" y1="59" x2="82" y2="77" stroke="#4de3ff" stroke-width="2"/><line x1="73" y1="68" x2="91" y2="68" stroke="#4de3ff" stroke-width="2"/></g></svg>';
  var droidBusy = false;
  function rollDroid() {
    if (droidBusy || reduced) return;
    droidBusy = true;
    var host = document.createElement('div');
    host.innerHTML = DROID_SVG;
    var el = host.firstChild;
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('rolling'); });
    setTimeout(function () { el.remove(); droidBusy = false; }, 5300);
  }
  var logoClicks = 0, logoTimer, logoLast = 0;
  var logo = document.querySelector('.site-header__logo');
  if (logo) logo.addEventListener('click', function (e) {
    var now = Date.now();
    /* Schnelles Mehrfachklicken (Easter-Egg-Versuch) navigiert nicht —
       ein einzelner Klick führt weiter normal zur Startseite */
    if (now - logoLast < 450) e.preventDefault();
    logoLast = now;
    logoClicks++;
    clearTimeout(logoTimer);
    logoTimer = setTimeout(function () { logoClicks = 0; }, 2500);
    if (logoClicks >= 5) { e.preventDefault(); logoClicks = 0; rollDroid(); }
  });
  var KONAMI = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65], kPos = 0;
  document.addEventListener('keydown', function (e) {
    kPos = (e.keyCode === KONAMI[kPos]) ? kPos + 1 : 0;
    if (kPos === KONAMI.length) { kPos = 0; rollDroid(); }
  });
})();

/* ================================================================
   Erweiterungen November 2026: News-Popup, Bewertungs-Laufband,
   Video-Facade (YouTube erst nach Klick).
   ================================================================ */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    /[?&]nofx/.test(window.location.search);
  var LANG = (window.SOTG && window.SOTG.lang) || 'de';
  var T = {
    de: { newsLabel: 'Aktuelle Hinweise', newsKicker: 'Funkspruch der Basis', newsTitle: 'Aktuelles',
          ok: 'Alles klar', close: 'Hinweis schließen', stars: ' von 5 Sternen', review: 'Google-Bewertung',
          pause: 'Wechsel anhalten', play: 'Wechsel fortsetzen', prev: 'Vorherige Bewertungen', next: 'Nächste Bewertungen', q: ['\u201E', '\u201C'] },
    en: { newsLabel: 'Latest news', newsKicker: 'Message from base', newsTitle: 'News',
          ok: 'Got it', close: 'Close message', stars: ' out of 5 stars', review: 'Google review',
          pause: 'Pause reviews', play: 'Resume reviews', prev: 'Previous reviews', next: 'Next reviews', q: ['\u201C', '\u201D'] },
    nl: { newsLabel: 'Actueel', newsKicker: 'Bericht van de basis', newsTitle: 'Actueel',
          ok: 'Begrepen', close: 'Melding sluiten', stars: ' van 5 sterren', review: 'Google-review',
          pause: 'Reviews pauzeren', play: 'Reviews hervatten', prev: 'Vorige reviews', next: 'Volgende reviews', q: ['\u201C', '\u201D'] },
    fr: { newsLabel: 'Actualités', newsKicker: 'Message de la base', newsTitle: 'Actualités',
          ok: 'Compris', close: 'Fermer le message', stars: ' sur 5 étoiles', review: 'avis Google',
          pause: 'Mettre les avis en pause', play: 'Reprendre les avis', prev: 'Avis précédents', next: 'Avis suivants', q: ['\u00AB\u202F', '\u202F\u00BB'] }
  }[LANG];

  /* ---------- News-Popup (Konfiguration: /assets/js/news-config.js) ---------- */
  var cfg = window.SOTG_NEWS;
  /* Übersetzung aus news-config.js (Felder en / nl) — fehlt sie, gilt der deutsche Text */
  var tx = (cfg && LANG !== 'de' && cfg[LANG] && cfg[LANG].text) ? cfg[LANG] : (cfg || {});
  if (cfg && cfg.aktiv && cfg.id && window.HTMLDialogElement) {
    var expired = cfg.gueltigBis && (new Date(cfg.gueltigBis + 'T23:59:59') < new Date());
    var seen = false;
    try { seen = !!sessionStorage.getItem('sotg-news-' + cfg.id); } catch (e) {}
    if (!expired && !seen) {
      var dlg = document.createElement('dialog');
      dlg.className = 'news-popup';
      dlg.setAttribute('aria-label', T.newsLabel);
      var inner = document.createElement('div');
      inner.className = 'news-popup__inner';
      var kicker = document.createElement('p');
      kicker.className = 'hud-label';
      kicker.textContent = T.newsKicker;
      var h = document.createElement('h2');
      h.textContent = tx.titel || T.newsTitle;
      var p = document.createElement('p');
      p.textContent = tx.text || '';
      if (tx === cfg && LANG !== 'de') { h.lang = 'de'; p.lang = 'de'; }
      var actions = document.createElement('div');
      actions.className = 'news-popup__actions';
      if (cfg.linkUrl && (tx.linkText || cfg.linkText)) {
        var a = document.createElement('a');
        a.className = 'btn btn--primary btn--sm';
        a.href = tx.linkUrl || cfg.linkUrl;
        a.textContent = tx.linkText || cfg.linkText;
        if (/^https?:\/\//.test(a.href) && a.href.indexOf(location.host) === -1) {
          a.target = '_blank'; a.rel = 'noopener';
        }
        a.setAttribute('data-event', 'news-popup-link');
        a.addEventListener('click', markSeen);
        actions.appendChild(a);
      }
      var ok = document.createElement('button');
      ok.className = 'btn btn--ghost btn--sm';
      ok.type = 'button';
      ok.textContent = T.ok;
      actions.appendChild(ok);
      var x = document.createElement('button');
      x.className = 'news-popup__close';
      x.type = 'button';
      x.setAttribute('aria-label', T.close);
      x.textContent = '×';
      inner.appendChild(kicker); inner.appendChild(h); inner.appendChild(p); inner.appendChild(actions);
      /* × zuerst im DOM — konsistente Tab-Reihenfolge (visuell oben rechts) */
      dlg.appendChild(x); dlg.appendChild(inner);
      document.body.appendChild(dlg);
      function markSeen() { try { sessionStorage.setItem('sotg-news-' + cfg.id, '1'); } catch (e) {} }
      function dismiss() { markSeen(); if (dlg.open) dlg.close(); }
      ok.addEventListener('click', dismiss);
      x.addEventListener('click', dismiss);
      dlg.addEventListener('cancel', markSeen);
      dlg.addEventListener('click', function (e) {
        var r = inner.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dismiss();
      });
      /* Einmal pro Sitzung: direkt beim Anzeigen als gesehen markieren,
         sonst öffnet das Modal auf jeder weiteren Seite erneut.
         Wartet das Cookie-Banner auf eine Entscheidung, kommt der
         Funkspruch erst danach — nie zwei Dialoge übereinander. */
      function showNews() {
        setTimeout(function () {
          /* Kenny (aus kenny.js) läuft einmal über den Funkspruch: Kundenwunsch 06.11. */
          if (window.SOTG && window.SOTG.kennySVG && !dlg.querySelector('.kenny-walk')) {
            var kw = document.createElement('span');
            kw.className = 'kenny-walk'; kw.setAttribute('aria-hidden', 'true');
            kw.innerHTML = window.SOTG.kennySVG;
            dlg.appendChild(kw);
          }
          try { dlg.showModal(); markSeen(); } catch (e) {}
        }, 1400);
      }
      if (window.SOTGConsentPending) {
        document.addEventListener('sotg:consent', showNews, { once: true });
      } else {
        showNews();
      }
    }
  }

  /* ---------- Bewertungen (liest /assets/data/reviews.json) ----------
     Kundenwunsch 06.11.: kein Laufband mehr. Es stehen immer mehrere Karten
     still (Desktop 4, Tablet 2, Handy 1) und wechseln alle 20 Sekunden.
     Große Knöpfe für zurück/Pause/weiter; Maus darüber oder Tastatur-Fokus
     hält den Wechsel an; bei reduzierter Bewegung kein Auto-Wechsel. */
  var band = document.querySelector('[data-reviews-band]');
  if (band && window.fetch) {
    fetch('/sotg-vorschau/assets/data/reviews.json', { credentials: 'omit' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        if (!data || !data.reviews || !data.reviews.length) return;
        var reviews = data.reviews;
        function card(rv) {
          var fig = document.createElement('figure');
          fig.className = 'ti-card';
          var stars = document.createElement('p');
          stars.className = 'ti-card__stars';
          stars.setAttribute('aria-label', (rv.rating || 5) + T.stars);
          stars.textContent = '★★★★★'.slice(0, Math.max(1, Math.min(5, rv.rating || 5)));
          var q = document.createElement('blockquote');
          q.style.margin = '0';
          q.lang = rv.lang || 'de';
          var t = document.createElement('p');
          t.className = 'ti-card__text';
          t.textContent = T.q[0] + rv.text + T.q[1];
          q.appendChild(t);
          var cap = document.createElement('figcaption');
          cap.className = 'ti-card__name';
          cap.textContent = rv.name + ', ' + T.review;
          fig.appendChild(stars); fig.appendChild(q); fig.appendChild(cap);
          return fig;
        }
        var stage = document.createElement('div');
        stage.className = 'rv-stage';
        var controls = document.createElement('div');
        controls.className = 'rv-controls';
        function mkBtn(label, sym, cls) {
          var b = document.createElement('button');
          b.type = 'button'; b.className = 'btn btn--ghost rv-btn ' + (cls || '');
          b.setAttribute('aria-label', label); b.title = label; b.textContent = sym;
          controls.appendChild(b); return b;
        }
        var prev = mkBtn(T.prev, '‹', 'rv-btn--nav');
        var pauseBtn = mkBtn(T.pause, '❚❚', 'rv-btn--pause');
        var next = mkBtn(T.next, '›', 'rv-btn--nav');
        var count = document.createElement('span');
        count.className = 'rv-count'; count.setAttribute('aria-live', 'polite');
        controls.appendChild(count);

        var page = 0, per = 1, timer = 0, paused = reduced, hover = false;
        function perPage() { return window.innerWidth >= 1100 ? 4 : (window.innerWidth >= 700 ? 2 : 1); }
        function pages() { return Math.max(1, Math.ceil(reviews.length / per)); }
        function render() {
          stage.innerHTML = '';
          stage.style.setProperty('--rv-cols', per);
          for (var i = page * per; i < Math.min(reviews.length, page * per + per); i++) stage.appendChild(card(reviews[i]));
          count.textContent = (page + 1) + ' / ' + pages();
        }
        function go(dir) {
          page = (page + dir + pages()) % pages();
          if (reduced) { render(); return; }
          stage.classList.add('is-fading');
          setTimeout(function () { render(); stage.classList.remove('is-fading'); }, 380);
        }
        function schedule() {
          clearInterval(timer);
          if (paused || pages() < 2) return;
          timer = setInterval(function () { if (!hover && !document.hidden) go(1); }, 20000);
        }
        function setPaused(p) {
          paused = p;
          pauseBtn.textContent = p ? '▶' : '❚❚';
          var l = p ? T.play : T.pause;
          pauseBtn.setAttribute('aria-label', l); pauseBtn.title = l;
          pauseBtn.setAttribute('aria-pressed', p ? 'true' : 'false');
          schedule();
        }
        prev.addEventListener('click', function () { go(-1); schedule(); });
        next.addEventListener('click', function () { go(1); schedule(); });
        pauseBtn.addEventListener('click', function () { setPaused(!paused); });
        band.addEventListener('mouseenter', function () { hover = true; });
        band.addEventListener('mouseleave', function () { hover = false; });
        band.addEventListener('focusin', function () { hover = true; });
        band.addEventListener('focusout', function () { hover = false; });
        var rz;
        window.addEventListener('resize', function () {
          clearTimeout(rz);
          rz = setTimeout(function () { var n = perPage(); if (n !== per) { per = n; page = 0; render(); schedule(); } }, 200);
        });
        per = perPage();
        band.innerHTML = '';
        band.classList.add('rv-on');
        band.appendChild(stage);
        band.appendChild(controls);
        render();
        setPaused(paused);
      })
      .catch(function () { /* statischer Fallback im Markup bleibt stehen */ });
  }

  /* ---------- Video-Facade: lädt erst nach Klick.
     Liegt eine eigene Videodatei unter data-video-src (z. B.
     /assets/video/snoopit.mp4) auf dem Server, wird sie nativ abgespielt —
     sonst Fallback auf YouTube (nocookie). Der Button wird durch einen
     Container ERSETZT (iframe/video im Button wäre ungültiges HTML). ---------- */
  document.querySelectorAll('.video-facade[data-video]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-video');
      var localSrc = btn.getAttribute('data-video-src');
      var title = btn.getAttribute('data-video-title') || 'Video';
      function mount(el) {
        var wrap = document.createElement('div');
        wrap.className = btn.className; /* Hoch-/Querformat-Variante behalten */
        wrap.style.cursor = 'default';
        wrap.appendChild(el);
        btn.replaceWith(wrap);
        try { el.focus(); } catch (e) {}
      }
      function youtube() {
        if (!/^[A-Za-z0-9_-]{6,20}$/.test(id || '')) return;
        var f = document.createElement('iframe');
        f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1';
        f.title = title;
        f.allow = 'autoplay; encrypted-media; picture-in-picture';
        f.setAttribute('allowfullscreen', '');
        mount(f);
      }
      if (localSrc && window.fetch) {
        fetch(localSrc, { method: 'HEAD' }).then(function (r) {
          if (!r.ok) throw new Error(r.status);
          var v = document.createElement('video');
          v.src = localSrc;
          v.controls = true;
          v.autoplay = true;
          v.playsInline = true;
          v.setAttribute('aria-label', title);
          v.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;background:#000';
          mount(v);
        }).catch(youtube);
      } else {
        youtube();
      }
    }, { once: true });
  });

  /* ---------- Kampagnen-Parameter an Shop-Links durchreichen.
     Kommt ein Besucher aus einer Anzeige (utm_*, fbclid, gclid in der URL),
     gehen diese Parameter beim Klick in den Shop sonst verloren — und mit
     ihnen die Zuordnung der Shop-Conversion zur Kampagne. Reine URL-Weiter-
     gabe ohne Speicherung, daher ohne Einwilligung zulässig. ---------- */
  try {
    var params = new URLSearchParams(location.search);
    var forward = [];
    params.forEach(function (v, k) {
      if (/^utm_/i.test(k) || k === 'fbclid' || k === 'gclid') forward.push([k, v]);
    });
    if (forward.length) {
      document.querySelectorAll('a[href*="shop.starsofthegalaxy.de"]').forEach(function (a) {
        var u = new URL(a.href);
        forward.forEach(function (p) { if (!u.searchParams.has(p[0])) u.searchParams.set(p[0], p[1]); });
        a.href = u.toString();
      });
    }
  } catch (e) { /* URLSearchParams/URL fehlen nur in Uralt-Browsern */ }

  /* ---------- Sprach-Hinweis: Bevorzugt der Browser eine andere Sprache,
     die es für diese Seite gibt (link rel=alternate hreflang), erscheint
     oben ein schmaler, schließbarer Hinweis — keine automatische Weiter-
     leitung (Google rät davon ab, Besucher sollen frei wählen). ---------- */
  try {
    var alts = {};
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(function (l) {
      alts[l.getAttribute('hreflang')] = l.getAttribute('href');
    });
    var want = null;
    (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || '']).some(function (l) {
      var c = String(l).slice(0, 2).toLowerCase();
      if (c === LANG) return true;
      if (/^(de|en|nl|fr)$/.test(c) && alts[c]) { want = c; return true; }
      return false;
    });
    var hintOff = false;
    try { hintOff = !!sessionStorage.getItem('sotg-lang-hint'); } catch (e) {}
    /* Offline-Vorschau (file://): absolute hreflang-Adressen gibt es dort nicht */
    if (want && !hintOff && location.protocol !== 'file:') {
      var H = {
        de: ['Diese Seite gibt es auch auf Deutsch.', 'Auf Deutsch lesen', 'Hinweis schließen'],
        en: ['This page is also available in English.', 'Read in English', 'Dismiss'],
        nl: ['Deze pagina is ook beschikbaar in het Nederlands.', 'Lees in het Nederlands', 'Sluiten'],
        fr: ['Cette page existe aussi en français.', 'Lire en français', 'Fermer']
      }[want];
      var bar = document.createElement('div');
      bar.className = 'lang-hint';
      bar.lang = want;
      bar.setAttribute('role', 'region');
      bar.setAttribute('aria-label', H[0]);
      var txt = document.createElement('span');
      txt.textContent = H[0];
      var go = document.createElement('a');
      go.href = new URL(alts[want], location.href).pathname;
      go.hreflang = want;
      go.textContent = H[1];
      go.setAttribute('data-event', 'lang-hint-' + want);
      var shut = document.createElement('button');
      shut.type = 'button';
      shut.className = 'lang-hint__close';
      shut.setAttribute('aria-label', H[2]);
      shut.textContent = '×';
      shut.addEventListener('click', function () {
        try { sessionStorage.setItem('sotg-lang-hint', '1'); } catch (e) {}
        bar.remove();
      });
      bar.appendChild(txt); bar.appendChild(go); bar.appendChild(shut);
      document.body.appendChild(bar); /* schwebend (CSS), schiebt keinen Inhalt */
    }
  } catch (e) {}
})();

/* QA 07.11.: Solange die Hero-Knöpfe sichtbar sind, keine Sticky-Leiste und kein
   Kenny auf dem Handy (sonst doppelter CTA und verdeckte Knöpfe). */
(function () {
  var ha = document.querySelector('.hero .hero__actions');
  if (!ha || !('IntersectionObserver' in window)) return;
  document.body.classList.add('hero-cta-visible');
  new IntersectionObserver(function (e) {
    document.body.classList.toggle('hero-cta-visible', e[0].isIntersecting);
  }).observe(ha);
})();
