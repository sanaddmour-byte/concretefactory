/**
 * URL for a /public asset used outside next/image (CSS backgrounds, plain <img>): correct at both / and /<base path>/.
 * `width` picks a right-sized file: the optimizer URL on a server build, a generated variant in the static preview.
 */
import previewLoader from "./preview-loader";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
const preview = process.env.NEXT_PUBLIC_PREVIEW === "1";

export function assetUrl(src: string, width = 1280): string {
  if (!src.startsWith("/")) return src;
  if (preview) return previewLoader({ src, width });
  return src.startsWith("/img/") ? `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75` : `${base}${src}`;
}
