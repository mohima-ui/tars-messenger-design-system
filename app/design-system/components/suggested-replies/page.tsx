import { ArrowRight } from "lucide-react";

const LINE = "#E0DAD3";
const PAPER = "#F9F3EA";
const INK = "#333333";
const MUTED = "#6E6E6E";
const ACCENT_SOFT = "#E0E5FA";
const ACCENT_BORDER = "#A5B0EE";
const ACCENT_INK = "#0A06A0";

function Chip({
  label,
  state,
}: {
  label: string;
  state?: "rest" | "hover";
}) {
  const isHover = state === "hover";
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-full border px-[13px] py-[7px] text-left text-[12px] leading-5 whitespace-nowrap transition-all duration-200"
      style={{
        backgroundColor: isHover ? ACCENT_SOFT : PAPER,
        borderColor: isHover ? ACCENT_BORDER : LINE,
        color: INK,
      }}
    >
      {label}
      <ArrowRight
        className="size-3.5 transition-transform duration-200"
        strokeWidth={2}
        style={{
          color: ACCENT_INK,
          transform: isHover ? "translateX(2px)" : undefined,
        }}
      />
    </button>
  );
}

function ChipStack({ items }: { items: string[] }) {
  return (
    <div className="flex max-w-[88%] flex-col items-start gap-1.5">
      {items.map((i) => (
        <Chip key={i} label={i} />
      ))}
    </div>
  );
}

const ANATOMY = [
  { label: "Chip container", token: "flex-col · items-start · gap-1.5 (6px)" },
  { label: "Pill", token: "rounded-full · border · px-[13px] py-[7px]" },
  { label: "Label", token: "12 / 20 · 400 · ink" },
  { label: "Trailing arrow", token: "ArrowRight · size-3.5 · accent-ink · slides 2px on hover" },
];

const SPECS = [
  { prop: "Background (rest)", value: "#F9F3EA", note: "--bg-paper" },
  { prop: "Border (rest)", value: "1px #E0DAD3", note: "--border-line" },
  { prop: "Background (hover)", value: "#E0E5FA", note: "--accent-soft" },
  { prop: "Border (hover)", value: "1px #A5B0EE", note: "--accent-border" },
  { prop: "Text", value: "#333333", note: "--text-ink" },
  { prop: "Arrow", value: "#0A06A0", note: "--accent-ink (always)" },
  { prop: "Font", value: "12 / 20 · 400", note: "Body S · Snug" },
  { prop: "Padding", value: "px-[13px] py-[7px]", note: "Compact pill" },
  { prop: "Radius", value: "rounded-full", note: "Fully pill-shaped" },
  { prop: "Gap (between)", value: "gap-1.5", note: "6px between stacked chips" },
  { prop: "Gap (from bubble)", value: "gap-2", note: "8px below the AI bubble" },
];

const STATES = [
  { name: "Rest", desc: "Paper fill, neutral border, ink text, accent arrow." },
  { name: "Hover", desc: "Bg lifts to --accent-soft, border to --accent-border, arrow slides 2px right." },
  { name: "Active / pressed", desc: "Same as hover (no further press visual)." },
  {
    name: "Entrance",
    desc: "Staggered fade-in after the AI message's words finish. Each chip delay = word-count × 38ms + index × 70ms.",
  },
  { name: "Used", desc: "After click, chips clear from the message group; the chosen label becomes a new user bubble." },
];

const DOS = [
  "Stack vertically — left-aligned, hugging content width.",
  "Keep labels short and verb-led ('I want to talk to sales', not just 'Sales').",
  "Limit to 2–4 chips per AI message.",
  "Always include the accent-ink arrow — it signals direction of intent.",
];

const DONTS = [
  "Don't fill chips with --accent — they're suggestions, not CTAs.",
  "Don't use shadows on hover — the border + bg lift is enough.",
  "Don't place chips beside the bubble — they belong below.",
  "Don't keep stale chips around after the user picks one — clear them.",
];

function StateRow({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="flex items-baseline gap-4 py-2.5">
      <span className="w-32 shrink-0 text-[12px] font-semibold text-[#333333]">{name}</span>
      <p className="text-[12px] leading-relaxed text-[#6E6E6E]">{desc}</p>
    </div>
  );
}

