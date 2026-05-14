import { CheckCircle2, ClipboardList, Pencil, Utensils } from "lucide-react";
import { getOrders, getRestaurant } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";

export default async function RestaurantDashboardPage() {
  const [{ data }, { data: orders }] = await Promise.all([getRestaurant("rst_levant"), getOrders()]);

  return (
    <main className="page-shell py-8">
      <h1 className="text-3xl font-black">Restaurant Dashboard</h1>
      <p className="text-muted-foreground">Manage profile, menu categories, item availability, orders, and sales history.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-5"><Utensils className="mb-3 text-primary" /><p className="text-sm text-muted-foreground">Menu items</p><p className="text-3xl font-black">{data.items.length}</p></div>
        <div className="rounded-lg border border-border bg-white p-5"><ClipboardList className="mb-3 text-primary" /><p className="text-sm text-muted-foreground">Active orders</p><p className="text-3xl font-black">{orders.length}</p></div>
        <div className="rounded-lg border border-border bg-white p-5"><CheckCircle2 className="mb-3 text-primary" /><p className="text-sm text-muted-foreground">Sales</p><p className="text-3xl font-black">{formatMoney(orders.reduce((sum, order) => sum + order.total, 0))}</p></div>
      </div>
      <section className="mt-6 rounded-lg border border-border bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Menu Management</h2>
          <Button><Pencil size={16} /> Add item</Button>
        </div>
        <div className="grid gap-3">
          {data.items.map((item) => (
            <div key={item.id} className="grid gap-2 rounded-md border border-border p-3 md:grid-cols-[1fr_auto_auto]">
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
