import React from 'react';
import { motion } from 'framer-motion';

const clients = [
  'BMS College of Engineering',
  'RV College of Engineering',
  'PES University',
  'Individual Makers',
  'Startup Teams',
  'Architecture Studios',
  'Medical Device Builders',
  'FPV Racing Teams',
];

// Duplicate for seamless loop
const track = [...clients, ...clients];

export default function TrustBar() {
  return (
    <section className="py-10 bg-black border-t border-white/8 overflow-hidden">
      <motion.p
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.8 }}
        className="text-center text-[11px] tracking-[0.5em] uppercase text-white/35 mb-5 px-6">
        Trusted By
      </motion.p>

      {/* Marquee wrapper — fades out on edges */}
      <div className="relative" style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
      }}>
        <motion.div
          className="flex gap-10 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ repeat: Infinity, duration: 22, ease: 'linear' }}
          style={{ width: 'max-content' }}>
          {track.map((name, i) => (
            <span key={i} className="flex items-center gap-10">
              <span className="text-[12px] text-white/30 font-medium uppercase tracking-[0.22em]">
                {name}
              </span>
              <span className="text-white/12 text-[8px]">◆</span>
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
