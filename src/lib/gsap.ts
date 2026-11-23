/**
 * GSAP loader for story routes. Nothing here runs on the server or on routes that don't use stories:
 * GSAP, ScrollTrigger and SplitText are dynamic imports, started only after the page's LCP element has painted.
 */
import { useEffect } from "react";
import type { gsap as Gsap } from "gsap";
import type { ScrollTrigger as ST } from "gsap/ScrollTrigger";
import type { SplitText as SplitTextT } from "gsap/SplitText";

export type Gsap3 = { gsap: typeof Gsap; ScrollTrigger: typeof ST; SplitText: typeof SplitTextT };
export type Motion = Gsap3 & { desktop: boolean; mobile: boolean; reduce: boolean; rtl: boolean };

let loading: Promise<Gsap3> | null = null;
export function loadGsap(): Promise<Gsap3> {
  return (loading ??= (async () => {
    const [{ gsap }, { ScrollTrigger }, { SplitText }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("gsap/SplitText")]);
    gsap.registerPlugin(ScrollTrigger, SplitText);
    return { gsap, ScrollTrigger, SplitText };
  })());
}

/** Resolves once the LCP element has painted (or the page has loaded, or after 3 s as a failsafe). */
export function afterLcp(): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(); } };
    try {
      new PerformanceObserver((list) => { if (list.getEntries().length) setTimeout(finish, 50); }).observe({ type: "largest-contentful-paint", buffered: true });
    } catch { /* unsupported: rely on load */ }
    if (document.readyState === "complete") setTimeout(finish, 300);
    else addEventListener("load", () => setTimeout(finish, 300), { once: true });
    setTimeout(finish, 3000);
  });
}

/**
 * Runs `setup` inside gsap.matchMedia() so desktop, mobile and reduced-motion each get their own timeline.
 * `setup` may return a cleanup function. Everything is reverted on unmount.
 */
export function useStoryMotion(setup: (m: Motion) => void | (() => void), deps: unknown[] = []) {
  useEffect(() => {
    let cancelled = false;
    let mm: ReturnType<typeof Gsap.matchMedia> | undefined;
    (async () => {
      await afterLcp();
      const g = await loadGsap();
      if (cancelled) return;
      mm = g.gsap.matchMedia();
      mm.add(
        {
          desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
          mobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const c = ctx.conditions as { desktop: boolean; mobile: boolean; reduce: boolean };
          return setup({ ...g, desktop: !!c.desktop, mobile: !!c.mobile, reduce: !!c.reduce, rtl: document.documentElement.dir === "rtl" });
        },
      );
    })();
    return () => { cancelled = true; mm?.revert(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
