import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API } from "../App";
import { Button } from "../components/ui/button";
import MenuCard from "../components/MenuCard";
import StarRating from "../components/StarRating";
import { ArrowRight, MapPin, Clock, Sparkles, Send, CheckCircle, ChevronLeft, ChevronRight, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// TikTok icon component
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

// Facebook icon component
const FacebookIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);


const PromoCarousel = ({ promotions }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % promotions.length);
  }, [promotions.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
  }, [promotions.length]);

  useEffect(() => {
    if (promotions.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, promotions.length]);

  const promo = promotions[currentIndex];

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div className="relative group">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0A1F1A] shadow-xl h-[300px] md:h-[400px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            {promo.image_url ? (
              <div className="relative w-full h-full">
                <img
                  src={promo.image_url.startsWith('/api') ? promo.image_url : promo.image_url}
                  alt={promo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="text-[#D4AF37]" size={16} />
                    <span className="text-[#D4AF37] text-[10px] md:text-xs font-semibold uppercase tracking-wider bg-black/30 px-2 py-1 rounded">
                      {promo.promo_type === "banner" ? "Promotion" : promo.promo_type === "popup" ? "Offre Spéciale" : "Annonce"}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-3xl font-bold text-[#F9F7F2] mb-1 md:mb-2 line-clamp-1">{promo.title}</h3>
                  <p className="text-[#F9F7F2]/80 text-xs md:text-base max-w-2xl line-clamp-2 md:line-clamp-3">{promo.description}</p>
                  {(promo.start_date || promo.end_date) && (
                    <p className="text-[#D4AF37] text-xs mt-2">
                      {promo.start_date && `Du ${promo.start_date}`} {promo.end_date && `au ${promo.end_date}`}
                    </p>
                  )}
                  <a
                    href="https://wa.me/2250709508819?text=Bonjour, je suis intéressé par la promotion"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 md:mt-4 bg-[#D4AF37] text-[#0F2E24] px-5 py-2 rounded-full text-xs md:text-sm font-semibold hover:bg-[#C4A030] transition-colors active:scale-95 transform"
                  >
                    En Profiter
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-gradient-to-br from-[#D4AF37]/10 to-[#1A4D3E]/30">
                <Sparkles className="text-[#D4AF37] mb-4" size={32} />
                <h3 className="text-xl md:text-3xl font-bold text-[#F9F7F2] mb-3">{promo.title}</h3>
                <p className="text-[#A3B1AD] text-sm md:text-base max-w-lg mb-4">{promo.description}</p>
                <a
                  href="https://wa.me/2250709508819?text=Bonjour, je suis intéressé par la promotion"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-[#D4AF37] text-[#0F2E24] px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#C4A030] transition-colors"
                >
                  En Profiter
                </a>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {promotions.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#D4AF37] hover:text-[#0F2E24] transition-all z-10"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#D4AF37] hover:text-[#0F2E24] transition-all z-10"
          >
            <ChevronRight size={20} />
          </button>

          <div className="flex justify-center gap-2 mt-4">
            {promotions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { setDirection(idx > currentIndex ? 1 : -1); setCurrentIndex(idx); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? "bg-[#D4AF37] w-6" : "bg-white/20 w-2 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const HomePage = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [dailyMenu, setDailyMenu] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [videos, setVideos] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroContent, setHeroContent] = useState(null);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Helper to extract YouTube video ID
  const getYouTubeId = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, dailyRes, reviewsRes, videosRes, promosRes, heroRes] = await Promise.all([
          axios.get(`${API}/menu/featured`),
          axios.get(`${API}/daily-menu`),
          axios.get(`${API}/reviews`),
          axios.get(`${API}/videos?active_only=true`),
          axios.get(`${API}/promotions?active_only=true`),
          axios.get(`${API}/hero-content`)
        ]);
        setFeaturedItems(featuredRes.data);
        setDailyMenu(dailyRes.data);
        setReviews(reviewsRes.data.slice(0, 3));
        setVideos(videosRes.data.slice(0, 3));
        setPromotions(promosRes.data);
        setHeroContent(heroRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    setSubmittingComment(true);
    try {
      await axios.post(`${API}/reviews`, {
        author: commentName.trim(),
        comment: commentText.trim(),
      });
      setCommentSubmitted(true);
      setCommentName("");
      setCommentText("");
      toast.success("Merci pour votre commentaire !");
      setTimeout(() => setCommentSubmitted(false), 5000);
    } catch (error) {
      toast.error("Erreur lors de l'envoi du commentaire");
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="bg-[#05100D]" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative min-h-[100dvh] flex items-center" data-testid="hero-section">
        <div className="absolute inset-0">
          <img 
            src={heroContent?.background_image || "https://customer-assets.emergentagent.com/job_loman-restaurant/artifacts/jde9y3pb_chl.jpg"}
            alt="Restaurant ambiance"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-overlay"></div>
          <div className="absolute inset-0 noise-overlay"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-12 pt-28 pb-16 md:py-32">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <span className="inline-block text-[#D4AF37] text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em] mb-4 md:mb-6">
              Restaurant Ivoirien d'Exception
            </span>
            
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-accent italic text-[#F9F7F2] leading-[1.1] md:leading-[0.9] mb-4 md:mb-6">
              {heroContent?.title_line1 || "Ici c'est manger"}<br/>
              <span className="text-[#D4AF37]">{heroContent?.title_line2 || "bien hein"}</span>
            </h1>
            
            <p className="text-base md:text-xl text-[#A3B1AD] max-w-xl mb-8 md:mb-10 leading-relaxed">
              {heroContent?.description || "Une cuisine ivoirienne authentique, sublimée par notre savoir-faire. Découvrez les saveurs du pays dans un cadre raffiné."}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <a
                href="https://wa.me/2250709508819?text=Bonjour, je souhaite réserver une table"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button className="btn-gold text-base w-full py-6">
                  Réserver une Table
                </Button>
              </a>
              <Link to="/menu" className="w-full sm:w-auto">
                <Button className="btn-outline-gold text-base w-full py-6">
                  Découvrir la Carte
                </Button>
              </Link>
            </div>
            
            {/* Info badges & Socials */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 md:gap-8 mt-4 md:mt-16">
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3 text-[#A3B1AD]/70">
                  <MapPin size={18} className="text-[#D4AF37]" />
                  <span className="text-sm">Yopougon, Abidjan</span>
                </div>
                <div className="flex items-center gap-3 text-[#A3B1AD]/70">
                  <Clock size={18} className="text-[#D4AF37]" />
                  <span className="text-sm">11h – 22h</span>
                </div>
              </div>
              
              {/* Social Links */}
              <div className="flex items-center gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/10 w-full sm:w-auto">
                <a 
                  href="https://www.facebook.com/profile.php?id=61574715038273" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0F2E24] transition-all duration-300"
                  data-testid="hero-facebook-link"
                >
                  <FacebookIcon size={20} />
                </a>
                <a 
                  href="https://www.tiktok.com/@lomanschadrac?lang=fr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0F2E24] transition-all duration-300"
                  data-testid="hero-tiktok-link"
                >
                  <TikTokIcon size={20} />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll indicator - hidden on small mobile to save space */}
        <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2">
          <span className="text-[#A3B1AD]/50 text-xs uppercase tracking-widest">Découvrir</span>
          <div className="w-px h-10 bg-gradient-to-b from-[#D4AF37] to-transparent"></div>
        </div>
      </section>

      {/* Daily Menu Section */}
      {dailyMenu && (
        <section className="py-16 md:py-32 relative" data-testid="daily-menu-section">
          <div className="absolute inset-0 bg-[#1A4D3E]/20"></div>
          <div className="max-w-7xl mx-auto px-4 md:px-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="order-2 lg:order-1">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.3em] mb-3 block">
                    Aujourd'hui
                  </span>
                  <h2 className="text-3xl md:text-5xl text-[#F9F7F2] mb-4 md:mb-6 font-display">
                    Menu du Jour
                  </h2>
                  <div className="divider-gold mb-6 md:mb-8"></div>
                  
                  {dailyMenu.special_message && (
                    <p className="text-[#D4AF37] font-accent italic text-lg mb-6 md:mb-8 bg-[#D4AF37]/5 p-4 rounded-lg border border-[#D4AF37]/10">
                      {dailyMenu.special_message}
                    </p>
                  )}
                  
                  <ul className="space-y-4 mb-8 md:mb-10">
                    {dailyMenu.items.map((item, index) => (
                      <li key={index} className="flex items-start gap-4 text-[#F9F7F2]/80">
                        <span className="w-2 h-2 mt-2 rounded-full bg-[#D4AF37] shrink-0"></span>
                        <span className="text-base md:text-lg leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <a
                    href="https://wa.me/2250709508819?text=Bonjour, je souhaite commander le menu du jour"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full sm:w-auto"
                  >
                    <Button className="btn-gold w-full sm:w-auto py-6 text-base">
                      Commander Maintenant
                    </Button>
                  </a>
                </motion.div>
              </div>
              
              <div className="order-1 lg:order-2 relative">
                <img 
                  src={dailyMenu.image_url || "https://customer-assets.emergentagent.com/job_b5c0ff47-ce71-407d-b22b-390360e9dd58/artifacts/ha2l407l_cv.jpg"}
                  alt="Affiche du menu du jour"
                  className="rounded-2xl shadow-2xl w-full h-[300px] md:h-auto object-cover border border-[#D4AF37]/20"
                />
                <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 glass p-4 md:p-6 rounded-xl flex items-center gap-3 shadow-lg max-w-[200px]">
                  <Sparkles className="text-[#D4AF37]" size={24} />
                  <div>
                    <p className="text-[#F9F7F2] font-semibold text-sm md:text-base">Fait maison</p>
                    <p className="text-[#A3B1AD] text-xs md:text-sm">Chaque jour</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Dishes */}
      <section className="py-16 md:py-32" data-testid="featured-section">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10 md:mb-16"
          >
            <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.3em] mb-3 block">
              Nos Spécialités
            </span>
            <h2 className="text-3xl md:text-5xl text-[#F9F7F2] mb-4 font-display">
              Plats Signature
            </h2>
            <div className="divider-gold mx-auto"></div>
          </motion.div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 md:h-96 bg-white/5 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {featuredItems.slice(0, 6).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <MenuCard item={item} />
                </motion.div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-10 md:mt-16">
            <Link to="/menu">
              <Button className="btn-outline-gold group w-full sm:w-auto py-6">
                Voir Toute la Carte
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-16 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://customer-assets.emergentagent.com/job_b5c0ff47-ce71-407d-b22b-390360e9dd58/artifacts/smtxt9or_chl.jpg"
            alt="Notre équipe"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#05100D] via-[#05100D]/90 to-[#05100D]/70"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-12 relative z-10">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.3em] mb-3 block">
                Notre Histoire
              </span>
              <h2 className="text-3xl md:text-5xl text-[#F9F7F2] mb-6 font-display leading-tight">
                L'Art de la Cuisine Ivoirienne
              </h2>
              <div className="divider-gold mb-6 md:mb-8"></div>
              <p className="text-base md:text-lg text-[#A3B1AD] leading-relaxed mb-8">
                Chez Loman, nous perpétuons la tradition culinaire ivoirienne avec passion et excellence. 
                Chaque plat raconte une story, chaque saveur vous transporte au cœur de la Côte d'Ivoire.
              </p>
              <p className="text-xl md:text-2xl font-accent italic text-[#D4AF37] mb-8 md:mb-10">
                "Viens goûter, tu vas comprendre"
              </p>
              <Link to="/about">
                <Button className="btn-outline-gold w-full sm:w-auto py-6">
                  Découvrir Notre Histoire
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Promotions & Publicités */}
      {promotions.length > 0 && (
        <section className="py-12 md:py-20 bg-gradient-to-b from-[#0A1F1A] to-[#0F2E24]" data-testid="promo-banner">
          <div className="max-w-7xl mx-auto px-4 md:px-12">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-10"
            >
              <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.3em]">Exclusivités</span>
              <h2 className="text-2xl md:text-4xl font-bold text-[#F9F7F2] mt-3 font-display">Publicités & Offres</h2>
            </motion.div>
            <PromoCarousel promotions={promotions} />
          </div>
        </section>
      )}

      {/* Videos Section */}
      {videos.length > 0 && (
        <section className="py-16 md:py-32" data-testid="videos-section">
          <div className="max-w-7xl mx-auto px-4 md:px-12">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-10 md:mb-16"
            >
              <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.3em] mb-3 block">
                En Vidéo
              </span>
              <h2 className="text-3xl md:text-5xl text-[#F9F7F2] font-display">
                Découvrez Notre Ambiance
              </h2>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {videos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="luxury-card rounded-2xl overflow-hidden"
                >
                  {video.video_type === "youtube" && getYouTubeId(video.video_url) && (
                    <div className="aspect-video">
                      <iframe 
                        src={`https://www.youtube.com/embed/${getYouTubeId(video.video_url)}`} 
                        className="w-full h-full" 
                        allowFullScreen 
                        title={video.title}
                      ></iframe>
                    </div>
                  )}
                  {video.video_type === "direct" && (
                    <video src={video.video_url} controls className="w-full aspect-video object-cover"></video>
                  )}
                  <div className="p-5">
                    <h3 className="text-[#F9F7F2] font-semibold text-lg">{video.title}</h3>
                    {video.description && (
                      <p className="text-sm text-[#A3B1AD] mt-2 line-clamp-2">{video.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="py-16 md:py-32 bg-[#0F2E24]/30" data-testid="reviews-section">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10 md:mb-16"
          >
            <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.3em] mb-3 block">
              Témoignages
            </span>
            <h2 className="text-3xl md:text-5xl text-[#F9F7F2] font-display">
              Ce Qu'ils en Disent
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="luxury-card p-6 md:p-8 rounded-2xl"
              >
                <StarRating rating={review.rating} />
                <p className="text-[#F9F7F2]/80 mt-4 mb-6 font-accent italic text-base md:text-lg leading-relaxed">
                  "{review.comment}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#1A4D3E] flex items-center justify-center text-[#D4AF37] font-semibold">
                    {review.author.charAt(0)}
                  </div>
                  <span className="text-[#F9F7F2] font-medium">{review.author}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment Form */}
      <section className="py-16 md:py-32" data-testid="comment-section">
        <div className="max-w-3xl mx-auto px-4 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 md:mb-12"
          >
            <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.3em] mb-3 block">
              Votre Avis Compte
            </span>
            <h2 className="text-3xl md:text-5xl text-[#F9F7F2] font-display">
              Laissez un Commentaire
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {commentSubmitted ? (
              <div className="luxury-card rounded-2xl p-10 text-center">
                <CheckCircle className="mx-auto text-[#D4AF37] mb-4" size={48} />
                <h3 className="text-xl text-[#F9F7F2] font-semibold mb-2">Merci pour votre commentaire !</h3>
                <p className="text-[#A3B1AD]">Il sera visible après validation par notre équipe.</p>
              </div>
            ) : (
              <form onSubmit={handleCommentSubmit} className="luxury-card rounded-2xl p-6 md:p-10 space-y-5 md:space-y-6">
                <div>
                  <label className="block text-[#A3B1AD] text-xs md:text-sm mb-2 uppercase tracking-wider">Nom et Prénoms</label>
                  <input
                    type="text"
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    placeholder="Ex: Kouadio Aman Jean"
                    className="w-full input-luxury rounded-xl px-5 py-4 text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#A3B1AD] text-xs md:text-sm mb-2 uppercase tracking-wider">Votre Commentaire</label>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Partagez votre expérience chez Loman..."
                    rows={4}
                    className="w-full input-luxury rounded-xl px-5 py-4 text-base resize-none"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submittingComment}
                  className="btn-gold w-full text-base flex items-center justify-center gap-2 py-6"
                >
                  {submittingComment ? "Envoi en cours..." : (
                    <>
                      <Send size={18} />
                      Envoyer mon commentaire
                    </>
                  )}
                </Button>
                <p className="text-[10px] md:text-xs text-[#A3B1AD] text-center">
                  Votre commentaire sera publié après validation par notre équipe.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-32 relative" data-testid="cta-section">
        <div className="absolute inset-0 bg-[#1A4D3E]"></div>
        <div className="absolute inset-0 noise-overlay"></div>
        
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-6xl font-accent italic text-[#F9F7F2] mb-6">
              Une Table Vous Attend
            </h2>
            <p className="text-base md:text-lg text-[#F9F7F2]/70 mb-8 md:mb-10 max-w-xl mx-auto">
              Réservez dès maintenant et laissez-nous vous faire découvrir 
              les meilleures saveurs de la cuisine ivoirienne
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="https://wa.me/2250709508819?text=Bonjour, je souhaite réserver une table"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button className="bg-[#D4AF37] text-[#0F2E24] hover:bg-[#F9F7F2] rounded-full px-10 py-6 text-lg font-semibold w-full sm:w-auto transition-all duration-400">
                  Réserver sur WhatsApp
                </Button>
              </a>
              <a href="tel:+2250709508819">
                <Button className="bg-transparent border border-[#F9F7F2]/30 text-[#F9F7F2] hover:bg-[#F9F7F2] hover:text-[#1A4D3E] rounded-full px-10 py-6 text-lg font-medium w-full sm:w-auto transition-all duration-400">
                  Appeler: +225 07 09 50 88 19
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;