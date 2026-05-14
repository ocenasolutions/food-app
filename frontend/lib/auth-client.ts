"use client";

import type { Locale, User, UserRole } from "./types";

export type AuthUser = User & {
  token?: string;
  source?: "database" | "mock";
};

export const SESSION_KEY = "foodflow.session";

export const roleHome: Record<UserRole, (locale: Locale) => string> = {
  customer: (locale) => `/${locale}`,
  restaurant_staff: (locale) => `/${locale}/restaurant-dashboard`,
  delivery_staff: (locale) => `/${locale}/delivery`,
  admin: (locale) => `/${locale}/admin`
};

export function readSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function writeSession(user: AuthUser) {
  const safeUser = { ...user };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
  return safeUser;
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function isAllowedPath(role: UserRole, pathname: string) {
  if (pathname.includes("/login")) return true;
  if (role === "admin") return pathname.includes("/admin");
  if (role === "restaurant_staff") return pathname.includes("/restaurant-dashboard");
  if (role === "delivery_staff") return pathname.includes("/delivery");
  return !pathname.includes("/admin") && !pathname.includes("/restaurant-dashboard") && !pathname.includes("/delivery");
}
