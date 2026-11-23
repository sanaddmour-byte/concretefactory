import { getTranslations } from "next-intl/server";
import { MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { whatsappUrl } from "@/lib/site";
import { buttonClass } from "@/lib/ui";

export async function FinalCta({ locale }: { locale: string }) {
  const t = await getTranslations({ locale });
  return (
    <section className="container-page pb-4" aria-labelledby="cta-h">
      <div className="reveal rounded-card border border-olive-200 bg-olive-100 px-6 py-12 text-center md:px-12 md:py-16">
        <h2 id="cta-h" className="display mx-auto max-w-2xl text-3xl md:text-5xl">{t("home.cta.title")}</h2>
        <p className="mx-auto mt-4 max-w-[52ch] text-lg text-n-700">{t("home.cta.body")}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/quote" className={buttonClass("primary")}>{t("cta.quote")}</Link>
          <a href={whatsappUrl()} rel="noopener" className={buttonClass("secondary")}>
            <MessageCircle size={20} strokeWidth={1.5} aria-hidden /> {t("cta.whatsapp")}
          </a>
        </div>
      </div>
    </section>
  );
}
