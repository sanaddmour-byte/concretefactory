import { routing, type Locale } from "@/i18n/routing";
import { services } from "./services";
import { projectSlugs } from "./projects";
import { finishes, finishSlug } from "./finishes";

/** Public origin. Defaults to the production domain; the preview/CI builds override it. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://theconcretefactoryjo.com").replace(/\/$/, "");

/**
 * Only the real production build may be indexed. The GitHub Pages preview (NEXT_PUBLIC_PREVIEW=1),
 * any build under a sub-path, and anything not served from the production domain stay out of search.
 */
export const indexable = process.env.NEXT_PUBLIC_PREVIEW !== "1" && !process.env.NEXT_PUBLIC_BASE_PATH && siteUrl === "https://theconcretefactoryjo.com";

/** Locale-less paths of every public page ("" = home). */
export function publicPaths(): string[] {
  return [
    "",
    "/services",
    ...services.map((s) => `/services/${s.slug}`),
    "/projects",
    ...projectSlugs.map((s) => `/projects/${s}`),
    "/finishes",
    ...finishes.map((f) => `/finishes/${finishSlug(f)}`),
    "/about",
    "/architects",
    "/faq",
    "/contact",
    "/quote",
    "/visit",
    "/legal/privacy",
  ];
}

export const abs = (locale: Locale, path: string) => `${siteUrl}/${locale}${path}`;
export const locales = routing.locales;
