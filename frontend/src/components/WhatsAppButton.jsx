import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/2250709508819?text=Bonjour, je souhaite passer une commande chez Loman"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 right-8 z-50 whatsapp-luxury p-4 rounded-full"
      data-testid="whatsapp-floating-btn"
      aria-label="Commander sur WhatsApp"
    >
      <MessageCircle size={28} className="text-white" fill="white" />
    </a>
  );
};

export default WhatsAppButton;
