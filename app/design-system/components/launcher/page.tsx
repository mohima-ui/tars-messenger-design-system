import { Mic, ArrowUp, X, Square } from "lucide-react";

// deterministic waveform bar heights (0–1)
const WAVE = [0.3, 0.6, 0.45, 0.8, 0.55, 0.9, 0.4, 0.7, 0.5, 0.85, 0.35, 0.65, 0.95, 0.5, 0.75, 0.4, 0.6, 0.88, 0.45, 0.7, 0.55, 0.8, 0.35, 0.62, 0.5, 0.42];

const LINE = "#E0DAD3";
const CHROME = "#E5E5E5";
const INK = "#333333";
const MUTED = "#979797";
const ACCENT = "#632E9A";       // purple brand (matches main app + user bubble)
// accent-derived chip tints — re-theming only needs ACCENT
const ACCENT_SOFT = "color-mix(in srgb, #632E9A 10%, #fff)";
const ACCENT_BORDER = "color-mix(in srgb, #632E9A 35%, #fff)";

/* ── the resting Corner Pill (matches the main app) ── */
function RestingPill() {
  return (
    <div className="relative">
      {/* floating close badge */}
      <button
        type="button"
        aria-label="Close composer"
        className="absolute flex size-[19px] items-center justify-center rounded-full bg-white"
        style={{ left: 0, bottom: "100%", border: "1px solid #E3E3E3", color: MUTED, transform: "translate(-14px, 0px)" }}
      >
        <X className="size-2.5" strokeWidth={2.5} />
      </button>

      {/* pill */}
      <div
        className="liquid-glass relative flex items-center gap-2.5 bg-white"
        style={{
          width: 280,
          minHeight: 52,
          borderRadius: 16,
          boxShadow: "0 2px 16px -4px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.06)",
          padding: "0 8px 0 16px",
        }}
      >
        <span className="flex-1 text-[14px] tracking-tight" style={{ color: MUTED }}>
          Ask me anything…
        </span>
        <span
          className="flex size-7 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: ACCENT }}
        >
          <Mic className="size-3.5" strokeWidth={2} />
        </span>
      </div>
    </div>
  );
}

const STARTERS = ["Get a product demo", "Check pricing and plans", "What is an AI agent?"];

/* ── focused state: starters above, send arrow ── */
function FocusedPill() {
  return (
    <div className="flex flex-col items-end gap-3">
      <div className="flex flex-col items-end gap-2">
        {STARTERS.map((s) => (
          <span
            key={s}
            className="rounded-full border px-3.5 py-1.5 text-[14px] whitespace-nowrap"
            style={{ borderColor: ACCENT_BORDER, backgroundColor: ACCENT_SOFT, color: ACCENT }}
          >
            {s}
          </span>
        ))}
      </div>
      <div
        className="liquid-glass relative flex items-center gap-2.5 bg-white"
        style={{
          width: 380,
          minHeight: 52,
          borderRadius: 16,
          boxShadow: "0 2px 16px -4px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.06)",
          padding: "0 8px 0 16px",
        }}
      >
        <span className="flex-1 text-[14px] tracking-tight" style={{ color: MUTED }}>
          Ask me anything…
        </span>
        <span
          className="flex size-7 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: ACCENT }}
        >
          <ArrowUp className="size-3.5" strokeWidth={2.5} />
        </span>
      </div>
    </div>
  );
}

/* ── multi-line (grown to 4 lines) ── */
function MultilinePill() {
  return (
    <div
      className="liquid-glass relative flex items-end gap-2.5 bg-white"
      style={{
        width: 380,
        borderRadius: 16,
        boxShadow: "0 2px 16px -4px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.06)",
        padding: "10px 8px 10px 16px",
      }}
    >
      <span className="flex-1 text-[15px] leading-[1.5] tracking-tight" style={{ color: INK }}>
        I&apos;d like to compare the Studio and Enterprise plans, and understand which one fits a
        team of about twenty people who mostly need analytics and support automation.
      </span>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: ACCENT }}>
        <ArrowUp className="size-3.5" strokeWidth={2.5} />
      </span>
    </div>
  );
}

