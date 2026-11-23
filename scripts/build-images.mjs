// Reads assets/manifest.json, validates every entry, and writes web-ready,
// metadata-stripped masters to public/img plus src/generated/photos.json
// (dimensions, blur placeholder, alt text, notes). Originals never ship.
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const MAX_WIDTH = 2400; // never upscale past the source
const manifest = JSON.parse(await readFile(path.join(root, "assets/manifest.json"), "utf8"));

await mkdir(path.join(root, "public/img"), { recursive: true });
await mkdir(path.join(root, "src/generated"), { recursive: true });

const out = {};
const errors = [];
let held = 0;

for (const entry of manifest) {
  const id = path.basename(entry.file, path.extname(entry.file));
  const src = path.join(root, entry.file);
  if (entry.public === false) { held++; continue; } // held photos are never copied to public/ or listed: they cannot be referenced or served
  try {
    await access(src);
  } catch {
    errors.push(`Missing image file: ${entry.file}`);
    continue;
  }
  if (!entry.alt?.en || !entry.alt?.ar) errors.push(`Missing EN/AR alt text: ${id}`);

  const image = sharp(src).rotate(); // apply EXIF orientation, then drop all metadata
  const meta = await sharp(await image.clone().toBuffer()).metadata();
  const width = Math.min(meta.width, MAX_WIDTH);
  const height = Math.round((meta.height * width) / meta.width);

  await image
    .clone()
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(root, "public/img", `${id}.jpg`));

  const blur = await image.clone().resize({ width: 16 }).jpeg({ quality: 40 }).toBuffer();

  out[id] = {
    id,
    src: `/img/${id}.jpg`,
    width,
    height,
    orientation: entry.orientation,
    service: entry.service,
    role: entry.role,
    alt: entry.alt,
    notes: entry.notes ?? "",
    blur: `data:image/jpeg;base64,${blur.toString("base64")}`,
  };
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

await writeFile(path.join(root, "src/generated/photos.json"), JSON.stringify(out, null, 2));
console.log(`images: ${Object.keys(out).length} photos processed${held ? `, ${held} held back (public:false)` : ""}`);
