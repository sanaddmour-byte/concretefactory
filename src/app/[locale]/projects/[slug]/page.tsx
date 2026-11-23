import type { Metadata } from "next";
import { ViewTransition } from "react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { getProject, getProjects, projectSlugs, publicClientName } from "@/lib/projects";
import { getPhoto, type PhotoId } from "@/lib/photos";
import { finishLabel, finishSlug, getFinish } from "@/lib/finishes";
import { hasData, isDev } from "@/lib/placeholder";
import { Photo } from "@/components/ui/Photo";
import { Fact, Ph } from "@/components/ui/Ph";
import { Gallery, type GalleryItem } from "@/components/service/Gallery";
import { Mdx } from "@/components/service/Mdx";
import { FinalCta } from "@/components/home/FinalCta";
import { buttonClass } from "@/lib/ui";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => projectSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale) || !projectSlugs.includes(slug)) return {};
  const { seo } = getProject(slug, locale);
  return { title: seo.title, description: seo.description, alternates: { canonical: `/${locale}/projects/${slug}`, languages: { en: `/en/projects/${slug}`, ar: `/ar/projects/${slug}` } } };
}

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale) || !projectSlugs.includes(slug)) notFound();
  setRequestLocale(locale);
  const l = locale as Locale;
  const p = getProject(slug, l);
  const t = await getTranslations({ locale: l, namespace: "projects" });
  const ts = await getTranslations({ locale: l, namespace: "services" });
  const tsv = await getTranslations({ locale: l, namespace: "service" });
  const all = getProjects(l);
  const next = all[(all.findIndex((x) => x.slug === slug) + 1) % all.length];
  const client = publicClientName(p); // only with permission

  const gallery: GalleryItem[] = p.images.map((id) => {
    const ph = getPhoto(id as PhotoId);
    return { id, src: ph.src, width: ph.width, height: ph.height, alt: ph.alt[l], blur: ph.blur };
  });
  const story = [
    { key: "challenge", text: p.challenge },
    { key: "approach", text: p.approach },
    { key: "result", text: p.result },
  ] as const;
  const showStory = isDev || story.some((s) => hasData(s.text));
  const finishes = p.finishes.map(getFinish).filter((f) => !!f);

  return (
    <>
      <section id="hero" className="container-page pb-10 pt-6">
        <nav aria-label={t("breadcrumbAll")} className="text-sm text-n-600">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/" className="hover:underline">{tsv("home")}</Link></li>
            <li aria-hidden>/</li>
            <li><Link href="/projects" className="hover:underline">{t("breadcrumbAll")}</Link></li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-n-900">{p.title}</li>
          </ol>
        </nav>
        <ViewTransition name={`proj-${slug}`} share="morph">
          <div className="relative mt-6 aspect-[4/3] w-full overflow-hidden rounded-card bg-n-200 md:aspect-[16/8]">
            <Photo id={p.heroImage as PhotoId} locale={l} fill priority focal={p.heroFocal} sizes="(min-width: 1280px) 1216px, 100vw" className="hero-drift" />
          </div>
        </ViewTransition>
        <h1 className="display mt-8 text-4xl md:text-6xl">{p.title}</h1>
        <div className="max-w-3xl"><Mdx source={p.body} /></div>
        {client && <p className="mt-3 text-n-700">{client}</p>}

        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-n-300 pt-6">
          <Fact label={t("facts.location")} value={p.city} />
          <Fact label={t("facts.services")} value={p.services.map((s) => ts(`${s}.name`)).join(", ")} />
          {p.sector && <Fact label={t("facts.sector")} value={t(`sectors.${p.sector}`)} />}
          <Fact label={t("facts.year")} value={p.year} />
          <Fact label={t("facts.area")} value={p.area} />
          <Fact label={t("facts.duration")} value={p.durationWeeks} />
        </dl>
      </section>

      {showStory && (
        <section className="bg-olive-50 py-16 md:py-24" aria-label={t("challenge")}>
          <div className="container-page grid grid-cols-1 gap-8 lg:grid-cols-3">
            {story.map((s) => (hasData(s.text) || isDev) && (
              <div key={s.key} className="reveal">
                <h2 className="display border-t-2 border-olive-600 pt-3 text-2xl">{t(s.key)}</h2>
                <p className="mt-3 text-lg text-n-700"><Ph value={s.text} /></p>
              </div>
            ))}
          </div>
        </section>
      )}

      {gallery.length > 1 && (
        <section className="container-page py-16 md:py-24" aria-labelledby="pg-h">
          <h2 id="pg-h" className="display reveal text-3xl md:text-5xl">{t("gallery")}</h2>
          <div className="mt-8"><Gallery items={gallery} /></div>
        </section>
      )}

      {finishes.length > 0 && (
        <section className="container-page pb-16" aria-labelledby="pf-h">
          <h2 id="pf-h" className="display text-3xl">{t("finishesUsed")}</h2>
          <ul className="mt-6 flex flex-wrap gap-3">
            {finishes.map((f) => (
              <li key={f!.code}><Link href={`/finishes/${finishSlug(f!)}`} className={buttonClass("secondary")}>{finishLabel(f!, l, ts(`${f!.family}.name`))}</Link></li>
            ))}
          </ul>
        </section>
      )}

      {next && next.slug !== slug && (
        <section className="container-page py-12" aria-label={t("next")}>
          <Link href={`/projects/${next.slug}`} className="group flex items-center justify-between gap-6 rounded-card border border-olive-200 bg-olive-50 p-6 hover:bg-olive-100">
            <span>
              <span className="block text-sm text-n-600">{t("next")}</span>
              <span className="display text-2xl text-n-900">{next.title}</span>
            </span>
            <span aria-hidden className="text-3xl text-maroon rtl:-scale-x-100">→</span>
          </Link>
        </section>
      )}
      <FinalCta locale={l} />
    </>
  );
}
