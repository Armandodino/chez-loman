import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, Sun, Moon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { path: "/", label: "Accueil" },
    { path: "/menu", label: "La Carte" },
    { path: "/about", label: "Notre Histoire" },
    { path: "/gallery", label: "Galerie" },
    { path: "/contact", label: "Contact" },
    { path: "/admin", label: "Admin" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? "py-3 nav-luxury shadow-2xl" 
          : "py-6 bg-transparent"
      }`}
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="relative z-10" data-testid="logo-link">
            <img 
              src="https://customer-assets.emergentagent.com/job_chezloman/artifacts/dn3n27hs_Design%20sans%20titre.png" 
              alt="Chez Loman" 
              className="h-16 w-16 object-cover rounded-full border-2 border-[#D4AF37]/30"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link text-sm font-medium tracking-wide uppercase ${
                  isActive(link.path) ? "active text-[#D4AF37]" : ""
                }`}
                data-testid={`nav-${link.label.toLowerCase().replace(" ", "-")}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full transition-all duration-300 hover:bg-[#D4AF37]/20 text-[#A3B1AD] hover:text-[#D4AF37]"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <a 
              href="tel:+2250709508819" 
              className="flex items-center gap-2 text-[#A3B1AD] hover:text-[#D4AF37] transition-colors duration-300"
              data-testid="phone-link"
            >
              <Phone size={16} />
              <span className="text-sm">07 09 508 819</span>
            </a>
            <a
              href="https://wa.me/2250709508819?text=Bonjour, je souhaite réserver une table"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold text-sm"
              data-testid="reserve-cta"
            >
              Réserver
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-[#F9F7F2]"
            onClick={() => setIsOpen(!isOpen)}
            data-testid="mobile-menu-btn"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div 
            className="md:hidden fixed inset-0 top-0 bg-[#05100D]/98 backdrop-blur-xl z-40 flex flex-col items-center justify-center"
            data-testid="mobile-menu"
          >
            <button
              className="absolute top-6 right-6 p-2 text-[#F9F7F2]"
              onClick={() => setIsOpen(false)}
            >
              <X size={28} />
            </button>
            <div className="flex flex-col items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-2xl font-light tracking-wide ${
                    isActive(link.path) ? "text-[#D4AF37]" : "text-[#F9F7F2]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={toggleTheme}
                className="mt-4 p-3 rounded-full bg-white/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all duration-300"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={22} /> : <Moon size={22} />}
              </button>
              <a
                href="https://wa.me/2250709508819?text=Bonjour, je souhaite réserver une table"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 btn-gold"
              >
                Réserver une Table
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
