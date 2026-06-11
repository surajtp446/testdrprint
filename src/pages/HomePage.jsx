import { useSEO } from '@/hooks/useSEO.js';
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HeroSection from '@/components/HeroSection.jsx';
import ValueStrip from '@/components/ValueStrip.jsx';
import TrustBar from '@/components/TrustBar.jsx';
import HowItWorksSection from '@/components/HowItWorksSection.jsx';
import ReviewsSection from '@/components/ReviewsSection.jsx';
import CompanyBand from '@/components/CompanyBand.jsx';
import BuildFlow from '@/components/BuildFlow.jsx';
import HomeFAQ from '@/components/HomeFAQ.jsx';
import ServingBand from '@/components/ServingBand.jsx';
import { staggerContainer, staggerItem } from '@/data/animations.js';

// Full product pool — randomly picks 3 each render
const ALL_PRODUCTS = [
  { id: 1,   name: 'Phone & Tablet Stand',         price: 399,  tag: 'Bestseller',      image: '/products/stand_1.webp' },
  { id: 4,   name: 'Coil Spring Pen Stand',         price: 399,  tag: 'New',             image: '/products/spring_penstand.webp' },
  { id: 6,   name: 'Puffer Jacket Pen Stand',       price: 399,  tag: 'Trending',        image: '/products/jacket_penstand.webp' },
  { id: 7,   name: "Doctor's Coat Pen Stand",       price: 399,  tag: 'Gift Idea',       image: '/products/doctor_penstand.jpg' },
  { id: 5,   name: 'Brake Caliper Pen Stand',       price: 599,  tag: 'Motorsport',      image: '/products/caliper_penstand_1.webp' },
  { id: 8,   name: 'Porsche Wheel Pen Stand',       price: 599,  tag: 'Motorsport',      image: '/products/tyre_penstand_1.jpg' },
  { id: 2,   name: 'Brembo Brake Caliper Replica',  price: 1299, tag: 'Statement Piece', image: '/products/brembo_1.webp' },
  { id: 3,   name: 'F1 2026 Season Calendar Plaque',price: 899,  tag: 'F1 Edition',      image: '/products/f1_calendar.webp' },
  { id: 101, name: 'Archangel Warrior Figure',      price: 1999, tag: 'Resin',           image: '/products/resin_angel_warrior.jpg' },
  { id: 102, name: 'Inosuke Hashibira Figure',      price: 1599, tag: 'Resin · Anime',   image: '/products/resin_inosuke.jpg' },
  { id: 103, name: 'The Reveal 2.0 Lamp',           price: 2599, tag: 'Statement',       image: '/products/reveal_2_orange.jpg' },
  { id: 104, name: 'The Reveal Original Lamp',      price: 2399, tag: 'Statement',       image: '/products/reveal_original.jpg' },
  { id: 203, name: 'Brake Disc Lamp',                price: 2699, tag: 'New Drop',          image: '/products/brake_lamp_porsche.jpg' },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Page entrance animation — each page wraps in this
const pageVariants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -24, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

export default function HomePage() {
  useSEO({
    title: 'Dr.PrinT — 3D Printing Service Bengaluru | FDM & Resin | From ₹6/gram',
    description: 'Professional FDM and resin 3D printing in Basavanagudi, Bengaluru. Rapid prototyping, functional parts, drone & UAV components, custom 3D design, batch production. PLA, PETG, ASA, TPU, Carbon Fibre. From ₹6/gram. Free quote in 24 hours.',
    canonical: 'https://drprint.in/',
  });

  // Pick 3 random products each time the page mounts
  const [featured] = useState(() => shuffle(ALL_PRODUCTS).slice(0, 3));

  return (
    <motion.div
      className="bg-black min-h-screen font-poppins"
      variants={pageVariants}
      initial="initial"
      animate="animate" exit="exit"
    >
      <HeroSection />

      {/* Value strip */}
      <div className="relative z-10">
        <ValueStrip />
      </div>

      {/* Credibility — flight-tested wins (scroll-reveal + parallax) */}
      <CompanyBand />

      {/* Featured products */}
      <div className="relative z-20">
        <section className="py-20 px-6 bg-[#080808] border-t border-white/10"
>
          <div className="container mx-auto max-w-6xl">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} className="flex items-end justify-between mb-10 flex-wrap gap-4">
              <div>
                <p className="text-sm tracking-[0.45em] text-white/55 uppercase mb-3">Ready to Ship</p>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">From Our Studio</h2>
              </div>
              <Link to="/shop"
                className="text-[12px] font-black uppercase tracking-widest text-white/65 border border-white/12 px-5 py-2.5 hover:bg-white hover:text-black transition-all duration-200">
                View All →
              </Link>
            </motion.div>
            <motion.div
              variants={staggerContainer} initial="hidden" whileInView="visible"
              viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {featured.map((p) => (
                <motion.div key={p.id} variants={staggerItem}
                  className="group border border-white/10 bg-white/[0.025] hover:border-white/25 hover:bg-white/[0.04] transition-all duration-300"
                  style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
                  <div className="relative h-52 overflow-hidden">
                    <img src={p.image} alt={p.name} loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-black text-[11px] font-black uppercase tracking-widest px-2.5 py-1">
                      {p.tag}
                    </div>
                  </div>
                  <div className="p-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-sm leading-snug mb-1">{p.name}</h3>
                      <p className="text-white/65 text-sm font-light">₹{p.price.toLocaleString()}</p>
                    </div>
                    <Link to="/shop"
                      className="text-[12px] font-black uppercase tracking-widest px-4 py-2 border border-white/15 text-white/65 hover:bg-white hover:text-black transition-all duration-200 shrink-0">
                      Buy
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </div>

      {/* Filament-flow story — moves with the page, no pinned section */}
      <BuildFlow />

      {/* How it works */}
      <div className="relative z-30">
        <div>
          <HowItWorksSection />
        </div>
      </div>

      {/* SEO-rich serving / audience / location band */}
      <ServingBand />

      {/* What We Do — capabilities strip */}
      <div className="relative z-35">
        <section className="py-16 px-6 bg-[#050505] border-t border-white/8"
>
          <div className="container mx-auto max-w-6xl">
            <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-[11px] tracking-[0.55em] text-white/30 uppercase mb-2">Everything We Offer</p>
                <h2 className="text-3xl font-black tracking-tight">One Studio. Many Solutions.</h2>
              </div>
              <Link to="/services" className="text-[11px] font-black uppercase tracking-widest text-white/45 border border-white/10 px-5 py-2 hover:bg-white hover:text-black transition-all shrink-0">
                All Services →
              </Link>
            </motion.div>
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { icon: '⬡', label: 'Rapid Prototyping', href: '/services' },
                { icon: '◈', label: 'Functional Parts', href: '/services' },
                { icon: '◉', label: 'Batch Production', href: '/services' },
                { icon: '✦', label: 'Custom Design', href: '/design', highlight: true },
                { icon: '△', label: 'Drone & UAV Parts', href: '/services' },
                { icon: '◇', label: 'Resin Printing', href: '/shop' },
              ].map((cap, i) => (
                <motion.div key={i} variants={staggerItem}>
                  <Link to={cap.href}
                    className={`flex flex-col items-center gap-3 p-5 border text-center transition-all duration-300 group block ${
                      cap.highlight
                        ? 'border-white/25 bg-white/[0.04] hover:bg-white/[0.07] hover:border-white/40'
                        : 'border-white/8 bg-white/[0.015] hover:border-white/20 hover:bg-white/[0.03]'
                    }`}>
                    <span className={`text-2xl transition-colors ${cap.highlight ? 'text-white/60 group-hover:text-white/90' : 'text-white/20 group-hover:text-white/50'}`}>{cap.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] leading-snug text-white/55 group-hover:text-white/80 transition-colors">{cap.label}</span>
                    {cap.highlight && <span className="text-[9px] tracking-[0.3em] text-white/28 uppercase">New</span>}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </div>

      {/* SEO FAQ — matches FAQPage schema in index.html */}
      <HomeFAQ />

      {/* Trust + reviews */}
      <div className="relative z-40">
        <div style={{ background: '#000' }}>
          <TrustBar />
          <ReviewsSection />
        </div>
      </div>
    </motion.div>
  );
}
