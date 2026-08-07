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
    const qs  = new URLSearchParams(params).toString();
    const res = await fetch(`${CONFIG.apiUrl}?${qs}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  // Returns plausible fake data when no real API URL is configured
  _mock(params) {
    if (params.action === 'getGuest') {
      return { success: true, id: params.id, family: 'Demo Family', status: 'Pending', adults: 0, kids: 0 };
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
};
