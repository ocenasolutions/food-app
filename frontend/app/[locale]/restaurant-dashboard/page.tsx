"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ClipboardList, Pencil, Utensils } from "lucide-react";
import { getOrders, getRestaurant, getRestaurants } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";
import type { Order, Restaurant, MenuItem, MenuCategory } from "@/lib/types";

export default function RestaurantDashboardPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getRestaurants(), getOrders()])
      .then(async ([restaurantsRes, ordersRes]) => {
        const firstRestaurant = restaurantsRes.data[0];
        setRestaurant(firstRestaurant);
        setOrders(ordersRes.data);

        if (firstRestaurant) {
          const restaurantId = firstRestaurant.id ?? firstRestaurant._id;
          const { data } = await getRestaurant(restaurantId);
          setItems(data.items);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load restaurant data");
        setLoading(false);
      });
  }, []);

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
    <main className="page-shell py-8">
      <h1 className="text-3xl font-black">Restaurant Dashboard</h1>
      <p className="text-muted-foreground">Manage profile, menu categories, item availability, orders, and sales history.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-5"><Utensils className="mb-3 text-primary" /><p className="text-sm text-muted-foreground">Menu items</p><p className="text-3xl font-black">{items.length}</p></div>
        <div className="rounded-lg border border-border bg-white p-5"><ClipboardList className="mb-3 text-primary" /><p className="text-sm text-muted-foreground">Active orders</p><p className="text-3xl font-black">{orders.length}</p></div>
        <div className="rounded-lg border border-border bg-white p-5"><CheckCircle2 className="mb-3 text-primary" /><p className="text-sm text-muted-foreground">Sales</p><p className="text-3xl font-black">{formatMoney(orders.reduce((sum, order) => sum + order.total, 0))}</p></div>
      </div>
      <section className="mt-6 rounded-lg border border-border bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Menu Management</h2>
          <Button><Pencil size={16} /> Add item</Button>
        </div>
        {!restaurant ? <p className="rounded-md bg-muted p-3 text-sm">No restaurants found in the backend.</p> : null}
        <div className="grid gap-3">
          {items.map((item) => (
            <div key={item.id ?? item._id} className="grid gap-2 rounded-md border border-border p-3 md:grid-cols-[1fr_auto_auto]">
              <span className="font-semibold">{item.name}</span>
              <span>{formatMoney(item.price)}</span>
              <span className={item.isAvailable ? "font-semibold text-accent" : "font-semibold text-primary"}>
                {item.isAvailable ? "Available" : "Unavailable"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
