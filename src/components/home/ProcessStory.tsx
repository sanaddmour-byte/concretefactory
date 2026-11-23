import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Story, type StoryStage } from "@/components/ui/Story";
import type { PhotoId } from "@/lib/photos";

// Real photos for the stamping stages; the last is a sealed result (not the same slab, captioned honestly).
const photos: PhotoId[] = ["process-stamping-herringbone-01", "process-stamping-tamping-01", "process-stamping-mat-lift-01", "stamped-herringbone-sealed-01"];

export async function ProcessStory({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "home.story" });
  const raw = t.raw("stages") as { eyebrow: string; title: string; body: string }[];
  const stages: StoryStage[] = raw.map((s, i) => ({ ...s, photo: photos[i] }));
  return (
    <section aria-labelledby="story-h" className="pt-16 md:pt-24">
      <div className="container-page reveal max-w-3xl">
        <h2 id="story-h" className="display text-3xl md:text-5xl">{t("title")}</h2>
        <p className="mt-4 text-lg text-n-700">{t("sub")}</p>
      </div>
      <Story stages={stages} locale={locale} label={t("label")} />
      <p className="container-page pb-4 text-sm text-n-600">{t("caption")}</p>
    </section>
  );
}
