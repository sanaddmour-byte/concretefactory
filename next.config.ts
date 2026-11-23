import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const config: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 768, 1024, 1280, 1600, 1920],
  },
  poweredByHeader: false,
  // Quote/visit forms upload up to 4 MB of attachments (Vercel Functions cap request bodies at 4.5 MB)
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
};

export default withNextIntl(config);
