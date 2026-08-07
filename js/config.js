// ═══════════════════════════════════════════════════════════════
//  EVENT CONFIGURATION  ←  THE ONLY FILE YOU NEED TO EDIT
//
//  For a new event:
//    1. Update every section below.
//    2. Update SHEET_ID + SHEET_NAME at the top of apps-script/Code.gs.
//    3. Re-deploy Code.gs as a new Web App version and paste the URL in apiUrl.
//    4. Push to GitHub Pages — done.
// ═══════════════════════════════════════════════════════════════

const CONFIG = {

  // ── Event identity ─────────────────────────────────────────────
  eventNameEn: 'Naming Ceremony',
  eventNameMr: 'नामकरण सोहळा',

  invitedByEn: 'You are cordially invited to the',
  invitedByMr: 'आपण आमंत्रित आहात',

  // Central emoji on splash screen and invitation card
  // 👶 naming  |  🎂 birthday  |  💒 wedding  |  💍 engagement  |  🎓 graduation
  splashEmoji: '👶',

  // Subject line below the emoji (shown before reveal)
  honorTitleEn: 'Our Little Princess',
  honorTitleMr: 'आमची लाडकी राजकन्या',

  // ── Reveal ─────────────────────────────────────────────────────
  // Set revealName: false to show honorTitle.
  // On event morning set to true and push to GitHub to reveal.
  revealName: false,
  revealText: 'Meet Avani Siddhi Rohan Londhe ❤️',

  // ── Event details ──────────────────────────────────────────────
  eventDateDisplay: 'Sunday, 6 September 2026',
  eventTime:        '11:00 AM – 2:00 PM',
  venueName:        'Hitavardhani Sabha',
  venueAddress:     'Shivaji Nagar, Thane West 400602',
  eventISO:         '2026-09-06T11:00:00',

  // ── Links & contact ────────────────────────────────────────────
  googleMapsUrl: 'https://maps.app.goo.gl/Y9RFgtZZizucnUe4A',
  hostPhone:     '+919819698374',

  // ── Theme colours ──────────────────────────────────────────────
  // Change all 9 values here to instantly re-theme the entire site.
  // Pink (naming/wedding) | Blue | Purple (birthday) | Gold (anniversary)
  theme: {
    primary:   '#D4688A',   // buttons, active borders, accents
    dark:      '#A8375B',   // hover states, deep accents
    light:     '#F0BAD0',   // borders, dividers
    bg:        '#FFF0F6',   // page background
    bgDeep:    '#FAD9EA',   // gradient end, splash fill
    section:   '#FAD4E6',   // countdown strip + card footer fill
    headerTop: '#FCE4EC',   // card header gradient — top
    headerBot: '#F8BBD0',   // card header gradient — bottom
    text:      '#3B1A2A',   // main body text
  },

  // ── Google Apps Script ─────────────────────────────────────────
  // Also update SHEET_ID + SHEET_NAME at the top of apps-script/Code.gs.
  apiUrl: 'https://script.google.com/macros/s/AKfycby9y8xbgdez2pBVucXsaqfVWtLWTIrPsKPhGceCTgPhDtLj90InQrUo7KCgW2riHHTxXA/exec',

  // ── Default language ───────────────────────────────────────────
  defaultLang: 'mr',   // 'mr' = Marathi  |  'en' = English
};
