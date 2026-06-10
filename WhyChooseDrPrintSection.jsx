import { useEffect, useRef } from 'react';

/**
 * 3D Printer Nozzle Cursor
 *
 * Nozzle tip = cursor hotspot (upper-left direction).
 * Filament purges downward from the tip due to gravity —
 * drawn in a separate overlay SVG so it's always screen-down
 * regardless of nozzle rotation.
 *
 * Physics:
 *   — Filament strand sways slightly as it hangs
 *   — Blob at end grows, stretches, and eventually "drops"
 *   — On interactive elements: purge rate increases, goes orange-hot
 */

// ── Color tokens ──────────────────────────────────────────────────
const METAL_MID   = 'rgba(210,210,228,0.95)';
const METAL_LIGHT = 'rgba(240,240,252,0.98)';
const METAL_DARK  = 'rgba(148,148,170,0.95)';

const HOT_MID     = 'rgb(255,108,18)';
const HOT_LIGHT   = 'rgb(255,172,70)';
const HOT_DARK    = 'rgb(195,68,8)';

const FIL_COLD    = 'rgba(185,185,215,0.80)';
const FIL_HOT     = 'rgb(255,138,38)';

const GLOW_COLD   = 'rgba(255,255,255,0.04)';
const GLOW_HOT    = 'rgba(255,90,10,0.22)';

