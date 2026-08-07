// ══════════════════════════════════════════════════════════
//  NAMING CEREMONY — MAIN APPLICATION
// ══════════════════════════════════════════════════════════

const App = {
  guest:  null,          // guest data from Apps Script
  lang:   CONFIG.defaultLang,
  counts: { adults: 1, kids: 0 },
  _cdTimer: null,

  // ── Bootstrap ────────────────────────────────────────────
  async init() {    this._applyTheme();
    document.title = CONFIG.eventNameEn;

    // Stamp the emoji from config into both HTML slots
    const se = document.getElementById('splash-emoji');
    const he = document.getElementById('hero-emoji');
    if (se) se.textContent = CONFIG.splashEmoji;
    if (he) he.textContent = CONFIG.splashEmoji;
    const id = new URLSearchParams(window.location.search).get('id');

    // Always load default language first so splash text is ready
    await I18n.load(this.lang);

    if (id) {
      try {
        const data = await API.fetchGuest(id);
        if (!data.success) { this._show('error'); return; }
        this.guest = data;
        this._setSplashGreeting();
      } catch (_) {
        this._show('error');
        return;
      }
    }

    this._show('splash');
  },

  // ── Language ─────────────────────────────────────────────
  async setLang(lang) {
    this.lang = lang;
    await I18n.load(lang);
    this._setSplashGreeting();
    this.showInvitation();
  },

  async toggleLang() {
    await this.setLang(this.lang === 'mr' ? 'en' : 'mr');
  },

  _setSplashGreeting() {
    const el = document.getElementById('splash-family');
    if (!el || !this.guest) return;
    el.textContent = this.lang === 'mr'
      ? `${this.guest.family} यांचे स्वागत!`
      : `Welcome, ${this.guest.family}!`;
  },

  // ── Screen management ────────────────────────────────────
  _show(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${name}`).classList.add('active');
  },

  // ── Invitation screen ────────────────────────────────────
  showInvitation() {
    this._fillInvite();
    this._startCountdown();
    this._show('invitation');
  },

  _fillInvite() {
    const mantraEl = document.getElementById('ev-mantra');
    if (mantraEl && CONFIG.ganeshMantra) mantraEl.textContent = CONFIG.ganeshMantra;
    const hostsEl = document.getElementById('ev-hosts');
    if (hostsEl) hostsEl.textContent = this.lang === 'mr' ? CONFIG.hostNamesMr : CONFIG.hostNamesEn;

    // Event-specific text comes from CONFIG; UI labels come from i18n
    document.getElementById('ev-invited-by').textContent =
      this.lang === 'mr' ? CONFIG.invitedByMr : CONFIG.invitedByEn;
    document.getElementById('ev-title').textContent =
      this.lang === 'mr' ? CONFIG.eventNameMr : CONFIG.eventNameEn;

    document.getElementById('ev-date').textContent  = CONFIG.eventDateDisplay;
    document.getElementById('ev-time').textContent  = CONFIG.eventTime;
    document.getElementById('ev-venue').textContent =
      `${CONFIG.venueName}, ${CONFIG.venueAddress}`;

    document.getElementById('btn-maps').href = CONFIG.googleMapsUrl;
    document.getElementById('btn-call').href = `tel:${CONFIG.hostPhone}`;

    // Hero title: reveal on event day or show honorTitle
    document.getElementById('baby-name').textContent = CONFIG.revealName
      ? CONFIG.revealText
      : (this.lang === 'mr' ? CONFIG.honorTitleMr : CONFIG.honorTitleEn);

    // Reflect existing RSVP status if already submitted
    const btn    = document.getElementById('btn-rsvp');
    const status = document.getElementById('rsvp-status');

    if (this.guest && this.guest.status && this.guest.status !== 'Pending') {
      const icons  = { Coming: '✅', 'Not Coming': '❌', Cancelled: '🚫' };
      const labelK = { Coming: 'coming', 'Not Coming': 'notComing', Cancelled: 'cancelled' };
      const icon   = icons[this.guest.status] || 'ℹ️';
      const label  = I18n.t(labelK[this.guest.status] || this.guest.status);
      status.textContent = `${icon} ${I18n.t('status')}: ${label}`;
      btn.innerHTML = `<span>${I18n.t('updateRsvp')}</span>`;
    } else {
      status.textContent = '';
      btn.innerHTML = `<span>${I18n.t('rsvpButton')}</span>`;
    }
    btn.disabled = false;
  },

  _startCountdown() {
    if (this._cdTimer) clearInterval(this._cdTimer);
    const target = new Date(CONFIG.eventISO).getTime();

    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      const pad  = n => String(n).padStart(2, '0');

      document.getElementById('cd-d').textContent = pad(Math.floor(diff / 86400000));
      document.getElementById('cd-h').textContent = pad(Math.floor((diff % 86400000) / 3600000));
      document.getElementById('cd-m').textContent = pad(Math.floor((diff % 3600000) / 60000));
      document.getElementById('cd-s').textContent = pad(Math.floor((diff % 60000) / 1000));

      if (diff === 0) clearInterval(this._cdTimer);
    };

    tick();
    this._cdTimer = setInterval(tick, 1000);
  },

  // ── RSVP form ────────────────────────────────────────────
  showRsvp() {
    if (!this.guest) {
      alert('Please use your personalized link from WhatsApp.');
      return;
    }

    // Pre-fill with existing headcount when updating
    this.counts = {
      adults: this.guest.adults > 0 ? this.guest.adults : 1,
      kids:   this.guest.kids   > 0 ? this.guest.kids   : 0,
    };
    document.getElementById('val-adults').textContent = this.counts.adults;
    document.getElementById('val-kids').textContent   = this.counts.kids;

    // Show "Cancel RSVP" only when an active response already exists
    const cancelBtn = document.getElementById('btn-cancel-rsvp');
    if (cancelBtn) {
      const canCancel = this.guest.status === 'Coming' || this.guest.status === 'Not Coming';
      cancelBtn.classList.toggle('hidden', !canCancel);
    }

    document.getElementById('step-choice').classList.remove('hidden');
    document.getElementById('step-count').classList.add('hidden');
    document.getElementById('step-spinner').classList.add('hidden');

    document.getElementById('form-family').textContent = this.guest.family;

    this._show('rsvp');
  },

  pickYes() {
    document.getElementById('step-choice').classList.add('hidden');
    document.getElementById('step-count').classList.remove('hidden');
  },

  async pickNo() {
    await this._submit('Not Coming', 0, 0);
  },

  async cancelRsvp() {
    if (!confirm(I18n.t('cancelRsvpConfirm'))) return;
    await this._submit('Cancelled', 0, 0);
  },

  inc(type) {
    this.counts[type]++;
    document.getElementById(`val-${type}`).textContent = this.counts[type];
  },

  dec(type) {
    const min = type === 'adults' ? 1 : 0;
    if (this.counts[type] > min) {
      this.counts[type]--;
      document.getElementById(`val-${type}`).textContent = this.counts[type];
    }
  },

  async confirmRsvp() {
    await this._submit('Coming', this.counts.adults, this.counts.kids);
  },

  async _submit(status, adults, kids) {
    if (!this.guest) return;

    // Show spinner, hide form steps
    document.getElementById('step-choice').classList.add('hidden');
    document.getElementById('step-count').classList.add('hidden');
    document.getElementById('step-spinner').classList.remove('hidden');

    try {
      const res = await API.submitRsvp(this.guest.id, status, adults, kids);
      if (!res.success) throw new Error(res.error || 'Server error');

      this.guest.status = status;
      this.guest.adults = adults;
      this.guest.kids   = kids;
      this._showThankyou(status, adults, kids);

    } catch (_) {
      document.getElementById('step-spinner').classList.add('hidden');
      document.getElementById('step-choice').classList.remove('hidden');
      alert('Something went wrong. Please try again.');
    }
  },

  // ── Thank You screen ─────────────────────────────────────
  _showThankyou(status, adults, kids) {
    document.getElementById('ty-family').textContent = this.guest.family;

    const msg = document.getElementById('ty-msg');
    const sum = document.getElementById('ty-summary');

    if (status === 'Coming') {
      msg.textContent = I18n.t('thankYouMessage');
      sum.innerHTML =
        `<p>👥 ${adults} ${I18n.t('adultsLabel')}` +
        (kids > 0 ? ` &amp; ${kids} ${I18n.t('childrenLabel')}` : '') + `</p>` +
        `<p>📅 ${CONFIG.eventDateDisplay}</p>` +
        `<p>⏰ ${CONFIG.eventTime}</p>` +
        `<p>📍 ${CONFIG.venueName}</p>`;
    } else if (status === 'Cancelled') {
      msg.textContent = I18n.t('thankYouCancelled');
      sum.innerHTML   = '';
    } else {
      msg.textContent = I18n.t('thankYouDeclined');
      sum.innerHTML   = '';
    }

    this._show('thankyou');
  },

  // ── Apply CONFIG.theme as CSS custom properties ────────────────
  _applyTheme() {
    const s = document.documentElement.style;
    const t = CONFIG.theme;
    s.setProperty('--gold',      t.primary);
    s.setProperty('--gold-dk',   t.dark);
    s.setProperty('--gold-lt',   t.light);
    s.setProperty('--cream',     t.bg);
    s.setProperty('--cream-dk',  t.bgDeep);
    s.setProperty('--pink-xl',   t.section);
    s.setProperty('--hdr1',      t.headerTop);
    s.setProperty('--hdr2',      t.headerBot);
    s.setProperty('--brown',     t.text);
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
