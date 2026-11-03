"use client";

/* ── THE VOICE BUILDER ────────────────────────────────────────────────────
   One flow, two ways of answering — so one canvas, not two.

   The wrong design here is a "voice flow" beside the chat flow. It looks
   tidy for a week and then the two drift: a branch added to one, a message
   fixed in the other, and a tenant maintaining the same conversation twice.
   Every product that has tried it ends up with a stale copy nobody trusts.

   So voice is a *mode* of the flow already on the canvas. Turning it on does
   three things and no more:

     · every gambit gains a Voice tab beside its messages
     · the canvas marks what cannot speak, and says what happens instead
     · three gambits appear in the palette that had no reason to exist before

   The thing that makes it real rather than a settings screen is validation:
   a flow is not voice-ready because somebody switched voice on, it is
   voice-ready when every node in it can be heard. ─────────────────────── */

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  CircleHelp,
  Flag,
  Image as ImageIcon,
  Keyboard,
  ListChecks,
  Mic,
  Play,
  Plus,
  Repeat,
  Search,
  SpellCheck,
  Split,
  Type as TypeIcon,
  Upload,
  Volume2,
  X,
  Zap,
} from "lucide-react";

const ACCENT = "#6D33AA";
const INK = "#16181D";
const MUTED = "#6B7280";
const FAINT = "#9CA3AF";
const LINE = "#E8E8EC";
const GREEN = "#16A34A";

/* ── the flow ─────────────────────────────────────────────────────────────
   Deliberately a flow that is half-broken for voice: two nodes that cannot
   speak, so the validation has something to find. A demo where everything
   already works demonstrates nothing. */
type Speaks = "yes" | "half" | "no";

type Node = {
  id: string;
  n: number;
  name: string;
  kind: string;
  Icon: typeof TypeIcon;
  speaks: Speaks;
  /* the chat half, which already exists */
  says: string;
  /* the voice half — empty until somebody writes it, which is the point */
  voice?: {
    says: string;
    listens: string;
    onSilence: string;
    confirm: string;
  };
  fallback?: string;
};

const FLOW: Node[] = [
  {
    id: "start",
    n: 1,
    name: "Start",
    kind: "Flow",
    Icon: Zap,
    speaks: "yes",
    says: "—",
  },
  {
    id: "agent",
    n: 4,
    name: "AI Agent",
    kind: "AI Agents",
    Icon: Split,
    speaks: "half",
    says: "Hi welcome! I'm your travel buddy, how can I help you today?",
    voice: {
      says: "Hi — I'm your travel buddy. What are you planning?",
      listens: "Anything",
      onSilence: "Ask again, once",
      confirm: "Off",
    },
  },
  {
    id: "when",
    n: 5,
    name: "When are you going?",
    kind: "Date & Time",
    Icon: ListChecks,
    speaks: "half",
    says: "Pick your dates",
    voice: {
      says: "When are you travelling?",
      listens: "A date",
      onSilence: "Ask again, then hand to keyboard",
      confirm: "Read it back",
    },
  },
  {
    id: "photo",
    n: 6,
    name: "Passport photo",
    kind: "Media Upload",
    Icon: Upload,
    speaks: "no",
    says: "Upload a photo of your passport",
    fallback: "Hands to the screen for this step",
  },
  {
    id: "card",
    n: 7,
    name: "Trip options",
    kind: "Card",
    Icon: ImageIcon,
    speaks: "no",
    says: "Three cards with prices",
    fallback: "Shown on screen; the voice summarises two of them",
  },
  {
    id: "end",
    n: 3,
    name: "End",
    kind: "Flow",
    Icon: Flag,
    speaks: "yes",
    says: "Thanks — we'll email you.",
  },
];

/* Only appear once voice is on. A palette that always shows Spell and Confirm
   is a palette with two entries nobody in a chat-only flow can use. */
const VOICE_GAMBITS = [
  { name: "Confirm", Icon: Repeat, note: "Read back and wait for a yes" },
  { name: "Spell", Icon: SpellCheck, note: "Letter by letter, with read-back" },
  { name: "Hand to keyboard", Icon: Keyboard, note: "One field, typed instead" },
];

const PALETTE = [
  { group: "AI Agents", items: [{ name: "AI Agent", Icon: Split }] },
  {
    group: "Input Types",
    items: [
      { name: "Button", Icon: ListChecks },
      { name: "Card", Icon: ImageIcon, mute: true },
      { name: "Date & Time", Icon: ListChecks },
      { name: "Media Upload", Icon: Upload, mute: true },
      { name: "Text", Icon: TypeIcon },
    ],
  },
  {
    group: "Flow Control",
    items: [
      { name: "End", Icon: Flag },
      { name: "No Input", Icon: CircleHelp },
    ],
  },
];

