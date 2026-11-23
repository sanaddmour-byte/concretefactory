import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { hasData } from "@/lib/placeholder";
import { buttonClass } from "@/lib/ui";
import { SpecCounters } from "@/components/story/SpecCounters";
import industrial from "../../../content/industrial.json";

/** After the pinned industrial stage: the design-first message, what we offer, real spec counters (hidden until real values exist), and the CTA. */
export async function IndustrialClose({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "chapters.c6" });
  const specs = industrial.specs.filter((s) => hasData(s.value)).map((s) => ({ key: s.key, label: t(`specs.${s.key}`), value: s.value }));
  return (
    <div className="container-page grid grid-cols-1 gap-10 py-16 md:grid-cols-[1.3fr_1fr] md:py-24">
      <div className="reveal">
        <h3 className="display text-3xl md:text-5xl">{t("leadTitle")}</h3>
        <p className="mt-5 max-w-[56ch] text-lg text-n-300">{t("lead")}</p>
        <Link href="/quote?service=industrial-floors" className={buttonClass("primary", "mt-8")}>{t("cta")}</Link>
      </div>
      <dl className="reveal space-y-6 self-end">
        <div className="border-t-2 border-olive-600 pt-3"><dt className="label-caps text-olive-dark">{t("reinforcement")}</dt><dd className="mt-1 text-lg text-n-100">{t("reinforcementList")}</dd></div>
        <div className="border-t-2 border-olive-600 pt-3"><dt className="label-caps text-olive-dark">{t("finishes")}</dt><dd className="mt-1 text-lg text-n-100">{t("finishesList")}</dd></div>
      </dl>
      {specs.length > 0 && <div className="md:col-span-2"><SpecCounters specs={specs} /></div>}
    </div>
  );
}
