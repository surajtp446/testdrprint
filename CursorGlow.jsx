import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon.jsx';

const WA_NUMBER = '919449214905';

const quickMessages = [
  { label: 'Get a Quote', msg: 'Hi, I need a quote for 3D printing. Here are my requirements:' },
  { label: 'Custom Print', msg: 'Hi, I want to place a custom 3D print order.' },
  { label: 'Ask a Question', msg: 'Hi, I have a question about your 3D printing services.' },
];

export default function FloatingWhatsApp() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {/* Quick message popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-[#111] border border-white/15 shadow-2xl w-72 overflow-hidden"
          >
            <div className="bg-[#075e54] px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <WhatsAppIcon size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Dr.PrinT</p>
                <p className="text-white/75 text-[12px]">Usually replies in minutes</p>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <p className="text-white/60 text-[12px] uppercase tracking-wider mb-3">Quick Message</p>
              {quickMessages.map((qm, i) => (
                <a
                  key={i}
                  href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(qm.msg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-left px-4 py-3 bg-white/[0.04] border border-white/10 text-sm text-white/80 hover:bg-white/[0.08] hover:border-white/20 transition-all"
                >
                  {qm.label}
                </a>
              ))}
              <a
                href={`https://wa.me/${WA_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center mt-2 text-[12px] text-white/50 hover:text-white/70 transition-colors py-2"
              >
                or type your own message →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Chat on WhatsApp"
        className="group relative"
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />

        <div className="relative w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg shadow-green-900/30 hover:bg-[#20bd5a] transition-colors">
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <WhatsAppIcon size={26} className="text-white" />
          )}
        </div>

        {/* Tooltip on desktop */}
        {!open && (
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white text-black text-[12px] font-bold px-3 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity hidden md:block shadow-lg">
            Chat with us
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-white" />
          </div>
        )}
      </button>
    </div>
  );
}
