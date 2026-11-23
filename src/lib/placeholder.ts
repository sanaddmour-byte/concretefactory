/** A value of the form "{{PLACEHOLDER: …}}" or "{{CONFIRM: …}}" means "not supplied yet". */
const RE = /^\s*\{\{\s*(PLACEHOLDER|CONFIRM)\b[^}]*\}\}\s*$/;

export function isPlaceholder(value: unknown): value is string {
  return typeof value === "string" && RE.test(value);
}

export function placeholderLabel(value: string): string {
  return value.replace(/^\s*\{\{\s*/, "").replace(/\s*\}\}\s*$/, "");
}

/** True when a block's required data is all real (non-null, non-placeholder). */
export function hasData(...values: unknown[]): boolean {
  return values.every((v) => v != null && v !== "" && !isPlaceholder(v) && !(Array.isArray(v) && v.length === 0));
}

export const isDev = process.env.NODE_ENV !== "production";
