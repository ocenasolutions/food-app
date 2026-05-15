"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { getOrders } from "@/lib/api";
import { formatMoney } from "@/lib/utils";
import type { Order } from "@/lib/types";

const flow = ["placed", "accepted", "preparing", "ready_for_pickup", "partner_assigned", "out_for_delivery", "delivered"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOrders()
      .then(({ data }) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load orders");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="page-shell py-8">
        <h1 className="text-3xl font-black">Order Tracking</h1>
        <p className="text-muted-foreground">Loading orders...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-shell py-8">
        <h1 className="text-3xl font-black">Order Tracking</h1>
        <p className="text-red-600">Error: {error}</p>
      </main>
    );
  }

  return (
    <main className="page-shell py-8">
      <h1 className="text-3xl font-black">Order Tracking</h1>
      <p className="text-muted-foreground">Orders from the backend API.</p>
      <div className="mt-6 grid gap-4">
        {orders.map((order) => (
          <article key={order.id ?? order._id} className="rounded-lg border border-border bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">{order.id ?? order._id}</h2>
                <p className="text-muted-foreground">{order.fulfillmentType} · {order.paymentMethod} · {order.paymentStatus}</p>
              </div>
              <p className="text-xl font-black">{formatMoney(order.total)}</p>
            </div>
            <div className="mt-5 grid gap-2 md:grid-cols-7">
              {flow.map((step) => {
                const done = order.timeline.includes(step);
                return (
                  <div key={step} className={`rounded-md border p-3 text-sm ${done ? "border-accent bg-accent/10" : "border-border bg-background"}`}>
                    <CheckCircle2 size={16} className={done ? "text-accent" : "text-muted-foreground"} />
                    <p className="mt-2 font-semibold">{step.replaceAll("_", " ")}</p>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
