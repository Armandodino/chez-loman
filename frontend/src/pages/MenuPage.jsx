import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../App";
import MenuCard from "../components/MenuCard";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", label: "Tous les Plats" },
    { id: "Plats Ivoiriens", label: "Plats Ivoiriens" },
    { id: "Grillades", label: "Grillades" },
    { id: "Spécialités", label: "Spécialités" },
    { id: "Boissons", label: "Boissons" },
  ];

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get(`${API}/menu`);
        setMenuItems(response.data);
      } catch (error) {
        console.error("Error fetching menu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const filteredItems = activeCategory === "all" 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#05100D] pt-32 pb-24" data-testid="menu-page">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.3em] mb-4 block">
            Notre Carte
          </span>
          <h1 className="text-5xl md:text-6xl text-[#F9F7F2] mb-4">
            La Carte
          </h1>
          <div className="divider-gold mb-6"></div>
          <p className="text-lg text-[#A3B1AD] leading-relaxed">
            Des plats authentiques ivoiriens préparés avec des ingrédients frais, 
            sélectionnés avec soin pour vous offrir une expérience culinaire d'exception.
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
              data-testid={`category-${cat.id}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 bg-white/5 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#A3B1AD] text-lg">Aucun plat dans cette catégorie</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <MenuCard item={item} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-24">
        <div className="glass rounded-3xl p-12 md:p-16 text-center gold-border">
          <h2 className="text-3xl md:text-4xl text-[#F9F7F2] mb-4">
            Envie de Commander ?
          </h2>
          <p className="text-[#A3B1AD] mb-8 max-w-xl mx-auto">
            Contactez-nous directement sur WhatsApp pour passer votre commande rapidement
          </p>
          <a
            href="https://wa.me/2250709508819?text=Bonjour, je souhaite passer une commande"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="btn-gold text-lg">
              Commander sur WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default MenuPage;
