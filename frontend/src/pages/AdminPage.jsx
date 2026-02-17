import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Calendar, Image, Utensils, RefreshCw, Video, Megaphone, LogOut, Lock, User, Eye, EyeOff, X, Upload, Link, FileImage, Home, LayoutDashboard, MessageSquare, Check, ShoppingCart, Pencil, ShieldAlert } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// DÉFINITION DE L'API EN DUR POUR ÉVITER LES ERREURS D'IMPORT
const API = "/api";

const AdminPage = () => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Admin state
  const [activeTab, setActiveTab] = useState("accueil");
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [dailyMenus, setDailyMenus] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [heroContent, setHeroContent] = useState(null);
  const [allReviews, setAllReviews] = useState([]);

  // Caisse state
  const [cashSales, setCashSales] = useState([]);
  const [cashStats, setCashStats] = useState(null);
  const [cashItems, setCashItems] = useState([{ name: "", quantity: 1, price: 0 }]);
  const [cashPaymentMethod, setCashPaymentMethod] = useState("especes");
  const [cashNote, setCashNote] = useState("");
  const [submittingCash, setSubmittingCash] = useState(false);
  const [cashDate, setCashDate] = useState(new Date().toISOString().split('T')[0]);

  // DELETE SECURITY MODAL STATE
  const [showDeleteAuth, setShowDeleteAuth] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState(null);
  const [deletePassword, setDeletePassword] = useState("");

  // Daily Menu Form
  const [menuDate, setMenuDate] = useState(new Date().toISOString().split('T')[0]);
  const [menuItemsList, setMenuItemsList] = useState([""]);
  const [specialMessage, setSpecialMessage] = useState("");
  
  // Daily Menu Image States
  const [menuImageUrl, setMenuImageUrl] = useState("");
  const [menuUploadMode, setMenuUploadMode] = useState("url");
  const [menuFile, setMenuFile] = useState(null);
  const [menuPreview, setMenuPreview] = useState("");
  const menuFileRef = useRef(null);

  // Photo Form
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoCategory, setPhotoCategory] = useState("restaurant");
  const [photoUploadMode, setPhotoUploadMode] = useState("url");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoFileRef = useRef(null);

  // Video Form
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoType, setVideoType] = useState("youtube");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoUploadMode, setVideoUploadMode] = useState("url");
  const [videoFile, setVideoFile] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const videoFileRef = useRef(null);

  // Promotion Form
  const [promoTitle, setPromoTitle] = useState("");
  const [promoDescription, setPromoDescription] = useState("");
  const [promoImage, setPromoImage] = useState("");
  const [promoType, setPromoType] = useState("Promotion");
  const [promoStartDate, setPromoStartDate] = useState("");
  const [promoEndDate, setPromoEndDate] = useState("");
  const [promoUploadMode, setPromoUploadMode] = useState("url");
  const [promoFile, setPromoFile] = useState(null);
  const [promoPreview, setPromoPreview] = useState("");
  const [uploadingPromo, setUploadingPromo] = useState(false);
  const promoFileRef = useRef(null);

  // Hero Content Form
  const [heroTitleLine1, setHeroTitleLine1] = useState("");
  const [heroTitleLine2, setHeroTitleLine2] = useState("");
  const [heroDescription, setHeroDescription] = useState("");
  const [heroBackgroundImage, setHeroBackgroundImage] = useState("");
  const [heroUploadMode, setHeroUploadMode] = useState("url");
  const [heroFile, setHeroFile] = useState(null);
  const [heroPreview, setHeroPreview] = useState("");
  const [savingHero, setSavingHero] = useState(false);
  const heroFileRef = useRef(null);

  // Menu Item Form
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [menuItemName, setMenuItemName] = useState("");
  const [menuItemDescription, setMenuItemDescription] = useState("");
  const [menuItemPrice, setMenuItemPrice] = useState("");
  const [menuItemCategory, setMenuItemCategory] = useState("Plats Ivoiriens");
  const [menuItemImageUrl, setMenuItemImageUrl] = useState("");
  const [menuItemUploadMode, setMenuItemUploadMode] = useState("url");
  const [menuItemFile, setMenuItemFile] = useState(null);
  const [menuItemPreview, setMenuItemPreview] = useState("");
  const [menuItemFeatured, setMenuItemFeatured] = useState(false);
  const [submittingMenuItem, setSubmittingMenuItem] = useState(false);
  const menuItemFileRef = useRef(null);

  const MENU_CATEGORIES = ["Plats Ivoiriens", "Grillades", "Boissons", "Spécialités", "Entrées", "Desserts"];
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      try {
        const response = await axios.post(`${API}/admin/verify?token=${token}`);
        if (response.data.valid) {
          setIsAuthenticated(true);
          fetchData();
        } else {
          localStorage.removeItem("adminToken");
        }
      } catch (error) {
        localStorage.removeItem("adminToken");
      }
    }
    setIsCheckingAuth(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const response = await axios.post(`${API}/admin/login`, { username, password });
      if (response.data.success) {
        localStorage.setItem("adminToken", response.data.token);
        setIsAuthenticated(true);
        toast.success("Connexion réussie!");
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur de connexion");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => setShowLogoutConfirm(true);

  const confirmLogout = async () => {
    try { await axios.post(`${API}/admin/logout`); } catch (error) {}
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
    setShowLogoutConfirm(false);
    toast.success("Déconnexion réussie");
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [menusRes, photosRes, videosRes, promosRes, menuItemsRes, heroRes, reviewsRes] = await Promise.all([
        axios.get(`${API}/daily-menus`),
        axios.get(`${API}/gallery`),
        axios.get(`${API}/videos`),
        axios.get(`${API}/promotions`),
        axios.get(`${API}/menu`),
        axios.get(`${API}/hero-content`),
        axios.get(`${API}/reviews/all`)
      ]);
      setDailyMenus(menusRes.data);
      setPhotos(photosRes.data);
      setVideos(videosRes.data);
      setPromotions(promosRes.data);
      setMenuItems(menuItemsRes.data);
      setAllReviews(reviewsRes.data);
      setHeroContent(heroRes.data);
      if (heroRes.data) {
        setHeroTitleLine1(heroRes.data.title_line1 || "");
        setHeroTitleLine2(heroRes.data.title_line2 || "");
        setHeroDescription(heroRes.data.description || "");
        setHeroBackgroundImage(heroRes.data.background_image || "");
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
    fetchCaisseData();
  };

  const fetchCaisseData = async (date) => {
    const targetDate = date || cashDate;
    try {
      const [salesRes, statsRes] = await Promise.all([
        axios.get(`${API}/caisse/ventes?date=${targetDate}`),
        axios.get(`${API}/caisse/stats?date=${targetDate}`)
      ]);
      setCashSales(salesRes.data);
      setCashStats(statsRes.data);
    } catch (error) {}
  };

  const handleCashSaleSubmit = async (e) => {
    e.preventDefault();
    const validItems = cashItems.filter(item => item.name.trim() && item.quantity > 0 && item.price > 0);
    if (validItems.length === 0) {
      toast.error("Ajoutez au moins un plat valide");
      return;
    }
    const total = validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setSubmittingCash(true);
    try {
      await axios.post(`${API}/caisse/vente`, {
        items: validItems,
        total,
        payment_method: cashPaymentMethod,
        note: cashNote || null
      });
      toast.success("Vente enregistrée!");
      setCashItems([{ name: "", quantity: 1, price: 0 }]);
      setCashNote("");
      fetchCaisseData();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSubmittingCash(false);
    }
  };

  const addCashItem = () => setCashItems([...cashItems, { name: "", quantity: 1, price: 0 }]);
  const removeCashItem = (index) => setCashItems(cashItems.filter((_, i) => i !== index));
  const updateCashItem = (index, field, value) => {
    const newItems = [...cashItems];
    newItems[index] = { ...newItems[index], [field]: field === "name" ? value : Number(value) };
    setCashItems(newItems);
  };

  const requestDeleteSale = (saleId) => {
    setSaleToDelete(saleId);
    setDeletePassword("");
    setShowDeleteAuth(true);
  };

  const confirmDeleteSale = async () => {
    if (deletePassword !== "Jesusestroi@") {
      toast.error("Mot de passe incorrect !");
      return;
    }
    try {
      await axios.delete(`${API}/caisse/vente/${saleToDelete}`);
      toast.success("Vente supprimée avec succès");
      fetchCaisseData();
      setShowDeleteAuth(false);
      setSaleToDelete(null);
      setDeletePassword("");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post(`${API}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data.url;
  };

  // Files Handlers
  const handlePhotoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setVideoFile(file);
  };

  const handlePromoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPromoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPromoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleMenuFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMenuFile(file);
      setMenuPreview(URL.createObjectURL(file));
    }
  };

  // Submit Handlers
  const handleSubmitMenu = async (e) => {
    e.preventDefault();
    const filteredItems = menuItemsList.filter(item => item.trim() !== "");
    if (filteredItems.length === 0) {
      toast.error("Ajoutez au moins un plat");
      return;
    }
    let finalImageUrl = menuImageUrl;
    if (menuUploadMode === "file" && menuFile) {
      try { finalImageUrl = await uploadFile(menuFile); } catch (error) {
        toast.error("Erreur d'upload");
        return;
      }
    }
    try {
      await axios.post(`${API}/daily-menu`, {
        date: menuDate,
        items: filteredItems,
        special_message: specialMessage || null,
        image_url: finalImageUrl || null
      });
      toast.success("Menu du jour créé!");
      setMenuItemsList([""]);
      setSpecialMessage("");
      setMenuImageUrl("");
      setMenuFile(null);
      setMenuPreview("");
      fetchData();
    } catch (error) { toast.error("Erreur de création"); }
  };

  const handleDeleteMenu = async (menuId) => {
    if (!window.confirm("Supprimer ce menu?")) return;
    try {
      await axios.delete(`${API}/daily-menu/${menuId}`);
      toast.success("Menu supprimé");
      fetchData();
    } catch (error) { toast.error("Erreur de suppression"); }
  };

  const handleSubmitPhoto = async (e) => {
    e.preventDefault();
    let finalUrl = photoUrl;
    if (photoUploadMode === "file") {
      if (!photoFile) { toast.error("Sélectionnez une photo"); return; }
      setUploadingPhoto(true);
      try { finalUrl = await uploadFile(photoFile); } catch (error) {
        toast.error("Erreur d'upload");
        setUploadingPhoto(false);
        return;
      }
    } else if (!photoUrl.trim()) { toast.error("Entrez l'URL"); return; }
    
    try {
      await axios.post(`${API}/gallery`, {
        image_url: finalUrl,
        caption: photoCaption || null,
        category: photoCategory
      });
      toast.success("Photo ajoutée!");
      setPhotoUrl(""); setPhotoCaption(""); setPhotoFile(null); setPhotoPreview("");
      fetchData();
    } catch (error) { toast.error("Erreur"); } finally { setUploadingPhoto(false); }
  };

  const handleSubmitVideo = async (e) => {
    e.preventDefault();
    if (!videoTitle.trim()) { toast.error("Entrez un titre"); return; }
    let finalUrl = videoUrl;
    let finalType = videoType;
    if (videoUploadMode === "file") {
      if (!videoFile) { toast.error("Sélectionnez une vidéo"); return; }
      setUploadingVideo(true);
      try { finalUrl = await uploadFile(videoFile); finalType = "direct"; } catch (error) {
        toast.error("Erreur upload"); setUploadingVideo(false); return;
      }
    }
    try {
      await axios.post(`${API}/videos`, {
        title: videoTitle, video_url: finalUrl, video_type: finalType, description: videoDescription || null
      });
      toast.success("Vidéo ajoutée!");
      setVideoTitle(""); setVideoUrl(""); setVideoFile(null);
      fetchData();
    } catch (error) { toast.error("Erreur"); } finally { setUploadingVideo(false); }
  };

  const handleSubmitPromo = async (e) => {
    e.preventDefault();
    if (!promoTitle.trim() || !promoDescription.trim()) {
      toast.error("Remplissez le titre et la description");
      return;
    }
    let finalImageUrl = promoImage;
    if (promoUploadMode === "file" && promoFile) {
      setUploadingPromo(true);
      try { finalImageUrl = await uploadFile(promoFile); } catch (error) {
        toast.error("Erreur d'upload"); setUploadingPromo(false); return;
      }
    }
    try {
      await axios.post(`${API}/promotions`, {
        title: promoTitle,
        description: promoDescription,
        image_url: finalImageUrl || null,
        promo_type: promoType,
        start_date: promoStartDate || null,
        end_date: promoEndDate || null
      });
      toast.success("Promotion créée!");
      setPromoTitle(""); setPromoDescription(""); setPromoImage(""); setPromoFile(null); setPromoPreview("");
      fetchData();
    } catch (error) { toast.error("Erreur"); } finally { setUploadingPromo(false); }
  };

  const handleSubmitHero = async (e) => {
    e.preventDefault();
    setSavingHero(true);
    let finalImageUrl = heroBackgroundImage;
    if (heroUploadMode === "file" && heroFile) {
      try { finalImageUrl = await uploadFile(heroFile); } catch (error) {
        toast.error("Erreur upload"); setSavingHero(false); return;
      }
    }
    try {
      await axios.put(`${API}/hero-content`, {
        title_line1: heroTitleLine1 || undefined,
        title_line2: heroTitleLine2 || undefined,
        description: heroDescription || undefined,
        background_image: finalImageUrl || undefined
      });
      toast.success("Accueil mis à jour!");
      setHeroFile(null); setHeroPreview(""); fetchData();
    } catch (error) { toast.error("Erreur"); } finally { setSavingHero(false); }
  };

  // Reusable Upload Mode Toggle with Theme Support
  const UploadModeToggle = ({ mode, setMode }) => (
    <div className="flex gap-2 mb-4">
      <button
        type="button"
        onClick={() => setMode("url")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
          mode === "url" 
          ? "bg-[#D4AF37] text-[#0F2E24]" 
          : "bg-white dark:bg-white/5 text-gray-700 dark:text-[#A3B1AD] border border-gray-200 dark:border-white/10"
        }`}
      >
        <Link size={16} /> Lien URL
      </button>
      <button
        type="button"
        onClick={() => setMode("file")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
          mode === "file" 
          ? "bg-[#D4AF37] text-[#0F2E24]" 
          : "bg-white dark:bg-white/5 text-gray-700 dark:text-[#A3B1AD] border border-gray-200 dark:border-white/10"
        }`}
      >
        <Upload size={16} /> Depuis l'appareil
      </button>
    </div>
  );

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#05100D] pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-[#A3B1AD]">Vérification...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#05100D] pt-32 pb-24 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-6">
          <div className="bg-gray-50 dark:bg-[#0A1F1A] border border-gray-200 dark:border-white/5 p-8 md:p-10 rounded-3xl shadow-xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="text-[#D4AF37]" size={36} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-[#F9F7F2]">Administration</h1>
              <p className="text-gray-500 dark:text-[#A3B1AD] mt-2">Connectez-vous pour gérer le restaurant</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label className="text-gray-700 dark:text-[#A3B1AD] mb-2 block">Nom d'utilisateur</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="bg-white dark:bg-black/20 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white pl-12" required />
                </div>
              </div>
              <div>
                <Label className="text-gray-700 dark:text-[#A3B1AD] mb-2 block">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white dark:bg-black/20 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white pl-12 pr-12" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4AF37]">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loginLoading} className="w-full bg-[#D4AF37] text-white py-6 text-lg hover:bg-[#C4A030]">
                {loginLoading ? "Connexion..." : "Se Connecter"}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#05100D] pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.3em] mb-2 block">Espace Administrateur</span>
            <h1 className="text-3xl md:text-4xl text-gray-900 dark:text-[#F9F7F2]">Gestion du Restaurant</h1>
          </motion.div>
          <div className="flex items-center gap-4">
            <RouterLink to="/dashboard" className="bg-[#D4AF37] text-white rounded-full px-6 py-2 flex items-center gap-2 text-sm font-semibold transition-all">
              <LayoutDashboard size={16} /> Dashboard Pro
            </RouterLink>
            <Button onClick={fetchData} className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-[#A3B1AD] hover:text-[#D4AF37] rounded-full px-6">
              <RefreshCw size={16} className="mr-2" /> Actualiser
            </Button>
            <Button onClick={handleLogout} className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-500 dark:text-red-400 rounded-full px-6">
              <LogOut size={16} className="mr-2" /> Déconnexion
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-10 pb-4 border-b border-gray-100 dark:border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[#D4AF37] text-white"
                  : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-[#A3B1AD] border border-gray-200 dark:border-white/10 hover:border-[#D4AF37]/50"
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* ACCUEIL / HERO */}
        {activeTab === "accueil" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-50 dark:bg-[#0A1F1A] border border-gray-200 dark:border-white/5 p-8 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-6"><Home className="text-[#D4AF37]" size={24} /><h2 className="text-xl text-gray-900 dark:text-[#F9F7F2] font-semibold">Message d'Accueil</h2></div>
              <form onSubmit={handleSubmitHero} className="space-y-5">
                <div>
                  <Label className="text-gray-600 dark:text-[#A3B1AD] mb-2 block">Titre - Ligne 1</Label>
                  <Input placeholder="Ex: Ici c'est manger" value={heroTitleLine1} onChange={(e) => setHeroTitleLine1(e.target.value)} className="bg-white dark:bg-black/20 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400" />
                </div>
                <div>
                  <Label className="text-gray-600 dark:text-[#A3B1AD] mb-2 block">Titre - Ligne 2 (Doré)</Label>
                  <Input placeholder="Ex: bien hein" value={heroTitleLine2} onChange={(e) => setHeroTitleLine2(e.target.value)} className="bg-white dark:bg-black/20 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400" />
                </div>
                <div>
                  <Label className="text-gray-600 dark:text-[#A3B1AD] mb-2 block">Description</Label>
                  <Textarea placeholder="Ex: Découvrez les meilleures saveurs de Yopougon..." value={heroDescription} onChange={(e) => setHeroDescription(e.target.value)} className="bg-white dark:bg-black/20 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 min-h-[100px]" />
                </div>
                <div>
                  <Label className="text-gray-600 dark:text-[#A3B1AD] mb-2 block">Image d'arrière-plan</Label>
                  <UploadModeToggle mode={heroUploadMode} setMode={setHeroUploadMode} />
                  {heroUploadMode === "url" ? (
                    <Input type="url" placeholder="Lien vers l'image" value={heroBackgroundImage} onChange={(e) => setHeroBackgroundImage(e.target.value)} className="bg-white dark:bg-black/20 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white" />
                  ) : (
                    <div onClick={() => heroFileRef.current?.click()} className="border-2 border-dashed border-gray-300 dark:border-[#D4AF37]/30 rounded-xl p-6 text-center cursor-pointer hover:border-[#D4AF37]/50">
                      <FileImage className="mx-auto text-[#D4AF37] mb-2" size={32} />
                      <p className="text-gray-500 text-sm">Cliquez pour sélectionner une image</p>
                      <input ref={heroFileRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if(f){ setHeroFile(f); setHeroPreview(URL.createObjectURL(f)); }}} className="hidden" />
                      {heroFile && <p className="text-[#D4AF37] text-sm mt-2">{heroFile.name}</p>}
                    </div>
                  )}
                </div>
                <Button type="submit" disabled={savingHero} className="w-full bg-[#D4AF37] text-white py-4 hover:bg-[#C4A030]">{savingHero ? "Enregistrement..." : "Enregistrer les modifications"}</Button>
              </form>
            </motion.div>
            <div className="space-y-4">
              <h3 className="text-lg text-gray-900 dark:text-[#F9F7F2] font-semibold">Aperçu en direct</h3>
              <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-white/10">
                <img src={heroPreview || heroBackgroundImage || "https://customer-assets.emergentagent.com/job_loman-restaurant/artifacts/jde9y3pb_chl.jpg"} className="w-full h-full object-cover" alt="Preview" />
                <div className="absolute inset-0 bg-black/60 p-6 flex flex-col justify-center">
                  <h2 className="text-2xl font-accent italic text-white">{heroTitleLine1 || "Ici c'est manger"}<br/><span className="text-[#D4AF37]">{heroTitleLine2 || "bien hein"}</span></h2>
                  <p className="text-xs text-white/70 mt-2 line-clamp-2">{heroDescription || "Votre description apparaîtra ici..."}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MENU DU JOUR */}
        {activeTab === "menu" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-50 dark:bg-[#0A1F1A] border border-gray-200 dark:border-white/5 p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-6"><Calendar className="text-[#D4AF37]" size={24} /><h2 className="text-xl text-gray-900 dark:text-[#F9F7F2] font-semibold">Nouveau Menu du Jour</h2></div>
              <form onSubmit={handleSubmitMenu} className="space-y-5">
                <div><Label className="text-gray-600 dark:text-[#A3B1AD] mb-2 block">Date</Label><Input type="date" value={menuDate} onChange={(e) => setMenuDate(e.target.value)} className="bg-white dark:bg-black/20 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white" /></div>
                <div>
                  <Label className="text-gray-600 dark:text-[#A3B1AD] mb-2 block">Plats</Label>
                  {menuItemsList.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input placeholder={`Plat ${index+1}`} value={item} onChange={(e) => { const n = [...menuItemsList]; n[index] = e.target.value; setMenuItemsList(n); }} className="bg-white dark:bg-black/20 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400" />
                      {menuItemsList.length > 1 && <Button type="button" onClick={() => setMenuItemsList(menuItemsList.filter((_, i) => i !== index))} className="bg-red-500 text-white"><X size={18}/></Button>}
                    </div>
                  ))}
                  <Button type="button" onClick={() => setMenuItemsList([...menuItemsList, ""])} className="text-[#D4AF37] text-xs">+ Ajouter un plat</Button>
                </div>
                <div className="mt-4">
                  <Label className="text-gray-600 dark:text-[#A3B1AD] mb-2 block">Affiche (Image)</Label>
                  <UploadModeToggle mode={menuUploadMode} setMode={setMenuUploadMode} />
                  {menuUploadMode === "url" ? (
                    <Input placeholder="Lien image" value={menuImageUrl} onChange={e => setMenuImageUrl(e.target.value)} className="bg-white dark:bg-black/20 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white" />
                  ) : (
                    <div onClick={() => menuFileRef.current?.click()} className="border-2 border-dashed border-gray-300 dark:border-white/10 p-6 rounded-xl text-center cursor-pointer hover:border-[#D4AF37]">
                      <Upload className="mx-auto text-[#D4AF37] mb-2" /><p className="text-xs text-gray-500">Uploader l'affiche</p>
                      <input ref={menuFileRef} type="file" className="hidden" accept="image/*" onChange={handleMenuFileChange} />
                    </div>
                  )}
                  {(menuPreview || menuImageUrl) && <img src={menuPreview || menuImageUrl} className="mt-3 w-32 h-32 object-cover rounded-lg shadow-md border border-gray-200" alt="Preview" />}
                </div>
                <Button type="submit" className="w-full bg-[#D4AF37] text-white py-4">Publier le Menu</Button>
              </form>
            </motion.div>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              <h3 className="text-lg text-gray-900 dark:text-[#F9F7F2] font-semibold">Menus récents</h3>
              {dailyMenus.map(menu => (
                <div key={menu.id} className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-5 rounded-xl flex justify-between items-start">
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${menu.is_active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"}`}>{menu.is_active ? "Actif" : "Inactif"}</span>
                    <p className="text-gray-900 dark:text-white font-semibold mt-2">{new Date(menu.date).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500 mt-1">{menu.items.join(", ")}</p>
                  </div>
                  <Button onClick={() => handleDeleteMenu(menu.id)} className="text-red-500"><Trash2 size={18}/></Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROMOTIONS / EVENTS */}
        {activeTab === "promos" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-50 dark:bg-[#0A1F1A] border border-gray-200 dark:border-white/5 p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-6"><Megaphone className="text-[#D4AF37]" size={24} /><h2 className="text-xl text-gray-900 dark:text-[#F9F7F2] font-semibold">Nouvelle Actualité / Pub</h2></div>
              <form onSubmit={handleSubmitPromo} className="space-y-5">
                <div><Label className="text-gray-600 dark:text-[#A3B1AD] block mb-2">Titre *</Label><Input placeholder="Ex: Concert Gospel / -20% sur Plats" value={promoTitle} onChange={e => setPromoTitle(e.target.value)} className="bg-white dark:bg-black/20 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400" required /></div>
                <div><Label className="text-gray-600 dark:text-[#A3B1AD] block mb-2">Type d'affichage</Label>
                  <select value={promoType} onChange={e => setPromoType(e.target.value)} className="w-full bg-white dark:bg-black/20 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white p-3 rounded-lg text-sm">
                    <option value="Promotion">Promotion (Resto)</option>
                    <option value="Concert">Concert / Événement</option>
                    <option value="Biblique">Message Biblique</option>
                    <option value="Annonce">Annonce Générale</option>
                  </select>
                </div>
                <div><Label className="text-gray-600 dark:text-[#A3B1AD] block mb-2">Description / Message *</Label><Textarea placeholder="Contenu de la pub..." value={promoDescription} onChange={e => setPromoDescription(e.target.value)} className="bg-white dark:bg-black/20 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 min-h-[100px]" required /></div>
                <div><Label className="text-gray-600 dark:text-[#A3B1AD] block mb-2">Affiche / Image</Label>
                  <UploadModeToggle mode={promoUploadMode} setMode={setPromoUploadMode} />
                  {promoUploadMode === "url" ? <Input placeholder="URL image" value={promoImage} onChange={e => setPromoImage(e.target.value)} className="bg-white dark:bg-black/20 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white" /> : <Input type="file" accept="image/*" onChange={handlePromoFileChange} className="bg-white dark:bg-black/20 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white" />}
                </div>
                <div><Label className="text-gray-600 dark:text-[#A3B1AD] block mb-2">Date (Optionnel pour Concert/Evenement)</Label><Input type="date" value={promoEndDate} onChange={e => setPromoEndDate(e.target.value)} className="bg-white dark:bg-black/20 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white" /></div>
                <Button type="submit" disabled={uploadingPromo} className="w-full bg-[#D4AF37] text-white py-4">{uploadingPromo ? "Upload..." : "Créer l'annonce"}</Button>
              </form>
            </motion.div>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              <h3 className="text-lg text-gray-900 dark:text-[#F9F7F2] font-semibold">Annonces actives</h3>
              {promotions.map(promo => (
                <div key={promo.id} className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-4 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div><span className="text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-1 rounded-full font-bold">{promo.promo_type}</span><h4 className="font-semibold text-gray-900 dark:text-white mt-1">{promo.title}</h4></div>
                    <Switch checked={promo.is_active} onCheckedChange={() => handleTogglePromo(promo.id, promo.is_active)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CAISSE */}
        {activeTab === "caisse" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-[#0A1F1A] border border-gray-200 dark:border-white/5 p-4 rounded-2xl text-center shadow-sm">
                <p className="text-gray-500 dark:text-[#A3B1AD] text-xs mb-1">Ventes du jour</p>
                <p className="text-2xl font-bold text-[#D4AF37]">{cashStats?.total_sales || 0}</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#0A1F1A] border border-gray-200 dark:border-white/5 p-4 rounded-2xl text-center shadow-sm">
                <p className="text-gray-500 dark:text-[#A3B1AD] text-xs mb-1">Chiffre d'affaires</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-[#F9F7F2]">{(cashStats?.total_revenue || 0).toLocaleString()} F</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#0A1F1A] border border-gray-200 dark:border-white/5 p-4 rounded-2xl text-center shadow-sm">
                <p className="text-gray-500 dark:text-[#A3B1AD] text-xs mb-1">Espèces</p>
                <p className="text-2xl font-bold text-green-500">{(cashStats?.cash_total || 0).toLocaleString()} F</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#0A1F1A] border border-gray-200 dark:border-white/5 p-4 rounded-2xl text-center shadow-sm">
                <p className="text-gray-500 dark:text-[#A3B1AD] text-xs mb-1">Mobile Money</p>
                <p className="text-2xl font-bold text-blue-500">{(cashStats?.mobile_money_total || 0).toLocaleString()} F</p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#0A1F1A] border border-gray-200 dark:border-white/5 p-6 rounded-2xl shadow-sm">
              <h3 className="text-lg font-semibold text-[#D4AF37] mb-6 flex items-center gap-2"><ShoppingCart size={20} /> Enregistrer une vente</h3>
              <form onSubmit={handleCashSaleSubmit} className="space-y-4">
                {cashItems.map((item, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-3 items-end">
                    <div className="w-full md:flex-1">
                      {index === 0 && <Label className="text-gray-500 text-xs mb-1 block">Plat</Label>}
                      <select value={item.name} onChange={(e) => { const s = menuItems.find(m => m.name === e.target.value); const n = [...cashItems]; n[index] = {...n[index], name: e.target.value, price: s ? s.price : n[index].price}; setCashItems(n); }} className="w-full bg-white dark:bg-black/20 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white rounded-lg p-2.5 text-sm">
                        <option value="">Choisir un plat...</option>
                        {menuItems.filter(m => m.is_available).map(m => <option key={m.id} value={m.name}>{m.name} ({m.price} F)</option>)}
                      </select>
                    </div>
                    <div className="w-full md:w-24">
                      {index === 0 && <Label className="text-gray-500 text-xs mb-1 block">Qté</Label>}
                      <Input type="number" min="1" value={item.quantity} onChange={e => updateCashItem(index, "quantity", e.target.value)} className="bg-white dark:bg-black/20 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white" />
                    </div>
                    <div className="w-full md:w-32">
                      {index === 0 && <Label className="text-gray-500 text-xs mb-1 block">Prix</Label>}
                      <Input type="number" value={item.price} onChange={e => updateCashItem(index, "price", e.target.value)} className="bg-white dark:bg-black/20 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white" />
                    </div>
                    {cashItems.length > 1 && <Button type="button" onClick={() => removeCashItem(index)} className="bg-red-500 text-white p-2.5 rounded-lg"><Trash2 size={16}/></Button>}
                  </div>
                ))}
                <div className="flex flex-col md:flex-row gap-4 items-center pt-4">
                  <Button type="button" onClick={addCashItem} className="bg-gray-100 dark:bg-white/5 text-[#D4AF37] hover:bg-gray-200">+ Ajouter ligne</Button>
                  <div className="md:ml-auto text-xl font-bold text-[#D4AF37]">Total: {cashItems.reduce((s, i) => s + (i.price * i.quantity), 0).toLocaleString()} F</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div>
                    <Label className="text-gray-500 text-xs mb-2 block">Paiement</Label>
                    <div className="flex gap-2">
                      <Button type="button" onClick={() => setCashPaymentMethod("especes")} className={`flex-1 ${cashPaymentMethod === "especes" ? "bg-green-500 text-white" : "bg-gray-100 dark:bg-white/5 text-gray-500"}`}>Espèces</Button>
                      <Button type="button" onClick={() => setCashPaymentMethod("mobile_money")} className={`flex-1 ${cashPaymentMethod === "mobile_money" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-white/5 text-gray-500"}`}>MoMo</Button>
                    </div>
                  </div>
                  <div><Label className="text-gray-500 text-xs mb-2 block">Note</Label><Input value={cashNote} onChange={e => setCashNote(e.target.value)} placeholder="Ex: Table 4" className="bg-white dark:bg-black/20 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white" /></div>
                </div>
                <Button type="submit" disabled={submittingCash} className="w-full bg-[#D4AF37] text-white py-6 text-lg mt-6 shadow-lg shadow-[#D4AF37]/20">Enregistrer la vente</Button>
              </form>
            </div>

            <div className="bg-gray-50 dark:bg-[#0A1F1A] border border-gray-200 dark:border-white/5 p-6 rounded-2xl shadow-sm">
               <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F9F7F2] mb-4">Dernières ventes</h3>
               <div className="space-y-3">
                 {cashSales.map(sale => (
                   <div key={sale.id} className="bg-white dark:bg-white/5 p-4 rounded-xl flex justify-between items-center shadow-sm">
                     <div>
                       <p className="text-sm font-medium text-gray-900 dark:text-white">{sale.items.map(i => `${i.name} x${i.quantity}`).join(", ")}</p>
                       <p className="text-[10px] text-gray-500">{new Date(sale.created_at).toLocaleTimeString()} - {sale.payment_method}</p>
                     </div>
                     <div className="flex items-center gap-4">
                       <span className="font-bold text-[#D4AF37]">{sale.total.toLocaleString()} F</span>
                       <Button onClick={() => requestDeleteSale(sale.id)} className="text-red-400 hover:text-red-500"><Trash2 size={16}/></Button>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}
      </div>

      {/* DELETE SECURITY MODAL */}
      <AnimatePresence>
        {showDeleteAuth && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#0A1F1A] border border-[#D4AF37]/30 rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl shadow-black/50">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20"><ShieldAlert size={40} className="text-red-500" /></div>
              <h3 className="text-2xl font-bold text-[#F9F7F2] mb-2">Sécurité Admin</h3>
              <p className="text-[#A3B1AD] text-sm mb-8">Action sensible. Entrez le mot de passe pour confirmer la suppression.</p>
              <div className="mb-8"><Input type="password" placeholder="Mot de passe secret" className="bg-black/40 border-[#D4AF37]/20 text-white text-center text-xl tracking-[0.5em] h-14" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} autoFocus /></div>
              <div className="flex gap-4">
                <Button onClick={() => setShowDeleteAuth(false)} className="flex-1 bg-white/5 border border-white/10 text-[#A3B1AD] hover:bg-white/10 py-6">Annuler</Button>
                <Button onClick={confirmDeleteSale} className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white border-0 shadow-lg shadow-red-900/20 py-6 font-bold">Confirmer</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOGOUT MODAL */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#0F2E24] border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center">
              <LogOut size={32} className="text-[#D4AF37] mx-auto mb-3" />
              <h3 className="text-lg font-bold text-[#F9F7F2] mb-2">Se déconnecter ?</h3>
              <div className="flex gap-3 mt-6">
                <Button onClick={() => setShowLogoutConfirm(false)} className="flex-1 bg-white/10 text-white">Annuler</Button>
                <Button onClick={confirmLogout} className="flex-1 bg-red-500 hover:bg-red-600 text-white">Déconnexion</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPage;