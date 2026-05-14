"use client";

import { Minus, Plus, Search } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { CartPanel, type CartLine } from "@/components/cart-panel";
import { Button } from "@/components/ui/button";
import type { Locale, MenuCategory, MenuItem, Restaurant } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

export function MenuBrowser({
  restaurant,
  categories,
  items,
  locale
}: {
  restaurant: Restaurant;
  categories: MenuCategory[];
  items: MenuItem[];
  locale: Locale;
}) {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const isAr = locale === "ar";
  const filtered = useMemo(
    () => items.filter((item) => [item.name, item.nameAr, item.description].join(" ").toLowerCase().includes(query.toLowerCase())),
    [items, query]
  );

  function itemKey(item: MenuItem) {
    return item.id ?? item._id ?? item.name;
  }

  function entityId(item: { id?: string; _id?: string }) {
    return item.id ?? item._id ?? "";
  }

  function itemQuantity(item: MenuItem) {
    const key = itemKey(item);
    return cart.find((line) => itemKey(line) === key)?.quantity ?? 0;
  }

  function add(item: MenuItem) {
    const key = itemKey(item);
    setCart((current) => {
      const existing = current.find((line) => itemKey(line) === key);
      if (existing) return current.map((line) => (itemKey(line) === key ? { ...line, quantity: line.quantity + 1 } : line));
      return [...current, { ...item, quantity: 1 }];
    });
  }

  function remove(item: MenuItem) {
    const key = itemKey(item);
    setCart((current) =>
      current
        .map((line) => (itemKey(line) === key ? { ...line, quantity: line.quantity - 1 } : line))
        .filter((line) => line.quantity > 0)
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <main className="space-y-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search menu"
            className="h-11 w-full rounded-md border border-border bg-white pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        {categories.map((category) => {
          const categoryItems = filtered.filter((item) => String(item.categoryId) === entityId(category));
          if (!categoryItems.length) return null;
          return (
            <section key={entityId(category)} className="space-y-3">
              <h2 className="text-xl font-bold">{isAr ? category.nameAr ?? category.name : category.name}</h2>
              <div className="grid gap-3">
                {categoryItems.map((item) => {
                  const quantity = itemQuantity(item);
                  return (
                  <article key={itemKey(item)} className="grid grid-cols-[96px_1fr] gap-3 rounded-lg border border-border bg-white p-3 shadow-sm sm:grid-cols-[112px_1fr_auto] sm:gap-4">
                    <div className="relative h-28 overflow-hidden rounded-md">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold">{isAr ? item.nameAr ?? item.name : item.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {isAr ? item.descriptionAr ?? item.description : item.description}
                      </p>
                      <p className="mt-3 font-bold">{formatMoney(item.price)}</p>
                    </div>
                    <div className="col-span-2 flex h-10 items-center justify-end gap-2 sm:col-span-1 sm:self-center">
                      <Button size="icon" variant="outline" onClick={() => remove(item)} disabled={quantity === 0} aria-label={`Remove ${item.name}`}>
                        <Minus size={17} />
                      </Button>
                      <span className="flex h-10 min-w-10 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-black">
                        {quantity}
                      </span>
                      <Button size="icon" onClick={() => add(item)} aria-label={`Add ${item.name}`}>
                        <Plus size={18} />
                      </Button>
                    </div>
                  </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>
      <CartPanel lines={cart} onAdd={add} onRemove={remove} restaurantId={entityId(restaurant)} />
    </div>
  );
}
