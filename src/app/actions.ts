"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { mailConfigured, makeRef, sendMail, summarise, type Attachment } from "@/lib/notify";
import { ALLOWED_FILE, CHANNELS, CITIES, MAX_FILES, MAX_TOTAL_BYTES, PROJECT_TYPES, SERVICE_SLUGS, SETTINGS, SLOTS, STARTS, isEmail, isSize, normalizePhone } from "@/lib/validate";
import { site } from "@/lib/site";

export type ActionResult =
  | { ok: true; ref: string; emailed: boolean }
  | { ok: false; error: "invalid" | "files" | "unavailable" | "rate"; fields?: string[] };

// Light per-instance rate limit (the honeypot and validation do the rest)
const hits = new Map<string, number[]>();
async function limited() {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 8;
}

const phone = z.string().refine((v) => normalizePhone(v) !== null);
const base = {
  locale: z.enum(["en", "ar"]),
  name: z.string().trim().min(2).max(80),
  phone,
  finishes: z.array(z.string().max(12)).max(6),
  hp: z.string().max(0).optional(), // honeypot: real people leave it empty
};

const quoteSchema = z
  .object({
    ...base,
    services: z.array(z.enum(SERVICE_SLUGS)).min(1).max(9),
    projectType: z.enum(PROJECT_TYPES),
    city: z.enum(CITIES.map((c) => c.value) as [string, ...string[]]),
    size: z.string().refine(isSize),
    setting: z.enum(SETTINGS),
    start: z.enum(STARTS).or(z.literal("")),
    channel: z.enum(CHANNELS),
    email: z.string().refine((v) => v === "" || isEmail(v)),
  })
  .refine((d) => d.channel !== "email" || isEmail(d.email), { path: ["email"] });

const visitSchema = z.object({
  ...base,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slot: z.enum(SLOTS),
  note: z.string().max(600),
});

async function readFiles(fd: FormData): Promise<Attachment[] | null> {
  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_FILES) return null;
  if (files.reduce((n, f) => n + f.size, 0) > MAX_TOTAL_BYTES) return null;
  const out: Attachment[] = [];
  for (const f of files) {
    if (!ALLOWED_FILE.test(f.type)) return null;
    const safe = f.name.replace(/[^\w.\- ]+/g, "_").slice(0, 80) || "file";
    out.push({ filename: safe, content: Buffer.from(await f.arrayBuffer()).toString("base64") });
  }
  return out;
}

async function deliver(ref: string, subject: string, rows: [string, string][], replyEmail: string, attachments: Attachment[]): Promise<ActionResult> {
  const { text, html } = summarise(`${subject} (${ref})`, rows);
  if (!mailConfigured()) {
    if (process.env.NODE_ENV === "production") return { ok: false, error: "unavailable" }; // never pretend it was sent
    console.log(`[dev] email not configured; would send:\n${text}\nattachments: ${attachments.map((a) => a.filename).join(", ") || "none"}`);
    return { ok: true, ref, emailed: false };
  }
  const sent = await sendMail({ subject: `${subject} ${ref}`, text, html, replyTo: replyEmail || undefined, attachments });
  return sent ? { ok: true, ref, emailed: true } : { ok: false, error: "unavailable" };
}

const cityName = (v: string) => CITIES.find((c) => c.value === v)?.en ?? v;

export async function submitQuote(fd: FormData): Promise<ActionResult> {
  if (await limited()) return { ok: false, error: "rate" };
  let raw: unknown;
  try { raw = JSON.parse(String(fd.get("payload") ?? "")); } catch { return { ok: false, error: "invalid" }; }
  const parsed = quoteSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid", fields: [...new Set(parsed.error.issues.map((i) => String(i.path[0])))] };
  const d = parsed.data;
  const files = await readFiles(fd);
  if (!files) return { ok: false, error: "files" };
  const ref = makeRef("CF");
  return deliver(ref, "Quote request", [
    ["Reference", ref], ["Language", d.locale], ["Services", d.services.join(", ")], ["Project type", d.projectType], ["City", cityName(d.city)],
    ["Approx. size", d.size ? `${d.size} (m² or linear m for countertops)` : ""], ["Setting", d.setting], ["Finishes (sample list)", d.finishes.join(", ")],
    ["Start", d.start], ["Name", d.name], ["Mobile", normalizePhone(d.phone) ?? d.phone], ["Prefers", d.channel], ["Email", d.email],
    ["Attachments", files.map((f) => f.filename).join(", ")],
  ], d.email, files);
}

export async function submitVisit(fd: FormData): Promise<ActionResult> {
  if (await limited()) return { ok: false, error: "rate" };
  let raw: unknown;
  try { raw = JSON.parse(String(fd.get("payload") ?? "")); } catch { return { ok: false, error: "invalid" }; }
  const parsed = visitSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid", fields: [...new Set(parsed.error.issues.map((i) => String(i.path[0])))] };
  const d = parsed.data;
  const date = new Date(`${d.date}T00:00:00Z`);
  const tomorrow = new Date(); tomorrow.setUTCHours(0, 0, 0, 0); tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  if (isNaN(date.getTime()) || date < tomorrow || site.contact.closedDays.includes(date.getUTCDay())) return { ok: false, error: "invalid", fields: ["date"] };
  const ref = makeRef("VS");
  return deliver(ref, "Sample / showroom visit request", [
    ["Reference", ref], ["Language", d.locale], ["Date", d.date], ["Time", d.slot], ["Name", d.name], ["Mobile", normalizePhone(d.phone) ?? d.phone],
    ["Finishes to see", d.finishes.join(", ")], ["Note", d.note],
  ], "", []);
}
