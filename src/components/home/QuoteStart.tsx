import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { services } from "@/lib/services";
import { getPhoto } from "@/lib/photos";
import { whatsappUrl } from "@/lib/site";
import { isDev } from "@/lib/placeholder";
import { buttonClass } from "@/lib/ui";

/** Final chapter: the wizard's service cards, right here. Choosing one opens the quote at step 2 with the service already set, so the first click starts the quote. */
export async function QuoteStart({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "chapters.c9" });
  const ts = await getTranslations({ locale, namespace: "services" });
  return (
    <div className="container-page pb-20 pt-2">
      <p className="reveal max-w-[52ch] text-lg text-n-700">{t("sub")}</p>
      <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-4">
        {services.map((s, i) => {
          const name = ts(`${s.slug}.name`);
          const p = s.photo ? getPhoto(s.photo) : null;
          return (
            <li key={s.slug} className="rise" style={{ "--i": i % 3 } as React.CSSProperties}>
              <Link href={`/quote?service=${s.slug}&step=2`} aria-label={t("startFor", { name })} className="group flex h-full flex-col overflow-hidden rounded-card border-2 border-n-300 bg-n-50 hover:border-maroon motion-safe:transition-colors">
                {(p || isDev) && (
                  <span className="relative block aspect-[4/3] bg-n-200">
                    {p ? <Image src={p.src} alt="" fill sizes="(min-width: 1024px) 380px, 45vw" className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105" /> : <span className="tex-placeholder absolute inset-0"><span className="ph-badge absolute start-2 top-2">PHOTO NEEDED</span></span>}
                  </span>
                )}
                <span className={`p-3 font-semibold leading-snug text-n-900 md:text-base ${p || isDev ? "text-sm" : "flex min-h-[7rem] items-end bg-olive-100 p-4 text-base"}`}>{name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <a href={whatsappUrl()} rel="noopener" className={buttonClass("secondary")}><MessageCircle size={20} strokeWidth={1.5} aria-hidden /> {t("whatsapp")}</a>
      </div>
    </div>
  );
}
