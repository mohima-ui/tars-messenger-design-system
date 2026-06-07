import { AlertCircle, RotateCcw, WifiOff } from "lucide-react";

const LINE = "#E0DAD3";
const PAPER = "#F9F3EA";
const INK = "#333333";
const MUTED = "#6E6E6E";
const DANGER = "#DC2626";
const DANGER_SOFT = "#FEE2E2";
const DANGER_BORDER = "#FCA5A5";
const DANGER_INK = "#991B1B";

function ErrorBanner({
  icon: Icon = AlertCircle,
  title,
  desc,
  action,
}: {
  icon?: typeof AlertCircle;
  title: string;
  desc: string;
  action?: { label: string; icon?: typeof RotateCcw };
}) {
  const ActionIcon = action?.icon;
  return (
    <div
      className="flex items-start gap-3 rounded-[12px] border p-3"
      style={{ borderColor: DANGER_BORDER, backgroundColor: DANGER_SOFT }}
    >
      <Icon
        className="size-4 shrink-0"
        strokeWidth={1.75}
        style={{ color: DANGER_INK, marginTop: 1 }}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-[12px] font-semibold" style={{ color: DANGER_INK }}>
          {title}
        </p>
        <p className="text-[11px] leading-relaxed" style={{ color: "#7F1D1D" }}>
          {desc}
        </p>
      </div>
      {action && (
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border bg-white px-2.5 py-1 text-[11px] font-medium transition-colors hover:bg-[#FFFAFA]"
          style={{ borderColor: DANGER_BORDER, color: DANGER_INK }}
        >
          {ActionIcon && <ActionIcon className="size-3" strokeWidth={2} />}
          {action.label}
        </button>
      )}
    </div>
  );
}

function FailedBubble() {
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex justify-end">
        <div
          className="max-w-[78%] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[6px] rounded-bl-[12px] border px-[14px] py-[10px] text-[12px] leading-[1.45] opacity-60"
          style={{
            backgroundColor: "#E0E5FA",
            borderColor: "#A5B0EE",
            color: "#0A06A0",
          }}
        >
          Can you check on my refund again?
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <AlertCircle className="size-3" strokeWidth={1.75} style={{ color: DANGER }} />
        <span className="text-[10px]" style={{ color: DANGER }}>
          Couldn&apos;t send.
        </span>
        <button
          type="button"
          className="text-[10px] font-semibold underline"
          style={{ color: DANGER }}
        >
          Retry
        </button>
      </div>
    </div>
  );
}

const ANATOMY = [
  { label: "Container", token: "rounded-[12px] · danger-soft fill · danger-border stroke" },
  { label: "Icon", token: "AlertCircle / WifiOff · size-4 · danger-ink" },
  { label: "Title", token: "12 / 18 · 600 · danger-ink" },
  { label: "Description", token: "11 / 16 · 400 · danger-deeper (#7F1D1D)" },
  { label: "Recovery action", token: "Pill button · white fill · danger-border · danger-ink text" },
];

const SPECS = [
  { prop: "Container bg", value: "#FEE2E2", note: "--danger-soft" },
  { prop: "Container border", value: "1px #FCA5A5", note: "--danger-border (semantic)" },
  { prop: "Icon color", value: "#991B1B", note: "--danger-ink" },
  { prop: "Title", value: "12 / 18 · 600 #991B1B", note: "Plain, recoverable wording" },
  { prop: "Description", value: "11 / 16 · 400 #7F1D1D", note: "Slightly deeper than the title" },
  { prop: "Padding", value: "p-3", note: "12px on all sides" },
  { prop: "Gap", value: "gap-3", note: "12px between icon, text, action" },
  { prop: "Action button", value: "rounded-full · px-2.5 py-1 · 11/500", note: "White fill, danger stroke" },
];

const VARIANTS = [
  {
    name: "Send failed",
    icon: WifiOff,
    title: "Couldn't send your message",
    desc: "Check your connection and try again — your message is still here.",
    action: { label: "Retry", icon: RotateCcw },
    inline: false,
  },
  {
    name: "AI couldn't reply",
    icon: AlertCircle,
    title: "Tars hit a snag",
    desc: "Something went wrong generating that reply. We've logged it.",
    action: { label: "Try again", icon: RotateCcw },
    inline: false,
  },
  {
    name: "Soft inline (per-message)",
    icon: undefined,
    title: "Inline failed-message indicator",
    desc: "Used directly under a user bubble when its send failed — much lighter than a banner.",
    action: undefined,
    inline: true,
  },
];