/* ── recording: cancel + waveform + stop ── */
function RecordingPill() {
  return (
    <div
      className="liquid-glass relative flex items-center gap-2.5 bg-white"
      style={{
        width: 380,
        minHeight: 52,
        borderRadius: 16,
        boxShadow: "0 2px 16px -4px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.06)",
        padding: "0 8px 0 16px",
      }}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full" style={{ color: MUTED }}>
        <X className="size-4" strokeWidth={2} />
      </span>
      <div className="flex min-w-0 flex-1 items-center justify-center gap-[3px] overflow-hidden px-1 py-[5px]" style={{ minHeight: 28 }}>
        {WAVE.map((h, i) => (
          <span key={i} className="block w-px origin-center rounded-full"
            style={{ height: `${Math.round(h * 18)}px`, backgroundColor: ACCENT, animation: `wave-bar 1.6s ease-in-out ${i * 45}ms infinite` }} />
        ))}
      </div>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: ACCENT }}>
        <Square className="size-3" strokeWidth={0} fill="currentColor" />
      </span>
    </div>
  );
}

function Scene({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-[300px] overflow-hidden rounded-[14px] border"
      style={{ borderColor: CHROME, backgroundColor: "#FFFFFF" }}
    >
      <div className="absolute right-5 bottom-5 flex flex-col items-end">{children}</div>
    </div>
  );
}

const ANATOMY = [
  { label: "Pill", token: "Rounded input · 280px rest → 380px focused · 52px tall · 16px radius" },
  { label: "Gradient stroke", token: "1px animated conic ring (purple → cyan → white shine) + gliding glint" },
  { label: "Placeholder", token: "“Ask me anything…” · 14px · #979797" },
  { label: "Action button", token: "size-7 round · accent fill · Mic at rest → ↑ Send when focused" },
  { label: "Close badge", token: "19px circle · #E3E3E3 border · sits 1px above pill, top-left" },
  { label: "Starters", token: "Suggested-reply chips above the pill in focused state (accent-soft)" },
];

const SPECS = [
  { prop: "Width", value: "280 → 380px", note: "Rest → focused" },
  { prop: "Min height", value: "52px", note: "Grows to 4 lines (~100px), then scrolls" },
  { prop: "Radius", value: "16px", note: "Pill + stroke ring matched" },
  { prop: "Stroke", value: "1px conic gradient", note: "Animated; purple #8B…→cyan→white shine" },
  { prop: "Button", value: "size-7 round · --accent", note: "Mic → Send; white icon" },
  { prop: "Placeholder", value: "14px #979797", note: "Typed text 15px #333333" },
  { prop: "Entrance", value: "1s delay · slide-in", note: "translateX 1000ms ease-out" },
  { prop: "Position", value: "bottom-right · 20px", note: "Grows upward when multi-line" },
];

const STATES = [
  { name: "Rest (pill)", desc: "Narrow pill with placeholder + mic button. Animated gradient stroke. Close badge above." },
  { name: "Focused", desc: "Click expands the pill to 380px; suggested-reply starters rise above; button becomes send arrow (purple)." },
  { name: "Typing", desc: "Field grows upward up to 4 lines, then scrolls; starters ride up with it. Send enabled." },
  { name: "Recording", desc: "Mic click shows an inline waveform with cancel (X) and stop (■); starters hide." },
  { name: "Transcribing", desc: "Spinner while the speech converts to text, which fills the field." },
  { name: "Chatting", desc: "The pill row collapses away and the full chat panel rises in its place." },
];

const DOS = [
  "Keep the mic the default action — voice-first; it becomes Send only when focused.",
  "Let the field grow upward so the bottom edge stays anchored to the corner.",
  "Drive all chip + button color from a single --accent token (color-mix tints).",
  "Click-away (anywhere outside pill + starters) collapses back to rest.",
];

