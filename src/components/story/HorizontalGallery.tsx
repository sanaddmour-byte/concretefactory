"use client";

import { useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useStoryMotion } from "@/lib/gsap";
import { LineReveal } from "./LineReveal";
import type { ResolvedImage } from "./types";

export type GalleryCard = { id: string; title: string; line: string; href: string; media: ResolvedImage | null; photoNeeded?: boolean };

/**
 * Chapter 4. Desktop: the section pins and vertical scroll moves the cards sideways (direction reversed in RTL).
 * Mobile and reduced motion: a plain horizontally swipeable row with scroll-snap (no pinning at all).
 */
export function HorizontalGallery({ title, cards, label, cta }: { title: string; cards: GalleryCard[]; label: string; cta: string }) {
  const root = useRef<HTMLDivElement>(null);

  useStoryMotion(({ gsap, desktop, rtl }) => {
    const el = root.current;
    if (!el || !desktop) return;
    const track = el.querySelector<HTMLElement>(".hg-track")!;
    const scroller = el.querySelector<HTMLElement>(".hg-scroll")!;
    el.classList.add("is-pinned");
    const dist = () => Math.max(0, track.scrollWidth - scroller.clientWidth);
    gsap.fromTo(track, { x: 0 }, {
      x: () => (rtl ? dist() : -dist()), ease: "none",
      scrollTrigger: { trigger: el, start: "top top", end: () => `+=${Math.round(dist() * 1.1)}`, pin: true, scrub: 0.4, anticipatePin: 1, invalidateOnRefresh: true },
    });
    return () => { el.classList.remove("is-pinned"); gsap.set(track, { clearProps: "all" }); };
  }, [cards.length]);

  return (
    <div ref={root} className="hg" role="group" aria-label={label}>
      <div className="hg-head container-page">
        <LineReveal className="headline-xl display">{title}</LineReveal>
      </div>
      <div className="hg-scroll" tabIndex={0} aria-label={label}>
        <ul className="hg-track">
          {cards.map((c) => (
            <li key={c.id} className="hg-card">
              <Link href={c.href} className="block">
                <span className="hg-img">
                  {c.media ? (
                    <Image src={c.media.src} alt={c.media.alt} fill sizes="(min-width: 768px) 380px, 78vw" placeholder="blur" blurDataURL={c.media.blur} style={{ objectPosition: c.media.focal }} className="object-cover" />
                  ) : (
                    <span className="tex-placeholder absolute inset-0">{c.photoNeeded && <span className="ph-badge absolute start-3 top-3">PHOTO NEEDED</span>}</span>
                  )}
                </span>
                <span className="hg-title display">{c.title}</span>
                <span className="hg-line">{c.line}</span>
                <span className="hg-cta label-caps">{cta} <span aria-hidden className="rtl:-scale-x-100 inline-block">→</span></span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
