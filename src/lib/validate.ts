/** Tiny pure validators shared by the browser (no zod in the client bundle) and the server actions. */

/** Normalise a phone number to +962… (Jordan default) or generic E.164. Returns null when invalid. */
export function normalizePhone(raw: string): string | null {
  const s = raw.trim().replace(/[\s().-]/g, "");
  if (/^\+\d{8,15}$/.test(s)) return /^\+962/.test(s) ? (/^\+9627[789]\d{7}$/.test(s) ? s : null) : s;
  const d = s.replace(/^00/, "").replace(/\D/g, "");
  const local = d.startsWith("962") ? d.slice(3) : d.startsWith("0") ? d.slice(1) : d;
  return /^7[789]\d{7}$/.test(local) ? `+962${local}` : null;
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const isSize = (v: string) => v === "" || /^\d{1,6}(\.\d{1,2})?$/.test(v.trim());

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
