"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

export type GalleryItem = { id: string; src: string; width: number; height: number; alt: string; blur: string };

/** Masonry thumbnails (server-rendered markup) + keyboard- and swipe-friendly lightbox on a native <dialog>. */
export function Gallery({ items }: { items: GalleryItem[] }) {
  const t = useTranslations("service.lightbox");
  const rtl = useLocale() === "ar";
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [i, setI] = useState(0);
  const touch = useRef<number | null>(null);
  const n = items.length;

  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);
  const open = (idx: number, el: HTMLElement) => { opener.current = el; setI(idx); ref.current?.showModal(); };

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onKey = (e: KeyboardEvent) => {
      if (!d.open) return;
      if (e.key === "ArrowRight") go(rtl ? -1 : 1);
      if (e.key === "ArrowLeft") go(rtl ? 1 : -1);
    };
    const onClose = () => opener.current?.focus();
    window.addEventListener("keydown", onKey);
    d.addEventListener("close", onClose);
    return () => { window.removeEventListener("keydown", onKey); d.removeEventListener("close", onClose); };
  }, [go, rtl]);

  const cur = items[i];
  return (
    <>
      <ul className="columns-2 gap-3 md:columns-3 lg:gap-4">
        {items.map((p, idx) => (
          <li key={p.id} className="mb-3 break-inside-avoid lg:mb-4">
            <button
              type="button"
              aria-label={t("open", { n: idx + 1, total: n })}
              onClick={(e) => open(idx, e.currentTarget)}
              className="group block w-full overflow-hidden rounded-card bg-n-100"
            >
              <Image src={p.src} alt={p.alt} width={p.width} height={p.height} placeholder="blur" blurDataURL={p.blur} sizes="(min-width: 1024px) 400px, 50vw" className="h-auto w-full motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.03]" />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={ref}
        aria-label={cur?.alt}
        onClick={(e) => e.target === ref.current && ref.current?.close()}
        className="fixed inset-0 m-0 size-full max-h-none max-w-none bg-n-950/95 p-0 text-n-50 backdrop:bg-n-950"
      >
        {cur && (
          <div
            className="relative flex size-full items-center justify-center p-4 sm:p-12"
            onPointerDown={(e) => { touch.current = e.clientX; }}
            onPointerUp={(e) => {
              if (touch.current == null) return;
              const dx = e.clientX - touch.current; touch.current = null;
              if (Math.abs(dx) > 50) go(dx < 0 ? (rtl ? -1 : 1) : (rtl ? 1 : -1));
            }}
          >
            <Image key={cur.id} src={cur.src} alt={cur.alt} width={cur.width} height={cur.height} sizes="100vw" priority placeholder="blur" blurDataURL={cur.blur} className="max-h-full w-auto max-w-full select-none rounded-control object-contain" draggable={false} />
            <button type="button" onClick={() => ref.current?.close()} aria-label={t("close")} className="absolute end-3 top-3 inline-flex size-11 items-center justify-center rounded-control bg-n-900/70 hover:bg-n-800">
              <X size={24} strokeWidth={1.5} aria-hidden />
            </button>
            {n > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} aria-label={t("prev")} className="absolute start-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-control bg-n-900/70 hover:bg-n-800">
                  <ChevronLeft size={24} strokeWidth={1.5} aria-hidden className="rtl:-scale-x-100" />
                </button>
                <button type="button" onClick={() => go(1)} aria-label={t("next")} className="absolute end-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-control bg-n-900/70 hover:bg-n-800">
                  <ChevronRight size={24} strokeWidth={1.5} aria-hidden className="rtl:-scale-x-100" />
                </button>
              </>
            )}
            <p aria-live="polite" className="absolute inset-x-0 bottom-3 text-center text-sm text-n-300">{t("counter", { n: i + 1, total: n })}</p>
          </div>
        )}
      </dialog>
    </>
  );
}
