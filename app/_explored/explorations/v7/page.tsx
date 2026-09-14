import { Bot, Sparkles, Mic, X, Languages } from "lucide-react";

/* v7 — Welcome screen, docked on the marketing site (mirrors the root /).
   Same landing background image as the root, but the chat panel is the
   pre-conversation welcome state: centered brand mark, prompts, composer. */

const ACCENT = "#632E9A";

const PROMPTS = [
  "What should I pay first?",
  "Can I get a credit card?",
  "Can I get a loan?",
  "How long to improve?",
  "How do I clear overdue payments?",
];

function Chip({ text }: { text: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white bg-white/85 px-3.5 py-2 text-[13px] whitespace-nowrap text-[#333333] shadow-[0_2px_8px_-2px_rgba(60,50,120,0.15)] backdrop-blur">
      <Sparkles className="size-3.5 shrink-0" strokeWidth={2} style={{ color: ACCENT }} />
      {text}
    </span>
  );
}

/* the docked chat — v7 welcome state */
function WelcomePanel() {
  return (
    <div className="fixed bottom-6 right-6 z-30 flex h-[640px] w-[400px] flex-col overflow-hidden rounded-[28px] bg-gradient-to-b from-[#F4F2FC] via-[#EEF0FB] to-[#E4ECFB] shadow-[0_24px_70px_-16px_rgba(40,30,90,0.4)] ring-1 ring-black/5">
      {/* header */}
      <div className="relative flex items-center justify-between px-5 pt-5 pb-3.5">
        <button className="grid size-9 place-items-center rounded-full bg-white/70 text-[#555] shadow-sm backdrop-blur transition-colors hover:bg-white">
          <X className="size-[18px]" strokeWidth={2} />
        </button>
        <span className="absolute left-1/2 -translate-x-1/2 text-[18px] font-semibold tracking-tight" style={{ color: ACCENT }}>
          TARS
        </span>
        <button className="grid size-9 place-items-center rounded-full bg-white/70 text-[#555] shadow-sm backdrop-blur transition-colors hover:bg-white">
          <Languages className="size-[18px]" strokeWidth={2} />
        </button>
      </div>

      {/* centered brand watermark */}
      <div className="grid flex-1 place-items-center">
        <Bot className="size-40" strokeWidth={1.25} style={{ color: ACCENT, opacity: 0.07 }} />
      </div>

      {/* suggested prompts */}
      <div className="mb-3 flex flex-col items-center gap-2 px-3">
        <div className="flex gap-2">
          <Chip text={PROMPTS[0]} />
          <Chip text={PROMPTS[1]} />
        </div>
        <div className="flex gap-2">
          <Chip text={PROMPTS[2]} />
          <Chip text={PROMPTS[3]} />
        </div>
        <div className="flex gap-2">
          <Chip text={PROMPTS[4]} />
        </div>
      </div>

      {/* composer */}
      <div className="px-4 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex flex-1 items-center rounded-full border border-[#D9D6EC] bg-white px-4 py-3 shadow-[0_2px_10px_-3px_rgba(60,50,120,0.18)]">
            <span className="flex-1 text-[15px] text-[#9A97AE]">Ask anything…</span>
          </div>
          <button
            className="grid size-12 shrink-0 place-items-center rounded-full text-white shadow-[0_4px_14px_-2px_rgba(99,46,154,0.5)]"
            style={{ background: ACCENT }}
            aria-label="Voice input"
          >
            <Mic className="size-5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WelcomeDockedExploration() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-white">
      {/* same landing-page background as the root / */}
      <img
        src="/v4-landing-bg.png"
        alt=""
        aria-hidden
        className="absolute inset-0 z-0 h-full w-full object-cover object-top"
      />

      {/* docked welcome chat */}
      <WelcomePanel />
    </div>
  );
}
