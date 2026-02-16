import { Link } from "react-router-dom";
import { MapPin, Phone, Clock } from "lucide-react";

const TikTokIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#05100D] border-t border-white/5" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_chezloman/artifacts/dn3n27hs_Design%20sans%20titre.png" 
              alt="Chez Loman" 
              className="h-12 w-12 object-cover rounded-full border-2 border-[#D4AF37]/30"
            />
            <div>
              <h3 className="text-[#F9F7F2] font-semibold text-sm">Chez Loman</h3>
              <p className="text-[#D4AF37] text-[10px] uppercase tracking-wider">Cuisine Ivoirienne</p>
            </div>
            <div className="flex items-center gap-2 ml-3">
              <a 
                href="https://www.facebook.com/profile.php?id=61574715038273" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#1A4D3E] flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0F2E24] transition-all duration-300"
                data-testid="footer-facebook-link"
              >
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="https://www.tiktok.com/@lomanschadrac?lang=fr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#1A4D3E] flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0F2E24] transition-all duration-300"
                data-testid="footer-tiktok-link"
              >
                <TikTokIcon size={14} />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#D4AF37] flex-shrink-0" />
              <span className="text-[#A3B1AD] text-xs">Yopougon Abobo Doumé, Basile Boli, Abidjan</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-[#D4AF37] flex-shrink-0" />
              <a href="tel:+2250709508819" className="text-[#A3B1AD] hover:text-[#F9F7F2] text-xs transition-colors">
                +225 07 09 508 819
              </a>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock size={14} className="text-[#D4AF37] mt-0.5 flex-shrink-0" />
            <div className="text-[#A3B1AD] text-xs space-y-0.5">
              <p>Mar – Sam: 11h – 22h</p>
              <p>Dim: 13h – 22h</p>
              <p className="text-[#E74C3C]">Lundi: Fermé</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5">
          <div className="flex flex-wrap justify-center gap-5 mb-4">
            {[
              { path: "/", label: "Accueil" },
              { path: "/menu", label: "La Carte" },
              { path: "/about", label: "Notre Histoire" },
              { path: "/gallery", label: "Galerie" },
              { path: "/contact", label: "Contact" },
              { path: "/admin", label: "Admin" },
            ].map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className="text-[#A3B1AD]/70 hover:text-[#D4AF37] transition-colors duration-300 text-xs"
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-[#A3B1AD]/50 text-[10px] tracking-wide">
              © {currentYear} Chez Loman • Cuisine Ivoirienne Premium • Yopougon, Abidjan
            </p>
            <p className="text-[#A3B1AD]/40 text-[10px] tracking-wider">
              Powered by <span className="text-[#D4AF37]/60 font-medium">AI'vory</span> / <span className="text-[#A3B1AD]/60">Armando Anzan</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
