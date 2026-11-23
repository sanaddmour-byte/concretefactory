import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { getFinish, finishLabel } from "@/lib/finishes";
import { isDev } from "@/lib/placeholder";
import type { PhotoId } from "@/lib/photos";
import { image } from "@/components/story/media";
import { Chapter } from "@/components/story/Chapter";
import { ChapterLink } from "@/components/story/ChapterLink";
import { ChapterRail } from "@/components/story/ChapterRail";
import { Bridge, Eyebrow } from "@/components/story/Bridge";
import { LineReveal } from "@/components/story/LineReveal";
import { OpeningStage } from "@/components/story/OpeningStage";
import { PinnedStage } from "@/components/story/PinnedStage";
import { PatternsStage, type PatternItem } from "@/components/story/PatternsStage";
import { HorizontalGallery, type GalleryCard } from "@/components/story/HorizontalGallery";
import type { StageStep } from "@/components/story/types";
import { WallStage } from "@/components/story/WallStage";
import { StoryTimeline, type TimelineEntry } from "@/components/story/StoryTimeline";
import { IndustrialClose } from "@/components/home/IndustrialClose";
import { FinishWall } from "@/components/home/FinishWall";
import { QuoteStart } from "@/components/home/QuoteStart";
import { Faq } from "@/components/home/Faq";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  return { alternates: { canonical: `/${locale}`, languages: { en: "/en", ar: "/ar", "x-default": "/en" } } };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations({ locale: l, namespace: "chapters" });
  const ts = await getTranslations({ locale: l, namespace: "services" });
  const tn = await getTranslations({ locale: l, namespace: "story" });

  // Chapter 1: raw material
  const caps = t.raw("c1.caps") as string[];
  const raw: StageStep[] = [
    { id: "r1", caption: caps[0], media: image("exposed-aggregate-marble-mix-01", l, { zoom: { from: 1.3, to: 1 } }) },
    { id: "r2", caption: caps[1], media: image("terrazzo-grey-multicolour-01", l, { zoom: { from: 1.15, to: 1 } }) },
    { id: "r3", caption: caps[2], media: image("materials-steel-fibers-loose-01", l, { zoom: { from: 1.15, to: 1 } }) },
  ];

  // Chapter 2: the craft (photos come from different projects; the note says so)
  const cs = t.raw("c2.steps") as { t: string; c: string }[];
  const craftPhotos: PhotoId[] = ["industrial-slab-night-trowel-01", "process-stamping-herringbone-01", "process-stamping-tamping-01", "process-stamping-mat-lift-01", "stamped-herringbone-sealed-01"];
  const craft: StageStep[] = cs.map((s, i) => ({ id: `c${i}`, title: s.t, caption: s.c, media: image(craftPhotos[i], l) }));

  // Chapter 3: patterns, named by the client's finish data
  const pat = (code: string, focal?: string): PatternItem => {
    const f = getFinish(code)!;
    const pick = (n: { en: string; ar: string | null }) => (l === "ar" ? n.ar ?? n.en : n.en);
    return { id: code, chip: pick(f.pattern), caption: finishLabel(f, l, ts(`${f.family}.name`)), media: image(f.photo as PhotoId, l, { focal }) };
  };
  const patterns: PatternItem[] = [
    pat("ST-BRK-01"), pat("ST-ASL-01"), pat("ST-EUF-01"),
    { id: "compass", chip: t("c3.compassChip"), caption: t("c3.compass"), media: image("stamped-compass-rose-medallion-01", l), rotate: 12 },
  ];

  // Chapter 4: kitchens, sinks, fire pits (the sink card appears in development only until a photo exists)
  const cards = t.raw("c4.cards") as { t: string; l: string }[];
  const gallery: GalleryCard[] = [
    { id: "g1", title: cards[0].t, line: cards[0].l, href: "/services/countertops", media: image("countertop-waterfall-island-01", l, { focal: "50% 55%" }) },
    { id: "g2", title: cards[1].t, line: cards[1].l, href: "/services/countertops", media: image("countertop-island-sink-cutout-01", l, { focal: "50% 55%" }) },
    { id: "g3", title: cards[2].t, line: cards[2].l, href: "/services/fire-pits-seating", media: image("firepit-recessed-seating-01", l, { focal: "50% 70%" }) },
    { id: "g4", title: cards[3].t, line: cards[3].l, href: "/services/fire-pits-seating", media: image("firepit-recessed-seating-02", l, { focal: "50% 70%" }) },
    ...(isDev ? [{ id: "g5", title: cards[4].t, line: cards[4].l, href: "/services/sinks", media: null, photoNeeded: true }] : []),
  ];

  // Chapter 5: callouts sit on real features of the cropped wall strip (fractions of that crop)
  const wc = t.raw("c5.callouts") as { t: string; d: string }[];
  const wallPos = [{ x: 0.253, y: 0.36 }, { x: 0.405, y: 0.72 }, { x: 0.613, y: 0.41 }];
  // The photo is never mirrored. In Arabic the pan starts at the right end of the wall, so the callouts run right to left.
  const callouts = wc.map((c, i) => ({ id: `w${i}`, title: c.t, text: c.d, ...wallPos[i] }));
  if (l === "ar") { const xs = callouts.map((c) => ({ x: c.x, y: c.y })).sort((a, b) => b.x - a.x); callouts.forEach((c, i) => Object.assign(c, xs[i])); }

  // Chapter 6: reinforcement, then a finished floor
  const ic = t.raw("c6.caps") as string[];
  const industrialSteps: StageStep[] = [
    { id: "i1", caption: ic[0], media: image("materials-steel-fibers-glued-01", l, { zoom: { from: 1.2, to: 1 } }) },
    { id: "i2", caption: ic[1], media: image("industrial-floor-power-trowel-01", l, { focal: "50% 60%", zoom: { from: 1.15, to: 1 } }) },
  ];

  // Chapter 8: our story, told by what we do. 2018 is the only dated entry; no workshop or showroom imagery exists, so none is shown.
  const te = t.raw("c8.entries") as { l: string; t: string; x: string }[];
  const tlPhotos: (PhotoId | null)[] = [null, "stamped-plaza-palms-curve-01", "industrial-floor-power-trowel-01", "industrial-polished-hall-02", "firepit-recessed-seating-02"];
  tlPhotos[3] = "industrial-polished-hall-02";
  const entries: TimelineEntry[] = te.map((e, i) => ({ id: `t${i}`, label: e.l, title: e.t, text: e.x, media: tlPhotos[i] ? image(tlPhotos[i]!, l, { focal: i === 4 ? "50% 70%" : "50% 50%" }) : null }));

  return (
    <>
      <a href="#cta" className="sr-only-x focus:not-sr-only focus:fixed focus:start-4 focus:top-16 focus:z-50 focus:rounded-control focus:bg-n-900 focus:px-4 focus:py-3 focus:text-n-50">{tn("skip")}</a>
      <ChapterRail />

      <Chapter id="open" n={0} title={t("open.title")} theme="dark">
        <OpeningStage media={image("terrazzo-grey-pink-large-chip-01", l, { focal: "50% 50%" })} title={t("open.title")} sub={t("open.sub")} quote={t("open.quote")} work={t("open.work")} workHref="/projects" scroll={t("open.scroll")} />
      </Chapter>

      <Chapter id="material" n={1} title={t("c1.nav")} theme="dark">
        <div className="pt-24 md:pt-32">
          <Eyebrow>{t("c1.eyebrow")}</Eyebrow>
          <div className="container-page pb-10"><LineReveal className="headline-xl display">{t("c1.title")}</LineReveal></div>
        </div>
        <PinnedStage steps={raw} label={t("c1.group")} pin={{ desktop: 300, mobile: 210 }} />
        <ChapterLink href="/services/exposed-aggregate">{t("c1.link")}</ChapterLink>
        <Bridge to="light">{t("c1.bridge")}</Bridge>
      </Chapter>

      <Chapter id="craft" n={2} title={t("c2.nav")} theme="light">
        <div className="pt-8 md:pt-16">
          <Eyebrow>{t("c2.eyebrow")}</Eyebrow>
          <div className="container-page pb-10"><LineReveal className="headline-xl display">{t("c2.title")}</LineReveal></div>
        </div>
        <PinnedStage steps={craft} transition="wipe" counter label={t("c2.group")} pin={{ desktop: 500, mobile: 320 }} />
        <p className="container-page pt-4 text-sm text-n-600">{t("c2.note")}</p>
        <ChapterLink href="/services/stamped-concrete">{t("c2.link")}</ChapterLink>
        <Bridge>{t("c2.bridge")}</Bridge>
      </Chapter>

      <Chapter id="floors" n={3} title={t("c3.nav")} theme="light">
        <Eyebrow>{t("c3.eyebrow")}</Eyebrow>
        <PatternsStage title={t("c3.title")} label={t("c3.group")} intro={{ caption: t("c3.intro"), media: image("stamped-cobblestone-fan-driveway-01", l, { focal: "50% 65%" }) }} items={patterns} />
        <ChapterLink href="/finishes">{t("c3.link")}</ChapterLink>
        <Bridge>{t("c3.bridge")}</Bridge>
      </Chapter>

      <Chapter id="home" n={4} title={t("c4.nav")} theme="light">
        <Eyebrow>{t("c4.eyebrow")}</Eyebrow>
        <HorizontalGallery title={t("c4.title")} label={t("c4.group")} cards={gallery} cta={t("c4.cta")} />
        <Bridge>{t("c4.bridge")}</Bridge>
      </Chapter>

      <Chapter id="walls" n={5} title={t("c5.nav")} theme="dark">
        <div className="pt-24 md:pt-32">
          <Eyebrow>{t("c5.eyebrow")}</Eyebrow>
          <div className="container-page pb-6"><LineReveal className="headline-xl display">{t("c5.title")}</LineReveal></div>
        </div>
        <WallStage media={image("wall-architectural-strip-01", l)} callouts={callouts} label={t("c5.group")} />
        <ChapterLink href="/services/walls">{t("c5.link")}</ChapterLink>
        <Bridge>{t("c5.bridge")}</Bridge>
      </Chapter>

      <Chapter id="industrial" n={6} title={t("c6.nav")} theme="dark">
        <Eyebrow>{t("c6.eyebrow")}</Eyebrow>
        <div className="container-page pb-10"><LineReveal className="headline-xl display">{t("c6.title")}</LineReveal></div>
        <PinnedStage steps={industrialSteps} label={t("c6.group")} pin={{ desktop: 240, mobile: 170 }} />
        <IndustrialClose locale={l} />
        <ChapterLink href="/services/industrial-floors">{t("c6.link")}</ChapterLink>
        <Bridge to="light">{t("c6.bridge")}</Bridge>
      </Chapter>

      <Chapter id="finishes" n={7} title={t("c7.nav")} theme="light">
        <div className="pt-8 md:pt-16">
          <Eyebrow>{t("c7.eyebrow")}</Eyebrow>
          <div className="container-page pb-6"><LineReveal className="headline-xl display">{t("c7.title")}</LineReveal></div>
        </div>
        <FinishWall locale={l} />
        <Bridge to="dark">{t("c7.bridge")}</Bridge>
      </Chapter>

      <Chapter id="story" n={8} title={t("c8.nav")} theme="dark">
        <div className="pt-16 md:pt-24">
          <Eyebrow>{t("c8.eyebrow")}</Eyebrow>
          <div className="container-page pb-6"><LineReveal className="headline-xl display">{t("c8.title")}</LineReveal></div>
        </div>
        <StoryTimeline entries={entries} label={t("c8.group")} />
        <Bridge to="light">{t("c8.bridge")}</Bridge>
      </Chapter>

      <Faq locale={l} />

      <Chapter id="cta" n={9} title={t("c9.nav")} theme="light">
        <div className="pt-8 md:pt-16">
          <Eyebrow>{t("c9.eyebrow")}</Eyebrow>
          <div className="container-page pb-6"><LineReveal className="headline-xl display">{t("c9.title")}</LineReveal></div>
        </div>
        <QuoteStart locale={l} />
      </Chapter>
    </>
  );
}
