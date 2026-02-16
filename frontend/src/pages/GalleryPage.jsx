import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../App";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const GalleryPage = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const categories = [
    { id: "all", label: "Toutes" },
    { id: "plats", label: "Nos Plats" },
    { id: "restaurant", label: "Le Restaurant" },
    { id: "clients", label: "Nos Clients" },
    { id: "ambiance", label: "Ambiance" },
  ];

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await axios.get(`${API}/gallery`);
        setPhotos(response.data);
      } catch (error) {
        console.error("Error fetching gallery:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const filteredPhotos = activeCategory === "all"
    ? photos
    : photos.filter(photo => photo.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#05100D] pt-32 pb-24" data-testid="gallery-page">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.3em] mb-4 block">
            Nos Photos
          </span>
          <h1 className="text-5xl md:text-6xl text-[#F9F7F2] mb-4">
            La Galerie
          </h1>
          <div className="divider-gold mb-6"></div>
          <p className="text-lg text-[#A3B1AD] leading-relaxed">
            Découvrez l'ambiance de Chez Loman, nos plats signatures et nos clients satisfaits
          </p>
        </motion.div>
      </div>

      {/* Category Filters */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-12">
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-3 rounded-full text-sm font-medium tracking-wide transition-all duration-400 ${
                activeCategory === cat.id
                  ? "bg-[#D4AF37] text-[#0F2E24]"
                  : "bg-white/5 text-[#A3B1AD] border border-white/10 hover:border-[#D4AF37]/50 hover:text-[#D4AF37]"
              }`}
              data-testid={`gallery-category-${cat.id}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-72 bg-white/5 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#A3B1AD] text-lg">Aucune photo dans cette catégorie</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Dialog>
                  <DialogTrigger asChild>
                    <div 
                      className="gallery-item-luxury group cursor-pointer h-72 relative"
                      data-testid={`gallery-photo-${photo.id}`}
                    >
                      <img 
                        src={photo.image_url} 
                        alt={photo.caption || "Photo Chez Loman"}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#05100D]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          {photo.caption && (
                            <p className="text-[#F9F7F2] font-medium">{photo.caption}</p>
                          )}
                          <span className="text-[#D4AF37] text-xs uppercase tracking-wider">{photo.category}</span>
                        </div>
                      </div>
                      {photo.is_featured && (
                        <span className="absolute top-4 left-4 bg-[#D4AF37] text-[#0F2E24] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          À la une
                        </span>
                      )}
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl bg-[#05100D] border border-white/10 p-0 overflow-hidden">
                    <DialogHeader className="sr-only">
                      <DialogTitle>{photo.caption || "Photo"}</DialogTitle>
                    </DialogHeader>
                    <img 
                      src={photo.image_url} 
                      alt={photo.caption || "Photo Chez Loman"}
                      className="w-full h-auto max-h-[80vh] object-contain"
                    />
                    {photo.caption && (
                      <div className="p-6 border-t border-white/10">
                        <p className="text-[#F9F7F2]">{photo.caption}</p>
                        <span className="text-[#D4AF37] text-xs uppercase tracking-wider">{photo.category}</span>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-24">
        <div className="glass rounded-3xl p-12 md:p-16 text-center gold-border">
          <h2 className="text-3xl md:text-4xl text-[#F9F7F2] mb-4">
            Venez Créer Vos Propres Souvenirs
          </h2>
          <p className="text-[#A3B1AD] mb-8 max-w-xl mx-auto">
            Rejoignez-nous pour vivre l'expérience Chez Loman en personne
          </p>
          <a
            href="https://wa.me/2250709508819?text=Bonjour, je souhaite réserver une table"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="btn-gold text-lg">
              Réserver Maintenant
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default GalleryPage;
