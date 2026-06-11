import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsMobileMenuOpen(false); }, [location]);

  const navLinks = [
    { name: 'Home',     path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Projects', path: '/projects' },
    { name: 'Shop',     path: '/shop' },
    { name: 'Design',   path: '/design' },
    { name: 'About',    path: '/about' },
    { name: 'Contact',  path: '/contact' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/90 border-b border-white/10 backdrop-blur-md py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-8 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3">
          <img
            src="/favicon.png"
            alt="Dr.PrinT"
            className="h-9 w-9 object-contain rounded"
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
          <span className="text-white font-black text-xl tracking-tight leading-none">
            Dr.<span className="text-white/80">PrinT</span>
          </span>
        </NavLink>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <NavLink key={link.name} to={link.path}
              className={({ isActive }) =>
                `nav-underline text-sm font-medium tracking-wide transition-all duration-300 hover:text-white ${
                  isActive ? 'text-white active' : 'text-white/70'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Mobile */}
        <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-black/95 border-b border-white/10 backdrop-blur-xl"
        >
          <nav className="flex flex-col p-8 gap-6">
            {navLinks.map((link) => (
              <NavLink key={link.name} to={link.path}
                className={({ isActive }) =>
                  `text-lg font-medium transition-colors ${isActive ? 'text-white' : 'text-white/60'}`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;
