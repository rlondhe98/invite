// ══════════════════════════════════════════════════════════
//  NAMING CEREMONY — i18n MODULE
//  Translations are inlined to avoid fetch/CORS issues with
//  file:// during local testing and GitHub Pages serving.
// ══════════════════════════════════════════════════════════

const I18n = {
  lang: 'en',
  cache: {
    en: {
      loading:          'Loading…',
      welcome:          'Welcome',
      welcomeSubtitle:  'आपले सहर्ष स्वागत आहे',
      chooseLanguage:   'Choose Language',
      invitedBy:        'You are cordially invited to the',
      invitationTitle:  'Naming Ceremony',
      ourBaby:          'Our Little Princess',
      date:             'Date',
      time:             'Time',
      venue:            'Venue',
      getDirections:    'Get Directions',
      callHost:         'Call Host',
      rsvpButton:       'RSVP',
      days:             'Days',
      hours:            'Hours',
      minutes:          'Minutes',
      seconds:          'Seconds',
      rsvpTitle:        'Will your family attend?',
      yes:              "Yes, we'll be there! 🎉",
      no:               "Sorry, can't make it",
      adultsLabel:      'Adults',
      childrenLabel:    'Children',
      submitRsvp:       'Confirm RSVP',
      thankYouTitle:    'Thank You! ❤️',
      thankYouMessage:  'We look forward to seeing',
      thankYouDeclined: 'We will miss you. Thank you for letting us know.',
      back:             'Back',
      backToInvite:     'Back to Invitation',
      status:           'Status',
      coming:           'Coming',
      notComing:        'Not Coming',
      alreadyRsvp:      'RSVP Submitted ✓',
      updateRsvp:       'Update RSVP',
      withLove:         'With love,',
      guessNameCta:     'Can you guess her name?',
      hint1:            'As old as the Earth',
      hint2:            'Rooted in nature',
      hint3:            '5 letters',
      seeGuesses:       'See all guesses',
      guessesTitle:     'Name Guesses 🪻',
      cancelRsvp:       'Cancel my RSVP',
      cancelRsvpConfirm:'Remove your RSVP? You can always re-submit.',
      cancelled:        'Cancelled',
      thankYouCancelled:'Your RSVP has been removed. We hope to see you soon!',
    },
    mr: {
      loading:          'लोड होत आहे…',
      welcome:          'स्वागत',
      welcomeSubtitle:  'आपले सहर्ष स्वागत आहे',
      chooseLanguage:   'भाषा निवडा',
      invitedBy:        'आपण आमंत्रित आहात',
      invitationTitle:  'नामकरण सोहळा',
      ourBaby:          'आमची लाडकी राजकन्या',
      date:             'दिनांक',
      time:             'वेळ',
      venue:            'स्थळ',
      getDirections:    'दिशा मिळवा',
      callHost:         'यजमानांना कॉल करा',
      rsvpButton:       'उपस्थिती नोंदवा',
      days:             'दिवस',
      hours:            'तास',
      minutes:          'मिनिटे',
      seconds:          'सेकंद',
      rsvpTitle:        'आपले कुटुंब येणार का?',
      yes:              'हो, आम्ही येणार आहोत! 🎉',
      no:               'माफ करा, येणे शक्य नाही',
      adultsLabel:      'प्रौढ',
      childrenLabel:    'मुले',
      submitRsvp:       'उपस्थिती निश्चित करा',
      thankYouTitle:    'धन्यवाद! ❤️',
      thankYouMessage:  'आपली भेट होण्याची आम्ही आतुरतेने वाट पाहत आहोत',
      thankYouDeclined: 'आपली उणीव जाणवेल. कळविल्याबद्दल धन्यवाद.',
      back:             'परत',
      backToInvite:     'आमंत्रणावर परत जा',
      status:           'स्थिती',
      coming:           'येत आहे',
      notComing:        'येत नाही',
      alreadyRsvp:      'उपस्थिती नोंदवली ✓',
      updateRsvp:       'उपस्थिती बदला',
      withLove:         'सप्रेम,',
      guessNameCta:     'तिचे नाव ओळखाल का?',
      hint1:            'पृथ्वीइतके पुरातन',
      hint2:            'निसर्गाशी जोडलेले',
      hint3:            'ા अक्षरे',
      seeGuesses:       'सर्वांचे अंदाज पाहा',
      guessesTitle:     'नावाचे अंदाज 🪻',
      cancelRsvp:       'उपस्थिती रद्द करा',
      cancelRsvpConfirm:'उपस्थिती रद्द करायची आहे का?',
      cancelled:        'रद्द केली',
      thankYouCancelled:'आपली उपस्थिती रद्द केली. लवकरच भेटू!',
    },
  },

  async load(lang) {
    this.lang = lang;
    this._apply();
  },

  _apply() {
    const dict = this.cache[this.lang] || {};
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const val = dict[el.dataset.i18n];
      if (val != null) el.textContent = val;
    });
    document.documentElement.lang = this.lang === 'mr' ? 'mr' : 'en';

    // Update language toggle button label (shows the other language)
    const toggle = document.getElementById('btn-lang-toggle');
    if (toggle) toggle.textContent = this.lang === 'mr' ? 'English' : 'मराठी';
  },

  // Returns translated string, falling back to the key itself
  t(key) {
    return (this.cache[this.lang] || {})[key] ?? key;
  },
};
