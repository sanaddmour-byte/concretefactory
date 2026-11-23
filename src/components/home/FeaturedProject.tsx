import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Photo } from "@/components/ui/Photo";
import { Fact } from "@/components/ui/Ph";
import { buttonClass } from "@/lib/ui";
import featured from "../../../content/featured.json";

export async function FeaturedProject({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "home.featured" });
  const ts = await getTranslations({ locale, namespace: "services" });
  return (
    <section className="bg-olive-50 py-16 md:py-24" aria-labelledby="featured-h">
      <div className="container-page grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        {/* Layered parallax: large background image drifts slowly, the medallion inset drifts faster */}
        <div className="relative mx-auto w-full max-w-[520px] pb-16 lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-n-200 lg:w-[78%]">
            <Photo id="stamped-cobblestone-fan-driveway-01" locale={locale} fill sizes="(min-width: 1024px) 420px, 90vw" className="layer-slow" focal="50% 70%" />
          </div>
          <div className="layer-fast absolute bottom-0 end-0 w-[58%] overflow-hidden rounded-card border-4 border-olive-50 bg-n-200 shadow-[0_16px_32px_-16px_rgb(0_0_0/0.35)] lg:w-[52%]">
            <Photo id="stamped-compass-rose-medallion-01" locale={locale} sizes="(min-width: 1024px) 300px, 50vw" />
          </div>
        </div>

        <div className="reveal">
          <p className="flex items-center gap-3 text-sm font-medium uppercase tracking-widest text-olive-600">
            <span aria-hidden className="h-0.5 w-8 bg-yellow" />
            {t("kicker")}
          </p>
          <h2 id="featured-h" className="display mt-4 text-3xl md:text-5xl">{t("title")}</h2>
          <p className="mt-4 max-w-[52ch] text-lg text-n-700">{t("body")}</p>
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-n-300 pt-6">
            <Fact label={t("location")} value={featured.city} />
            <Fact label={t("service")} value={ts("stamped-concrete.name")} />
            <Fact label={t("area")} value={featured.area} />
            <Fact label={t("year")} value={featured.year} />
          </dl>
          <Link href="/projects/fan-cobblestone-driveway" className={buttonClass("secondary", "mt-8")}>
            {t("cta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
