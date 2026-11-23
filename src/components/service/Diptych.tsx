import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Photo } from "@/components/ui/Photo";

/** "Fresh → Sealed": two photos of different slabs, captioned honestly (never presented as a before/after of one slab). */
export async function Diptych({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "service" });
  return (
    <section className="container-page overflow-x-clip py-16 md:py-24" aria-labelledby="dip-h">
      <h2 id="dip-h" className="display reveal text-3xl md:text-5xl">{t("diptychTitle")}</h2>
      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        <figure className="reveal-start">
          <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-n-100">
            <Photo id="process-stamping-mat-lift-01" locale={locale} fill sizes="(min-width: 768px) 560px, 100vw" />
          </div>
          <figcaption className="mt-2 text-sm text-n-600">{t("diptychFresh")}</figcaption>
        </figure>
        <figure className="reveal-end">
          <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-n-100">
            <Photo id="stamped-herringbone-sealed-01" locale={locale} fill sizes="(min-width: 768px) 560px, 100vw" />
          </div>
          <figcaption className="mt-2 text-sm text-n-600">{t("diptychSealed")}</figcaption>
        </figure>
      </div>
      <p className="mt-4 text-sm text-n-600">{t("diptychCaption")}</p>
    </section>
  );
}
