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
  id: "betriebsferien-2026",
  titel: "Betriebsferien",
  text: "Wir machen vom 21.12.2026 bis 01.01.2027 Betriebsferien. Ab dem 2. Januar 2027 sind wir wieder für euch da.",
  linkText: "Tickets sichern",
  linkUrl: "https://shop.starsofthegalaxy.de/collections/tickets",
  gueltigBis: "2027-01-01",
  en: {
    titel: "Holiday closure",
    text: "We are closed for our annual holidays from 21 December 2026 to 1 January 2027. From 2 January 2027 we are here for you again.",
    linkText: "Get tickets"
  },
  nl: {
    titel: "Bedrijfsvakantie",
    text: "Van 21 december 2026 tot en met 1 januari 2027 hebben we bedrijfsvakantie. Vanaf 2 januari 2027 zijn we er weer voor jullie.",
    linkText: "Tickets kopen"
  },
  fr: {
    titel: "Congés annuels",
    text: "Nous sommes en congés du 21\u00a0décembre 2026 au 1er\u00a0janvier 2027. Dès le 2\u00a0janvier 2027, nous sommes de nouveau là pour vous.",
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
     der im Öffnungsstatus erscheint ("Betriebsferien · wieder geöffnet ab …").
   - zusaetzlichGeoeffnet: einzelne Extra-Tage mit Uhrzeit (volle Stunden).
   Vergangene Einträge stören nicht, können aber gelöscht werden.
   ================================================================ */

window.SOTG_SONDERZEITEN = {
  geschlossen: [
    { von: "2026-12-21", bis: "2027-01-01",
      grund: { de: "Betriebsferien", en: "Holiday closure", nl: "Bedrijfsvakantie", fr: "Congés annuels" } }
  ],
  zusaetzlichGeoeffnet: [
    /* Beispiel: { datum: "2027-01-04", von: 12, bis: 18 } */
  ]
};
