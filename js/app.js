// ══════════════════════════════════════════════════════════
//  NAMING CEREMONY — MAIN APPLICATION
// ══════════════════════════════════════════════════════════

// ?reveal=preview in the URL lets you preview the reveal without going live
const _revealPreview = new URLSearchParams(window.location.search).get('reveal') === 'preview';
const _isReveal = CONFIG.revealName || _revealPreview;

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
      ? `${this.guest.family}`
      : `${this.guest.family}!`;
  },

  // ── Screen management ────────────────────────────────────
  _show(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${name}`).classList.add('active');
  },

  // ── Invitation screen ────────────────────────────────────
  showInvitation() {
    this._stopBubbleSimulation();
    this._fillInvite();
    this._startCountdown();
    this._show('invitation');
    const scr = document.querySelector('#screen-invitation .inv-scroll');
    if (scr) scr.scrollTop = 0;

    if (_isReveal && !this._revealShown) {
      this._revealShown = true;
      this._showRevealOverlay();
    }
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
    const babyNameEl = document.getElementById('baby-name');
    const invScreen  = document.getElementById('screen-invitation');
    if (_isReveal) {
      babyNameEl.textContent = this.lang === 'mr'
        ? (CONFIG.revealTextMr || CONFIG.revealText)
        : CONFIG.revealText;
      babyNameEl.classList.add('revealed');
      invScreen.classList.add('name-revealed');
    } else {
      babyNameEl.textContent = this.lang === 'mr' ? CONFIG.honorTitleMr : CONFIG.honorTitleEn;
      babyNameEl.classList.remove('revealed');
      invScreen.classList.remove('name-revealed');
    }

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
    this._stopBubbleSimulation();
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
    this._stopBubbleSimulation();
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
    this._stopBubbleSimulation();
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

  _stopBubbleSimulation() {
    if (this._bubbleSim) {
      this._bubbleSim.stop();
      this._bubbleSim = null;
    }
  },

  // ── Endgame cinematic name-reveal overlay ────────────────────
  _showRevealOverlay() {
    const overlay = document.getElementById('reveal-overlay');
    const canvas  = document.getElementById('reveal-canvas');
    const skipBtn = document.getElementById('reveal-skip');
    if (!overlay || !canvas) return;

    if (skipBtn) skipBtn.classList.remove('show');
    overlay.classList.remove('hidden', 'dismissing');

    requestAnimationFrame(() => {
      const audio = new RevealAudio();
      this._reveal = new EndgameReveal(canvas, audio);
      const heroName = (CONFIG.revealHeroName || '').toUpperCase();
      this._reveal.start(heroName, skipBtn);
    });
  },

  dismissReveal() {
    const overlay = document.getElementById('reveal-overlay');
    if (!overlay || overlay.classList.contains('hidden')) return;
    overlay.classList.add('dismissing');
    if (this._reveal) { this._reveal.stop(); this._reveal = null; }
    setTimeout(() => {
      overlay.classList.add('hidden');
      overlay.classList.remove('dismissing');
      const skip = document.getElementById('reveal-skip');
      if (skip) skip.classList.remove('show');
    }, 600);
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

// ── Reveal Audio (MP3 playback) ─────────────────────────────────────────────
class RevealAudio {
  constructor() {
    this._audio = new Audio('audio/reveal-theme.mp3');
    this._audio.loop = false;
    this._audio.volume = 1;
  }

  startCosmicDrone() { this._audio.currentTime = 0; this._audio.play().catch(() => {}); }
  startDrumMarch() {}
  cutImpact() {}
  startStringsCrescendo() {}
  avengersBlast() {}

  startViolinFade() {
    const a = this._audio;
    const fade = () => {
      if (a.volume > 0.02) { a.volume = Math.max(0, a.volume - 0.015); requestAnimationFrame(fade); }
      else { a.volume = 0; a.pause(); }
    };
    fade();
  }

  stop() {
    try { this._audio.pause(); this._audio.currentTime = 0; } catch (_) {}
  }
}

// ── Endgame Cinematic Reveal ────────────────────────────────────────────────
class EndgameReveal {
  constructor(canvas, audio) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.audio = audio;
    this.W = 0; this.H = 0;
    this.particles = [];
    this.flashes = [];
    this.shockwaves = [];
    this.letterAnims = [];
    this.narrative = null;
    this.hero = null;
    this._raf = null;
    this._timers = [];
    this.stopped = false;
    this.t0 = 0;
    this.phase = 0;
    this.goldSpark = null;
    this._resize();
    this._onResize = () => this._resize();
    window.addEventListener('resize', this._onResize);
  }

  _resize() {
    const dpr = window.devicePixelRatio || 1;
    this.W = this.canvas.clientWidth || window.innerWidth;
    this.H = this.canvas.clientHeight || window.innerHeight;
    this.canvas.width = this.W * dpr;
    this.canvas.height = this.H * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  _sched(ms, fn) {
    if (this.stopped) return;
    this._timers.push(setTimeout(() => { if (!this.stopped) fn(); }, ms));
  }

  start(heroName, tapEl) {
    this.heroName = heroName;
    this.tapEl = tapEl;
    this.t0 = performance.now() / 1000;

    // ── Phase 1: Cosmic Dust (0-3s) ──
    this.phase = 1;
    this._spawnCosmicDust(180);
    this.goldSpark = { x: this.W / 2, y: this.H / 2, r: 0, maxR: 3, pulse: 0, growing: false };
    this.audio.startCosmicDrone();

    this._sched(500, () => {
      this.narrative = { text: 'The universe expands...', alpha: 0, target: 0.8 };
    });
    this._sched(1500, () => { if (this.goldSpark) this.goldSpark.growing = true; });

    // ── Phase 2: Assembly (3-7s) ──
    this._sched(3000, () => {
      this.phase = 2;
      this.narrative = { text: '...to welcome a new force.', alpha: 0, target: 0.8 };
      this._blueExplosion(this.W / 2, this.H / 2, 120);
      this.goldSpark = null;
      this.audio.startDrumMarch();
    });
    for (let i = 0; i < 20; i++) {
      this._sched(3400 + i * 180, () => {
        if (this.phase === 2) this._blueExplosion(this.W / 2, this.H / 2, 6);
      });
    }

    // ── Phase 3: Cinematic Cuts (7-15s) ──
    this._sched(6500, () => { this.narrative = null; });

    this._sched(7000, () => {
      this.phase = 3;
      this.particles = this.particles.filter(p => p.type === 'cosmic');
      this._flash(0.9);
      this.audio.cutImpact(0);
      this.audio.startStringsCrescendo();
      this._flyLetter(heroName[0] || 'A', -this.W * 0.3, this.H / 2, this.W * 1.3, this.H / 2, 1.5);
    });

    this._sched(9000, () => {
      this._flash(0.9);
      this.audio.cutImpact(1);
      const cx = this.W / 2, cy = this.H / 2;
      const c1 = heroName[1] || 'V', c2 = heroName[2] || 'A';
      this._flyLetter(c1, -this.W * 0.3, cy, cx - 80, cy, 1.0, () => {
        this._blueSparkBurst(cx, cy, 60);
      });
      this._flyLetter(c2, this.W * 1.3, cy, cx + 80, cy, 1.0);
    });

    this._sched(11500, () => {
      this._flash(0.7);
      this.audio.cutImpact(2);
      const cx = this.W / 2, cy = this.H / 2;
      const c3 = heroName[3] || 'N', c4 = heroName[4] || 'I';
      this._flyLetter(c3, cx - 60, this.H + 200, cx - 60, cy, 1.5);
      this._flyLetter(c4, cx + 60, this.H + 200, cx + 60, cy, 1.5);
    });

    this._sched(14000, () => { this.letterAnims = []; });

    // ── Phase 4: Climax Reveal (15-23s) ──
    this._sched(15000, () => {
      this.phase = 4;
      this.particles = this.particles.filter(p => p.type === 'cosmic');
      this._flash(1.0);
      this.audio.avengersBlast();
      this._blueExplosion(this.W / 2, this.H / 2, 80);
      this.shockwaves.push({
        x: this.W / 2, y: this.H / 2,
        r: 0, maxR: Math.max(this.W, this.H) * 0.8,
        speed: 600, lineWidth: 6, alpha: 1,
      });
      this.hero = {
        text: this.heroName, x: this.W / 2, y: this.H / 2 - 20,
        scale: 5, targetScale: 1, alpha: 0, targetAlpha: 1,
        shake: 25, energyPhase: 0,
        dissolving: false, dissolveAlpha: 1,
      };
    });

    // ── Phase 5: Ash Fade (23-28s) ──
    this._sched(23000, () => {
      this.phase = 5;
      this.audio.startViolinFade();
      if (this.hero) this.hero.dissolving = true;
      this._spawnAsh();
    });

    // Show skip button early, auto-dismiss when sequence ends
    this._sched(2000, () => { if (this.tapEl) this.tapEl.classList.add('show'); });
    this._sched(28000, () => { App.dismissReveal(); });

    this._tick();
  }

  stop() {
    this.stopped = true;
    this._timers.forEach(id => clearTimeout(id));
    this._timers = [];
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
    window.removeEventListener('resize', this._onResize);
    if (this.audio) { this.audio.stop(); this.audio = null; }
  }

  // ── Particle Spawners ──

  _spawnCosmicDust(count) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        type: 'cosmic',
        x: Math.random() * this.W, y: Math.random() * this.H,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.2,
        size: 0.5 + Math.random() * 2.5, life: 1, decay: 0,
        alpha: 0.1 + Math.random() * 0.4,
        hue: Math.random() > 0.5 ? 35 + Math.random() * 20 : 345 + Math.random() * 20,
      });
    }
  }

  _blueExplosion(x, y, count) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 2 + Math.random() * 7;
      this.particles.push({
        type: 'energy', x, y,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        size: 1 + Math.random() * 3, life: 1,
        decay: 0.004 + Math.random() * 0.008,
        alpha: 0.8, hue: 35 + Math.random() * 20,
      });
    }
  }

  _blueSparkBurst(x, y, count) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 4 + Math.random() * 10;
      this.particles.push({
        type: 'spark', x, y,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        size: 0.5 + Math.random() * 2, life: 1,
        decay: 0.02 + Math.random() * 0.03,
        alpha: 1, hue: 30 + Math.random() * 25,
      });
    }
  }

  _spawnAsh() {
    if (!this.hero) return;
    const fs = this._heroFontSize();
    this.ctx.font = '900 ' + fs + 'px "Playfair Display",serif';
    const tw = this.ctx.measureText(this.heroName).width * 1.15;
    const cx = this.hero.x, cy = this.hero.y;
    for (let i = 0; i < 400; i++) {
      this.particles.push({
        type: 'ash',
        x: cx - tw / 2 + Math.random() * tw,
        y: cy - fs * 0.4 + Math.random() * fs * 0.8,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -(0.3 + Math.random() * 1.5),
        size: 1 + Math.random() * 2.5, life: 1,
        decay: 0.002 + Math.random() * 0.004,
        alpha: 0.6, delay: Math.random() * 4,
      });
    }
  }

  _flash(intensity) {
    this.flashes.push({ alpha: intensity, decay: 0.025 + intensity * 0.015 });
  }

  _flyLetter(char, sx, sy, ex, ey, dur, onArrive) {
    this.letterAnims.push({
      char, sx, sy, ex, ey,
      t0: performance.now() / 1000 - this.t0,
      dur, arrived: false, onArrive,
    });
  }

  // ── Main Render Loop ──

  _tick() {
    if (this.stopped) return;
    const ctx = this.ctx;

    ctx.fillStyle = '#1A0810';
    ctx.fillRect(0, 0, this.W, this.H);

    if (this.phase <= 2) this._drawCosmicBg();
    this._updateParticles();
    if (this.goldSpark) this._drawGoldSpark();
    this._drawShockwaves();
    this._drawFlyingLetters();
    if (this.hero) this._drawHeroName();
    this._drawNarrative();
    this._drawFlashes();

    this._raf = requestAnimationFrame(() => this._tick());
  }

  _drawCosmicBg() {
    const ctx = this.ctx;
    const grad = ctx.createRadialGradient(
      this.W / 2, this.H * 0.6, 0,
      this.W / 2, this.H * 0.6, Math.max(this.W, this.H) * 0.7
    );
    grad.addColorStop(0, 'rgba(107,20,40,0.45)');
    grad.addColorStop(0.5, 'rgba(59,18,32,0.3)');
    grad.addColorStop(1, 'rgba(26,8,16,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.W, this.H);
  }

  _updateParticles() {
    const ctx = this.ctx;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (p.delay && p.delay > 0) { p.delay -= 0.016; continue; }

      p.x += p.vx; p.y += p.vy;
      if (p.type === 'energy' || p.type === 'spark') {
        p.vy += 0.015; p.vx *= 0.995; p.vy *= 0.995;
      }
      if (p.type !== 'cosmic') p.life -= p.decay;
      if (p.type === 'cosmic') {
        if (p.x < -10) p.x = this.W + 10;
        if (p.x > this.W + 10) p.x = -10;
        if (p.y < -10) p.y = this.H + 10;
        if (p.y > this.H + 10) p.y = -10;
      }
      if (p.life <= 0 && p.type !== 'cosmic') { this.particles.splice(i, 1); continue; }

      const a = p.alpha * (p.type === 'cosmic' ? 1 : Math.max(0, p.life));
      if (a <= 0.01) continue;
      const r = Math.max(0.1, p.size * (p.type === 'cosmic' ? 1 : p.life));

      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);

      if (p.type === 'cosmic') {
        ctx.fillStyle = 'hsla(' + p.hue + ',70%,55%,' + a + ')';
      } else if (p.type === 'energy' || p.type === 'spark') {
        ctx.fillStyle = 'hsla(' + p.hue + ',90%,60%,' + a + ')';
        ctx.shadowColor = 'hsla(' + p.hue + ',95%,50%,0.5)';
        ctx.shadowBlur = p.type === 'spark' ? 12 : 6;
      } else if (p.type === 'ash') {
        ctx.fillStyle = 'rgba(232,212,176,' + a + ')';
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  _drawGoldSpark() {
    const ctx = this.ctx;
    const g = this.goldSpark;
    g.pulse += 0.05;
    if (g.growing) { g.r = Math.min(g.r + 0.04, g.maxR); g.maxR += 0.008; }
    const b = 0.4 + Math.sin(g.pulse) * 0.2 + g.r * 0.15;
    ctx.save();
    ctx.beginPath();
    ctx.arc(g.x, g.y, 2 + g.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,215,0,' + Math.min(1, b) + ')';
    ctx.shadowColor = 'rgba(255,200,0,0.8)';
    ctx.shadowBlur = 15 + g.r * 4;
    ctx.fill();
    ctx.restore();
  }

  _drawShockwaves() {
    const ctx = this.ctx;
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const s = this.shockwaves[i];
      s.r += s.speed * 0.016;
      s.alpha *= 0.97;
      if (s.r > s.maxR || s.alpha < 0.01) { this.shockwaves.splice(i, 1); continue; }
      ctx.save();
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(184,134,12,' + s.alpha + ')';
      ctx.lineWidth = s.lineWidth * Math.max(0.1, 1 - s.r / s.maxR);
      ctx.shadowColor = 'rgba(232,180,40,0.5)';
      ctx.shadowBlur = 20;
      ctx.stroke();
      ctx.restore();
    }
  }

  _drawFlyingLetters() {
    const ctx = this.ctx;
    const t = performance.now() / 1000 - this.t0;
    const fontSize = Math.min(this.W * 0.45, 280);
    ctx.save();
    ctx.font = '900 ' + fontSize + 'px "Playfair Display",serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = this.letterAnims.length - 1; i >= 0; i--) {
      const L = this.letterAnims[i];
      const elapsed = t - L.t0;
      const progress = Math.min(1, elapsed / L.dur);

      if (progress >= 1 && !L.arrived) {
        L.arrived = true;
        if (L.onArrive) L.onArrive();
      }

      const ease = 1 - Math.pow(1 - progress, 3);
      const x = L.sx + (L.ex - L.sx) * ease;
      const y = L.sy + (L.ey - L.sy) * ease;

      // Motion blur trail
      if (progress < 1) {
        for (let b = 4; b >= 1; b--) {
          const bp = Math.max(0, progress - b * 0.025);
          const be = 1 - Math.pow(1 - bp, 3);
          const bx = L.sx + (L.ex - L.sx) * be;
          const by = L.sy + (L.ey - L.sy) * be;
          ctx.fillStyle = 'rgba(184,134,12,' + (0.12 / b) + ')';
          ctx.fillText(L.char, bx, by);
        }
      }

      const mg = ctx.createLinearGradient(x, y - fontSize / 2, x, y + fontSize / 2);
      mg.addColorStop(0, '#F0DCA0');
      mg.addColorStop(0.3, '#B8860C');
      mg.addColorStop(0.5, '#E8D4B0');
      mg.addColorStop(0.7, '#8B6914');
      mg.addColorStop(1, '#C8A850');
      ctx.fillStyle = mg;
      ctx.shadowColor = 'rgba(184,134,12,0.5)';
      ctx.shadowBlur = 15;
      ctx.fillText(L.char, x, y);

      if (L.arrived && elapsed > L.dur + 1.2) this.letterAnims.splice(i, 1);
    }
    ctx.restore();
  }

  _heroFontSize() {
    return Math.min(this.W * 0.17, 130);
  }

  _drawHeroName() {
    const ctx = this.ctx;
    const h = this.hero;

    h.scale += (h.targetScale - h.scale) * 0.12;
    h.alpha = Math.min(h.targetAlpha, h.alpha + 0.05);
    h.shake *= 0.92;
    h.energyPhase += 0.03;
    if (h.dissolving) h.dissolveAlpha = Math.max(0, h.dissolveAlpha - 0.004);

    const fontSize = this._heroFontSize();
    const ga = h.alpha * h.dissolveAlpha;

    ctx.save();
    ctx.translate(
      h.x + (Math.random() - 0.5) * h.shake,
      h.y + (Math.random() - 0.5) * h.shake
    );
    ctx.scale(h.scale, h.scale);

    ctx.font = '900 ' + fontSize + 'px "Playfair Display",serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const grad = ctx.createLinearGradient(0, -fontSize / 2, 0, fontSize / 2);
    grad.addColorStop(0, '#F8ECD0');
    grad.addColorStop(0.2, '#C89820');
    grad.addColorStop(0.45, '#F0DCA0');
    grad.addColorStop(0.65, '#8B6914');
    grad.addColorStop(1, '#D4A830');

    const glow = 0.4 + Math.sin(h.energyPhase) * 0.2;
    ctx.shadowColor = 'rgba(232,180,40,' + (glow * ga) + ')';
    ctx.shadowBlur = 40 + Math.sin(h.energyPhase * 2) * 12;
    ctx.globalAlpha = ga;
    ctx.fillStyle = grad;

    // Spaced letters
    const spacing = fontSize * 0.15;
    const chars = h.text.split('');
    const totalW = ctx.measureText(h.text).width + spacing * (chars.length - 1);
    let cx = -totalW / 2;
    chars.forEach(ch => {
      const cw = ctx.measureText(ch).width;
      ctx.fillText(ch, cx + cw / 2, 0);
      cx += cw + spacing;
    });

    ctx.strokeStyle = 'rgba(184,134,12,' + (0.4 * ga) + ')';
    ctx.lineWidth = 1.5;
    cx = -totalW / 2;
    chars.forEach(ch => {
      const cw = ctx.measureText(ch).width;
      ctx.strokeText(ch, cx + cw / 2, 0);
      cx += cw + spacing;
    });

    ctx.restore();

    // Full name text below
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  _drawNarrative() {
    if (!this.narrative) return;
    const ctx = this.ctx;
    const n = this.narrative;
    n.alpha += (n.target - n.alpha) * 0.025;
    const fs = Math.max(28, Math.min(this.W * 0.065, 42));
    ctx.save();
    ctx.font = 'italic ' + fs + 'px "Playfair Display",serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(248,237,228,' + n.alpha + ')';
    ctx.shadowColor = 'rgba(232,212,176,' + (n.alpha * 0.4) + ')';
    ctx.shadowBlur = 8;
    ctx.fillText(n.text, this.W / 2, this.H * 0.22);
    ctx.restore();
  }

  _drawFlashes() {
    const ctx = this.ctx;
    for (let i = this.flashes.length - 1; i >= 0; i--) {
      const f = this.flashes[i];
      ctx.fillStyle = 'rgba(248,237,228,' + f.alpha + ')';
      ctx.fillRect(0, 0, this.W, this.H);
      f.alpha -= f.decay;
      if (f.alpha <= 0) this.flashes.splice(i, 1);
    }
  }
}

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
    this._frame    = 0;
    this._maxFrames = 0;
  }

  start() {
    const W = this.container.clientWidth  || 320;
    const H = this.container.clientHeight || 400;
    const maxCount = Math.max(...this.guesses.map(g => g.count), 1);
    const weights = this.guesses.map(g => 0.55 + 0.45 * Math.sqrt(g.count / maxCount));
    const usableArea = W * H * 0.52;
    const unitRadius = Math.sqrt(usableArea / (Math.PI * weights.reduce((sum, weight) => sum + weight, 0)));
    const largestRadius = Math.min(W, H) * 0.22;
    this._maxFrames = Math.min(300, 120 + this.guesses.length * 6);

    this.guesses.forEach((g, i) => {
      const r   = Math.min(largestRadius, Math.max(16, unitRadius * weights[i]));
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
        `background:radial-gradient(circle at 35% 28%, ${col[0]} 0%, ${col[1]} 100%)`,
        `box-shadow:0 0 ${Math.round(r * 0.35)}px rgba(0,0,0,.32),inset 0 -5px 14px rgba(0,0,0,.2)`,
        `--bubble-name-size:${Math.max(9, Math.min(15, r * 0.32))}px`,
        `--bubble-count-size:${Math.max(8, Math.min(12, r * 0.23))}px`,
      ].join(';');
      el.innerHTML =
        `<span class="b-name">${g.name}</span><span class="b-count">${g.count}</span>`;
      el.title = `${g.name}: ${g.count} guess${g.count !== 1 ? 'es' : ''}`;
      this.container.appendChild(el);
      this.bubbles.push({ el, x, y, r, vx, vy });
    });

    this._frame = 0;
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
          const f = (mn - d) / d * 0.1;
          b.vx += dx * f; b.vy += dy * f;
          o.vx -= dx * f; o.vy -= dy * f;
        }
      }

      if (b.x - b.r < 0)  { b.x = b.r;      b.vx =  Math.abs(b.vx) * 0.7; }
      if (b.x + b.r > W)  { b.x = W - b.r;  b.vx = -Math.abs(b.vx) * 0.7; }
      if (b.y - b.r < 0)  { b.y = b.r;      b.vy =  Math.abs(b.vy) * 0.7; }
      if (b.y + b.r > H)  { b.y = H - b.r;  b.vy = -Math.abs(b.vy) * 0.7; }

      b.vx = Math.max(-2, Math.min(2, b.vx * 0.976));
      b.vy = Math.max(-2, Math.min(2, b.vy * 0.976));
      b.x  += b.vx;  b.y  += b.vy;
      b.el.style.left = `${b.x - b.r}px`;
      b.el.style.top  = `${b.y - b.r}px`;
    }
    this._frame++;
    if (this._frame < this._maxFrames) {
      this._raf = requestAnimationFrame(() => this._tick());
    } else {
      this._raf = null;
    }
  }

  stop() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
  }
}

document.addEventListener('DOMContentLoaded', () => App.init());
