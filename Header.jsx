import React from 'react';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon.jsx';

const WA = 'https://wa.me/919449214905?text=Hi%2C%20I%20have%20a%20query%20about%20Dr.PrinT';

export default function Footer() {
  return (
    <footer style={{background:"#080808",borderTop:"1px solid rgba(255,255,255,0.12)",paddingTop:32,paddingBottom:20,paddingLeft:24,paddingRight:24}}>
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">

          {/* Brand */}
          <div>
            <h3 className="text-xl font-black text-white mb-1 tracking-tighter">Dr.PrinT</h3>
            <p className="text-white/70 text-sm uppercase tracking-widest mb-3 font-medium">
              Precision 3D Printing
            </p>
            <p className="text-white/70 text-sm font-light leading-relaxed">
              Based in Basavanagudi, Bengaluru.<br />Open to B2B and production work.
            </p>
          </div>

          {/* Quick Actions */}
          <div>
            <h4 className="text-sm font-black text-white/75 uppercase tracking-widest mb-4">Quick Actions</h4>
            <div className="flex flex-col gap-3">
              <a href={WA} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors text-sm font-medium">
                <WhatsAppIcon size={14} className="shrink-0" /> WhatsApp — Get a Quote
              </a>
              <Link to="/shop" className="text-white/70 hover:text-white transition-colors text-sm font-light">→ Browse the Shop</Link>
              <a href="/calculator" className="text-white/70 hover:text-white transition-colors text-sm font-light">→ Submit a Custom Print</a>
              <Link to="/projects" className="text-white/70 hover:text-white transition-colors text-sm font-light">→ View Our Projects</Link>
              <Link to="/design" className="text-white/70 hover:text-white transition-colors text-sm font-light">→ Custom Design Service</Link>
              <Link to="/contact" className="text-white/70 hover:text-white transition-colors text-sm font-light">→ Start a Project</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-black text-white/75 uppercase tracking-widest mb-4">Contact</h4>
            <div className="flex flex-col gap-3">
              <a href="mailto:drprint.3dwork@gmail.com"
                className="flex items-center gap-2.5 text-white/70 hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="text-sm">drprint.3dwork@gmail.com</span>
              </a>
              <a href="tel:+919449214905"
                className="flex items-center gap-2.5 text-white/70 hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span className="text-sm">+91 94492 14905</span>
              </a>
              <a href="tel:+918904203914"
                className="flex items-center gap-2.5 text-white/70 hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span className="text-sm">+91 89042 03914</span>
              </a>
              <a href="https://www.instagram.com/dr.print_3d/" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-white/70 hover:text-white transition-colors">
                <Instagram className="w-3.5 h-3.5 shrink-0" />
                <span className="text-sm">@dr.print_3d</span>
              </a>
              <div className="flex items-start gap-2.5 text-white/60">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span className="text-sm">Basavanagudi, Bengaluru</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/12 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/55 text-sm">&copy; {new Date().getFullYear()} Dr.PrinT. All rights reserved.</p>
          <p className="text-white/40 text-sm">Bengaluru, India</p>
        </div>
      </div>
    </footer>
  );
}
