"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { usePathname } from "@/i18n/navigation";

/** Disclosure-style mega menu. Panel content is server-rendered and passed as children. */
export function MegaMenu({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => root.current && !root.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={root}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex min-h-11 items-center gap-1 rounded-control px-3 text-base font-medium text-n-800 hover:bg-n-100"
      >
        {label}
        <ChevronDown size={16} strokeWidth={1.5} aria-hidden className={open ? "rotate-180" : ""} />
      </button>
      <div
        id={id}
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-n-200 bg-n-50 shadow-[0_12px_24px_-16px_rgb(0_0_0/0.25)]"
      >
        <div className="container-page py-8">{children}</div>
      </div>
    </div>
  );
}
