/* ============================================================
   PrintCalc Pro - app.js
   Parses STL/OBJ in-browser, renders 3-D preview, calculates price.
   No build step. Open index.html directly in Chrome (or Live Server).
   ============================================================ */

'use strict';

// === CONFIGURATION (edit rates here) ========================
const CONFIG = {
  // wtMul = slicer calibration multiplier.
  // Calibrated against Bambu Studio default profiles (0.4mm nozzle, 2 walls, 0.2mm layer).
  // Set to 1.0 for all materials — shell volume factor handles the geometry correction.
  materials: {
    PLA:   { name: 'PLA',     subtitle: '₹6/g',  density: 1.24, pricePerGram: 6,  color: '#22c55e', wtMul: 1.0 },
    PETG:  { name: 'PETG',   subtitle: '₹12/g', density: 1.27, pricePerGram: 12, color: '#f97316', wtMul: 1.0 },
    ASA:   { name: 'ASA',    subtitle: '₹14/g', density: 1.07, pricePerGram: 14, color: '#3b82f6', wtMul: 1.0 },
    TPU:   { name: 'TPU',    subtitle: '₹14/g', density: 1.21, pricePerGram: 14, color: '#a855f7', wtMul: 1.0 },
    PA6CF: { name: 'PA6-CF', subtitle: '₹20/g', density: 1.12, pricePerGram: 20, color: '#14b8a6', wtMul: 1.0 },
    PA12CF:{ name: 'PA12-CF',subtitle: '₹20/g', density: 1.08, pricePerGram: 20, color: '#64748b', wtMul: 1.0 },
  },
  quality: {
    draft:    { name: 'Draft',    icon: '⚡', layer: '0.3 mm', desc: 'Fast print',  multiplier: 0.85, layerMM: 0.3 },
    standard: { name: 'Standard', icon: '⭐', layer: '0.2 mm', desc: 'Balanced',    multiplier: 1.00, layerMM: 0.2 },
    fine:     { name: 'Fine',     icon: '💎', layer: '0.1 mm', desc: 'Best detail', multiplier: 1.60, layerMM: 0.1 },
  },
  pricing: {
    setupFee:      50,   // flat fee per order (INR)
    minPrice:      150,  // minimum charge (INR)
    supportInfill: 0.05, // support structures print at ~5% infill (OrcaSlicer default)
  },
  printers: {
    A1:  {
      name:      'Bambu A1',
      desc:      'Open frame',
      // Open frame — high-temp materials (ASA, PA-CF) are unreliable without enclosure
      materials: ['PLA', 'PETG', 'TPU'],
    },
    P1S: {
      name:      'Bambu P1S',
      desc:      'Enclosed',
      // Fully enclosed — handles all materials including high-temp engineering filaments
      materials: ['PLA', 'PETG', 'ASA', 'TPU', 'PA6CF', 'PA12CF'],
    },
  },
  // Bambu Lab default slicer profile (0.4 mm nozzle, standard quality)
  // Source: bambulab/BambuStudio → resources/profiles/BBL/process/fdm_process_common.json
  slicer: {
    wallCount:    2,    // wall_loops in Bambu profile
    lineWidth:    0.42, // mm — actual Bambu value (was wrong at 0.45)
    layerHeight:  0.20, // mm
    topLayers:    5,    // top solid layers  (fdm_process_single_0.20 overrides base)
    botLayers:    3,    // bottom solid layers (fdm_process_common base)
  },
};

// Slicer bridge — optional local OrcaSlicer server for exact weights.
// Falls back to volume-based estimation automatically if unavailable.
const SLICER_SERVER = '';

// === STATE ==================================================
const state = {
  modelData:     null,
  gcodeWeight:   null,
  printer:       'A1',
  material:      'PLA',
  quality:       'standard',
  infill:        20,
  infillType:    'grid',
  walls:         CONFIG.slicer.wallCount,
  quantity:      1,
  supports:      true,
  viewerRAF:     null,
  viewerDispose: null,
  viewer:        null,  // { scene, camera, renderer, mesh, container, controls }
  layFlatMode:   false, // true when user is picking a face
};

// === BOOT ===================================================
document.addEventListener('DOMContentLoaded', () => {
  renderPrinterOptions();
  renderMaterialOptions();
  renderQualityOptions();
  renderSupportToggle();
  setupUpload();
  setupControls();
  renderInfillTypes();
  // Sync preview to initial slider values then draw once layout is settled
  previewAnim.infill = previewAnim.infillTarget = state.infill;
  previewAnim.walls  = previewAnim.wallsTarget  = state.walls;
  requestAnimationFrame(drawPreview);
});

// === FILE UPLOAD / DRAG-DROP ================================
function setupUpload() {
  const dropZone  = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');

  dropZone.addEventListener('dragover',  e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  });
  fileInput.addEventListener('change', e => {
    const f = e.target.files[0];
    if (f) processFile(f);
    fileInput.value = '';
  });
  document.getElementById('btn-reset').addEventListener('click', resetToUpload);
}

function resetToUpload() {
  document.getElementById('upload-screen').classList.remove('hidden');
  document.getElementById('calc-screen').classList.add('hidden');
  if (state.viewerDispose) { state.viewerDispose(); state.viewerDispose = null; }
  state.modelData   = null;
  state.gcodeWeight = null;
  state.viewer      = null;
  state.layFlatMode = false;
  originalPositions = null;
  originalAreas = null;
  hideOrientControls();
  document.getElementById('price-breakdown').innerHTML = '<p class="muted-text">Upload a model to see pricing.</p>';
  document.getElementById('total-price').innerHTML = '₹&nbsp;—';
}

