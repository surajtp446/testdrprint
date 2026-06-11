import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

const FRAMES = [
  {
    kicker: 'Rapid Prototyping · Bengaluru',
    title: 'CAD to part in 24–72 hours.',
    body: 'Upload an STL, get a quote the same day, hold the part in two to three. Functional prototypes for design validation, fit checks and investor demos — printed in Basavanagudi, Bengaluru.',
  },
  {
    kicker: 'Functional & Engineering Parts',
    title: 'Built to take real load.',
    body: 'Brackets, enclosures, jigs and end-use components at ±0.1 mm accuracy. PETG, ASA, TPU and Carbon-Fibre Nylon — material matched to the job, across Karnataka and pan-India.',
  },
  {
    kicker: 'Drone · UAV · Aerospace',
    title: 'Parts that actually fly.',
    body: 'Motor mounts, airframes, payload bays and aero fairings — lightweight LW-PLA and PA-CF, engineered by a team that built India’s fastest FPV drone and a SAE AeroTHON AIR-2 platform.',
  },
  {
    kicker: 'For Startups & Makers',
    title: 'Your hardware partner.',
    body: 'From a single concept print to small-batch production of 500+. No tooling cost, no MOQ. The rapid-prototyping backbone for Bengaluru’s hardware startups.',
  },
];

const N = FRAMES.length;
const SEG = 1 / N;

// One frame = one component instance, so hooks are top-level & stable.
function Frame({ index, progress, data }) {
  const start = SEG * index;
  const mid   = SEG * (index + 0.5);
  const end   = SEG * (index + 1);
  const opacity = useTransform(
    progress,
    [start, start + SEG * 0.18, end - SEG * 0.18, end],
    [0, 1, 1, 0]
  );
  const y = useTransform(progress, [start, mid, end], [40, 0, -40]);

  return (
    <motion.div style={{ opacity, y }}
      className="absolute inset-x-8 md:inset-x-20 top-1/2 -translate-y-1/2">
      <p className="text-[11px] tracking-[0.5em] text-white/40 uppercase mb-5">{data.kicker}</p>
      <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[0.98] mb-6">
        {data.title}
      </h2>
      <p className="text-base md:text-lg text-white/55 font-light leading-relaxed max-w-xl">
        {data.body}
      </p>
      <span className="mt-6 inline-block text-[10px] tracking-[0.4em] text-white/25 uppercase">
        {String(index + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}
      </span>
    </motion.div>
  );
}

function RailTick({ index, progress }) {
  const opacity = useTransform(
    progress,
    [SEG * index, SEG * (index + 0.5), SEG * (index + 1)],
    [0.2, 1, 0.2]
  );
  return <motion.div style={{ opacity }} className="w-px h-10 bg-white origin-top" />;
}

export default function ScrollScene() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  return (
    <section ref={ref} className="relative bg-black" style={{ height: `${N * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }} />

        <div className="absolute left-6 md:left-14 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-3 z-20">
          {FRAMES.map((_, i) => (
            <RailTick key={i} index={i} progress={scrollYProgress} />
          ))}
        </div>

        <div className="relative w-full max-w-3xl mx-auto px-8 md:px-20 h-screen">
          {FRAMES.map((f, i) => (
            <Frame key={i} index={i} progress={scrollYProgress} data={f} />
          ))}
        </div>

        <div className="absolute bottom-8 right-6 md:right-14 z-20">
          <Link to="/calculator"
            className="inline-block text-[10px] font-black uppercase tracking-[0.25em] bg-white text-black px-7 py-3.5 hover:bg-white/85 transition-all duration-300">
            Get a Quote
          </Link>
        </div>
      </div>
    </section>
  );
}
