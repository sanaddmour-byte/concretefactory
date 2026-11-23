# BUILD BRIEF: {{COMPANY_NAME}}, a decorative & architectural concrete company website

> **How to use:** put this file and the `assets/` folder in an empty project folder, open Claude Code there, and say:
> *"Read PROMPT.md and follow it. Start with Phase 0 and stop for my approval."*
> Fill in every `{{PLACEHOLDER}}` you can before you start. Leave unknown ones as they are; the build handles them (see §9).

---

## 0. ROLE & WORKING RULES

You are a senior product designer and senior front-end engineer. Your standard is the restraint, speed and product focus of Stripe, Linear, Vercel and Apple, applied to a **physical materials company** whose product is texture, craft and finish.

- **Plan first.** Phase 0 produces a plan and stops for my "go". After that, build one phase at a time. Stop at the end of each phase with screenshots and a short list of what changed.
- **Never invent facts.** That means company numbers, client names, logos, certifications, testimonials, prices, test results and awards (see §9).
- **Use the real photos in `assets/photos/`,** catalogued in `assets/manifest.json` (alt text EN/AR, service, role, notes). Read the manifest before designing. Follow its `notes` (crop instructions, missing shots, things to confirm).
- **Show the work.** The photos are the product. The interface stays quiet so the concrete can speak.

---

## 1. PROJECT BRIEF

