import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { families, servicesByFamily } from "@/lib/services";
import { site, whatsappUrl } from "@/lib/site";
import { Ph } from "@/components/ui/Ph";
import { Logo } from "./Logo";
import { LangSwitcher } from "./LangSwitcher";

const head = "mb-3 text-sm font-semibold uppercase tracking-wide text-olive-dark";
const link = "inline-flex min-h-11 items-center text-n-200 hover:text-n-50";

export async function Footer({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale });
  const c = site.contact;
  return (
    <footer className="on-dark mt-24 border-t-4 border-olive-600 pb-24 pt-16 lg:pb-16">
      <div className="container-page grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_2fr_1.2fr]">
        <div>
          <Logo locale={locale} label={t("a11y.home")} tone="dark" large />
          <p className="mt-4 max-w-xs text-n-300">{site.tagline[locale]}</p>
          <p className="mt-2 text-sm text-n-400">{t("footer.area")}</p>
          <div className="mt-4">
            <LangSwitcher className="inline-flex min-h-11 items-center rounded-control border border-n-700 px-4 text-sm font-medium text-n-100 hover:bg-n-800" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {families.map((f) => (
            <div key={f}>
              <p className={head}>{t(`families.${f}`)}</p>
              <ul>
                {servicesByFamily(f).map((s) => (
                  <li key={s.slug}><Link href={`/services/${s.slug}`} className={link}>{t(`services.${s.slug}.name`)}</Link></li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className={head}>{t("footer.company")}</p>
            <ul>
              {(["projects", "finishes", "architects", "about"] as const).map((k) => (
                <li key={k}><Link href={k === "finishes" ? "/finishes" : `/${k}`} className={link}>{t(`nav.${k}`)}</Link></li>
              ))}
              <li><Link href="/faq" className={link}>{t("footer.faq")}</Link></li>
            </ul>
          </div>
        </div>

        <div>
          <p className={head}>{t("footer.contact")}</p>
          <ul className="space-y-1 text-n-200">
            <li><a href={`tel:${c.phone}`} className={link}><bdi className="ltr-num">{c.phoneDisplay}</bdi></a></li>
            <li><a href={whatsappUrl()} rel="noopener" className={link}>{t("nav.whatsapp")}</a></li>
            <li><Ph value={c.email}>{(v) => <a href={`mailto:${v}`} className={link}>{v}</a>}</Ph></li>
            <li><Ph value={c.address}>{(v) => <span className="block py-1">{v}</span>}</Ph></li>
            <li><Ph value={c.hours}>{(v) => <span className="block py-1">{t("footer.hours")}: {v}</span>}</Ph></li>
            <li><Ph value={c.mapsUrl}>{(v) => <a href={v} rel="noopener" className={link}>{t("footer.map")}</a>}</Ph></li>
          </ul>
          <Link href="/visit" className={`${link} mt-2 text-maroon-dark hover:text-maroon-dark-hover`}>{t("footer.visit")}</Link>
        </div>
      </div>

      <div className="container-page mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-n-800 pt-6 text-sm text-n-400">
        <p>© {new Date().getFullYear()} {site.name[locale]}. {t("footer.rights")}</p>
        <Link href="/legal/privacy" className="inline-flex min-h-11 items-center hover:text-n-50">{t("footer.privacy")}</Link>
      </div>
    </footer>
  );
}
