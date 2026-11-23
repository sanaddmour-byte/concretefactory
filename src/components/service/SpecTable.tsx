import { getTranslations } from "next-intl/server";
import { Download } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { Ph } from "@/components/ui/Ph";
import { hasData, isDev, isPlaceholder } from "@/lib/placeholder";
import { buttonClass } from "@/lib/ui";
import { CopySpec } from "./CopySpec";

type Spec = { key: string; value: string };

/** Architect-facing block. Production shows only rows with real values and hides the block when there are none. */
export async function SpecTable({ specs, name, specSheet, locale }: { specs: Spec[]; name: string; specSheet: string | null; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "service" });
  const real = specs.filter((s) => hasData(s.value));
  if (!isDev && real.length === 0) return null;
  const rows = isDev ? specs : real;
  const text = [t("specHeading", { name }), ...real.map((s) => `${t(`spec.${s.key}`)}: ${s.value}`)].join("\n");
  return (
    <section className="bg-n-100 py-16 md:py-24" aria-labelledby="spec-h">
      <div className="container-page">
        <h2 id="spec-h" className="display reveal text-3xl md:text-5xl">{t("specsTitle")}</h2>
        <p className="mt-3 text-n-700">{t("specsSub")}</p>
        <table className="mt-8 w-full max-w-3xl border-collapse text-start">
          <caption className="sr-only-x">{t("specHeading", { name })}</caption>
          <tbody>
            {rows.map((s) => (
              <tr key={s.key} className="border-t border-n-300">
                <th scope="row" className="w-2/5 py-3 pe-4 text-start font-medium text-n-700">{t(`spec.${s.key}`)}</th>
                <td className="py-3 text-n-900"><Ph value={s.value} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-8 flex flex-wrap gap-3">
          {real.length > 0 && <CopySpec text={text} />}
          {specSheet && !isPlaceholder(specSheet) ? (
            <a href={specSheet} className={buttonClass("secondary")} download>
              <Download size={18} strokeWidth={1.5} aria-hidden /> {t("downloadSpec")}
            </a>
          ) : (
            isDev && <span className="ph-badge self-center">CONFIRM: spec sheet PDF</span>
          )}
        </div>
      </div>
    </section>
  );
}
