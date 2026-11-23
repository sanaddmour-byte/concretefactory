import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Photo } from "@/components/ui/Photo";
import type { PhotoId } from "@/lib/photos";
import { getFinish, finishLabel, showCode } from "@/lib/finishes";
import { buttonClass } from "@/lib/ui";

export async function Options({ codes, locale }: { codes: string[]; locale: Locale }) {
  const finishes = codes.map(getFinish).filter((f) => !!f);
  if (!finishes.length) return null;
  const t = await getTranslations({ locale, namespace: "service" });
  const ts = await getTranslations({ locale, namespace: "services" });
  return (
    <section className="container-page py-16 md:py-24" aria-labelledby="opt-h">
      <div className="reveal flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h2 id="opt-h" className="display text-3xl md:text-5xl">{t("optionsTitle")}</h2>
          <p className="mt-3 text-lg text-n-700">{t("optionsSub")}</p>
        </div>
        <Link href="/finishes" className={buttonClass("secondary")}>{t("optionsAll")}</Link>
      </div>
      <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-4">
        {finishes.map((f) => (
          <li key={f!.code}>
            <Link href="/finishes" className="group block">
              {/* True colour: no overlay or filter on swatches */}
              <span className="relative block aspect-square overflow-hidden rounded-card bg-n-100">
                <Photo id={f!.photo as PhotoId} locale={locale} fill sizes="(min-width: 1024px) 16vw, 25vw" className="motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105" />
              </span>
              <span dir="auto" className="mt-2 block text-sm font-medium text-n-900">{finishLabel(f!, locale, ts(`${f!.family}.name`))}</span>
              {showCode(f!) && <span className="block text-xs text-n-600">{f!.code}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
