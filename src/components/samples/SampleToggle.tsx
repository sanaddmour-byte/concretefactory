"use client";

import { Check, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/ui";
import { buttonClass } from "@/lib/ui";
import { useSamples } from "./SamplesProvider";

/** "Add to sample request" toggle. `compact` = icon button for swatch grids. */
export function SampleToggle({ code, label, compact }: { code: string; label: string; compact?: boolean }) {
  const t = useTranslations("finishes");
  const { has, toggle } = useSamples();
  const on = has(code);
  const text = on ? t("remove") : t("add");
  if (compact) {
    return (
      <button
        type="button"
        aria-pressed={on}
        aria-label={`${text}: ${label}`}
        onClick={() => toggle(code, label)}
        className={cn("absolute end-2 top-2 inline-flex size-11 items-center justify-center rounded-full border shadow-[0_4px_10px_-4px_rgb(0_0_0/0.4)] motion-safe:transition-colors",
          on ? "border-maroon bg-maroon text-n-50" : "border-n-300 bg-n-50 text-n-900 hover:bg-n-100")}
      >
        {on ? <Check size={20} strokeWidth={2} aria-hidden className="motion-safe:animate-[pop_240ms_var(--ease-out)]" /> : <Plus size={20} strokeWidth={1.5} aria-hidden />}
      </button>
    );
  }
  return (
    <button type="button" aria-pressed={on} onClick={() => toggle(code, label)} className={buttonClass(on ? "secondary" : "primary")}>
      {on ? <Check size={18} strokeWidth={2} aria-hidden /> : <Plus size={18} strokeWidth={1.5} aria-hidden />}
      {text}
    </button>
  );
}
