import React, { useEffect, useRef } from 'react';

/**
 * FilamentThread — a sitewide scroll companion.
 *
 * A molten filament strand is "extruded" down the right edge of the
 * viewport as the page scrolls: above the print head the strand has
 * cooled to solid white; at the head it glows molten orange with tiny
 * heat shimmer particles; below it a faint dashed guide shows what is
 * left to print. The same strand lives on every page, so the whole
 * site reads as one continuous print job.
 *
 * Desktop only (hidden < lg), pointer-events: none, ~40 px wide.
 */
export default function FilamentThread() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 1024) return;

    const ctx = canvas.getContext('2d');
    let raf, W = 40, H = 0;
    let target = 0, smooth = 0;
    const shimmer = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      target = max > 0 ? window.scrollY / max : 0;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const X = W * 0.5;
    const PAD = 90; // keep clear of header / footer edges

    const frame = (t) => {
      raf = requestAnimationFrame(frame);
      smooth += (target - smooth) * 0.09;
      const headY = PAD + smooth * (H - PAD * 2);
      const time = t / 1000;

      ctx.clearRect(0, 0, W, H);

      // remaining guide (below head) — dashed, barely-there
      ctx.setLineDash([2, 6]);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(X, headY + 10); ctx.lineTo(X, H - PAD); ctx.stroke();
      ctx.setLineDash([]);

      // extruded strand (above head) — cooled, with a slight waver
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let y = PAD; y <= headY - 6; y += 6) {
        const u = (y - PAD) / Math.max(1, headY - PAD); // 0 top → 1 near head
        const wav = Math.sin(y * 0.05 + time * 0.6) * 1.2 * u;
        y === PAD ? ctx.moveTo(X + wav, y) : ctx.lineTo(X + wav, y);
      }
      const grad = ctx.createLinearGradient(0, PAD, 0, headY);
      grad.addColorStop(0, 'rgba(255,255,255,0.10)');
      grad.addColorStop(0.75, 'rgba(230,225,220,0.30)');
      grad.addColorStop(1, 'rgba(255,150,60,0.85)');
      ctx.strokeStyle = grad;
      ctx.stroke();

      // molten head
      ctx.beginPath();
      ctx.arc(X, headY, 2.6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,170,90,1)';
      ctx.shadowColor = 'rgba(255,140,40,0.9)';
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;

      // heat shimmer particles
      if (Math.random() < 0.25) {
        shimmer.push({ x: X + (Math.random() - 0.5) * 4, y: headY, vy: -0.4 - Math.random() * 0.5, life: 1 });
      }
      for (let i = shimmer.length - 1; i >= 0; i--) {
        const s = shimmer[i];
        s.y += s.vy; s.life -= 0.03;
        if (s.life <= 0) { shimmer.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, 0.9 * s.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,180,110,${s.life * 0.5})`;
        ctx.fill();
      }

      // percentage tick
      ctx.font = '400 8px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fillText(`${Math.round(smooth * 100)}`, X, headY + 22);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="hidden lg:block fixed top-0 right-1 h-screen w-10 z-40 pointer-events-none"
    />
  );
}
