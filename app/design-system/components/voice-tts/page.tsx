import { Volume2 } from "lucide-react";

const LINE = "#E0DAD3";
const CHROME = "#E5E5E5";
const PAPER = "#F9F3EA";
const INK = "#333333";
const MUTED = "#6E6E6E";
const ACCENT_INK = "#0A06A0";

const KEYFRAMES = `
@keyframes tts-arc-fade {
  0%, 100% { opacity: 0; }
  25%, 35% { opacity: 1; }
  55% { opacity: 0; }
}
`;

function SoundIcon({
  state,
}: {
  state: "rest" | "hover" | "active";
}) {
  if (state === "active") {
    return (
      <button
        type="button"
        className="flex size-6 items-center justify-center rounded-[4px]"
        style={{ color: ACCENT_INK }}
        aria-label="Stop reading"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
          <path
            d="M14 10a3 3 0 0 1 0 4"
            style={{ animation: "tts-arc-fade 1800ms ease-in-out infinite" }}
          />
          <path
            d="M16.5 7.5a6 6 0 0 1 0 9"
            style={{ animation: "tts-arc-fade 1800ms ease-in-out 350ms infinite" }}
          />
          <path
            d="M19.364 5.636a9 9 0 0 1 0 12.728"
            style={{ animation: "tts-arc-fade 1800ms ease-in-out 700ms infinite" }}
          />
        </svg>
      </button>
    );
  }
  return (
    <button
      type="button"
      className={`flex size-6 items-center justify-center rounded-[4px] transition-colors ${
        state === "hover"
          ? "bg-[#F0EBE0] text-[#333333]"
          : "text-[#6E6E6E]"
      }`}
      aria-label="Read aloud"
    >
      <Volume2 className="size-3.5" strokeWidth={1.5} />
    </button>
  );
}

function ToolbarPreview({ state }: { state: "rest" | "hover" | "active" }) {
  return (
    <div className="flex flex-col items-start gap-2">
      <div
        className="rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] rounded-bl-[6px] border px-[14px] py-[10px] text-[12px] leading-[1.55]"
        style={{ backgroundColor: PAPER, borderColor: LINE, color: INK }}
      >
        Refunds usually land in 3–5 business days.
      </div>
      <div className="ml-1 flex items-center gap-0.5">
        <SoundIcon state={state} />
      </div>
    </div>
  );
}

const ANATOMY = [
  { label: "Speaker glyph", token: "Lucide Volume2 body · stroke 1.75 · linecap round" },
  { label: "Arc 1 (near)", token: "r=3 · accent-ink · 1800ms cycle · 0ms delay" },
  { label: "Arc 2 (mid)", token: "r=6 · accent-ink · 1800ms cycle · 350ms delay" },
  { label: "Arc 3 (far)", token: "r=9 · accent-ink · 1800ms cycle · 700ms delay" },
  { label: "Bounding hit area", token: "size-6 button · rounded-[4px]" },
];

const SPECS = [
  { prop: "Icon size", value: "14px (size-3.5)", note: "Inside size-6 button" },
  { prop: "Stroke", value: "1.75px · round caps", note: "Slightly heavier than rest for the playing state" },
  { prop: "Color (rest)", value: "#6E6E6E", note: "--text-secondary" },
  { prop: "Color (hover)", value: "#333333", note: "--text-ink · bg fills with --bg-subtle" },
  { prop: "Color (active)", value: "#0A06A0", note: "--accent-ink — playing state" },
  { prop: "Cycle", value: "1800ms ease-in-out infinite", note: "Same keyframe for all 3 arcs" },
  { prop: "Arc delays", value: "0ms · 350ms · 700ms", note: "Sequential ripple" },
  { prop: "Arc keyframe", value: "0/100 hidden · 25–35 visible · 55 fading", note: "Smooth come-and-go fade" },
];

const STATES = [
  { name: "Rest", desc: "Volume2 icon in --text-secondary. No bg." },
  { name: "Hover", desc: "Icon darkens to --text-ink, button bg fills with --bg-subtle." },
  { name: "Active (playing)", desc: "Icon switches to a custom 4-path SVG: speaker body + 3 arcs animating sequentially in --accent-ink. No bg." },
  { name: "Stop", desc: "Clicking active button cancels speechSynthesis and reverts to rest." },
];

const DOS = [
  "Use system speechSynthesis — no extra audio assets.",
  "Cancel the previous utterance when starting a new one — only one bubble can speak at a time.",
  "Keep the same speaker glyph for rest, hover, and active — only the arcs change.",
];

const DONTS = [
  "Don't replace the icon with a 'pause' glyph — the arcs animation itself is the signal.",
  "Don't add a bg fill when active — the color shift to --accent-ink is enough.",
  "Don't continue arcs past the spoken text — stop the animation when the utterance ends.",
];

function StateRow({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="flex items-baseline gap-4 py-2.5">
      <span className="w-44 shrink-0 text-[12px] font-semibold text-[#333333]">{name}</span>
      <p className="text-[12px] leading-relaxed text-[#6E6E6E]">{desc}</p>
    </div>
  );
}

export default function VoiceTtsPage() {
  return (
    <div className="min-h-screen bg-white">
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      <header className="sticky top-0 z-10 border-b border-[#E5E5E5] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between px-8 py-4">
          <div className="flex items-baseline gap-3">
            <a href="/design-system" className="text-[12px] text-[#6E6E6E] transition-colors hover:text-[#333333]">
              ← Foundation
            </a>
            <span className="text-[#D4D4D4]">/</span>
            <span className="text-[12px] font-medium text-[#333333]">Components</span>
            <span className="text-[#D4D4D4]">/</span>
            <span className="text-[12px] font-semibold text-[#333333]">Voice — Text to speech</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-8 py-12">
        <div className="mb-12 max-w-[640px]">
          <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Component</p>
          <h1 className="mt-2 text-[32px] leading-tight font-semibold tracking-tight text-[#333333]">
            Voice — Text to speech
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[#555]">
            The Sound icon on AI messages. Speaker glyph + three semicircle arcs that ease
            in and out sequentially while the utterance plays. No fill, no bg — just color.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {/* States */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">States</p>
            <div className="grid grid-cols-1 gap-3 rounded-[14px] border bg-white p-6 sm:grid-cols-3" style={{ borderColor: CHROME }}>
              <div className="flex flex-col gap-3 rounded-[10px] border bg-white p-4" style={{ borderColor: CHROME }}>
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Rest</p>
                <ToolbarPreview state="rest" />
              </div>
              <div className="flex flex-col gap-3 rounded-[10px] border bg-white p-4" style={{ borderColor: CHROME }}>
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Hover</p>
                <ToolbarPreview state="hover" />
              </div>
              <div className="flex flex-col gap-3 rounded-[10px] border bg-white p-4" style={{ borderColor: CHROME }}>
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Active (playing)</p>
                <ToolbarPreview state="active" />
              </div>
            </div>
          </section>

          {/* Animation detail */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Animation</p>
            <div className="grid grid-cols-1 gap-4 rounded-[12px] border bg-white p-6 sm:grid-cols-2" style={{ borderColor: CHROME }}>
              <div className="flex items-center justify-center rounded-[10px] bg-white py-8" style={{ minHeight: 120 }}>
                <div style={{ transform: "scale(3)", color: ACCENT_INK }}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
                    <path
                      d="M14 10a3 3 0 0 1 0 4"
                      style={{ animation: "tts-arc-fade 1800ms ease-in-out infinite" }}
                    />
                    <path
                      d="M16.5 7.5a6 6 0 0 1 0 9"
                      style={{ animation: "tts-arc-fade 1800ms ease-in-out 350ms infinite" }}
                    />
                    <path
                      d="M19.364 5.636a9 9 0 0 1 0 12.728"
                      style={{ animation: "tts-arc-fade 1800ms ease-in-out 700ms infinite" }}
                    />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-[12px] leading-relaxed text-[#555]">
                <p>
                  Three concentric arcs (small / medium / large) ease in and out
                  on a 1800ms cycle. Each arc is staggered 350ms after the previous, so they
                  sequence outward like a ripple of sound.
                </p>
                <p>
                  The keyframe holds opacity 0 for most of the loop and only swells to 1
                  between the 25% and 35% mark — so the wave feels deliberate, not jittery.
                </p>
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
          <a href="/design-system/components/voice-stt" className="transition-colors hover:text-[#333333]">← Voice STT</a>
          <a href="/design-system" className="transition-colors hover:text-[#333333]">All foundations →</a>
        </footer>
      </main>
    </div>
  );
}
