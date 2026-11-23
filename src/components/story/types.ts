/** Media resolved on the server (photo ids are looked up there, so the client bundle never contains the photo manifest). */
export type ResolvedImage = { type: "image"; src: string; width: number; height: number; alt: string; blur: string; focal?: string; zoom?: { from: number; to: number } };
export type ResolvedVideoScrub = { type: "video-scrub"; src: string; poster: string; alt: string };
export type ResolvedFrames = { type: "frame-sequence"; base: string; count: number; ext: "webp" | "avif"; poster: string; alt: string; width: number; height: number };
export type ResolvedWebgl = { type: "webgl" };
export type ResolvedMedia = ResolvedImage | ResolvedVideoScrub | ResolvedFrames | ResolvedWebgl;

export type StageStep = { id: string; caption: string; title?: string; media: ResolvedMedia; overlay?: React.ReactNode };
