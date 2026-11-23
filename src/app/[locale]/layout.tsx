import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, dirOf } from "@/i18n/routing";
import { oswald, plex, tajawal } from "../fonts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBar } from "@/components/layout/MobileBar";
import { whatsappUrl, site } from "@/lib/site";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = { themeColor: "#f7f6f4", width: "device-width", initialScale: 1 };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: { default: t("title"), template: `%s | ${site.name[locale]}` },
    description: t("description"),
    alternates: { languages: { en: "/en", ar: "/ar" } },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  return (
    <html lang={locale} dir={dirOf(locale)} className={`${oswald.variable} ${plex.variable} ${tajawal.variable}`}>
      <body>
        <NextIntlClientProvider>
          <a href="#main" className="sr-only-x focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-n-900 focus:px-4 focus:py-3 focus:text-n-50">
            {t("a11y.skip")}
          </a>
          <Header locale={locale} />
          <main id="main">{children}</main>
          <Footer locale={locale} />
          <MobileBar
            quote={t("nav.quote")}
            whatsapp={t("nav.whatsapp")}
            call={t("nav.call")}
            whatsappHref={whatsappUrl()}
            telHref={`tel:${site.contact.phone}`}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
