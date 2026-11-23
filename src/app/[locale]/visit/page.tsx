import type { Metadata } from "next";
import { Suspense } from "react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { finishes, finishLabel } from "@/lib/finishes";
import { Ph } from "@/components/ui/Ph";
import { site } from "@/lib/site";
import { SampleGuide } from "@/components/samples/SampleGuide";
import { VisitForm } from "@/components/quote/VisitForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "visit" });
  return { title: t("title"), description: t("intro"), alternates: { canonical: `/${locale}/visit`, languages: { en: "/en/visit", ar: "/ar/visit", "x-default": "/en/visit" } } };
}

export default async function VisitPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations({ locale: l, namespace: "visit" });
  const ts = await getTranslations({ locale: l, namespace: "services" });
  const c = site.contact;
  return (
    <>
      <section id="hero" className="container-page pb-6 pt-12 md:pt-20">
        <h1 className="display text-4xl md:text-6xl">{t("title")}</h1>
        <p className="mt-4 max-w-[60ch] text-lg text-n-700">{t("intro")}</p>
        <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-3 text-n-800">
          {[[t("address"), c.address], [t("hours"), c.hours]].map(([k, val]) => (
            <Ph key={k} value={val}>{(x) => (<div><dt className="text-sm text-n-600">{k}</dt><dd className="font-medium">{x}</dd></div>)}</Ph>
          ))}
        </dl>
      </section>
      <section className="container-page pb-20 pt-6 md:pb-28">
        <Suspense fallback={<div className="mx-auto min-h-[44rem] max-w-2xl animate-pulse rounded-card bg-n-100" aria-hidden />}>
          <VisitForm
            finishes={finishes.map((f) => ({ code: f.code, label: finishLabel(f, l, ts(`${f.family}.name`)) }))}
            whatsapp={c.whatsapp}
            closedDays={c.closedDays}
          />
        </Suspense>
      </section>
      <SampleGuide locale={l} cta={false} />
    </>
  );
}
