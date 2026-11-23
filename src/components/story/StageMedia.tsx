"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { ResolvedMedia } from "./types";

/** Scrub handlers: a PinnedStage looks up a step's handler here and calls it with local progress 0..1. */
export const scrubRegistry = new WeakMap<HTMLElement, (p: number) => void>();

const slowConnection = () => {
  const c = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !!c && (c.saveData === true || ["slow-2g", "2g", "3g"].includes(c.effectiveType ?? ""));
};

/**
 * One stage's media. Modes:
 *  - image:          still photo (zoom/pan/clip-reveal are driven by PinnedStage)
 *  - video-scrub:    MP4 scrubbed through currentTime
 *  - frame-sequence: canvas drawing preloaded WebP/AVIF frames (loaded after first interaction; a still on Save-Data or 2g/3g)
 *  - webgl:          reserved interface stub, renders nothing yet
 */
export function StageMedia({ media, priority, sizes = "100vw" }: { media: ResolvedMedia; priority?: boolean; sizes?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  // video-scrub
  useEffect(() => {
    if (media.type !== "video-scrub" || !root.current || !video.current) return;
    const v = video.current;
    let target = 0, raf = 0;
    const tick = () => { raf = 0; if (v.duration && Math.abs(v.currentTime - target) > 0.01) v.currentTime = target; };
    scrubRegistry.set(root.current, (p) => { if (v.duration) { target = v.duration * p; if (!raf) raf = requestAnimationFrame(tick); } });
    return () => { cancelAnimationFrame(raf); if (root.current) scrubRegistry.delete(root.current); };
  }, [media]);

  // frame-sequence
  useEffect(() => {
    if (media.type !== "frame-sequence" || !root.current || !canvas.current) return;
    if (slowConnection()) return; // keep the still poster
    const el = root.current, cv = canvas.current, ctx = cv.getContext("2d")!;
    const frames: (HTMLImageElement | undefined)[] = new Array(media.count);
    let loaded = 0, current = -1, started = false, raf = 0, wanted = 0;
    const draw = () => {
      raf = 0;
      let i = Math.round(wanted * (media.count - 1));
      while (i >= 0 && !frames[i]) i--; // nearest loaded frame at or before the wanted one
      if (i < 0 || i === current) return;
      current = i;
      ctx.drawImage(frames[i]!, 0, 0, cv.width, cv.height);
    };
    const load = () => {
      if (started) return; started = true;
      for (let i = 0; i < media.count; i++) {
        const im = new window.Image();
        im.onload = () => { frames[i] = im; if (++loaded === 1) el.dataset.ready = "true"; if (!raf) raf = requestAnimationFrame(draw); };
        im.src = `${media.base}${String(i).padStart(3, "0")}.${media.ext}`;
      }
    };
    scrubRegistry.set(el, (p) => { wanted = p; load(); if (!raf) raf = requestAnimationFrame(draw); });
    // preload after the first interaction (never competes with the initial page load)
    const first = () => load();
    addEventListener("pointerdown", first, { once: true }); addEventListener("keydown", first, { once: true }); addEventListener("scroll", first, { once: true, passive: true });
    return () => { cancelAnimationFrame(raf); scrubRegistry.delete(el); removeEventListener("pointerdown", first); removeEventListener("keydown", first); removeEventListener("scroll", first); };
  }, [media]);

  if (media.type === "webgl") return null; // interface stub for a later phase

  return (
    <div ref={root} className="stage-media" data-media={media.type}>
      {media.type === "image" && (
        <div className="stage-zoom" data-zoom={media.zoom ? `${media.zoom.from},${media.zoom.to}` : undefined}>
          <Image src={media.src} alt={media.alt} fill sizes={sizes} priority={priority} placeholder="blur" blurDataURL={media.blur} style={{ objectPosition: media.focal }} className="object-cover" />
        </div>
      )}
      {media.type === "video-scrub" && (
        <video ref={video} src={media.src} poster={media.poster} muted playsInline preload="auto" aria-label={media.alt} className="size-full object-cover" />
      )}
      {media.type === "frame-sequence" && (
        <>
          {/* still key frame: always present, visible until the canvas is ready (and kept on slow connections) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={media.poster} alt={media.alt} width={media.width} height={media.height} className="stage-poster size-full object-cover" />
          <canvas ref={canvas} width={media.width} height={media.height} aria-hidden className="stage-canvas size-full object-cover" />
        </>
      )}
    </div>
  );
}
