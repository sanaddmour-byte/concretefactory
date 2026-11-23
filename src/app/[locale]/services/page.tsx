import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { ServiceBento } from "@/components/home/ServiceBento";
import { FinalCta } from "@/components/home/FinalCta";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "service.overview" });
  return { title: t("title"), description: t("intro"), alternates: { canonical: `/${locale}/services`, languages: { en: "/en/services", ar: "/ar/services" } } };
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale: locale as Locale, namespace: "service.overview" });
  return (
    <>
      <section id="hero" className="container-page pt-12 md:pt-20">
        <h1 className="display text-4xl md:text-6xl">{t("title")}</h1>
        <p className="mt-4 max-w-[60ch] text-lg text-n-700">{t("intro")}</p>
      </section>
      <ServiceBento locale={locale as Locale} />
      <FinalCta locale={locale} />
    </>
  );
}
