/** Tiny pure validators shared by the browser (no zod in the client bundle) and the server actions. */

/** Arabic-Indic (U+0660-0669) and Eastern Arabic-Indic / Persian (U+06F0-06F9) digits to ASCII; Arabic decimal and thousands separators to their ASCII forms. */
export function normalizeDigits(raw: string): string {
  return raw
    .replace(/[\u0660-\u0669]/g, (c) => String(c.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (c) => String(c.charCodeAt(0) - 0x06f0))
    .replace(/\u066B/g, ".") // Arabic decimal separator
    .replace(/\u066C/g, ",") // Arabic thousands separator
    .replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, ""); // direction marks pasted with numbers
}

/** Normalise a phone number to +962... (Jordan default) or generic E.164. Returns null when invalid. */
export function normalizePhone(raw: string): string | null {
  const s = normalizeDigits(raw).trim().replace(/[\s().-]/g, "");
  if (/^\+\d{8,15}$/.test(s)) return /^\+962/.test(s) ? (/^\+9627[789]\d{7}$/.test(s) ? s : null) : s;
  const d = s.replace(/^00/, "").replace(/\D/g, "");
  const local = d.startsWith("962") ? d.slice(3) : d.startsWith("0") ? d.slice(1) : d;
  return /^7[789]\d{7}$/.test(local) ? `+962${local}` : null;
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

/** Parses an approximate size typed in any digit system. "" is allowed (optional). Returns the canonical ASCII number string, or null when invalid. */
export function parseSize(raw: string): string | null {
  let s = normalizeDigits(raw).trim().replace(/\s/g, "");
  if (s === "") return "";
  if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, ""); // 1,200 or 1,200.5 (thousands)
  else if (/^\d+,\d{1,2}$/.test(s)) s = s.replace(",", "."); // 12,5 (decimal comma)
  return /^\d{1,6}(\.\d{1,2})?$/.test(s) && Number(s) > 0 ? s : null;
}
export const isSize = (v: string) => parseSize(v) !== null;

export const ALLOWED_FILE = /^(image\/(jpeg|png)|application\/pdf)$/;
export const MAX_FILES = 5;
export const MAX_TOTAL_BYTES = 4 * 1024 * 1024;

export const SERVICE_SLUGS = ["industrial-floors", "interior-floors", "stamped-concrete", "exposed-aggregate", "terrazzo", "walls", "countertops", "sinks", "fire-pits-seating"] as const;
export const PROJECT_TYPES = ["villa", "apartment", "commercial", "industrial"] as const;
export const SETTINGS = ["indoor", "outdoor", "both"] as const;
export const STARTS = ["asap", "1-3", "later", "unsure"] as const;
export const CHANNELS = ["whatsapp", "call", "email"] as const;
export const SLOTS = ["morning", "afternoon"] as const;

/** Jordan: governorates and main cities, "Other" last. Service area is all of Jordan. */
export const CITIES: { value: string; en: string; ar: string }[] = [
  { value: "amman", en: "Amman", ar: "عمّان" }, { value: "zarqa", en: "Zarqa", ar: "الزرقاء" }, { value: "irbid", en: "Irbid", ar: "إربد" },
  { value: "aqaba", en: "Aqaba", ar: "العقبة" }, { value: "salt", en: "Salt", ar: "السلط" }, { value: "madaba", en: "Madaba", ar: "مادبا" },
  { value: "jerash", en: "Jerash", ar: "جرش" }, { value: "ajloun", en: "Ajloun", ar: "عجلون" }, { value: "karak", en: "Karak", ar: "الكرك" },
  { value: "tafilah", en: "Tafilah", ar: "الطفيلة" }, { value: "maan", en: "Ma'an", ar: "معان" }, { value: "mafraq", en: "Mafraq", ar: "المفرق" },
  { value: "other", en: "Other", ar: "أخرى" },
];
