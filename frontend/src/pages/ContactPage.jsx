import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

const ContactPage = () => {
  return (
    <div className="pt-24 min-h-screen bg-[#05100D]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.3em]">
            Nous trouver
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#F9F7F2] mt-3 font-display">
            Contactez-nous
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Formulaire */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="luxury-card p-8 rounded-3xl">
              <h3 className="text-2xl text-[#F9F7F2] font-semibold mb-6">Envoyez un message</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-[#D4AF37] uppercase tracking-wider">Nom</label>
                    <Input placeholder="Votre nom" className="input-luxury" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-[#D4AF37] uppercase tracking-wider">Email</label>
                    <Input type="email" placeholder="votre@email.com" className="input-luxury" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-[#D4AF37] uppercase tracking-wider">Message</label>
                  <Textarea placeholder="Votre message..." className="input-luxury min-h-[150px]" />
                </div>
                <Button className="w-full btn-gold py-6">
                  <Send size={18} className="mr-2" />
                  Envoyer le message
                </Button>
              </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="luxury-card p-6 rounded-2xl flex items-start gap-4">
                <div className="bg-[#D4AF37]/10 p-3 rounded-full text-[#D4AF37]">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="text-[#F9F7F2] font-semibold">Téléphone</h4>
                  <p className="text-[#A3B1AD] text-sm mt-1">+225 07 09 508 819</p>
                </div>
              </div>
              <div className="luxury-card p-6 rounded-2xl flex items-start gap-4">
                <div className="bg-[#D4AF37]/10 p-3 rounded-full text-[#D4AF37]">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="text-[#F9F7F2] font-semibold">Email</h4>
                  <p className="text-[#A3B1AD] text-sm mt-1">contact@chezloman.ci</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Carte & Infos */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-8"
          >
            <div className="luxury-card p-2 rounded-3xl overflow-hidden h-[400px] relative group">
              {/* NOUVELLE CARTE AVEC ADRESSE EXACTE */}
              <iframe 
                width="100%" 
                height="100%" 
                id="gmap_canvas" 
                src="https://maps.google.com/maps?q=Rue%20K40,450,%20Abidjan&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight="0" 
                marginWidth="0"
                className="grayscale group-hover:grayscale-0 transition-all duration-700"
                style={{ filter: "invert(90%) hue-rotate(180deg) contrast(85%) grayscale(80%)" }} // Effet sombre pour la carte
              ></iframe>
              
              <div className="absolute bottom-6 left-6 bg-[#05100D]/90 backdrop-blur-md p-4 rounded-xl border border-[#D4AF37]/20 flex items-center gap-3">
                <MapPin className="text-[#D4AF37]" size={24} />
                <div>
                  <p className="text-[#F9F7F2] font-semibold text-sm">Rue K40, 450</p>
                  <p className="text-[#A3B1AD] text-xs">Abidjan, Côte d'Ivoire</p>
                </div>
              </div>
            </div>

            <div className="luxury-card p-8 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="text-[#D4AF37]" size={24} />
                <h3 className="text-xl text-[#F9F7F2] font-semibold">Horaires d'ouverture</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[#A3B1AD]">Lundi - Jeudi</span>
                  <span className="text-[#F9F7F2] font-medium">11:00 - 23:00</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[#A3B1AD]">Vendredi - Samedi</span>
                  <span className="text-[#F9F7F2] font-medium">11:00 - 02:00</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[#A3B1AD]">Dimanche</span>
                  <span className="text-[#F9F7F2] font-medium">12:00 - 23:00</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;