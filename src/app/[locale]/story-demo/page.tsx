import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { image } from "@/components/story/media";
import { Chapter } from "@/components/story/Chapter";
import { ChapterLink } from "@/components/story/ChapterLink";
import { ChapterRail } from "@/components/story/ChapterRail";
import { LineReveal } from "@/components/story/LineReveal";
import { PinnedStage } from "@/components/story/PinnedStage";
import { StickyMediaScroller } from "@/components/story/StickyMediaScroller";
import type { StageStep } from "@/components/story/types";

export const metadata: Metadata = { title: "Story engine demo", robots: { index: false, follow: false } };

/** Engine demo. Not part of the public site: hidden in production unless STORY_DEMO=1. */
export default async function StoryDemo({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  if (process.env.NODE_ENV === "production" && !process.env.STORY_DEMO) notFound();
  setRequestLocale(locale);
  const l = locale as Locale;
  const ar = l === "ar";
  const t = await getTranslations({ locale: l, namespace: "story" });
  const tx = (en: string, a: string) => (ar ? a : en);

  const raw: StageStep[] = [
    { id: "r1", caption: tx("Stone, chosen by eye.", "حجر يُختار بالعين."), media: image("exposed-aggregate-marble-mix-01", l, { zoom: { from: 1.3, to: 1 } }) },
    { id: "r2", caption: tx("Chips, ready to be set.", "رقائق جاهزة للتثبيت."), media: image("terrazzo-grey-multicolour-01", l, { zoom: { from: 1.15, to: 1 } }) },
    { id: "r3", caption: tx("Steel, to carry the load.", "فولاذ ليتحمّل الأحمال."), media: image("materials-steel-fibers-loose-01", l, { zoom: { from: 1.15, to: 1 } }) },
  ];
  const craft: StageStep[] = [
    { id: "c1", title: tx("Pour", "الصب"), caption: tx("The slab is placed and ready for the mats.", "تُصبّ البلاطة وتتهيأ للقوالب."), media: image("process-stamping-fan-cobble-01", l) },
    { id: "c2", title: tx("Press", "الضغط"), caption: tx("Mats are pressed into the fresh surface.", "تُضغط القوالب على السطح الطازج."), media: image("process-stamping-herringbone-01", l) },
    { id: "c3", title: tx("Stamp", "الطبع"), caption: tx("Stamped to an even depth.", "يُطبع بعمق متساوٍ."), media: image("process-stamping-tamping-01", l) },
    { id: "c4", title: tx("Lift", "الرفع"), caption: tx("The mat lifts to reveal the pattern.", "يُرفع القالب فيظهر النقش."), media: image("process-stamping-mat-lift-01", l) },
    { id: "c5", title: tx("Seal", "الحماية"), caption: tx("A sealed result (not the same slab).", "نتيجة مختومة (ليست للبلاطة نفسها)."), media: image("stamped-herringbone-sealed-01", l) },
  ];
  const modes: StageStep[] = [
    { id: "m1", title: "video-scrub", caption: tx("MP4 scrubbed through currentTime.", "فيديو يُمرَّر عبر currentTime."), media: { type: "video-scrub", src: "/demo/scrub.mp4", poster: "/demo/poster.webp", alt: tx("Demo footage pulling back from an aggregate surface", "لقطة تجريبية تبتعد عن سطح ركام") } },
    { id: "m2", title: "frame-sequence", caption: tx("Canvas drawing 30 preloaded WebP frames.", "لوحة ترسم 30 إطاراً محمّلاً مسبقاً."), media: { type: "frame-sequence", base: "/demo/frames/f-", count: 30, ext: "webp", poster: "/demo/poster.webp", alt: tx("Demo frames pulling back from an aggregate surface", "إطارات تجريبية تبتعد عن سطح ركام"), width: 800, height: 500 } },
  ];
  const blocks = [
    { id: "b1", title: tx("What it is", "ما هو"), text: tx("Stamped concrete takes the pattern of stone, brick or slate while it is still fresh.", "تأخذ الخرسانة المطبوعة نقش الحجر أو الطوب أو الأردواز وهي لا تزال طازجة."), media: image("stamped-herringbone-sealed-01", l) },
    { id: "b2", title: tx("Where it works", "أين تُستخدم"), text: tx("Driveways, courtyards, ramps and pool surrounds.", "مداخل السيارات والأفنية والمنحدرات ومحيط المسابح."), media: image("stamped-ashlar-sealed-01", l) },
    { id: "b3", title: tx("Patterns and colours", "الأنماط والألوان"), text: tx("From grey brick to maroon fan cobblestone.", "من الطوب الرمادي إلى حجارة المروحة المارونية."), media: image("stamped-fan-cobble-red-sealed-01", l) },
    { id: "b4", title: tx("How we build it", "كيف نبنيه"), text: tx("Pour, press, stamp, lift and seal.", "صبّ وضغط وطبع ورفع وحماية."), media: image("process-stamping-mat-lift-01", l) },
  ];

  return (
    <>
      <a href="#chapter-4" className="sr-only-x focus:not-sr-only focus:fixed focus:start-4 focus:top-16 focus:z-50 focus:rounded-control focus:bg-n-900 focus:px-4 focus:py-3 focus:text-n-50">{t("skip")}</a>
      <ChapterRail />

      <Chapter id="chapter-1" n={1} title={tx("Raw material", "المادة الخام")} theme="dark">
        <div className="container-page flex min-h-[70svh] flex-col justify-center py-24">
          <LineReveal as="h1" className="headline-xl display">{tx("It starts as stone, sand and steel.", "تبدأ حجراً ورملاً وفولاذاً.")}</LineReveal>
        </div>
        <PinnedStage steps={raw} label={tx("Raw materials", "المواد الخام")} pin={{ desktop: 300, mobile: 210 }} />
        <ChapterLink href="/services/exposed-aggregate">{tx("Exposed aggregate", "الركام المكشوف")}</ChapterLink>
      </Chapter>

      <Chapter id="chapter-2" n={2} title={tx("The craft", "الحِرفة")} theme="light">
        <div className="container-page py-24">
          <LineReveal className="headline-xl display">{tx("Pressed by hand. Read by the eye.", "تُطبع باليد وتُقرأ بالعين.")}</LineReveal>
        </div>
        <PinnedStage steps={craft} transition="wipe" counter label={tx("Stamping process", "مراحل الطباعة")} pin={{ desktop: 500, mobile: 320 }} />
        <ChapterLink href="/services/stamped-concrete">{tx("Stamped concrete", "الخرسانة المطبوعة")}</ChapterLink>
      </Chapter>

      <Chapter id="chapter-3" n={3} title={tx("Under your feet", "تحت قدميك")} theme="dark">
        <div className="container-page py-24">
          <LineReveal className="headline-xl display">{tx("Informative first. Motion second.", "المعلومة أولاً، ثم الحركة.")}</LineReveal>
        </div>
        <StickyMediaScroller blocks={blocks} label={tx("Stamped concrete", "الخرسانة المطبوعة")} />
        <ChapterLink href="/services/stamped-concrete">{tx("Stamped concrete", "الخرسانة المطبوعة")}</ChapterLink>
      </Chapter>

      <Chapter id="chapter-4" n={4} title={tx("Media modes", "أنماط الوسائط")} theme="light">
        <div className="container-page py-24">
          <LineReveal className="headline-xl display">{tx("Footage can drop in later.", "يمكن إضافة اللقطات لاحقاً.")}</LineReveal>
        </div>
        <PinnedStage steps={modes} label={tx("Media modes demo", "عرض أنماط الوسائط")} pin={{ desktop: 300, mobile: 220 }} />
        <ChapterLink href="/contact">{tx("Contact", "تواصل معنا")}</ChapterLink>
      </Chapter>
    </>
  );
}
