import type { APIRequestContext, Page } from "@playwright/test";
import { addDays, earliestVisitDate, weekdayOf } from "../../src/lib/dates.ts";

export const STUB = `http://localhost:${process.env.MAIL_STUB_PORT || 3999}`;
export const CLOSED = [5, 6]; // must match VISIT_CLOSED_DAYS used for the build/server in playwright.config.ts

export const resetStub = (r: APIRequestContext) => r.post(`${STUB}/__reset`);
export const setStubMode = (r: APIRequestContext, m: "ok" | "fail") => r.post(`${STUB}/__mode/${m}`);
export type Mail = { auth: string; mode: string; body: { to: string[]; from: string; subject: string; text: string; reply_to?: string; attachments?: { filename: string; content: string }[] } };
export const mails = async (r: APIRequestContext): Promise<Mail[]> => (await r.get(`${STUB}/__log`)).json();

/** First bookable date (Amman, real clock) that is not a closed weekday. */
export function nextOpenDate(skip = 0): string {
  let d = earliestVisitDate(); let n = 0;
  for (let i = 0; i < 30; i++, d = addDays(d, 1)) if (!CLOSED.includes(weekdayOf(d)) && n++ === skip) return d;
  throw new Error("no open date");
}
export function nextClosedDate(): string {
  let d = earliestVisitDate();
  for (let i = 0; i < 14; i++, d = addDays(d, 1)) if (CLOSED.includes(weekdayOf(d))) return d;
  throw new Error("no closed date");
}

/** Walks the quote wizard from step 2 with typical answers; stops on step 5 (contact) with fields filled. */
export async function fillQuoteToContact(page: Page, o: { phone?: string; size?: string; ar?: boolean; files?: string[] } = {}) {
  const ar = !!o.ar;
  await page.locator('input[type=radio][name=projectType][value=villa]').check({ force: true });
  await page.selectOption("#f-city", "amman");
  await page.fill("#f-size", o.size ?? "120");
  await page.locator('input[type=radio][name=setting][value=outdoor]').check({ force: true });
  await page.locator("form button[type=submit]").click(); // -> step 3
  if (o.files?.length) await page.setInputFiles("input[type=file]", o.files);
  await page.locator("form button[type=submit]").click(); // -> step 4
  await page.locator('input[type=radio][name=start][value="1-3"]').check({ force: true });
  await page.locator("form button[type=submit]").click(); // -> step 5
  await page.fill("#f-name", ar ? "سنا" : "Sana");
  await page.fill("#f-phone", o.phone ?? "0797179702");
  await page.locator('input[type=radio][name=channel][value=whatsapp]').check({ force: true });
}
