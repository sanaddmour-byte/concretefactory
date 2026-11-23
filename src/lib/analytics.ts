/** Thin analytics layer: pushes to window.dataLayer if a tag manager exists, logs in development, otherwise a no-op. */
export type EventName =
  | "quote_start" | "quote_step_1" | "quote_step_2" | "quote_step_3" | "quote_step_4" | "quote_step_5"
  | "quote_submit" | "quote_whatsapp_handoff" | "whatsapp_click" | "phone_click" | "sample_request" | "spec_download" | "visit_submit";

export function track(name: EventName, props: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  try {
    const w = window as unknown as { dataLayer?: unknown[] };
    w.dataLayer?.push({ event: name, ...props });
    if (process.env.NODE_ENV !== "production") console.debug("[track]", name, props);
  } catch { /* never break the page for analytics */ }
}