// ── Slicer server status indicator ────────────────────────────────────────────
async function checkSlicerStatus() {
  const el = document.getElementById('slicer-status');
  if (!el) return;
  if (!SLICER_SERVER) {
    el.className   = 'slicer-status slicer-status--offline';
    el.textContent = '● Estimation mode';
    el.title       = 'Weights calculated from model volume.';
    return;
  }
  try {
    const res  = await fetch(SLICER_SERVER + '/status', { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    if (data.slicerReady) {
      el.className  = 'slicer-status slicer-status--online';
      el.textContent = '● OrcaSlicer ready';
      el.title      = 'Connected — exact weights from OrcaSlicer';
    } else {
      el.className  = 'slicer-status slicer-status--offline';
      el.textContent = '● Estimation mode';
      el.title      = 'Weights are estimated (±20%).';
    }
  } catch {
    el.className  = 'slicer-status slicer-status--offline';
    el.textContent = '● Estimation mode';
    el.title       = 'Weights calculated from model volume.';
  }
}
// Check on load, then every 10 s
checkSlicerStatus();
setInterval(checkSlicerStatus, 10000);

// Try to get exact weight from the local OrcaSlicer bridge server.
// Returns { modelWeight, supportWeight, totalWeight } or null if server is unavailable.
async function trySlicerServer(file) {
  if (!SLICER_SERVER) return null;
  try {
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 180000); // 3 min timeout
    const res   = await fetch(SLICER_SERVER + '/slice', {
      method:  'POST',
      body:    file,
      headers: {
        'X-Infill':    String(state.infill),
        'X-Supports':  state.supports ? 'true' : 'false',
        'X-Printer':   state.printer,
        'X-Material':  state.material,
      },
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    return (data && data.totalWeight > 0) ? data : null;
  } catch {
    return null; // Server not running — fall back to estimation silently
  }
}

async function processFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (!['stl', 'obj', 'gcode'].includes(ext)) {
    alert('Please upload a .STL, .OBJ, or .gcode file.');
    return;
  }
  if (ext === 'gcode') { await processGcode(file); return; }

  document.getElementById('upload-screen').classList.add('hidden');
  document.getElementById('calc-screen').classList.remove('hidden');
  document.getElementById('model-stats').innerHTML = '';
  document.getElementById('viewer').innerHTML = '<div class="viewer-loading">Parsing model…</div>';

  await new Promise(r => setTimeout(r, 30));

  try {
    const buffer    = await file.arrayBuffer();
    const modelData = (ext === 'stl')
      ? parseSTL(buffer)
      : parseOBJ(new TextDecoder().decode(buffer));

    if (!modelData || modelData.triCount === 0) throw new Error('No geometry found in file.');

    state.modelData   = modelData;
    state.gcodeWeight = null;
    // Save original positions for orientation reset
    originalPositions = new Float32Array(modelData.positions);
    // Save original face areas — used for weight calculation (orientation-independent)
    originalAreas = {
      wallArea:       modelData.wallArea,
      horizontalArea: modelData.horizontalArea,
      surfaceArea:    modelData.surfaceArea,
    };
    // Auto-detect: >3% of surface area is overhang → support needed
    state.supports  = modelData.overhangRatio > 0.03;
    renderSupportToggle();

    // Viewer is optional — a CDN/WebGL failure must not kill the price calculator
    try {
      setupViewer(modelData);
    } catch (viewerErr) {
      // warn suppressed
      document.getElementById('viewer').innerHTML =
        '<div class="viewer-loading" style="flex-direction:column;gap:6px">' +
        '<span style="font-size:28px">&#x1F4E6;</span>' +
        '<span>3D preview unavailable</span>' +
        '<small style="font-size:11px;opacity:.6">' + viewerErr.message + '</small>' +
        '</div>';
    }

    updateModelStats();
    updatePrice();
    showOrientControls();
    updateOrientInfo();
  } catch (err) {
    // error suppressed
    alert('Could not parse file: ' + err.message + '\n\nMake sure the file is a valid STL or OBJ.');
    resetToUpload();
  }
}

// === GCODE IMPORT (Bambu Studio / OrcaSlicer) ===============
// Reads exact weights that Bambu already computed — 100% accurate.
// User: slice in Bambu Studio → File → Export → Export Plate Sliced File → upload here.
function parseGcode(text) {
  const h = text.slice(0, 8000); // header only
  let total = null, support = 0, m;

  // Bambu Studio 1.x:  "; total filament weight[g] = 12.56"
  m = h.match(/;\s*total\s+filament\s+weight\s*\[g\]\s*=\s*([\d.]+)/i);
  if (m) total = parseFloat(m[1]);

  // OrcaSlicer / Bambu 2.x: "; total filament used [g] = 12.56"
  if (total === null) {
    m = h.match(/;\s*total\s+filament\s+used\s*\[g\]\s*=\s*([\d.]+)/i);
    if (m) total = parseFloat(m[1]);
  }

  // Fallback: "; filament used [g] = 12.34, 5.70" (multi-material — sum all)
  if (total === null) {
    m = h.match(/;\s*filament\s+used\s*\[g\]\s*=\s*([\d.,\s]+)/i);
    if (m) {
      const s = m[1].split(',').reduce((a, v) => a + (parseFloat(v.trim()) || 0), 0);
      if (s > 0) total = s;
    }
  }

  if (total === null || total <= 0) return null;

  // Support weight (Bambu Studio 2.x+)
  m = h.match(/;\s*support\s+(?:filament\s+used|material\s+used)\s*\[g\]\s*=\s*([\d.]+)/i);
  if (m) support = parseFloat(m[1]);

  return { totalWeight: total, supportWeight: support, modelWeight: Math.max(0, total - support) };
}

async function processGcode(file) {
  document.getElementById('upload-screen').classList.add('hidden');
  document.getElementById('calc-screen').classList.remove('hidden');
  document.getElementById('model-stats').innerHTML = '';
  document.getElementById('viewer').innerHTML = '<div class="viewer-loading">Reading G-code…</div>';
  await new Promise(r => setTimeout(r, 30));

  try {
    const weights = parseGcode(await file.text());
    if (!weights) throw new Error(
      'No weight data found in this file.\n\n' +
      'In Bambu Studio: after slicing, go to\n' +
      'File → Export → Export Plate Sliced File (.gcode)\n' +
      'then upload that file here.'
    );

    state.gcodeWeight = weights;
    state.modelData   = null;
    state.supports    = weights.supportWeight > 0.01;
    renderSupportToggle();

    document.getElementById('viewer').innerHTML =
      '<div class="viewer-loading" style="gap:10px">' +
      '<span style="font-size:36px">&#x2705;</span>' +
      '<span style="font-weight:600;color:#22c55e">Bambu G-code loaded</span>' +
      '<small style="opacity:.55">' + file.name + '</small>' +
      '<small style="opacity:.55">Weight read directly from Bambu Slicer</small>' +
      '</div>';

    updateModelStats();
    updatePrice();
  } catch (err) {
    // error suppressed
    alert('Could not read G-code:\n\n' + err.message);
    resetToUpload();
  }
}

// === STL PARSER =============================================
function parseSTL(buffer) {
  const view     = new DataView(buffer);
  const triCount = view.getUint32(80, true);
  const isBinary = (buffer.byteLength === 84 + triCount * 50) && triCount > 0;
  return isBinary ? parseBinarySTL(view, triCount) : parseASCIISTL(buffer);
}

function parseBinarySTL(view, triCount) {
  const positions = new Float32Array(triCount * 9);
  const bbox = initBBox();
  let offset = 84, pi = 0;
  for (let i = 0; i < triCount; i++) {
    offset += 12; // skip face normal
    for (let j = 0; j < 3; j++) {
      const x = view.getFloat32(offset,     true);
      const y = view.getFloat32(offset + 4, true);
      const z = view.getFloat32(offset + 8, true);
      offset += 12;
      positions[pi++] = x; positions[pi++] = y; positions[pi++] = z;
      expandBBox(bbox, x, y, z);
    }
    offset += 2; // skip attribute byte count
  }
  return buildModelData(positions, triCount, bbox);
}

function parseASCIISTL(buffer) {
  const text = new TextDecoder().decode(buffer);
  const raw  = [];
  const bbox = initBBox();
  const re   = /vertex\s+([\d.eE+\-]+)\s+([\d.eE+\-]+)\s+([\d.eE+\-]+)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const x = parseFloat(m[1]), y = parseFloat(m[2]), z = parseFloat(m[3]);
    raw.push(x, y, z);
    expandBBox(bbox, x, y, z);
  }
  return buildModelData(new Float32Array(raw), raw.length / 9, bbox);
}

// === OBJ PARSER =============================================
function parseOBJ(text) {
  const verts = [];
  const raw   = [];
  const bbox  = initBBox();
  for (const line of text.split('\n')) {
    const t = line.trimStart();
    if (/^v\s/.test(t)) {
      const p = t.split(/\s+/);
      const x = parseFloat(p[1]), y = parseFloat(p[2]), z = parseFloat(p[3]);
      verts.push([x, y, z]);
      expandBBox(bbox, x, y, z);
    } else if (/^f\s/.test(t)) {
      const p   = t.split(/\s+/).slice(1);
      const idx = p.map(tok => {
        const i = parseInt(tok.split('/')[0]);
        return i > 0 ? i - 1 : verts.length + i;
      });
      for (let i = 1; i < idx.length - 1; i++) {
        const v0 = verts[idx[0]], v1 = verts[idx[i]], v2 = verts[idx[i + 1]];
        if (v0 && v1 && v2) raw.push(...v0, ...v1, ...v2);
      }
    }
  }
  return buildModelData(new Float32Array(raw), raw.length / 9, bbox);
}

// === BBOX HELPERS ===========================================
function initBBox() {
  return { minX: Infinity, minY: Infinity, minZ: Infinity,
           maxX: -Infinity, maxY: -Infinity, maxZ: -Infinity };
}
function expandBBox(b, x, y, z) {
  if (x < b.minX) b.minX = x; if (x > b.maxX) b.maxX = x;
  if (y < b.minY) b.minY = y; if (y > b.maxY) b.maxY = y;
  if (z < b.minZ) b.minZ = z; if (z > b.maxZ) b.maxZ = z;
}

// === OVERHANG ANALYSIS ======================================
// For each face, compute its normal via cross-product of two edges.
// If the normal's Z component is < -cos(45°) ≈ -0.707, the face points
// more than 45° downward — it is an overhang that needs support.
// The bottom face of any model (sitting on the bed) is excluded because
// the bed itself is the support — counting it would inflate support weight.
//
// SELF-SUPPORT DETECTION (like Bambu Studio):
// For each downward-facing face (>45°), cast a ray straight down from its centroid.
// If the ray hits another triangle in the model before reaching the bed,
// that face is SELF-SUPPORTED (e.g. inside of a cup) and does NOT need support.
// Only truly unsupported overhangs hanging over open air count.
function analyzeOverhangs(positions) {
  // Pass 1: find the lowest Z vertex (bed level)
  let minZ = Infinity;
  for (let i = 2; i < positions.length; i += 3) {
    if (positions[i] < minZ) minZ = positions[i];
  }
  const BED_CLEARANCE = 1.0; // mm — faces within 1mm of bed are bed-contact

  const SLOPE = 0.707; // cos(45°)
  const triCount = positions.length / 9;

  // Pass 2: classify all faces and build overhang candidate list
  let wallArea     = 0;
  let surfaceArea  = 0;
  const overhangCandidates = []; // { centroid, area }

  for (let i = 0; i < positions.length; i += 9) {
    const ax = positions[i+3]-positions[i],   ay = positions[i+4]-positions[i+1], az = positions[i+5]-positions[i+2];
    const bx = positions[i+6]-positions[i],   by = positions[i+7]-positions[i+1], bz = positions[i+8]-positions[i+2];
    const nx = ay*bz - az*by;
    const ny = az*bx - ax*bz;
    const nz = ax*by - ay*bx;
    const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
    if (len < 1e-10) continue;
    const area   = len * 0.5;
    const nzNorm = nz / len;
    surfaceArea += area;

    if (nzNorm < -SLOPE) {
      // Downward-facing face — potential overhang
      const cx = (positions[i] + positions[i+3] + positions[i+6]) / 3;
      const cy = (positions[i+1] + positions[i+4] + positions[i+7]) / 3;
      const cz = (positions[i+2] + positions[i+5] + positions[i+8]) / 3;
      if (cz > minZ + BED_CLEARANCE) {
        overhangCandidates.push({ cx, cy, cz, area, triIndex: i });
      }
    } else if (Math.abs(nzNorm) <= SLOPE) {
      wallArea += area;
    }
  }

  // Pass 3: Ray-cast self-support check for each overhang candidate.
  // Cast a ray from centroid straight DOWN (-Z). If it hits another triangle
  // in the model (that isn't the same face), the overhang is self-supported.
  // Uses Möller–Trumbore ray-triangle intersection.
  //
  // Performance: For large models, O(candidates × triangles) is slow.
  // If > 300 candidates, sample 300 and extrapolate by area ratio.
  let overhangArea = 0;
  const MAX_CANDIDATES = 300;
  let candidates = overhangCandidates;
  let totalCandArea = 0;
  for (const c of overhangCandidates) totalCandArea += c.area;

  let sampling = false;
  if (candidates.length > MAX_CANDIDATES) {
    // Sample proportional to area — shuffle then take first N
    sampling = true;
    const shuffled = overhangCandidates.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    candidates = shuffled.slice(0, MAX_CANDIDATES);
  }

  let sampledOverhangArea = 0;
  let sampledTotalArea = 0;
  const RAY_DZ = -1; // ray direction: straight down

  for (const cand of candidates) {
    sampledTotalArea += cand.area;
    let selfSupported = false;

    for (let j = 0; j < positions.length; j += 9) {
      if (j === cand.triIndex) continue; // skip self

      const v0x = positions[j],   v0y = positions[j+1], v0z = positions[j+2];
      const v1x = positions[j+3], v1y = positions[j+4], v1z = positions[j+5];
      const v2x = positions[j+6], v2y = positions[j+7], v2z = positions[j+8];

      // Triangle must be BELOW the overhang centroid to provide support
      const maxTriZ = Math.max(v0z, v1z, v2z);
      if (maxTriZ >= cand.cz - 0.01) continue; // not below us

      // Möller–Trumbore intersection with ray (cand.cx, cand.cy, cand.cz) + t*(0, 0, -1)
      const e1x = v1x - v0x, e1y = v1y - v0y, e1z = v1z - v0z;
      const e2x = v2x - v0x, e2y = v2y - v0y, e2z = v2z - v0z;

      // h = cross(ray_dir, e2) = cross((0,0,-1), e2) = (-1*e2y - 0, 0 - (-1*e2x), 0) = (e2y, -e2x, 0) ... wait
      // cross((0,0,-1), (e2x,e2y,e2z)) = (0*e2z - (-1)*e2y, (-1)*e2x - 0*e2z, 0*e2y - 0*e2x)
      //                                 = (e2y, -e2x, 0)
      const hx = e2y, hy = -e2x, hz = 0;
      const a = e1x * hx + e1y * hy + e1z * hz; // dot(e1, h)
      if (a > -1e-7 && a < 1e-7) continue; // parallel

      const f = 1.0 / a;
      const sx = cand.cx - v0x, sy = cand.cy - v0y, sz = cand.cz - v0z;
      const u = f * (sx * hx + sy * hy + sz * hz);
      if (u < 0 || u > 1) continue;

      // q = cross(s, e1)
      const qx = sy * e1z - sz * e1y;
      const qy = sz * e1x - sx * e1z;
      const qz = sx * e1y - sy * e1x;
      const v = f * (RAY_DZ * qz); // dot(ray_dir, q) = 0*qx + 0*qy + (-1)*qz
      if (v < 0 || u + v > 1) continue;

      const t = f * (e2x * qx + e2y * qy + e2z * qz); // dot(e2, q)
      // t = distance along ray to the hit point.
      // If ANY solid triangle exists below this overhang face (at any distance),
      // it's either self-supported or bridgeable — no external support needed.
      // Bambu handles these as "bridge" infill (0.57g), not support structures.
      // A straight-down ray naturally won't hit horizontally-offset geometry,
      // so this correctly distinguishes:
      //   - Upright cup inner bottom → ray hits outer bottom → self-supported ✓
      //   - Sideways cup top curve → ray misses (offset) → true overhang ✓
      if (t > 0.5) {
        selfSupported = true;
        break;
      }
    }

    if (!selfSupported) {
      sampledOverhangArea += cand.area;
    }
  }

  // Extrapolate if we sampled
  if (sampling && sampledTotalArea > 0) {
    const unsupportedRatio = sampledOverhangArea / sampledTotalArea;
    overhangArea = totalCandArea * unsupportedRatio;
  } else {
    overhangArea = sampledOverhangArea;
  }

  const horizontalArea = surfaceArea - wallArea;
  return { overhangArea, wallArea, horizontalArea, surfaceArea, overhangRatio: surfaceArea > 0 ? overhangArea / surfaceArea : 0 };
}

// === VOLUME (Divergence Theorem / signed tetrahedra) ========
function calcVolume(pos) {
  let vol = 0;
  for (let i = 0; i < pos.length; i += 9) {
    const x1=pos[i],   y1=pos[i+1], z1=pos[i+2];
    const x2=pos[i+3], y2=pos[i+4], z2=pos[i+5];
    const x3=pos[i+6], y3=pos[i+7], z3=pos[i+8];
    vol += x1*(y2*z3 - y3*z2) + x2*(y3*z1 - y1*z3) + x3*(y1*z2 - y2*z1);
  }
  return Math.abs(vol) / 6;
}

function buildModelData(positions, triCount, bbox) {
  const size = [bbox.maxX-bbox.minX, bbox.maxY-bbox.minY, bbox.maxZ-bbox.minZ];
  const ov   = analyzeOverhangs(positions);
  return {
    positions,
    triCount,
    volume:         calcVolume(positions) / 1000, // mm³ → cm³
    surfaceArea:    ov.surfaceArea,    // mm² (total)
    wallArea:       ov.wallArea,       // mm² (near-vertical faces)
    horizontalArea: ov.horizontalArea, // mm² (top + bottom faces)
    overhangArea:   ov.overhangArea,   // mm²
    overhangRatio:  ov.overhangRatio,
    bbox: {
      size,
      center: [(bbox.minX+bbox.maxX)/2, (bbox.minY+bbox.maxY)/2, (bbox.minZ+bbox.maxZ)/2],
    },
  };
}

// === 3D VIEWER (Three.js r128, global THREE + OrbitControls) =
function setupViewer(modelData) {
  // Guard: Three.js must be loaded
  if (typeof THREE === 'undefined') throw new Error('Three.js did not load (check network)');
  if (typeof THREE.OrbitControls === 'undefined') throw new Error('OrbitControls did not load (check network)');

  if (state.viewerDispose) { state.viewerDispose(); state.viewerDispose = null; }

  const container = document.getElementById('viewer');
  container.innerHTML = '';
  // Use width for both dims — aspect-ratio:1/1 may not have resolved yet
  const W = container.clientWidth  || 400;
  const H = container.clientHeight || W;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a12);

  // ── Bambu-style build plate ────────────────────────────────
  // Dark plate with subtle grid texture, like Bambu Studio
  const plateSize = 260; // mm — Bambu A1/P1S bed is 256mm
  const plateGeo = new THREE.PlaneGeometry(plateSize, plateSize);
  plateGeo.rotateX(-Math.PI / 2);
  const plateMat = new THREE.MeshPhongMaterial({
    color: 0x1a1a22,
    specular: 0x111118,
    shininess: 15,
    side: THREE.DoubleSide,
  });
  const plate = new THREE.Mesh(plateGeo, plateMat);
  scene.add(plate);

  // Grid lines on the plate
  const gridDiv = 13; // 260/13 = 20mm spacing
  const gridMat = new THREE.LineBasicMaterial({ color: 0x2a2a38, transparent: true, opacity: 0.5 });
  const gridGeo = new THREE.BufferGeometry();
  const gridPts = [];
  const halfP = plateSize / 2;
  const step = plateSize / gridDiv;
  for (let i = 0; i <= gridDiv; i++) {
    const pos = -halfP + i * step;
    gridPts.push(pos, 0.05, -halfP, pos, 0.05, halfP); // lines along Z
    gridPts.push(-halfP, 0.05, pos, halfP, 0.05, pos);   // lines along X
  }
  gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridPts, 3));
  const gridLines = new THREE.LineSegments(gridGeo, gridMat);
  scene.add(gridLines);

  // Plate border (subtle raised edge)
  const borderGeo = new THREE.BufferGeometry();
  const bPts = [
    -halfP, 0.1, -halfP, halfP, 0.1, -halfP,
    halfP, 0.1, -halfP, halfP, 0.1, halfP,
    halfP, 0.1, halfP, -halfP, 0.1, halfP,
    -halfP, 0.1, halfP, -halfP, 0.1, -halfP,
  ];
  borderGeo.setAttribute('position', new THREE.Float32BufferAttribute(bPts, 3));
  const borderMat = new THREE.LineBasicMaterial({ color: 0x3a3a48 });
  const border = new THREE.LineSegments(borderGeo, borderMat);
  scene.add(border);

  // Center crosshair on plate
  const crossGeo = new THREE.BufferGeometry();
  const crossPts = [
    -8, 0.08, 0, 8, 0.08, 0,
    0, 0.08, -8, 0, 0.08, 8,
  ];
  crossGeo.setAttribute('position', new THREE.Float32BufferAttribute(crossPts, 3));
  const crossMat = new THREE.LineBasicMaterial({ color: 0x4a4a5a });
  scene.add(new THREE.LineSegments(crossGeo, crossMat));

  const camera = new THREE.PerspectiveCamera(45, W / H, 0.01, 100000);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0x4f9cf9, 1.4);
  key.position.set(1, 2, 1.5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.4);
  fill.position.set(-1, -0.5, -1);
  scene.add(fill);

  const geo = new THREE.BufferGeometry();
  // CRITICAL: Use a COPY — geo.translate() modifies the backing array in-place.
  // Without this, modelData.positions gets permanently shifted every time the viewer rebuilds.
  const viewerPositions = new Float32Array(modelData.positions);
  geo.setAttribute('position', new THREE.BufferAttribute(viewerPositions, 3));
  geo.computeVertexNormals();

  const [cx, cy, cz] = modelData.bbox.center;
  geo.translate(-cx, -cy, -cz);

  geo.computeBoundingBox();
  const bedY = geo.boundingBox.min.y;
  plate.position.y = bedY;
  gridLines.position.y = bedY;
  border.position.y = bedY;

  const mat  = new THREE.MeshPhongMaterial({ color: 0x4f9cf9, specular: 0x112233, shininess: 35, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  geo.computeBoundingSphere();
  const r    = geo.boundingSphere.radius;
  const fov  = camera.fov * Math.PI / 180;
  const dist = (r * 2.2) / Math.tan(fov / 2);
  camera.position.set(dist * 0.6, dist * 0.4, dist);
  camera.lookAt(0, 0, 0);

  const controls         = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping  = true;
  controls.dampingFactor  = 0.08;
  controls.enablePan      = false;
  controls.minDistance    = r * 1.1;
  controls.maxDistance    = r * 12;

  let ro = null;
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => {
      const w = container.clientWidth || W;
      const h = container.clientHeight || w;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(container);
  }

  function animate() {
    state.viewerRAF = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // ── Face highlight mesh for lay-flat selection ──────────────
  const hlGeo = new THREE.BufferGeometry();
  hlGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(9), 3));
  const hlMat = new THREE.MeshBasicMaterial({
    color: 0x00ff88, transparent: true, opacity: 0.55,
    side: THREE.DoubleSide, depthTest: false,
  });
  const hlMesh = new THREE.Mesh(hlGeo, hlMat);
  hlMesh.visible = false;
  hlMesh.renderOrder = 999;
  scene.add(hlMesh);

  // Store viewer refs for raycasting
  state.viewer = { scene, camera, renderer, mesh, container, controls, hlMesh, hlGeo, hlMat };

  state.viewerDispose = () => {
    cancelAnimationFrame(state.viewerRAF);
    if (ro) ro.disconnect();
    controls.dispose();
    renderer.dispose();
    geo.dispose();
    mat.dispose();
    hlGeo.dispose();
    hlMat.dispose();
    plateGeo.dispose();
    plateMat.dispose();
    gridGeo.dispose();
    gridMat.dispose();
    borderGeo.dispose();
    borderMat.dispose();
    crossGeo.dispose();
    crossMat.dispose();
  };
}

