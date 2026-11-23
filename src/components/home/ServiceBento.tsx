import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { services } from "@/lib/services";
import { Photo } from "@/components/ui/Photo";
import { isDev } from "@/lib/placeholder";
import { cn } from "@/lib/ui";

const span: Record<string, string> = {
  "stamped-concrete": "col-span-2 lg:col-span-2 lg:row-span-2",
  "industrial-floors": "col-span-2 lg:col-span-2",
  walls: "lg:row-span-2",
  "fire-pits-seating": "lg:row-span-2",
  "interior-floors": "lg:col-span-2",
};
// Responsive focal points for the discovery cards (the card crop is landscape on phones, taller on desktop)
const focal: Record<string, string> = { "industrial-floors": "50% 62%", "interior-floors": "50% 72%", "stamped-concrete": "50% 55%", "fire-pits-seating": "50% 70%", walls: "50% 50%", countertops: "70% 50%" };

export async function ServiceBento({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "home.bento" });
  const ts = await getTranslations({ locale, namespace: "services" });
  return (
    <section className="container-page py-16 md:py-24" aria-labelledby="bento-h">
      <div className="reveal max-w-2xl">
        <h2 id="bento-h" className="display text-3xl md:text-5xl">{t("title")}</h2>
        <p className="mt-4 text-lg text-n-700">{t("sub")}</p>
      </div>
      <ul className="mt-10 grid grid-cols-2 auto-rows-[200px] gap-3 sm:auto-rows-[240px] lg:grid-cols-4 lg:gap-4" style={{ gridAutoFlow: "dense" }}>
        {services.map((s) => (
          <li key={s.slug} className={cn("min-w-0", span[s.slug])}>
            <Link
              href={`/services/${s.slug}`}
              className="group relative isolate flex size-full flex-col justify-end overflow-hidden rounded-card bg-n-200 p-4 sm:p-5"
            >
              {s.photo ? (
                <Photo
                  id={s.photo}
                  locale={locale}
                  fill
                  focal={focal[s.slug]}
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className="-z-10 motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
                />
              ) : (
                <div className="tex-placeholder absolute inset-0 -z-10">
                  {isDev && <span className="ph-badge absolute start-3 top-3">PHOTO NEEDED: {s.slug}</span>}
                </div>
              )}
              <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-n-950/85 via-n-950/25 to-transparent" />
              <h3 className="display text-xl leading-tight text-n-50 sm:text-2xl">{ts(`${s.slug}.name`)}</h3>
              <p className="mt-1 hidden text-sm text-n-200 sm:block">{ts(`${s.slug}.line`)}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-yellow">
                {t("view")}
                <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden className="rtl:-scale-x-100" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
