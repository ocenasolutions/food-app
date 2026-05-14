"use client";

import { mockData } from "./mock";
import type { Locale, MockUser, UserRole } from "./types";

export type AuthUser = Omit<MockUser, "password"> & {
  token?: string;
  source?: "database" | "mock" | "local-mock";
};

export const SESSION_KEY = "foodflow.session";

export const roleHome: Record<UserRole, (locale: Locale) => string> = {
  customer: (locale) => `/${locale}`,
  restaurant_staff: (locale) => `/${locale}/restaurant-dashboard`,
  delivery_staff: (locale) => `/${locale}/delivery`,
  admin: (locale) => `/${locale}/admin`
};

export const demoAccounts = mockData.users.map((user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  password: user.password ?? "password123",
  role: user.role
}));

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

export function writeSession(user: AuthUser | MockUser) {
  const safeUser = { ...user } as AuthUser & { password?: string };
  delete safeUser.password;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
  return safeUser;
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function loginWithMock(email: string, password: string, role?: UserRole) {
  const user = mockData.users.find(
    (item) =>
      item.email.toLowerCase() === email.toLowerCase() &&
      (item.password ?? "password123") === password &&
      (!role || item.role === role)
  );
  if (!user) return null;
  return writeSession({
    ...user,
    token: `local-mock-token-${user.id}`,
    source: "local-mock"
  });
}

export function isAllowedPath(role: UserRole, pathname: string) {
  if (pathname.includes("/login")) return true;
  if (role === "admin") return pathname.includes("/admin");
  if (role === "restaurant_staff") return pathname.includes("/restaurant-dashboard");
  if (role === "delivery_staff") return pathname.includes("/delivery");
  return !pathname.includes("/admin") && !pathname.includes("/restaurant-dashboard") && !pathname.includes("/delivery");
}
