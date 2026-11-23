import type { CSSProperties } from "react";
import { Photo } from "@/components/ui/Photo";
import type { PhotoId } from "@/lib/photos";
import type { Locale } from "@/i18n/routing";

export type StoryStage = { photo: PhotoId; eyebrow: string; title: string; body: string; focal?: string };

/**
 * Pinned, scroll-linked story. All stages are real DOM content, readable in order without
 * any animation. With CSS scroll-driven animations the stage stays pinned while stages
 * cross-fade (in both scroll directions). No JavaScript is involved.
 */
export function Story({ stages, locale, label }: { stages: StoryStage[]; locale: Locale; label: string }) {
  const n = stages.length;
  return (
    <div className="story" style={{ "--n": n } as CSSProperties} role="group" aria-label={label}>
      <div className="story-pin container-page">
        {stages.map((s, i) => (
          <div
            key={s.photo}
            className="story-stage"
            data-pos={i === 0 ? "first" : i === n - 1 ? "last" : "mid"}
            style={{ "--i": i } as CSSProperties}
          >
            <div className="story-copy">
              <p className="story-eyebrow">
                <span aria-hidden />
                <bdi>
                  {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
                </bdi>{" "}
                · {s.eyebrow}
              </p>
              <h3 className="display">{s.title}</h3>
              <p>{s.body}</p>
            </div>
            <div className="story-shot">
              <Photo id={s.photo} locale={locale} fill focal={s.focal} sizes="(min-width: 768px) 560px, 100vw" />
            </div>
          </div>
        ))}
        <div className="story-progress" aria-hidden>
          <i />
        </div>
      </div>
    </div>
  );
}
