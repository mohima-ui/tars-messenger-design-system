"use client";

/* ── PREVIEW ON YOUR SITE — layout studies ────────────────────────────────
   The shipped section stacks five things vertically: a label, a tooltip, a
   URL field, a second label, and a dashed dropzone card. That is ~200px of
   a 320px panel spent on a lens that is not even a setting.

   These are alternatives. Each renders in a real 320px panel column, in both
   the empty and the chosen state, and measures itself — the height badge is
   read from the DOM, not typed in. ─────────────────────────────────────── */

import { useLayoutEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Globe,
  ImagePlus,
  Info,
  Link as LinkIcon,
  X,
} from "lucide-react";

const ACCENT = "#7C3AED";
const SHOT = "Screenshot 2026-09-17 at 11.04.png";

/* ── shared chrome ─────────────────────────────────────────────────────── */

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-[#F0F0F0] pb-3">
      <div className="flex items-center py-2.5">
        <span className="flex-1 text-[11px] font-semibold uppercase tracking-wider text-[#9A9A9A]">
          {title}
        </span>
        <ChevronDown className="size-3.5 text-[#C0C0C0]" strokeWidth={2.5} />
      </div>
      <div className="pb-1">{children}</div>
    </section>
  );
}

/* the neighbour below, so each study is judged against what it pushes down
   rather than floating alone on the page */
function NextSectionGhost() {
  return (
    <section className="pb-3 opacity-40">
      <div className="py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#9A9A9A]">
        Launcher style
      </div>
      <div className="flex gap-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-[74px] flex-1 rounded-xl border border-[#E5E5E5]"
          />
        ))}
      </div>
    </section>
  );
}

/* measures whatever it wraps — the cost of a layout, stated in the unit the
   complaint was made in */
function Measured({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [h, setH] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setH(Math.round(entry.contentRect.height)),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div>
      <div className="mb-1.5 flex items-baseline gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#B0B0B0]">
          {label}
        </span>
        <span className="text-[10px] tabular-nums text-[#C8C8C8]">
          {h === null ? "—" : `${h}px`}
        </span>
      </div>
      <div ref={ref} className="rounded-lg outline-1 outline-dashed outline-[#E8E2F5]">
        {children}
      </div>
    </div>
  );
}

