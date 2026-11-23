import { Check } from "lucide-react";

type Callout = { title: string; text: string; items: string[] };

export function Callouts({ items, label }: { items: Callout[]; label: string }) {
  if (!items.length) return null;
  return (
    <section className="container-page py-12 md:py-16" aria-label={label}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
        {items.map((c) => (
          <div key={c.title} className="reveal rounded-card border border-olive-200 bg-olive-100 p-6 md:p-8">
            <h2 className="display text-2xl md:text-3xl">{c.title}</h2>
            <p className="mt-3 text-n-700">{c.text}</p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {c.items.map((it) => (
                <li key={it} className="flex items-start gap-2 text-n-900">
                  <Check size={18} strokeWidth={1.5} aria-hidden className="mt-1 shrink-0 text-maroon" />
                  {it}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
