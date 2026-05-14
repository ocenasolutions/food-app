import { getMockRestaurant, mockData } from "./mock";
import type { MenuCategory, MenuItem, Order, Restaurant, UserRole } from "./types";

//const API_URL = "http://localhost:4000/api";
const API_URL= "https://food-app-ituc.onrender.com";

type ApiResult<T> = { data: T; source: "database" | "mock" };

async function api<T>(path: string, init?: RequestInit, fallback?: T): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers
      },
      next: { revalidate: 30 }
    });
    if (!response.ok) throw new Error(`API ${response.status}`);
    return response.json() as Promise<ApiResult<T>>;
  } catch {
    if (fallback === undefined) throw new Error(`No fallback for ${path}`);
    return { data: fallback, source: "mock" };
  }
}

export async function loginWithApi(payload: { email: string; password: string }) {
  return api<{
    user: {
      id: string;
      name: string;
      email: string;
      phone?: string;
      role: UserRole;
      restaurantId?: string;
    };
    token: string;
  }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(payload),
      cache: "no-store"
    }
  );
}

export async function getApiHealth() {
  try {
    const response = await fetch(`${API_URL}/health`, { cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  }
}

export function getRestaurants() {
  return api<Restaurant[]>("/restaurants", undefined, mockData.restaurants);
}

export function getRestaurant(id: string) {
  const fallback = getMockRestaurant(id);
  if (!fallback.restaurant) throw new Error("Restaurant not found");
  return api<{ restaurant: Restaurant; categories: MenuCategory[]; items: MenuItem[] }>(
    `/restaurants/${id}`,
    undefined,
    fallback as { restaurant: Restaurant; categories: MenuCategory[]; items: MenuItem[] }
  );
}

export function getOrders() {
  return api<Order[]>("/orders", undefined, mockData.orders);
}

export function getAdminStats() {
  return api<{ users: number; restaurants: number; orders: number; revenue: number; deliveryPartners: number }>(
    "/dashboards/admin",
    undefined,
    {
      users: mockData.users.length,
      restaurants: mockData.restaurants.length,
      orders: mockData.orders.length,
      revenue: mockData.orders.reduce((sum, order) => sum + order.total, 0),
      deliveryPartners: mockData.deliveryPartners.length
    }
  );
}

export async function placeOrder(payload: unknown) {
  return api<Order>(
    "/orders",
    {
      method: "POST",
      body: JSON.stringify(payload)
    },
    {
      id: `local_${Date.now()}`,
      status: "placed",
      fulfillmentType: "delivery",
      paymentStatus: "pending",
      paymentMethod: "cash",
      subtotal: 0,
      deliveryFee: 0,
      tax: 0,
      total: 0,
      items: [],
      timeline: ["placed"],
      createdAt: new Date().toISOString()
    }
  );
}
