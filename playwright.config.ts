import { defineConfig } from "@playwright/test";
import fs from "node:fs";

const exe = process.env.CHROMIUM_PATH || (fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
const port = Number(process.env.E2E_PORT || 3111);
const stub = Number(process.env.MAIL_STUB_PORT || 3999);

/**
 * E2E runs against a production build (`pnpm build` first) with the mail provider pointed at a local stub, so no
 * real email is ever sent. VISIT_CLOSED_DAYS must also be set at build time (the visit page is static).
 */
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  expect: { timeout: 10_000 },
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: { baseURL: process.env.E2E_BASE_URL || `http://localhost:${port}`, launchOptions: { executablePath: exe }, trace: "retain-on-failure" },
  webServer: [
    { command: "node tests/support/mail-stub.mjs", port: stub, reuseExistingServer: true },
    {
      command: `pnpm start -p ${port}`,
      port,
      reuseExistingServer: !process.env.CI,
      env: {
        RESEND_API_URL: `http://localhost:${stub}/emails`, RESEND_API_KEY: "test_key", QUOTE_TO_EMAIL: "info@theconcretefactoryjo.com",
        QUOTE_FROM_EMAIL: "The Concrete Factory <quotes@theconcretefactoryjo.com>", RATE_LIMIT_MAX: "1000", VISIT_CLOSED_DAYS: "5,6",
        NEXT_PUBLIC_SITE_URL: `http://localhost:${port}`,
      },
    },
  ],
});
