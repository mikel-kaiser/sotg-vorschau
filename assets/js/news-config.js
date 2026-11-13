/* ================================================================
   NEWS-POPUP — Stars of the Galaxy
   ----------------------------------------------------------------
   Diese Datei kann der Betreiber selbst per FTP bearbeiten.
   Nur die Werte zwischen den Anführungszeichen ändern, speichern,
   hochladen — fertig. Kein weiterer Eingriff nötig.

   WICHTIG:
   - "aktiv": true  -> Popup wird angezeigt
     "aktiv": false -> Popup ist aus
   - "id" bei JEDER neuen Meldung ändern (z. B. Datum anhängen),
     sonst sehen Besucher, die das Popup schon weggeklickt haben,
     die neue Meldung nicht.
   - "gueltigBis": Nach diesem Datum (JJJJ-MM-TT) verschwindet das
     Popup automatisch — so kann nichts Veraltetes hängen bleiben.
   - "linkText"/"linkUrl" sind optional: beide leer lassen (""),
     wenn kein Button gewünscht ist.
   - "en" / "nl" / "fr": Übersetzungen für die englische, niederländische
     und französische Website (optional). Fehlen sie oder ist "text" dort leer, sehen
     Besucher dieser Sprachen die deutsche Meldung. Bei einer neuen
     Meldung also am besten mitübersetzen — oder die Blöcke leeren.
   ================================================================ */

window.SOTG_NEWS = {
  aktiv: true,
  id: "feiertage-weihnachten-2026",
  titel: "Gut zu wissen",
  text: "An allen Feiertagen haben wir geöffnet, auch montags bis mittwochs von 12 bis 17 Uhr. Weihnachtspause: Vom 21. Dezember bis 1. Januar bleibt die Basis geschlossen, ab Samstag, 2. Januar, sind wir wieder für euch da.",
  linkText: "Tickets sichern",
  linkUrl: "https://shop.starsofthegalaxy.de/collections/tickets",
  gueltigBis: "2027-01-01",
  en: {
    titel: "Good to know",
    text: "We are open on all public holidays, including Monday to Wednesday from 12:00 to 17:00. Christmas break: we are closed from 21 December to 1 January and open again from Saturday 2 January.",
    linkText: "Get tickets"
  },
  nl: {
    titel: "Goed om te weten",
    text: "Op alle feestdagen zijn we geopend, ook op maandag tot en met woensdag van 12.00 tot 17.00 uur. Kerstpauze: van 21 december tot en met 1 januari zijn we gesloten, vanaf zaterdag 2 januari zijn we er weer.",
    linkText: "Tickets kopen"
  },
  fr: {
    titel: "Bon à savoir",
    text: "Nous sommes ouverts tous les jours fériés, y compris du lundi au mercredi de 12 h à 17 h. Pause de Noël : nous sommes fermés du 21 décembre au 1er janvier et rouvrons le samedi 2 janvier.",
    linkText: "Acheter des billets"
  }
};

/* ================================================================
   SONDERZEITEN — Schließtage und zusätzliche Öffnungstage
   ----------------------------------------------------------------
   Die normalen Zeiten (Do/Fr 12–18, Sa 10–18, So 12–17, an allen
   Feiertagen geöffnet, Feiertage Mo–Mi 12–17 Uhr, geschlossen am
   24., 25., 26. und 31.12.) kennt die Website automatisch, auch für
   die kommenden Jahre.
   Hier nur Ausnahmen eintragen, Datum immer als "JJJJ-MM-TT":
   - geschlossen: von/bis (beide Tage einschließlich) und ein Grund,
     der im Öffnungsstatus erscheint ("Weihnachtspause · wieder geöffnet ab …").
   - zusaetzlichGeoeffnet: einzelne Extra-Tage mit Uhrzeit (volle Stunden).
   Vergangene Einträge stören nicht, können aber gelöscht werden.
   ================================================================ */

window.SOTG_SONDERZEITEN = {
  geschlossen: [
    { von: "2026-12-21", bis: "2027-01-01",
      grund: { de: "Weihnachtspause", en: "Christmas break", nl: "Kerstpauze", fr: "Pause de Noël" } }
  ],
  zusaetzlichGeoeffnet: [
    /* Beispiel: { datum: "2027-01-04", von: 12, bis: 18 } */
  ]
};
