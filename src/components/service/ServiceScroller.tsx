import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import type { ServiceContent } from "@/lib/content";
import { getFinish, finishLabel, type Finish } from "@/lib/finishes";
import type { PhotoId } from "@/lib/photos";
import { image } from "@/components/story/media";
import { StickyMediaScroller, type ScrollerBlock } from "@/components/story/StickyMediaScroller";

const plain = (md: string) => md.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").split(/\n\n+/)[0].trim();

/** Up to `n` finishes with different pattern names, in catalogue order. Catalogue entries are never renamed or edited. */
export function distinctExamples(codes: string[], n = 3): Finish[] {
  const seen = new Set<string>(); const out: Finish[] = [];
  for (const f of codes.map(getFinish)) { if (!f || seen.has(f.pattern.en)) continue; seen.add(f.pattern.en); out.push(f); if (out.length === n) break; }
  return out;
}

/**
 * Cula-style overview: What it is, Where it works, Patterns and colours, How we build it, Care and lifespan.
 * Every block's photo is chosen by subject in the service's content (`overview`); the care block comes from the
 * explicit `care` field. Blocks without data are skipped, and the section is omitted when there are fewer than three.
 */
export async function ServiceScroller({ c, locale, label }: { c: ServiceContent; locale: Locale; label: string }) {
  const t = await getTranslations({ locale, namespace: "service.scroller" });
  const ts = await getTranslations({ locale, namespace: "services" });
  const ov: NonNullable<ServiceContent["overview"]> = c.overview ?? {};
  const list = (a: string[]) => a.join(locale === "ar" ? "، " : ", ");
  const examples = distinctExamples(c.options).map((f) => finishLabel(f, locale, ts(`${f.family}.name`)));
  const steps = (c.story.length ? c.story.map((s) => s.title) : c.processSteps.map((s) => s.title)).join(" → ");

  const raw = [
    { id: "what", title: t("blocks.what"), text: plain(c.body) },
    { id: "where", title: t("blocks.where"), text: t("whereText", { list: list(c.applications) }) },
    ...(examples.length ? [{ id: "options", title: t("blocks.options"), text: t("optionsText", { names: list(examples) }) }] : []),
    ...(steps ? [{ id: "how", title: t("blocks.how"), text: t("howText", { steps }) }] : []),
    ...(c.care ? [{ id: "care", title: t("blocks.care"), text: c.care }] : []),
  ] as { id: "what" | "where" | "options" | "how" | "care"; title: string; text: string }[];

  const blocks: ScrollerBlock[] = raw.flatMap((b) => {
    const o = ov[b.id];
    return o ? [{ ...b, media: image(o.photo as PhotoId, locale, { focal: o.focal, focalMobile: o.focalMobile }) }] : [];
  });
  if (blocks.length < 3) return null;
  return (
    <section className="py-16 md:py-24" aria-label={label}>
      <StickyMediaScroller blocks={blocks} label={label} />
    </section>
  );
}