export default function CursorGlow() {
  const wrapRef   = useRef(null);   // nozzle SVG
  const dripRef   = useRef(null);   // separate gravity drip SVG
  const glowRef   = useRef(null);   // trailing heat glow

  const mouse     = useRef({ x: -400, y: -400 });
  const glowPos   = useRef({ x: -400, y: -400 });
  const rafRef    = useRef(null);
  const hotRef    = useRef(false);

  // Gravity filament physics state
  const fil = useRef({
    phase:   0,      // master clock
    blobY:   0,      // current blob bottom Y (local to drip SVG)
    vel:     0,      // blob falling velocity
    dropped: false,  // blob currently detached and falling?
    dropY:   0,      // Y of falling detached blob
    dropVel: 0,
    dropX:   0,
    dropOpacity: 1,
  });

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const wrap   = wrapRef.current;
    const dripEl = dripRef.current;
    const glowEl = glowRef.current;
    if (!wrap || !dripEl || !glowEl) return;

    // Nozzle SVG elements
    const cone    = wrap.querySelector('#cone');
    const coneR   = wrap.querySelector('#coneR');
    const hex1    = wrap.querySelector('#hex1');
    const hex2    = wrap.querySelector('#hex2');
    const hexD    = wrap.querySelector('#hexD');
    const shank   = wrap.querySelector('#shank');
    const reflex  = wrap.querySelector('#reflex');
    const hotRing = wrap.querySelector('#hotring');

    // Drip SVG elements (inside dripEl)
    const strand  = dripEl.querySelector('#strand');
    const blob    = dripEl.querySelector('#blob');
    const blobShadow = dripEl.querySelector('#blobShadow');
    const dropBlob   = dripEl.querySelector('#dropBlob');

    function sa(el, a, v) { if (el) el.setAttribute(a, String(v)); }
    function sf(el, v)    { sa(el, 'fill', v); }
    function ss(el, v)    { sa(el, 'stroke', v); }

    const onMove  = e => { mouse.current.x = e.clientX; mouse.current.y = e.clientY; };
    const onEnter = () => { wrap.style.opacity = '1'; dripEl.style.opacity = '1'; glowEl.style.opacity = '1'; };
    const onLeave = () => { wrap.style.opacity = '0'; dripEl.style.opacity = '0'; glowEl.style.opacity = '0'; };
    const onOver  = e => {
      hotRef.current = !!e.target.closest(
        'a,button,input,textarea,select,[role="button"],[tabindex],label,.cursor-pointer,[data-cursor]'
      );
    };

    document.addEventListener('mousemove',  onMove,  { passive: true });
    document.addEventListener('mouseenter', onEnter);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseover',  onOver,  { passive: true });

    const lerp = (a, b, t) => a + (b - a) * t;

    // Drip SVG is 40px wide, tall enough to contain strand + falling blob.
    // Origin (20, 0) = nozzle tip. Strand hangs downward.
    const DRIP_W = 40;
    const STRAND_X = 20; // center x of strand in drip SVG

    function animate() {
      const hot = hotRef.current;
      const mx  = mouse.current.x;
      const my  = mouse.current.y;
      const f   = fil.current;

      // Glow trails behind
      glowPos.current.x = lerp(glowPos.current.x, mx, 0.065);
      glowPos.current.y = lerp(glowPos.current.y, my, 0.065);

      // Nozzle: tip at SVG local (15,4), element offset so tip = cursor
      wrap.style.left = `${mx - 7}px`;
      wrap.style.top  = `${my - 7}px`;

      // Drip SVG: origin (20, 0) = cursor tip, extends downward
      dripEl.style.left = `${mx - STRAND_X}px`;
      dripEl.style.top  = `${my}px`;

      glowEl.style.left = `${glowPos.current.x}px`;
      glowEl.style.top  = `${glowPos.current.y}px`;

      // ── Nozzle colors ──────────────────────────────────────────
      const mid   = hot ? HOT_MID   : METAL_MID;
      const light = hot ? HOT_LIGHT : METAL_LIGHT;
      const dark  = hot ? HOT_DARK  : METAL_DARK;
      sf(cone,   dark);
      sf(coneR,  mid);
      sf(hex1,   mid);
      sf(hex2,   light);
      sf(hexD,   dark);
      sf(shank,  mid);
      sf(reflex, hot ? 'rgba(255,220,140,0.22)' : 'rgba(255,255,255,0.16)');
      ss(hotRing, hot ? 'rgba(255,160,50,0.80)' : 'rgba(200,200,225,0.28)');
      sa(hotRing, 'r', hot ? '4.2' : '3.2');

      glowEl.style.background = hot ? GLOW_HOT : GLOW_COLD;
      glowEl.style.width      = hot ? '72px' : '46px';
      glowEl.style.height     = hot ? '72px' : '46px';

      // ── Filament physics ───────────────────────────────────────
      // Clock
      f.phase += hot ? 0.038 : 0.018;
      const purgeRate = hot ? 0.55 : 0.28; // px per frame

      // Sway — sinusoidal horizontal wobble
      const sway = Math.sin(f.phase * 0.8) * 2.2;
      const swayMid = Math.sin(f.phase * 0.5) * 1.4;

      // Grow the strand until it reaches drop threshold
      const maxLen = hot ? 32 : 22;
      if (!f.dropped) {
        f.blobY += purgeRate;
        if (f.blobY >= maxLen) {
          // Detach and start falling
          f.dropped    = true;
          f.dropY      = f.blobY;
          f.dropVel    = 1.2;
          f.dropX      = STRAND_X + sway * 0.6;
          f.dropOpacity = 1;
          f.blobY      = 0; // strand resets to tiny nub
        }
      } else {
        // Strand regrows
        f.blobY += purgeRate;
        if (f.blobY > maxLen * 0.4) f.blobY = Math.min(f.blobY, maxLen);

        // Falling detached drop — gravity acceleration
        f.dropVel += 0.28;
        f.dropY   += f.dropVel;
        f.dropOpacity = Math.max(0, f.dropOpacity - 0.012);
        // Once off screen or fully transparent, reset
        if (f.dropOpacity <= 0 || f.dropY > 120) {
          f.dropped = false;
        }
      }

      const strandLen = Math.max(1, f.blobY);
      const blobR     = hot ? 2.8 : 2.0;
      const filC      = hot ? FIL_HOT : FIL_COLD;
      const filWidth  = hot ? 1.9 : 1.2;

      // Strand path: from (20, 0) curving to blob position with sway
      const blobX = STRAND_X + sway;
      const ctrlX = STRAND_X + swayMid;
      const ctrlY = strandLen * 0.5;
      sa(strand, 'd',
        `M${STRAND_X},0 Q${ctrlX},${ctrlY} ${blobX},${strandLen}`);
      ss(strand, filC);
      sa(strand, 'stroke-width', filWidth);
      sa(strand, 'opacity',      hot ? 0.92 : 0.68);

      // Blob at strand end — teardrop stretch when long
      const stretch = Math.min(strandLen / maxLen, 1);
      const blobRX  = blobR * (1 - stretch * 0.3);
      const blobRY  = blobR * (1 + stretch * 0.5);
      sa(blob, 'cx', blobX);
      sa(blob, 'cy', strandLen + blobRY);
      sa(blob, 'rx', blobRX);
      sa(blob, 'ry', blobRY);
      sf(blob, filC);
      sa(blob, 'opacity', hot ? 0.94 : 0.70);

      // Shadow under blob (depth cue)
      sa(blobShadow, 'cx', blobX + 0.8);
      sa(blobShadow, 'cy', strandLen + blobRY * 1.2);
      sa(blobShadow, 'rx', blobRX * 0.9);
      sa(blobShadow, 'ry', blobRY * 0.5);
      sa(blobShadow, 'opacity', hot ? 0.18 : 0.10);

      // Falling detached drop
      if (f.dropped && f.dropOpacity > 0) {
        sa(dropBlob, 'cx', f.dropX);
        sa(dropBlob, 'cy', f.dropY);
        sa(dropBlob, 'r',  hot ? 2.4 : 1.8);
        sf(dropBlob, filC);
        sa(dropBlob, 'opacity', f.dropOpacity);
        dropBlob.style.display = '';
      } else {
        if (dropBlob) dropBlob.style.display = 'none';
      }

      rafRef.current = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove',  onMove);
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseover',  onOver);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      {/* ── Nozzle ─────────────────────────────────────────────────────────
          Drawn vertically (tip=top), rotated -45° so tip→upper-left.
          Tip local (15,4) → screen offset (−7, −7) for hotspot.       */}
      <div ref={wrapRef} style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 9999,
        left: -400, top: -400, opacity: 0,
        transition: 'opacity 0.2s',
        willChange: 'left, top',
      }}>
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block', overflow: 'visible',
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.60)) drop-shadow(0 0 2px rgba(0,0,0,0.35))' }}>

          <g transform="rotate(-45 15 15)">
            {/* Bore hole at tip */}
            <circle cx="15" cy="4.2" r="0.85" fill="rgba(15,15,25,0.75)" />

            {/* Cone — left (dark) face */}
            <path id="cone"  d="M15,4 L9.2,12.5 L15,12.5 Z" fill={METAL_DARK} />
            {/* Cone — right (mid) face */}
            <path id="coneR" d="M15,4 L15,12.5 L20.8,12.5 Z" fill={METAL_MID} />
            {/* Cone base rim */}
            <line x1="9.2" y1="12.5" x2="20.8" y2="12.5"
              stroke="rgba(0,0,0,0.16)" strokeWidth="0.6" />

            {/* Hex nut — main face */}
            <path id="hex1"
              d="M9.2,12.5 L7.5,14.5 L7.5,19.5 L9.2,21.5 L20.8,21.5 L22.5,19.5 L22.5,14.5 L20.8,12.5 Z"
              fill={METAL_MID} />
            {/* Hex — left bright face */}
            <path id="hex2"
              d="M7.5,14.5 L7.5,19.5 L9.2,21.5 L9.2,12.5 L7.5,14.5 Z"
              fill={METAL_LIGHT} />
            {/* Hex — right dark face */}
            <path id="hexD"
              d="M22.5,14.5 L22.5,19.5 L20.8,21.5 L20.8,12.5 L22.5,14.5 Z"
              fill={METAL_DARK} />
            {/* Hex center groove */}
            <line x1="7.6" y1="17" x2="22.4" y2="17"
              stroke="rgba(0,0,0,0.14)" strokeWidth="0.8" />
            {/* Top chamfer highlight */}
            <line x1="9.2" y1="12.5" x2="20.8" y2="12.5"
              stroke="rgba(255,255,255,0.22)" strokeWidth="0.5" />

            {/* Threaded shank */}
            <rect id="shank" x="11.8" y="21.5" width="6.4" height="9" rx="0.8"
              fill={METAL_MID} />
            {/* Shank left highlight */}
            <rect x="11.8" y="21.5" width="1.5" height="9" rx="0.75"
              fill={METAL_LIGHT} opacity="0.45" />
            {/* Thread rings */}
            {[22.8, 24.2, 25.6, 27.0, 28.4].map(y => (
              <g key={y}>
                <line x1="11.8" y1={y} x2="18.2" y2={y}
                  stroke="rgba(0,0,0,0.20)" strokeWidth="0.85" />
                <line x1="11.8" y1={y - 0.5} x2="18.2" y2={y - 0.5}
                  stroke="rgba(255,255,255,0.11)" strokeWidth="0.4" />
              </g>
            ))}
            {/* End cap */}
            <rect x="11.8" y="30" width="6.4" height="1.2" rx="0.6"
              fill={METAL_DARK} />

            {/* Specular streak */}
            <path id="reflex"
              d="M13.2,5 L11.5,13.5 L11.2,21 L12.2,21 L12.4,13.5 L14.2,5.2 Z"
              fill="rgba(255,255,255,0.16)" opacity="0.75" />

            {/* Interactive crosshair ring */}
            <circle id="hotring"
              cx="15" cy="17" r="3.2"
              fill="none"
              stroke="rgba(200,200,225,0.28)"
              strokeWidth="0.7"
              strokeDasharray="2 1.8" />
          </g>
        </svg>
      </div>

      {/* ── Gravity drip — separate SVG, always screen-down ────────────────
          Origin (20, 0) = cursor tip. Content hangs downward.
          Element is 40px wide, 130px tall (overflow: visible).         */}
      <div ref={dripRef} style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 9998,
        left: -400, top: -400, opacity: 0,
        transition: 'opacity 0.2s',
        willChange: 'left, top',
      }}>
        <svg width="40" height="130" viewBox="0 0 40 130" fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block', overflow: 'visible' }}>

          {/* Strand from tip downward */}
          <path id="strand"
            d="M20,0 Q20,8 20,16"
            stroke={FIL_COLD}
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
            opacity="0.68" />

          {/* Blob (teardrop) at strand end */}
          <ellipse id="blob" cx="20" cy="18" rx="2" ry="2.5"
            fill={FIL_COLD} opacity="0.70" />

          {/* Shadow under blob */}
          <ellipse id="blobShadow" cx="20.8" cy="21" rx="1.8" ry="1.2"
            fill="rgba(0,0,0,0.25)" opacity="0.10" />

          {/* Falling detached drop */}
          <circle id="dropBlob" cx="20" cy="60" r="2"
            fill={FIL_COLD} opacity="0" style={{ display: 'none' }} />
        </svg>
      </div>

      {/* ── Heat glow ─────────────────────────────────────────────────────── */}
      <div ref={glowRef} style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 9997,
        width: 46, height: 46, borderRadius: '50%',
        background: GLOW_COLD,
        transform: 'translate(-50%, -50%)',
        left: -400, top: -400, opacity: 0,
        transition: 'opacity 0.28s, width 0.4s ease, height 0.4s ease, background 0.4s ease',
        filter: 'blur(16px)',
        willChange: 'left, top',
      }} />
    </>
  );
}
