"use client";

import { Languages, LogOut, ShoppingBag, UserRound } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { roleHome } from "@/lib/auth-client";
import type { Locale } from "@/lib/types";
import { useAuth } from "./auth-provider";

export function AppHeader({ locale }: { locale: Locale }) {
  const nextLocale = locale === "en" ? "ar" : "en";
  const { user, logout } = useAuth();
  const home = user ? roleHome[user.role](locale) : `/${locale}/login`;
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="page-shell flex h-16 items-center justify-between gap-4">
        <Link href={home} className="flex items-center gap-2 font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShoppingBag size={19} />
          </span>
          FoodFlow
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={user ? roleHome[user.role](nextLocale) : `/${nextLocale}/login`}>
              <Languages size={16} />
              {nextLocale.toUpperCase()}
            </Link>
          </Button>
          {user ? (
            <>
              <div className="hidden text-right text-sm sm:block">
                <p className="font-bold">{user.name}</p>
                <p className="text-muted-foreground">{user.role.replace("_", " ")}</p>
              </div>
              <Button variant="secondary" size="icon" aria-label="Logout" onClick={logout}>
                <LogOut size={18} />
              </Button>
            </>
          ) : (
            <Button asChild variant="secondary">
              <Link href={`/${locale}/login`}>
                <UserRound size={18} />
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
