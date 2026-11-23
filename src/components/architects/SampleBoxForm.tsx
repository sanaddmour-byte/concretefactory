"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Check, MessageCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { submitSampleBox } from "@/app/actions";
import { track } from "@/lib/analytics";
import { isEmail, normalizePhone } from "@/lib/validate";
import { buttonClass, cn } from "@/lib/ui";
import { Field, inputCls } from "@/components/quote/fields";

type Props = { finishes: { code: string; label: string; src: string }[]; cities: { value: string; label: string }[]; whatsapp: string };

export function SampleBoxForm({ finishes, cities, whatsapp }: Props) {
  const t = useTranslations("architects.form");
  const locale = useLocale();
  const sp = useSearchParams();
  const [v, setV] = useState({ project: "", firm: "", city: "", name: "", phone: "", email: "", note: "" });
  const [codes, setCodes] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState<"send" | "rate" | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const hp = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let fin = (sp.get("samples") ?? "").split(",").filter(Boolean);
    if (!fin.length) { try { const raw = JSON.parse(localStorage.getItem("cf-samples") ?? "[]"); if (Array.isArray(raw)) fin = raw; } catch { /* ignore */ } }
    setCodes(fin.filter((c) => finishes.some((f) => f.code === c)).slice(0, 6));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k: keyof typeof v, val: string) => { setV((s) => ({ ...s, [k]: val })); setErrors((e) => { const n = { ...e }; delete n[k]; return n; }); };
  const toggle = (c: string) => { setCodes((l) => (l.includes(c) ? l.filter((x) => x !== c) : l.length < 6 ? [...l, c] : l)); setErrors((e) => { const n = { ...e }; delete n.finishes; return n; }); };
  const label = (c: string) => finishes.find((f) => f.code === c)?.label ?? c;
  const waLink = (ref?: string) => `https://wa.me/${whatsapp}?text=${encodeURIComponent([t("wa.intro"), ref ? `${t("wa.ref")}: ${ref}` : "", `${t("wa.project")}: ${v.project}`, `${t("wa.firm")}: ${v.firm}`, `${t("wa.city")}: ${cities.find((c) => c.value === v.city)?.label ?? ""}`, `${t("wa.finishes")}: ${codes.map(label).join(", ")}`].filter(Boolean).join("\n"))}`;

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (v.project.trim().length < 2) e.project = "project";
    if (v.firm.trim().length < 2) e.firm = "firm";
    if (!v.city) e.city = "city";
    if (v.name.trim().length < 2) e.name = "name";
    if (!normalizePhone(v.phone)) e.phone = "phone";
    if (v.email && !isEmail(v.email)) e.email = "email";
    if (codes.length === 0) e.finishes = "finishes";
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) { document.getElementById(`b-${first}`)?.focus(); return; }
    setSending(true); setFailed(null);
    const fd = new FormData();
    fd.set("payload", JSON.stringify({ ...v, finishes: codes, locale, hp: hp.current?.value ?? "" }));
    try {
      const r = await submitSampleBox(fd);
      if (r.ok) { track("sample_request", { kind: "sample_box" }); setDone(r.ref); }
      else if (r.error === "invalid") { const f: Record<string, string> = {}; (r.fields ?? []).forEach((k) => (f[k] = k)); setErrors(f); }
      else setFailed(r.error === "rate" ? "rate" : "send");
    } catch { setFailed("send"); }
    setSending(false);
  };

  if (done) {
    return (
      <div className="max-w-2xl rounded-card border border-olive-200 bg-olive-100 p-8" role="status">
        <h3 className="display text-2xl md:text-3xl">{t("success.title")}</h3>
        <p className="mt-3 text-lg text-n-800">{t("success.ref")}: <bdi className="ltr-num font-semibold">{done}</bdi></p>
        <a href={waLink(done)} rel="noopener" className={buttonClass("primary", "mt-6")}><MessageCircle size={20} strokeWidth={1.5} aria-hidden /> WhatsApp</a>
      </div>
    );
  }
  const err = (k: string) => (errors[k] ? t(`errors.${errors[k]}`) : undefined);
  return (
    <form onSubmit={submit} noValidate className="max-w-3xl space-y-8">
      <div>
        <p id="b-finishes-l" className="mb-1 font-medium text-n-900">{t("finishes")} <span className="text-sm font-normal text-n-600">({codes.length}/6)</span></p>
        <ul id="b-finishes" tabIndex={-1} aria-labelledby="b-finishes-l" className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
          {finishes.map((f) => {
            const on = codes.includes(f.code);
            return (
              <li key={f.code}>
                <button type="button" aria-pressed={on} aria-label={f.label} title={f.label} onClick={() => toggle(f.code)}
                  className={cn("relative block aspect-square w-full overflow-hidden rounded-control border-2", on ? "border-maroon" : "border-transparent hover:border-n-400")}>
                  <Image src={f.src} alt="" fill sizes="64px" className="object-cover" />
                  {on && <span className="absolute inset-0 grid place-items-center bg-maroon/55 text-n-50"><Check size={20} strokeWidth={2.5} aria-hidden /></span>}
                </button>
              </li>
            );
          })}
        </ul>
        {codes.length === 0 ? <p className="mt-2 text-sm text-n-600">{t("finishesNone")}</p> : <p dir="auto" className="mt-2 text-sm text-n-700">{codes.map(label).join(" · ")}</p>}
        {errors.finishes && <p role="alert" className="mt-2 text-sm font-medium text-danger">{t("errors.finishes")}</p>}
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="b-project" label={t("project")} error={err("project")}><input id="b-project" value={v.project} onChange={(e) => set("project", e.target.value)} aria-invalid={!!errors.project} className={inputCls(err("project"))} /></Field>
        <Field id="b-firm" label={t("firm")} error={err("firm")}><input id="b-firm" autoComplete="organization" value={v.firm} onChange={(e) => set("firm", e.target.value)} aria-invalid={!!errors.firm} className={inputCls(err("firm"))} /></Field>
        <Field id="b-city" label={t("city")} error={err("city")}>
          <select id="b-city" value={v.city} onChange={(e) => set("city", e.target.value)} aria-invalid={!!errors.city} className={inputCls(err("city"))}>
            <option value=""></option>{cities.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </Field>
        <Field id="b-name" label={t("name")} error={err("name")}><input id="b-name" autoComplete="name" value={v.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} className={inputCls(err("name"))} /></Field>
        <Field id="b-phone" label={t("phone")} error={err("phone")}><input id="b-phone" type="tel" inputMode="tel" dir="ltr" autoComplete="tel" placeholder="79 717 9702" value={v.phone} onChange={(e) => set("phone", e.target.value)} aria-invalid={!!errors.phone} className={inputCls(err("phone"))} /></Field>
        <Field id="b-email" label={t("email")} error={err("email")}><input id="b-email" type="email" dir="ltr" autoComplete="email" value={v.email} onChange={(e) => set("email", e.target.value)} aria-invalid={!!errors.email} className={inputCls(err("email"))} /></Field>
      </div>
      <Field id="b-note" label={t("note")}><textarea id="b-note" rows={3} maxLength={600} value={v.note} onChange={(e) => set("note", e.target.value)} className={inputCls() + " py-2"} /></Field>
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
