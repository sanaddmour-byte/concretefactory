import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { site } from "@/lib/site";
import { hasData, isDev } from "@/lib/placeholder";
import { Photo } from "@/components/ui/Photo";
import { buttonClass } from "@/lib/ui";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title"), description: t("intro").slice(0, 160), alternates: { canonical: `/${locale}/about`, languages: { en: "/en/about", ar: "/ar/about" } } };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations({ locale: l, namespace: "about" });
  const principles = t.raw("principles") as { t: string; d: string }[];
  const c = site.contact;
  const milestones = site.milestones;
  const showTimeline = milestones.length >= 3;
  const missing = (what: string) => isDev && <span className="ph-badge">CONFIRM: {what}</span>;

  return (
    <>
      <section id="hero" className="container-page grid grid-cols-1 items-center gap-10 pb-12 pt-12 md:grid-cols-2 md:pt-20">
        <div>
          <h1 className="display text-4xl md:text-6xl">{t("title")}</h1>
          <p className="mt-6 max-w-[56ch] text-xl text-n-800">{t("intro")}</p>
        </div>
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[600px] overflow-hidden rounded-card bg-n-200">
          <Photo id="stamped-plaza-curve-building-01" locale={l} fill priority sizes="(min-width: 768px) 600px, 100vw" className="hero-drift" />
        </div>
      </section>

      <section className="container-page py-12 md:py-16" aria-labelledby="story-h">
        <h2 id="story-h" className="display reveal text-3xl md:text-5xl">{t("storyTitle")}</h2>
        <div className="mt-6 max-w-[60ch] space-y-5 text-lg text-n-700">
          <p>{t("storyP1")}</p><p>{t("storyP2")}</p><p>{t("storyP3")}</p>
        </div>
      </section>

      <section className="bg-olive-50 py-12 md:py-16" aria-labelledby="pr-h">
        <div className="container-page">
          <h2 id="pr-h" className="display text-3xl md:text-4xl">{t("principlesTitle")}</h2>
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((p) => (
              <li key={p.t} className="reveal rounded-card border border-olive-200 bg-olive-100 p-6">
                <h3 className="display text-xl">{p.t}</h3>
                <p className="mt-2 text-n-700">{p.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {showTimeline && (
        <section className="on-dark py-16 md:py-24" aria-labelledby="ms-h">
          <div className="container-page">
            <h2 id="ms-h" className="display text-3xl md:text-5xl">{t("milestonesTitle")}</h2>
            <ol className="mt-10 space-y-8 border-s-2 border-olive-600 ps-6">
              {milestones.map((m) => (
                <li key={m.year + m.title.en}>
                  <bdi className="display ltr-num text-2xl text-yellow">{m.year}</bdi>
                  <h3 className="mt-1 text-lg font-semibold">{m.title[l]}</h3>
                  <p className="mt-1 max-w-[60ch] text-n-300">{m.text[l]}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {isDev && (
        <section className="container-page py-8">
          <p className="text-n-700">{t("qualityTitle")} {missing("how you control quality")} · {t("teamTitle")} {missing("team (optional)")} · {t("milestonesTitle")} {missing("3+ real milestones")}</p>
        </section>
      )}

      {(hasData(c.address) || hasData(c.mapsUrl)) && (
        <section className="container-page py-12" aria-labelledby="pl-h">
          <h2 id="pl-h" className="display text-3xl">{t("placesTitle")}</h2>
          {hasData(c.address) && <p className="mt-3 text-lg text-n-800">{c.address}</p>}
          {hasData(c.mapsUrl) && <a href={c.mapsUrl} rel="noopener" className="mt-2 inline-block font-medium text-maroon underline underline-offset-4">{(await getTranslations({ locale: l, namespace: "contact" }))("map")}</a>}
        </section>
      )}

      <section className="container-page pb-20 pt-8">
        <Link href="/quote" className={buttonClass("primary")}>{t("cta")}</Link>
      </section>
    </>
  );
}
