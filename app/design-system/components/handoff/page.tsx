const LINE = "#E0DAD3";
const CHROME = "#E5E5E5";
const PAPER = "#F9F3EA";
const INK = "#333333";
const MUTED = "#6E6E6E";
const ACCENT = "#632E9A";

/* Presence dot — small green status with a pulsing ring */
function PresenceDot() {
  return (
    <span className="absolute right-0 bottom-0 block size-1.5" aria-hidden>
      <span className="absolute -inset-0.5 rounded-full animate-ping" style={{ backgroundColor: "#16A34A", opacity: 0.8 }} />
      <span className="relative block size-1.5 rounded-full" style={{ backgroundColor: "#16A34A", boxShadow: "0 0 0 1.5px #FFFFFF" }} />
    </span>
  );
}

/* Handoff card — one dashed box, two states.
   connecting: user (T) + agent (P) avatars stacked, queue + ETA.
   connected:  T drops away, P sits centered, copy becomes "<Name> joined". */
function HandoffCard({
  joined,
  name,
  queue,
  eta,
  role,
  time,
}: {
  joined: boolean;
  name: string;
  queue: number;
  eta: string;
  role: string;
  time: string;
}) {
  return (
    <div
      className="flex w-full flex-col items-center gap-1.5 rounded-[12px] border border-dashed px-4 py-3"
      style={{ borderColor: LINE }}
    >
      <div className="flex h-7 items-center justify-center">
        {!joined && (
          <span
            className="flex size-7 items-center justify-center rounded-full border text-[11px] font-semibold"
            style={{ borderColor: LINE, color: INK }}
          >
            T
          </span>
        )}
        <span className={`relative ${joined ? "" : "-ml-2.5"}`}>
          <span
            className="flex size-7 items-center justify-center rounded-full text-[11px] font-semibold"
            style={{ backgroundColor: LINE, color: INK, boxShadow: "0 0 0 2px #FFFFFF" }}
          >
            {name.charAt(0)}
          </span>
          <PresenceDot />
        </span>
      </div>
      <div className="flex flex-col items-center gap-0.5">
        {joined ? (
          <>
            <p className="text-[12px] leading-tight" style={{ color: INK }}>
              <span className="font-semibold">{name}</span> joined
            </p>
            <p className="text-[10px] leading-tight" style={{ color: MUTED }}>
              {role} · {time}
            </p>
          </>
        ) : (
          <>
            <p className="text-[12px] leading-tight" style={{ color: INK }}>
              Connecting you with <span className="font-semibold">{name}</span>
            </p>
            <p className="text-[10px] leading-tight" style={{ color: MUTED }}>
              You&apos;re #{queue} in queue · typically {eta}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const ANATOMY = [
  { label: "Container", token: "rounded-[12px] · dashed 1px --border-line · transparent · px-4 py-3" },
  { label: "Avatars", token: "size-7 · user stroke-only, agent filled --border-line · stacked" },
  { label: "Presence dot", token: "size-1.5 · #16A34A · animate-ping ring" },
  { label: "Title", token: "12px · 'Connecting you with' regular, name semibold" },
  { label: "Subtitle", token: "10px --text-secondary · queue/ETA → role · timestamp" },
];

const SPECS = [
  { prop: "Container width", value: "Full message column", note: "Content centered" },
  { prop: "Container fill", value: "none", note: "Transparent — dashed stroke only" },
  { prop: "Container border", value: "1px dashed #E0DAD3", note: "--border-line" },
  { prop: "Avatar size", value: "size-7", note: "28px" },
  { prop: "User avatar", value: "stroke #E0DAD3", note: "Outlined, no fill" },
  { prop: "Agent avatar", value: "fill #E0DAD3", note: "Solid, 2px white ring for the stack gap" },
  { prop: "Presence dot", value: "#16A34A · size-1.5", note: "animate-ping pulse" },
  { prop: "Morph", value: "transform 520ms", note: "cubic-bezier(0.2,0.6,0.2,1) — T out, P to center" },
  { prop: "Title / subtitle", value: "12 / 10", note: "Name semibold; subtitle muted" },
];

const STATES = [
  { name: "Connecting", desc: "Dashed box with user (T) and agent (P) avatars stacked, queue position and ETA. Shows while the human picks up." },
  { name: "Connected", desc: "Same box morphs — T slides out and fades, P glides to center, copy switches to '<Name> joined' with role and timestamp." },
];

const FLOW = [
  { step: "1", title: "Trigger", desc: "User taps 'Talk to an agent', or AI confidence falls below threshold." },
  { step: "2", title: "Connecting card", desc: "Dashed box: T + P avatars stacked, 'Connecting you with Priya', queue position and ETA." },
  { step: "3", title: "Agent joins", desc: "Same box morphs — T slides out, P glides to center, copy becomes '<Name> joined · role · time'." },
  { step: "4", title: "Human typing", desc: "Typing indicator with the human's avatar." },
  { step: "5", title: "Human reply", desc: "First human-agent message appears (no streaming)." },
];

const DOS = [
  "Pass full context to the human — no 're-ask the user' patterns.",
  "Keep the card visually quiet — it's a transition, not a celebration.",
  "Use a 'returning to AI' mirror if/when the human hands back.",
];

const DONTS = [
  "Don't show toasts or modals for handoff — keep it inline.",
  "Don't bury the card under a long delay — fire it within ~1s of trigger.",
  "Don't make the user repeat themselves after the agent joins.",
];

export default function HandoffPage() {
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
            interruption. A single dashed card carries the moment: it shows who&apos;s
            connecting, then morphs in place to confirm the agent has joined. The scroll
            position holds, the history stays visible.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {/* Connecting state */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">
              Connecting state
            </p>
            <div className="rounded-[14px] border bg-white p-6" style={{ borderColor: CHROME }}>
              <div className="mx-auto max-w-[360px]">
                <HandoffCard joined={false} name="Priya" queue={1} eta="<1 min" role="Support specialist" time="2:56 PM" />
              </div>
            </div>
          </section>

          {/* Connected state */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">
              Connected state
            </p>
            <div className="rounded-[14px] border bg-white p-6" style={{ borderColor: CHROME }}>
              <div className="mx-auto max-w-[360px]">
                <HandoffCard joined={true} name="Priya" queue={1} eta="<1 min" role="Support specialist" time="2:56 PM" />
              </div>
            </div>
          </section>

          {/* In context */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">In context — full flow</p>
            <div className="mx-auto flex w-full max-w-[360px] flex-col gap-3 rounded-[14px] border bg-white p-6" style={{ borderColor: CHROME }}>
              {/* AI message before */}
              <div className="flex flex-col gap-1">
                <p className="ml-1 text-[11px] font-medium tracking-wide text-[#6E6E6E]">
                  AI Agent <span className="text-[#A8A096]">· 2:56 PM</span>
                </p>
                <div className="flex justify-start">
                  <div
                    className="max-w-[90%] rounded-[12px] rounded-bl-[4px] border px-3.5 py-2 text-[14px] leading-relaxed"
                    style={{ backgroundColor: PAPER, borderColor: LINE, color: INK }}
                  >
                    Let me connect you with a teammate who can dig into your account…
                  </div>
                </div>
              </div>

              {/* Connected card */}
              <HandoffCard joined={true} name="Priya" queue={1} eta="<1 min" role="Support specialist" time="2:56 PM" />

              {/* Human message after */}
              <div className="flex flex-col gap-1">
                <div className="ml-1 flex items-center gap-1.5">
                  <div
                    className="flex size-4 items-center justify-center rounded-full text-[8px] font-semibold text-white"
                    style={{ backgroundColor: ACCENT }}
                  >
                    P
                  </div>
                  <p className="text-[11px] font-medium tracking-wide text-[#6E6E6E]">
                    Priya <span className="text-[#A8A096]">· 2:56 PM</span>
                  </p>
                </div>
                <div className="flex justify-start">
                  <div
                    className="max-w-[90%] rounded-[12px] rounded-bl-[4px] border px-3.5 py-2 text-[14px] leading-relaxed"
                    style={{ backgroundColor: PAPER, borderColor: LINE, color: INK }}
                  >
                    Hi! I&apos;ve got everything Tars shared — let me check on that for you now.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Flow */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Flow</p>
            <div className="flex flex-col divide-y overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: CHROME }}>
              {FLOW.map((f) => (
                <div key={f.step} className="flex items-baseline gap-4 px-4 py-3">
                  <span className="w-6 font-mono text-[11px] font-semibold text-[#4A1F77]">{f.step}</span>
                  <span className="w-40 shrink-0 text-[12px] font-semibold text-[#333333]">{f.title}</span>
                  <p className="text-[11px] leading-relaxed text-[#6E6E6E]">{f.desc}</p>
                </div>
              ))}
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
          <a href="/design-system/components/human-agent" className="transition-colors hover:text-[#333333]">← Human Agent</a>
          <span>Next: CSAT →</span>
        </footer>
      </main>
    </div>
  );
}