const STATES = [
  { name: "Default (banner)", desc: "Inline danger-soft card with icon, title, description, and one recovery action." },
  { name: "Inline message failure", desc: "User bubble dims to 60% opacity. Below it: tiny icon + 'Couldn't send' + underlined 'Retry'." },
  { name: "Retrying", desc: "Action button swaps to a typing-dot loader; copy reads 'Sending…'" },
  { name: "Resolved", desc: "Banner fades out (200ms) once the underlying problem clears. Don't leave stale errors." },
];

const DOS = [
  "Say what failed and what to do next — in that order.",
  "Keep the user's original input intact so they don't have to retype.",
  "Use the lightest variant that conveys the situation (inline > banner > toast).",
  "Auto-clear errors once they're resolved.",
];

const DONTS = [
  "Don't use red as a color of warning. Reserve danger-soft for actual failures.",
  "Don't show modals or toasts — errors live in the message column.",
  "Don't dump stack traces or codes — those belong in support tooling, not the user view.",
  "Don't write 'Something went wrong' as the only message — say what specifically.",
];

function StateRow({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="flex items-baseline gap-4 py-2.5">
      <span className="w-44 shrink-0 text-[12px] font-semibold text-[#333333]">{name}</span>
      <p className="text-[12px] leading-relaxed text-[#6E6E6E]">{desc}</p>
    </div>
  );
}

export default function ErrorPage() {
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
            <span className="text-[12px] font-semibold text-[#333333]">Error</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-8 py-12">
        <div className="mb-12 max-w-[640px]">
          <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Component</p>
          <h1 className="mt-2 text-[32px] leading-tight font-semibold tracking-tight text-[#333333]">Error</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[#555]">
            Soft, never alarming. Recoverable. Errors live in the message column — same width
            as a bubble — and always include the next step. Pick the lightest variant the
            situation allows; never use a modal or a toast.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {/* Variants */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Variants</p>
            <div className="flex flex-col gap-3 rounded-[14px] border bg-[#FAF6EE] p-6" style={{ borderColor: LINE }}>
              {VARIANTS.map((v) =>
                v.inline ? (
                  <div key={v.name} className="flex flex-col gap-2 rounded-[10px] border bg-white p-4" style={{ borderColor: LINE }}>
                    <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">{v.name}</p>
                    <FailedBubble />
                  </div>
                ) : (
                  <div key={v.name} className="flex flex-col gap-2 rounded-[10px] border bg-white p-4" style={{ borderColor: LINE }}>
                    <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">{v.name}</p>
                    <ErrorBanner
                      icon={v.icon}
                      title={v.title}
                      desc={v.desc}
                      action={v.action}
                    />
                  </div>
                ),
              )}
            </div>
          </section>

          {/* In context */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">In context</p>
            <div className="rounded-[14px] border bg-[#FAF6EE] p-6" style={{ borderColor: LINE }}>
              <div className="flex flex-col gap-3 rounded-[10px] border bg-white p-4" style={{ borderColor: LINE }}>
                <div className="flex justify-start">
                  <div
                    className="max-w-[88%] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] rounded-bl-[6px] border px-[14px] py-[10px] text-[12px] leading-[1.55]"
                    style={{ backgroundColor: PAPER, borderColor: LINE, color: INK }}
                  >
                    Sure — what&apos;s your order number?
                  </div>
                </div>
                <FailedBubble />
                <ErrorBanner
                  icon={WifiOff}
                  title="You're offline"
                  desc="Reconnect and your message will send automatically."
                  action={{ label: "Retry now", icon: RotateCcw }}
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

          {/* States */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">States</p>
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
          <a href="/design-system/components/csat" className="transition-colors hover:text-[#333333]">← CSAT</a>
          <span>Next: Launcher →</span>
        </footer>
      </main>
    </div>
  );
}
