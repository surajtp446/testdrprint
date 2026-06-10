import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CommercialProductionSection = () => {
  return (
    <section className="py-24 px-6 bg-black">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #161616 0%, #111 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Decorative corner lines */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-white/10" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-white/10" />

          <div className="px-6 py-12 md:px-20 md:py-20 text-center">
            <p className="text-white/65 text-sm uppercase tracking-[0.4em] mb-6">For Business</p>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
              Commercial & Production Support
            </h2>
            <p className="text-white/55 text-lg mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              We collaborate with startups, engineering teams, and small businesses to deliver reliable prototypes and production-ready components. Every commercial project is handled with the same precision and confidentiality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="px-10 py-4 bg-white text-black text-sm font-bold uppercase tracking-widest hover:bg-white/90 transition-all duration-300"
              >
                Request Industrial Quote
              </Link>
              <a
                href="/calculator"
                className="px-10 py-4 border border-white/30 text-white text-sm font-bold uppercase tracking-widest hover:border-white hover:bg-white/5 transition-all duration-300"
              >
                Custom Fabrication
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CommercialProductionSection;