// === UI: PRINTER, MATERIAL & QUALITY BUTTONS ================
function renderPrinterOptions() {
  const el = document.getElementById('printer-options');
  el.innerHTML = Object.entries(CONFIG.printers).map(([key, p]) =>
    '<button class="toggle-btn ' + (key === state.printer ? 'active' : '') + '" data-key="' + key + '">' +
    p.name + '<span style="display:block;font-size:10px;opacity:.55;margin-top:1px">' + p.desc + '</span>' +
    '</button>'
  ).join('');
  el.querySelectorAll('.toggle-btn').forEach(btn => btn.addEventListener('click', () => {
    state.printer = btn.dataset.key;
    el.querySelectorAll('.toggle-btn').forEach(b => b.classList.toggle('active', b === btn));
    // If current material is not available on the new printer, reset to first available
    const available = CONFIG.printers[state.printer].materials;
    if (!available.includes(state.material)) state.material = available[0];
    renderMaterialOptions();
    updateModelStats();
    updatePrice();
  }));
}

function renderMaterialOptions() {
  const available = CONFIG.printers[state.printer].materials;
  const el = document.getElementById('material-options');
  el.innerHTML = Object.entries(CONFIG.materials)
    .filter(([key]) => available.includes(key))
    .map(([key, m]) =>
      '<button class="material-btn ' + (key === state.material ? 'active' : '') + '" ' +
      'data-key="' + key + '" style="--mat-color:' + m.color + '">' +
      '<div class="material-dot"></div>' +
      '<div class="material-name">' + m.name + '</div>' +
      '<div class="material-price">' + m.subtitle + '</div>' +
      '</button>'
    ).join('');
  el.querySelectorAll('.material-btn').forEach(btn => btn.addEventListener('click', () => {
    state.material = btn.dataset.key;
    el.querySelectorAll('.material-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateModelStats();
    updatePrice();
  }));
}

function renderQualityOptions() {
  const el = document.getElementById('quality-options');
  el.innerHTML = Object.entries(CONFIG.quality).map(([key, q]) =>
    '<button class="quality-btn ' + (key === state.quality ? 'active' : '') + '" data-key="' + key + '">' +
    '<div class="quality-icon">' + q.icon + '</div>' +
    '<div class="quality-name">' + q.name + '</div>' +
    '<div class="quality-layer">' + q.layer + '</div>' +
    '<div class="quality-desc">' + q.desc + '</div>' +
    '</button>'
  ).join('');
  el.querySelectorAll('.quality-btn').forEach(btn => btn.addEventListener('click', () => {
    state.quality = btn.dataset.key;
    el.querySelectorAll('.quality-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updatePrice();
  }));
}

function renderSupportToggle() {
  const el = document.getElementById('support-options');
  el.innerHTML =
    '<button class="toggle-btn ' + (!state.supports ? 'active' : '') + '" data-val="off">None</button>' +
    '<button class="toggle-btn ' + ( state.supports ? 'active' : '') + '" data-val="on">Auto Supports</button>';

  if (state.gcodeWeight) {
    const note = document.createElement('p');
    note.className = 'support-note';
    const src = (state.gcodeWeight && state.gcodeWeight.source === 'slicer') ? 'OrcaSlicer' : 'Bambu Slicer';
    note.innerHTML = '<span class="support-note-ok">&#10003;</span> Exact values from ' + src;
    el.appendChild(note);
  } else if (state.modelData) {
    const pct  = Math.round(state.modelData.overhangRatio * 100);
    const note = document.createElement('p');
    note.className = 'support-note';
    if (pct > 3) {
      note.innerHTML = '<span class="support-note-warn">&#9651;</span> ' + pct + '% overhanging faces — support recommended';
    } else {
      note.innerHTML = '<span class="support-note-ok">&#10003;</span> Minimal overhangs — support likely not needed';
    }
    el.appendChild(note);
  }

  el.querySelectorAll('.toggle-btn').forEach(btn => btn.addEventListener('click', () => {
    state.supports = btn.dataset.val === 'on';
    el.querySelectorAll('.toggle-btn').forEach(b => b.classList.toggle('active', b === btn));
    updateModelStats();
    updatePrice();
  }));
}

function setSliderFill(slider) {
  const pct = ((+slider.value - +slider.min) / (+slider.max - +slider.min) * 100).toFixed(1);
  slider.style.setProperty('--sl-fill', pct + '%');
}

function setupControls() {
  const slider   = document.getElementById('infill');
  const infillEl = document.getElementById('infill-val');
  state.infill   = +slider.value;   // initialise from HTML default (20)
  setSliderFill(slider);
  slider.addEventListener('input', () => {
    state.infill = +slider.value;
    infillEl.textContent = state.infill + '%';
    setSliderFill(slider);
    // Slicer ran at the original infill — clear cached weight so estimation is used instead.
    // (G-code uploads are not affected since they already contain the final sliced weight.)
    if (state.gcodeWeight && state.gcodeWeight.source === 'slicer') state.gcodeWeight = null;
    previewAnim.infillTarget = state.infill;
    startPreviewAnim();
    updateModelStats();
    updatePrice();
  });
  // Optional walls slider (may not be present on older HTML)
  const wallsSlider = document.getElementById('walls');
  const wallsEl     = document.getElementById('walls-val');
  if (wallsSlider && wallsEl) {
    state.walls = +wallsSlider.value;
    setSliderFill(wallsSlider);
    updateWallsHint();
    wallsSlider.addEventListener('input', () => {
      state.walls = +wallsSlider.value;
      wallsEl.textContent = state.walls;
      setSliderFill(wallsSlider);
      previewAnim.wallsTarget = state.walls;
      startPreviewAnim();
      updateWallsHint();
      updateModelStats();
      updatePrice();
    });
  }

  const qtyEl = document.getElementById('qty-val');
  document.getElementById('qty-down').addEventListener('click', () => {
    if (state.quantity > 1) { state.quantity--; qtyEl.textContent = state.quantity; updatePrice(); }
  });
  document.getElementById('qty-up').addEventListener('click', () => {
    if (state.quantity < 99) { state.quantity++; qtyEl.textContent = state.quantity; updatePrice(); }
  });
  document.getElementById('btn-quote').addEventListener('click', (e) => {
    e.preventDefault();
    const p = computePrice();
    if (!p) { alert('Please upload a model first.'); return; }
    const mat = CONFIG.materials[state.material];
    const qual = CONFIG.quality[state.quality];
    const msg = `Hi Dr.PrinT! I used the price calculator:\n\n` +
      `• Material: ${mat.name}\n` +
      `• Quality: ${qual.name} (${qual.layer})\n` +
      `• Infill: ${state.infill}%\n` +
      `• Walls: ${state.walls}\n` +
      `• Supports: ${state.supports ? 'Yes' : 'No'}\n` +
      `• Qty: ${state.quantity}\n` +
      `• Est. Weight: ~${p.totalWeight}g\n` +
      `• Est. Price: ₹${p.total}\n\n` +
      `I'd like to confirm this quote. I'll share my STL file.`;
    window.open('https://wa.me/919449214905?text=' + encodeURIComponent(msg), '_blank');
  });
}

// === PRICING ================================================
// Improved shell model — calibrated against Bambu Studio line-type breakdown:
//
//   Bambu breaks weight into: outer wall, inner wall, overhang wall,
//   sparse infill, internal solid infill, GAP INFILL, top/bottom surface, bridge.
//
//   Key insight: "gap infill" (small fills between wall perimeters and infill regions)
//   can be 15-25% of wall weight on curved/complex models. Our formula must account for it.
//
//   shellVol   = (wallArea × walls × lineWidth + horizontalArea × top/bot layers × layerH) × shellFactor
//   gapFillVol = shellVol × gapRatio   (fills between walls and infill boundaries)
//   bridgeVol  = overhangArea × layerH  (bridging layers over gaps)
//   innerVol   = totalVol − shellVol
//   effectiveVol = shellVol + gapFillVol + bridgeVol + innerVol × (infill / 100)
//   weight     = effectiveVol × density
//
function computeModelWeight() {
  if (state.gcodeWeight) return state.gcodeWeight.modelWeight; // exact from Bambu
  if (!state.modelData || state.modelData.volume <= 0) return 0;
  const mat  = CONFIG.materials[state.material];
  const qual = CONFIG.quality[state.quality];
  // Use ORIGINAL face areas (from initial upload) — NOT rotated ones.
  // This ensures model weight stays constant regardless of orientation,
  // matching how real slicers work (Bambu: 29.89g in any orientation).
  const areas = originalAreas || state.modelData;
  const { volume } = state.modelData;
  const { wallArea, horizontalArea } = areas;
  const vol_mm3 = volume * 1000;                                    // cm³ → mm³
  const lw      = CONFIG.slicer.lineWidth;                          // mm (0.42)
  const lh      = qual.layerMM;                                     // mm
  const tbAvg   = (CONFIG.slicer.topLayers + CONFIG.slicer.botLayers) / 2; // 4
  const walls   = state.walls;

  // Shell volume: walls + top/bottom solid layers
  // IMPORTANT: Model weight must NOT change with rotation.
  // Volume is constant, shell geometry is constant — only support changes.
  // Bridge infill REPLACES sparse infill at overhang regions, it doesn't ADD weight.
  // So we exclude overhangArea from weight calculation entirely.
  //
  // shellFactor 0.42 calibrated against Bambu Studio:
  //   Bambu cup (27.05cm³, 2 walls, 15% infill, PLA) = 29.89g model weight
  const wallVol    = wallArea      * walls * lw;
  const topBotVol  = horizontalArea * tbAvg * lh;
  const shellVol   = Math.min((wallVol + topBotVol) * 0.42, vol_mm3 * 0.90);

  // Gap infill: fills between wall perimeters and infill boundaries.
  const gapRatio   = 0.10 + (walls - 2) * 0.02;
  const gapFillVol = shellVol * Math.max(0.05, gapRatio);

  // Inner volume gets filled at user-selected infill %
  const innerVol   = Math.max(vol_mm3 - shellVol, 0);
  const effVol     = shellVol + gapFillVol + innerVol * (state.infill / 100);

  return (effVol / 1000) * mat.density * (mat.wtMul || 1); // grams
}

// Support volume = overhangArea (cm²) × avg support height (cm) × support infill
// avg support height ≈ 30% of the model's Z-height
// Support weight calculation — calibrated for Bambu Studio tree supports.
// Now that overhangArea only contains TRUE unsupported overhangs (ray-cast verified),
// the formula can be more direct:
//   1. Calculate the volume under each overhang face down to the bed
//   2. Tree supports are ~3% effective density (much thinner than grid supports)
//   3. Average support pillar height ≈ 40% of the overhang centroid height
function computeSupportWeight() {
  if (state.gcodeWeight) return state.supports ? state.gcodeWeight.supportWeight : 0;
  if (!state.supports || !state.modelData) return 0;
  const { overhangArea, bbox } = state.modelData;
  if (overhangArea <= 0) return 0;
  const mat             = CONFIG.materials[state.material];
  const modelHeightCm   = bbox.size[2] / 10;
  const overhangAreaCm2 = overhangArea / 100;
  // Bambu tree supports: thin pillars ~3% density, avg height ~40% of model Z
  const treeDensity     = 0.03;
  const avgHeightCm     = modelHeightCm * 0.40;
  const supportVol      = overhangAreaCm2 * avgHeightCm * treeDensity;
  return supportVol * mat.density;
}

function computePrice() {
  if (!state.modelData && !state.gcodeWeight) return null;
  const mat                    = CONFIG.materials[state.material];
  const qual                   = CONFIG.quality[state.quality];
  const { setupFee, minPrice } = CONFIG.pricing;
  const modelWeight   = computeModelWeight();
  const supportWeight = computeSupportWeight();
  const totalWeight   = modelWeight + supportWeight;
  const materialCost  = totalWeight * mat.pricePerGram;
  const printCost     = materialCost * qual.multiplier;
  const subtotal      = printCost * state.quantity;
  const total         = Math.max(subtotal + setupFee, minPrice).toFixed(2);
  return {
    modelWeight:    modelWeight.toFixed(1),
    supportWeight:  supportWeight.toFixed(1),
    totalWeight:    totalWeight.toFixed(1),
    materialCost:   materialCost.toFixed(2),
    printCost:      printCost.toFixed(2),
    subtotal:       subtotal.toFixed(2),
    setupFee:       setupFee.toFixed(2),
    total,
  };
}

function updateModelStats() {
  // ── Exact mode: weights from OrcaSlicer server or Bambu G-code ──
  if (state.gcodeWeight) {
    const gw  = state.gcodeWeight;
    const src = gw.source === 'slicer' ? 'OrcaSlicer' : 'Bambu Slicer';
    document.getElementById('model-stats').innerHTML =
      '<div class="stat-item">' +
        '<div class="stat-label">Part</div>' +
        '<div class="stat-value" style="color:#22c55e">' + gw.modelWeight.toFixed(1) + '</div>' +
        '<div class="stat-unit">grams</div>' +
      '</div>' +
      '<div class="stat-item">' +
        '<div class="stat-label">Supports</div>' +
        '<div class="stat-value" style="color:#f97316">' + gw.supportWeight.toFixed(1) + '</div>' +
        '<div class="stat-unit">grams</div>' +
      '</div>' +
      '<div class="stat-item">' +
        '<div class="stat-label">Total</div>' +
        '<div class="stat-value">' + gw.totalWeight.toFixed(1) + '</div>' +
        '<div class="stat-unit">grams</div>' +
      '</div>' +
      '<p style="grid-column:1/-1;margin:4px 0 0;font-size:10px;opacity:.5;text-align:center">&#10003; Exact — ' + src + '</p>';
    return;
  }
  // ── STL/OBJ mode: show estimated weights ────────────────────
  if (!state.modelData) return;
  const { volume, bbox } = state.modelData;
  const [w, d, h]        = bbox.size;
  const weight           = (computeModelWeight() + computeSupportWeight()).toFixed(1);
  document.getElementById('model-stats').innerHTML =
    '<div class="stat-item">' +
      '<div class="stat-label">Volume</div>' +
      '<div class="stat-value">' + volume.toFixed(2) + '</div>' +
      '<div class="stat-unit">cm³</div>' +
    '</div>' +
    '<div class="stat-item">' +
      '<div class="stat-label">Dimensions</div>' +
      '<div class="stat-value" style="font-size:12px">' + w.toFixed(0) + '×' + d.toFixed(0) + '×' + h.toFixed(0) + '</div>' +
      '<div class="stat-unit">mm</div>' +
    '</div>' +
    '<div class="stat-item">' +
      '<div class="stat-label">~Weight</div>' +
      '<div class="stat-value">' + weight + '</div>' +
      '<div class="stat-unit">grams</div>' +
    '</div>';
}

function updatePrice() {
  const p = computePrice();
  if (!p) return;
  const mat  = CONFIG.materials[state.material];
  const qual = CONFIG.quality[state.quality];
  let html =
    '<div class="breakdown-row">' +
      '<span class="breakdown-label">Material — ' + mat.name + ' (' + p.totalWeight + ' g × ₹' + mat.pricePerGram + '/g)</span>' +
      '<span class="breakdown-value">₹' + p.materialCost + '</span>' +
    '</div>';
  if (state.supports && parseFloat(p.supportWeight) > 0.05) {
    const src = state.gcodeWeight ? 'Bambu Slicer' : 'est.';
    html +=
      '<div class="breakdown-row breakdown-row--sub">' +
        '<span class="breakdown-label">&#x2514; Model ' + p.modelWeight + ' g + Supports ' + p.supportWeight + ' g (' + src + ')</span>' +
        '<span class="breakdown-value" style="color:var(--text2);font-size:11px"></span>' +
      '</div>';
  }
  html +=
    '<div class="breakdown-row">' +
      '<span class="breakdown-label">Quality — ' + qual.name + ' (×' + qual.multiplier + ')</span>' +
      '<span class="breakdown-value">₹' + p.printCost + '</span>' +
    '</div>';
  if (state.quantity > 1) {
    html +=
      '<div class="breakdown-row">' +
        '<span class="breakdown-label">Quantity — ×' + state.quantity + '</span>' +
        '<span class="breakdown-value">₹' + p.subtotal + '</span>' +
      '</div>';
  }
  html +=
    '<div class="breakdown-row">' +
      '<span class="breakdown-label">Setup &amp; handling</span>' +
      '<span class="breakdown-value">₹' + p.setupFee + '</span>' +
    '</div>';
  document.getElementById('price-breakdown').innerHTML = html;
  document.getElementById('total-price').textContent = '₹' + p.total;
}

// === PRINT CROSS-SECTION PREVIEW ============================
const INFILL_TYPES = [
  { key: 'grid',      label: 'Grid'     },
  { key: 'lines',     label: 'Lines'    },
  { key: 'gyroid',    label: 'Gyroid'   },
  { key: 'honeycomb', label: 'Hex'      },
  { key: 'triangle',  label: 'Triangle' },
];

const previewAnim = { infill: 20, infillTarget: 20, walls: 2, wallsTarget: 2, raf: null };

function renderInfillTypes() {
  const el = document.getElementById('infill-types');
  if (!el) return;
  el.innerHTML = INFILL_TYPES.map(t =>
    `<button class="itype-btn${state.infillType === t.key ? ' active' : ''}" data-key="${t.key}">${t.label}</button>`
  ).join('');
  el.querySelectorAll('.itype-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.infillType = btn.dataset.key;
      el.querySelectorAll('.itype-btn').forEach(b => b.classList.toggle('active', b === btn));
      drawPreview();
    });
  });
}

