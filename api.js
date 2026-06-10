import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { staggerContainer, staggerItem } from '@/data/animations.js';

const steps = [
  {
    number: '01',
    title: 'Send Your Requirement',
    description: 'Share your design file (STL, STEP, or a sketch) along with your material preference, quantity, and deadline. Not sure what you need? We will advise.',
    detail: 'STL · STEP · OBJ · Sketch — we accept any format',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="6" width="18" height="20" rx="2" stroke="white" strokeOpacity="0.5" strokeWidth="1.2"/>
        <path d="M8 11h10M8 15h10M8 19h6" stroke="white" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round"/>
        <circle cx="25" cy="23" r="5" fill="none" stroke="white" strokeOpacity="0.5" strokeWidth="1.2"/>
        <path d="M23 23l1.5 1.5L27 21" stroke="white" strokeOpacity="0.5" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    number: '02',
    title: 'We Optimise & Confirm',
    description: 'Our team reviews your file for printability, suggests the best material and layer settings, and sends you a quote with timeline. No surprises.',
    detail: 'Quote within 24 hours on all standard requests',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="10" stroke="white" strokeOpacity="0.5" strokeWidth="1.2"/>
        <path d="M12 16.5l2.5 2.5 5.5-5.5" stroke="white" strokeOpacity="0.5" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 6v2M16 24v2M6 16h2M24 16h2" stroke="white" strokeOpacity="0.3" strokeWidth="1" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Printed, Checked & Shipped',
    description: 'Once confirmed, we print on our Bambu Lab systems, run a quality check for dimensional accuracy, and dispatch directly to you — or you can collect.',
    detail: 'Typical turnaround: 2–5 days depending on complexity',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M4 20l4-10h16l4 10" stroke="white" strokeOpacity="0.5" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="4" y="20" width="24" height="6" rx="1.5" stroke="white" strokeOpacity="0.5" strokeWidth="1.2"/>
        <circle cx="10" cy="28" r="2" stroke="white" strokeOpacity="0.5" strokeWidth="1.2"/>
        <circle cx="22" cy="28" r="2" stroke="white" strokeOpacity="0.5" strokeWidth="1.2"/>
        <path d="M14 10v6M18 10v6" stroke="white" strokeOpacity="0.3" strokeWidth="1" strokeLinecap="round"/>
      </svg>
    ),
  },
];

function StepCard({ step, index }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      variants={staggerItem}
      className={`relative p-5 md:p-10 ${
        index < steps.length - 1 ? 'border-b md:border-b-0 md:border-r border-white/15' : ''
      } group hover:bg-white/[0.025] transition-colors duration-500`}
    >
      {/* Large watermark number — animates in */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-6 right-8 text-[72px] font-black text-white/[0.04] leading-none select-none pointer-events-none"
      >
        {step.number}
      </motion.div>

      {/* Icon with glow on hover */}
      <div className="mb-6 opacity-55 group-hover:opacity-90 transition-opacity duration-300">
        {step.icon}
      </div>

      <p className="text-[13px] tracking-[0.4em] text-white/55 uppercase mb-3">{`Step ${step.number}`}</p>

      <h3 className="text-xl font-black text-white mb-4 leading-tight">{step.title}</h3>

      <p className="text-white/65 text-sm font-light leading-relaxed mb-6">{step.description}</p>

      <div className="border-t border-white/10 pt-4">
        <p className="text-[12px] text-white/50 font-light leading-snug">{step.detail}</p>
      </div>

      {/* Animated connector arrow — desktop */}
      {index < steps.length - 1 && (
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, delay: index * 0.2 + 0.4 }}
          className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-white/40"
        >
          <svg width="6" height="12" viewBox="0 0 6 12" fill="none">
            <path d="M1 1l4 5-4 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      )}

      {/* Bottom border highlight — slides in on hover */}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px] bg-white/30 pointer-events-none"
        initial={{ width: '0%' }}
        whileHover={{ width: '100%' }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </motion.div>
  );
}

export default function HowItWorksSection() {
  return (
    <section className="py-24 px-6 bg-[#080808] border-t border-white/12">
      <div className="container mx-auto max-w-6xl">

        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
        >
          <div>
            <p className="text-white/60 text-sm uppercase tracking-[0.4em] mb-4">Process</p>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">How It Works</h2>
          </div>
          <Link to="/contact"
            className="self-start md:self-auto inline-block px-7 py-3 border border-white/20 text-white text-[12px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 whitespace-nowrap">
            Start a Project
          </Link>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-white/15"
        >
          {steps.map((step, i) => (
            <StepCard key={i} step={step} index={i} />
          ))}
        </motion.div>

      </div>
    </section>
  );
}
