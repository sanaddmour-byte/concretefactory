import { z } from "zod";
import raw from "../../content/site.json";
import type { Locale } from "@/i18n/routing";

const bi = z.object({ en: z.string().min(1), ar: z.string().min(1) });

const schema = z.object({
  name: bi,
  tagline: bi,
  location: z.object({ city: bi, country: bi }),
  serviceArea: bi,
  contact: z.object({
    phone: z.string().regex(/^\+\d{8,15}$/),
    phoneDisplay: z.string(),
    whatsapp: z.string().regex(/^\d{8,15}$/),
    email: z.string(),
    salesEmail: z.string(),
    address: z.string(),
    hours: z.string(),
    mapsUrl: z.string(),
  }),
  socials: z.array(z.object({ label: z.string(), url: z.url() })),
  stats: z
    .object({
      years: z.string().nullable(),
      area: z.string().nullable(),
      projects: z.string().nullable(),
    })
    .nullable(),
});

export const site = schema.parse(raw);

export const t = (v: { en: string; ar: string }, locale: Locale) => v[locale];

export function whatsappUrl(message?: string) {
  const q = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${site.contact.whatsapp}${q}`;
}
