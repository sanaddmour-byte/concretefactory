# Change request: scrollytelling site + type system. Phase 0 plan

Status: **awaiting "go"**. Nothing in the live site has been converted. Phase 6 (Architects, About, Contact, FAQ, Privacy) was built alongside this plan and uses the existing components, so it converts with everything else.

Reference sites are used for principles only (pinned stages and line reveals, chronological rail, sticky media + text). No assets or code are copied.

---

## 1. What changes, what stays

| Changes | Stays |
|---|---|
| Home becomes a 10-chapter story (header, FAQ and footer kept; quote CTA stays in the header) | Content model, honesty rules, quote wizard, visit, sample list, i18n/RTL, SEO, accessibility |
| Service pages: pinned intro + Cula-style sticky media/text scroller; spec table, gallery, FAQ, CTA stay static | Projects and Finish Library behaviour (plus scroll reveals only) |
| Motion engine: GSAP + ScrollTrigger + SplitText, only on story routes | Simple reveals stay CSS scroll-driven animations (today's `.reveal`, `.hero-drift`, layers) |
| Typography: Oswald/Tajawal rules in section 6 | Palette (greys, olive, maroon, yellow). "Black" stages use dark grey, "white" light grey |

Already true: Archivo/IBM Plex are gone; Oswald (EN) and Tajawal (AR) are the only families.

## 2. Decisions and conflicts that need your OK

| # | Item | What I found | Recommendation |
|---|---|---|---|
| 1 | **GSAP replaces the CSS-only rule** from the earlier brief | Request explicitly overrides it. Measured cost: GSAP 27.7 KB + ScrollTrigger 17.6 KB + SplitText 3.6 KB = **49 KB gz** | Accept. Home today is 167 KB, so about **217 KB** vs the 230 KB limit. Other routes stay under 170 KB |
| 2 | **Today's pinned stories** (home process story, stamped and industrial stories) are CSS and would be replaced | They work and are reversible | Replace with the new engine for one consistent system; keep the CSS versions as the no-JS/reduced-motion fallback layout |
| 3 | **Opening image resolution.** Chapter 0 zooms the aggregate macro from 1.6× to 1× full-viewport | Source is 1956×1956. At a 1440 px viewport, 1.6× needs ~2300 px, so it would be upscaled about 1.2× and look soft; wider screens worse | Start at ≤1.35× with the current photo (no upscaling at 1440), or supply a ≥3000 px macro and use the full 1.6× |
| 4 | **Low-resolution photos in full-frame mechanics**: fan driveway (960×1280, chapter 3 clip reveal), fire-pit shots (780×1040, chapter 4) | Full-bleed would upscale 2–3× | Show them in framed containers capped at native size, until larger versions are supplied |
| 5 | **Chapter 2 "Pour" step uses `process-stamping-fan-cobble-01`**, which shows a third-party mat brand | Manifest note says avoid as hero; I have not found a dedicated pour photo | Crop the brand out for this step, or supply a pour photo |
| 6 | **Chapter 4 sink card is a placeholder** | Honesty rule: placeholders are hidden in production | Production shows 4 cards (islands ×2, fire pits ×2); sink card appears when a photo exists |
| 7 | **Chapter 6 spec counters** | All spec values are unconfirmed | Counter block hidden until real values exist (as you specified) |
| 8 | **Chapter 8 timeline** | `site.json` has 0 milestones; needs ≥3 real ones | Chapter hidden until you give me 3+ milestones (year, title, one line, EN and AR) and company photos |
| 9 | **Chapter 9 inline quote**: "step 1 rendered inline" | The wizard keeps its step in the URL | Render the service cards inline; a click goes to `/quote?service=…&step=2`, so the first click starts the quote without duplicating wizard logic |
| 10 | **Dark stages = neutral-950** | Your palette rule: no pure black | Use `#262626` (n-950) / `#2E2E2E` (n-900), already the dark-grey tokens |
| 11 | **Uppercase display type** in Oswald | Whole site headings change from sentence case to UPPERCASE; Arabic unaffected | Apply as specified; I'll check readability of long headings on mobile |
| 12 | **Testing limits in this environment** | I can run Chromium (Playwright), Lighthouse and 4× CPU throttle, and record video. I cannot run VoiceOver, NVDA, Safari/iOS or a real Android | I'll do everything else and give you a short manual test list for VoiceOver, NVDA and a real phone |
| 13 | **Frame-sequence and video-scrub modes** need footage | None exists | Build both modes with a generated demo asset; footage list below |

## 3. Engine (Phase 1)

Folder `src/components/story/`. GSAP is imported dynamically, only in story routes, after the LCP image has painted. `useGSAP` handles cleanup; `gsap.matchMedia()` gives three modes: `(min-width: 768px) and (prefers-reduced-motion: no-preference)` desktop, `(max-width: 767px) and (prefers-reduced-motion: no-preference)` mobile, `(prefers-reduced-motion: reduce)` static.

| Component | Role | Notes |
|---|---|---|
| `Chapter` | `<section id title theme>` wrapper; registers in the rail | Themes dark (n-900/n-950) and light (n-50). Each chapter ends with a quiet link to its service |
| `PinnedStage` | Pins for N steps; step = media + caption + optional overlay | Pin length from a `vh` prop per breakpoint. Releases when keyboard focus moves past it |
| `StageMedia` | `image` (zoom/pan/clip-reveal), `video-scrub` (MP4 `currentTime`), `frame-sequence` (canvas, preloaded AVIF/WebP), plus `webgl` interface stub | Only `image` is used now; the other two work with a demo asset. Save-Data / 2g-3g falls back to a still key frame |
| `StickyMediaScroller` | Cula-style: sticky media column + scrolling text blocks; each block swaps the image on enter | Mirrors in RTL. Stacked in static mode |
| `ChapterRail` | Fixed side rail, numbers + titles, inline-end side (mirrors in RTL) | Links with `aria-current`; thin top progress bar on mobile |
| `LineReveal` | SplitText line-by-line headline reveal | **Disabled for Arabic**: whole-block fade-and-rise instead |

Rules: only `transform`, `opacity`, `clip-path` animate. `will-change` only while a stage is active. No scroll-speed hijack, no smooth-scroll library, no scroll snap that traps (snap used only inside the mobile horizontal gallery). Back button and `#chapter` anchors land on the right chapter. A "Skip story" link at the top of Home jumps to chapter 9.

## 4. Home storyboard

Pin lengths are scroll distance. Desktop / mobile. Headlines ≤ 8 words + one supporting line; no paragraphs inside pinned stages. Arabic headlines run about 15% smaller. Arabic wording below is my working draft for your approval.

| Ch | Title (EN / AR) | Theme | Pin (D/M) | Steps: media → caption → motion |
|---|---|---|---|---|
| 0 | **CONCRETE, CRAFTED.** / «خرسانة… بحِرفة» | dark | 100vh / 80vh | `exposed-aggregate-marble-mix-01`, full viewport. Scale 1.35→1 (see #3) as headline lines reveal one by one; subline and quote CTA appear in the last 20%. This image is the LCP element: AVIF, `priority`. |
| 1 | **IT STARTS AS STONE, SAND AND STEEL.** / «تبدأ حجراً ورملاً وفولاذاً» | dark | 300vh / 210vh | 3 steps, crossfade, 1-line caption each: (1) aggregate macro "Stone, chosen by eye." (2) `terrazzo-grey-multicolour-01` "Chips, ready to be set." (3) `materials-steel-fibers-loose-01` "Steel, to carry the load." |
| 2 | **PRESSED BY HAND. READ BY THE EYE.** / «تُطبع باليد وتُقرأ بالعين» | light | 500vh / 320vh | Rail with 5 numbered steps; the number counts up; image swaps with a horizontal clip-path wipe (direction mirrors in RTL): 01 Pour (`process-stamping-fan-cobble-01`, cropped, #5) → 02 Press (`-herringbone-01`) → 03 Tamp (`-tamping-01`) → 04 Lift (`-mat-lift-01`) → 05 Seal (`stamped-herringbone-sealed-01`). Caption notes the last is a sealed result, not the same slab. |
| 3 | **UNDER YOUR FEET.** / «تحت قدميك» | light | 350vh / 150vh | (a) `stamped-cobblestone-fan-driveway-01` clip-path reveal from a centre slit to its frame (framed, #4). (b) 4 pattern chips (Brick, Ashlar Slate, European Fan, Compass): scrolling cycles one large image through `stamped-herringbone-sealed-01`, `stamped-ashlar-sealed-01`, the European-fan swatch, `stamped-compass-rose-medallion-01`; the medallion rotates only 12°. Chip names are the client's own. |
| 4 | **THE HEART OF THE HOME.** / «قلب البيت» | light | 250vh / native swipe | Horizontal pinned gallery: vertical scroll moves cards sideways (reversed in RTL): kitchen islands ×2, fire-pit lounge ×2 (sink card hidden in production, #6). Below 768 px: native horizontal swipe with scroll-snap. |
| 5 | **WALLS THAT SHOW THEIR MAKING.** / «جدران تُظهر صنعتها» | dark | 250vh / 180vh | `wall-architectural-panels-01` cropped tight to the wall plane; slow vertical pan; 3 tie-hole / panel-joint callouts fade in one at a time (positions set after I inspect the crop). |
| 6 | **BUILT TO CARRY WEIGHT.** / «مبنية لتحمل الأثقال» | dark | 300vh / 200vh | `materials-steel-fibers-glued-01` macro → `industrial-floor-power-trowel-01`. Counters for flatness / load / abrasion / joints animate up **only with real values**, otherwise hidden. CTA "Request a floor specification". Copy carries the design-first and 10+ years message. |
| 7 | **CHOOSE YOUR FINISH.** / «اختر تشطيبك» | light | none (reveal) | 6 real swatches rise in staggered; tap opens the Finish Library detail with the existing View Transition morph. |
| 8 | **OUR STORY** / «قصتنا» | dark | 100vh per milestone | Vertical timeline, year scrubs as you scroll. **Hidden until 3+ real milestones** (#8). |
| 9 | **YOUR PROJECT, NEXT.** / «مشروعك التالي» | light | none | Service cards inline (#9) + WhatsApp button. |

Each chapter ends with a quiet link: 1 → Exposed aggregate / Terrazzo, 2–3 → Stamped concrete, 4 → Countertops, 5 → Walls, 6 → Industrial floors, 7 → Finish Library.

Mobile shortening: chapters 3 and 4 ≤ 150vh as required; the rest scaled as in the table.

## 5. Service pages

- **Pinned intro (1 viewport):** service photo 1.15× → 1×, H1 line reveal (block fade in Arabic).
- **`StickyMediaScroller`**: 4–6 text blocks: What it is → Where it works → Patterns and colours → How we build it → Care and lifespan. Each swaps the sticky image. I will restructure the MDX frontmatter into `chapters[]` (title, text, photo). For services with few photos (interior floors, sinks, walls) blocks reuse the hero or hide the image swap and show text only.
- **Static below:** spec table, gallery, related projects, FAQ, CTA. Simple reveals only.
- Care and lifespan text needs company-confirmed facts; unconfirmed items stay `CONFIRM` and are hidden in production.

## 6. Type system

**English: Oswald** (variable 200–700).

| Role | Weight | Case | Spacing | Line height | Size |
|---|---|---|---|---|---|
| Chapter headline | 500–600 | UPPERCASE | 0.02em | 1.0–1.05 | clamp(40px, 7vw, 120px) |
| H2 | 500–600 | UPPERCASE | 0.02em | 1.05 | 32–48px |
| H3, labels, nav, buttons | 500 | UPPERCASE | 0.06em | 1.2 | 14–16px |
| Body | 300 or 400 | sentence case | 0.01em | 1.6 | 18px desktop / 17px mobile, max 60ch |
| Numbers (specs, counters) | 500 | n/a | n/a | n/a | `tabular-nums` |

Paragraphs ≤ 3 sentences. Readability test on a 360 px screen before sign-off.

**Arabic: Tajawal** (static 300, 400, 500, 700, 800; I will trim from today's 200–900).

| Role | Weight | Spacing | Line height | Size |
|---|---|---|---|---|
| Display | 800 | **0 always** | 1.25 | chapter headline about 15% smaller than English at the same breakpoint |
| Body | 400 | 0 | 1.8 | 18px, max 65ch |
| Labels/buttons | 500–700 | 0 | 1.4 | 15–16px |

No uppercase utility in Arabic (`[lang="ar"]` resets it). Variables `--font-display` and `--font-body` switch on `html[lang]`; components never name a font. Subsets: Oswald latin, Tajawal arabic + latin. Preload only the active locale's display weight.

## 7. Reduced motion and accessibility

`prefers-reduced-motion: reduce` means no pinning, no scrubbing, no zoom: every chapter is a normal stacked section showing its final state (all steps visible in order, as the no-motion layout already does today for the CSS stories). All text stays in the DOM; every image keeps its manifest alt text. Chapter headings are real `h2`s in order. The rail works by keyboard. Pins never trap focus: tabbing past a pinned stage releases it to its end state. I will verify headings/order and keyboard with automated checks; VoiceOver and NVDA need a manual pass (see #12).

## 8. Performance

- **JS budget estimate (measured library sizes):** Home 167 KB now + 49 KB GSAP + ~1 KB `@gsap/react` + engine code (~6–10 KB) ≈ **225 KB**, under the 230 KB limit but with little headroom. Mitigations ready if needed: drop SplitText for English line reveals in favour of CSS; load ScrollTrigger lazily per chapter. Other routes stay ≤ 170 KB (GSAP loads only on Home and service pages; service pages today are well under).
- **LCP:** the opening image is the LCP element (AVIF, `priority`, correct `sizes`). GSAP is dynamically imported after it paints.
- **Images:** chapters 1–8 lazy-load one chapter ahead (IntersectionObserver, `rootMargin` = 1 viewport).
- **Measure:** Lighthouse mobile on Home (target Performance ≥ 85, Accessibility 100), CLS < 0.1, INP < 200 ms, 4× CPU throttle with a frame-time trace through the pinned stages (target ≥ 50 fps).
- **Future footage:** frame-sequence ≤ 120 frames desktop / 60 mobile, ≤ 2.5 MB, loaded after first interaction; still frame on Save-Data or 2g/3g.

## 9. Phases and acceptance

| Phase | Scope |
|---|---|
| 1 | Font/token cleanup + type system; the 6 engine components + a demo page (with a demo asset for video-scrub and frame-sequence) |
| 2 | Home chapters 0–4 |
| 3 | Home chapters 5–9 |
| 4 | Service page template (+ MDX restructure) |
| 5 | RTL motion pass, reduced-motion pass, performance pass, Safari/Firefox check as far as possible |

Done when every chapter works in desktop-animated, mobile-animated and reduced-motion-static modes; AR and EN verified (no tracking and no SplitText on Arabic); no scroll hijack; only Oswald and Tajawal loaded (checked in the Network tab); Lighthouse targets met; a screen recording of the full Home scroll (desktop EN, mobile AR) attached; and the footage list below.

## 10. What I need from you

1. **"Go"**, plus answers to the numbered decisions above (especially #2, #3, #5, #9).
2. **Photos:** a ≥3000 px aggregate macro (to use the full 1.6× zoom), a pour photo, company/team photos, larger fan-driveway and fire-pit photos, a sink photo.
3. **Milestones** for the story chapter (3+: year, title, one line, EN and AR).
4. **Footage wanted to switch chapters 0, 2 and 6 to video-scrub or frame-sequence later:**
   - Ch 0: slow macro push-in or pull-back on exposed aggregate, 5–8 s, landscape 4K.
   - Ch 2: one continuous locked-off take of a stamping sequence (mat placing → stamping → lifting → sealed), 15–20 s.
   - Ch 6: steel fibres being mixed into concrete, then a power-trowel pass, 10–15 s.
   - All: horizontal, tripod, no people's faces unless they agree, no visible third-party brands.

---
## Progress log
**Phase 1 done (engine + type system), pushed.** Type system applied (Oswald UPPERCASE display, Tajawal 800 with zero tracking; locale-aware `--font-display`/`--font-body`; only the active locale's font file is fetched). Engine in `src/components/story/`: `PinnedStage` (crossfade or wipe, counter), `StageMedia` (image, video-scrub, frame-sequence, webgl stub), `Chapter`, `ChapterRail`, `ChapterLink`, `LineReveal` (no SplitText on Arabic), `StickyMediaScroller`. GSAP loads dynamically after LCP via `useStoryMotion` (`gsap.matchMedia`: desktop, mobile, reduced). Demo at `/en/story-demo` (dev, or `STORY_DEMO=1`).

**Measured:** home JS is already **182 KB gz before GSAP** (it was 167 KB; sample list, analytics and the new rail/engine code added to it). GSAP + ScrollTrigger + SplitText = 49 KB, so story routes land at **~233 KB, about 3 KB over the 230 KB limit**. Plan: trim before Phase 2 (lazy-load the sample tray, split the engine per chapter, drop SplitText for English via CSS if needed).

**Copy change (client):** "Tamp / Tamped" is now "Stamp / Stamped" (Arabic: الطبع / نطبع / يُطبع).

**Phase 2 done (home chapters 0-4, narrative pass), pushed.** Opening image: terrazzo-grey-pink-large-chip-01 (client pick). Chapters 0-4 built with the engine; one continuous story: eyebrows name the arc (material, craft, finished place, home), every chapter ends with a hand-off sentence (`Bridge`) into the next, dark-to-light changes use a soft gradient, the opening has a scroll cue. Copy is in the `chapters` namespace (EN/AR). "Pour" uses the cropped night-slab photo (the fan-cobble photo shows a third-party mat brand and workers). Chapter 3 names come from the client's finish data (English names also in Arabic until Arabic names are approved). Chapters 5-9 and the removal of the stand-in blocks follow in Phase 3.

**Client facts applied:** company since 2018; team has 10+ years of experience (not the company); no supplier-partnership claims; expertise across decorative, industrial, high-spec floors and coatings.

**JS (measured, gz):** Home 234 KB (limit 230); other routes about 188 KB (limit 170). Baseline growth since Phase 1 (167 to 182 to 188 KB) comes from features added along the way, not from GSAP. Candidates for the performance pass: stop sending unused client message namespaces per route, lazy-load the sample tray and analytics listener, lazy-load the lightbox and wizard only where used, split ScrollTrigger from SplitText.

**Open for chapter 8 (story/timeline):** only one real milestone (2018). Proposal: the chapter tells the story by offering, with 2018 as the only dated entry: 2018 we start; decorative concrete; industrial floors; high-spec floors and coatings; recessed seating and fire pits (with the client-approved fire-pit photo). No workshop or showroom imagery.
