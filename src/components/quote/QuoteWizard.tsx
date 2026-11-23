"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Check, MessageCircle, Upload, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { submitQuote } from "@/app/actions";
import { track } from "@/lib/analytics";
import { ALLOWED_FILE, CHANNELS, MAX_FILES, MAX_TOTAL_BYTES, PROJECT_TYPES, SETTINGS, STARTS, isEmail, isSize, normalizePhone, parseSize } from "@/lib/validate";
import { addReceipt, applyUrlDefaults, clearDrafts, emptyQuote, findReceipt, loadActive, loadSaved, saveDraft, type Draft, type QuoteValues, type Receipt } from "@/lib/quoteDraft";
import { buttonClass, cn } from "@/lib/ui";
import { Choice, Field, inputCls } from "./fields";

export type WizardProps = {
  services: { slug: string; name: string; src: string | null }[];
  finishes: { code: string; label: string; src: string }[];
  cities: { value: string; label: string }[];
  whatsapp: string;
  sla: string | null;
};

type Values = QuoteValues;
const TOTAL = 5;

/** Shrink photos in the browser so five of them fit the 4 MB request limit; PDFs are sent as they are. */
async function prepare(f: File): Promise<File | null> {
  if (!ALLOWED_FILE.test(f.type)) return null;
  if (f.type === "application/pdf") return f;
  try {
    const bmp = await createImageBitmap(f);
    const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/jpeg", 0.8));
    return blob ? new File([blob], f.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }) : f;
  } catch { return f; }
}

function stepErrors(step: number, v: Values): Record<string, string> {
  const e: Record<string, string> = {};
  if (step === 1 && v.services.length === 0) e.services = "services";
  if (step === 2) {
    if (!v.projectType) e.projectType = "projectType";
    if (!v.city) e.city = "city";
    if (!v.setting) e.setting = "setting";
    if (!isSize(v.size)) e.size = "size";
  }
  if (step === 5) {
    if (v.name.trim().length < 2) e.name = "name";
    if (!normalizePhone(v.phone)) e.phone = "phone";
    if (!v.channel) e.channel = "channel";
    if (v.channel === "email" && !isEmail(v.email)) e.email = "email";
  }
  return e;
}

