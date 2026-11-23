/** Preview-only image loader for the static GitHub Pages build (no image optimizer there): serves the processed files directly, under the site's base path. */
export default function previewLoader({ src }: { src: string; width: number; quality?: number }) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return src.startsWith("/") ? `${base}${src}` : src;
}
