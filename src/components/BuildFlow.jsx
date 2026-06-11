import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * BuildFlow v2 — the page IS the print job.
 *
 * As you scroll, a virtual print head travels a weaving toolpath down the
 * section and EXTRUDES it: behind the head the bead is solid (molten orange
 * right at the nozzle, cooling to grey-white as it ages), ahead of it only
 * a faint dashed G-code travel path remains. Perpendicular layer ticks and
 * a live Z-height/percent HUD complete the printer language. Scroll back
 * up and the print "rewinds". No grains, no pinned section — the story
 * frames ride normal document flow next to the path.
 */

const FRAMES = [
  {
    kicker: 'Rapid Prototyping · Bengaluru',
    title: 'CAD to part in 24–72 hours.',
    body: 'Upload an STL, get a quote the same day, hold the part in two to three. Functional prototypes for design validation, fit checks and investor demos — printed in Basavanagudi, Bengaluru.',
    align: 'left',
  },
  {
    kicker: 'Functional & Engineering Parts',
    title: 'Built to take real load.',
    body: 'Brackets, enclosures, jigs and end-use components at ±0.1 mm accuracy. PETG, ASA, TPU and Carbon-Fibre Nylon — material matched to the job, across Karnataka and pan-India.',
    align: 'right',
  },
  {
    kicker: 'Batch Production',
    title: 'One part or five hundred.',
    body: 'A calibrated Bambu Lab print farm running in parallel — repeatable quality across every unit, no tooling cost, no minimum order. Production-grade output without production-line overheads.',
    align: 'left',
  },
  {
    kicker: 'For Startups & Makers',
    title: 'Your hardware partner.',
    body: 'From a single concept print to small-batch manufacturing, plus in-house 3D design when you only have a sketch. The rapid-prototyping backbone for Bengaluru\u2019s hardware teams.',
    align: 'right',
  },
];

// Toolpath waypoints (x: 0–1 width, y: 0–1 section height) — weaves
// left/right between the frames like a travel move between print islands.
const PATH = [
  { x: 0.78, y: 0.00 }, { x: 0.74, y: 0.10 }, { x: 0.30, y: 0.20 },
  { x: 0.24, y: 0.32 }, { x: 0.72, y: 0.44 }, { x: 0.78, y: 0.56 },
  { x: 0.28, y: 0.68 }, { x: 0.22, y: 0.80 }, { x: 0.62, y: 0.92 },
  { x: 0.66, y: 1.00 },
];

function lerp(a, b, t) { return a + (b - a) * t; }

// Smoothed point on the path (Catmull-Rom-ish via segment midpoint easing)
function pathAt(u) {
  const n = Math.max(0, Math.min(0.9999, u)) * (PATH.length - 1);
  const i = Math.floor(n), f = n - i;
  // ease within the segment so corners are rounded
  const e = f * f * (3 - 2 * f);
  const a = PATH[i], b = PATH[Math.min(PATH.length - 1, i + 1)];
  return { x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e) };
}

// Filament cooling: 0 = at nozzle (molten) → 1 = fully cooled
function beadColor(cool) {
  const t = Math.max(0, Math.min(1, cool));
  if (t < 0.35) {
    const u = t / 0.35;
    return [Math.round(lerp(255, 235, u)), Math.round(lerp(140, 165, u)), Math.round(lerp(50, 130, u))];
  }
  const u = (t - 0.35) / 0.65;
  return [Math.round(lerp(235, 222, u)), Math.round(lerp(165, 222, u)), Math.round(lerp(130, 226, u))];
}

