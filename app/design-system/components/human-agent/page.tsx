const LINE = "#E0DAD3";
const PAPER = "#F9F3EA";
const INK = "#333333";
const MUTED = "#6E6E6E";
const ACCENT = "#120BF4";
const ACCENT_INK = "#0A06A0";

const AGENTS = [
  { name: "Priya", initial: "P", role: "Support Specialist", color: "#A1593E" },
  { name: "Marcus", initial: "M", role: "Account Manager", color: "#3D5B3D" },
  { name: "Sarah", initial: "S", role: "Billing", color: "#0284C7" },
];

function HumanBubble({
  name,
  initial,
  role,
  avatarColor,
  text,
  withLabel = true,
}: {
  name: string;
  initial: string;
  role?: string;
  avatarColor: string;
  text: React.ReactNode;
  withLabel?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      {withLabel && (
        <div className="ml-1 flex items-center gap-1.5">
          <div
            className="flex size-4 items-center justify-center rounded-full text-[8px] font-semibold text-white"
            style={{ backgroundColor: avatarColor }}
          >
            {initial}
          </div>
          <p className="text-[11px] font-medium tracking-wide text-[#6E6E6E]">
            {name}{" "}
            {role && (
              <span className="text-[#A8A096]">• {role}</span>
            )}
          </p>
        </div>
      )}
      <div className="flex justify-start">
        <div
          className="max-w-[88%] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] rounded-bl-[6px] border px-[14px] py-[10px] text-[12px] leading-[1.55]"
          style={{ backgroundColor: PAPER, borderColor: LINE, color: INK }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}

const ANATOMY = [
  { label: "Identity row", token: "Avatar (size-4 round) + name + role · 11/16 medium muted" },
  { label: "Avatar", token: "size-4 circle · single letter · per-agent color" },
  { label: "Bubble", token: "Identical to AI Message — paper bg, line border, asymmetric corners" },
  { label: "Content", token: "12/18 regular ink — no streaming animation for humans" },
];

const SPECS = [
  { prop: "Avatar size", value: "size-4", note: "16px circle (smaller than header's 36px avatar)" },
  { prop: "Avatar font", value: "8px · 600", note: "Single uppercase initial" },
  { prop: "Avatar bg", value: "per-agent", note: "Hand-picked or hashed from name" },
  { prop: "Label", value: "11 / 16 · 500", note: "Same as AI Agent label" },
  { prop: "Role separator", value: "•", note: "Followed by softer muted #A8A096" },
  { prop: "Bubble bg", value: "#F9F3EA", note: "--bg-paper — same as AI" },
  { prop: "Bubble border", value: "1px #E0DAD3", note: "--border-line" },
  { prop: "Text", value: "#333333", note: "--text-ink" },
  { prop: "Animation", value: "bubble-in 240ms", note: "No word streaming — humans don't stream" },
];

const DIFFERENCES = [
  {
    aspect: "Identity",
    ai: "Tars • AI Agent (text only)",
    human: "Avatar + Name + Role",
  },
  {
    aspect: "Word reveal",
    ai: "Streams 38ms per word",
    human: "Appears whole (typing indicator → message)",
  },
  {
    aspect: "Toolbar on click",
    ai: "Sound · Like · Dislike · Copy",
    human: "Only Copy (no AI feedback signals)",
  },
  {
    aspect: "Citations",
    ai: "Yes (inline numbered chips)",
    human: "No — humans link inline normally",
  },
];

const DOS = [
  "Use a stable per-agent avatar color so a returning agent feels familiar.",
  "Show the role next to the name for context ('Priya · Support Specialist').",
  "Skip the word-streaming animation — humans type, they don't stream.",
];

const DONTS = [
  "Don't show the AI feedback toolbar (Sound, Like, Dislike) — those are for AI replies.",
  "Don't reuse the Tars avatar — the agent's identity should be theirs alone.",
  "Don't drop the role on long names; truncate the name with ellipsis instead.",
];

export default function HumanAgentPage() {
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
            <span className="text-[12px] font-semibold text-[#333333]">Human Agent Message</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-8 py-12">
        <div className="mb-12 max-w-[640px]">
          <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Component</p>
          <h1 className="mt-2 text-[32px] leading-tight font-semibold tracking-tight text-[#333333]">
            Human Agent Message
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[#555]">
            Same bubble shape as the AI, but identity changes — the avatar gets a face, the
            name gets weight, the role gets context. Words don&apos;t stream; humans type, they
            don&apos;t generate.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {/* Previews per agent */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Previews</p>
            <div className="grid grid-cols-1 gap-3 rounded-[14px] border bg-[#FAF6EE] p-6 lg:grid-cols-3" style={{ borderColor: LINE }}>
              {AGENTS.map((a) => (
                <div key={a.name} className="flex flex-col gap-2 rounded-[10px] border bg-white p-4" style={{ borderColor: LINE }}>
                  <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">{a.name}</p>
                  <HumanBubble
                    name={a.name}
                    initial={a.initial}
                    role={a.role}
                    avatarColor={a.color}
                    text="Hi! I'm taking over from Tars — let's get this sorted."
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Comparison to AI */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">vs. AI Message</p>
            <div className="flex flex-col divide-y overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: LINE }}>
              <div className="grid grid-cols-3 gap-4 bg-[#F9F3EA] px-4 py-2.5">
                <span className="text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Aspect</span>
                <span className="text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">AI Message</span>
                <span className="text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Human Agent</span>
              </div>
              {DIFFERENCES.map((d) => (
                <div key={d.aspect} className="grid grid-cols-3 gap-4 px-4 py-3">
                  <span className="text-[12px] font-semibold text-[#333333]">{d.aspect}</span>
                  <span className="text-[12px] text-[#6E6E6E]">{d.ai}</span>
                  <span className="text-[12px] text-[#6E6E6E]">{d.human}</span>
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
          <a href="/design-system/components/suggested-replies" className="transition-colors hover:text-[#333333]">← Suggested Replies</a>
          <a href="/design-system/components/handoff" className="transition-colors hover:text-[#333333]">Human Handoff →</a>
        </footer>
      </main>
    </div>
  );
}
