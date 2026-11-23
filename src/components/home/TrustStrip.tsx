import { getTranslations } from "next-intl/server";
import { site } from "@/lib/site";
import { hasData } from "@/lib/placeholder";

/** Hidden unless real numbers are supplied in content/site.json (stats). Never shows invented figures. */
export async function TrustStrip({ locale }: { locale: string }) {
  const s = site.stats;
  if (!s) return null;
  const t = await getTranslations({ locale, namespace: "home.trust" });
  const items = (["years", "area", "projects"] as const).filter((k) => hasData(s[k]));
  if (!items.length) return null;
  return (
    <section aria-label="Company figures" className="border-y border-n-200 bg-n-100">
      <dl className="container-page grid grid-cols-1 gap-6 py-8 sm:grid-cols-3">
        {items.map((k) => (
          <div key={k}>
            <dd className="display text-4xl">{s[k]}</dd>
            <dt className="text-n-600">{t(k)}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
