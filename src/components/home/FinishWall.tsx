import { ViewTransition } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Photo } from "@/components/ui/Photo";
import { getFinish, finishLabel, finishSlug } from "@/lib/finishes";
import type { PhotoId } from "@/lib/photos";
import { buttonClass } from "@/lib/ui";

const CODES = ["ST-EUF-01", "TZ-03", "ST-DNF-01", "EA-01", "TZ-04", "ST-GRD-01"];

/** Texture wall: six real swatches rise in one after another; each opens its finish page with the existing morph. True colour, no overlays. */
export async function FinishWall({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "chapters.c7" });
  const ts = await getTranslations({ locale, namespace: "services" });
  return (
    <div className="container-page pb-6 pt-2">
      <p className="reveal max-w-[52ch] text-lg text-n-700">{t("sub")}</p>
      <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6 lg:gap-4">
        {CODES.map((c, i) => {
          const f = getFinish(c)!;
          return (
            <li key={c} className="rise" style={{ "--i": i } as React.CSSProperties}>
              <Link href={`/finishes/${finishSlug(f)}`} className="group block">
                <ViewTransition name={`fin-${finishSlug(f)}`} share="morph">
                  <span className="relative block aspect-square overflow-hidden rounded-card bg-n-100">
                    <Photo id={f.photo as PhotoId} locale={locale} fill sizes="(min-width: 1024px) 16vw, 33vw" className="motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105" />
                  </span>
                </ViewTransition>
                <span dir="auto" className="mt-2 block text-sm font-medium text-n-900">{finishLabel(f, locale, ts(`${f.family}.name`))}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <Link href="/finishes" className={buttonClass("secondary", "mt-8")}>{t("cta")}</Link>
    </div>
  );
}
