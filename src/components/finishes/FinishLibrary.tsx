"use client";

import { useEffect, useRef, useState, startTransition, ViewTransition } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SampleToggle } from "@/components/samples/SampleToggle";
import { buttonClass, cn } from "@/lib/ui";

export type FinishItem = {
  code: string; slug: string; src: string; width: number; height: number; blur: string; alt: string; label: string;
  type: string; typeName: string; colour: string;
};

/** 2× zoom lens that follows a mouse pointer over the swatch (desktop only; the full image loads on first hover). */
function Lens({ src }: { src: string }) {
  const [pos, setPos] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [armed, setArmed] = useState(false);
  const R = 56;
  return (
    <span
      className="absolute inset-0"
      onPointerEnter={(e) => e.pointerType === "mouse" && setArmed(true)}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height });
      }}
      onPointerLeave={() => setPos(null)}
    >
      {armed && pos && (
        <span
          aria-hidden
          className="pointer-events-none absolute hidden rounded-full border-2 border-olive-600 shadow-[0_6px_16px_-6px_rgb(0_0_0/0.5)] md:block"
          style={{
            width: R * 2, height: R * 2, left: pos.x - R, top: pos.y - R,
            backgroundImage: `url(${src})`, backgroundSize: `${pos.w * 2}px ${pos.h * 2}px`,
            backgroundPosition: `${-(pos.x * 2 - R)}px ${-(pos.y * 2 - R)}px`, backgroundRepeat: "no-repeat",
          }}
        />
      )}
    </span>
  );
}

function Chips({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="me-1 text-sm font-medium text-n-700">{label}</span>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn("min-h-11 rounded-control border px-4 text-sm font-medium motion-safe:transition-colors",
            value === o.value ? "border-maroon bg-maroon text-n-50" : "border-olive-200 bg-olive-50 text-olive-700 hover:bg-olive-100")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function FinishLibrary({ items, types, colours }: { items: FinishItem[]; types: { value: string; label: string }[]; colours: { value: string; label: string }[] }) {
  const t = useTranslations("finishes");
  const all = { value: "", label: t("all") };
  const [type, setType] = useState("");
  const [colour, setColour] = useState("");
  const first = useRef(true);

  // Initial filters from the URL (?type=&colour=), kept in sync with replaceState
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setType(q.get("type") ?? ""); setColour(q.get("colour") ?? "");
  }, []);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const q = new URLSearchParams();
    if (type) q.set("type", type);
    if (colour) q.set("colour", colour);
    window.history.replaceState(null, "", `${window.location.pathname}${q.size ? `?${q}` : ""}`);
  }, [type, colour]);

  const shown = items.filter((i) => (!type || i.type === type) && (!colour || i.colour === colour));
  // startTransition lets <ViewTransition> animate the reflow
  const set = (fn: () => void) => startTransition(fn);

  return (
    <>
      <div className="flex flex-col gap-3" role="search" aria-label={t("filterLabel")}>
        <Chips label={t("type")} value={type} options={[all, ...types]} onChange={(v) => set(() => setType(v))} />
        <Chips label={t("colour")} value={colour} options={[all, ...colours]} onChange={(v) => set(() => setColour(v))} />
      </div>
      <p aria-live="polite" className="mt-6 text-sm text-n-600">{t("count", { n: shown.length })}</p>

      {shown.length === 0 ? (
        <div className="mt-6 rounded-card bg-olive-50 p-8 text-center">
          <p className="text-lg text-n-800">{t("empty")}</p>
          <button type="button" className={buttonClass("primary", "mt-4")} onClick={() => set(() => { setType(""); setColour(""); })}>{t("clear")}</button>
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 lg:gap-4">
          {shown.map((f) => (
            <li key={f.code} className="relative">
              <Link href={`/finishes/${f.slug}`} className="block">
                <ViewTransition name={`fin-${f.slug}`} share="morph">
                  <span className="relative block aspect-square overflow-hidden rounded-card bg-n-100">
                    <Image src={f.src} alt={f.alt} fill sizes="(min-width: 1024px) 20vw, 50vw" placeholder="blur" blurDataURL={f.blur} className="object-cover" />
                    <Lens src={f.src} />
                  </span>
                </ViewTransition>
                <span dir="auto" className="mt-2 block text-sm font-medium text-n-900">{f.label}</span>
                <span className="block text-xs text-n-600">{f.typeName}</span>
              </Link>
              <SampleToggle code={f.code} label={f.label} compact />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
