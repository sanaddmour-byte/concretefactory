// Measures transferred (compressed) JS and image bytes via the browser's own network accounting (CDP).
// Usage: node scripts/measure.mjs <baseUrl> <label> [outfile]   (static hosts without compression: bytes are gzip-estimated from the file)
import { chromium } from "@playwright/test";
import fs from "node:fs";
import zlib from "node:zlib";
const [base = "http://localhost:3111", label = "run", out] = process.argv.slice(2);
const routes = ["/en", "/en/services/stamped-concrete", "/en/quote", "/en/finishes"];
const exe = process.env.CHROMIUM_PATH || (fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
const b = await chromium.launch({ executablePath: exe });
const res = {};
for (const r of routes) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 823 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p); await cdp.send("Network.enable");
  const meta = new Map(); const done = [];
  cdp.on("Network.responseReceived", (e) => meta.set(e.requestId, { url: e.response.url, mime: e.response.mimeType, enc: e.response.headers["content-encoding"] || e.response.headers["Content-Encoding"] || "" }));
  cdp.on("Network.loadingFinished", (e) => done.push({ id: e.requestId, wire: e.encodedDataLength }));
  await p.goto(base + r, { waitUntil: "networkidle" }); await p.waitForTimeout(4500);
  let js = 0; const imgs = [];
  for (const d of done) {
    const m = meta.get(d.id); if (!m || m.url.startsWith("data:")) continue;
    let bytes = d.wire;
    if (!m.enc && /javascript/.test(m.mime)) { try { const body = await cdp.send("Network.getResponseBody", { requestId: d.id }); bytes = zlib.gzipSync(Buffer.from(body.body, body.base64Encoded ? "base64" : "utf8")).length; } catch { /* keep wire size */ } }
    if (/javascript/.test(m.mime)) js += bytes; else if (m.mime.startsWith("image/")) imgs.push({ url: m.url.replace(/^https?:\/\/[^/]+/, "").slice(0, 100), bytes });
  }
  const lcp = await p.evaluate(() => new Promise((ok) => { let e; try { new PerformanceObserver((l) => { e = l.getEntries().pop(); }).observe({ type: "largest-contentful-paint", buffered: true }); } catch {} setTimeout(() => ok(e ? e.url : null), 300); }));
  const lcpPath = lcp && !lcp.startsWith("data:") ? lcp.replace(/^https?:\/\/[^/]+/, "") : null;
  const hero = lcpPath ? imgs.filter((i) => i.url === lcpPath.slice(0, 100)).sort((a, c) => c.bytes - a.bytes)[0] : null;
  res[r] = { jsKB: +(js / 1024).toFixed(1), imageKBLoaded: +(imgs.reduce((a, x) => a + x.bytes, 0) / 1024).toFixed(0), lcpImage: lcpPath ? lcpPath.slice(0, 100) : "(inline placeholder)", heroKB: hero ? +(hero.bytes / 1024).toFixed(1) : null };
  await ctx.close();
}
await b.close();
console.log(label); for (const [k, v] of Object.entries(res)) console.log(" ", k.padEnd(32), `JS ${v.jsKB} KB gz | hero ${v.heroKB ?? "n/a"} KB | images loaded ${v.imageKBLoaded} KB | LCP ${v.lcpImage}`);
if (out) fs.writeFileSync(out, JSON.stringify({ label, res }, null, 2));
