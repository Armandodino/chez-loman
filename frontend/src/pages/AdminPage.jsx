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

  // ==================== MODIF : GÉNÉRATION PDF GÉNÉRAL ====================
  const generatePDF = () => {
    if (!window.jspdf) {
        toast.error("Erreur : Bibliothèque PDF non chargée.");
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const dateStr = new Date(cashDate).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    // Header
    doc.setFontSize(22);
    doc.setTextColor(212, 175, 55); 
    doc.text("CHEZ LOMAN - RESTAURANT", 105, 20, { align: "center" });
    
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text(`Rapport Général des Ventes - ${dateStr}`, 105, 30, { align: "center" });

    // Statistiques
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Nombre de ventes: ${cashStats?.total_sales || 0}`, 20, 45);
    doc.text(`Recette Totale: ${(cashStats?.total_revenue || 0).toLocaleString()} FCFA`, 20, 52);
    doc.text(`Espèces: ${(cashStats?.cash_total || 0).toLocaleString()} F | MoMo: ${(cashStats?.mobile_money_total || 0).toLocaleString()} F`, 20, 59);

    // Tableau des ventes
    const tableRows = cashSales.map(sale => [
      new Date(sale.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      sale.items.map(i => `${i.name} x${i.quantity}`).join(", "),
      sale.payment_method === "especes" ? "Espèces" : "Mobile Money",
      `${sale.total.toLocaleString()} F`
    ]);

    doc.autoTable({
      head: [["Heure", "Articles", "Paiement", "Montant"]],
      body: tableRows,
      startY: 65,
      theme: 'grid',
      headStyles: { fillColor: [15, 46, 36], textColor: [255, 255, 255] }
    });

    doc.save(`Rapport_Caisse_Loman_${cashDate}.pdf`);
    toast.success("Rapport PDF généré !");
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

        {/* --- ONGLETS RESTANTS (PHOTOS, VIDEOS, ETC.) --- */}
        {/* ... (Je laisse les sections originales intactes comme demandé) */}
        {activeTab === "accueil" && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="luxury-card p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Home className="text-[#D4AF37]" size={24} />
                <h2 className="text-xl text-[#F9F7F2] font-semibold">Message d'Accueil</h2>
              </div>
              <form onSubmit={handleSubmitHero} className="space-y-5">
                <div><Label className="text-[#A3B1AD] mb-2 block">Titre - Ligne 1</Label><Input placeholder="Ici c'est manger" value={heroTitleLine1} onChange={(e) => setHeroTitleLine1(e.target.value)} className="input-luxury" /></div>
                <div><Label className="text-[#A3B1AD] mb-2 block">Titre - Ligne 2</Label><Input placeholder="bien hein" value={heroTitleLine2} onChange={(e) => setHeroTitleLine2(e.target.value)} className="input-luxury" /></div>
                <div><Label className="text-[#A3B1AD] mb-2 block">Description</Label><Textarea placeholder="Description..." value={heroDescription} onChange={(e) => setHeroDescription(e.target.value)} className="input-luxury min-h-[100px]" /></div>
                <UploadModeToggle mode={heroUploadMode} setMode={setHeroUploadMode} />
                {heroUploadMode === "url" ? <Input value={heroBackgroundImage} onChange={(e) => setHeroBackgroundImage(e.target.value)} className="input-luxury" /> : <Input type="file" onChange={handleHeroFileChange} className="input-luxury" />}
                <Button type="submit" disabled={savingHero} className="w-full btn-gold">{savingHero ? "..." : "Enregistrer"}</Button>
              </form>
            </motion.div>
           </div>
        )}

        {activeTab === "menu" && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="luxury-card p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-6"><Calendar className="text-[#D4AF37]" size={24} /><h2 className="text-xl text-[#F9F7F2] font-semibold">Menu du Jour</h2></div>
              <form onSubmit={handleSubmitMenu} className="space-y-5">
                <Input type="date" value={menuDate} onChange={(e) => setMenuDate(e.target.value)} className="input-luxury" />
                {menuItemsList.map((item, index) => (
                  <div key={index} className="flex gap-2"><Input value={item} onChange={(e) => updateMenuItem(index, e.target.value)} className="input-luxury" /></div>
                ))}
                <Button type="button" onClick={addMenuItem} variant="outline" className="text-[#D4AF37]">+ Ajouter</Button>
                <UploadModeToggle mode={menuUploadMode} setMode={setMenuUploadMode} />
                {menuUploadMode === "url" ? <Input value={menuImageUrl} onChange={(e) => setMenuImageUrl(e.target.value)} className="input-luxury" /> : <Input type="file" onChange={handleMenuFileChange} className="input-luxury" />}
                <Button type="submit" className="w-full btn-gold">Publier</Button>
              </form>
            </motion.div>
           </div>
        )}

        {/* ... (Sections Photos, Videos, Plats, Avis identiques à votre original) ... */}

        {/* ==================== ONGLET CAISSE MODIFIÉ ==================== */}
        {activeTab === "caisse" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="luxury-card rounded-2xl p-4 text-center"><p className="text-[#A3B1AD] text-xs mb-1">Ventes</p><p className="text-2xl font-bold text-[#D4AF37]">{cashStats?.total_sales || 0}</p></div>
              <div className="luxury-card rounded-2xl p-4 text-center"><p className="text-[#A3B1AD] text-xs mb-1">Recette</p><p className="text-2xl font-bold text-[#F9F7F2]">{(cashStats?.total_revenue || 0).toLocaleString()} F</p></div>
              <div className="luxury-card rounded-2xl p-4 text-center"><p className="text-[#A3B1AD] text-xs mb-1">Espèces</p><p className="text-2xl font-bold text-green-400">{(cashStats?.cash_total || 0).toLocaleString()} F</p></div>
              <div className="luxury-card rounded-2xl p-4 text-center"><p className="text-[#A3B1AD] text-xs mb-1">MoMo</p><p className="text-2xl font-bold text-blue-400">{(cashStats?.mobile_money_total || 0).toLocaleString()} F</p></div>
            </div>

            {/* BARRE D'ACTION CAISSE */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-4">
                <Input type="date" value={cashDate} onChange={(e) => { setCashDate(e.target.value); fetchCaisseData(e.target.value); }} className="bg-white/5 border-white/10 text-[#F9F7F2] w-48" />
                <span className="text-[#A3B1AD] text-sm">Plats vendus: <strong className="text-[#F9F7F2]">{cashStats?.total_dishes_sold || 0}</strong></span>
              </div>
              
              {/* BOUTON GÉNÉRAL UNIQUE */}
              <Button 
                onClick={generatePDF} 
                disabled={cashSales.length === 0}
                className="bg-[#D4AF37] text-[#0F2E24] hover:bg-white font-bold px-8 shadow-lg shadow-[#D4AF37]/10"
              >
                <FileImage size={18} className="mr-2" />
                Exporter le Rapport du Jour (PDF)
              </Button>
            </div>

            <div className="luxury-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#D4AF37] mb-4 flex items-center gap-2"><Plus size={20} />Enregistrer une vente</h3>
              <form onSubmit={handleCashSaleSubmit} className="space-y-4">
                {cashItems.map((item, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <select value={item.name} onChange={(e) => { const s = menuItems.find(m => m.name === e.target.value); const n = [...cashItems]; n[index] = { ...n[index], name: e.target.value, price: s ? s.price : n[index].price }; setCashItems(n); }} className="w-full bg-[#0F2E24] border border-white/10 text-white rounded-lg p-2 text-sm">
                        <option value="">Choisir un plat...</option>
                        {menuItems.filter(m => m.is_available).map(m => (<option key={m.id} value={m.name}>{m.name}</option>))}
                      </select>
                    </div>
                    <div className="w-20"><Input type="number" min="1" value={item.quantity} onChange={(e) => updateCashItem(index, "quantity", e.target.value)} className="input-luxury" /></div>
                    <div className="w-28"><Input type="number" value={item.price} onChange={(e) => updateCashItem(index, "price", e.target.value)} className="input-luxury" /></div>
                    {cashItems.length > 1 && <Button type="button" onClick={() => removeCashItem(index)} className="bg-red-500/20 text-red-400 h-10"><Trash2 size={16} /></Button>}
                  </div>
                ))}
                <div className="flex justify-between items-center"><Button type="button" onClick={addCashItem} className="text-[#A3B1AD]">+ Ligne</Button><span className="text-[#D4AF37] font-bold">Total: {cashItems.reduce((s, i) => s + (i.price * i.quantity), 0).toLocaleString()} F</span></div>
                <div className="flex gap-4">
                    <button type="button" onClick={()=>setCashPaymentMethod("especes")} className={`flex-1 p-2 rounded-xl ${cashPaymentMethod==="especes"?'bg-green-600 text-white':'bg-white/5 text-gray-500'}`}>Espèces</button>
                    <button type="button" onClick={()=>setCashPaymentMethod("mobile_money")} className={`flex-1 p-2 rounded-xl ${cashPaymentMethod==="mobile_money"?'bg-blue-600 text-white':'bg-white/5 text-gray-500'}`}>MoMo</button>
                </div>
                <Button type="submit" disabled={submittingCash} className="w-full btn-gold py-4">{submittingCash ? "..." : "Enregistrer"}</Button>
              </form>
            </div>

            <div className="luxury-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#D4AF37] mb-4">Dernières ventes</h3>
              <div className="space-y-3">
                {cashSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between py-3 px-4 bg-white/5 rounded-xl border border-white/5 group">
                    <div>
                      <p className="text-[#F9F7F2] text-sm">{sale.items.map(i => `${i.name} x${i.quantity}`).join(", ")}</p>
                      <p className="text-[10px] text-[#A3B1AD]">{new Date(sale.created_at).toLocaleTimeString()} - {sale.payment_method}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[#D4AF37] font-bold">{sale.total.toLocaleString()} F</span>
                      <Button size="sm" onClick={() => requestDeleteSale(sale.id)} className="bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODALE SUPPRESSION */}
      <AnimatePresence>
        {showDeleteAuth && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#0A1F1A] border border-[#D4AF37]/30 rounded-3xl p-8 max-w-sm text-center">
              <ShieldAlert size={40} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-xl text-white font-bold mb-2">Sécurité Admin</h3>
              <p className="text-gray-400 text-sm mb-6">Action sensible. Entrez le code.</p>
              <Input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} className="input-luxury text-center h-14" autoFocus />
              <div className="flex gap-4 mt-6">
                <Button onClick={() => setShowDeleteAuth(false)} className="flex-1 bg-white/5">Annuler</Button>
                <Button onClick={confirmDeleteSale} className="flex-1 bg-red-600 text-white font-bold">Confirmer</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
            <motion.div className="bg-[#0F2E24] border border-white/10 rounded-2xl p-6 text-center">
              <LogOut size={32} className="text-[#D4AF37] mx-auto mb-3" />
              <p className="text-white mb-5">Déconnexion ?</p>
              <div className="flex gap-3"><Button onClick={() => setShowLogoutConfirm(false)} className="flex-1 bg-white/10">Non</Button><Button onClick={confirmLogout} className="flex-1 bg-red-500">Oui</Button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPage;