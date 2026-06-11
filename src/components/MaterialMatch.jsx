import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * MaterialMatch — interactive "which material do I need?" picker.
 * Visitor taps their use case, gets an instant recommendation with the
 * reasoning and starting price. Converts browsers into quote requests.
 */
const CASES = [
  {
    key: 'proto', label: 'Quick Prototype',
    material: 'PLA', price: '₹6/g',
    why: 'Fastest and most economical. Crisp detail, rigid enough for fit checks and visual validation. Not for heat or sun exposure.',
    alt: 'PETG if it needs light functional use',
  },
  {
    key: 'functional', label: 'Load-Bearing Part',
    material: 'PA6-CF', price: '₹20/g',
    why: 'Carbon-fibre nylon — the strongest material we run. High stiffness-to-weight, survives repeated mechanical stress, bolts and threads hold.',
    alt: 'PETG-CF for stiff parts on a tighter budget',
  },
  {
    key: 'outdoor', label: 'Outdoor / Sunlight',
    material: 'ASA', price: '₹14/g',
    why: 'UV-stable and weather-resistant — won\u2019t yellow, chalk or go brittle outdoors. The right call for enclosures, mounts and fixtures that live outside.',
    alt: 'ASA Aero where weight also matters',
  },
  {
    key: 'flexible', label: 'Flexible / Grippy',
    material: 'TPU', price: '₹16/g',
    why: 'Rubber-like flexibility — gaskets, seals, grips, vibration dampers, phone-case-feel parts. Bends and bounces back, doesn\u2019t crack.',
    alt: 'Softer or firmer shore hardness on request',
  },
  {
    key: 'drone', label: 'Drone / RC / Aero',
    material: 'LW-PLA', price: '₹18/g',
    why: 'Foams during printing to roughly half normal weight — built for airframes, wings and cowls where every gram is flight time.',
    alt: 'PA6-CF for motor mounts and structural arms',
  },
  {
    key: 'display', label: 'Figurine / High Detail',
    material: 'UV Resin', price: 'from ₹15/g',
    why: '0.05 mm layer resolution — smooth surfaces, sharp miniature detail, no visible layer lines. Washed, cured and inspected before dispatch.',
    alt: 'PLA at 0.08 mm layers for larger display pieces',
  },
];

export default function MaterialMatch() {
  const [active, setActive] = useState(CASES[0]);

  return (
    <section className="py-20 px-6 bg-[#070708] border-y border-white/8"
      aria-label="Find the right 3D printing material">
      <div className="container mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-10">
          <p className="text-[11px] tracking-[0.55em] text-white/30 uppercase mb-3">Interactive · Material Match</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            What are you building?
          </h2>
          <p className="text-white/45 text-sm font-light mt-3 max-w-md leading-relaxed">
            Tap your use case — we'll tell you the material we'd print it in, and why.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* use-case chips */}
          <div className="md:col-span-2 flex md:flex-col flex-wrap gap-2">
            {CASES.map((c) => (
              <button key={c.key} type="button" onClick={() => setActive(c)}
                aria-pressed={active.key === c.key}
                className={`text-left px-5 py-3.5 text-[11px] font-black uppercase tracking-[0.18em] border transition-all duration-200 ${
                  active.key === c.key
                    ? 'bg-white text-black border-white'
                    : 'border-white/12 text-white/50 hover:border-white/30 hover:text-white/80'
                }`}>
                {c.label}
              </button>
            ))}
          </div>

          {/* recommendation card */}
          <div className="md:col-span-3 relative min-h-[260px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.key}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="border border-white/12 bg-[#0b0b0d] p-8 md:p-10 h-full"
              >
                <div className="flex items-baseline justify-between gap-4 mb-1">
                  <span className="text-[10px] tracking-[0.45em] text-[#ff9636]/70 uppercase">We'd print this in</span>
                  <span className="text-white/40 text-xs font-light shrink-0">{active.price}</span>
                </div>
                <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-5">
                  {active.material}
                </h3>
                <p className="text-white/55 text-sm font-light leading-relaxed mb-4">{active.why}</p>
                <p className="text-white/30 text-xs font-light mb-8">Also consider: {active.alt}</p>
                <div className="flex flex-wrap gap-3">
                  <a href="/calculator"
                    className="text-[10px] font-black uppercase tracking-[0.22em] bg-white text-black px-6 py-3 hover:bg-white/85 transition-all duration-200">
                    Price My Part
                  </a>
                  <Link to="/contact"
                    className="text-[10px] font-black uppercase tracking-[0.22em] border border-white/15 text-white/60 px-6 py-3 hover:border-white/40 hover:text-white transition-all duration-200">
                    Not Sure? Ask Us
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
