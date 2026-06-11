import React from 'react';
import { motion } from 'framer-motion';
import { staggerContainer } from '@/data/animations.js';

const reasons = [
  { num: '01', title: 'Calibrated Bambu Lab Systems', desc: 'Professional-grade hardware maintained for consistent dimensional accuracy on every build.' },
  { num: '02', title: 'Structured Print Optimization', desc: 'Every file undergoes orientation review, support strategy, and slicing optimization before production.' },
  { num: '03', title: 'Material-Focused Engineering', desc: 'Material selection is matched to mechanical requirements — not just availability.' },
  { num: '04', title: 'Project Transparency', desc: 'Clear communication from inquiry to delivery. You always know where your project stands.' },
  { num: '05', title: 'One-Off to Production Runs', desc: 'We handle single prototypes and repeat batch orders with the same attention to quality.' },
];

function ReasonRow({ reason, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col md:flex-row gap-6 md:gap-12 py-8 border-b border-white/8 last:border-0 group"
    >
      {/* Animated left highlight bar */}
      <motion.div
        className="absolute left-0 top-0 w-[2px] bg-white/35 pointer-events-none"
        initial={{ height: '0%', opacity: 0 }}
        whileInView={{ height: '100%', opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 + 0.2, ease: 'easeOut' }}
      />

      <span className="text-white/60 text-2xl font-black md:w-16 flex-shrink-0 pl-4 group-hover:text-white/45 transition-colors duration-300">
        {reason.num}
      </span>

      <div className="flex-1 pl-4 md:pl-0">
        <h3 className="text-base font-black text-white mb-2 group-hover:text-white/90 transition-colors">
          {reason.title}
        </h3>
        <p className="text-white/60 text-sm font-light leading-relaxed">{reason.desc}</p>
      </div>

      {/* Hover background sweep */}
      <motion.div
        className="absolute inset-0 bg-white/[0.018] pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      />
    </motion.div>
  );
}

export default function WhyChooseDrPrintSection() {
  return (
    <section className="py-24 px-6 bg-[#0d0d0d]">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-white/60 text-sm uppercase tracking-[0.4em] mb-4">Trust</p>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Why Choose Dr.PrinT</h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-0"
        >
          {reasons.map((reason, i) => (
            <ReasonRow key={i} reason={reason} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
