import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Static preview (GitHub Pages): PREVIEW_EXPORT=1. Never set in the real deployment.
const preview = process.env.PREVIEW_EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const config: NextConfig = {
  ...(preview ? { output: "export" as const, trailingSlash: true, basePath: basePath || undefined, turbopack: { resolveAlias: { "@/app/actions": "./src/app/actions.preview.ts" } } } : {}),
  images: {
    ...(preview ? { loader: "custom" as const, loaderFile: "./src/lib/preview-loader.ts" } : {}),
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 768, 1024, 1280, 1600, 1920],
  },
  poweredByHeader: false,
  // Quote/visit forms upload up to 4 MB of attachments (Vercel Functions cap request bodies at 4.5 MB)
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
};

export default withNextIntl(config);
