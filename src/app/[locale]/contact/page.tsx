import type { Metadata } from "next";
import QRCode from "qrcode";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { site, whatsappUrl } from "@/lib/site";
import { Ph } from "@/components/ui/Ph";
import { buttonClass } from "@/lib/ui";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("title"), description: t("intro").slice(0, 160), alternates: { canonical: `/${locale}/contact`, languages: { en: "/en/contact", ar: "/ar/contact", "x-default": "/en/contact" } } };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations({ locale: l, namespace: "contact" });
  const c = site.contact;
  // QR generated on the server from the client's WhatsApp link (no client JavaScript), in the site's greys
  const qr = await QRCode.toString(whatsappUrl(), { type: "svg", margin: 1, width: 220, color: { dark: "#2e2e2e", light: "#ececec" } });
  const row = "border-t border-n-300 py-4";
  const lab = "text-sm text-n-600";
  const val = "mt-1 text-lg font-medium text-n-900";

  return (
    <>
      <section id="hero" className="container-page pb-6 pt-12 md:pt-20">
        <h1 className="display text-4xl md:text-6xl">{t("title")}</h1>
        <p className="mt-4 max-w-[60ch] text-lg text-n-700">{t("intro")}</p>
      </section>
      <section className="container-page grid grid-cols-1 gap-12 pb-20 pt-6 md:grid-cols-[1.4fr_1fr]">
        <dl>
          <div className={row}><dt className={lab}>{t("phone")}</dt><dd className={val}><a href={`tel:${c.phone}`} className="hover:underline"><bdi className="ltr-num">{c.phoneDisplay}</bdi></a></dd></div>
          <div className={row}><dt className={lab}>{t("whatsapp")}</dt><dd className={val}><a href={whatsappUrl()} rel="noopener" className="hover:underline">{t("whatsapp")}</a></dd></div>
          <div className={row}><dt className={lab}>{t("email")}</dt><dd className={val}><a href={`mailto:${c.email}`} className="hover:underline"><bdi className="ltr-num">{c.email}</bdi></a></dd></div>
          {site.socials.map((s) => (
            <div key={s.url} className={row}><dt className={lab}>{t("instagram")}</dt><dd className={val}><a href={s.url} rel="noopener" target="_blank" className="hover:underline"><bdi className="ltr-num">@theconcretefactoryjo</bdi></a></dd></div>
          ))}
          <Ph value={c.address}>{(x) => <div className={row}><dt className={lab}>{t("address")}</dt><dd className={val}>{x}</dd></div>}</Ph>
          <Ph value={c.hours}>{(x) => <div className={row}><dt className={lab}>{t("hours")}</dt><dd className={val}>{x}</dd></div>}</Ph>
          <Ph value={c.mapsUrl}>{(x) => <div className={row}><dd className={val}><a href={x} rel="noopener" className="text-maroon underline underline-offset-4">{t("map")}</a></dd></div>}</Ph>
          <div className={row}><p className="text-n-700">{t("serviceArea")}</p></div>
          <div className="flex flex-wrap gap-3 border-t border-n-300 pt-6">
            <Link href="/quote" className={buttonClass("primary")}>{t("quote")}</Link>
            <Link href="/visit" className={buttonClass("secondary")}>{t("visit")}</Link>
          </div>
        </dl>
        <figure className="mx-auto w-full max-w-[260px] self-start rounded-card border border-olive-200 bg-olive-100 p-5 text-center">
          <div role="img" aria-label={t("qrAlt")} className="mx-auto w-[220px] overflow-hidden rounded-control [&>svg]:block [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: qr }} />
          <figcaption className="mt-3 text-sm font-medium text-n-800">{t("qrTitle")}</figcaption>
        </figure>
      </section>
    </>
  );
}
