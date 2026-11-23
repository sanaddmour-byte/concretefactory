import type { MetadataRoute } from "next";
import { abs, locales, publicPaths } from "@/lib/seo";

export const dynamic = "force-static";

/** One entry per locale per page; each lists both languages (and x-default) so the pairs are reciprocal. */
export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths().flatMap((p) =>
    locales.map((l) => ({
      url: abs(l, p),
      alternates: { languages: { en: abs("en", p), ar: abs("ar", p), "x-default": abs("en", p) } },
    })),
  );
}
