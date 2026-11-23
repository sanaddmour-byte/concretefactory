import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { Locale } from "@/i18n/routing";

const name = z.object({ en: z.string(), ar: z.string().nullable(), arProposed: z.string().nullable() });

const schema = z.object({
  code: z.string().regex(/^[A-Z]{2}(-[A-Z0-9]{2,3})?-\d{2}$/),
  codeStatus: z.enum(["proposed", "approved"]),
  photo: z.string(),
  photoUse: z.enum(["swatch", "installed-floor"]),
  family: z.enum(["stamped-concrete", "terrazzo", "exposed-aggregate"]),
  pattern: name,
  colour: name.nullable(),
  material: name.nullable(),
  indoor: z.boolean().nullable(),
  outdoor: z.boolean().nullable(),
  method: z.string().nullable(),
  maintenance: z.string().nullable(),
  uses: z.array(z.string()),
  projects: z.array(z.string()),
});
export type Finish = z.infer<typeof schema>;

const dir = path.join(process.cwd(), "content/finishes");

/** Read once per build. Fails the build on a malformed file. */
export const finishes: Finish[] = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => schema.parse(JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))));

export const getFinish = (code: string) => finishes.find((f) => f.code === code);
export const finishByPhoto = (photo: string) => finishes.find((f) => f.photo === photo);

/** Only client-approved Arabic is shown; otherwise the English name is used (never an unapproved translation). */
const pick = (n: z.infer<typeof name> | null, l: Locale) => (n ? (l === "ar" ? n.ar ?? n.en : n.en) : null);

/** "European Fan · Brick Red" for stamped finishes; for terrazzo/aggregate (no colour named yet) the material is used.
 *  Names come from the client; an unapproved Arabic translation is never shown, the English name is used instead. */
export function finishLabel(f: Finish, l: Locale, familyName: string): string {
  const colour = pick(f.colour, l);
  if (colour) return `${pick(f.pattern, l)} · ${colour}`;
  const material = pick(f.material, l); // Arabic falls back to the English name until an Arabic name is approved
  return material ? `${familyName} · ${material}` : familyName;
}

/** Codes are shown publicly only once the client approves the proposed scheme. */
export const showCode = (f: Finish) => f.codeStatus === "approved";