function startPreviewAnim() {
  if (previewAnim.raf) cancelAnimationFrame(previewAnim.raf);
  previewAnim.raf = requestAnimationFrame(tickPreview);
}

function tickPreview() {
  const SPEED = 0.14;
  previewAnim.infill += (previewAnim.infillTarget - previewAnim.infill) * SPEED;
  previewAnim.walls  += (previewAnim.wallsTarget  - previewAnim.walls)  * SPEED;
  drawPreview();
  const done = Math.abs(previewAnim.infill - previewAnim.infillTarget) < 0.25 &&
               Math.abs(previewAnim.walls  - previewAnim.wallsTarget)  < 0.01;
  if (done) {
    previewAnim.infill = previewAnim.infillTarget;
    previewAnim.walls  = previewAnim.wallsTarget;
    previewAnim.raf    = null;
    drawPreview();
  } else {
    previewAnim.raf = requestAnimationFrame(tickPreview);
  }
}

// ── Infill pattern helpers ───────────────────────────────────
function patternGrid(ctx, x, y, w, h, sp) {
  ctx.beginPath();
  for (let i = 0; i <= w; i += sp) { ctx.moveTo(x + i, y); ctx.lineTo(x + i, y + h); }
  for (let j = 0; j <= h; j += sp) { ctx.moveTo(x, y + j); ctx.lineTo(x + w, y + j); }
  ctx.stroke();
}
function patternLines(ctx, x, y, w, h, sp) {
  ctx.beginPath();
  for (let d = -(h + w); d < w + h; d += sp) {
    ctx.moveTo(x + d,     y);     ctx.lineTo(x + d + h, y + h);
  }
  ctx.stroke();
}
function patternGyroid(ctx, x, y, w, h, sp) {
  const rows = Math.max(2, Math.round(h / sp));
  const rh   = h / rows;
  const amp  = rh * 0.42;
  const freq = Math.max(2, (w / sp) * 0.9);
  ctx.beginPath();
  for (let r = 0; r < rows; r++) {
    const cy    = y + (r + 0.5) * rh;
    const phase = r * Math.PI;
    ctx.moveTo(x, cy + Math.sin(phase) * amp);
    for (let px = 1; px <= w; px += 2) {
      ctx.lineTo(x + px, cy + Math.sin((px / w) * Math.PI * 2 * freq + phase) * amp);
    }
  }
  ctx.stroke();
}
function patternHoneycomb(ctx, x, y, w, h, sp) {
  const r  = Math.max(3, sp * 0.55);
  const hx = r * 2;
  const hy = r * Math.sqrt(3);
  ctx.beginPath();
  for (let row = -1; row * hy < h + hy; row++) {
    for (let col = -1; col * hx * 0.75 < w + hx; col++) {
      const cx = x + col * hx * 0.75;
      const cy = y + row * hy + (col % 2 !== 0 ? hy / 2 : 0);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
        const nx = cx + r * Math.cos(a), ny = cy + r * Math.sin(a);
        i === 0 ? ctx.moveTo(nx, ny) : ctx.lineTo(nx, ny);
      }
      ctx.closePath();
    }
  }
  ctx.stroke();
}
function patternTriangle(ctx, x, y, w, h, sp) {
  const s60 = sp * 0.577; // sp × tan(30°)
  ctx.beginPath();
  for (let j = 0; j <= h; j += sp)  { ctx.moveTo(x, y + j);   ctx.lineTo(x + w, y + j); }
  for (let d = -(h + w); d < w + h; d += sp * 1.155) {
    ctx.moveTo(x + d, y);       ctx.lineTo(x + d + h * 0.577, y + h);
    ctx.moveTo(x + d + h * 0.577, y); ctx.lineTo(x + d, y + h);
  }
  ctx.stroke();
}

