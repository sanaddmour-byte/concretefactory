import { getTranslations } from "next-intl/server";

export async function ProcessSteps({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "home.steps" });
  const items = t.raw("items") as { t: string; d: string }[];
  return (
    <section className="container-page py-16 md:py-24" aria-labelledby="steps-h">
      <h2 id="steps-h" className="display reveal text-3xl md:text-5xl">{t("title")}</h2>
      <ol className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-6">
        {items.map((s, i) => (
          <li key={s.t} className="reveal border-t-2 border-olive-600 pt-4">
            <bdi className="display text-2xl text-maroon">{String(i + 1).padStart(2, "0")}</bdi>
            <h3 className="mt-2 text-lg font-semibold text-n-900">{s.t}</h3>
            <p className="mt-1 text-n-700">{s.d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
