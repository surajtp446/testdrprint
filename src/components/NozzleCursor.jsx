import React, { useEffect, useRef } from 'react';

/**
 * NozzleCursor — the cursor is a print nozzle.
 *
 * - The pointer is drawn as a small hot-end: carriage, nozzle cone, and a
 *   molten tip glow.
 * - Moving the mouse EXTRUDES filament: a trail of recent positions is
 *   rendered as a bead that is bright molten orange at the tip and cools
 *   to faint grey-white before fading — exactly like fresh extrusion.
 * - Hovering anything interactive (links, buttons, inputs) "heats" the
 *   nozzle: the glow intensifies and a thin heater ring appears.
 * - Pressing the mouse squishes the nozzle down (first-layer squish).
 *
 * Desktop / fine-pointer only. The global CSS already hides the native
 * cursor on hover-capable devices.
 */
const TRAIL_MAX = 26;
const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, [onclick], summary';

export default function NozzleCursor() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf, W = 0, H = 0;

    const pos = { x: -100, y: -100 };   // raw mouse
    const eased = { x: -100, y: -100 }; // eased head position
    const trail = [];
    let hot = 0, hotTarget = 0;         // interactive hover heat (0..1)
    let press = 0, pressTarget = 0;     // mouse-down squish
    let idleFade = 0;                   // hide when mouse leaves window

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e) => {
      pos.x = e.clientX; pos.y = e.clientY;
      idleFade = 1;
      hotTarget = e.target && e.target.closest && e.target.closest(INTERACTIVE) ? 1 : 0;
    };
    const onDown = () => { pressTarget = 1; };
    const onUp = () => { pressTarget = 0; };
    const onLeave = () => { idleFade = 0; };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.documentElement.addEventListener('mouseleave', onLeave);

    const frame = () => {
      raf = requestAnimationFrame(frame);

      eased.x += (pos.x - eased.x) * 0.32;
      eased.y += (pos.y - eased.y) * 0.32;
      hot += (hotTarget - hot) * 0.14;
      press += (pressTarget - press) * 0.3;

      // record trail only while actually moving (no extrusion when parked)
      const last = trail[trail.length - 1];
      const moved = !last || Math.hypot(eased.x - last.x, eased.y - last.y) > 1.5;
      if (moved && !reduceMotion) trail.push({ x: eased.x, y: eased.y });
      if (trail.length > TRAIL_MAX || (!moved && trail.length > 0 && Math.random() < 0.25)) trail.shift();

      ctx.clearRect(0, 0, W, H);
      if (idleFade < 0.02) { trail.length = 0; return; }

      // ── extruded filament trail ──
      ctx.lineCap = 'round';
      for (let i = 1; i < trail.length; i++) {
        const u = i / trail.length; // 0 = oldest, 1 = at nozzle
        const cool = 1 - u;
        // molten near nozzle → cooled grey → fade out
        const r = Math.round(255 - cool * 60);
        const g = Math.round(150 + cool * 60);
        const b = Math.round(60 + cool * 150);
        ctx.strokeStyle = `rgba(${r},${g},${b},${(u * 0.55) * idleFade})`;
        ctx.lineWidth = 1 + u * 1.8;
        if (u > 0.8) { ctx.shadowColor = 'rgba(255,140,50,0.5)'; ctx.shadowBlur = 6; }
        else ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // ── the nozzle ──
      const x = eased.x, y = eased.y;
      const squish = 1 - press * 0.25;
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = idleFade;

      // heater ring when hovering interactive elements
      if (hot > 0.03) {
        ctx.beginPath();
        ctx.arc(0, 0, 16 + hot * 4, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,150,60,${hot * 0.5})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // carriage block
      ctx.fillStyle = `rgba(${52 + hot * 30},${52},${50},0.95)`;
      ctx.strokeStyle = 'rgba(220,220,220,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(-7, -16 * squish, 14, 9 * squish);
      ctx.fill(); ctx.stroke();

      // nozzle cone
      ctx.beginPath();
      ctx.moveTo(-5, -7 * squish); ctx.lineTo(5, -7 * squish);
      ctx.lineTo(2, -2 * squish); ctx.lineTo(0, 0);
      ctx.lineTo(-2, -2 * squish);
      ctx.closePath();
      ctx.fillStyle = `rgb(${90 + hot * 80},${80 + hot * 20},${70})`;
      ctx.fill();
      ctx.strokeStyle = 'rgba(200,190,180,0.45)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // molten tip
      ctx.beginPath();
      ctx.arc(0, 1, 2 + hot * 1.2 + press * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,170,90,1)';
      ctx.shadowColor = 'rgba(255,140,40,0.95)';
      ctx.shadowBlur = 10 + hot * 14;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-[9999] pointer-events-none hidden md:block"
    />
  );
}
