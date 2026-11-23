"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { buttonClass } from "@/lib/ui";

export function CopySpec({ text }: { text: string }) {
  const t = useTranslations("service");
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={buttonClass("secondary")}
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 4000); } catch { /* clipboard blocked: no-op */ }
      }}
    >
      {done ? <Check size={18} strokeWidth={1.5} aria-hidden /> : <Copy size={18} strokeWidth={1.5} aria-hidden />}
      <span aria-live="polite">{done ? t("copied") : t("copySpec")}</span>
    </button>
  );
}
