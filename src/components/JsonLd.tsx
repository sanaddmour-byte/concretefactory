import { site } from "@/lib/site";
import { abs, siteUrl } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

/** Server-rendered JSON-LD (readable without JavaScript). `<` is escaped so content can never close the script tag. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

const ID = `${siteUrl}/#business`;

/**
 * Business entity built only from verified facts in content/site.json: name, phone, email, city/country, service area and
 * social profiles. Street address, geo, opening hours and ratings are NOT included until the owner supplies them.
 */
export function businessLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": ID,
    name: site.name[locale],
    alternateName: site.name[locale === "ar" ? "en" : "ar"],
    slogan: site.tagline[locale],
    url: abs(locale, ""),
    logo: `${siteUrl}/icon.png`,
    image: `${siteUrl}/og/${locale}.jpg`,
    telephone: site.contact.phone,
    email: site.contact.email,
    address: { "@type": "PostalAddress", addressLocality: site.location.city[locale], addressCountry: "JO" },
    areaServed: { "@type": "Country", name: site.location.country[locale] },
    sameAs: site.socials.map((s) => s.url),
  };
}

export function serviceLd(locale: Locale, slug: string, name: string, description: string) {
  return { "@context": "https://schema.org", "@type": "Service", name, description, url: abs(locale, `/services/${slug}`), provider: { "@id": ID }, areaServed: { "@type": "Country", name: site.location.country[locale] } };
}

export function faqLd(items: { q: string; a: string }[]) {
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })) };
}

export function breadcrumbLd(locale: Locale, trail: { name: string; path: string }[]) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: abs(locale, t.path) })) };
}
