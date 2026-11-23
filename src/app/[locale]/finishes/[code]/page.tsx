import type { Metadata } from "next";
import { ViewTransition } from "react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { finishes, finishLabel, finishSlug, getFinishBySlug, showCode } from "@/lib/finishes";
import { getPhoto, type PhotoId } from "@/lib/photos";
import { getProjects } from "@/lib/projects";
import { Photo } from "@/components/ui/Photo";
import { Fact } from "@/components/ui/Ph";
import { SampleToggle } from "@/components/samples/SampleToggle";
import { FinalCta } from "@/components/home/FinalCta";
import { buttonClass } from "@/lib/ui";

type Props = { params: Promise<{ locale: string; code: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => finishes.map((f) => ({ locale, code: finishSlug(f) })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, code } = await params;
  const f = getFinishBySlug(code);
  if (!hasLocale(routing.locales, locale) || !f) return {};
  const ts = await getTranslations({ locale, namespace: "services" });
  const label = finishLabel(f, locale, ts(`${f.family}.name`));
  return { title: label, description: getPhoto(f.photo as PhotoId).alt[locale], alternates: { canonical: `/${locale}/finishes/${code}`, languages: { en: `/en/finishes/${code}`, ar: `/ar/finishes/${code}` } } };
}

export default async function FinishPage({ params }: Props) {
  const { locale, code } = await params;
  const f = getFinishBySlug(code);
  if (!hasLocale(routing.locales, locale) || !f) notFound();
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations({ locale: l, namespace: "finishes" });
  const ts = await getTranslations({ locale: l, namespace: "services" });
  const tp = await getTranslations({ locale: l, namespace: "projects" });
  const typeName = ts(`${f.family}.name`);
  const label = finishLabel(f, l, typeName);
  const pick = (n: { en: string; ar: string | null } | null) => (n ? (l === "ar" ? n.ar ?? n.en : n.en) : null);
  const more = finishes.filter((x) => x.code !== f.code && x.pattern.en === f.pattern.en && f.pattern.en !== "Terrazzo");
  const used = getProjects(l).filter((p) => p.finishes.includes(f.code));
  const query = `?samples=${f.code}`;

  return (
    <>
      <section id="hero" className="container-page pb-12 pt-6 md:pb-20">
        <nav aria-label={t("title")} className="text-sm text-n-600">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/" className="hover:underline">{(await getTranslations({ locale: l, namespace: "service" }))("home")}</Link></li>
            <li aria-hidden>/</li>
            <li><Link href="/finishes" className="hover:underline">{t("title")}</Link></li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-n-900" dir="auto">{label}</li>
          </ol>
        </nav>
        <div className="mt-8 grid grid-cols-1 items-start gap-10 md:grid-cols-2">
          <ViewTransition name={`fin-${finishSlug(f)}`} share="morph">
            <div className="relative aspect-square w-full max-w-[640px] overflow-hidden rounded-card bg-n-100">
              <Photo id={f.photo as PhotoId} locale={l} fill priority sizes="(min-width: 768px) 640px, 100vw" />
            </div>
          </ViewTransition>
          <div>
            <h1 dir="auto" className="display text-4xl md:text-5xl">{label}</h1>
            <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-n-300 pt-6">
              <Fact label={t("pattern")} value={pick(f.pattern) ?? ""} />
              {f.colour && <Fact label={t("colourLabel")} value={pick(f.colour) ?? ""} />}
              {f.material && <Fact label={t("material")} value={pick(f.material) ?? ""} />}
              <Fact label={t("typeLabel")} value={typeName} />
              {showCode(f) && <Fact label={t("code")} value={f.code} />}
              <Fact label={t("method")} value={f.method ?? "{{CONFIRM: method}}"} />
              <Fact label={t("maintenance")} value={f.maintenance ?? "{{CONFIRM: maintenance}}"} />
            </dl>
            {f.photoUse === "installed-floor" && <p className="mt-4 text-sm text-n-600">{t("installed")}</p>}
            <div className="mt-8 flex flex-wrap gap-3">
              <SampleToggle code={f.code} label={label} />
              <Link href={`/quote${query}`} className={buttonClass("secondary")}>{t("quote")}</Link>
              <Link href={`/visit${query}`} className={buttonClass("secondary")}>{t("visit")}</Link>
            </div>
          </div>
        </div>
      </section>

      {more.length > 0 && (
        <section className="bg-olive-50 py-16" aria-labelledby="more-h">
          <div className="container-page">
            <h2 id="more-h" className="display text-3xl">{t("moreTitle")}</h2>
            <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
              {more.map((x) => (
                <li key={x.code}>
                  <Link href={`/finishes/${finishSlug(x)}`} className="block">
                    <span className="relative block aspect-square overflow-hidden rounded-card bg-n-100">
                      <Photo id={x.photo as PhotoId} locale={l} fill sizes="(min-width: 1024px) 16vw, 25vw" />
                    </span>
                    <span dir="auto" className="mt-2 block text-sm font-medium text-n-900">{finishLabel(x, l, ts(`${x.family}.name`))}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {used.length > 0 && (
        <section className="container-page py-16" aria-labelledby="used-h">
          <h2 id="used-h" className="display text-3xl">{t("projectsTitle")}</h2>
          <ul className="mt-6 flex flex-wrap gap-3">
            {used.map((p) => (
              <li key={p.slug}><Link href={`/projects/${p.slug}`} className={buttonClass("secondary")}>{p.title}</Link></li>
            ))}
          </ul>
          <span className="sr-only-x">{tp("title")}</span>
        </section>
      )}
      <FinalCta locale={l} />
    </>
  );
}
