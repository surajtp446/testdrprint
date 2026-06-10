import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * BuildFlow — the filament journey, told in normal page flow.
 *
 * Unlike a pinned/sticky scroll scene, nothing hijacks the scroll here:
 * a single canvas spans the whole section behind the content, and a
 * stream of molten filament segments flows down a weaving toolpath as
 * you scroll. Segments leave the virtual nozzle hot orange and cool to
 * solid grey-white as they travel — the same idea as MDT's grain flow,
 * remapped to FDM printing. The four story frames ride the normal
 * document scroll, each fading and drifting with its own scroll-linked
 * transform, so the entire page transitions continuously.
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
    kicker: 'Drone · UAV · Aerospace',
    title: 'Parts that actually fly.',
    body: 'Motor mounts, airframes, payload bays and aero fairings — lightweight LW-PLA and PA-CF, engineered by a team that built India\u2019s fastest FPV drone and a SAE AeroTHON AIR-2 platform.',
    align: 'left',
  },
  {
    kicker: 'For Startups & Makers',
    title: 'Your hardware partner.',
    body: 'From a single concept print to small-batch production of 500+. No tooling cost, no MOQ. The rapid-prototyping backbone for Bengaluru\u2019s hardware startups.',
    align: 'right',
  },
];

// Toolpath waypoints in normalized (x: 0–1 width, y: 0–1 section height).
// Weaves left-right between the frames like a travel move between islands.
const PATH = [
  { x: 0.78, y: 0.00 }, { x: 0.74, y: 0.10 }, { x: 0.30, y: 0.20 },
  { x: 0.24, y: 0.32 }, { x: 0.72, y: 0.44 }, { x: 0.78, y: 0.56 },
  { x: 0.28, y: 0.68 }, { x: 0.22, y: 0.80 }, { x: 0.62, y: 0.92 },
  { x: 0.66, y: 1.00 },
];

// Filament cooling ramp: molten orange → amber → cooled grey-white
const COLORS = [
  { at: 0,    c: [255, 150, 60] },
  { at: 0.25, c: [255, 120, 40] },
  { at: 0.5,  c: [200, 130, 90] },
  { at: 0.78, c: [160, 158, 156] },
  { at: 1,    c: [225, 225, 228] },
];

function lerp(a, b, t) { return a + (b - a) * t; }

function colorAt(p) {
  const t = Math.max(0, Math.min(1, p));
  for (let i = 0; i < COLORS.length - 1; i++) {
    const a = COLORS[i], b = COLORS[i + 1];
    if (t >= a.at && t <= b.at) {
      const u = (t - a.at) / (b.at - a.at || 1);
      return [
        Math.round(lerp(a.c[0], b.c[0], u)),
        Math.round(lerp(a.c[1], b.c[1], u)),
        Math.round(lerp(a.c[2], b.c[2], u)),
      ];
    }
  }
  return COLORS[COLORS.length - 1].c;
}

function pathAt(u) {
  const n = Math.max(0, Math.min(0.9999, u)) * (PATH.length - 1);
  const i = Math.floor(n), f = n - i;
  const a = PATH[i], b = PATH[Math.min(PATH.length - 1, i + 1)];
  return {
    x: lerp(a.x, b.x, f),
    y: lerp(a.y, b.y, f),
    angle: Math.atan2(b.y - a.y, (b.x - a.x) * 0.4), // squash x for angle realism
  };
}

const COUNT = 110;
function makeSegments() {
  const s = [];
  for (let i = 0; i < COUNT; i++) {
    s.push({
      u: Math.random(),
      lane: (Math.random() - 0.5) * 0.018,
      len: 7 + Math.random() * 5,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.4 + Math.random() * 0.9,
      size: 0.8 + Math.random() * 0.4,
    });
  }
  return s;
}

function FlowCanvas({ progressRef }) {
  const canvasRef = useRef(null);
  const segs = useRef(makeSegments());
  const smooth = useRef(0);

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

    // Pause rendering when the section is offscreen
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(canvas);

    const drawPath = () => {
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 7]);
      ctx.beginPath();
      for (let p = 0; p <= 1.0001; p += 0.01) {
        const pt = pathAt(p);
        const x = pt.x * W, y = pt.y * H;
        p === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;

      const target = progressRef.current;
      smooth.current += (target - smooth.current) * 0.08;
      const prog = smooth.current;
      const t = performance.now() / 1000;

      ctx.clearRect(0, 0, W, H);
      drawPath();

      const drift = reduceMotion ? 0 : t * 0.008;
      const flow = prog * 0.55 + drift;

      for (const s of segs.current) {
        let u = (s.u + flow) % 1;
        if (u < 0) u += 1;
        const pt = pathAt(u);
        const wob = reduceMotion ? 0 : Math.sin(t * s.wobbleSpeed + s.wobble) * 0.006;
        const nx = Math.cos(pt.angle + Math.PI / 2);
        const ny = Math.sin(pt.angle + Math.PI / 2);
        const off = (s.lane + wob) * H;
        const x = pt.x * W + nx * off;
        const y = pt.y * H + ny * off;

        // cooling depends on how far the segment is along the strand,
        // plus how deep the reader has scrolled into the story
        const cool = Math.min(1, u * 0.8 + prog * 0.25);
        const [r, g, b] = colorAt(cool);
        const alpha = Math.min(1, u < 0.04 ? u / 0.04 : 1) * 0.85;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(pt.angle);
        ctx.globalAlpha = alpha;
        // molten segments glow
        if (cool < 0.4) {
          ctx.shadowColor = `rgba(255,140,50,${(0.4 - cool) * 1.4})`;
          ctx.shadowBlur = 8;
        }
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.beginPath();
        const L = s.len * s.size;
        ctx.ellipse(0, 0, L / 2, Math.max(1, L * 0.16), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    };

    if (reduceMotion) {
      smooth.current = 0.5;
      // render a single static frame
      const once = () => { visible = true; frame(); cancelAnimationFrame(raf); };
      once();
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

// One story frame in normal flow — its motion is tied to its own scroll
// position, so it transitions as the page moves instead of pinning it.
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
            {String(index + 1).padStart(2, '0')} / {String(FRAMES.length).padStart(2, '0')}
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
    offset: ['start end', 'end start'],
  });

  useEffect(() => {
    const unsub = scrollYProgress.on('change', (v) => { progressRef.current = v; });
    return () => unsub();
  }, [scrollYProgress]);

  return (
    <section ref={sectionRef} className="relative bg-black overflow-hidden"
      aria-label="What Dr.PrinT prints — the filament journey">
      {/* faint blueprint grid */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

      {/* the filament stream — spans the whole section, flows with scroll */}
      <FlowCanvas progressRef={progressRef} />

      {/* story frames in normal document flow */}
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
