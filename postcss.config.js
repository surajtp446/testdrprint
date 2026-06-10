import { useSEO } from '@/hooks/useSEO.js';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fadeUp, staggerContainer, staggerItem } from '@/data/animations.js';

const pageVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, x: -50, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

// ── What we design ────────────────────────────────────────────────────────────
const capabilities = [
  {
    icon: '⬡',
    title: 'UAV & Drone Components',
    desc: 'Motor mounts, camera gimbals, payload bays, landing gear, boom arms, antenna brackets, and aerodynamic fairings — designed in Fusion 360 for structural integrity and printability.',
  },
  {
    icon: '◈',
    title: 'Enclosures & Housings',
    desc: 'Electronics project boxes, battery enclosures, controller housings, and device shells — modelled to your exact internal PCB layout, port positions, and mounting hole pattern.',
  },
  {
    icon: '△',
    title: 'Brackets, Mounts & Jigs',
    desc: 'One-off mounting brackets, alignment jigs, fixtures, and custom clamps for specific hardware — toleranced to fit and function without post-processing.',
  },
  {
    icon: '◉',
    title: 'Automotive Components',
    desc: 'Custom brackets, sensor mounts, cable guides, interior trims, and replacement parts for automotive builds — designed from measurements or CAD reference.',
  },
  {
    icon: '◇',
    title: 'Structural Mechanical Parts',
    desc: 'Load-bearing arms, linkages, gearbox housings, and functional assemblies — designed with correct wall thickness, infill strategy, and material selection in mind.',
  },
  {
    icon: '○',
    title: 'Custom Hardware Adapters',
    desc: 'Thread adapters, pipe fittings, interface plates, and bespoke connectors to join off-the-shelf parts that were never designed to work together.',
  },
];

// ── Pricing tiers ─────────────────────────────────────────────────────────────
const tiers = [
  {
    name: 'Basic',
    price: '₹500 – ₹1,500',
    tag: 'Simple Geometry',
    desc: 'Single-body parts, simple brackets, mounts, and enclosures. You provide dimensions or a sketch — we model and deliver print-ready STL and STEP files.',
    includes: [
      'Up to 2 design revisions',
      'STL file delivered',
      'Print-ready optimisation',
      '2–3 day turnaround',
    ],
  },
  {
    name: 'Standard',
    price: '₹1,500 – ₹4,000',
    tag: 'Multi-Part / Detailed',
    desc: 'Multi-body assemblies, drone components, enclosures with inserts, and detailed mechanical parts. Modelled with correct tolerances, wall thickness, and print orientation.',
    includes: [
      'Up to 3 design revisions',
      'Full assembly STEP + STL files',
      'Tolerance engineering for fit',
      '3–5 day turnaround',
    ],
    highlight: true,
  },
  {
    name: 'Premium',
    price: '₹4,000+',
    tag: 'Complex / Organic',
    desc: 'Complex mechanical assemblies, full drone airframes, multi-part UAV systems, and engineering-grade components requiring FEA-informed wall and rib design.',
    includes: [
      'Unlimited revisions within scope',
      'Full source files (STEP, STL, OBJ)',
      'Structural advice included',
      'Timeline agreed per project',
    ],
  },
];

// ── Process steps ─────────────────────────────────────────────────────────────
const process = [
  { n: '01', title: 'Share Your Idea',   desc: 'Send us a sketch, photo, reference image, or just describe what you need. No CAD required.' },
  { n: '02', title: 'We Quote',          desc: 'We assess complexity and send a design quote and timeline. Fast — usually within 24 hours.' },
  { n: '03', title: 'Design & Preview',  desc: 'We model in 3D and share renders for your feedback. You see it before anything is printed.' },
  { n: '04', title: 'Revise & Finalise', desc: 'Adjust until it\'s exactly right. Your approval is required before we move to production.' },
  { n: '05', title: 'Print (Optional)',  desc: 'We can print the final design in-house, or deliver the STL files for you to print yourself.' },
];

// ── Gallery placeholder grid ───────────────────────────────────────────────────
const galleryItems = [
  { label: 'UAV Motor Mount',            aspect: 'tall' },
  { label: 'Electronics Enclosure',      aspect: 'wide' },
  { label: 'Drone Camera Gimbal',        aspect: 'square' },
  { label: 'Custom Bracket Assembly',    aspect: 'wide' },
  { label: 'Automotive Sensor Mount',    aspect: 'tall' },
  { label: 'RC Aircraft Landing Gear',   aspect: 'square' },
];

