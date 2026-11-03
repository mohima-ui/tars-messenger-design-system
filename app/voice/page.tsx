"use client";

/* ── VOICE AGENT — the concept ────────────────────────────────────────────
   Voice inside the widget: the visitor talks instead of typing.

   Phone is out of scope for now, which changes the problem rather than
   shrinking it. On a call, voice is the only channel and the agent has the
   caller's full attention by default. In a widget it is competing with a text
   field two inches away that already works — so the first question is not how
   to build it, it is why anybody would press the button.

   The temptation is still to treat voice as chat with a microphone on it. It
   is not: speech arrives in one pass, cannot be skimmed, and takes as long to
   hear as it took to say. A four-second pause looks like thinking on screen
   and sounds like a fault out loud, even when the screen is right there.

   So this page is built around three things: why anyone would speak, the
   states it has to be in, and whose turn it is. ────────────────────────── */

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CircleHelp,
  Flag,
  Image,
  Keyboard,
  Languages,
  ListChecks,
  MapPin,
  MessageSquareQuote,
  Repeat,
  SpellCheck,
  Split,
  Star,
  Type,
  Upload,
  ArrowRight,
  Check,
  Ear,
  Mic,
  MicOff,
  Radio,
  Timer,
  Volume2,
  X,
} from "lucide-react";

const ACCENT = "#6D33AA";
const INK = "#16181D";
const MUTED = "#6B7280";
const FAINT = "#9CA3AF";
const LINE = "#ECECEF";

/* ── the states ───────────────────────────────────────────────────────────
   Chat has three: idle, thinking, replying. Voice has nine, and six of them
   exist only because the other party cannot see anything.

   `hold` is how long the state may last before it needs a sound of its own.
   Silence is the whole problem: a caller reads two seconds of nothing as a
   dropped line, where a reader would not have noticed. */
type VState =
  | "idle"
  | "listening"
  | "heard"
  | "thinking"
  | "speaking"
  | "interrupted"
  | "unclear"
  | "silent"
  | "ended";

const STATES: {
  id: VState;
  label: string;
  says: string;
  hold: string;
  note: string;
}[] = [
  {
    id: "idle",
    label: "Ready",
    says: "—",
    hold: "—",
    note: "Nothing is being recorded, and that has to be visibly true rather than merely true \u2014 a mic that might be listening is one people close the tab over.",
  },
  {
    id: "listening",
    label: "Listening",
    says: "—",
    hold: "until they stop",
    note: "The one state that must never be faked. If the meter moves when the mic is off, nothing else on screen is believable.",
  },
  {
    id: "heard",
    label: "Heard you",
    says: "—",
    hold: "200ms",
    note: "The moment it decides the turn is over. Getting this wrong is the single most common way a voice agent feels rude.",
  },
  {
    id: "thinking",
    label: "Working",
    says: "a held tone, or “one moment”",
    hold: "1s before it must make a sound",
    note: "The screen can show a spinner, but the ear has nothing. Past about a second the silence needs filling out loud, or it reads as a fault even with the panel in view.",
  },
  {
    id: "speaking",
    label: "Speaking",
    says: "the answer",
    hold: "—",
    note: "Interruptible from the first syllable. An agent you cannot talk over is one people hang up on.",
  },
  {
    id: "interrupted",
    label: "Stopped",
    says: "— (stops mid-word)",
    hold: "immediate",
    note: "Stops inside 150ms and keeps what it had said, so it can carry on rather than start the sentence again.",
  },
  {
    id: "unclear",
    label: "Didn’t catch that",
    says: "“Sorry — say that again?”",
    hold: "once, then rephrase",
    note: "Never twice in the same words. The second ask has to be easier than the first: a yes/no, or an offer to spell it.",
  },
  {
    id: "silent",
    label: "Nobody there",
    says: "“Still with me?”",
    hold: "6s, then 12s, then end",
    note: "Two prompts and a graceful end. A line that hangs open is worse than one that closes.",
  },
  {
    id: "ended",
    label: "Ended",
    says: "a summary, and what happens next",
    hold: "—",
    note: "The transcript stays on screen, which is the one thing the widget has that a call does not \u2014 so the spoken close can be short and the detail can be left written.",
  },
];

