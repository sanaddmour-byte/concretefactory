"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/ui";
import { afterLcp, loadGsap } from "@/lib/gsap";

type Item = { id: string; n: number; title: string; theme: string };

/** Fixed side rail (inline-end; mirrors in RTL) listing the chapters; below 768px a thin top progress bar instead. */
export function ChapterRail() {
  const t = useTranslations("story");
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState("");

  useEffect(() => {
    const list = [...document.querySelectorAll<HTMLElement>("[data-chapter]")].map((e) => ({ id: e.id, n: Number(e.dataset.n), title: e.dataset.title ?? "", theme: e.dataset.theme ?? "light" }));
    setItems(list);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) setActive((e.target as HTMLElement).id);
    }, { rootMargin: "-45% 0px -50% 0px" });
    list.forEach((c) => { const el = document.getElementById(c.id); if (el) io.observe(el); });
    // Pins shift positions once GSAP activates: re-land on the chapter named in the URL
    let off = false;
    (async () => {
      await afterLcp(); const { ScrollTrigger } = await loadGsap();
      if (off) return;
      ScrollTrigger.refresh();
      if (location.hash) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
    })();
    return () => { off = true; io.disconnect(); };
  }, []);

  const cur = items.find((i) => i.id === active);
  return (
    <>
      <div className="story-top-progress" aria-hidden />
      {items.length > 0 && (
        <nav aria-label={t("rail")} className="chapter-rail">
          <ol>
            {items.map((c) => (
              <li key={c.id}>
                <a href={`#${c.id}`} aria-current={c.id === active ? "true" : undefined} className={cn("chapter-rail-link", c.id === active && "is-active", cur?.theme === "dark" && "on-dark-rail")}>
                  <span className="chapter-rail-title">{c.title}</span>
                  <span className="chapter-rail-num tnum" aria-hidden>{String(c.n).padStart(2, "0")}</span>
                  <span className="sr-only-x">{c.n}.</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}
    </>
  );
}
