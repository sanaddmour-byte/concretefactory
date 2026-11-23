# Phase 0 Plan: decorative & architectural concrete site

Status: **awaiting "go"**. No application code has been written.

## 1. Sitemap confirmation

The sitemap in the brief (§3) is adopted unchanged: 14 route types × `ar|en`, 9 service pages, 6 seeded projects, finish detail pages generated from `content/finishes/*.json`. Additions I propose (all small):

| Addition | Why |
|---|---|
| `not-found` and `error` pages per locale | Required states (§6); not in the sitemap |
| `/{locale}/quote/success?ref=` | Success state needs its own URL so refresh doesn't resubmit |
| `/api/*` kept to zero; wizard and visit use server actions | Matches the brief |
| `/llms.txt`, `/robots.txt`, `/sitemap.xml` at root | §8.4 |

Routing: `app/[locale]/...` with next-intl, `localePrefix: always`, default locale `{{ar|en}}` (unknown, see §8). Language switcher keeps the same path.

## 2. User flows per audience

**Homeowner:** Home hero → bento tile (e.g. Stamped concrete) → service page gallery → finish added to sample list → sticky bar "WhatsApp" *or* Quote wizard (service and finishes pre-filled) → success + WhatsApp handoff. Fallback: Visit page for a sample visit.

**Architect / contractor:** Home (or direct) → For Architects → finish codes table → copy spec text / download spec sheet → sample box request form (finish codes + firm + delivery city) → technical contact. Secondary: Projects index filtered by sector.

**Industrial client:** Home industrial band → Industrial floors page (dark theme, spec table) → "Request a floor specification" → wizard pre-set to `industrial-floors`, project type `industrial` → site visit request via WhatsApp/call.

The home page routes all three with: hero (homeowner), bento (all), industrial band (industrial), "For Architects" in nav and a link under the Finish Library teaser (architects).

## 3. Design tokens

All as CSS variables in `app/globals.css` and mapped into the Tailwind v4 `@theme`. No hex values in components.

| Token group | Values |
|---|---|
| Neutral 50→950 | `#F7F6F4 #EFEDE9 #E2DFD9 #CFCBC3 #A9A49B #858077 #67635C #4D4A45 #34322F #22211F #151413` |
| Neutrals (revised: pure greys) | `#F7F7F7 #EFEFEF #E1E1E1 #CDCDCD #A6A6A6 #808080 #636363 #4A4A4A #333333 #212121 #141414` |
| Punch: maroon (revised) | light `#8A2433` (hover `#6E1B28`); dark surfaces `#E88C96` |
| Hint: yellow (revised) | `#E3B53A`: decorative on light (1.8:1), focus ring on dark, logo mark, primary-button underline |
| Secondary: olive (revised) | text `#5C6330` (6.0:1 on n-50), tint `#F1F2EA`, dark-surface `#A9B26A` |
| Spacing | 4 px base; sections 96–128 desktop / 64 mobile |
| Radius | `--radius-control: 6px`, `--radius-card: 12px` |
| Type scale | 12 / 14 / 16 / 18 / 20 / 24 / 32 / 40 / 56 / 72 |
| Motion | UI 150–250 ms, page 300–450 ms, ease-out in / ease-in out |
| Semantic | success `#2F6B3F`, warning `#8A5A00`, danger `#B3261E`, info `#2F5D8A` (to be verified in Phase 1) |

**Contrast, measured (WCAG formula):**

