import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { site } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

/** Brand lockup: supplied mixer mark (transparent, derived from assets/brand) + live wordmark. */
export function Logo({ locale, label, tone = "light" }: { locale: Locale; label: string; tone?: "light" | "dark" }) {
  return (
    <Link href="/" aria-label={label} className="inline-flex min-h-11 items-center gap-2">
      <Image
        src={tone === "dark" ? "/brand/logo-mark-light.png" : "/brand/logo-mark.png"}
        alt=""
        width={535}
        height={285}
        priority={tone === "light"}
        className="h-7 w-auto sm:h-8"
      />
      <span className={`display whitespace-nowrap text-sm uppercase leading-none tracking-wide sm:text-lg ${tone === "dark" ? "text-n-50" : "text-n-900"}`}>
        {site.name[locale]}
      </span>
    </Link>
  );
}
