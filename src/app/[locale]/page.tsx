import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Photo } from "@/components/ui/Photo";
import { buttonClass } from "@/lib/ui";
import { TrustStrip } from "@/components/home/TrustStrip";
import { ServiceBento } from "@/components/home/ServiceBento";
import { FeaturedProject } from "@/components/home/FeaturedProject";
import { ProcessStory } from "@/components/home/ProcessStory";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { FinishTeaser } from "@/components/home/FinishTeaser";
import { IndustrialBand } from "@/components/home/IndustrialBand";
import { Testimonials } from "@/components/home/Testimonials";
import { Faq } from "@/components/home/Faq";
import { FinalCta } from "@/components/home/FinalCta";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });
  const tc = await getTranslations({ locale, namespace: "cta" });

  return (
    <>
      <section id="hero" className="container-page grid grid-cols-1 items-center gap-10 py-12 md:grid-cols-2 md:py-20">
        <div>
          <p className="mb-4 flex items-center gap-3 text-sm font-medium uppercase tracking-widest text-olive-600">
            <span aria-hidden className="h-0.5 w-8 bg-yellow" />
            {t("kicker")}
          </p>
          <h1 className="display text-4xl md:text-6xl">{t("title")}</h1>
          <p className="mt-6 max-w-[60ch] text-lg text-n-700">{t("sub")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/quote" className={buttonClass("primary")}>{tc("quote")}</Link>
            <Link href="/projects" className="inline-flex min-h-11 items-center font-medium text-maroon underline-offset-4 hover:underline">{t("seeWork")}</Link>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[520px] overflow-hidden rounded-card bg-n-100">
          <Photo id="stamped-plaza-palms-curve-01" locale={locale} priority sizes="(min-width: 768px) 520px, 100vw" className="hero-drift" />
        </div>
      </section>
      <TrustStrip locale={locale} />
      <ServiceBento locale={locale} />
      <FeaturedProject locale={locale} />
      <ProcessStory locale={locale} />
      <ProcessSteps locale={locale} />
      <FinishTeaser locale={locale} />
      <IndustrialBand locale={locale} />
      <Testimonials locale={locale} />
      <Faq locale={locale} />
      <FinalCta locale={locale} />
    </>
  );
}
