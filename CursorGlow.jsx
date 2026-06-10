import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * SEO-rich, visible (crawlable) keyword band.
 * Surfaces location + audience terms in real DOM text so Google
 * indexes them beyond the noscript fallback.
 */
const AUDIENCE = [
  'Hardware Startups', 'Engineering Students', 'Architecture Firms',
  'Drone & FPV Builders', 'Automotive Workshops', 'Aerospace & Defence',
  'Medical & Dental', 'Product Designers', 'Robotics Teams', 'Makers & Hobbyists',
];

const AREAS = [
  'Basavanagudi', 'Jayanagar', 'JP Nagar', 'BTM Layout', 'Koramangala',
  'Electronic City', 'Whitefield', 'Indiranagar', 'HSR Layout', 'Rajajinagar',
  'Bengaluru', 'Karnataka', 'Pan-India Shipping',
];

export default function ServingBand() {
  return (
    <section className="py-20 px-6 bg-[#060606] border-t border-white/10">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-14">
          {/* Who we serve */}
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="text-[11px] tracking-[0.5em] text-white/40 uppercase mb-4">Who We Serve</p>
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-6 leading-tight">
              The 3D printing partner for Bengaluru’s builders.
            </h3>
            <p className="text-sm text-white/55 font-light leading-relaxed mb-7">
              From hardware startups raising their first round to engineering students
              shipping final-year projects — Dr.PrinT delivers fast, affordable, accurate
              3D printing across Bengaluru, Karnataka and all of India.
            </p>
            <div className="flex flex-wrap gap-2">
              {AUDIENCE.map((a) => (
                <span key={a}
                  className="text-[11px] tracking-wide text-white/55 border border-white/12 px-3 py-1.5 hover:border-white/30 hover:text-white/80 transition-colors">
                  {a}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Where we deliver */}
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.12 }}>
            <p className="text-[11px] tracking-[0.5em] text-white/40 uppercase mb-4">Where We Deliver</p>
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-6 leading-tight">
              3D printing near you — across Bangalore & beyond.
            </h3>
            <p className="text-sm text-white/55 font-light leading-relaxed mb-7">
              Same-week local handover anywhere in Bengaluru and fast courier
              dispatch to every state in India. Wherever your idea is, we get the
              part to you.
            </p>
            <div className="flex flex-wrap gap-2">
              {AREAS.map((a) => (
                <span key={a}
                  className="text-[11px] tracking-wide text-white/55 border border-white/12 px-3 py-1.5 hover:border-white/30 hover:text-white/80 transition-colors">
                  {a}
                </span>
              ))}
            </div>
            <Link to="/contact"
              className="mt-8 inline-block text-[11px] font-black uppercase tracking-[0.25em] text-white/70 border border-white/15 px-7 py-3 hover:bg-white hover:text-black transition-all duration-300">
              Start Your Order →
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
