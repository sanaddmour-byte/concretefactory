"use client";

import { useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "@/i18n/navigation";

/** Bottom-sheet menu built on native <dialog> (focus trap + Esc for free). */
export function MobileMenu({ openLabel, closeLabel, children }: { openLabel: string; closeLabel: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => ref.current?.close(), [pathname]);

  return (
    <>
      <button
        type="button"
        aria-label={openLabel}
        onClick={() => ref.current?.showModal()}
        className="inline-flex size-11 items-center justify-center rounded-control text-n-900 hover:bg-n-100 lg:hidden"
      >
        <Menu size={24} strokeWidth={1.5} aria-hidden />
      </button>
      <dialog
        ref={ref}
        onClick={(e) => e.target === ref.current && ref.current?.close()}
        className="m-0 mt-auto max-h-[88dvh] w-full max-w-none overflow-y-auto rounded-t-card bg-n-50 p-0 text-n-800 backdrop:bg-n-950/50"
      >
        <div className="flex items-center justify-end p-2">
          <button type="button" aria-label={closeLabel} onClick={() => ref.current?.close()} className="inline-flex size-11 items-center justify-center rounded-control hover:bg-n-100">
            <X size={24} strokeWidth={1.5} aria-hidden />
          </button>
        </div>
        <div className="px-4 pb-8">{children}</div>
      </dialog>
    </>
  );
}
