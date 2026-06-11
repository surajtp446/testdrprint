import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * TiltCard — wraps any card in a subtle 3D perspective tilt that follows
 * the cursor, with a moving light sheen. Disabled for touch devices and
 * reduced-motion users (renders children untouched).
 */
export default function TiltCard({ children, max = 7, className = '' }) {
  const ref = useRef(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 220, damping: 24 });
  const sy = useSpring(my, { stiffness: 220, damping: 24 });
  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const rotateY = useTransform(sx, [0, 1], [-max, max]);
  const sheenX = useTransform(sx, [0, 1], ['20%', '80%']);
  const sheenY = useTransform(sy, [0, 1], ['20%', '80%']);
  const sheen = useTransform(
    [sheenX, sheenY],
    ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.06) 0%, transparent 55%)`
  );

  const enabled = typeof window !== 'undefined'
    && window.matchMedia('(hover: hover) and (pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!enabled) return <div className={className}>{children}</div>;

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => { mx.set(0.5); my.set(0.5); };

  return (
    <div className={className} style={{ perspective: 900 }}>
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d', position: 'relative' }}
        className="h-full"
      >
        {children}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{ background: sheen }}
        />
      </motion.div>
    </div>
  );
}
