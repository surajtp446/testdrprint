import { useSEO } from '@/hooks/useSEO.js';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fadeUp } from '@/data/animations.js';
import { materials as allMaterials } from '@/data/materials.js';
import MaterialMatch from '@/components/MaterialMatch.jsx';

const services = [
  {
    title: 'Rapid Prototyping',
    desc: 'Go from CAD file to physical part in 24–72 hours. We print functional prototypes for design validation, fit checks, and investor demos — using engineering-grade materials that behave like production parts.',
    detail: 'PLA, PETG, ASA, TPU, PA6-CF, PA12-CF',
    icon: '01',
  },
  {
    title: 'Functional Part Production',
    desc: 'Load-bearing brackets, enclosures, jigs, fixtures, and replacement components printed with dimensional accuracy of ±0.1mm. We match material to mechanical requirements — not just cost.',
    detail: 'Tolerance: ±0.1mm · Layer heights from 0.08mm',
    icon: '02',
  },
  {
    title: 'Small Batch Manufacturing',
    desc: 'Need 10–500 identical parts? Our calibrated Bambu Lab print farm delivers repeatable output with consistent quality across batches. No tooling costs, no MOQs.',
    detail: 'Consistent batch quality · No tooling required',
    icon: '03',
  },
  {
    title: 'Custom Display & Scale Models',
    desc: 'High-detail architectural models, engineering showcases, scale replicas, and display builds. We have built full-scale F1 car models, turbofan engine assemblies, and drone frames.',
    detail: 'See our Projects page for examples',
    icon: '04',
  },
  {
    title: 'Drone & UAV Components',
    desc: '3D printed motor mounts, camera brackets, landing gear, payload mechanisms, and aerodynamic shrouds for FPV, autonomous, and commercial drones. Lightweight, strong, fast turnaround.',
    detail: 'PA6-CF for structural · TPU for vibration dampening',
    icon: '05',
  },
  {
    title: 'Student & College Projects',
    desc: 'Affordable, high-quality prints for final year projects, competition builds, and lab models. We work with students from engineering colleges across Bengaluru and ship pan-India.',
    detail: 'Student-friendly pricing · Pan-India delivery',
    icon: '06',
  },
];

const faqs = [
  {
    q: 'What 3D printing technology does Dr.PrinT use?',
    a: 'We use FDM (Fused Deposition Modelling) on calibrated Bambu Lab printers. FDM is the most versatile and cost-effective 3D printing technology for functional prototypes, mechanical parts, and display models. We support layer heights from 0.08mm to 0.40mm depending on your quality and speed requirements.',
  },
  {
    q: 'What materials do you offer for 3D printing in Bangalore?',
    a: 'We offer nine engineering-grade materials: PLA (prototypes and display), PETG (functional parts), ASA (outdoor and UV-resistant), TPU (flexible gaskets and grips), PA6-CF (carbon fibre nylon for high-strength structural parts), PA12-CF (industrial-grade with chemical resistance), LW-PLA (lightweight foamed PLA for RC and drones), PETG-CF (carbon reinforced PETG for stiff functional parts), and ASA Aero (aerospace-grade UV-stable ASA). We also source specialty filaments on request.',
  },
  {
    q: 'How much does 3D printing cost in Bangalore?',
    a: 'Our pricing starts from ₹6 per gram for standard PLA prints. Final cost depends on material, print settings (infill, layer height, wall count), and part size. Upload your STL file or send us your requirements on WhatsApp and we will provide a free quote within 24 hours — no hidden charges.',
  },
  {
    q: 'How fast can you deliver 3D printed parts?',
    a: 'Standard turnaround is 2–5 days depending on part complexity and queue. Rush orders can be completed in 24–48 hours. We ship across India via courier and offer local pickup in Basavanagudi, Bengaluru.',
  },
  {
    q: 'Do you accept STL files for 3D printing?',
    a: 'Yes. We accept STL, STEP, OBJ, 3MF, and most CAD formats. If you only have a sketch or idea, we can help with basic modelling. Upload your files through our Custom Order page or send them on WhatsApp.',
  },
  {
    q: 'Can you do bulk or batch 3D printing orders?',
    a: 'Yes. We handle batch orders from 10 to 500+ parts. Our calibrated print farm ensures dimensional consistency across every unit. Batch pricing is available — contact us for a quote.',
  },
  {
    q: 'What is the maximum print size you support?',
    a: 'Our build volume is up to 256×256×256mm per part. For larger assemblies, we print multi-part builds designed for post-assembly. We have built models over 600mm long using multi-part assembly techniques.',
  },
  {
    q: 'Do you offer 3D printing services outside Bangalore?',
    a: 'Yes. While our studio is in Basavanagudi, Bengaluru, we ship 3D printed parts across India. Many of our clients are in Mumbai, Chennai, Hyderabad, Delhi, and Pune. Shipping is calculated at checkout.',
  },
];

