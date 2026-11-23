import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fillQuoteToContact, mails, nextClosedDate, nextOpenDate, resetStub, setStubMode } from "./helpers.ts";

test.beforeEach(async ({ request }) => { await resetStub(request); });

const heading = (page: import("@playwright/test").Page) => page.locator("form h2").first();
const pressed = (page: import("@playwright/test").Page, ul = "#f-services") => page.locator(`${ul} button[aria-pressed=true]`);

test.describe("quote: draft survives a language switch", () => {
  test("service-prefilled quote keeps services, answers and the active step", async ({ page }) => {
    await page.goto("/en/quote?service=stamped-concrete");
    await expect(pressed(page)).toHaveCount(1);
    await page.locator("#f-services li button", { hasText: "Terrazzo" }).click();
    await page.locator("form button[type=submit]").click();
    await page.locator('input[type=radio][name=projectType][value=villa]').check({ force: true });
    await page.selectOption("#f-city", "amman");
    await page.fill("#f-size", "120");
    await page.locator('input[type=radio][name=setting][value=outdoor]').check({ force: true });
    await page.locator("form button[type=submit]").click();
    await expect(page).toHaveURL(/step=3/);
    await page.waitForTimeout(500); // autosave debounce
    await page.locator('header a[hreflang="ar"]').click();
    await expect(page).toHaveURL(/\/ar\/quote\?.*step=3/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    // back to step 2: answers are still there
    await page.locator("form button", { hasText: /رجوع/ }).click();
    await expect(page.locator("#f-city")).toHaveValue("amman");
    await expect(page.locator("#f-size")).toHaveValue("120");
    await expect(page.locator('input[type=radio][name=projectType][value=villa]')).toBeChecked();
    await page.locator("form button", { hasText: /رجوع/ }).click();
    await expect(pressed(page)).toHaveCount(2); // stamped + the added terrazzo, nothing re-added or lost
  });

  test("a service removed by the visitor is not re-added by the URL on a language switch", async ({ page }) => {
    await page.goto("/en/quote?service=stamped-concrete");
    await page.locator("#f-services li button", { hasText: "Industrial floors" }).click();
    await page.locator("#f-services li button", { hasText: "Stamped concrete" }).click(); // deselect the prefilled one
    await expect(pressed(page)).toHaveCount(1);
    await page.waitForTimeout(500);
    await page.locator('header a[hreflang="ar"]').click();
    await expect(page).toHaveURL(/\/ar\/quote/);
    await expect(pressed(page)).toHaveCount(1);
  });

  test("sample-list hand-off survives the switch, including a removal", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("cf-samples", JSON.stringify(["ST-BRK-01", "TZ-01"])));
    await page.goto("/en/quote?samples=ST-BRK-01,TZ-01&step=3");
    const finishes = page.locator("form ul").first();
    await expect(finishes.locator("button[aria-pressed=true]")).toHaveCount(2);
    await finishes.locator("button[aria-pressed=true]").first().click();
    await expect(finishes.locator("button[aria-pressed=true]")).toHaveCount(1);
    await page.waitForTimeout(500);
    await page.locator('header a[hreflang="ar"]').click();
    await expect(page).toHaveURL(/\/ar\/quote\?.*step=3/);
    await expect(page.locator("form ul").first().locator("button[aria-pressed=true]")).toHaveCount(1);
  });
});

