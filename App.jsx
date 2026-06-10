import { APPS_SCRIPT_URL } from './api.js';

// ── File validation constants ─────────────────────────────────────────────────
const MAX_FILE_SIZE_MB    = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_EXTENSIONS  = new Set([
  'stl','step','stp','obj','3mf','iges','igs',
  'pdf','zip','png','jpg','jpeg','webp',
]);

function validateFile(file) {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!ALLOWED_EXTENSIONS.has(ext))
    throw new Error(`"${file.name}" has a disallowed file type (.${ext}).`);
  if (file.size > MAX_FILE_SIZE_BYTES)
    throw new Error(`"${file.name}" exceeds the ${MAX_FILE_SIZE_MB} MB limit.`);
  if (/[/\\<>:"|?*]/.test(file.name))
    throw new Error(`"${file.name}" contains invalid characters.`);
  return true;
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error(`Failed to read "${file.name}"`));
    reader.readAsDataURL(file);
  });
}

/**
 * Validates files, encodes them, then fires the upload — fire and forget.
 *
 * Validation and base64 encoding are awaited (they're local CPU work and can
 * throw meaningful errors). The fetch itself is fired without awaiting because:
 *   - mode:'no-cors' makes the response permanently unreadable
 *   - Apps Script receives the payload even if we don't wait for it to finish
 *   - Awaiting caused 3–10 second freezes and false error messages
 *
 * @throws {Error} if any file fails validation — shown to user before upload fires
 */
export async function uploadFilesToDrive(files, orderDetails) {
  if (!files || files.length === 0) return [];

  // Validate before encoding anything — throws immediately on bad files
  for (const file of files) validateFile(file);

  // Encode locally (CPU work — must await)
  const encodedFiles = await Promise.all(files.map(async f => ({
    filename: f.name.replace(/[^a-zA-Z0-9._-]/g, '_'),
    mimetype: f.type || 'application/octet-stream',
    data:     await readFileAsBase64(f),
  })));

  // Fire and forget — don't await an unreadable opaque response
  fetch(APPS_SCRIPT_URL, {
    method:  'POST',
    mode:    'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body:    JSON.stringify({
      type:  'file_upload',
      files: encodedFiles,
      order: orderDetails || {},
    }),
  }).catch(() => {});

  return files.map(f => ({ name: f.name, url: 'Sent' }));
}
