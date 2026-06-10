"use client";

import { ArrowUp, Mic, X } from "lucide-react";
import { useEffect, useState } from "react";

const LINE = "#E0DAD3";
const CHROME = "#E5E5E5";
const PAPER = "#F9F3EA";
const INK = "#333333";
const MUTED = "#6E6E6E";
const ACCENT = "#120BF4";
const ACCENT_INK = "#0A06A0";
const ACCENT_SOFT = "#E0E5FA";
const ACCENT_BORDER = "#A5B0EE";
const DANGER = "#DC2626";

function IdleComposer() {
  return (
    <div
      className="flex h-11 w-full items-center gap-2 rounded-[12px] border bg-[#F9F3EA] px-2"
      style={{ borderColor: LINE }}
    >
      <button className="flex size-7 shrink-0 items-center justify-center rounded-[6px] text-[#6E6E6E]" aria-label="Add">
        <span className="text-[16px]">+</span>
      </button>
      <span className="flex-1 text-[12px] text-[#979797]">Ask me anything...</span>
      <button className="flex size-7 shrink-0 items-center justify-center rounded-[6px] text-[#6E6E6E]" aria-label="Voice">
        <Mic className="size-4" strokeWidth={1.5} />
      </button>
    </div>
  );
}

function RecordingComposer({ seconds = 8 }: { seconds?: number }) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return (
    <div
      className="flex h-11 w-full items-center gap-2 rounded-[12px] border bg-white px-2"
      style={{ borderColor: ACCENT_BORDER }}
    >
      <button
        className="flex size-7 shrink-0 items-center justify-center rounded-[6px] text-[#6E6E6E] transition-colors hover:bg-[#F0EBE0] hover:text-[#333333]"
        aria-label="Cancel recording"
      >
        <X className="size-4" strokeWidth={1.75} />
      </button>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: DANGER }}
        />
        <span className="shrink-0 font-mono text-[11px] tabular-nums" style={{ color: INK }}>
          {mm}:{ss}
        </span>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-[2px]">
          {[6, 14, 9, 18, 11, 16, 7, 13, 10, 17, 8, 15, 12, 6, 14].map((h, i) => (
            <span
              key={i}
              className="inline-block w-[2px] rounded-full"
              style={{
                height: `${h}px`,
                backgroundColor: ACCENT_INK,
              }}
            />
          ))}
        </div>
      </div>
      <button
        className="flex size-7 shrink-0 items-center justify-center rounded-[6px] text-white"
        style={{ backgroundColor: ACCENT }}
        aria-label="Stop and send"
      >
        <ArrowUp className="size-4" strokeWidth={2} />
      </button>
    </div>
  );
}

const RING_KEYFRAMES = `
@keyframes voice-ring {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  100% { transform: translate(-50%, -50%) scale(2.6); opacity: 0; }
}
@keyframes voice-glow {
  0%, 100% { opacity: 0.55; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.12); }
}
@keyframes voice-cursor {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
}
`;

const SAMPLE_PHRASE =
  "Can you help me check on my refund for order GP-48291";

