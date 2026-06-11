import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitToAppsScript } from '@/config/submitForm.js';
import { uploadFilesToDrive } from '@/config/uploadToDrive.js';
import MaterialsGuide from '@/components/MaterialsGuide.jsx';
import { X, Upload, PackageCheck, ChevronDown } from 'lucide-react';

const ALLOWED = ['stl','step','stp','obj','3mf','iges','igs'];
const COLORS = [
  { name: 'White',        hex: '#FFFFFF' },
  { name: 'Black',        hex: '#1A1A1A' },
  { name: 'Grey',         hex: '#888888' },
  { name: 'Red',          hex: '#D32F2F' },
  { name: 'Orange',       hex: '#E65100' },
  { name: 'Yellow',       hex: '#F9A825' },
  { name: 'Green',        hex: '#2E7D32' },
  { name: 'Blue',         hex: '#1565C0' },
  { name: 'Navy',         hex: '#0D1B4B' },
  { name: 'Purple',       hex: '#6A1B9A' },
  { name: 'Pink',         hex: '#C2185B' },
  { name: 'Brown',        hex: '#5D4037' },
];
const infillPatterns = [
  { value: 'gyroid',      label: 'Gyroid',      desc: 'Best all-round strength & flexibility' },
  { value: 'grid',        label: 'Grid',         desc: 'Fast, strong, standard choice' },
  { value: 'honeycomb',   label: 'Honeycomb',    desc: 'Great lateral strength' },
  { value: 'cubic',       label: 'Cubic',        desc: 'Isotropic — equal strength all directions' },
  { value: 'lines',       label: 'Lines',        desc: 'Fastest print, lower strength' },
  { value: 'lightning',   label: 'Lightning',    desc: 'Minimal weight, visual parts only' },
  { value: 'concentric',  label: 'Concentric',   desc: 'Good for flexible / TPU parts' },
  { value: 'unsure',      label: "Not sure",     desc: 'We will advise the best pattern' },
];
const layerOptions = [0.08,0.12,0.16,0.20,0.24,0.28,0.32,0.40];
const materials = ['PLA','PETG','ASA','TPU','PA6-CF','PA12-CF','Not sure — advise me'];

function infillDesc(pct) {
  if (pct <= 15) return 'Low density — visual models only';
  if (pct <= 35) return 'Standard — good for most non-load-bearing parts';
  if (pct <= 60) return 'Medium-high — functional parts with moderate loads';
  if (pct <= 85) return 'High density — structural applications';
  return 'Near-solid — maximum strength';
}
function wallDesc(w) {
  if (w <= 2) return 'Thin walls — visual models, decorative only';
  if (w === 3) return 'Standard — most functional parts (recommended)';
  if (w <= 5) return 'Thick walls — impact resistance & durability';
  return 'Very thick — near-solid shell, maximum surface strength';
}
function layerDesc(l) {
  if (l <= 0.12) return 'Ultra-fine detail — slow, highest quality';
  if (l <= 0.16) return 'Fine — good detail, moderate speed';
  if (l <= 0.24) return 'Standard — best balance';
  if (l <= 0.32) return 'Draft — faster print, visible layers';
  return 'Rapid draft — maximum speed, rough surface';
}

