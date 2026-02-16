import { Button } from "./ui/button";
import { ExternalLink } from "lucide-react";

const MenuCard = ({ item }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const handleOrder = () => {
    const message = `Bonjour, je souhaite commander: ${item.name} (${formatPrice(item.price)} FCFA)`;
    window.open(`https://wa.me/2250709508819?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div 
      className="menu-item-luxury group"
      data-testid={`menu-card-${item.id}`}
    >
      <div className="relative h-52 overflow-hidden">
        <img 
          src={item.image_url} 
          alt={item.name}
          className="w-full h-full object-cover img-luxury"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05100D] via-transparent to-transparent"></div>
        {item.is_featured && (
          <span className="absolute top-4 left-4 bg-[#D4AF37] text-[#0F2E24] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Signature
          </span>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="text-[#D4AF37] text-[10px] font-semibold uppercase tracking-[0.15em]">
              {item.category}
            </span>
            <h3 className="text-lg font-medium text-[#F9F7F2] mt-1">
              {item.name}
            </h3>
          </div>
          <span className="price-gold text-xl">
            {formatPrice(item.price)} <span className="text-sm">F</span>
          </span>
        </div>
        
        <p className="text-sm text-[#A3B1AD] mb-5 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
        
        <Button 
          onClick={handleOrder}
          className="w-full bg-transparent border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0F2E24] rounded-full transition-all duration-400"
          data-testid={`order-btn-${item.id}`}
        >
          Commander
          <ExternalLink size={14} className="ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default MenuCard;
