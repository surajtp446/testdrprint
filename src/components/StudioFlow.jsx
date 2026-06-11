import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * StudioFlow — how every part moves through Dr.PrinT.
 * A horizontal (vertical on mobile) pipeline whose connector line draws
 * itself on scroll, each station lighting up in sequence with a molten
 * dot — the same language as a print job moving through the studio.
 */
const STATIONS = [
  { n: '01', title: 'Quote',  desc: 'STL or sketch in, transparent per-gram quote out — same day.' },
  { n: '02', title: 'Slice',  desc: 'Profile tuned per material: walls, infill and supports set for the job, not defaults.' },
  { n: '03', title: 'Print',  desc: 'Queued on a calibrated Bambu Lab machine. Rush jobs jump the queue.' },
  { n: '04', title: 'QC',     desc: 'Dimensions checked against the model, surfaces inspected, supports cleaned.' },
  { n: '05', title: 'Ship',   desc: 'Bubble-wrapped, boxed and dispatched pan-India — or same-day pickup in Basavanagudi.' },
];

export default function StudioFlow() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-20 px-8 bg-black border-y border-white/5"
      aria-label="How a part moves through the Dr.PrinT studio">
      <div className="container mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }} className="mb-14">
          <p className="text-white/65 text-sm uppercase tracking-[0.4em] mb-5">02 — The Pipeline</p>
          <h2 className="text-3xl font-black text-white tracking-tight">
            Every part takes the same path.
          </h2>
        </motion.div>

        <div className="relative">
          {/* connector line — draws across as the section enters */}
          <div className="absolute md:top-[7px] md:left-0 md:right-0 md:h-px md:w-auto top-0 bottom-0 left-[7px] w-px bg-white/8" aria-hidden="true" />
          <motion.div
            aria-hidden="true"
            className="absolute md:top-[7px] md:left-0 md:h-px top-0 left-[7px] w-px md:w-full origin-left md:origin-left"
            style={{ background: 'linear-gradient(90deg, rgba(255,150,60,0.8), rgba(255,255,255,0.35))' }}
            initial={{ scaleX: 0, scaleY: 0 }}
            animate={inView ? { scaleX: 1, scaleY: 1 } : {}}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-6">
            {STATIONS.map((st, i) => (
              <motion.div key={st.n}
                initial={{ opacity: 0, y: 18 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.25 + i * 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="relative pl-8 md:pl-0 md:pt-8">
                {/* station dot */}
                <motion.span
                  aria-hidden="true"
                  className="absolute left-0 top-1 md:top-0 md:left-0 w-[15px] h-[15px] rounded-full border border-white/25 bg-black flex items-center justify-center"
                  initial={{ scale: 0.6 }}
                  animate={inView ? { scale: 1 } : {}}
                  transition={{ delay: 0.25 + i * 0.22 }}
                >
                  <motion.span
                    className="w-[5px] h-[5px] rounded-full"
                    style={{ background: '#ff9636' }}
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: [0, 1, 0.6, 1] } : {}}
                    transition={{ delay: 0.35 + i * 0.22, duration: 0.8 }}
                  />
                </motion.span>
                <span className="text-[10px] tracking-[0.4em] text-white/25 uppercase block mb-2">{st.n}</span>
                <h3 className="font-black text-white text-base mb-2">{st.title}</h3>
                <p className="text-white/45 text-xs font-light leading-relaxed">{st.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