test.describe("quote: confirmation only for a real receipt", () => {
  test("an arbitrary done value returns to a usable quote", async ({ page }) => {
    await page.goto("/en/quote?done=CF-000000-FAKE");
    await expect(heading(page)).toContainText(/what do you need/i);
    await expect(page).not.toHaveURL(/done=/);
    await expect(page.getByText(/thank you, we have your request/i)).toHaveCount(0);
    await expect(page.locator("#f-services")).toBeVisible();
  });

  test("a real submission confirms, survives reload and language switch, and is not shown in another session", async ({ page, request, browser }) => {
    await page.goto("/en/quote?service=sinks&step=2");
    await fillQuoteToContact(page);
    await page.locator("form button[type=submit]").click();
    await expect(page.getByText(/thank you, we have your request/i)).toBeVisible();
    const url = page.url(); const ref = new URL(url).searchParams.get("done")!;
    expect(ref).toMatch(/^CF-\d{6}-[A-Z0-9]{4}$/);
    await page.reload();
    await expect(page.getByText(ref)).toBeVisible();
    // language switch keeps the receipt and re-renders the summary in Arabic
    await page.locator('header a[hreflang="ar"]').click();
    await expect(page).toHaveURL(new RegExp(`/ar/quote\\?.*done=${ref}`));
    await expect(page.getByText("شكراً، وصلنا طلبك")).toBeVisible();
    const wa = decodeURIComponent((await page.locator('[role=status] a[href^="https://wa.me/962797179702?text="]').getAttribute("href"))!);
    expect(wa).toContain("مرحباً، أرغب بعرض سعر"); expect(wa).toContain(ref);
    expect((await mails(request)).length).toBe(1);
    // same URL in a fresh session (no receipt): back to the wizard
    const ctx = await browser.newContext(); const p2 = await ctx.newPage();
    await p2.goto(`/ar/quote?done=${ref}`);
    await expect(p2.locator("form h2").first()).toContainText("ماذا تحتاج");
    await expect(p2).not.toHaveURL(/done=/);
    await ctx.close();
  });
});