export function QuoteWizard({ services, finishes, cities, whatsapp, sla }: WizardProps) {
  const t = useTranslations("quote");
  const locale = useLocale();
  const router = useRouter();
  const sp = useSearchParams();
  const step = Math.min(TOTAL, Math.max(1, parseInt(sp.get("step") ?? "1", 10) || 1));
  const doneRef = sp.get("done");

  const [v, setV] = useState<Values>(emptyQuote);
  const [ready, setReady] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null | undefined>(undefined); // undefined = not checked yet
  const applied = useRef("");
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [fileErr, setFileErr] = useState(false);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState<"send" | "rate" | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const hp = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const started = useRef(false);

  // 1) restore this tab's active draft FIRST (so answers survive a language switch or reload),
  // 2) then merge the URL's prefill (?service=, ?samples= or the saved sample list) on top of it,
  // 3) only if there is neither, offer an older saved draft; 4) a ?done= reference must match a receipt from this session.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const svc = (q.get("service") ?? "").split(",").filter((x) => services.some((y) => y.slug === x));
    let fin = (q.get("samples") ?? "").split(",").filter(Boolean);
    if (!fin.length) { try { const raw = JSON.parse(localStorage.getItem("cf-samples") ?? "[]"); if (Array.isArray(raw)) fin = raw; } catch { /* ignore */ } }
    fin = fin.filter((c) => finishes.some((f) => f.code === c)).slice(0, 6);
    const active = loadActive(sessionStorage);
    const d = applyUrlDefaults(active, svc, fin);
    applied.current = d.applied;
    setV(d.values);
    if (active && !q.has("step") && d.step > 1 && !q.get("done")) { q.set("step", String(d.step)); router.replace(`/quote?${q}`, { scroll: false }); }
    if (!active && !svc.length && !q.get("samples") && !q.get("done")) { const saved = loadSaved(localStorage); if (saved) setDraft(saved); }
    const ref = q.get("done");
    if (ref) {
      const r = findReceipt(ref, sessionStorage);
      setReceipt(r);
      if (!r) { const n = new URLSearchParams(window.location.search); n.delete("done"); n.delete("step"); router.replace(`/quote${n.size ? `?${n}` : ""}`, { scroll: false }); }
    } else setReceipt(null);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave (answers only; files cannot be stored): the session copy keeps answers across EN/AR switches, the saved copy offers a restore on a later visit
  useEffect(() => {
    if (!ready || doneRef) return;
    const id = setTimeout(() => saveDraft({ values: v, step, applied: applied.current }, sessionStorage, localStorage), 300);
    return () => clearTimeout(id);
  }, [v, step, doneRef, ready]);

  // Move focus to the step heading when the step changes (and announce via aria-live)
  useEffect(() => { if (started.current) heading.current?.focus(); }, [step]);

  const set = <K extends keyof Values>(k: K, val: Values[K]) => {
    if (!started.current) { started.current = true; track("quote_start"); }
    setV((s) => ({ ...s, [k]: val }));
    setErrors((e) => { const n = { ...e }; delete n[k as string]; return n; });
  };
  const toggle = (k: "services" | "finishes", val: string, max = 99) =>
    set(k, v[k].includes(val) ? v[k].filter((x) => x !== val) : v[k].length < max ? [...v[k], val] : v[k]);

  const go = (n: number) => {
    const q = new URLSearchParams(window.location.search);
    q.set("step", String(n));
    router.push(`/quote?${q}`, { scroll: false });
  };
  const next = () => {
    const e = stepErrors(step, v);
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) { document.getElementById(`f-${first}`)?.focus(); return; }
    track(`quote_step_${step + 1}` as "quote_step_2");
    go(step + 1);
  };

  const addFiles = async (list: FileList | null) => {
    if (!list) return;
    const picked = [...list]; // copy now: the input is reset right after this handler starts, which empties the live FileList
    const prepared = await Promise.all(picked.map(prepare));
    const ok = prepared.filter((f): f is File => !!f);
    const merged = [...files, ...ok];
    const bad = ok.length !== picked.length || merged.length > MAX_FILES || merged.reduce((n, f) => n + f.size, 0) > MAX_TOTAL_BYTES;
    setFileErr(bad);
    if (!bad) setFiles(merged);
  };

  const summaryText = (ref: string, v: Values) => {
    const svc = v.services.map((s) => services.find((x) => x.slug === s)?.name).filter(Boolean).join(", ");
    const city = cities.find((c) => c.value === v.city)?.label ?? "";
    const lines = [t("wa.intro"), `${t("wa.ref")}: ${ref}`, `${t("wa.services")}: ${svc}`,
      `${t("wa.project")}: ${v.projectType ? t(`types.${v.projectType}`) : ""}${city ? `, ${city}` : ""}`,
      v.size ? `${t("wa.size")}: ${parseSize(v.size) ?? v.size} ${t("sizeUnit")}` : "", v.setting ? `${t("wa.setting")}: ${t(`settings.${v.setting}`)}` : "",
      v.start ? `${t("wa.start")}: ${t(`starts.${v.start}`)}` : "", `${t("wa.name")}: ${v.name}`].filter(Boolean);
    return lines.join("\n");
  };
  const waLink = (text: string) => `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;

  const submit = async () => {
    for (const s of [1, 2, 5]) {
      const e = stepErrors(s, v);
      if (Object.keys(e).length) { setErrors(e); if (s !== step) go(s); else document.getElementById(`f-${Object.keys(e)[0]}`)?.focus(); return; }
    }
    setSending(true); setFailed(null);
    const fd = new FormData();
    fd.set("payload", JSON.stringify({ ...v, locale, hp: hp.current?.value ?? "" }));
    files.forEach((f) => fd.append("files", f));
    try {
      const r = await submitQuote(fd);
      if (r.ok) {
        track("quote_submit", { services: v.services.join(",") });
        const rec: Receipt = { ref: r.ref, emailed: r.emailed, values: v, at: Date.now() };
        addReceipt(rec, sessionStorage); clearDrafts(sessionStorage, localStorage);
        setReceipt(rec);
        router.replace(`/quote?done=${r.ref}`, { scroll: true });
      } else if (r.error === "files") { setFileErr(true); go(3); }
      else if (r.error === "invalid") { const f: Record<string, string> = {}; (r.fields ?? []).forEach((k) => (f[k] = k)); setErrors(f); }
      else setFailed(r.error === "rate" ? "rate" : "send");
    } catch { setFailed("send"); }
    setSending(false);
  };

  /* ---------------- Success: only for a reference this session actually produced ---------------- */
  if (doneRef && receipt === undefined) return <div className="mx-auto min-h-[24rem] max-w-2xl animate-pulse rounded-card bg-n-100" aria-hidden />;
  if (doneRef && receipt) {
    return (
      <div className="mx-auto max-w-2xl rounded-card border border-olive-200 bg-olive-100 p-8 md:p-12" role="status">
        <h2 className="display text-3xl md:text-4xl">{t("success.title")}</h2>
        <p className="mt-4 text-lg text-n-800">{t("success.ref")}: <bdi className="ltr-num font-semibold">{receipt.ref}</bdi></p>
        <p className="mt-2 text-n-700">{sla ? t("success.sla", { sla }) : t("success.slaGeneric")}</p>
        {!receipt.emailed && process.env.NODE_ENV !== "production" && <p className="ph-badge mt-3">{t("success.noEmail")}</p>}
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={waLink(summaryText(receipt.ref, receipt.values))} rel="noopener" onClick={() => track("quote_whatsapp_handoff")} className={buttonClass("primary")}>
            <MessageCircle size={20} strokeWidth={1.5} aria-hidden /> {t("success.whatsapp")}
          </a>
          <Link href="/quote" className={buttonClass("secondary")}>{t("success.again")}</Link>
        </div>
      </div>
    );
  }

  const stepNames = t.raw("stepNames") as string[];
  const err = (k: string) => (errors[k] ? t(`errors.${errors[k]}`) : undefined);
  const phoneOk = !!normalizePhone(v.phone), nameOk = v.name.trim().length >= 2, emailOk = isEmail(v.email);

  return (
    <div className="mx-auto max-w-3xl">
      {draft && (
        <div role="status" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-control border border-olive-200 bg-olive-50 p-4">
          <span>{t("draft")}</span>
          <span className="flex gap-2">
            <button type="button" className={buttonClass("primary", "min-h-11 px-4 text-sm")} onClick={() => { setV(draft.values); applied.current = draft.applied; setDraft(null); go(draft.step); }}>{t("restore")}</button>
            <button type="button" className={buttonClass("secondary", "min-h-11 px-4 text-sm")} onClick={() => { try { localStorage.removeItem("cf-quote-draft"); } catch { /* ignore */ } setDraft(null); }}>{t("fresh")}</button>
          </span>
        </div>
      )}

      <div role="progressbar" aria-valuemin={1} aria-valuemax={TOTAL} aria-valuenow={step} aria-label={t("progress", { n: step, total: TOTAL })} className="h-1.5 overflow-hidden rounded-full bg-n-200">
        <div className="h-full bg-maroon motion-safe:transition-[width] motion-safe:duration-300" style={{ width: `${(step / TOTAL) * 100}%` }} />
      </div>
      <p className="mt-2 text-sm text-n-600">{t("progress", { n: step, total: TOTAL })} · {stepNames[step - 1]}</p>
      <p className="sr-only-x" aria-live="polite">{t("stepAnnounce", { n: step, total: TOTAL, name: stepNames[step - 1] })}</p>

      <form onSubmit={(e) => { e.preventDefault(); if (step < TOTAL) next(); else void submit(); }} noValidate className="mt-6">
        <h2 ref={heading} tabIndex={-1} className="display text-3xl outline-none md:text-4xl">{t(`s${step}.title`)}</h2>
        {step !== 2 && step !== 5 && <p className="mt-2 text-n-700">{t(`s${step}.hint`)}</p>}

        <div className="mt-8 space-y-8">
          {step === 1 && (
            <div>
              <ul id="f-services" tabIndex={-1} className="grid grid-cols-2 gap-3 md:grid-cols-3" aria-describedby={errors.services ? "services-err" : undefined}>
                {services.map((s) => {
                  const on = v.services.includes(s.slug);
                  return (
                    <li key={s.slug}>
                      <button type="button" aria-pressed={on} onClick={() => toggle("services", s.slug)}
                        className={cn("relative flex h-full w-full flex-col overflow-hidden rounded-card border-2 text-start motion-safe:transition-colors", on ? "border-maroon bg-olive-50" : "border-n-300 bg-n-50 hover:border-n-400")}>
                        <span className="relative block aspect-[4/3] w-full bg-n-200">
                          {s.src ? <Image src={s.src} alt="" fill sizes="(min-width: 768px) 240px, 45vw" className="object-cover" /> : <span className="tex-placeholder absolute inset-0" />}
                          {on && <span className="absolute end-2 top-2 inline-flex size-7 items-center justify-center rounded-full bg-maroon text-n-50"><Check size={16} strokeWidth={2.5} aria-hidden /></span>}
                        </span>
                        <span className="p-3 text-sm font-semibold leading-snug text-n-900">{s.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {errors.services && <p id="services-err" role="alert" className="mt-3 text-sm font-medium text-danger">{t("errors.services")}</p>}
            </div>
          )}

          {step === 2 && (
            <>
              <Field id="f-projectType" group label={t("projectType")} error={err("projectType")}>
                <Choice id="f-projectType" name="projectType" value={v.projectType} onChange={(x) => set("projectType", x)} error={err("projectType")} options={PROJECT_TYPES.map((x) => ({ value: x, label: t(`types.${x}`) }))} />
              </Field>
              <Field id="f-city" label={t("city")} error={err("city")} valid={!!v.city} validLabel={t("valid")}>
                <select id="f-city" value={v.city} onChange={(e) => set("city", e.target.value)} aria-invalid={!!errors.city} className={inputCls(err("city"))}>
                  <option value="">{t("cityPlaceholder")}</option>
                  {cities.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </Field>
              <Field id="f-size" label={`${t("size")} (${t("sizeUnit")})`} hint={t("sizeHint")} error={err("size")} valid={!!v.size && isSize(v.size)} validLabel={t("valid")}>
                <input id="f-size" inputMode="decimal" dir="ltr" value={v.size} onChange={(e) => set("size", e.target.value)} aria-describedby="f-size-hint" aria-invalid={!!errors.size} className={cn(inputCls(err("size")), "max-w-[12rem]")} />
              </Field>
              <Field id="f-setting" group label={t("setting")} error={err("setting")}>
                <Choice id="f-setting" name="setting" value={v.setting} onChange={(x) => set("setting", x)} error={err("setting")} options={SETTINGS.map((x) => ({ value: x, label: t(`settings.${x}`) }))} />
              </Field>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <p className="mb-1 font-medium text-n-900">{t("finishes")}</p>
                <p className="mb-3 text-sm text-n-600">{t("finishesHint")}</p>
                <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                  {finishes.map((f) => {
                    const on = v.finishes.includes(f.code);
                    return (
                      <li key={f.code}>
                        <button type="button" aria-pressed={on} aria-label={f.label} title={f.label} onClick={() => toggle("finishes", f.code, 6)}
                          className={cn("relative block aspect-square w-full overflow-hidden rounded-control border-2", on ? "border-maroon" : "border-transparent hover:border-n-400")}>
                          <Image src={f.src} alt="" fill sizes="80px" className="object-cover" />
                          {on && <span className="absolute inset-0 grid place-items-center bg-maroon/55 text-n-50"><Check size={22} strokeWidth={2.5} aria-hidden /></span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-2 text-sm text-n-600">{v.finishes.length ? `${v.finishes.length}/6` : t("finishesNone")} · <Link href="/finishes" className="text-maroon underline underline-offset-4">{t("browseFinishes")}</Link></p>
              </div>
              <div>
                <p className="mb-1 font-medium text-n-900">{t("files")}</p>
                <p id="files-hint" className="mb-3 text-sm text-n-600">{t("filesHint")}</p>
                <label className={cn(buttonClass("secondary"), "cursor-pointer has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-maroon")}>
                  <Upload size={18} strokeWidth={1.5} aria-hidden /> {t("filesAdd")}
                  <input type="file" multiple accept="image/jpeg,image/png,application/pdf" className="sr-only-x" aria-describedby="files-hint" onChange={(e) => { void addFiles(e.target.files); e.target.value = ""; }} />
                </label>
                {fileErr && <p role="alert" className="mt-2 text-sm font-medium text-danger">{t("errors.files")}</p>}
                {files.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {files.map((f, i) => (
                      <li key={f.name + i} className="flex items-center justify-between gap-3 rounded-control bg-n-100 px-3 py-2 text-sm">
                        <span dir="auto" className="truncate">{f.name} <span className="text-n-600">({Math.round(f.size / 1024)} KB)</span></span>
                        <button type="button" aria-label={t("filesRemove", { name: f.name })} onClick={() => setFiles(files.filter((_, j) => j !== i))} className="inline-flex size-9 items-center justify-center rounded-control hover:bg-n-200"><X size={18} aria-hidden /></button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}

          {step === 4 && (
            <Field id="f-start" group label={t("start")}>
              <Choice id="f-start" name="start" value={v.start} onChange={(x) => set("start", x)} options={STARTS.map((x) => ({ value: x, label: t(`starts.${x}`) }))} />
            </Field>
          )}

          {step === 5 && (
            <>
              <Field id="f-name" label={t("name")} error={err("name")} valid={nameOk && !!touched.name} validLabel={t("valid")}>
                <input id="f-name" autoComplete="name" value={v.name} onChange={(e) => set("name", e.target.value)} onBlur={() => setTouched((s) => ({ ...s, name: true }))} aria-invalid={!!errors.name} className={inputCls(err("name"))} />
              </Field>
              <Field id="f-phone" label={t("phone")} hint={t("phoneHint")} error={err("phone")} valid={phoneOk && !!touched.phone} validLabel={t("valid")}>
                <input id="f-phone" type="tel" inputMode="tel" dir="ltr" autoComplete="tel" placeholder="79 717 9702" value={v.phone} onChange={(e) => set("phone", e.target.value)} onBlur={() => setTouched((s) => ({ ...s, phone: true }))} aria-describedby="f-phone-hint" aria-invalid={!!errors.phone} className={inputCls(err("phone"))} />
              </Field>
              <Field id="f-channel" group label={t("channel")} error={err("channel")}>
                <Choice id="f-channel" name="channel" value={v.channel} onChange={(x) => set("channel", x)} error={err("channel")} options={CHANNELS.map((x) => ({ value: x, label: t(`channels.${x}`) }))} />
              </Field>
              {v.channel === "email" && (
                <Field id="f-email" label={t("email")} error={err("email")} valid={emailOk && !!touched.email} validLabel={t("valid")}>
                  <input id="f-email" type="email" dir="ltr" autoComplete="email" value={v.email} onChange={(e) => set("email", e.target.value)} onBlur={() => setTouched((s) => ({ ...s, email: true }))} aria-invalid={!!errors.email} className={inputCls(err("email"))} />
                </Field>
              )}
              <input ref={hp} name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -start-[9999px] size-px opacity-0" />
              {failed && (
                <div role="alert" className="rounded-control border border-danger bg-n-50 p-4">
                  <p className="font-medium text-danger">{failed === "rate" ? t("errors.rate") : t("errors.send")}</p>
                  {failed === "send" && (
                    <a href={waLink(summaryText("-", v))} rel="noopener" className={buttonClass("secondary", "mt-3")}><MessageCircle size={18} strokeWidth={1.5} aria-hidden /> {t("fail.whatsapp")}</a>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-10 flex items-center justify-between gap-3">
          {step > 1 ? <button type="button" onClick={() => go(step - 1)} className={buttonClass("ghost")}>{t("back")}</button> : <span />}
          <button type="submit" disabled={sending} className={buttonClass("primary")}>
            {sending ? t("sending") : step < TOTAL ? t("next") : t("submit")}
          </button>
        </div>
      </form>
    </div>
  );
}
