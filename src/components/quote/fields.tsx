"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/ui";

export function Field({ id, label, hint, error, valid, validLabel, group, children }: { id: string; label: string; group?: boolean; hint?: string; error?: string; valid?: boolean; validLabel?: string; children: React.ReactNode }) {
  return (
    <div>
      {(() => {
        const content = (<>{label}{valid && !error && (<span className="inline-flex items-center gap-1 text-sm font-normal text-olive-700"><Check size={16} strokeWidth={2} aria-hidden /><span className="sr-only-x">{validLabel}</span></span>)}</>);
        const cls = "mb-1 flex items-center gap-2 font-medium text-n-900";
        // Radio groups are labelled by a span (aria-labelledby on the group); text inputs use a real <label for>
        return group ? <span id={`${id}-l`} className={cls}>{content}</span> : <label htmlFor={id} className={cls}>{content}</label>;
      })()}
      {hint && <p id={`${id}-hint`} className="mb-2 text-sm text-n-600">{hint}</p>}
      {children}
      {error && <p id={`${id}-err`} role="alert" className="mt-2 text-sm font-medium text-danger">{error}</p>}
    </div>
  );
}

export const inputCls = (error?: string) =>
  cn("block min-h-11 w-full rounded-control border bg-n-50 px-3 text-base text-n-900 placeholder:text-n-500", error ? "border-danger" : "border-n-400 hover:border-n-500");

export function Choice({ name, options, value, onChange, error, id }: { name: string; options: { value: string; label: string }[]; value: string; onChange: (v: string) => void; error?: string; id: string }) {
  return (
    <div role="radiogroup" aria-labelledby={`${id}-l`} aria-describedby={error ? `${id}-err` : undefined} id={id} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <label key={o.value} className={cn("label-caps inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-control border px-4 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-maroon",
          value === o.value ? "border-maroon bg-maroon text-n-50" : "border-olive-200 bg-olive-50 text-olive-700 hover:bg-olive-100")}>
          <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="sr-only-x" />
          {value === o.value && <Check size={16} strokeWidth={2} aria-hidden />}
          {o.label}
        </label>
      ))}
    </div>
  );
}
