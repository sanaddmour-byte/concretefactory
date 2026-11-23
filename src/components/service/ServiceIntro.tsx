"use client";

import { useRef } from "react";
import { useStoryMotion } from "@/lib/gsap";

/**
 * Pinned intro for a service page: the hero stays for about one viewport of scroll while the photo eases from
 * 1.15x to 1x. Reduced motion or no JS: the plain hero. Content is never hidden.
 */
export function ServiceIntro({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useStoryMotion(({ gsap, desktop, reduce }) => {
    const el = root.current;
    if (!el || reduce || !desktop) return;
    const img = el.querySelector<HTMLElement>(".hero-frame img");
    if (!img) return;
    gsap.fromTo(img, { scale: 1.15 }, { scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "+=70%", pin: true, scrub: 0.4, anticipatePin: 1 } });
    return () => { gsap.set(img, { clearProps: "all" }); };
  }, []);
  return <div ref={root} className="service-intro">{children}</div>;
}
