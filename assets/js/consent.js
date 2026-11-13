/* ==========================================================================
   Stars of the Galaxy — Cookie-Consent (eigenes Banner, kein externes Tool)
   Aufbau wie Cookiebot (Zustimmung / Details / Über Cookies), Design der Site.
   Speichert die Wahl in localStorage ('sotg-cookie-consent-v1') und sendet
   Google-Consent-Mode-v2-Events in den dataLayer (consent_default /
   consent_update) — damit sind GTM / Meta Pixel später direkt anschließbar.
   Wiederöffnen: jedes Element mit [data-consent-open] (Footer-Link).
   ========================================================================== */
(function () {
  'use strict';

  var KEY = 'sotg-cookie-consent-v1';

  /* Consent-Default (alles abgelehnt) — muss vor jedem künftigen Tag liegen */
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'consent_default',
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    analytics_storage: 'denied', functionality_storage: 'denied',
    personalization_storage: 'denied', security_storage: 'granted'
  });

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var d = JSON.parse(raw);
      return (d && d.kategorien) ? d : null;
    } catch (e) { return null; }
  }

  function save(kat) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ v: 1, ts: new Date().toISOString(), kategorien: kat }));
    } catch (e) {}
  }

  function pushUpdate(kat) {
    window.dataLayer.push({
      event: 'consent_update',
      ad_storage: kat.marketing ? 'granted' : 'denied',
      ad_user_data: kat.marketing ? 'granted' : 'denied',
      ad_personalization: kat.marketing ? 'granted' : 'denied',
      analytics_storage: kat.statistiken ? 'granted' : 'denied',
      functionality_storage: kat.praeferenzen ? 'granted' : 'denied',
      personalization_storage: kat.praeferenzen ? 'granted' : 'denied',
      security_storage: 'granted'
    });
  }

  /* Vorbereitete Skripte aktivieren: <script type="text/plain" data-consent="marketing"> */
  function activateScripts(kat) {
    var pending = document.querySelectorAll('script[type="text/plain"][data-consent]');
    for (var i = 0; i < pending.length; i++) {
      var s = pending[i];
      var cat = s.getAttribute('data-consent');
      if (!kat[cat] || s.getAttribute('data-consent-active')) continue;
      var n = document.createElement('script');
      if (s.src) n.src = s.src; else n.textContent = s.textContent;
      n.setAttribute('data-consent', cat);
      n.setAttribute('data-consent-active', '1');
      s.setAttribute('data-consent-active', '1');
      s.parentNode.insertBefore(n, s.nextSibling);
    }
  }

  function apply(kat) {
    pushUpdate(kat);
    activateScripts(kat);
    try { document.dispatchEvent(new CustomEvent('sotg:consent', { detail: kat })); } catch (e) {}
  }

  /* Texte je Seitensprache (<html lang>); Kategorie-IDs bleiben deutsch,
     damit gespeicherte Einwilligungen sprachunabhängig gelten. */
  var LANG = (document.documentElement.lang || 'de').slice(0, 2).toLowerCase();
  var TX = {
    de: {
      label: 'Cookie-Einstellungen', title: 'Diese Webseite verwendet Cookies',
      tabs: ['Zustimmung', 'Details', 'Über Cookies'], always: ' (immer aktiv)',
      intro: 'Diese Website speichert derzeit nur technisch Notwendiges, zum Beispiel deine Auswahl hier. Kommen später Statistik- oder Marketing-Dienste dazu, laden sie erst nach deiner Einwilligung. Deine Auswahl kannst du jederzeit über „Cookie-Einstellungen“ im Footer ändern.',
      about: 'Cookies sind kleine Textdateien, die Websites in deinem Browser speichern. Notwendige Cookies halten die Seite am Laufen; alle anderen setzen wir nur mit deiner Einwilligung. Mehr dazu in unserer Datenschutzerklärung.',
      privacy: 'Zur Datenschutzerklärung', privacyUrl: '/sotg-vorschau/datenschutz/',
      deny: 'Ablehnen', select: 'Auswahl erlauben', all: 'Alle zulassen',
      kat: {
        notwendig: ['Notwendig', 'Grundfunktionen der Website, z. B. das Speichern dieser Cookie-Auswahl und einmaliger Sitzungs-Hinweise. Ohne diese funktioniert die Seite nicht.'],
        praeferenzen: ['Präferenzen', 'Merken sich Einstellungen wie Anzeige-Optionen. Derzeit setzt diese Website keine Präferenz-Cookies ein.'],
        statistiken: ['Statistiken', 'Helfen zu verstehen, wie Besucher die Website nutzen (anonymisierte Statistik). Erst nach Einwilligung und nur, wenn ein solcher Dienst aktiv ist (z. B. Google Tag Manager).'],
        marketing: ['Marketing', 'Messen den Erfolg von Werbung und ermöglichen interessenbezogene Anzeigen. Erst nach Einwilligung und nur, wenn ein solcher Dienst aktiv ist (z. B. Meta-Pixel, Google Ads).']
      }
    },
    en: {
      label: 'Cookie settings', title: 'This website uses cookies',
      tabs: ['Consent', 'Details', 'About cookies'], always: ' (always active)',
      intro: 'This website currently only stores what is technically necessary, such as your choice here. If statistics or marketing services are added later, they will only load with your consent. You can change your choice at any time via “Cookie settings” in the footer.',
      about: 'Cookies are small text files that websites store in your browser. Necessary cookies keep the site running; we only set all others with your consent. You can find out more in our privacy policy.',
      privacy: 'Read the privacy policy', privacyUrl: '/sotg-vorschau/en/privacy/',
      deny: 'Deny', select: 'Allow selection', all: 'Allow all',
      kat: {
        notwendig: ['Necessary', 'Core functions of the website, e.g. saving this cookie choice and one-off session notices. The site cannot work without them.'],
        praeferenzen: ['Preferences', 'Remember settings such as display options. This website currently uses no preference cookies.'],
        statistiken: ['Statistics', 'Help us understand how visitors use the website (anonymised statistics). Only with your consent and only if such a service is active (e.g. Google Tag Manager).'],
        marketing: ['Marketing', 'Measure the success of advertising and enable interest-based ads. Only with your consent and only if such a service is active (e.g. Meta Pixel, Google Ads).']
      }
    },
    nl: {
      label: 'Cookie-instellingen', title: 'Deze website gebruikt cookies',
      tabs: ['Toestemming', 'Details', 'Over cookies'], always: ' (altijd actief)',
      intro: 'Deze website slaat op dit moment alleen technisch noodzakelijke gegevens op, zoals je keuze hier. Komen er later statistiek- of marketingdiensten bij, dan laden die pas na jouw toestemming. Je kunt je keuze altijd wijzigen via „Cookie-instellingen” onderaan de pagina.',
      about: 'Cookies zijn kleine tekstbestanden die websites in je browser opslaan. Noodzakelijke cookies houden de site draaiende; alle andere plaatsen we alleen met jouw toestemming. Meer hierover lees je in onze privacyverklaring.',
      privacy: 'Naar de privacyverklaring', privacyUrl: '/sotg-vorschau/nl/privacy/',
      deny: 'Weigeren', select: 'Selectie toestaan', all: 'Alles toestaan',
      kat: {
        notwendig: ['Noodzakelijk', 'Basisfuncties van de website, zoals het opslaan van deze cookiekeuze en eenmalige sessiemeldingen. Zonder deze werkt de site niet.'],
        praeferenzen: ['Voorkeuren', 'Onthouden instellingen zoals weergaveopties. Deze website gebruikt momenteel geen voorkeurscookies.'],
        statistiken: ['Statistieken', 'Helpen ons begrijpen hoe bezoekers de website gebruiken (geanonimiseerde statistieken). Alleen met jouw toestemming en alleen als zo’n dienst actief is (bijv. Google Tag Manager).'],
        marketing: ['Marketing', 'Meten het succes van advertenties en maken advertenties op basis van interesses mogelijk. Alleen met jouw toestemming en alleen als zo’n dienst actief is (bijv. Meta-pixel, Google Ads).']
      }
    }
    ,
    fr: {
      label: 'Paramètres des cookies', title: 'Ce site utilise des cookies',
      tabs: ['Consentement', 'Détails', 'À propos des cookies'], always: ' (toujours actif)',
      intro: 'Ce site n’enregistre actuellement que ce qui est techniquement nécessaire, par exemple votre choix ici. Si des services de statistiques ou de marketing s’ajoutent plus tard, ils ne se chargeront qu’avec votre accord. Vous pouvez modifier votre choix à tout moment via « Paramètres des cookies » en bas de page.',
      about: 'Les cookies sont de petits fichiers texte que les sites enregistrent dans votre navigateur. Les cookies nécessaires font fonctionner le site ; tous les autres ne sont utilisés qu’avec votre accord. Pour en savoir plus, consultez notre politique de confidentialité.',
      privacy: 'Politique de confidentialité', privacyUrl: '/sotg-vorschau/fr/confidentialite/',
      deny: 'Refuser', select: 'Autoriser la sélection', all: 'Tout autoriser',
      kat: {
        notwendig: ['Nécessaires', 'Fonctions de base du site, par exemple l’enregistrement de ce choix de cookies et de messages ponctuels de session. Le site ne peut pas fonctionner sans elles.'],
        praeferenzen: ['Préférences', 'Mémorisent des réglages comme les options d’affichage. Ce site n’utilise actuellement aucun cookie de préférence.'],
        statistiken: ['Statistiques', 'Nous aident à comprendre comment les visiteurs utilisent le site (statistiques anonymisées). Uniquement avec votre accord et seulement si un tel service est actif (par ex. Google Tag Manager).'],
        marketing: ['Marketing', 'Mesurent l’efficacité des publicités et permettent des annonces basées sur les centres d’intérêt. Uniquement avec votre accord et seulement si un tel service est actif (par ex. Meta Pixel, Google Ads).']
      }
    }
  }[/^(de|en|nl|fr)$/.test(LANG) ? LANG : 'de'];

  var KATEGORIEN = ['notwendig', 'praeferenzen', 'statistiken', 'marketing'].map(function (id) {
    return { id: id, titel: TX.kat[id][0], text: TX.kat[id][1], fest: id === 'notwendig' };
  });

  var dlg = null;

  function buildBanner(vorauswahl) {
    if (dlg) { dlg.remove(); dlg = null; }
    dlg = document.createElement('dialog');
    dlg.className = 'consent';
    dlg.setAttribute('aria-label', TX.label);

    var inner = document.createElement('div');
    inner.className = 'consent__inner';

    var h = document.createElement('h2');
    h.className = 'consent__title';
    h.textContent = TX.title;
    inner.appendChild(h);

    /* Tabs */
    var tabs = TX.tabs;
    var tabBar = document.createElement('div');
    tabBar.className = 'consent__tabs';
    tabBar.setAttribute('role', 'tablist');
    var panels = [];
    tabs.forEach(function (name, idx) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'consent__tab' + (idx === 0 ? ' is-active' : '');
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
      b.textContent = name;
      b.addEventListener('click', function () {
        for (var i = 0; i < tabBar.children.length; i++) {
          tabBar.children[i].classList.toggle('is-active', i === idx);
          tabBar.children[i].setAttribute('aria-selected', i === idx ? 'true' : 'false');
          panels[i].hidden = (i !== idx);
        }
      });
      tabBar.appendChild(b);
    });
    inner.appendChild(tabBar);

    /* Panel 1: Zustimmung */
    var p1 = document.createElement('div');
    p1.className = 'consent__panel';
    var intro = document.createElement('p');
    intro.textContent = TX.intro;
    p1.appendChild(intro);
    panels.push(p1);

    /* Panel 2: Details (Kategorien mit Schaltern) */
    var p2 = document.createElement('div');
    p2.className = 'consent__panel';
    p2.hidden = true;
    var inputs = {};
    KATEGORIEN.forEach(function (k) {
      var row = document.createElement('div');
      row.className = 'consent__cat';
      var head = document.createElement('div');
      head.className = 'consent__cat-head';
      var lbl = document.createElement('label');
      lbl.className = 'consent__switch';
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = k.fest || !!(vorauswahl && vorauswahl[k.id]);
      cb.disabled = !!k.fest;
      cb.setAttribute('aria-label', k.titel + (k.fest ? TX.always : ''));
      var slider = document.createElement('span');
      slider.className = 'consent__slider';
      lbl.appendChild(cb); lbl.appendChild(slider);
      var name = document.createElement('strong');
      name.textContent = k.titel + (k.fest ? TX.always : '');
      head.appendChild(name); head.appendChild(lbl);
      var txt = document.createElement('p');
      txt.textContent = k.text;
      row.appendChild(head); row.appendChild(txt);
      p2.appendChild(row);
      if (!k.fest) inputs[k.id] = cb;
    });
    panels.push(p2);

    /* Panel 3: Über Cookies */
    var p3 = document.createElement('div');
    p3.className = 'consent__panel';
    p3.hidden = true;
    var about = document.createElement('p');
    about.textContent = TX.about;
    var dsLink = document.createElement('a');
    dsLink.href = TX.privacyUrl;
    dsLink.textContent = TX.privacy;
    p3.appendChild(about); p3.appendChild(dsLink);
    panels.push(p3);

    panels.forEach(function (p) { inner.appendChild(p); });

    /* Drei gleich große Buttons */
    var actions = document.createElement('div');
    actions.className = 'consent__actions';
    function mkBtn(text, cls, evt, handler) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn ' + cls;
      b.textContent = text;
      b.setAttribute('data-event', 'consent-' + evt);
      b.addEventListener('click', handler);
      actions.appendChild(b);
      return b;
    }
    function finish(kat) {
      save(kat);
      apply(kat);
      if (dlg.open) dlg.close();
      dlg.remove(); dlg = null;
    }
    mkBtn(TX.deny, 'btn--ghost', 'ablehnen', function () {
      finish({ notwendig: true, praeferenzen: false, statistiken: false, marketing: false });
    });
    mkBtn(TX.select, 'btn--ghost', 'auswahl-erlauben', function () {
      finish({
        notwendig: true,
        praeferenzen: !!inputs.praeferenzen.checked,
        statistiken: !!inputs.statistiken.checked,
        marketing: !!inputs.marketing.checked
      });
    });
    mkBtn(TX.all, 'btn--primary', 'alle-zulassen', function () {
      finish({ notwendig: true, praeferenzen: true, statistiken: true, marketing: true });
    });
    inner.appendChild(actions);

    dlg.appendChild(inner);

    /* Erstentscheidung ist Pflicht: Esc nur zulassen, wenn schon eine Wahl existiert */
    dlg.addEventListener('cancel', function (e) {
      if (!load()) e.preventDefault();
    });
    /* Chrome lässt beim zweiten Esc ohne Klick dazwischen kein preventDefault
       mehr zu und schließt den Dialog trotzdem. Ohne gespeicherte Wahl kommt
       das Banner deshalb sofort zurück. finish() speichert vor dem Schließen,
       wer erneut über den Footer-Link öffnet, hat schon eine Wahl: dann bleibt Esc frei. */
    dlg.addEventListener('close', function () {
      var d = this;
      if (load() || !d.isConnected) return;
      try { d.showModal(); } catch (e) {}
    });

    document.body.appendChild(dlg);
    try { dlg.showModal(); } catch (e) {}
  }

  function openBanner() {
    var stored = load();
    buildBanner(stored ? stored.kategorien : null);
  }

  window.SOTGConsent = {
    open: openBanner,
    get: function () { var d = load(); return d ? d.kategorien : null; }
  };

  function init() {
    if (!window.HTMLDialogElement) return;
    /* Footer-Link (und jedes [data-consent-open]) öffnet das Banner erneut */
    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest ? e.target.closest('[data-consent-open]') : null;
      if (t) { e.preventDefault(); openBanner(); }
    });

    var stored = load();
    if (stored) {
      apply(stored.kategorien);
    } else {
      window.SOTGConsentPending = true;
      document.addEventListener('sotg:consent', function () { window.SOTGConsentPending = false; }, { once: true });
      openBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
