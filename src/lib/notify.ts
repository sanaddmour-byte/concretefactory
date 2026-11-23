import "server-only";
import { randomBytes } from "node:crypto";

export type Attachment = { filename: string; content: string }; // base64

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // no look-alike characters
export function makeRef(prefix: string) {
  const d = new Date();
  const ymd = `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  const rnd = [...randomBytes(4)].map((b) => ALPHABET[b % ALPHABET.length]).join("");
  return `${prefix}-${ymd}-${rnd}`;
}

export const mailConfigured = () => !!(process.env.RESEND_API_KEY && process.env.QUOTE_TO_EMAIL && process.env.QUOTE_FROM_EMAIL);

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Readable summary as plain text + simple HTML table. */
export function summarise(title: string, rows: [string, string][]) {
  const text = `${title}\n\n${rows.map(([k, v]) => `${k}: ${v || "-"}`).join("\n")}\n`;
  const html = `<h2 style="font-family:sans-serif">${esc(title)}</h2><table style="font-family:sans-serif;border-collapse:collapse">${rows
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#5e5e5e;vertical-align:top">${esc(k)}</td><td style="padding:4px 0"><b>${esc(v || "-")}</b></td></tr>`)
    .join("")}</table>`;
  return { text, html };
}

/** Sends via the Resend HTTP API (no SDK, so nothing extra to bundle). Returns true on success. */
export async function sendMail(opts: { subject: string; text: string; html: string; replyTo?: string; attachments?: Attachment[] }) {
  const res = await fetch(process.env.RESEND_API_URL || "https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.QUOTE_FROM_EMAIL,
      to: [process.env.QUOTE_TO_EMAIL],
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
      ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      ...(opts.attachments?.length ? { attachments: opts.attachments } : {}),
    }),
  });
  if (!res.ok) console.error("Resend error", res.status, (await res.text()).slice(0, 300));
  return res.ok;
}
