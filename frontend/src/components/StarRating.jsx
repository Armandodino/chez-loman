import { Star } from "lucide-react";

const StarRating = ({ rating, size = 14 }) => {
  return (
    <div className="flex gap-1" data-testid="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={`${
            star <= rating 
              ? "text-[#D4AF37] fill-[#D4AF37]" 
              : "text-[#A3B1AD]/30"
          }`}
        />
      ))}
    </div>
  );
};

export default StarRating;
