"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/ui";
import type { ResolvedImage } from "./types";

export type ScrollerBlock = { id: string; title: string; text: string; media: ResolvedImage };

/**
 * Cula-style: a sticky media column and a scrolling text column; each text block swaps the image when it
 * enters view. Two columns mirror automatically in RTL. On mobile and with reduced motion every block shows
 * its own image inline (a normal stacked page). Informative first, motion second.
 */
export function StickyMediaScroller({ blocks, label, className }: { blocks: ScrollerBlock[]; label: string; className?: string }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
    }, { rootMargin: "-40% 0px -40% 0px" });
    refs.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, [blocks.length]);

  return (
    <div className={cn("sms container-page", className)} role="group" aria-label={label}>
      <div className="sms-media" aria-hidden>
        {blocks.map((b, i) => (
          <div key={b.id} className={cn("sms-img", i === active && "is-active")}>
            <Image src={b.media.src} alt="" fill sizes="(min-width: 768px) 560px, 100vw" placeholder="blur" blurDataURL={b.media.blur} style={{ objectPosition: b.media.focal }} className="object-cover" />
          </div>
        ))}
      </div>
      <ol className="sms-text">
        {blocks.map((b, i) => (
          <li key={b.id} ref={(el) => { refs.current[i] = el; }} data-i={i} className="sms-block">
            <figure className="sms-inline">
              <Image src={b.media.src} alt={b.media.alt} fill sizes="100vw" placeholder="blur" blurDataURL={b.media.blur} style={{ objectPosition: b.media.focal }} className="object-cover" />
            </figure>
            <h2 className="display text-2xl md:text-3xl">{b.title}</h2>
            <p className="mt-3 max-w-[56ch] text-lg text-n-700">{b.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
