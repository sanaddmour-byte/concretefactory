import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import type { Locale } from "@/i18n/routing";
import { families } from "@/lib/services";
import { photoIds } from "@/lib/photos";

const faq = z.object({ q: z.string(), a: z.string(), confirm: z.string().optional() });
const overviewPhoto = z.object({ photo: z.string(), focal: z.string().optional(), focalMobile: z.string().optional() });
const stage = z.object({ photo: z.string(), eyebrow: z.string(), title: z.string(), body: z.string(), focal: z.string().optional() });

const schema = z.object({
  slug: z.string(),
  family: z.enum(families),
  promise: z.string(),
  heroImage: z.string().nullable(),
  heroFocal: z.string().default("50% 50%"),
  /** object-position on phones (< 768px), when the desktop focal point crops badly in a narrow frame */
  heroFocalMobile: z.string().optional(),
  /** Curated, ordered gallery by purpose (finished places, then patterns, then process). When absent the page falls back to the service's photos. [] = no gallery. */
  gallery: z.array(z.string()).optional(),
  /** One photo per overview block (what / where / options / how / care), chosen by subject, with focal points. */
  overview: z.object(Object.fromEntries((["what", "where", "options", "how", "care"] as const).map((k) => [k, overviewPhoto.optional()])) as Record<"what" | "where" | "options" | "how" | "care", z.ZodOptional<typeof overviewPhoto>>).optional(),
  /** Care and lifespan wording for the overview, written per language. Never guessed from FAQ text. */
  care: z.string().optional(),
  applications: z.array(z.string()).min(3),
  options: z.array(z.string()),
  specs: z.array(z.object({ key: z.string(), value: z.string() })),
  specSheet: z.string().nullable(),
  feature: z.object({ title: z.string(), text: z.string(), photo: z.string(), caption: z.string() }).optional(),
  callouts: z.array(z.object({ title: z.string(), text: z.string(), items: z.array(z.string()) })).default([]),
  processSteps: z.array(z.object({ title: z.string(), text: z.string() })),
  story: z.array(stage).default([]),
  storyCaption: z.string().optional(),
  faqs: z.array(faq).min(3).max(6),
  relatedProjects: z.array(z.string()).default([]),
  seo: z.object({ title: z.string().max(70), description: z.string().max(170) }),
});
export type ServiceContent = z.infer<typeof schema> & { body: string };

const dir = path.join(process.cwd(), "content/services");

export function getService(slug: string, locale: Locale): ServiceContent {
  const file = path.join(dir, `${slug}.${locale}.mdx`);
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const parsed = schema.parse(data);
  if (parsed.slug !== slug) throw new Error(`${file}: slug mismatch`);
  // Build-time integrity: every referenced photo must exist in the manifest
  for (const id of [parsed.heroImage, parsed.feature?.photo, ...(parsed.gallery ?? []), ...Object.values(parsed.overview ?? {}).map((o) => o.photo), ...parsed.story.map((s) => s.photo)]) {
    if (id && !photoIds.includes(id)) throw new Error(`${file}: unknown photo ${id}`);
  }
  return { ...parsed, body: content.trim() };
}