/* ── why speak at all ─────────────────────────────────────────────────────
   With a keyboard in reach, voice has to be better at something rather than
   merely possible. These are the four cases where it is — and the honest list
   of where it is not, because building for those is how a mic button ends up
   unpressed. */
const WHY = [
  {
    id: "hands",
    label: "Hands or eyes are busy",
    Icon: Mic,
    body: "Cooking, driving, holding a child, mid-task on a shop floor. The strongest case and the one nobody designs for, because it never happens at a desk.",
  },
  {
    id: "phone",
    label: "On a phone, one-handed",
    Icon: Radio,
    body: "A thumb keyboard makes a long question expensive. Speaking a paragraph costs nothing; typing it costs a minute and most people give up and ask something shorter.",
  },
  {
    id: "long",
    label: "The question is long",
    Icon: Volume2,
    body: "“I bought this in March, it stopped working last week, and the shop says…” — nobody types that. They type “refund?” and the agent answers the wrong question well.",
  },
  {
    id: "access",
    label: "Typing is hard",
    Icon: Ear,
    body: "Motor impairment, dyslexia, an unfamiliar keyboard layout. Not an edge case — and the one reason that alone would justify the feature.",
  },
];

const WHY_NOT = [
  "At a desk, on a laptop, in an office where speaking out loud is awkward",
  "Anything with a number, a code or an email address in it",
  "A quick yes/no where pressing a suggestion is already faster",
  "Anywhere the answer is a list — spoken lists are unusable past three items",
];

/* ── what stays the same, and what cannot ─────────────────────────────────
   One agent, two ways of answering. Shared where it is the same decision,
   split where it genuinely is not. The test for each row: would a tenant be
   surprised if changing it in one place changed the other? */
const MODEL = [
  { thing: "Knowledge", shared: true, why: "The same answers. Nobody wants two copies drifting apart." },
  { thing: "Outcomes", shared: true, why: "A booked demo is a booked demo, whichever way it was asked for." },
  { thing: "Tools and actions", shared: true, why: "Same integrations, same permissions." },
  { thing: "Personality", shared: true, why: "One agent. It should not be warmer in writing than out loud." },
  { thing: "Answer length", shared: false, why: "Three sentences reads fine and listens badly. Spoken answers need to be about half as long." },
  { thing: "Formatting", shared: false, why: "Bullets, links and tables do not exist out loud. The same answer has to be re-written, not stripped." },
  { thing: "Suggestions", shared: false, why: "Four chips are scannable. Four options read aloud are a memory test — spoken, it offers two." },
  { thing: "Citations", shared: false, why: "A link is a link on screen and an unreadable string in speech. Spoken, it says where the answer came from and leaves the link on screen." },
];

