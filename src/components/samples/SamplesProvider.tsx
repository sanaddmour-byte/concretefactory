"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

// The tray and toast are loaded only once there is something to show, so they are not in every page's initial JavaScript
const SamplesUI = dynamic(() => import("./SamplesUI"), { ssr: false });

export const MAX_SAMPLES = 6;
const KEY = "cf-samples";

export type Toast = { id: number; text: string; undo?: () => void };
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

      {(codes.length > 0 || toast) && <SamplesUI codes={codes} query={query} toast={toast} onClear={() => save([])} onUndo={() => { toast?.undo?.(); setToast(null); }} />}
    </SamplesCtx.Provider>
  );
}
