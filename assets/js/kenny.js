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

  /* Kenny als eigene Vektor-Zeichnung (nach dem Foto aus der SnoopIT-App) */
  var SVG = '<svg class="kenny-svg" viewBox="0 0 64 76" aria-hidden="true" focusable="false">' +
    '<line x1="20" y1="14" x2="18" y2="5" stroke="#9aa7c4" stroke-width="2" stroke-linecap="round"/>' +
    '<line x1="44" y1="14" x2="46" y2="5" stroke="#9aa7c4" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M11 38a21 21 0 0 1 42 0v3H11z" fill="#eef0f7" stroke="#aab4cc" stroke-width="1.2"/>' +
    '<rect x="26" y="15" width="12" height="2.6" rx="1.3" fill="#2b3d73"/>' +
    '<circle cx="24.5" cy="28" r="6.4" fill="#141a2b" stroke="#aab4cc" stroke-width="1.5"/>' +
    '<circle cx="39.5" cy="28" r="6.4" fill="#141a2b" stroke="#aab4cc" stroke-width="1.5"/>' +
    '<circle class="kenny-eye" cx="26.5" cy="26.3" r="1.5" fill="#ff5a4a"/><circle class="kenny-eye" cx="41.5" cy="26.3" r="1.5" fill="#ff5a4a"/>' +
    '<g fill="#5f6c8f"><circle cx="29" cy="36" r=".9"/><circle cx="32" cy="36" r=".9"/><circle cx="35" cy="36" r=".9"/></g>' +
    '<rect x="11" y="41" width="42" height="4" fill="#cdd3e2"/>' +
    '<rect x="14" y="45" width="36" height="24" rx="9" fill="#eef0f7" stroke="#aab4cc" stroke-width="1.2"/>' +
    '<path d="M32 45l-3.4 4 3.4 16 3.4-16z" fill="#23408f"/><path d="M29.4 45h5.2l-1 2.6h-3.2z" fill="#1a2f6b"/>' +
    '<rect x="5" y="47" width="8" height="14" rx="4" fill="#dfe3ee" stroke="#aab4cc"/><rect x="51" y="47" width="8" height="14" rx="4" fill="#dfe3ee" stroke="#aab4cc"/>' +
    '<rect x="20" y="68" width="8" height="6" rx="2" fill="#2b3d73"/><rect x="36" y="68" width="8" height="6" rx="2" fill="#2b3d73"/>' +
    '</svg>';
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

  function match(q) {
    var nq = ' ' + norm(q) + ' ', best = null, bestScore = 0;
    kb.items.forEach(function (it) {
      var score = 0;
      var kws = (it.keywords && (it.keywords[LANG] || [])).concat(LANG !== 'de' && it.keywords ? (it.keywords.de || []) : []);
      kws.forEach(function (k) {
        var nk = norm(k);
        if (!nk) return;
        if (nk.length >= 4 ? nq.indexOf(nk) !== -1 : nq.indexOf(' ' + nk + ' ') !== -1) score += Math.min(nk.length, 10) + (nk.indexOf(' ') !== -1 ? 6 : 0); // Mehrwort-Treffer sind präziser
      });
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
    log.scrollTop = log.scrollHeight;
    return m;
  }
  function showChips(ids) {
    chips.innerHTML = '';
    if (!ids.length) return;
    var lbl = document.createElement('span'); lbl.className = 'kenny-chips__label'; lbl.textContent = UI.more; chips.appendChild(lbl);
    ids.forEach(function (id) {
      var it = byId(id); if (!it) return;
      var c = document.createElement('button'); c.type = 'button'; c.className = 'kenny-chip'; c.textContent = L(it.q);
      c.addEventListener('click', function () { ask(L(it.q), it); });
      chips.appendChild(c);
    });
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
    panel.hidden = true;
    panel.innerHTML =
      '<div class="kenny-head"><span class="kenny-head__av">' + SVG + '</span>' +
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
    panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }
  function open() {
    if (!panel) build();
    lastFocus = document.activeElement;
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    document.body.classList.add('kenny-open');
    loadKB().then(function () {
      if (!log.childNodes.length) { addMsg('bot', L(kb.greeting)); showChips((kb.suggestions || []).slice(0, 5)); }
      input.focus();
    }).catch(function () { if (!log.childNodes.length) addMsg('bot', UI.error); });
  }
  function close() {
    if (!panel) return;
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
    launcher.innerHTML = SVG + '<span>' + UI.open + '</span>';
    launcher.addEventListener('click', function () { (panel && !panel.hidden) ? close() : open(); });
    document.body.appendChild(launcher);
    if (!reduced) setTimeout(function () { launcher.classList.add('is-waving'); }, 2500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