const SPEAK_COPY: Record<Speaks, { label: string; tone: string; bg: string }> = {
  yes: { label: "Speaks", tone: GREEN, bg: "#F0FAF3" },
  half: { label: "Voice written", tone: ACCENT, bg: "#F6F1FC" },
  no: { label: "Cannot speak", tone: "#B45309", bg: "#FEF7EC" },
};

/* ── pieces ───────────────────────────────────────────────────────────── */

function Field({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="mb-3">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: FAINT }}>
        {label}
      </p>
      <div
        className="flex min-h-9 items-center rounded-lg border px-3 py-2 text-[13px]"
        style={{ borderColor: LINE, color: value ? INK : FAINT }}
      >
        {value || "Not set"}
      </div>
      {hint && (
        <p className="mt-1 text-[11px] leading-snug" style={{ color: FAINT }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export default function VoiceBuilder() {
  const [voiceOn, setVoiceOn] = useState(true);
  const [selId, setSel] = useState("when");
  const [tab, setTab] = useState<"chat" | "voice">("voice");
  const sel = FLOW.find((n) => n.id === selId)!;

  const cannot = FLOW.filter((n) => n.speaks === "no");
  const unwritten = FLOW.filter((n) => n.speaks === "half" && !n.voice);

  return (
    <div className="flex h-screen flex-col bg-[#F4F4F6]" style={{ color: INK }}>
      {/* ── top bar ── */}
      <header
        className="flex h-14 shrink-0 items-center gap-3 border-b bg-white px-4"
        style={{ borderColor: LINE }}
      >
        <span className="text-[15px] font-bold">Mohima&rsquo;s agent</span>
        <span className="rounded-md bg-[#F2F2F5] px-2 py-0.5 text-[11px]" style={{ color: MUTED }}>
          6 gambits
        </span>

        {/* The one new control in the whole bar. Not a second flow, not a
            second agent — a mode this flow is in. */}
        <button
          onClick={() => setVoiceOn(!voiceOn)}
          className="ml-2 flex items-center gap-2 rounded-full border px-2.5 py-1.5 transition-colors"
          style={{
            borderColor: voiceOn ? "#D9CBEE" : LINE,
            background: voiceOn ? "#F8F4FF" : "white",
          }}
        >
          <span
            className="relative h-4 w-7 rounded-full transition-colors"
            style={{ background: voiceOn ? ACCENT : "#D7D7DE" }}
          >
            <span
              className="absolute top-0.5 size-3 rounded-full bg-white transition-all"
              style={{ left: voiceOn ? 14 : 2 }}
            />
          </span>
          <Mic className="size-3.5" strokeWidth={2} style={{ color: voiceOn ? ACCENT : FAINT }} />
          <span className="text-[12px] font-semibold" style={{ color: voiceOn ? "#5B2A8F" : MUTED }}>
            Voice
          </span>
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px]"
            style={{ borderColor: LINE, color: MUTED }}
          >
            <Check className="size-3.5" strokeWidth={2} />
            Validate
          </button>
          {/* Test changes shape with the mode. Testing a voice flow by typing
              at it proves nothing about the thing that is hard. */}
          <button
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px]"
            style={{ borderColor: LINE, color: MUTED }}
          >
            {voiceOn ? <Mic className="size-3.5" strokeWidth={2} /> : <Play className="size-3.5" strokeWidth={2} />}
            {voiceOn ? "Call it" : "Test"}
          </button>
          <button
            className="rounded-lg px-3.5 py-1.5 text-[13px] font-semibold text-white"
            style={{ background: ACCENT }}
          >
            Publish
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* ── palette ── */}
        <aside className="flex w-[228px] shrink-0 flex-col border-r bg-white" style={{ borderColor: LINE }}>
          <div className="flex items-center gap-2 border-b px-3 py-3" style={{ borderColor: LINE }}>
            <span className="flex-1 text-[14px] font-bold">Gambit Types</span>
            <Search className="size-4" strokeWidth={2} style={{ color: FAINT }} />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
            {voiceOn && (
              /* New here, not in a separate voice palette: a tenant looking
                 for "how do I confirm a date" looks where the gambits are. */
              <div className="mb-4">
                <p className="mb-1 flex items-center gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: ACCENT }}>
                  <Mic className="size-3" strokeWidth={2.5} />
                  Voice only
                </p>
                {VOICE_GAMBITS.map((g) => (
                  <div
                    key={g.name}
                    className="flex cursor-grab items-start gap-2.5 rounded-lg px-2 py-1.5 hover:bg-[#F8F4FF]"
                  >
                    <g.Icon className="mt-0.5 size-4 shrink-0" strokeWidth={2} style={{ color: ACCENT }} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px]">{g.name}</span>
                      <span className="block truncate text-[11px]" style={{ color: FAINT }}>
                        {g.note}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            )}

            {PALETTE.map((g) => (
              <div key={g.group} className="mb-3">
                <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: FAINT }}>
                  {g.group}
                </p>
                {g.items.map((it) => {
                  /* Dimmed, never hidden. A palette that shrinks when voice is
                     on would leave a tenant hunting for a gambit that was there
                     a minute ago — and Card is still usable, it just will not
                     be heard. */
                  const muted = voiceOn && "mute" in it && it.mute;
                  return (
                    <div
                      key={it.name}
                      className="flex cursor-grab items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-[#F7F7F9]"
                      title={muted ? "Renders on screen. Nothing is spoken." : undefined}
                    >
                      <it.Icon
                        className="size-4 shrink-0"
                        strokeWidth={2}
                        style={{ color: muted ? "#C9CCD3" : "#8A8F9C" }}
                      />
                      <span className="min-w-0 flex-1 truncate text-[13px]" style={{ color: muted ? "#A9AEB9" : INK }}>
                        {it.name}
                      </span>
                      {muted && <Volume2 className="size-3 shrink-0" strokeWidth={2} style={{ color: "#C9CCD3" }} />}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        {/* ── canvas ── */}
        <div className="relative flex min-w-0 flex-1 flex-col overflow-y-auto">
          {voiceOn && (cannot.length > 0 || unwritten.length > 0) && (
            /* The strip that makes voice real rather than a setting. A flow is
               not voice-ready because somebody flipped a switch — it is ready
               when every node in it can be heard. */
            <div
              className="sticky top-0 z-10 flex items-center gap-3 border-b px-5 py-2.5"
              style={{ borderColor: "#F0E3CC", background: "#FEFAF2" }}
            >
              <AlertTriangle className="size-4 shrink-0" strokeWidth={2} style={{ color: "#B45309" }} />
              <span className="min-w-0 flex-1 text-[13px]" style={{ color: "#8A5A18" }}>
                {cannot.length} {cannot.length === 1 ? "gambit" : "gambits"} in this
                flow cannot speak
                {unwritten.length > 0 && `, and ${unwritten.length} has no voice written yet`}.
                Callers will hit silence unless each one says what happens instead.
              </span>
              <button className="shrink-0 text-[13px] font-semibold" style={{ color: "#8A5A18" }}>
                Review {cannot.length + unwritten.length}
              </button>
            </div>
          )}

          <div className="flex flex-1 flex-col items-center gap-3 p-8">
            {FLOW.map((node, i) => {
              const on = selId === node.id;
              const c = SPEAK_COPY[node.speaks];
              const terminal = node.id === "start" || node.id === "end";
              return (
                <div key={node.id} className="flex flex-col items-center gap-3">
                  <button
                    onClick={() => setSel(node.id)}
                    className="w-[300px] rounded-2xl border bg-white px-4 py-3 text-left transition-all"
                    style={{
                      borderColor: on ? ACCENT : LINE,
                      boxShadow: on ? `0 0 0 3px ${ACCENT}1A` : "0 1px 2px rgba(15,17,26,0.05)",
                      background: terminal ? "#FAFAFB" : "white",
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <node.Icon className="size-4 shrink-0" strokeWidth={2} style={{ color: FAINT }} />
                      <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">
                        {node.name}
                      </span>
                      <span className="shrink-0 text-[11px] tabular-nums" style={{ color: FAINT }}>
                        #{node.n}
                      </span>
                    </span>
                    <span className="mt-1.5 block truncate text-[12px]" style={{ color: MUTED }}>
                      {node.says}
                    </span>
                    {voiceOn && !terminal && (
                      /* The badge belongs on the node rather than in a panel:
                         the question "will this be heard" is asked while
                         looking at the flow, not while editing one step. */
                      <span className="mt-2 flex items-center gap-1.5">
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ color: c.tone, background: c.bg }}
                        >
                          {c.label}
                        </span>
                        {node.fallback && (
                          <span className="min-w-0 flex-1 truncate text-[10px]" style={{ color: FAINT }}>
                            {node.fallback}
                          </span>
                        )}
                      </span>
                    )}
                  </button>
                  {i < FLOW.length - 1 && (
                    <span className="h-5 w-px" style={{ background: "#D8D8DE" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── config ── */}
        <aside className="flex w-[340px] shrink-0 flex-col border-l bg-white" style={{ borderColor: LINE }}>
          <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: LINE }}>
            <sel.Icon className="size-4 shrink-0" strokeWidth={2} style={{ color: ACCENT }} />
            <span className="min-w-0 flex-1 truncate text-[14px] font-semibold">{sel.name}</span>
            <span className="shrink-0 text-[11px]" style={{ color: FAINT }}>
              {sel.kind}
            </span>
            <X className="size-4 shrink-0" strokeWidth={2} style={{ color: FAINT }} />
          </div>

          {/* Two tabs, not two panels. The same gambit, said twice — and a tab
              rather than a section because you are never writing both at once. */}
          {voiceOn && (
            <div className="flex border-b" style={{ borderColor: LINE }}>
              {(
                [
                  ["chat", "On screen", TypeIcon],
                  ["voice", "Out loud", Volume2],
                ] as const
              ).map(([k, label, Icon]) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className="relative flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[13px] transition-colors"
                  style={{ color: tab === k ? "#5B2A8F" : MUTED, fontWeight: tab === k ? 600 : 400 }}
                >
                  <Icon className="size-3.5" strokeWidth={2} />
                  {label}
                  {tab === k && (
                    <span className="absolute inset-x-6 bottom-0 h-[2px] rounded-full" style={{ background: ACCENT }} />
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {(!voiceOn || tab === "chat") && (
              <>
                <Field label="Message" value={sel.says} />
                <button className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: ACCENT }}>
                  <Plus className="size-3.5" strokeWidth={2.5} />
                  Add message
                </button>
              </>
            )}

            {voiceOn && tab === "voice" && (
              <>
                {sel.speaks === "no" ? (
                  /* Not an empty form. A gambit that cannot speak has one
                     decision attached to it, and the panel should ask that
                     rather than offer four fields it will ignore. */
                  <div className="rounded-xl p-4" style={{ background: "#FEFAF2" }}>
                    <p className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: "#8A5A18" }}>
                      <AlertTriangle className="size-4 shrink-0" strokeWidth={2} />
                      This cannot be spoken
                    </p>
                    <p className="mt-1.5 text-[12px] leading-snug" style={{ color: "#8A5A18" }}>
                      {sel.kind === "Media Upload"
                        ? "Nobody can upload a file by talking."
                        : "A picture has no spoken form."}{" "}
                      Choose what happens when somebody reaches this step with
                      their eyes elsewhere.
                    </p>
                    <div className="mt-3 flex flex-col gap-1.5">
                      {[
                        "Hand to the screen and say so",
                        "Describe it out loud and carry on",
                        "Skip this step on voice",
                      ].map((o, i) => (
                        <button
                          key={o}
                          className="flex items-center gap-2.5 rounded-lg border bg-white px-3 py-2 text-left text-[12px]"
                          style={{ borderColor: i === 0 ? "#D9CBEE" : LINE, color: INK }}
                        >
                          <span
                            className="grid size-3.5 shrink-0 place-items-center rounded-full border"
                            style={{
                              borderColor: i === 0 ? ACCENT : "#C9C9D2",
                              borderWidth: i === 0 ? 4.5 : 1.5,
                            }}
                          />
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : sel.voice ? (
                  <>
                    <Field
                      label="Says"
                      value={sel.voice.says}
                      hint="About half the length of the written message. No bullets, no links."
                    />
                    <Field
                      label="Listens for"
                      value={sel.voice.listens}
                      hint="Narrowing this is what makes a mishearing recoverable."
                    />
                    <Field label="If nothing heard" value={sel.voice.onSilence} />
                    <Field
                      label="Confirms"
                      value={sel.voice.confirm}
                      hint="Read back anything the flow will act on."
                    />
                    <button
                      className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg border py-2 text-[13px] font-medium"
                      style={{ borderColor: LINE, color: ACCENT }}
                    >
                      <Volume2 className="size-3.5" strokeWidth={2} />
                      Hear this step
                    </button>
                  </>
                ) : (
                  /* Unwritten is a state, not a blank form: offering to draft
                     it from the written message is the only reason a tenant
                     would fill this in for forty gambits. */
                  <div className="rounded-xl border border-dashed p-4 text-center" style={{ borderColor: "#D9CBEE" }}>
                    <p className="text-[13px] font-semibold">Nothing written for voice</p>
                    <p className="mt-1 text-[12px] leading-snug" style={{ color: MUTED }}>
                      It would read the written message aloud, bullets and all.
                    </p>
                    <button
                      className="mt-3 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-white"
                      style={{ background: ACCENT }}
                    >
                      Draft it from the message
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {voiceOn && (
            <div className="border-t px-4 py-3" style={{ borderColor: LINE }}>
              <button className="flex w-full items-center gap-2 text-left">
                <Mic className="size-4 shrink-0" strokeWidth={2} style={{ color: FAINT }} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px]">Voice settings</span>
                  <span className="block text-[11px]" style={{ color: FAINT }}>
                    Voice, pace, interruption, silence
                  </span>
                </span>
                <ChevronDown className="size-4 shrink-0 -rotate-90" strokeWidth={2} style={{ color: FAINT }} />
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
