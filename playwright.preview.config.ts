import { defineConfig } from "@playwright/test";
import fs from "node:fs";

const exe = process.env.CHROMIUM_PATH || (fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
const port = Number(process.env.PREVIEW_PORT || 4173);

/** Runs against the static GitHub Pages export (build it first with scripts/preview-build.sh and NEXT_PUBLIC_BASE_PATH=/concretefactory). */
export default defineConfig({
  testDir: "tests/preview",
  timeout: 90_000,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never", outputFolder: "playwright-report-preview" }]] : "list",
  use: { baseURL: `http://localhost:${port}`, launchOptions: { executablePath: exe }, trace: "off" },
  webServer: { command: "node tests/support/static-server.mjs", port, reuseExistingServer: !process.env.CI },
});
