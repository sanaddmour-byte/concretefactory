import { getTranslations } from "next-intl/server";

export async function Steps({ steps, locale }: { steps: { title: string; text: string }[]; locale: string }) {
  if (!steps.length) return null;
  const t = await getTranslations({ locale, namespace: "service" });
  return (
    <section className="container-page py-16 md:py-24" aria-labelledby="steps-h2">
      <h2 id="steps-h2" className="display reveal text-3xl md:text-5xl">{t("processTitle")}</h2>
      <ol className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <li key={s.title} className="reveal border-t-2 border-olive-600 pt-4">
            <bdi className="display text-2xl text-maroon">{String(i + 1).padStart(2, "0")}</bdi>
            <h3 className="mt-2 text-lg font-semibold text-n-900">{s.title}</h3>
            <p className="mt-1 text-n-700">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