function drawPreview() {
  const canvas = document.getElementById('print-preview');
  if (!canvas) return;
  const cssW = canvas.clientWidth, cssH = canvas.clientHeight;
  if (!cssW || !cssH) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
    canvas.width = cssW * dpr; canvas.height = cssH * dpr;
  }
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.scale(dpr, dpr);
  const W = cssW, H = cssH;

  // ── Background ────────────────────────────────────────────
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, W, H);

  const walls  = previewAnim.walls;
  const infill = previewAnim.infill / 100;
  const pad    = 6;
  // Wall thickness: fixed 5px each (capped so max 8 walls still fit)
  const wallTh = Math.min(5, (Math.min(W, H) * 0.46) / Math.max(walls, 1));

  // ── Inner region ──────────────────────────────────────────
  const iX = pad + walls * wallTh;
  const iY = pad + walls * wallTh;
  const iW = Math.max(0, W - iX * 2);
  const iH = Math.max(0, H - iY * 2);

  // ── Infill pattern (clipped to inner region) ──────────────
  if (iW > 4 && iH > 4) {
    ctx.save();
    ctx.beginPath(); ctx.rect(iX, iY, iW, iH); ctx.clip();
    const density = infill;
    const sp      = Math.max(2.5, 19 - density * 16.5); // spacing shrinks as infill grows
    ctx.strokeStyle = `rgba(255,255,255,${0.12 + density * 0.44})`;
    ctx.lineWidth   = 0.7;
    switch (state.infillType) {
      case 'lines':     patternLines    (ctx, iX, iY, iW, iH, sp);   break;
      case 'gyroid':    patternGyroid   (ctx, iX, iY, iW, iH, sp);   break;
      case 'honeycomb': patternHoneycomb(ctx, iX, iY, iW, iH, sp);   break;
      case 'triangle':  patternTriangle (ctx, iX, iY, iW, iH, sp);   break;
      default:          patternGrid     (ctx, iX, iY, iW, iH, sp);
    }
    ctx.restore();
  }

  // ── Walls — white, slightly different shade each, 1 px gap ─
  for (let w = 0; w < Math.ceil(walls); w++) {
    const frac   = Math.min(1, walls - w);          // partial last wall when animating
    const inset  = pad + w * wallTh + wallTh * 0.5;
    const bright = 1 - w * 0.12;                    // outermost wall brightest
    // lineWidth is wallTh-0.8 → leaves ~0.8px dark gap between consecutive walls
    ctx.strokeStyle = `rgba(255,255,255,${(0.90 * bright) * frac})`;
    ctx.lineWidth   = Math.max(0, (wallTh - 0.8) * frac);
    const rw = W - inset * 2, rh = H - inset * 2;
    if (rw > 0 && rh > 0) ctx.strokeRect(inset, inset, rw, rh);
  }

  // ── Corner labels ─────────────────────────────────────────
  ctx.font         = '10px system-ui,sans-serif';
  ctx.fillStyle    = 'rgba(255,255,255,0.32)';
  ctx.textBaseline = 'bottom';
  ctx.textAlign    = 'left';
  ctx.fillText(Math.round(walls) + (Math.round(walls) === 1 ? ' wall' : ' walls'), pad + 3, H - 4);
  ctx.textAlign = 'right';
  ctx.fillText(Math.round(previewAnim.infill) + '% infill', W - pad - 3, H - 4);

  ctx.restore();
}

