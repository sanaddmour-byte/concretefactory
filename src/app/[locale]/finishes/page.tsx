import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { finishes, finishLabel, finishSlug, colourFamily } from "@/lib/finishes";
import { getPhoto, type PhotoId } from "@/lib/photos";
import { FinishLibrary, type FinishItem } from "@/components/finishes/FinishLibrary";
import { FinalCta } from "@/components/home/FinalCta";
import { SampleGuide } from "@/components/samples/SampleGuide";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "finishes" });
  return { title: t("title"), description: t("intro"), alternates: { canonical: `/${locale}/finishes`, languages: { en: "/en/finishes", ar: "/ar/finishes", "x-default": "/en/finishes" } } };
}

export default async function FinishesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations({ locale: l, namespace: "finishes" });
  const ts = await getTranslations({ locale: l, namespace: "services" });

  const items: FinishItem[] = finishes.map((f) => {
    const p = getPhoto(f.photo as PhotoId);
    const typeName = ts(`${f.family}.name`);
    return { code: f.code, slug: finishSlug(f), src: p.src, width: p.width, height: p.height, blur: p.blur, alt: p.alt[l], label: finishLabel(f, l, typeName), type: f.family, typeName, colour: colourFamily(f) };
  });
  const types = (["stamped-concrete", "terrazzo", "exposed-aggregate"] as const).map((v) => ({ value: v, label: ts(`${v}.name`) }));
  const colours = (["grey", "warm", "multicolour"] as const).map((v) => ({ value: v, label: t(`colours.${v}`) }));

  return (
    <>
      <section id="hero" className="container-page pb-6 pt-12 md:pt-20">
        <h1 className="display text-4xl md:text-6xl">{t("title")}</h1>
        <p className="mt-4 max-w-[60ch] text-lg text-n-700">{t("intro")}</p>
      </section>
      <section className="container-page pb-16 pt-6 md:pb-24">
        <FinishLibrary items={items} types={types} colours={colours} />
      </section>
      <SampleGuide locale={l} />
      <FinalCta locale={l} />
    </>
  );
}
