import { Oswald } from "next/font/google";

/** English: Oswald (variable 200-700), latin subset, the only font an English page loads. */
export const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald", display: "swap", preload: false });
// preload is off on purpose: next/font preloads per route, not per locale, which would make every English
// page download Tajawal and every Arabic page download Oswald. Fonts load on demand (display: swap), so only
// the active locale's family is ever fetched.
