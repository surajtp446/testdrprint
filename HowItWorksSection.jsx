import { useEffect, useRef } from 'react';

/**
 * Subtle 3D-printer nozzle cursor.
 * - Clean nozzle SVG (cone + hex + shank), tip = hotspot, points upper-left.
 * - A short molten filament wisp trails from the tip (no buildup/poop).
 * - Soft glow ring eases behind. Warms orange over interactive elements.
 * - rAF only, no React state. Hidden on touch.
 */

const STEEL_HI = 'rgba(238,240,250,0.98)';
const STEEL_MD = 'rgba(205,208,222,0.96)';
const STEEL_LO = 'rgba(150,153,170,0.95)';
const HOT_HI   = 'rgb(255,168,72)';
const HOT_MD   = 'rgb(255,116,26)';
const HOT_LO   = 'rgb(196,72,12)';
const WISP_C   = 'rgba(190,193,215,0.7)';
const WISP_H   = 'rgb(255,140,44)';
const RING_C   = 'rgba(255,255,255,0.05)';
const RING_H   = 'rgba(255,96,12,0.16)';

export default function CursorGlow() {
  const nozRef  = useRef(null);
  const ringRef = useRef(null);

  const mouse = useRef({ x: -200, y: -200 });
  const ring  = useRef({ x: -200, y: -200 });
  const rafId = useRef(null);
  const hot   = useRef(false);
  const t     = useRef(0);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const noz = nozRef.current, rg = ringRef.current;
    if (!noz || !rg) return;

    const cone = noz.querySelector('#c1');
    const coneR= noz.querySelector('#c2');
    const hexA = noz.querySelector('#hA');
    const hexB = noz.querySelector('#hB');
    const hexC = noz.querySelector('#hC');
    const shank= noz.querySelector('#sk');
    const wisp = noz.querySelector('#wp');
    const tipG = noz.querySelector('#tg');

    const set = (el,a,v) => el && el.setAttribute(a, v);

    const onMove = e => { mouse.current.x = e.clientX; mouse.current.y = e.clientY; };
    const onEnter= () => { noz.style.opacity='1'; rg.style.opacity='1'; };
    const onLeave= () => { noz.style.opacity='0'; rg.style.opacity='0'; };
    const onOver = e => {
      hot.current = !!e.target.closest('a,button,input,textarea,select,[role="button"],[tabindex],label,.cursor-pointer,[data-cursor]');
    };
    document.addEventListener('mousemove', onMove, { passive:true });
    document.addEventListener('mouseenter', onEnter);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseover', onOver, { passive:true });

    const lerp = (a,b,k) => a + (b-a)*k;

    function tick() {
      const H = hot.current;
      const mx = mouse.current.x, my = mouse.current.y;
      ring.current.x = lerp(ring.current.x, mx, 0.16);
      ring.current.y = lerp(ring.current.y, my, 0.16);

      // tip hotspot at SVG local (15,4) → element offset (−7,−7) after -45° rot
      noz.style.left = `${mx - 7}px`;
      noz.style.top  = `${my - 7}px`;
      rg.style.left  = `${ring.current.x}px`;
      rg.style.top   = `${ring.current.y}px`;

      // colors
      set(cone,'fill', H?HOT_LO:STEEL_LO);
      set(coneR,'fill',H?HOT_MD:STEEL_MD);
      set(hexA,'fill', H?HOT_MD:STEEL_MD);
      set(hexB,'fill', H?HOT_HI:STEEL_HI);
      set(hexC,'fill', H?HOT_LO:STEEL_LO);
      set(shank,'fill',H?HOT_MD:STEEL_MD);

      rg.style.background = H?RING_H:RING_C;
      rg.style.width  = H?'58px':'40px';
      rg.style.height = H?'58px':'40px';

      // wisp: gentle, short. length oscillates a little; no buildup.
      t.current += H ? 0.05 : 0.03;
      const len = 5 + Math.abs(Math.sin(t.current)) * (H ? 5 : 3);
      const sway = Math.sin(t.current * 1.3) * 0.8;
      set(wisp,'d', `M20,0 Q${20+sway},${len*0.5} 20,${len}`);
      set(wisp,'stroke', H?WISP_H:WISP_C);
      set(wisp,'stroke-width', H?1.5:1.0);
      set(wisp,'opacity', H?0.85:0.5);
      set(tipG,'fill', H?WISP_H:'rgba(255,255,255,0.5)');
      set(tipG,'opacity', H?0.9:0.4);

      rafId.current = requestAnimationFrame(tick);
    }
    rafId.current = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <>
      {/* nozzle + short wisp share one SVG; wisp drawn in same local space then rotated */}
      <div ref={nozRef} style={{
        position:'fixed', pointerEvents:'none', zIndex:9999,
        left:-200, top:-200, opacity:0, transition:'opacity 0.2s', willChange:'left,top',
      }}>
        <svg width="30" height="44" viewBox="0 0 30 44" fill="none"
          style={{ display:'block', overflow:'visible',
            filter:'drop-shadow(0 1px 4px rgba(0,0,0,0.5))' }}>
          <g transform="rotate(-45 15 15)">
            {/* short molten wisp from the tip, downward in local space */}
            <path id="wp" d="M20,0 Q20,4 20,8" stroke={WISP_C} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5" />
            <circle id="tg" cx="20" cy="8" r="1.4" fill="rgba(255,255,255,0.5)" opacity="0.4" />

            {/* bore */}
            <circle cx="15" cy="4.2" r="0.8" fill="rgba(15,15,25,0.7)" />
            {/* cone */}
            <path id="c1" d="M15,4 L9.4,12.4 L15,12.4 Z" fill={STEEL_LO} />
            <path id="c2" d="M15,4 L15,12.4 L20.6,12.4 Z" fill={STEEL_MD} />
            <line x1="9.4" y1="12.4" x2="20.6" y2="12.4" stroke="rgba(0,0,0,0.15)" strokeWidth="0.6" />
            {/* hex */}
            <path id="hA" d="M9.4,12.4 L7.8,14.4 L7.8,19.2 L9.4,21.2 L20.6,21.2 L22.2,19.2 L22.2,14.4 L20.6,12.4 Z" fill={STEEL_MD} />
            <path id="hB" d="M7.8,14.4 L7.8,19.2 L9.4,21.2 L9.4,12.4 Z" fill={STEEL_HI} />
            <path id="hC" d="M22.2,14.4 L22.2,19.2 L20.6,21.2 L20.6,12.4 Z" fill={STEEL_LO} />
            <line x1="7.9" y1="16.8" x2="22.1" y2="16.8" stroke="rgba(0,0,0,0.13)" strokeWidth="0.7" />
            {/* shank */}
            <rect id="sk" x="11.9" y="21.2" width="6.2" height="8.4" rx="0.8" fill={STEEL_MD} />
            <rect x="11.9" y="21.2" width="1.4" height="8.4" rx="0.7" fill={STEEL_HI} opacity="0.45" />
            {[22.4,23.8,25.2,26.6,28.0].map(y=>(
              <line key={y} x1="11.9" y1={y} x2="18.1" y2={y} stroke="rgba(0,0,0,0.18)" strokeWidth="0.7" />
            ))}
            <rect x="11.9" y="29.4" width="6.2" height="1.1" rx="0.5" fill={STEEL_LO} />
          </g>
        </svg>
      </div>

      {/* soft glow ring */}
      <div ref={ringRef} style={{
        position:'fixed', pointerEvents:'none', zIndex:9997,
        width:40, height:40, borderRadius:'50%', background:RING_C,
        transform:'translate(-50%,-50%)', left:-200, top:-200, opacity:0,
        transition:'opacity 0.25s, width 0.35s ease, height 0.35s ease, background 0.35s ease',
        filter:'blur(13px)', willChange:'left,top',
      }} />
    </>
  );
}
