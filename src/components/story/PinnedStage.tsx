"use client";

import { useRef } from "react";
import { cn } from "@/lib/ui";
import { useStoryMotion } from "@/lib/gsap";
import { StageMedia, scrubRegistry } from "./StageMedia";
import type { StageStep } from "./types";

type Props = {
  steps: StageStep[];
  /** Scroll length of the pin as a percentage of viewport height (desktop / mobile). Mobile pins are shorter. */
  pin?: { desktop: number; mobile: number };
  transition?: "crossfade" | "wipe";
  /** Show a counting step number ("01 / 05"). */
  counter?: boolean;
  label: string;
  className?: string;
  /** First media is above the fold (LCP): mark it priority. */
  priority?: boolean;
};

/**
 * Pins for N steps. Markup is a complete stacked layout (reduced motion, no JS, before GSAP loads);
 * on desktop/mobile with motion allowed, GSAP adds `.is-pinned` and scrubs the steps with the scroll.
 */
export function PinnedStage({ steps, pin = { desktop: 400, mobile: 260 }, transition = "crossfade", counter = false, label, className, priority }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const pad = (n: number) => String(n).padStart(2, "0");

  useStoryMotion(({ gsap, desktop, reduce, rtl }) => {
    const el = root.current;
    if (!el || reduce) return;
    const items = gsap.utils.toArray<HTMLElement>(".pstep", el);
    const n = items.length;
    if (n < 2) return;

    el.classList.add("is-pinned");
    items.forEach((it, i) => { it.style.zIndex = String(i + 1); });
    const hidden = rtl ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)"; // wipe enters from the inline-end side
    if (transition === "wipe") gsap.set(items.slice(1), { clipPath: hidden });
    else gsap.set(items.slice(1), { autoAlpha: 0 });

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: el, start: "top top", end: `+=${desktop ? pin.desktop : pin.mobile}%`,
        pin: true, scrub: 0.4, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: (self) => {
          const idx = Math.min(n - 1, Math.floor(self.progress * n));
          const c = el.querySelector("[data-count]");
          if (c && c.textContent !== pad(idx + 1)) c.textContent = pad(idx + 1);
          el.dataset.step = String(idx + 1);
          items.forEach((it, i) => {
            const fn = scrubRegistry.get(it.querySelector<HTMLElement>(".stage-media")!);
            if (fn) fn(Math.min(1, Math.max(0, self.progress * n - (i - 0.35))));
          });
        },
      },
    });

    items.forEach((it, i) => {
      if (i > 0) {
        const at = i - (transition === "wipe" ? 0.5 : 0.35);
        if (transition === "wipe") tl.to(it, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5 }, at);
        else { tl.to(it, { autoAlpha: 1, duration: 0.35 }, at); tl.to(items[i - 1], { autoAlpha: 0, duration: 0.35 }, at); }
      }
      const zoomEl = it.querySelector<HTMLElement>("[data-zoom]");
      if (zoomEl?.dataset.zoom) {
        const [from, to] = zoomEl.dataset.zoom.split(",").map(Number);
        tl.fromTo(zoomEl, { scale: from }, { scale: to, duration: 1 }, Math.max(0, i - 0.35));
      }
    });
    tl.to({}, { duration: 0 }, n); // total timeline length = n units

    return () => { el.classList.remove("is-pinned"); gsap.set([...items, ...items.map((i) => i.querySelector(".stage-zoom"))].filter(Boolean) as HTMLElement[], { clearProps: "all" }); };
  }, [steps.length, transition]);

  return (
    <div ref={root} className={cn("pstage", className)} role="group" aria-label={label} data-step="1" style={{ "--steps": steps.length } as React.CSSProperties}>
      {counter && (
        <div className="pcount tnum" dir="ltr" aria-hidden>
          <span data-count>01</span><span className="pcount-total"> / {pad(steps.length)}</span>
        </div>
      )}
      {steps.map((s, i) => (
        <figure key={s.id} className="pstep" data-step-id={s.id}>
          <StageMedia media={s.media} priority={priority && i === 0} sizes="100vw" />
          {s.overlay}
          <figcaption className="pcap">
            <div className="container-page">
              {counter && <span className="pcap-num tnum" aria-hidden>{pad(i + 1)}</span>}
              {s.title && <strong className="pcap-title">{s.title}</strong>}
              <span className="pcap-text">{s.caption}</span>
            </div>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