export default function SuggestedRepliesPage() {
  return (
    <div className="min-h-screen bg-[#FFFDFA]">
      <header className="sticky top-0 z-10 border-b border-[#E0DAD3] bg-[#FFFDFA]/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between px-8 py-4">
          <div className="flex items-baseline gap-3">
            <a href="/design-system" className="text-[12px] text-[#6E6E6E] transition-colors hover:text-[#333333]">
              ← Foundation
            </a>
            <span className="text-[#D9D5CC]">/</span>
            <span className="text-[12px] font-medium text-[#333333]">Components</span>
            <span className="text-[#D9D5CC]">/</span>
            <span className="text-[12px] font-semibold text-[#333333]">Suggested Replies</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-8 py-12">
        <div className="mb-12 max-w-[640px]">
          <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Component</p>
          <h1 className="mt-2 text-[32px] leading-tight font-semibold tracking-tight text-[#333333]">
            Suggested Replies
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[#555]">
            Pill chips. Quiet by default, accent on intent. They sit below an AI bubble as a
            scaffolded path forward — useful when free-text would slow the user down. Stack
            vertically, hug content, clear once chosen.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {/* States preview */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">States</p>
            <div className="grid grid-cols-1 gap-3 rounded-[14px] border bg-[#FAF6EE] p-6 lg:grid-cols-2" style={{ borderColor: LINE }}>
              <div className="flex flex-col gap-3 rounded-[10px] border bg-white p-4" style={{ borderColor: LINE }}>
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Rest</p>
                <Chip label="I want to talk to sales" state="rest" />
              </div>
              <div className="flex flex-col gap-3 rounded-[10px] border bg-white p-4" style={{ borderColor: LINE }}>
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Hover</p>
                <Chip label="I want to talk to sales" state="hover" />
              </div>
            </div>
          </section>

          {/* In context */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">In context</p>
            <div className="rounded-[14px] border bg-[#FAF6EE] p-6" style={{ borderColor: LINE }}>
              <div className="flex flex-col gap-2 rounded-[10px] border bg-white p-4" style={{ borderColor: LINE }}>
                <div className="flex justify-start">
                  <div
                    className="max-w-[88%] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] rounded-bl-[6px] border px-[14px] py-[10px] text-[12px] leading-[1.55]"
                    style={{ backgroundColor: PAPER, borderColor: LINE, color: INK }}
                  >
                    Hey there — looking to{" "}
                    <span className="font-semibold">learn more</span>?<br />
                    <span className="font-semibold">I can help</span>!
                  </div>
                </div>
                <ChipStack
                  items={[
                    "I want to talk to sales",
                    "I need support",
                    "I want to become a partner",
                  ]}
                />
              </div>
            </div>
          </section>

          {/* Anatomy */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Anatomy</p>
            <div className="flex flex-col divide-y overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: LINE }}>
              {ANATOMY.map((a, i) => (
                <div key={a.label} className="flex items-baseline gap-4 px-4 py-3">
                  <span className="w-6 font-mono text-[11px] text-[#979797]">{String(i + 1).padStart(2, "0")}</span>
                  <span className="w-56 shrink-0 text-[12px] font-semibold text-[#333333]">{a.label}</span>
                  <span className="text-[11px] text-[#6E6E6E]">{a.token}</span>
                </div>
              ))}
            </div>
          </section>

          {/* States detail */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">State details</p>
            <div className="divide-y rounded-[12px] border bg-white px-4 py-2" style={{ borderColor: LINE }}>
              {STATES.map((s) => (
                <StateRow key={s.name} name={s.name} desc={s.desc} />
              ))}
            </div>
          </section>

          {/* Specs */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Specs</p>
            <div className="flex flex-col divide-y overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: LINE }}>
              {SPECS.map((s) => (
                <div key={s.prop} className="flex items-baseline gap-4 px-4 py-3">
                  <span className="w-48 shrink-0 text-[12px] font-semibold text-[#333333]">{s.prop}</span>
                  <code className="w-56 shrink-0 font-mono text-[11px] text-[#333333]">{s.value}</code>
                  <span className="text-[11px] text-[#6E6E6E]">{s.note}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Do / Don't */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Guidance</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-[12px] border bg-white p-4" style={{ borderColor: LINE }}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#E8F5EC] text-[11px] font-bold text-[#0F7A38]">✓</span>
                  <p className="text-[12px] font-semibold text-[#333333]">Do</p>
                </div>
                <ul className="flex flex-col gap-2">
                  {DOS.map((t) => (
                    <li key={t} className="text-[12px] leading-relaxed text-[#555]">{t}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[12px] border bg-white p-4" style={{ borderColor: LINE }}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#FEE2E2] text-[11px] font-bold text-[#991B1B]">✕</span>
                  <p className="text-[12px] font-semibold text-[#333333]">Don&apos;t</p>
                </div>
                <ul className="flex flex-col gap-2">
                  {DONTS.map((t) => (
                    <li key={t} className="text-[12px] leading-relaxed text-[#555]">{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>

        <footer className="mt-20 flex items-center justify-between border-t pt-8 pb-12 text-[12px] text-[#979797]" style={{ borderColor: LINE }}>
          <a href="/design-system/components/user-message" className="transition-colors hover:text-[#333333]">← User Message</a>
          <span>Next: Human Agent →</span>
        </footer>
      </main>
    </div>
  );
}
