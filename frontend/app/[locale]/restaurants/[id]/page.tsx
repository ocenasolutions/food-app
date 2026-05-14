import { MapPin, Star } from "lucide-react";
import Image from "next/image";
import { MenuBrowser } from "@/components/menu-browser";
import { getRestaurant } from "@/lib/api";
import type { Locale } from "@/lib/types";

export default async function RestaurantPage({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: rawLocale, id } = await params;
  const locale: Locale = rawLocale === "ar" ? "ar" : "en";
  const { data, source } = await getRestaurant(id);
  const isAr = locale === "ar";

  return (
    <main>
      <section className="relative h-[360px] overflow-hidden bg-foreground text-white">
        <Image src={data.restaurant.coverImage} alt={data.restaurant.name} fill className="object-cover opacity-70" priority />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent">
          <div className="page-shell pb-8 pt-24">
            <p className="mb-2 text-sm font-semibold">{source === "mock" ? "Mock fallback active" : "Live menu"}</p>
            <h1 className="text-4xl font-black md:text-6xl">{isAr ? data.restaurant.nameAr ?? data.restaurant.name : data.restaurant.name}</h1>
            <p className="mt-3 max-w-2xl text-lg text-white/90">
              {isAr ? data.restaurant.descriptionAr ?? data.restaurant.description : data.restaurant.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
              <span className="flex items-center gap-1"><Star size={16} fill="currentColor" /> {data.restaurant.rating}</span>
              <span>{data.restaurant.deliveryTime}</span>
              <span className="flex items-center gap-1"><MapPin size={16} /> {data.restaurant.address}</span>
            </div>
          </div>
        </div>
      </section>
      <section className="page-shell py-8">
        <MenuBrowser restaurant={data.restaurant} categories={data.categories} items={data.items} locale={locale} />
      </section>
    </main>
  );
}
