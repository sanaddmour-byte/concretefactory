import Image from "next/image";
import { getPhoto, photoAlt, type PhotoId } from "@/lib/photos";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/ui";

type Props = {
  id: PhotoId;
  locale: Locale;
  sizes: string;
  priority?: boolean;
  /** CSS object-position for art-directed crops, e.g. "50% 80%". */
  focal?: string;
  /** Fill a parent that sets aspect-ratio, instead of using intrinsic size. */
  fill?: boolean;
  className?: string;
};

export function Photo({ id, locale, sizes, priority, focal, fill, className }: Props) {
  const p = getPhoto(id);
  const common = {
    src: p.src,
    alt: photoAlt(p, locale),
    sizes,
    priority,
    placeholder: "blur" as const,
    blurDataURL: p.blur,
    style: focal ? { objectPosition: focal } : undefined,
  };
  return fill ? (
    <Image {...common} fill className={cn("object-cover", className)} />
  ) : (
    <Image {...common} width={p.width} height={p.height} className={cn("h-auto w-full", className)} />
  );
}
