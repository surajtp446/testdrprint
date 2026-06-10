import { useEffect, useRef } from 'react';

// Uses a DOM ref + rAF instead of React state — zero re-renders, perfectly smooth.
export default function ScrollProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let rafId;
    function update() {
      const el  = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = `${pct}%`;
      rafId = requestAnimationFrame(update);
    }
    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div ref={barRef} style={{
      position: 'fixed', top: 0, left: 0, zIndex: 9999,
      height: '1.5px',
      width: '0%',
      background: 'rgba(255,255,255,0.65)',
      pointerEvents: 'none',
      willChange: 'width',
    }} />
  );
}
