import { Link } from "@/i18n/navigation";
import { site } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

/** Wordmark (no logo supplied yet): Latin in Oswald, Arabic in Tajawal ExtraBold. */
export function Logo({ locale, label, tone = "light" }: { locale: Locale; label: string; tone?: "light" | "dark" }) {
  return (
    <Link href="/" aria-label={label} className="inline-flex min-h-11 items-center gap-2">
      <span aria-hidden className={`grid size-8 place-items-center rounded-control font-display text-base font-bold bg-maroon text-yellow`}>
        C
      </span>
      <span className={`display text-lg leading-none ${tone === "dark" ? "text-n-50" : "text-n-900"}`}>
        {site.name[locale]}
      </span>
    </Link>
  );
}
