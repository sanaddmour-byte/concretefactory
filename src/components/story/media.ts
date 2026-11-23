import "server-only";
import { getPhoto, type PhotoId } from "@/lib/photos";
import type { Locale } from "@/i18n/routing";
import type { ResolvedImage } from "./types";

/** Server-side helper: turn a manifest photo id into serialisable image media (alt text in the active language). */
export function image(id: PhotoId, locale: Locale, opts: { focal?: string; zoom?: { from: number; to: number } } = {}): ResolvedImage {
  const p = getPhoto(id);
  return { type: "image", src: p.src, width: p.width, height: p.height, alt: p.alt[locale], blur: p.blur, ...opts };
}
