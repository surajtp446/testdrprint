import { useSEO } from '@/hooks/useSEO.js';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingCart, X, Check, ZoomIn, Pencil } from 'lucide-react';
import CustomOrderPanel from '@/components/CustomOrderPanel.jsx';
import GlobalCustomButton from '@/components/GlobalCustomButton.jsx';
import MaterialsGuide from '@/components/MaterialsGuide.jsx';
import FlexiToyModal from '@/components/FlexiToyModal.jsx';
import { fadeUp, staggerContainer, staggerItem } from '@/data/animations.js';

const pageVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, x: -50, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

// ── Carousels ─────────────────────────────────────────────────────────────────
function CardCarousel({ images, alt, contain = false }) {
  const [cur, setCur] = useState(0);
  const imgCls = contain
    ? 'w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.02]'
    : 'w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-600';
  const h = contain ? 'h-72' : 'h-64';
  if (images.length === 1) return (
    <div className={`w-full ${h} overflow-hidden bg-[#0d0d0d]`}>
      <img src={images[0]} alt={alt} loading="lazy" className={imgCls} />
    </div>
  );
  return (
    <div className={`relative w-full ${h} overflow-hidden bg-[#0d0d0d] group/c`}>
      <img key={cur} src={images[cur]} alt={alt} loading="lazy" className={imgCls} />
      <button aria-label="Prev" onClick={e => { e.stopPropagation(); setCur((cur - 1 + images.length) % images.length); }}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white rounded-full p-1 opacity-0 group-hover/c:opacity-100 transition-opacity z-10">
        <ChevronLeft size={13} />
      </button>
      <button aria-label="Next" onClick={e => { e.stopPropagation(); setCur((cur + 1) % images.length); }}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white rounded-full p-1 opacity-0 group-hover/c:opacity-100 transition-opacity z-10">
        <ChevronRight size={13} />
      </button>
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {images.map((_, i) => (
          <button key={i} onClick={e => { e.stopPropagation(); setCur(i); }}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === cur ? 'bg-white scale-125' : 'bg-white/30'}`} />
        ))}
      </div>
    </div>
  );
}

function ModalCarousel({ images, alt }) {
  const [cur, setCur] = useState(0);
  return (
    <div className="relative w-full bg-[#0a0a0a] flex items-center justify-center" style={{ minHeight: 360 }}>
      <img key={cur} src={images[cur]} alt={`${alt} ${cur + 1}`}
        className="w-full object-contain" style={{ maxHeight: 600, padding: '8px' }} />
      {images.length > 1 && (
        <>
          <button aria-label="Prev" onClick={e => { e.stopPropagation(); setCur((cur - 1 + images.length) % images.length); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-black text-white rounded-full p-2.5 transition-all">
            <ChevronLeft size={16} />
          </button>
          <button aria-label="Next" onClick={e => { e.stopPropagation(); setCur((cur + 1) % images.length); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-black text-white rounded-full p-2.5 transition-all">
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setCur(i); }}
                className={`rounded-full transition-all ${i === cur ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/28 hover:bg-white/55'}`} />
            ))}
          </div>
          <div className="absolute top-3 right-3 bg-black/60 text-white/60 text-[11px] font-mono px-2 py-0.5">
            {cur + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}

// ── Product modal ─────────────────────────────────────────────────────────────
function ProductModal({ product, onClose, onAddToCart, addedId }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);
  const isResin = product.id >= 100 && product.id < 200;
  const isLamp  = product.id >= 200;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ y: 32, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 32, opacity: 0 }} transition={{ type: 'tween', duration: 0.22 }}
        data-lenis-prevent
        className="relative w-full max-w-2xl max-h-[92vh] bg-[#080808] border border-white/12 overflow-y-auto shadow-2xl">
        <button onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white/45 hover:text-white bg-black/60 rounded-full p-1.5 transition-colors">
          <X size={15} />
        </button>
        <ModalCarousel images={product.images} alt={product.name} />
        <div className="p-7 md:p-9">
          <div className="flex flex-wrap gap-2 mb-4">
            {product.tag && (
              <span className="text-[10px] font-black tracking-[0.35em] uppercase bg-white text-black px-2.5 py-1">
                {product.tag}
              </span>
            )}
            {isResin && <span className="text-[10px] tracking-[0.3em] uppercase border border-white/12 text-white/45 px-2.5 py-1">UV Resin · Post-Cured</span>}
            {isLamp  && <span className="text-[10px] tracking-[0.3em] uppercase border border-white/12 text-white/45 px-2.5 py-1">FDM · Statement Piece</span>}
          </div>
          <h2 className="text-2xl font-black leading-tight mb-3">{product.name}</h2>
          {product.caption && (
            <p className="text-white/60 text-sm font-light leading-relaxed mb-5">{product.caption}</p>
          )}
          {product.specs?.length > 0 && (
            <ul className="space-y-2 mb-6 border-t border-white/8 pt-5">
              {product.specs.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-white/55">
                  <span className="w-1 h-1 rounded-full bg-white/18 mt-2 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center justify-between pt-5 border-t border-white/10">
            <div>
              <div className="text-3xl font-black">₹{product.price.toLocaleString()}</div>
              <div className="text-white/30 text-[11px] mt-0.5">Made to order · Ships from Bengaluru</div>
            </div>
            <button onClick={() => { onAddToCart(product); onClose(); }}
              className={`flex items-center gap-2 px-7 py-3.5 text-[13px] font-black uppercase tracking-widest transition-all duration-300
                ${addedId === product.id ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-white/85'}`}>
              {addedId === product.id ? <><Check size={13} /> Added</> : 'Add to Cart'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Product card ──────────────────────────────────────────────────────────────
function ProductCard({ product, index, onOpen, onAddToCart, addedId }) {
  return (
    <motion.div custom={index} initial="hidden" whileInView="visible"
      viewport={{ once: true, margin: '-20px' }} variants={fadeUp}
      className="card-melt group relative bg-[#0c0c0e] border border-white/8 hover:border-white/22 flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
      onClick={() => onOpen(product)}>
      <div className="relative overflow-hidden">
        <CardCarousel images={product.images} alt={product.name} contain={product.id >= 100} />
        {product.tag && (
          <div className="absolute top-3 left-3 z-10 bg-white/95 text-black text-[10px] font-black uppercase tracking-[0.25em] px-2.5 py-1 backdrop-blur-sm">
            {product.tag}
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300 flex items-center justify-center pointer-events-none">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex items-center gap-2 bg-black/85 backdrop-blur-sm text-white text-[11px] font-black uppercase tracking-widest px-4 py-2.5">
            <ZoomIn size={12} /> View Details
          </div>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-black text-sm leading-snug mb-1 group-hover:text-white transition-colors">{product.name}</h3>
        {product.caption && (
          <p className="text-white/38 text-xs font-light leading-relaxed mb-3 line-clamp-2">{product.caption}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/8">
          <span className="text-xl font-black">₹{product.price.toLocaleString()}</span>
          <button
            onClick={e => { e.stopPropagation(); onAddToCart(product); }}
            className={`flex items-center gap-1.5 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-300
              ${addedId === product.id ? 'bg-green-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white hover:text-black'}`}>
            {addedId === product.id ? <><Check size={11} /> Added</> : 'Add'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Flexi showcase ────────────────────────────────────────────────────────────
const FLEXI_IMAGES = [
  '/products/flexi/raccoons.webp', '/products/flexi/sharks.webp',
  '/products/flexi/fish.webp', '/products/flexi/dragon-white.webp',
  '/products/flexi/crocodile.webp', '/products/flexi/dragon-black.webp',
  '/products/flexi/fox.webp', '/products/flexi/cat.webp',
  '/products/flexi/whale-shark.webp', '/products/flexi/monkeys.webp',
  '/products/flexi/baby-sharks.webp', '/products/flexi/caterpillar.webp',
];
function FlexiShowcase() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % FLEXI_IMAGES.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <img src={FLEXI_IMAGES[idx]} alt="Flexi toy" loading="lazy"
      className="w-full h-full object-contain p-4 transition-opacity duration-400"
      style={{ background: '#0a0a0a' }} />
  );
}

// ── All products data ─────────────────────────────────────────────────────────
const fdmProducts = [
  { id: 1, name: 'Phone & Tablet Stand', price: 399, tag: 'Bestseller', category: 'fdm',
    images: ['/products/stand_1.webp','/products/stand_2.webp','/products/stand_3.webp'],
    caption: 'Multi-angle adjustable holder for phones and tablets up to 12".',
    specs: ['Multi-angle tilt adjustment','Stable non-slip base','Holds phones and tablets','Matte black PLA'] },
  { id: 4, name: 'Coil Spring Pen Stand', price: 399, tag: 'New', category: 'fdm',
    images: ['/products/spring_penstand.webp'],
    caption: 'Mechanical coil spring design — holds 8–10 pens. A head-turner on any desk.',
    specs: ['Mechanical spring coil silhouette','Holds 8–10 pens','Matte finish PLA','Weighted for stability'] },
  { id: 6, name: 'Puffer Jacket Pen Stand', price: 399, tag: 'Trending', category: 'fdm',
    images: ['/products/jacket_penstand.webp'],
    caption: 'A miniature puffer jacket that doubles as your desk pen holder.',
    specs: ['Iconic puffer jacket silhouette','Holds 6–8 pens','Vivid yellow PLA','Great desk accent or gift'] },
  { id: 7, name: "Doctor's Coat Pen Stand", price: 399, tag: 'Gift Idea', category: 'fdm',
    images: ['/products/doctor_penstand.jpg'],
    caption: 'Detailed coat with stethoscope detail — perfect gift for a medic.',
    specs: ['Stethoscope and coat detail','Holds 8–10 pens','Crisp white PLA','Popular as graduation gift'] },
  { id: 5, name: 'Brake Caliper Pen Stand', price: 599, tag: 'Motorsport', category: 'motorsport',
    images: ['/products/caliper_penstand_1.webp','/products/caliper_penstand_2.webp','/products/caliper_penstand_3.webp'],
    caption: 'Brembo-style caliper design with bolt detail on every face.',
    specs: ['Brembo-inspired design','Holds 6–8 pens','Red + silver PLA','Bolt detail all faces'] },
  { id: 8, name: 'Porsche Wheel Pen Stand', price: 599, tag: 'Motorsport', category: 'motorsport',
    images: ['/products/tyre_penstand_1.jpg','/products/tyre_penstand_2.jpg'],
    caption: 'BBS mesh wheel with Goodyear tyre lettering and orange Brembo caliper on a red jack stand.',
    specs: ['BBS-style mesh wheel','Goodyear tyre lettering','Red jack stand base','Red, silver, black multi-colour'] },
  { id: 2, name: 'Brembo Brake Caliper Replica', price: 1299, tag: 'Statement Piece', category: 'motorsport',
    images: ['/products/brembo_1.webp','/products/brembo_2.webp',
      'https://makerworld.bblmw.com/makerworld/model/USad4dc256d9cf76/design/2025-10-31_3e002c4d31778.jpg?x-oss-process=image/resize,w_1000/format,webp'],
    caption: 'Full-scale Brembo GT caliper replica — every cooling duct, piston dome, bleed nipple.',
    specs: ['1:1 scale replica','12 pistons, cooling fins, bleed nipple','Iconic Brembo red + gold lettering','Display stand included'] },
  { id: 3, name: 'F1 2026 Calendar Plaque', price: 899, tag: 'F1 Edition', category: 'fdm',
    images: ['/products/f1_calendar.webp'],
    caption: 'Full 2026 F1 season race calendar. Wall-mountable.',
    specs: ['All 2026 F1 races and circuits','Circuit names and dates','Wall-mountable','Matte black PLA'] },
];

const resinProducts = [
  { id: 101, name: 'Archangel Warrior Figure', price: 1999, tag: 'Resin', category: 'resin',
    images: ['/products/resin_angel_warrior.jpg'],
    caption: 'Winged paladin in full battle armour — every feather and plate in razor-sharp resin detail.',
    specs: ['~18 cm tall with integrated base','0.05 mm UV photopolymer resin','Washed + UV post-cured','Delivered unpainted'] },
  { id: 102, name: 'Inosuke Hashibira Figure', price: 1599, tag: 'Resin · Anime', category: 'resin',
    images: ['/products/resin_inosuke.jpg'],
    caption: "Demon Slayer's wild beast — dual jagged blades and full muscle definition in collector-grade resin.",
    specs: ['Demon Slayer character','Dual serrated blade detail','0.05 mm UV photopolymer resin','Post-cured + inspected'] },
];

const lampProducts = [
  { id: 201, name: 'The Reveal 2.0', price: 2599, tag: 'Statement', category: 'lamps',
    images: ['/products/reveal_2_orange.jpg','/products/reveal_2_dark.jpg'],
    caption: 'Second-generation Reveal lamp — architectural rib cage glows amber when lit, sculptural when dark.',
    specs: ['~28 cm tall · ~14 cm diameter','Ribbed cage — 2nd generation design','Standard E27 bulb (not included)','Tripod base · any colour to order'] },
  { id: 202, name: 'The Reveal Original', price: 2399, tag: 'Statement', category: 'lamps',
    images: ['/products/reveal_original.jpg','/products/reveal_original_compare.jpg'],
    caption: 'The original Reveal — vertical fins flood your room in warm amber light. Opens for bulb access.',
    specs: ['~26 cm tall · ~13 cm diameter','Opens and closes for bulb swap','Warm wood-tone PLA','Standard E27 bulb (not included)'] },
,
  { id: 203, name: 'Brake Disc Lamp', price: 2699, tag: 'New Drop', category: 'lamps',
    images: [
      '/products/brake_lamp_porsche.jpg',
      '/products/brake_lamp_porsche_lit.jpg',
      '/products/brake_lamp_bmw_front.jpg',
      '/products/brake_lamp_bmw_top.jpg',
      '/products/brake_lamp_bmw_side.jpg',
      '/products/brake_lamp_bmw_dark.jpg',
      '/products/brake_lamp_bmw_glow.jpg',
    ],
    caption: 'A full-size brake disc and caliper lamp that glows amber-red. Porsche and BMW M editions — the ultimate car enthusiast desk statement.',
    specs: [
      'Multi-colour PLA — disc, caliper, hub all separate printed pieces',
      'Porsche edition (teal caliper) & BMW M edition (blue M-Sport caliper)',
      'Glows warm amber/red through the drilled and slotted disc vents',
      'Branded hub cap with logo detail · ~28 cm disc diameter',
      'Display stand included · Standard E27 bulb (not included)',
      'Pan-India shipping from Bengaluru',
    ] }
];

// ── Cart drawer ───────────────────────────────────────────────────────────────
function CartDrawer({ cart, onClose, onRemove, onQtyChange }) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.26 }}
        className="relative w-full max-w-sm bg-[#080808] border-l border-white/12 flex flex-col h-full overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="font-black text-lg">Cart <span className="text-white/50 font-normal text-sm">({cart.reduce((s,i) => s+i.qty, 0)})</span></h2>
          <button onClick={onClose}><X size={17} className="text-white/50 hover:text-white transition-colors" /></button>
        </div>
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white/30 px-8 text-center">
            <ShoppingCart size={28} className="opacity-30" />
            <p className="text-sm">Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="flex-1 p-6 space-y-4 overflow-y-auto" data-lenis-prevent>
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 border-b border-white/8 pb-4">
                  <img src={item.images[0]} alt={item.name} loading="lazy"
                    className="w-16 h-16 object-cover border border-white/10 shrink-0 rounded-sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold leading-tight mb-1 truncate">{item.name}</p>
                    <p className="text-white/55 text-sm mb-2">₹{item.price.toLocaleString()}</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onQtyChange(item.id, item.qty - 1)}
                        className="w-6 h-6 border border-white/12 text-white/60 hover:border-white/35 hover:text-white transition-all text-sm flex items-center justify-center">−</button>
                      <span className="text-sm font-bold w-5 text-center">{item.qty}</span>
                      <button onClick={() => onQtyChange(item.id, item.qty + 1)}
                        className="w-6 h-6 border border-white/12 text-white/60 hover:border-white/35 hover:text-white transition-all text-sm flex items-center justify-center">+</button>
                    </div>
                  </div>
                  <button onClick={() => onRemove(item.id)} className="text-white/30 hover:text-white/60 transition-colors self-start mt-1">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-white/10">
              <div className="flex justify-between items-center mb-1">
                <span className="text-white/55 text-sm">Total</span>
                <span className="font-black text-2xl">₹{total.toLocaleString()}</span>
              </div>
              <p className="text-white/35 text-xs mb-5">Shipping calculated at checkout</p>
              <Link
                to={`/payment?total=${total}&items=${encodeURIComponent(JSON.stringify(cart.map(i => ({name:i.name,qty:i.qty,price:i.price}))))}`}
                onClick={onClose}
                className="block w-full py-4 bg-white text-black text-[13px] font-black uppercase tracking-[0.2em] text-center hover:bg-white/88 transition-all">
                Checkout — ₹{total.toLocaleString()}
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ── Filter tabs ───────────────────────────────────────────────────────────────
const FILTERS = [
  { key: 'all',        label: 'All' },
  { key: 'fdm',        label: 'Desk & Display' },
  { key: 'motorsport', label: 'Motorsport' },
  { key: 'resin',      label: 'Resin Figures' },
  { key: 'lamps',      label: 'Lamps' },
];

// ── Resin explainer (editorial) ───────────────────────────────────────────────
function ResinExplainer() {
  const stats = [
    { value: '0.05mm', label: 'Layer Height',   sub: 'vs 0.2mm FDM' },
    { value: '4×',     label: 'Sharper Detail', sub: 'than FDM at same size' },
    { value: '100%',   label: 'Post-Cured',     sub: 'washed + UV hardened' },
    { value: '≈0',     label: 'Layer Lines',    sub: 'visible on finished surface' },
  ];
  const diffs = [
    { aspect: 'How it works',    fdm: 'Melts plastic filament, builds layers you can feel.',  resin: 'UV laser cures liquid photopolymer at the molecular level.' },
    { aspect: 'Surface quality', fdm: 'Layer ridges visible up close.',                        resin: 'Near-optical smoothness — reflections on the surface.' },
    { aspect: 'Detail limit',    fdm: '~0.4mm nozzle — small features blur.',                 resin: 'Down to 0.05mm — hair strands, feather barbs, 1mm text.' },
    { aspect: 'Best for',        fdm: 'Functional parts, structural builds, large prints.',   resin: 'Collector figures, miniatures, jewellery, display models.' },
  ];
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
      className="mb-14 border border-white/10 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0e0e12 0%, #111420 100%)' }}>
      <div className="px-8 md:px-10 pt-10 pb-8 border-b border-white/8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div>
            <p className="text-[10px] tracking-[0.7em] text-white/22 uppercase mb-3">Why Resin?</p>
            <h2 className="text-3xl md:text-4xl font-black leading-tight">
              Not a better FDM.<br /><span className="text-white/38">A completely different science.</span>
            </h2>
          </div>
          <p className="text-white/40 text-sm font-light max-w-xs leading-relaxed md:text-right">
            Resin cures liquid photopolymer with UV light — the physics produce a fundamentally different result.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/8 border-b border-white/8">
        {stats.map(({ value, label, sub }) => (
          <div key={label} className="px-6 py-5 flex flex-col gap-1">
            <span className="text-2xl md:text-3xl font-black tabular-nums">{value}</span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/55">{label}</span>
            <span className="text-[10px] text-white/28 font-light">{sub}</span>
          </div>
        ))}
      </div>
      <div className="divide-y divide-white/6">
        {diffs.map(({ aspect, fdm, resin }) => (
          <div key={aspect} className="grid grid-cols-1 md:grid-cols-[120px_1fr_1fr] gap-0">
            <div className="px-8 md:px-10 py-4 flex items-center md:border-r border-white/6">
              <span className="text-[9px] tracking-[0.4em] uppercase text-white/25">{aspect}</span>
            </div>
            <div className="px-8 py-4 md:border-r border-white/6">
              <p className="text-[9px] tracking-[0.35em] uppercase text-white/20 mb-1.5">FDM</p>
              <p className="text-white/40 text-xs font-light leading-relaxed">{fdm}</p>
            </div>
            <div className="px-8 py-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-[9px] tracking-[0.35em] uppercase text-white/50 mb-1.5">Resin ✦</p>
              <p className="text-white/75 text-xs font-light leading-relaxed">{resin}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="px-8 md:px-10 py-4 border-t border-white/8">
        <p className="text-white/22 text-[10px] font-light">
          All resin prints washed in IPA, UV post-cured for full hardness, inspected before dispatch. Custom sizes available on request.
        </p>
      </div>
    </motion.div>
  );
}

// ── Design Service Banner ─────────────────────────────────────────────────────
function DesignBanner() {
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
      className="my-16 border border-white/10 overflow-hidden relative"
      style={{ background: 'linear-gradient(120deg, #0d0d10 0%, #111318 60%, #0d0d0d 100%)' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.03) 0%, transparent 60%)' }} />
      <div className="flex flex-col md:flex-row items-center gap-0">
        <div className="flex-1 p-8 md:p-10">
          <div className="flex items-center gap-2 mb-4">
            <Pencil size={14} className="text-white/35" />
            <span className="text-[10px] tracking-[0.5em] text-white/35 uppercase">New Service</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-black mb-3 leading-tight">
            Don't have a 3D file?<br />
            <span className="text-white/45">We'll design it for you.</span>
          </h3>
          <p className="text-white/50 text-sm font-light leading-relaxed mb-6 max-w-md">
            Share a sketch, photo, or description — we model it in 3D, refine with you, then print it in-house. Design fees start at ₹500.
          </p>
          <Link to="/design"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-black text-[12px] font-black uppercase tracking-[0.2em] hover:bg-white/85 transition-all">
            Explore Design Service →
          </Link>
        </div>
        <div className="hidden md:flex flex-col items-end gap-3 p-10 pr-12 text-right shrink-0">
          {['Product Housings', 'Drone Parts', 'Scale Models', 'Character Figures', 'Custom Brackets'].map((item, i) => (
            <motion.span key={item} initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4 }}
              className="text-[11px] tracking-[0.3em] uppercase text-white/30 hover:text-white/55 transition-colors cursor-default">
              {item}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ShopPage() {
  useSEO({
    title: 'Shop 3D Printed Parts — Pen Stands, Figures, Lamps | Dr.PrinT Bengaluru',
    description: 'Buy 3D printed products online from Dr.PrinT, Bengaluru. Pen stands from ₹399, motorsport replicas, resin figurines, designer lamps. FDM and resin prints made in Bengaluru. Pan-India delivery.',
    canonical: 'https://drprint.in/shop',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'name': '3D Printed Products — Dr.PrinT Bengaluru',
      'description': 'Ready-to-ship FDM and resin 3D printed products from Dr.PrinT studio in Bengaluru',
      'url': 'https://drprint.in/shop',
      'numberOfItems': 12,
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Phone & Tablet Stand', 'url': 'https://drprint.in/shop' },
        { '@type': 'ListItem', 'position': 2, 'name': 'Brake Caliper Pen Stand', 'url': 'https://drprint.in/shop' },
        { '@type': 'ListItem', 'position': 3, 'name': 'Brembo Brake Caliper Replica', 'url': 'https://drprint.in/shop' },
        { '@type': 'ListItem', 'position': 4, 'name': 'Archangel Warrior Resin Figure', 'url': 'https://drprint.in/shop' },
        { '@type': 'ListItem', 'position': 5, 'name': 'The Reveal 2.0 Lamp', 'url': 'https://drprint.in/shop' },
      ],
    },
  });

  const [cart, setCart]               = useState([]);
  const [selected, setSelected]       = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showCustom, setShowCustom]   = useState(false);
  const [showMaterials, setShowMaterials] = useState(false);
  const [showFlexiModal, setShowFlexiModal] = useState(false);
  const [cartOpen, setCartOpen]       = useState(false);
  const [addedId, setAddedId]         = useState(null);

  useEffect(() => {
    if (window.location.hash === '#custom') {
      setShowCustom(true);
      window.history.replaceState(null, '', '/shop');
    }
  }, []);

  function addToCart(product) {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1400);
    setCartOpen(true);
  }
  function removeFromCart(id) { setCart(prev => prev.filter(i => i.id !== id)); }
  function changeQty(id, qty) {
    if (qty < 1) { removeFromCart(id); return; }
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  }

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const allFdm = [...fdmProducts];
  const filteredFdm   = useMemo(() => activeFilter === 'all' ? allFdm : allFdm.filter(p => p.category === activeFilter), [activeFilter]);
  const filteredResin = useMemo(() => activeFilter === 'all' || activeFilter === 'resin' ? resinProducts : [], [activeFilter]);
  const filteredLamps = useMemo(() => activeFilter === 'all' || activeFilter === 'lamps' ? lampProducts : [], [activeFilter]);

  const showFlexi = activeFilter === 'all' || activeFilter === 'fdm';

  return (
    <motion.div className="min-h-screen bg-black text-white pt-24 pb-24"
      variants={pageVariants} initial="initial" animate="animate" exit="exit">

      {/* Cart button */}
      <button onClick={() => setCartOpen(true)}
        className="fixed top-[72px] right-0 z-40 flex items-center gap-2 bg-white text-black px-4 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-white/88 transition-all shadow-2xl">
        <ShoppingCart size={12} />
        {cartCount > 0
          ? <span>{cartCount} · ₹{cart.reduce((s,i)=>s+i.price*i.qty,0).toLocaleString()}</span>
          : <span>Cart</span>}
      </button>

      <AnimatePresence>
        {cartOpen && <CartDrawer cart={cart} onClose={() => setCartOpen(false)} onRemove={removeFromCart} onQtyChange={changeQty} />}
        {showMaterials && <MaterialsGuide onClose={() => setShowMaterials(false)} />}
        {showFlexiModal && <FlexiToyModal onClose={() => setShowFlexiModal(false)} />}
        {selected && <ProductModal product={selected} onClose={() => setSelected(null)} onAddToCart={addToCart} addedId={addedId} />}
      </AnimatePresence>

      <GlobalCustomButton />

      <div className="max-w-6xl mx-auto px-6">

        {/* ── HERO HEADER ── */}
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="mb-16">
          <motion.p variants={staggerItem} className="text-[11px] tracking-[0.6em] text-white/35 uppercase mb-4">
            Dr.PrinT Store
          </motion.p>
          <motion.h1 variants={staggerItem}
            className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-5">
            Printed in<br /><span className="text-white/30">Bengaluru.</span>
          </motion.h1>
          <motion.p variants={staggerItem} className="text-white/50 text-base font-light max-w-lg leading-relaxed mb-8">
            Ready-to-ship FDM and resin prints — pen stands, motorsport replicas, collector figures, statement lamps, and flexi toys.
            All made to order and shipped from our studio.
          </motion.p>
          <motion.div variants={staggerItem} className="flex flex-wrap gap-3">
            <button onClick={() => setShowMaterials(true)}
              className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest border border-white/12 px-5 py-2.5 text-white/55 hover:border-white/30 hover:text-white/75 transition-all">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
              Material Guide
            </button>
            <Link to="/design"
              className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest border border-white/12 px-5 py-2.5 text-white/55 hover:border-white/30 hover:text-white/75 transition-all">
              <Pencil size={12} />
              Need a Design?
            </Link>
          </motion.div>
        </motion.div>

        {/* ── STATS STRIP ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-3 gap-px bg-white/8 border border-white/8 mb-16">
          {[
            { v: '₹399', l: 'Starts from' },
            { v: '2–5d', l: 'Delivery' },
            { v: 'India', l: 'Shipping' },
          ].map(({ v, l }) => (
            <div key={l} className="bg-black px-6 py-5 text-center">
              <div className="text-2xl font-black">{v}</div>
              <div className="text-[10px] tracking-[0.35em] uppercase text-white/35 mt-0.5">{l}</div>
            </div>
          ))}
        </motion.div>

        {/* ── FILTER TABS ── */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="flex flex-wrap gap-2 mb-10">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-2 text-[11px] font-black uppercase tracking-widest border transition-all duration-200 ${
                activeFilter === f.key
                  ? 'bg-white text-black border-white'
                  : 'border-white/12 text-white/45 hover:border-white/30 hover:text-white/70'
              }`}>
              {f.label}
            </button>
          ))}
        </motion.div>

        {/* ── FDM GRID ── */}
        {filteredFdm.length > 0 && (
          <>
            {activeFilter === 'all' && (
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="flex items-center gap-4 mb-8">
                <div>
                  <p className="text-[10px] tracking-[0.55em] text-white/25 uppercase mb-1">FDM Printed</p>
                  <h2 className="text-xl font-black">Desk & Display</h2>
                </div>
                <div className="flex-1 h-px bg-white/6" />
                <span className="text-[10px] tracking-widest text-white/18 uppercase hidden sm:block">PLA · PETG · ASA</span>
              </motion.div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-16">
              {filteredFdm.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} onOpen={setSelected} onAddToCart={addToCart} addedId={addedId} />
              ))}
            </div>
          </>
        )}

        {/* ── DESIGN BANNER (between FDM and Resin) ── */}
        {(activeFilter === 'all') && <DesignBanner />}

        {/* ── FLEXI ── */}
        {showFlexi && (
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="mb-16 border border-white/10 overflow-hidden bg-[#0c0c0e]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="relative h-72 md:h-auto overflow-hidden" style={{ background: '#0a0a0a' }}>
                <FlexiShowcase />
                <div className="absolute top-3 left-3 bg-white text-black text-[10px] font-black uppercase tracking-widest px-2.5 py-1">New · Popular</div>
                <div className="absolute bottom-3 right-3 bg-black/70 text-white/70 text-[10px] font-mono px-2 py-0.5">12+ designs</div>
              </div>
              <div className="p-8 md:p-10 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] tracking-[0.45em] uppercase text-white/35 mb-2">Flexi Collection</p>
                  <h3 className="text-2xl font-black mb-3">Articulated Flexi Toys</h3>
                  <p className="text-white/50 text-sm font-light leading-relaxed mb-5">
                    Adorable poseable animals — raccoons, sharks, dragons, foxes and more. Printed in multi-colour PLA. Perfect desk toys, keychains, or gifts.
                  </p>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-3xl font-black">₹80</span>
                    <span className="text-white/38 text-sm">per piece</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="text-[11px] border border-green-500/25 text-green-400/80 px-2 py-0.5">10 Pack — ₹499</span>
                    <span className="text-[11px] border border-green-500/25 text-green-400/80 px-2 py-0.5">20 Pack — ₹699</span>
                  </div>
                </div>
                <button onClick={() => setShowFlexiModal(true)}
                  className="w-full py-3.5 bg-white text-black text-[12px] font-black uppercase tracking-[0.2em] hover:bg-white/85 transition-all">
                  Choose & Order →
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── RESIN SECTION ── */}
        {filteredResin.length > 0 && (
          <>
            {activeFilter === 'all' && (
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="flex items-center gap-4 mb-8">
                <div>
                  <p className="text-[10px] tracking-[0.55em] text-white/25 uppercase mb-1">Resin Printed</p>
                  <h2 className="text-xl font-black">Figures & Collectibles</h2>
                </div>
                <div className="flex-1 h-px bg-white/6" />
                <span className="text-[10px] tracking-widest text-white/18 uppercase hidden sm:block">UV Photopolymer</span>
              </motion.div>
            )}
            <ResinExplainer />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
              {filteredResin.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} onOpen={setSelected} onAddToCart={addToCart} addedId={addedId} />
              ))}
            </div>
          </>
        )}

        {/* ── LAMPS SECTION ── */}
        {filteredLamps.length > 0 && (
          <>
            {activeFilter === 'all' && (
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="flex items-center gap-4 mb-8">
                <div>
                  <p className="text-[10px] tracking-[0.55em] text-white/25 uppercase mb-1">3D Printed Lamps</p>
                  <h2 className="text-xl font-black">The Reveal Collection</h2>
                </div>
                <div className="flex-1 h-px bg-white/6" />
                <span className="text-[10px] tracking-widest text-white/18 uppercase hidden sm:block">Statement Pieces</span>
              </motion.div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
              {filteredLamps.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} onOpen={setSelected} onAddToCart={addToCart} addedId={addedId} />
              ))}
            </div>
          </>
        )}

        {/* ── EMPTY STATE ── */}
        {filteredFdm.length === 0 && filteredResin.length === 0 && filteredLamps.length === 0 && (
          <div className="text-center py-24 text-white/20">
            <p className="text-sm tracking-widest uppercase">No products in this category</p>
          </div>
        )}

        {showCustom && <CustomOrderPanel onClose={() => setShowCustom(false)} />}
      </div>
    </motion.div>
  );
}
