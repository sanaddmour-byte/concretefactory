import { test, expect, type Page } from "@playwright/test";

const widths = [{ w: 360, h: 740 }, { w: 390, h: 844 }, { w: 768, h: 1024 }, { w: 1280, h: 800 }];
const pages = ["/", "/services", "/services/countertops", "/services/walls", "/services/stamped-concrete", "/finishes", "/projects", "/quote", "/contact"];

/** True when two boxes overlap by more than a pixel in both directions. */
const overlaps = (a: DOMRect, b: DOMRect) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;

async function headerOverlaps(page: Page) {
  return page.evaluate(() => {
    const els = [...document.querySelectorAll("header .container-page a, header .container-page button, header a[aria-label] span.display")].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== "hidden"; });
    const bad: string[] = [];
    for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) {
      if (els[i].contains(els[j]) || els[j].contains(els[i])) continue; // a link and its own label are meant to overlap
      const a = els[i].getBoundingClientRect(), b = els[j].getBoundingClientRect();
      if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) bad.push(`${(els[i].getAttribute("aria-label") || els[i].textContent || "").trim().slice(0, 20)} x ${(els[j].getAttribute("aria-label") || els[j].textContent || "").trim().slice(0, 20)}`);
    }
    return bad;
  });
}
async function clippedHeadings(page: Page) {
  return page.evaluate(() => [...document.querySelectorAll("h1, h2")].flatMap((h) => {
    const box = h.getBoundingClientRect(); if (!box.width) return [];
    const range = document.createRange(); range.selectNodeContents(h);
    const worst = Math.max(...[...range.getClientRects()].map((r) => r.right));
    // text extending past its own box on the inline-end side means a long word is clipped by the line mask or the column
    return worst > box.right + 2 && getComputedStyle(h).overflow !== "visible" ? [`${(h.textContent || "").slice(0, 30)} (${Math.round(worst - box.right)}px past)`] : [];
  }));
}

for (const vp of widths) {
  for (const locale of ["en", "ar"]) {
    test(`${locale} ${vp.w}px: header does not overlap and headings are not clipped`, async ({ page }) => {
      await page.setViewportSize({ width: vp.w, height: vp.h });
      for (const p of pages) {
        await page.goto(`/${locale}${p === "/" ? "" : p}`, { waitUntil: "load" });
        await page.waitForTimeout(p === "/" ? 800 : 400);
        expect(await headerOverlaps(page), `header overlap on ${p}`).toEqual([]);
        expect(await clippedHeadings(page), `clipped heading on ${p}`).toEqual([]);
        expect(await page.evaluate(() => document.documentElement.scrollWidth - Math.round(document.documentElement.clientWidth)), `horizontal overflow on ${p}`).toBeLessThanOrEqual(0);
      }
    });
  }
}

test("header quote button is hidden on phones and shown from 640px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/services/walls");
  await expect(page.locator('header a[href$="/quote"]')).toBeHidden();
  await page.setViewportSize({ width: 700, height: 900 });
  await expect(page.locator('header a[href$="/quote"]')).toBeVisible();
});

test("home: the quote and project links are visible on the first screen (desktop and mobile)", async ({ page }) => {
  for (const vp of [{ width: 1280, height: 720 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(vp);
    await page.goto("/en"); await page.waitForTimeout(1200);
    for (const href of ["/en/quote", "/en/projects"]) {
      const link = page.locator(`main a[href="${href}"]`).first();
      await expect(link).toBeVisible();
      const box = (await link.boundingBox())!;
      expect(box.y + box.height, `${href} inside first screen at ${vp.width}px`).toBeLessThanOrEqual(vp.height);
      expect(await link.evaluate((e) => getComputedStyle(e).opacity)).toBe("1");
    }
  }
});
