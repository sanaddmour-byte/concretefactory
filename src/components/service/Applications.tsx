import { getTranslations } from "next-intl/server";

export async function Applications({ items, locale }: { items: string[]; locale: string }) {
  const t = await getTranslations({ locale, namespace: "service" });
  return (
    <section className="container-page pb-4" aria-labelledby="app-h">
      <h2 id="app-h" className="display reveal text-2xl md:text-3xl">{t("whereTitle")}</h2>
      <ul className="mt-5 flex flex-wrap gap-3">
        {items.map((a) => (
          <li key={a} className="rounded-control border border-n-300 bg-n-50 px-4 py-2 text-n-800">{a}</li>
        ))}
      </ul>
    </section>
  );
}