test.describe("quote: Arabic digits, PDF delivery, mail failure", () => {
  test("Arabic-Indic phone and Arabic decimal size are accepted and arrive normalised", async ({ page, request }) => {
    await page.goto("/ar/quote?service=walls&step=2");
    await fillQuoteToContact(page, { ar: true, phone: "٠٧٩٧١٧٩٧٠٢", size: "١٢٫٥" });
    await page.locator("form button[type=submit]").click();
    await expect(page.getByText("شكراً، وصلنا طلبك")).toBeVisible();
    const [m] = await mails(request);
    expect(m.body.text).toContain("Mobile: +962797179702");
    expect(m.body.text).toContain("Approx. size: 12.5");
    expect(m.body.to).toEqual(["info@theconcretefactoryjo.com"]);
  });

  test("Eastern Arabic-Indic digits and an invalid number are validated the same way", async ({ page }) => {
    await page.goto("/ar/quote?service=walls&step=2");
    await fillQuoteToContact(page, { ar: true, phone: "123", size: "١٢٠" });
    await page.locator("form button[type=submit]").click();
    await expect(page.locator("#f-phone-err")).toBeVisible(); // "123" is rejected
    await page.fill("#f-phone", "۰۷۹۷۱۷۹۷۰۲");
    await page.locator("form button[type=submit]").click();
    await expect(page.getByText("شكراً، وصلنا طلبك")).toBeVisible();
  });

  test("a PDF and a photo reach the mail stub intact", async ({ page, request }) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cf-"));
    const pdf = path.join(dir, "plan.pdf"); fs.writeFileSync(pdf, "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n");
    const png = path.join(dir, "site.png");
    fs.writeFileSync(png, Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64"));
    await page.goto("/en/quote?service=stamped-concrete&step=2");
    await fillQuoteToContact(page, { files: [pdf, png] });
    await page.locator("form button[type=submit]").click();
    await expect(page.getByText(/thank you, we have your request/i)).toBeVisible();
    const [m] = await mails(request);
    const names = m.body.attachments!.map((a) => a.filename);
    expect(names).toContain("plan.pdf");
    const pdfAtt = m.body.attachments!.find((a) => a.filename === "plan.pdf")!;
    expect(Buffer.from(pdfAtt.content, "base64").toString("utf8")).toBe(fs.readFileSync(pdf, "utf8"));
    expect(m.body.attachments!.length).toBe(2);
    expect(m.body.text).toContain("Attachments:");
  });

  test("a mail provider failure shows the WhatsApp fallback and never a false confirmation", async ({ page, request }) => {
    await setStubMode(request, "fail");
    await page.goto("/en/quote?service=sinks&step=2");
    await fillQuoteToContact(page);
    await page.locator("form button[type=submit]").click();
    await expect(page.getByText(/couldn't send your request/i)).toBeVisible();
    await expect(page.locator('form a[href^="https://wa.me/962797179702"]')).toBeVisible();
    await expect(page.getByText(/thank you, we have your request/i)).toHaveCount(0);
    await expect(page).not.toHaveURL(/done=/);
    expect((await mails(request)).length).toBe(1); // attempted once, failed
    // the draft is still there for a retry once the provider recovers
    await setStubMode(request, "ok");
    await page.locator("form button[type=submit]").click();
    await expect(page.getByText(/thank you, we have your request/i)).toBeVisible();
  });
});

test.describe("visit: Asia/Amman dates", () => {
  test("at 00:30 on 24 November in Amman the earliest date is 25 November", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-23T21:30:00Z")); // 21:30 UTC = 00:30 in Amman (UTC+3)
    await page.goto("/en/visit");
    await expect(page.locator("#v-date")).toHaveAttribute("min", "2026-11-25");
    await page.fill("#v-date", "2026-11-24");
    await page.locator('input[type=radio][name=slot][value=morning]').check({ force: true });
    await page.fill("#v-name", "Sana"); await page.fill("#v-phone", "0797179702");
    await page.locator("form button[type=submit]").click();
    await expect(page.getByText(/from tomorrow onwards/i).last()).toBeVisible();
    await expect(page.getByText(/thank you/i)).toHaveCount(0);
  });

  test("a valid open day is sent; impossible dates and closed days are rejected on the client and the server", async ({ page, request }) => {
    const ok = nextOpenDate(), closed = nextClosedDate();
    await page.goto("/en/visit");
    const fill = async (date: string) => {
      await page.fill("#v-date", date);
      await page.locator('input[type=radio][name=slot][value=afternoon]').check({ force: true });
      await page.fill("#v-name", "Sana"); await page.fill("#v-phone", "٠٧٩٧١٧٩٧٠٢");
    };
    await fill(closed);
    await page.locator("form button[type=submit]").click();
    await expect(page.getByText(/we're closed on that day/i)).toBeVisible();
    expect((await mails(request)).length).toBe(0);
    // server-side: tamper with the request body after the client check passes
    await fill(ok);
    await page.route("**/en/visit", async (route) => {
      const req = route.request();
      if (req.method() !== "POST") return route.continue();
      const body = (req.postData() || "").replace(ok, "2026-02-30");
      await route.continue({ postData: body });
    });
    await page.locator("form button[type=submit]").click();
    await expect(page.getByText(/real calendar date|from tomorrow onwards/i).last()).toBeVisible();
    await expect(page.getByText(/thank you/i)).toHaveCount(0);
    expect((await mails(request)).length).toBe(0);
    await page.unroute("**/en/visit");
    await page.locator("form button[type=submit]").click();
    await expect(page.getByText(/thank you, we'll confirm/i)).toBeVisible();
    const [m] = await mails(request);
    expect(m.body.subject).toMatch(/Technical visit request VS-/);
    expect(m.body.text).toContain(`Date: ${ok}`);
    expect(m.body.text).toContain("Mobile: +962797179702");
    expect(m.body.text).toContain("Business hours are not configured"); // owner flag while hours are a placeholder
  });

  test("a mail failure on the visit form shows the WhatsApp fallback", async ({ page, request }) => {
    await setStubMode(request, "fail");
    await page.goto("/en/visit");
    await page.fill("#v-date", nextOpenDate(1));
    await page.locator('input[type=radio][name=slot][value=morning]').check({ force: true });
    await page.fill("#v-name", "Sana"); await page.fill("#v-phone", "0797179702");
    await page.locator("form button[type=submit]").click();
    await expect(page.getByText(/couldn't send your request/i)).toBeVisible();
    await expect(page.locator('a[href^="https://wa.me/962797179702"]')).toBeVisible();
    await expect(page.getByText(/thank you/i)).toHaveCount(0);
  });
});