function Panel({
  name,
  note,
  empty,
  filled,
}: {
  name: string;
  note: string;
  empty: React.ReactNode;
  filled: React.ReactNode;
}) {
  return (
    <div className="w-[320px] shrink-0">
      <h2 className="text-[15px] font-semibold text-[#222]">{name}</h2>
      <p className="mb-3 mt-1 min-h-[52px] text-[12px] leading-snug text-[#777]">
        {note}
      </p>
      <div className="space-y-5 rounded-2xl border border-[#E8E8E8] bg-white p-4 shadow-sm">
        <Measured label="Empty">{empty}</Measured>
        <Measured label="Chosen">{filled}</Measured>
        <div className="pt-1">
          <NextSectionGhost />
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "h-9 w-full rounded-lg border border-[#E5E5E5] px-3 text-[13px] text-[#333] outline-none placeholder:text-[#B0B0B0] focus:border-[#C9C9C9]";

/* ── 0 · what ships today ──────────────────────────────────────────────── */

function Current({ filled }: { filled: boolean }) {
  return (
    <Group title="Preview on your site">
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="text-[12px] font-medium text-[#555]">Website URL</span>
        <Info className="size-3.5 text-[#B8B8B8]" strokeWidth={2} />
      </div>
      <input
        className={inputCls}
        placeholder="yourcompany.com"
        defaultValue={filled ? "globalpayments.com" : ""}
      />
      <p className="mb-1.5 mt-3 text-[12px] font-medium text-[#555]">
        Or upload a screenshot
      </p>
      <div className="rounded-lg border border-dashed border-[#DADADA] px-3 py-3.5">
        {filled ? (
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[12px] text-[#333]">{SHOT}</p>
              <p className="mt-0.5 text-[11px] text-[#A8A8A8]">
                PNG, JPG or WebP up to 5 MB
              </p>
            </div>
            <button className="shrink-0 text-[12px] font-medium text-[#6D33AA]">
              Remove
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-[12px] text-[#666]">Drop a file or browse</p>
            <p className="mt-0.5 text-[11px] text-[#A8A8A8]">
              PNG, JPG or WebP up to 5 MB
            </p>
          </div>
        )}
      </div>
    </Group>
  );
}

/* ── A · source tabs ───────────────────────────────────────────────────── */

function VariantTabs({ filled }: { filled: boolean }) {
  const [tab, setTab] = useState<"url" | "file">("url");
  return (
    <Group title="Preview on your site">
      <div className="mb-2 flex gap-1 rounded-lg bg-[#F5F5F7] p-0.5">
        {(
          [
            ["url", "Website URL"],
            ["file", "Screenshot"],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={`flex-1 rounded-[6px] py-1.5 text-[12px] font-medium transition-colors ${
              tab === v
                ? "bg-white text-[#333] shadow-sm"
                : "text-[#8A8A8A] hover:text-[#555]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "url" ? (
        <input
          className={inputCls}
          placeholder="yourcompany.com"
          defaultValue={filled ? "globalpayments.com" : ""}
        />
      ) : filled ? (
        <FileRow />
      ) : (
        <button className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#DADADA] text-[12px] text-[#666] hover:border-[#C0C0C0]">
          <ImagePlus className="size-3.5" strokeWidth={1.8} />
          Drop a file or browse
        </button>
      )}
    </Group>
  );
}

function FileRow() {
  return (
    <div className="flex h-9 items-center gap-2 rounded-lg border border-[#E5E5E5] pl-1.5 pr-1">
      <span className="grid size-6 shrink-0 place-items-center rounded bg-[#F2EEFA]">
        <ImagePlus className="size-3 text-[#7C3AED]" strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1 truncate text-[12px] text-[#333]">
        {SHOT}
      </span>
      <button
        aria-label="Remove screenshot"
        className="grid size-6 shrink-0 place-items-center rounded text-[#A8A8A8] hover:bg-[#F5F5F5] hover:text-[#555]"
      >
        <X className="size-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}

/* ── B · one field, attach inside ──────────────────────────────────────── */

function VariantOneField({ filled }: { filled: boolean }) {
  return (
    <Group title="Preview on your site">
      {filled ? (
        <FileRow />
      ) : (
        <div className="flex h-9 items-center rounded-lg border border-[#E5E5E5] pl-2.5 pr-1 focus-within:border-[#C9C9C9]">
          <LinkIcon className="size-3.5 shrink-0 text-[#B8B8B8]" strokeWidth={2} />
          <input
            className="h-full min-w-0 flex-1 bg-transparent px-2 text-[13px] text-[#333] outline-none placeholder:text-[#B0B0B0]"
            placeholder="yourcompany.com"
          />
          <span className="mr-1 h-4 w-px bg-[#EAEAEA]" />
          <button
            title="Upload a screenshot instead"
            className="grid size-7 shrink-0 place-items-center rounded-md text-[#8A8A8A] hover:bg-[#F5F5F5] hover:text-[#555]"
          >
            <ImagePlus className="size-4" strokeWidth={1.8} />
          </button>
        </div>
      )}
      <p className="mt-1.5 text-[11px] leading-snug text-[#A8A8A8]">
        A URL, or upload a screenshot. Some protected sites won’t capture.
      </p>
    </Group>
  );
}

/* ── C · field plus a text affordance ──────────────────────────────────── */

function VariantInlineLink({ filled }: { filled: boolean }) {
  return (
    <Group title="Preview on your site">
      {filled ? (
        <FileRow />
      ) : (
        <input className={inputCls} placeholder="yourcompany.com" />
      )}
      <button className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-[#7C3AED] hover:underline">
        <ImagePlus className="size-3.5" strokeWidth={2} />
        {filled ? "Use a URL instead" : "Or upload a screenshot"}
      </button>
    </Group>
  );
}

/* ── D · a summary row that opens ──────────────────────────────────────── */

function VariantSummary({ filled }: { filled: boolean }) {
  const [open, setOpen] = useState(!filled);
  return (
    <Group title="Preview on your site">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-full items-center gap-2 rounded-lg border border-[#E5E5E5] px-2.5 text-left hover:border-[#D5D5D5]"
      >
        <Globe className="size-3.5 shrink-0 text-[#B8B8B8]" strokeWidth={2} />
        <span
          className={`min-w-0 flex-1 truncate text-[13px] ${
            filled ? "text-[#333]" : "text-[#B0B0B0]"
          }`}
        >
          {filled ? "globalpayments.com" : "No site set"}
        </span>
        <span className="shrink-0 text-[11px] font-medium text-[#7C3AED]">
          {open ? "Done" : "Change"}
        </span>
      </button>
      {open && (
        <div className="mt-2 rounded-lg bg-[#FAFAFA] p-2">
          <input
            className={`${inputCls} bg-white`}
            placeholder="yourcompany.com"
            defaultValue={filled ? "globalpayments.com" : ""}
          />
          <button className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#DADADA] bg-white py-1.5 text-[11px] text-[#666] hover:border-[#C0C0C0]">
            <ImagePlus className="size-3.5" strokeWidth={1.8} />
            Upload a screenshot instead
          </button>
        </div>
      )}
    </Group>
  );
}

/* ── the studio ────────────────────────────────────────────────────────── */

export default function PreviewSourceStudies() {
  return (
    <main className="min-h-screen bg-[#F7F7F8] px-8 py-10">
      <header className="mb-8 max-w-[640px]">
        <p
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: ACCENT }}
        >
          Design panel · study
        </p>
        <h1 className="mt-1 text-[24px] font-semibold text-[#1A1A1A]">
          Preview on your site
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-[#666]">
          Two sources, one lens. Today they are stacked as two labelled
          sub-sections, which costs the panel its first screen before a single
          setting appears. Each study below keeps both sources reachable and
          spends less on the one nobody has chosen yet.
        </p>
      </header>

      <div className="flex gap-6 overflow-x-auto pb-6">
        <Panel
          name="0 · Today"
          note="Label, tooltip, field, second label, dropzone. Both sources are always fully present, so the panel pays for both."
          empty={<Current filled={false} />}
          filled={<Current filled />}
        />
        <Panel
          name="A · Source tabs"
          note="One control at a time, chosen by a segmented switch. Both sources stay visible as words; only one costs height."
          empty={<VariantTabs filled={false} />}
          filled={<VariantTabs filled />}
        />
        <Panel
          name="B · One field, attach inside"
          note="The URL field is the section. A screenshot is an attachment to it, and replaces it once picked. Tightest of the set."
          empty={<VariantOneField filled={false} />}
          filled={<VariantOneField filled />}
        />
        <Panel
          name="C · Field, then a text link"
          note="Keeps the plain field as the obvious path and demotes upload to one line of text. Smallest change from today."
          empty={<VariantInlineLink filled={false} />}
          filled={<VariantInlineLink filled />}
        />
        <Panel
          name="D · Summary row"
          note="Collapses to a single row once set, since a preview source is chosen once and rarely revisited. Editing opens in place."
          empty={<VariantSummary filled={false} />}
          filled={<VariantSummary filled />}
        />
      </div>
    </main>
  );
}
