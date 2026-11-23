"use client";

import { useRef } from "react";
import { useStoryMotion } from "@/lib/gsap";

export type Spec = { key: string; label: string; value: string };

/** Spec counters. The caller passes only specs with real values (none yet, so the block is not rendered). Pure numbers count up. */
export function SpecCounters({ specs }: { specs: Spec[] }) {
  const root = useRef<HTMLUListElement>(null);
  useStoryMotion(({ gsap, reduce }) => {
    const el = root.current; if (!el || reduce) return;
    el.querySelectorAll<HTMLElement>("[data-count-to]").forEach((n) => {
      const to = Number(n.dataset.countTo); const o = { v: 0 };
      gsap.to(o, { v: to, duration: 1.4, ease: "power2.out", scrollTrigger: { trigger: n, start: "top 85%", once: true }, onUpdate: () => { n.textContent = String(Math.round(o.v)); } });
    });
  }, []);
  return (
    <ul ref={root} className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {specs.map((s) => (
        <li key={s.key} className="border-t-2 border-olive-600 pt-3">
          <p className="display tnum text-4xl md:text-5xl" {...(/^\d+$/.test(s.value) ? {} : {})}>
            {/^\d+$/.test(s.value) ? <span data-count-to={s.value}>{s.value}</span> : s.value}
          </p>
          <p className="mt-1 text-n-300">{s.label}</p>
        </li>
      ))}
    </ul>
  );
}
