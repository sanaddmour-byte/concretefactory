import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Photo } from "@/components/ui/Photo";
import type { PhotoId } from "@/lib/photos";
import { buttonClass } from "@/lib/ui";

// Real samples only. Names/codes arrive in Phase 4a, so swatches carry the family only (a fact), no invented names.
const swatches: { id: PhotoId; family: "stamped-concrete" | "terrazzo" | "exposed-aggregate" }[] = [
  { id: "stamped-fan-cobble-red-sealed-01", family: "stamped-concrete" },
  { id: "terrazzo-beige-black-red-01", family: "terrazzo" },
  { id: "stamped-slate-grey-01", family: "stamped-concrete" },
  { id: "exposed-aggregate-marble-mix-01", family: "exposed-aggregate" },
  { id: "terrazzo-grey-pink-large-chip-01", family: "terrazzo" },
  { id: "stamped-flagstone-pebble-blue-01", family: "stamped-concrete" },
];

export async function FinishTeaser({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "home.finishes" });
  const ts = await getTranslations({ locale, namespace: "services" });
  return (
    <section className="container-page py-16 md:py-24" aria-labelledby="fin-h">
      <div className="reveal flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h2 id="fin-h" className="display text-3xl md:text-5xl">{t("title")}</h2>
          <p className="mt-4 text-lg text-n-700">{t("sub")}</p>
        </div>
        <Link href="/finishes" className={buttonClass("secondary")}>{t("cta")}</Link>
      </div>
      <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6 lg:gap-4">
        {swatches.map((s) => (
          <li key={s.id} className="reveal">
            {/* True colour: no overlay or filter on swatches; neutral background */}
            <Link href="/finishes" className="group block">
              <span className="relative block aspect-square overflow-hidden rounded-card bg-n-100">
                <Photo id={s.id} locale={locale} fill sizes="(min-width: 1024px) 16vw, 33vw" className="motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105" />
              </span>
              <span className="mt-2 block text-sm text-n-600">{ts(`${s.family}.name`)} · {t("sample")}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
