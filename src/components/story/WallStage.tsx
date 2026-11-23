"use client";

import { useRef } from "react";
import Image from "next/image";
import { useStoryMotion } from "@/lib/gsap";
import type { ResolvedImage } from "./types";

export type WallCallout = { id: string; title: string; text: string; x: number; y: number };

/**
 * Chapter 5. A slow pan across the wall strip (direction mirrors in RTL) while callouts on real features
 * (joint, tie hole, fair-faced surface) appear one at a time. Without motion: the strip plus a plain list.
 */
export function WallStage({ media, callouts, label }: { media: ResolvedImage; callouts: WallCallout[]; label: string }) {
  const root = useRef<HTMLDivElement>(null);

  useStoryMotion(({ gsap, desktop, reduce, rtl }) => {
    const el = root.current;
    if (!el || reduce) return;
    const layer = el.querySelector<HTMLElement>(".wall-layer")!;
    const frame = el.querySelector<HTMLElement>(".wall-frame")!;
    const marks = gsap.utils.toArray<HTMLElement>(".wall-mark", el);
    const notes = gsap.utils.toArray<HTMLElement>(".wall-note", el);
    const n = callouts.length;
    el.classList.add("is-pinned");
    gsap.set(marks, { autoAlpha: 0, scale: 0.6 });
    const dist = () => Math.max(0, layer.offsetWidth - frame.clientWidth);
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: el, start: "top top", end: `+=${desktop ? 260 : 190}%`, pin: true, scrub: 0.5, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: (self) => {
          const idx = Math.min(n - 1, Math.floor(self.progress * n));
          notes.forEach((nt, i) => nt.classList.toggle("is-on", i === idx));
        },
      },
    });
    // RTL: the layer is anchored to the right edge, so it starts at x=0 (right end of the wall) and pans toward the left end
    tl.fromTo(layer, { x: 0 }, { x: () => (rtl ? dist() : -dist()), duration: n }, 0);
    marks.forEach((m, i) => { tl.to(m, { autoAlpha: 1, scale: 1, duration: 0.25 }, i + 0.1); if (i < n - 1) tl.to(m, { autoAlpha: 0.0, duration: 0.2 }, i + 0.85); });
    return () => { el.classList.remove("is-pinned"); gsap.set([layer, ...marks], { clearProps: "all" }); notes.forEach((nt) => nt.classList.remove("is-on")); };
  }, [callouts.length]);

  return (
    <div ref={root} className="wall" role="group" aria-label={label}>
      <div className="wall-grid container-page">
        <div className="wall-frame">
          <div className="wall-layer">
            <Image src={media.src} alt={media.alt} fill sizes="(min-width: 1024px) 1400px, 200vw" placeholder="blur" blurDataURL={media.blur} className="object-cover" />
            {callouts.map((c) => (
              <span key={c.id} className="wall-mark" style={{ left: `${c.x * 100}%`, top: `${c.y * 100}%` }} aria-hidden><i /></span>
            ))}
          </div>
        </div>
        <ol className="wall-notes">
          {callouts.map((c, i) => (
            <li key={c.id} className="wall-note">
              <span className="wall-note-num tnum" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
              <strong>{c.title}</strong>
              <span>{c.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
