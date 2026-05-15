import type { MenuCategory, MenuItem, Order, Restaurant, UserRole } from "./types";

 const API_URL = "https://food-app-ituc.onrender.com/api";
//const API_URL= "http://localhost:4000/api"

type ApiResult<T> = { data: T; source: "database" | "mock" };

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const session = window.localStorage.getItem("foodflow.session");
    if (!session) return null;
    const parsed = JSON.parse(session);
    return parsed.token || null;
  } catch {
    return null;
  }
}

async function api<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string>)
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    next: init?.cache === "no-store" ? undefined : { revalidate: 30 }
  });

  if (!response.ok) {
    let message = `API ${response.status}`;
    try {
      const body = (await response.json()) as { error?: string };
      message = body.error ?? message;
    } catch {
      // Keep the status-only message when the backend does not return JSON.
    }
    throw new Error(message);
  }

  return response.json() as Promise<ApiResult<T>>;
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
  return api<Restaurant[]>("/restaurants");
}

export function getRestaurant(id: string) {
  return api<{ restaurant: Restaurant; categories: MenuCategory[]; items: MenuItem[] }>(
    `/restaurants/${id}`
  );
}

export function getOrders() {
  return api<Order[]>("/orders");
}

export function getAdminStats() {
  return api<{ users: number; restaurants: number; orders: number; revenue: number; deliveryPartners: number }>(
    "/dashboards/admin"
  );
}

export async function placeOrder(payload: unknown) {
  return api<Order>(
    "/orders",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );
}

export async function updateOrderStatus(id: string, status: string) {
  return api<Order>(
    `/orders/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
      cache: "no-store"
    }
  );
}
