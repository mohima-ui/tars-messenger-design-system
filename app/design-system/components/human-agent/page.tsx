import { Copy, ThumbsDown, ThumbsUp, Volume2 } from "lucide-react";
import { Fragment } from "react";

const LINE = "#E0DAD3";
const CHROME = "#E5E5E5";
const PAPER = "#F9F3EA";
const INK = "#333333";
const ACCENT = "#632E9A"; // tenant accent — drives the agent avatar (single-accent theming)

/* word-by-word reveal — CSS only (word-in keyframe from globals); 'backwards' fill keeps text crisp after */
function Words({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span
            className="inline-block"
            style={{ animation: "word-in 320ms cubic-bezier(0.2,0.6,0.2,1) backwards", animationDelay: `${i * 42}ms` }}
          >
            {w}
          </span>
          {i < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </>
  );
}

const AGENTS = [
  { name: "Priya", initial: "P" },
  { name: "Marcus", initial: "M" },
  { name: "Sarah", initial: "S" },
];

function HumanBubble({
  name,
  initial,
  text = "",
  timestamp = "2:14 PM",
  typing = false,
  withLabel = true,
  withToolbar = false,
  animate = false,
}: {
  name: string;
  initial: string;
  text?: string;
  timestamp?: string;
  typing?: boolean;
  withLabel?: boolean;
  withToolbar?: boolean;
  animate?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      {withLabel && (
        <div className="ml-1 flex items-center gap-1.5">
          <div
            className="flex size-4 items-center justify-center rounded-full text-[8px] font-semibold text-white"
            style={{ backgroundColor: ACCENT }}
          >
            {initial}
          </div>
          <p className="text-[11px] font-medium tracking-wide text-[#6E6E6E]">
            {name} <span className="text-[#A8A096]">{typing ? "is typing…" : `· ${timestamp}`}</span>
          </p>
        </div>
      )}
      <div className="flex justify-start">
        <div
          className="max-w-[90%] rounded-[12px] rounded-bl-[4px] border px-3.5 py-2 text-[14px] leading-relaxed"
          style={{ backgroundColor: PAPER, borderColor: LINE, color: INK }}
        >
          {typing ? (
            <span className="flex items-center gap-1 py-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block size-1.5 rounded-full"
                  style={{ backgroundColor: "#8A8378", animation: `typing-dot 1.2s ease-in-out ${i * 150}ms infinite` }}
                />
              ))}
            </span>
          ) : animate ? (
            <Words text={text} />
          ) : (
            text
          )}
        </div>
      </div>
      {withToolbar && (
        <div className="ml-1 flex items-center gap-0.5">
          <button className="flex size-6 items-center justify-center rounded-[4px] text-[#6E6E6E] transition-colors hover:bg-[#F0EBE0] hover:text-[#333333]">
            <Volume2 className="size-3.5" strokeWidth={1.5} />
          </button>
          <button className="flex size-6 items-center justify-center rounded-[4px] text-[#6E6E6E] transition-colors hover:bg-[#F0EBE0] hover:text-[#333333]">
            <ThumbsUp className="size-3" strokeWidth={1.5} />
          </button>
          <button className="flex size-6 items-center justify-center rounded-[4px] text-[#6E6E6E] transition-colors hover:bg-[#F0EBE0] hover:text-[#333333]">
            <ThumbsDown className="size-3" strokeWidth={1.5} />
          </button>
          <button className="flex size-6 items-center justify-center rounded-[4px] text-[#6E6E6E] transition-colors hover:bg-[#F0EBE0] hover:text-[#333333]">
            <Copy className="size-3" strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>
  );
}

const ANATOMY = [
  { label: "Identity row", token: "Avatar (size-4 round) + name + timestamp · 11/16 medium muted" },
  { label: "Avatar", token: "size-4 circle · single letter · tenant accent" },
  { label: "Bubble", token: "Identical to AI Message — paper bg, line border, rounded 12/12/12/4" },
  { label: "Content", token: "14px regular ink — streams word-by-word like AI" },
  { label: "Action toolbar (on hover)", token: "Sound · Like · Dislike · Copy — same as AI Message" },
  { label: "Typing indicator", token: "Avatar + name + 'is typing…' · 3-dot bubble (typing-dot)" },
];

