import { test, expect } from "@playwright/test";

// The e2e server runs on http://localhost, which is not the production origin, so it must behave like a preview: no indexing.
test("robots.txt blocks crawling on a non-production host", async ({ request }) => {
  const r = await request.get("/robots.txt");
  expect(r.ok()).toBeTruthy();
  const txt = await r.text();
  expect(txt).toMatch(/Disallow: \//);
  expect(txt).not.toMatch(/Sitemap:/);
});

test("pages carry noindex and localized Open Graph metadata", async ({ page }) => {
  for (const l of ["en", "ar"]) {
    await page.goto(`/${l}`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", new RegExp(`/og/${l}\\.jpg$`));
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", l === "ar" ? "ar_JO" : "en_US");
    await expect(page.locator('link[rel=alternate][hreflang=ar]')).toHaveCount(1);
    await expect(page.locator('link[rel=alternate][hreflang=en]')).toHaveCount(1);
  }
});

test("Open Graph images exist and are distinct per language", async ({ request }) => {
  const [en, ar] = await Promise.all([request.get("/og/en.jpg"), request.get("/og/ar.jpg")]);
  expect(en.ok() && ar.ok()).toBeTruthy();
  expect(en.headers()["content-type"]).toContain("image/jpeg");
  expect((await en.body()).equals(await ar.body())).toBe(false);
});

test("sitemap lists every page in both languages with reciprocal hreflang", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  const urls = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]);
  expect(urls.length).toBeGreaterThan(40);
  const loc = (u: string) => u.match(/<loc>(.*?)<\/loc>/)![1];
  const alts = (u: string) => Object.fromEntries([...u.matchAll(/hreflang="([^"]+)"[^>]*href="([^"]+)"/g)].map((m) => [m[1], m[2]]).concat([...u.matchAll(/href="([^"]+)"[^>]*hreflang="([^"]+)"/g)].map((m) => [m[2], m[1]])));
  const byLoc = new Map(urls.map((u) => [loc(u), alts(u)]));
  for (const [l, a] of byLoc) {
    expect(a.en, l).toBeTruthy(); expect(a.ar, l).toBeTruthy(); expect(a["x-default"], l).toBe(a.en);
    // reciprocal: each alternate lists this page back, and is itself a sitemap entry
    for (const other of [a.en, a.ar]) { expect(byLoc.has(other), `${other} missing`).toBe(true); expect(Object.values(byLoc.get(other)!)).toContain(l); }
  }
  expect([...byLoc.keys()].some((u) => u.includes("/en/services/stamped-concrete"))).toBe(true);
  expect([...byLoc.keys()].some((u) => u.includes("/ar/finishes"))).toBe(true);
});

test("llms.txt summarises services, area and contact", async ({ request }) => {
  const r = await request.get("/llms.txt");
  expect(r.headers()["content-type"]).toContain("text/plain");
  const t = await r.text();
  expect(t).toContain("# The Concrete Factory");
  expect(t).toContain("All of Jordan");
  expect(t).toContain("+962 79 717 9702");
  expect(t).toMatch(/\/en\/services\/stamped-concrete/);
  expect(t).toMatch(/\/ar\b/);
});

test("structured data uses only verified facts and is valid JSON", async ({ page }) => {
  await page.goto("/en");
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const biz = blocks.map((b) => JSON.parse(b)).find((d) => d["@type"] === "HomeAndConstructionBusiness");
  expect(biz.telephone).toBe("+962797179702");
  expect(biz.address.addressCountry).toBe("JO");
  expect(biz).not.toHaveProperty("openingHours");
  expect(biz).not.toHaveProperty("geo");
  expect(biz).not.toHaveProperty("aggregateRating");
  expect(biz.address).not.toHaveProperty("streetAddress");
  await page.goto("/ar/services/stamped-concrete");
  const svc = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((b) => JSON.parse(b));
  expect(svc.some((d) => d["@type"] === "Service")).toBe(true);
  expect(svc.some((d) => d["@type"] === "BreadcrumbList")).toBe(true);
  await page.goto("/en/faq");
  const faq = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((b) => JSON.parse(b)).find((d) => d["@type"] === "FAQPage");
  expect(faq.mainEntity.length).toBeGreaterThan(5);
});
