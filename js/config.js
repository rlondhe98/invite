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

  invitedByEn: 'With heart full of joy,\nwe warmly welcome you for the',
  invitedByMr: 'आनंदाने आपले सहर्ष\nस्वागत आहे',

  // Central emoji on splash screen and invitation card
  // 👶 naming  |  🎂 birthday  |  💒 wedding  |  💍 engagement  |  🎓 graduation
  splashEmoji: '👶',

  // Subject line below the emoji (shown before reveal)
  honorTitleEn: 'of our beloved Baby Girl',
  honorTitleMr: 'आमच्या लाडक्या बाळाचे',

  // ── Reveal ─────────────────────────────────────────────────────
  // Set revealName: false to show honorTitle.
  // On event morning set to true and push to GitHub to reveal.
  revealName: false,
  revealText: 'Meet Avani Siddhi Rohan Londhe ❤️',
  revealTextMr: 'आमची लाडकी राजकन्या अवनी सिद्धी रोहन लोंढे ❤️',

  // ── Hosts ──────────────────────────────────────────────────────
  
  // Hosts shown in the signature at the bottom of the card
  hostNamesEn:  'Siddhi & Rohan',
  hostNamesMr:  'सिद्धी आणि रोहन',

  // Sanskrit invocation at top of card — set '' to hide for non-religious events
  ganeshMantra: '॥ श्री गणेशाय नम: ॥',

  // Name-reveal game — hints about Avani (Earth / पृथ्वी) without revealing the name
  nameHintEn:  'She carries a name as ancient and nurturing as the Earth itself.\nWhat do you think it could be?',
  nameHintMr:  'तिचे नाव पृथ्वीइतके पुरातन आणि पोषक आहे.\nतुम्हाला काय वाटतं?',
  nameGuessSheetName: 'NameGuesses',

  // ── Event details ──────────────────────────────────────────────
  eventDateDisplay:   'Sunday, 6 September 2026',
  eventDateDisplayMr: 'रविवार, ६ सप्टेंबर २०२६',
  eventTime:          '11:00 AM onwards',
  eventTimeMr:        'सकाळी ११:०० वाजल्यापासून पुढे',
  venueName:        'Hithavardhani Sabha Hall',
  venueNameMr:      'हितवर्धिनी सभागृह',
  venueAddress:     'Shivaji Nagar, Thane West',
  venueAddressMr:   'शिवाजी नगर, ठाणे पश्चिम',
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
  apiUrl: 'https://script.google.com/macros/s/AKfycbxs8AKRT-9emHLXgHac4cTVO6WZ-eeu1TH8Ict16C6Q5wVL8Gisj1AhsB7umd0jAWxmEQ/exec',

  // ── Default language ───────────────────────────────────────────
  defaultLang: 'mr',   // 'mr' = Marathi  |  'en' = English
};