function ExtrusionCanvas({ progressRef }) {
  const canvasRef = useRef(null);
  const smooth = useRef(0);
  const sparks = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = canvas.getContext('2d');
    let raf, W = 0, H = 0, visible = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width; H = rect.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(canvas);

    const STEP = 0.004; // path sampling resolution

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;

      // head position eases toward the scroll progress
      const target = Math.max(0, Math.min(1, progressRef.current * 1.12)); // finish slightly early
      smooth.current += (target - smooth.current) * 0.085;
      const prog = smooth.current;
      const t = now / 1000;

      ctx.clearRect(0, 0, W, H);

      // ── 1. Unprinted travel path ahead of the head (dashed G-code) ──
      ctx.setLineDash([3, 9]);
      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      let started = false;
      for (let p = Math.max(0, prog); p <= 1.0001; p += STEP) {
        const pt = pathAt(p);
        const x = pt.x * W, y = pt.y * H;
        started ? ctx.lineTo(x, y) : (ctx.moveTo(x, y), started = true);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // ── 2. Extruded bead behind the head ──
      // Drawn in short segments so each can have its own cooling colour.
      const beadW = Math.max(3, Math.min(5, W * 0.004));
      ctx.lineCap = 'round';
      let prev = pathAt(0);
      for (let p = STEP; p <= prog; p += STEP) {
        const pt = pathAt(p);
        // cool = how long ago this segment left the nozzle
        const cool = Math.min(1, (prog - p) * 6);
        const [r, g, b] = beadColor(cool);
        ctx.strokeStyle = `rgb(${r},${g},${b})`;
        ctx.globalAlpha = 0.28 + (1 - cool) * 0.6; // fresh bead pops, old bead recedes
        ctx.lineWidth = beadW + (1 - cool) * 1.5;  // molten bead is slightly fatter
        if (cool < 0.3) {
          ctx.shadowColor = `rgba(255,140,50,${(0.3 - cool) * 1.6})`;
          ctx.shadowBlur = 10;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.beginPath();
        ctx.moveTo(prev.x * W, prev.y * H);
        ctx.lineTo(pt.x * W, pt.y * H);
        ctx.stroke();
        prev = pt;
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      // ── 3. Layer ticks across the cooled bead (printed layer lines) ──
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 1;
      for (let p = 0.02; p < prog - 0.05; p += 0.025) {
        const a = pathAt(p), b2 = pathAt(p + STEP);
        const ang = Math.atan2((b2.y - a.y) * H, (b2.x - a.x) * W) + Math.PI / 2;
        const x = a.x * W, y = a.y * H;
        const L = beadW * 0.5;
        ctx.beginPath();
        ctx.moveTo(x - Math.cos(ang) * L, y - Math.sin(ang) * L);
        ctx.lineTo(x + Math.cos(ang) * L, y + Math.sin(ang) * L);
        ctx.stroke();
      }

      // ── 4. The print head ──
      if (prog > 0.001 && prog < 0.999) {
        const hp = pathAt(prog);
        const hx = hp.x * W, hy = hp.y * H;

        // crosshair gantry lines (head rides X/Y rails)
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, hy); ctx.lineTo(W, hy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(hx, Math.max(0, hy - 130)); ctx.lineTo(hx, Math.min(H, hy + 130)); ctx.stroke();

        // carriage
        ctx.fillStyle = 'rgba(48,48,50,0.95)';
        ctx.strokeStyle = 'rgba(200,200,200,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.rect(hx - 10, hy - 24, 20, 14); ctx.fill(); ctx.stroke();
        // nozzle cone
        ctx.beginPath();
        ctx.moveTo(hx - 6, hy - 10); ctx.lineTo(hx + 6, hy - 10);
        ctx.lineTo(hx + 2.5, hy - 3); ctx.lineTo(hx, hy);
        ctx.lineTo(hx - 2.5, hy - 3); ctx.closePath();
        ctx.fillStyle = 'rgba(82,76,70,1)'; ctx.fill();
        ctx.strokeStyle = 'rgba(180,170,160,0.35)'; ctx.lineWidth = 0.8; ctx.stroke();

        // molten glow at the tip
        ctx.beginPath(); ctx.arc(hx, hy, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,170,90,1)';
        ctx.shadowColor = 'rgba(255,140,40,0.95)'; ctx.shadowBlur = 18;
        ctx.fill(); ctx.shadowBlur = 0;

        // sparks while extruding
        if (!reduceMotion && Math.random() < 0.18) {
          sparks.current.push({ x: hx, y: hy, vx: (Math.random() - .5) * 2.2, vy: -Math.random() * 1.8 - .3, life: 1, r: Math.random() * 1.1 + .4 });
        }

        // HUD next to the head
        ctx.font = '400 9px Arial';
        ctx.textAlign = hp.x > 0.5 ? 'right' : 'left';
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        const hudX = hp.x > 0.5 ? hx - 18 : hx + 18;
        ctx.fillText(`Z ${(prog * 48).toFixed(1)} MM`, hudX, hy - 14);
        ctx.fillStyle = 'rgba(255,160,70,0.55)';
        ctx.fillText(`${Math.round(prog * 100)}%`, hudX, hy - 2);
        ctx.textAlign = 'left';
      }

      // completed tag at path end
      if (prog >= 0.999) {
        const ep = pathAt(1);
        ctx.font = '400 9px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillText('LAYER COMPLETE ✓', ep.x * W, ep.y * H - 14);
        ctx.textAlign = 'left';
      }

      // sparks update
      for (let i = sparks.current.length - 1; i >= 0; i--) {
        const s = sparks.current[i];
        s.x += s.vx; s.y += s.vy; s.vy += 0.09; s.life -= 0.05;
        if (s.life <= 0) { sparks.current.splice(i, 1); continue; }
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,180,110,${s.life * 0.7})`; ctx.fill();
      }
    };

    if (reduceMotion) {
      smooth.current = 1;
      const once = (n) => { visible = true; frame(n || 0); cancelAnimationFrame(raf); };
      once(performance.now());
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      io.disconnect();
    };
  }, [progressRef]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" />;
}

function FlowFrame({ data, index }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [60, 0, -60]);
  const x = useTransform(scrollYProgress, [0, 0.5, 1],
    data.align === 'left' ? [-30, 0, 18] : [30, 0, -18]);

  return (
    <div ref={ref} className="relative min-h-[68vh] md:min-h-[78vh] flex items-center">
      <div className={`w-full px-8 md:px-20 flex ${data.align === 'right' ? 'justify-end' : 'justify-start'}`}>
        <motion.div style={{ opacity, y, x }} className="max-w-xl">
          <p className="text-[11px] tracking-[0.5em] text-white/40 uppercase mb-5">{data.kicker}</p>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[0.98] mb-6">
            {data.title}
          </h2>
          <p className="text-base md:text-lg text-white/55 font-light leading-relaxed">
            {data.body}
          </p>
          <span className="mt-6 inline-block text-[10px] tracking-[0.4em] text-white/25 uppercase">
            Layer {String(index + 1).padStart(2, '0')} / {String(FRAMES.length).padStart(2, '0')}
          </span>
        </motion.div>
      </div>
    </div>
  );
}

export default function BuildFlow() {
  const sectionRef = useRef(null);
  const progressRef = useRef(0);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.7', 'end 0.5'],
  });

  useEffect(() => {
    const unsub = scrollYProgress.on('change', (v) => { progressRef.current = v; });
    return () => unsub();
  }, [scrollYProgress]);

  return (
    <section ref={sectionRef} className="relative bg-black overflow-hidden"
      aria-label="What Dr.PrinT prints — extruded as you scroll">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

      {/* the toolpath being printed as you scroll */}
      <ExtrusionCanvas progressRef={progressRef} />

      <div className="relative z-10">
        {FRAMES.map((f, i) => (
          <FlowFrame key={i} data={f} index={i} />
        ))}
      </div>

      <div className="relative z-10 flex justify-center pb-20">
        <Link to="/calculator"
          className="inline-block text-[10px] font-black uppercase tracking-[0.25em] bg-white text-black px-7 py-3.5 hover:bg-white/85 transition-all duration-300">
          Get a Quote
        </Link>
      </div>
    </section>
  );
}