const DONTS = [
  "Don't grow the pill downward or let it clip at its row height.",
  "Don't keep the gradient stroke spinning while focused — it pauses to stay calm.",
  "Don't show starters during recording — the waveform should read cleanly.",
  "Don't hardcode the purple shades per element — derive them from --accent.",
];

function StateRow({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="flex items-baseline gap-4 py-2.5">
      <span className="w-44 shrink-0 text-[12px] font-semibold text-[#333333]">{name}</span>
      <p className="text-[12px] leading-relaxed text-[#6E6E6E]">{desc}</p>
    </div>
  );
}

export default function LauncherPage() {
  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @property --lg-angle { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
        @keyframes liquid-edge-orbit { to { --lg-angle: 360deg; } }
        .liquid-glass::before, .liquid-glass::after {
          content: ""; position: absolute; padding: 1px; inset: 0; border-radius: 16px;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none;
        }
        .liquid-glass::before {
          background: conic-gradient(from var(--lg-angle),
            rgba(180,140,255,1) 0deg, rgba(150,200,255,1) 55deg, rgba(120,230,255,1) 110deg,
            rgba(220,255,255,1) 160deg, rgba(255,255,255,1) 180deg, rgba(220,255,255,1) 200deg,
            rgba(120,230,255,1) 250deg, rgba(150,200,255,1) 305deg, rgba(180,140,255,1) 360deg);
          animation: liquid-edge-orbit 5s linear infinite;
        }
        .liquid-glass::after {
          background: conic-gradient(from var(--lg-angle),
            transparent 0deg 8deg, rgba(175,205,255,0) 14deg, rgba(175,205,255,0.32) 26deg,
            rgba(220,235,255,0.7) 38deg, rgba(248,251,255,0.95) 45deg, rgba(255,255,255,1) 49deg,
            rgba(248,251,255,0.95) 53deg, rgba(215,200,255,0.7) 60deg, rgba(190,205,255,0.32) 72deg,
            rgba(175,205,255,0) 84deg, transparent 90deg 360deg);
          animation: liquid-edge-orbit 7s linear infinite;
        }
      `}</style>

      <main className="mx-auto max-w-[1080px] px-8 py-12">
        <div className="mb-3 flex items-baseline gap-3">
          <span className="text-[12px] font-medium text-[#6E6E6E]">Components</span>
          <span className="text-[#D4D4D4]">/</span>
          <span className="text-[12px] font-semibold text-[#333333]">Launcher</span>
        </div>
        <div className="mb-12 max-w-[640px]">
          <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Component</p>
          <h1 className="mt-2 text-[32px] leading-tight font-semibold tracking-tight text-[#333333]">Launcher — Corner Pill</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[#555]">
            A pill at rest, voice-first. It invites a message instead of a blank bubble — an
            animated gradient stroke draws the eye, the mic offers a quick way in, and a click
            expands it into starters and the full chat. Always bottom-right; grows upward.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {/* Preview */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Preview</p>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Rest</p>
                <Scene><RestingPill /></Scene>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Focused</p>
                <Scene><FocusedPill /></Scene>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Message (4 lines)</p>
                <Scene><MultilinePill /></Scene>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Recording</p>
                <Scene><RecordingPill /></Scene>
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
                  <span className="w-44 shrink-0 text-[12px] font-semibold text-[#333333]">{a.label}</span>
                  <span className="text-[11px] text-[#6E6E6E]">{a.token}</span>
                </div>
              ))}
            </div>
          </section>

          {/* State details */}
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
                  <span className="w-44 shrink-0 text-[12px] font-semibold text-[#333333]">{s.prop}</span>
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
          <a href="/design-system/components/error" className="transition-colors hover:text-[#333333]">← Error</a>
          <a href="/design-system/components/history" className="transition-colors hover:text-[#333333]">History →</a>
        </footer>
      </main>
    </div>
  );
}
