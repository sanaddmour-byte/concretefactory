import { test, expect } from "@playwright/test";

test("home: quote and project links are visible on the first screen (phone, EN and AR)", async ({ browser }) => {
  for (const l of ["en", "ar"]) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
    const page = await ctx.newPage();
    await page.goto(`/${l}`);
    const links = page.locator("main a[href$='/quote'], main a[href$='/projects']");
    await expect(page.locator("main a[href$='/quote']").first()).toBeInViewport();
    await expect(page.locator("main a[href$='/projects']").first()).toBeInViewport();
    expect(await links.count()).toBeGreaterThan(1);
    await ctx.close();
  }
});

test("keyboard: skip link works and the gallery lightbox opens, navigates and returns focus", async ({ page }) => {
  await page.goto("/en/services/stamped-concrete");
  await page.keyboard.press("Tab");
  const skip = page.locator("a[href='#main'], a[href^='#']").first();
  await expect(skip).toBeFocused();
  // find the first gallery thumbnail button and open it with the keyboard
  const thumb = page.locator("ul button[aria-label]").first();
  await thumb.scrollIntoViewIfNeeded();
  await thumb.focus();
  await page.keyboard.press("Enter");
  const dlg = page.locator("dialog[open]");
  await expect(dlg).toBeVisible();
  const first = await dlg.getAttribute("aria-label");
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => dlg.getAttribute("aria-label")).not.toBe(first);
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await expect(thumb).toBeFocused();
});

test("lightbox full-size image is not requested until opened", async ({ page }) => {
  const urls: string[] = [];
  page.on("request", (r) => { if (r.resourceType() === "image") urls.push(r.url()); });
  await page.goto("/en/services/stamped-concrete");
  await page.waitForLoadState("networkidle");
  const before = urls.length;
  await page.locator("ul button[aria-label]").first().scrollIntoViewIfNeeded();
  await page.locator("ul button[aria-label]").first().click();
  await expect(page.locator("dialog[open] img")).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(urls.length).toBeGreaterThan(before);
});

for (const l of ["en", "ar"]) {
  test(`reduced motion (${l}): service and home pages render stacked, nothing overflows, images present`, async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 390, height: 844 }, isMobile: true });
    const page = await ctx.newPage();
    for (const path of [`/${l}`, `/${l}/services/stamped-concrete`, `/${l}/services/industrial-floors`]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), path).toBeLessThanOrEqual(1);
      const imgs = await page.locator("main img").evaluateAll((els) => els.filter((e) => (e as HTMLImageElement).getBoundingClientRect().height > 0).length);
      expect(imgs, path).toBeGreaterThan(2);
    }
    await ctx.close();
  });

  test(`JavaScript disabled (${l}): service photos and calls to action are server-rendered`, async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    for (const path of [`/${l}`, `/${l}/services/stamped-concrete`, `/${l}/services/walls`, `/${l}/services/sinks`]) {
      await page.goto(path);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("main a[href$='/quote']").first()).toBeVisible();
      if (!path.endsWith("/sinks")) {
        const shown = await page.locator("main img").evaluateAll((els) => els.filter((e) => { const r = (e as HTMLImageElement).getBoundingClientRect(); return r.width > 40 && r.height > 40 && getComputedStyle(e).visibility !== "hidden" && getComputedStyle(e).opacity !== "0"; }).length);
        expect(shown, path).toBeGreaterThan(1);
      } else {
        await expect(page.locator("main img")).toHaveCount(0); // the Sinks page stays photo-free until a real basin photo exists
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), path).toBeLessThanOrEqual(1);
    }
    await ctx.close();
  });
}
