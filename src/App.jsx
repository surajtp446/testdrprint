import React, { useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import ScrollProgress from '@/components/ScrollProgress.jsx';
import NozzleCursor from '@/components/NozzleCursor.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import FloatingWhatsApp from '@/components/FloatingWhatsApp.jsx';
import FilamentThread from '@/components/FilamentThread.jsx';
import RouteShutter from '@/components/RouteShutter.jsx';

import HomePage      from '@/pages/HomePage.jsx';
import ProjectsPage  from '@/pages/ProjectsPage.jsx';
import ShopPage      from '@/pages/ShopPage.jsx';
import AboutPage     from '@/pages/AboutPage.jsx';
import ContactPage   from '@/pages/ContactPage.jsx';
import PaymentPage   from '@/pages/PaymentPage.jsx';
import ServicesPage  from '@/pages/ServicesPage.jsx';
import DesignPage    from '@/pages/DesignPage.jsx';

function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="text-sm tracking-[0.5em] text-white/65 uppercase mb-4">404</p>
        <h1 className="text-4xl font-black tracking-tight mb-4">Page Not Found</h1>
        <p className="text-white/70 text-sm font-light mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="inline-block px-8 py-3 bg-white text-black text-[13px] font-black uppercase tracking-[0.18em] hover:bg-white/85 transition-all">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

function LenisScroll() {
  useEffect(() => {
    let lenis, raf;
    async function init() {
      try {
        const { default: Lenis } = await import('lenis');
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        lenis = new Lenis({
          duration: 1.45,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          wheelMultiplier: 0.95,
          touchMultiplier: 1.5,
        });
        window.__lenis = lenis;
        const animate = (time) => { lenis.raf(time); raf = requestAnimationFrame(animate); };
        raf = requestAnimationFrame(animate);
      } catch(e) {}
    }
    init();
    return () => { cancelAnimationFrame(raf); lenis?.destroy(); };
  }, []);
  return null;
}

function App() {
  const location = useLocation();
  return (
    <>
      <LenisScroll />
      <ScrollToTop />
      <ScrollProgress />
      <RouteShutter />
      <FilamentThread />
      <NozzleCursor />
      <Header />
      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/"         element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/shop"     element={<ShopPage />} />
            <Route path="/about"    element={<AboutPage />} />
            <Route path="/contact"  element={<ContactPage />} />
            <Route path="/payment"  element={<PaymentPage />} />
            <Route path="/design"   element={<DesignPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <FloatingWhatsApp />
      <Toaster />
    </>
  );
}

export default App;
