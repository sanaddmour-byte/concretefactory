import { Tajawal } from "next/font/google";

/** Arabic: Tajawal (static 300/400/500/700/800), the only font an Arabic page loads. */
export const tajawal = Tajawal({ subsets: ["arabic", "latin"], weight: ["300", "400", "500", "700", "800"], variable: "--font-tajawal", display: "swap", preload: false });
