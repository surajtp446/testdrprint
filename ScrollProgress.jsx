import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { materials as allMaterials, materialQuickPicker as tips } from '@/data/materials.js';

const materials = allMaterials.filter(m => m.avoid !== null);

export default function MaterialsGuide({ onClose }) {
  // Lock body scroll while open (same pattern as all other modals)
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }} transition={{ type: 'tween', duration: 0.25 }}
        data-lenis-prevent
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#080808] border border-white/10 overflow-y-auto"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.07) transparent' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-5 bg-[#080808] border-b border-white/15">
          <div>
            <p className="text-[13px] tracking-[0.4em] uppercase text-white/62 mb-0.5">Dr.PrinT</p>
            <h2 className="font-black text-lg">Material Selection Guide</h2>
          </div>
          <button onClick={onClose} className="text-white/65 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {/* Quick picker */}
          <div className="mb-10">
            <p className="text-[12px] tracking-[0.4em] uppercase text-white/65 mb-4">Quick Picker</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tips.map((t, i) => (
                <div key={i} className="flex items-center justify-between border border-white/14 bg-white/[0.02] px-4 py-3 gap-4">
                  <span className="text-sm text-white/72 font-light">{t.q}</span>
                  <span className="text-[12px] font-black uppercase tracking-widest text-white/70 border border-white/12 px-2.5 py-1 shrink-0">{t.a}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Full reference table */}
          <p className="text-[12px] tracking-[0.4em] uppercase text-white/65 mb-4">Full Reference</p>
          <p className="text-white/65 text-sm font-light mb-5">Glass temp = how much heat it handles before deforming. Tensile strength = how much load before it fails.</p>

          <div className="space-y-3">
            {materials.map((m, i) => (
              <div key={i} className="border border-white/14 overflow-hidden" style={{ background: m.color }}>
                <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr_1fr_1fr] gap-0">
                  {/* Name + tag */}
                  <div className="p-4 border-b sm:border-b-0 sm:border-r border-white/14 flex flex-col justify-center">
                    <span className="font-black text-base text-white">{m.name}</span>
                    <span className="text-[13px] font-black uppercase tracking-widest text-white/65 mt-0.5">{m.tag}</span>
                  </div>
                  {/* Specs */}
                  <div className="p-4 border-b sm:border-b-0 sm:border-r border-white/14">
                    <p className="text-[13px] uppercase tracking-widest text-white/60 mb-1">Glass Temp · Tensile</p>
                    <p className="text-sm text-white/55 font-light">{m.tg} &nbsp;·&nbsp; {m.tensile}</p>
                    <p className="text-[13px] uppercase tracking-widest text-white/60 mt-2 mb-1">Best For</p>
                    <p className="text-sm text-white/55 font-light">{m.best}</p>
                  </div>
                  {/* Description */}
                  <div className="p-4 border-b sm:border-b-0 sm:border-r border-white/14">
                    <p className="text-[13px] uppercase tracking-widest text-white/60 mb-1">Why Use It</p>
                    <p className="text-sm text-white/78 font-light leading-relaxed">{m.desc}</p>
                  </div>
                  {/* Avoid */}
                  <div className="p-4">
                    <p className="text-[13px] uppercase tracking-widest text-white/60 mb-1">Avoid If</p>
                    <p className="text-sm text-white/70 font-light">{m.avoid}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-white/55 text-sm text-center mt-6 font-light">
            Values are approximate and vary with print orientation, infill percentage and wall count.
            Still not sure? Tell us your application and we will advise.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
