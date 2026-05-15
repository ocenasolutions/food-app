"use client";

import { ClipboardList, Filter, Search, SlidersHorizontal, TrendingUp, Percent, Clock, Star, ChevronRight, Flame, Award, Zap } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { RestaurantCard } from "@/components/restaurant-card";
import { Button } from "@/components/ui/button";
import { getRestaurants } from "@/lib/api";
import type { Locale, Restaurant } from "@/lib/types";

export default function HomePage({ params }: { params: { locale: string } }) {
  const locale: Locale = params.locale === "ar" ? "ar" : "en";
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestaurants();
  }, []);

  async function loadRestaurants() {
    try {
      const { data } = await getRestaurants();
      setRestaurants(data);
    } catch (error) {
      console.error("Failed to load restaurants:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredRestaurants = restaurants.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.cuisines.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedFilter === "Rating 4.5+") return matchesSearch && r.rating >= 4.5;
    if (selectedFilter === "Under 30 min") return matchesSearch && parseInt(r.deliveryTime) <= 30;
    if (selectedFilter === "Open Now") return matchesSearch && r.isOpen;
    
    return matchesSearch;
  });

  const featuredRestaurants = restaurants.filter(r => r.rating >= 4.5).slice(0, 3);
  const topRated = restaurants.sort((a, b) => b.rating - a.rating).slice(0, 6);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="page-shell grid gap-8 py-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-bold text-green-700">
              <Zap size={16} />
              Live API Connected
            </div>
            <h1 className="mt-2 max-w-3xl text-5xl font-black leading-tight md:text-6xl">
              {locale === "ar" ? "اطلب طعامك المفضل" : "Delicious food delivered to your door"}
            </h1>
            <p className="mt-4 max-w-2xl text-xl text-muted-foreground">
              {locale === "ar"
                ? "تصفح المطاعم، أضف الوجبات للسلة، واستمتع بالتوصيل السريع"
                : "Browse restaurants, order your favorites, and track delivery in real-time"}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild className="h-12 px-8 text-lg">
                <Link href="#restaurants">
                  <Search size={20} />
                  Browse Restaurants
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 px-8 text-lg">
                <Link href={`/${locale}/orders`}>
                  <ClipboardList size={20} />
                  My Orders
                </Link>
              </Button>
            </div>
            
            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-3xl font-black text-primary">{restaurants.length}+</p>
                <p className="text-sm text-muted-foreground">Restaurants</p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-3xl font-black text-primary">4.5★</p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-3xl font-black text-primary">30min</p>
                <p className="text-sm text-muted-foreground">Delivery</p>
              </div>
            </div>
          </div>
          
          {/* Search Card */}
          <div className="rounded-2xl border-2 border-border bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold">Find Your Food</h3>
            <div className="flex items-center gap-2 rounded-xl border-2 border-border bg-slate-50 px-4 transition focus-within:border-primary">
              <Search size={20} className="text-muted-foreground" />
              <input 
                className="h-14 flex-1 bg-transparent text-lg outline-none" 
                placeholder={locale === "ar" ? "ابحث عن مطعم" : "Search restaurants or cuisines"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Rating 4.5+", "Under 30 min", "Open Now"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(selectedFilter === filter ? null : filter)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    selectedFilter === filter
                      ? "bg-primary text-white"
                      : "border border-border bg-white hover:bg-slate-50"
                  }`}
                >
                  <Filter className="inline mr-1" size={14} />
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Offers */}
      <section className="page-shell py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black">🔥 Hot Deals</h2>
            <p className="text-muted-foreground">Limited time offers you don't want to miss</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 p-6 text-white shadow-lg transition hover:scale-105">
            <Percent className="absolute -right-4 -top-4 opacity-20" size={120} />
            <div className="relative">
              <p className="text-sm font-bold uppercase">New User Offer</p>
              <p className="mt-2 text-4xl font-black">50% OFF</p>
              <p className="mt-2">On your first order</p>
              <button className="mt-4 rounded-lg bg-white px-6 py-2 font-bold text-red-500 transition hover:bg-slate-100">
                Claim Now
              </button>
            </div>
          </div>
          
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 p-6 text-white shadow-lg transition hover:scale-105">
            <Clock className="absolute -right-4 -top-4 opacity-20" size={120} />
            <div className="relative">
              <p className="text-sm font-bold uppercase">Fast Delivery</p>
              <p className="mt-2 text-4xl font-black">FREE</p>
              <p className="mt-2">On orders above ₹299</p>
              <button className="mt-4 rounded-lg bg-white px-6 py-2 font-bold text-blue-500 transition hover:bg-slate-100">
                Order Now
              </button>
            </div>
          </div>
          
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-teal-500 p-6 text-white shadow-lg transition hover:scale-105">
            <Award className="absolute -right-4 -top-4 opacity-20" size={120} />
            <div className="relative">
              <p className="text-sm font-bold uppercase">Weekend Special</p>
              <p className="mt-2 text-4xl font-black">30% OFF</p>
              <p className="mt-2">On premium restaurants</p>
              <button className="mt-4 rounded-lg bg-white px-6 py-2 font-bold text-green-500 transition hover:bg-slate-100">
                Explore
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      {featuredRestaurants.length > 0 && (
        <section className="page-shell py-12">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-3xl font-black">
                <Flame className="text-orange-500" />
                Featured Restaurants
              </h2>
              <p className="text-muted-foreground">Top-rated places loved by customers</p>
            </div>
            <Link href="#all-restaurants" className="flex items-center gap-1 font-semibold text-primary hover:underline">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featuredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id ?? restaurant._id} restaurant={restaurant} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* All Restaurants */}
      <section id="restaurants" className="page-shell py-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black">
              {locale === "ar" ? "جميع المطاعم" : "All Restaurants"}
            </h2>
            <p className="text-muted-foreground">
              {filteredRestaurants.length} restaurants {selectedFilter && `(${selectedFilter})`}
            </p>
          </div>
        </div>
        
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-xl bg-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id ?? restaurant._id} restaurant={restaurant} locale={locale} />
            ))}
          </div>
        )}
        
        {!loading && filteredRestaurants.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center">
            <Search className="mx-auto mb-4 text-muted-foreground" size={64} />
            <p className="text-xl font-bold">No restaurants found</p>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </section>
    </main>
  );
}
