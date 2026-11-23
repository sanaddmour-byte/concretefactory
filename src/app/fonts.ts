import { Oswald, IBM_Plex_Sans, Tajawal } from "next/font/google";

/** Oswald: variable font, every weight 200-700. It ships no italic and no Arabic glyphs. */
export const oswald = Oswald({
  subsets: ["latin", "latin-ext"],
  variable: "--font-oswald",
  display: "swap",
  // weight omitted on purpose: loads the full variable range (ExtraLight to Bold)
});

/** All weights and both styles of IBM Plex Sans for body text. */
export const plex = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-plex",
  display: "swap",
  preload: false,
});

/** Arabic: Tajawal, all weights. ExtraBold (800) is used for Arabic headlines and the wordmark. */
export const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
  preload: false,
});
