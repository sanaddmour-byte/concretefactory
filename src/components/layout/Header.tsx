import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { families, servicesByFamily } from "@/lib/services";
import { getPhoto } from "@/lib/photos";
import { whatsappUrl } from "@/lib/site";
import { buttonClass } from "@/lib/ui";
import { Logo } from "./Logo";
import { LangSwitcher } from "./LangSwitcher";
import { MegaMenu } from "./MegaMenu";
import { MobileMenu } from "./MobileMenu";

const linkCls = "inline-flex min-h-11 items-center rounded-control px-3 text-base font-medium text-n-800 hover:bg-n-100";

export async function Header({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale });
  const thumb = getPhoto("stamped-herringbone-sealed-01");

  const megaPanel = (
    <div className="grid grid-cols-4 gap-8">
      {families.map((f) => (
        <div key={f}>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-n-600">{t(`families.${f}`)}</p>
          <ul className="space-y-1">
            {servicesByFamily(f).map((s) => {
              const p = s.photo ? getPhoto(s.photo) : null;
              return (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="flex min-h-11 items-center gap-3 rounded-control p-1 hover:bg-n-100">
                    <span className="relative size-10 shrink-0 overflow-hidden rounded-control bg-n-200">
                      {p && <Image src={p.src} alt="" fill sizes="40px" className="object-cover" />}
                    </span>
                    <span className="text-sm font-medium text-n-900">{t(`services.${s.slug}.name`)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-n-600">{t("families.finishes")}</p>
        <Link href="/finishes" className="block rounded-card bg-olive-50 p-3 hover:bg-olive-200">
          <span className="relative block aspect-square w-full overflow-hidden rounded-control">
            <Image src={thumb.src} alt="" fill sizes="280px" className="object-cover" />
          </span>
          <span className="mt-3 block text-sm text-n-700">{t("megaFinishes.blurb")}</span>
          <span className="mt-1 block text-sm font-medium text-maroon">{t("megaFinishes.cta")}</span>
        </Link>
      </div>
    </div>
  );

  const mobileNav = (
    <nav aria-label={t("a11y.primaryNav")}>
      <ul className="divide-y divide-n-200 text-lg">
        {families.map((f) => (
          <li key={f} className="py-3">
            <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-n-600">{t(`families.${f}`)}</p>
            <ul>
              {servicesByFamily(f).map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="flex min-h-11 items-center">{t(`services.${s.slug}.name`)}</Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
        {(["projects", "finishes", "architects", "about"] as const).map((k) => (
          <li key={k}>
            <Link href={k === "finishes" ? "/finishes" : `/${k}`} className="flex min-h-11 items-center font-medium">{t(`nav.${k}`)}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <header className="site-header sticky top-0 z-30 border-b border-n-200 bg-n-50/95 backdrop-blur">
      <div className="container-page relative flex h-[var(--header-h)] items-center justify-between gap-4">
        <Logo locale={locale} label={t("a11y.home")} />

        <nav aria-label={t("a11y.primaryNav")} className="hidden items-center gap-1 lg:flex">
          <MegaMenu label={t("nav.services")}>{megaPanel}</MegaMenu>
          <Link href="/projects" className={linkCls}>{t("nav.projects")}</Link>
          <Link href="/finishes" className={linkCls}>{t("nav.finishes")}</Link>
          <Link href="/architects" className={linkCls}>{t("nav.architects")}</Link>
          <Link href="/about" className={linkCls}>{t("nav.about")}</Link>
        </nav>

        <div className="flex items-center gap-1">
          <LangSwitcher />
          <a
            href={whatsappUrl()}
            rel="noopener"
            aria-label={t("nav.whatsapp")}
            className="hidden size-11 items-center justify-center rounded-control text-n-800 hover:bg-n-100 sm:inline-flex"
          >
            <MessageCircle size={22} strokeWidth={1.5} aria-hidden />
          </a>
          <Link href="/quote" className={buttonClass("primary", "hidden sm:inline-flex")}>{t("nav.quote")}</Link>
          <MobileMenu openLabel={t("a11y.menu")} closeLabel={t("a11y.close")}>{mobileNav}</MobileMenu>
        </div>
      </div>
    </header>
  );
}
