import { useEffect, useState } from "react";
import "./App.css"; 
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./hooks/useTheme";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import ScrollToTop from "./components/ScrollToTop";

// Pages
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import AboutPage from "./pages/AboutPage";
import GalleryPage from "./pages/GalleryPage";
import ContactPage from "./pages/ContactPage";
import AdminPage from "./pages/AdminPage";
import DashboardPage from "./pages/DashboardPage";

// --- CONSTANTES GLOBALES (Au top niveau) ---
export const API = "/api";
export const LOGO_VIDEO_URL = "https://customer-assets.emergentagent.com/job_chezloman/artifacts/n2k28tuu_animation%20logo%20chez%20loman%20%20%28Vid%C3%A9o%20Facebook%29.mp4";
export const LOGO_IMAGE_URL = "https://customer-assets.emergentagent.com/job_chezloman/artifacts/dn3n27hs_Design%20sans%20titre.png";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    const seedData = async () => {
      try {
        await axios.post(`${API}/seed`);
      } catch (e) {
        console.log("Data may already be seeded");
      } finally {
        clearTimeout(timer);
        setIsLoading(false);
      }
    };
    seedData();
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05100D]">
        <div className="text-center">
          <img 
            src={LOGO_IMAGE_URL} 
            alt="Chez Loman" 
            className="w-32 h-32 object-cover rounded-full border-2 border-[#D4AF37]/30 mx-auto animate-pulse"
          />
          <p className="mt-4 text-[#D4AF37] font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="App min-h-screen theme-bg transition-colors duration-300">
        <BrowserRouter>
          <ScrollToTop />
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </main>
          <Footer />
          <WhatsAppButton />
          <Toaster position="top-right" />
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;