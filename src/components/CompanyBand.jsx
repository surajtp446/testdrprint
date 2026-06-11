import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * CompanyBand — replaces the personal-achievement credibility section.
 * Pure company capability: fleet, materials, tolerance, turnaround,
 * batch capacity, plus an industries marquee. Reads commercial, not CV.
 */

const STATS = [
  { value: 9,   suffix: '',      label: 'Engineering Materials',  sub: 'PLA to Carbon-Fibre Nylon' },
  { value: 0.1, suffix: ' mm',   label: 'Dimensional Tolerance',  sub: 'On calibrated Bambu Lab machines', prefix: '±', decimals: 1 },
  { value: 72,  suffix: ' hrs',  label: 'Prototype Turnaround',   sub: 'Rush orders in 24–48 hrs', prefix: '24–' },
  { value: 500, suffix: '+',     label: 'Parts Per Batch',        sub: 'No tooling cost, no MOQ' },
];

const INDUSTRIES = [
  'Hardware Startups', 'Drone & UAV', 'Automotive', 'Architecture',
  'Robotics', 'Product Design', 'Medical & Dental', 'Engineering Colleges',
  'Consumer Products', 'R&D Labs',
];

function useCountUp(target, active, duration = 1400, decimals = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setVal(target); return; }
    let raf, start;
    const tick = (now) => {
      if (start === undefined) start = now;
      const p = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(Number((e * target).toFixed(decimals)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration, decimals]);
  return val;
}

function Stat({ stat, active, index }) {
  const n = useCountUp(stat.value, active, 1400, stat.decimals || 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={active ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="border-l border-white/12 pl-6"
    >
      <div className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none tabular-nums">
        {stat.prefix || ''}{stat.decimals ? n.toFixed(stat.decimals) : Math.round(n)}{stat.suffix}
      </div>
      <div className="text-[11px] tracking-[0.3em] uppercase text-white/55 mt-3">{stat.label}</div>
      <div className="text-xs text-white/35 font-light mt-1">{stat.sub}</div>
    </motion.div>
  );
}

export default function CompanyBand() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="relative py-24 px-6 bg-[#070707] border-y border-white/8 overflow-hidden"
      aria-label="Dr.PrinT production capability">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14 max-w-2xl"
        >
          <p className="text-[11px] tracking-[0.55em] text-white/30 uppercase mb-3">Production Capability</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
            A production studio,<br />
            <span className="text-white/40">not a hobby printer.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          {STATS.map((s, i) => (
            <Stat key={s.label} stat={s} active={inView} index={i} />
          ))}
        </div>

        {/* industries marquee */}
        <div className="relative overflow-hidden border-t border-white/8 pt-8"
          style={{ maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)' }}>
          <div className="marquee-track flex gap-10 w-max">
            {[...INDUSTRIES, ...INDUSTRIES].map((name, i) => (
              <span key={i} className="flex items-center gap-10 shrink-0">
                <span className="text-[11px] tracking-[0.3em] uppercase text-white/35 whitespace-nowrap">{name}</span>
                <span className="w-1 h-1 rounded-full bg-[#ff9636]/50" aria-hidden="true" />
              </span>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <p className="text-white/40 text-sm font-light max-w-md leading-relaxed">
            Every part is slicer-tuned per material, dimension-checked before dispatch, and shipped pan-India from Bengaluru.
          </p>
          <Link to="/services"
            className="shrink-0 text-[11px] font-black uppercase tracking-widest text-white/60 border border-white/12 px-6 py-3 hover:bg-white hover:text-black transition-all duration-200">
            Our Services →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
