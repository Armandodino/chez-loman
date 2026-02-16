import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../App";
import { Button } from "../components/ui/button";
import StarRating from "../components/StarRating";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock, MessageCircle } from "lucide-react";

const ContactPage = () => {
  const [reviews, setReviews] = useState([]);

  const hours = {
    dimanche: "13:00 – 22:00",
    lundi: "Fermé",
    mardi: "11:00 – 22:00",
    mercredi: "11:00 – 22:00",
    jeudi: "11:00 – 22:00",
    vendredi: "11:00 – 22:00",
    samedi: "11:00 – 22:00"
  };

  const daysOrder = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${API}/reviews`);
        setReviews(response.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };
    fetchReviews();
  }, []);

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();

  return (
    <div className="min-h-screen bg-[#05100D] pt-32 pb-24" data-testid="contact-page">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.3em] mb-4 block">
            Contactez-nous
          </span>
          <h1 className="text-5xl md:text-6xl text-[#F9F7F2] mb-4">
            Réservation & Contact
          </h1>
          <div className="divider-gold mb-6"></div>
          <p className="text-lg text-[#A3B1AD] leading-relaxed">
            Nous sommes à votre disposition pour toute question ou réservation
          </p>
        </motion.div>
      </div>

      {/* Contact Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Contact Info */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.a
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                href="https://wa.me/2250709508819?text=Bonjour, je souhaite passer une commande"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-6 rounded-2xl bg-[#25D366]/20 border border-[#25D366]/30 hover:bg-[#25D366]/30 transition-colors group"
              >
                <MessageCircle className="text-[#25D366]" size={28} />
                <div>
                  <p className="text-[#F9F7F2] font-semibold">WhatsApp</p>
                  <p className="text-[#A3B1AD] text-sm">Commander rapidement</p>
                </div>
              </motion.a>
              
              <motion.a
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                href="tel:+2250709508819"
                className="flex items-center gap-4 p-6 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 hover:bg-[#D4AF37]/20 transition-colors group"
              >
                <Phone className="text-[#D4AF37]" size={28} />
                <div>
                  <p className="text-[#F9F7F2] font-semibold">Appeler</p>
                  <p className="text-[#A3B1AD] text-sm">07 09 508 819</p>
                </div>
              </motion.a>
            </div>

            {/* Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="luxury-card p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-[#D4AF37]" size={20} />
                </div>
                <div>
                  <h3 className="text-[#F9F7F2] font-semibold mb-2">Adresse</h3>
                  <p className="text-[#A3B1AD] leading-relaxed">
                    Yopougon Abobo Doumé — Basile Boli<br/>
                    Abidjan, Côte d'Ivoire
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Hours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="luxury-card p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0">
                  <Clock className="text-[#D4AF37]" size={20} />
                </div>
                <h3 className="text-[#F9F7F2] font-semibold mt-3">Horaires d'Ouverture</h3>
              </div>
              <div className="space-y-2">
                {daysOrder.map((day) => (
                  <div 
                    key={day} 
                    className={`flex justify-between items-center py-3 px-4 rounded-lg ${
                      day === today 
                        ? "bg-[#D4AF37] text-[#0F2E24]" 
                        : hours[day] === "Fermé" 
                          ? "bg-white/5 text-[#A3B1AD]"
                          : "bg-white/5"
                    }`}
                  >
                    <span className="capitalize font-medium">{day}</span>
                    <span className={hours[day] === "Fermé" ? "text-red-400" : day === today ? "" : "text-[#F9F7F2]"}>
                      {hours[day]}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Map & CTA */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="h-[400px] rounded-2xl overflow-hidden border border-white/10"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3972.5097839068377!2d-4.0917!3d5.3364!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMjAnMTEuMCJOIDTCsDA1JzMwLjEiVw!5e0!3m2!1sfr!2sci!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(100%) invert(90%) contrast(90%)' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Chez Loman Location"
                data-testid="google-map"
              ></iframe>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="glass p-8 rounded-2xl gold-border text-center"
            >
              <h3 className="text-2xl text-[#F9F7F2] mb-4">
                Réservez Votre Table
              </h3>
              <p className="text-[#A3B1AD] mb-6">
                Pour les grands groupes ou événements spéciaux, contactez-nous à l'avance
              </p>
              <a
                href="https://wa.me/2250709508819?text=Bonjour, je souhaite réserver une table pour [nombre] personnes le [date]"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="btn-gold w-full">
                  Réserver sur WhatsApp
                </Button>
              </a>
            </motion.div>
          </div>
        </div>

        {/* Reviews Section */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.3em] mb-4 block">
              Avis Clients
            </span>
            <h2 className="text-3xl md:text-4xl text-[#F9F7F2]">
              Ce Que Disent Nos Clients
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="luxury-card p-8 rounded-2xl"
              >
                <StarRating rating={review.rating} />
                <p className="text-[#F9F7F2]/80 mt-6 mb-8 font-accent italic text-lg leading-relaxed">
                  "{review.comment}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#1A4D3E] flex items-center justify-center text-[#D4AF37] font-semibold">
                    {review.author.charAt(0)}
                  </div>
                  <span className="text-[#F9F7F2] font-medium">{review.author}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
