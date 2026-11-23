"use client";

import { useRef } from "react";
import Image from "next/image";
import { useStoryMotion } from "@/lib/gsap";
import { LineReveal } from "./LineReveal";
import type { ResolvedImage } from "./types";

export type PatternItem = { id: string; chip: string; caption: string; media: ResolvedImage; rotate?: number };

/**
 * Chapter 3. (a) the first photo is revealed by a clip-path opening from a centre slit; (b) the large frame then
 * cycles through each pattern while the matching chip lights up; a medallion may rotate by a fixed small angle.
 * Photos are framed (never stretched past their native size). Stacked and fully captioned without motion.
 */
export function PatternsStage({ title, intro, items, label }: { title: string; intro: { caption: string; media: ResolvedImage }; items: PatternItem[]; label: string }) {
  const root = useRef<HTMLDivElement>(null);
  const all = [{ id: "intro", chip: "", caption: intro.caption, media: intro.media } as PatternItem, ...items];

  useStoryMotion(({ gsap, desktop, reduce }) => {
    const el = root.current;
    if (!el || reduce) return;
    const figs = gsap.utils.toArray<HTMLElement>(".pat-fig", el);
    const chips = gsap.utils.toArray<HTMLElement>(".pat-chip", el);
    const n = figs.length;
    el.classList.add("is-pinned");
    figs.forEach((f, i) => { f.style.zIndex = String(i + 1); });
    gsap.set(figs.slice(1), { autoAlpha: 0 });
    gsap.set(figs[0], { clipPath: "inset(0% 49.5% 0% 49.5%)" }); // centre slit

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: el, start: "top top", end: `+=${desktop ? 350 : 150}%`, pin: true, scrub: 0.4, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: (self) => {
          const t = self.progress * n; // 0..n
          const idx = Math.min(chips.length - 1, Math.max(-1, Math.floor(t - 1)));
          chips.forEach((c, i) => c.classList.toggle("is-on", i === idx));
        },
      },
    });
    tl.to(figs[0], { clipPath: "inset(0% 0% 0% 0%)", duration: 1 }, 0);
    for (let i = 1; i < n; i++) {
      tl.to(figs[i], { autoAlpha: 1, duration: 0.3 }, i);
      tl.to(figs[i - 1], { autoAlpha: 0, duration: 0.3 }, i);
      const rot = items[i - 1]?.rotate;
      if (rot) tl.fromTo(figs[i].querySelector(".pat-rot"), { rotate: 0 }, { rotate: rot, duration: 1 }, i); // rotates only a few degrees
    }
    tl.to({}, { duration: 0 }, n);
    return () => { el.classList.remove("is-pinned"); gsap.set([...figs, ...figs.map((f) => f.querySelector(".pat-rot"))].filter(Boolean) as HTMLElement[], { clearProps: "all" }); chips.forEach((c) => c.classList.remove("is-on")); };
  }, [items.length]);

  return (
    <div ref={root} className="pat" role="group" aria-label={label}>
      <div className="pat-grid container-page">
        <div className="pat-text">
          <LineReveal className="headline-xl display">{title}</LineReveal>
          <ul className="pat-chips" aria-hidden>
            {items.map((it) => <li key={it.id} className="pat-chip label-caps">{it.chip}</li>)}
          </ul>
        </div>
        <div className="pat-frame">
          {all.map((f, i) => (
            <figure key={f.id} className="pat-fig">
              <div className="pat-img">
                <div className="pat-rot" style={f.rotate ? { scale: 1.08 } : undefined}>
                  <Image src={f.media.src} alt={f.media.alt} fill sizes="(min-width: 768px) 520px, 100vw" placeholder="blur" blurDataURL={f.media.blur} style={{ objectPosition: f.media.focal }} className="object-cover" priority={false} />
                </div>
              </div>
              <figcaption><span className="pat-num tnum" aria-hidden>{String(i + 1).padStart(2, "0")}</span> {f.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
