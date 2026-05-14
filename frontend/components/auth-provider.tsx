"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, isAllowedPath, readSession, roleHome, type AuthUser } from "@/lib/auth-client";
import type { Locale } from "@/lib/types";

interface AuthContextValue {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setUserState(readSession());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (pathname.includes("/login")) {
      if (user) router.replace(roleHome[user.role](locale));
      return;
    }
    if (!user) {
      router.replace(`/${locale}/login`);
      return;
    }
    if (!isAllowedPath(user.role, pathname)) {
      router.replace(roleHome[user.role](locale));
    }
  }, [locale, pathname, ready, router, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      setUser: setUserState,
      logout: () => {
        clearSession();
        setUserState(null);
        router.replace(`/${locale}/login`);
      }
    }),
    [locale, router, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
