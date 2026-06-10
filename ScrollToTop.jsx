import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { APPS_SCRIPT_URL } from '@/config/api.js';

const SCRIPT_URL = APPS_SCRIPT_URL;
const SHEET_ID   = '1sbwHc558ryWlydU2a_UJdVFlfanNxEsAU9xkC_hV_Wk';
const SHEET_URL  = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Reviews`;

// Rate limiting: 1 review per 5 minutes
let lastReviewTime = 0;
const REVIEW_RATE_LIMIT_MS = 5 * 60_000;

// Input sanitisation
function sanitiseField(value, maxLen = 500) {
  if (typeof value !== 'string') return value;
  return value.replace(/[<>'"]/g, '').trim().slice(0, maxLen);
}

// ── MD5 for Gravatar ──────────────────────────────────────────────
function md5(str) {
  function safeAdd(x,y){var lsw=(x&0xffff)+(y&0xffff),msw=(x>>16)+(y>>16)+(lsw>>16);return(msw<<16)|(lsw&0xffff);}
  function bitRotateLeft(num,cnt){return(num<<cnt)|(num>>>(32-cnt));}
  function md5cmn(q,a,b,x,s,t){return safeAdd(bitRotateLeft(safeAdd(safeAdd(a,q),safeAdd(x,t)),s),b);}
  function md5ff(a,b,c,d,x,s,t){return md5cmn((b&c)|((~b)&d),a,b,x,s,t);}
  function md5gg(a,b,c,d,x,s,t){return md5cmn((b&d)|(c&(~d)),a,b,x,s,t);}
  function md5hh(a,b,c,d,x,s,t){return md5cmn(b^c^d,a,b,x,s,t);}
  function md5ii(a,b,c,d,x,s,t){return md5cmn(c^(b|(~d)),a,b,x,s,t);}
  function utf8Encode(s){return unescape(encodeURIComponent(s));}
  function strToUint8(s){var r=new Uint8Array(s.length);for(var i=0;i<s.length;i++)r[i]=s.charCodeAt(i)&0xff;return r;}
  var encoded=utf8Encode(str),bytes=strToUint8(encoded),len8=bytes.length,
      len32=Math.ceil((len8+9)/64)*16,words=new Int32Array(len32);
  for(var i=0;i<len8;i++)words[i>>2]|=bytes[i]<<((i%4)*8);
  words[len8>>2]|=0x80<<((len8%4)*8);words[len32-2]=len8*8;
  var a=1732584193,b=-271733879,c=-1732584194,d=271733878;
  for(var i2=0;i2<len32;i2+=16){
    var aa=a,bb=b,cc=c,dd=d;
    a=md5ff(a,b,c,d,words[i2+0],7,-680876936);d=md5ff(d,a,b,c,words[i2+1],12,-389564586);c=md5ff(c,d,a,b,words[i2+2],17,606105819);b=md5ff(b,c,d,a,words[i2+3],22,-1044525330);
    a=md5ff(a,b,c,d,words[i2+4],7,-176418897);d=md5ff(d,a,b,c,words[i2+5],12,1200080426);c=md5ff(c,d,a,b,words[i2+6],17,-1473231341);b=md5ff(b,c,d,a,words[i2+7],22,-45705983);
    a=md5ff(a,b,c,d,words[i2+8],7,1770035416);d=md5ff(d,a,b,c,words[i2+9],12,-1958414417);c=md5ff(c,d,a,b,words[i2+10],17,-42063);b=md5ff(b,c,d,a,words[i2+11],22,-1990404162);
    a=md5ff(a,b,c,d,words[i2+12],7,1804603682);d=md5ff(d,a,b,c,words[i2+13],12,-40341101);c=md5ff(c,d,a,b,words[i2+14],17,-1502002290);b=md5ff(b,c,d,a,words[i2+15],22,1236535329);
    a=md5gg(a,b,c,d,words[i2+1],5,-165796510);d=md5gg(d,a,b,c,words[i2+6],9,-1069501632);c=md5gg(c,d,a,b,words[i2+11],14,643717713);b=md5gg(b,c,d,a,words[i2+0],20,-373897302);
    a=md5gg(a,b,c,d,words[i2+5],5,-701558691);d=md5gg(d,a,b,c,words[i2+10],9,38016083);c=md5gg(c,d,a,b,words[i2+15],14,-660478335);b=md5gg(b,c,d,a,words[i2+4],20,-405537848);
    a=md5gg(a,b,c,d,words[i2+9],5,568446438);d=md5gg(d,a,b,c,words[i2+14],9,-1019803690);c=md5gg(c,d,a,b,words[i2+3],14,-187363961);b=md5gg(b,c,d,a,words[i2+8],20,1163531501);
    a=md5gg(a,b,c,d,words[i2+13],5,-1444681467);d=md5gg(d,a,b,c,words[i2+2],9,-51403784);c=md5gg(c,d,a,b,words[i2+7],14,1735328473);b=md5gg(b,c,d,a,words[i2+12],20,-1926607734);
    a=md5hh(a,b,c,d,words[i2+5],4,-378558);d=md5hh(d,a,b,c,words[i2+8],11,-2022574463);c=md5hh(c,d,a,b,words[i2+11],16,1839030562);b=md5hh(b,c,d,a,words[i2+14],23,-35309556);
    a=md5hh(a,b,c,d,words[i2+1],4,-1530992060);d=md5hh(d,a,b,c,words[i2+4],11,1272893353);c=md5hh(c,d,a,b,words[i2+7],16,-155497632);b=md5hh(b,c,d,a,words[i2+10],23,-1094730640);
    a=md5hh(a,b,c,d,words[i2+13],4,681279174);d=md5hh(d,a,b,c,words[i2+0],11,-358537222);c=md5hh(c,d,a,b,words[i2+3],16,-722521979);b=md5hh(b,c,d,a,words[i2+6],23,76029189);
    a=md5hh(a,b,c,d,words[i2+9],4,-640364487);d=md5hh(d,a,b,c,words[i2+12],11,-421815835);c=md5hh(c,d,a,b,words[i2+15],16,530742520);b=md5hh(b,c,d,a,words[i2+2],23,-995338651);
    a=md5ii(a,b,c,d,words[i2+0],6,-198630844);d=md5ii(d,a,b,c,words[i2+7],10,1126891415);c=md5ii(c,d,a,b,words[i2+14],15,-1416354905);b=md5ii(b,c,d,a,words[i2+5],21,-57434055);
    a=md5ii(a,b,c,d,words[i2+12],6,1700485571);d=md5ii(d,a,b,c,words[i2+3],10,-1894986606);c=md5ii(c,d,a,b,words[i2+10],15,-1051523);b=md5ii(b,c,d,a,words[i2+1],21,-2054922799);
    a=md5ii(a,b,c,d,words[i2+8],6,1873313359);d=md5ii(d,a,b,c,words[i2+15],10,-30611744);c=md5ii(c,d,a,b,words[i2+6],15,-1560198380);b=md5ii(b,c,d,a,words[i2+13],21,1309151649);
    a=md5ii(a,b,c,d,words[i2+4],6,-145523070);d=md5ii(d,a,b,c,words[i2+11],10,-1120210379);c=md5ii(c,d,a,b,words[i2+2],15,718787259);b=md5ii(b,c,d,a,words[i2+9],21,-343485551);
    a=safeAdd(a,aa);b=safeAdd(b,bb);c=safeAdd(c,cc);d=safeAdd(d,dd);
  }
  var hex='';
  [a,b,c,d].forEach(function(n){for(var j=0;j<4;j++)hex+=('0'+(((n>>>(j*8))&0xff)).toString(16)).slice(-2);});
  return hex;
}

// ── Helpers ───────────────────────────────────────────────────────

// Deterministic color from string (for initials fallback)
function hashColor(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
  const colors = ['#4F7FD4','#D4654F','#4FD47F','#D4B94F','#9B4FD4','#4FB8D4','#D44F9B','#7FD44F'];
  return colors[Math.abs(h) % colors.length];
}

function initials(name) {
  return (name || '?').trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function cleanDate(raw) {
  if (!raw) return '';
  const s = String(raw).trim();
  const mo = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // gviz format: Date(2026,2,1) — months are 0-indexed
  const gviz = s.match(/^Date\((\d{4}),(\d{1,2}),(\d{1,2})\)$/);
  if (gviz) return `${parseInt(gviz[3])} ${mo[parseInt(gviz[2])]} ${gviz[1]}`;

  // Already formatted: "1 Mar 2026"
  if (/^\d{1,2}\s[A-Za-z]{3}\s\d{4}$/.test(s)) return s;

  // DD/MM/YYYY HH:mm:ss from Apps Script ts()
  const ddmm = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (ddmm) return `${parseInt(ddmm[1])} ${['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(ddmm[2])]} ${ddmm[3]}`;

  // JS Date string fallback
  try {
    const d = new Date(s);
    if (!isNaN(d.getTime())) return `${d.getDate()} ${mo[d.getMonth()]} ${d.getFullYear()}`;
  } catch(e) {}
  return s;
}

function maskEmail(email) {
  if (!email || !email.includes('@')) return '';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return local[0] + '*@' + domain;
  return local[0] + '*'.repeat(Math.min(local.length - 2, 4)) + local[local.length - 1] + '@' + domain;
}

function parseGviz(raw) {
  try {
    const json = raw.replace(/^[^{]*/, '').replace(/\);\s*$/, '');
    const data = JSON.parse(json);
    const rows = (data.table && data.table.rows) || [];
    const results = [];
    for (const row of rows) {
      const c = row.c || [];
      const g = i => (c[i] && c[i].v != null) ? String(c[i].v) : '';
      if (g(7).toLowerCase().trim() !== 'yes') continue;
      results.push({ name: g(1), email: g(2), role: g(3), rating: parseFloat(g(4)) || 5, message: g(5), date: g(6) });
    }
    return results.reverse();
  } catch(e) { return []; }
}

// ── Avatar: Gravatar → colored initials fallback ──────────────────
const Avatar = ({ email, name, size = 48 }) => {
  const [failed, setFailed] = useState(false);
  const hash = email ? md5(email.trim().toLowerCase()) : null;
  // d=404 so we get a clean error and can show our own fallback
  const gravatarSrc = hash ? `https://www.gravatar.com/avatar/${hash}?s=${size * 2}&d=404` : null;

  if (gravatarSrc && !failed) {
    return (
      <img
        src={gravatarSrc}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        style={{ width: size, height: size, minWidth: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  // Fallback — colored circle with initials
  return (
    <div style={{
      width: size, height: size, minWidth: size, flexShrink: 0,
      borderRadius: '50%', background: hashColor(name || email || '?'),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 900, fontSize: size * 0.35, letterSpacing: '-0.5px',
    }}>
      {initials(name)}
    </div>
  );
};

const Stars = ({ value, onChange, readonly = false }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1,2,3,4,5].map(s => (
      <span key={s} onClick={() => !readonly && onChange && onChange(s)}
        style={{ color: s <= value ? '#FFB800' : 'rgba(255,255,255,0.15)', fontSize: readonly ? 16 : 26,
          cursor: readonly ? 'default' : 'pointer', lineHeight: 1, userSelect: 'none' }}>★</span>
    ))}
  </div>
);

// ── Main ──────────────────────────────────────────────────────────
export default function ReviewsSection() {
  const [reviews,    setReviews]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [error,      setError]      = useState('');
  const [form, setForm] = useState({ name: '', email: '', role: '', rating: 5, message: '' });
  const scrollRef  = React.useRef(null);
  const pausedRef  = React.useRef(false);
  const rafRef     = React.useRef(null);
  const velRef     = React.useRef(0.6); // px per frame

  useEffect(() => {
    fetch(SHEET_URL)
      .then(r => r.text())
      .then(raw => { setReviews(parseGviz(raw)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Auto-scroll: smooth rAF-based, pauses on hover
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let pos = 0;
    function step() {
      if (!pausedRef.current && el.scrollWidth > el.clientWidth) {
        pos += velRef.current;
        // Seamless loop: when we've scrolled halfway (duplicate content), reset to 0
        if (pos >= el.scrollWidth / 2) pos = 0;
        el.scrollLeft = pos;
      }
      rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim())                               { setError('Please enter your name'); return; }
    if (!form.email.trim() || !form.email.includes('@')) { setError('Please enter a valid email'); return; }
    if (!form.message.trim())                            { setError('Please write your review'); return; }

    // Rate limit: 1 review per 5 minutes
    const now = Date.now();
    if (now - lastReviewTime < REVIEW_RATE_LIMIT_MS) {
      const waitMin = Math.ceil((REVIEW_RATE_LIMIT_MS - (now - lastReviewTime)) / 60000);
      setError(`Please wait ${waitMin} minute${waitMin > 1 ? 's' : ''} before submitting again.`);
      return;
    }

    setError(''); setSubmitting(true);
    try {
      const mo = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const d  = new Date();
      const payload = {
        type:    'submit_review',
        name:    sanitiseField(form.name, 100),
        email:   sanitiseField(form.email.toLowerCase(), 200),
        role:    sanitiseField(form.role, 100),
        rating:  Math.min(5, Math.max(1, parseInt(form.rating) || 5)),
        message: sanitiseField(form.message, 1000),
        date:    `${d.getDate()} ${mo[d.getMonth()]} ${d.getFullYear()}`,
      };
      // fire-and-forget — opaque no-cors response is unreadable anyway
      fetch(`${SCRIPT_URL}?payload=${encodeURIComponent(JSON.stringify(payload))}`, { mode: 'no-cors' }).catch(() => {});
      lastReviewTime = Date.now();
      setSubmitted(true);
      setForm({ name: '', email: '', role: '', rating: 5, message: '' });
      setTimeout(() => { setShowForm(false); setSubmitted(false); }, 3000);
    } catch { setError('Something went wrong. Please try again.'); }
    setSubmitting(false);
  };

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length).toFixed(1) : null;

  const inp = {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)', color: '#fff',
    fontSize: 14, padding: '12px 16px', outline: 'none', boxSizing: 'border-box',
  };
  const lbl = {
    fontSize: 11, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase', display: 'block', marginBottom: 6,
  };

  return (
    <section style={{ padding: '80px 24px', background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 48 }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: '0.5em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', marginBottom: 10 }}>What Clients Say</p>
            <h2 style={{ fontSize: 'clamp(28px,5vw,40px)', fontWeight: 900, color: '#fff', margin: 0 }}>Reviews</h2>
            {avg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                <span style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>{avg}</span>
                {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= Math.round(avg) ? '#FFB800' : 'rgba(255,255,255,0.15)', fontSize: 14 }}>★</span>)}
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </div>
            )}
          </div>
          <button onClick={() => setShowForm(true)} style={{
            padding: '12px 28px', background: '#fff', color: '#000',
            fontSize: 12, fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '0.2em', border: 'none', cursor: 'pointer',
          }}>+ Write a Review</button>
        </motion.div>

        {/* Cards */}
        {loading ? (
          <p style={{ color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '64px 0', fontSize: 13, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Loading…</p>
        ) : reviews.length === 0 ? (
          <div style={{ border: '1px solid rgba(255,255,255,0.07)', padding: 48, textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, letterSpacing: '0.3em', textTransform: 'uppercase', margin: 0 }}>No reviews yet — be the first!</p>
          </div>
        ) : (
          // Outer wrapper clips overflow, negative margin extends cards to section edge on mobile
          <div style={{ margin: '0 -24px', padding: '0 24px', overflowX: 'hidden' }}
            onMouseEnter={() => { pausedRef.current = true; }}
            onMouseLeave={() => { pausedRef.current = false; }}
            onTouchStart={() => { pausedRef.current = true; }}
            onTouchEnd={() => { setTimeout(() => { pausedRef.current = false; }, 1500); }}>
            <div ref={scrollRef} style={{
              display: 'flex', gap: 16, overflowX: 'auto', overflowY: 'visible',
              paddingBottom: 16,
              scrollbarWidth: 'none', msOverflowStyle: 'none',
            }}
              className="reviews-scroll">
              {/* Duplicate reviews for seamless loop — auto-slide resets at halfway */}
              {[...reviews, ...reviews].map((r, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: Math.min(i, 4) * 0.07 }}
                  style={{
                    background: '#111318', borderRadius: 12,
                    padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14,
                    border: '1px solid rgba(255,255,255,0.06)',
                    // Fixed width so cards don't shrink — shows ~3 on desktop, ~1.2 on mobile
                    minWidth: 300, maxWidth: 340, width: '30vw',
                    flexShrink: 0, scrollSnapAlign: 'start',
                  }}>

                  {/* TOP: avatar + name + stars */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <Avatar email={r.email} name={r.name} size={48} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.name}
                      </p>
                      <div style={{ marginTop: 5 }}>
                        <Stars value={r.rating || 5} readonly />
                      </div>
                    </div>
                  </div>

                  {/* MIDDLE: review text */}
                  <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, fontWeight: 400, lineHeight: 1.65, margin: 0, flex: 1 }}>
                    {r.message}
                  </p>

                  {/* BOTTOM: date */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12 }}>
                    <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: 12, margin: 0 }}>
                      {cleanDate(r.date)}
                    </p>
                  </div>

                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={e => e.target === e.currentTarget && !submitting && setShowForm(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)' }}>

              <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16 }} transition={{ duration: 0.25 }}
                style={{ width: '100%', maxWidth: 480, background: '#111318', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: 32, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>

                <button onClick={() => !submitting && setShowForm(false)}
                  style={{ position: 'absolute', top: 16, right: 20, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>✕</button>

                <p style={{ ...lbl, marginBottom: 4 }}>Share Your Experience</p>
                <h3 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 26px' }}>Write a Review</h3>

                {submitted ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '40px 0' }}>
                    <p style={{ fontSize: 44, margin: '0 0 16px' }}>✦</p>
                    <p style={{ color: '#fff', fontWeight: 900, fontSize: 18, margin: '0 0 8px' }}>Thank you!</p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>Your review has been submitted.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                    {/* Live preview */}
                    {form.name && form.email && form.email.includes('@') && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)' }}>
                        <Avatar email={form.email} name={form.name} size={44} />
                        <div>
                          <p style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: 0 }}>{form.name}</p>
                          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, margin: '3px 0 0' }}>{maskEmail(form.email)}</p>
                        </div>
                      </motion.div>
                    )}

                    {[
                      { key: 'name',  label: 'Your Name *',     type: 'text',  ph: 'e.g. Rahul Sharma' },
                      { key: 'email', label: 'Email Address *', type: 'email', ph: 'your@email.com' },
                      { key: 'role',  label: 'Role / Title',    type: 'text',  ph: 'e.g. Mechanical Engineer, Student' },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={lbl}>{f.label}</label>
                        <input type={f.type} value={form[f.key]}
                          onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                          placeholder={f.ph} style={{ ...inp, borderRadius: 6 }} />
                        {f.key === 'email' && (
                          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, margin: '5px 0 0' }}>
                            Your Gmail profile photo will be shown if available. Only masked email shown publicly.
                          </p>
                        )}
                      </div>
                    ))}

                    <div>
                      <label style={lbl}>Rating *</label>
                      <Stars value={form.rating} onChange={v => setForm(p => ({ ...p, rating: v }))} />
                    </div>

                    <div>
                      <label style={lbl}>Your Review *</label>
                      <textarea value={form.message}
                        onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                        placeholder="Tell us about your experience with Dr.PrinT…"
                        rows={4} style={{ ...inp, resize: 'none', borderRadius: 6 }} />
                    </div>

                    {error && <p style={{ color: '#f87171', fontSize: 12, margin: 0 }}>{error}</p>}

                    <button type="submit" disabled={submitting} style={{
                      width: '100%', padding: '14px', background: submitting ? 'rgba(255,255,255,0.4)' : '#fff',
                      color: '#000', fontSize: 12, fontWeight: 900, textTransform: 'uppercase',
                      letterSpacing: '0.2em', border: 'none', borderRadius: 6,
                      cursor: submitting ? 'not-allowed' : 'pointer', marginTop: 2,
                    }}>
                      {submitting ? 'Submitting…' : 'Submit Review'}
                    </button>
                  </form>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
