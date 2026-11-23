import { getTranslations } from "next-intl/server";
import testimonials from "../../../content/testimonials.json";

type Item = { quote: { en: string; ar: string }; name: string; project: { en: string; ar: string }; city: { en: string; ar: string } };

/** Real, permissioned quotes only (content/testimonials.json). Empty array means the block is not rendered. */
export async function Testimonials({ locale }: { locale: "en" | "ar" }) {
  const items = testimonials as Item[];
  if (!items.length) return null;
  const t = await getTranslations({ locale, namespace: "home.testimonials" });
  return (
    <section className="container-page py-16 md:py-24" aria-labelledby="tm-h">
      <h2 id="tm-h" className="display reveal text-3xl md:text-5xl">{t("title")}</h2>
      <ul className="mt-10 grid gap-6 md:grid-cols-3">
        {items.map((i) => (
          <li key={i.name} className="reveal rounded-card bg-n-100 p-6">
            <blockquote className="text-lg text-n-900">“{i.quote[locale]}”</blockquote>
            <p className="mt-4 text-sm text-n-600">{i.name} · {i.project[locale]} · {i.city[locale]}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
