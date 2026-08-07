// ══════════════════════════════════════════════════════════════
//  NAMING CEREMONY — GOOGLE APPS SCRIPT BACKEND
//
//  SETUP (one-time, ~10 minutes):
//
//  1. Create a Google Sheet.
//     Add a sheet tab named: Guests-RSVP
//     Row 1 headers (A–G):
//       InviteID | FamilyName | Mobile | Status | Adults | Kids | RSVPTime
//     Pre-fill A, B, C for every family (e.g. A001, Morajkar Family, 9876…).
//     Leave D–G blank — this script fills them on RSVP.
//
//  2. Copy this file into Apps Script:
//     Sheet menu → Extensions → Apps Script → paste this code → Save.
//
//  3. Replace SHEET_ID below with the ID from your Sheet's URL:
//     https://docs.google.com/spreadsheets/d/  ← SHEET_ID →  /edit
//
//  4. Deploy as Web App:
//     Deploy → New deployment → Type: Web App
//     Execute as: Me
//     Who has access: Anyone
//     Click Deploy → copy the URL → paste into CONFIG.apiUrl in js/config.js
//
//  5. Every time you edit this file, create a NEW deployment
//     (or manage existing → update version) so changes take effect.
// ══════════════════════════════════════════════════════════════

const SHEET_ID   = '1sdHG27dpf4KdaxAAwBnJUcWJRoofiZVdBIGBOCXXro8';
const SHEET_NAME = 'Guests-RSVP';

// Column indices, 0-based
const C = {
  ID:     0,
  FAMILY: 1,
  MOBILE: 2,
  STATUS: 3,
  ADULTS: 4,
  KIDS:   5,
  TIME:   6,
};

// ── Entry point ──────────────────────────────────────────────
function doGet(e) {
  const p = e.parameter;
  let result;

  try {
    switch (p.action) {
      case 'getGuest':
        result = _getGuest(p.id);
        break;
      case 'rsvp':
        result = _rsvp(p.id, p.status, Number(p.adults) || 0, Number(p.kids) || 0);
        break;
      case 'guessName':
        result = _guessName(p.id, p.name);
        break;
      case 'getNameGuesses':
        result = _getNameGuesses();
        break;
      default:
        result = { success: false, error: 'Unknown action' };
    }
  } catch (err) {
    result = { success: false, error: err.message };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Fetch one guest row ──────────────────────────────────────
function _getGuest(id) {
  if (!id) return { success: false, error: 'No id provided' };

  const rows = _sheet().getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][C.ID]).trim() === String(id).trim()) {
      return {
        success: true,
        id:      String(rows[i][C.ID]),
        family:  rows[i][C.FAMILY],
        status:  rows[i][C.STATUS] || 'Pending',
        adults:  rows[i][C.ADULTS] || 0,
        kids:    rows[i][C.KIDS]   || 0,
      };
    }
  }

  return { success: false, error: 'Guest not found' };
}

// ── Write RSVP response ──────────────────────────────────────
function _rsvp(id, status, adults, kids) {
  if (!id)     return { success: false, error: 'No id provided' };
  if (!status) return { success: false, error: 'No status provided' };

  const sheet = _sheet();
  const rows  = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][C.ID]).trim() === String(id).trim()) {
      const r = i + 1;  // sheet rows are 1-based
      sheet.getRange(r, C.STATUS + 1).setValue(status);
      sheet.getRange(r, C.ADULTS + 1).setValue(adults);
      sheet.getRange(r, C.KIDS   + 1).setValue(kids);
      sheet.getRange(r, C.TIME   + 1).setValue(
        Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MM-yyyy HH:mm:ss')
      );
      SpreadsheetApp.flush();
      return { success: true };
    }
  }

  return { success: false, error: 'Guest not found' };
}

// ── Helper ───────────────────────────────────────────────────
function _sheet() {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
}
// ── Name-guess helpers ───────────────────────────────────────
// NameGuesses sheet must exist with headers: GuestID | GuessedName | Timestamp
const GUESS_SHEET = 'NameGuesses';

function _guessName(guestId, name) {
  if (!name || !String(name).trim()) return { success: false, error: 'Name is required' };
  const cleaned = String(name).trim().substring(0, 40); // max 40 chars
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(GUESS_SHEET);
  if (!sheet) return { success: false, error: 'NameGuesses sheet not found — please create it.' };
  sheet.appendRow([
    guestId || 'anonymous',
    cleaned,
    Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MM-yyyy HH:mm:ss'),
  ]);
  SpreadsheetApp.flush();
  return { success: true };
}

function _getNameGuesses() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(GUESS_SHEET);
  if (!sheet) return { success: true, guesses: [] };
  const rows = sheet.getDataRange().getValues();
  const counts = {};
  for (let i = 1; i < rows.length; i++) {
    const name = String(rows[i][1] || '').trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (!counts[key]) counts[key] = { name, count: 0 };
    counts[key].count++;
  }
  const guesses = Object.values(counts).sort((a, b) => b.count - a.count);
  return { success: true, guesses };
}