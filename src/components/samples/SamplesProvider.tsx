"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonClass } from "@/lib/ui";

export const MAX_SAMPLES = 6;
const KEY = "cf-samples";

type Toast = { id: number; text: string; undo?: () => void };
type Ctx = { codes: string[]; has: (c: string) => boolean; toggle: (code: string, label: string) => void; clear: () => void };
const SamplesCtx = createContext<Ctx>({ codes: [], has: () => false, toggle: () => {}, clear: () => {} });
export const useSamples = () => useContext(SamplesCtx);

/** Sample list (max 6): kept in localStorage (try/catch), carried to /visit and /quote via ?samples=. */
export function SamplesProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations("samples");
  const [codes, setCodes] = useState<string[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      if (Array.isArray(raw)) setCodes(raw.filter((c) => typeof c === "string").slice(0, MAX_SAMPLES));
    } catch { /* storage unavailable: start empty */ }
  }, []);

  const save = (next: string[]) => {
    setCodes(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const show = useCallback((text: string, undo?: () => void) => {
    clearTimeout(timer.current);
    setToast({ id: Date.now(), text, undo });
    timer.current = setTimeout(() => setToast(null), 4000);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);

  const toggle = (code: string, label: string) => {
    if (codes.includes(code)) {
      save(codes.filter((c) => c !== code));
      show(t("removed", { name: label }), () => save([...codes]));
    } else if (codes.length >= MAX_SAMPLES) {
      show(t("full"));
    } else {
      const next = [...codes, code];
      save(next);
      show(t("added", { name: label }), () => save(codes));
    }
  };

  const query = codes.length ? `?samples=${codes.join(",")}` : "";
  return (
    <SamplesCtx.Provider value={{ codes, has: (c) => codes.includes(c), toggle, clear: () => save([]) }}>
      {children}

      {codes.length > 0 && (
        <aside aria-label={t("tray")} className="fixed bottom-24 end-4 z-30 flex flex-wrap items-center gap-3 rounded-card border border-olive-200 bg-olive-100 p-3 shadow-[0_12px_24px_-12px_rgb(0_0_0/0.35)] lg:bottom-4">
          <span className="flex items-center gap-2 px-1 font-medium text-n-900">
            <Check size={18} strokeWidth={1.5} aria-hidden className="text-olive-700" />
            {t("count", { n: codes.length })}
          </span>
          <Link href={`/visit${query}`} className={buttonClass("secondary", "min-h-11 px-4 text-sm")}>{t("visit")}</Link>
          <Link href={`/quote${query}`} className={buttonClass("primary", "min-h-11 px-4 text-sm")}>{t("quote")}</Link>
          <button type="button" onClick={() => save([])} className="min-h-11 px-2 text-sm text-n-700 underline underline-offset-4 hover:text-n-900">{t("clear")}</button>
        </aside>
      )}

      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-36 z-50 flex justify-center px-4 lg:bottom-24">
        {toast && (
          <div key={toast.id} className="pointer-events-auto flex items-center gap-4 rounded-control bg-n-900 px-4 py-3 text-n-50 shadow-[0_12px_24px_-12px_rgb(0_0_0/0.5)]">
            <span>{toast.text}</span>
            {toast.undo && (
              <button type="button" onClick={() => { toast.undo?.(); setToast(null); }} className="min-h-11 font-medium text-yellow underline underline-offset-4">{t("undo")}</button>
            )}
          </div>
        )}
      </div>
    </SamplesCtx.Provider>
  );
}
