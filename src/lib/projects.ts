import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import type { Locale } from "@/i18n/routing";
import { services } from "@/lib/services";
import { photoIds } from "@/lib/photos";
import { getFinish } from "@/lib/finishes";

const schema = z.object({
  slug: z.string(),
  title: z.string(),
  city: z.string(),
  year: z.string(),
  area: z.string(),
  services: z.array(z.string()).min(1),
  sector: z.enum(["residential", "commercial", "industrial"]).nullable(),
  durationWeeks: z.string(),
  clientName: z.string().nullable(),
  clientPermission: z.boolean(),
  challenge: z.string(),
  approach: z.string(),
  result: z.string(),
  heroImage: z.string(),
  heroFocal: z.string().default("50% 50%"),
  images: z.array(z.string()).min(1),
  finishes: z.array(z.string()),
  seo: z.object({ title: z.string(), description: z.string() }),
});
export type Project = z.infer<typeof schema> & { body: string };

const dir = path.join(process.cwd(), "content/projects");
const slugs = fs.readdirSync(dir).filter((f) => f.endsWith(".en.mdx")).map((f) => f.replace(".en.mdx", "")).sort();

function load(slug: string, locale: Locale): Project {
  const file = path.join(dir, `${slug}.${locale}.mdx`);
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const p = schema.parse(data);
  if (p.slug !== slug) throw new Error(`${file}: slug mismatch`);
  for (const id of [p.heroImage, ...p.images]) if (!photoIds.includes(id)) throw new Error(`${file}: unknown photo ${id}`);
  for (const s of p.services) if (!services.some((x) => x.slug === s)) throw new Error(`${file}: unknown service ${s}`);
  for (const c of p.finishes) if (!getFinish(c)) throw new Error(`${file}: unknown finish ${c}`);
  return { ...p, body: content.trim() };
}

export const projectSlugs = slugs;
export const getProjects = (locale: Locale) => slugs.map((s) => load(s, locale));
export const getProject = (slug: string, locale: Locale) => load(slug, locale);
/** A client's name is only ever shown when permission was given. */
export const publicClientName = (p: Project) => (p.clientPermission ? p.clientName : null);
