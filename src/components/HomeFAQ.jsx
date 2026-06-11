import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * HomeFAQ — visible FAQ that mirrors the FAQPage JSON-LD in index.html.
 * Google requires the on-page content to match the structured data,
 * and FAQ-rich pages are a strong long-tail keyword surface
 * ("how much does 3D printing cost in Bangalore", etc).
 */
const FAQS = [
  {
    q: 'How much does 3D printing cost in Bangalore?',
    a: 'At Dr.PrinT, FDM 3D printing starts from ₹6/gram for PLA. Engineering materials like PETG and ASA start from ₹12–14/gram, and Carbon-Fibre Nylon (PA6-CF / PA12-CF) from ₹20/gram. The final price depends on weight, material, and infill — use our instant price calculator or WhatsApp us your STL for a free quote within 24 hours.',
  },
  {
    q: 'How fast can I get my 3D printed parts in Bengaluru?',
    a: 'Standard turnaround is 2–5 days including pan-India shipping. Rush orders can be printed in 24–48 hours. If you are in Bengaluru, parts can often be ready for pickup in Basavanagudi the next day.',
  },
  {
    q: 'What materials can you 3D print?',
    a: 'We print 9 engineering-grade materials: PLA, PETG, ASA, TPU (flexible), LW-PLA (lightweight, for drones), PETG-CF, ASA Aero, and Carbon-Fibre Nylon PA6-CF and PA12-CF. We also offer UV resin printing at 0.05 mm resolution for figurines, miniatures and jewellery masters.',
  },
  {
    q: 'Can you 3D print without a CAD file or 3D model?',
    a: 'Yes. Our custom 3D design service turns your sketch, photo, or broken part into a printable 3D model — design fees start at ₹500. We handle reverse-engineering of discontinued or damaged components too.',
  },
  {
    q: 'Do you print drone and UAV parts?',
    a: 'Yes — drone parts are a specialty. We print motor mounts, airframes, payload bays, landing gear and aero fairings in LW-PLA and Carbon-Fibre Nylon. Our team built India\u2019s fastest FPV drone (329 km/h) and a SAE AeroTHON AIR-2 platform.',
  },
  {
    q: 'Do you handle small-batch production runs?',
    a: 'Yes. We produce 10 to 500+ identical parts with no tooling cost and no minimum order quantity — ideal for startups validating products before committing to injection moulding.',
  },
];

function FaqItem({ item, open, onToggle }) {
  return (
    <div className="border-b border-white/10">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-6 py-5 text-left group"
      >
        <span className="text-sm md:text-base font-bold text-white/85 group-hover:text-white transition-colors">
          {item.q}
        </span>
        <span className={`shrink-0 text-white/40 transition-transform duration-300 ${open ? 'rotate-45' : ''}`}
          style={{ fontSize: 20, lineHeight: 1 }}>+</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-sm text-white/55 font-light leading-relaxed max-w-3xl">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HomeFAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section className="py-20 px-6 bg-[#050505] border-t border-white/8" aria-label="Frequently asked questions about 3D printing in Bengaluru">
      <div className="container mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-10">
          <p className="text-[11px] tracking-[0.55em] text-white/30 uppercase mb-2">Good to Know</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            3D Printing in Bengaluru — FAQs
          </h2>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          {FAQS.map((item, i) => (
            <FaqItem key={i} item={item} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </motion.div>

        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="mt-8 text-sm text-white/40 font-light">
          Still deciding? <Link to="/contact" className="text-white/70 underline underline-offset-4 hover:text-white transition-colors">Talk to us</Link> — we reply on WhatsApp within hours.
        </motion.p>
      </div>
    </section>
  );
}
