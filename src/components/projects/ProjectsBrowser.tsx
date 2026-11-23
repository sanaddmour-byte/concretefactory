"use client";

import { useEffect, useRef, useState, startTransition, ViewTransition } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonClass, cn } from "@/lib/ui";

export type ProjectCard = {
  slug: string; title: string; city: string | null; sector: string | null; services: string[]; serviceNames: string[];
  src: string; width: number; height: number; blur: string; alt: string; focal: string;
};
type Opt = { value: string; label: string };

function Chips({ label, value, options, onChange }: { label: string; value: string; options: Opt[]; onChange: (v: string) => void }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="me-1 text-sm font-medium text-n-700">{label}</span>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}
          className={cn("label-caps min-h-11 rounded-control border px-4 text-sm motion-safe:transition-colors",
            value === o.value ? "border-maroon bg-maroon text-n-50" : "border-olive-200 bg-olive-50 text-olive-700 hover:bg-olive-100")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Filters by service, sector and city. Chips only appear when there is real data for them. */
export function ProjectsBrowser({ items, serviceOpts, sectorOpts, cityOpts }: { items: ProjectCard[]; serviceOpts: Opt[]; sectorOpts: Opt[]; cityOpts: Opt[] }) {
  const t = useTranslations("projects");
  const all: Opt = { value: "", label: t("all") };
  const [f, setF] = useState({ service: "", sector: "", city: "" });
  const first = useRef(true);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setF({ service: q.get("service") ?? "", sector: q.get("sector") ?? "", city: q.get("city") ?? "" });
  }, []);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(f)) if (v) q.set(k, v);
    window.history.replaceState(null, "", `${window.location.pathname}${q.size ? `?${q}` : ""}`);
  }, [f]);

  const shown = items.filter((p) => (!f.service || p.services.includes(f.service)) && (!f.sector || p.sector === f.sector) && (!f.city || p.city === f.city));
  const set = (k: keyof typeof f, v: string) => startTransition(() => setF((s) => ({ ...s, [k]: v })));
  const clear = () => startTransition(() => setF({ service: "", sector: "", city: "" }));

  return (
    <>
      <div className="flex flex-col gap-3" role="search" aria-label={t("filterLabel")}>
        {serviceOpts.length > 1 && <Chips label={t("service")} value={f.service} options={[all, ...serviceOpts]} onChange={(v) => set("service", v)} />}
        {sectorOpts.length > 0 && <Chips label={t("sector")} value={f.sector} options={[all, ...sectorOpts]} onChange={(v) => set("sector", v)} />}
        {cityOpts.length > 0 && <Chips label={t("city")} value={f.city} options={[all, ...cityOpts]} onChange={(v) => set("city", v)} />}
      </div>
      <p aria-live="polite" className="mt-6 text-sm text-n-600">{t("count", { n: shown.length })}</p>

      {shown.length === 0 ? (
        <div className="mt-6 rounded-card bg-olive-50 p-8 text-center">
          <p className="text-lg text-n-800">{t("empty")}</p>
          <button type="button" onClick={clear} className={buttonClass("primary", "mt-4")}>{t("clear")}</button>
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <li key={p.slug}>
              <ViewTransition name={`proj-card-${p.slug}`}>
                <Link href={`/projects/${p.slug}`} className="group block">
                  <ViewTransition name={`proj-${p.slug}`} share="morph">
                    <span className="relative block aspect-[3/2] overflow-hidden rounded-card bg-n-200">
                      <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" placeholder="blur" blurDataURL={p.blur} style={{ objectPosition: p.focal }} className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105" />
                    </span>
                  </ViewTransition>
                  <span className="mt-3 block text-xl font-semibold text-n-900">{p.title}</span>
                  <span className="mt-1 block text-sm text-n-600">{[p.city, ...p.serviceNames].filter(Boolean).join(" · ")}</span>
                </Link>
              </ViewTransition>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
