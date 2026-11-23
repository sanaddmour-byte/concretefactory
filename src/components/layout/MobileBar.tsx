"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Phone, FileText } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buttonClass } from "@/lib/ui";

type Props = { quote: string; whatsapp: string; call: string; whatsappHref: string; telHref: string };

/** Sticky Quote · WhatsApp · Call bar (mobile). Shows once the #hero section leaves the viewport. */
export function MobileBar({ quote, whatsapp, call, whatsappHref, telHref }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) {
      setVisible(true); // pages without a hero show the bar immediately
      return;
    }
    const io = new IntersectionObserver(([e]) => setVisible(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  const item = "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-control text-xs font-medium text-n-800";
  return (
    <div
      aria-hidden={!visible}
      inert={!visible}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-n-200 bg-n-50/95 pb-[env(safe-area-inset-bottom)] backdrop-blur transition-transform duration-200 lg:hidden ${visible ? "translate-y-0" : "translate-y-full"}`}
    >
      <div className="grid grid-cols-[1.4fr_1fr_1fr] items-center gap-2 p-2">
        <Link href="/quote" className={buttonClass("primary", "w-full px-2 text-xs")}>
          <FileText size={18} strokeWidth={1.5} aria-hidden /> {quote}
        </Link>
        <a href={whatsappHref} className={item} rel="noopener">
          <MessageCircle size={20} strokeWidth={1.5} aria-hidden /> {whatsapp}
        </a>
        <a href={telHref} className={item}>
          <Phone size={20} strokeWidth={1.5} aria-hidden /> {call}
        </a>
      </div>
    </div>
  );
}
