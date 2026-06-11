import { submitToAppsScript } from '@/config/submitForm.js';
import { useSEO } from '@/hooks/useSEO.js';
import StudioStatus from '@/components/StudioStatus.jsx';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, ArrowRight } from 'lucide-react';

// WhatsApp number — replace with full international format (no + or spaces)
const WA_NUMBER = '919449214905';
const WA_EMAIL  = 'drprint.3dwork@gmail.com';

function buildWaMessage(data) {
  return encodeURIComponent(
    `Hi Dr.PrinT!\n\nName: ${data.name}\nEmail: ${data.email}\nProject Type: ${data.projectType}\nMaterial: ${data.material}\n\n${data.description}`
  );
}

const pageVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, x: -50, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

const ContactPage = () => {
  useSEO({
    title: 'Contact Dr.PrinT — Get a Free 3D Printing Quote in Bengaluru',
    description: 'Contact Dr.PrinT for a free 3D printing quote in Bengaluru. Send your STL file or project description — we reply within 24 hours. WhatsApp: +91 94492 14905.',
    canonical: 'https://drprint.in/contact',
  });

  const [formData, setFormData] = useState({
    name: '', email: '', projectType: 'Prototype', material: 'PLA', description: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [emailErr, setEmailErr]   = useState('');
  const [honeypot, setHoneypot]   = useState(''); // bot trap

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'email') setEmailErr('');
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (honeypot) return; // bot trap
    if (!validateEmail(formData.email)) {
      setEmailErr('Please enter a valid email address.');
      return;
    }
    try {
      // fire-and-forget — throws only on rate-limit, never on network
      submitToAppsScript({
        type:         'contact',
        name:         formData.name,
        email:        formData.email,
        project_type: formData.projectType,
        material:     formData.material,
        description:  formData.description,
      });
    } catch (err) {
      // Only rate-limit errors reach here
      setEmailErr(err.message || 'Please wait before submitting again.');
      return;
    }
    // Also open WhatsApp with prefilled message
    const url = `https://wa.me/${WA_NUMBER}?text=${buildWaMessage(formData)}`;
    window.open(url, '_blank');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setFormData({ name: '', email: '', projectType: 'Prototype', material: 'PLA', description: '' });
  };

  const inputClass = "w-full bg-[#0e0e0e] border border-white/10 px-4 py-3.5 text-white text-sm font-light focus:outline-none focus:border-white/35 hover:border-white/18 transition-colors placeholder:text-white/58";

  return (
    <motion.div className="min-h-screen bg-black pt-28 pb-20 px-8 font-poppins"
      variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="container mx-auto max-w-5xl">

        <motion.div initial={{ opacity: 0, y: -18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.3 }} transition={{ duration: 0.7 }} className="mb-14">
          <p className="text-white/65 text-sm uppercase tracking-[0.45em] mb-4">Get In Touch</p>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">Start Your Project</h1>
          <p className="text-white/70 font-light max-w-md text-sm leading-relaxed">
            Fill in the form and it will open WhatsApp directly so you can send your request. We reply within a few hours.
          </p>
        </motion.div>

        {/* Live studio status + tap-to-copy contact */}
        <StudioStatus />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-14">

          {/* Form — takes 3 cols */}
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.7 }} className="lg:col-span-3">
            {submitted && (
              <div className="mb-6 px-5 py-4 border border-green-500/30 bg-green-500/05 text-green-400 text-sm font-light">
                WhatsApp opened with your message. We will reply shortly.
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-white/65 text-[12px] uppercase tracking-[0.3em] mb-2">Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required
                    placeholder="Your name" className={inputClass} />
                </div>
                <div>
                  <label className="block text-white/65 text-[12px] uppercase tracking-[0.3em] mb-2">Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required
                    placeholder="you@email.com" className={`${inputClass} ${emailErr ? 'border-red-500/50' : ''}`} />
                  {emailErr && <p className="text-red-400 text-sm mt-1">{emailErr}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-white/65 text-[12px] uppercase tracking-[0.3em] mb-2">Project Type</label>
                  <select name="projectType" value={formData.projectType} onChange={handleChange} className={inputClass}>
                    <option value="Prototype">Prototype</option>
                    <option value="Production Run">Production Run</option>
                    <option value="Custom Build">Custom Build</option>
                    <option value="Industrial / B2B">Industrial / B2B</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/65 text-[12px] uppercase tracking-[0.3em] mb-2">Material</label>
                  <select name="material" value={formData.material} onChange={handleChange} className={inputClass}>
                    <option value="PLA">PLA</option>
                    <option value="PETG">PETG</option>
                    <option value="ASA">ASA</option>
                    <option value="TPU">TPU</option>
                    <option value="PA6-CF">PA6-CF</option>
                    <option value="PA12-CF">PA12-CF</option>
                    <option value="Not sure">Not sure — advise me</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/65 text-[12px] uppercase tracking-[0.3em] mb-2">Project Description *</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required rows={5}
                  placeholder="Tell us what you need — dimensions, use case, quantity, deadline, colour preference..."
                  className={inputClass + " resize-none"} />
              </div>

              {/* Honeypot — hidden from real users, bots fill it */}
              <div style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }} aria-hidden="true">
                <input type="text" name="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} />
              </div>

              <button type="submit" disabled={!formData.name || !formData.email || !formData.description}
                className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.18em] text-[13px] hover:bg-white/88 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Send via WhatsApp
              </button>
              <p className="text-white/55 text-sm text-center">Tapping this opens WhatsApp with your message pre-filled. No account needed on our end.</p>
            </form>
          </motion.div>

          {/* Contact info — 2 cols */}
          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.7 }} className="lg:col-span-2 space-y-8">

            {/* Direct contact card */}
            <div className="p-7 border border-white/15 bg-white/[0.015]">
              <p className="text-[12px] uppercase tracking-[0.35em] text-white/62 mb-4">Direct Contact</p>
              <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 group mb-5">
                <div className="w-9 h-9 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-green-500/40 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.45)">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] text-white/62 uppercase tracking-widest mb-0.5">WhatsApp</p>
                  <p className="text-sm text-white/65 group-hover:text-white transition-colors">+91 94492 14905</p>
                </div>
              </a>
              <a href="tel:+918904203914"
                className="flex items-center gap-3 group mb-5">
                <div className="w-9 h-9 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-white/30 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.35 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.59a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] text-white/62 uppercase tracking-widest mb-0.5">Alternate</p>
                  <p className="text-sm text-white/65 group-hover:text-white transition-colors">+91 89042 03914</p>
                </div>
              </a>

              <a href={`mailto:${WA_EMAIL}`}
                className="flex items-center gap-3 group">
                <div className="w-9 h-9 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-white/25 transition-colors">
                  <Mail size={14} className="text-white/72" />
                </div>
                <div>
                  <p className="text-[13px] text-white/62 uppercase tracking-widest mb-0.5">Email</p>
                  <p className="text-sm text-white/65 group-hover:text-white transition-colors">{WA_EMAIL}</p>
                </div>
              </a>
            </div>

            {/* Location */}
            <div className="pl-5 border-l border-white/15 space-y-5">
              <div>
                <p className="text-[13px] uppercase tracking-[0.35em] text-white/60 mb-2">Location</p>
                <div className="flex items-center gap-2 text-white/55 text-sm">
                  <MapPin size={13} className="text-white/65 shrink-0" />
                  Basavanagudi, Bengaluru, India
                </div>
              </div>
              <div>
                <p className="text-[13px] uppercase tracking-[0.35em] text-white/60 mb-2">Response Time</p>
                <p className="text-white/78 text-sm">Usually within a few hours on WhatsApp. Email replies within 24 hours.</p>
              </div>
              <div>
                <p className="text-[13px] uppercase tracking-[0.35em] text-white/60 mb-2">Instagram</p>
                <a href="https://www.instagram.com/dr.print_3d/" target="_blank" rel="noopener noreferrer"
                  className="text-white/75 text-sm hover:text-white transition-colors">@dr.print_3d</a>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ContactPage;
