import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { services } from "@/lib/services";
import { getService } from "@/lib/content";
import { getPhoto, photosByService, type PhotoId } from "@/lib/photos";
import { Story, type StoryStage } from "@/components/ui/Story";
import { FaqList } from "@/components/ui/FaqList";
import { FinalCta } from "@/components/home/FinalCta";
import { ServiceHero } from "@/components/service/ServiceHero";
import { Applications } from "@/components/service/Applications";
import { Options } from "@/components/service/Options";
import { Gallery, type GalleryItem } from "@/components/service/Gallery";
import { SpecTable } from "@/components/service/SpecTable";
import { Steps } from "@/components/service/Steps";
import { Diptych } from "@/components/service/Diptych";
import { Callouts } from "@/components/service/Callouts";

// Photos excluded from public galleries (third-party brand visible, etc.)
const EXCLUDE = new Set(["process-stamping-fan-cobble-01"]);

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => services.map((s) => ({ locale, slug: s.slug })));
}

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale) || !services.some((s) => s.slug === slug)) return {};
  const { seo } = getService(slug, locale);
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: `/${locale}/services/${slug}`, languages: { en: `/en/services/${slug}`, ar: `/ar/services/${slug}` } },
  };
}

export default async function ServicePage({ params }: Props) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale) || !services.some((s) => s.slug === slug)) notFound();
  setRequestLocale(locale);
  const l = locale as Locale;
  const c = getService(slug, l);
  const ts = await getTranslations({ locale: l, namespace: "services" });
  const t = await getTranslations({ locale: l, namespace: "service" });
  const name = ts(`${slug}.name`);
  const dark = slug === "industrial-floors";

  const gallery: GalleryItem[] = photosByService(slug)
    .filter((p) => !EXCLUDE.has(p.id))
    .map((p) => ({ id: p.id, src: p.src, width: p.width, height: p.height, alt: p.alt[l], blur: p.blur }));

  const stages: StoryStage[] = c.story.map((s) => ({ ...s, photo: s.photo as PhotoId }));
  const hero = (
    <>
      <ServiceHero slug={slug} name={name} c={c} locale={l} />
      <Applications items={c.applications} locale={l} />
    </>
  );

  return (
    <>
      {dark ? <div className="on-dark pb-4 pt-2">{hero}</div> : hero}
      <Callouts items={c.callouts} label={t("calloutsLabel")} />
      <Options codes={c.options} locale={l} />
      {stages.length > 0 ? (
        <section className={dark ? "on-dark pt-16 md:pt-24" : "pt-16 md:pt-24"} aria-labelledby="proc-h">
          <h2 id="proc-h" className="display container-page reveal text-3xl md:text-5xl">{t("processTitle")}</h2>
          <Story stages={stages} locale={l} label={t("processTitle")} />
          {c.storyCaption && <p className={`container-page pb-4 text-sm ${dark ? "text-n-400" : "text-n-600"}`}>{c.storyCaption}</p>}
        </section>
      ) : (
        <Steps steps={c.processSteps} locale={l} />
      )}
      {slug === "stamped-concrete" && <Diptych locale={l} />}
      {gallery.length > 0 && (
        <section className="container-page py-16 md:py-24" aria-labelledby="gal-h">
          <h2 id="gal-h" className="display reveal text-3xl md:text-5xl">{t("galleryTitle")}</h2>
          <p className="mt-3 text-n-700">{t("gallerySub")}</p>
          <div className="mt-8"><Gallery items={gallery} /></div>
        </section>
      )}
      <SpecTable specs={c.specs} name={name} specSheet={c.specSheet} locale={l} />
      <FaqList id="svc-faq" title={t("faqTitle", { name })} items={c.faqs} />
      <FinalCta locale={l} />
    </>
  );
}
