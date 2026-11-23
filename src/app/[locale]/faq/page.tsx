import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { services } from "@/lib/services";
import { getService } from "@/lib/content";
import { FaqList, type FaqItem } from "@/components/ui/FaqList";
import { FinalCta } from "@/components/home/FinalCta";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "faqPage" });
  return { title: t("title"), description: t("intro"), alternates: { canonical: `/${locale}/faq`, languages: { en: "/en/faq", ar: "/ar/faq", "x-default": "/en/faq" } } };
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations({ locale: l, namespace: "faqPage" });
  const th = await getTranslations({ locale: l, namespace: "home.faq" });
  const ts = await getTranslations({ locale: l, namespace: "services" });
  return (
    <>
      <section id="hero" className="container-page pb-4 pt-12 md:pt-20">
        <h1 className="display text-4xl md:text-6xl">{t("title")}</h1>
        <p className="mt-4 max-w-[60ch] text-lg text-n-700">{t("intro")}</p>
      </section>
      <FaqList tight id="faq-general" title={t("general")} items={th.raw("items") as FaqItem[]} />
      {services.map((s) => (
        <FaqList tight key={s.slug} id={`faq-${s.slug}`} title={t("about", { name: ts(`${s.slug}.name`) })} items={getService(s.slug, l).faqs} />
      ))}
      <FinalCta locale={l} />
    </>
  );
}
