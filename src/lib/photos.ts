import { z } from "zod";
import raw from "@/generated/photos.json";
import type { Locale } from "@/i18n/routing";

const photoSchema = z.object({
  id: z.string(),
  src: z.string().startsWith("/img/"),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  orientation: z.enum(["portrait", "landscape", "square"]),
  service: z.string(),
  role: z.string(),
  alt: z.object({ en: z.string(), ar: z.string() }),
  notes: z.string(),
  blur: z.string().startsWith("data:image/"),
});

export type Photo = z.infer<typeof photoSchema>;

const photos = z.record(z.string(), photoSchema).parse(raw);

export type PhotoId = keyof typeof raw;
export const photoIds: string[] = Object.keys(photos);

/** Typed lookup. Throws at build time if an id does not exist in the manifest. */
export function getPhoto(id: PhotoId): Photo {
  const p = photos[id];
  if (!p) throw new Error(`Unknown photo id: ${id}`);
  return p;
}

export const photosByService = (service: string) => Object.values(photos).filter((p) => p.service === service);

export const photoAlt = (p: Photo, locale: Locale) => p.alt[locale];
