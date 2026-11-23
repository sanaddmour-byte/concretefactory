// One-off: derives transparent logo variants from assets/brand/logo-original.jpg.
// Alpha comes from darkness against the flat grey background, so edges stay anti-aliased.
import sharp from "sharp";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const src = path.join(root, "assets/brand/logo-original.jpg");
const { data, info } = await sharp(src).greyscale().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;

// Background grey = most common value in the top-left corner patch.
const bg = data[5 * W + 5];
const rgba = (rgb, maxR = Infinity) => {
  const out = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    const x = i % W, y = (i / W) | 0;
    if (Math.hypot(x - 430, y - 437) > maxR) { out[i * 4 + 3] = 0; continue; }
    const a = Math.max(0, Math.min(255, Math.round(((bg - data[i]) / bg) * 255 * 1.0)));
    out[i * 4] = rgb[0]; out[i * 4 + 1] = rgb[1]; out[i * 4 + 2] = rgb[2]; out[i * 4 + 3] = a < 8 ? 0 : a;
  }
  return sharp(out, { raw: { width: W, height: H, channels: 4 } });
};

const out = (n) => path.join(root, "public/brand", n);
const mixer = { left: 165, top: 210, width: 535, height: 285 }; // mixer + diamonds, no ring/text
const roundel = { left: 105, top: 110, width: 650, height: 650 };

await rgba([46, 46, 46]).extract(roundel).png().toFile(out("logo-roundel.png"));
await rgba([236, 236, 236]).extract(roundel).png().toFile(out("logo-roundel-light.png"));
await rgba([46, 46, 46], 290).extract(mixer).png().toFile(out("logo-mark.png"));
await rgba([236, 236, 236], 290).extract(mixer).png().toFile(out("logo-mark-light.png"));

// Favicon / app icon: dark-grey roundel on a light-grey square (no pure black or white), 512 + 180
const iconBase = await rgba([46, 46, 46]).extract(roundel).flatten({ background: "#d4d4d4" }).extend({ top: 40, bottom: 40, left: 40, right: 40, background: "#d4d4d4" }).png().toBuffer();
await sharp(iconBase).resize(512).png().toFile(path.join(root, "src/app/icon.png"));
await sharp(iconBase).resize(180).png().toFile(path.join(root, "src/app/apple-icon.png"));
console.log("bg grey", bg, "brand assets written");
