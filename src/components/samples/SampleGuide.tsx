import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Photo } from "@/components/ui/Photo";
import { buttonClass } from "@/lib/ui";

/** The sample-selection process in three steps, with photos of real sample tiles. */
export async function SampleGuide({ locale, cta = true }: { locale: Locale; cta?: boolean }) {
  const t = await getTranslations({ locale, namespace: "samplesGuide" });
  const steps = t.raw("steps") as { t: string; d: string }[];
  return (
    <section className="bg-olive-50 py-16 md:py-24" aria-labelledby="sg-h">
      <div className="container-page grid grid-cols-1 items-start gap-10 lg:grid-cols-2">
        <div>
          <h2 id="sg-h" className="display reveal text-3xl md:text-5xl">{t("title")}</h2>
          <p className="mt-4 max-w-[52ch] text-lg text-n-700">{t("intro")}</p>
          <ol className="mt-8 space-y-6">
            {steps.map((s, i) => (
              <li key={s.t} className="reveal flex gap-4 border-t-2 border-olive-600 pt-4">
                <bdi className="display tnum text-2xl text-maroon">{String(i + 1).padStart(2, "0")}</bdi>
                <div><h3 className="text-lg">{s.t}</h3><p className="mt-1 text-n-700">{s.d}</p></div>
              </li>
            ))}
          </ol>
          {cta && <Link href="/visit" className={buttonClass("primary", "mt-8")}>{t("cta")}</Link>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <figure className="col-span-1 row-span-2">
            <div className="relative aspect-[3/4] overflow-hidden rounded-card bg-n-200"><Photo id="samples-terrazzo-tiles-01" locale={locale} fill sizes="(min-width: 1024px) 270px, 45vw" className="layer-slow" /></div>
            <figcaption className="mt-2 text-sm text-n-600">{t("cap1")}</figcaption>
          </figure>
          <figure className="col-span-1 row-span-2 self-end">
            <div className="relative aspect-[3/4] overflow-hidden rounded-card bg-n-200"><Photo id="samples-colour-range-01" locale={locale} fill sizes="(min-width: 1024px) 270px, 45vw" focal="40% 50%" /></div>
            <figcaption className="mt-2 text-sm text-n-600">{t("cap2")}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
