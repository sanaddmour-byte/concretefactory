import { Oswald, Tajawal } from "next/font/google";

/** Oswald: the English typeface for everything (display and body). Variable, every weight 200-700; ships no italic and no Arabic glyphs. */
export const oswald = Oswald({
  subsets: ["latin", "latin-ext"],
  variable: "--font-oswald",
  display: "swap",
  // weight omitted on purpose: loads the full variable range (ExtraLight to Bold)
});

/** Arabic: Tajawal, all weights. ExtraBold (800) is used for Arabic headlines and the wordmark. */
export const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
  preload: false,
});
