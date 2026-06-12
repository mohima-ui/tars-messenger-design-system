import { AlertCircle, RotateCcw, WifiOff } from "lucide-react";

const LINE = "#E0DAD3";
const CHROME = "#E5E5E5";
const PAPER = "#F9F3EA";
const INK = "#333333";
const MUTED = "#6E6E6E";
const DANGER = "#DC2626";

function ErrorBanner({
  icon: Icon = AlertCircle,
  title,
  action,
}: {
  icon?: typeof AlertCircle;
  title: string;
  desc?: string;
  action?: { label: string; icon?: typeof RotateCcw };
}) {
  const ActionIcon = action?.icon;
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="size-3.5 shrink-0" strokeWidth={1.75} style={{ color: DANGER }} />
      <span className="text-[12px]" style={{ color: MUTED }}>{title}</span>
      {action && (
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[12px] font-semibold underline"
          style={{ color: DANGER }}
        >
          {ActionIcon && <ActionIcon className="size-3" strokeWidth={2.25} />}
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
  { label: "Treatment", token: "Quiet inline row — no fill, no card" },
  { label: "Icon", token: "AlertCircle / WifiOff · size-3.5 · danger" },
  { label: "Message", token: "12 · 400 · muted — one plain line" },
  { label: "Retry", token: "Underlined · danger · inline with the message" },
  { label: "Inline (per-message)", token: "Failed bubble dims; 'Couldn't send' + Retry beneath" },
];

const SPECS = [
  { prop: "Treatment", value: "no fill", note: "Quiet inline row — never a card" },
  { prop: "Icon", value: "size-3.5 · #DC2626", note: "--danger, small accent only" },
  { prop: "Message", value: "12 · 400 · #6E6E6E", note: "Muted, plain wording" },
  { prop: "Retry", value: "12 · 600 · #DC2626 underline", note: "Inline action" },
  { prop: "Inline bubble", value: "opacity 60%", note: "Failed user message dims" },
  { prop: "Inline label", value: "10 · #DC2626", note: "'Couldn't send.' + Retry" },
];

const VARIANTS = [
  {
    name: "Send failed",
    icon: WifiOff,
    title: "Couldn't send — check your connection.",
    desc: "",
    action: { label: "Retry", icon: RotateCcw },
    inline: false,
  },
  {
    name: "AI couldn't reply",
    icon: AlertCircle,
    title: "Tars couldn't reply.",
    desc: "",
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
  { name: "Send failed", desc: "Quiet row — small danger icon + muted message + underlined Retry. No card." },
  { name: "AI couldn't reply", desc: "The same quiet row on the assistant side, with 'Try again'." },
  { name: "Inline message failure", desc: "User bubble dims to 60% opacity. Below it: tiny icon + 'Couldn't send' + underlined 'Retry'." },
  { name: "Retrying", desc: "The Retry swaps to a typing-dot loader; copy reads 'Sending…'." },
  { name: "Resolved", desc: "The notice clears once the problem resolves. Don't leave stale errors." },
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
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-[#E5E5E5] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between px-8 py-4">
          <div className="flex items-baseline gap-3">
            <a href="/design-system" className="text-[12px] text-[#6E6E6E] transition-colors hover:text-[#333333]">
              ← Foundation
            </a>
            <span className="text-[#D4D4D4]">/</span>
            <span className="text-[12px] font-medium text-[#333333]">Components</span>
            <span className="text-[#D4D4D4]">/</span>
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
            <div className="flex flex-col gap-3 rounded-[14px] border bg-white p-6" style={{ borderColor: CHROME }}>
              {VARIANTS.map((v) =>
                v.inline ? (
                  <div key={v.name} className="flex flex-col gap-2 rounded-[10px] border bg-white p-4" style={{ borderColor: CHROME }}>
                    <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">{v.name}</p>
                    <FailedBubble />
                  </div>
                ) : (
                  <div key={v.name} className="flex flex-col gap-2 rounded-[10px] border bg-white p-4" style={{ borderColor: CHROME }}>
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
            <div className="rounded-[14px] border bg-white p-6" style={{ borderColor: CHROME }}>
              <div className="flex flex-col gap-3 rounded-[10px] border bg-white p-4" style={{ borderColor: CHROME }}>
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
            <div className="flex flex-col divide-y overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: CHROME }}>
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
            <div className="divide-y rounded-[12px] border bg-white px-4 py-2" style={{ borderColor: CHROME }}>
              {STATES.map((s) => (
                <StateRow key={s.name} name={s.name} desc={s.desc} />
              ))}
            </div>
          </section>

          {/* Specs */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Specs</p>
            <div className="flex flex-col divide-y overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: CHROME }}>
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
              <div className="rounded-[12px] border bg-white p-4" style={{ borderColor: CHROME }}>
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
              <div className="rounded-[12px] border bg-white p-4" style={{ borderColor: CHROME }}>
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

        <footer className="mt-20 flex items-center justify-between border-t pt-8 pb-12 text-[12px] text-[#979797]" style={{ borderColor: CHROME }}>
          <a href="/design-system/components/csat" className="transition-colors hover:text-[#333333]">← CSAT</a>
          <span>Next: Launcher →</span>
        </footer>
      </main>
    </div>
  );
}
