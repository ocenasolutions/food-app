"use client";

import { useEffect, useState } from "react";
import { Banknote, Bike, Store, UsersRound, ChevronRight, X, Edit, Menu, Power, MapPin, Clock, Star, DollarSign, Utensils, LayoutDashboard, Package, Activity, Trash2, CheckCircle, XCircle, Plus, Save } from "lucide-react";
import { getAdminStats, getOrders, getRestaurants, getUsers, getDeliveryPartners, updateRestaurantStatus, deleteUser, createUser, updateUser, createRestaurant, updateRestaurant, createDeliveryPartner, updateDeliveryPartner } from "@/lib/api";
import { formatMoney } from "@/lib/utils";
import type { Order, Restaurant } from "@/lib/types";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

type ViewMode = "dashboard" | "staff" | "restaurants" | "orders" | "partners";
type RestaurantModalView = "details" | "edit" | "menu";

interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

interface DeliveryPartner {
  id?: string;
  _id?: string;
  userId: any;
  vehicleType: string;
  vehicleNumber: string;
  status: string;
  currentLocation?: { lat: number; lng: number };
  assignedOrderIds: string[];
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<{ users: number; restaurants: number; orders: number; revenue: number; deliveryPartners: number } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [restaurantModalView, setRestaurantModalView] = useState<RestaurantModalView>("details");
  const [editForm, setEditForm] = useState<Partial<Restaurant>>({});
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingPartner, setEditingPartner] = useState<DeliveryPartner | null>(null);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", phone: "", role: "customer" });
  const [partnerForm, setPartnerForm] = useState({ userId: "", vehicleType: "", vehicleNumber: "", status: "available" });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [statsRes, ordersRes, restaurantsRes, usersRes, partnersRes] = await Promise.all([
        getAdminStats(),
        getOrders(),
        getRestaurants(),
        getUsers().catch(() => ({ data: [] })),
        getDeliveryPartners().catch(() => ({ data: [] }))
      ]);
      
      setStats(statsRes.data);
      setOrders(ordersRes.data);
      setRestaurants(restaurantsRes.data);
      setUsers(usersRes.data);
      // Filter only staff roles (admin, restaurant_staff, delivery_staff)
      setStaff(usersRes.data.filter((u: User) => 
        u.role === "admin" || u.role === "restaurant_staff" || u.role === "delivery_staff"
      ));
      setPartners(partnersRes.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to load admin data");
      setLoading(false);
      toast.error("Failed to load admin data");
    }
  }

  async function handleDisableRestaurant() {
    if (!selectedRestaurant) return;
    
    try {
      await updateRestaurantStatus(
        selectedRestaurant.id ?? selectedRestaurant._id ?? "",
        false
      );
      toast.success(`${selectedRestaurant.name} has been disabled`);
      setSelectedRestaurant(null);
      loadData();
    } catch (error) {
      toast.error("Failed to disable restaurant");
    }
  }

  async function handleDeleteUser(userId: string, userName: string) {
    try {
      await deleteUser(userId);
      toast.success(`User ${userName} has been deleted`);
      loadData();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  }

  async function handleSaveUser() {
    try {
      if (editingUser) {
        await updateUser(editingUser.id ?? editingUser._id ?? "", userForm);
        toast.success("User updated successfully");
      } else {
        await createUser(userForm);
        toast.success("User created successfully");
      }
      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({ name: "", email: "", password: "", phone: "", role: "customer" });
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to save user");
    }
  }

  async function handleSaveRestaurant() {
    try {
      const restaurantId = selectedRestaurant?.id ?? selectedRestaurant?._id;
      if (restaurantId) {
        await updateRestaurant(restaurantId, editForm);
        toast.success("Restaurant updated successfully");
      } else {
        await createRestaurant(editForm);
        toast.success("Restaurant created successfully");
      }
      setRestaurantModalView("details");
      setShowRestaurantModal(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to save restaurant");
    }
  }

  async function handleSavePartner() {
    try {
      if (editingPartner) {
        await updateDeliveryPartner(editingPartner.id ?? editingPartner._id ?? "", partnerForm);
        toast.success("Partner updated successfully");
      } else {
        await createDeliveryPartner(partnerForm);
        toast.success("Partner created successfully");
      }
      setShowPartnerModal(false);
      setEditingPartner(null);
      setPartnerForm({ userId: "", vehicleType: "", vehicleNumber: "", status: "available" });
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to save partner");
    }
  }

  if (loading) {
    return (
      <main className="page-shell py-8">
        <h1 className="text-3xl font-black">Admin Dashboard</h1>
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-shell py-8">
        <h1 className="text-3xl font-black">Admin Dashboard</h1>
        <p className="text-red-600">Error: {error}</p>
      </main>
    );
  }

  if (!stats) return null;

  const cards = [
    { label: "Staff", value: staff.length, icon: UsersRound, view: "staff" as ViewMode },
    { label: "Restaurants", value: stats.restaurants, icon: Store, view: "restaurants" as ViewMode },
    { label: "Orders", value: stats.orders, icon: Banknote, view: "orders" as ViewMode },
    { label: "Partners", value: stats.deliveryPartners, icon: Bike, view: "partners" as ViewMode }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <Toaster position="top-right" />
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-black">Admin Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Users, restaurants, payments, commissions, reports, and order operations.</p>
          </div>
          <span className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-bold text-white shadow-lg">
            <Activity size={16} />
            Live API
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 flex gap-2 overflow-x-auto rounded-xl bg-white p-2 shadow-lg">
          <button
            onClick={() => setViewMode("dashboard")}
            className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold transition ${
              viewMode === "dashboard" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </button>
          <button
            onClick={() => setViewMode("staff")}
            className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold transition ${
              viewMode === "staff" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <UsersRound size={16} />
            Staff ({staff.length})
          </button>
          <button
            onClick={() => setViewMode("restaurants")}
            className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold transition ${
              viewMode === "restaurants" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Store size={16} />
            Restaurants ({stats.restaurants})
          </button>
          <button
            onClick={() => setViewMode("orders")}
            className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold transition ${
              viewMode === "orders" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Package size={16} />
            Orders ({stats.orders})
          </button>
          <button
            onClick={() => setViewMode("partners")}
            className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold transition ${
              viewMode === "partners" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Bike size={16} />
            Partners ({stats.deliveryPartners})
          </button>
        </div>

      {/* Dashboard View */}
      {viewMode === "dashboard" && (
        <>
          <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {cards.map(({ label, value, icon: Icon, view }) => (
              <button
                key={label}
                onClick={() => setViewMode(view)}
                className="group relative overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-lg transition hover:scale-105 hover:shadow-xl"
              >
                <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/5" />
                <div className="relative">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="rounded-xl bg-primary/10 p-3">
                      <Icon className="text-primary" size={28} />
                    </div>
                    <ChevronRight className="text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" size={20} />
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground">{label}</p>
                  <p className="mt-1 text-4xl font-black">{value}</p>
                </div>
              </button>
            ))}
          </div>
          
          <div className="grid gap-6 lg:grid-cols-[1fr_500px]">
            <section className="rounded-2xl border border-border bg-white p-6 shadow-lg">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-black">Recent Orders</h2>
                <button 
                  onClick={() => setViewMode("orders")}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {orders.slice(0, 6).map((order) => (
                  <button
                    key={order.id ?? order._id}
                    onClick={() => setSelectedOrder(order)}
                    className="grid w-full gap-3 rounded-xl border border-border bg-gradient-to-r from-white to-slate-50 p-4 text-left transition hover:border-primary hover:shadow-md md:grid-cols-4"
                  >
                    <span className="truncate font-bold">{((order.id ?? order._id) || "").slice(0, 12)}...</span>
                    <span className="capitalize">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                        order.status === "delivered" ? "bg-green-100 text-green-700" :
                        order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {order.status}
                      </span>
                    </span>
                    <span className="capitalize">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                        order.paymentStatus === "paid" ? "bg-green-100 text-green-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </span>
                    <span className="text-lg font-black text-primary">{formatMoney(order.total)}</span>
                  </button>
                ))}
              </div>
            </section>
            
            <section className="rounded-2xl border border-border bg-white p-6 shadow-lg">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-black">Restaurants</h2>
                <button 
                  onClick={() => setViewMode("restaurants")}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {restaurants.slice(0, 5).map((restaurant) => (
                  <button
                    key={restaurant.id ?? restaurant._id}
                    onClick={() => setSelectedRestaurant(restaurant)}
                    className="w-full rounded-xl border border-border bg-gradient-to-r from-white to-slate-50 p-4 text-left transition hover:border-primary hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-lg">
                        <img src={restaurant.logo} alt={restaurant.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold">{restaurant.name}</p>
                        <p className="text-xs text-muted-foreground">{restaurant.cuisines.slice(0, 2).join(" • ")}</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                        restaurant.isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {restaurant.isOpen ? "Open" : "Closed"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </>
      )}

      {/* Staff View */}
      {viewMode === "staff" && (
        <div className="rounded-2xl border border-border bg-white p-8 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-3xl font-black">Staff Management</h2>
            <button
              onClick={() => {
                setEditingUser(null);
                setUserForm({ name: "", email: "", password: "", phone: "", role: "restaurant_staff" });
                setShowUserModal(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-bold text-white transition hover:bg-primary/90"
            >
              <Plus size={18} />
              Add Staff
            </button>
          </div>
          <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 p-6">
            <p className="text-2xl font-black text-blue-900">Total Staff: {staff.length}</p>
            <p className="text-sm text-blue-700">Admins, restaurant staff, and delivery staff</p>
          </div>
          <div className="space-y-3">
            {staff.map((user) => (
              <div
                key={user.id ?? user._id}
                className="flex items-center justify-between rounded-xl border border-border bg-gradient-to-r from-white to-slate-50 p-5"
              >
                <div className="flex-1">
                  <p className="font-bold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email} • {user.phone}</p>
                  <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${
                    user.role === "admin" ? "bg-red-100 text-red-700" :
                    user.role === "restaurant_staff" ? "bg-blue-100 text-blue-700" :
                    user.role === "delivery_staff" ? "bg-green-100 text-green-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {user.role === "restaurant_staff" ? "Restaurant Staff" :
                     user.role === "delivery_staff" ? "Delivery Staff" :
                     user.role === "admin" ? "Admin" : user.role}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingUser(user);
                      setUserForm({ name: user.name, email: user.email, password: "", phone: user.phone, role: user.role });
                      setShowUserModal(true);
                    }}
                    className="rounded-lg border-2 border-blue-600 bg-blue-50 p-3 text-blue-600 transition hover:bg-blue-600 hover:text-white"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete staff member ${user.name}?`)) {
                        handleDeleteUser(user.id ?? user._id ?? "", user.name);
                      }
                    }}
                    className="rounded-lg border-2 border-red-600 bg-red-50 p-3 text-red-600 transition hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Restaurants View */}
      {viewMode === "restaurants" && (
        <div className="rounded-2xl border border-border bg-white p-8 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-3xl font-black">Restaurant Management</h2>
            <button
              onClick={() => {
                setSelectedRestaurant(null);
                setEditForm({});
                setShowRestaurantModal(true);
                setRestaurantModalView("edit");
              }}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-bold text-white transition hover:bg-primary/90"
            >
              <Plus size={18} />
              Add Restaurant
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <button
                key={restaurant.id ?? restaurant._id}
                onClick={() => setSelectedRestaurant(restaurant)}
                className="group overflow-hidden rounded-xl border border-border bg-white text-left transition hover:border-primary hover:shadow-xl"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={restaurant.coverImage} 
                    alt={restaurant.name}
                    className="h-full w-full object-cover transition group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className={`absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                    restaurant.isOpen ? "bg-green-500 text-white" : "bg-red-500 text-white"
                  }`}>
                    <Activity size={10} />
                    {restaurant.isOpen ? "Open" : "Closed"}
                  </span>
                  <div className="absolute bottom-3 left-3">
                    <span className="flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-bold backdrop-blur">
                      <Star className="fill-yellow-400 text-yellow-400" size={12} />
                      {restaurant.rating}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-lg font-bold">{restaurant.name}</p>
                  <p className="text-sm text-muted-foreground">{restaurant.cuisines.join(" • ")}</p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-semibold">{restaurant.deliveryTime}</span>
                    <span className="font-bold text-primary">{formatMoney(restaurant.deliveryFee)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Orders View */}
      {viewMode === "orders" && (
        <div className="rounded-2xl border border-border bg-white p-8 shadow-lg">
          <h2 className="mb-6 text-3xl font-black">Order Management</h2>
          <div className="space-y-3">
            {orders.map((order) => (
              <button
                key={order.id ?? order._id}
                onClick={() => setSelectedOrder(order)}
                className="w-full rounded-xl border border-border bg-gradient-to-r from-white to-slate-50 p-5 text-left transition hover:border-primary hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-bold">Order #{((order.id ?? order._id) || "").slice(0, 16)}...</p>
                    <div className="mt-2 flex gap-2">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                        order.status === "delivered" ? "bg-green-100 text-green-700" :
                        order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {order.status}
                      </span>
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                        order.paymentStatus === "paid" ? "bg-green-100 text-green-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-primary">{formatMoney(order.total)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Partners View */}
      {viewMode === "partners" && (
        <div className="rounded-2xl border border-border bg-white p-8 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-3xl font-black">Delivery Partners</h2>
            <button
              onClick={() => {
                setEditingPartner(null);
                setPartnerForm({ userId: "", vehicleType: "", vehicleNumber: "", status: "available" });
                setShowPartnerModal(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-bold text-white transition hover:bg-primary/90"
            >
              <Plus size={18} />
              Add Partner
            </button>
          </div>
          <div className="mb-6 rounded-xl bg-gradient-to-r from-green-50 to-green-100 p-6">
            <p className="text-2xl font-black text-green-900">Total Partners: {partners.length}</p>
            <p className="text-sm text-green-700">Active delivery personnel</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {partners.map((partner) => (
              <div
                key={partner.id ?? partner._id}
                className="rounded-xl border border-border bg-gradient-to-br from-white to-green-50 p-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="rounded-lg bg-green-100 p-2">
                    <Bike className="text-green-600" size={24} />
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                    partner.status === "available" ? "bg-green-500 text-white" :
                    partner.status === "on_delivery" ? "bg-blue-500 text-white" :
                    "bg-gray-500 text-white"
                  }`}>
                    {partner.status}
                  </span>
                </div>
                <p className="font-bold">{partner.userId?.name || "Unknown"}</p>
                <p className="text-sm text-muted-foreground">{partner.userId?.email || "N/A"}</p>
                <div className="mt-3 space-y-1 text-sm">
                  <p><span className="font-semibold">Vehicle:</span> {partner.vehicleType}</p>
                  <p><span className="font-semibold">Number:</span> {partner.vehicleNumber}</p>
                  <p><span className="font-semibold">Orders:</span> {partner.assignedOrderIds?.length || 0}</p>
                </div>
                <button
                  onClick={() => {
                    setEditingPartner(partner);
                    setPartnerForm({
                      userId: partner.userId?._id || partner.userId,
                      vehicleType: partner.vehicleType,
                      vehicleNumber: partner.vehicleNumber,
                      status: partner.status
                    });
                    setShowPartnerModal(true);
                  }}
                  className="mt-3 w-full rounded-lg border-2 border-blue-600 bg-blue-50 py-2 font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white"
                >
                  <Edit className="inline mr-1" size={14} />
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-2xl font-bold">Order Details</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-md p-2 hover:bg-muted"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-semibold">{selectedOrder.id ?? selectedOrder._id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="capitalize font-semibold">{selectedOrder.status}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <p className="capitalize font-semibold">{selectedOrder.paymentStatus}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{formatMoney(selectedOrder.total)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restaurant Detail Modal */}
      {selectedRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 border-b border-border bg-white/95 backdrop-blur">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Store className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">{selectedRestaurant.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedRestaurant.cuisines.join(" • ")}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedRestaurant(null);
                    setRestaurantModalView("details");
                  }}
                  className="rounded-lg p-2 transition hover:bg-muted"
                >
                  <X size={24} />
                </button>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex gap-1 px-6 pb-2">
                <button
                  onClick={() => setRestaurantModalView("details")}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    restaurantModalView === "details" 
                      ? "bg-primary text-white" 
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => {
                    setRestaurantModalView("edit");
                    setEditForm(selectedRestaurant);
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    restaurantModalView === "edit" 
                      ? "bg-primary text-white" 
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Edit className="inline mr-1" size={14} />
                  Edit
                </button>
                <button
                  onClick={() => setRestaurantModalView("menu")}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    restaurantModalView === "menu" 
                      ? "bg-primary text-white" 
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Utensils className="inline mr-1" size={14} />
                  Menu
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Details View */}
              {restaurantModalView === "details" && (
                <div className="space-y-6">
                  {/* Cover Image */}
                  <div className="relative aspect-[21/9] overflow-hidden rounded-xl">
                    <img 
                      src={selectedRestaurant.coverImage} 
                      alt={selectedRestaurant.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-3">
                      <span className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold ${
                        selectedRestaurant.isOpen 
                          ? "bg-green-500 text-white" 
                          : "bg-red-500 text-white"
                      }`}>
                        <Activity size={12} />
                        {selectedRestaurant.isOpen ? "Open Now" : "Closed"}
                      </span>
                      <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-1.5 text-sm font-bold backdrop-blur">
                        <Star className="fill-yellow-400 text-yellow-400" size={14} />
                        {selectedRestaurant.rating} ({selectedRestaurant.reviewCount})
                      </span>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-border bg-gradient-to-br from-blue-50 to-white p-4">
                      <div className="mb-2 flex items-center gap-2 text-blue-600">
                        <Clock size={18} />
                        <span className="text-sm font-semibold">Delivery Time</span>
                      </div>
                      <p className="text-xl font-black">{selectedRestaurant.deliveryTime}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-gradient-to-br from-green-50 to-white p-4">
                      <div className="mb-2 flex items-center gap-2 text-green-600">
                        <DollarSign size={18} />
                        <span className="text-sm font-semibold">Delivery Fee</span>
                      </div>
                      <p className="text-xl font-black">{formatMoney(selectedRestaurant.deliveryFee)}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-gradient-to-br from-purple-50 to-white p-4">
                      <div className="mb-2 flex items-center gap-2 text-purple-600">
                        <Banknote size={18} />
                        <span className="text-sm font-semibold">Min Order</span>
                      </div>
                      <p className="text-xl font-black">{formatMoney(selectedRestaurant.minOrder)}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="rounded-xl border border-border bg-muted/30 p-5">
                    <h4 className="mb-2 font-bold">Description</h4>
                    <p className="text-muted-foreground">{selectedRestaurant.description}</p>
                    {selectedRestaurant.descriptionAr && (
                      <p className="mt-2 text-right text-muted-foreground" dir="rtl">{selectedRestaurant.descriptionAr}</p>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3 rounded-xl border border-border p-5">
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 text-primary" size={18} />
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground">Address</p>
                          <p className="font-semibold">{selectedRestaurant.address}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <DollarSign className="mt-0.5 text-primary" size={18} />
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground">Price Level</p>
                          <p className="text-xl font-bold text-primary">{"$".repeat(selectedRestaurant.priceLevel)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 rounded-xl border border-border p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-muted-foreground">Delivery</span>
                        <span className={`font-bold ${selectedRestaurant.supportsDelivery ? "text-green-600" : "text-red-600"}`}>
                          {selectedRestaurant.supportsDelivery ? "✓ Available" : "✗ Not Available"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-muted-foreground">Pickup</span>
                        <span className={`font-bold ${selectedRestaurant.supportsPickup ? "text-green-600" : "text-red-600"}`}>
                          {selectedRestaurant.supportsPickup ? "✓ Available" : "✗ Not Available"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit View */}
              {restaurantModalView === "edit" && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold">Restaurant Name *</label>
                      <input
                        type="text"
                        value={editForm.name || ""}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full rounded-lg border border-border bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold">Arabic Name</label>
                      <input
                        type="text"
                        value={editForm.nameAr || ""}
                        onChange={(e) => setEditForm({...editForm, nameAr: e.target.value})}
                        className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-right outline-none focus:ring-2 focus:ring-primary"
                        dir="rtl"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-bold">Description *</label>
                      <textarea
                        value={editForm.description || ""}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        rows={3}
                        className="w-full rounded-lg border border-border bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-bold">Address *</label>
                      <input
                        type="text"
                        value={editForm.address || ""}
                        onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                        className="w-full rounded-lg border border-border bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold">Cover Image URL *</label>
                      <input
                        type="url"
                        value={editForm.coverImage || ""}
                        onChange={(e) => setEditForm({...editForm, coverImage: e.target.value})}
                        placeholder="https://..."
                        className="w-full rounded-lg border border-border bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold">Logo URL *</label>
                      <input
                        type="url"
                        value={editForm.logo || ""}
                        onChange={(e) => setEditForm({...editForm, logo: e.target.value})}
                        placeholder="https://..."
                        className="w-full rounded-lg border border-border bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold">Delivery Fee (₹) *</label>
                      <input
                        type="number"
                        min="0"
                        value={editForm.deliveryFee || 0}
                        onChange={(e) => setEditForm({...editForm, deliveryFee: Number(e.target.value)})}
                        className="w-full rounded-lg border border-border bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold">Minimum Order (₹) *</label>
                      <input
                        type="number"
                        min="0"
                        value={editForm.minOrder || 0}
                        onChange={(e) => setEditForm({...editForm, minOrder: Number(e.target.value)})}
                        className="w-full rounded-lg border border-border bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold">Delivery Time *</label>
                      <input
                        type="text"
                        value={editForm.deliveryTime || ""}
                        onChange={(e) => setEditForm({...editForm, deliveryTime: e.target.value})}
                        placeholder="e.g., 30-40 min"
                        className="w-full rounded-lg border border-border bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold">Rating *</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={editForm.rating || 0}
                        onChange={(e) => setEditForm({...editForm, rating: Number(e.target.value)})}
                        className="w-full rounded-lg border border-border bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold">Status *</label>
                      <select
                        value={editForm.isOpen ? "open" : "closed"}
                        onChange={(e) => setEditForm({...editForm, isOpen: e.target.value === "open"})}
                        className="w-full rounded-lg border border-border bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold">Price Level (1-4) *</label>
                      <input
                        type="number"
                        min="1"
                        max="4"
                        value={editForm.priceLevel || 2}
                        onChange={(e) => setEditForm({...editForm, priceLevel: Number(e.target.value)})}
                        className="w-full rounded-lg border border-border bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={handleSaveRestaurant}
                      disabled={!editForm.name || !editForm.description || !editForm.address}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Save size={18} />
                      Save Changes
                    </button>
                    <button 
                      onClick={() => {
                        setRestaurantModalView("details");
                        if (!selectedRestaurant) setSelectedRestaurant(null);
                      }}
                      className="rounded-lg border border-border px-6 py-3 font-bold transition hover:bg-muted"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Menu View */}
              {restaurantModalView === "menu" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl border border-border bg-gradient-to-r from-primary/5 to-primary/10 p-5">
                    <div>
                      <h4 className="text-lg font-bold">Restaurant Menu</h4>
                      <p className="text-sm text-muted-foreground">View all menu items and categories</p>
                    </div>
                    <button
                      onClick={() => {
                        const restaurantId = selectedRestaurant.id ?? selectedRestaurant._id;
                        router.push(`/en/restaurants/${restaurantId}`);
                      }}
                      className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-bold text-white transition hover:bg-primary/90"
                    >
                      <Utensils size={16} />
                      View Full Menu
                    </button>
                  </div>
                  
                  <div className="rounded-xl border-2 border-dashed border-border p-12 text-center">
                    <Utensils className="mx-auto mb-4 text-muted-foreground" size={64} />
                    <p className="mb-2 text-lg font-bold">Menu Management</p>
                    <p className="text-sm text-muted-foreground">
                      Click "View Full Menu" above to see all items, categories, and pricing for this restaurant
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-border bg-muted/30 p-6">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => {
                    if (confirm(`Are you sure you want to disable ${selectedRestaurant.name}? This will make it unavailable to customers.`)) {
                      handleDisableRestaurant();
                    }
                  }}
                  className="flex items-center gap-2 rounded-lg border-2 border-red-600 bg-red-50 px-5 py-2.5 font-bold text-red-600 transition hover:bg-red-600 hover:text-white"
                >
                  <Power size={18} />
                  Disable Restaurant
                </button>
                <div className="text-sm text-muted-foreground">
                  ID: <span className="font-mono font-semibold">{selectedRestaurant.id ?? selectedRestaurant._id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* User Create/Edit Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-black">{editingUser ? "Edit Staff" : "Add Staff"}</h3>
              <button onClick={() => setShowUserModal(false)} className="rounded-lg p-2 hover:bg-muted">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold">Name</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                  className="w-full rounded-lg border border-border px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold">Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  className="w-full rounded-lg border border-border px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {!editingUser && (
                <div>
                  <label className="mb-2 block text-sm font-bold">Password</label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                    className="w-full rounded-lg border border-border px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}
              <div>
                <label className="mb-2 block text-sm font-bold">Phone</label>
                <input
                  type="tel"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                  className="w-full rounded-lg border border-border px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold">Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                  className="w-full rounded-lg border border-border px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="restaurant_staff">Restaurant Staff</option>
                  <option value="delivery_staff">Delivery Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveUser}
                  disabled={!userForm.name || !userForm.email || !userForm.phone || (!editingUser && !userForm.password)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={18} />
                  Save
                </button>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="rounded-lg border border-border px-6 py-3 font-bold transition hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Partner Create/Edit Modal */}
      {showPartnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-black">{editingPartner ? "Edit Partner" : "Add Partner"}</h3>
              <button onClick={() => setShowPartnerModal(false)} className="rounded-lg p-2 hover:bg-muted">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold">Select User</label>
                <select
                  value={partnerForm.userId}
                  onChange={(e) => setPartnerForm({...partnerForm, userId: e.target.value})}
                  className="w-full rounded-lg border border-border px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary"
                  disabled={!!editingPartner}
                >
                  <option value="">Select a user</option>
                  {users.filter(u => u.role === "delivery_staff").map(user => (
                    <option key={user.id ?? user._id} value={user.id ?? user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                {!!editingPartner && (
                  <p className="mt-1 text-xs text-muted-foreground">User cannot be changed after creation</p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold">Vehicle Type</label>
                <select
                  value={partnerForm.vehicleType}
                  onChange={(e) => setPartnerForm({...partnerForm, vehicleType: e.target.value})}
                  className="w-full rounded-lg border border-border px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select vehicle type</option>
                  <option value="bike">Bike</option>
                  <option value="scooter">Scooter</option>
                  <option value="car">Car</option>
                  <option value="bicycle">Bicycle</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold">Vehicle Number</label>
                <input
                  type="text"
                  value={partnerForm.vehicleNumber}
                  onChange={(e) => setPartnerForm({...partnerForm, vehicleNumber: e.target.value})}
                  placeholder="e.g., MH-01-AB-1234"
                  className="w-full rounded-lg border border-border px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold">Status</label>
                <select
                  value={partnerForm.status}
                  onChange={(e) => setPartnerForm({...partnerForm, status: e.target.value})}
                  className="w-full rounded-lg border border-border px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="available">Available</option>
                  <option value="on_delivery">On Delivery</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSavePartner}
                  disabled={!partnerForm.userId || !partnerForm.vehicleType || !partnerForm.vehicleNumber}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={18} />
                  Save
                </button>
                <button
                  onClick={() => setShowPartnerModal(false)}
                  className="rounded-lg border border-border px-6 py-3 font-bold transition hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
