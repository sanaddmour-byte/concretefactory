import { getTranslations } from "next-intl/server";
import { MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Photo } from "@/components/ui/Photo";
import { getPhoto, type PhotoId } from "@/lib/photos";
import { isDev } from "@/lib/placeholder";
import { whatsappUrl } from "@/lib/site";
import { buttonClass } from "@/lib/ui";
import type { ServiceContent } from "@/lib/content";
import { Mdx } from "./Mdx";
import { LineReveal } from "@/components/story/LineReveal";

export async function ServiceHero({ slug, name, c, locale }: { slug: string; name: string; c: ServiceContent; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "service" });
  // Landscape photos get a landscape frame so nothing important is cropped away
  const landscape = c.heroImage ? getPhoto(c.heroImage as PhotoId).orientation === "landscape" : false;
  return (
    <section id="hero" className="container-page pb-12 pt-6 md:pb-20 md:min-h-[calc(100svh-var(--header-h))]">
      <nav aria-label={t("breadcrumb")} className="text-sm text-n-600">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/" className="hover:underline">{t("home")}</Link></li>
          <li aria-hidden>/</li>
          <li><Link href="/services" className="hover:underline">{t("services")}</Link></li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-n-900">{name}</li>
        </ol>
      </nav>
      <div className="mt-8 grid grid-cols-1 items-center gap-10 md:grid-cols-2">
        <div>
          <LineReveal as="h1" className="headline-xl display">{name}</LineReveal>
          <p className="mt-4 text-xl text-n-800">{c.promise}</p>
          <Mdx source={c.body} />
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href={`/quote?service=${slug}`} className={buttonClass("primary")}>{t("ctaQuote", { name })}</Link>
            <a href={whatsappUrl(t("whatsappText", { name }))} rel="noopener" className={buttonClass("secondary")}>
              <MessageCircle size={20} strokeWidth={1.5} aria-hidden /> {t("whatsappCta")}
            </a>
          </div>
        </div>
        <div className={`hero-frame relative mx-auto aspect-[4/3] w-full overflow-hidden rounded-card bg-n-200 ${landscape ? "max-w-[640px]" : "max-w-[560px] md:aspect-[4/5]"}`}>
          {c.heroImage ? (
            <Photo id={c.heroImage as PhotoId} locale={locale} fill priority focal={c.heroFocal} sizes="(min-width: 768px) 560px, 100vw" className={c.heroImage ? "" : ""} />
          ) : (
            <div className="tex-placeholder absolute inset-0">{isDev && <span className="ph-badge absolute start-3 top-3">PHOTO NEEDED: {slug} hero</span>}</div>
          )}
        </div>
      </div>
    </section>
  );
}
