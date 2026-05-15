"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ClipboardList, Pencil, Utensils, TrendingUp, DollarSign, Clock, Star, Package, AlertCircle, Eye, Edit, Trash2, Plus } from "lucide-react";
import { getOrders, getRestaurant, getRestaurants } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";
import type { Order, Restaurant, MenuItem, MenuCategory } from "@/lib/types";
import toast, { Toaster } from "react-hot-toast";

export default function RestaurantDashboardPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "menu">("overview");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [restaurantsRes, ordersRes] = await Promise.all([getRestaurants(), getOrders()]);
      const firstRestaurant = restaurantsRes.data[0];
      setRestaurant(firstRestaurant);
      setOrders(ordersRes.data);

      if (firstRestaurant) {
        const restaurantId = firstRestaurant.id ?? firstRestaurant._id ?? "";
        if (restaurantId) {
          const { data } = await getRestaurant(restaurantId);
          setItems(data.items);
        }
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to load restaurant data");
      setLoading(false);
      toast.error("Failed to load data");
    }
  }

  const pendingOrders = orders.filter(o => o.status === "pending" || o.status === "confirmed");
  const preparingOrders = orders.filter(o => o.status === "preparing");
  const completedToday = orders.filter(o => o.status === "delivered").length;
  const todayRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  if (loading) {
    return (
      <main className="page-shell py-8">
        <h1 className="text-3xl font-black">Restaurant Dashboard</h1>
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-shell py-8">
        <h1 className="text-3xl font-black">Restaurant Dashboard</h1>
        <p className="text-red-600">Error: {error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8">
      <Toaster position="top-right" />
      <div className="page-shell">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black">{restaurant?.name || "Restaurant"} Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Manage orders, menu, and track performance</p>
          </div>
          <div className={`rounded-full px-4 py-2 text-sm font-bold shadow-lg ${
            restaurant?.isOpen ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}>
            <Utensils className="inline mr-2" size={16} />
            {restaurant?.isOpen ? "Open" : "Closed"}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-lg bg-orange-100 p-3">
                <ClipboardList className="text-orange-600" size={24} />
              </div>
              <AlertCircle className="text-orange-500" size={20} />
            </div>
            <p className="text-3xl font-black">{pendingOrders.length}</p>
            <p className="text-sm text-muted-foreground">Pending Orders</p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-lg bg-blue-100 p-3">
                <Package className="text-blue-600" size={24} />
              </div>
            </div>
            <p className="text-3xl font-black">{preparingOrders.length}</p>
            <p className="text-sm text-muted-foreground">Preparing</p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-lg bg-green-100 p-3">
                <CheckCircle2 className="text-green-600" size={24} />
              </div>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <p className="text-3xl font-black">{completedToday}</p>
            <p className="text-sm text-muted-foreground">Completed Today</p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-lg bg-purple-100 p-3">
                <DollarSign className="text-purple-600" size={24} />
              </div>
              <Star className="text-yellow-500" size={20} />
            </div>
            <p className="text-3xl font-black">{formatMoney(todayRevenue)}</p>
            <p className="text-sm text-muted-foreground">Today's Revenue</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 rounded-xl bg-white p-2 shadow-lg">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 rounded-lg px-6 py-3 font-bold transition ${
              activeTab === "overview" ? "bg-primary text-white" : "hover:bg-slate-100"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 rounded-lg px-6 py-3 font-bold transition ${
              activeTab === "orders" ? "bg-primary text-white" : "hover:bg-slate-100"
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={`flex-1 rounded-lg px-6 py-3 font-bold transition ${
              activeTab === "menu" ? "bg-primary text-white" : "hover:bg-slate-100"
            }`}
          >
            Menu ({items.length})
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Restaurant Info */}
            <section className="rounded-2xl border border-border bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-2xl font-black">Restaurant Information</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-bold">{restaurant?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="font-bold">
                    <Star className="inline fill-yellow-400 text-yellow-400" size={16} />
                    {restaurant?.rating} ({restaurant?.reviewCount} reviews)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Time</p>
                  <p className="font-bold">{restaurant?.deliveryTime}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Fee</p>
                  <p className="font-bold">{formatMoney(restaurant?.deliveryFee || 0)}</p>
                </div>
              </div>
            </section>

            {/* Recent Orders */}
            <section className="rounded-2xl border border-border bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-2xl font-black">Recent Orders</h2>
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id ?? order._id}
                    className="flex items-center justify-between rounded-xl border border-border bg-slate-50 p-4"
                  >
                    <div>
                      <p className="font-bold">Order #{(order.id ?? order._id ?? "").slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground capitalize">{order.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatMoney(order.total)}</p>
                      <span className={`text-xs font-semibold ${
                        order.paymentStatus === "paid" ? "text-green-600" : "text-red-600"
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <section className="rounded-2xl border border-border bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-black">All Orders</h2>
            </div>
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id ?? order._id}
                  className="rounded-xl border-2 border-border bg-slate-50 p-5 transition hover:border-primary"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-lg font-bold">Order #{(order.id ?? order._id ?? "").slice(0, 12)}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Status: <span className="capitalize font-semibold">{order.status}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-primary">{formatMoney(order.total)}</p>
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                        order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {order.status === "pending" && (
                      <button className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700">
                        Accept Order
                      </button>
                    )}
                    {order.status === "confirmed" && (
                      <button className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700">
                        Start Preparing
                      </button>
                    )}
                    {order.status === "preparing" && (
                      <button className="rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white transition hover:bg-purple-700">
                        Mark Ready
                      </button>
                    )}
                    <button className="rounded-lg border-2 border-border px-4 py-2 font-semibold transition hover:bg-slate-100">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Menu Tab */}
        {activeTab === "menu" && (
          <section className="rounded-2xl border border-border bg-white p-6 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black">Menu Management</h2>
              <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-bold text-white transition hover:bg-primary/90">
                <Plus size={18} />
                Add Item
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <div
                  key={item.id ?? item._id}
                  className="overflow-hidden rounded-xl border-2 border-border bg-white transition hover:border-primary hover:shadow-lg"
                >
                  <div className="relative aspect-video">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${
                      item.isAvailable ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    }`}>
                      {item.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold">{item.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                    <p className="mt-2 text-xl font-black text-primary">{formatMoney(item.price)}</p>
                    <div className="mt-3 flex gap-2">
                      <button className="flex-1 rounded-lg border-2 border-blue-600 bg-blue-50 py-2 font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white">
                        <Edit className="inline mr-1" size={14} />
                        Edit
                      </button>
                      <button className="rounded-lg border-2 border-red-600 bg-red-50 px-3 py-2 font-semibold text-red-600 transition hover:bg-red-600 hover:text-white">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
