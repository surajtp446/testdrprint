import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * RouteShutter — a quick two-panel sweep on every route change.
 * Layers a near-black panel and a thin molten-orange trailing edge that
 * wipe up across the screen, like a print head travel move. Skips the
 * very first load and respects prefers-reduced-motion.
 */
export default function RouteShutter() {
  const location = useLocation();
  const first = useRef(true);
  const [sweepKey, setSweepKey] = useState(null);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setSweepKey(location.pathname + Date.now());
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {sweepKey && (
        <motion.div
          key={sweepKey}
          className="fixed inset-0 z-[9998] pointer-events-none"
          initial="enter"
          animate="exit"
          onAnimationComplete={() => setSweepKey(null)}
        >
          {/* main panel */}
          <motion.div
            className="absolute inset-0 bg-[#0a0a0a]"
            variants={{
              enter: { y: '100%' },
              exit: { y: ['100%', '0%', '-100%'], transition: { duration: 0.7, times: [0, 0.45, 1], ease: [0.76, 0, 0.24, 1] } },
            }}
          />
          {/* molten trailing edge */}
          <motion.div
            className="absolute inset-x-0 h-[2px]"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,150,60,0.9), transparent)', top: '100%' }}
            variants={{
              enter: { y: 0 },
              exit: { y: ['0vh', '-100vh', '-200vh'], transition: { duration: 0.7, times: [0, 0.45, 1], ease: [0.76, 0, 0.24, 1] } },
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
