"use client";

import { Bike, ShieldCheck, Store, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { demoAccounts, loginWithMock, roleHome, writeSession } from "@/lib/auth-client";
import { getApiHealth, loginWithApi } from "@/lib/api";
import type { Locale, UserRole } from "@/lib/types";
import { useAuth } from "./auth-provider";

const roles: Array<{ role: UserRole; label: string; icon: typeof UserRound }> = [
  { role: "customer", label: "Customer", icon: UserRound },
  { role: "restaurant_staff", label: "Restaurant Staff", icon: Store },
  { role: "delivery_staff", label: "Delivery Staff", icon: Bike },
  { role: "admin", label: "Admin", icon: ShieldCheck }
];

export function LoginForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const { setUser } = useAuth();
  const [role, setRole] = useState<UserRole>("customer");
  const account = useMemo(() => demoAccounts.find((item) => item.role === role) ?? demoAccounts[0], [role]);
  const [email, setEmail] = useState(account.email);
  const [password, setPassword] = useState(account.password);
  const [error, setError] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  useEffect(() => {
    getApiHealth().then(setApiOnline);
  }, []);

  function selectRole(nextRole: UserRole) {
    const nextAccount = demoAccounts.find((item) => item.role === nextRole) ?? demoAccounts[0];
    setRole(nextRole);
    setEmail(nextAccount.email);
    setPassword(nextAccount.password);
    setError("");
    setSource("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSource("");

    try {
      const result = await loginWithApi({ email, password });
      const user = result.data.user;
      if (user.role !== role) {
        setError(`This account is ${user.role.replace("_", " ")}, not ${role.replace("_", " ")}.`);
        return;
      }
      const sessionUser = {
        ...user,
        phone: user.phone ?? "",
        token: result.data.token,
        source: result.source
      };
      writeSession(sessionUser);
      setUser(sessionUser);
      router.replace(roleHome[user.role](locale));
    } catch {
      const user = loginWithMock(email, password, role);
      if (!user) {
        setError("Invalid credentials. API login failed and mock fallback did not match.");
        return;
      }
      setSource("Backend unavailable. Signed in with local mock fallback.");
      setUser(user);
      router.replace(roleHome[user.role](locale));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      <main className="page-shell grid min-h-[calc(100vh-64px)] gap-8 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <section>
          <p className="text-sm font-bold uppercase tracking-wide text-primary">FoodFlow access</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight md:text-6xl">
            Sign in to the right workspace
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Each mocked account opens a different flow: customer ordering, admin operations, restaurant staff tools, or delivery staff work.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {demoAccounts.map((demo) => (
              <button
                key={demo.id}
                type="button"
                onClick={() => selectRole(demo.role)}
                className="rounded-lg border border-border bg-background p-4 text-left text-sm hover:border-primary"
              >
                <p className="font-bold">{demo.name}</p>
                <p className="text-muted-foreground">{demo.email}</p>
                <p className="mt-2 font-semibold text-primary">{demo.role.replace("_", " ")}</p>
              </button>
            ))}
          </div>
        </section>
        <form onSubmit={submit} className="rounded-lg border border-border bg-background p-5 shadow-sm">
          <h2 className="text-2xl font-black">Login</h2>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            API status:{" "}
            <span className={apiOnline ? "text-accent" : "text-primary"}>
              {apiOnline === null ? "checking" : apiOnline ? "connected" : "mock fallback"}
            </span>
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {roles.map(({ role: itemRole, label, icon: Icon }) => (
              <button
                key={itemRole}
                type="button"
                onClick={() => selectRole(itemRole)}
                className={`flex h-24 flex-col items-start justify-between rounded-lg border p-4 text-left transition ${
                  role === itemRole ? "border-primary bg-white shadow-sm" : "border-border bg-white/70 hover:bg-white"
                }`}
              >
                <Icon size={20} className={role === itemRole ? "text-primary" : "text-muted-foreground"} />
                <span className="font-bold">{label}</span>
              </button>
            ))}
          </div>
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
          {source ? <p className="mt-3 rounded-md bg-muted p-3 text-sm font-semibold">{source}</p> : null}
          <Button className="mt-5 w-full" type="submit" disabled={loading}>
            {loading ? "Checking API..." : "Enter workspace"}
          </Button>
          <p className="mt-3 text-sm text-muted-foreground">The form calls the backend first. Mock data remains as fallback.</p>
        </form>
      </main>
    </div>
  );
}
