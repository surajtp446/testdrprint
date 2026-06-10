import { APPS_SCRIPT_URL } from './api.js';

// ── Rate limiting ─────────────────────────────────────────────────────────────
// Max 1 submission per 60 seconds per browser session.
let lastSubmitTime = 0;
const RATE_LIMIT_MS = 60_000;

// ── Input sanitisation ────────────────────────────────────────────────────────
function sanitise(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/[<>'"]/g, '')  // strip HTML/script characters
    .trim()
    .slice(0, 2000);          // hard cap per field
}

function sanitisePayload(obj) {
  const clean = {};
  for (const [k, v] of Object.entries(obj)) {
    clean[sanitise(String(k))] = typeof v === 'string' ? sanitise(v) : v;
  }
  return clean;
}

/**
 * Submits form data to Apps Script via GET — fire and forget.
 *
 * We use mode:'no-cors' which means the browser can NEVER read the response
 * regardless of how long we await. Awaiting just freezes the UI and turns
 * transient network blips into false error messages even though Apps Script
 * already received and processed the request.
 *
 * Solution: fire the fetch without awaiting it, stamp the rate limit, return
 * success immediately. Validation errors (rate limit, bad input) still throw
 * before the fetch is ever fired.
 */
export function submitToAppsScript(data, fileLinks = []) {
  // ── Rate limit check ──────────────────────────────────────────────────────
  const now = Date.now();
  if (now - lastSubmitTime < RATE_LIMIT_MS) {
    const waitSec = Math.ceil((RATE_LIMIT_MS - (now - lastSubmitTime)) / 1000);
    throw new Error(`Please wait ${waitSec}s before submitting again.`);
  }

  // ── Sanitise ──────────────────────────────────────────────────────────────
  const cleanData = sanitisePayload(data);
  const fileStr = fileLinks.length
    ? fileLinks.map(f => sanitise(f.name) + (f.url ? ' → ' + f.url : '')).join(' | ')
    : 'None';

  const payload = { ...cleanData, files: fileStr };
  const url = APPS_SCRIPT_URL + '?payload=' + encodeURIComponent(JSON.stringify(payload));

  // ── Fire and forget ───────────────────────────────────────────────────────
  // Stamp the rate limit BEFORE firing so rapid double-submits are blocked.
  lastSubmitTime = Date.now();
  fetch(url, { mode: 'no-cors' }).catch(() => {});  // swallow — opaque response, unreadable anyway

  return { ok: true };
}
