import { ChevronLeft, MoreVertical, X } from "lucide-react";

const LINE = "#E0DAD3";
const CHROME = "#E5E5E5";
const INK = "#333333";
const MUTED = "#6E6E6E";

function HeaderPreview({ subtitle = true }: { subtitle?: boolean }) {
  return (
    <div
      className="w-[400px] overflow-hidden rounded-[20px] border bg-[#FFFDFA]"
      style={{ borderColor: "#D9D5CC" }}
    >
      <header className="flex h-16 w-full items-center gap-1 px-4">
        <div className="flex min-w-0 flex-1 items-center gap-1">
          <button
            className="flex size-7 shrink-0 items-center justify-center rounded-[6px] text-[#6E6E6E] transition-colors hover:bg-[#F0EBE0] hover:text-[#333333] active:bg-[#F0EBE0]"
            aria-label="View chat history"
          >
            <ChevronLeft className="size-5" strokeWidth={1.5} />
          </button>
          <img
            src="/tars-logomark.png"
            alt="Tars"
            className="ml-0.5 size-9 shrink-0 rounded-[10px] object-cover"
          />
          <div className="ml-1.5 min-w-0">
            <p className="truncate text-[16px] leading-tight font-semibold text-[#333333]">
              Tars
            </p>
            {subtitle && (
              <p className="mt-0.5 truncate text-[12px] leading-tight text-[#6E6E6E]">
                Virtual Assistant
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            className="flex size-7 items-center justify-center rounded-[6px] text-[#6E6E6E] transition-colors hover:bg-[#F0EBE0] hover:text-[#333333] active:bg-[#F0EBE0]"
            aria-label="More options"
          >
            <MoreVertical className="size-4" strokeWidth={1.5} />
          </button>
          <button
            className="flex size-7 items-center justify-center rounded-[6px] text-[#6E6E6E] transition-colors hover:bg-[#F0EBE0] hover:text-[#333333] active:bg-[#F0EBE0]"
            aria-label="Close"
          >
            <X className="size-4" strokeWidth={1.5} />
          </button>
        </div>
      </header>
    </div>
  );
}

const ANATOMY = [
  { label: "Back / history button", token: "Icon button · size-7 · rounded-[6px]" },
  { label: "Avatar", token: "size-9 · rounded-[10px] · object-cover" },
  { label: "Identity stack", token: "Title (16 semibold ink) + optional Subtitle (12 muted)" },
  { label: "More options", token: "Icon button · size-7 · rounded-[6px]" },
  { label: "Close", token: "Icon button · size-7 · rounded-[6px]" },
];

const SPECS = [
  { prop: "Header height", value: "h-16", note: "64px tall" },
  { prop: "Side padding", value: "px-4", note: "16px left / right" },
  { prop: "Container border", value: "border-b · #E0DAD3", note: "1px hairline below header (LINE)" },
  { prop: "Title", value: "16 · 600 · #333333", note: "Agent name, semibold, ink" },
  { prop: "Subtitle", value: "12 · 500 · #6E6E6E", note: "Caption, medium, muted" },
  { prop: "Back → avatar gap", value: "gap-1 + ml-0.5", note: "6px (4px row gap + 2px)" },
  { prop: "Avatar → title gap", value: "ml-1.5", note: "6px" },
  { prop: "Right cluster gap", value: "gap-0.5", note: "2px between More · Close" },
  { prop: "Avatar size", value: "size-9 · r-10", note: "36px rounded-square" },
  { prop: "Icon button size", value: "size-7", note: "28px hit area" },
  { prop: "Icon stroke width", value: "1.5", note: "Lucide default" },
];

const STATES = [
  {
    name: "Rest",
    desc: "Default. Icons in --text-secondary (#6E6E6E), button bg transparent.",
  },
  {
    name: "Hover",
    desc: "Icon stroke darkens to --text-ink (#333333), button bg fills with --bg-subtle (#F0EBE0).",
  },
  {
    name: "Active / pressed",
    desc: "Same bg as hover (#F0EBE0). No icon recolor.",
  },
  {
    name: "Focus (keyboard)",
    desc: "Inherited from system focus ring — TODO: explicit ring token.",
  },
];

const DOS = [
  "Use a rounded-square avatar (r-10) — image or single-letter fallback in --accent.",
  "Keep the title to one line; truncate with ellipsis if it overflows.",
  "Use the back chevron only when a deeper view exists (history, settings).",
];

const DONTS = [
  "Don't put text labels on the back/more/close icons — they're universal.",
  "Don't change the title weight to bold (700) — semibold (600) is the cap.",
  "Don't add a status dot in the header — that's for the AI Message label.",
];

function StateRow({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="flex items-baseline gap-4 py-2.5">
      <span className="w-32 shrink-0 text-[12px] font-semibold text-[#333333]">
        {name}
      </span>
      <p className="text-[12px] leading-relaxed text-[#6E6E6E]">{desc}</p>
    </div>
  );
}

export default function HeaderComponentPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-[#E5E5E5] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between px-8 py-4">
          <div className="flex items-baseline gap-3">
            <a
              href="/design-system"
              className="text-[12px] text-[#6E6E6E] transition-colors hover:text-[#333333]"
            >
              ← Foundation
            </a>
            <span className="text-[#D4D4D4]">/</span>
            <span className="text-[12px] font-medium text-[#333333]">
              Components
            </span>
            <span className="text-[#D4D4D4]">/</span>
            <span className="text-[12px] font-semibold text-[#333333]">
              Header
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-8 py-12">
        <div className="mb-12 max-w-[640px]">
          <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">
            Component
          </p>
          <h1 className="mt-2 text-[32px] leading-tight font-semibold tracking-tight text-[#333333]">
            Header
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[#555]">
            The chat top bar. Anchors the conversation in brand identity —
            avatar, name, subtitle — and offers three universal controls: back
            to history, more options, close.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {/* Preview */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">
              Preview
            </p>
            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-2 text-[11px] font-medium text-[#979797]">
                  Default · name + subtitle
                </p>
                <div
                  className="flex justify-center rounded-[14px] border bg-white p-8"
                  style={{ borderColor: CHROME }}
                >
                  <HeaderPreview />
                </div>
              </div>
              <div>
                <p className="mb-2 text-[11px] font-medium text-[#979797]">
                  Name only · no subtitle
                </p>
                <div
                  className="flex justify-center rounded-[14px] border bg-white p-8"
                  style={{ borderColor: CHROME }}
                >
                  <HeaderPreview subtitle={false} />
                </div>
              </div>
            </div>
          </section>

          {/* Anatomy */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">
              Anatomy
            </p>
            <div
              className="flex flex-col divide-y overflow-hidden rounded-[12px] border bg-white"
              style={{ borderColor: CHROME }}
            >
              {ANATOMY.map((a, i) => (
                <div key={a.label} className="flex items-baseline gap-4 px-4 py-3">
                  <span className="w-6 font-mono text-[11px] text-[#979797]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="w-48 shrink-0 text-[12px] font-semibold text-[#333333]">
                    {a.label}
                  </span>
                  <span className="text-[11px] text-[#6E6E6E]">{a.token}</span>
                </div>
              ))}
            </div>
          </section>

          {/* States */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">
              Icon states
            </p>
            <div
              className="rounded-[12px] border bg-white px-4 py-2 divide-y"
              style={{ borderColor: CHROME }}
            >
              {STATES.map((s) => (
                <StateRow key={s.name} name={s.name} desc={s.desc} />
              ))}
            </div>
          </section>

          {/* Specs */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">
              Specs
            </p>
            <div
              className="flex flex-col divide-y overflow-hidden rounded-[12px] border bg-white"
              style={{ borderColor: CHROME }}
            >
              {SPECS.map((s) => (
                <div key={s.prop} className="flex items-baseline gap-4 px-4 py-3">
                  <span className="w-48 shrink-0 text-[12px] font-semibold text-[#333333]">
                    {s.prop}
                  </span>
                  <code className="w-56 shrink-0 font-mono text-[11px] text-[#333333]">
                    {s.value}
                  </code>
                  <span className="text-[11px] text-[#6E6E6E]">{s.note}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Do / Don't */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">
              Guidance
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div
                className="rounded-[12px] border bg-white p-4"
                style={{ borderColor: CHROME }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#E8F5EC] text-[11px] font-bold text-[#0F7A38]">
                    ✓
                  </span>
                  <p className="text-[12px] font-semibold text-[#333333]">Do</p>
                </div>
                <ul className="flex flex-col gap-2">
                  {DOS.map((t) => (
                    <li key={t} className="text-[12px] leading-relaxed text-[#555]">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className="rounded-[12px] border bg-white p-4"
                style={{ borderColor: CHROME }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#FEE2E2] text-[11px] font-bold text-[#991B1B]">
                    ✕
                  </span>
                  <p className="text-[12px] font-semibold text-[#333333]">
                    Don&apos;t
                  </p>
                </div>
                <ul className="flex flex-col gap-2">
                  {DONTS.map((t) => (
                    <li key={t} className="text-[12px] leading-relaxed text-[#555]">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>

        <footer className="mt-20 flex items-center justify-between border-t pt-8 pb-12 text-[12px] text-[#979797]" style={{ borderColor: CHROME }}>
          <a
            href="/design-system"
            className="transition-colors hover:text-[#333333]"
          >
            ← Foundation
          </a>
          <span>Next: AI Message →</span>
        </footer>
      </main>
    </div>
  );
}
