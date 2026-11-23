import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import type { ServiceContent } from "@/lib/content";
import { getFinish, finishLabel } from "@/lib/finishes";
import { photosByService, type PhotoId } from "@/lib/photos";
import { image } from "@/components/story/media";
import { StickyMediaScroller, type ScrollerBlock } from "@/components/story/StickyMediaScroller";

const EXCLUDE = new Set(["process-stamping-fan-cobble-01"]);
const plain = (md: string) => md.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").split(/\n\n+/)[0].trim();

/** Cula-style scroller: What it is, Where it works, Patterns and colours, How we build it, Care and lifespan. Built only from real content on the page; blocks with no data are skipped. */
export async function ServiceScroller({ slug, c, locale, label }: { slug: string; c: ServiceContent; locale: Locale; label: string }) {
  const t = await getTranslations({ locale, namespace: "service.scroller" });
  const ts = await getTranslations({ locale, namespace: "services" });
  const pool = [c.heroImage, ...photosByService(slug).map((p) => p.id)].filter((x, i, a): x is string => !!x && a.indexOf(x) === i && !EXCLUDE.has(x));
  if (pool.length === 0) return null; // no photos yet: the page keeps its plain layout
  const pic = (i: number) => image(pool[i % pool.length] as PhotoId, locale, { focal: i === 0 ? c.heroFocal : undefined });

  const names = c.options.map(getFinish).filter((f) => !!f).slice(0, 3).map((f) => finishLabel(f!, locale, ts(`${f!.family}.name`)));
  const steps = (c.story.length ? c.story.map((s) => s.title) : c.processSteps.map((s) => s.title)).join(" → ");
  const care = c.faqs.find((f) => /maint|clean|care|عناية|يُصان|تُنظَّف|أعتني|كيف/i.test(f.q) && !f.confirm);

  const raw: { id: string; title: string; text: string }[] = [
    { id: "what", title: t("blocks.what"), text: plain(c.body) },
    { id: "where", title: t("blocks.where"), text: t("whereText", { list: c.applications.join(locale === "ar" ? "، " : ", ") }) },
    ...(names.length ? [{ id: "options", title: t("blocks.options"), text: t("optionsText", { names: names.join(locale === "ar" ? "، " : ", ") }) }] : []),
    ...(steps ? [{ id: "how", title: t("blocks.how"), text: t("howText", { steps }) }] : []),
    ...(care ? [{ id: "care", title: t("blocks.care"), text: care.a }] : []),
  ];
  if (raw.length < 3) return null;
  const blocks: ScrollerBlock[] = raw.map((b, i) => ({ ...b, media: pic(i) }));
  return (
    <section className="py-16 md:py-24" aria-label={label}>
      <StickyMediaScroller blocks={blocks} label={label} />
    </section>
  );
}