/* ── the hard parts ─────────────────────────────────────────────────────── */
const HARD = [
  {
    title: "Knowing when they have finished",
    Icon: Ear,
    body: "Silence is not the end of a turn — people pause to think, and “my order number is…” has a gap in the middle of it. Time-based detection cuts people off; waiting for a complete thought adds delay to every turn. The usual answer is both: a short window that stretches when the sentence is obviously unfinished.",
    decide: "Do we cut in at 700ms, or wait for a complete thought and accept the lag?",
  },
  {
    title: "Talking over it",
    Icon: Radio,
    body: "Barge-in is not a feature, it is the difference between a conversation and a recording. It also means the agent has to know what it had already said when it was stopped, or it repeats itself and sounds deaf.",
    decide: "Does an interruption discard the rest of the answer, or hold it in case they ask again?",
  },
  {
    title: "Dead air",
    Icon: Timer,
    body: "A tool call that takes two seconds is invisible in chat and alarming out loud. The widget can show a spinner, but somebody who pressed the mic is probably not looking at the screen — which is the whole reason they pressed it.",
    decide: "What fills a pause, and does it change when we can tell they are looking?",
  },
  {
    title: "Two outputs, one answer",
    Icon: Volume2,
    body: "Everything said has to appear on screen too, and the two are not the same text. Spoken is half the length and has no bullets; written keeps the links, the list and the citation. Generating one and degrading it gives you a bad version of both.",
    decide: "Does the model write both, or do we write one and transform it?",
  },
  {
    title: "Numbers, names and spelling",
    Icon: Mic,
    body: "Email addresses and reference numbers are the least reliable thing in speech and among the most asked for. With a screen in reach the answer is easy and worth taking: hear the question out loud, then hand the keyboard back for the value.",
    decide: "Does it switch to typing automatically for these, or ask first?",
  },
  {
    title: "Permission, and being believed",
    Icon: MicOff,
    body: "The browser asks once; the visitor's trust is asked for continuously. A visible, honest listening state is the whole of it — a level meter that moves when nothing is being heard is the fastest way to lose the feature.",
    decide: "Does the mic stay open between turns, or close after each one?",
  },
];

/* ── what it means for the builder ───────────────────────────────────────
   The canvas does not change. A flow is a flow — start, ask, branch, end —
   and a tenant who has built one should not have to learn a second tool to
   make it speak.

   What changes is that every gambit grows a second half. A Text gambit in
   chat has a message and a field; spoken it also has what it says, how long
   it waits, what it does when it hears nothing, and whether it reads the
   answer back before moving on. Those are four properties, not four new node
   types — and building them as new node types is how you end up with two
   flows that drift apart.

   Three gambits genuinely do not exist in chat, and three cannot be done by
   voice at all. Both lists are short, which is the point. */
type Fit = "same" | "half" | "no";

const GAMBITS: {
  name: string;
  Icon: typeof Type;
  fit: Fit;
  note: string;
}[] = [
  { name: "Text", Icon: Type, fit: "half", note: "Becomes speech. Needs a silence window and a read-back for anything it cannot guess at." },
  { name: "Button", Icon: ListChecks, fit: "half", note: "Read aloud, matched by meaning rather than by exact words. Two options spoken, all of them on screen." },
  { name: "Auto Suggestion", Icon: MessageSquareQuote, fit: "half", note: "Same problem as Button, worse: a spoken list past three items is a memory test." },
  { name: "Star Rating", Icon: Star, fit: "half", note: "“Out of five” works out loud. Needs to accept “four”, “four stars” and “pretty good”." },
  { name: "Date & Time", Icon: CalendarClock, fit: "half", note: "“Next Tuesday at three” is easy to say and easy to mishear. Always confirmed before it moves on." },
  { name: "Language", Icon: Languages, fit: "half", note: "Bigger than in chat: a language is a recogniser and a voice, not just a string table." },
  { name: "No Input", Icon: CircleHelp, fit: "half", note: "Rare in chat, constant in voice. Silence, noise and “sorry, what?” all land here." },
  { name: "End", Icon: Flag, fit: "same", note: "Says its close rather than printing it. Everything else is the same." },
  { name: "AI Agent", Icon: Split, fit: "same", note: "Same reasoning, same tools. It writes two answers instead of one." },
  { name: "Card", Icon: Image, fit: "no", note: "A picture has no spoken form. It renders on screen and the voice says what it is." },
  { name: "Media Upload", Icon: Upload, fit: "no", note: "Nobody can upload a file by talking. Hands over to the screen for this step." },
  { name: "Geo Location", Icon: MapPin, fit: "no", note: "A browser permission, not an utterance. Falls back to asking for a postcode." },
];

const FIT_COPY: Record<Fit, { label: string; tone: string; bg: string }> = {
  same: { label: "Works as-is", tone: "#15803D", bg: "#F0FAF3" },
  half: { label: "Needs a voice half", tone: "#B45309", bg: "#FEF7EC" },
  no: { label: "Not possible by voice", tone: "#B91C1C", bg: "#FEF2F2" },
};

