import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * Cinematic hero — a rocket engine bell nozzle is 3D printed layer-by-layer
 * on a CoreXY-style machine. Pure canvas, zero asset weight.
 *
 * - Bell → throat → combustion chamber profile, printed bell-down (as on a real bed).
 * - Newest layers glow molten orange and cool to carbon grey.
 * - Cooling-channel striations on the bell for that regen-cooled look.
 * - Print head follows cursor intent; sparks at the melt zone.
 * - On completion: a brief ignition shimmer in the bell, then the build restarts.
 * - The whole canvas parallax-fades as you scroll, so the hero dissolves
 *   into the next section instead of ending at a hard edge.
 */
const HeroSection = () => {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);

  // Scroll-linked dissolve — hero blends into the page
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const canvasY = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const canvasOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.05]);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '36%']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = canvas.getContext('2d');
    let animId, W, H, DPR = Math.min(window.devicePixelRatio || 1, 2);

    const m = { x: 0, y: 0 };
    const me = { x: 0, y: 0 };

    /**
     * Rocket engine half-width profile, t = 0 (bed) → 1 (top).
     * Printed bell-down: wide bell mouth on the bed, narrowing to the
     * throat, opening into the combustion chamber, capped by the
     * injector dome and propellant manifold.
     */
    function profile(t) {
      if (t < 0.34) {
        // Bell: parabolic expansion contour (widest at bed)
        const u = t / 0.34;
        return 1.0 - 0.72 * Math.pow(u, 1.55);
      }
      if (t < 0.42) {
        // Throat: smooth waist
        const u = (t - 0.34) / 0.08;
        return 0.28 - 0.04 * Math.sin(u * Math.PI);
      }
      if (t < 0.52) {
        // Converging section opening into the chamber
        const u = (t - 0.42) / 0.10;
        return 0.28 + 0.20 * Math.sin(u * Math.PI / 2);
      }
      if (t < 0.80) return 0.48;                 // Combustion chamber barrel
      if (t < 0.92) {
        // Injector dome taper
        const u = (t - 0.80) / 0.12;
        return 0.48 - 0.16 * Math.sin(u * Math.PI / 2);
      }
      // Propellant manifold flange
      return t < 0.97 ? 0.37 : 0.30;
    }

    const LAYER_H = 2.0;
    const BUILD_SPD = reduceMotion ? 0 : 0.00075;
    let buildProg = reduceMotion ? 1 : 0;
    let scanPhase = 0, ignite = 0, sparks = [];

    function addSpark(x, y) {
      for (let i = 0; i < 2; i++)
        sparks.push({ x, y, vx: (Math.random() - .5) * 2.6, vy: -Math.random() * 2.2 - .4, life: 1, r: Math.random() * 1.2 + .4 });
    }

    function dims() {
      const mob = W < 768;
      const cx = mob ? W * 0.5 : W * 0.68;
      const bedY = mob ? H * 0.80 : H * 0.82;
      const objH = Math.min(H * 0.52, 320);
      const objR = Math.min(W, H) * (mob ? 0.155 : 0.145);
      const fw = objR * 4.2, fh = objH * 1.42;
      return { mob, cx, bedY, objH, objR, fw, fh, fl: cx - fw / 2, fr: cx + fw / 2, ft: bedY - fh };
    }

    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * DPR; canvas.height = H * DPR;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    function onMove(e) {
      m.x = (e.clientX / W) * 2 - 1;
      m.y = (e.clientY / H) * 2 - 1;
    }
    window.addEventListener('mousemove', onMove, { passive: true });

    function draw() {
      if (!reduceMotion) animId = requestAnimationFrame(draw);
      me.x += (m.x - me.x) * 0.06;
      me.y += (m.y - me.y) * 0.06;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);

      const { mob, cx, bedY, objH, objR, fl, fr, ft } = dims();
      const px = me.x * (mob ? 6 : 16);
      const py = me.y * (mob ? 4 : 10);

      buildProg += BUILD_SPD;
      // Hold finished engine for an ignition moment, then restart
      if (buildProg > 1) {
        ignite = Math.min(1, ignite + 0.012);
        if (buildProg > 1.45) { buildProg = 0; ignite = 0; }
      }
      const clamped = Math.min(1, buildProg);
      const builtLayers = Math.floor(clamped * (objH / LAYER_H));
      const builtH = builtLayers * LAYER_H;
      const printing = buildProg > 0 && buildProg < 1;

      // ── parallax grid ──
      ctx.save();
      ctx.translate(-px * 0.5, -py * 0.5);
      ctx.strokeStyle = 'rgba(255,255,255,0.02)'; ctx.lineWidth = 1;
      const gs = 46, gStart = mob ? -50 : W * 0.46;
      for (let x = gStart; x < W + 50; x += gs) { ctx.beginPath(); ctx.moveTo(x, -50); ctx.lineTo(x, H + 50); ctx.stroke(); }
      for (let y = -50; y < H + 50; y += gs) { ctx.beginPath(); ctx.moveTo(gStart, y); ctx.lineTo(W + 50, y); ctx.stroke(); }
      ctx.restore();

      // ── CoreXY-style enclosure frame ──
      ctx.save();
      ctx.translate(px * 0.25, py * 0.25);
      const fa = mob ? 0.4 : 0.2;
      ctx.strokeStyle = `rgba(255,255,255,${fa})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(fl, bedY + 8); ctx.lineTo(fl, ft); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(fr, bedY + 8); ctx.lineTo(fr, ft); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(fl - 6, ft); ctx.lineTo(fr + 6, ft); ctx.stroke();
      // CoreXY belt hint along the top rail
      ctx.setLineDash([3, 5]);
      ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(fl + 8, ft + 6); ctx.lineTo(fr - 8, ft + 6); ctx.stroke();
      ctx.setLineDash([]);
      [[fl, ft], [fr, ft], [fl, bedY + 8], [fr, bedY + 8]].forEach(([x, y]) => {
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${fa * 1.4})`; ctx.fill();
      });
      for (let y = ft + 18; y < bedY; y += 22) {
        ctx.beginPath(); ctx.moveTo(fl - 4, y); ctx.lineTo(fl + 4, y);
        ctx.strokeStyle = 'rgba(255,255,255,0.09)'; ctx.lineWidth = 1; ctx.stroke();
      }
      ctx.restore();

      // ── bed ──
      ctx.save(); ctx.translate(px * 0.15, py * 0.15);
      const bl = ctx.createLinearGradient(fl, 0, fr, 0);
      bl.addColorStop(0, 'rgba(255,255,255,0)'); bl.addColorStop(.3, 'rgba(255,255,255,0.32)');
      bl.addColorStop(.7, 'rgba(255,255,255,0.32)'); bl.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath(); ctx.moveTo(fl + 4, bedY); ctx.lineTo(fr - 4, bedY);
      ctx.strokeStyle = bl; ctx.lineWidth = 1.5; ctx.stroke();

      // ── engine layers ──
      const totalLayers = objH / LAYER_H;
      for (let li = 0; li < builtLayers; li++) {
        const lt = li / totalLayers;
        const hw = profile(lt) * objR;
        const y = bedY - li * LAYER_H;
        if (hw < 0.5) continue;
        const isTop = li === builtLayers - 1;
        const fresh = printing ? Math.max(0, 1 - (builtLayers - li) / 14) : 0; // recent layers glow

        // base carbon-fibre grey, brighter toward top, molten tint when fresh
        const base = Math.round((mob ? 70 : 46) + lt * 150);
        const r = Math.round(base + fresh * (255 - base) * 0.85);
        const g = Math.round(base + fresh * (120 - base) * 0.65);
        const b = Math.round(base + 5 - fresh * base * 0.4);
        ctx.fillStyle = `rgb(${r},${g},${Math.max(0, b)})`;
        ctx.fillRect(cx - hw, y - LAYER_H, hw * 2, LAYER_H + .5);

        // wall shading
        ctx.fillStyle = `rgba(0,0,0,0.4)`;
        ctx.fillRect(cx - hw, y - LAYER_H, 2.4, LAYER_H + .5);
        ctx.fillRect(cx + hw - 2.4, y - LAYER_H, 2.4, LAYER_H + .5);

        // layer seams
        if (li % 3 === 0 && !isTop) {
          ctx.beginPath(); ctx.moveTo(cx - hw, y); ctx.lineTo(cx + hw, y);
          ctx.strokeStyle = 'rgba(0,0,0,0.28)'; ctx.lineWidth = .4; ctx.stroke();
        }

        // regenerative-cooling channel striations on the bell
        if (lt < 0.34 && li % 2 === 0) {
          const channels = 7;
          for (let c = 1; c < channels; c++) {
            const chX = cx - hw + (hw * 2 / channels) * c;
            ctx.fillStyle = 'rgba(0,0,0,0.22)';
            ctx.fillRect(chX, y - LAYER_H, 1, LAYER_H);
          }
        }

        if (isTop && printing) {
          const hg = ctx.createLinearGradient(0, y - LAYER_H - 8, 0, y);
          hg.addColorStop(0, 'rgba(255,150,60,0)'); hg.addColorStop(1, 'rgba(255,150,60,0.25)');
          ctx.fillStyle = hg; ctx.fillRect(cx - hw - 2, y - LAYER_H - 8, hw * 2 + 4, LAYER_H + 8);
        }
      }

      // ── ignition shimmer once complete ──
      if (ignite > 0) {
        const bellHW = profile(0.02) * objR;
        const g1 = ctx.createRadialGradient(cx, bedY + 4, 2, cx, bedY + 4, bellHW * 1.3);
        g1.addColorStop(0, `rgba(140,190,255,${0.5 * ignite})`);
        g1.addColorStop(0.4, `rgba(255,170,80,${0.28 * ignite})`);
        g1.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g1;
        ctx.fillRect(cx - bellHW * 1.4, bedY - 30, bellHW * 2.8, 70);
        ctx.font = '400 8px Arial'; ctx.letterSpacing = '.35em';
        ctx.fillStyle = `rgba(150,200,255,${0.55 * ignite})`;
        ctx.fillText('HOT-FIRE CHECK', cx - objR * 0.55, bedY + 40);
      }
      ctx.restore();

      // ── gantry + head ──
      ctx.save(); ctx.translate(px * 0.15, py * 0.15);
      const gantryY = Math.max(ft + 12, Math.min(bedY - 20, bedY - builtH - 28));
      const gRod = ctx.createLinearGradient(fl, 0, fr, 0);
      gRod.addColorStop(0, 'rgba(255,255,255,0.05)'); gRod.addColorStop(.2, 'rgba(255,255,255,0.22)');
      gRod.addColorStop(.8, 'rgba(255,255,255,0.22)'); gRod.addColorStop(1, 'rgba(255,255,255,0.05)');
      ctx.beginPath(); ctx.moveTo(fl - 4, gantryY); ctx.lineTo(fr + 4, gantryY);
      ctx.strokeStyle = gRod; ctx.lineWidth = 3; ctx.stroke();

      const curHW = builtLayers > 0 ? profile(clamped) * objR : objR * 0.8;
      scanPhase += 0.018;
      const autoX = Math.sin(scanPhase) * curHW;
      const cursorX = me.x * curHW * 1.4;
      const headX = cx + Math.max(-curHW - 6, Math.min(curHW + 6, autoX * 0.45 + cursorX * 0.55));
      const headY = gantryY + 4;

      ctx.fillStyle = 'rgba(52,52,52,0.95)';
      ctx.strokeStyle = 'rgba(200,200,200,0.28)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.rect(headX - 9, gantryY - 7, 18, 14); ctx.fill(); ctx.stroke();

      const tip = headY + 16;
      ctx.beginPath();
      ctx.moveTo(headX - 6, headY); ctx.lineTo(headX + 6, headY);
      ctx.lineTo(headX + 3, tip - 6); ctx.lineTo(headX, tip);
      ctx.lineTo(headX - 3, tip - 6); ctx.closePath();
      ctx.fillStyle = 'rgba(78,73,68,1)'; ctx.fill();
      ctx.strokeStyle = 'rgba(170,160,150,0.3)'; ctx.lineWidth = .8; ctx.stroke();
      ctx.fillStyle = 'rgba(72,36,12,0.9)';
      ctx.beginPath(); ctx.rect(headX - 5, headY - 6, 10, 9); ctx.fill();
      ctx.beginPath(); ctx.moveTo(headX, ft - 12); ctx.lineTo(headX, headY - 6);
      const fg = ctx.createLinearGradient(0, ft, 0, headY);
      fg.addColorStop(0, 'rgba(255,255,255,0)'); fg.addColorStop(1, 'rgba(255,255,255,0.16)');
      ctx.strokeStyle = fg; ctx.lineWidth = 1.4; ctx.stroke();

      if (printing) {
        ctx.beginPath(); ctx.arc(headX, tip, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,170,90,1)';
        ctx.shadowColor = 'rgba(255,140,40,0.9)'; ctx.shadowBlur = mob ? 22 : 18;
        ctx.fill(); ctx.shadowBlur = 0;
        if (Math.random() < 0.12) addSpark(headX, tip);
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx; s.y += s.vy; s.vy += 0.1; s.life -= 0.05;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,180,110,${s.life * 0.7})`; ctx.fill();
      }

      // HUD readout
      const pct = Math.min(100, Math.round(clamped * 100));
      ctx.font = '400 8px Arial'; ctx.letterSpacing = '.3em';
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fillText(printing ? `${pct}%  PRINTING — ROCKET ENGINE · PA6-CF · 0.2 MM` : `100%  PRINT COMPLETE`, cx - objR * 1.1, bedY + 22);
      const bw = objR * 2.8, bx = cx - bw / 2;
      ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(bx, bedY + 28, bw, 2);
      ctx.fillStyle = printing ? 'rgba(255,160,70,0.55)' : 'rgba(255,255,255,0.4)';
      ctx.fillRect(bx, bedY + 28, bw * clamped, 2);
      ctx.restore();

      // ── vignette ──
      if (mob) {
        const tv = ctx.createLinearGradient(0, 0, 0, H * 0.55);
        tv.addColorStop(0, 'rgba(0,0,0,0.9)'); tv.addColorStop(.55, 'rgba(0,0,0,0.4)'); tv.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = tv; ctx.fillRect(0, 0, W, H);
      } else {
        const lv = ctx.createLinearGradient(0, 0, W * 0.58, 0);
        lv.addColorStop(0, 'rgba(0,0,0,0.97)'); lv.addColorStop(.65, 'rgba(0,0,0,0.7)'); lv.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = lv; ctx.fillRect(0, 0, W, H);
      }
      const bv = ctx.createLinearGradient(0, H * 0.8, 0, H);
      bv.addColorStop(0, 'rgba(0,0,0,0)'); bv.addColorStop(1, 'rgba(0,0,0,0.97)');
      ctx.fillStyle = bv; ctx.fillRect(0, 0, W, H);
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <section ref={sectionRef} id="home" className="relative min-h-screen flex items-center overflow-hidden bg-black">
      <motion.div style={{ y: canvasY, opacity: canvasOpacity }} className="absolute inset-0">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />
      </motion.div>

      {[
        { top: 28, left: 28, borderTop: '1px solid #fff', borderLeft: '1px solid #fff' },
        { top: 28, right: 28, borderTop: '1px solid #fff', borderRight: '1px solid #fff' },
        { bottom: 44, left: 28, borderBottom: '1px solid #fff', borderLeft: '1px solid #fff' },
        { bottom: 44, right: 28, borderBottom: '1px solid #fff', borderRight: '1px solid #fff' },
      ].map((style, i) => (
        <div key={i} className="absolute w-5 h-5 pointer-events-none hidden md:block" style={{ ...style, opacity: 0.15, zIndex: 5 }} />
      ))}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}
        className="absolute top-8 right-10 z-10 text-right hidden md:block pointer-events-none">
        <div style={{ fontSize: 8, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase' }}>Now Printing</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.22)', fontWeight: 700, letterSpacing: '0.06em' }}>ROCKET ENGINE · PA6-CF</div>
      </motion.div>

      <motion.div style={{ y: textY, opacity: textOpacity }} className="relative z-10 px-6 md:px-14 lg:px-20 max-w-xl w-full">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3 }}
          style={{ fontSize: 11, letterSpacing: '0.52em', color: 'rgba(255,255,255,0.52)', textTransform: 'uppercase', fontWeight: 400, marginBottom: 26 }}>
          3D Printing &nbsp;·&nbsp; Bengaluru &nbsp;·&nbsp; Pan-India
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.5 }}
          className="font-black text-white"
          style={{ fontSize: 'clamp(3.4rem,9.5vw,8rem)', letterSpacing: '-0.045em', lineHeight: 0.92, marginBottom: 0 }}>
          Dr.PrinT
        </motion.h1>

        <motion.div initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ duration: 0.7, delay: 0.9 }}
          style={{ width: 36, height: 1, background: 'rgba(255,255,255,0.22)', margin: '22px 0', transformOrigin: 'left' }} />

        <motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 1.0 }}
          className="font-light uppercase"
          style={{ fontSize: 'clamp(0.68rem,1.1vw,0.88rem)', letterSpacing: '0.32em', color: 'rgba(255,255,255,0.62)', marginBottom: 12 }}>
          3D Printing &amp; Rapid Prototyping in Bengaluru
        </motion.h2>

        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 1.1 }}
          className="font-light"
          style={{ fontSize: 'clamp(0.78rem,0.95vw,0.88rem)', color: 'rgba(255,255,255,0.52)', maxWidth: 380, lineHeight: 1.9, marginBottom: 40 }}>
          If we can print a rocket engine, we can print your part. FDM &amp; resin printing for startups, engineers and makers — prototypes, functional parts and drone components from ₹6/gram, delivered across India.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 1.3 }}
          className="flex flex-col sm:flex-row gap-3">
          <a href="/calculator"
            className="font-bold uppercase bg-white text-black transition-all duration-300 hover:bg-transparent hover:text-white text-center"
            style={{ padding: '13px 32px', border: '1px solid #fff', fontSize: 10, letterSpacing: '0.22em', textDecoration: 'none', display: 'inline-block' }}>
            Get Instant Quote
          </a>
          <Link to="/shop"
            className="font-bold uppercase transition-all duration-300 hover:bg-white hover:text-black text-center"
            style={{ padding: '13px 32px', border: '1px solid rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.78)', textDecoration: 'none', display: 'inline-block' }}>
            Browse Shop
          </Link>
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 1 }}
        className="absolute bottom-7 left-0 right-0 z-10 items-end justify-between px-7 hidden md:flex pointer-events-none">
        <span style={{ fontSize: 9, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase' }}>Basavanagudi, Bengaluru</span>
        <div className="flex flex-col items-center gap-2">
          <span style={{ fontSize: 8, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase' }}>Move &amp; Scroll</span>
          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="w-px h-7 bg-gradient-to-b from-white/25 to-transparent" />
        </div>
        <span style={{ fontSize: 9, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase' }}>@dr.print_3d</span>
      </motion.div>
    </section>
  );
};

export default HeroSection;
