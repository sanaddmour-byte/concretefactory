import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { getProjects } from "@/lib/projects";
import { getPhoto, type PhotoId } from "@/lib/photos";
import { hasData } from "@/lib/placeholder";
import { ProjectsBrowser, type ProjectCard } from "@/components/projects/ProjectsBrowser";
import { FinalCta } from "@/components/home/FinalCta";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "projects" });
  return { title: t("title"), description: t("intro"), alternates: { canonical: `/${locale}/projects`, languages: { en: "/en/projects", ar: "/ar/projects" } } };
}

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations({ locale: l, namespace: "projects" });
  const ts = await getTranslations({ locale: l, namespace: "services" });
  const projects = getProjects(l);

  const items: ProjectCard[] = projects.map((p) => {
    const ph = getPhoto(p.heroImage as PhotoId);
    return {
      slug: p.slug, title: p.title, city: hasData(p.city) ? p.city : null, sector: p.sector, services: p.services,
      serviceNames: p.services.map((s) => ts(`${s}.name`)),
      src: ph.src, width: ph.width, height: ph.height, blur: ph.blur, alt: ph.alt[l], focal: p.heroFocal,
    };
  });
  const uniq = <T,>(a: T[]) => [...new Set(a)];
  const serviceOpts = uniq(items.flatMap((i) => i.services)).map((v) => ({ value: v, label: ts(`${v}.name`) }));
  const sectorOpts = uniq(items.map((i) => i.sector).filter((s): s is string => !!s)).map((v) => ({ value: v, label: t(`sectors.${v}`) }));
  const cityOpts = uniq(items.map((i) => i.city).filter((c): c is string => !!c)).map((v) => ({ value: v, label: v }));

  return (
    <>
      <section id="hero" className="container-page pb-6 pt-12 md:pt-20">
        <h1 className="display text-4xl md:text-6xl">{t("title")}</h1>
        <p className="mt-4 max-w-[60ch] text-lg text-n-700">{t("intro")}</p>
      </section>
      <section className="container-page pb-16 pt-6 md:pb-24">
        <ProjectsBrowser items={items} serviceOpts={serviceOpts} sectorOpts={sectorOpts} cityOpts={cityOpts} />
      </section>
      <FinalCta locale={l} />
    </>
  );
}