/* The three that have no chat equivalent, because nothing in chat needs
   them: the text is on the screen and the visitor can see it was understood. */
const NEW_GAMBITS = [
  {
    name: "Confirm",
    Icon: Repeat,
    body: "Reads back what it heard and waits for a yes. The single most important voice gambit and the one with no chat counterpart — in writing the visitor can see they were understood.",
    when: "After anything the flow will act on: a date, an amount, a name.",
  },
  {
    name: "Spell",
    Icon: SpellCheck,
    body: "Captures letter by letter with a phonetic read-back. Email addresses are the least reliable thing in speech and among the most asked for.",
    when: "Emails, reference numbers, postcodes, anything alphanumeric.",
  },
  {
    name: "Hand to keyboard",
    Icon: Keyboard,
    body: "Ends the spoken turn for one field and puts the focus in the composer. The widget's advantage over a phone call, and the honest answer to everything voice is bad at.",
    when: "Instead of Spell, wherever a screen is in reach.",
  },
];

/* Settings that belong to the agent rather than to any one gambit — the voice
   equivalent of picking an accent and a tone, plus the two numbers that
   decide whether it feels rude. */
const AGENT_SETTINGS = [
  { name: "Voice", value: "One per language, previewed in the panel" },
  { name: "Pace", value: "Slower / normal / faster" },
  { name: "Interruptible", value: "On. Off is a recording, not a conversation" },
  { name: "End of turn", value: "700ms of silence, stretched on an unfinished sentence" },
  { name: "If nothing heard", value: "Prompt at 6s, again at 12s, then hand over" },
  { name: "Retries", value: "Two, and the second ask is easier than the first" },
];

/* ── open questions ─────────────────────────────────────────────────────── */
const OPEN = [
  "Is voice a mode the visitor switches into, or a mic on the composer they use for one message and drop?",
  "Does the agent speak its answers by default once voice has been used, or only when asked to?",
  "Do tenants get a voice, or a choice of voices? A picker of forty is a decision nobody can make well.",
  "Does the transcript of a spoken conversation land in the same inbox as a typed one, and is it marked?",
  "Which languages, and does it follow the visitor's browser or the agent's setting?",
  "Does a flow declare itself voice-capable, or does every flow get a voice half whether or not anyone will hear it?",
];

/* ── a live state, because a list of nine names is not a design ─────────── */
function Orb({ state }: { state: VState }) {
  const lively = state === "listening" || state === "speaking";
  const [level, setLevel] = useState(0.4);
  useEffect(() => {
    if (!lively) return;
    /* A meter that moves on a timer is a lie in the product and fine in a
       concept — but only because nothing here claims to be hearing you. The
       resting value comes back with the cleanup rather than on the way in, so
       the state is never set during the effect body. */
    const id = setInterval(() => setLevel(0.35 + Math.random() * 0.65), 140);
    return () => {
      clearInterval(id);
      setLevel(0.4);
    };
  }, [lively]);

  const tone =
    state === "ended" || state === "idle"
      ? "#C4C8D1"
      : state === "unclear" || state === "silent"
        ? "#E8A33D"
        : ACCENT;

  return (
    <div className="relative grid size-[120px] shrink-0 place-items-center">
      {lively && (
        <span
          className="absolute rounded-full transition-all duration-150"
          style={{
            width: 120 * level,
            height: 120 * level,
            background: tone,
            opacity: 0.14,
          }}
        />
      )}
      <span
        className="absolute rounded-full transition-all duration-300"
        style={{
          width: state === "thinking" ? 76 : 88,
          height: state === "thinking" ? 76 : 88,
          background: tone,
          opacity: 0.1,
          animation: state === "thinking" ? "vpulse 1200ms ease-in-out infinite" : undefined,
        }}
      />
      <span
        className="grid size-14 place-items-center rounded-full text-white transition-all duration-300"
        style={{ background: tone }}
      >
        {state === "idle" && <Mic className="size-6" strokeWidth={2} />}
        {state === "listening" && <Mic className="size-6" strokeWidth={2} />}
        {state === "heard" && <Check className="size-6" strokeWidth={2.5} />}
        {state === "thinking" && <Timer className="size-6" strokeWidth={2} />}
        {state === "speaking" && <Volume2 className="size-6" strokeWidth={2} />}
        {state === "interrupted" && <X className="size-6" strokeWidth={2.5} />}
        {state === "unclear" && <Ear className="size-6" strokeWidth={2} />}
        {state === "silent" && <AlertTriangle className="size-6" strokeWidth={2} />}
        {state === "ended" && <Check className="size-6" strokeWidth={2.5} />}
      </span>
      <style>{`@keyframes vpulse{0%,100%{transform:scale(1);opacity:.10}50%{transform:scale(1.18);opacity:.04}}`}</style>
    </div>
  );
}

