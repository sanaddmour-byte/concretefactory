import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Photo } from "@/components/ui/Photo";
import { Ph } from "@/components/ui/Ph";
import { buttonClass } from "@/lib/ui";
import { hasData, isDev } from "@/lib/placeholder";
import industrial from "../../../content/industrial.json";

export async function IndustrialBand({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "home.industrial" });
  const showSpecs = isDev || industrial.specs.some((s) => hasData(s.value));
  return (
    <section className="on-dark py-16 md:py-24" aria-labelledby="ind-h">
      <div className="container-page grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div className="reveal">
          <p className="flex items-center gap-3 text-sm font-medium uppercase tracking-widest text-olive-dark">
            <span aria-hidden className="h-0.5 w-8 bg-yellow" />
            {t("kicker")}
          </p>
          <h2 id="ind-h" className="display mt-4 text-3xl md:text-5xl">{t("title")}</h2>
          <p className="mt-4 max-w-[52ch] text-lg text-n-300">{t("body")}</p>
          {showSpecs && (
            <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {industrial.specs.map((s) => (
                <li key={s.key} className="border-t border-n-700 pt-3">
                  <span className="block text-sm text-n-400">{t(`specs.${s.key}`)}</span>
                  <span className="text-lg font-medium text-n-50"><Ph value={s.value} /></span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/quote?service=industrial-floors" className={buttonClass("primary", "mt-8")}>{t("cta")}</Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="relative col-span-1 row-span-2 aspect-[3/4] overflow-hidden rounded-card bg-n-900">
            <Photo id="industrial-floor-power-trowel-01" locale={locale} fill sizes="(min-width: 1024px) 240px, 45vw" className="layer-slow" focal="50% 60%" />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-card bg-n-900">
            <Photo id="materials-steel-fibers-glued-01" locale={locale} fill sizes="(min-width: 1024px) 240px, 45vw" />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-card bg-n-900">
            <Photo id="materials-steel-fibers-loose-01" locale={locale} fill sizes="(min-width: 1024px) 240px, 45vw" />
          </div>
        </div>
      </div>
    </section>
  );
}
