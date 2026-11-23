import type { Locale } from "@/i18n/routing";
import { Photo } from "@/components/ui/Photo";
import type { PhotoId } from "@/lib/photos";

/** Dark feature band: a headline claim backed by a real photo (here: glow-in-the-dark aggregate). */
export function Feature({ feature, locale }: { feature: { title: string; text: string; photo: string; caption: string }; locale: Locale }) {
  return (
    <section className="on-dark py-16 md:py-24" aria-labelledby="feat-h">
      <div className="container-page grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div className="reveal">
          <h2 id="feat-h" className="display text-4xl md:text-6xl">{feature.title}</h2>
          <p className="mt-6 max-w-[52ch] text-lg text-n-300">{feature.text}</p>
        </div>
        <figure>
          <div className="relative mx-auto aspect-square w-full max-w-[560px] overflow-hidden rounded-card bg-n-800">
            <Photo id={feature.photo as PhotoId} locale={locale} fill sizes="(min-width: 1024px) 560px, 100vw" className="layer-slow" />
          </div>
          <figcaption className="mx-auto mt-3 max-w-[560px] text-sm text-n-400">{feature.caption}</figcaption>
        </figure>
      </div>
    </section>
  );
}
