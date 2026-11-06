/* ==========================================================================
   Stars of the Galaxy: interaktiver Lageplan (Kundenwunsch 06.11.2026).
   Grundlage: Lageplan aus dem Museumsflyer (Stand 04/2025), ohne WLAN-Daten.
   Markup: <div class="lageplan" data-lageplan> mit <img> darin.
   Punkte: Position in Prozent (x, y) auf dem Bild; Texte in DE/EN/NL/FR.
   ========================================================================== */
(function () {
  'use strict';
  var root = document.querySelector('[data-lageplan]');
  if (!root) return;
  var LANG = (document.documentElement.lang || 'de').slice(0, 2);
  if (!/^(de|en|nl|fr)$/.test(LANG)) LANG = 'de';
  var LV = {
    eg: { de: 'Erdgeschoss / Untergeschoss', en: 'Ground floor / lower level', nl: 'Begane grond / souterrain', fr: 'Rez-de-chaussée / sous-sol' },
    og: { de: 'Obergeschoss', en: 'Upper floor', nl: 'Bovenverdieping', fr: 'Étage' }
  };
  var UI = {
    close: { de: 'Schließen', en: 'Close', nl: 'Sluiten', fr: 'Fermer' },
    foto: { de: 'Fotopoint', en: 'Photo point', nl: 'Fotopunt', fr: 'Point photo' }
  };
  var P = [
    { id: 'eingang', x: 32.9, y: 88.8, lv: 'eg', img: 'neu-museum-eingang-abend',
      t: { de: 'Eingang & Kasse', en: 'Entrance & ticket desk', nl: 'Ingang & kassa', fr: 'Entrée & caisse' },
      d: { de: 'Hier beginnt die Mission: Tickets gibt es online oder ohne Wartezeit direkt an der Kasse.', en: 'Your mission starts here: buy tickets online or right at the desk, no waiting.', nl: 'Hier begint je missie: tickets koop je online of zonder wachten aan de kassa.', fr: 'Votre mission commence ici : billets en ligne ou directement à la caisse, sans attente.' } },
    { id: 'shop', x: 36.9, y: 77.4, lv: 'eg', img: 'neu-neon-schild-stars-of-the-galaxy',
      t: { de: 'Shop', en: 'Shop', nl: 'Shop', fr: 'Boutique' },
      d: { de: 'Figuren, Sammlerstücke und Souvenirs für die Heimreise durch den Hyperraum.', en: 'Figures, collectibles and souvenirs for the trip home through hyperspace.', nl: 'Figuren, verzamelobjecten en souvenirs voor de terugreis door de hyperruimte.', fr: 'Figurines, objets de collection et souvenirs pour le retour en hyperespace.' } },
    { id: 'spaceroom', x: 52.8, y: 76.5, lv: 'eg', img: 'neu-geburtstag-spaceroom-kinder', newimg: true,
      t: { de: 'Spaceroom', en: 'Spaceroom', nl: 'Spaceroom', fr: 'Spaceroom' },
      d: { de: 'Unsere Kommandozentrale für Kindergeburtstage: hier werden junge Jedi ausgebildet.', en: 'Our command centre for kids’ birthday parties, where young Jedi are trained.', nl: 'Ons commandocentrum voor kinderfeestjes: hier worden jonge Jedi opgeleid.', fr: 'Notre centre de commande pour les anniversaires : ici, les jeunes Jedi sont formés.' } },
    { id: 'cantina', x: 48.5, y: 67.7, lv: 'og', foto: true, img: 'neu-cantina-fotopoint', newimg: true,
      t: { de: 'Cantina', en: 'Cantina', nl: 'Cantina', fr: 'Cantina' },
      d: { de: 'Fotopoint mit Atmosphäre: ein Platz am Tisch der berühmtesten Bar der Galaxis.', en: 'A photo point full of atmosphere: take a seat in the galaxy’s most famous bar.', nl: 'Fotopunt vol sfeer: neem plaats in de bekendste bar van het sterrenstelsel.', fr: 'Un point photo plein d’ambiance : prenez place dans le bar le plus célèbre de la galaxie.' } },
    { id: 'lifesize', x: 39.3, y: 65.0, lv: 'og', img: 'neu-darth-vader-lichtschwert-karbonit', newimg: true,
      t: { de: 'Lifesize-Figuren', en: 'Life-size figures', nl: 'Levensgrote figuren', fr: 'Figurines grandeur nature' },
      d: { de: 'Helden und Schurken in Lebensgröße, so nah, dass man ihnen in die Augen schauen kann.', en: 'Heroes and villains at full size, close enough to look them in the eye.', nl: 'Helden en schurken op ware grootte, zo dichtbij dat je ze in de ogen kijkt.', fr: 'Héros et méchants grandeur nature, assez près pour les regarder dans les yeux.' } },
    { id: 'han', x: 51.7, y: 56.9, lv: 'og', img: 'neu-han-solo-karbonit-wache', newimg: true,
      t: { de: 'Han in Karbonit', en: 'Han in carbonite', nl: 'Han in carboniet', fr: 'Han dans la carbonite' },
      d: { de: 'Der berühmteste Tiefkühl-Schmuggler der Galaxis, lebensgroß.', en: 'The galaxy’s most famous deep-frozen smuggler, life-size.', nl: 'De beroemdste diepgevroren smokkelaar van het sterrenstelsel, levensgroot.', fr: 'Le contrebandier surgelé le plus célèbre de la galaxie, grandeur nature.' } },
    { id: 'modelle', x: 32.1, y: 62.2, lv: 'og', img: 'neu-raumschiff-modell-frachter', newimg: true,
      t: { de: 'Raumschiffmodelle', en: 'Starship models', nl: 'Ruimteschipmodellen', fr: 'Maquettes de vaisseaux' },
      d: { de: 'Detailgetreue Sammlermodelle der bekanntesten Schiffe, zum Staunen aus nächster Nähe.', en: 'Highly detailed collector’s models of the best-known ships, up close.', nl: 'Gedetailleerde verzamelmodellen van de bekendste schepen, van dichtbij.', fr: 'Maquettes de collection très détaillées des vaisseaux les plus connus, de tout près.' } },
    { id: 'tatooine', x: 26.2, y: 62.4, lv: 'og', img: 'neu-tatooine-diorama-dewback', newimg: true,
      t: { de: 'Tatooine-Diorama', en: 'Tatooine diorama', nl: 'Tatooine-diorama', fr: 'Diorama de Tatooine' },
      d: { de: 'Eine ganze Wüstenstadt im Kleinformat, mit Patrouille auf dem Dewback.', en: 'A whole desert town in miniature, complete with a patrol on a dewback.', nl: 'Een complete woestijnstad in het klein, met een patrouille op een dewback.', fr: 'Toute une ville du désert en miniature, avec une patrouille à dos de dewback.' } },
    { id: 'premium', x: 18.8, y: 62.2, lv: 'og', img: 'neu-premium-format-figuren', newimg: true,
      t: { de: 'Premium-Format-Figuren', en: 'Premium format figures', nl: 'Premium-formaatfiguren', fr: 'Figurines Premium Format' },
      d: { de: 'Sammlerfiguren im großen Maßstab mit unglaublich vielen Details.', en: 'Large-scale collector’s figures with an incredible amount of detail.', nl: 'Verzamelfiguren op grote schaal met ongelooflijk veel details.', fr: 'Figurines de collection à grande échelle, incroyablement détaillées.' } },
    { id: 'props', x: 60.0, y: 63.9, lv: 'og', img: 'neu-requisiten-lichtschwerter', newimg: true,
      t: { de: 'Props & Lichtschwerter', en: 'Props & lightsabers', nl: 'Props & lichtzwaarden', fr: 'Accessoires & sabres laser' },
      d: { de: 'Requisiten-Nachbauten und Lichtschwerter, sortiert wie in einer Waffenkammer.', en: 'Prop replicas and lightsabers, lined up like an armoury.', nl: 'Replica’s van rekwisieten en lichtzwaarden, als in een wapenkamer.', fr: 'Répliques d’accessoires et sabres laser, alignés comme dans une armurerie.' } },
    { id: 'lego', x: 68.0, y: 68.8, lv: 'og', img: 'neu-lego-sternenzerstoerer-todesstern', newimg: true,
      t: { de: 'LEGO-Modelle', en: 'LEGO models', nl: 'LEGO-modellen', fr: 'Modèles LEGO' },
      d: { de: 'Riesige LEGO-Bauten, darunter der Sternenzerstörer vor dem Todesstern.', en: 'Huge LEGO builds, including the Star Destroyer in front of the Death Star.', nl: 'Enorme LEGO-bouwwerken, met onder meer de Star Destroyer voor de Death Star.', fr: 'D’immenses constructions LEGO, dont le Destroyer stellaire devant l’Étoile de la Mort.' } },
    { id: 'dagobah', x: 80.3, y: 50.1, lv: 'og', img: 'neu-dagobah-yoda-r2', newimg: true,
      t: { de: 'Dagobah', en: 'Dagobah', nl: 'Dagobah', fr: 'Dagobah' },
      d: { de: 'Nebliger Sumpf, ein kleiner grüner Meister und ein treuer Astromech-Droide.', en: 'A misty swamp, a small green master and a loyal astromech droid.', nl: 'Een mistig moeras, een kleine groene meester en een trouwe astromechdroid.', fr: 'Un marais brumeux, un petit maître vert et un fidèle droïde astromécano.' } },
    { id: 'jabba', x: 80.6, y: 36.8, lv: 'og', img: 'neu-jabba-thronsaal', newimg: true,
      t: { de: 'Jabbas Thron', en: 'Jabba’s throne', nl: 'Jabba’s troon', fr: 'Le trône de Jabba' },
      d: { de: 'Der Thronsaal des berüchtigten Gangsterbosses, mit allem, was dazugehört.', en: 'The throne room of the notorious crime lord, with everything that goes with it.', nl: 'De troonzaal van de beruchte gangsterbaas, met alles erop en eraan.', fr: 'La salle du trône du célèbre parrain du crime, avec tout ce qui va avec.' } },
    { id: 'hangar', x: 80.6, y: 22.5, lv: 'og', img: 'neu-imperialer-hangar-starfighter', newimg: true,
      t: { de: 'Imperialer Hangar', en: 'Imperial hangar', nl: 'Keizerlijke hangar', fr: 'Hangar impérial' },
      d: { de: 'Hier steht der Starfighter in Lebensgröße, bewacht von Piloten des Imperiums.', en: 'Home of the life-size starfighter, guarded by Imperial pilots.', nl: 'Hier staat de starfighter op ware grootte, bewaakt door keizerlijke piloten.', fr: 'Ici se trouve le chasseur grandeur nature, gardé par des pilotes impériaux.' } },
    { id: 'hoth', x: 66.0, y: 29.6, lv: 'eg', img: 'neu-eiswelt-at-at-blau', newimg: true,
      t: { de: 'Eisplanet Hoth', en: 'Ice planet Hoth', nl: 'IJsplaneet Hoth', fr: 'Planète de glace Hoth' },
      d: { de: 'Das Herzstück: das große Hoth-Diorama mit dem 5,80 Meter langen AT-AT.', en: 'The centrepiece: the big Hoth diorama with the 5.80-metre AT-AT.', nl: 'Het pronkstuk: het grote Hoth-diorama met de AT-AT van 5,80 meter.', fr: 'La pièce maîtresse : le grand diorama de Hoth avec l’AT-AT de 5,80 mètres.' } },
    { id: 'mandalorian', x: 59.6, y: 43.0, lv: 'eg', img: 'neu-mandalorianer-figur', newimg: true,
      t: { de: 'The Mandalorian', en: 'The Mandalorian', nl: 'The Mandalorian', fr: 'The Mandalorian' },
      d: { de: 'Der Kopfgeldjäger in voller Rüstung, mit seinem kleinen Begleiter in der Schwebewiege.', en: 'The bounty hunter in full armour, with his little companion in the floating pram.', nl: 'De premiejager in volle wapenrusting, met zijn kleine metgezel in de zwevende wieg.', fr: 'Le chasseur de primes en armure complète, avec son petit compagnon dans son berceau flottant.' } },
    { id: 'boba', x: 66.8, y: 43.4, lv: 'eg', foto: true, img: 'neu-kopfgeldjaeger-figur-portrait', newimg: true,
      t: { de: 'Book of Boba', en: 'Book of Boba', nl: 'Book of Boba', fr: 'Book of Boba' },
      d: { de: 'Fotopoint für alle, die schon immer einmal neben einem Kopfgeldjäger stehen wollten.', en: 'A photo point for anyone who has always wanted to stand next to a bounty hunter.', nl: 'Fotopunt voor iedereen die altijd al naast een premiejager wilde staan.', fr: 'Point photo pour tous ceux qui ont toujours rêvé de poser à côté d’un chasseur de primes.' } }
  ];

  function L(o) { return o[LANG] || o.de; }
  function src(p, w) { return '/sotg-vorschau/assets/img/' + p.img + '-' + w + '.webp'; }

  var stage = root.querySelector('.lageplan__stage') || root;
  var card = document.createElement('div');
  card.className = 'lageplan__card';
  card.hidden = true;
  card.setAttribute('role', 'dialog');
  root.appendChild(card);
  var current = null;

  function close() {
    card.hidden = true;
    if (current) { current.setAttribute('aria-expanded', 'false'); current.focus(); }
    current = null;
  }
  function open(btn, p) {
    if (current === btn) { close(); return; }
    if (current) current.setAttribute('aria-expanded', 'false');
    current = btn;
    btn.setAttribute('aria-expanded', 'true');
    card.innerHTML = '';
    var fig = document.createElement('img');
    fig.src = src(p, 480); fig.alt = ''; fig.width = 480; fig.height = 320; fig.loading = 'lazy'; fig.decoding = 'async';
    var body = document.createElement('div'); body.className = 'lageplan__card-body';
    var h = document.createElement('h3'); h.textContent = L(p.t);
    var meta = document.createElement('p'); meta.className = 'lageplan__meta';
    meta.textContent = L(LV[p.lv]) + (p.foto ? ' · ' + L(UI.foto) : '');
    var d = document.createElement('p'); d.textContent = L(p.d);
    var x = document.createElement('button'); x.type = 'button'; x.className = 'lageplan__close';
    x.setAttribute('aria-label', L(UI.close)); x.textContent = '×';
    x.addEventListener('click', close);
    body.appendChild(h); body.appendChild(meta); body.appendChild(d);
    card.appendChild(x); card.appendChild(fig); card.appendChild(body);
    card.setAttribute('aria-label', L(p.t));
    // Karte neben den Punkt setzen (links/rechts je nach Position)
    card.style.left = card.style.right = '';
    if (p.x > 55) card.style.right = (100 - p.x + 2) + '%'; else card.style.left = (p.x + 2) + '%';
    card.style.top = Math.min(Math.max(p.y - 20, 2), 52) + '%';
    card.hidden = false;
  }

  P.forEach(function (p) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'lageplan__pin' + (p.foto ? ' lageplan__pin--foto' : '');
    /* Punkt an den Rand der Beschriftung setzen, damit der Plan lesbar bleibt */
    var vert = /^(hangar|jabba|dagobah)$/.test(p.id);
    b.style.left = (vert ? p.x - 3.2 : p.x) + '%'; b.style.top = (vert ? p.y : p.y - 4.2) + '%';
    b.setAttribute('aria-label', L(p.t));
    b.setAttribute('aria-expanded', 'false');
    b.setAttribute('data-event', 'lageplan-' + p.id);
    b.addEventListener('click', function (e) { e.stopPropagation(); open(b, p); });
    stage.appendChild(b);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && current) close(); });
  document.addEventListener('click', function (e) { if (current && !card.contains(e.target)) close(); });
})();

/* QA 07.11.: Hinweis unter dem Lageplan auf dem Handy */
(function () {
  var lp = document.querySelector('.lageplan');
  if (!lp) return;
  var L = (document.documentElement.lang || 'de').slice(0, 2);
  var T = { de: 'Tipp: Plan zur Seite wischen, um alles zu sehen.', en: 'Tip: swipe the plan sideways to see everything.',
            nl: 'Tip: veeg de plattegrond opzij om alles te zien.', fr: 'Astuce\u00a0: faites glisser le plan sur le côté pour tout voir.' };
  var p = document.createElement('p');
  p.className = 'lageplan__swipe'; p.textContent = T[L] || T.de;
  lp.parentNode.insertBefore(p, lp.nextSibling);
})();
