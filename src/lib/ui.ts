import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...v: ClassValue[]) => twMerge(clsx(v));

type Variant = "primary" | "secondary" | "ghost";

/** One primary CTA style site-wide (brief §12). */
export function buttonClass(variant: Variant = "primary", extra?: string) {
  return cn(
    "btn inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-5 text-base font-medium",
    "disabled:pointer-events-none disabled:opacity-50",
    variant === "primary" && "bg-maroon text-n-50 shadow-[inset_0_-2px_0_var(--yellow)] hover:bg-maroon-hover",
    variant === "secondary" && "border border-n-300 bg-transparent text-n-900 hover:bg-n-100",
    variant === "ghost" && "text-n-800 hover:bg-n-100",
    extra,
  );
}
