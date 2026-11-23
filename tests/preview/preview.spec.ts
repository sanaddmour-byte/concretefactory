import { test, expect, type Page } from "@playwright/test";

const B = "/concretefactory";

/** Collects every failed or off-base-path request while `fn` runs. */
async function watch(page: Page, fn: () => Promise<void>) {
  const bad: string[] = [];
  page.on("response", (r) => { if (r.status() >= 400 && !r.url().includes("favicon")) bad.push(`${r.status()} ${r.url()}`); });
  page.on("request", (r) => { const u = new URL(r.url()); if (u.hostname === "localhost" && !u.pathname.startsWith(B + "/")) bad.push(`outside base: ${u.pathname}`); });
  await fn();
  return bad;
}

for (const l of ["en", "ar"]) {
  test(`preview ${l}: home, stamped concrete and Finish Library load with no failed or off-base requests`, async ({ page }) => {
    const bad = await watch(page, async () => {
      for (const p of [`${B}/${l}/`, `${B}/${l}/services/stamped-concrete/`, `${B}/${l}/finishes/`, `${B}/${l}/quote/`]) {
        await page.goto(p);
        await page.waitForLoadState("networkidle");
        await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } });
        await page.waitForTimeout(400);
      }
    });
    expect(bad).toEqual([]);
  });

  test(`preview ${l}: hovering a swatch opens the magnifier with a working image`, async ({ page }) => {
    const bad = await watch(page, async () => {
      await page.goto(`${B}/${l}/finishes/`);
      await page.waitForLoadState("networkidle");
      const sw = page.locator("main img").first();
      await sw.scrollIntoViewIfNeeded();
      const box = (await sw.boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.move(box.x + box.width / 2 + 6, box.y + box.height / 2 + 6);
      await page.waitForTimeout(800);
      const lens = await page.locator('[style*="background-image"]').evaluateAll((els) => els.map((e) => getComputedStyle(e).backgroundImage));
      expect(lens.filter((b) => b !== "none").length, "magnifier shown").toBeGreaterThan(0);
      for (const bg of lens.filter((b) => b !== "none")) expect(bg).toContain(`${B}/`);
    });
    expect(bad).toEqual([]);
  });
}

test("preview serves distinct width variants (hero first) from /img/w/", async ({ page }) => {
  const imgs = new Set<string>();
  page.on("request", (r) => { if (r.resourceType() === "image") imgs.add(new URL(r.url()).pathname); });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${B}/en/`);
  await page.waitForLoadState("networkidle");
  const variants = [...imgs].filter((p) => p.startsWith(`${B}/img/w/`));
  expect(variants.length).toBeGreaterThan(1);
  expect(new Set(variants).size).toBe(variants.length);
  // a phone must not be handed the widest file for the opening photo
  const hero = variants.find((p) => p.includes("terrazzo-grey-pink-portrait-01"));
  expect(hero, "opening photo variant").toBeTruthy();
  expect(hero).not.toMatch(/-1600\.webp$/);
});

test("preview is not indexable: noindex meta and Disallow-all robots.txt", async ({ page, request }) => {
  await page.goto(`${B}/en/`);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  const robots = await (await request.get(`${B}/robots.txt`)).text();
  expect(robots).toMatch(/Disallow: \//);
  expect(robots).not.toMatch(/Sitemap:/);
});
