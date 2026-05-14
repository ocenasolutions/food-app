import type { Response } from "express";
import { isDatabaseConnected } from "../config/db.js";
import { Order } from "../models/Order.js";
import { Restaurant } from "../models/Restaurant.js";
import { User } from "../models/User.js";
import { readMockData } from "../services/mockStore.js";

export async function adminDashboard(_req: unknown, res: Response) {
  if (isDatabaseConnected()) {
    const [users, restaurants, orders] = await Promise.all([
      User.countDocuments(),
      Restaurant.countDocuments(),
      Order.find().lean()
    ]);
    const revenue = orders.reduce((sum, order: any) => sum + (order.total ?? 0), 0);
    return res.json({ data: { users, restaurants, orders: orders.length, revenue }, source: "database" });
  }

  const data = await readMockData<any>();
  const revenue = data.orders.reduce((sum: number, order: any) => sum + order.total, 0);
  return res.json({
    data: {
      users: data.users.length,
      restaurants: data.restaurants.length,
      orders: data.orders.length,
      revenue,
      deliveryPartners: data.deliveryPartners.length
    },
    source: "mock"
  });
}

export async function restaurantDashboard(_req: unknown, res: Response) {
  const data = await readMockData<any>();
  return res.json({
    data: {
      activeOrders: data.orders.filter((order: any) => order.status !== "delivered").length,
      menuItems: data.menuItems.length,
      rating: 4.7,
      todaySales: data.orders.reduce((sum: number, order: any) => sum + order.total, 0)
    },
    source: isDatabaseConnected() ? "database" : "mock"
  });
}
