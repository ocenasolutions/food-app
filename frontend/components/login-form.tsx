"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { roleHome, writeSession } from "@/lib/auth-client";
import { getApiHealth, loginWithApi } from "@/lib/api";
import type { Locale } from "@/lib/types";
import { useAuth } from "./auth-provider";

export function LoginForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  useEffect(() => {
    getApiHealth().then(setApiOnline);
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await loginWithApi({ email, password });
      const user = result.data.user;
      const sessionUser = {
        ...user,
        phone: user.phone ?? "",
        token: result.data.token,
        source: result.source
      };
      writeSession(sessionUser);
      setUser(sessionUser);
      router.replace(roleHome[user.role](locale));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Backend login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-[calc(100vh-64px)] bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(12,18,22,0.88), rgba(12,18,22,0.58), rgba(255,255,255,0.08)), url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1800&q=85')"
      }}
    >
      <main className="page-shell grid min-h-[calc(100vh-64px)] gap-8 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <section className="text-white">
          <p className="text-sm font-bold uppercase tracking-wide text-white/80">FoodFlow access</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight text-white md:text-6xl">
            Sign in to the right workspace
          </h1>
        </section>
        <form onSubmit={submit} className="rounded-lg border border-white/30 bg-white/95 p-5 shadow-xl backdrop-blur">
          <h2 className="text-2xl font-black">Login</h2>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            API status:{" "}
            <span className={apiOnline ? "text-accent" : "text-primary"}>
              {apiOnline === null ? "checking" : apiOnline ? "connected" : "offline"}
            </span>
          </p>
          <label className="mt-5 block text-sm font-bold" htmlFor="email">Email</label>
          <input
            id="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 outline-none focus:ring-2 focus:ring-primary"
          />
          <label className="mt-4 block text-sm font-bold" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 outline-none focus:ring-2 focus:ring-primary"
          />
          {error ? <p className="mt-3 rounded-md bg-primary/10 p-3 text-sm font-semibold text-primary">{error}</p> : null}
          <Button className="mt-5 w-full" type="submit" disabled={loading}>
            {loading ? "Checking API..." : "Enter workspace"}
          </Button>
          <p className="mt-3 text-sm text-muted-foreground">The form signs in through the backend API.</p>
        </form>
      </main>
    </div>
  );
}
