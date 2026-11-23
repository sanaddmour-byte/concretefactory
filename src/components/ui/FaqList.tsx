import { ChevronDown } from "lucide-react";
import { Ph } from "@/components/ui/Ph";

export type FaqItem = { q: string; a: string; confirm?: string };

/** Native <details>: works without JavaScript and with the keyboard. */
export function FaqList({ items, title, id }: { items: FaqItem[]; title: string; id: string }) {
  return (
    <section className="container-page py-16 md:py-24" aria-labelledby={id}>
      <h2 id={id} className="display reveal text-3xl md:text-5xl">{title}</h2>
      <div className="mt-10 max-w-3xl divide-y divide-n-200 border-y border-n-200">
        {items.map((it) => (
          <details key={it.q} name={id} className="group py-1">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-3 text-lg font-medium text-n-900">
              {it.q}
              <ChevronDown size={20} strokeWidth={1.5} aria-hidden className="chev shrink-0 text-olive-600 motion-safe:transition-transform" />
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
