// Renders the localized 1200x630 Open Graph images into public/og/{en,ar}.jpg (committed; re-run when the photo, tagline or name changes).
// Uses the real brand fonts (Oswald / Tajawal) in headless Chromium so Arabic is shaped correctly. Colours are the site's grey tokens, never pure white/black.
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const site = JSON.parse(fs.readFileSync(path.join(root, "content/site.json"), "utf8"));
const photo = "stamped-courtyard-cobble-fan-cream-border-01"; // company photo; see assets/manifest.json
const bgFile = path.join(root, "public/img", `${photo}.jpg`);
if (!fs.existsSync(bgFile)) throw new Error("Run `node scripts/build-images.mjs` first");
const bg = (await sharp(bgFile).resize(1200, 630, { fit: "cover", position: "centre" }).jpeg({ quality: 80 }).toBuffer()).toString("base64");
const logo = fs.readFileSync(path.join(root, "public/brand/logo-roundel-light.png")).toString("base64");
fs.mkdirSync(path.join(root, "public/og"), { recursive: true });

const L = {
  en: { dir: "ltr", font: "Oswald:wght@500;700", family: "Oswald", weight: 700, name: site.name.en.toUpperCase(), tag: site.tagline.en, place: `${site.location.city.en}, ${site.location.country.en}`, ls: "0.02em" },
  ar: { dir: "rtl", font: "Tajawal:wght@500;800", family: "Tajawal", weight: 800, name: site.name.ar, tag: site.tagline.ar, place: `${site.location.city.ar}، ${site.location.country.ar}`, ls: "0" },
};
const exe = process.env.CHROMIUM_PATH || (fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
const b = await chromium.launch({ executablePath: exe });
for (const [loc, v] of Object.entries(L)) {
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.setContent(`<!doctype html><html dir="${v.dir}" lang="${loc}"><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=${v.font}&display=block" rel="stylesheet">
<style>*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;position:relative;overflow:hidden;font-family:'${v.family}',sans-serif;color:#ECECEC;background:#2E2E2E url(data:image/jpeg;base64,${bg}) center/cover}
.shade{position:absolute;inset:0;background:linear-gradient(${loc === "ar" ? "270deg" : "90deg"},rgba(46,46,46,.92) 0%,rgba(46,46,46,.78) 48%,rgba(46,46,46,.15) 100%)}
.box{position:absolute;inset:0;padding:64px 72px;display:flex;flex-direction:column;justify-content:space-between;align-items:flex-start}
img{width:120px;height:120px}h1{font-size:${loc === "ar" ? 84 : 76}px;line-height:1.12;font-weight:${v.weight};letter-spacing:${v.ls};max-width:700px}
p{font-size:38px;line-height:1.3;font-weight:500;margin-top:18px;max-width:640px}.place{font-size:30px;font-weight:500;border-block-start:6px solid #7A1F2B;padding-block-start:14px}</style></head>
<body><div class="shade"></div><div class="box"><img alt="" src="data:image/png;base64,${logo}"><div><h1>${v.name}</h1><p>${v.tag}</p></div><div class="place">${v.place}</div></div></body></html>`, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: path.join(root, "public/og", `${loc}.jpg`), type: "jpeg", quality: 82 });
  await p.close();
}
await b.close();
console.log("og images written");
