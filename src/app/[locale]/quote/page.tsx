import type { Metadata } from "next";
import { Suspense } from "react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { services } from "@/lib/services";
import { finishes, finishLabel } from "@/lib/finishes";
import { getPhoto, type PhotoId } from "@/lib/photos";
import { isPlaceholder } from "@/lib/placeholder";
import { site } from "@/lib/site";
import { CITIES } from "@/lib/validate";
import { QuoteWizard } from "@/components/quote/QuoteWizard";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "quote" });
  return { title: t("title"), description: t("intro"), alternates: { canonical: `/${locale}/quote`, languages: { en: "/en/quote", ar: "/ar/quote" } } };
}

export default async function QuotePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations({ locale: l, namespace: "quote" });
  const ts = await getTranslations({ locale: l, namespace: "services" });

  return (
    <>
      <section id="hero" className="container-page pb-6 pt-12 md:pt-20">
        <h1 className="display text-4xl md:text-6xl">{t("title")}</h1>
        <p className="mt-4 max-w-[60ch] text-lg text-n-700">{t("intro")}</p>
      </section>
      <section className="container-page pb-20 pt-6 md:pb-28">
        <Suspense fallback={<div className="mx-auto h-64 max-w-3xl animate-pulse rounded-card bg-n-100" aria-hidden />}>
          <QuoteWizard
            services={services.map((s) => ({ slug: s.slug, name: ts(`${s.slug}.name`), src: s.photo ? getPhoto(s.photo as PhotoId).src : null }))}
            finishes={finishes.map((f) => ({ code: f.code, label: finishLabel(f, l, ts(`${f.family}.name`)), src: getPhoto(f.photo as PhotoId).src }))}
            cities={CITIES.map((c) => ({ value: c.value, label: c[l] }))}
            whatsapp={site.contact.whatsapp}
            sla={isPlaceholder(site.contact.replySla) ? null : site.contact.replySla}
          />
        </Suspense>
      </section>
    </>
  );
}