// === ORIENTATION CONTROLS ===================================
// Stores the original positions so we can reset
let originalPositions = null;
let originalAreas = null; // { wallArea, horizontalArea, surfaceArea } — frozen at upload, used for weight

function showOrientControls() {
  const el = document.getElementById('orient-controls');
  if (el) el.classList.remove('hidden');
}
function hideOrientControls() {
  const el = document.getElementById('orient-controls');
  if (el) el.classList.add('hidden');
}

// ── Rotate all vertex positions around an axis by angleDeg ──
function rotatePositions(positions, axis, angleDeg) {
  const a = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(a), sin = Math.sin(a);
  for (let i = 0; i < positions.length; i += 3) {
    let x = positions[i], y = positions[i+1], z = positions[i+2];
    if (axis === 'x') {
      const ny = y * cos - z * sin;
      const nz = y * sin + z * cos;
      positions[i+1] = ny; positions[i+2] = nz;
    } else if (axis === 'y') {
      const nx = x * cos + z * sin;
      const nz = -x * sin + z * cos;
      positions[i]   = nx; positions[i+2] = nz;
    } else if (axis === 'z') {
      const nx = x * cos - y * sin;
      const ny = x * sin + y * cos;
      positions[i]   = nx; positions[i+1] = ny;
    }
  }
}

