"use client";

import { Bike, MapPin, PackageCheck, Navigation, Phone, Clock, DollarSign, CheckCircle, AlertCircle, TrendingUp, Award, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { getOrders } from "@/lib/api";
import { formatMoney } from "@/lib/utils";
import type { Order } from "@/lib/types";

export default function DeliveryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [completedToday, setCompletedToday] = useState(0);
  const [earnings, setEarnings] = useState(0);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const { data } = await getOrders();
      setOrders(data);
      const active = data.filter((o: Order) => 
        o.status === "preparing" || o.status === "ready_for_pickup" || o.status === "out_for_delivery"
      );
      setActiveOrders(active);
      
      const completed = data.filter((o: Order) => o.status === "delivered").length;
      setCompletedToday(completed);
      
      const totalEarnings = data
        .filter((o: Order) => o.status === "delivered")
        .reduce((sum: number, o: Order) => sum + (o.total * 0.1), 0); // 10% commission
      setEarnings(totalEarnings);
    } catch (error) {
      console.error("Failed to load orders:", error);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="page-shell">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black">Delivery Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Manage your deliveries and track earnings</p>
          </div>
          <div className="rounded-full bg-green-500 px-4 py-2 text-sm font-bold text-white shadow-lg">
            <Bike className="inline mr-2" size={16} />
            Available
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-lg bg-blue-100 p-3">
                <Package className="text-blue-600" size={24} />
              </div>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <p className="text-3xl font-black">{activeOrders.length}</p>
            <p className="text-sm text-muted-foreground">Active Orders</p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-lg bg-green-100 p-3">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
            <p className="text-3xl font-black">{completedToday}</p>
            <p className="text-sm text-muted-foreground">Completed Today</p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-lg bg-yellow-100 p-3">
                <DollarSign className="text-yellow-600" size={24} />
              </div>
              <Award className="text-yellow-500" size={20} />
            </div>
            <p className="text-3xl font-black">{formatMoney(earnings)}</p>
            <p className="text-sm text-muted-foreground">Today's Earnings</p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-lg bg-purple-100 p-3">
                <Clock className="text-purple-600" size={24} />
              </div>
            </div>
            <p className="text-3xl font-black">4.8★</p>
            <p className="text-sm text-muted-foreground">Your Rating</p>
          </div>
        </div>

        {/* Active Deliveries */}
        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-black">Active Deliveries</h2>
          <div className="space-y-4">
            {activeOrders.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border bg-white p-12 text-center">
                <Bike className="mx-auto mb-4 text-muted-foreground" size={64} />
                <p className="text-xl font-bold">No active deliveries</p>
                <p className="text-muted-foreground">New orders will appear here</p>
              </div>
            ) : (
              activeOrders.map((order) => (
                <div
                  key={order.id ?? order._id}
                  className="overflow-hidden rounded-2xl border border-border bg-white shadow-lg transition hover:shadow-xl"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold opacity-90">Order #{(order.id ?? order._id ?? "").slice(0, 8)}</p>
                        <p className="text-2xl font-black">{formatMoney(order.total)}</p>
                      </div>
                      <span className={`rounded-full px-4 py-2 text-sm font-bold ${
                        order.status === "out_for_delivery" ? "bg-green-500" :
                        order.status === "ready_for_pickup" ? "bg-yellow-500" :
                        "bg-blue-500"
                      }`}>
                        {order.status === "out_for_delivery" ? "Delivering" :
                         order.status === "ready_for_pickup" ? "Ready" :
                         "Preparing"}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Pickup */}
                      <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-green-700">
                          <MapPin size={20} />
                          <span className="font-bold">Pickup Location</span>
                        </div>
                        <p className="font-semibold">Restaurant Name</p>
                        <p className="text-sm text-muted-foreground">123 Main Street, City</p>
                        <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-bold text-white transition hover:bg-green-700">
                          <Navigation size={16} />
                          Navigate
                        </button>
                      </div>

                      {/* Drop */}
                      <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-blue-700">
                          <PackageCheck size={20} />
                          <span className="font-bold">Drop Location</span>
                        </div>
                        <p className="font-semibold">Customer Name</p>
                        <p className="text-sm text-muted-foreground">456 Park Avenue, City</p>
                        <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-bold text-white transition hover:bg-blue-700">
                          <Phone size={16} />
                          Call Customer
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex gap-3">
                      {order.status === "ready_for_pickup" && (
                        <button className="flex-1 rounded-lg bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-700">
                          Mark as Picked Up
                        </button>
                      )}
                      {order.status === "out_for_delivery" && (
                        <button className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700">
                          Mark as Delivered
                        </button>
                      )}
                      <button className="rounded-lg border-2 border-red-600 bg-red-50 px-6 py-3 font-bold text-red-600 transition hover:bg-red-600 hover:text-white">
                        Report Issue
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Recent Deliveries */}
        <section>
          <h2 className="mb-4 text-2xl font-black">Recent Deliveries</h2>
          <div className="rounded-2xl border border-border bg-white p-6 shadow-lg">
            <div className="space-y-3">
              {orders.filter(o => o.status === "delivered").slice(0, 5).map((order) => (
                <div
                  key={order.id ?? order._id}
                  className="flex items-center justify-between rounded-xl border border-border bg-slate-50 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-green-100 p-3">
                      <CheckCircle className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className="font-bold">Order #{(order.id ?? order._id ?? "").slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">Delivered successfully</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatMoney(order.total)}</p>
                    <p className="text-sm text-green-600">+{formatMoney(order.total * 0.1)} earned</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
