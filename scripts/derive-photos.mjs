// One-off, idempotent: writes derived crops into assets/photos and registers them in assets/manifest.json.
// (Originals are untouched; a derived photo says which original it is cut from and why.)
import sharp from "sharp"; import fs from "node:fs"; import path from "node:path";
const root = path.resolve(import.meta.dirname, "..");
const mp = path.join(root, "assets/manifest.json"); const m = JSON.parse(fs.readFileSync(mp, "utf8"));
const derived = [
  { from: "countertop-waterfall-bar-grey-01", id: "countertop-waterfall-edge-01", crop: { left: 760, top: 60, width: 840, height: 840 }, service: "countertops", role: "project",
    alt: { en: "Concrete bar countertop with a waterfall edge and a polished top", ar: "كاونتر خرساني بحافة شلالية وسطح مصقول" },
    notes: "Cut from countertop-waterfall-bar-grey-01 around the waterfall edge: removes the unfinished cabinetry at the top and left. True colour." },
  { from: "terrazzo-grey-pink-large-chip-01", id: "terrazzo-grey-pink-portrait-01", crop: { left: 525, top: 0, width: 1300, height: 2350 }, service: "terrazzo", role: "texture/swatch",
    alt: { en: "Grey terrazzo with large Aqaba granite stone chips", ar: "تيرازو رمادي برقائق حجرية كبيرة من جرانيت العقبة" },
    notes: "Portrait cut of terrazzo-grey-pink-large-chip-01 (1300x2350, native resolution) for phones: stays sharp at full height without upscaling." },
];
for (const d of derived) {
  const src = m.find((e) => e.file.endsWith(`/${d.from}.jpg`)); if (!src) throw new Error("missing " + d.from);
  const out = `assets/photos/${d.id}.jpg`;
  await sharp(path.join(root, src.file)).extract(d.crop).jpeg({ quality: 92, mozjpeg: true }).toFile(path.join(root, out));
  const meta = await sharp(path.join(root, out)).metadata();
  if (!m.some((e) => e.file === out)) m.push({ file: out, service: d.service, role: d.role, width: meta.width, height: meta.height, orientation: meta.width > meta.height ? "landscape" : meta.width === meta.height ? "square" : "portrait", alt: d.alt, notes: d.notes });
}
// Held from public placement until the client confirms the crew has agreed to appear
const crew = m.find((e) => e.file.endsWith("/industrial-power-trowel-crew-01.jpg"));
crew.public = false;
crew.notes = "HELD (not published): workers' faces are visible. Publish only after the client confirms the crew has agreed to appear. " + (crew.notes || "");
fs.writeFileSync(mp, JSON.stringify(m, null, 2) + "\n");
console.log("derived:", derived.map((d) => d.id).join(", "), "| held:", crew.file);