// ── Shift model so its lowest point sits on Z=0 (the bed) ──
function dropToBed(positions) {
  let minZ = Infinity;
  for (let i = 2; i < positions.length; i += 3) {
    if (positions[i] < minZ) minZ = positions[i];
  }
  if (minZ !== 0) {
    for (let i = 2; i < positions.length; i += 3) {
      positions[i] -= minZ;
    }
  }
}

// ── Lay Flat: cluster coplanar faces by normal, pick largest cluster ──
// Real slicers don't just pick the single largest triangle — they find the
// largest REGION of similarly-oriented faces (like the flat bottom of a cup,
// which is many small triangles all pointing the same way).
function layFlat(positions) {
  const ANGLE_THRESHOLD = 0.97; // cos(~14°) — faces within 14° are "same direction"
  const clusters = []; // { normal: [nx,ny,nz], totalArea: number }

  for (let i = 0; i < positions.length; i += 9) {
    const ax = positions[i+3]-positions[i],   ay = positions[i+4]-positions[i+1], az = positions[i+5]-positions[i+2];
    const bx = positions[i+6]-positions[i],   by = positions[i+7]-positions[i+1], bz = positions[i+8]-positions[i+2];
    const nx = ay*bz - az*by;
    const ny = az*bx - ax*bz;
    const nz = ax*by - ay*bx;
    const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
    if (len < 1e-10) continue;
    const fnx = nx/len, fny = ny/len, fnz = nz/len;
    const area = len * 0.5;

    // Try to find an existing cluster with a similar normal
    let matched = false;
    for (const cl of clusters) {
      const dot = cl.normal[0]*fnx + cl.normal[1]*fny + cl.normal[2]*fnz;
      if (dot > ANGLE_THRESHOLD) {
        cl.totalArea += area;
        // Update cluster normal as weighted average
        const w = area / cl.totalArea;
        cl.normal[0] = cl.normal[0]*(1-w) + fnx*w;
        cl.normal[1] = cl.normal[1]*(1-w) + fny*w;
        cl.normal[2] = cl.normal[2]*(1-w) + fnz*w;
        // Re-normalize
        const nl = Math.sqrt(cl.normal[0]**2 + cl.normal[1]**2 + cl.normal[2]**2);
        cl.normal[0] /= nl; cl.normal[1] /= nl; cl.normal[2] /= nl;
        matched = true;
        break;
      }
    }
    if (!matched) {
      clusters.push({ normal: [fnx, fny, fnz], totalArea: area });
    }
  }

  if (clusters.length === 0) { dropToBed(positions); return; }

  // Sort clusters by area — largest first
  clusters.sort((a, b) => b.totalArea - a.totalArea);

  // Pick the best cluster: prefer flat/horizontal faces, penalize steep walls
  // Score = area × flatness_bonus (faces pointing up/down get 2x bonus over walls)
  let bestScore = 0;
  let bestNormal = [0, 0, -1];
  for (const cl of clusters) {
    const flatness = Math.abs(cl.normal[2]); // 1.0 = horizontal, 0.0 = vertical wall
    const score = cl.totalArea * (0.5 + flatness * 1.5); // flat faces get up to 2x weight
    if (score > bestScore) {
      bestScore = score;
      bestNormal = cl.normal;
    }
  }

  // Rotate so bestNormal points DOWN
  const [nx, ny, nz] = bestNormal;
  const targetX = 0, targetY = 0, targetZ = -1;

  // Cross product gives rotation axis, dot product gives angle
  const crossX = ny * targetZ - nz * targetY;
  const crossY = nz * targetX - nx * targetZ;
  const crossZ = nx * targetY - ny * targetX;
  const crossLen = Math.sqrt(crossX*crossX + crossY*crossY + crossZ*crossZ);

  if (crossLen < 1e-8) {
    // Vectors are parallel — either already aligned or opposite
    const dot = nx*targetX + ny*targetY + nz*targetZ;
    if (dot < 0) {
      // Already pointing down — perfect
      dropToBed(positions);
      return;
    } else {
      // Pointing up — flip 180° around X
      rotatePositions(positions, 'x', 180);
      dropToBed(positions);
      return;
    }
  }

  // Rotation axis (normalized)
  const rax = crossX / crossLen;
  const ray = crossY / crossLen;
  const raz = crossZ / crossLen;

  // Angle between vectors
  const dot = nx*targetX + ny*targetY + nz*targetZ;
  const angle = Math.acos(Math.max(-1, Math.min(1, dot)));

  // Apply Rodrigues' rotation formula to every vertex
  const cosA = Math.cos(angle), sinA = Math.sin(angle);
  for (let i = 0; i < positions.length; i += 3) {
    const px = positions[i], py = positions[i+1], pz = positions[i+2];
    // p·k (dot product of position with rotation axis)
    const pdotk = px*rax + py*ray + pz*raz;
    // k×p (cross product of rotation axis with position)
    const kcpx = ray*pz - raz*py;
    const kcpy = raz*px - rax*pz;
    const kcpz = rax*py - ray*px;
    // Rodrigues: p_rot = p*cos(a) + (k×p)*sin(a) + k*(k·p)*(1-cos(a))
    positions[i]   = px*cosA + kcpx*sinA + rax*pdotk*(1-cosA);
    positions[i+1] = py*cosA + kcpy*sinA + ray*pdotk*(1-cosA);
    positions[i+2] = pz*cosA + kcpz*sinA + raz*pdotk*(1-cosA);
  }

  dropToBed(positions);
}

// ── After any rotation: recompute model data, update viewer + price ──
function applyOrientation() {
  if (!state.modelData) return;
  const pos = state.modelData.positions;

  // Recompute bounding box
  const bbox = initBBox();
  for (let i = 0; i < pos.length; i += 3) {
    expandBBox(bbox, pos[i], pos[i+1], pos[i+2]);
  }
  const size = [bbox.maxX-bbox.minX, bbox.maxY-bbox.minY, bbox.maxZ-bbox.minZ];
  const center = [(bbox.minX+bbox.maxX)/2, (bbox.minY+bbox.maxY)/2, (bbox.minZ+bbox.maxZ)/2];

  // Recompute overhangs
  const ov = analyzeOverhangs(pos);

  // Update modelData in place
  state.modelData.bbox = { size, center };
  state.modelData.surfaceArea   = ov.surfaceArea;
  state.modelData.wallArea      = ov.wallArea;
  state.modelData.horizontalArea = ov.horizontalArea;
  state.modelData.overhangArea  = ov.overhangArea;
  state.modelData.overhangRatio = ov.overhangRatio;
  // Volume doesn't change with rotation

  // Auto-update support toggle based on new orientation
  state.supports = ov.overhangRatio > 0.03;
  renderSupportToggle();

  // Update 3D viewer
  try {
    setupViewer(state.modelData);
  } catch (e) {
    // warn suppressed
  }

  // Update stats and price
  updateModelStats();
  updatePrice();
  updateOrientInfo();
}

