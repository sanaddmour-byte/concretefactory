import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { site } from "@/lib/site";
import { isDev } from "@/lib/placeholder";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "privacy" });
  return { title: t("title"), alternates: { canonical: `/${locale}/legal/privacy`, languages: { en: "/en/legal/privacy", ar: "/ar/legal/privacy", "x-default": "/en/legal/privacy" } } };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations({ locale: l, namespace: "privacy" });
  const sections = t.raw("sections") as { h: string; p: string }[];
  const date = new Intl.DateTimeFormat(l === "ar" ? "ar-JO-u-nu-latn" : "en-GB", { dateStyle: "long" }).format(new Date("2026-11-23"));
  return (
    <section id="hero" className="container-page pb-20 pt-12 md:pt-20">
      <h1 className="display text-4xl md:text-5xl">{t("title")}</h1>
      <p className="mt-3 text-sm text-n-600">{t("updated", { date })}</p>
      {isDev && <p className="ph-badge mt-3">{t("draftNote")}</p>}
      <div className="mt-8 max-w-[68ch] space-y-8">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="display text-2xl">{s.h}</h2>
            <p className="mt-2 text-lg text-n-700">{s.p.replaceAll("{email}", site.contact.email)}</p>
          </section>
        ))}
      </div>
    </section>
  );
}
