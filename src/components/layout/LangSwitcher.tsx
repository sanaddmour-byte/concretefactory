"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function Inner({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("nav");
  const pathname = usePathname();
  const qs = useSearchParams().toString();
  const other = locale === "en" ? "ar" : "en";
  return (
    <Link
      href={`${pathname}${qs ? `?${qs}` : ""}`}
      locale={other}
      hrefLang={other}
      lang={other}
      aria-label={t("switchToLabel")}
      className={className ?? "inline-flex min-h-11 min-w-11 items-center justify-center rounded-control px-3 text-sm font-medium text-n-800 hover:bg-n-100"}
    >
      {t("switchTo")}
    </Link>
  );
}

export function LangSwitcher({ className }: { className?: string }) {
  return (
    <Suspense fallback={null}>
      <Inner className={className} />
    </Suspense>
  );
}
