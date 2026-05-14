import { LoginForm } from "@/components/login-form";
import type { Locale } from "@/lib/types";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "ar" ? "ar" : "en";
  return <LoginForm locale={locale} />;
}
