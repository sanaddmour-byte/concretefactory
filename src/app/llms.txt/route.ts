import en from "../../../messages/en.json";
import { site } from "@/lib/site";
import { services } from "@/lib/services";
import { abs } from "@/lib/seo";

export const dynamic = "force-static";

/** Plain-text summary for AI crawlers: services, service area and contact. Facts come from content/site.json and the English messages only. */
export function GET() {
  const names = en.services as Record<string, { name: string }>;
  const body = [
    `# ${site.name.en} (${site.name.ar})`,
    "",
    `> ${site.tagline.en}. Decorative, architectural and industrial concrete: floors, walls, countertops, sinks, fire pits and seating.`,
    "",
    `Based in ${site.location.city.en}, ${site.location.country.en}. Service area: ${site.serviceArea.en}. The site is available in English and Arabic.`,
    "",
    "## Services",
    ...services.map((s) => `- [${names[s.slug]?.name ?? s.slug}](${abs("en", `/services/${s.slug}`)})`),
    "",
    "## Key pages",
    `- [Finish Library](${abs("en", "/finishes")}): finish swatches and sample requests`,
    `- [Projects](${abs("en", "/projects")})`,
    `- [Request a quote](${abs("en", "/quote")})`,
    `- [Book a technical visit](${abs("en", "/visit")})`,
    `- [Arabic site](${abs("ar", "")})`,
    "",
    "## Contact",
    `- Phone and WhatsApp: ${site.contact.phoneDisplay}`,
    `- Email: ${site.contact.email}`,
    ...site.socials.map((s) => `- ${s.label}: ${s.url}`),
    "",
  ].join("\n");
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
