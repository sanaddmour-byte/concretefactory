"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { submitVisit } from "@/app/actions";
import { track } from "@/lib/analytics";
import { SLOTS, normalizePhone } from "@/lib/validate";
import { buttonClass } from "@/lib/ui";
import { Choice, Field, inputCls } from "./fields";

type Props = { finishes: { code: string; label: string }[]; whatsapp: string; closedDays: number[] };
const iso = (d: Date) => d.toISOString().slice(0, 10);

export function VisitForm({ finishes, whatsapp, closedDays }: Props) {
  const t = useTranslations("visit");
  const locale = useLocale();
  const sp = useSearchParams();
  const [v, setV] = useState({ date: "", slot: "", name: "", phone: "", note: "" });
  const [codes, setCodes] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState<"send" | "rate" | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const hp = useRef<HTMLInputElement>(null);

  const tomorrow = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return iso(d); })();

  useEffect(() => {
    let fin = (sp.get("samples") ?? "").split(",").filter(Boolean);
    if (!fin.length) { try { const raw = JSON.parse(localStorage.getItem("cf-samples") ?? "[]"); if (Array.isArray(raw)) fin = raw; } catch { /* ignore */ } }
    setCodes(fin.filter((c) => finishes.some((f) => f.code === c)).slice(0, 6));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k: keyof typeof v, val: string) => { setV((s) => ({ ...s, [k]: val })); setErrors((e) => { const n = { ...e }; delete n[k]; return n; }); };
  const label = (c: string) => finishes.find((f) => f.code === c)?.label ?? c;

  const validate = () => {
    const e: Record<string, string> = {};
    const day = v.date ? new Date(`${v.date}T00:00:00Z`).getUTCDay() : NaN;
    if (!v.date || v.date < tomorrow || closedDays.includes(day)) e.date = "date";
    if (!v.slot) e.slot = "slot";
    if (v.name.trim().length < 2) e.name = "name";
    if (!normalizePhone(v.phone)) e.phone = "phone";
    return e;
  };
  const waText = (ref?: string) => [t("wa.intro"), ref ? `${t("wa.ref")}: ${ref}` : "", `${t("wa.date")}: ${v.date}`, v.slot ? `${t("wa.slot")}: ${t(`slots.${v.slot}`)}` : "", `${t("wa.name")}: ${v.name}`, codes.length ? `${t("wa.finishes")}: ${codes.map(label).join(", ")}` : ""].filter(Boolean).join("\n");
  const waLink = (ref?: string) => `https://wa.me/${whatsapp}?text=${encodeURIComponent(waText(ref))}`;

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate(); setErrors(e);
    const first = Object.keys(e)[0];
    if (first) { document.getElementById(`v-${first}`)?.focus(); return; }
    setSending(true); setFailed(null);
    const fd = new FormData();
    fd.set("payload", JSON.stringify({ ...v, finishes: codes, locale, hp: hp.current?.value ?? "" }));
    try {
      const r = await submitVisit(fd);
      if (r.ok) { track("visit_submit"); setDone(r.ref); }
      else if (r.error === "invalid") { const f: Record<string, string> = {}; (r.fields ?? []).forEach((k) => (f[k] = k)); setErrors(f); }
      else setFailed(r.error === "rate" ? "rate" : "send");
    } catch { setFailed("send"); }
    setSending(false);
  };

  if (done) {
    return (
      <div className="mx-auto max-w-2xl rounded-card border border-olive-200 bg-olive-100 p-8 md:p-12" role="status">
        <h2 className="display text-3xl md:text-4xl">{t("success.title")}</h2>
        <p className="mt-4 text-lg text-n-800">{t("success.ref")}: <bdi className="ltr-num font-semibold">{done}</bdi></p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={waLink(done)} rel="noopener" className={buttonClass("primary")}><MessageCircle size={20} strokeWidth={1.5} aria-hidden /> WhatsApp</a>
          <Link href="/visit" className={buttonClass("secondary")} onClick={() => setDone(null)}>{t("success.again")}</Link>
        </div>
      </div>
    );
  }

  const err = (k: string) => (errors[k] ? t(`errors.${errors[k]}`) : undefined);
  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-2xl space-y-8">
      <Field id="v-date" label={t("date")} hint={t("dateHint")} error={err("date")}>
        <input id="v-date" type="date" min={tomorrow} dir="ltr" value={v.date} onChange={(e) => set("date", e.target.value)} aria-describedby="v-date-hint" aria-invalid={!!errors.date} className={inputCls(err("date")) + " max-w-[14rem]"} />
      </Field>
      <Field id="v-slot" group label={t("slot")} error={err("slot")}>
        <Choice id="v-slot" name="slot" value={v.slot} onChange={(x) => set("slot", x)} error={err("slot")} options={SLOTS.map((x) => ({ value: x, label: t(`slots.${x}`) }))} />
      </Field>
      {codes.length > 0 && (
        <div>
          <p className="mb-2 font-medium text-n-900">{t("finishes")}</p>
          <ul className="flex flex-wrap gap-2">
            {codes.map((c) => (
              <li key={c} className="inline-flex items-center gap-1 rounded-control border border-olive-200 bg-olive-100 ps-3 text-sm text-olive-700">
                <span dir="auto">{label(c)}</span>
                <button type="button" aria-label={label(c)} onClick={() => setCodes(codes.filter((x) => x !== c))} className="inline-flex size-9 items-center justify-center"><X size={16} aria-hidden /></button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Field id="v-name" label={t("name")} error={err("name")}>
        <input id="v-name" autoComplete="name" value={v.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} className={inputCls(err("name"))} />
      </Field>
      <Field id="v-phone" label={t("phone")} error={err("phone")}>
        <input id="v-phone" type="tel" inputMode="tel" dir="ltr" autoComplete="tel" placeholder="79 717 9702" value={v.phone} onChange={(e) => set("phone", e.target.value)} aria-invalid={!!errors.phone} className={inputCls(err("phone"))} />
      </Field>
      <Field id="v-note" label={t("note")}>
        <textarea id="v-note" rows={3} maxLength={600} value={v.note} onChange={(e) => set("note", e.target.value)} className={inputCls() + " py-2"} />
      </Field>
      <input ref={hp} name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -start-[9999px] size-px opacity-0" />
      {failed && (
        <div role="alert" className="rounded-control border border-danger bg-n-50 p-4">
          <p className="font-medium text-danger">{failed === "rate" ? t("errors.rate") : t("errors.send")}</p>
          {failed === "send" && <a href={waLink()} rel="noopener" className={buttonClass("secondary", "mt-3")}><MessageCircle size={18} strokeWidth={1.5} aria-hidden /> WhatsApp</a>}
        </div>
      )}
      <button type="submit" disabled={sending} className={buttonClass("primary")}>{sending ? t("sending") : t("submit")}</button>
    </form>
  );
}
