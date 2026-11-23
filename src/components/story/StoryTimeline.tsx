"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/ui";
import type { ResolvedImage } from "./types";

export type TimelineEntry = { id: string; label: string; title: string; text: string; media: ResolvedImage | null };

/**
 * Chapter 8. A sticky label (a year, or the name of what we do) changes as each entry scrolls into view, like a
 * chronology. Only entries with real data are passed in. Stacked and fully readable without motion.
 */
export function StoryTimeline({ entries, label }: { entries: TimelineEntry[]; label: string }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  useEffect(() => {
    const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i)); }, { rootMargin: "-40% 0px -45% 0px" });
    refs.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, [entries.length]);

  return (
    <div className="tl container-page" role="group" aria-label={label}>
      <div className="tl-sticky" aria-hidden>
        <div className="tl-label tnum display" key={active}>{entries[active].label}</div>
        <div className="tl-photo">
          {entries.map((e, i) => e.media && (
            <div key={e.id} className={cn("tl-photo-img", i === active && "is-active")}>
              <Image src={e.media.src} alt="" fill sizes="(min-width: 768px) 420px, 100vw" placeholder="blur" blurDataURL={e.media.blur} style={{ objectPosition: e.media.focal }} className="object-cover" />
            </div>
          ))}
        </div>
      </div>
      <ol className="tl-list">
        {entries.map((e, i) => (
          <li key={e.id} ref={(el) => { refs.current[i] = el; }} data-i={i} className="tl-item">
            <p className="tl-inline-label display">{e.label}</p>
            {e.media && (
              <figure className="tl-inline-photo">
                <Image src={e.media.src} alt={e.media.alt} fill sizes="100vw" placeholder="blur" blurDataURL={e.media.blur} style={{ objectPosition: e.media.focal }} className="object-cover" />
              </figure>
            )}
            <h3 className="display text-2xl md:text-3xl">{e.title}</h3>
            <p className="mt-3 max-w-[52ch] text-lg">{e.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