function updateOrientInfo() {
  const el = document.getElementById('orient-info');
  if (!el || !state.modelData) { if (el) el.innerHTML = ''; return; }
  const pct = Math.round(state.modelData.overhangRatio * 100);
  const [w, d, h] = state.modelData.bbox.size;
  let cls = 'overhang-low', label = 'Minimal overhangs';
  if (pct > 15) { cls = 'overhang-high'; label = 'Heavy overhangs — supports needed'; }
  else if (pct > 3) { cls = 'overhang-med'; label = 'Some overhangs — supports recommended'; }
  el.innerHTML =
    '<span class="' + cls + '">' + pct + '% overhang</span> · ' + label +
    ' · <span style="opacity:0.6">' + w.toFixed(0) + '×' + d.toFixed(0) + '×' + h.toFixed(0) + ' mm</span>';
}

// ── Wire up buttons ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Manual axis rotation buttons
  document.querySelectorAll('.orient-btn[data-axis]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!state.modelData) return;
      const axis = btn.dataset.axis;
      const dir  = parseInt(btn.dataset.dir);
      rotatePositions(state.modelData.positions, axis, dir * 90);
      dropToBed(state.modelData.positions);
      applyOrientation();
    });
  });

  // ── AUTO LAY FLAT — instant auto-orient ──────────────────────
  const layFlatBtn = document.getElementById('btn-lay-flat');
  if (layFlatBtn) {
    layFlatBtn.addEventListener('click', () => {
      if (!state.modelData) return;
      if (state.layFlatMode) exitLayFlatMode(); // cancel pick-face if active
      layFlat(state.modelData.positions);
      applyOrientation();
    });
  }

  // ── PICK FACE — manual face selection mode ──────────────────
  const pickFaceBtn = document.getElementById('btn-pick-face');
  if (pickFaceBtn) {
    pickFaceBtn.addEventListener('click', () => {
      if (!state.modelData || !state.viewer) return;
      state.layFlatMode = !state.layFlatMode;
      const v = state.viewer;
      if (state.layFlatMode) {
        pickFaceBtn.classList.add('lay-flat-active');
        pickFaceBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg> Cancel';
        v.container.style.cursor = 'crosshair';
        v.controls.enabled = false;
        updateOrientInfoMsg('Click on a face to lay it flat on the build plate. Press Esc to cancel.');
      } else {
        exitLayFlatMode();
      }
    });
  }

  function exitLayFlatMode() {
    state.layFlatMode = false;
    const v = state.viewer;
    if (pickFaceBtn) {
      pickFaceBtn.classList.remove('lay-flat-active');
      pickFaceBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg> Pick Face';
    }
    if (v) {
      v.container.style.cursor = 'grab';
      v.controls.enabled = true;
      v.hlMesh.visible = false;
    }
    updateOrientInfo();
  }

  function updateOrientInfoMsg(msg) {
    const el = document.getElementById('orient-info');
    if (el) el.innerHTML = '<span style="color:#00ff88">' + msg + '</span>';
  }

  // ── Raycasting for face selection ──────────────────────────
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function getMouseNDC(e) {
    const v = state.viewer;
    if (!v) return null;
    const rect = v.container.getBoundingClientRect();
    mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
    return mouse;
  }

  // Get face normal from the CURRENT modelData positions (not viewer geometry).
  // The viewer geometry is centered — we compute from source of truth.
  function getFaceNormalWorld(faceIndex) {
    const pos = state.modelData.positions;
    // faceIndex from Three.js = triangle index in the non-indexed buffer
    const i = faceIndex * 9;
    // Edge vectors
    const ax = pos[i+3]-pos[i], ay = pos[i+4]-pos[i+1], az = pos[i+5]-pos[i+2];
    const bx = pos[i+6]-pos[i], by = pos[i+7]-pos[i+1], bz = pos[i+8]-pos[i+2];
    // Cross product = face normal
    const nx = ay*bz - az*by;
    const ny = az*bx - ax*bz;
    const nz = ax*by - ay*bx;
    const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
    if (len < 1e-10) return [0, 0, -1];
    return [nx/len, ny/len, nz/len];
  }

  // Highlight the triangle under the cursor
  function highlightFace(faceIndex) {
    const v = state.viewer;
    if (!v) return;
    const posAttr = v.mesh.geometry.getAttribute('position');
    const idx = faceIndex * 3;
    const hlPos = v.hlGeo.getAttribute('position');
    for (let k = 0; k < 3; k++) {
      hlPos.setXYZ(k,
        posAttr.getX(idx + k),
        posAttr.getY(idx + k),
        posAttr.getZ(idx + k)
      );
    }
    hlPos.needsUpdate = true;
    v.hlMesh.visible = true;
  }

  // CORE: Rotate model so the clicked face becomes parallel to and sits on the build plate.
  //
  // "Parallel to build plate" = face normal points straight DOWN along -Z.
  // After rotation, dropToBed() shifts the model so the lowest vertex is at Z=0.
  //
  // Uses Rodrigues' rotation: rotate the ENTIRE mesh so that `faceNormal` → [0, 0, -1].
  function layFlatOnFace(faceIndex) {
    if (!state.modelData) return;
    const pos = state.modelData.positions;
    const [nx, ny, nz] = getFaceNormalWorld(faceIndex);

    // Target direction: face normal should point DOWN
    const tx = 0, ty = 0, tz = -1;

    // Rotation axis = cross(current_normal, target)
    const cx = ny * tz - nz * ty;   // = -ny
    const cy = nz * tx - nx * tz;   // =  nx
    const cz = nx * ty - ny * tx;   // =  0
    const cLen = Math.sqrt(cx*cx + cy*cy + cz*cz);

    if (cLen < 1e-8) {
      // Normals are parallel — either already correct or need 180° flip
      const dot = nx*tx + ny*ty + nz*tz;
      if (dot > 0) {
        // Normal points UP (+Z) — flip 180° around X to point DOWN
        rotatePositions(pos, 'x', 180);
      }
      // else: already pointing down — nothing to do
    } else {
      // Rotation axis (normalized)
      const kx = cx / cLen;
      const ky = cy / cLen;
      const kz = cz / cLen;

      // Angle between current normal and target
      const dot = nx*tx + ny*ty + nz*tz;
      const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Apply Rodrigues' rotation to every vertex:
      // v' = v·cos(θ) + (k × v)·sin(θ) + k·(k·v)·(1 - cos(θ))
      for (let i = 0; i < pos.length; i += 3) {
        const vx = pos[i], vy = pos[i+1], vz = pos[i+2];
        // k·v (dot)
        const kdotv = kx*vx + ky*vy + kz*vz;
        // k × v (cross)
        const kcvx = ky*vz - kz*vy;
        const kcvy = kz*vx - kx*vz;
        const kcvz = kx*vy - ky*vx;
        // Rodrigues
        pos[i]   = vx*cosA + kcvx*sinA + kx*kdotv*(1-cosA);
        pos[i+1] = vy*cosA + kcvy*sinA + ky*kdotv*(1-cosA);
        pos[i+2] = vz*cosA + kcvz*sinA + kz*kdotv*(1-cosA);
      }
    }

    // Drop model so lowest point sits on Z=0 (the bed)
    dropToBed(pos);

    // Exit face-picking mode and rebuild everything
    exitLayFlatMode();
    applyOrientation();
  }

  // Mouse move — highlight hovered face
  document.addEventListener('mousemove', (e) => {
    if (!state.layFlatMode || !state.viewer) return;
    const ndc = getMouseNDC(e);
    if (!ndc) return;
    raycaster.setFromCamera(ndc, state.viewer.camera);
    const hits = raycaster.intersectObject(state.viewer.mesh);
    if (hits.length > 0) {
      highlightFace(hits[0].faceIndex);
      state.viewer.container.style.cursor = 'pointer';
    } else {
      state.viewer.hlMesh.visible = false;
      state.viewer.container.style.cursor = 'crosshair';
    }
  });

  // Click — select face and lay flat
  document.addEventListener('click', (e) => {
    if (!state.layFlatMode || !state.viewer) return;
    // Only handle clicks on the viewer canvas
    if (!state.viewer.container.contains(e.target)) return;
    const ndc = getMouseNDC(e);
    if (!ndc) return;
    raycaster.setFromCamera(ndc, state.viewer.camera);
    const hits = raycaster.intersectObject(state.viewer.mesh);
    if (hits.length > 0) {
      layFlatOnFace(hits[0].faceIndex);
    }
  });

  // ESC to cancel face selection
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.layFlatMode) {
      exitLayFlatMode();
    }
  });

  // Reset orientation button
  const resetOrientBtn = document.getElementById('btn-reset-orient');
  if (resetOrientBtn) {
    resetOrientBtn.addEventListener('click', () => {
      if (!state.modelData || !originalPositions) return;
      // Restore original vertex positions
      state.modelData.positions.set(originalPositions);
      dropToBed(state.modelData.positions);
      applyOrientation();
    });
  }
});

// ── Wall count contextual hint ──────────────────────────────
function updateWallsHint() {
  const el = document.getElementById('walls-hint');
  if (!el) return;
  const w = state.walls;
  let hint = '';
  if (w <= 1)      hint = 'Thin shell — visual/display models only, not structural';
  else if (w === 2) hint = 'Standard — Bambu default, good for most parts';
  else if (w === 3) hint = 'Strong — recommended for functional parts';
  else if (w <= 5)  hint = 'Thick — impact resistance and durability';
  else              hint = 'Very thick — near-solid shell, maximum surface strength';
  el.textContent = hint;
}
