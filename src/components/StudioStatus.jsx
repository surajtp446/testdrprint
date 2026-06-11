import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * StudioStatus — a live strip for the Contact page:
 * - OPEN / CLOSED pill computed from IST studio hours (Mon–Sat, 9:00–20:00)
 *   with a pulsing molten dot when open and "opens in…" when closed.
 * - Tap-to-copy chips for phone and email with a ✓ confirmation animation.
 */
const HOURS = { open: 9, close: 20 }; // IST
const PHONE = '+91 94492 14905';
const EMAIL = 'drprint.3dwork@gmail.com';

function istNow() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
}

function studioState() {
  const now = istNow();
  const day = now.getDay(); // 0 Sun
  const h = now.getHours() + now.getMinutes() / 60;
  const open = day !== 0 && h >= HOURS.open && h < HOURS.close;
  let note;
  if (open) {
    note = `Open now · closes ${HOURS.close - 12} PM IST`;
  } else if (day === 0) {
    note = 'Closed Sundays · opens Mon 9 AM IST';
  } else if (h < HOURS.open) {
    note = `Opens today at ${HOURS.open} AM IST`;
  } else {
    note = day === 6 ? 'Opens Mon 9 AM IST' : `Opens tomorrow at ${HOURS.open} AM IST`;
  }
  return { open, note };
}

function CopyChip({ label, value, display }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };
  return (
    <button type="button" onClick={copy}
      className="group flex items-center gap-3 border border-white/12 px-5 py-3 hover:border-white/35 transition-all duration-200 text-left"
      aria-label={`Copy ${label}`}>
      <span className="text-[9px] tracking-[0.35em] uppercase text-white/30 shrink-0">{label}</span>
      <span className="text-sm text-white/70 group-hover:text-white transition-colors font-light">{display || value}</span>
      <motion.span
        key={copied ? 'check' : 'copy'}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`ml-auto text-[10px] tracking-[0.2em] uppercase shrink-0 ${copied ? 'text-[#ff9636]' : 'text-white/25 group-hover:text-white/50'}`}>
        {copied ? '✓ Copied' : 'Copy'}
      </motion.span>
    </button>
  );
}

export default function StudioStatus() {
  const [state, setState] = useState(studioState);
  useEffect(() => {
    const id = setInterval(() => setState(studioState()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 border border-white/10 bg-[#0a0a0c] p-5 mb-12"
    >
      {/* status pill */}
      <div className="flex items-center gap-3 shrink-0 lg:pr-6 lg:border-r border-white/8">
        <span className="relative flex w-2.5 h-2.5">
          {state.open && (
            <span className="absolute inline-flex h-full w-full rounded-full animate-ping"
              style={{ background: 'rgba(255,150,60,0.5)' }} />
          )}
          <span className="relative inline-flex w-2.5 h-2.5 rounded-full"
            style={{ background: state.open ? '#ff9636' : 'rgba(255,255,255,0.25)' }} />
        </span>
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.3em] text-white">
            Studio {state.open ? 'Open' : 'Closed'}
          </div>
          <div className="text-[11px] text-white/40 font-light mt-0.5">{state.note}</div>
        </div>
      </div>

      {/* copy chips */}
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        <CopyChip label="Call" value={PHONE} />
        <CopyChip label="Mail" value={EMAIL} />
      </div>
    </motion.div>
  );
}
