"use client";

import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

/* Form — a dynamic multi-field input rendered inside the thread.

   This is an *input* component: it pauses the turn. The agent has asked for
   something and won't continue until it's submitted. Once sent, the form stays
   in place but fades back and stops responding — the answers remain visible in
   context, while nothing about it invites another edit.

   Validation runs on submit rather than on every keystroke: telling someone
   their email is invalid while they're still halfway through typing it is
   noise, not help. */

const LINE = "#E0DAD3";
const INK = "#333333";
const MUTED = "#6E6E6E";
const DANGER = "#C0392B";

export type FormField = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "select" | "textarea";
  placeholder?: string;
  required?: boolean;
  options?: string[];
};

export type FormData = {
  title?: string;
  fields: FormField[];
  submitLabel?: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(fields: FormField[], values: Record<string, string>) {
  const errors: Record<string, string> = {};
  for (const f of fields) {
    const v = (values[f.name] ?? "").trim();
    if (f.required && !v) {
      errors[f.name] = "Required";
      continue;
    }
    if (v && f.type === "email" && !EMAIL.test(v)) errors[f.name] = "Enter a valid email";
    if (v && f.type === "tel" && v.replace(/\D/g, "").length < 7)
      errors[f.name] = "Enter a valid number";
  }
  return errors;
}

export type FormEntry = { label: string; value: string };

/** Answered fields, in the order the form asked for them. */
export function entriesOf(data: FormData, values: Record<string, string>): FormEntry[] {
  return data.fields
    .map((f) => ({ label: f.label, value: (values[f.name] ?? "").trim() }))
    .filter((e) => e.value);
}

/** Plain-text recap — kept for copy, read-aloud and screen readers. */
function summarise(data: FormData, values: Record<string, string>) {
  const lines = entriesOf(data, values).map((e) => `${e.label}: ${e.value}`);
  return `${data.title ?? "Details"} sent\n\n${lines.join("\n")}`;
}

/* The same recap rendered inside the visitor's own bubble. Colours are
   inherited from the bubble rather than set here, so it stays legible whatever
   accent the tenant uses; only the check keeps its own green. */
export function FormSummary({ title, entries }: { title: string; entries: FormEntry[] }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 font-semibold">
        <span
          className="flex size-4 shrink-0 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: "#16A34A" }}
        >
          <Check className="size-2.5" strokeWidth={3} aria-hidden />
        </span>
        {title} sent
      </p>

      {/* label and value share a line — the bubble runs to 80% of the column,
          which is wide enough for both without stacking */}
      <dl className="mt-2 flex flex-col gap-0.5">
        {entries.map((e) => (
          <div key={e.label} className="flex flex-wrap gap-x-1">
            <dt className="shrink-0 opacity-60">{e.label}:</dt>
            <dd className="min-w-0">{e.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function InlineForm({
  data,
  onSubmit,
}: {
  data: FormData;
  /** Receives the raw values and the recap to post into the thread. */
  onSubmit?: (values: Record<string, string>, summary: string) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const set = (name: string, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    /* clear a field's error as soon as it's touched again */
    setErrors((e) => (e[name] ? { ...e, [name]: "" } : e));
  };

  const submit = () => {
    const found = validate(data.fields, values);
    const has = Object.values(found).some(Boolean);
    setErrors(found);
    if (has) return;
    setSent(true);
    onSubmit?.(values, summarise(data, values));
  };

  const base =
    "w-full rounded-[10px] border px-2.5 py-2 text-[12.5px] outline-none transition-colors";

  return (
    /* Faded and inert once sent, rather than swapped for a summary — the
       answers stay where they were given. */
    <div
      className="w-full min-w-0 rounded-[12px] border bg-white p-3 transition-opacity"
      style={{
        borderColor: LINE,
        opacity: sent ? 0.5 : 1,
        pointerEvents: sent ? "none" : undefined,
      }}
      aria-disabled={sent}
    >
      {data.title && (
        <p className="mb-2 text-[12px] font-semibold" style={{ color: INK }}>
          {data.title}
        </p>
      )}

      <div className="flex flex-col gap-2.5">
        {data.fields.map((f) => {
          const err = errors[f.name];
          const border = err ? DANGER : LINE;
          return (
            <div key={f.name}>
              <label
                className="mb-1 block text-[11px] font-medium"
                style={{ color: MUTED }}
                htmlFor={f.name}
              >
                {f.label}
                {f.required && <span style={{ color: DANGER }}> *</span>}
              </label>

              {f.type === "select" ? (
                <div className="relative">
                  <select
                    id={f.name}
                    value={values[f.name] ?? ""}
                    disabled={sent}
                    onChange={(e) => set(f.name, e.target.value)}
                    className={`${base} appearance-none pr-8`}
                    style={{ borderColor: border, color: values[f.name] ? INK : "#A8A096" }}
                  >
                    <option value="">{f.placeholder ?? "Choose one"}</option>
                    {f.options?.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2"
                    strokeWidth={2}
                    style={{ color: MUTED }}
                    aria-hidden
                  />
                </div>
              ) : f.type === "textarea" ? (
                <textarea
                  id={f.name}
                  rows={2}
                  value={values[f.name] ?? ""}
                  placeholder={f.placeholder}
                  disabled={sent}
                  onChange={(e) => set(f.name, e.target.value)}
                  className={`${base} resize-none placeholder:text-[#A8A096]`}
                  style={{ borderColor: border, color: INK }}
                />
              ) : (
                <input
                  id={f.name}
                  type={f.type ?? "text"}
                  value={values[f.name] ?? ""}
                  placeholder={f.placeholder}
                  disabled={sent}
                  onChange={(e) => set(f.name, e.target.value)}
                  className={`${base} placeholder:text-[#A8A096]`}
                  style={{ borderColor: border, color: INK }}
                />
              )}

              {err && (
                <p className="mt-1 text-[10.5px]" style={{ color: DANGER }}>
                  {err}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={sent}
        className="mt-3 w-full rounded-full px-4 py-2 text-[12.5px] font-semibold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--ds-accent)" }}
      >
        {data.submitLabel ?? "Submit"}
      </button>
    </div>
  );
}
