import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API } from "../App";
import { Button } from "../components/ui/button";
import MenuCard from "../components/MenuCard";
import StarRating from "../components/StarRating";
import { ArrowRight, MapPin, Clock, Sparkles, Send, CheckCircle, ChevronLeft, ChevronRight, Phone, Music, BookOpen, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// TikTok icon component
const TikTokIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Facebook icon component
const FacebookIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
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
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide, promotions.length]);

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  const getPromoIcon = (type) => {
    const t = type?.toLowerCase();
    if (t === "concert") return <Music size={16} />;
    if (t === "biblique") return <BookOpen size={16} />;
    return <Bell size={16} />;
  };

  const promo = promotions[currentIndex];

  return (
    <div className="relative group">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0A1F1A] shadow-xl h-[350px] md:h-[450px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div key={currentIndex} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.5 }} className="absolute inset-0 w-full h-full">
            {promo.image_url && (
              <div className="relative w-full h-full">
                <img src={promo.image_url} alt={promo.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05100D] via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-[#D4AF37] text-[#05100D] p-1.5 rounded-full">{getPromoIcon(promo.promo_type)}</div>
                    <span className="text-[#D4AF37] text-[10px] md:text-xs font-bold uppercase tracking-wider bg-black/50 px-3 py-1 rounded backdrop-blur-md">
                      {promo.promo_type || "Info"}
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-5xl font-bold text-[#F9F7F2] mb-2 font-display">{promo.title}</h3>
                  <p className="text-[#F9F7F2]/80 text-sm md:text-xl max-w-2xl">{promo.description}</p>
                  {promo.end_date && (
                    <div className="flex items-center gap-2 mt-4 text-[#D4AF37]">
                        <Clock size={16} /><span className="text-xs font-semibold uppercase">Le {new Date(promo.end_date).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                  <a href="https://wa.me/2250709508819" target="_blank" rel="noopener noreferrer" className="inline-block mt-6 bg-[#D4AF37] text-[#0F2E24] px-6 py-2 rounded-full text-sm font-bold hover:bg-white transition-all">En Profiter</a>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      {promotions.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {promotions.map((_, idx) => (
            <button key={idx} onClick={() => setCurrentIndex(idx)} className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? "bg-[#D4AF37] w-6" : "bg-white/20 w-2"}`} />
          ))}
        </div>
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
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) { toast.error("Veuillez remplir tous les champs"); return; }
    setSubmittingComment(true);
    try {
      await axios.post(`${API}/reviews`, { author: commentName.trim(), comment: commentText.trim() });
      setCommentSubmitted(true); setCommentName(""); setCommentText("");
      toast.success("Merci pour votre commentaire !");
      setTimeout(() => setCommentSubmitted(false), 5000);
    } catch (error) { toast.error("Erreur lors de l'envoi"); } 
    finally { setSubmittingComment(false); }
  };

  return (
    <div className="bg-[#05100D]" data-testid="home-page">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[100dvh] flex items-center">
        <div className="absolute inset-0">
          <img src={heroContent?.background_image || "https://customer-assets.emergentagent.com/job_loman-restaurant/artifacts/jde9y3pb_chl.jpg"} alt="Hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0 hero-overlay"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-12 pt-28 pb-16 md:py-32">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="max-w-3xl">
            <span className="inline-block text-[#D4AF37] text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em] mb-4">Restaurant Ivoirien d'Exception</span>
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-accent italic text-[#F9F7F2] leading-[1.1] mb-6">
              {heroContent?.title_line1 || "Ici c'est manger"}<br/>
              <span className="text-[#D4AF37]">{heroContent?.title_line2 || "bien hein"}</span>
            </h1>
            <p className="text-base md:text-xl text-[#A3B1AD] max-w-xl mb-10 leading-relaxed">{heroContent?.description}</p>
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link to="/menu" className="w-full sm:w-auto"><Button className="btn-gold text-base w-full py-6 px-10">Découvrir la Carte</Button></Link>
              <a href="tel:+2250709508819" className="w-full sm:w-auto"><Button className="bg-white/10 border border-white/20 text-[#F9F7F2] rounded-full px-10 py-6 text-sm w-full flex items-center justify-center gap-2"><Phone size={16} />+225 07 09 50 88 19</Button></a>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 mt-16">
                <div className="flex gap-6"><div className="flex items-center gap-3 text-[#A3B1AD]/70"><MapPin size={18} className="text-[#D4AF37]" /><span className="text-sm">Yopougon, Abidjan</span></div><div className="flex items-center gap-3 text-[#A3B1AD]/70"><Clock size={18} className="text-[#D4AF37]" /><span className="text-sm">11h – 22h</span></div></div>
                <div className="flex items-center gap-3 border-l border-white/10 pl-6"><a href="https://facebook.com..." className="text-[#D4AF37] hover:text-white transition-colors"><FacebookIcon size={20} /></a><a href="https://tiktok.com..." className="text-[#D4AF37] hover:text-white transition-colors"><TikTokIcon size={20} /></a></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. DAILY MENU SECTION */}
      {dailyMenu && (
        <section className="py-16 md:py-32 relative">
          <div className="absolute inset-0 bg-[#1A4D3E]/20"></div>
          <div className="max-w-7xl mx-auto px-4 md:px-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.3em] mb-3 block">Aujourd'hui</span>
                <h2 className="text-3xl md:text-5xl text-[#F9F7F2] mb-6 font-display">Menu du Jour</h2>
                <div className="divider-gold mb-8"></div>
                {dailyMenu.special_message && <p className="text-[#D4AF37] font-accent italic text-lg mb-8">{dailyMenu.special_message}</p>}
                <ul className="space-y-4 mb-10">
                  {dailyMenu.items.map((item, index) => (
                    <li key={index} className="flex items-start gap-4 text-[#F9F7F2]/80"><span className="w-2 h-2 mt-2 rounded-full bg-[#D4AF37] shrink-0"></span><span className="text-base md:text-lg">{item}</span></li>
                  ))}
                </ul>
                <a href="https://wa.me/2250709508819" target="_blank" rel="noopener noreferrer"><Button className="btn-gold w-full sm:w-auto py-6 text-base px-10">Commander (+225)</Button></a>
              </motion.div>
              <div className="relative">
                <img src={dailyMenu.image_url || "https://customer-assets.emergentagent.com/job_b5c0ff47-ce71-407d-b22b-390360e9dd58/artifacts/ha2l407l_cv.jpg"} className="rounded-2xl shadow-2xl w-full h-[350px] md:h-[500px] object-cover border border-[#D4AF37]/20" alt="Menu" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. FEATURED DISHES SECTION */}
      <section className="py-16 md:py-32">
        <div className="max-w-7xl mx-auto px-4 md:px-12 text-center mb-16">
          <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.3em] mb-3 block">Nos Saveurs</span>
          <h2 className="text-3xl md:text-5xl text-[#F9F7F2] mb-4 font-display">Plats Signature</h2>
          <div className="divider-gold mx-auto"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredItems.slice(0, 6).map((item, index) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}><MenuCard item={item} /></motion.div>
          ))}
        </div>
      </section>

      {/* 4. ABOUT PREVIEW SECTION */}
      <section className="py-16 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0"><img src="https://customer-assets.emergentagent.com/job_b5c0ff47-ce71-407d-b22b-390360e9dd58/artifacts/smtxt9or_chl.jpg" className="w-full h-full object-cover opacity-20" alt="History" /><div className="absolute inset-0 bg-gradient-to-r from-[#05100D] via-[#05100D]/90 to-[#05100D]/70"></div></div>
        <div className="max-w-7xl mx-auto px-4 md:px-12 relative z-10">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.3em] mb-3 block">Notre Histoire</span>
              <h2 className="text-3xl md:text-5xl text-[#F9F7F2] mb-6 font-display leading-tight">L'Art de la Cuisine Ivoirienne</h2>
              <div className="divider-gold mb-8"></div>
              <p className="text-base md:text-lg text-[#A3B1AD] leading-relaxed mb-8">Chez Loman, nous perpétuons la tradition culinaire ivoirienne avec passion et excellence.</p>
              <p className="text-xl md:text-2xl font-accent italic text-[#D4AF37] mb-8 md:mb-10">"Viens goûter, tu vas comprendre"</p>
              <Link to="/about"><Button className="btn-outline-gold w-full sm:w-auto py-6">Découvrir Notre Histoire</Button></Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. PUBLICITÉS & INFOS (MIXTE) */}
      {promotions.length > 0 && (
        <section className="py-12 md:py-20 bg-gradient-to-b from-[#0A1F1A] to-[#0F2E24]">
          <div className="max-w-7xl mx-auto px-4 md:px-12">
            <div className="text-center mb-10">
              <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.3em]">L'Actualité de Loman</span>
              <h2 className="text-2xl md:text-4xl font-bold text-[#F9F7F2] mt-3 font-display">Événements & Infos</h2>
            </div>
            <PromoCarousel promotions={promotions} />
          </div>
        </section>
      )}

      {/* 6. VIDEOS SECTION (RÉTABLIE) */}
      {videos.length > 0 && (
        <section className="py-16 md:py-32 bg-[#05100D]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.3em]">En Vidéo</span>
              <h2 className="text-3xl md:text-5xl text-white font-display mt-2">Découvrez Notre Ambiance</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map((v) => (
                <div key={v.id} className="luxury-card rounded-2xl overflow-hidden shadow-2xl">
                  {v.video_type === "youtube" ? (
                    <iframe className="w-full aspect-video" src={`https://www.youtube.com/embed/${getYouTubeId(v.video_url)}`} title={v.title} frameBorder="0" allowFullScreen></iframe>
                  ) : (
                    <video src={v.video_url} controls className="w-full aspect-video object-cover" />
                  )}
                  <div className="p-6"><h3 className="text-white font-semibold">{v.title}</h3></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. REVIEWS SECTION (RÉTABLIE) */}
      <section className="py-16 md:py-32 bg-[#0F2E24]/30">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.3em]">Témoignages</span>
          <h2 className="text-3xl md:text-5xl text-white font-display mt-2 mb-16">Ce Qu'ils en Disent</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {reviews.map((r) => (
              <div key={r.id} className="luxury-card p-8 rounded-2xl">
                <StarRating rating={r.rating} />
                <p className="text-[#F9F7F2]/80 mt-6 font-accent italic text-lg leading-relaxed">"{r.comment}"</p>
                <div className="flex items-center gap-4 mt-8">
                  <div className="w-12 h-12 rounded-full bg-[#1A4D3E] flex items-center justify-center text-[#D4AF37] font-bold">{r.author.charAt(0)}</div>
                  <span className="text-white font-medium">{r.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. COMMENT FORM SECTION (RÉTABLIE) */}
      <section className="py-16 md:py-32">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.3em]">Votre Avis</span>
          <h2 className="text-3xl md:text-5xl text-white font-display mt-2 mb-12">Laissez un Commentaire</h2>
          {commentSubmitted ? (
            <div className="luxury-card p-10 rounded-2xl"><CheckCircle className="mx-auto text-[#D4AF37] mb-4" size={48} /><h3 className="text-white text-xl">Merci !</h3></div>
          ) : (
            <form onSubmit={handleCommentSubmit} className="luxury-card p-8 md:p-10 rounded-2xl space-y-6">
              <Input value={commentName} onChange={(e)=>setCommentName(e.target.value)} placeholder="Nom et Prénoms" className="input-luxury py-6" required />
              <textarea value={commentText} onChange={(e)=>setCommentText(e.target.value)} placeholder="Votre expérience..." className="w-full input-luxury rounded-xl p-5 min-h-[150px]" required />
              <Button type="submit" disabled={submittingComment} className="btn-gold w-full py-6 text-base">{submittingComment ? "Envoi..." : "Envoyer mon avis"}</Button>
            </form>
          )}
        </div>
      </section>

      {/* 9. CTA FINAL SECTION */}
      <section className="py-16 md:py-32 relative text-center">
        <div className="absolute inset-0 bg-[#1A4D3E]"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-white">
          <h2 className="text-3xl md:text-6xl font-accent italic mb-6">Une Table Vous Attend</h2>
          <p className="text-white/70 mb-10 max-w-xl mx-auto">Réservez dès maintenant les meilleures saveurs de la cuisine ivoirienne.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="https://wa.me/2250709508819"><Button className="bg-[#D4AF37] text-[#0F2E24] hover:bg-white rounded-full px-10 py-6 text-lg font-bold">WhatsApp (+225)</Button></a>
            <a href="tel:+2250709508819"><Button className="bg-transparent border border-white/30 rounded-full px-10 py-6 text-lg font-medium hover:bg-white/10">Appeler: +225 07 09 50 88 19</Button></a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;