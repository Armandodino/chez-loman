import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import { 
  LayoutDashboard, TrendingUp, TrendingDown, DollarSign, ShoppingCart, 
  Bell, Package, Calendar, Users, Brain, Send, RefreshCw, Plus, 
  Trash2, Check, X, AlertTriangle, Clock, ChevronRight, Sparkles,
  ArrowUpRight, ArrowDownRight, BarChart3, PieChart, Wallet, Receipt,
  LogOut, Settings, ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Simple Line Chart component
const SimpleLineChart = ({ data, height = 200 }) => {
  if (!data || data.length === 0) return null;
  
  const maxValue = Math.max(...data.map(d => Math.max(d.revenus || 0, d.depenses || 0)));
  const minValue = 0;
  const range = maxValue - minValue || 1;
  
  const getY = (value) => height - ((value - minValue) / range) * (height - 40);
  const getX = (index) => (index / (data.length - 1 || 1)) * 100;
  
  const revenusPoints = data.map((d, i) => `${getX(i)}%,${getY(d.revenus || 0)}`).join(' ');
  const depensesPoints = data.map((d, i) => `${getX(i)}%,${getY(d.depenses || 0)}`).join(' ');
  
  return (
    <div className="relative w-full" style={{ height }}>
      <svg width="100%" height={height} className="overflow-visible">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((percent) => (
          <line 
            key={percent}
            x1="0" 
            y1={height - (percent / 100) * (height - 40)} 
            x2="100%" 
            y2={height - (percent / 100) * (height - 40)}
            stroke="rgba(255,255,255,0.1)"
            strokeDasharray="4"
          />
        ))}
        
        {/* Revenus line */}
        <polyline
          fill="none"
          stroke="#D4AF37"
          strokeWidth="2"
          points={revenusPoints}
        />
        
        {/* Depenses line */}
        <polyline
          fill="none"
          stroke="#EF4444"
          strokeWidth="2"
          strokeDasharray="5,5"
          points={depensesPoints}
        />
        
        {/* Data points */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={`${getX(i)}%`} cy={getY(d.revenus || 0)} r="4" fill="#D4AF37" />
            <circle cx={`${getX(i)}%`} cy={getY(d.depenses || 0)} r="3" fill="#EF4444" />
          </g>
        ))}
      </svg>
      
      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#D4AF37]"></div>
          <span className="text-xs text-[#A3B1AD]">Revenus</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-[#EF4444]" style={{borderStyle: 'dashed'}}></div>
          <span className="text-xs text-[#A3B1AD]">Dépenses</span>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  
  // Stats state
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [notifications, setNotifications] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stock, setStock] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  
  // AI states
  const [aiInsights, setAiInsights] = useState(null);
  const [aiForecast, setAiForecast] = useState(null);
  const [aiMessage, setAiMessage] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiConfigured, setAiConfigured] = useState(false);
  
  // UI states
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  
  // Transaction modify states
  const [modifyAction, setModifyAction] = useState(null);
  const [modifyTransaction, setModifyTransaction] = useState(null);
  const [modifyPassword, setModifyPassword] = useState("");
  const [editForm, setEditForm] = useState({});
  
  // Transaction form
  const [newTransaction, setNewTransaction] = useState({
    type: "revenu",
    category: "ventes",
    amount: "",
    description: "",
    payment_method: "cash"
  });

  // Stock form
  const [showAddStock, setShowAddStock] = useState(false);
  const [newStock, setNewStock] = useState({
    name: "",
    category: "ingredients",
    quantity: "",
    unit: "kg",
    min_quantity: "",
    price_per_unit: "",
    supplier: ""
  });

  useEffect(() => {
    fetchAllData();
    checkAIStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, chartRes, notifsRes, ordersRes, stockRes, reservRes, transRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`),
        axios.get(`${API}/dashboard/chart-data?period=7`),
        axios.get(`${API}/notifications`),
        axios.get(`${API}/orders?limit=10`),
        axios.get(`${API}/stock`),
        axios.get(`${API}/reservations`),
        axios.get(`${API}/transactions?limit=20`)
      ]);
      
      setStats(statsRes.data);
      setChartData(chartRes.data);
      setNotifications(notifsRes.data);
      setOrders(ordersRes.data);
      setStock(stockRes.data);
      setReservations(reservRes.data);
      setTransactions(transRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Try to seed data if empty
      try {
        await axios.post(`${API}/seed-dashboard`);
        toast.success("Données de démo initialisées");
        fetchAllData();
      } catch (e) {
        console.error("Seed error:", e);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkAIStatus = async () => {
    try {
      const response = await axios.get(`${API}/ai/status`);
      setAiConfigured(response.data.configured);
    } catch (error) {
      console.error("AI status error:", error);
    }
  };

  const fetchAIInsights = async () => {
    setAiLoading(true);
    try {
      const response = await axios.post(`${API}/ai/insights`);
      setAiInsights(response.data);
      toast.success("Insights IA générés");
    } catch (error) {
      toast.error("Erreur lors de la génération des insights");
    } finally {
      setAiLoading(false);
    }
  };

  const fetchAIForecast = async () => {
    setAiLoading(true);
    try {
      const response = await axios.post(`${API}/ai/forecast`);
      setAiForecast(response.data);
      toast.success("Prévisions générées");
    } catch (error) {
      toast.error("Erreur lors de la génération des prévisions");
    } finally {
      setAiLoading(false);
    }
  };

  const sendAIMessage = async () => {
    if (!aiMessage.trim()) return;
    
    setAiLoading(true);
    try {
      const response = await axios.post(`${API}/ai/chat`, { message: aiMessage });
      setAiResponse(response.data.response);
      setAiMessage("");
    } catch (error) {
      toast.error("Erreur de l'assistant");
    } finally {
      setAiLoading(false);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await axios.put(`${API}/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? {...n, is_read: true} : n));
    } catch (error) {
      toast.error("Erreur");
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`${API}/orders/${orderId}?status=${status}`);
      toast.success("Commande mise à jour");
      fetchAllData();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!newTransaction.amount || !newTransaction.description) {
      toast.error("Remplissez tous les champs");
      return;
    }
    
    try {
      await axios.post(`${API}/transactions`, {
        type: newTransaction.type,
        category: newTransaction.category,
        amount: parseInt(newTransaction.amount),
        description: newTransaction.description,
        payment_method: newTransaction.payment_method || "cash",
        date: new Date().toISOString().split('T')[0]
      });
      toast.success("Transaction ajoutée");
      setShowAddTransaction(false);
      setNewTransaction({ type: "revenu", category: "ventes", amount: "", description: "", payment_method: "cash" });
      fetchAllData();
    } catch (error) {
      console.error("Transaction error:", error?.response?.data || error);
      toast.error(error?.response?.data?.detail || "Erreur lors de l'ajout");
    }
  };

  const openModifyModal = (action, transaction) => {
    setModifyAction(action);
    setModifyTransaction(transaction);
    setModifyPassword("");
    if (action === "edit") {
      setEditForm({
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
        payment_method: transaction.payment_method || "cash"
      });
    }
  };

  const closeModifyModal = () => {
    setModifyAction(null);
    setModifyTransaction(null);
    setModifyPassword("");
    setEditForm({});
  };

  const handleModifySubmit = async () => {
    if (!modifyPassword) {
      toast.error("Veuillez entrer le mot de passe");
      return;
    }
    try {
      if (modifyAction === "delete") {
        await axios.delete(`${API}/transactions/${modifyTransaction.id}`, {
          data: { password: modifyPassword }
        });
        toast.success("Transaction supprimée");
      } else if (modifyAction === "edit") {
        await axios.put(`${API}/transactions/${modifyTransaction.id}`, {
          password: modifyPassword,
          ...editForm,
          amount: parseInt(editForm.amount)
        });
        toast.success("Transaction modifiée");
      }
      closeModifyModal();
      fetchAllData();
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Erreur");
    }
  };

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("adminToken");
    toast.success("Déconnexion réussie");
    navigate("/");
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!newStock.name || !newStock.quantity || !newStock.min_quantity) {
      toast.error("Remplissez tous les champs obligatoires");
      return;
    }
    
    try {
      await axios.post(`${API}/stock`, {
        ...newStock,
        quantity: parseFloat(newStock.quantity),
        min_quantity: parseFloat(newStock.min_quantity),
        price_per_unit: parseInt(newStock.price_per_unit) || 0
      });
      toast.success("Article ajouté au stock");
      setShowAddStock(false);
      setNewStock({ name: "", category: "ingredients", quantity: "", unit: "kg", min_quantity: "", price_per_unit: "", supplier: "" });
      fetchAllData();
    } catch (error) {
      toast.error("Erreur lors de l'ajout");
    }
  };

  const handleDeleteStock = async (itemId) => {
    if (!window.confirm("Supprimer cet article du stock ?")) return;
    try {
      await axios.delete(`${API}/stock/${itemId}`);
      toast.success("Article supprimé");
      fetchAllData();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleUpdateStockQuantity = async (itemId, currentQty, operation) => {
    const amount = prompt(`Quantité à ${operation === 'add' ? 'ajouter' : 'retirer'}:`);
    if (!amount) return;
    
    try {
      await axios.put(`${API}/stock/${itemId}?quantity=${parseFloat(amount)}&operation=${operation}`);
      toast.success("Stock mis à jour");
      fetchAllData();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount || 0) + ' FCFA';
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgente': return 'bg-red-500/20 text-red-400';
      case 'haute': return 'bg-orange-500/20 text-orange-400';
      case 'normale': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'en_attente': return 'bg-yellow-500/20 text-yellow-400';
      case 'en_preparation': return 'bg-blue-500/20 text-blue-400';
      case 'pret': return 'bg-green-500/20 text-green-400';
      case 'livre': return 'bg-emerald-500/20 text-emerald-400';
      case 'annule': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const tabs = [
    { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
    { id: "comptabilite", label: "Comptabilité", icon: Wallet },
    { id: "commandes", label: "Commandes", icon: ShoppingCart },
    { id: "stock", label: "Stock", icon: Package },
    { id: "reservations", label: "Réservations", icon: Calendar },
    { id: "ai", label: "Assistant IA", icon: Brain },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05100D] pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#A3B1AD]">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05100D] pt-28 pb-16" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl text-[#F9F7F2] font-bold">Dashboard</h1>
            <p className="text-[#A3B1AD] text-sm mt-1">Gestion complète de votre restaurant</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={fetchAllData} className="bg-white/5 border border-white/10 text-[#A3B1AD] hover:text-[#D4AF37] rounded-full px-4">
              <RefreshCw size={16} className="mr-2" />
              Actualiser
            </Button>
            <div className="relative">
              <Bell size={20} className="text-[#A3B1AD]" />
              {notifications.filter(n => !n.is_read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">
                  {notifications.filter(n => !n.is_read).length}
                </span>
              )}
            </div>
            <Link 
              to="/admin" 
              className="bg-white/5 border border-white/10 text-[#A3B1AD] hover:text-[#D4AF37] hover:border-[#D4AF37]/50 rounded-full px-4 py-2 flex items-center gap-2 text-sm transition-all"
              data-testid="back-to-admin-btn"
            >
              <Settings size={16} />
              Gestion contenu
            </Link>
            <Button 
              onClick={handleLogout} 
              className="bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-full px-4 py-2 text-sm"
              data-testid="logout-btn"
            >
              <LogOut size={16} className="mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[#D4AF37] text-[#0F2E24]"
                  : "bg-white/5 text-[#A3B1AD] border border-white/10 hover:border-[#D4AF37]/50"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ==================== VUE D'ENSEMBLE ==================== */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="luxury-card p-5 rounded-2xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#A3B1AD] text-xs uppercase tracking-wider">Revenus Jour</span>
                  <DollarSign size={18} className="text-[#D4AF37]" />
                </div>
                <p className="text-xl md:text-2xl font-bold text-[#F9F7F2]">{formatMoney(stats?.revenus?.aujourd_hui)}</p>
                <div className="flex items-center mt-2 text-xs">
                  {stats?.revenus?.tendance > 0 ? (
                    <><ArrowUpRight size={14} className="text-green-400" /><span className="text-green-400">+{stats?.revenus?.tendance}%</span></>
                  ) : (
                    <><ArrowDownRight size={14} className="text-red-400" /><span className="text-red-400">{stats?.revenus?.tendance}%</span></>
                  )}
                  <span className="text-[#A3B1AD] ml-1">vs hier</span>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="luxury-card p-5 rounded-2xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#A3B1AD] text-xs uppercase tracking-wider">Bénéfice Mois</span>
                  <TrendingUp size={18} className="text-green-400" />
                </div>
                <p className="text-xl md:text-2xl font-bold text-[#F9F7F2]">{formatMoney(stats?.benefices?.mois)}</p>
                <p className="text-xs text-[#A3B1AD] mt-2">Revenus - Dépenses</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="luxury-card p-5 rounded-2xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#A3B1AD] text-xs uppercase tracking-wider">Commandes</span>
                  <ShoppingCart size={18} className="text-blue-400" />
                </div>
                <p className="text-xl md:text-2xl font-bold text-[#F9F7F2]">{stats?.commandes?.aujourd_hui || 0}</p>
                <p className="text-xs text-orange-400 mt-2">{stats?.commandes?.en_attente || 0} en attente</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="luxury-card p-5 rounded-2xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#A3B1AD] text-xs uppercase tracking-wider">Alertes</span>
                  <AlertTriangle size={18} className="text-orange-400" />
                </div>
                <p className="text-xl md:text-2xl font-bold text-[#F9F7F2]">{stats?.alertes_stock || 0}</p>
                <p className="text-xs text-[#A3B1AD] mt-2">Stock bas</p>
              </motion.div>
            </div>

            {/* Chart & Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart */}
              <div className="lg:col-span-2 luxury-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-[#F9F7F2]">Évolution 7 jours</h3>
                  <BarChart3 size={20} className="text-[#D4AF37]" />
                </div>
                <SimpleLineChart data={chartData} height={220} />
              </div>

              {/* Notifications */}
              <div className="luxury-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#F9F7F2]">Notifications</h3>
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                    {notifications.filter(n => !n.is_read).length} nouvelles
                  </span>
                </div>
                <div className="space-y-3 max-h-[250px] overflow-y-auto">
                  {notifications.slice(0, 5).map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-3 rounded-xl border border-white/5 ${notif.is_read ? 'opacity-60' : 'bg-white/5'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${getPriorityColor(notif.priority)}`}>
                              {notif.priority}
                            </span>
                            <span className="text-[10px] text-[#A3B1AD]">{notif.type}</span>
                          </div>
                          <p className="text-sm text-[#F9F7F2] font-medium">{notif.title}</p>
                          <p className="text-xs text-[#A3B1AD] mt-1">{notif.message}</p>
                        </div>
                        {!notif.is_read && (
                          <button onClick={() => markNotificationRead(notif.id)} className="text-[#D4AF37] hover:text-white">
                            <Check size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions & Reservations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Reservations */}
              <div className="luxury-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#F9F7F2]">Réservations du jour</h3>
                  <Calendar size={20} className="text-[#D4AF37]" />
                </div>
                {reservations.filter(r => r.date === new Date().toISOString().split('T')[0]).length === 0 ? (
                  <p className="text-[#A3B1AD] text-sm text-center py-8">Aucune réservation aujourd'hui</p>
                ) : (
                  <div className="space-y-3">
                    {reservations.filter(r => r.date === new Date().toISOString().split('T')[0]).map((res) => (
                      <div key={res.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div>
                          <p className="text-[#F9F7F2] font-medium">{res.customer_name}</p>
                          <p className="text-xs text-[#A3B1AD]">{res.guests} personnes • {res.time}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(res.status)}`}>
                          {res.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Orders */}
              <div className="luxury-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#F9F7F2]">Commandes récentes</h3>
                  <ShoppingCart size={20} className="text-[#D4AF37]" />
                </div>
                {orders.length === 0 ? (
                  <p className="text-[#A3B1AD] text-sm text-center py-8">Aucune commande</p>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 4).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div>
                          <p className="text-[#F9F7F2] font-medium">{order.order_number}</p>
                          <p className="text-xs text-[#A3B1AD]">{formatMoney(order.total)}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== COMPTABILITÉ ==================== */}
        {activeTab === "comptabilite" && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="luxury-card p-6 rounded-2xl border-l-4 border-green-500">
                <p className="text-[#A3B1AD] text-sm mb-2">Revenus du mois</p>
                <p className="text-2xl font-bold text-green-400">{formatMoney(stats?.revenus?.mois)}</p>
              </div>
              <div className="luxury-card p-6 rounded-2xl border-l-4 border-red-500">
                <p className="text-[#A3B1AD] text-sm mb-2">Dépenses du mois</p>
                <p className="text-2xl font-bold text-red-400">{formatMoney(stats?.depenses?.mois)}</p>
              </div>
              <div className="luxury-card p-6 rounded-2xl border-l-4 border-[#D4AF37]">
                <p className="text-[#A3B1AD] text-sm mb-2">Bénéfice net</p>
                <p className="text-2xl font-bold text-[#D4AF37]">{formatMoney(stats?.benefices?.mois)}</p>
              </div>
            </div>

            {/* Add Transaction */}
            <div className="luxury-card p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#F9F7F2]">Ajouter une transaction</h3>
                <Button onClick={() => setShowAddTransaction(!showAddTransaction)} className="btn-gold text-sm">
                  <Plus size={16} className="mr-2" />
                  Nouvelle
                </Button>
              </div>

              <AnimatePresence>
                {showAddTransaction && (
                  <motion.form 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    onSubmit={handleAddTransaction}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-hidden"
                  >
                    <div>
                      <Label className="text-[#A3B1AD] text-xs mb-1 block">Type</Label>
                      <Select value={newTransaction.type} onValueChange={(v) => setNewTransaction({...newTransaction, type: v})}>
                        <SelectTrigger className="input-luxury"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#0F2E24] border border-white/10">
                          <SelectItem value="revenu">Revenu</SelectItem>
                          <SelectItem value="depense">Dépense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[#A3B1AD] text-xs mb-1 block">Catégorie</Label>
                      <Select value={newTransaction.category} onValueChange={(v) => setNewTransaction({...newTransaction, category: v})}>
                        <SelectTrigger className="input-luxury"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#0F2E24] border border-white/10">
                          {newTransaction.type === "revenu" ? (
                            <>
                              <SelectItem value="ventes">Ventes</SelectItem>
                              <SelectItem value="livraison">Livraison</SelectItem>
                              <SelectItem value="evenements">Événements</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="ingredients">Ingrédients</SelectItem>
                              <SelectItem value="personnel">Personnel</SelectItem>
                              <SelectItem value="loyer">Loyer</SelectItem>
                              <SelectItem value="utilities">Utilities</SelectItem>
                              <SelectItem value="marketing">Marketing</SelectItem>
                              <SelectItem value="equipement">Équipement</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[#A3B1AD] text-xs mb-1 block">Montant (FCFA)</Label>
                      <Input 
                        type="number" 
                        placeholder="50000" 
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                        className="input-luxury"
                      />
                    </div>
                    <div>
                      <Label className="text-[#A3B1AD] text-xs mb-1 block">Description</Label>
                      <Input 
                        placeholder="Description..." 
                        value={newTransaction.description}
                        onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                        className="input-luxury"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button type="submit" className="w-full btn-gold">Ajouter</Button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Transactions List */}
            <div className="luxury-card p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-[#F9F7F2] mb-4">Historique des transactions</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-xs text-[#A3B1AD] py-3 px-2">Date</th>
                      <th className="text-left text-xs text-[#A3B1AD] py-3 px-2">Type</th>
                      <th className="text-left text-xs text-[#A3B1AD] py-3 px-2">Catégorie</th>
                      <th className="text-left text-xs text-[#A3B1AD] py-3 px-2">Description</th>
                      <th className="text-right text-xs text-[#A3B1AD] py-3 px-2">Montant</th>
                      <th className="text-right text-xs text-[#A3B1AD] py-3 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-2 text-sm text-[#A3B1AD]">{t.date}</td>
                        <td className="py-3 px-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${t.type === 'revenu' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-sm text-[#F9F7F2]">{t.category}</td>
                        <td className="py-3 px-2 text-sm text-[#A3B1AD]">{t.description}</td>
                        <td className={`py-3 px-2 text-sm text-right font-medium ${t.type === 'revenu' ? 'text-green-400' : 'text-red-400'}`}>
                          {t.type === 'revenu' ? '+' : '-'}{formatMoney(t.amount)}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex gap-1 justify-end">
                            <button onClick={() => openModifyModal("edit", t)} className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors" title="Modifier">
                              <Settings size={14} />
                            </button>
                            <button onClick={() => openModifyModal("delete", t)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Supprimer">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== COMMANDES ==================== */}
        {activeTab === "commandes" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {orders.map((order) => (
                <div key={order.id} className="luxury-card p-5 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-lg font-bold text-[#F9F7F2]">{order.order_number}</p>
                      <p className="text-xs text-[#A3B1AD]">{order.customer_name || 'Client anonyme'}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-[#A3B1AD]">{item.quantity}x {item.name}</span>
                        <span className="text-[#F9F7F2]">{formatMoney(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <p className="text-lg font-bold text-[#D4AF37]">{formatMoney(order.total)}</p>
                    <div className="flex gap-2">
                      {order.status === 'en_attente' && (
                        <Button onClick={() => updateOrderStatus(order.id, 'en_preparation')} className="bg-blue-500/20 text-blue-400 text-xs px-3 py-1">
                          Préparer
                        </Button>
                      )}
                      {order.status === 'en_preparation' && (
                        <Button onClick={() => updateOrderStatus(order.id, 'pret')} className="bg-green-500/20 text-green-400 text-xs px-3 py-1">
                          Prêt
                        </Button>
                      )}
                      {order.status === 'pret' && (
                        <Button onClick={() => updateOrderStatus(order.id, 'livre')} className="btn-gold text-xs px-3 py-1">
                          Livré
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== STOCK ==================== */}
        {activeTab === "stock" && (
          <div className="space-y-6">
            {/* Add Stock Form */}
            <div className="luxury-card p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#F9F7F2]">Gestion du stock</h3>
                <Button onClick={() => setShowAddStock(!showAddStock)} className="btn-gold text-sm">
                  <Plus size={16} className="mr-2" />
                  Ajouter un article
                </Button>
              </div>

              <AnimatePresence>
                {showAddStock && (
                  <motion.form 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    onSubmit={handleAddStock}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-hidden mb-6 pb-6 border-b border-white/10"
                  >
                    <div>
                      <Label className="text-[#A3B1AD] text-xs mb-1 block">Nom de l'article *</Label>
                      <Input 
                        placeholder="Ex: Poulet, Bissap, Riz..." 
                        value={newStock.name}
                        onChange={(e) => setNewStock({...newStock, name: e.target.value})}
                        className="input-luxury"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-[#A3B1AD] text-xs mb-1 block">Catégorie</Label>
                      <Select value={newStock.category} onValueChange={(v) => setNewStock({...newStock, category: v})}>
                        <SelectTrigger className="input-luxury"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#0F2E24] border border-white/10">
                          <SelectItem value="viandes">🍖 Viandes</SelectItem>
                          <SelectItem value="poissons">🐟 Poissons</SelectItem>
                          <SelectItem value="legumes">🥬 Légumes</SelectItem>
                          <SelectItem value="feculents">🍚 Féculents</SelectItem>
                          <SelectItem value="epices">🌶️ Épices</SelectItem>
                          <SelectItem value="huiles">🫒 Huiles</SelectItem>
                          <SelectItem value="boissons">🥤 Boissons</SelectItem>
                          <SelectItem value="alcools">🍺 Alcools</SelectItem>
                          <SelectItem value="desserts">🍰 Desserts</SelectItem>
                          <SelectItem value="emballages">📦 Emballages</SelectItem>
                          <SelectItem value="autres">📋 Autres</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[#A3B1AD] text-xs mb-1 block">Quantité *</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="10" 
                          value={newStock.quantity}
                          onChange={(e) => setNewStock({...newStock, quantity: e.target.value})}
                          className="input-luxury flex-1"
                          required
                        />
                        <Select value={newStock.unit} onValueChange={(v) => setNewStock({...newStock, unit: v})}>
                          <SelectTrigger className="input-luxury w-24"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-[#0F2E24] border border-white/10">
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="L">L</SelectItem>
                            <SelectItem value="mL">mL</SelectItem>
                            <SelectItem value="unites">unités</SelectItem>
                            <SelectItem value="cartons">cartons</SelectItem>
                            <SelectItem value="bouteilles">bout.</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[#A3B1AD] text-xs mb-1 block">Seuil minimum *</Label>
                      <Input 
                        type="number" 
                        step="0.1"
                        placeholder="5" 
                        value={newStock.min_quantity}
                        onChange={(e) => setNewStock({...newStock, min_quantity: e.target.value})}
                        className="input-luxury"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-[#A3B1AD] text-xs mb-1 block">Prix unitaire (FCFA)</Label>
                      <Input 
                        type="number" 
                        placeholder="3500" 
                        value={newStock.price_per_unit}
                        onChange={(e) => setNewStock({...newStock, price_per_unit: e.target.value})}
                        className="input-luxury"
                      />
                    </div>
                    <div>
                      <Label className="text-[#A3B1AD] text-xs mb-1 block">Fournisseur</Label>
                      <Input 
                        placeholder="Nom du fournisseur" 
                        value={newStock.supplier}
                        onChange={(e) => setNewStock({...newStock, supplier: e.target.value})}
                        className="input-luxury"
                      />
                    </div>
                    <div className="flex items-end lg:col-span-2">
                      <Button type="submit" className="w-full btn-gold">Ajouter au stock</Button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Stock Categories Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
                {['viandes', 'poissons', 'legumes', 'boissons', 'epices', 'feculents'].map(cat => {
                  const count = stock.filter(s => s.category === cat).length;
                  const lowCount = stock.filter(s => s.category === cat && s.quantity <= s.min_quantity).length;
                  return (
                    <div key={cat} className="bg-white/5 rounded-xl p-3 text-center">
                      <p className="text-xs text-[#A3B1AD] capitalize">{cat}</p>
                      <p className="text-lg font-bold text-[#F9F7F2]">{count}</p>
                      {lowCount > 0 && <p className="text-[10px] text-red-400">{lowCount} bas</p>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stock Table */}
            <div className="luxury-card p-6 rounded-2xl">
              <h4 className="text-md font-semibold text-[#F9F7F2] mb-4">Inventaire complet</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-xs text-[#A3B1AD] py-3 px-2">Article</th>
                      <th className="text-left text-xs text-[#A3B1AD] py-3 px-2">Catégorie</th>
                      <th className="text-center text-xs text-[#A3B1AD] py-3 px-2">Quantité</th>
                      <th className="text-center text-xs text-[#A3B1AD] py-3 px-2">Min</th>
                      <th className="text-right text-xs text-[#A3B1AD] py-3 px-2">Prix/unité</th>
                      <th className="text-left text-xs text-[#A3B1AD] py-3 px-2">Fournisseur</th>
                      <th className="text-center text-xs text-[#A3B1AD] py-3 px-2">Statut</th>
                      <th className="text-center text-xs text-[#A3B1AD] py-3 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stock.map((item) => (
                      <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-2 text-sm text-[#F9F7F2] font-medium">{item.name}</td>
                        <td className="py-3 px-2 text-sm text-[#A3B1AD] capitalize">{item.category}</td>
                        <td className="py-3 px-2 text-sm text-center text-[#F9F7F2]">{item.quantity} {item.unit}</td>
                        <td className="py-3 px-2 text-sm text-center text-[#A3B1AD]">{item.min_quantity} {item.unit}</td>
                        <td className="py-3 px-2 text-sm text-right text-[#D4AF37]">{formatMoney(item.price_per_unit)}</td>
                        <td className="py-3 px-2 text-sm text-[#A3B1AD]">{item.supplier || '-'}</td>
                        <td className="py-3 px-2 text-center">
                          {item.quantity <= item.min_quantity ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">⚠️ Bas</span>
                          ) : item.quantity <= item.min_quantity * 1.5 ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">Moyen</span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">OK</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button 
                              onClick={() => handleUpdateStockQuantity(item.id, item.quantity, 'add')}
                              className="w-7 h-7 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30 flex items-center justify-center text-sm"
                              title="Ajouter"
                            >
                              +
                            </button>
                            <button 
                              onClick={() => handleUpdateStockQuantity(item.id, item.quantity, 'subtract')}
                              className="w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 flex items-center justify-center text-sm"
                              title="Retirer"
                            >
                              -
                            </button>
                            <button 
                              onClick={() => handleDeleteStock(item.id)}
                              className="w-7 h-7 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center"
                              title="Supprimer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {stock.length === 0 && (
                <p className="text-[#A3B1AD] text-sm text-center py-8">
                  Aucun article en stock. Cliquez sur "Ajouter un article" pour commencer.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ==================== RÉSERVATIONS ==================== */}
        {activeTab === "reservations" && (
          <div className="luxury-card p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-[#F9F7F2] mb-4">Réservations</h3>
            <div className="space-y-4">
              {reservations.map((res) => (
                <div key={res.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                      <Users size={20} className="text-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="text-[#F9F7F2] font-medium">{res.customer_name}</p>
                      <p className="text-xs text-[#A3B1AD]">{res.customer_phone}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[#F9F7F2] font-medium">{res.date}</p>
                    <p className="text-xs text-[#D4AF37]">{res.time}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[#F9F7F2] font-medium">{res.guests}</p>
                    <p className="text-xs text-[#A3B1AD]">personnes</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(res.status)}`}>
                    {res.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== ASSISTANT IA ==================== */}
        {activeTab === "ai" && (
          <div className="space-y-6">
            {/* AI Status */}
            <div className={`luxury-card p-4 rounded-2xl flex items-center gap-4 ${aiConfigured ? 'border-l-4 border-green-500' : 'border-l-4 border-orange-500'}`}>
              <Brain size={24} className={aiConfigured ? 'text-green-400' : 'text-orange-400'} />
              <div>
                <p className="text-[#F9F7F2] font-medium">
                  {aiConfigured ? 'Assistant IA DeepSeek connecté' : 'Mode démo (API non configurée)'}
                </p>
                <p className="text-xs text-[#A3B1AD]">
                  {aiConfigured ? 'Prêt pour les analyses et prévisions' : 'Ajoutez DEEPSEEK_API_KEY dans .env pour activer l\'IA complète'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Insights */}
              <div className="luxury-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#F9F7F2]">Insights Business</h3>
                  <Button onClick={fetchAIInsights} disabled={aiLoading} className="btn-gold text-sm">
                    <Sparkles size={16} className="mr-2" />
                    Générer
                  </Button>
                </div>
                
                {aiInsights ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-[#D4AF37]/10 rounded-xl">
                      <p className="text-sm text-[#F9F7F2]">{aiInsights.resume}</p>
                    </div>
                    
                    {aiInsights.points_cles && (
                      <div>
                        <p className="text-xs text-[#A3B1AD] uppercase mb-2">Points clés</p>
                        <ul className="space-y-2">
                          {aiInsights.points_cles.map((point, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-[#F9F7F2]">
                              <Check size={14} className="text-green-400 mt-1" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {aiInsights.recommandations && (
                      <div>
                        <p className="text-xs text-[#A3B1AD] uppercase mb-2">Recommandations</p>
                        <ul className="space-y-2">
                          {aiInsights.recommandations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-[#D4AF37]">
                              <ChevronRight size={14} className="mt-1" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {aiInsights.alertes && aiInsights.alertes.length > 0 && (
                      <div className="p-3 bg-red-500/10 rounded-xl">
                        <p className="text-xs text-red-400 uppercase mb-1">Alertes</p>
                        {aiInsights.alertes.map((alerte, i) => (
                          <p key={i} className="text-sm text-red-300">{alerte}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[#A3B1AD] text-sm text-center py-8">
                    Cliquez sur "Générer" pour obtenir des insights IA
                  </p>
                )}
              </div>

              {/* Forecast */}
              <div className="luxury-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#F9F7F2]">Prévisions</h3>
                  <Button onClick={fetchAIForecast} disabled={aiLoading} className="btn-gold text-sm">
                    <TrendingUp size={16} className="mr-2" />
                    Prévoir
                  </Button>
                </div>
                
                {aiForecast ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        aiForecast.tendance === 'hausse' ? 'bg-green-500/20' : 
                        aiForecast.tendance === 'baisse' ? 'bg-red-500/20' : 'bg-blue-500/20'
                      }`}>
                        {aiForecast.tendance === 'hausse' ? <TrendingUp className="text-green-400" /> : 
                         aiForecast.tendance === 'baisse' ? <TrendingDown className="text-red-400" /> : 
                         <BarChart3 className="text-blue-400" />}
                      </div>
                      <div>
                        <p className="text-[#F9F7F2] font-medium">Tendance: {aiForecast.tendance}</p>
                        <p className="text-xs text-[#A3B1AD]">Confiance: {aiForecast.confiance}%</p>
                      </div>
                    </div>
                    
                    {aiForecast.previsions && (
                      <div className="space-y-2">
                        {aiForecast.previsions.slice(0, 5).map((prev, i) => (
                          <div key={i} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                            <span className="text-sm text-[#A3B1AD]">{prev.date}</span>
                            <span className="text-sm text-[#D4AF37] font-medium">{formatMoney(prev.revenu_prevu)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {aiForecast.conseil && (
                      <div className="p-4 bg-[#D4AF37]/10 rounded-xl">
                        <p className="text-xs text-[#D4AF37] uppercase mb-1">Conseil</p>
                        <p className="text-sm text-[#F9F7F2]">{aiForecast.conseil}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[#A3B1AD] text-sm text-center py-8">
                    Cliquez sur "Prévoir" pour générer des prévisions
                  </p>
                )}
              </div>
            </div>

            {/* Chat Assistant */}
            <div className="luxury-card p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-[#F9F7F2] mb-4">Assistant IA</h3>
              <p className="text-sm text-[#A3B1AD] mb-4">
                Posez vos questions sur la gestion du restaurant, les performances, les stratégies...
              </p>
              
              {aiResponse && (
                <div className="mb-4 p-4 bg-[#1A4D3E]/30 rounded-xl">
                  <p className="text-xs text-[#D4AF37] uppercase mb-2">Réponse de l'assistant</p>
                  <p className="text-sm text-[#F9F7F2] whitespace-pre-wrap">{aiResponse}</p>
                </div>
              )}
              
              <div className="flex gap-3">
                <Input 
                  placeholder="Ex: Comment améliorer mes ventes du weekend?"
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendAIMessage()}
                  className="input-luxury flex-1"
                />
                <Button onClick={sendAIMessage} disabled={aiLoading} className="btn-gold">
                  {aiLoading ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
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
              <p className="text-[#A3B1AD] text-sm mb-5">Voulez-vous vraiment vous déconnecter du tableau de bord ?</p>
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

      {/* Modal mot de passe pour modifier/supprimer transaction */}
      <AnimatePresence>
        {modifyAction && modifyTransaction && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModifyModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0F2E24] border border-white/10 rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-[#F9F7F2] mb-4">
                {modifyAction === "delete" ? "Supprimer la transaction" : "Modifier la transaction"}
              </h3>

              {modifyAction === "edit" && (
                <div className="space-y-3 mb-4">
                  <div>
                    <Label className="text-[#A3B1AD] text-xs mb-1 block">Type</Label>
                    <select value={editForm.type} onChange={(e) => setEditForm({...editForm, type: e.target.value})} className="w-full bg-white/5 border border-white/10 text-[#F9F7F2] rounded-lg px-3 py-2 text-sm">
                      <option value="revenu" className="bg-[#0F2E24]">Revenu</option>
                      <option value="depense" className="bg-[#0F2E24]">Dépense</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-[#A3B1AD] text-xs mb-1 block">Catégorie</Label>
                    <Input value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})} className="bg-white/5 border-white/10 text-[#F9F7F2]" />
                  </div>
                  <div>
                    <Label className="text-[#A3B1AD] text-xs mb-1 block">Montant (FCFA)</Label>
                    <Input type="number" value={editForm.amount} onChange={(e) => setEditForm({...editForm, amount: e.target.value})} className="bg-white/5 border-white/10 text-[#F9F7F2]" />
                  </div>
                  <div>
                    <Label className="text-[#A3B1AD] text-xs mb-1 block">Description</Label>
                    <Input value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} className="bg-white/5 border-white/10 text-[#F9F7F2]" />
                  </div>
                  <div>
                    <Label className="text-[#A3B1AD] text-xs mb-1 block">Date</Label>
                    <Input type="date" value={editForm.date} onChange={(e) => setEditForm({...editForm, date: e.target.value})} className="bg-white/5 border-white/10 text-[#F9F7F2]" />
                  </div>
                </div>
              )}

              {modifyAction === "delete" && (
                <p className="text-[#A3B1AD] text-sm mb-4">
                  Voulez-vous vraiment supprimer cette transaction de <span className="font-bold text-[#F9F7F2]">{formatMoney(modifyTransaction.amount)}</span> ?
                </p>
              )}

              <div className="mb-4">
                <Label className="text-[#A3B1AD] text-xs mb-1 block">Mot de passe propriétaire</Label>
                <Input
                  type="password"
                  value={modifyPassword}
                  onChange={(e) => setModifyPassword(e.target.value)}
                  placeholder="Entrez le mot de passe..."
                  className="bg-white/5 border-white/10 text-[#F9F7F2]"
                  onKeyDown={(e) => e.key === "Enter" && handleModifySubmit()}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={closeModifyModal} className="flex-1 bg-white/10 text-[#A3B1AD] hover:bg-white/20">
                  Annuler
                </Button>
                <Button onClick={handleModifySubmit} className={`flex-1 ${modifyAction === "delete" ? "bg-red-500 hover:bg-red-600" : "bg-[#D4A853] hover:bg-[#c49b4a]"} text-white`}>
                  {modifyAction === "delete" ? "Supprimer" : "Enregistrer"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardPage;
