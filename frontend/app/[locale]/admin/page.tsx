import { Banknote, Bike, Store, UsersRound } from "lucide-react";
import { getAdminStats, getOrders, getRestaurants } from "@/lib/api";
import { formatMoney } from "@/lib/utils";

export default async function AdminPage() {
  const [{ data: stats }, { data: orders }, { data: restaurants }] = await Promise.all([
    getAdminStats(),
    getOrders(),
    getRestaurants()
  ]);
  const cards = [
    { label: "Users", value: stats.users, icon: UsersRound },
    { label: "Restaurants", value: stats.restaurants, icon: Store },
    { label: "Orders", value: stats.orders, icon: Banknote },
    { label: "Partners", value: stats.deliveryPartners, icon: Bike }
  ];

  return (
    <main className="page-shell py-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black">Admin Dashboard</h1>
          <p className="text-muted-foreground">Users, restaurants, payments, commissions, reports, and order operations.</p>
        </div>
        <span className="rounded-md bg-muted px-3 py-2 text-sm font-semibold">Live API</span>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border border-border bg-white p-5 shadow-sm">
            <Icon className="mb-4 text-primary" size={24} />
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-black">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Recent Orders</h2>
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id ?? order._id} className="grid gap-2 rounded-md border border-border p-3 md:grid-cols-4">
                <span className="font-semibold">{order.id ?? order._id}</span>
                <span>{order.status}</span>
                <span>{order.paymentStatus}</span>
                <span className="font-bold">{formatMoney(order.total)}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Restaurant Controls</h2>
          <div className="space-y-3">
            {restaurants.map((restaurant) => (
              <div key={restaurant.id ?? restaurant._id} className="rounded-md border border-border p-3">
                <p className="font-semibold">{restaurant.name}</p>
                <p className="text-sm text-muted-foreground">Commission ready · Payments ready · Reports ready</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
