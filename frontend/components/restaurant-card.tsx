import { Bike, Clock, Star, TrendingUp, Award } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Locale, Restaurant } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

export function RestaurantCard({ restaurant, locale }: { restaurant: Restaurant; locale: Locale }) {
  const isAr = locale === "ar";
  const restaurantId = restaurant.id ?? restaurant._id;
  const isTopRated = restaurant.rating >= 4.7;
  const isFastDelivery = parseInt(restaurant.deliveryTime) <= 25;
  
  return (
    <Link
      href={`/${locale}/restaurants/${restaurantId}`}
      className="group relative overflow-hidden rounded-2xl border-2 border-border bg-white shadow-md transition hover:-translate-y-1 hover:border-primary hover:shadow-2xl"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={restaurant.coverImage}
          alt={isAr ? restaurant.nameAr ?? restaurant.name : restaurant.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {isTopRated && (
            <span className="flex items-center gap-1 rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
              <Award size={12} />
              Top Rated
            </span>
          )}
          {isFastDelivery && (
            <span className="flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
              <TrendingUp size={12} />
              Fast
            </span>
          )}
        </div>
        
        <span className={`absolute right-3 top-3 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg ${
          restaurant.isOpen 
            ? "bg-green-500 text-white" 
            : "bg-red-500 text-white"
        }`}>
          {restaurant.isOpen ? "Open" : "Closed"}
        </span>
        
        {/* Rating Badge */}
        <div className="absolute bottom-3 right-3">
          <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-sm font-bold backdrop-blur">
            <Star size={14} fill="currentColor" className="text-yellow-500" />
            {restaurant.rating}
          </span>
        </div>
      </div>
      
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold transition group-hover:text-primary">
              {isAr ? restaurant.nameAr ?? restaurant.name : restaurant.name}
            </h3>
            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
              {restaurant.cuisines.join(" • ")}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock size={16} />
            <span className="font-semibold">{restaurant.deliveryTime}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Bike size={16} />
            <span className="font-semibold">{formatMoney(restaurant.deliveryFee)}</span>
          </div>
          <div className="font-bold text-primary">
            Min {formatMoney(restaurant.minOrder)}
          </div>
        </div>
        
        {/* Review Count */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{restaurant.reviewCount}+ reviews</span>
          <span>{"₹".repeat(restaurant.priceLevel)}</span>
        </div>
      </div>
    </Link>
  );
}
