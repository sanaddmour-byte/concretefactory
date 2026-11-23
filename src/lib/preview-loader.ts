import variants from "../generated/variants.json";

/**
 * Static-preview image loader (GitHub Pages has no image optimizer). Serves the smallest generated variant that is at
 * least as wide as requested (so a phone never downloads the 2350 px master), falls back to the master, and works under a base path.
 */
export default function previewLoader({ src, width }: { src: string; width: number; quality?: number }) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (!src.startsWith("/")) return src;
  const id = src.replace(/^\/img\//, "").replace(/\.jpg$/, "");
  const ws = (variants as Record<string, number[]>)[id];
  const w = ws?.find((x) => x >= width);
  return w ? `${base}/img/w/${id}-${w}.webp` : `${base}${src}`;
}
