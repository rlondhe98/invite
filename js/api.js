// ══════════════════════════════════════════════════════════
//  NAMING CEREMONY — API MODULE
//  Talks to the Google Apps Script backend.
//  Both getGuest and submitRsvp use GET so CORS is never an issue.
// ══════════════════════════════════════════════════════════

const API = {

  async _get(params) {
    if (CONFIG.apiUrl.includes('REPLACE_WITH_YOUR_SCRIPT_ID')) {
      // Demo mode: return mock data so the UI can be previewed locally
      return this._mock(params);
    }
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 25000);
    try {
      const qs  = new URLSearchParams(params).toString();
      const res = await fetch(`${CONFIG.apiUrl}?${qs}`, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } finally {
      clearTimeout(timer);
    }
  },

  // Returns plausible fake data when no real API URL is configured
  _mock(params) {
    if (params.action === 'getGuest') {
      return { success: true, id: params.id, family: 'Demo Family', status: 'Pending', adults: 0, kids: 0 };
    }
    if (params.action === 'getNameGuesses') {
      return { success: true, guesses: [
        { name: 'Avani', count: 8 }, { name: 'Aanya', count: 5 },
        { name: 'Aditi', count: 4 }, { name: 'Arya',  count: 3 },
        { name: 'Anvi',  count: 2 }, { name: 'Anjali',count: 2 },
        { name: 'Priya', count: 1 }, { name: 'Nisha', count: 1 },
      ]};
    }
    return { success: true };
  },

  // Returns { success, id, family, status, adults, kids }
  fetchGuest(id) {
    return this._get({ action: 'getGuest', id });
  },

  // Returns { success: true } on success
  submitRsvp(id, status, adults, kids) {
    return this._get({ action: 'rsvp', id, status, adults, kids });
  },

  guessName(guestId, name) {
    return this._get({ action: 'guessName', id: guestId || '', name });
  },

  // Returns { success, guesses: [{name, count}] } sorted by count desc
  getNameGuesses() {
    return this._get({ action: 'getNameGuesses' });
  },
};
