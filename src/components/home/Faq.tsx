import { getTranslations } from "next-intl/server";
import { ChevronDown } from "lucide-react";
import { Ph } from "@/components/ui/Ph";

type Item = { q: string; a: string; confirm?: string };

/** Native <details>: works without JavaScript and with the keyboard. */
export async function Faq({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "home.faq" });
  const items = t.raw("items") as Item[];
  return (
    <section className="container-page py-16 md:py-24" aria-labelledby="faq-h">
      <h2 id="faq-h" className="display reveal text-3xl md:text-5xl">{t("title")}</h2>
      <div className="mt-10 max-w-3xl divide-y divide-n-200 border-y border-n-200">
        {items.map((it) => (
          <details key={it.q} name="faq" className="group py-1">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-3 text-lg font-medium text-n-900">
              {it.q}
              <ChevronDown size={20} strokeWidth={1.5} aria-hidden className="chev shrink-0 motion-safe:transition-transform" />
            </summary>
            <p className="pb-4 text-n-700">
              {it.a}
              {it.confirm && (
                <>
                  {" "}
                  <Ph value={`{{CONFIRM: ${it.confirm}}}`} />
                </>
              )}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
