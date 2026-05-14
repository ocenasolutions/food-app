import { ClipboardList, Filter, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { RestaurantCard } from "@/components/restaurant-card";
import { Button } from "@/components/ui/button";
import { getRestaurants } from "@/lib/api";
import type { Locale } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "ar" ? "ar" : "en";
  const { data: restaurants } = await getRestaurants();

  return (
    <main>
      <section className="border-b border-border bg-white">
        <div className="page-shell grid gap-6 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-primary">Live API</p>
            <h1 className="mt-2 max-w-3xl text-4xl font-black leading-tight md:text-5xl">
              {locale === "ar" ? "اطلب طعامك المفضل بسرعة ووضوح" : "Order premium food with live operations built in"}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              {locale === "ar"
                ? "تصفح المطاعم، أضف الوجبات للسلة، اختر التوصيل أو الاستلام، وتابع الطلب."
                : "Browse restaurants, manage carts, checkout, and track orders across customer, restaurant, delivery, and admin workflows."}
            </p>
            <div className="mt-5">
              <Button asChild variant="secondary">
                <Link href={`/${locale}/orders`}>
                  <ClipboardList size={17} />
                  My orders
                </Link>
              </Button>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="flex items-center gap-2 rounded-md border border-border bg-white px-3">
              <Search size={18} className="text-muted-foreground" />
              <input className="h-12 flex-1 outline-none" placeholder={locale === "ar" ? "ابحث عن مطعم أو وجبة" : "Search restaurants or dishes"} />
              <Button size="icon" variant="ghost" aria-label="Filters">
                <SlidersHorizontal size={18} />
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Cuisine", "Rating 4.5+", "Under 30 min", "Pickup", "AED $$"].map((filter) => (
                <Button key={filter} variant="outline" size="sm">
                  <Filter size={14} />
                  {filter}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="page-shell py-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">{locale === "ar" ? "مطاعم متاحة" : "Available Restaurants"}</h2>
            <p className="text-muted-foreground">{restaurants.length} restaurants ready for delivery or pickup</p>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id ?? restaurant._id} restaurant={restaurant} locale={locale} />
          ))}
        </div>
      </section>
    </main>
  );
}