function GalleryPlaceholder({ label, aspect }) {
  const h = aspect === 'tall' ? 'h-72' : aspect === 'wide' ? 'h-44' : 'h-56';
  return (
    <div className={`relative ${h} bg-[#0e0e12] border border-white/8 overflow-hidden group`}>
      {/* Animated scan line */}
      <motion.div
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />
      {/* Corner accents */}
      <div className="absolute top-3 left-3 w-4 h-4 border-l border-t border-white/20" />
      <div className="absolute top-3 right-3 w-4 h-4 border-r border-t border-white/20" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-l border-b border-white/20" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-r border-b border-white/20" />
      {/* Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-px bg-white/15" />
        <p className="text-[11px] tracking-[0.4em] text-white/20 uppercase text-center px-4">{label}</p>
        <p className="text-[10px] tracking-[0.3em] text-white/12 uppercase">Photo coming soon</p>
        <div className="w-8 h-px bg-white/15" />
      </div>
      {/* Hover shimmer */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.02] transition-colors duration-300" />
    </div>
  );
}

export default function DesignPage() {
  useSEO({
    title: 'Custom 3D Design Service Bengaluru — UAV, Drone & Engineering Parts | Dr.PrinT',
    description: 'No CAD file? Dr.PrinT offers custom 3D modelling and design in Bengaluru. We design product housings, drone parts, figurines, scale models and brackets from your sketch or photo. Design from ₹500.',
    canonical: 'https://drprint.in/design',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      'name': 'Custom 3D Design Service',
      'description': '3D modelling and design service in Bengaluru. We create print-ready 3D models from sketches, photos, or descriptions. Design fee from ₹500.',
      'provider': {'@id': 'https://drprint.in/#business'},
      'areaServed': {'@type': 'Country', 'name': 'India'},
      'offers': [
        {'@type': 'Offer', 'name': 'Basic Design', 'price': '500', 'priceCurrency': 'INR', 'description': 'Simple single-body parts, holders, brackets'},
        {'@type': 'Offer', 'name': 'Standard Design', 'price': '1500', 'priceCurrency': 'INR', 'description': 'Multi-part assemblies, figurines, drone components'},
        {'@type': 'Offer', 'name': 'Premium Design', 'price': '4000', 'priceCurrency': 'INR', 'description': 'Complex organic models, character sculpts, large assemblies'},
      ],
    },
  });

  const [openTier, setOpenTier] = useState(1);

  return (
    <motion.div className="min-h-screen bg-black text-white"
      variants={pageVariants} initial="initial" animate="animate" exit="exit">

      {/* ── HERO ── */}
      <section className="pt-36 pb-24 px-6 relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none" />

        <div className="max-w-5xl mx-auto relative">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.p variants={staggerItem}
              className="text-[11px] tracking-[0.7em] text-white/35 uppercase mb-6">
              Custom 3D Design Service
            </motion.p>
            <motion.h1 variants={staggerItem}
              className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-8">
              Got an idea?<br />
              <span className="text-white/35">We'll engineer it.</span>
            </motion.h1>
            <motion.p variants={staggerItem}
              className="text-white/60 text-lg font-light max-w-xl leading-relaxed mb-10">
              Send us a sketch, a drawing, dimensions, or just a clear description — we model it in Fusion 360 or SolidWorks, validate it for printability, and can produce it in-house.
            </motion.p>
            <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-3">
              <a href="https://wa.me/919449214905?text=Hi%2C%20I%20have%20a%20custom%20design%20idea%20I%27d%20like%20to%20discuss"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 px-8 py-4 bg-white text-black text-[13px] font-black uppercase tracking-[0.18em] hover:bg-white/85 transition-all">
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Start on WhatsApp
              </a>
              <Link to="/contact"
                className="flex items-center justify-center px-8 py-4 border border-white/20 text-white/80 text-[13px] font-black uppercase tracking-[0.18em] hover:bg-white hover:text-black transition-all">
                Send a Brief
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── WHAT WE DESIGN ── */}
      <section className="py-20 px-6 bg-[#080808] border-t border-white/8">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-12">
            <p className="text-[11px] tracking-[0.55em] text-white/30 uppercase mb-3">Capabilities</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">What We Design</h2>
            <p className="text-white/50 text-sm font-light mt-2 max-w-lg">
              We design functional engineering parts — primarily for UAVs, drones, automotive, and electronics. If you have dimensions, a sketch, or a reference part, we can model it in Fusion 360 or SolidWorks.
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible"
            viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {capabilities.map((c, i) => (
              <motion.div key={i} variants={staggerItem}
                className="group relative border border-white/8 p-6 hover:border-white/22 transition-all duration-300 overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                {/* Hover left bar */}
                <motion.div className="absolute left-0 top-0 w-[2px] bg-white/30 pointer-events-none"
                  initial={{ height: 0 }} whileHover={{ height: '100%' }}
                  transition={{ duration: 0.3, ease: 'easeOut' }} />
                <span className="text-2xl text-white/20 mb-4 block group-hover:text-white/40 transition-colors">{c.icon}</span>
                <h3 className="font-black text-sm mb-2 leading-snug">{c.title}</h3>
                <p className="text-white/50 text-xs font-light leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section className="py-20 px-6 bg-black border-t border-white/8">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-12">
            <p className="text-[11px] tracking-[0.55em] text-white/30 uppercase mb-3">Design Work</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Our Design Gallery</h2>
            <p className="text-white/50 text-sm font-light mt-2 max-w-lg">
              Photos of our past design projects coming soon. In the meantime —{' '}
              <Link to="/projects" className="text-white/70 underline underline-offset-2 hover:text-white transition-colors">
                see our printed project gallery
              </Link>.
            </p>
          </motion.div>

          {/* Masonry-style grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {galleryItems.map((item, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible"
                viewport={{ once: true }} variants={fadeUp}>
                <GalleryPlaceholder label={item.label} aspect={item.aspect} />
              </motion.div>
            ))}
          </div>

          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center text-white/20 text-xs tracking-[0.4em] uppercase mt-8">
            Gallery photos will be updated as projects are completed
          </motion.p>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-20 px-6 bg-[#080808] border-t border-white/8">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-12">
            <p className="text-[11px] tracking-[0.55em] text-white/30 uppercase mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Design Service Rates</h2>
            <p className="text-white/50 text-sm font-light mt-2 max-w-lg">
              All design fees are separate from printing costs. Printing charges apply if you order prints from us.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tiers.map((t, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible"
                viewport={{ once: true }} variants={fadeUp}
                onClick={() => setOpenTier(i)}
                className={`relative border p-7 cursor-pointer transition-all duration-300 ${
                  openTier === i
                    ? 'border-white/45 bg-white/[0.055]'
                    : 'border-white/10 hover:border-white/22 bg-white/[0.018]'
                } ${t.highlight ? 'ring-1 ring-white/20' : ''}`}>
                {t.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1">
                    Most Popular
                  </div>
                )}
                <p className="text-[10px] tracking-[0.4em] text-white/35 uppercase mb-2">{t.tag}</p>
                <h3 className="text-xl font-black mb-1">{t.name}</h3>
                <p className="text-2xl font-black text-white mb-4">{t.price}</p>
                <p className="text-white/55 text-xs font-light leading-relaxed mb-5">{t.desc}</p>
                <AnimatePresence>
                  {openTier === i && (
                    <motion.ul initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
                      className="space-y-2 border-t border-white/10 pt-4 overflow-hidden">
                      {t.includes.map((inc, j) => (
                        <li key={j} className="flex items-center gap-2 text-xs text-white/60">
                          <span className="text-white/30">✓</span> {inc}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
                {openTier !== i && (
                  <p className="text-[10px] text-white/25 tracking-widest uppercase">Tap to see details</p>
                )}
              </motion.div>
            ))}
          </div>

          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-white/30 text-xs font-light text-center mt-6 leading-relaxed">
            Final pricing depends on complexity. We always quote before starting. No surprise charges.
          </motion.p>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className="py-20 px-6 bg-black border-t border-white/8">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-12">
            <p className="text-[11px] tracking-[0.55em] text-white/30 uppercase mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">From Idea to Object</h2>
          </motion.div>

          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-white/8 hidden md:block" />

            <div className="space-y-0">
              {process.map((step, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="flex gap-8 py-7 border-b border-white/6 last:border-0 group">
                  {/* Step number dot */}
                  <div className="relative shrink-0 w-12 hidden md:flex items-start justify-center pt-1">
                    <div className="w-3 h-3 rounded-full border border-white/25 bg-black group-hover:border-white/60 group-hover:bg-white/10 transition-all duration-300" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] tracking-[0.4em] text-white/25 uppercase md:hidden">{step.n}</span>
                      <h3 className="font-black text-base">{step.title}</h3>
                    </div>
                    <p className="text-white/50 text-sm font-light leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 bg-[#080808] border-t border-white/8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="border border-white/10 p-10 md:p-14 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)' }}>
            <p className="text-[11px] tracking-[0.6em] text-white/30 uppercase mb-4">Ready to Start?</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
              Let's design something.
            </h2>
            <p className="text-white/50 text-sm font-light max-w-md mx-auto leading-relaxed mb-10">
              Share your idea on WhatsApp or fill in our brief — we'll get back with a quote within 24 hours. No obligation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="https://wa.me/919449214905?text=Hi%2C%20I%20have%20a%20custom%20design%20idea%20I%27d%20like%20to%20discuss"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-10 py-4 bg-white text-black text-[13px] font-black uppercase tracking-[0.2em] hover:bg-white/85 transition-all">
                WhatsApp Us
              </a>
              <Link to="/contact"
                className="flex items-center justify-center px-10 py-4 border border-white/20 text-white/75 text-[13px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all">
                Send a Brief
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </motion.div>
  );
}
