/** Static preview build only: there is no server, so forms cannot send. They show the WhatsApp fallback instead. */
export type ActionResult = { ok: false; error: "unavailable" };
const unavailable = async (): Promise<ActionResult> => ({ ok: false, error: "unavailable" });
export const submitQuote = unavailable;
export const submitVisit = unavailable;
export const submitSampleBox = unavailable;