const SPECS = [
  { prop: "Avatar size", value: "size-4", note: "16px circle (smaller than header's 36px avatar)" },
  { prop: "Avatar font", value: "8px · 600", note: "Single uppercase initial" },
  { prop: "Avatar bg", value: "ACCENT #632E9A", note: "Tenant accent — single-accent theming" },
  { prop: "Label", value: "11 / 16 · 500", note: "Same as AI Agent label" },
  { prop: "Timestamp", value: "· 2:14 PM", note: "After the name, softer muted #A8A096" },
  { prop: "Bubble bg", value: "#F9F3EA", note: "--bg-paper — same as AI" },
  { prop: "Bubble border", value: "1px #E0DAD3", note: "--border-line (outside)" },
  { prop: "Bubble radius", value: "12 · 12 · 12 · 4 (bl)", note: "Same as AI Message" },
  { prop: "Bubble padding", value: "px-3.5 py-2", note: "14px × 8px — same as AI" },
  { prop: "Text", value: "14 · leading-relaxed · #333333", note: "--text-ink, Body" },
  { prop: "Max width", value: "90%", note: "Of the message column" },
  { prop: "Animation", value: "word-in · 38ms/word", note: "Streams word-by-word like AI Message" },
];

const DIFFERENCES = [
  {
    aspect: "Identity",
    ai: "Tars • AI Agent (text only)",
    human: "Avatar + Name + timestamp",
  },
  {
    aspect: "Word reveal",
    ai: "Streams 38ms per word",
    human: "Same — streams 38ms per word",
  },
  {
    aspect: "Action toolbar",
    ai: "Sound · Like · Dislike · Copy",
    human: "Same — Sound · Like · Dislike · Copy",
  },
  {
    aspect: "Citations",
    ai: "Yes (inline numbered chips)",
    human: "No — humans link inline normally",
  },
];

const DOS = [
  "Use the tenant accent for the avatar — one knob recolors every agent.",
  "Show the timestamp next to the name so handoff timing is clear.",
  "Keep the same bubble, word-reveal and toolbar as AI — only the identity changes.",
];

const DONTS = [
  "Don't reuse the Tars avatar — the agent's identity should be theirs alone.",
  "Don't drop the role on long names; truncate the name with ellipsis instead.",
  "Don't change the bubble shape — it must match AI Message exactly.",
];

export default function HumanAgentPage() {
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
            name gets weight, a timestamp marks when. Same bubble, word-reveal and
            toolbar as the AI — only the identity changes.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {/* Previews — states */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Previews</p>
            <div className="grid grid-cols-1 gap-3 rounded-[14px] border bg-white p-6 lg:grid-cols-3" style={{ borderColor: CHROME }}>
              <div className="flex flex-col gap-4 rounded-[10px] border bg-white p-4" style={{ borderColor: CHROME }}>
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Default</p>
                <HumanBubble
                  name={AGENTS[0].name}
                  initial={AGENTS[0].initial}
                  text="Hi! I'm taking over from Tars — let's get this sorted."
                />
              </div>
              <div className="flex flex-col gap-4 rounded-[10px] border bg-white p-4" style={{ borderColor: CHROME }}>
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Hover · action buttons</p>
                <HumanBubble
                  name={AGENTS[1].name}
                  initial={AGENTS[1].initial}
                  text="I've pulled up your account — give me one second."
                  withToolbar
                />
              </div>
              <div className="flex flex-col gap-4 rounded-[10px] border bg-white p-4" style={{ borderColor: CHROME }}>
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Typing</p>
                <HumanBubble
                  name={AGENTS[2].name}
                  initial={AGENTS[2].initial}
                  typing
                />
              </div>
            </div>
          </section>

          {/* Comparison to AI */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">vs. AI Message</p>
            <div className="flex flex-col divide-y overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: CHROME }}>
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
          <a href="/design-system/components/suggested-replies" className="transition-colors hover:text-[#333333]">← Suggested Replies</a>
          <a href="/design-system/components/handoff" className="transition-colors hover:text-[#333333]">Human Handoff →</a>
        </footer>
      </main>
    </div>
  );
}
