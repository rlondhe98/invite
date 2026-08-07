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
    const scr = document.querySelector('#screen-invitation .inv-scroll');
    if (scr) scr.scrollTop = 0;
  },

  _fillInvite() {
    const mantraEl = document.getElementById('ev-mantra');
    if (mantraEl && CONFIG.ganeshMantra) mantraEl.textContent = CONFIG.ganeshMantra;
    const hostsEl = document.getElementById('ev-hosts');
    if (hostsEl) hostsEl.textContent = this.lang === 'mr' ? CONFIG.hostNamesMr : CONFIG.hostNamesEn;

    // Event-specific text comes from CONFIG; UI labels come from i18n
    const invByEl = document.getElementById('ev-invited-by');
    if (invByEl) invByEl.textContent = this.lang === 'mr' ? CONFIG.invitedByMr : CONFIG.invitedByEn;
    const evTitleEl = document.getElementById('ev-title');
    if (evTitleEl) evTitleEl.textContent = this.lang === 'mr' ? CONFIG.eventNameMr : CONFIG.eventNameEn;

    document.getElementById('ev-date').textContent  = this.lang === 'mr'
      ? (CONFIG.eventDateDisplayMr || CONFIG.eventDateDisplay)
      : CONFIG.eventDateDisplay;
    document.getElementById('ev-time').textContent  = this.lang === 'mr'
      ? (CONFIG.eventTimeMr || CONFIG.eventTime)
      : CONFIG.eventTime;
    document.getElementById('ev-venue').textContent = this.lang === 'mr'
        ? `${CONFIG.venueNameMr}, ${CONFIG.venueAddressMr}` 
        : `${CONFIG.venueName}, ${CONFIG.venueAddress}`;

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
  // ── Name-guess screen ─────────────────────────────────────────
  showNameGuess() {
    const titleEl = document.getElementById('ng-title');
    const hintEl  = document.getElementById('ng-hint');
    if (titleEl) titleEl.textContent = this.lang === 'mr'
      ? 'तिचे नाव ओळखाल का?' : 'Can you guess her name?';
    if (hintEl)  hintEl.textContent  = this.lang === 'mr'
      ? (CONFIG.nameHintMr || '') : (CONFIG.nameHintEn || '');
    const inp = document.getElementById('ng-input');
    if (inp) inp.value = '';
    this._show('nameguess');
  },

  async submitNameGuess() {
    const inp = document.getElementById('ng-input');
    if (!inp) return;
    const name = inp.value.trim();
    if (!name) { inp.focus(); return; }
    const btn = document.querySelector('.btn-ng-go');
    if (btn) btn.disabled = true;
    try {
      await API.guessName(this.guest ? this.guest.id : null, name);
      inp.value = '';
      await this.showBubbles();
    } catch (_) {
      alert('Could not submit. Please try again.');
    } finally {
      if (btn) btn.disabled = false;
    }
  },

  async showBubbles() {
    this._show('bubbles');
    if (this._bubbleSim) { this._bubbleSim.stop(); this._bubbleSim = null; }
    const scene = document.getElementById('bub-scene');
    if (!scene) return;
    scene.innerHTML = '<div class="bub-msg">🪻 Loading…</div>';
    try {
      const res = await API.getNameGuesses();
      if (!res.success || !res.guesses || !res.guesses.length) {
        scene.innerHTML = '<div class="bub-msg">No guesses yet — be the first! 🌟</div>';
        return;
      }
      scene.innerHTML = '';
      const total = res.guesses.reduce((s, g) => s + g.count, 0);
      const stat = document.getElementById('bub-stat');
      if (stat) stat.textContent =
        `${total} guess${total !== 1 ? 'es' : ''} · ${res.guesses.length} unique name${res.guesses.length !== 1 ? 's' : ''}`;
      this._bubbleSim = new BubbleSimulation(scene, res.guesses);
      // defer one frame so the browser lays out the scene before we measure clientWidth/Height
      requestAnimationFrame(() => this._bubbleSim && this._bubbleSim.start());
    } catch (err) {
      const retry = err && err.name === 'AbortError' ? ' (timed out)' : '';
      scene.innerHTML = `<div class="bub-msg">Could not load guesses${retry}.<br><button onclick="App.refreshBubbles()" style="margin-top:.8rem;padding:.4rem 1rem;border-radius:20px;border:1px solid rgba(107,20,40,.3);background:rgba(107,20,40,.08);cursor:pointer;font-size:.85rem">↻ Retry</button></div>`;
    }
  },

  refreshBubbles() { this.showBubbles(); },
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

// ── Bubble Physics Simulation ───────────────────────────────────────────────
class BubbleSimulation {
  static COLORS = [
    ['#FFD580','#B86000'], ['#F28FBD','#8B1A50'], ['#A8E6CF','#1B6040'],
    ['#FFB3C6','#7A0030'], ['#C3B1E1','#4A2A7E'], ['#AEDFF7','#0A4E7C'],
    ['#FFD3B6','#903800'], ['#B5EAD7','#0E5840'],
  ];

  constructor(container, guesses) {
    this.container = container;
    this.guesses   = guesses;
    this.bubbles   = [];
    this._raf      = null;
  }

  start() {
    const W = this.container.clientWidth  || 320;
    const H = this.container.clientHeight || 400;
    const maxCount = Math.max(...this.guesses.map(g => g.count), 1);
    const minR = 30, maxR = Math.min(W, H) * 0.22;

    this.guesses.forEach((g, i) => {
      const r   = minR + (g.count / maxCount) * (maxR - minR);
      const col = BubbleSimulation.COLORS[i % BubbleSimulation.COLORS.length];
      const x   = r + Math.random() * Math.max(W - 2 * r, 1);
      const y   = r + Math.random() * Math.max(H - 2 * r, 1);
      const vx  = (Math.random() - 0.5) * 0.9;
      const vy  = (Math.random() - 0.5) * 0.9;

      const el  = document.createElement('div');
      el.className = 'bubble';
      el.style.cssText = [
        `left:${x - r}px`, `top:${y - r}px`,
        `width:${r * 2}px`, `height:${r * 2}px`,
        `background:radial-gradient(circle at 35% 35%, ${col[0]}, ${col[1]})`,
        `box-shadow:0 0 ${Math.round(r * 0.4)}px rgba(0,0,0,.28),inset 0 -4px 12px rgba(255,255,255,.18)`,
      ].join(';');
      el.innerHTML =
        `<span class="b-name">${g.name}</span><span class="b-count">${g.count}</span>`;
      el.title = `${g.name}: ${g.count} guess${g.count !== 1 ? 'es' : ''}`;
      this.container.appendChild(el);
      this.bubbles.push({ el, x, y, r, vx, vy });
    });

    this._tick();
  }

  _tick() {
    const W  = this.container.clientWidth  || 320;
    const H  = this.container.clientHeight || 400;
    const bs = this.bubbles;

    for (let i = 0; i < bs.length; i++) {
      const b = bs[i];
      b.vx += (W / 2 - b.x) * 0.00016;
      b.vy += (H / 2 - b.y) * 0.00016;

      for (let j = i + 1; j < bs.length; j++) {
        const o  = bs[j];
        const dx = b.x - o.x, dy = b.y - o.y;
        const d  = Math.sqrt(dx * dx + dy * dy) || 1;
        const mn = b.r + o.r + 8;
        if (d < mn) {
          const f = (mn - d) / d * 0.05;
          b.vx += dx * f; b.vy += dy * f;
          o.vx -= dx * f; o.vy -= dy * f;
        }
      }

      if (b.x - b.r < 0)  { b.x = b.r;      b.vx =  Math.abs(b.vx) * 0.7; }
      if (b.x + b.r > W)  { b.x = W - b.r;  b.vx = -Math.abs(b.vx) * 0.7; }
      if (b.y - b.r < 0)  { b.y = b.r;      b.vy =  Math.abs(b.vy) * 0.7; }
      if (b.y + b.r > H)  { b.y = H - b.r;  b.vy = -Math.abs(b.vy) * 0.7; }

      b.vx *= 0.984; b.vy *= 0.984;
      b.x  += b.vx;  b.y  += b.vy;
      b.el.style.left = `${b.x - b.r}px`;
      b.el.style.top  = `${b.y - b.r}px`;
    }
    this._raf = requestAnimationFrame(() => this._tick());
  }

  stop() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
  }
}

document.addEventListener('DOMContentLoaded', () => App.init());