| Field | Value |
|---|---|
| Company | {{COMPANY_NAME}}, {{one-line description, e.g. "Amman-based specialists in decorative, architectural and industrial concrete"}} |
| Location / service area | {{CITY, COUNTRY}}; serves {{list of cities/regions}} |
| Languages | Arabic + English, full RTL. Default language: {{ar \| en}} |
| Primary conversion | **Request a quote** (multi-step wizard) |
| Secondary conversions | WhatsApp chat (prefilled), call, book a showroom/sample visit, download a spec sheet |
| Contact | Phone {{+962…}}, WhatsApp {{+962…}}, email {{…}}, showroom/factory address {{…}}, hours {{…}}, Google Maps link {{…}} |
| Brand | Logo {{path or "propose a wordmark"}}; tone: **confident, precise, crafted, never salesy** |
| Stack | Next.js (latest stable, App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · next-intl · MDX content · react-hook-form + zod · Resend for email · deploy on Vercel |

### Audiences (design every page for all three; the home page routes them)
1. **Homeowners & villa owners.** Driveways, courtyards, kitchens, fire-pit lounges. They need inspiration, trust, a rough idea of cost and timeline, and an easy WhatsApp route.
2. **Architects, interior designers & contractors.** They need finish codes, specs, samples and project references, plus downloadable data they can put into a specification.
3. **Industrial & commercial clients.** Warehouses, factories, logistics, parking. They need performance specs, capacity, reliability and a fast site visit.

---

## 2. SERVICE CATALOGUE (information architecture)

Group the services into four families. Each service gets its own page from one shared template (§4.2). Slugs are final.

| Family | Service (EN) | الخدمة (AR) | Slug | Photos available |
|---|---|---|---|---|
| **Floors** | Industrial floors | الأرضيات الصناعية | `industrial-floors` | trowelling (in progress), steel fibres ×2. **Needs a finished-floor hero** |
| | Interior concrete floors (polished / microtopping) | أرضيات خرسانية داخلية (مصقولة / ميكروسمنت) | `interior-floors` | **none, needs photos** |
| | Stamped concrete | الخرسانة المطبوعة | `stamped-concrete` | 9 (hero, textures, process, medallion) |
| | Exposed aggregate | الخرسانة ذات الركام المكشوف | `exposed-aggregate` | 1 swatch + cyan aggregate |
| | Terrazzo (cast in-situ & precast) | التيرازو (صب موقعي ومسبق الصب) | `terrazzo` | 2 swatches. **Needs installed-floor photos** |
| **Walls** | Architectural exposed concrete walls | الجدران الخرسانية المعمارية المكشوفة | `walls` | 1 (in progress) |
| **Built-ins** | Concrete countertops & islands | أسطح وجزر المطابخ الخرسانية | `countertops` | 2 (pre-handover, crop tightly) |
| | Concrete sinks & basins | المغاسل والأحواض الخرسانية | `sinks` | **none, needs photos** |
| | Recessed fire pits & built-in seating | مواقد النار الغائرة والجلسات المدمجة | `fire-pits-seating` | 2 |

**Note on "exposed concrete":** the term covers two different products. Present them separately: *architectural exposed walls* (fair-faced, panel joints, tie holes) and *exposed aggregate* (stone revealed at the surface). Cross-link them.

**Specialty finishes, such as the cyan aggregate:** show them as entries in the Finish Library (§4.4) and as options on the exposed-aggregate and terrazzo pages, not as a service. The manifest says the cyan chips must be confirmed as photoluminescent or coloured glass. Until confirmed, describe them only as "coloured aggregate" and **do not claim a glow effect**.

---

## 3. SITEMAP

```
/{locale}                         Home
/{locale}/services                Services overview (4 families)
/{locale}/services/[slug]         9 service pages (shared template)
/{locale}/projects                Projects index (filterable)
/{locale}/projects/[slug]         Project case study
/{locale}/finishes                Finish Library (signature feature)
/{locale}/finishes/[code]         Finish detail (swatch, specs, where used)
/{locale}/architects              For architects & contractors
/{locale}/about                   About, factory & team
/{locale}/quote                   Quote wizard
/{locale}/visit                   Book a showroom / sample visit
/{locale}/contact                 Contact, map, hours
/{locale}/faq                     FAQ
/{locale}/legal/privacy           Privacy
```
`{locale}` is `ar` or `en`. Add `hreflang` pairs on every page. The language switcher keeps the user on the same page.

---

## 4. PAGE STRUCTURES

### 4.1 Home: built on the 8-block conversion skeleton, adapted for a materials company
1. **Sticky header.** Logo; nav: Services (mega-menu: 4 family columns with small thumbnails), Projects, Finish Library, For Architects, About; language switcher; WhatsApp icon button; **primary CTA "Get a quote"**. On mobile, a bottom-sheet menu, plus a **sticky bottom bar** (Quote · WhatsApp · Call) that appears once the hero scrolls out of view.
2. **Hero.** Headline of 8 words or fewer that names the outcome (draft options: *"Concrete, crafted for how you live and work."* / *"خرسانة مصمَّمة لتُعاش."*). One-line subhead listing the range. One primary CTA plus a text link "See our work". Image: `stamped-cobblestone-fan-driveway-01.jpg`. **This file is only 960×1280.** Do not stretch it full-bleed on desktop. Use a split layout (copy on one side, framed portrait image on the other) until a ≥2400 px landscape hero is supplied. Add a slow 1.00→1.04 scale on load, only when `prefers-reduced-motion: no-preference`.
3. **Trust strip.** {{years in business}}, {{m² delivered}}, {{projects completed}}, {{developer/contractor logos}}, {{certifications/standards}}. **If the data is missing, hide the block; never show fake numbers.**
4. **"Everything concrete" bento grid.** 9 service tiles of mixed sizes (stamped concrete and industrial floors large; others medium/small). Each tile shows a photo, the service name and one line of benefit, and links to its service page. Tiles with no photo use a designed "texture placeholder" (see §9) clearly marked `PHOTO NEEDED` in dev builds only.
5. **Featured project.** Case-study teaser: the fan-pattern driveway ramp, using the compass-rose medallion as a second image. Show location (city only), service, {{area}}, {{year}}, and a "View project" link.
6. **Process.** A scroll-driven horizontal timeline: **Survey & design → Sub-base & formwork → Pour → Finish (stamp / trowel / grind / expose) → Seal & cure → Handover & care**. Use the process photos (`process-*`). Steps advance with CSS scroll-driven animations; this falls back to a plain vertical list with no animation.
7. **Finish Library teaser.** 6 swatches (terrazzo ×2, exposed aggregate, herringbone, ashlar, cyan aggregate). Hovering or tapping a swatch morphs it into the finish detail page with the View Transitions API. CTA: "Explore all finishes".
8. **Industrial band.** A dark section for industrial and commercial clients: the steel-fibre photos and trowelling photo, 4 spec bullets ({{flatness class}}, {{load class}}, {{abrasion class}}, {{joint strategy}}), and a CTA "Request a floor specification" that opens the quote wizard pre-set to `industrial-floors`.
9. **Testimonials.** Real quotes only, with the client's permission, plus name, project type and city. If there are none, hide the block.
10. **FAQ.** 8 questions in an accordion (e.g. lifetime, maintenance, resealing, cracking & control joints, cost drivers, lead time, slip resistance outdoors, summer heat & curing). Mark answers that need company confirmation with `{{CONFIRM}}`.
11. **Final CTA band.** "Tell us about your project" → Quote, plus a WhatsApp button.
12. **Footer.** Services by family, company links, contact block, map link, hours, social links, language switcher, legal.

### 4.2 Service page template (one component, driven by MDX content)
1. Breadcrumb · H1 · one-line value promise · primary CTA "Get a quote for {service}" (opens the wizard pre-set to this service) · WhatsApp link with a prefilled message naming the service.
2. Hero image (art-directed crop, set per service in its content file).
3. **"Where it works":** 3–6 application chips (e.g. driveways, ramps, courtyards, pool decks).
4. **Options:** a grid of patterns, colours and textures linked to Finish Library entries.
5. **Gallery:** a masonry grid from the manifest, filtered by `service`, opening in a lightbox with keyboard and swipe support.
6. **Spec table** (the architect-facing block): thickness, reinforcement, finish method, sealer type, slip resistance, indoor/outdoor suitability, maintenance interval, lead time. Every value is `{{CONFIRM}}` until the company supplies it. Include a "Copy spec text" button and a "Download spec sheet (PDF)" link (placeholder file).
7. **Process:** the same component as the home page, with service-specific steps.
8. **Related projects:** up to 3 cards.
9. **Service FAQ:** 4–6 questions.
10. **Final CTA band.**

### 4.3 Projects
- **Index:** filter chips by service, sector (residential / commercial / industrial) and city. Cards: image, title, city, services. Filtering uses a View Transition so cards reflow smoothly.
- **Case study:** hero image → facts row (location city, year, area, services, duration) → **Challenge / Approach / Result** (3 short sections) → gallery → "Finishes used" (links into the Finish Library) → next-project link → CTA. Each project has a `clientPermission: boolean`. Never show a client's name unless it is true.
- **Seed projects from the photos:** (a) Fan-cobblestone driveway ramp, (b) Compass-rose entrance medallion, (c) Sunken fire-pit lounge, (d) Concrete kitchen islands, (e) Architectural wall, (f) Industrial basement floor. Titles and facts are `{{CONFIRM}}`.

### 4.4 Finish Library (the signature feature)
A sample wall that lets visitors browse finishes the way they would touch samples in a showroom.
- **Grid of square swatches** cropped from texture photos (`role: texture/swatch` or `texture/detail` in the manifest).
- **Filters:** family (floor / wall / built-in), indoor / outdoor, colour family (light / grey / warm / dark / multicolour), texture (smooth / patterned / aggregate).
- **Each finish** has a code ({{e.g. ST-HB-01}}), name in EN/AR, method, recommended uses, maintenance, and "projects using this finish".
- **Interactions:** swatch → detail morph via View Transitions; a 2× zoom lens on desktop hover; an "Add to sample request" toggle that builds a list (max 6) carried into `/visit` and `/quote`.
- **Keep the true colour of the material:** no colour filters or overlays on swatches. Set swatch backgrounds to neutral-100.

### 4.5 For Architects & Contractors
Spec downloads (PDF placeholders per service), finish codes table, CAD/BIM details ({{available?}}), a sample box request form (finish codes from the library plus project name, firm, delivery city), and technical support contact. Keep this page dense and table-led, like Stripe docs.

### 4.6 About
Story, factory and showroom photos ({{needed}}), team ({{optional}}), how the company controls quality ({{CONFIRM}}), and a map.

### 4.7 Quote wizard (`/quote`): the conversion engine
A multi-step form with a progress bar, at most 4 inputs per step, and Back/Next buttons. Each step is its own URL state, so the browser Back button works.
1. **What:** service cards with images (multi-select). The service is pre-selected when the wizard is opened from a service page.
2. **Where & how big:** project type (villa / apartment / commercial / industrial), city (select, from the service-area list), approximate size (m², or linear metres for countertops), indoor/outdoor.
3. **Finish & files (optional):** pick from the Finish Library (pre-filled from the sample list) and upload up to 5 photos or drawings (JPG/PNG/PDF, 10 MB each).
4. **Timing (optional):** start window (ASAP / 1–3 months / later), budget band {{optional, confirm with company}}.
5. **Contact:** name, mobile (default +962, validated), preferred channel (WhatsApp / call / email). Add email only if the channel is email.

**On submit:** a server action validates with zod, sends an email via Resend to {{sales email}} with a readable summary and attachments, and returns a reference number.
**Success state:** reference number, "We'll reply within {{SLA}}", and a **"Continue on WhatsApp"** button that opens `wa.me/{{number}}` with a prefilled summary in the user's language.
**Draft persistence:** save the draft to localStorage wrapped in try/catch; offer to restore it on return.
**Analytics events:** `quote_start`, `quote_step_{n}`, `quote_submit`, `quote_whatsapp_handoff`, `whatsapp_click`, `phone_click`, `sample_request`, `spec_download`.

### 4.8 Visit booking (`/visit`)
Showroom or sample visit: date picker (excluding {{closed days}}), time slot, name and mobile, and finishes of interest (pre-filled from the sample list). Use {{Calendly/Cal.com link}} if the company uses one; otherwise an email request.

---

## 5. DESIGN DIRECTION: "Material first"

The photos carry the colour and texture; the interface is near-monochrome **warm concrete greys** with one **oxide accent**, borrowed from the iron-oxide pigments used to colour concrete.

### 5.1 Tokens (CSS variables + Tailwind theme; no hard-coded values in components)
**Neutrals (warm concrete):**
`50 #F7F6F4 · 100 #EFEDE9 · 200 #E2DFD9 · 300 #CFCBC3 · 400 #A9A49B · 500 #858077 · 600 #67635C · 700 #4D4A45 · 800 #34322F · 900 #22211F · 950 #151413`

**Accent (oxide):**
- On light surfaces: `#A3521F`. It has 5.1:1 contrast on neutral-50, so it passes AA for text and buttons.
- On dark surfaces: `#E08A4F` (6.1:1 on neutral-900).
- Hover/pressed: shift one step darker or lighter.

**Semantic:** success, warning, danger and info. Tune each to the warm neutrals and check that each passes AA.

**Contrast rules:**
- Body text is neutral-800 or darker on light, neutral-200 or lighter on dark.
- Neutral-500 is only for decorative or large text; it is 3.6:1, which fails AA for body text.

**Theme:**
- **Light-first** for marketing pages, so grey materials render true to colour.
- The **Industrial band, Industrial floors page and footer use dark surfaces** (neutral-900/950).
- Offer a site-wide dark theme toggle only if it costs no extra complexity. Swatches must look the same in both themes.

**Type:**
- EN display: **Archivo** (variable; semi-expanded width for headlines, tight tracking). EN body: **IBM Plex Sans**.
- AR display and body: **IBM Plex Sans Arabic**, which pairs with Plex. Increase Arabic line-height by about 10%.
- At most 2 font families per language. Subset the fonts, use `font-display: swap`, and preload only the display weight.
- Scale: 12 / 14 / 16 / 18 / 20 / 24 / 32 / 40 / 56 / 72. Body text is 16–18 px with 1.55 line-height, max 70ch.

**Layout:**
- 12-column grid, max width 1280 px, 4 px spacing base.
- Section spacing: 96–128 px on desktop, 64 px on mobile.
- Radius: 6 px for controls and 12 px for cards. Concrete reads best with tight radii, so never use pill-shaped cards.

**Imagery:**
- Use real photos only.
- Image ratios: 4:5 for portrait tiles, 3:2 for project cards, 1:1 for swatches.
- Never stretch an image or upscale past 100%.
- Crop out site clutter (tape, debris) as the manifest notes say.

**Icons:** Lucide at 1.5 px stroke. Mirror only directional icons in RTL.

### 5.2 Signature details (where the "wow" lives; keep it to these)
1. **Finish Library swatch → detail morph** (View Transitions).
2. **"Fresh → Sealed" diptych** on the stamped-concrete page: `process-stamping-mat-lift-01` beside `stamped-herringbone-sealed-01`, captioned honestly as *the stamping stage and a sealed result*. The two photos are not the same slab, so do not present them as a literal before/after slider. Build a real before/after slider component, but only enable it when a true matched pair is supplied.
3. **Scroll-driven process timeline** (CSS scroll-driven animations, with a fallback).
4. **Micro-interactions:** pressed state on the primary CTA, swatch "added" check animation, inline validation ticks in the wizard.

No WebGL, no scroll-jacking, no autoplay video with sound, no parallax on text, no cursor followers.

---

## 6. COMPONENT STATES (every component, no exceptions)
- **Default, hover, focus-visible** (2 px oxide ring with an offset), **active, disabled.**
- **Loading:** skeletons for content, spinners only inside buttons.
- **Empty:** one helpful sentence plus a primary action. For example, a projects filter with no results gets "Clear filters".
- **Error:** what happened and how to fix it, next to the field.
- **Success:** a toast that dismisses after 4 s, plus an undo for removals (e.g. removing a sample).

---

## 7. MOTION
- Use the **View Transitions API** for route changes, the filter reflow, swatch → detail and project card → case study.
- Use **CSS scroll-driven animations** for section reveals, the process timeline and the header shrink. Do not use JS scroll listeners. Scroll-*triggered* animations are Chromium-only, so they must be progressive enhancement.
- **Durations:** 150–250 ms for UI and 300–450 ms for page transitions. Ease-out when entering, ease-in when exiting.
- Wrap all non-essential motion in `@media (prefers-reduced-motion: no-preference)`.

---

## 8. QUALITY BARS

### 8.1 Performance (hard limits)
- **LCP < 2.5 s, INP < 200 ms, CLS < 0.1** on a mid-range Android over 4G.
- Initial JS under 170 KB gzipped per route. Mobile page weight under 1 MB on every page except gallery pages; galleries lazy-load.
- Images: `next/image` with AVIF/WebP, correct `sizes`, blur placeholders, explicit dimensions, `priority` only on the hero.
- Server-render all content; every page must be readable with JavaScript disabled, apart from the wizard's progressive enhancements.

### 8.2 Accessibility (WCAG 2.2 AA)
- Semantic landmarks, one H1 per page and a logical heading order.
- Labels on all inputs and 44×44 px touch targets.
- The full flow, including the gallery lightbox and wizard, must work by keyboard.
- `aria-live` for wizard step changes and toasts.
- Alt text from the manifest in the active language, and colour is never the only signal.

### 8.3 Bilingual / RTL
- Use **CSS logical properties only** (`margin-inline-start`, `padding-inline`, `inset-inline`); never left/right.
- Set `dir` and `lang` on `<html>` per locale. Mirror arrows, chevrons and the process timeline direction; never mirror photos or logos.
- Arabic copy is written natively, not machine-literal. Use Western digits unless {{company prefers Arabic-Indic}}.
- Phone numbers stay LTR inside RTL text. Use `<bdi>` for mixed-direction strings.

### 8.4 SEO & AI readability
- JSON-LD: `HomeAndConstructionBusiness` (name, address, geo, hours, phone, areaServed, sameAs), `Service` per service page, `FAQPage`, `BreadcrumbList`, `ImageObject` on project galleries.
- Unique meta title and description per page per locale, Open Graph images (from the photos), XML sitemap with hreflang, `robots.txt`, and `/llms.txt` summarising services, service area and contact.
- **Keyword targets** go in headings naturally, never stuffed:
  - EN: stamped concrete, terrazzo, exposed aggregate, industrial flooring, concrete countertops, fire pit seating, architectural concrete, plus "{{city}}".
  - AR: خرسانة مطبوعة، تيرازو، خرسانة بركام مكشوف، أرضيات صناعية، أسطح مطابخ خرسانية، جلسات مواقد نار، خرسانة معمارية مكشوفة + «{{المدينة}}».

---

## 9. CONTENT & HONESTY RULES
- **Write real, specific copy** about decorative and architectural concrete. No lorem ipsum. Avoid "Unlock", "Seamless", "Elevate" and "Revolutionize". Headlines are 8 words or fewer. Button labels are outcome verbs ("Get my quote", not "Submit").
- **Unknown facts are `{{PLACEHOLDER}}` or `{{CONFIRM}}`.** In development builds, show them as visible amber dashed-outline badges so I can find them. In production builds, any block whose required data is still a placeholder (stats, logos, testimonials, certifications, prices) **is hidden automatically.**
- **Never fabricate** testimonials, reviews, client logos, ratings, awards, certifications, test results or project names.
- **Missing photos:** render a designed texture placeholder (neutral-200 with a subtle CSS-generated aggregate pattern) labelled `PHOTO NEEDED: {what}` in development builds. In production, hide gallery slots that have no photo.
- **Photo hygiene:** the licence plate in the compass-rose photo is already pixelated, and EXIF/GPS has been stripped. Keep it that way: no original files in `public/`.

---

## 10. CONTENT MODEL (editable without touching components)
```
content/
  services/{slug}.{en|ar}.mdx    frontmatter: slug, family, title, promise, heroImage, heroFocal,
                                 applications[], options[] (finish codes), specs[{label,value}],
                                 processSteps[], faqs[], relatedProjects[], seo{title,description}
  projects/{slug}.{en|ar}.mdx    slug, title, city, year, area, services[], sector, durationWeeks,
                                 clientName?, clientPermission, challenge, approach, result,
                                 images[], finishes[], seo{}
  finishes/{code}.json           code, name{en,ar}, family, indoor, outdoor, colourFamily, texture,
                                 method, uses[], maintenance, swatchImage, focal, projects[]
  site.json                      company facts, contact, hours, service areas, stats (nullable), socials
assets/manifest.json             photo catalogue (provided). Generate a typed loader from it.
```
Validate all content with zod at build time. The build fails on a missing image path or locale mismatch.

---

## 11. BUILD PHASES (stop after each one for my review)
- **Phase 0, Plan:** sitemap confirmation, the user flow for each audience, the token table, a block-by-block wireframe description of Home, the Service template, Finish Library and Wizard, a photo-to-page placement map from the manifest, the list of placeholders I need to fill, and your assumptions. **Wait for "go".**
- **Phase 1, Foundation:** project setup, tokens, fonts, i18n routing (ar/en, RTL), layout, header with mega-menu, mobile bottom bar, footer, the dev placeholder badge system, and the image loader from the manifest.
- **Phase 2, Home** (all 12 blocks).
- **Phase 3, Service template + all 9 service pages** with MDX content in both languages.
- **Phase 4, Projects + Finish Library** (filters, swatch morph, sample list).
- **Phase 5, Quote wizard + visit booking:** server actions, Resend, WhatsApp handoff, analytics events, draft restore.
- **Phase 6, Architects, About, Contact, FAQ, legal.**
- **Phase 7, Hardening:** SEO/JSON-LD, sitemap, llms.txt, performance and accessibility audit, RTL pass and cross-browser check (Chrome, Safari iOS, Firefox).

---

## 12. DEFINITION OF DONE (report against each line at the end)
- [ ] Phase 0 plan approved before any code
- [ ] Tokens used everywhere; zero hard-coded colours, sizes or radii in components
- [ ] Every component has all states (§6)
- [ ] Verified at 360, 768, 1024 and 1440 px, in **both AR (RTL) and EN**
- [ ] Lighthouse mobile on Home, a Service page and the Wizard: Performance ≥ 90, Accessibility 100, Best Practices ≥ 95, SEO 100
- [ ] Keyboard-only walkthrough of Home → Service → Quote submit passes
- [ ] One primary CTA style per page; the wizard has at most 4 inputs per step
- [ ] The quote reaches the inbox with attachments; the WhatsApp handoff opens with a correct prefilled summary in both languages
- [ ] A production build hides every block whose data is still a placeholder; dev builds show the badges
- [ ] No fabricated facts anywhere (grep for numbers in copy and justify each one)
- [ ] Final report: screenshots (light/dark sections, mobile/desktop, AR/EN), the list of remaining `{{PLACEHOLDER}}`/`{{CONFIRM}}` items, the **photo shot list still needed**, and what to A/B test first.
