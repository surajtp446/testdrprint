import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * Bambu-style scroll-reveal credibility band.
 * Surfaces the biggest trust wins high on the page with
 * parallax depth + scroll-linked reveals.
 */
export default function CredibilityBand() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Parallax: headline drifts up slightly, big watermark drifts opposite
  const yHead  = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const yMark  = useTransform(scrollYProgress, [0, 1], [-60, 60]);
  const opMark = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.05, 0.02]);

  const wins = [
    {
      stat: '329',
      unit: 'km/h',
      title: "India's Fastest FPV Drone",
      desc: 'We engineered the aerostructure for a record-setting high-speed drone — built to survive extreme aerodynamic loads.',
    },
    {
      stat: 'AIR 2',
      unit: 'National',
      title: 'SAE AeroTHON 2025',
      desc: 'Parts and rapid prototypes behind a 2nd-place all-India finish among the country’s top engineering teams.',
    },
    {
      stat: 'Defence',
      unit: 'Grade',
      title: 'UAV Airframes Supplied',
      desc: 'Fixed-wing platforms with payload-release mechanisms, delivered to an authorised defence partner.',
    },
  ];

  return (
    <section ref={ref} className="relative py-24 px-6 bg-black overflow-hidden border-t border-white/10">
      {/* Drifting watermark */}
      <motion.div
        aria-hidden
        style={{ y: yMark, opacity: opMark }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
      >
        <span className="font-black tracking-tighter text-white whitespace-nowrap"
          style={{ fontSize: 'clamp(8rem,22vw,20rem)', lineHeight: 1 }}>
          BUILT&nbsp;TO&nbsp;FLY
        </span>
      </motion.div>

      <div className="relative container mx-auto max-w-6xl">
        <motion.div style={{ y: yHead }} className="mb-16 text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-[11px] tracking-[0.55em] text-white/40 uppercase mb-4">
            Proven in the Field
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tight text-white leading-[0.95]">
            Not just prints.<br />
            <span className="text-white/40">Flight-tested engineering.</span>
          </motion.h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10">
          {wins.map((w, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="group bg-[#060606] hover:bg-[#0c0c0c] transition-colors duration-500 p-8 md:p-10">
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl md:text-5xl font-black text-white tracking-tighter">{w.stat}</span>
                <span className="text-[11px] tracking-[0.3em] text-white/40 uppercase">{w.unit}</span>
              </div>
              <div className="w-8 h-px bg-white/25 mb-5 group-hover:w-16 transition-all duration-500" />
              <h3 className="text-lg font-black text-white mb-3 leading-snug">{w.title}</h3>
              <p className="text-sm text-white/55 font-light leading-relaxed">{w.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 text-center">
          <Link to="/projects"
            className="inline-block text-[11px] font-black uppercase tracking-[0.25em] text-white/70 border border-white/15 px-8 py-3.5 hover:bg-white hover:text-black transition-all duration-300">
            See the Full Portfolio →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
