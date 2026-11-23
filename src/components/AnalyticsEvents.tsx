"use client";

import { useEffect } from "react";
import { track, type EventName } from "@/lib/analytics";

/** One delegated click listener: WhatsApp links, phone links, spec downloads and sample-list handoffs. */
export function AnalyticsEvents() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      const tagged = a.getAttribute("data-track") as EventName | null;
      if (tagged) track(tagged);
      else if (href.startsWith("https://wa.me/")) track("whatsapp_click", { from: location.pathname });
      else if (href.startsWith("tel:")) track("phone_click", { from: location.pathname });
      else if (/\/(quote|visit)\?samples=/.test(href)) track("sample_request", { to: href.split("?")[0] });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