function VoiceMode() {
  const [state, setState] = useState<"idle" | "listening" | "processing">(
    "idle",
  );
  const [transcript, setTranscript] = useState("");
  const [amplitude, setAmplitude] = useState(0.6);

  // Stream sample words while listening
  useEffect(() => {
    if (state !== "listening") return;
    setTranscript("");
    const words = SAMPLE_PHRASE.split(" ");
    let i = 0;
    const id = window.setInterval(() => {
      setTranscript((prev) => (prev ? prev + " " : "") + words[i]);
      i++;
      if (i >= words.length) window.clearInterval(id);
    }, 280);
    return () => window.clearInterval(id);
  }, [state]);

  // Simulated amplitude — drives ring scale subtly
  useEffect(() => {
    if (state !== "listening") return;
    const id = window.setInterval(() => {
      setAmplitude(0.55 + Math.random() * 0.45);
    }, 120);
    return () => window.clearInterval(id);
  }, [state]);

  const handleStart = () => setState("listening");
  const handleCancel = () => {
    setState("idle");
    setTranscript("");
  };
  const handleStop = () => {
    setState("processing");
    setTimeout(() => setState("idle"), 600);
  };

  return (
    <div
      className="flex w-full flex-col gap-4 rounded-[14px] border bg-white p-5"
      style={{ borderColor: LINE }}
    >
      <style dangerouslySetInnerHTML={{ __html: RING_KEYFRAMES }} />

      {state === "idle" && (
        <div className="flex flex-col items-center gap-3 py-4">
          <button
            type="button"
            onClick={handleStart}
            className="relative flex size-16 items-center justify-center rounded-full text-white transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: ACCENT,
              boxShadow:
                "0 4px 12px -3px rgba(18,11,244,0.35), 0 8px 24px -6px rgba(0,0,0,0.12)",
            }}
            aria-label="Start voice"
          >
            <Mic className="size-7" strokeWidth={1.75} />
          </button>
          <p className="text-[12px] font-medium" style={{ color: MUTED }}>
            Tap to speak
          </p>
        </div>
      )}

      {(state === "listening" || state === "processing") && (
        <div className="flex flex-col items-center gap-5 pt-4">
          {/* Mic with rings + glow */}
          <div className="relative flex size-32 items-center justify-center">
            {/* Soft outer glow */}
            <div
              className="absolute top-1/2 left-1/2 size-24 rounded-full blur-2xl"
              style={{
                backgroundColor: ACCENT,
                animation:
                  state === "listening"
                    ? "voice-glow 1.6s ease-in-out infinite"
                    : undefined,
                opacity: state === "processing" ? 0.4 : undefined,
                transform: "translate(-50%, -50%)",
              }}
            />
            {state === "listening" && (
              <>
                <span
                  className="absolute top-1/2 left-1/2 size-16 rounded-full border"
                  style={{
                    borderColor: ACCENT_BORDER,
                    animation: `voice-ring 1.8s ease-out infinite`,
                  }}
                />
                <span
                  className="absolute top-1/2 left-1/2 size-16 rounded-full border"
                  style={{
                    borderColor: ACCENT_BORDER,
                    animation: `voice-ring 1.8s ease-out 600ms infinite`,
                  }}
                />
                <span
                  className="absolute top-1/2 left-1/2 size-16 rounded-full border"
                  style={{
                    borderColor: ACCENT_BORDER,
                    animation: `voice-ring 1.8s ease-out 1200ms infinite`,
                  }}
                />
              </>
            )}
            <button
              type="button"
              onClick={state === "listening" ? handleStop : undefined}
              className="relative z-10 flex size-16 items-center justify-center rounded-full text-white transition-transform"
              style={{
                backgroundColor: ACCENT,
                boxShadow:
                  "0 4px 12px -3px rgba(18,11,244,0.35), 0 8px 24px -6px rgba(0,0,0,0.12)",
                transform:
                  state === "listening"
                    ? `scale(${1 + amplitude * 0.05})`
                    : undefined,
              }}
              aria-label={state === "listening" ? "Stop" : "Processing"}
            >
              <Mic className="size-7" strokeWidth={1.75} />
            </button>
          </div>

          <p className="text-[11px] font-medium" style={{ color: MUTED }}>
            {state === "listening" ? "Listening…" : "Transcribing…"}
          </p>

          {/* Live transcription field */}
          <div className="w-full">
            <div
              className="flex min-h-[80px] w-full items-start gap-2 rounded-[12px] border bg-white px-3 py-2.5"
              style={{ borderColor: LINE }}
            >
              <div className="min-h-[60px] flex-1 text-[13px] leading-[1.55]" style={{ color: INK }}>
                {transcript || (
                  <span style={{ color: MUTED }}>Your words will appear here…</span>
                )}
                {state === "listening" && transcript && (
                  <span
                    className="inline-block w-[2px] h-[14px] ml-0.5 align-middle"
                    style={{
                      backgroundColor: ACCENT_INK,
                      animation: "voice-cursor 800ms ease-in-out infinite",
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-[12px] font-medium text-[#555] transition-colors hover:bg-[#F0EBE0]"
              style={{ borderColor: LINE }}
            >
              <X className="size-3" strokeWidth={2} />
              Cancel
            </button>
            <button
              type="button"
              onClick={handleStop}
              disabled={!transcript}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#120BF4] px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#0A06D4] disabled:opacity-40"
            >
              Send
              <ArrowUp className="size-3" strokeWidth={2.25} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function HoldToTalk() {
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        className="relative flex size-14 items-center justify-center rounded-full text-white"
        style={{
          backgroundColor: ACCENT,
          boxShadow:
            "0 0 0 6px rgba(18,11,244,0.10), 0 0 0 12px rgba(18,11,244,0.05)",
        }}
        aria-label="Hold to talk"
      >
        <Mic className="size-6" strokeWidth={1.75} />
      </button>
      <p className="text-[11px] font-medium text-[#6E6E6E]">Hold to talk</p>
    </div>
  );
}

const ANATOMY = [
  { label: "Cancel", token: "X icon button · left edge · discards the audio" },
  { label: "Live dot", token: "size-2 danger red · pulses 1.2s" },
  { label: "Timer", token: "Mono · 11px · tabular-nums · mm:ss" },
  { label: "Waveform", token: "15 vertical bars · accent-ink · animate scaleY 0.3 → 1" },
  { label: "Send (stop)", token: "Accent fill · ArrowUp · commits the audio" },
];

const SPECS = [
  { prop: "Container", value: "h-11 · rounded-[12px]", note: "Same shape as the idle composer" },
  { prop: "Bg", value: "#FFFFFF", note: "--bg-surface (lifts off the paper composer)" },
  { prop: "Border", value: "1px #A5B0EE", note: "--accent-border — signals 'recording'" },
  { prop: "Live dot", value: "size-2 #DC2626", note: "--danger · pulses 1.2s ease-in-out infinite" },
  { prop: "Timer", value: "font-mono · 11 · tabular-nums · ink", note: "Updates every second" },
  { prop: "Waveform bar", value: "w-[2px] · accent-ink", note: "Random h between 6–18px · scaleY pulse" },
  { prop: "Send button", value: "size-7 · accent fill · white icon", note: "ArrowUp glyph" },
  { prop: "Animation", value: "fade-in 200ms", note: "On enter and exit" },
];

const STATES = [
  { name: "Idle", desc: "Default composer with Mic icon at right edge. Tap to start recording." },
  { name: "Recording", desc: "Composer transforms: cancel (X) left, pulsing dot + timer + live waveform middle, send right." },
  { name: "Permission denied", desc: "If mic perms aren't granted, idle composer shows a soft danger banner above it explaining how to enable." },
  { name: "Too long", desc: "At 60s, the timer turns danger-ink and a small banner suggests stopping or sending." },
];

const FLOW = [
  { step: "1", title: "Tap mic", desc: "Browser prompts for permission if first time." },
  { step: "2", title: "Recording", desc: "Composer becomes the recording bar. No surprise — the user always knows it's live." },
  { step: "3", title: "Cancel or send", desc: "X discards audio + restores idle composer. ArrowUp commits and starts transcription." },
  { step: "4", title: "Transcribing", desc: "User bubble shows skeleton while audio → text resolves; falls back to plain text on completion." },
];

const DOS = [
  "Show the live dot at all times during recording — never let the user wonder.",
  "Use the same composer height — no expansion, no jump.",
  "Provide both cancel (discard) and send (commit) — never one without the other.",
];

const DONTS = [
  "Don't go fullscreen for recording — keep it inline in the composer.",
  "Don't auto-send when the user stops talking — explicit commit only.",
  "Don't show fake/looping waveforms when nothing's being captured.",
];

function StateRow({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="flex items-baseline gap-4 py-2.5">
      <span className="w-44 shrink-0 text-[12px] font-semibold text-[#333333]">{name}</span>
      <p className="text-[12px] leading-relaxed text-[#6E6E6E]">{desc}</p>
    </div>
  );
}

export default function VoiceSttPage() {
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
            <span className="text-[12px] font-semibold text-[#333333]">Voice — Speech to text</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-8 py-12">
        <div className="mb-12 max-w-[640px]">
          <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Component</p>
          <h1 className="mt-2 text-[32px] leading-tight font-semibold tracking-tight text-[#333333]">
            Voice — Speech to text
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[#555]">
            No surprise. A pulse, a wave, a way to stop. The composer transforms in place when
            the user starts talking — same height, same shape, just a new payload.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {/* Idle → Recording */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Composer transform</p>
            <div className="flex flex-col gap-4 rounded-[14px] border bg-white p-6" style={{ borderColor: CHROME }}>
              <div className="flex flex-col gap-2 rounded-[10px] border bg-white p-4" style={{ borderColor: CHROME }}>
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Idle</p>
                <IdleComposer />
              </div>
              <div className="flex flex-col gap-2 rounded-[10px] border bg-white p-4" style={{ borderColor: CHROME }}>
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Recording</p>
                <RecordingComposer seconds={8} />
              </div>
            </div>
          </section>

          {/* Variant: voice mode with pulsing rings */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">
              Variant — voice mode with pulsing rings
            </p>
            <p className="mb-4 max-w-[640px] text-[12px] leading-relaxed text-[#6E6E6E]">
              A richer listening state — for ambient voice flows like ChatGPT Voice, Siri, or
              Gemini Live. Tap the mic to enter listening, concentric rings expand and fade
              continuously, a soft accent glow pulses behind, and words stream into the
              editable field live. Tap the mic (or the Send button) to commit; Cancel
              discards.
            </p>
            <div
              className="grid grid-cols-1 gap-4 rounded-[14px] border bg-white p-6 lg:grid-cols-[360px_1fr]"
              style={{ borderColor: CHROME }}
            >
              <VoiceMode />
              <div className="flex flex-col gap-3 text-[12px] leading-relaxed text-[#555]">
                <div>
                  <p className="text-[11px] font-semibold tracking-wider uppercase text-[#6E6E6E]">
                    Try it
                  </p>
                  <p className="mt-1">
                    Click the mic to enter listening. A sample phrase streams in word-by-word
                    while three rings expand outward, staggered every 600ms, with a soft
                    accent glow pulsing behind the button.
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-wider uppercase text-[#6E6E6E]">
                    Amplitude reactive
                  </p>
                  <p className="mt-1">
                    The center button subtly scales up to 1.025× in time with a simulated
                    amplitude (real implementation: Web Audio API <code className="font-mono text-[11px]">AnalyserNode</code> RMS).
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-wider uppercase text-[#6E6E6E]">
                    Editable
                  </p>
                  <p className="mt-1">
                    The transcribed text is editable before sending — the user can correct
                    misrecognition without re-recording.
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-wider uppercase text-[#6E6E6E]">
                    State transitions
                  </p>
                  <p className="mt-1">
                    <code className="font-mono text-[11px]">idle</code> →{" "}
                    <code className="font-mono text-[11px]">listening</code> →{" "}
                    <code className="font-mono text-[11px]">processing</code> →{" "}
                    <code className="font-mono text-[11px]">idle</code>. Each transition is
                    soft (200ms ease-out fade) — no abrupt cuts.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Alt: hold-to-talk */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Alternative — hold to talk</p>
            <div className="flex items-center justify-center rounded-[14px] border bg-white p-12" style={{ borderColor: CHROME }}>
              <HoldToTalk />
            </div>
            <p className="mt-3 max-w-[640px] text-[12px] leading-relaxed text-[#6E6E6E]">
              For mobile-first flows: a large mic button with a soft accent halo. Pressed = recording, released = sent.
              The inline composer transform is preferred for desktop; this pattern is for native/touch contexts.
            </p>
          </section>

          {/* Flow */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Flow</p>
            <div className="flex flex-col divide-y overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: CHROME }}>
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
          <a href="/design-system/components/history" className="transition-colors hover:text-[#333333]">← History</a>
          <a href="/design-system/components/voice-tts" className="transition-colors hover:text-[#333333]">Voice TTS →</a>
        </footer>
      </main>
    </div>
  );
}
