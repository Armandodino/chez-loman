import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Calendar, Image, Utensils, RefreshCw, Video, Megaphone, LogOut, Lock, User, Eye, EyeOff, X, Upload, Link, FileImage, Home, LayoutDashboard, MessageSquare, Check, XCircle, ShoppingCart, Pencil, ShieldAlert } from "lucide-react";
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
  
  // MODIFS : Daily Menu Image States
  const [menuImageUrl, setMenuImageUrl] = useState("");
  const [menuUploadMode, setMenuUploadMode] = useState("url");
  const [menuFile, setMenuFile] = useState(null);
  const [menuPreview, setMenuPreview] = useState("");
  const menuFileRef = useRef(null);

  // Photo Form
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoCategory, setPhotoCategory] = useState("restaurant");
  const [photoUploadMode, setPhotoUploadMode] = useState("url"); // "url" or "file"
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
  const [promoType, setPromoType] = useState("banner");
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

  // Menu Item Form (Add/Edit)
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
      const response = await axios.post(`${API}/admin/login`, {
        username,
        password
      });
      
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

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      await axios.post(`${API}/admin/logout`);
    } catch (error) {
      console.error("Logout error:", error);
    }
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
      // Populate hero form
      if (heroRes.data) {
        setHeroTitleLine1(heroRes.data.title_line1 || "");
        setHeroTitleLine2(heroRes.data.title_line2 || "");
        setHeroDescription(heroRes.data.description || "");
        setHeroBackgroundImage(heroRes.data.background_image || "");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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
    } catch (error) {
      console.error("Error fetching caisse data:", error);
    }
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

  // --- DELETE CONFIRMATION HANDLERS ---
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

  // ==================== FILE UPLOAD ====================
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await axios.post(`${API}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    
    return response.data.url;
  };

  // Handle photo file selection
  const handlePhotoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle video file selection
  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
    }
  };

  // Handle promo file selection
  const handlePromoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPromoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPromoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ==================== DAILY MENU ====================
  const addMenuItem = () => setMenuItemsList([...menuItemsList, ""]);
  const removeMenuItem = (index) => setMenuItemsList(menuItemsList.filter((_, i) => i !== index));
  const updateMenuItem = (index, value) => {
    const newItems = [...menuItemsList];
    newItems[index] = value;
    setMenuItemsList(newItems);
  };

  // MODIFS : Handle Menu Image Change
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

    // MODIFS : Upload logic for daily menu image
    if (menuUploadMode === "file" && menuFile) {
      try {
        finalImageUrl = await uploadFile(menuFile);
      } catch (error) {
        toast.error("Erreur lors de l'upload de l'affiche");
        return;
      }
    }

    try {
      await axios.post(`${API}/daily-menu`, {
        date: menuDate,
        items: filteredItems,
        special_message: specialMessage || null,
        image_url: finalImageUrl || null // Nouveau champ
      });
      toast.success("Menu du jour créé!");
      setMenuItemsList([""]);
      setSpecialMessage("");
      setMenuImageUrl("");
      setMenuFile(null);
      setMenuPreview("");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la création");
    }
  };

  const handleDeleteMenu = async (menuId) => {
    if (!window.confirm("Supprimer ce menu?")) return;
    try {
      await axios.delete(`${API}/daily-menu/${menuId}`);
      toast.success("Menu supprimé");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  // ==================== PHOTOS ====================
  const handleSubmitPhoto = async (e) => {
    e.preventDefault();
    
    let finalUrl = photoUrl;
    
    // If file upload mode, upload file first
    if (photoUploadMode === "file") {
      if (!photoFile) {
        toast.error("Sélectionnez une photo");
        return;
      }
      setUploadingPhoto(true);
      try {
        finalUrl = await uploadFile(photoFile);
      } catch (error) {
        toast.error("Erreur lors de l'upload de la photo");
        setUploadingPhoto(false);
        return;
      }
    } else {
      if (!photoUrl.trim()) {
        toast.error("Entrez l'URL de la photo");
        return;
      }
    }
    
    try {
      await axios.post(`${API}/gallery`, {
        image_url: finalUrl,
        caption: photoCaption || null,
        category: photoCategory
      });
      toast.success("Photo ajoutée!");
      setPhotoUrl("");
      setPhotoCaption("");
      setPhotoFile(null);
      setPhotoPreview("");
      if (photoFileRef.current) photoFileRef.current.value = "";
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de l'ajout");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm("Supprimer cette photo?")) return;
    try {
      await axios.delete(`${API}/gallery/${photoId}`);
      toast.success("Photo supprimée");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  // ==================== VIDEOS ====================
  const handleSubmitVideo = async (e) => {
    e.preventDefault();
    
    if (!videoTitle.trim()) {
      toast.error("Entrez un titre");
      return;
    }
    
    let finalUrl = videoUrl;
    let finalType = videoType;
    
    // If file upload mode, upload file first
    if (videoUploadMode === "file") {
      if (!videoFile) {
        toast.error("Sélectionnez une vidéo");
        return;
      }
      setUploadingVideo(true);
      try {
        finalUrl = await uploadFile(videoFile);
        finalType = "direct";
      } catch (error) {
        toast.error("Erreur lors de l'upload de la vidéo");
        setUploadingVideo(false);
        return;
      }
    } else {
      if (!videoUrl.trim()) {
        toast.error("Entrez l'URL de la vidéo");
        return;
      }
    }
    
    try {
      await axios.post(`${API}/videos`, {
        title: videoTitle,
        video_url: finalUrl,
        video_type: finalType,
        description: videoDescription || null
      });
      toast.success("Vidéo ajoutée!");
      setVideoTitle("");
      setVideoUrl("");
      setVideoDescription("");
      setVideoFile(null);
      if (videoFileRef.current) videoFileRef.current.value = "";
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de l'ajout");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm("Supprimer cette vidéo?")) return;
    try {
      await axios.delete(`${API}/videos/${videoId}`);
      toast.success("Vidéo supprimée");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleToggleVideo = async (videoId, isActive) => {
    try {
      await axios.put(`${API}/videos/${videoId}?is_active=${!isActive}`);
      toast.success("Vidéo mise à jour");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  // ==================== PROMOTIONS ====================
  const handleSubmitPromo = async (e) => {
    e.preventDefault();
    if (!promoTitle.trim() || !promoDescription.trim()) {
      toast.error("Remplissez le titre et la description");
      return;
    }
    
    let finalImageUrl = promoImage;
    
    // If file upload mode and file selected, upload it
    if (promoUploadMode === "file" && promoFile) {
      setUploadingPromo(true);
      try {
        finalImageUrl = await uploadFile(promoFile);
      } catch (error) {
        toast.error("Erreur lors de l'upload de l'image");
        setUploadingPromo(false);
        return;
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
      setPromoTitle("");
      setPromoDescription("");
      setPromoImage("");
      setPromoStartDate("");
      setPromoEndDate("");
      setPromoFile(null);
      setPromoPreview("");
      if (promoFileRef.current) promoFileRef.current.value = "";
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la création");
    } finally {
      setUploadingPromo(false);
    }
  };

  const handleDeletePromo = async (promoId) => {
    if (!window.confirm("Supprimer cette promotion?")) return;
    try {
      await axios.delete(`${API}/promotions/${promoId}`);
      toast.success("Promotion supprimée");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleTogglePromo = async (promoId, isActive) => {
    try {
      await axios.put(`${API}/promotions/${promoId}`, { is_active: !isActive });
      toast.success("Promotion mise à jour");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  // ==================== HERO CONTENT ====================
  const handleHeroFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHeroFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeroPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitHero = async (e) => {
    e.preventDefault();
    setSavingHero(true);
    
    let finalImageUrl = heroBackgroundImage;
    
    // If file upload mode and file selected, upload it
    if (heroUploadMode === "file" && heroFile) {
      try {
        finalImageUrl = await uploadFile(heroFile);
      } catch (error) {
        toast.error("Erreur lors de l'upload de l'image");
        setSavingHero(false);
        return;
      }
    }
    
    try {
      await axios.put(`${API}/hero-content`, {
        title_line1: heroTitleLine1 || undefined,
        title_line2: heroTitleLine2 || undefined,
        description: heroDescription || undefined,
        background_image: finalImageUrl || undefined
      });
      toast.success("Message d'accueil mis à jour!");
      setHeroFile(null);
      setHeroPreview("");
      if (heroFileRef.current) heroFileRef.current.value = "";
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSavingHero(false);
    }
  };

  // ==================== MENU ITEMS ====================
  const handleMenuItemFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMenuItemFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMenuItemPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
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
    if (menuItemFileRef.current) menuItemFileRef.current.value = "";
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
    setMenuItemFile(null);
    setMenuItemPreview("");
    setShowMenuForm(true);
  };

  const handleSubmitMenuItem = async (e) => {
    e.preventDefault();
    if (!menuItemName.trim() || !menuItemDescription.trim() || !menuItemPrice) {
      toast.error("Remplissez tous les champs obligatoires");
      return;
    }

    setSubmittingMenuItem(true);
    let finalImageUrl = menuItemImageUrl;

    if (menuItemUploadMode === "file") {
      if (!menuItemFile && !editingMenuItem) {
        toast.error("Sélectionnez une photo");
        setSubmittingMenuItem(false);
        return;
      }
      if (menuItemFile) {
        try {
          finalImageUrl = await uploadFile(menuItemFile);
        } catch (error) {
          toast.error("Erreur lors de l'upload de la photo");
          setSubmittingMenuItem(false);
          return;
        }
      }
    } else {
      if (!finalImageUrl.trim() && !editingMenuItem) {
        toast.error("Entrez l'URL de la photo");
        setSubmittingMenuItem(false);
        return;
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
        toast.success("Plat modifié avec succès!");
      } else {
        await axios.post(`${API}/menu`, {
          name: menuItemName,
          description: menuItemDescription,
          price: parseInt(menuItemPrice),
          category: menuItemCategory,
          image_url: finalImageUrl,
          is_featured: menuItemFeatured
        });
        toast.success("Plat ajouté avec succès!");
      }
      resetMenuForm();
      fetchData();
    } catch (error) {
      toast.error(editingMenuItem ? "Erreur lors de la modification" : "Erreur lors de l'ajout");
    } finally {
      setSubmittingMenuItem(false);
    }
  };

  const handleToggleMenuItem = async (itemId, field, currentValue) => {
    try {
      const params = new URLSearchParams();
      params.append(field, (!currentValue).toString());
      await axios.put(`${API}/menu/${itemId}?${params.toString()}`);
      toast.success("Plat mis à jour");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleDeleteMenuItem = async (itemId) => {
    if (!window.confirm("Supprimer ce plat?")) return;
    try {
      await axios.delete(`${API}/menu/${itemId}`);
      toast.success("Plat supprimé");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  // Helper to extract YouTube video ID
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

  // Upload mode toggle component
  const UploadModeToggle = ({ mode, setMode }) => (
    <div className="flex gap-2 mb-4">
      <button
        type="button"
        onClick={() => setMode("url")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
          mode === "url" 
          ? "bg-[#D4AF37] text-[#0F2E24]" 
          : "bg-white/5 text-[#A3B1AD] border border-white/10"
        }`}
      >
        <Link size={16} />
        Lien URL
      </button>
      <button
        type="button"
        onClick={() => setMode("file")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
          mode === "file" 
          ? "bg-[#D4AF37] text-[#0F2E24]" 
          : "bg-white/5 text-[#A3B1AD] border border-white/10"
        }`}
      >
        <Upload size={16} />
        Depuis l'appareil
      </button>
    </div>
  );

  // Loading state
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

  // Login Form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#05100D] pt-32 pb-24 flex items-center justify-center" data-testid="admin-login-page">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-6"
        >
          <div className="luxury-card p-8 md:p-10 rounded-3xl">
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
                  <Input
                    type="text"
                    placeholder="Entrez votre nom d'utilisateur"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-luxury pl-12"
                    data-testid="login-username"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-[#A3B1AD] mb-2 block">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3B1AD]" size={18} />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-luxury pl-12 pr-12"
                    data-testid="login-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3B1AD] hover:text-[#D4AF37]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loginLoading}
                className="w-full btn-gold py-6 text-lg"
                data-testid="login-submit"
              >
                {loginLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-[#0F2E24] border-t-transparent rounded-full animate-spin"></div>
                    Connexion...
                  </span>
                ) : (
                  "Se Connecter"
                )}
              </Button>
            </form>

            <div className="mt-8 p-4 bg-[#D4AF37]/10 rounded-xl">
              <p className="text-[#D4AF37] text-sm text-center">
                Accès réservé à l'administrateur du restaurant
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-[#05100D] pt-32 pb-24" data-testid="admin-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.3em] mb-2 block">
              Espace Administrateur
            </span>
            <h1 className="text-3xl md:text-4xl text-[#F9F7F2]">Gestion du Restaurant</h1>
          </motion.div>
          <div className="flex items-center gap-4">
            <RouterLink to="/dashboard" className="bg-[#D4AF37] text-[#0F2E24] hover:bg-[#F2CC8F] rounded-full px-6 py-2 flex items-center gap-2 text-sm font-semibold transition-all" data-testid="dashboard-link">
              <LayoutDashboard size={16} />
              Dashboard Pro
            </RouterLink>
            <Button onClick={fetchData} className="bg-white/5 border border-white/10 text-[#A3B1AD] hover:text-[#D4AF37] hover:border-[#D4AF37]/50 rounded-full px-6" data-testid="refresh-btn">
              <RefreshCw size={16} className="mr-2" />
              Actualiser
            </Button>
            <Button onClick={handleLogout} className="bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-full px-6" data-testid="logout-btn">
              <LogOut size={16} className="mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-10 pb-4 border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[#D4AF37] text-[#0F2E24]"
                  : "bg-white/5 text-[#A3B1AD] border border-white/10 hover:border-[#D4AF37]/50 hover:text-[#D4AF37]"
              }`}
              data-testid={`tab-${tab.id}`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ==================== ACCUEIL / HERO ==================== */}
        {activeTab === "accueil" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="luxury-card p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Home className="text-[#D4AF37]" size={24} />
                <h2 className="text-xl text-[#F9F7F2] font-semibold">Message d'Accueil</h2>
              </div>
              
              <form onSubmit={handleSubmitHero} className="space-y-5">
                <div>
                  <Label className="text-[#A3B1AD] mb-2 block">Titre - Ligne 1</Label>
                  <Input 
                    placeholder="Ici c'est manger" 
                    value={heroTitleLine1} 
                    onChange={(e) => setHeroTitleLine1(e.target.value)} 
                    className="input-luxury" 
                    data-testid="hero-title1-input"
                  />
                </div>
                <div>
                  <Label className="text-[#A3B1AD] mb-2 block">Titre - Ligne 2 (en doré)</Label>
                  <Input 
                    placeholder="bien hein" 
                    value={heroTitleLine2} 
                    onChange={(e) => setHeroTitleLine2(e.target.value)} 
                    className="input-luxury" 
                    data-testid="hero-title2-input"
                  />
                </div>
                <div>
                  <Label className="text-[#A3B1AD] mb-2 block">Description</Label>
                  <Textarea 
                    placeholder="Une cuisine ivoirienne authentique..." 
                    value={heroDescription} 
                    onChange={(e) => setHeroDescription(e.target.value)} 
                    className="input-luxury min-h-[100px]" 
                    data-testid="hero-description-input"
                  />
                </div>
                
                <div>
                  <Label className="text-[#A3B1AD] mb-2 block">Image d'arrière-plan</Label>
                  <UploadModeToggle mode={heroUploadMode} setMode={setHeroUploadMode} />
                  
                  {heroUploadMode === "url" ? (
                    <Input 
                      type="url" 
                      placeholder="https://exemple.com/image.jpg" 
                      value={heroBackgroundImage} 
                      onChange={(e) => setHeroBackgroundImage(e.target.value)} 
                      className="input-luxury" 
                      data-testid="hero-image-url-input"
                    />
                  ) : (
                    <div>
                      <div 
                        onClick={() => heroFileRef.current?.click()}
                        className="border-2 border-dashed border-[#D4AF37]/30 rounded-xl p-6 text-center cursor-pointer hover:border-[#D4AF37]/50 transition-colors"
                      >
                        <FileImage className="mx-auto text-[#D4AF37] mb-2" size={32} />
                        <p className="text-[#A3B1AD] text-sm">Cliquez pour sélectionner une image</p>
                      </div>
                      <input 
                        ref={heroFileRef}
                        type="file" 
                        accept="image/*" 
                        onChange={handleHeroFileChange} 
                        className="hidden" 
                        data-testid="hero-file-input"
                      />
                      {heroFile && <p className="text-[#D4AF37] text-sm mt-2">Fichier: {heroFile.name}</p>}
                    </div>
                  )}
                </div>

                <Button type="submit" disabled={savingHero} className="w-full btn-gold" data-testid="submit-hero-btn">
                  {savingHero ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#0F2E24] border-t-transparent rounded-full animate-spin"></div>
                      Enregistrement...
                    </span>
                  ) : (
                    "Enregistrer les modifications"
                  )}
                </Button>
              </form>
            </motion.div>

            {/* Preview */}
            <div className="space-y-4">
              <h3 className="text-lg text-[#F9F7F2] font-semibold">Aperçu en direct</h3>
              <div className="luxury-card rounded-2xl overflow-hidden">
                <div className="relative h-64">
                  <img 
                    src={heroPreview || heroBackgroundImage || "https://customer-assets.emergentagent.com/job_loman-restaurant/artifacts/jde9y3pb_chl.jpg"} 
                    alt="Aperçu arrière-plan" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
                  <div className="absolute inset-0 p-6 flex flex-col justify-center">
                    <span className="text-[#D4AF37] text-[10px] font-semibold uppercase tracking-[0.2em] mb-2">
                      Restaurant Ivoirien d'Exception
                    </span>
                    <h2 className="text-2xl font-accent italic text-white leading-tight mb-2">
                      {heroTitleLine1 || "Ici c'est manger"}<br/>
                      <span className="text-[#D4AF37]">{heroTitleLine2 || "bien hein"}</span>
                    </h2>
                    <p className="text-sm text-white/70 line-clamp-2">
                      {heroDescription || "Une cuisine ivoirienne authentique, sublimée par notre savoir-faire."}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="luxury-card p-5 rounded-2xl">
                <h4 className="text-[#F9F7F2] font-semibold mb-3">Conseils</h4>
                <ul className="space-y-2 text-sm text-[#A3B1AD]">
                  <li>• Utilisez une image de bonne qualité (min. 1920x1080)</li>
                  <li>• Préférez une image avec un sujet à droite pour une meilleure lisibilité du texte</li>
                  <li>• Gardez le titre court et accrocheur</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ==================== MENU DU JOUR ==================== */}
        {activeTab === "menu" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="luxury-card p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="text-[#D4AF37]" size={24} />
                <h2 className="text-xl text-[#F9F7F2] font-semibold">Nouveau Menu du Jour</h2>
              </div>
              <form onSubmit={handleSubmitMenu} className="space-y-5">
                <div>
                  <Label className="text-[#A3B1AD] mb-2 block">Date</Label>
                  <Input type="date" value={menuDate} onChange={(e) => setMenuDate(e.target.value)} className="input-luxury" data-testid="menu-date-input" />
                </div>
                <div>
                  <Label className="text-[#A3B1AD] mb-2 block">Plats du jour</Label>
                  <div className="space-y-2">
                    {menuItemsList.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Input placeholder={`Plat ${index + 1} (ex: Attièkè Poisson - 3500 FCFA)`} value={item} onChange={(e) => updateMenuItem(index, e.target.value)} className="input-luxury" data-testid={`menu-item-${index}`} />
                        {menuItemsList.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeMenuItem(index)} className="text-red-400 hover:text-red-300">
                            <X size={18} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" onClick={addMenuItem} className="mt-3 w-full bg-transparent border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg" data-testid="add-menu-item-btn">
                    <Plus size={16} className="mr-2" /> Ajouter un plat
                  </Button>
                </div>

                {/* MODIFS : Daily Menu Image Form Section */}
                <div className="mt-6">
                  <Label className="text-[#A3B1AD] mb-2 block">Affiche du Menu (Image)</Label>
                  <UploadModeToggle mode={menuUploadMode} setMode={setMenuUploadMode} />
                  {menuUploadMode === "url" ? (
                    <Input 
                      placeholder="Lien de l'image" 
                      value={menuImageUrl} 
                      onChange={(e) => setMenuImageUrl(e.target.value)} 
                      className="input-luxury" 
                    />
                  ) : (
                    <div 
                      onClick={() => menuFileRef.current?.click()} 
                      className="border-2 border-dashed border-[#D4AF37]/30 p-6 rounded-xl text-center cursor-pointer hover:border-[#D4AF37]/50"
                    >
                      <Upload className="mx-auto text-[#D4AF37] mb-2" />
                      <p className="text-xs text-[#A3B1AD]">Cliquez pour uploader l'affiche</p>
                      <input 
                        type="file" 
                        ref={menuFileRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleMenuFileChange} 
                      />
                    </div>
                  )}
                  {(menuPreview || menuImageUrl) && (
                    <div className="mt-4 relative w-32 h-32 rounded-lg overflow-hidden border border-[#D4AF37]/20">
                      <img src={menuPreview || menuImageUrl} className="w-full h-full object-cover" alt="Preview menu" />
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-[#A3B1AD] mb-2 block">Message spécial (optionnel)</Label>
                  <Textarea placeholder="Ex: Bissap offert pour toute commande de plus de 5000 FCFA!" value={specialMessage} onChange={(e) => setSpecialMessage(e.target.value)} className="input-luxury min-h-[80px]" data-testid="special-message-input" />
                </div>
                <Button type="submit" className="w-full btn-gold" data-testid="submit-menu-btn">Publier le Menu</Button>
              </form>
            </motion.div>

            <div className="space-y-4">
              <h3 className="text-lg text-[#F9F7F2] font-semibold">Menus récents ({dailyMenus.length})</h3>
              {loading ? (
                <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse"></div>)}</div>
              ) : dailyMenus.length === 0 ? (
                <div className="luxury-card p-8 rounded-2xl text-center"><p className="text-[#A3B1AD]">Aucun menu créé</p></div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {dailyMenus.map((menu) => (
                    <motion.div key={menu.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="luxury-card p-5 rounded-2xl">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${menu.is_active ? "bg-green-500/20 text-green-400" : "bg-white/10 text-[#A3B1AD]"}`}>
                            {menu.is_active ? "Actif" : "Inactif"}
                          </span>
                          <p className="text-[#F9F7F2] font-semibold">
                            {new Date(menu.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteMenu(menu.id)} className="text-red-400 hover:text-red-300" data-testid={`delete-menu-${menu.id}`}>
                          <Trash2 size={18} />
                        </Button>
                      </div>
                      {menu.image_url && (
                        <img src={menu.image_url} className="w-full h-24 object-cover rounded-lg mb-3 opacity-50" alt="menu small" />
                      )}
                      <ul className="space-y-1 text-sm text-[#A3B1AD]">
                        {menu.items.map((item, i) => <li key={i}>• {item}</li>)}
                      </ul>
                      {menu.special_message && <p className="mt-3 text-[#D4AF37] text-sm italic">{menu.special_message}</p>}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== PHOTOS ==================== */}
        {activeTab === "photos" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="luxury-card p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Image className="text-[#D4AF37]" size={24} />
                <h2 className="text-xl text-[#F9F7F2] font-semibold">Ajouter une Photo</h2>
              </div>
              
              <UploadModeToggle mode={photoUploadMode} setMode={setPhotoUploadMode} />
              
              <form onSubmit={handleSubmitPhoto} className="space-y-5">
                {photoUploadMode === "url" ? (
                  <div>
                    <Label className="text-[#A3B1AD] mb-2 block">URL de la photo *</Label>
                    <Input type="url" placeholder="https://exemple.com/photo.jpg" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} className="input-luxury" data-testid="photo-url-input" />
                  </div>
                ) : (
                  <div>
                    <Label className="text-[#A3B1AD] mb-2 block">Sélectionner une photo *</Label>
                    <div 
                      onClick={() => photoFileRef.current?.click()}
                      className="border-2 border-dashed border-[#D4AF37]/30 rounded-xl p-8 text-center cursor-pointer hover:border-[#D4AF37]/50 transition-colors"
                    >
                      <FileImage className="mx-auto text-[#D4AF37] mb-3" size={40} />
                      <p className="text-[#A3B1AD] text-sm">Cliquez pour sélectionner une photo</p>
                      <p className="text-[#A3B1AD]/50 text-xs mt-1">JPG, PNG, GIF, WEBP</p>
                    </div>
                    <input 
                      ref={photoFileRef}
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoFileChange} 
                      className="hidden" 
                      data-testid="photo-file-input"
                    />
                    {photoFile && <p className="text-[#D4AF37] text-sm mt-2">Fichier: {photoFile.name}</p>}
                  </div>
                )}
                
                {(photoUrl || photoPreview) && (
                  <div className="rounded-xl overflow-hidden border border-white/10">
                    <img src={photoPreview || photoUrl} alt="Aperçu" className="w-full h-40 object-cover" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
                
                <div>
                  <Label className="text-[#A3B1AD] mb-2 block">Légende (optionnel)</Label>
                  <Input placeholder="Description de la photo" value={photoCaption} onChange={(e) => setPhotoCaption(e.target.value)} className="input-luxury" data-testid="photo-caption-input" />
                </div>
                <div>
                  <Label className="text-[#A3B1AD] mb-2 block">Catégorie</Label>
                  <Select value={photoCategory} onValueChange={setPhotoCategory}>
                    <SelectTrigger className="input-luxury" data-testid="photo-category-select"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#0F2E24] border border-white/10">
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="plats">Plats</SelectItem>
                      <SelectItem value="clients">Clients</SelectItem>
                      <SelectItem value="ambiance">Ambiance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={uploadingPhoto} className="w-full btn-gold" data-testid="submit-photo-btn">
                  {uploadingPhoto ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#0F2E24] border-t-transparent rounded-full animate-spin"></div>
                      Upload en cours...
                    </span>
                  ) : (
                    "Ajouter la Photo"
                  )}
                </Button>
              </form>
            </motion.div>

            <div className="space-y-4">
              <h3 className="text-lg text-[#F9F7F2] font-semibold">Photos ({photos.length})</h3>
              {loading ? (
                <div className="grid grid-cols-2 gap-4">{[1, 2, 3, 4].map((i) => <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse"></div>)}</div>
              ) : photos.length === 0 ? (
                <div className="luxury-card p-8 rounded-2xl text-center"><p className="text-[#A3B1AD]">Aucune photo</p></div>
              ) : (
                <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                  {photos.map((photo) => (
                    <div key={photo.id} className="luxury-card rounded-2xl overflow-hidden group relative">
                      <img src={photo.image_url.startsWith('/api') ? `${photo.image_url}` : photo.image_url} alt={photo.caption || "Photo"} className="w-full h-36 object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="ghost" size="icon" onClick={() => handleDeletePhoto(photo.id)} className="text-white hover:text-red-400" data-testid={`delete-photo-${photo.id}`}>
                          <Trash2 size={24} />
                        </Button>
                      </div>
                      <div className="p-3">
                        <span className="text-[10px] bg-[#1A4D3E] text-[#D4AF37] px-2 py-1 rounded-full">{photo.category}</span>
                        {photo.caption && <p className="text-xs text-[#A3B1AD] mt-1 truncate">{photo.caption}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== VIDEOS ==================== */}
        {activeTab === "videos" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="luxury-card p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Video className="text-[#D4AF37]" size={24} />
                <h2 className="text-xl text-[#F9F7F2] font-semibold">Ajouter une Vidéo</h2>
              </div>
              
              <UploadModeToggle mode={videoUploadMode} setMode={setVideoUploadMode} />
              
              <form onSubmit={handleSubmitVideo} className="space-y-5">
                <div>
                  <Label className="text-[#A3B1AD] mb-2 block">Titre *</Label>
                  <Input placeholder="Ex: Notre ambiance du weekend" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} className="input-luxury" data-testid="video-title-input" />
                </div>
                
                {videoUploadMode === "url" ? (
                  <>
                    <div>
                      <Label className="text-[#A3B1AD] mb-2 block">Type de vidéo</Label>
                      <Select value={videoType} onValueChange={setVideoType}>
                        <SelectTrigger className="input-luxury"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#0F2E24] border border-white/10">
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="direct">Lien direct (MP4)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[#A3B1AD] mb-2 block">URL de la vidéo *</Label>
                      <Input placeholder={videoType === "youtube" ? "https://youtube.com/watch?v=..." : "URL de la vidéo"} value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="input-luxury" data-testid="video-url-input" />
                    </div>
                  </>
                ) : (
                  <div>
                    <Label className="text-[#A3B1AD] mb-2 block">Sélectionner une vidéo *</Label>
                    <div 
                      onClick={() => videoFileRef.current?.click()}
                      className="border-2 border-dashed border-[#D4AF37]/30 rounded-xl p-8 text-center cursor-pointer hover:border-[#D4AF37]/50 transition-colors"
                    >
                      <Video className="mx-auto text-[#D4AF37] mb-3" size={40} />
                      <p className="text-[#A3B1AD] text-sm">Cliquez pour sélectionner une vidéo</p>
                      <p className="text-[#A3B1AD]/50 text-xs mt-1">MP4, WEBM</p>
                    </div>
                    <input 
                      ref={videoFileRef}
                      type="file" 
                      accept="video/*" 
                      onChange={handleVideoFileChange} 
                      className="hidden" 
                      data-testid="video-file-input"
                    />
                    {videoFile && <p className="text-[#D4AF37] text-sm mt-2">Fichier: {videoFile.name}</p>}
                  </div>
                )}
                
                <div>
                  <Label className="text-[#A3B1AD] mb-2 block">Description (optionnel)</Label>
                  <Textarea placeholder="Description de la vidéo..." value={videoDescription} onChange={(e) => setVideoDescription(e.target.value)} className="input-luxury min-h-[80px]" />
                </div>
                <Button type="submit" disabled={uploadingVideo} className="w-full btn-gold" data-testid="submit-video-btn">
                  {uploadingVideo ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#0F2E24] border-t-transparent rounded-full animate-spin"></div>
                      Upload en cours...
                    </span>
                  ) : (
                    "Ajouter la Vidéo"
                  )}
                </Button>
              </form>
            </motion.div>

            <div className="space-y-4">
              <h3 className="text-lg text-[#F9F7F2] font-semibold">Vidéos ({videos.length})</h3>
              {loading ? (
                <div className="space-y-4">{[1, 2].map((i) => <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse"></div>)}</div>
              ) : videos.length === 0 ? (
                <div className="luxury-card p-8 rounded-2xl text-center"><p className="text-[#A3B1AD]">Aucune vidéo</p></div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {videos.map((video) => (
                    <div key={video.id} className="luxury-card rounded-2xl overflow-hidden">
                      {video.video_type === "youtube" && getYouTubeId(video.video_url) && (
                        <div className="aspect-video">
                          <iframe src={`https://www.youtube.com/embed/${getYouTubeId(video.video_url)}`} className="w-full h-full" allowFullScreen title={video.title}></iframe>
                        </div>
                      )}
                      {video.video_type === "direct" && (
                        <video src={video.video_url.startsWith('/api') ? `${video.video_url}` : video.video_url} controls className="w-full aspect-video object-cover"></video>
                      )}
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-[#F9F7F2] font-semibold">{video.title}</h4>
                            {video.description && <p className="text-xs text-[#A3B1AD] mt-1">{video.description}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#A3B1AD]">Actif</span>
                              <Switch checked={video.is_active} onCheckedChange={() => handleToggleVideo(video.id, video.is_active)} />
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteVideo(video.id)} className="text-red-400 hover:text-red-300">
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== PROMOTIONS ==================== */}
        {activeTab === "promos" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="luxury-card p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Megaphone className="text-[#D4AF37]" size={24} />
                <h2 className="text-xl text-[#F9F7F2] font-semibold">Nouvelle Promotion</h2>
              </div>
              <form onSubmit={handleSubmitPromo} className="space-y-5">
                <div>
                  <Label className="text-[#A3B1AD] mb-2 block">Titre *</Label>
                  <Input placeholder="Ex: -20% sur les grillades!" value={promoTitle} onChange={(e) => setPromoTitle(e.target.value)} className="input-luxury" data-testid="promo-title-input" />
                </div>
                <div>
                  <Label className="text-[#A3B1AD] mb-2 block">Description *</Label>
                  <Textarea placeholder="Détails de la promotion..." value={promoDescription} onChange={(e) => setPromoDescription(e.target.value)} className="input-luxury min-h-[80px]" data-testid="promo-desc-input" />
                </div>
                <div>
                  <Label className="text-[#A3B1AD] mb-2 block">Type</Label>
                  <Select value={promoType} onValueChange={setPromoType}>
                    <SelectTrigger className="input-luxury"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#0F2E24] border border-white/10">
                      <SelectItem value="Promotion">Promotion</SelectItem>
                      <SelectItem value="Concert">Concert</SelectItem>
                      <SelectItem value="Biblique">Biblique</SelectItem>
                      <SelectItem value="Annonce">Annonce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-[#A3B1AD] mb-2 block">Image (optionnel)</Label>
                  <UploadModeToggle mode={promoUploadMode} setMode={setPromoUploadMode} />
                  
                  {promoUploadMode === "url" ? (
                    <Input type="url" placeholder="URL de l'image" value={promoImage} onChange={(e) => setPromoImage(e.target.value)} className="input-luxury" />
                  ) : (
                    <div>
                      <div 
                        onClick={() => promoFileRef.current?.click()}
                        className="border-2 border-dashed border-[#D4AF37]/30 rounded-xl p-6 text-center cursor-pointer hover:border-[#D4AF37]/50 transition-colors"
                      >
                        <FileImage className="mx-auto text-[#D4AF37] mb-2" size={32} />
                        <p className="text-[#A3B1AD] text-sm">Cliquez pour sélectionner</p>
                      </div>
                      <input 
                        ref={promoFileRef}
                        type="file" 
                        accept="image/*" 
                        onChange={handlePromoFileChange} 
                        className="hidden" 
                      />
                      {promoFile && <p className="text-[#D4AF37] text-sm mt-2">Fichier: {promoFile.name}</p>}
                    </div>
                  )}
                  
                  {(promoImage || promoPreview) && (
                    <div className="rounded-xl overflow-hidden border border-white/10 mt-3">
                      <img src={promoPreview || promoImage} alt="Aperçu" className="w-full h-32 object-cover" />
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#A3B1AD] mb-2 block">Date début</Label>
                    <Input type="date" value={promoStartDate} onChange={(e) => setPromoStartDate(e.target.value)} className="input-luxury" />
                  </div>
                  <div>
                    <Label className="text-[#A3B1AD] mb-2 block">Date fin</Label>
                    <Input type="date" value={promoEndDate} onChange={(e) => setPromoEndDate(e.target.value)} className="input-luxury" />
                  </div>
                </div>
                <Button type="submit" disabled={uploadingPromo} className="w-full btn-gold" data-testid="submit-promo-btn">
                  {uploadingPromo ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#0F2E24] border-t-transparent rounded-full animate-spin"></div>
                      Upload en cours...
                    </span>
                  ) : (
                    "Créer la Promotion"
                  )}
                </Button>
              </form>
            </motion.div>

            <div className="space-y-4">
              <h3 className="text-lg text-[#F9F7F2] font-semibold">Promotions ({promotions.length})</h3>
              {loading ? (
                <div className="space-y-4">{[1, 2].map((i) => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse"></div>)}</div>
              ) : promotions.length === 0 ? (
                <div className="luxury-card p-8 rounded-2xl text-center"><p className="text-[#A3B1AD]">Aucune promotion</p></div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {promotions.map((promo) => (
                    <div key={promo.id} className="luxury-card p-5 rounded-2xl">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${promo.is_active ? "bg-green-500/20 text-green-400" : "bg-white/10 text-[#A3B1AD]"}`}>
                            {promo.is_active ? "Active" : "Inactive"}
                          </span>
                          <span className="text-[10px] bg-[#1A4D3E] text-[#D4AF37] px-2 py-1 rounded-full uppercase">{promo.promo_type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={promo.is_active} onCheckedChange={() => handleTogglePromo(promo.id, promo.is_active)} />
                          <Button variant="ghost" size="icon" onClick={() => handleDeletePromo(promo.id)} className="text-red-400 hover:text-red-300">
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </div>
                      {promo.image_url && <img src={promo.image_url.startsWith('/api') ? `${promo.image_url}` : promo.image_url} alt={promo.title} className="w-full h-32 object-cover rounded-lg mb-3" />}
                      <h4 className="text-[#F9F7F2] font-semibold">{promo.title}</h4>
                      <p className="text-sm text-[#A3B1AD] mt-1">{promo.description}</p>
                      {(promo.start_date || promo.end_date) && (
                        <p className="text-xs text-[#D4AF37] mt-2">
                          {promo.start_date && `Du ${promo.start_date}`} {promo.end_date && `au ${promo.end_date}`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== GESTION PLATS ==================== */}
        {activeTab === "plats" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg text-[#F9F7F2] font-semibold">Tous les Plats ({menuItems.length})</h3>
              <Button onClick={() => { resetMenuForm(); setShowMenuForm(true); }} className="bg-[#D4AF37] text-[#0F2E24] hover:bg-[#C4A030] text-sm">
                <Plus size={16} className="mr-2" /> Ajouter un Plat
              </Button>
            </div>

            {showMenuForm && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="luxury-card rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-[#F9F7F2] font-semibold">{editingMenuItem ? "Modifier le Plat" : "Ajouter un Nouveau Plat"}</h4>
                  <Button variant="ghost" size="icon" onClick={resetMenuForm} className="text-[#A3B1AD] hover:text-[#F9F7F2] h-8 w-8">
                    <X size={16} />
                  </Button>
                </div>
                <form onSubmit={handleSubmitMenuItem} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#A3B1AD] text-xs mb-1 block">Nom du plat *</Label>
                      <Input value={menuItemName} onChange={(e) => setMenuItemName(e.target.value)} placeholder="Ex: Attièkè Poisson Braisé" className="input-luxury" />
                    </div>
                    <div>
                      <Label className="text-[#A3B1AD] text-xs mb-1 block">Prix (FCFA) *</Label>
                      <Input type="number" value={menuItemPrice} onChange={(e) => setMenuItemPrice(e.target.value)} placeholder="3500" className="input-luxury" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[#A3B1AD] text-xs mb-1 block">Description *</Label>
                    <Textarea value={menuItemDescription} onChange={(e) => setMenuItemDescription(e.target.value)} placeholder="Description du plat..." className="input-luxury" rows={2} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#A3B1AD] text-xs mb-1 block">Catégorie</Label>
                      <Select value={menuItemCategory} onValueChange={setMenuItemCategory}>
                        <SelectTrigger className="input-luxury"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {MENU_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer pb-2">
                        <Switch checked={menuItemFeatured} onCheckedChange={setMenuItemFeatured} />
                        <span className="text-sm text-[#A3B1AD]">Plat vedette</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label className="text-[#A3B1AD] text-xs mb-2 block">Photo du plat</Label>
                    <div className="flex gap-2 mb-3">
                      <Button type="button" variant={menuItemUploadMode === "url" ? "default" : "outline"} size="sm"
                        onClick={() => setMenuItemUploadMode("url")}
                        className={menuItemUploadMode === "url" ? "bg-[#D4AF37] text-[#0F2E24]" : "border-white/20 text-[#A3B1AD]"}>
                        <Link size={14} className="mr-1" /> URL en ligne
                      </Button>
                      <Button type="button" variant={menuItemUploadMode === "file" ? "default" : "outline"} size="sm"
                        onClick={() => setMenuItemUploadMode("file")}
                        className={menuItemUploadMode === "file" ? "bg-[#D4AF37] text-[#0F2E24]" : "border-white/20 text-[#A3B1AD]"}>
                        <Upload size={14} className="mr-1" /> Fichier local
                      </Button>
                    </div>

                    {menuItemUploadMode === "url" ? (
                      <Input value={menuItemImageUrl} onChange={(e) => setMenuItemImageUrl(e.target.value)} placeholder="https://exemple.com/photo.jpg" className="input-luxury" />
                    ) : (
                      <div className="space-y-2">
                        <input type="file" ref={menuItemFileRef} accept="image/*" onChange={handleMenuItemFileChange}
                          className="block w-full text-sm text-[#A3B1AD] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#D4AF37] file:text-[#0F2E24] hover:file:bg-[#C4A030] cursor-pointer" />
                      </div>
                    )}

                    {(menuItemPreview || (menuItemUploadMode === "url" && menuItemImageUrl)) && (
                      <div className="mt-3 relative w-32 h-24 rounded-lg overflow-hidden border border-white/10">
                        <img src={menuItemPreview || menuItemImageUrl} alt="Aperçu" className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }} />
                      </div>
                    )}
                  </div>

                  <Button type="submit" disabled={submittingMenuItem} className="w-full bg-[#D4AF37] text-[#0F2E24] hover:bg-[#C4A030]">
                    {submittingMenuItem ? <RefreshCw size={16} className="animate-spin mr-2" /> : editingMenuItem ? <Pencil size={16} className="mr-2" /> : <Plus size={16} className="mr-2" />}
                    {submittingMenuItem ? "En cours..." : editingMenuItem ? "Modifier le Plat" : "Ajouter le Plat"}
                  </Button>
                </form>
              </motion.div>
            )}
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse"></div>)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems.map((item) => (
                  <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="luxury-card rounded-2xl overflow-hidden">
                    <div className="relative h-32">
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 flex gap-1">
                        {item.is_featured && <span className="bg-[#D4AF37] text-[#0F2E24] text-[8px] font-bold px-2 py-1 rounded-full">VEDETTE</span>}
                        {!item.is_available && <span className="bg-red-50 text-white text-[8px] font-bold px-2 py-1 rounded-full">INDISPO</span>}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-[10px] text-[#D4AF37] uppercase tracking-wider">{item.category}</span>
                          <h4 className="text-[#F9F7F2] font-semibold text-sm">{item.name}</h4>
                        </div>
                        <span className="text-[#D4AF37] font-semibold">{item.price} F</span>
                      </div>
                      <p className="text-xs text-[#A3B1AD] mb-3 line-clamp-2">{item.description}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <Switch checked={item.is_available} onCheckedChange={() => handleToggleMenuItem(item.id, 'is_available', item.is_available)} className="scale-75" />
                            <span className="text-[10px] text-[#A3B1AD]">Dispo</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <Switch checked={item.is_featured} onCheckedChange={() => handleToggleMenuItem(item.id, 'is_featured', item.is_featured)} className="scale-75" />
                            <span className="text-[10px] text-[#A3B1AD]">Vedette</span>
                          </label>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditMenuItem(item)} className="text-[#D4AF37] hover:text-[#C4A030] h-8 w-8">
                            <Pencil size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteMenuItem(item.id)} className="text-red-400 hover:text-red-300 h-8 w-8">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== COMMENTAIRES ==================== */}
        {activeTab === "commentaires" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg text-[#F9F7F2] font-semibold">
                Commentaires ({allReviews.length})
              </h3>
              <div className="flex gap-2 text-xs">
                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full">
                  {allReviews.filter(r => r.is_approved).length} approuvé(s)
                </span>
                <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full">
                  {allReviews.filter(r => !r.is_approved).length} en attente
                </span>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse"></div>)}
              </div>
            ) : allReviews.length === 0 ? (
              <div className="text-center py-16">
                <MessageSquare className="mx-auto text-[#A3B1AD]/30 mb-4" size={48} />
                <p className="text-[#A3B1AD]">Aucun commentaire pour le moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allReviews.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`luxury-card rounded-2xl p-6 ${!review.is_approved ? 'border-l-4 border-l-yellow-500/50' : 'border-l-4 border-l-green-500/50'}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-[#1A4D3E] flex items-center justify-center text-[#D4AF37] font-semibold text-sm">
                            {review.author.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-[#F9F7F2] font-semibold text-sm">{review.author}</h4>
                            <p className="text-[10px] text-[#A3B1AD]">
                              {new Date(review.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                          <span className={`text-[10px] px-2 py-1 rounded-full ${review.is_approved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {review.is_approved ? 'Approuvé' : 'En attente'}
                          </span>
                        </div>
                        <p className="text-[#F9F7F2]/80 text-sm italic ml-13">"{review.comment}"</p>
                      </div>
                      <div className="flex items-center gap-2 sm:flex-col">
                        {!review.is_approved ? (
                          <Button
                            size="sm"
                            onClick={async () => {
                              try {
                                await axios.put(`${API}/reviews/${review.id}/approve`);
                                setAllReviews(prev => prev.map(r => r.id === review.id ? {...r, is_approved: true} : r));
                                toast.success("Commentaire approuvé");
                              } catch (e) { toast.error("Erreur"); }
                            }}
                            className="bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs px-3"
                          >
                            <Check size={14} className="mr-1" />
                            Approuver
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={async () => {
                              try {
                                await axios.put(`${API}/reviews/${review.id}/hide`);
                                setAllReviews(prev => prev.map(r => r.id === review.id ? {...r, is_approved: false} : r));
                                toast.success("Commentaire masqué");
                              } catch (e) { toast.error("Erreur"); }
                            }}
                            className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 text-xs px-3"
                          >
                            <EyeOff size={14} className="mr-1" />
                            Masquer
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={async () => {
                            if (!window.confirm("Supprimer ce commentaire ?")) return;
                            try {
                              await axios.delete(`${API}/reviews/${review.id}`);
                              setAllReviews(prev => prev.filter(r => r.id !== review.id));
                              toast.success("Commentaire supprimé");
                            } catch (e) { toast.error("Erreur"); }
                          }}
                          className="bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs px-3"
                        >
                          <Trash2 size={14} className="mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== CAISSE ==================== */}
        {activeTab === "caisse" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="luxury-card rounded-2xl p-4 text-center">
                <p className="text-[#A3B1AD] text-xs mb-1">Ventes du jour</p>
                <p className="text-2xl font-bold text-[#D4AF37]">{cashStats?.total_sales || 0}</p>
              </div>
              <div className="luxury-card rounded-2xl p-4 text-center">
                <p className="text-[#A3B1AD] text-xs mb-1">Chiffre d'affaires</p>
                <p className="text-2xl font-bold text-[#F9F7F2]">{(cashStats?.total_revenue || 0).toLocaleString()} F</p>
              </div>
              <div className="luxury-card rounded-2xl p-4 text-center">
                <p className="text-[#A3B1AD] text-xs mb-1">Espèces</p>
                <p className="text-2xl font-bold text-green-400">{(cashStats?.cash_total || 0).toLocaleString()} F</p>
              </div>
              <div className="luxury-card rounded-2xl p-4 text-center">
                <p className="text-[#A3B1AD] text-xs mb-1">Mobile Money</p>
                <p className="text-2xl font-bold text-blue-400">{(cashStats?.mobile_money_total || 0).toLocaleString()} F</p>
              </div>
            </div>
            

            <div className="flex items-center gap-4">
              <Input 
                type="date" 
                value={cashDate} 
                onChange={(e) => {
                  setCashDate(e.target.value);
                  fetchCaisseData(e.target.value);
                }} 
                className="bg-white/5 border-white/10 text-[#F9F7F2] w-48" 
              />
              <span className="text-[#A3B1AD] text-sm">Plats vendus: <strong className="text-[#F9F7F2]">{cashStats?.total_dishes_sold || 0}</strong></span>
              <span className="text-[#A3B1AD] text-sm">Ticket moyen: <strong className="text-[#D4AF37]">{(cashStats?.average_ticket || 0).toLocaleString()} F</strong></span>
            </div>

            <div className="luxury-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#D4AF37] mb-4 flex items-center gap-2">
                <Plus size={20} />
                Enregistrer une vente
              </h3>
              <form onSubmit={handleCashSaleSubmit} className="space-y-4">
                {cashItems.map((item, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="flex-1">
                      {index === 0 && <Label className="text-[#A3B1AD] text-xs mb-1 block">Plat</Label>}
                      <select 
                        value={item.name} 
                        onChange={(e) => {
                          const selected = menuItems.find(m => m.name === e.target.value);
                          const newItems = [...cashItems];
                          newItems[index] = { ...newItems[index], name: e.target.value, price: selected ? selected.price : newItems[index].price };
                          setCashItems(newItems);
                        }}
                        className="w-full bg-white/5 border border-white/10 text-[#F9F7F2] rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="">Choisir un plat...</option>
                        {menuItems.filter(m => m.is_available).map(m => (
                          <option key={m.id} value={m.name} className="bg-[#0F2E24]">{m.name} - {m.price.toLocaleString()} F</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-20">
                      {index === 0 && <Label className="text-[#A3B1AD] text-xs mb-1 block">Qté</Label>}
                      <Input 
                        type="number" 
                        min="1" 
                        value={item.quantity} 
                        onChange={(e) => updateCashItem(index, "quantity", e.target.value)} 
                        className="bg-white/5 border-white/10 text-[#F9F7F2]" 
                      />
                    </div>
                    <div className="w-28">
                      {index === 0 && <Label className="text-[#A3B1AD] text-xs mb-1 block">Prix</Label>}
                      <Input 
                        type="number" 
                        min="0" 
                        value={item.price} 
                        onChange={(e) => updateCashItem(index, "price", e.target.value)} 
                        className="bg-white/5 border-white/10 text-[#F9F7F2]" 
                      />
                    </div>
                    {cashItems.length > 1 && (
                      <Button type="button" size="sm" onClick={() => removeCashItem(index)} className="bg-red-500/20 text-red-400 hover:bg-red-500/30 mb-0.5">
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                ))}
                
                <div className="flex gap-4 items-center">
                  <Button type="button" onClick={addCashItem} className="bg-white/5 text-[#A3B1AD] hover:bg-white/10 text-sm">
                    <Plus size={16} className="mr-1" /> Ajouter un plat
                  </Button>
                  <span className="text-[#D4AF37] font-bold text-lg ml-auto">
                    Total: {cashItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()} FCFA
                  </span>
                </div>

                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label className="text-[#A3B1AD] text-xs mb-1 block">Mode de paiement</Label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setCashPaymentMethod("especes")}
                        className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                          cashPaymentMethod === "especes"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-white/5 text-[#A3B1AD] border border-white/10"
                        }`}
                      >
                        Espèces
                      </button>
                      <button
                        type="button"
                        onClick={() => setCashPaymentMethod("mobile_money")}
                        className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                          cashPaymentMethod === "mobile_money"
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "bg-white/5 text-[#A3B1AD] border border-white/10"
                        }`}
                      >
                        Mobile Money
                      </button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label className="text-[#A3B1AD] text-xs mb-1 block">Note (optionnel)</Label>
                    <Input 
                      value={cashNote} 
                      onChange={(e) => setCashNote(e.target.value)} 
                      placeholder="Ex: Table 4, client régulier..." 
                      className="bg-white/5 border-white/10 text-[#F9F7F2]" 
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={submittingCash}
                  className="w-full bg-[#D4AF37] text-[#0F2E24] hover:bg-[#F2CC8F] py-3 text-base font-semibold"
                >
                  {submittingCash ? "Enregistrement..." : "Enregistrer la vente"}
                </Button>
              </form>
            </div>

            {cashStats?.top_dishes?.length > 0 && (
              <div className="luxury-card rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-4">Top plats vendus</h3>
                <div className="space-y-3">
                  {cashStats.top_dishes.map((dish, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center text-xs font-bold">{index + 1}</span>
                        <span className="text-[#F9F7F2] text-sm">{dish.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[#A3B1AD] text-sm">{dish.quantity} vendus</span>
                        <span className="text-[#D4AF37] text-sm font-semibold">{dish.revenue.toLocaleString()} F</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="luxury-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#D4AF37] mb-4">Historique des ventes</h3>
              {cashSales.length === 0 ? (
                <p className="text-[#A3B1AD] text-center py-8">Aucune vente enregistrée pour cette date</p>
              ) : (
                <div className="space-y-3">
                  {cashSales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between py-3 px-4 bg-white/5 rounded-xl">
                      <div>
                        <p className="text-[#F9F7F2] text-sm font-medium">
                          {sale.items.map(i => `${i.name} x${i.quantity}`).join(", ")}
                        </p>
                        <p className="text-[#A3B1AD] text-xs mt-1">
                          {new Date(sale.created_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})} 
                          {" - "}
                          <span className={sale.payment_method === "especes" ? "text-green-400" : "text-blue-400"}>
                            {sale.payment_method === "especes" ? "Espèces" : "Mobile Money"}
                          </span>
                          {sale.note && <span className="ml-2 text-[#A3B1AD]/60">({sale.note})</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#D4AF37] font-bold">{sale.total.toLocaleString()} F</span>
                        <Button 
                          size="sm"
                          onClick={() => requestDeleteSale(sale.id)}
                          className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                      
      {/* Modal confirmation déconnexion */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0F2E24] border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <LogOut size={32} className="text-[#D4AF37] mx-auto mb-3" />
              <h3 className="text-lg font-bold text-[#F9F7F2] mb-2">Se déconnecter ?</h3>
              <p className="text-[#A3B1AD] text-sm mb-5">Voulez-vous vraiment vous déconnecter ?</p>
              <div className="flex gap-3">
                <Button onClick={() => setShowLogoutConfirm(false)} className="flex-1 bg-white/10 text-[#A3B1AD] hover:bg-white/20">
                  Annuler
                </Button>
                <Button onClick={confirmLogout} className="flex-1 bg-red-500 hover:bg-red-600 text-white">
                  Déconnexion
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODALE SÉCURISÉE POUR SUPPRESSION --- */}
      <AnimatePresence>
        {showDeleteAuth && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
            onClick={() => setShowDeleteAuth(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0A1F1A] border border-[#D4AF37]/30 rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl shadow-black/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                <ShieldAlert size={40} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-[#F9F7F2] mb-2 font-display">Sécurité Admin</h3>
              <p className="text-[#A3B1AD] text-sm mb-8 leading-relaxed">
                Action sensible détectée. Veuillez entrer le mot de passe de confirmation pour supprimer cette vente.
              </p>
              
              <div className="mb-8">
                <Input 
                  type="password" 
                  placeholder="Mot de passe secret" 
                  className="input-luxury text-center text-xl tracking-[0.5em] h-14"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => {setShowDeleteAuth(false); setDeletePassword("");}} 
                  className="flex-1 bg-white/5 border border-white/10 text-[#A3B1AD] hover:bg-white/10 py-6"
                >
                  Annuler
                </Button>
                <Button 
                  onClick={confirmDeleteSale} 
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white border-0 shadow-lg shadow-red-900/20 py-6 font-bold"
                >
                  Confirmer
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
  const generatePDF = () => {
  const { jsPDF } = window.jspdf; // On récupère l'outil depuis la fenêtre globale
  const doc = new jsPDF();
  
  const dateStr = new Date(cashDate).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  // Titre
  doc.setFontSize(22);
  doc.setTextColor(212, 175, 55); 
  doc.text("CHEZ LOMAN - RESTAURANT", 105, 20, { align: "center" });
  
  doc.setFontSize(14);
  doc.setTextColor(100);
  doc.text(`Rapport de Caisse du ${dateStr}`, 105, 30, { align: "center" });

  // Tableau
  const tableRows = cashSales.map(sale => [
    new Date(sale.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    sale.items.map(i => `${i.name} x${i.quantity}`).join(", "),
    sale.payment_method === "especes" ? "Espèces" : "Mobile Money",
    `${sale.total.toLocaleString()} F`
  ]);

  doc.autoTable({
    head: [["Heure", "Articles", "Paiement", "Montant"]],
    body: tableRows,
    startY: 45,
    theme: 'grid',
    headStyles: { fillColor: [15, 46, 36] }
  });

  doc.save(`Rapport_Loman_${cashDate}.pdf`);
  toast.success("Rapport PDF prêt !");
};
};

export default AdminPage;