const industries = [
  { name: 'Startups & Product Teams', desc: 'Rapid prototyping for MVPs and design validation' },
  { name: 'Engineering Colleges', desc: 'Final year projects, competition builds, lab models' },
  { name: 'Architecture Firms', desc: 'Scale models and site plan visualisations' },
  { name: 'Hardware Startups', desc: 'Functional enclosures, jigs, and pre-production parts' },
  { name: 'Aerospace & Defence', desc: 'Drone components, UAV brackets, structural parts' },
  { name: 'Automotive', desc: 'Replica parts, custom brackets, display models' },
  { name: 'Medical & Dental', desc: 'Anatomical models, surgical planning aids, device housings' },
  { name: 'Hobbyists & Makers', desc: 'Custom parts, cosplay props, scale replicas' },
];


const pageVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, x: -50, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};
export default function ServicesPage() {
  useSEO({
    title: '3D Printing Services in Bangalore — FDM & Resin Prototyping | Dr.PrinT',
    description: 'Professional 3D printing services in Bengaluru, Bangalore. FDM rapid prototyping, functional parts, drone UAV components, custom 3D design & batch production. PLA, PETG, ASA, TPU, PA6-CF, Carbon Fibre. Pricing from ₹6/gram. Free quote in 24 hours.',
    canonical: 'https://drprint.in/services',
  });

  const [openFaq, setOpenFaq] = useState(null);
  const [activeMat, setActiveMat] = useState(null);
  const [activeSvc, setActiveSvc] = useState(null);

  // Inject FAQ schema
  useEffect(() => {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'faq-schema';
    script.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    // Service schema
    const serviceSchema = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: '3D Printing Service',
      provider: {
        '@type': 'LocalBusiness',
        name: 'Dr.PrinT',
        url: 'https://drprint.in',
        telephone: '+91-9449214905',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Basavanagudi',
          addressLocality: 'Bengaluru',
          addressRegion: 'Karnataka',
          postalCode: '560004',
          addressCountry: 'IN',
        },
      },
      areaServed: [
        { '@type': 'City', name: 'Bengaluru' },
        { '@type': 'Country', name: 'India' },
      ],
      description: 'Professional FDM 3D printing services in Bangalore. Rapid prototyping, functional parts, drone components, and batch production.',
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: '6',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '6',
          priceCurrency: 'INR',
          unitText: 'gram',
        },
      },
    };
    const script2 = document.createElement('script');
    script2.type = 'application/ld+json';
    script2.id = 'service-schema';
    script2.textContent = JSON.stringify(serviceSchema);
    document.head.appendChild(script2);

    return () => {
      document.getElementById('faq-schema')?.remove();
      document.getElementById('service-schema')?.remove();
    };
  }, []);

  return (
    <motion.div className="min-h-screen bg-black text-white"
      variants={pageVariants} initial="initial" animate="animate" exit="exit">

      {/* ── HERO ── */}
      <section className="pt-36 pb-20 px-6 bg-black">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <p className="text-sm tracking-[0.5em] text-white/65 uppercase mb-4">3D Printing Services</p>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
              Professional 3D Printing<br className="hidden md:block" /> Services in Bangalore
            </h1>
            <p className="text-white/70 text-base md:text-lg font-light max-w-2xl leading-relaxed mb-3">
              Precision FDM 3D printing from our studio in Basavanagudi, Bengaluru. Rapid prototyping, functional parts, drone components, and batch production — in PLA, PETG, ASA, TPU, and carbon fibre nylon.
            </p>
            <p className="text-white/55 text-sm font-light mb-8">
              Transparent pricing from ₹6/gram · Turnaround 2–5 days · Shipping across India
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="/calculator"
                className="px-8 py-3.5 bg-white text-black text-[13px] font-black uppercase tracking-[0.18em] hover:bg-white/85 transition-all text-center">
                Get a Free Quote
              </a>
              <Link to="/projects"
                className="px-8 py-3.5 border border-white/25 text-white/80 text-[13px] font-black uppercase tracking-[0.18em] hover:bg-white hover:text-black transition-all text-center">
                View Our Work
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SERVICES GRID ── */}
      <section className="py-20 px-6 bg-[#080808] border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-14">
            <p className="text-sm tracking-[0.45em] text-white/62 uppercase mb-3">What We Do</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Our 3D Printing Services</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, i) => {
              const isOpen = activeSvc === i;
              return (
                <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                  onClick={() => setActiveSvc(isOpen ? null : i)}
                  className={`border p-7 cursor-pointer transition-all duration-300 group ${
                    isOpen
                      ? 'border-white/40 bg-white/[0.05]'
                      : 'border-white/12 hover:border-white/22 hover:bg-white/[0.02]'
                  }`}>
                  <div className="flex items-start justify-between mb-4">
                    <span className={`text-4xl font-black transition-colors duration-300 ${isOpen ? 'text-white/55' : 'text-white/18'}`}>
                      {s.icon}
                    </span>
                    <span className={`text-white/30 text-lg transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>+</span>
                  </div>
                  <h3 className="text-lg font-black mb-3">{s.title}</h3>
                  <p className="text-white/65 text-sm font-light leading-relaxed mb-4">{s.desc}</p>
                  <motion.div
                    initial={false}
                    animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="text-[12px] text-white/55 border-t border-white/10 pt-3 pb-1">{s.detail}</p>
                  </motion.div>
                  {!isOpen && (
                    <p className="text-[11px] text-white/25 tracking-widest uppercase mt-2 group-hover:text-white/45 transition-colors">
                      Tap to expand
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── MATERIALS — interactive expandable cards ── */}
      <section className="py-16 px-6 bg-black border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-10">
            <p className="text-sm tracking-[0.45em] text-white/62 uppercase mb-3">Materials</p>
            <h2 className="text-3xl font-black tracking-tight">9 Engineering-Grade Materials</h2>
            <p className="text-white/60 text-sm font-light mt-2 max-w-lg">
              Click any material to see full specs. We match material to mechanical requirements — not just cost.
            </p>
          </motion.div>

          {/* Pill selector row */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="flex flex-wrap gap-2 mb-6">
            {allMaterials.filter(m => m.value !== 'custom').map((m, i) => (
              <button
                key={i}
                onClick={() => setActiveMat(activeMat === m.value ? null : m.value)}
                className={`px-4 py-2 text-[12px] font-black uppercase tracking-widest border transition-all duration-200 ${
                  activeMat === m.value
                    ? 'bg-white text-black border-white'
                    : 'border-white/15 text-white/60 hover:border-white/35 hover:text-white/90'
                }`}
              >
                {m.name}
              </button>
            ))}
            {activeMat && (
              <button
                onClick={() => setActiveMat(null)}
                className="px-3 py-2 text-[11px] text-white/35 hover:text-white/65 transition-colors"
              >
                ✕ clear
              </button>
            )}
          </motion.div>

          {/* Cards grid — all visible, active one expands */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {allMaterials.filter(m => m.value !== 'custom').map((m, i) => {
              const isActive = activeMat === m.value;
              const isDimmed = activeMat && !isActive;
              return (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  onClick={() => setActiveMat(isActive ? null : m.value)}
                  className={`border cursor-pointer transition-all duration-300 overflow-hidden ${
                    isActive
                      ? 'border-white/55 bg-white/[0.06] lg:col-span-2 row-span-2'
                      : isDimmed
                      ? 'border-white/6 opacity-40 hover:opacity-70'
                      : 'border-white/10 hover:border-white/28 hover:bg-white/[0.025]'
                  }`}
                  style={{ background: isActive ? m.color : undefined }}
                >
                  {/* Collapsed view */}
                  <div className="p-4 text-center">
                    <p className={`font-black mb-1 transition-all ${isActive ? 'text-lg' : 'text-base'}`}>{m.name}</p>
                    <p className="text-[11px] text-white/50 uppercase tracking-wider">{m.tag}</p>
                    {!isActive && (
                      <p className="text-[11px] text-white/40 mt-1">{m.tg}</p>
                    )}
                  </div>

                  {/* Expanded content */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="px-4 pb-5 text-left"
                    >
                      <div className="border-t border-white/10 pt-4 space-y-3">
                        <div>
                          <p className="text-[10px] tracking-[0.35em] text-white/40 uppercase mb-0.5">Glass Temp · Tensile</p>
                          <p className="text-sm text-white/80 font-light">{m.tg} · {m.tensile.split('/')[0].trim()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] tracking-[0.35em] text-white/40 uppercase mb-0.5">Best For</p>
                          <p className="text-sm text-white/80 font-light">{m.best}</p>
                        </div>
                        <div>
                          <p className="text-[10px] tracking-[0.35em] text-white/40 uppercase mb-0.5">Why Use It</p>
                          <p className="text-sm text-white/75 font-light leading-relaxed">{m.desc}</p>
                        </div>
                        {m.avoid && (
                          <div>
                            <p className="text-[10px] tracking-[0.35em] text-white/40 uppercase mb-0.5">Avoid If</p>
                            <p className="text-sm text-white/60 font-light">{m.avoid}</p>
                          </div>
                        )}
                        {m.pricePerGram && (
                          <p className="text-white font-black text-sm pt-1">From ₹{m.pricePerGram}/gram</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── INDUSTRIES WE SERVE ── */}
      <section className="py-20 px-6 bg-[#080808] border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-12">
            <p className="text-sm tracking-[0.45em] text-white/62 uppercase mb-3">Industries</p>
            <h2 className="text-3xl font-black tracking-tight">Who Uses Our 3D Printing Services</h2>
            <p className="text-white/60 text-sm font-light mt-2 max-w-lg">We work with startups, engineering teams, students, architects, and defence contractors across Bangalore and India.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {industries.map((ind, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="relative border border-white/10 px-5 py-5 hover:border-white/25 hover:bg-white/[0.025] transition-all duration-300 overflow-hidden group cursor-default">
                {/* left border sweep on hover */}
                <motion.div
                  className="absolute left-0 top-0 w-[2px] bg-white/40 pointer-events-none"
                  initial={{ height: 0 }}
                  whileHover={{ height: '100%' }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
                <p className="font-black text-sm mb-1.5 pl-3 group-hover:text-white transition-colors">{ind.name}</p>
                <p className="text-white/55 text-[13px] font-light pl-3 leading-relaxed">{ind.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY DR.PRINT ── */}
      <section className="py-20 px-6 bg-black border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-12">
            <p className="text-sm tracking-[0.45em] text-white/62 uppercase mb-3">Why Dr.PrinT</p>
            <h2 className="text-3xl font-black tracking-tight">Why Choose Dr.PrinT for 3D Printing in Bangalore</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { t: 'Calibrated Bambu Lab Hardware', d: 'Professionally maintained printers tuned for dimensional accuracy of ±0.1mm. No consumer-grade guesswork.' },
              { t: 'Transparent Pricing', d: 'Clear per-gram pricing from ₹6/gram. No hidden costs, no surprise fees. You know exactly what you are paying before we print.' },
              { t: 'Fast Turnaround', d: 'Standard 2–5 day delivery. Rush orders in 24–48 hours. We ship across India or you can pick up from Basavanagudi, Bengaluru.' },
              { t: 'Material Expertise', d: '9 engineering-grade materials matched to your application. We advise on material selection for strength, heat resistance, and flexibility — free of charge.' },
              { t: 'File Review & Optimisation', d: 'Every file undergoes orientation review, support strategy, and slicing optimisation before printing. We catch issues before they cost you.' },
              { t: 'Real Project Experience', d: 'From India\'s fastest FPV drone (329 km/h) to full-scale F1 models and robotic arms — we have printed and delivered real engineering builds.' },
            ].map((item, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="flex gap-4 p-5 border border-white/10 hover:border-white/18 transition-all">
                <span className="text-white/25 text-2xl font-black shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="font-bold text-sm mb-1.5">{item.t}</h3>
                  <p className="text-white/65 text-sm font-light leading-relaxed">{item.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING CTA ── */}
      <section className="py-16 px-6 bg-[#080808] border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="border border-white/12 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 bg-white/[0.01]">
            <div>
              <p className="text-sm tracking-[0.45em] text-white/62 uppercase mb-2">Pricing</p>
              <h2 className="text-2xl font-black tracking-tight mb-2">Get an Instant Price Estimate</h2>
              <p className="text-white/60 text-sm font-light max-w-md leading-relaxed">
                Upload your STL or OBJ file — our calculator parses the geometry, shows a 3D preview, and gives you a price breakdown in seconds. No signup required.
              </p>
            </div>
            <a href="/calculator"
              className="shrink-0 px-8 py-4 bg-white text-black text-[13px] font-black uppercase tracking-[0.18em] hover:bg-white/85 transition-all">
              Open Calculator →
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── INTERACTIVE MATERIAL MATCH ── */}
      <MaterialMatch />

      {/* ── FAQ SECTION ── */}
      <section className="py-20 px-6 bg-[#080808] border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-12">
            <p className="text-sm tracking-[0.45em] text-white/62 uppercase mb-3">FAQ</p>
            <h2 className="text-3xl font-black tracking-tight">Frequently Asked Questions</h2>
            <p className="text-white/60 text-sm font-light mt-2">Everything you need to know about our 3D printing services in Bangalore.</p>
          </motion.div>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="border border-white/10 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-bold text-sm pr-4">{faq.q}</span>
                  <span className="text-white/50 text-xl shrink-0">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-white/70 text-sm font-light leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 bg-black border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Ready to get started?</h2>
            <p className="text-white/65 text-sm font-light max-w-md mx-auto mb-8 leading-relaxed">
              Upload your STL file and get a free quote within 24 hours. Or WhatsApp us directly — we reply in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/calculator"
                className="px-10 py-4 bg-white text-black text-[13px] font-black uppercase tracking-[0.2em] hover:bg-white/85 transition-all">
                Upload Your File
              </a>
              <a href="https://wa.me/919449214905?text=Hi%2C%20I%20need%20a%20quote%20for%203D%20printing" target="_blank" rel="noopener noreferrer"
                className="px-10 py-4 border border-white/20 text-white/80 text-[13px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all">
                WhatsApp Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
