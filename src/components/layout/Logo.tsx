import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { site } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

/**
 * Brand lockup: the supplied roundel (double ring + mixer, kept intact) beside a live wordmark.
 * The wordmark repeats the name because the text inside the roundel is too small to read at header size.
 */
export function Logo({ locale, label, tone = "light", large = false }: { locale: Locale; label: string; tone?: "light" | "dark"; large?: boolean }) {
  return (
    <Link href="/" aria-label={label} className="inline-flex min-h-11 items-center gap-2 sm:gap-3">
      <Image
        src={tone === "dark" ? "/brand/logo-roundel-light.png" : "/brand/logo-roundel.png"}
        alt=""
        width={650}
        height={650}
        priority={tone === "light"}
        className={large ? "size-20 sm:size-24" : "size-11 sm:size-14"}
      />
      <span className={`display whitespace-nowrap text-sm uppercase leading-none tracking-wide sm:text-lg ${tone === "dark" ? "text-n-50" : "text-n-900"}`}>
        {site.name[locale]}
      </span>
    </Link>
  );
}
