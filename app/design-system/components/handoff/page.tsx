import { ArrowRight, Users } from "lucide-react";

const LINE = "#E0DAD3";
const PAPER = "#F9F3EA";
const INK = "#333333";
const MUTED = "#6E6E6E";
const ACCENT_INK = "#0A06A0";

function HandoffBanner({
  name,
  initial,
  role,
  avatarColor,
  context,
}: {
  name: string;
  initial: string;
  role: string;
  avatarColor: string;
  context?: string;
}) {
  return (
    <div className="flex w-full items-center gap-3 py-1">
      <div className="h-px flex-1" style={{ backgroundColor: LINE }} />
      <div className="flex items-center gap-2 rounded-full border bg-white px-3 py-1.5" style={{ borderColor: LINE }}>
        <div
          className="flex size-5 items-center justify-center rounded-full text-[9px] font-semibold text-white"
          style={{ backgroundColor: avatarColor }}
        >
          {initial}
        </div>
        <p className="text-[11px] leading-4 text-[#333333]">
          <span className="font-semibold">{name}</span>{" "}
          <span className="text-[#6E6E6E]">· {role}</span>
        </p>
      </div>
      <div className="h-px flex-1" style={{ backgroundColor: LINE }} />
    </div>
  );
}

function ConnectingCard({
  fromInitial,
  fromColor,
  toInitial,
  toColor,
  toName,
  queue,
  eta,
}: {
  fromInitial: string;
  fromColor: string;
  toInitial: string;
  toColor: string;
  toName: string;
  queue: number;
  eta: string;
}) {
  return (
    <div
      className="flex flex-col items-center gap-3 rounded-[14px] border bg-white px-4 py-5"
      style={{ borderColor: LINE }}
    >
      <div className="flex items-center gap-2">
        <div
          className="flex size-9 items-center justify-center rounded-full text-[13px] font-semibold text-white"
          style={{ backgroundColor: fromColor }}
          aria-label="From"
        >
          {fromInitial}
        </div>
        <ArrowRight className="size-3.5 text-[#6E6E6E]" strokeWidth={2} />
        <div className="relative">
          <div
            className="flex size-9 items-center justify-center rounded-full text-[13px] font-semibold text-white"
            style={{ backgroundColor: toColor }}
            aria-label={`To ${toName}`}
          >
            {toInitial}
          </div>
          <span
            className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full border-2 border-white"
            style={{ backgroundColor: "#16A34A" }}
            aria-hidden
          />
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-[13px] font-semibold text-[#333333]">
          Connecting you with {toName}
        </p>
        <p className="text-[11px] text-[#6E6E6E]">
          You&apos;re #{queue} in queue · typically {eta}
        </p>
      </div>
    </div>
  );
}

function ContextChip() {
  return (
    <div className="flex items-start gap-2 rounded-[10px] border bg-white p-3" style={{ borderColor: LINE }}>
      <Users className="size-3.5 shrink-0 text-[#6E6E6E]" strokeWidth={1.75} />
      <div className="flex flex-col gap-0.5">
        <p className="text-[11px] font-semibold text-[#333333]">Context passed</p>
        <p className="text-[11px] leading-relaxed text-[#6E6E6E]">
          The full conversation is shared with Priya — including the user&apos;s order
          ID, the refund question, and Tars&apos; first attempt.
        </p>
      </div>
    </div>
  );
}

const ANATOMY = [
  { label: "Hairline rule", token: "1px --border-line · flex-1 each side" },
  { label: "Identity pill", token: "rounded-full · white bg · line border · px-3 py-1.5" },
  { label: "Avatar", token: "size-5 circle · per-agent color · single initial" },
  { label: "Name + role text", token: "11/16 · semibold name · muted role separator" },
];

const SPECS = [
  { prop: "Container width", value: "Full message column", note: "Spans full chat width" },
  { prop: "Pill bg", value: "#FFFFFF", note: "--bg-surface (lifts off paper)" },
  { prop: "Pill border", value: "1px #E0DAD3", note: "--border-line" },
  { prop: "Avatar size", value: "size-5", note: "20px — slightly larger than human-agent message label" },
  { prop: "Text", value: "11 / 16 · 500", note: "Name in semibold, role in muted" },
  { prop: "Rule", value: "1px line", note: "Equal-length lines on each side of the pill" },
  { prop: "Vertical padding", value: "py-1", note: "4px above and below the rule row" },
  { prop: "Animation", value: "fade-in 300ms ease-out", note: "Soft entrance; no slide" },
];

const STATES = [
  { name: "Connecting", desc: "Two-avatar card (T → P) with queue position and ETA. Visible while the human picks up." },
  { name: "Joined", desc: "Connecting card replaced by the identity-pill seam once the human accepts." },
  { name: "Joined + context chip", desc: "Below the seam, a small chip confirms what context was shared with the human." },
  { name: "Left / returned to AI", desc: "Mirror: 'Tars has rejoined the conversation' — same pill, Tars avatar." },
];

const FLOW = [
  { step: "1", title: "Trigger", desc: "User asks for human, or AI confidence falls below threshold." },
  { step: "2", title: "Brief notice", desc: "AI replies: 'Let me connect you with a teammate…'" },
  { step: "3", title: "Connecting card", desc: "T → P avatars, 'Connecting you with Priya', queue position and ETA." },
  { step: "4", title: "Handoff seam", desc: "Once the human picks up, the connecting card collapses into the identity-pill divider." },
  { step: "5", title: "Context chip (optional)", desc: "A small inline confirmation of what was passed to the human." },
  { step: "6", title: "Human typing", desc: "Typing indicator switches to the human's avatar." },
  { step: "7", title: "Human reply", desc: "First human-agent message appears (no streaming)." },
];

const DOS = [
  "Pass full context to the human — no 're-ask the user' patterns.",
  "Keep the seam visually quiet — it's a transition, not a celebration.",
  "Use a 'returning to AI' mirror if/when the human hands back.",
];

const DONTS = [
  "Don't show toasts or modals for handoff — keep it inline.",
  "Don't bury the seam under a long delay — fire it within 1s of trigger.",
  "Don't make the user repeat themselves after the seam.",
];

export default function HandoffPage() {
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
            <span className="text-[12px] font-semibold text-[#333333]">Human Handoff</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-8 py-12">
        <div className="mb-12 max-w-[640px]">
          <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Component</p>
          <h1 className="mt-2 text-[32px] leading-tight font-semibold tracking-tight text-[#333333]">
            Human Handoff
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[#555]">
            The seam. The AI hands the conversation off — context intact, no repeats, no
            interruption. A hairline rule with an identity pill marks the transition; the
            scroll position holds, the history stays visible.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {/* Connecting state */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">
              Connecting state
            </p>
            <div className="rounded-[14px] border bg-[#FAF6EE] p-6" style={{ borderColor: LINE }}>
              <div className="rounded-[10px] border bg-white p-4" style={{ borderColor: LINE }}>
                <ConnectingCard
                  fromInitial="T"
                  fromColor="#120BF4"
                  toInitial="P"
                  toColor="#A1593E"
                  toName="Priya"
                  queue={1}
                  eta="<1 min"
                />
              </div>
            </div>
          </section>

          {/* In context */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">In context — full flow</p>
            <div className="rounded-[14px] border bg-[#FAF6EE] p-6" style={{ borderColor: LINE }}>
              <div className="flex flex-col gap-3 rounded-[10px] border bg-white p-4" style={{ borderColor: LINE }}>
                {/* AI message before */}
                <div className="flex flex-col gap-1">
                  <p className="ml-1 text-[11px] font-medium tracking-wide text-[#6E6E6E]">
                    Tars <span className="text-[#A8A096]">• AI Agent</span>
                  </p>
                  <div className="flex justify-start">
                    <div
                      className="max-w-[88%] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] rounded-bl-[6px] border px-[14px] py-[10px] text-[12px] leading-[1.55]"
                      style={{ backgroundColor: PAPER, borderColor: LINE, color: INK }}
                    >
                      Let me connect you with a teammate who can dig into your account…
                    </div>
                  </div>
                </div>

                {/* Connecting card (queue) */}
                <ConnectingCard
                  fromInitial="T"
                  fromColor="#120BF4"
                  toInitial="P"
                  toColor="#A1593E"
                  toName="Priya"
                  queue={1}
                  eta="<1 min"
                />

                {/* Handoff seam */}
                <HandoffBanner
                  name="Priya"
                  initial="P"
                  role="Support Specialist"
                  avatarColor="#A1593E"
                />

                {/* Context chip */}
                <ContextChip />

                {/* Human message after */}
                <div className="flex flex-col gap-1">
                  <div className="ml-1 flex items-center gap-1.5">
                    <div
                      className="flex size-4 items-center justify-center rounded-full text-[8px] font-semibold text-white"
                      style={{ backgroundColor: "#A1593E" }}
                    >
                      P
                    </div>
                    <p className="text-[11px] font-medium tracking-wide text-[#6E6E6E]">
                      Priya <span className="text-[#A8A096]">• Support Specialist</span>
                    </p>
                  </div>
                  <div className="flex justify-start">
                    <div
                      className="max-w-[88%] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] rounded-bl-[6px] border px-[14px] py-[10px] text-[12px] leading-[1.55]"
                      style={{ backgroundColor: PAPER, borderColor: LINE, color: INK }}
                    >
                      Hi! I&apos;ve got everything Tars shared — let me check on
                      that refund for you now.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Variant: solo seam (no context chip) */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Variant — seam only</p>
            <div className="rounded-[14px] border bg-[#FAF6EE] p-6" style={{ borderColor: LINE }}>
              <div className="flex flex-col gap-3 rounded-[10px] border bg-white p-4" style={{ borderColor: LINE }}>
                <HandoffBanner
                  name="Marcus"
                  initial="M"
                  role="Account Manager"
                  avatarColor="#3D5B3D"
                />
              </div>
            </div>
          </section>

          {/* Flow */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Flow</p>
            <div className="flex flex-col divide-y overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: LINE }}>
              {FLOW.map((f) => (
                <div key={f.step} className="flex items-baseline gap-4 px-4 py-3">
                  <span className="w-6 font-mono text-[11px] font-semibold text-[#0A06A0]">{f.step}</span>
                  <span className="w-40 shrink-0 text-[12px] font-semibold text-[#333333]">{f.title}</span>
                  <p className="text-[11px] leading-relaxed text-[#6E6E6E]">{f.desc}</p>
                </div>
              ))}
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
                <div key={s.name} className="flex items-baseline gap-4 py-2.5">
                  <span className="w-40 shrink-0 text-[12px] font-semibold text-[#333333]">{s.name}</span>
                  <p className="text-[12px] leading-relaxed text-[#6E6E6E]">{s.desc}</p>
                </div>
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
          <a href="/design-system/components/human-agent" className="transition-colors hover:text-[#333333]">← Human Agent</a>
          <span>Next: CSAT →</span>
        </footer>
      </main>
    </div>
  );
}
