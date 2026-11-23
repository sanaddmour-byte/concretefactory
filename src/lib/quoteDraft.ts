/**
 * Quote draft + receipt logic (pure functions; storage is passed in so it can be unit-tested).
 *
 * Two kinds of storage:
 *  - session draft ("active"): survives language switches, reloads and navigation inside this tab. Restored silently.
 *  - saved draft (localStorage): offered back with a "Restore" banner on a later visit.
 * Receipts (session): a quote confirmation is only shown when its reference matches a receipt written by a
 * successful submission in this session.
 */
export type QuoteValues = {
  services: string[]; projectType: string; city: string; size: string; setting: string; finishes: string[];
  start: string; name: string; phone: string; channel: string; email: string;
};
export const emptyQuote: QuoteValues = { services: [], projectType: "", city: "", size: "", setting: "", finishes: [], start: "", name: "", phone: "", channel: "", email: "" };

export type Draft = { values: QuoteValues; step: number; /** URL defaults ("service|samples") already applied, so a language switch does not re-apply them */ applied: string };
export type Receipt = { ref: string; emailed: boolean; values: QuoteValues; at: number };

export const KEYS = { active: "cf-quote-active", saved: "cf-quote-draft", receipts: "cf-quote-receipts" } as const;
export const MAX_FINISHES = 6;

type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;
const read = <T>(s: Store | undefined, k: string): T | null => { try { return s ? (JSON.parse(s.getItem(k) ?? "null") as T | null) : null; } catch { return null; } };
const write = (s: Store | undefined, k: string, v: unknown) => { try { s?.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } };

export const isEmptyQuote = (v: QuoteValues) =>
  !v.services.length && !v.finishes.length && !v.projectType && !v.city && !v.size && !v.setting && !v.start && !v.name && !v.phone && !v.channel && !v.email;

/** Accepts only well-formed stored drafts (storage can hold anything). */
export function sanitizeDraft(d: unknown): Draft | null {
  if (!d || typeof d !== "object") return null;
  const o = d as Partial<Draft>; const v = (o.values ?? null) as Partial<QuoteValues> | null;
  if (!v || typeof v !== "object") return null;
  const str = (x: unknown) => (typeof x === "string" ? x : "");
  const arr = (x: unknown) => (Array.isArray(x) ? x.filter((i): i is string => typeof i === "string") : []);
  return {
    values: { services: arr(v.services), projectType: str(v.projectType), city: str(v.city), size: str(v.size), setting: str(v.setting), finishes: arr(v.finishes).slice(0, MAX_FINISHES), start: str(v.start), name: str(v.name), phone: str(v.phone), channel: str(v.channel), email: str(v.email) },
    step: Math.min(5, Math.max(1, Number(o.step) || 1)),
    applied: str(o.applied),
  };
}

export const loadActive = (session?: Store) => sanitizeDraft(read(session, KEYS.active));
export const loadSaved = (local?: Store) => sanitizeDraft(read(local, KEYS.saved));
export function saveDraft(d: Draft, session?: Store, local?: Store) {
  write(session, KEYS.active, d);
  if (isEmptyQuote(d.values)) local?.removeItem(KEYS.saved); else write(local, KEYS.saved, d);
}
export function clearDrafts(session?: Store, local?: Store) { try { session?.removeItem(KEYS.active); local?.removeItem(KEYS.saved); } catch { /* ignore */ } }

/** Fingerprint of the URL's prefill intent. */
export const urlIntent = (services: string[], samples: string[]) => `${services.join(",")}|${samples.join(",")}`;

/**
 * Applies URL defaults to restored answers. Existing answers always survive. A URL default is added only when it is new
 * (its intent differs from what this draft already applied), so switching language never re-adds a service the visitor
 * removed, while a fresh hand-off (new service link, new sample list) is merged in.
 */
export function applyUrlDefaults(base: Draft | null, services: string[], samples: string[]): Draft {
  const intent = urlIntent(services, samples);
  const d: Draft = base ? { ...base, values: { ...base.values } } : { values: { ...emptyQuote }, step: 1, applied: "" };
  if (d.applied === intent) return d;
  const union = (a: string[], b: string[], max = 99) => [...a, ...b.filter((x) => !a.includes(x))].slice(0, max);
  d.values.services = union(d.values.services, services);
  d.values.finishes = union(d.values.finishes, samples, MAX_FINISHES);
  d.applied = intent;
  return d;
}

/* ---- receipts ---- */
export function loadReceipts(session?: Store): Receipt[] { const r = read<Receipt[]>(session, KEYS.receipts); return Array.isArray(r) ? r.filter((x) => x && typeof x.ref === "string") : []; }
export function addReceipt(r: Receipt, session?: Store) { write(session, KEYS.receipts, [...loadReceipts(session).filter((x) => x.ref !== r.ref), r].slice(-10)); }
/** The receipt for `ref`, or null when the reference was not produced by a successful submission in this session. */
export const findReceipt = (ref: string | null, session?: Store): Receipt | null => (ref ? loadReceipts(session).find((r) => r.ref === ref) ?? null : null);
