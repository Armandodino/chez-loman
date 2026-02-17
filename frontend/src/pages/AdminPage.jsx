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
  const [menuImageUrl, setMenuImageUrl] = useState("");
  const [menuUploadMode, setMenuUploadMode] = useState("url");
  const [menuFile, setMenuFile] = useState(null);
  const [menuPreview, setMenuPreview] = useState("");
  const menuFileRef = useRef(null);

  // Form states (Photos, Videos, Promos, Hero, Items)
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoCategory, setPhotoCategory] = useState("restaurant");
  const [photoUploadMode, setPhotoUploadMode] = useState("url");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoFileRef = useRef(null);

  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoType, setVideoType] = useState("youtube");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoUploadMode, setVideoUploadMode] = useState("url");
  const [videoFile, setVideoFile] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const videoFileRef = useRef(null);

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

  const [heroTitleLine1, setHeroTitleLine1] = useState("");
  const [heroTitleLine2, setHeroTitleLine2] = useState("");
  const [heroDescription, setHeroDescription] = useState("");
  const [heroBackgroundImage, setHeroBackgroundImage] = useState("");
  const [heroUploadMode, setHeroUploadMode] = useState("url");
  const [heroFile, setHeroFile] = useState(null);
  const [heroPreview, setHeroPreview] = useState("");
  const [savingHero, setSavingHero] = useState(false);
  const heroFileRef = useRef(null);

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

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const updateCashItem = (index, field, value) => {
    const newItems = [...cashItems];
    newItems[index] = { ...newItems[index], [field]: field === "name" ? value : Number(value) };
    setCashItems(newItems);
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

  const handleMenuFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMenuFile(file);
      setMenuPreview(URL.createObjectURL(file));
    }
  };

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

  const handleSubmitMenuItem = async (e) => {
    e.preventDefault();
    if (!menuItemName.trim() || !menuItemDescription.trim() || !menuItemPrice) {
      toast.error("Remplissez tous les champs obligatoires");
      return;
    }
    setSubmittingMenuItem(true);
    let finalImageUrl = menuItemImageUrl;
    if (menuItemUploadMode === "file" && menuItemFile) {
      try { finalImageUrl = await uploadFile(menuItemFile); } catch (error) {
        toast.error("Erreur upload"); setSubmittingMenuItem(false); return;
      }
    }
    try {
      if (editingMenuItem) {
        const params = new URLSearchParams();
        params.append("name", menuItemName);
        params.append("description", menuItemDescription);
        params.append("price", menuItemPrice);
        params.append("category", menuItemCategory);
        params.append("is_featured", menuItemFeatured.toString());
        if (finalImageUrl) params.append("image_url", finalImageUrl);
        await axios.put(`${API}/menu/${editingMenuItem.id}?${params.toString()}`);
        toast.success("Plat modifié!");
      } else {
        await axios.post(`${API}/menu`, {
          name: menuItemName, description: menuItemDescription, price: parseInt(menuItemPrice),
          category: menuItemCategory, image_url: finalImageUrl, is_featured: menuItemFeatured
        });
        toast.success("Plat ajouté!");
      }
      resetMenuForm(); fetchData();
    } catch (error) { toast.error("Erreur"); } finally { setSubmittingMenuItem(false); }
  };

  const resetMenuForm = () => {
    setShowMenuForm(false);
    setEditingMenuItem(null);
    setMenuItemName("");
    setMenuItemDescription("");
    setMenuItemPrice("");
    setMenuItemCategory("Plats Ivoiriens");
    setMenuItemImageUrl("");
    setMenuItemUploadMode("url");
    setMenuItemFile(null);
    setMenuItemPreview("");
    setMenuItemFeatured(false);
  };

  const openEditMenuItem = (item) => {
    setEditingMenuItem(item);
    setMenuItemName(item.name);
    setMenuItemDescription(item.description);
    setMenuItemPrice(item.price.toString());
    setMenuItemCategory(item.category);
    setMenuItemImageUrl(item.image_url);
    setMenuItemFeatured(item.is_featured);
    setMenuItemUploadMode("url");
    setShowMenuForm(true);
  };

  const handleToggleMenuItem = async (itemId, field, currentValue) => {
    try {
      const params = new URLSearchParams();
      params.append(field, (!currentValue).toString());
      await axios.put(`${API}/menu/${itemId}?${params.toString()}`);
      fetchData();
    } catch (error) { toast.error("Erreur"); }
  };

  const handleDeleteMenuItem = async (itemId) => {
    if (!window.confirm("Supprimer ce plat?")) return;
    try {
      await axios.delete(`${API}/menu/${itemId}`);
      fetchData();
    } catch (error) { toast.error("Erreur"); }
  };

  const handleTogglePromo = async (promoId, isActive) => {
    try {
      await axios.put(`${API}/promotions/${promoId}`, { is_active: !isActive });
      fetchData();
    } catch (error) { toast.error("Erreur"); }
  };

  const handleDeletePromo = async (promoId) => {
    if (!window.confirm("Supprimer cette promotion?")) return;
    try {
      await axios.delete(`${API}/promotions/${promoId}`);
      fetchData();
    } catch (error) { toast.error("Erreur"); }
  };

  const handleToggleVideo = async (videoId, isActive) => {
    try {
      await axios.put(`${API}/videos/${videoId}?is_active=${!isActive}`);
      fetchData();
    } catch (error) { toast.error("Erreur"); }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm("Supprimer cette vidéo?")) return;
    try {
      await axios.delete(`${API}/videos/${videoId}`);
      fetchData();
    } catch (error) { toast.error("Erreur"); }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm("Supprimer cette photo?")) return;
    try {
      await axios.delete(`${API}/gallery/${photoId}`);
      fetchData();
    } catch (error) { toast.error("Erreur"); }
  };

  const getYouTubeId = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const tabs = [
    { id: "accueil", label: "Accueil", icon: Home },
    { id: "menu", label: "Menu du Jour", icon: Calendar },
    { id: "photos", label: "Photos", icon: Image },
    { id: "videos", label: "Vidéos", icon: Video },
    { id: "promos", label: "Promotions", icon: Megaphone },
    { id: "plats", label: "Gestion Plats", icon: Utensils },
    { id: "commentaires", label: "Commentaires", icon: MessageSquare },
    { id: "caisse", label: "Caisse", icon: ShoppingCart },
  ];

  const UploadModeToggle = ({ mode, setMode }) => (
    <div className="flex gap-2 mb-4">
      <button
        type="button"
        onClick={() => setMode("url")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
          mode === "url" 
          ? "bg-[#D4AF37] text-[#0F2E24]" 
          : "bg-white/5 text-[#A3B1AD] border border-white/10 shadow-sm"
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
          : "bg-white/5 text-[#A3B1AD] border border-white/10 shadow-sm"
        }`}
      >
        <Upload size={16} /> Depuis l'appareil
      </button>
    </div>
  );

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#05100D] pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#A3B1AD]">Vérification...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#05100D] pt-32 pb-24 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-6">
          <div className="luxury-card p-8 md:p-10 rounded-3xl shadow-xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="text-[#D4AF37]" size={36} />
              </div>
              <h1 className="text-2xl font-bold text-[#F9F7F2]">Administration</h1>
              <p className="text-[#A3B1AD] mt-2">Connectez-vous pour gérer le restaurant</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label className="text-[#A3B1AD] mb-2 block">Nom d'utilisateur</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3B1AD]" size={18} />
                  <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="input-luxury pl-12" required />
                </div>
              </div>
              <div>
                <Label className="text-[#A3B1AD] mb-2 block">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3B1AD]" size={18} />
                  <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="input-luxury pl-12 pr-12" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3B1AD] hover:text-[#D4AF37]">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loginLoading} className="w-full btn-gold py-6 text-lg">
                {loginLoading ? "Connexion..." : "Se Connecter"}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05100D] pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.3em] mb-2 block">Espace Administrateur</span>
            <h1 className="text-3xl md:text-4xl text-[#F9F7F2]">Gestion du Restaurant</h1>
          </motion.div>
          <div className="flex items-center gap-4">
            <RouterLink to="/dashboard" className="bg-[#D4AF37] text-[#0F2E24] rounded-full px-6 py-2 flex items-center gap-2 text-sm font-semibold transition-all">
              <LayoutDashboard size={16} /> Dashboard Pro
            </RouterLink>
            <Button onClick={fetchData} className="bg-white/5 border border-white/10 text-[#A3B1AD] hover:text-[#D4AF37] rounded-full px-6 shadow-sm">
              <RefreshCw size={16} className="mr-2" /> Actualiser
            </Button>
            <Button onClick={handleLogout} className="bg-red-500/20 border border-red-500/30 text-red-400 rounded-full px-6 shadow-sm">
              <LogOut size={16} className="mr-2" /> Déconnexion
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-10 pb-4 border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[#D4AF37] text-[#0F2E24] shadow-lg shadow-[#D4AF37]/20"
                  : "bg-white/5 text-[#A3B1AD] border border-white/10 hover:border-[#D4AF37]/50"
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* ACCUEIL / HERO */}
        {activeTab === "accueil" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="luxury-card p-8 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-6"><Home className="text-[#D4AF37]" size={24} /><h2 className="text-xl text-[#F9F7F2] font-semibold">Message d'Accueil</h2></div>
              <form onSubmit={handleSubmitHero} className="space-y-5">
                <div>
                  <Label className="text-[#A3B1AD] mb-2 block font-medium">Titre - Ligne 1</Label>
                  <Input placeholder="Ex: Ici c'est manger" value={heroTitleLine1} onChange={(e) => setHeroTitleLine1(e.target.value)} className="input-luxury" />
                </div>
                <div>
                  <Label className="text-[#A3B1AD] mb-2 block font-medium">Titre - Ligne 2 (Doré)</Label>
                  <Input placeholder="Ex: bien hein" value={heroTitleLine2} onChange={(e) => setHeroTitleLine2(e.target.value)} className="input-luxury" />
                </div>
                <div>
                  <Label className="text-[#A3B1AD] mb-2 block font-medium">Description</Label>
                  <Textarea placeholder="Ex: Découvrez les meilleures saveurs de Yopougon..." value={heroDescription} onChange={(e) => setHeroDescription(e.target.value)} className="input-luxury min-h-[100px]" />
                </div>
                <div>
                  <Label className="text-[#A3B1AD] mb-2 block font-medium">Image d'arrière-plan</Label>
                  <UploadModeToggle mode={heroUploadMode} setMode={setHeroUploadMode} />
                  {heroUploadMode === "url" ? (
                    <Input type="url" placeholder="Lien vers l'image" value={heroBackgroundImage} onChange={(e) => setHeroBackgroundImage(e.target.value)} className="input-luxury" />
                  ) : (
                    <div onClick={() => heroFileRef.current?.click()} className="border-2 border-dashed border-[#D4AF37]/30 rounded-xl p-6 text-center cursor-pointer hover:border-[#D4AF37]/50 transition-all">
                      <FileImage className="mx-auto text-[#D4AF37] mb-2" size={32} />
                      <p className="text-[#A3B1AD] text-sm">Cliquez pour sélectionner une image</p>
                      <input ref={heroFileRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if(f){ setHeroFile(f); setHeroPreview(URL.createObjectURL(f)); }}} className="hidden" />
                      {heroFile && <p className="text-[#D4AF37] text-sm mt-2 font-medium">{heroFile.name}</p>}
                    </div>
                  )}
                </div>
                <Button type="submit" disabled={savingHero} className="w-full btn-gold shadow-lg shadow-[#D4AF37]/20 transition-all">{savingHero ? "Enregistrement..." : "Enregistrer les modifications"}</Button>
              </form>
            </motion.div>
            <div className="space-y-4">
              <h3 className="text-lg text-[#F9F7F2] font-semibold">Aperçu en direct</h3>
              <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg border border-white/10 group">
                <img src={heroPreview || heroBackgroundImage || "https://customer-assets.emergentagent.com/job_loman-restaurant/artifacts/jde9y3pb_chl.jpg"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Preview" />
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="luxury-card p-8 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-6"><Calendar className="text-[#D4AF37]" size={24} /><h2 className="text-xl text-[#F9F7F2] font-semibold">Nouveau Menu du Jour</h2></div>
              <form onSubmit={handleSubmitMenu} className="space-y-5">
                <div><Label className="text-[#A3B1AD] mb-2 block font-medium">Date</Label><Input type="date" value={menuDate} onChange={(e) => setMenuDate(e.target.value)} className="input-luxury" /></div>
                <div>
                  <Label className="text-[#A3B1AD] mb-2 block font-medium">Plats</Label>
                  {menuItemsList.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input placeholder={`Ex: Attiéké Poisson - Plat ${index+1}`} value={item} onChange={(e) => { const n = [...menuItemsList]; n[index] = e.target.value; setMenuItemsList(n); }} className="input-luxury" />
                      {menuItemsList.length > 1 && <Button type="button" onClick={() => setMenuItemsList(menuItemsList.filter((_, i) => i !== index))} className="bg-red-500 hover:bg-red-600 text-white shadow-sm"><X size={18}/></Button>}
                    </div>
                  ))}
                  <Button type="button" onClick={() => setMenuItemsList([...menuItemsList, ""])} className="text-[#D4AF37] text-xs font-bold hover:underline">+ Ajouter un plat</Button>
                </div>
                <div className="mt-4">
                  <Label className="text-[#A3B1AD] mb-2 block font-medium">Affiche (Image)</Label>
                  <UploadModeToggle mode={menuUploadMode} setMode={setMenuUploadMode} />
                  {menuUploadMode === "url" ? (
                    <Input placeholder="Lien vers l'image du menu" value={menuImageUrl} onChange={e => setMenuImageUrl(e.target.value)} className="input-luxury" />
                  ) : (
                    <div onClick={() => menuFileRef.current?.click()} className="border-2 border-dashed border-white/10 p-6 rounded-xl text-center cursor-pointer hover:border-[#D4AF37] transition-all">
                      <Upload className="mx-auto text-[#D4AF37] mb-2" /><p className="text-xs text-[#A3B1AD]">Uploader l'affiche du jour</p>
                      <input ref={menuFileRef} type="file" className="hidden" accept="image/*" onChange={handleMenuFileChange} />
                    </div>
                  )}
                  {(menuPreview || menuImageUrl) && <img src={menuPreview || menuImageUrl} className="mt-3 w-32 h-32 object-cover rounded-lg shadow-md border border-white/10" alt="Preview" />}
                </div>
                <Button type="submit" className="w-full btn-gold py-4 font-bold shadow-lg shadow-[#D4AF37]/20 transition-all">Publier le Menu</Button>
              </form>
            </motion.div>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              <h3 className="text-lg text-[#F9F7F2] font-semibold">Menus récents</h3>
              {dailyMenus.map(menu => (
                <div key={menu.id} className="luxury-card p-5 rounded-xl flex justify-between items-start shadow-sm">
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${menu.is_active ? "bg-green-500/20 text-green-400" : "bg-white/10 text-[#A3B1AD]"}`}>{menu.is_active ? "Actif" : "Inactif"}</span>
                    <p className="text-[#F9F7F2] font-semibold mt-2">{new Date(menu.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    <p className="text-xs text-[#A3B1AD] mt-1 line-clamp-2">{menu.items.join(", ")}</p>
                  </div>
                  <Button onClick={() => handleDeleteMenu(menu.id)} variant="ghost" className="text-red-400 hover:text-red-500 hover:bg-red-500/10"><Trash2 size={18}/></Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROMOTIONS / EVENTS */}
        {activeTab === "promos" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="luxury-card p-8 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-6"><Megaphone className="text-[#D4AF37]" size={24} /><h2 className="text-xl text-[#F9F7F2] font-semibold">Nouvelle Pub</h2></div>
              <form onSubmit={handleSubmitPromo} className="space-y-5">
                <div><Label className="text-[#A3B1AD] block mb-2 font-medium">Titre *</Label><Input placeholder="Ex: Concert Gospel / Promo Attiéké" value={promoTitle} onChange={e => setPromoTitle(e.target.value)} className="input-luxury" required /></div>
                <div><Label className="text-[#A3B1AD] block mb-2 font-medium">Type d'affichage</Label>
                  <select value={promoType} onChange={e => setPromoType(e.target.value)} className="w-full bg-[#0F2E24] border border-white/10 text-white p-3 rounded-lg text-sm transition-all focus:border-[#D4AF37] outline-none">
                    <option value="Promotion">Promotion (Resto)</option>
                    <option value="Concert">Concert / Événement</option>
                    <option value="Biblique">Message Biblique</option>
                    <option value="Annonce">Annonce Générale</option>
                  </select>
                </div>
                <div><Label className="text-[#A3B1AD] block mb-2 font-medium">Description *</Label><Textarea placeholder="Contenu détaillé..." value={promoDescription} onChange={e => setPromoDescription(e.target.value)} className="input-luxury min-h-[100px]" required /></div>
                <div><Label className="text-[#A3B1AD] block mb-2 font-medium">Image</Label>
                  <UploadModeToggle mode={promoUploadMode} setMode={setPromoUploadMode} />
                  {promoUploadMode === "url" ? <Input placeholder="URL de l'image" value={promoImage} onChange={e => setPromoImage(e.target.value)} className="input-luxury" /> : <Input type="file" accept="image/*" onChange={handlePromoFileChange} className="input-luxury" />}
                </div>
                <div><Label className="text-[#A3B1AD] block mb-2 font-medium">Date (Optionnel)</Label><Input type="date" value={promoEndDate} onChange={e => setPromoEndDate(e.target.value)} className="input-luxury" /></div>
                <Button type="submit" disabled={uploadingPromo} className="w-full btn-gold py-4 font-bold shadow-lg shadow-[#D4AF37]/20 hover:bg-[#C4A030]">{uploadingPromo ? "Upload..." : "Créer l'annonce"}</Button>
              </form>
            </motion.div>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              <h3 className="text-lg text-[#F9F7F2] font-semibold">Annonces actives</h3>
              {promotions.map(promo => (
                <div key={promo.id} className="luxury-card p-4 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-1 rounded-full font-bold uppercase tracking-tighter">{promo.promo_type}</span>
                      <h4 className="font-semibold text-white mt-2 leading-tight">{promo.title}</h4>
                      <p className="text-xs text-[#A3B1AD] mt-1 line-clamp-2">{promo.description}</p>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <Switch checked={promo.is_active} onCheckedChange={() => handleTogglePromo(promo.id, promo.is_active)} />
                        <Button onClick={() => handleDeletePromo(promo.id)} variant="ghost" size="sm" className="text-red-400 hover:text-red-500 hover:bg-red-500/10"><Trash2 size={16}/></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CAISSE - SÉCURISÉE DARK */}
        {activeTab === "caisse" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="luxury-card p-4 rounded-2xl text-center shadow-sm">
                <p className="text-[#A3B1AD] text-xs mb-1 font-medium uppercase tracking-tighter">Ventes du jour</p>
                <p className="text-2xl font-bold text-[#D4AF37]">{cashStats?.total_sales || 0}</p>
              </div>
              <div className="luxury-card p-4 rounded-2xl text-center shadow-sm">
                <p className="text-[#A3B1AD] text-xs mb-1 font-medium uppercase tracking-tighter">Chiffre d'affaires</p>
                <p className="text-2xl font-bold text-[#F9F7F2]">{(cashStats?.total_revenue || 0).toLocaleString()} F</p>
              </div>
              <div className="luxury-card p-4 rounded-2xl text-center shadow-sm">
                <p className="text-[#A3B1AD] text-xs mb-1 font-medium uppercase tracking-tighter">Espèces</p>
                <p className="text-2xl font-bold text-green-400">{(cashStats?.cash_total || 0).toLocaleString()} F</p>
              </div>
              <div className="luxury-card p-4 rounded-2xl text-center shadow-sm">
                <p className="text-[#A3B1AD] text-xs mb-1 font-medium uppercase tracking-tighter">Mobile Money</p>
                <p className="text-2xl font-bold text-blue-400">{(cashStats?.mobile_money_total || 0).toLocaleString()} F</p>
              </div>
            </div>

            <div className="luxury-card p-6 rounded-2xl shadow-sm">
              <h3 className="text-lg font-semibold text-[#D4AF37] mb-6 flex items-center gap-2"><ShoppingCart size={20} /> Enregistrer une vente</h3>
              <form onSubmit={handleCashSaleSubmit} className="space-y-4">
                {cashItems.map((item, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-3 items-end p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="w-full md:flex-1">
                      {index === 0 && <Label className="text-[#A3B1AD] text-xs mb-1 block">Sélectionner un Plat</Label>}
                      <select value={item.name} onChange={(e) => { const s = menuItems.find(m => m.name === e.target.value); const n = [...cashItems]; n[index] = {...n[index], name: e.target.value, price: s ? s.price : n[index].price}; setCashItems(n); }} className="w-full bg-[#0F2E24] border border-white/10 text-white rounded-lg p-2.5 text-sm outline-none focus:border-[#D4AF37] transition-all">
                        <option value="">Choisir un plat...</option>
                        {menuItems.filter(m => m.is_available).map(m => <option key={m.id} value={m.name} className="text-black">{m.name} ({m.price} F)</option>)}
                      </select>
                    </div>
                    <div className="w-full md:w-24">
                      {index === 0 && <Label className="text-[#A3B1AD] text-xs mb-1 block">Qté</Label>}
                      <Input type="number" min="1" value={item.quantity} onChange={e => updateCashItem(index, "quantity", e.target.value)} className="input-luxury" />
                    </div>
                    <div className="w-full md:w-32">
                      {index === 0 && <Label className="text-[#A3B1AD] text-xs mb-1 block">Prix Unit.</Label>}
                      <Input type="number" value={item.price} onChange={e => updateCashItem(index, "price", e.target.value)} className="input-luxury" />
                    </div>
                    {cashItems.length > 1 && <Button type="button" onClick={() => setCashItems(cashItems.filter((_, i) => i !== index))} className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-lg h-10 shadow-sm"><Trash2 size={16}/></Button>}
                  </div>
                ))}
                <div className="flex flex-col md:flex-row gap-4 items-center pt-4 border-t border-white/5">
                  <Button type="button" onClick={addCashItem} variant="outline" className="bg-white/5 text-[#D4AF37] border-[#D4AF37]/50 hover:bg-[#D4AF37]/10">+ Ajouter une ligne</Button>
                  <div className="md:ml-auto text-2xl font-bold text-[#D4AF37] drop-shadow-sm">Total: {cashItems.reduce((s, i) => s + (i.price * i.quantity), 0).toLocaleString()} FCFA</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div>
                    <Label className="text-[#A3B1AD] text-xs mb-2 block font-medium uppercase tracking-widest">Mode de Paiement</Label>
                    <div className="flex gap-3">
                      <Button type="button" onClick={() => setCashPaymentMethod("especes")} className={`flex-1 font-bold py-6 rounded-xl transition-all ${cashPaymentMethod === "especes" ? "bg-green-500 text-white shadow-lg shadow-green-500/20" : "bg-white/5 text-[#A3B1AD] border border-transparent"}`}>Espèces</Button>
                      <Button type="button" onClick={() => setCashPaymentMethod("mobile_money")} className={`flex-1 font-bold py-6 rounded-xl transition-all ${cashPaymentMethod === "mobile_money" ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-white/5 text-[#A3B1AD] border border-transparent"}`}>Momo / Orange</Button>
                    </div>
                  </div>
                  <div><Label className="text-[#A3B1AD] text-xs mb-2 block font-medium uppercase tracking-widest">Note Additionnelle</Label><Input value={cashNote} onChange={e => setCashNote(e.target.value)} placeholder="Ex: Table 4" className="input-luxury h-full" /></div>
                </div>
                <Button type="submit" disabled={submittingCash} className="w-full btn-gold py-8 text-xl font-bold mt-6 shadow-xl shadow-[#D4AF37]/20 transition-all active:scale-[0.98]">Enregistrer la Vente</Button>
              </form>
            </div>

            <div className="luxury-card p-6 rounded-2xl shadow-sm">
               <h3 className="text-lg font-semibold text-[#F9F7F2] mb-4">Historique des ventes du jour</h3>
               <div className="space-y-3">
                 {cashSales.length === 0 ? (
                    <p className="text-center py-10 text-[#A3B1AD] italic">Aucune vente enregistrée pour le moment.</p>
                 ) : (
                  cashSales.map(sale => (
                    <div key={sale.id} className="bg-white/5 border border-white/5 p-4 rounded-xl flex justify-between items-center shadow-sm group">
                      <div>
                        <p className="text-sm font-semibold text-[#F9F7F2]">{sale.items.map(i => `${i.name} x${i.quantity}`).join(", ")}</p>
                        <p className="text-[10px] text-[#A3B1AD] mt-1 font-medium">
                          {new Date(sale.created_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})} 
                          <span className="mx-2 opacity-30">|</span> 
                          <span className={sale.payment_method === "especes" ? "text-green-400" : "text-blue-400 uppercase"}>{sale.payment_method}</span>
                          {sale.note && <span className="ml-2 opacity-60">({sale.note})</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-lg text-[#D4AF37]">{sale.total.toLocaleString()} F</span>
                        <Button onClick={() => requestDeleteSale(sale.id)} variant="ghost" size="sm" className="text-red-400 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18}/></Button>
                      </div>
                    </div>
                  ))
                 )}
               </div>
            </div>
          </div>
        )}
      </div>

      {/* DELETE SECURITY MODAL - LUXURY DARK */}
      <AnimatePresence>
        {showDeleteAuth && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#0A1F1A] border border-[#D4AF37]/30 rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl shadow-black/50">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20"><ShieldAlert size={40} className="text-red-500" /></div>
              <h3 className="text-2xl font-bold text-[#F9F7F2] mb-2 font-display">Sécurité Admin</h3>
              <p className="text-[#A3B1AD] text-sm mb-8 leading-relaxed">Cette action est irréversible. Veuillez confirmer avec le mot de passe maître pour supprimer cette vente.</p>
              <div className="mb-8"><Input type="password" placeholder="Mot de passe secret" className="bg-black/40 border-[#D4AF37]/20 text-white text-center text-xl tracking-[0.5em] h-14 outline-none focus:border-[#D4AF37] transition-all" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} autoFocus /></div>
              <div className="flex gap-4">
                <Button onClick={() => {setShowDeleteAuth(false); setDeletePassword("");}} className="flex-1 bg-white/5 border border-white/10 text-[#A3B1AD] hover:bg-white/10 py-6 transition-colors">Annuler</Button>
                <Button onClick={confirmDeleteSale} className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white border-0 shadow-lg shadow-red-900/20 py-6 font-bold transition-all hover:scale-[1.02]">Confirmer</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOGOUT MODAL */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowLogoutConfirm(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#0F2E24] border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl shadow-black/40" onClick={e => e.stopPropagation()}>
              <LogOut size={32} className="text-[#D4AF37] mx-auto mb-3" />
              <h3 className="text-lg font-bold text-[#F9F7F2] mb-2">Se déconnecter ?</h3>
              <p className="text-[#A3B1AD] text-sm mb-6">Souhaitez-vous vraiment quitter la session ?</p>
              <div className="flex gap-3">
                <Button onClick={() => setShowLogoutConfirm(false)} className="flex-1 bg-white/10 text-white hover:bg-white/20">Annuler</Button>
                <Button onClick={confirmLogout} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold">Déconnexion</Button>
              </div>
            </motion.div>
          </motion.div>
        )}    
      </AnimatePresence>
    </div>
  );
};

export default AdminPage;