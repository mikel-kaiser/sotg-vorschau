/* ==========================================================================
   Stars of the Galaxy: "Frag Kenny", der Museumsroboter als FAQ-Chat.
   Kundenwunsch 06.11.2026. Ohne KI: Antworten kommen aus
   /assets/data/kenny-faq.json (DE/EN/NL/FR), Abgleich über Stichwörter.
   Lädt erst beim ersten Öffnen, speichert nichts (keine Einwilligung nötig).
   KI später: KENNY_KI = true setzen und in /kenny.php den API-Key eintragen;
   dann beantwortet die KI alles, wofür die Wissensbasis keinen Treffer hat
   (Datenschutzerklärung vorher ergänzen!).
   ========================================================================== */
(function () {
  'use strict';
  var KENNY_KI = false;

  var LANG = (document.documentElement.lang || 'de').slice(0, 2).toLowerCase();
  if (!/^(de|en|nl|fr)$/.test(LANG)) LANG = 'de';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var UI = {
    de: { open: 'Frag Kenny', title: 'Kenny', sub: 'Euer Museumsroboter', close: 'Chat schließen', ph: 'Deine Frage …', send: 'Senden',
          more: 'Andere Fragen:', loading: 'Kenny denkt nach …', error: 'Meine Antenne hat gerade keinen Empfang. Ruf uns gern an: 02161 406 37 90.',
          note: 'Kenny kennt die häufigsten Fragen. Für alles andere sind wir unter 02161 406 37 90 erreichbar.', you: 'Du', label: 'Chat mit Kenny' },
    en: { open: 'Ask Kenny', title: 'Kenny', sub: 'Your museum robot', close: 'Close chat', ph: 'Your question …', send: 'Send',
          more: 'Other questions:', loading: 'Kenny is thinking …', error: 'My antenna has no signal right now. Please call us: +49 2161 406 37 90.',
          note: 'Kenny knows the most common questions. For anything else, call us on +49 2161 406 37 90.', you: 'You', label: 'Chat with Kenny' },
    nl: { open: 'Vraag het Kenny', title: 'Kenny', sub: 'Jullie museumrobot', close: 'Chat sluiten', ph: 'Je vraag …', send: 'Versturen',
          more: 'Andere vragen:', loading: 'Kenny denkt na …', error: 'Mijn antenne heeft even geen bereik. Bel ons gerust: +49 2161 406 37 90.',
          note: 'Kenny kent de meest gestelde vragen. Voor al het andere bereik je ons op +49 2161 406 37 90.', you: 'Jij', label: 'Chat met Kenny' },
    fr: { open: 'Demandez à Kenny', title: 'Kenny', sub: 'Votre robot du musée', close: 'Fermer le chat', ph: 'Votre question …', send: 'Envoyer',
          more: 'Autres questions :', loading: 'Kenny réfléchit …', error: 'Mon antenne ne capte plus rien. Appelez-nous : +49 2161 406 37 90.',
          note: 'Kenny connaît les questions les plus fréquentes. Pour le reste : +49 2161 406 37 90.', you: 'Vous', label: 'Discuter avec Kenny' }
  }[LANG];

  /* Kenny: echte Grafik aus der SnoopIT-App (von Thomas, 13.11.2026), freigestellt */
  function kennyImg(name, w, cls) {
    return '<img class="kenny-svg' + (cls ? ' ' + cls : '') + '" src="/sotg-vorschau/assets/img/' + name + '-120.webp"' +
      ' srcset="/sotg-vorschau/assets/img/' + name + '-120.webp 1x, /assets/img/' + name + '-240.webp 2x"' +
      ' width="' + w + '" height="120" alt="" decoding="async">';
  }
  var SVG = kennyImg('kenny-roboter', 98);
  var WAVE = kennyImg('kenny-roboter-winkt', 117);
  window.SOTG = window.SOTG || {};
  window.SOTG.kennySVG = SVG;

  var kb = null, kbLoading = null, panel, log, input, chips, launcher, lastFocus;

  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/ß/g, 'ss').replace(/[^a-z0-9€ ]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function loadKB() {
    if (kb) return Promise.resolve(kb);
    if (!kbLoading) {
      kbLoading = fetch('/sotg-vorschau/assets/data/kenny-faq.json', { credentials: 'omit', cache: 'no-cache' })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (d) { kb = d; return d; });
    }
    return kbLoading;
  }
  function L(o) { return (o && (o[LANG] || o.de)) || ''; }
  function byId(id) { for (var i = 0; i < kb.items.length; i++) if (kb.items[i].id === id) return kb.items[i]; return null; }

  /* Stichwörter in kenny-faq.json (keywords je Sprache, deutsche zählen überall mit):
       "hund"         ab 4 Zeichen auch als Wortteil, kürzer nur als ganzes Wort.
                      Ein ganzes Wort zählt mindestens 4 Punkte, damit auch zug, bus, dog, app allein reichen.
       "wie viel"     Mehrwort-Treffer sind präziser: +6.
       "torte+mitbringen"  zählt nur, wenn alle Teile vorkommen: Summe der Teile +6.
       "-mitbringen"  steht das Wort in der Frage, scheidet der Eintrag ganz aus.
     Gewonnen hat der Eintrag mit den meisten Punkten, ab 4 Punkten; sonst kommt der Fallback. */
  function hit(nq, nk) {
    if (!nk) return 0;
    if (nq.indexOf(' ' + nk + ' ') !== -1) return Math.max(4, Math.min(nk.length, 10));
    return nk.length >= 4 && nq.indexOf(nk) !== -1 ? Math.min(nk.length, 10) : 0;
  }
  function match(q) {
    var nq = ' ' + norm(q) + ' ', best = null, bestScore = 0;
    kb.items.forEach(function (it) {
      var score = 0, out = false;
      var kws = (it.keywords && (it.keywords[LANG] || [])).concat(LANG !== 'de' && it.keywords ? (it.keywords.de || []) : []);
      kws.forEach(function (k) {
        k = String(k);
        if (k.charAt(0) === '-') { if (hit(nq, norm(k.slice(1)))) out = true; return; }
        if (k.indexOf('+') !== -1) {
          var sum = 0, all = k.split('+').every(function (p) { var s = hit(nq, norm(p)); sum += s; return s > 0; });
          if (all) score += sum + 6;
          return;
        }
        var nk = norm(k), s = hit(nq, nk);
        if (s) score += s + (nk.indexOf(' ') !== -1 ? 6 : 0);
      });
      if (out) return;
      norm(L(it.q)).split(' ').forEach(function (w) { if (w.length >= 5 && nq.indexOf(w) !== -1) score += 2; });
      if (score > bestScore) { bestScore = score; best = it; }
    });
    return bestScore >= 4 ? best : null;
  }

  function addMsg(who, text, link) {
    var m = document.createElement('div');
    m.className = 'kenny-msg kenny-msg--' + who;
    if (who === 'bot') {
      var av = document.createElement('span'); av.className = 'kenny-msg__av'; av.innerHTML = SVG; m.appendChild(av);
    }
    var b = document.createElement('div'); b.className = 'kenny-msg__body';
    String(text).split('\n').forEach(function (line, i) {
      if (i) b.appendChild(document.createElement('br'));
      b.appendChild(document.createTextNode(line));
    });
    if (link && link.href) {
      var a = document.createElement('a'); a.href = link.href; a.textContent = link.text || link.href; a.className = 'kenny-msg__link';
      b.appendChild(document.createElement('br')); b.appendChild(a);
    }
    m.appendChild(b);
    log.appendChild(m);
    toEnd();
    return m;
  }
  /* Neue Vorschlags-Chips verkleinern den Verlauf: danach erneut ans Ende scrollen */
  function toEnd() { log.scrollTop = log.scrollHeight; }
  function showChips(ids) {
    chips.innerHTML = '';
    if (!ids.length) { toEnd(); return; }
    var lbl = document.createElement('span'); lbl.className = 'kenny-chips__label'; lbl.textContent = UI.more; chips.appendChild(lbl);
    ids.forEach(function (id) {
      var it = byId(id); if (!it) return;
      var c = document.createElement('button'); c.type = 'button'; c.className = 'kenny-chip'; c.textContent = L(it.q);
      c.addEventListener('click', function () { ask(L(it.q), it); });
      chips.appendChild(c);
    });
    toEnd();
  }
  function answer(it) {
    addMsg('bot', L(it.a), it.link ? { href: L(it.link), text: L(it.linkText) } : null);
    var rest = (kb.suggestions || []).filter(function (id) { return id !== it.id; }).slice(0, 3);
    showChips(rest);
  }
  function ask(q, preset) {
    q = String(q || '').trim(); if (!q) return;
    addMsg('user', q);
    var it = preset || match(q);
    if (it) { answer(it); return; }
    if (KENNY_KI && window.fetch) {
      var wait = addMsg('bot', UI.loading);
      fetch('/sotg-vorschau/kenny.php', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ q: q.slice(0, 400), lang: LANG }) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (d) { wait.remove(); addMsg('bot', d && d.answer ? d.answer : L(kb.fallback)); showChips((kb.suggestions || []).slice(0, 3)); })
        .catch(function () { wait.remove(); addMsg('bot', L(kb.fallback)); showChips((kb.suggestions || []).slice(0, 3)); });
      return;
    }
    addMsg('bot', L(kb.fallback), { href: { de: '/sotg-vorschau/kontakt/', en: '/sotg-vorschau/en/contact/', nl: '/sotg-vorschau/nl/contact/', fr: '/sotg-vorschau/fr/contact/' }[LANG], text: UI.open === 'Frag Kenny' ? 'Zum Kontakt' : ({ en: 'Contact us', nl: 'Naar contact', fr: 'Nous contacter' }[LANG]) });
    showChips((kb.suggestions || []).slice(0, 4));
  }

  function build() {
    panel = document.createElement('div');
    panel.className = 'kenny-panel';
    panel.id = 'kenny-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', UI.label);
    panel.tabIndex = -1; /* Fokusziel beim Öffnen auf dem Handy */
    panel.hidden = true;
    panel.innerHTML =
      '<div class="kenny-head"><span class="kenny-head__av">' + WAVE + '</span>' +
      '<div><strong>' + UI.title + '</strong><span>' + UI.sub + '</span></div>' +
      '<button type="button" class="kenny-close" aria-label="' + UI.close + '">×</button></div>' +
      '<div class="kenny-log" aria-live="polite"></div>' +
      '<div class="kenny-chips"></div>' +
      '<form class="kenny-form" autocomplete="off"><label class="kenny-sr" for="kenny-input">' + UI.ph + '</label>' +
      '<input id="kenny-input" type="text" maxlength="300" placeholder="' + UI.ph + '">' +
      '<button type="submit" class="btn btn--primary btn--sm">' + UI.send + '</button></form>' +
      '<p class="kenny-note">' + UI.note + '</p>';
    document.body.appendChild(panel);
    log = panel.querySelector('.kenny-log');
    chips = panel.querySelector('.kenny-chips');
    input = panel.querySelector('#kenny-input');
    panel.querySelector('.kenny-close').addEventListener('click', close);
    panel.querySelector('.kenny-form').addEventListener('submit', function (e) {
      e.preventDefault(); var q = input.value; input.value = ''; ask(q);
    });
  }
  /* Esc schließt den Chat, egal wo der Fokus gerade steht (nur solange er offen ist).
     Liegt ein modaler Dialog darüber (Cookie-Banner, Lightbox), gehört Esc diesem. */
  function onKey(e) {
    if (e.key !== 'Escape' || !panel || panel.hidden) return;
    if (document.querySelector('dialog[open]')) return;
    close();
  }
  function open() {
    if (!panel) build();
    lastFocus = document.activeElement;
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    document.body.classList.add('kenny-open');
    document.addEventListener('keydown', onKey);
    loadKB().then(function () {
      if (!log.childNodes.length) { addMsg('bot', L(kb.greeting)); showChips((kb.suggestions || []).slice(0, 5)); }
      /* Eingabefeld nur am großen Bildschirm vorfokussieren: auf dem Handy
         würde sonst sofort die Tastatur den halben Chat verdecken (iOS) */
      if (window.matchMedia('(min-width: 1024px)').matches) input.focus();
      else panel.focus({ preventScroll: true });
    }).catch(function () { if (!log.childNodes.length) addMsg('bot', UI.error); });
  }
  function close() {
    if (!panel) return;
    document.removeEventListener('keydown', onKey);
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('kenny-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function init() {
    launcher = document.createElement('button');
    launcher.type = 'button';
    launcher.className = 'kenny-launcher';
    launcher.setAttribute('aria-controls', 'kenny-panel');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.setAttribute('data-event', 'kenny-open');
    launcher.innerHTML = SVG.replace('kenny-svg"', 'kenny-svg kenny-front"') + WAVE.replace('kenny-svg"', 'kenny-svg kenny-wave"') + '<span>' + UI.open + '</span>';
    launcher.addEventListener('click', function () { (panel && !panel.hidden) ? close() : open(); });
    document.body.appendChild(launcher);
    if (!reduced) setTimeout(function () {
      launcher.classList.add('is-waving');
      setTimeout(function () { launcher.classList.remove('is-waving'); }, 3400);
    }, 2500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
