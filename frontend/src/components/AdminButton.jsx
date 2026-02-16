import { Link } from "react-router-dom";
import { Settings } from "lucide-react";

const AdminButton = () => {
  return (
    <Link
      to="/admin"
      className="fixed bottom-8 left-8 z-50 bg-[#D4AF37] hover:bg-[#F2CC8F] text-[#0F2E24] p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center gap-2 group"
      data-testid="admin-floating-btn"
      aria-label="Administration"
    >
      <Settings size={24} className="group-hover:rotate-90 transition-transform duration-300" />
      <span className="hidden group-hover:inline font-semibold pr-2">Admin</span>
    </Link>
  );
};

export default AdminButton;
