"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonClass } from "@/lib/ui";
import type { Toast } from "./SamplesProvider";

/** Sample-list tray and toast: split out of the provider so they load only when needed. */
export default function SamplesUI({ codes, query, toast, onClear, onUndo }: { codes: string[]; query: string; toast: Toast | null; onClear: () => void; onUndo: () => void }) {
  const t = useTranslations("samples");
  return (
    <>
      {codes.length > 0 && (
        <aside aria-label={t("tray")} className="fixed bottom-24 end-4 z-30 flex flex-wrap items-center gap-3 rounded-card border border-olive-200 bg-olive-100 p-3 shadow-[0_12px_24px_-12px_rgb(0_0_0/0.35)] lg:bottom-4">
          <span className="flex items-center gap-2 px-1 font-medium text-n-900">
            <Check size={18} strokeWidth={1.5} aria-hidden className="text-olive-700" />
            {t("count", { n: codes.length })}
          </span>
          <Link href={`/visit${query}`} className={buttonClass("secondary", "min-h-11 px-4 text-sm")}>{t("visit")}</Link>
          <Link href={`/quote${query}`} className={buttonClass("primary", "min-h-11 px-4 text-sm")}>{t("quote")}</Link>
          <button type="button" onClick={onClear} className="min-h-11 px-2 text-sm text-n-700 underline underline-offset-4 hover:text-n-900">{t("clear")}</button>
        </aside>
      )}

      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-36 z-50 flex justify-center px-4 lg:bottom-24">
        {toast && (
          <div key={toast.id} className="pointer-events-auto flex items-center gap-4 rounded-control bg-n-900 px-4 py-3 text-n-50 shadow-[0_12px_24px_-12px_rgb(0_0_0/0.5)]">
            <span>{toast.text}</span>
            {toast.undo && (
              <button type="button" onClick={onUndo} className="min-h-11 font-medium text-yellow underline underline-offset-4">{t("undo")}</button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
