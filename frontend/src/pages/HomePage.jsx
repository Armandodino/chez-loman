import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import MenuCard from "../components/MenuCard";
import StarRating from "../components/StarRating";
import { ArrowRight, MapPin, Clock, Sparkles, Send, CheckCircle, ChevronLeft, ChevronRight, Phone, Music, BookOpen, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// Icônes personnalisées
const TikTokIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
);
const FacebookIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
);

const PromoCarousel = ({ promotions = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextSlide = useCallback(() => {
    if (promotions.length === 0) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % promotions.length);
  }, [promotions.length]);

  const prevSlide = useCallback(() => {
    if (promotions.length === 0) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
  }, [promotions.length]);

  useEffect(() => {
    if (promotions.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, promotions.length]);

  if (!promotions || promotions.length === 0) return null;
  const promo = promotions[currentIndex];

  const getPromoIcon = (type) => {
    const t = type?.toLowerCase();
    if (t === "concert") return <Music size={14} />;
    if (t === "biblique") return <BookOpen size={14} />;
    return <Bell size={14} />;
  };

  return (
    <div className="relative group">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0A1F1A] shadow-xl h-[350px] md:h-[450px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div key={currentIndex} custom={direction} initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0 w-full h-full">
            {promo?.image_url && (
              <div className="relative w-full h-full">
                <img src={promo.image_url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05100D] via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-[#D4AF37] text-[#05100D] p-1 rounded-full">{getPromoIcon(promo.promo_type)}</div>
                    <span className="text-[#D4AF37] text-[10px] md:text-xs font-bold uppercase bg-black/50 px-2 py-1 rounded">{promo.promo_type || "Info"}</span>
                  </div>
                  <h3 className="text-2xl md:text-5xl font-bold text-white mb-2">{promo.title}</h3>
                  <p className="text-white/80 text-sm md:text-xl line-clamp-2">{promo.description}</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feat, daily, rev, vid, promo, hero] = await Promise.all([
          axios.get(`${API}/menu/featured`).catch(() => ({ data: [] })),
          axios.get(`${API}/daily-menu`).catch(() => ({ data: null })),
          axios.get(`${API}/reviews`).catch(() => ({ data: [] })),
          axios.get(`${API}/videos?active_only=true`).catch(() => ({ data: [] })),
          axios.get(`${API}/promotions?active_only=true`).catch(() => ({ data: [] })),
          axios.get(`${API}/hero-content`).catch(() => ({ data: null }))
        ]);
        setFeaturedItems(feat.data || []);
        setDailyMenu(daily.data);
        setReviews((rev.data || []).slice(0, 3));
        setVideos((vid.data || []).slice(0, 3));
        setPromotions(promo.data || []);
        setHeroContent(hero.data);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;
    setSubmittingComment(true);
    try {
      await axios.post(`${API}/reviews`, { author: commentName.trim(), comment: commentText.trim() });
      setCommentSubmitted(true); setCommentName(""); setCommentText("");
      setTimeout(() => setCommentSubmitted(false), 5000);
    } catch (e) { toast.error("Erreur d'envoi"); } finally { setSubmittingComment(false); }
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  return (
    <div className="bg-[#05100D] min-h-screen">
      {/* HERO */}
      <section className="relative min-h-[100dvh] flex items-center">
        <div className="absolute inset-0">
          <img src={heroContent?.background_image || "https://customer-assets.emergentagent.com/job_loman-restaurant/artifacts/jde9y3pb_chl.jpg"} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-4 block">Restaurant d'Exception</span>
            <h1 className="text-4xl md:text-8xl font-accent italic text-white mb-6">
              {heroContent?.title_line1 || "Ici c'est manger"}<br/><span className="text-[#D4AF37]">{heroContent?.title_line2 || "bien hein"}</span>
            </h1>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/menu"><Button className="btn-gold px-8 py-6">Découvrir la Carte</Button></Link>
              <a href="tel:+2250709508819"><Button className="bg-white/10 border border-white/20 text-white px-8 py-6">+225 07 09 50 88 19</Button></a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* MENU DU JOUR */}
      {dailyMenu && dailyMenu.items && Array.isArray(dailyMenu.items) && (
        <section className="py-20 bg-black/20">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl text-white mb-6 font-display">Menu du Jour</h2>
              <div className="divider-gold mb-8"></div>
              <ul className="space-y-4 mb-10">
                {dailyMenu.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-white/80 text-lg"><span className="w-2 h-2 bg-[#D4AF37] rounded-full"></span>{item}</li>
                ))}
              </ul>
              <a href="https://wa.me/2250709508819"><Button className="btn-gold px-10 py-6">Commander (+225)</Button></a>
            </div>
            <img src={dailyMenu.image_url || "https://customer-assets.emergentagent.com/job_b5c0ff47-ce71-407d-b22b-390360e9dd58/artifacts/ha2l407l_cv.jpg"} className="rounded-3xl shadow-2xl h-[400px] object-cover border border-white/10" alt="" />
          </div>
        </section>
      )}

      {/* PUBLICITÉS */}
      {promotions.length > 0 && (
        <section className="py-20 bg-[#0F2E24]/20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest">Actualités</span>
            <h2 className="text-3xl md:text-4xl text-white mt-2 mb-10 font-display">Événements & Infos</h2>
            <PromoCarousel promotions={promotions} />
          </div>
        </section>
      )}

      {/* SIGNATURE */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 text-center mb-12">
          <h2 className="text-3xl md:text-5xl text-white font-display">Plats Signature</h2>
          <div className="divider-gold mx-auto"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredItems.map(item => <MenuCard key={item.id} item={item} />)}
        </div>
      </section>

      {/* VIDEOS */}
      {videos.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            {videos.map(v => (
              <div key={v.id} className="rounded-2xl overflow-hidden bg-white/5">
                {v.video_type === "youtube" ? <iframe className="w-full aspect-video" src={`https://www.youtube.com/embed/${getYouTubeId(v.video_url)}`} frameBorder="0" allowFullScreen></iframe> : <video src={v.video_url} controls className="w-full aspect-video object-cover" />}
                <div className="p-4 text-white font-semibold">{v.title}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* REVIEWS */}
      <section className="py-20 bg-[#0F2E24]/30">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map(r => (
            <div key={r.id} className="luxury-card p-8 rounded-2xl">
              <StarRating rating={r.rating} />
              <p className="text-white/70 italic mt-4">"{r.comment}"</p>
              <p className="text-[#D4AF37] mt-4 font-bold">{r.author}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMMENT FORM */}
      <section className="py-20 max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl text-white mb-10 font-display">Laissez un Commentaire</h2>
        <form onSubmit={handleCommentSubmit} className="space-y-4">
          <Input value={commentName} onChange={(e)=>setCommentName(e.target.value)} placeholder="Nom" className="input-luxury" required />
          <textarea value={commentText} onChange={(e)=>setCommentText(e.target.value)} placeholder="Message" className="w-full input-luxury rounded-xl p-4 min-h-[120px]" required />
          <Button type="submit" disabled={submittingComment} className="btn-gold w-full py-6">Envoyer</Button>
        </form>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 bg-[#1A4D3E] text-center text-white">
        <h2 className="text-3xl md:text-5xl font-accent italic mb-6">Une Table Vous Attend</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="https://wa.me/2250709508819"><Button className="bg-[#D4AF37] text-black rounded-full px-10 py-6 font-bold">WhatsApp (+225)</Button></a>
          <a href="tel:+2250709508819"><Button className="bg-transparent border border-white/20 rounded-full px-10 py-6">Appeler au +225</Button></a>
        </div>
      </section>
    </div>
  );
};

export default HomePage;