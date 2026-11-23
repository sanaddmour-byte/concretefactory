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
    /** Weekdays the business is closed (0=Sunday..6=Saturday). null = the owner has not supplied them yet (flagged in dev builds and in visit emails). */
    closedDays: z.array(z.number().int().min(0).max(6)).nullable(),
  }),
  /** Company timeline (year, title, text). The story chapter appears only with 3 or more real milestones. */
  milestones: z.array(z.object({ year: z.string(), title: bi, text: bi })),
  socials: z.array(z.object({ label: z.string(), url: z.url() })),
  stats: z
    .object({
      years: z.string().nullable(),
      area: z.string().nullable(),
      projects: z.string().nullable(),
    })
    .nullable(),
});

const parsed = schema.parse(raw);
/** Owner-configurable closed weekdays without editing content: VISIT_CLOSED_DAYS="5,6" (0=Sunday..6=Saturday); "none" = open every day. Overrides content/site.json. */
const envClosed = process.env.VISIT_CLOSED_DAYS?.trim();
const closedFromEnv = envClosed === undefined || envClosed === "" ? undefined : envClosed.toLowerCase() === "none" ? [] : envClosed.split(",").map((x) => Number(x)).filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);
export const site = closedFromEnv ? { ...parsed, contact: { ...parsed.contact, closedDays: closedFromEnv } } : parsed;

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
