import type { PhotoId } from "./photos";

export const families = ["floors", "walls", "built-ins"] as const;
export type Family = (typeof families)[number];

export type Service = { slug: string; family: Family; photo: PhotoId | null };

/** Slugs are final (brief §2). The brief calls for four families: Floors, Walls, Built-ins; "Finishes" is the library. */
export const services: Service[] = [
  { slug: "industrial-floors", family: "floors", photo: "industrial-floor-power-trowel-01" },
  { slug: "interior-floors", family: "floors", photo: null },
  { slug: "stamped-concrete", family: "floors", photo: "stamped-courtyard-cobble-fan-cream-border-01" },
  { slug: "exposed-aggregate", family: "floors", photo: "exposed-aggregate-marble-mix-01" },
  { slug: "terrazzo", family: "floors", photo: "terrazzo-grey-multicolour-01" },
  { slug: "walls", family: "walls", photo: "wall-architectural-panels-01" },
  { slug: "countertops", family: "built-ins", photo: "countertop-waterfall-bar-grey-01" },
  { slug: "sinks", family: "built-ins", photo: null },
  { slug: "fire-pits-seating", family: "built-ins", photo: "firepit-recessed-seating-01" },
];

export const servicesByFamily = (f: Family) => services.filter((s) => s.family === f);
