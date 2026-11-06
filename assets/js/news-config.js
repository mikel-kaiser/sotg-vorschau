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
   - "en" / "nl": Übersetzungen für die englische und niederländische
     Website (optional). Fehlen sie oder ist "text" dort leer, sehen
     Besucher dieser Sprachen die deutsche Meldung. Bei einer neuen
     Meldung also am besten mitübersetzen — oder die Blöcke leeren.
   ================================================================ */

window.SOTG_NEWS = {
  aktiv: true,
  id: "ferien-2026-herbst",
  titel: "Gut zu wissen",
  text: "In den NRW-Schulferien haben wir immer Donnerstag bis Sonntag geöffnet. Tickets gibt es online oder jederzeit ohne Wartezeit an der Kasse.",
  linkText: "Tickets sichern",
  linkUrl: "https://shop.starsofthegalaxy.de/collections/tickets",
  gueltigBis: "2026-12-31",
  en: {
    titel: "Good to know",
    text: "During the school holidays in North Rhine-Westphalia (NRW) we are always open Thursday to Sunday. Get your tickets online or anytime at the ticket desk, with no waiting.",
    linkText: "Get tickets"
  },
  nl: {
    titel: "Goed om te weten",
    text: "Tijdens de schoolvakanties in Noordrijn-Westfalen (NRW) zijn we altijd van donderdag tot en met zondag geopend. Tickets koop je online of gewoon aan de kassa, zonder wachttijd.",
    linkText: "Tickets kopen"
  },
  fr: {
    titel: "Bon à savoir",
    text: "Pendant les vacances scolaires de Rhénanie-du-Nord-Westphalie (NRW), nous sommes toujours ouverts du jeudi au dimanche. Achetez vos billets en ligne ou directement à la caisse, sans attente.",
    linkText: "Acheter des billets"
  }
};

/* ================================================================
   SONDERZEITEN — Schließtage und zusätzliche Öffnungstage
   ----------------------------------------------------------------
   Die normalen Zeiten (Do/Fr 12–18, Sa 10–18, So 12–17, auch an
   Feiertagen, plus Ostermontag und Pfingstmontag 12–17 Uhr) kennt die
   Website automatisch, auch für die kommenden Jahre.
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
