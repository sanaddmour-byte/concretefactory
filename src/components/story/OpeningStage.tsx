"use client";

import { useEffect, useRef } from "react";
import { getImageProps } from "next/image";
import { Link } from "@/i18n/navigation";
import { buttonClass } from "@/lib/ui";
import { useStoryMotion } from "@/lib/gsap";
import { LineReveal } from "./LineReveal";
import type { ResolvedImage } from "./types";

/**
 * Chapter 0. The image is the LCP element (priority, AVIF via next/image). It starts at 1.6x and eases to 1x as
 * you scroll through a short pin; the headline reveals on arrival; the subline and CTA appear at the end of the
 * zoom. Reduced motion / no JS: a plain full-viewport hero with everything visible.
 */
export function OpeningStage({ media, mobileMedia, title, sub, quote, work, workHref, scroll }: { media: ResolvedImage; /** portrait cut shown below 768px (native resolution, so it stays sharp at full height) */ mobileMedia: ResolvedImage; title: string; sub: string; quote: string; work: string; workHref: string; scroll: string }) {
  const root = useRef<HTMLDivElement>(null);

  useStoryMotion(({ gsap, desktop, reduce }) => {
    const el = root.current;
    if (!el || reduce) return;
    const zoom = el.querySelector(".opening-zoom");
    const tail = el.querySelector(".opening-tail");
    gsap.set(zoom, { scale: desktop ? 1.6 : 1.25 }); // gentler on phones: the photo is not upscaled as far
    gsap.set(tail, { autoAlpha: 0, y: 24 });
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: el, start: "top top", end: `+=${desktop ? 120 : 90}%`, pin: true, scrub: 0.4, anticipatePin: 1 },
    });
    tl.to(zoom, { scale: 1, duration: 1 }, 0).to(tail, { autoAlpha: 1, y: 0, duration: 0.25 }, 0.75);
    el.dataset.ready = "true";
    return () => { gsap.set([zoom, tail], { clearProps: "all" }); delete el.dataset.ready; };
  }, []);

  // Failsafe: if the animation library never arrives, show everything
  useEffect(() => {
    const id = setTimeout(() => { if (root.current && !root.current.dataset.ready) root.current.dataset.ready = "fail"; }, 6000);
    return () => clearTimeout(id);
  }, []);

  // Art direction: a portrait cut on phones, the square original from 768px up. Both served through the image optimizer (or the preview loader).
  const common = { alt: "", fill: true as const, sizes: "100vw", priority: true };
  const wide = getImageProps({ ...common, src: media.src }).props;
  const tall = getImageProps({ ...common, src: mobileMedia.src, placeholder: "blur", blurDataURL: mobileMedia.blur }).props;
  return (
    <div ref={root} className="opening">
      <div className="opening-media" aria-hidden={false}>
        <div className="opening-zoom">
          <picture>
            <source media="(min-width: 768px)" srcSet={wide.srcSet} sizes="100vw" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img {...tall} alt={media.alt} className="object-cover" style={{ ...tall.style, objectPosition: "50% 50%" }} />
          </picture>
        </div>
        <div className="opening-scrim" aria-hidden />
      </div>
      <div className="opening-copy container-page">
        <LineReveal as="h1" className="headline-xl display" start="top 100%">{title}</LineReveal>
        <div className="opening-tail">
          <p className="opening-sub">{sub}</p>
        </div>
        {/* Visible from the first screen (not part of the reveal) */}
        <div className="opening-cta mt-8 flex flex-wrap items-center gap-4">
          <Link href="/quote" className={buttonClass("primary")}>{quote}</Link>
          <Link href={workHref} className="label-caps inline-flex min-h-11 items-center underline underline-offset-8 decoration-yellow decoration-2">{work}</Link>
        </div>
        <p className="scroll-cue" aria-hidden><i />{scroll}</p>
      </div>
    </div>
  );
}
