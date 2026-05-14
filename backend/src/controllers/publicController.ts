import type { Request, Response } from "express";
import { isDatabaseConnected } from "../config/db.js";
import { MenuCategory, MenuItem } from "../models/Menu.js";
import { Restaurant } from "../models/Restaurant.js";
import { readMockData } from "../services/mockStore.js";

export async function listRestaurants(req: Request, res: Response) {
  if (isDatabaseConnected()) {
    const query = typeof req.query.q === "string" ? req.query.q : "";
    const filter = query ? { $text: { $search: query } } : {};
    const restaurants = await Restaurant.find(filter).lean();
    return res.json({ data: restaurants, source: "database" });
  }

  const data = await readMockData<any>();
  const q = String(req.query.q ?? "").toLowerCase();
  const restaurants = q
    ? data.restaurants.filter((restaurant: any) =>
        [restaurant.name, restaurant.description, ...(restaurant.cuisines ?? [])]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
    : data.restaurants;
  return res.json({ data: restaurants, source: "mock" });
}

export async function getRestaurant(req: Request, res: Response) {
  if (isDatabaseConnected()) {
    const [restaurant, categories, items] = await Promise.all([
      Restaurant.findById(req.params.id).lean(),
      MenuCategory.find({ restaurantId: req.params.id }).sort({ sortOrder: 1 }).lean(),
      MenuItem.find({ restaurantId: req.params.id }).lean()
    ]);
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });
    return res.json({ data: { restaurant, categories, items }, source: "database" });
  }

  const data = await readMockData<any>();
  const restaurant = data.restaurants.find((item: any) => item.id === req.params.id);
  if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });
  return res.json({
    data: {
      restaurant,
      categories: data.menuCategories.filter((item: any) => item.restaurantId === req.params.id),
      items: data.menuItems.filter((item: any) => item.restaurantId === req.params.id)
    },
    source: "mock"
  });
}
