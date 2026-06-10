import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import CustomOrderPanel from '@/components/CustomOrderPanel.jsx';

export default function GlobalCustomButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating tab — right edge, vertical text, always visible */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Custom Order"
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2.5 bg-white text-black py-5 px-3 hover:bg-white/90 active:bg-white/80 transition-all duration-200 shadow-2xl"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          {/* Plus icon rotated to be upright in vertical text */}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.8" strokeLinecap="round"
            style={{ transform: 'rotate(90deg)', flexShrink: 0 }}>
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Custom Order</span>
        </button>
      )}

      <AnimatePresence>
        {open && <CustomOrderPanel onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
