import { Bike, Clock, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Locale, Restaurant } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

export function RestaurantCard({ restaurant, locale }: { restaurant: Restaurant; locale: Locale }) {
  const isAr = locale === "ar";
  const restaurantId = restaurant.id ?? restaurant._id;
  return (
    <Link
      href={`/${locale}/restaurants/${restaurantId}`}
      className="group overflow-hidden rounded-lg border border-border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={restaurant.coverImage}
          alt={isAr ? restaurant.nameAr ?? restaurant.name : restaurant.name}
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-md bg-white px-2 py-1 text-xs font-semibold">
          {restaurant.isOpen ? "Open" : "Closed"}
        </span>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">{isAr ? restaurant.nameAr ?? restaurant.name : restaurant.name}</h3>
            <p className="line-clamp-1 text-sm text-muted-foreground">{restaurant.cuisines.join(", ")}</p>
          </div>
          <span className="flex items-center gap-1 rounded-md bg-accent px-2 py-1 text-xs font-bold text-accent-foreground">
            <Star size={13} fill="currentColor" />
            {restaurant.rating}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock size={15} />
            {restaurant.deliveryTime}
          </span>
          <span className="flex items-center gap-1">
            <Bike size={15} />
            {formatMoney(restaurant.deliveryFee)}
          </span>
          <span>Min {formatMoney(restaurant.minOrder)}</span>
        </div>
      </div>
    </Link>
  );
}