| Pair | Ratio | Verdict |
|---|---|---|
| Oxide `#A3521F` on neutral-50 | 5.14 | AA pass (brief's 5.1 confirmed) |
| Oxide on neutral-100 | 4.75 | AA pass |
| **Oxide on neutral-200** | **4.17** | **Fails AA for body-size text** |
| Oxide-dark `#E08A4F` on neutral-900 / 950 | 6.07 / 6.94 | Pass |
| White on maroon `#8A2433` (button) | 8.82 | Pass |
| Maroon on neutral-50 / 200 | 8.23 / 6.75 | Pass (revised palette removes the earlier neutral-200 failure) |
| Maroon-dark `#E88C96` on neutral-900 | 6.61 | Pass |
| Yellow on maroon / on neutral-950 | 5.31 / 9.59 | Pass; yellow on light is decorative only |
| Olive `#5C6330` on neutral-50 | 5.97 | Pass |
| Neutral-500 on neutral-50 | 3.63 | Fails; decorative or large text only (brief agrees) |
| Neutral-600 on neutral-50 | 5.53 | Pass; used for secondary text |

Rule: yellow never carries text on light surfaces; everything else in the revised palette passes AA on the surfaces it is used on.

Fonts: Oswald (display, all weights 200-700; no italic exists), Oswald (EN body too; client decision), Tajawal (AR; ExtraBold for display, regular for body; +10% line-height). Loaded with `next/font/google`, which self-hosts at build time (reachable from this environment).

## 4. Wireframe descriptions

### 4.1 Home (12 blocks)
1. **Header**: logo | Services (mega-menu: 4 family columns, thumbnail each) · Projects · Finish Library · For Architects · About | lang · WhatsApp icon · **Get a quote**. Mobile: bottom-sheet menu + sticky Quote/WhatsApp/Call bar after hero leaves view.
2. **Hero**: split. Copy block (H1 ≤8 words, subhead, primary CTA, text link) on the inline-start side; framed 3:4 portrait of the fan driveway on the other (native 960×1280 shown at ≤ 100%). 1.00→1.04 scale only under `no-preference`.
3. **Trust strip**: renders only if `site.json` stats are non-null. Hidden in production today.
4. **Bento grid**: 12-col, stamped (large, 2×2) and industrial (large, 2×2 on dark tile); other seven medium/small. Photo + name + one-line benefit. Missing-photo tiles use the texture placeholder.
5. **Featured project**: fan driveway (large) + compass medallion (inset). Facts row with `{{CONFIRM}}` fields.
6. **Process**: scroll-driven horizontal timeline, 6 steps, `animation-timeline: scroll()`; fallback vertical list. Mirrors in RTL.
7. **Finish Library teaser**: 6 square swatches, view-transition names per code, CTA.
8. **Industrial band** (neutral-950): trowel photo + 2 fibre photos, 4 spec bullets (all `{{CONFIRM}}`, so hidden in production), CTA to `/quote?service=industrial-floors`.
9. **Testimonials**: data-gated, hidden.
10. **FAQ**: 8-item accordion (native `<details>` for no-JS), answers needing facts flagged `{{CONFIRM}}`.
11. **Final CTA band**: Quote + WhatsApp.
12. **Footer** (neutral-950): families, company, contact, hours, map link, socials, lang, legal.

### 4.2 Service template
Breadcrumb/H1/promise/CTA/WhatsApp → art-directed hero → "Where it works" chips → Options grid (links into finishes) → masonry gallery + keyboard/swipe lightbox → spec table (+ Copy spec text, Download PDF placeholder) → process (shared component) → related projects (≤3) → service FAQ (4–6) → CTA band. Sections self-hide when their data is empty or placeholder in production.

### 4.3 Finish Library
Toolbar (sticky): filters for family, indoor/outdoor, colour family, texture, with result count and "Clear filters". Grid of 1:1 swatches on neutral-100, no overlays. Swatch: tap/click → detail via View Transition; hover → 2× lens (desktop, pointer:fine); "+" toggle adds to sample list (max 6) with check animation and a toast with Undo. A persistent "Sample list (n)" tray links to `/visit` and `/quote`. List kept in localStorage (try/catch) and passed via URL.

### 4.4 Quote wizard
One route, step in URL (`?step=1..5`), so browser Back works. Progress bar + `aria-live` step announcement. ≤4 inputs per step (verified per step below):

| Step | Inputs |
|---|---|
| 1 What | service cards (multi-select) |
| 2 Where & how big | project type, city, size, indoor/outdoor (4) |
| 3 Finish & files | finish picker, file upload (2) |
| 4 Timing | start window, budget band (2, budget hidden until confirmed) |
| 5 Contact | name, mobile, channel (+ email if channel = email) (4 max) |

Server action: zod validation, Resend email with attachments, reference number, success page with WhatsApp `wa.me` handoff in the active language. Draft in localStorage with restore prompt.

## 5. Photo-to-page placement map (from manifest)

| Photo | Placement | Treatment / caution |
|---|---|---|
| stamped-cobblestone-fan-driveway-01 (960×1280) | Home hero, featured project, stamped page hero, project (a) | Max display ≈ 960 px wide; split layout only. Strongest asset. |
| stamped-compass-rose-medallion-01 | Featured project inset, project (b), stamped gallery | Plate already pixelated |
| process-stamping-mat-lift-01 + stamped-herringbone-sealed-01 | "Fresh → Sealed" diptych (stamped page) | Static diptych, honest caption. Slider component built but disabled. |
| process-stamping-herringbone / tamping / fan-cobble | Process timeline (steps Pour→Finish), stamped gallery | fan-cobble shows a third-party mat brand: not a hero, not first in any set; consider crop |
| stamped-herringbone-sealed, stamped-ashlar-sealed | Finish Library (ST-HB / ST-AS), stamped options | Swatch crops, 1:1 |
| terrazzo-cream-black, terrazzo-grey-multicolour | Finish Library, terrazzo page options | 1024×768 and 1280² |
| exposed-aggregate-marble-mix | Finish Library, exposed-aggregate hero (square, framed) | 1956² |
| specialty-cyan-aggregate | Finish Library only, exposed-aggregate/terrazzo options | Labelled "coloured aggregate". **No glow claim** until confirmed. 1024×767. |
| industrial-floor-power-trowel | Industrial band, industrial page (process) | In-progress; **not a hero** |
| materials-steel-fibers-glued / loose | Industrial band, industrial page (reinforcement) | |
| countertop-waterfall-island, countertop-island-sink-cutout | Countertops page, project (d), bento | Tight crop to hide tape/debris; crop recorded as `focal` + aspect in content |
| firepit-recessed-seating-01 / 02 | Fire pits page, project (c), bento | 780×1040: small, ≤ 780 px display |
| wall-architectural-panels-01 | Walls page, project (e) | Crop to wall plane |
| *(none)* | interior-floors, sinks | Texture placeholder (dev only), whole sections hidden in prod. Pages still ship. |
| *(none)* | Home industrial *hero*, About, Visit | Same |

Photo pipeline: a build script reads `assets/manifest.json` and writes responsive AVIF/WebP derivatives (sharp, EXIF stripped) so no originals ship in `public/`. Typed loader returns `{src, width, height, alt[locale], notes}`; the build fails on a missing path.

Brief vs. data discrepancies noted: the brief says stamped concrete has 9 photos, the manifest has 8; manifest service `specialty-aggregates` has no service page (handled as Finish Library entries as the brief intends).

## 6. Placeholders needed from you

**Required to launch:** company name and one-liner; city/country and service-area list; default language; phone, WhatsApp, email, address, hours, Maps link; logo (or approval to design a wordmark); sales email for quotes and SLA ("reply within …"); Resend sender domain; real project titles/facts (area, year, duration) for the 6 seeded projects; finish codes scheme and names; spec values per service (thickness, reinforcement, sealer, slip rating, maintenance, lead time); FAQ confirmations.

**Optional (blocks hide if absent):** years in business, m² delivered, projects completed, client logos, certifications, testimonials with permission, budget bands, CAD/BIM availability, closed days / booking tool link, Arabic-Indic digit preference.

**Confirmations:** cyan aggregate type (glow or coloured glass); finish-library codes; photo permissions for client-identifiable projects.

Photo shot list is in `PHOTO_SHOTLIST.md` (7 must-haves, led by a wide landscape hero ≥3000 px).

## 7. Risks and decisions I'm making

1. **Hero resolution:** split layout as briefed; reassess when a landscape hero exists.
2. **Oxide on neutral-200 fails AA:** guarded by token pairing rules (§3).
3. **View Transitions + next-intl + App Router:** use `next/view-transitions`-style wrapper if stable in the chosen Next version, otherwise native `document.startViewTransition` on client navigation, with graceful fallback.
4. **Draft/quote attachments:** 5 × 10 MB exceeds Vercel's default server-action body limit (4.5 MB on Functions). Plan: raise `serverActions.bodySizeLimit` where the plan allows, else upload to Vercel Blob and email links. **This needs your decision before Phase 5** (see assumptions).
5. **Performance budget:** all pages server-rendered; wizard, lightbox and Finish Library filters are the only client islands. Bundle checked per route.
6. **Lighthouse targets** need a deployed build and a throttled run; I'll measure locally with Playwright's Chromium and report honestly if lab numbers differ.
7. **Versions:** latest stable Next.js / Tailwind v4 / next-intl will be resolved and pinned in Phase 1 from the registry, not from memory.

## 8. Assumptions (tell me if any are wrong)

- Default locale **Arabic** (Jordan, +962), Western digits.
- Single repo root = the Next.js app (the setup script expects `concretefactory/package.json` relative to the checkout parent, i.e. the app lives at the repo root).
- pnpm as package manager.
- Content in MDX/JSON as in §10 of the brief; no CMS.
- Analytics: events emitted through a thin `track()` that logs in dev and is a no-op in prod until you pick a provider.
- Dark theme toggle **not** built (dark only on industrial band, industrial page, footer).
- Quote attachments: Resend attachments up to the platform limit first; fall back to Blob links (decision in Phase 5).
- Until real data exists, production builds hide gated blocks and the site will look sparse. That is intentional.

## 9. Phase 1 deliverables (next, after "go")

Next.js app scaffold, tokens, fonts, ar/en routing with RTL, layout, header + mega-menu, mobile bottom bar, footer, dev placeholder-badge system, manifest-driven image pipeline and typed loader, zod content validation harness; screenshots at 360/768/1024/1440 in both locales.

## 10. Confirmed facts (from the client)

| Field | Value |
|---|---|
| Company (EN) | Concrete Factory |
| Company (AR) | كونكريت فاكتوري |
| Tagline / one-liner (EN) | Building better spaces with concrete |
| Tagline / one-liner (AR) | نبني مساحات أفضل بالخرسانة *(draft translation, confirm)* |
| Default language | English; Arabic (RTL) available |
| Base | Amman, Jordan |
| Service area | All of Jordan |
| Phone | +962 79 717 9702 |
| WhatsApp | `{{CONFIRM}}` assumed same as phone |
| Email | `{{PLACEHOLDER}}` |
| Currency/digits | Western digits; +962 default for mobile validation |

Still open: address, hours, Maps link, sales/quote email and reply SLA, logo (or approval for a wordmark), social links.

## 11. Additional photos supplied (11): placement

Added to `assets/manifest.json` (EXIF/GPS stripped on import). Client approved their use as samples and offerings in the stamped-concrete and terrazzo sections.

| Photo id | Use |
|---|---|
| stamped-concentric-circles-01, stamped-slate-grey-01, stamped-slate-terracotta-01, stamped-fan-cobble-red-sealed-01, stamped-fan-cobble-gold-01 | Finish Library swatches + stamped page "Options" (confirm pattern/colour names) |
| stamped-ashlar-ochre-01 | Stamped page gallery (wide finished surface) |
| stamped-square-tile-brown-01 | Small gallery use only: 720 px wide, person's shadow visible |
| terrazzo-beige-black-red-01, terrazzo-grey-pink-large-chip-01 | Finish Library swatches + terrazzo page options |
| terrazzo-polished-floor-joint-01 | Terrazzo gallery as an installed-floor shot, small only (720 px wide, glare, smear top-left) |
| finish-tan-sawcut-01 | Tagged `interior-floors`; **finish type to be confirmed** before any use |

The red sealed fan-cobble swatch is the strongest on-brand (maroon) image for the home Finish Library teaser.

Four more samples (also approved): `stamped-flagstone-pebble-blue-01`, `stamped-rock-rose-terracotta-01` (Finish Library swatches), `stamped-brick-terracotta-floor-01` (stamped gallery, installed floor, ≤1024 px), `terrazzo-cream-multi-chip-01` (terrazzo swatch). Colour/pattern names still to be confirmed.

## 12. Changes after client feedback
- **Hero** is now `stamped-plaza-palms-curve-01` (palm-lined plaza, two-tone stamped concrete). Still portrait (1117×1280), so the split layout stays. The old fan-driveway photo is a regular project photo.
- **Typography:** Oswald for all English text (display and body). Arabic stays Tajawal (Oswald has no Arabic glyphs).
- **Photo privacy:** `countertop-island-cutout-01` is cropped to remove two people from the original frame.
- 7 more photos added (42 total): plaza ×2, courtyard, two low-angle stamped shots, two countertops.

## 13. New phase: Finish naming (Phase 4a, before the Finish Library is built)

When we reach it, **stop and ask the client for each photo's pattern name and colour name** (EN + AR), plus their finish code if they have one. Nothing is named by us.

- **Pack for the client:** `docs/finish-naming-pack.zip` (22 numbered photos + `names-sheet.csv` + README). Already prepared so the names can be collected before we get there.
- **Open confirmations bundled in:** cyan aggregate type (coloured glass vs glow stones), the tan saw-cut finish type, and whether the green-grey concentric-circles tone is pigment or weathering.
- **Until names arrive:** the Finish Library, finish detail pages and "Options" grids stay hidden in production; dev builds show `{{CONFIRM}}` badges. No generic names ("slate", "cobble") appear in copy.
- **Output of the phase:** `content/finishes/{code}.json` files filled with the supplied EN/AR names, codes assigned (proposed by us, approved by client).

Revised phase order: 0 Plan, 1 Foundation, 2 Home, 3 Service pages, **4a Finish naming**, 4b Projects + Finish Library, 5 Quote wizard + visit, 6 Architects/About/Contact/FAQ/legal, 7 Hardening.

## 14. Phase 2 delivered, with scrollytelling (see docs/BRIEF.md §7b)

**Decision:** CSS scroll-driven animations + `position: sticky` (no GSAP). It matches the brief's rules (no JS scroll listeners, no scroll-jacking), costs 0 KB of JavaScript and has nothing to clean up. Home JS is 167 KB gzipped against the 170 KB budget, almost all React/Next baseline. Falls back to stacked, readable content for reduced motion, unsupported browsers and no-JS.

**Built on the home page:** hero image scroll drift/zoom; trust strip (hidden: no real stats); service bento (9 tiles); featured project with layered parallax; **pinned 4-stage stamped-concrete process story** (real stamping photos + sealed result, captioned honestly); 6-step project strip; Finish Library teaser (6 real swatches, family labels only, no invented names); dark industrial band; testimonials (hidden: none supplied); 8-question FAQ; final CTA.

**Known gaps (by design):** links to `/services/*`, `/projects/*`, `/finishes`, `/quote` 404 until Phases 3-5; interior floors and sinks tiles use the texture placeholder; no layered/separable assets yet, so no layer-separation effect; the process story covers stamping only (no photos for survey, sub-base, pour).
