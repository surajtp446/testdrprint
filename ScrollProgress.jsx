import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// Animates a numeric value from 0 to `target` over `duration` ms
function useCountUp(target, duration = 1200, decimals = 0) {
  const [val, setVal]     = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.6 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    let raf;
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      // ease out expo
      const ease = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setVal(parseFloat((ease * target).toFixed(decimals)));
      if (t < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [started, target, duration, decimals]);

  return [val, ref];
}

export default function ValueStrip() {
  const [v0, r0] = useCountUp(6);
  const [v1, r1] = useCountUp(24);
  const [v2, r2] = useCountUp(5);
  const [v3, r3] = useCountUp(6);

  const stats = [
    { valRef: r0, display: `₹${v0}`, sub: '/gram', label: 'Starts from',  desc: 'Transparent pricing. No hidden costs.' },
    { valRef: r1, display: `${v1}h`, sub: '',       label: 'Quote in',    desc: 'Send STL → get price same day.' },
    { valRef: r2, display: `2–${v2}`, sub: ' days', label: 'Delivered in',desc: 'Rush orders in 24h available.' },
    { valRef: r3, display: `${v3}`,   sub: '',       label: 'Materials',   desc: 'PLA to Carbon Fibre Nylon.' },
  ];

  return (
    <section className="py-12 px-6 bg-[#060606] border-t border-b border-white/10">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-white/12">
            {stats.map((item, i) => (
              <div key={i} ref={item.valRef} className="flex flex-col items-center text-center px-4 md:px-6">
                <div className="flex items-baseline gap-0.5 mb-1">
                  <span className="text-3xl md:text-4xl font-black text-white tabular-nums">
                    {item.display}
                  </span>
                  {item.sub && <span className="text-sm text-white/50 font-light">{item.sub}</span>}
                </div>
                <span className="text-[11px] tracking-[0.3em] uppercase text-white/50 mb-1.5">{item.label}</span>
                <span className="text-[12px] text-white/42 font-light leading-snug">{item.desc}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="/calculator"
              className="px-8 py-3 bg-white text-black text-[12px] font-black uppercase tracking-[0.2em] hover:bg-white/85 transition-all">
              Get a Free Quote
            </a>
            <a href="https://wa.me/919449214905?text=Hi%2C%20I%20need%20a%20quote%20for%203D%20printing"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-3 border border-green-500/30 text-green-400 text-[12px] font-black uppercase tracking-[0.2em] hover:bg-green-500/10 transition-all">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.52 5.845L.057 23.486a.5.5 0 00.603.633l5.826-1.527A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.371l-.36-.214-3.724.976.994-3.633-.234-.374A9.818 9.818 0 1112 21.818z"/>
              </svg>
              WhatsApp Us Directly
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