function Section({
  n,
  title,
  lead,
  children,
}: {
  n: string;
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-14">
      <div className="mb-5 flex items-baseline gap-3">
        <span className="text-[12px] font-bold tabular-nums" style={{ color: ACCENT }}>
          {n}
        </span>
        <div className="min-w-0">
          <h2 className="text-[20px] font-bold tracking-tight" style={{ color: INK }}>
            {title}
          </h2>
          {lead && (
            <p className="mt-1.5 max-w-[680px] text-[14px] leading-relaxed" style={{ color: MUTED }}>
              {lead}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function VoiceConcept() {
  const [state, setState] = useState<VState>("listening");
  const cur = STATES.find((s) => s.id === state)!;

  return (
    <main className="min-h-screen bg-[#F7F7F9]">
      <div className="mx-auto max-w-[920px] px-8 py-12">
        <header className="mb-12">
          <p className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: ACCENT }}>
            Concept
          </p>
          <h1 className="mt-2 text-[34px] font-bold tracking-tight" style={{ color: INK }}>
            The voice agent
          </h1>
          <p className="mt-3 max-w-[660px] text-[15px] leading-relaxed" style={{ color: MUTED }}>
            Voice inside the widget: the visitor talks instead of typing.
            Phone is out of scope for now, which changes the problem rather
            than shrinking it — on a call voice is the only channel, and here
            it is competing with a text field that already works.
          </p>
        </header>

        {/* ── 1 ── */}
        <Section
          n="01"
          title="Why would anyone press it?"
          lead="With a text field two inches away that already works, voice has to be better at something rather than merely possible. These are the four cases where it is — and if the design does not serve them, the button goes unpressed however good it sounds."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {WHY.map((w) => (
              <div key={w.id} className="rounded-2xl border bg-white p-5" style={{ borderColor: LINE }}>
                <p className="flex items-center gap-2 text-[14px] font-semibold" style={{ color: INK }}>
                  <w.Icon className="size-4 shrink-0" strokeWidth={2} style={{ color: ACCENT }} />
                  {w.label}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed" style={{ color: MUTED }}>
                  {w.body}
                </p>
              </div>
            ))}
          </div>

          {/* The other half of the answer. A feature that does not say where
              it is the wrong choice gets built for the wrong cases. */}
          <div className="mt-4 rounded-2xl border p-5" style={{ borderColor: LINE, background: "#FBFBFC" }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: FAINT }}>
              Where typing wins, and the design should say so
            </p>
            <ul className="mt-2.5 grid gap-1.5 sm:grid-cols-2">
              {WHY_NOT.map((x) => (
                <li key={x} className="flex gap-2 text-[13px] leading-snug" style={{ color: MUTED }}>
                  <X className="mt-0.5 size-3.5 shrink-0" strokeWidth={2.5} style={{ color: "#D1D5DB" }} />
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* ── 2 ── */}
        <Section
          n="02"
          title="Nine states, and six exist because nobody is looking"
          lead="Chat has three: idle, thinking, replying. The other six are the cost of somebody who pressed the mic and then looked away — which is the whole reason they pressed it."
        >
          <div className="rounded-2xl border bg-white p-5" style={{ borderColor: LINE }}>
            <div className="flex flex-wrap items-center gap-8">
              <Orb state={state} />
              <div className="min-w-[280px] flex-1">
                <p className="text-[18px] font-bold" style={{ color: INK }}>
                  {cur.label}
                </p>
                <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: MUTED }}>
                  {cur.note}
                </p>
                <div className="mt-3.5 flex flex-wrap gap-x-6 gap-y-1.5 text-[12px]">
                  <span style={{ color: FAINT }}>
                    Says <span style={{ color: INK }}>{cur.says}</span>
                  </span>
                  <span style={{ color: FAINT }}>
                    Holds for <span style={{ color: INK }}>{cur.hold}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-1.5 border-t pt-4" style={{ borderColor: LINE }}>
              {STATES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setState(s.id)}
                  className={`rounded-lg px-3 py-1.5 text-[12px] transition-colors ${
                    state === s.id ? "bg-[#F4F1FB] font-semibold text-[#5B2A8F]" : "text-[#6B7280] hover:bg-[#F7F7F9]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* ── 3 ── */}
        <Section
          n="03"
          title="One agent, two ways of answering"
          lead="Shared where it is the same decision, split where it genuinely is not. The test for each row: would a tenant be surprised if changing it in one place changed the other?"
        >
          <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: LINE }}>
            {MODEL.map((m, i) => (
              <div
                key={m.thing}
                className="flex items-start gap-4 px-5 py-3.5"
                style={{ borderTop: i ? `1px solid ${LINE}` : undefined }}
              >
                <span className="w-[130px] shrink-0 text-[13px] font-medium" style={{ color: INK }}>
                  {m.thing}
                </span>
                <span
                  className="w-[64px] shrink-0 rounded-full px-2 py-0.5 text-center text-[11px] font-semibold"
                  style={{
                    color: m.shared ? "#15803D" : "#B45309",
                    background: m.shared ? "#F0FAF3" : "#FEF7EC",
                  }}
                >
                  {m.shared ? "Shared" : "Split"}
                </span>
                <span className="min-w-0 flex-1 text-[13px] leading-snug" style={{ color: MUTED }}>
                  {m.why}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 4 ── */}
        <Section
          n="04"
          title="The six hard parts"
          lead="None of these is a visual problem, which is why they have to be settled before anything is drawn. Each ends in a decision somebody has to make."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {HARD.map((h) => (
              <div key={h.title} className="rounded-2xl border bg-white p-5" style={{ borderColor: LINE }}>
                <p className="flex items-center gap-2 text-[14px] font-semibold" style={{ color: INK }}>
                  <h.Icon className="size-4 shrink-0" strokeWidth={2} style={{ color: ACCENT }} />
                  {h.title}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed" style={{ color: MUTED }}>
                  {h.body}
                </p>
                <p
                  className="mt-3 flex gap-2 rounded-lg px-3 py-2 text-[12px] leading-snug"
                  style={{ background: "#FBFAFE", color: "#5B2A8F" }}
                >
                  <ArrowRight className="mt-0.5 size-3.5 shrink-0" strokeWidth={2.5} />
                  {h.decide}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 5 ── */}
        <Section
          n="05"
          title="What it means for the builder"
          lead="The canvas does not change. A flow is a flow — start, ask, branch, end — and a tenant who has built one should not have to learn a second tool to make it speak. What changes is that every gambit grows a second half."
        >
          <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: LINE }}>
            {GAMBITS.map((g, i) => {
              const c = FIT_COPY[g.fit];
              return (
                <div
                  key={g.name}
                  className="flex items-start gap-4 px-5 py-3"
                  style={{ borderTop: i ? `1px solid ${LINE}` : undefined }}
                >
                  <g.Icon className="mt-0.5 size-4 shrink-0" strokeWidth={2} style={{ color: FAINT }} />
                  <span className="w-[120px] shrink-0 text-[13px] font-medium" style={{ color: INK }}>
                    {g.name}
                  </span>
                  <span
                    className="w-[152px] shrink-0 rounded-full px-2 py-0.5 text-center text-[11px] font-semibold"
                    style={{ color: c.tone, background: c.bg }}
                  >
                    {c.label}
                  </span>
                  <span className="min-w-0 flex-1 text-[13px] leading-snug" style={{ color: MUTED }}>
                    {g.note}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="mt-5 max-w-[680px] text-[14px] leading-relaxed" style={{ color: MUTED }}>
            The voice half is four properties on the gambit you already have —
            what it says, how long it listens, what it does on silence, and
            whether it reads the answer back. Four properties, not four node
            types: built as new nodes, you end up maintaining two flows that
            drift apart.
          </p>

          <div className="mt-4 rounded-2xl border p-5" style={{ borderColor: LINE, background: "#FBFBFC" }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: FAINT }}>
              The voice tab, on every gambit
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                ["Says", "What it speaks. Half the length of the written message, no bullets."],
                ["Listens for", "Free speech, one of the options, a date, a number, or spelled letters."],
                ["If nothing heard", "Re-ask, skip, or hand to the keyboard."],
                ["Confirms", "Off, or a read-back before it moves on."],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border bg-white p-3.5" style={{ borderColor: LINE }}>
                  <p className="text-[12px] font-semibold" style={{ color: INK }}>
                    {k}
                  </p>
                  <p className="mt-1 text-[12px] leading-snug" style={{ color: MUTED }}>
                    {v}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <p className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-wider" style={{ color: FAINT }}>
            Three gambits that have no chat equivalent
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {NEW_GAMBITS.map((g) => (
              <div key={g.name} className="rounded-2xl border bg-white p-5" style={{ borderColor: LINE }}>
                <p className="flex items-center gap-2 text-[14px] font-semibold" style={{ color: INK }}>
                  <g.Icon className="size-4 shrink-0" strokeWidth={2} style={{ color: ACCENT }} />
                  {g.name}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed" style={{ color: MUTED }}>
                  {g.body}
                </p>
                <p className="mt-2.5 text-[12px] leading-snug" style={{ color: FAINT }}>
                  {g.when}
                </p>
              </div>
            ))}
          </div>

          <p className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-wider" style={{ color: FAINT }}>
            And six settings that belong to the agent, not to any one gambit
          </p>
          <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: LINE }}>
            {AGENT_SETTINGS.map((a, i) => (
              <div
                key={a.name}
                className="flex items-baseline gap-4 px-5 py-3"
                style={{ borderTop: i ? `1px solid ${LINE}` : undefined }}
              >
                <span className="w-[130px] shrink-0 text-[13px] font-medium" style={{ color: INK }}>
                  {a.name}
                </span>
                <span className="min-w-0 flex-1 text-[13px] leading-snug" style={{ color: MUTED }}>
                  {a.value}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 6 ── */}
        <Section
          n="06"
          title="Still open"
          lead="Questions I cannot answer from here, and each one changes what gets built."
        >
          <div className="rounded-2xl border bg-white p-5" style={{ borderColor: LINE }}>
            <ol className="flex flex-col gap-3">
              {OPEN.map((q, i) => (
                <li key={q} className="flex gap-3 text-[14px] leading-relaxed" style={{ color: INK }}>
                  <span className="shrink-0 text-[12px] font-bold tabular-nums" style={{ color: FAINT }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {q}
                </li>
              ))}
            </ol>
          </div>
        </Section>

        <p className="border-t pt-6 text-[13px] leading-relaxed" style={{ borderColor: LINE, color: MUTED }}>
          The one I would settle first is question 1, because it decides
          whether this is a feature or a mode. A mic on the composer is a
          week&rsquo;s work and helps the person with a long question; a voice
          mode the visitor enters is a second product with its own states,
          its own errors and its own reasons to be abandoned — and it is the
          only one of the two that serves somebody who cannot type at all.
        </p>
      </div>
    </main>
  );
}
