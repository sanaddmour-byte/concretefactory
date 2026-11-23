import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { services } from "@/lib/services";
import { finishes, finishLabel, finishSlug, showCode } from "@/lib/finishes";
import { getService } from "@/lib/content";
import { getPhoto, type PhotoId } from "@/lib/photos";
import { isDev, isPlaceholder } from "@/lib/placeholder";
import { site, whatsappUrl } from "@/lib/site";
import { CITIES } from "@/lib/validate";
import { SampleBoxForm } from "@/components/architects/SampleBoxForm";
import { buttonClass } from "@/lib/ui";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "architects" });
  return { title: t("title"), description: t("intro").slice(0, 160), alternates: { canonical: `/${locale}/architects`, languages: { en: "/en/architects", ar: "/ar/architects", "x-default": "/en/architects" } } };
}

export default async function ArchitectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations({ locale: l, namespace: "architects" });
  const ts = await getTranslations({ locale: l, namespace: "services" });
  const c = site.contact;
  const codes = finishes.some(showCode);
  const th = "py-3 pe-4 text-start text-sm font-semibold text-n-700";

  return (
    <>
      <section id="hero" className="container-page pb-6 pt-12 md:pt-20">
        <h1 className="display text-4xl md:text-6xl">{t("title")}</h1>
        <p className="mt-4 max-w-[62ch] text-lg text-n-700">{t("intro")}</p>
      </section>

      <section className="container-page py-12 md:py-16" aria-labelledby="spec-h">
        <h2 id="spec-h" className="display text-3xl md:text-4xl">{t("specTitle")}</h2>
        <p className="mt-3 max-w-[62ch] text-n-700">{t("specIntro")}</p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse">
            <thead><tr className="border-b-2 border-olive-600"><th scope="col" className={th}>{t("colService")}</th><th scope="col" className={th}>{t("colSheet")}</th></tr></thead>
            <tbody>
              {services.map((s) => {
                const sheet = getService(s.slug, l).specSheet;
                const name = ts(`${s.slug}.name`);
                return (
                  <tr key={s.slug} className="border-b border-n-300">
                    <th scope="row" className="py-3 pe-4 text-start font-medium text-n-900"><Link href={`/services/${s.slug}`} className="hover:underline">{name}</Link></th>
                    <td className="py-3">
                      {sheet && !isPlaceholder(sheet)
                        ? <a href={sheet} download data-track="spec_download" className="font-medium text-maroon underline underline-offset-4">{t("download")}</a>
                        : <a href={`mailto:${c.email}?subject=${encodeURIComponent(t("requestSubject", { name }))}`} className="font-medium text-maroon underline underline-offset-4">{t("requestSheet")}</a>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-olive-50 py-12 md:py-16" aria-labelledby="fin-h">
        <div className="container-page">
          <h2 id="fin-h" className="display text-3xl md:text-4xl">{t("finishTitle")}</h2>
          <p className="mt-3 max-w-[62ch] text-n-700">{t("finishIntro")}</p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse">
              <thead><tr className="border-b-2 border-olive-600">
                <th scope="col" className={th}><span className="sr-only-x">{t("colSwatch")}</span></th>
                <th scope="col" className={th}>{t("colPattern")}</th><th scope="col" className={th}>{t("colColour")}</th><th scope="col" className={th}>{t("colType")}</th>
                {codes && <th scope="col" className={th}>{t("colCode")}</th>}
              </tr></thead>
              <tbody>
                {finishes.map((f) => {
                  const p = getPhoto(f.photo as PhotoId);
                  const pick = (n: { en: string; ar: string | null } | null) => (n ? (l === "ar" ? n.ar ?? n.en : n.en) : "");
                  return (
                    <tr key={f.code} className="border-b border-olive-200">
                      <td className="py-2 pe-4"><Link href={`/finishes/${finishSlug(f)}`} aria-label={finishLabel(f, l, ts(`${f.family}.name`))}><span className="relative block size-12 overflow-hidden rounded-control bg-n-200"><Image src={p.src} alt="" fill sizes="48px" className="object-cover" /></span></Link></td>
                      <td dir="auto" className="py-2 pe-4 font-medium text-n-900">{pick(f.pattern)}</td>
                      <td dir="auto" className="py-2 pe-4 text-n-800">{pick(f.colour) || pick(f.material)}</td>
                      <td className="py-2 pe-4 text-n-700">{ts(`${f.family}.name`)}</td>
                      {codes && <td className="py-2 text-n-700"><bdi className="ltr-num">{showCode(f) ? f.code : ""}</bdi></td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isDev && (
        <section className="container-page py-8"><h2 className="display text-2xl">{t("cadTitle")}</h2><p className="mt-2 text-n-700">{t("cadText")} <span className="ph-badge">CONFIRM: CAD/BIM availability</span></p></section>
      )}

      <section className="container-page py-12 md:py-16" aria-labelledby="box-h">
        <h2 id="box-h" className="display text-3xl md:text-4xl">{t("sampleTitle")}</h2>
        <p className="mt-3 mb-8 max-w-[62ch] text-n-700">{t("sampleIntro")}</p>
        <Suspense fallback={<div className="min-h-[60rem] max-w-3xl animate-pulse rounded-card bg-n-100" aria-hidden />}>
          <SampleBoxForm
            finishes={finishes.map((f) => ({ code: f.code, label: finishLabel(f, l, ts(`${f.family}.name`)), src: getPhoto(f.photo as PhotoId).src }))}
            cities={CITIES.map((x) => ({ value: x.value, label: x[l] }))}
            whatsapp={c.whatsapp}
          />
        </Suspense>
      </section>

      <section className="container-page pb-20" aria-labelledby="sup-h">
        <div className="rounded-card border border-olive-200 bg-olive-100 p-6 md:p-8">
          <h2 id="sup-h" className="display text-2xl md:text-3xl">{t("supportTitle")}</h2>
          <p className="mt-2 max-w-[62ch] text-n-800">{t("supportText")}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={`tel:${c.phone}`} className={buttonClass("secondary")}><bdi className="ltr-num">{c.phoneDisplay}</bdi></a>
            <a href={whatsappUrl()} rel="noopener" className={buttonClass("secondary")}>WhatsApp</a>
            <a href={`mailto:${c.email}`} className={buttonClass("secondary")}>{c.email}</a>
          </div>
        </div>
      </section>
    </>
  );
}
