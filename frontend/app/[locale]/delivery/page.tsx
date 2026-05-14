import { Bike, MapPin, PackageCheck } from "lucide-react";

export default function DeliveryPage() {
  return (
    <main className="page-shell py-8">
      <h1 className="text-3xl font-black">Delivery Partner Dashboard</h1>
      <p className="text-muted-foreground">Assigned orders, pickup address, drop address, and delivery status updates.</p>
      <section className="mt-6 rounded-lg border border-border bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-md border border-border p-4"><Bike className="mb-3 text-primary" /><p className="font-bold">Ravi Menon</p><p className="text-sm text-muted-foreground">Bike · On delivery</p></div>
          <div className="rounded-md border border-border p-4"><MapPin className="mb-3 text-primary" /><p className="font-bold">Pickup</p><p className="text-sm text-muted-foreground">Levant Table, Jumeirah Beach Road</p></div>
          <div className="rounded-md border border-border p-4"><PackageCheck className="mb-3 text-primary" /><p className="font-bold">Drop</p><p className="text-sm text-muted-foreground">Marina Promenade, Dubai</p></div>
        </div>
      </section>
    </main>
  );
}
