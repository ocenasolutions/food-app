import { AppHeader } from "@/components/app-header";
import { AuthProvider } from "@/components/auth-provider";
import type { Locale } from "@/lib/types";

const locales: Locale[] = ["en", "ar"];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "ar" ? "ar" : "en";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body>
        <AuthProvider locale={locale}>
          <AppHeader locale={locale} />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
