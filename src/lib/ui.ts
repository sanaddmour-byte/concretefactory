import { clsx, type ClassValue } from "clsx";

/** Class joiner. (tailwind-merge was removed: it added about 9 KB gzipped to every page. Callers avoid conflicting utilities.) */
export const cn = (...v: ClassValue[]) => clsx(...v);

type Variant = "primary" | "secondary" | "ghost";

/** One primary CTA style site-wide (brief §12). `extra` may override horizontal padding (px-*), which replaces the default. */
export function buttonClass(variant: Variant = "primary", extra?: string) {
  // Without tailwind-merge, conflicting utilities must be resolved here: an `extra` that sets padding or display replaces the default
  const padX = extra && /(^|\s)px-\d/.test(extra) ? "" : "px-5";
  const display = extra && /(^|\s)(hidden|block|flex|grid|inline-block|inline-flex)(\s|$)/.test(extra) ? "" : "inline-flex";
  return cn(
    "btn label-caps min-h-11 items-center justify-center gap-2 rounded-control",
    display,
    padX,
    "disabled:pointer-events-none disabled:opacity-50",
    variant === "primary" && "bg-maroon text-n-50 shadow-[inset_0_-2px_0_var(--yellow)] hover:bg-maroon-hover",
    variant === "secondary" && "border border-n-300 bg-transparent text-n-900 hover:bg-n-100",
    variant === "ghost" && "text-n-800 hover:bg-n-100",
    extra,
  );
}
