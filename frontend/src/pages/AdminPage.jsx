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
  // --- ÉTATS AUTHENTIFICATION ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // --- ÉTATS ADMIN ---
  const [activeTab, setActiveTab] = useState("accueil");
  const [loading, setLoading] = useState(true);
  
  // --- ÉTATS DONNÉES ---
  const [dailyMenus, setDailyMenus] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [heroContent, setHeroContent] = useState(null);
  const [allReviews, setAllReviews] = useState([]);

  // --- ÉTATS CAISSE ---
  const [cashSales, setCashSales] = useState([]);
  const [cashStats, setCashStats] = useState(null);
  const [cashItems, setCashItems] = useState([{ name: "", quantity: 1, price: 0 }]);
  const [cashPaymentMethod, setCashPaymentMethod] = useState("especes");
  const [cashNote, setCashNote] = useState("");
  const [submittingCash, setSubmittingCash] = useState(false);
  const [cashDate, setCashDate] = useState(new Date().toISOString().split('T')[0]);

  // --- MODALE SÉCURITÉ ---
  const [showDeleteAuth, setShowDeleteAuth] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState(null);
  const [deletePassword, setDeletePassword] = useState("");

  // --- ÉTATS FORMULAIRES ---
  const [menuDate, setMenuDate] = useState(new Date().toISOString().split('T')[0]);
  const [menuItemsList, setMenuItemsList] = useState([""]);
  const [specialMessage, setSpecialMessage] = useState("");
  const [menuImageUrl, setMenuImageUrl] = useState("");
  const [menuUploadMode, setMenuUploadMode] = useState("url");
  const [menuFile, setMenuFile] = useState(null);
  const [menuPreview, setMenuPreview] = useState("");
  const menuFileRef = useRef(null);

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

  // --- INITIALISATION & VÉRIFICATION ---
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
      toast.error("Erreur de chargement");
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

  // --- ACTIONS ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const response = await axios.post(`${API}/admin/login`, { username, password });
      if (response.data.success) {
        localStorage.setItem("adminToken", response.data.token);
        setIsAuthenticated(true);
        toast.success("Bienvenue Armando !");
        fetchData();
      }
    } catch (error) { toast.error("Accès refusé"); } finally { setLoginLoading(false); }
  };

  const confirmLogout = () => {
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
    setShowLogoutConfirm(false);
    toast.success("Session terminée");
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post(`${API}/upload`, formData, { headers: { "Content-Type": "multipart/form-data" } });
    return response.data.url;
  };

  const handleCashSaleSubmit = async (e) => {
    e.preventDefault();
    const validItems = cashItems.filter(item => item.name.trim() && item.quantity > 0 && item.price > 0);
    if (validItems.length === 0) return toast.error("Ajoutez un produit");
    const total = validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setSubmittingCash(true);
    try {
      await axios.post(`${API}/caisse/vente`, { items: validItems, total, payment_method: cashPaymentMethod, note: cashNote || null });
      toast.success("Vente validée"); setCashItems([{ name: "", quantity: 1, price: 0 }]); setCashNote(""); fetchCaisseData();
    } catch (error) { toast.error("Échec de l'enregistrement"); } finally { setSubmittingCash(false); }
  };

  const confirmDeleteSale = async () => {
    if (deletePassword !== "Jesusestroi@") return toast.error("Code erroné");
    try {
      await axios.delete(`${API}/caisse/vente/${saleToDelete}`);
      toast.success("Vente annulée"); fetchCaisseData(); setShowDeleteAuth(false);
    } catch (error) { toast.error("Erreur serveur"); }
  };

  const handleSubmitMenu = async (e) => {
    e.preventDefault();
    let finalImageUrl = menuImageUrl;
    if (menuUploadMode === "file" && menuFile) finalImageUrl = await uploadFile(menuFile);
    try {
      await axios.post(`${API}/daily-menu`, { date: menuDate, items: menuItemsList.filter(i => i.trim()), special_message: specialMessage || null, image_url: finalImageUrl || null });
      toast.success("Menu du jour activé"); fetchData();
    } catch (error) { toast.error("Erreur publication"); }
  };

  const handleSubmitPhoto = async (e) => {
    e.preventDefault();
    let finalUrl = photoUrl;
    if (photoUploadMode === "file" && photoFile) finalUrl = await uploadFile(photoFile);
    try {
      await axios.post(`${API}/gallery`, { image_url: finalUrl, caption: photoCaption || null, category: photoCategory });
      toast.success("Galerie mise à jour"); fetchData();
      setPhotoUrl(""); setPhotoFile(null); setPhotoPreview("");
    } catch (error) { toast.error("Erreur d'envoi"); }
  };

  const handleSubmitVideo = async (e) => {
    e.preventDefault();
    let finalUrl = videoUrl;
    let finalType = videoType;
    if (videoUploadMode === "file" && videoFile) { finalUrl = await uploadFile(videoFile); finalType = "direct"; }
    try {
      await axios.post(`${API}/videos`, { title: videoTitle, video_url: finalUrl, video_type: finalType, description: videoDescription || null });
      toast.success("Vidéo ajoutée"); fetchData();
    } catch (error) { toast.error("Erreur"); }
  };

  const handleSubmitPromo = async (e) => {
    e.preventDefault();
    let finalImageUrl = promoImage;
    if (promoUploadMode === "file" && promoFile) finalImageUrl = await uploadFile(promoFile);
    try {
      await axios.post(`${API}/promotions`, { title: promoTitle, description: promoDescription, image_url: finalImageUrl || null, promo_type: promoType, end_date: promoEndDate || null });
      toast.success("Actualité créée"); fetchData();
    } catch (error) { toast.error("Erreur"); }
  };

  const handleSubmitHero = async (e) => {
    e.preventDefault();
    setSavingHero(true);
    let finalImageUrl = heroBackgroundImage;
    if (heroUploadMode === "file" && heroFile) finalImageUrl = await uploadFile(heroFile);
    try {
      await axios.put(`${API}/hero-content`, { title_line1: heroTitleLine1, title_line2: heroTitleLine2, description: heroDescription, background_image: finalImageUrl });
      toast.success("Message d'accueil mis à jour"); fetchData();
    } catch (error) { toast.error("Erreur"); } finally { setSavingHero(false); }
  };

  const handleSubmitMenuItem = async (e) => {
    e.preventDefault();
    setSubmittingMenuItem(true);
    let finalImageUrl = menuItemImageUrl;
    if (menuItemUploadMode === "file" && menuItemFile) finalImageUrl = await uploadFile(menuItemFile);
    try {
      if (editingMenuItem) {
        await axios.put(`${API}/menu/${editingMenuItem.id}?name=${menuItemName}&description=${menuItemDescription}&price=${menuItemPrice}&category=${menuItemCategory}&is_featured=${menuItemFeatured}&image_url=${finalImageUrl}`);
        toast.success("Plat modifié");
      } else {
        await axios.post(`${API}/menu`, { name: menuItemName, description: menuItemDescription, price: parseInt(menuItemPrice), category: menuItemCategory, image_url: finalImageUrl, is_featured: menuItemFeatured });
        toast.success("Plat ajouté");
      }
      resetMenuForm(); fetchData();
    } catch (error) { toast.error("Erreur"); } finally { setSubmittingMenuItem(false); }
  };

  const resetMenuForm = () => {
    setShowMenuForm(false); setEditingMenuItem(null); setMenuItemName(""); setMenuItemDescription(""); setMenuItemPrice(""); setMenuItemCategory("Plats Ivoiriens"); setMenuItemImageUrl(""); setMenuItemFile(null); setMenuItemPreview(""); setMenuItemFeatured(false);
  };

  const openEditMenuItem = (item) => {
    setEditingMenuItem(item); setMenuItemName(item.name); setMenuItemDescription(item.description); setMenuItemPrice(item.price.toString()); setMenuItemCategory(item.category); setMenuItemImageUrl(item.image_url); setMenuItemFeatured(item.is_featured); setShowMenuForm(true);
  };

  const handleReviewAction = async (id, action) => {
    if (action === "approve") await axios.put(`${API}/reviews/${id}/approve`);
    else if (action === "hide") await axios.put(`${API}/reviews/${id}/hide`);
    else if (action === "delete") await axios.delete(`${API}/reviews/${id}`);
    fetchData();
  };

  const getYouTubeId = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  // --- COMPOSANTS UI RÉUTILISABLES ---
  const UploadModeToggle = ({ mode, setMode }) => (
    <div className="flex gap-2 mb-4">
      <Button type="button" onClick={() => setMode("url")} className={mode === "url" ? "bg-[#D4AF37] text-black" : "bg-white/5"} size="sm">Lien URL</Button>
      <Button type="button" onClick={() => setMode("file")} className={mode === "file" ? "bg-[#D4AF37] text-black" : "bg-white/5"} size="sm">Appareil</Button>
    </div>
  );

  const tabs = [
    { id: "accueil", label: "Accueil", icon: Home },
    { id: "menu", label: "Menu du Jour", icon: Calendar },
    { id: "photos", label: "Photos", icon: Image },
    { id: "videos", label: "Vidéos", icon: Video },
    { id: "promos", label: "Pubs & Actus", icon: Megaphone },
    { id: "plats", label: "Plats", icon: Utensils },
    { id: "commentaires", label: "Avis", icon: MessageSquare },
    { id: "caisse", label: "Caisse", icon: ShoppingCart },
  ];

  if (isCheckingAuth) return <div className="min-h-screen bg-[#05100D] flex items-center justify-center text-[#A3B1AD]">Vérification du privilège admin...</div>;

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-[#05100D] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="luxury-card p-10 w-full max-w-md text-center border-[#D4AF37]/20">
        <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-[#D4AF37]" size={40} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-6 font-display uppercase tracking-widest">Chez Loman Admin</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input placeholder="Nom d'utilisateur" value={username} onChange={e => setUsername(e.target.value)} className="input-luxury text-center" />
          <div className="relative">
            <Input type={showPassword ? "text" : "password"} placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} className="input-luxury text-center" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3 text-gray-500">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
          </div>
          <Button type="submit" disabled={loginLoading} className="w-full btn-gold py-8 text-lg font-bold uppercase tracking-widest">{loginLoading ? "Connexion..." : "Ouvrir la session"}</Button>
        </form>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05100D] pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* TOP BAR */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="text-center md:text-left">
            <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-[0.4em] block mb-2">Interface Professionnelle</span>
            <h1 className="text-3xl md:text-4xl text-white font-display">Gestion du Restaurant</h1>
          </div>
          <div className="flex gap-4">
            <RouterLink to="/dashboard" className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] px-6 py-2 rounded-full flex items-center gap-2 hover:bg-[#D4AF37] hover:text-black transition-all font-semibold"><LayoutDashboard size={18}/>Dashboard Pro</RouterLink>
            <Button onClick={fetchData} variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-full"><RefreshCw size={18}/></Button>
            <Button onClick={() => setShowLogoutConfirm(true)} className="bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 rounded-full hover:text-white transition-all"><LogOut size={18}/></Button>
          </div>
        </div>

        {/* TABS MENU */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 border-b border-white/5 pb-6">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === t.id ? "bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20" : "text-gray-400 hover:text-white bg-white/5 border border-transparent hover:border-white/10"}`}>{t.label}</button>
          ))}
        </div>

        {/* ACCUEIL HERO */}
        {activeTab === "accueil" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="luxury-card p-8">
                <h2 className="text-xl text-[#D4AF37] mb-8 font-display uppercase tracking-widest">Message de Bienvenue</h2>
                <form onSubmit={handleSubmitHero} className="space-y-6">
                    <div className="space-y-2"><Label className="text-gray-400 text-xs uppercase">Accroche (Ligne 1)</Label><Input placeholder="Ici c'est manger" value={heroTitleLine1} onChange={e => setHeroTitleLine1(e.target.value)} className="input-luxury" /></div>
                    <div className="space-y-2"><Label className="text-gray-400 text-xs uppercase">Slogan (Ligne 2 - Or)</Label><Input placeholder="bien hein" value={heroTitleLine2} onChange={e => setHeroTitleLine2(e.target.value)} className="input-luxury" /></div>
                    <div className="space-y-2"><Label className="text-gray-400 text-xs uppercase">Paragraphe descriptif</Label><Textarea placeholder="Décrivez l'expérience Chez Loman..." value={heroDescription} onChange={e => setHeroDescription(e.target.value)} className="input-luxury min-h-[120px]" /></div>
                    <div className="space-y-2"><Label className="text-gray-400 text-xs uppercase block mb-3">Fond d'écran du site</Label><UploadModeToggle mode={heroUploadMode} setMode={setHeroUploadMode} />
                    {heroUploadMode === "url" ? <Input value={heroBackgroundImage} onChange={e => setHeroBackgroundImage(e.target.value)} className="input-luxury" placeholder="URL de l'image" /> : <Input type="file" onChange={e => {const f=e.target.files[0]; if(f){setHeroFile(f); setHeroPreview(URL.createObjectURL(f))}}} className="input-luxury" />}</div>
                    <Button type="submit" disabled={savingHero} className="w-full btn-gold py-6 font-bold">{savingHero ? "Enregistrement..." : "Mettre à jour l'accueil"}</Button>
                </form>
            </motion.div>
            <div className="space-y-6">
                <h3 className="text-gray-400 text-xs uppercase tracking-widest">Aperçu Visuel</h3>
                <div className="luxury-card overflow-hidden h-[400px] relative border-[#D4AF37]/10">
                    <img src={heroPreview || heroBackgroundImage} className="w-full h-full object-cover opacity-60 transition-all duration-700" alt="preview hero" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-10 flex flex-col justify-end">
                        <h2 className="text-3xl font-accent italic text-white leading-none">{heroTitleLine1}<br/><span className="text-[#D4AF37]">{heroTitleLine2}</span></h2>
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* MENU DU JOUR */}
        {activeTab === "menu" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="luxury-card p-8">
                <h2 className="text-xl text-white mb-8 font-display uppercase tracking-widest">Publier le Menu</h2>
                <form onSubmit={handleSubmitMenu} className="space-y-6">
                    <div className="space-y-2"><Label className="text-gray-400 text-xs">DATE DU JOUR</Label><Input type="date" value={menuDate} onChange={e => setMenuDate(e.target.value)} className="input-luxury" /></div>
                    <div className="space-y-2"><Label className="text-gray-400 text-xs">PLATS AU MENU</Label>
                        {menuItemsList.map((it, idx) => (
                            <div key={idx} className="flex gap-2 mb-2"><Input placeholder={`Plat n°${idx+1}`} value={it} onChange={e => {const n = [...menuItemsList]; n[idx] = e.target.value; setMenuItemsList(n)}} className="input-luxury" /><Button type="button" onClick={() => setMenuItemsList(menuItemsList.filter((_,i)=>i!==idx))} className="bg-red-500/10 text-red-500 border border-red-500/20"><X size={16}/></Button></div>
                        ))}
                        <Button type="button" onClick={() => setMenuItemsList([...menuItemsList, ""])} variant="ghost" className="text-[#D4AF37] hover:bg-[#D4AF37]/5">+ Ajouter un plat</Button>
                    </div>
                    <div className="space-y-2 pt-4 border-t border-white/5"><Label className="text-gray-400 text-xs uppercase block mb-3">Affiche Graphique du Menu</Label><UploadModeToggle mode={menuUploadMode} setMode={setMenuUploadMode} />
                    {menuUploadMode === "url" ? <Input value={menuImageUrl} onChange={e => setMenuImageUrl(e.target.value)} className="input-luxury" placeholder="URL de l'affiche" /> : <Input type="file" onChange={e => handleMenuFileChange(e)} className="input-luxury" />}
                    {(menuPreview || menuImageUrl) && <img src={menuPreview || menuImageUrl} className="mt-4 w-40 h-40 object-cover rounded-xl border border-[#D4AF37]/20" />}</div>
                    <Button type="submit" className="w-full btn-gold py-6 font-bold uppercase">Lancer le menu du jour</Button>
                </form>
            </motion.div>
            <div className="space-y-4">
                <h3 className="text-gray-400 text-xs uppercase tracking-widest mb-4">Historique des Menus</h3>
                {dailyMenus.map(m => (
                    <div key={m.id} className="bg-white/5 border border-white/5 p-5 rounded-2xl flex justify-between items-center group">
                        <div><p className="text-white font-bold">{new Date(m.date).toLocaleDateString('fr-FR', {weekday:'long', day:'numeric', month:'long'})}</p><p className="text-xs text-gray-500 mt-1">{m.items.join(" • ")}</p></div>
                        <Button onClick={() => handleDeleteMenu(m.id)} variant="ghost" className="text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={18}/></Button>
                    </div>
                ))}
            </div>
          </div>
        )}

        {/* PHOTOS GALLERY */}
        {activeTab === "photos" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="luxury-card p-8">
                    <h2 className="text-xl text-white mb-8 font-display uppercase tracking-widest">Enrichir la Galerie</h2>
                    <form onSubmit={handleSubmitPhoto} className="space-y-6">
                        <UploadModeToggle mode={photoUploadMode} setMode={setPhotoUploadMode} />
                        {photoUploadMode === "url" ? <Input value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} className="input-luxury" placeholder="URL de l'image" /> : <Input type="file" onChange={e => {const f=e.target.files[0]; if(f){setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f))}}} className="input-luxury" />}
                        <Input placeholder="Légende de la photo" value={photoCaption} onChange={e => setPhotoCaption(e.target.value)} className="input-luxury" />
                        <select value={photoCategory} onChange={e => setPhotoCategory(e.target.value)} className="w-full bg-[#0F2E24] border border-white/10 text-white p-4 rounded-xl outline-none focus:border-[#D4AF37]">
                            <option value="restaurant">Cadre / Restaurant</option>
                            <option value="plats">Nos Plats</option>
                            <option value="ambiance">Ambiance & Clientèle</option>
                        </select>
                        {photoPreview && <img src={photoPreview} className="w-full h-48 object-cover rounded-xl border border-white/10" />}
                        <Button type="submit" disabled={uploadingPhoto} className="w-full btn-gold py-6">{uploadingPhoto ? "Transfert..." : "Ajouter à la galerie"}</Button>
                    </form>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto max-h-[600px] pr-2">
                    {photos.map(p => (
                        <div key={p.id} className="relative group rounded-2xl overflow-hidden aspect-square border border-white/10 shadow-lg">
                            <img src={p.image_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="gallery item" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                <button onClick={() => handleDeletePhoto(p.id)} className="bg-red-600 text-white p-3 rounded-full hover:bg-red-500"><Trash2 size={20}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* VIDEOS */}
        {activeTab === "videos" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="luxury-card p-8">
                    <h2 className="text-xl text-white mb-8 font-display uppercase tracking-widest">Publier une Vidéo</h2>
                    <form onSubmit={handleSubmitVideo} className="space-y-6">
                        <Input placeholder="Titre de la vidéo" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} className="input-luxury" />
                        <UploadModeToggle mode={videoUploadMode} setMode={setVideoUploadMode} />
                        {videoUploadMode === "url" ? <Input placeholder="Lien YouTube ou URL direct" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="input-luxury" /> : <Input type="file" onChange={e => setVideoFile(e.target.files[0])} className="input-luxury" />}
                        <Textarea placeholder="Description courte" value={videoDescription} onChange={e => setVideoDescription(e.target.value)} className="input-luxury" />
                        <Button type="submit" disabled={uploadingVideo} className="w-full btn-gold py-6">Vidéos (+)</Button>
                    </form>
                </div>
                <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2">
                    {videos.map(v => (
                        <div key={v.id} className="bg-white/5 border border-white/5 p-5 rounded-2xl flex justify-between items-center group">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-10 bg-black/40 rounded flex items-center justify-center border border-white/10"><Video className="text-[#D4AF37]" size={20}/></div>
                                <div><p className="text-white font-semibold text-sm">{v.title}</p><p className="text-[10px] text-gray-500 uppercase">{v.video_type}</p></div>
                            </div>
                            <div className="flex gap-4 items-center">
                                <Switch checked={v.is_active} onCheckedChange={() => handleToggleVideo(v.id, v.is_active)} />
                                <Button onClick={() => handleDeleteVideo(v.id)} variant="ghost" className="text-red-500"><Trash2 size={16}/></Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* PROMOS & ACTUS */}
        {activeTab === "promos" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="luxury-card p-8">
                    <h2 className="text-xl text-white mb-8 font-display uppercase tracking-widest">Publicités & Actus</h2>
                    <form onSubmit={handleSubmitPromo} className="space-y-6">
                        <Input placeholder="Titre de l'info" value={promoTitle} onChange={e => setPromoTitle(e.target.value)} className="input-luxury" />
                        <div className="space-y-2"><Label className="text-gray-400 text-[10px] uppercase">Catégorie d'affichage</Label>
                        <select value={promoType} onChange={e => setPromoType(e.target.value)} className="w-full bg-[#0F2E24] border border-white/10 text-white p-4 rounded-xl outline-none focus:border-[#D4AF37]">
                            <option value="Promotion">Promotion Restaurant</option>
                            <option value="Concert">Événement / Concert</option>
                            <option value="Biblique">Verset / Info Biblique</option>
                            <option value="Annonce">Annonce Générale</option>
                        </select></div>
                        <Textarea placeholder="Contenu du message..." value={promoDescription} onChange={e => setPromoDescription(e.target.value)} className="input-luxury min-h-[100px]" />
                        <div className="space-y-2"><Label className="text-gray-400 text-[10px] uppercase">Date de fin (Optionnel)</Label><Input type="date" value={promoEndDate} onChange={e => setPromoEndDate(e.target.value)} className="input-luxury" /></div>
                        <UploadModeToggle mode={promoUploadMode} setMode={setPromoUploadMode} />
                        {promoUploadMode === "url" ? <Input value={promoImage} onChange={e => setPromoImage(e.target.value)} className="input-luxury" placeholder="URL Affiche" /> : <Input type="file" onChange={e => setPromoFile(e.target.files[0])} className="input-luxury" />}
                        <Button type="submit" disabled={uploadingPromo} className="w-full btn-gold py-6 font-bold">Lancer l'actualité</Button>
                    </form>
                </div>
                <div className="space-y-4">
                    {promotions.map(pr => (
                        <div key={pr.id} className="bg-white/5 border border-white/5 p-5 rounded-2xl flex justify-between items-center shadow-lg group">
                            <div className="flex gap-4 items-center">
                                <div className="p-3 bg-[#D4AF37]/10 rounded-full text-[#D4AF37]"><Megaphone size={18}/></div>
                                <div><p className="text-white font-bold text-sm leading-tight">{pr.title}</p><span className="text-[10px] text-[#D4AF37] uppercase font-bold tracking-widest">{pr.promo_type}</span></div>
                            </div>
                            <div className="flex gap-4">
                                <Switch checked={pr.is_active} onCheckedChange={() => handleTogglePromo(pr.id, pr.is_active)} />
                                <Button onClick={() => handleDeletePromo(pr.id)} variant="ghost" className="text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={18}/></Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* GESTION PLATS */}
        {activeTab === "plats" && (
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl text-white font-display uppercase tracking-widest">Carte des Mets</h2>
                    <Button onClick={() => {resetMenuForm(); setShowMenuForm(true)}} className="btn-gold px-8"><Plus className="mr-2"/>Nouveau Plat</Button>
                </div>
                
                <AnimatePresence>
                {showMenuForm && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="luxury-card p-10 space-y-6 border-[#D4AF37]/30 shadow-2xl shadow-[#D4AF37]/5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input placeholder="Intitulé du plat" value={menuItemName} onChange={e => setMenuItemName(e.target.value)} className="input-luxury" />
                            <Input type="number" placeholder="Tarif (FCFA)" value={menuItemPrice} onChange={e => setMenuItemPrice(e.target.value)} className="input-luxury" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <select value={menuItemCategory} onChange={e => setMenuItemCategory(e.target.value)} className="w-full bg-[#0F2E24] border border-white/10 text-white p-4 rounded-xl outline-none focus:border-[#D4AF37]">
                                {MENU_CATEGORIES.map(c => <option key={c} value={c} className="text-black">{c}</option>)}
                            </select>
                            <Input placeholder="Lien de la photo" value={menuItemImageUrl} onChange={e => setMenuItemImageUrl(e.target.value)} className="input-luxury" />
                        </div>
                        <Textarea placeholder="Description gastronomique..." value={menuItemDescription} onChange={e => setMenuItemDescription(e.target.value)} className="input-luxury min-h-[100px]" />
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl">
                            <Switch checked={menuItemFeatured} onCheckedChange={setMenuItemFeatured}/>
                            <span className="text-white text-sm font-bold uppercase tracking-widest">Mettre en vedette (Page d'accueil)</span>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <Button onClick={handleSubmitMenuItem} disabled={submittingMenuItem} className="btn-gold flex-1 py-6 text-lg font-bold">{submittingMenuItem ? "Action..." : "Valider le Plat"}</Button>
                            <Button onClick={resetMenuForm} variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/5">Abandonner</Button>
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {menuItems.map(it => (
                        <div key={it.id} className="luxury-card group p-0 overflow-hidden relative border-white/5">
                            <div className="h-40 relative overflow-hidden">
                                <img src={it.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                                {it.is_featured && <div className="absolute top-3 left-3 bg-[#D4AF37] text-black text-[8px] font-black px-2 py-1 rounded-sm shadow-xl">VEDETTE</div>}
                            </div>
                            <div className="p-5">
                                <h4 className="text-white font-bold text-sm leading-tight mb-1">{it.name}</h4>
                                <p className="text-[#D4AF37] font-display text-lg">{it.price.toLocaleString()} F</p>
                                <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2"><Switch checked={it.is_available} onCheckedChange={() => handleToggleMenuItem(it.id, "is_available", it.is_available)} /><span className="text-[10px] text-gray-500 uppercase font-bold">Dispo</span></div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEditMenuItem(it)} className="p-2 bg-white/5 rounded-full text-white hover:bg-[#D4AF37] hover:text-black transition-all"><Pencil size={14}/></button>
                                        <button onClick={() => handleDeleteMenuItem(it.id)} className="p-2 bg-red-500/10 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14}/></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* COMMENTAIRES / AVIS */}
        {activeTab === "commentaires" && (
            <div className="space-y-6">
                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-2xl text-white font-display uppercase tracking-widest">Avis Clients</h2>
                    <span className="bg-white/10 px-3 py-1 rounded-full text-[#D4AF37] text-xs font-bold">{allReviews.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allReviews.map(r => (
                    <div key={r.id} className={`luxury-card p-8 border-l-[6px] ${r.is_approved ? 'border-l-green-500 shadow-green-500/5' : 'border-l-yellow-500 shadow-yellow-500/5'}`}>
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#1A4D3E] flex items-center justify-center text-[#D4AF37] font-black text-lg">{r.author.charAt(0)}</div>
                                <div><p className="text-white font-bold leading-none">{r.author}</p><p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest">{new Date(r.created_at).toLocaleDateString()}</p></div>
                            </div>
                            <div className="flex gap-2">
                                {!r.is_approved ? <Button onClick={() => handleReviewAction(r.id, "approve")} className="bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white text-[10px] h-8 px-4 font-bold border border-green-500/20">Approuver</Button> : <Button onClick={() => handleReviewAction(r.id, "hide")} className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-white text-[10px] h-8 px-4 font-bold border border-yellow-500/20">Masquer</Button>}
                                <Button onClick={() => handleReviewAction(r.id, "delete")} className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-[10px] h-8 px-2 border border-red-500/20"><Trash2 size={14}/></Button>
                            </div>
                        </div>
                        <p className="text-[#F9F7F2]/80 italic text-lg leading-relaxed font-accent">"{r.comment}"</p>
                    </div>
                ))}
                </div>
            </div>
        )}

        {/* CAISSE COMPLÈTE */}
        {activeTab === "caisse" && (
            <div className="space-y-10">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="luxury-card p-6 text-center border-white/5 bg-white/[0.02]"><p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Ventes Actées</p><p className="text-3xl font-display font-bold text-[#D4AF37]">{cashStats?.total_sales || 0}</p></div>
                    <div className="luxury-card p-6 text-center border-white/5 bg-white/[0.02]"><p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Chiffre Affaire</p><p className="text-3xl font-display font-bold text-white">{(cashStats?.total_revenue || 0).toLocaleString()} F</p></div>
                    <div className="luxury-card p-6 text-center border-white/5 bg-white/[0.02]"><p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Total Espèces</p><p className="text-3xl font-display font-bold text-green-500">{(cashStats?.cash_total || 0).toLocaleString()} F</p></div>
                    <div className="luxury-card p-6 text-center border-white/5 bg-white/[0.02]"><p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Total Momo</p><p className="text-3xl font-display font-bold text-blue-500">{(cashStats?.mobile_money_total || 0).toLocaleString()} F</p></div>
                </div>

                {/* Formulaire Enregistrement */}
                <div className="luxury-card p-10 border-[#D4AF37]/10">
                    <div className="flex items-center gap-4 mb-10"><div className="p-3 bg-[#D4AF37]/10 rounded-xl text-[#D4AF37] shadow-lg shadow-[#D4AF37]/5"><ShoppingCart size={24}/></div><h3 className="text-2xl text-white font-display uppercase tracking-[0.2em]">Enregistrement Vente</h3></div>
                    <form onSubmit={handleCashSaleSubmit} className="space-y-6">
                        {cashItems.map((it, idx) => (
                            <div key={idx} className="flex flex-col md:flex-row gap-4 items-end bg-white/5 p-4 rounded-2xl border border-white/5 shadow-inner">
                                <div className="flex-1 w-full">
                                    <Label className="text-gray-400 text-[10px] uppercase font-bold mb-2 block">Désignation du Plat</Label>
                                    <select value={it.name} onChange={e => {const s=menuItems.find(m=>m.name===e.target.value); const n=[...cashItems]; n[idx]={...n[idx], name:e.target.value, price:s?s.price:n[idx].price}; setCashItems(n)}} className="w-full bg-[#0F2E24] border border-white/10 text-white rounded-xl p-4 text-sm outline-none focus:border-[#D4AF37] transition-all cursor-pointer">
                                        <option value="" className="text-gray-500">Choisir dans la carte...</option>
                                        {menuItems.filter(m=>m.is_available).map(m=><option key={m.id} value={m.name} className="text-black">{m.name} - {m.price}F</option>)}
                                    </select>
                                </div>
                                <div className="w-full md:w-32">
                                    <Label className="text-gray-400 text-[10px] uppercase font-bold mb-2 block">Quantité</Label>
                                    <Input type="number" min="1" value={it.quantity} onChange={e => {const n=[...cashItems]; n[idx].quantity=Number(e.target.value); setCashItems(n)}} className="input-luxury text-center text-xl h-14" />
                                </div>
                                <div className="w-full md:w-40">
                                    <Label className="text-gray-400 text-[10px] uppercase font-bold mb-2 block">Prix Unitaire</Label>
                                    <Input type="number" value={it.price} onChange={e => {const n=[...cashItems]; n[idx].price=Number(e.target.value); setCashItems(n)}} className="input-luxury text-center text-xl h-14 text-[#D4AF37] font-bold" />
                                </div>
                                {cashItems.length > 1 && <Button type="button" onClick={() => setCashItems(cashItems.filter((_,i)=>i!==idx))} className="bg-red-500 hover:bg-red-400 text-white h-14 w-14 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/10"><Trash2 size={20}/></Button>}
                            </div>
                        ))}
                        <div className="flex flex-col md:flex-row justify-between items-center py-6 border-y border-white/5">
                            <Button type="button" onClick={addCashItem} variant="outline" className="text-[#D4AF37] border-[#D4AF37]/30 hover:bg-[#D4AF37] hover:text-black py-6 px-10 rounded-xl font-bold uppercase tracking-widest text-xs">+ Ajouter une ligne</Button>
                            <div className="text-right mt-6 md:mt-0">
                                <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Total à payer</p>
                                <p className="text-4xl font-display font-bold text-[#D4AF37] drop-shadow-lg">{cashItems.reduce((s,i)=>s+(i.price*i.quantity),0).toLocaleString()} FCFA</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <Label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block">Canal de Règlement</Label>
                                <div className="flex gap-4">
                                    <Button type="button" onClick={()=>setCashPaymentMethod("especes")} className={`flex-1 py-8 rounded-2xl font-black uppercase text-xs transition-all ${cashPaymentMethod==="especes"?'bg-green-500 text-white shadow-xl shadow-green-500/20':'bg-white/5 text-gray-500 border border-white/5'}`}>Billet (Espèces)</Button>
                                    <Button type="button" onClick={()=>setCashPaymentMethod("mobile_money")} className={`flex-1 py-8 rounded-2xl font-black uppercase text-xs transition-all ${cashPaymentMethod==="mobile_money"?'bg-blue-600 text-white shadow-xl shadow-blue-500/20':'bg-white/5 text-gray-500 border border-white/5'}`}>Mobile (MoMo)</Button>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <Label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block">Note Privée</Label>
                                <Input placeholder="Commentaire libre (ex: Offert par le chef)" value={cashNote} onChange={e=>setCashNote(e.target.value)} className="input-luxury h-20" />
                            </div>
                        </div>
                        <Button type="submit" disabled={submittingCash} className="w-full btn-gold py-10 text-2xl font-black uppercase tracking-[0.2em] mt-8 shadow-2xl shadow-[#D4AF37]/10 active:scale-[0.99] transition-all">{submittingCash ? "Validation..." : "Fermer la vente"}</Button>
                    </form>
                </div>

                {/* Historique des transactions */}
                <div className="luxury-card p-8 bg-black/40">
                    <h3 className="text-xl text-white font-display uppercase mb-8 border-b border-white/5 pb-4">Historique Transactions</h3>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar">
                        {cashSales.map(s => (
                            <div key={s.id} className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl flex justify-between items-center shadow-lg group hover:bg-white/[0.04] transition-all">
                                <div className="space-y-2">
                                    <p className="text-white font-bold text-lg leading-none">{s.items.map(i => `${i.name} x${i.quantity}`).join(", ")}</p>
                                    <div className="flex items-center gap-3">
                                        <p className="text-[10px] text-gray-500 uppercase font-black">{new Date(s.created_at).toLocaleTimeString()}</p>
                                        <div className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase border ${s.payment_method === 'especes' ? 'border-green-500 text-green-500 bg-green-500/5' : 'border-blue-500 text-blue-500 bg-blue-500/5'}`}>{s.payment_method}</div>
                                        {s.note && <p className="text-[10px] text-[#D4AF37] italic opacity-60">Note: {s.note}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <p className="text-2xl text-white font-display font-bold">{s.total.toLocaleString()} F</p>
                                    <button onClick={() => {setSaleToDelete(s.id); setShowDeleteAuth(true)}} className="text-red-500/40 hover:text-red-500 transition-colors p-2"><Trash2 size={20}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* --- MODALES SÉCURITÉ LUXE DARK --- */}
      <AnimatePresence>
        {showDeleteAuth && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0A1F1A] border border-[#D4AF37]/40 rounded-[2.5rem] p-12 max-w-sm w-full text-center shadow-[0_0_50px_rgba(212,175,55,0.15)]">
              <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20 shadow-inner">
                <ShieldAlert size={56} className="text-red-500" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4 font-display">Sécurité Admin</h3>
              <p className="text-gray-400 text-sm mb-10 leading-relaxed uppercase tracking-widest font-semibold opacity-70">Saisie du Code Maître Requise pour suppression définitive.</p>
              <div className="mb-10">
                <Input type="password" placeholder="••••••••" className="bg-black/60 border-[#D4AF37]/30 text-[#D4AF37] text-center text-3xl tracking-[0.6em] h-20 rounded-2xl shadow-inner font-black" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} autoFocus />
              </div>
              <div className="flex gap-4">
                <Button onClick={() => {setShowDeleteAuth(false); setDeletePassword("");}} className="flex-1 bg-white/5 border border-white/10 text-white font-bold py-6 rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-xs">Fermer</Button>
                <Button onClick={confirmDeleteSale} className="flex-1 bg-gradient-to-br from-red-700 to-red-500 text-white border-0 shadow-2xl shadow-red-900/40 py-6 rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all">Annihiler</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowLogoutConfirm(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0F2E24] border border-white/10 rounded-[2rem] p-10 max-w-xs w-full text-center shadow-2xl" onClick={e=>e.stopPropagation()}>
              <div className="bg-[#D4AF37]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"><LogOut size={36} className="text-[#D4AF37]" /></div>
              <p className="text-white font-bold mb-8 text-xl">Quitter la gestion ?</p>
              <div className="flex gap-4">
                <Button onClick={()=>setShowLogoutConfirm(false)} className="flex-1 bg-white/5 border border-white/10 text-white py-6 rounded-xl font-bold">Rester</Button>
                <Button onClick={confirmLogout} className="flex-1 bg-red-600 text-white py-6 rounded-xl font-bold shadow-lg shadow-red-900/30">Sortir</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPage;import { useState, useEffect, useRef } from "react";
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
  // --- ÉTATS AUTHENTIFICATION ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // --- ÉTATS ADMIN ---
  const [activeTab, setActiveTab] = useState("accueil");
  const [loading, setLoading] = useState(true);
  
  // --- ÉTATS DONNÉES ---
  const [dailyMenus, setDailyMenus] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [heroContent, setHeroContent] = useState(null);
  const [allReviews, setAllReviews] = useState([]);

  // --- ÉTATS CAISSE ---
  const [cashSales, setCashSales] = useState([]);
  const [cashStats, setCashStats] = useState(null);
  const [cashItems, setCashItems] = useState([{ name: "", quantity: 1, price: 0 }]);
  const [cashPaymentMethod, setCashPaymentMethod] = useState("especes");
  const [cashNote, setCashNote] = useState("");
  const [submittingCash, setSubmittingCash] = useState(false);
  const [cashDate, setCashDate] = useState(new Date().toISOString().split('T')[0]);

  // --- MODALE SÉCURITÉ ---
  const [showDeleteAuth, setShowDeleteAuth] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState(null);
  const [deletePassword, setDeletePassword] = useState("");

  // --- ÉTATS FORMULAIRES ---
  const [menuDate, setMenuDate] = useState(new Date().toISOString().split('T')[0]);
  const [menuItemsList, setMenuItemsList] = useState([""]);
  const [specialMessage, setSpecialMessage] = useState("");
  const [menuImageUrl, setMenuImageUrl] = useState("");
  const [menuUploadMode, setMenuUploadMode] = useState("url");
  const [menuFile, setMenuFile] = useState(null);
  const [menuPreview, setMenuPreview] = useState("");
  const menuFileRef = useRef(null);

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

  // --- INITIALISATION & VÉRIFICATION ---
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
      toast.error("Erreur de chargement");
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

  // --- ACTIONS ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const response = await axios.post(`${API}/admin/login`, { username, password });
      if (response.data.success) {
        localStorage.setItem("adminToken", response.data.token);
        setIsAuthenticated(true);
        toast.success("Bienvenue Armando !");
        fetchData();
      }
    } catch (error) { toast.error("Accès refusé"); } finally { setLoginLoading(false); }
  };

  const confirmLogout = () => {
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
    setShowLogoutConfirm(false);
    toast.success("Session terminée");
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post(`${API}/upload`, formData, { headers: { "Content-Type": "multipart/form-data" } });
    return response.data.url;
  };

  const handleCashSaleSubmit = async (e) => {
    e.preventDefault();
    const validItems = cashItems.filter(item => item.name.trim() && item.quantity > 0 && item.price > 0);
    if (validItems.length === 0) return toast.error("Ajoutez un produit");
    const total = validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setSubmittingCash(true);
    try {
      await axios.post(`${API}/caisse/vente`, { items: validItems, total, payment_method: cashPaymentMethod, note: cashNote || null });
      toast.success("Vente validée"); setCashItems([{ name: "", quantity: 1, price: 0 }]); setCashNote(""); fetchCaisseData();
    } catch (error) { toast.error("Échec de l'enregistrement"); } finally { setSubmittingCash(false); }
  };

  const confirmDeleteSale = async () => {
    if (deletePassword !== "Jesusestroi@") return toast.error("Code erroné");
    try {
      await axios.delete(`${API}/caisse/vente/${saleToDelete}`);
      toast.success("Vente annulée"); fetchCaisseData(); setShowDeleteAuth(false);
    } catch (error) { toast.error("Erreur serveur"); }
  };

  const handleSubmitMenu = async (e) => {
    e.preventDefault();
    let finalImageUrl = menuImageUrl;
    if (menuUploadMode === "file" && menuFile) finalImageUrl = await uploadFile(menuFile);
    try {
      await axios.post(`${API}/daily-menu`, { date: menuDate, items: menuItemsList.filter(i => i.trim()), special_message: specialMessage || null, image_url: finalImageUrl || null });
      toast.success("Menu du jour activé"); fetchData();
    } catch (error) { toast.error("Erreur publication"); }
  };

  const handleSubmitPhoto = async (e) => {
    e.preventDefault();
    let finalUrl = photoUrl;
    if (photoUploadMode === "file" && photoFile) finalUrl = await uploadFile(photoFile);
    try {
      await axios.post(`${API}/gallery`, { image_url: finalUrl, caption: photoCaption || null, category: photoCategory });
      toast.success("Galerie mise à jour"); fetchData();
      setPhotoUrl(""); setPhotoFile(null); setPhotoPreview("");
    } catch (error) { toast.error("Erreur d'envoi"); }
  };

  const handleSubmitVideo = async (e) => {
    e.preventDefault();
    let finalUrl = videoUrl;
    let finalType = videoType;
    if (videoUploadMode === "file" && videoFile) { finalUrl = await uploadFile(videoFile); finalType = "direct"; }
    try {
      await axios.post(`${API}/videos`, { title: videoTitle, video_url: finalUrl, video_type: finalType, description: videoDescription || null });
      toast.success("Vidéo ajoutée"); fetchData();
    } catch (error) { toast.error("Erreur"); }
  };

  const handleSubmitPromo = async (e) => {
    e.preventDefault();
    let finalImageUrl = promoImage;
    if (promoUploadMode === "file" && promoFile) finalImageUrl = await uploadFile(promoFile);
    try {
      await axios.post(`${API}/promotions`, { title: promoTitle, description: promoDescription, image_url: finalImageUrl || null, promo_type: promoType, end_date: promoEndDate || null });
      toast.success("Actualité créée"); fetchData();
    } catch (error) { toast.error("Erreur"); }
  };

  const handleSubmitHero = async (e) => {
    e.preventDefault();
    setSavingHero(true);
    let finalImageUrl = heroBackgroundImage;
    if (heroUploadMode === "file" && heroFile) finalImageUrl = await uploadFile(heroFile);
    try {
      await axios.put(`${API}/hero-content`, { title_line1: heroTitleLine1, title_line2: heroTitleLine2, description: heroDescription, background_image: finalImageUrl });
      toast.success("Message d'accueil mis à jour"); fetchData();
    } catch (error) { toast.error("Erreur"); } finally { setSavingHero(false); }
  };

  const handleSubmitMenuItem = async (e) => {
    e.preventDefault();
    setSubmittingMenuItem(true);
    let finalImageUrl = menuItemImageUrl;
    if (menuItemUploadMode === "file" && menuItemFile) finalImageUrl = await uploadFile(menuItemFile);
    try {
      if (editingMenuItem) {
        await axios.put(`${API}/menu/${editingMenuItem.id}?name=${menuItemName}&description=${menuItemDescription}&price=${menuItemPrice}&category=${menuItemCategory}&is_featured=${menuItemFeatured}&image_url=${finalImageUrl}`);
        toast.success("Plat modifié");
      } else {
        await axios.post(`${API}/menu`, { name: menuItemName, description: menuItemDescription, price: parseInt(menuItemPrice), category: menuItemCategory, image_url: finalImageUrl, is_featured: menuItemFeatured });
        toast.success("Plat ajouté");
      }
      resetMenuForm(); fetchData();
    } catch (error) { toast.error("Erreur"); } finally { setSubmittingMenuItem(false); }
  };

  const resetMenuForm = () => {
    setShowMenuForm(false); setEditingMenuItem(null); setMenuItemName(""); setMenuItemDescription(""); setMenuItemPrice(""); setMenuItemCategory("Plats Ivoiriens"); setMenuItemImageUrl(""); setMenuItemFile(null); setMenuItemPreview(""); setMenuItemFeatured(false);
  };

  const openEditMenuItem = (item) => {
    setEditingMenuItem(item); setMenuItemName(item.name); setMenuItemDescription(item.description); setMenuItemPrice(item.price.toString()); setMenuItemCategory(item.category); setMenuItemImageUrl(item.image_url); setMenuItemFeatured(item.is_featured); setShowMenuForm(true);
  };

  const handleReviewAction = async (id, action) => {
    if (action === "approve") await axios.put(`${API}/reviews/${id}/approve`);
    else if (action === "hide") await axios.put(`${API}/reviews/${id}/hide`);
    else if (action === "delete") await axios.delete(`${API}/reviews/${id}`);
    fetchData();
  };

  const getYouTubeId = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  // --- COMPOSANTS UI RÉUTILISABLES ---
  const UploadModeToggle = ({ mode, setMode }) => (
    <div className="flex gap-2 mb-4">
      <Button type="button" onClick={() => setMode("url")} className={mode === "url" ? "bg-[#D4AF37] text-black" : "bg-white/5"} size="sm">Lien URL</Button>
      <Button type="button" onClick={() => setMode("file")} className={mode === "file" ? "bg-[#D4AF37] text-black" : "bg-white/5"} size="sm">Appareil</Button>
    </div>
  );

  const tabs = [
    { id: "accueil", label: "Accueil", icon: Home },
    { id: "menu", label: "Menu du Jour", icon: Calendar },
    { id: "photos", label: "Photos", icon: Image },
    { id: "videos", label: "Vidéos", icon: Video },
    { id: "promos", label: "Pubs & Actus", icon: Megaphone },
    { id: "plats", label: "Plats", icon: Utensils },
    { id: "commentaires", label: "Avis", icon: MessageSquare },
    { id: "caisse", label: "Caisse", icon: ShoppingCart },
  ];

  if (isCheckingAuth) return <div className="min-h-screen bg-[#05100D] flex items-center justify-center text-[#A3B1AD]">Vérification du privilège admin...</div>;

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-[#05100D] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="luxury-card p-10 w-full max-w-md text-center border-[#D4AF37]/20">
        <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-[#D4AF37]" size={40} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-6 font-display uppercase tracking-widest">Chez Loman Admin</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input placeholder="Nom d'utilisateur" value={username} onChange={e => setUsername(e.target.value)} className="input-luxury text-center" />
          <div className="relative">
            <Input type={showPassword ? "text" : "password"} placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} className="input-luxury text-center" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3 text-gray-500">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
          </div>
          <Button type="submit" disabled={loginLoading} className="w-full btn-gold py-8 text-lg font-bold uppercase tracking-widest">{loginLoading ? "Connexion..." : "Ouvrir la session"}</Button>
        </form>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05100D] pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* TOP BAR */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="text-center md:text-left">
            <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-[0.4em] block mb-2">Interface Professionnelle</span>
            <h1 className="text-3xl md:text-4xl text-white font-display">Gestion du Restaurant</h1>
          </div>
          <div className="flex gap-4">
            <RouterLink to="/dashboard" className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] px-6 py-2 rounded-full flex items-center gap-2 hover:bg-[#D4AF37] hover:text-black transition-all font-semibold"><LayoutDashboard size={18}/>Dashboard Pro</RouterLink>
            <Button onClick={fetchData} variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-full"><RefreshCw size={18}/></Button>
            <Button onClick={() => setShowLogoutConfirm(true)} className="bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 rounded-full hover:text-white transition-all"><LogOut size={18}/></Button>
          </div>
        </div>

        {/* TABS MENU */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 border-b border-white/5 pb-6">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === t.id ? "bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20" : "text-gray-400 hover:text-white bg-white/5 border border-transparent hover:border-white/10"}`}>{t.label}</button>
          ))}
        </div>

        {/* ACCUEIL HERO */}
        {activeTab === "accueil" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="luxury-card p-8">
                <h2 className="text-xl text-[#D4AF37] mb-8 font-display uppercase tracking-widest">Message de Bienvenue</h2>
                <form onSubmit={handleSubmitHero} className="space-y-6">
                    <div className="space-y-2"><Label className="text-gray-400 text-xs uppercase">Accroche (Ligne 1)</Label><Input placeholder="Ici c'est manger" value={heroTitleLine1} onChange={e => setHeroTitleLine1(e.target.value)} className="input-luxury" /></div>
                    <div className="space-y-2"><Label className="text-gray-400 text-xs uppercase">Slogan (Ligne 2 - Or)</Label><Input placeholder="bien hein" value={heroTitleLine2} onChange={e => setHeroTitleLine2(e.target.value)} className="input-luxury" /></div>
                    <div className="space-y-2"><Label className="text-gray-400 text-xs uppercase">Paragraphe descriptif</Label><Textarea placeholder="Décrivez l'expérience Chez Loman..." value={heroDescription} onChange={e => setHeroDescription(e.target.value)} className="input-luxury min-h-[120px]" /></div>
                    <div className="space-y-2"><Label className="text-gray-400 text-xs uppercase block mb-3">Fond d'écran du site</Label><UploadModeToggle mode={heroUploadMode} setMode={setHeroUploadMode} />
                    {heroUploadMode === "url" ? <Input value={heroBackgroundImage} onChange={e => setHeroBackgroundImage(e.target.value)} className="input-luxury" placeholder="URL de l'image" /> : <Input type="file" onChange={e => {const f=e.target.files[0]; if(f){setHeroFile(f); setHeroPreview(URL.createObjectURL(f))}}} className="input-luxury" />}</div>
                    <Button type="submit" disabled={savingHero} className="w-full btn-gold py-6 font-bold">{savingHero ? "Enregistrement..." : "Mettre à jour l'accueil"}</Button>
                </form>
            </motion.div>
            <div className="space-y-6">
                <h3 className="text-gray-400 text-xs uppercase tracking-widest">Aperçu Visuel</h3>
                <div className="luxury-card overflow-hidden h-[400px] relative border-[#D4AF37]/10">
                    <img src={heroPreview || heroBackgroundImage} className="w-full h-full object-cover opacity-60 transition-all duration-700" alt="preview hero" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-10 flex flex-col justify-end">
                        <h2 className="text-3xl font-accent italic text-white leading-none">{heroTitleLine1}<br/><span className="text-[#D4AF37]">{heroTitleLine2}</span></h2>
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* MENU DU JOUR */}
        {activeTab === "menu" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="luxury-card p-8">
                <h2 className="text-xl text-white mb-8 font-display uppercase tracking-widest">Publier le Menu</h2>
                <form onSubmit={handleSubmitMenu} className="space-y-6">
                    <div className="space-y-2"><Label className="text-gray-400 text-xs">DATE DU JOUR</Label><Input type="date" value={menuDate} onChange={e => setMenuDate(e.target.value)} className="input-luxury" /></div>
                    <div className="space-y-2"><Label className="text-gray-400 text-xs">PLATS AU MENU</Label>
                        {menuItemsList.map((it, idx) => (
                            <div key={idx} className="flex gap-2 mb-2"><Input placeholder={`Plat n°${idx+1}`} value={it} onChange={e => {const n = [...menuItemsList]; n[idx] = e.target.value; setMenuItemsList(n)}} className="input-luxury" /><Button type="button" onClick={() => setMenuItemsList(menuItemsList.filter((_,i)=>i!==idx))} className="bg-red-500/10 text-red-500 border border-red-500/20"><X size={16}/></Button></div>
                        ))}
                        <Button type="button" onClick={() => setMenuItemsList([...menuItemsList, ""])} variant="ghost" className="text-[#D4AF37] hover:bg-[#D4AF37]/5">+ Ajouter un plat</Button>
                    </div>
                    <div className="space-y-2 pt-4 border-t border-white/5"><Label className="text-gray-400 text-xs uppercase block mb-3">Affiche Graphique du Menu</Label><UploadModeToggle mode={menuUploadMode} setMode={setMenuUploadMode} />
                    {menuUploadMode === "url" ? <Input value={menuImageUrl} onChange={e => setMenuImageUrl(e.target.value)} className="input-luxury" placeholder="URL de l'affiche" /> : <Input type="file" onChange={e => handleMenuFileChange(e)} className="input-luxury" />}
                    {(menuPreview || menuImageUrl) && <img src={menuPreview || menuImageUrl} className="mt-4 w-40 h-40 object-cover rounded-xl border border-[#D4AF37]/20" />}</div>
                    <Button type="submit" className="w-full btn-gold py-6 font-bold uppercase">Lancer le menu du jour</Button>
                </form>
            </motion.div>
            <div className="space-y-4">
                <h3 className="text-gray-400 text-xs uppercase tracking-widest mb-4">Historique des Menus</h3>
                {dailyMenus.map(m => (
                    <div key={m.id} className="bg-white/5 border border-white/5 p-5 rounded-2xl flex justify-between items-center group">
                        <div><p className="text-white font-bold">{new Date(m.date).toLocaleDateString('fr-FR', {weekday:'long', day:'numeric', month:'long'})}</p><p className="text-xs text-gray-500 mt-1">{m.items.join(" • ")}</p></div>
                        <Button onClick={() => handleDeleteMenu(m.id)} variant="ghost" className="text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={18}/></Button>
                    </div>
                ))}
            </div>
          </div>
        )}

        {/* PHOTOS GALLERY */}
        {activeTab === "photos" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="luxury-card p-8">
                    <h2 className="text-xl text-white mb-8 font-display uppercase tracking-widest">Enrichir la Galerie</h2>
                    <form onSubmit={handleSubmitPhoto} className="space-y-6">
                        <UploadModeToggle mode={photoUploadMode} setMode={setPhotoUploadMode} />
                        {photoUploadMode === "url" ? <Input value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} className="input-luxury" placeholder="URL de l'image" /> : <Input type="file" onChange={e => {const f=e.target.files[0]; if(f){setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f))}}} className="input-luxury" />}
                        <Input placeholder="Légende de la photo" value={photoCaption} onChange={e => setPhotoCaption(e.target.value)} className="input-luxury" />
                        <select value={photoCategory} onChange={e => setPhotoCategory(e.target.value)} className="w-full bg-[#0F2E24] border border-white/10 text-white p-4 rounded-xl outline-none focus:border-[#D4AF37]">
                            <option value="restaurant">Cadre / Restaurant</option>
                            <option value="plats">Nos Plats</option>
                            <option value="ambiance">Ambiance & Clientèle</option>
                        </select>
                        {photoPreview && <img src={photoPreview} className="w-full h-48 object-cover rounded-xl border border-white/10" />}
                        <Button type="submit" disabled={uploadingPhoto} className="w-full btn-gold py-6">{uploadingPhoto ? "Transfert..." : "Ajouter à la galerie"}</Button>
                    </form>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto max-h-[600px] pr-2">
                    {photos.map(p => (
                        <div key={p.id} className="relative group rounded-2xl overflow-hidden aspect-square border border-white/10 shadow-lg">
                            <img src={p.image_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="gallery item" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                <button onClick={() => handleDeletePhoto(p.id)} className="bg-red-600 text-white p-3 rounded-full hover:bg-red-500"><Trash2 size={20}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* VIDEOS */}
        {activeTab === "videos" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="luxury-card p-8">
                    <h2 className="text-xl text-white mb-8 font-display uppercase tracking-widest">Publier une Vidéo</h2>
                    <form onSubmit={handleSubmitVideo} className="space-y-6">
                        <Input placeholder="Titre de la vidéo" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} className="input-luxury" />
                        <UploadModeToggle mode={videoUploadMode} setMode={setVideoUploadMode} />
                        {videoUploadMode === "url" ? <Input placeholder="Lien YouTube ou URL direct" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="input-luxury" /> : <Input type="file" onChange={e => setVideoFile(e.target.files[0])} className="input-luxury" />}
                        <Textarea placeholder="Description courte" value={videoDescription} onChange={e => setVideoDescription(e.target.value)} className="input-luxury" />
                        <Button type="submit" disabled={uploadingVideo} className="w-full btn-gold py-6">Vidéos (+)</Button>
                    </form>
                </div>
                <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2">
                    {videos.map(v => (
                        <div key={v.id} className="bg-white/5 border border-white/5 p-5 rounded-2xl flex justify-between items-center group">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-10 bg-black/40 rounded flex items-center justify-center border border-white/10"><Video className="text-[#D4AF37]" size={20}/></div>
                                <div><p className="text-white font-semibold text-sm">{v.title}</p><p className="text-[10px] text-gray-500 uppercase">{v.video_type}</p></div>
                            </div>
                            <div className="flex gap-4 items-center">
                                <Switch checked={v.is_active} onCheckedChange={() => handleToggleVideo(v.id, v.is_active)} />
                                <Button onClick={() => handleDeleteVideo(v.id)} variant="ghost" className="text-red-500"><Trash2 size={16}/></Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* PROMOS & ACTUS */}
        {activeTab === "promos" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="luxury-card p-8">
                    <h2 className="text-xl text-white mb-8 font-display uppercase tracking-widest">Publicités & Actus</h2>
                    <form onSubmit={handleSubmitPromo} className="space-y-6">
                        <Input placeholder="Titre de l'info" value={promoTitle} onChange={e => setPromoTitle(e.target.value)} className="input-luxury" />
                        <div className="space-y-2"><Label className="text-gray-400 text-[10px] uppercase">Catégorie d'affichage</Label>
                        <select value={promoType} onChange={e => setPromoType(e.target.value)} className="w-full bg-[#0F2E24] border border-white/10 text-white p-4 rounded-xl outline-none focus:border-[#D4AF37]">
                            <option value="Promotion">Promotion Restaurant</option>
                            <option value="Concert">Événement / Concert</option>
                            <option value="Biblique">Verset / Info Biblique</option>
                            <option value="Annonce">Annonce Générale</option>
                        </select></div>
                        <Textarea placeholder="Contenu du message..." value={promoDescription} onChange={e => setPromoDescription(e.target.value)} className="input-luxury min-h-[100px]" />
                        <div className="space-y-2"><Label className="text-gray-400 text-[10px] uppercase">Date de fin (Optionnel)</Label><Input type="date" value={promoEndDate} onChange={e => setPromoEndDate(e.target.value)} className="input-luxury" /></div>
                        <UploadModeToggle mode={promoUploadMode} setMode={setPromoUploadMode} />
                        {promoUploadMode === "url" ? <Input value={promoImage} onChange={e => setPromoImage(e.target.value)} className="input-luxury" placeholder="URL Affiche" /> : <Input type="file" onChange={e => setPromoFile(e.target.files[0])} className="input-luxury" />}
                        <Button type="submit" disabled={uploadingPromo} className="w-full btn-gold py-6 font-bold">Lancer l'actualité</Button>
                    </form>
                </div>
                <div className="space-y-4">
                    {promotions.map(pr => (
                        <div key={pr.id} className="bg-white/5 border border-white/5 p-5 rounded-2xl flex justify-between items-center shadow-lg group">
                            <div className="flex gap-4 items-center">
                                <div className="p-3 bg-[#D4AF37]/10 rounded-full text-[#D4AF37]"><Megaphone size={18}/></div>
                                <div><p className="text-white font-bold text-sm leading-tight">{pr.title}</p><span className="text-[10px] text-[#D4AF37] uppercase font-bold tracking-widest">{pr.promo_type}</span></div>
                            </div>
                            <div className="flex gap-4">
                                <Switch checked={pr.is_active} onCheckedChange={() => handleTogglePromo(pr.id, pr.is_active)} />
                                <Button onClick={() => handleDeletePromo(pr.id)} variant="ghost" className="text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={18}/></Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* GESTION PLATS */}
        {activeTab === "plats" && (
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl text-white font-display uppercase tracking-widest">Carte des Mets</h2>
                    <Button onClick={() => {resetMenuForm(); setShowMenuForm(true)}} className="btn-gold px-8"><Plus className="mr-2"/>Nouveau Plat</Button>
                </div>
                
                <AnimatePresence>
                {showMenuForm && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="luxury-card p-10 space-y-6 border-[#D4AF37]/30 shadow-2xl shadow-[#D4AF37]/5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input placeholder="Intitulé du plat" value={menuItemName} onChange={e => setMenuItemName(e.target.value)} className="input-luxury" />
                            <Input type="number" placeholder="Tarif (FCFA)" value={menuItemPrice} onChange={e => setMenuItemPrice(e.target.value)} className="input-luxury" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <select value={menuItemCategory} onChange={e => setMenuItemCategory(e.target.value)} className="w-full bg-[#0F2E24] border border-white/10 text-white p-4 rounded-xl outline-none focus:border-[#D4AF37]">
                                {MENU_CATEGORIES.map(c => <option key={c} value={c} className="text-black">{c}</option>)}
                            </select>
                            <Input placeholder="Lien de la photo" value={menuItemImageUrl} onChange={e => setMenuItemImageUrl(e.target.value)} className="input-luxury" />
                        </div>
                        <Textarea placeholder="Description gastronomique..." value={menuItemDescription} onChange={e => setMenuItemDescription(e.target.value)} className="input-luxury min-h-[100px]" />
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl">
                            <Switch checked={menuItemFeatured} onCheckedChange={setMenuItemFeatured}/>
                            <span className="text-white text-sm font-bold uppercase tracking-widest">Mettre en vedette (Page d'accueil)</span>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <Button onClick={handleSubmitMenuItem} disabled={submittingMenuItem} className="btn-gold flex-1 py-6 text-lg font-bold">{submittingMenuItem ? "Action..." : "Valider le Plat"}</Button>
                            <Button onClick={resetMenuForm} variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/5">Abandonner</Button>
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {menuItems.map(it => (
                        <div key={it.id} className="luxury-card group p-0 overflow-hidden relative border-white/5">
                            <div className="h-40 relative overflow-hidden">
                                <img src={it.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                                {it.is_featured && <div className="absolute top-3 left-3 bg-[#D4AF37] text-black text-[8px] font-black px-2 py-1 rounded-sm shadow-xl">VEDETTE</div>}
                            </div>
                            <div className="p-5">
                                <h4 className="text-white font-bold text-sm leading-tight mb-1">{it.name}</h4>
                                <p className="text-[#D4AF37] font-display text-lg">{it.price.toLocaleString()} F</p>
                                <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2"><Switch checked={it.is_available} onCheckedChange={() => handleToggleMenuItem(it.id, "is_available", it.is_available)} /><span className="text-[10px] text-gray-500 uppercase font-bold">Dispo</span></div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEditMenuItem(it)} className="p-2 bg-white/5 rounded-full text-white hover:bg-[#D4AF37] hover:text-black transition-all"><Pencil size={14}/></button>
                                        <button onClick={() => handleDeleteMenuItem(it.id)} className="p-2 bg-red-500/10 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14}/></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* COMMENTAIRES / AVIS */}
        {activeTab === "commentaires" && (
            <div className="space-y-6">
                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-2xl text-white font-display uppercase tracking-widest">Avis Clients</h2>
                    <span className="bg-white/10 px-3 py-1 rounded-full text-[#D4AF37] text-xs font-bold">{allReviews.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allReviews.map(r => (
                    <div key={r.id} className={`luxury-card p-8 border-l-[6px] ${r.is_approved ? 'border-l-green-500 shadow-green-500/5' : 'border-l-yellow-500 shadow-yellow-500/5'}`}>
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#1A4D3E] flex items-center justify-center text-[#D4AF37] font-black text-lg">{r.author.charAt(0)}</div>
                                <div><p className="text-white font-bold leading-none">{r.author}</p><p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest">{new Date(r.created_at).toLocaleDateString()}</p></div>
                            </div>
                            <div className="flex gap-2">
                                {!r.is_approved ? <Button onClick={() => handleReviewAction(r.id, "approve")} className="bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white text-[10px] h-8 px-4 font-bold border border-green-500/20">Approuver</Button> : <Button onClick={() => handleReviewAction(r.id, "hide")} className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-white text-[10px] h-8 px-4 font-bold border border-yellow-500/20">Masquer</Button>}
                                <Button onClick={() => handleReviewAction(r.id, "delete")} className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-[10px] h-8 px-2 border border-red-500/20"><Trash2 size={14}/></Button>
                            </div>
                        </div>
                        <p className="text-[#F9F7F2]/80 italic text-lg leading-relaxed font-accent">"{r.comment}"</p>
                    </div>
                ))}
                </div>
            </div>
        )}

        {/* CAISSE COMPLÈTE */}
        {activeTab === "caisse" && (
            <div className="space-y-10">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="luxury-card p-6 text-center border-white/5 bg-white/[0.02]"><p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Ventes Actées</p><p className="text-3xl font-display font-bold text-[#D4AF37]">{cashStats?.total_sales || 0}</p></div>
                    <div className="luxury-card p-6 text-center border-white/5 bg-white/[0.02]"><p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Chiffre Affaire</p><p className="text-3xl font-display font-bold text-white">{(cashStats?.total_revenue || 0).toLocaleString()} F</p></div>
                    <div className="luxury-card p-6 text-center border-white/5 bg-white/[0.02]"><p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Total Espèces</p><p className="text-3xl font-display font-bold text-green-500">{(cashStats?.cash_total || 0).toLocaleString()} F</p></div>
                    <div className="luxury-card p-6 text-center border-white/5 bg-white/[0.02]"><p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Total Momo</p><p className="text-3xl font-display font-bold text-blue-500">{(cashStats?.mobile_money_total || 0).toLocaleString()} F</p></div>
                </div>

                {/* Formulaire Enregistrement */}
                <div className="luxury-card p-10 border-[#D4AF37]/10">
                    <div className="flex items-center gap-4 mb-10"><div className="p-3 bg-[#D4AF37]/10 rounded-xl text-[#D4AF37] shadow-lg shadow-[#D4AF37]/5"><ShoppingCart size={24}/></div><h3 className="text-2xl text-white font-display uppercase tracking-[0.2em]">Enregistrement Vente</h3></div>
                    <form onSubmit={handleCashSaleSubmit} className="space-y-6">
                        {cashItems.map((it, idx) => (
                            <div key={idx} className="flex flex-col md:flex-row gap-4 items-end bg-white/5 p-4 rounded-2xl border border-white/5 shadow-inner">
                                <div className="flex-1 w-full">
                                    <Label className="text-gray-400 text-[10px] uppercase font-bold mb-2 block">Désignation du Plat</Label>
                                    <select value={it.name} onChange={e => {const s=menuItems.find(m=>m.name===e.target.value); const n=[...cashItems]; n[idx]={...n[idx], name:e.target.value, price:s?s.price:n[idx].price}; setCashItems(n)}} className="w-full bg-[#0F2E24] border border-white/10 text-white rounded-xl p-4 text-sm outline-none focus:border-[#D4AF37] transition-all cursor-pointer">
                                        <option value="" className="text-gray-500">Choisir dans la carte...</option>
                                        {menuItems.filter(m=>m.is_available).map(m=><option key={m.id} value={m.name} className="text-black">{m.name} - {m.price}F</option>)}
                                    </select>
                                </div>
                                <div className="w-full md:w-32">
                                    <Label className="text-gray-400 text-[10px] uppercase font-bold mb-2 block">Quantité</Label>
                                    <Input type="number" min="1" value={it.quantity} onChange={e => {const n=[...cashItems]; n[idx].quantity=Number(e.target.value); setCashItems(n)}} className="input-luxury text-center text-xl h-14" />
                                </div>
                                <div className="w-full md:w-40">
                                    <Label className="text-gray-400 text-[10px] uppercase font-bold mb-2 block">Prix Unitaire</Label>
                                    <Input type="number" value={it.price} onChange={e => {const n=[...cashItems]; n[idx].price=Number(e.target.value); setCashItems(n)}} className="input-luxury text-center text-xl h-14 text-[#D4AF37] font-bold" />
                                </div>
                                {cashItems.length > 1 && <Button type="button" onClick={() => setCashItems(cashItems.filter((_,i)=>i!==idx))} className="bg-red-500 hover:bg-red-400 text-white h-14 w-14 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/10"><Trash2 size={20}/></Button>}
                            </div>
                        ))}
                        <div className="flex flex-col md:flex-row justify-between items-center py-6 border-y border-white/5">
                            <Button type="button" onClick={addCashItem} variant="outline" className="text-[#D4AF37] border-[#D4AF37]/30 hover:bg-[#D4AF37] hover:text-black py-6 px-10 rounded-xl font-bold uppercase tracking-widest text-xs">+ Ajouter une ligne</Button>
                            <div className="text-right mt-6 md:mt-0">
                                <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Total à payer</p>
                                <p className="text-4xl font-display font-bold text-[#D4AF37] drop-shadow-lg">{cashItems.reduce((s,i)=>s+(i.price*i.quantity),0).toLocaleString()} FCFA</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <Label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block">Canal de Règlement</Label>
                                <div className="flex gap-4">
                                    <Button type="button" onClick={()=>setCashPaymentMethod("especes")} className={`flex-1 py-8 rounded-2xl font-black uppercase text-xs transition-all ${cashPaymentMethod==="especes"?'bg-green-500 text-white shadow-xl shadow-green-500/20':'bg-white/5 text-gray-500 border border-white/5'}`}>Billet (Espèces)</Button>
                                    <Button type="button" onClick={()=>setCashPaymentMethod("mobile_money")} className={`flex-1 py-8 rounded-2xl font-black uppercase text-xs transition-all ${cashPaymentMethod==="mobile_money"?'bg-blue-600 text-white shadow-xl shadow-blue-500/20':'bg-white/5 text-gray-500 border border-white/5'}`}>Mobile (MoMo)</Button>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <Label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block">Note Privée</Label>
                                <Input placeholder="Commentaire libre (ex: Offert par le chef)" value={cashNote} onChange={e=>setCashNote(e.target.value)} className="input-luxury h-20" />
                            </div>
                        </div>
                        <Button type="submit" disabled={submittingCash} className="w-full btn-gold py-10 text-2xl font-black uppercase tracking-[0.2em] mt-8 shadow-2xl shadow-[#D4AF37]/10 active:scale-[0.99] transition-all">{submittingCash ? "Validation..." : "Fermer la vente"}</Button>
                    </form>
                </div>

                {/* Historique des transactions */}
                <div className="luxury-card p-8 bg-black/40">
                    <h3 className="text-xl text-white font-display uppercase mb-8 border-b border-white/5 pb-4">Historique Transactions</h3>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar">
                        {cashSales.map(s => (
                            <div key={s.id} className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl flex justify-between items-center shadow-lg group hover:bg-white/[0.04] transition-all">
                                <div className="space-y-2">
                                    <p className="text-white font-bold text-lg leading-none">{s.items.map(i => `${i.name} x${i.quantity}`).join(", ")}</p>
                                    <div className="flex items-center gap-3">
                                        <p className="text-[10px] text-gray-500 uppercase font-black">{new Date(s.created_at).toLocaleTimeString()}</p>
                                        <div className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase border ${s.payment_method === 'especes' ? 'border-green-500 text-green-500 bg-green-500/5' : 'border-blue-500 text-blue-500 bg-blue-500/5'}`}>{s.payment_method}</div>
                                        {s.note && <p className="text-[10px] text-[#D4AF37] italic opacity-60">Note: {s.note}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <p className="text-2xl text-white font-display font-bold">{s.total.toLocaleString()} F</p>
                                    <button onClick={() => {setSaleToDelete(s.id); setShowDeleteAuth(true)}} className="text-red-500/40 hover:text-red-500 transition-colors p-2"><Trash2 size={20}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* --- MODALES SÉCURITÉ LUXE DARK --- */}
      <AnimatePresence>
        {showDeleteAuth && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0A1F1A] border border-[#D4AF37]/40 rounded-[2.5rem] p-12 max-w-sm w-full text-center shadow-[0_0_50px_rgba(212,175,55,0.15)]">
              <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20 shadow-inner">
                <ShieldAlert size={56} className="text-red-500" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4 font-display">Sécurité Admin</h3>
              <p className="text-gray-400 text-sm mb-10 leading-relaxed uppercase tracking-widest font-semibold opacity-70">Saisie du Code Maître Requise pour suppression définitive.</p>
              <div className="mb-10">
                <Input type="password" placeholder="••••••••" className="bg-black/60 border-[#D4AF37]/30 text-[#D4AF37] text-center text-3xl tracking-[0.6em] h-20 rounded-2xl shadow-inner font-black" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} autoFocus />
              </div>
              <div className="flex gap-4">
                <Button onClick={() => {setShowDeleteAuth(false); setDeletePassword("");}} className="flex-1 bg-white/5 border border-white/10 text-white font-bold py-6 rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-xs">Fermer</Button>
                <Button onClick={confirmDeleteSale} className="flex-1 bg-gradient-to-br from-red-700 to-red-500 text-white border-0 shadow-2xl shadow-red-900/40 py-6 rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all">Annihiler</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowLogoutConfirm(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0F2E24] border border-white/10 rounded-[2rem] p-10 max-w-xs w-full text-center shadow-2xl" onClick={e=>e.stopPropagation()}>
              <div className="bg-[#D4AF37]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"><LogOut size={36} className="text-[#D4AF37]" /></div>
              <p className="text-white font-bold mb-8 text-xl">Quitter la gestion ?</p>
              <div className="flex gap-4">
                <Button onClick={()=>setShowLogoutConfirm(false)} className="flex-1 bg-white/5 border border-white/10 text-white py-6 rounded-xl font-bold">Rester</Button>
                <Button onClick={confirmLogout} className="flex-1 bg-red-600 text-white py-6 rounded-xl font-bold shadow-lg shadow-red-900/30">Sortir</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPage;