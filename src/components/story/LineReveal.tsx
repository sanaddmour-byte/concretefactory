"use client";

import { useRef } from "react";
import { useLocale } from "next-intl";
import { useStoryMotion } from "@/lib/gsap";

/**
 * Headline reveal. English: SplitText line-by-line (masked rise). Arabic: the whole block fades and rises,
 * because splitting Arabic text breaks the letter joins. Text stays in the DOM and readable throughout.
 */
export function LineReveal({ as: Tag = "h2", children, className, start = "top 85%" }: { as?: "h1" | "h2" | "h3" | "p"; children: React.ReactNode; className?: string; start?: string }) {
  const ref = useRef<HTMLElement>(null);
  const ar = useLocale() === "ar";

  useStoryMotion(({ gsap, SplitText, reduce }) => {
    const el = ref.current;
    if (!el) return;
    const ready = () => el.removeAttribute("data-lr");
    if (reduce) { ready(); return; }
    const trigger = { trigger: el, start, once: true };
    if (ar) {
      gsap.fromTo(el, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", scrollTrigger: trigger });
      ready();
      return;
    }
    let split: ReturnType<typeof SplitText.create> | undefined;
    document.fonts.ready.then(() => {
      split = SplitText.create(el, {
        type: "lines", mask: "lines", autoSplit: true,
        onSplit: (self) => { ready(); return gsap.from(self.lines, { yPercent: 110, duration: 0.9, ease: "power3.out", stagger: 0.09, scrollTrigger: trigger }); },
      });
    });
    return () => split?.revert();
  }, [ar]);

  // @ts-expect-error: dynamic tag with a shared ref
  return <Tag ref={ref} data-lr="pending" className={className}>{children}</Tag>;
}