export default function CustomOrderPanel({ onClose }) {
  const [files, setFiles]           = useState([]);
  const [material, setMaterial]     = useState('PLA');
  const [infillPct, setInfillPct]   = useState(20);
  const [infillPattern, setInfillPattern] = useState('gyroid');
  const [wallCount, setWalls]       = useState(3);
  const [layerHeight, setLayer]     = useState(0.20);
  const [quantity, setQuantity]     = useState(1);
  const [color, setColor]           = useState('White');
  const [description, setDesc]      = useState('');
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [phone, setPhone]           = useState('');
  const [dragging, setDragging]     = useState(false);
  const [showMaterialGuide, setShowMaterialGuide] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [submitting, setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [honeypot, setHoneypot]       = useState(''); // bot trap — real users never fill this

  // Prevent body scroll while panel open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function handleDrop(e) {
    e.preventDefault(); setDragging(false);
    setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
  }
  function handleFileInput(e) {
    setFiles(prev => [...prev, ...Array.from(e.target.files)]);
  }
  function removeFile(i) { setFiles(prev => prev.filter((_, j) => j !== i)); }

  // Convert file to base64


  async function handleSubmit(e) {
    e.preventDefault();
    if (honeypot) return; // bot filled the hidden field — silently drop
    setSubmitError('');
    setSubmitting(true);
    try {
      // 1. Validate + encode files locally, then fire upload (fire-and-forget)
      if (files.length > 0) {
        await uploadFilesToDrive(files, {
          name, email, phone, material, color,
          infill_pct:     `${infillPct}%`,
          infill_pattern: infillPattern,
          walls:          wallCount,
          layer_height:   `${layerHeight}mm`,
          quantity,
          notes:          description || '',
        });
      }

      // 2. Fire form data to Google Sheet (sync fire-and-forget — throws only on rate limit)
      submitToAppsScript({
        type:           'custom_order',
        name, email, phone, material, color,
        infill_pct:     `${infillPct}%`,
        infill_pattern: infillPattern,
        walls:          wallCount,
        layer_height:   `${layerHeight}mm`,
        quantity,
        notes:          description || '',
        files:          files.length > 0 ? files.map(f => f.name).join(', ') : 'None',
        has_files:      files.length > 0,
      });

      setSubmitting(false);
      setSubmitted(true);
    } catch (err) {
      // Only reaches here on file validation failure or rate-limit
      setSubmitError(err.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  const inputCls = "w-full bg-white/[0.03] border border-white/10 text-white/80 text-sm px-4 py-3 focus:outline-none focus:border-white/35 hover:border-white/18 transition-colors placeholder:text-white/58";

  return (
    <>
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }} transition={{ type: 'tween', duration: 0.28 }}
        className="relative w-full max-w-3xl max-h-[92vh] bg-[#0a0a0a] border border-white/10 overflow-y-auto"
        data-lenis-prevent
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-5 bg-[#0a0a0a] border-b border-white/15">
          <div>
            <p className="text-[13px] tracking-[0.4em] uppercase text-white/62 mb-0.5">Dr.PrinT</p>
            <h2 className="font-black text-lg">Custom Print Request</h2>
          </div>
          <button onClick={onClose} className="text-white/65 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="w-14 h-14 border border-white/20 flex items-center justify-center mb-8">
              <PackageCheck className="w-6 h-6 text-white/55" />
            </div>
            <p className="text-[12px] tracking-[0.45em] uppercase text-white/65 mb-3">Request Received</p>
            <h3 className="text-2xl font-black mb-3">We have got your request.</h3>
            <p className="text-white/72 text-sm font-light leading-relaxed max-w-sm mb-8">
              Your request and files have been received. We will review everything and get back with a quote within 24 hours.
            </p>
            <button onClick={onClose}
              className="text-[12px] font-black uppercase tracking-widest border border-white/20 px-6 py-3 text-white/75 hover:text-white hover:border-white transition-all">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-6 sm:space-y-8">

            {/* File Upload */}
            <div>
              <p className="text-sm tracking-[0.25em] uppercase text-white/75 mb-3">Upload Files</p>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-none p-8 text-center transition-colors cursor-pointer
                  ${dragging ? 'border-white/40 bg-white/[0.04]' : 'border-white/12 hover:border-white/22'}`}
                onClick={() => document.getElementById('cpFileInput').click()}
              >
                <Upload className="mx-auto mb-3 text-white/62" size={22} />
                <p className="text-base text-white/72 font-light">Drag files here or click to browse</p>
                <p className="text-sm text-white/65 mt-2 uppercase tracking-widest">STL · STEP · OBJ · 3MF · IGES</p>
                <input id="cpFileInput" type="file" multiple accept=".stl,.step,.stp,.obj,.3mf,.iges,.igs"
                  className="hidden" onChange={handleFileInput} />
              </div>
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/[0.03] border border-white/15 px-4 py-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[13px] font-black uppercase tracking-widest border border-white/15 px-1.5 py-0.5 text-white/65 shrink-0">
                          {f.name.split('.').pop().toUpperCase()}
                        </span>
                        <span className="text-sm text-white/55 truncate">{f.name}</span>
                      </div>
                      <button type="button" onClick={() => removeFile(i)} className="text-white/58 hover:text-white/60 transition-colors shrink-0 ml-3">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Material */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm tracking-[0.25em] uppercase text-white/75">Material</p>
                <button type="button" onClick={() => setShowMaterialGuide(true)}
                  className="text-[13px] font-black uppercase tracking-widest text-white/60 hover:text-white/78 transition-colors flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                  View guide
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {materials.map(m => (
                  <button key={m} type="button" onClick={() => setMaterial(m)}
                    className={`px-3 py-2.5 text-sm font-bold border transition-all duration-150 text-left
                      ${material === m ? 'border-white text-white bg-white/05' : 'border-white/10 text-white/68 hover:border-white/25'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <p className="text-sm tracking-[0.25em] uppercase text-white/75 mb-3">
                Print Color — <span className="text-white/55">{color}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(col => (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => setColor(col.name)}
                    title={col.name}
                    className={`w-8 h-8 border-2 transition-all duration-200 ${
                      color === col.name ? 'border-white scale-110' : 'border-white/15 hover:border-white/40'
                    }`}
                    style={{ background: col.hex }}
                  />
                ))}
              </div>
              <p className="text-xs text-white/40 mt-2 tracking-widest uppercase">{color} selected — availability may vary by material</p>
            </div>

            {/* Infill + Pattern in a 2-col grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm tracking-[0.25em] uppercase text-white/75 mb-3">
                  Infill Density — <span className="text-white/60">{infillPct}% &nbsp;·&nbsp; {infillDesc(infillPct)}</span>
                </label>
                <input type="range" min={5} max={100} step={5} value={infillPct}
                  onChange={e => setInfillPct(+e.target.value)}
                  className="w-full accent-white" />
              </div>
              <div>
                <label className="block text-sm tracking-[0.25em] uppercase text-white/75 mb-3">Infill Pattern</label>
                <div className="relative">
                  <select value={infillPattern} onChange={e => setInfillPattern(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/10 text-white/75 text-sm px-4 py-3 focus:outline-none focus:border-white/35 appearance-none pr-8 cursor-pointer">
                    {infillPatterns.map(p => <option key={p.value} value={p.value} style={{background:'#1a1a1a',color:'rgba(255,255,255,0.75)'}}>{p.label} — {p.desc}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/65 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Walls + Layer height + Qty in a row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm tracking-[0.25em] uppercase text-white/75 mb-3">
                  Wall Count — <span className="text-white/60">{wallCount} &nbsp;·&nbsp; {wallDesc(wallCount)}</span>
                </label>
                <input type="range" min={1} max={8} step={1} value={wallCount}
                  onChange={e => setWalls(+e.target.value)}
                  className="w-full accent-white" />
              </div>
              <div>
                <label className="block text-sm tracking-[0.25em] uppercase text-white/75 mb-3">
                  Layer Height — <span className="text-white/60">{layerDesc(layerHeight)}</span>
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {layerOptions.map(l => (
                    <button key={l} type="button" onClick={() => setLayer(l)}
                      className={`py-1.5 text-[12px] font-bold border transition-all
                        ${layerHeight === l ? 'border-white text-white' : 'border-white/10 text-white/65 hover:border-white/25'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm tracking-[0.25em] uppercase text-white/75 mb-3">Quantity</label>
                <div className="flex items-center">
                  <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 border border-white/12 text-white/78 hover:border-white/35 hover:text-white transition-all">−</button>
                  <input type="number" min={1} max={999} value={quantity}
                    onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-14 h-10 border-t border-b border-white/12 bg-transparent text-white font-bold text-center text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  <button type="button" onClick={() => setQuantity(q => q + 1)}
                    className="w-10 h-10 border border-white/12 text-white/78 hover:border-white/35 hover:text-white transition-all">+</button>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm tracking-[0.25em] uppercase text-white/75 mb-3">Additional Notes</label>
              <textarea value={description} onChange={e => setDesc(e.target.value)} rows={3}
                placeholder="Use case, colour preference, post-processing, surface finish, special requirements..."
                className={inputCls + " resize-none text-base"} />
            </div>

            {/* Contact */}
            <div>
              <p className="text-sm tracking-[0.25em] uppercase text-white/75 mb-3">Contact Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input required value={name} onChange={e => setName(e.target.value)}
                  placeholder="Your name" className={inputCls + " text-base"} />
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Email address" pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
                  className={inputCls + " text-base"} />
                <input required value={phone} onChange={e => setPhone(e.target.value.replace(/[^0-9+\s\-()]/g, ''))}
                  placeholder="+91 9XXXXXXXXX" minLength={7} className={inputCls + " text-base"} />
              </div>
            </div>

            {/* Honeypot — hidden from real users, bots fill it */}
            <div style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }} aria-hidden="true">
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={e => setHoneypot(e.target.value)}
              />
            </div>

            {submitError && (
              <p className="text-red-400 text-xs text-center -mb-2 px-1">{submitError}</p>
            )}

            <button type="submit"
              disabled={submitting || !name || !email || !phone}
              className="w-full py-4 bg-white text-black text-sm font-black uppercase tracking-[0.18em] hover:bg-white/85 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              Submit Print Request
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
    {showMaterialGuide && <MaterialsGuide onClose={() => setShowMaterialGuide(false)} />}
    </>
  );
}
