import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeDigits, normalizePhone, parseSize, isSize } from "../../src/lib/validate.ts";
import { ammanToday, earliestVisitDate, isRealDate, checkVisitDate, weekdayOf, addDays } from "../../src/lib/dates.ts";
import { applyUrlDefaults, urlIntent, emptyQuote, sanitizeDraft, saveDraft, loadActive, loadSaved, addReceipt, findReceipt, isEmptyQuote } from "../../src/lib/quoteDraft.ts";

const mem = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) }; };

test("Arabic-Indic and Eastern Arabic-Indic digits normalise", () => {
  assert.equal(normalizeDigits("٠٧٩٧١٧٩٧٠٢"), "0797179702");
  assert.equal(normalizeDigits("۰۷۹۷۱۷۹۷۰۲"), "0797179702");
  assert.equal(normalizeDigits("١٢٫٥"), "12.5");
  assert.equal(normalizeDigits("١٬٢٠٠"), "1,200");
});
test("phones: every digit system and format reaches the same number", () => {
  for (const v of ["0797179702", "+962797179702", "00962797179702", "79 717 9702", "٠٧٩٧١٧٩٧٠٢", "+٩٦٢٧٩٧١٧٩٧٠٢", "۰۷۹۷۱۷۹۷۰۲", "962-79-717-9702"]) assert.equal(normalizePhone(v), "+962797179702", v);
  for (const v of ["12345", "0697179702", "+962 6 5555555", "abc", ""]) assert.equal(normalizePhone(v), null, v);
  assert.equal(normalizePhone("+44 20 7946 0958"), "+442079460958");
});
test("size: decimals, Arabic separators, thousands, rejects nonsense", () => {
  assert.equal(parseSize(""), "");
  assert.equal(parseSize("120"), "120");
  assert.equal(parseSize("١٢٠"), "120");
  assert.equal(parseSize("١٢٫٥"), "12.5");
  assert.equal(parseSize("12,5"), "12.5");
  assert.equal(parseSize("1,200"), "1200");
  assert.equal(parseSize("۱٬۲۰۰٫۵"), "1200.5");
  for (const v of ["abc", "-5", "0", "12.345", "1e3", "12.5.1", "1234567"]) assert.equal(isSize(v), false, v);
});
test("dates: Amman midnight rule", () => {
  // 2026-11-23 21:30 UTC is 00:30 on 24 November in Amman (UTC+3): earliest valid date is 25 November
  const t = new Date("2026-11-23T21:30:00Z");
  assert.equal(ammanToday(t), "2026-11-24");
  assert.equal(earliestVisitDate(t), "2026-11-25");
  assert.equal(checkVisitDate("2026-11-24", null, t), "past");
  assert.equal(checkVisitDate("2026-11-25", null, t), "ok");
  // 20:59 UTC the same day is still 23 November in Amman
  assert.equal(earliestVisitDate(new Date("2026-11-23T20:59:00Z")), "2026-11-24");
  // and the server's own timezone does not matter (UTC would say 23 November)
  assert.equal(new Date("2026-11-23T21:30:00Z").toISOString().slice(0, 10), "2026-11-23");
});
test("dates: impossible dates and closed days", () => {
  for (const v of ["2026-02-30", "2026-13-01", "2026-00-10", "2026-4-5", "26-04-05", "tomorrow", ""]) assert.equal(isRealDate(v), false, v);
  assert.equal(isRealDate("2028-02-29"), true);
  assert.equal(isRealDate("2027-02-29"), false);
  const now = new Date("2026-11-20T09:00:00Z"); // Friday
  assert.equal(weekdayOf("2026-11-27"), 5); // Friday
  assert.equal(checkVisitDate("2026-11-27", [5, 6], now), "closed");
  assert.equal(checkVisitDate("2026-11-28", [5, 6], now), "closed");
  assert.equal(checkVisitDate("2026-11-29", [5, 6], now), "ok");
  assert.equal(checkVisitDate("2026-11-27", null, now), "ok"); // closed days not supplied by the owner yet: nothing rejected
  assert.equal(checkVisitDate("2026-02-30", null, now), "invalid");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
});
test("draft: answers survive, URL defaults merge once", () => {
  const session = mem(), local = mem();
  const first = applyUrlDefaults(null, ["stamped-concrete"], ["ST-BRK-01"]);
  assert.deepEqual(first.values.services, ["stamped-concrete"]);
  first.values.name = "Sana"; first.values.city = "amman"; first.step = 3;
  saveDraft(first, session, local);
  // language switch: same URL intent, draft restored first: nothing re-added, nothing lost
  const removed = loadActive(session)!; removed.values.services = ["terrazzo"]; saveDraft(removed, session, local);
  const again = applyUrlDefaults(loadActive(session), ["stamped-concrete"], ["ST-BRK-01"]);
  assert.deepEqual(again.values.services, ["terrazzo"]);
  assert.equal(again.values.name, "Sana"); assert.equal(again.step, 3);
  // fresh hand-off with new samples: merged in (max 6), existing kept
  const next = applyUrlDefaults(again, ["stamped-concrete"], ["TZ-01", "TZ-02"]);
  assert.deepEqual(next.values.services, ["terrazzo", "stamped-concrete"]);
  assert.deepEqual(next.values.finishes, ["ST-BRK-01", "TZ-01", "TZ-02"]);
  const many = applyUrlDefaults({ ...next, applied: "" }, [], ["A", "B", "C", "D", "E", "F", "G"]);
  assert.equal(many.values.finishes.length, 6);
  assert.equal(urlIntent(["a"], ["b"]), "a|b");
});
test("draft: empty drafts are not saved for later; malformed storage is ignored", () => {
  const session = mem(), local = mem();
  saveDraft({ values: { ...emptyQuote }, step: 1, applied: "" }, session, local);
  assert.equal(loadSaved(local), null);
  assert.equal(isEmptyQuote(emptyQuote), true);
  session.setItem("cf-quote-active", "{not json"); assert.equal(loadActive(session), null);
  assert.equal(sanitizeDraft({ values: { services: [1, "x"], finishes: Array(20).fill("A") }, step: 99 })!.step, 5);
  assert.equal(sanitizeDraft({ values: { services: [1, "x"] } })!.values.services.length, 1);
  assert.equal(sanitizeDraft("nope"), null);
});
test("receipts: only a matching reference confirms", () => {
  const session = mem();
  assert.equal(findReceipt("CF-261123-AAAA", session), null);
  addReceipt({ ref: "CF-261123-AAAA", emailed: true, values: { ...emptyQuote, name: "Sana" }, at: 1 }, session);
  assert.equal(findReceipt("CF-261123-AAAA", session)?.values.name, "Sana");
  assert.equal(findReceipt("CF-261123-ZZZZ", session), null);
  assert.equal(findReceipt("anything", mem()), null);
  assert.equal(findReceipt(null, session), null);
});
