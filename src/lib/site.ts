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
    whatsappQr: z.url(),
    email: z.string(),
    salesEmail: z.string(),
    address: z.string(),
    hours: z.string(),
    mapsUrl: z.string(),
    replySla: z.string(),
    closedDays: z.array(z.number().int().min(0).max(6)),
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

/**
 * Plain WhatsApp buttons use the client's wa.me/qr link. That link cannot carry text, so any button that
 * sends a prefilled message (quote handoff, service enquiry, visit request) uses the numeric wa.me link
 * for the same number.
 */
export function whatsappUrl(message?: string) {
  if (!message) return site.contact.whatsappQr;
  return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}
