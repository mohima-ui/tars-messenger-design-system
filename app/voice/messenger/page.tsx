"use client";

/* ── VOICE IN THE MESSENGER ───────────────────────────────────────────────
   The front half: what a visitor sees and hears when they press the mic.

   One decision sits underneath everything here — voice replaces the composer,
   not the window. The thread stays on screen, every spoken turn lands in it
   as an ordinary message, and the bar at the bottom is where the current turn
   is staged before it settles. That is the whole advantage this widget has
   over a phone call, and a full-screen "call mode" throws it away: it hides
   the transcript exactly when a caller most needs something to look at.

   Everything else follows from having a screen:
     · captions are not an accessibility afterthought, they are the record
     · a misheard word is repairable by tapping it, not by saying it again
     · a gambit that cannot speak still renders, and the voice summarises it
     · the keyboard is always one tap away, and taking it does not hang up

   The controls on the left force the three states a happy-path demo never
   reaches — an interruption, a mumble, and a silence — because those are the
   states the design actually has to survive. ─────────────────────────────── */

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Captions,
  Check,
  Ear,
  Keyboard,
  Mic,
  MicOff,
  Pencil,
  Plane,
  RotateCcw,
  Send,
  Volume2,
  X,
} from "lucide-react";

const ACCENT = "#6D33AA";
const INK = "#16181D";
const MUTED = "#6B7280";
const FAINT = "#9CA3AF";
const LINE = "#ECECEF";
const WARN = "#B45309";
const WARN_BG = "#FEF7EC";

/* ── the script ───────────────────────────────────────────────────────────
   Turns alternate. The last AI turn describes something it cannot say — two
   flight cards — which is the front-end half of "cannot speak, so describe it
   out loud and show it on screen". */
type Turn = { who: "ai" | "user"; text: string; card?: boolean };

const SCRIPT: Turn[] = [
  { who: "ai", text: "Hi — I'm Ada. Where are you flying?" },
  { who: "user", text: "Lisbon, end of next month" },
  { who: "ai", text: "Lisbon at the end of October. How many nights?" },
  { who: "user", text: "four" },
  { who: "ai", text: "Four nights. Shall I read you the two cheapest?" },
  { who: "user", text: "yes please" },
  {
    who: "ai",
    text: "Both leave on the 29th. One is 212 pounds with a stop in Madrid, the other 248 direct. Both are on your screen now.",
    card: true,
  },
];

/* Timing comes from the words, not from a number somebody liked: speech is
   about 230 words a minute, and a person answering a question of this size
   takes a little longer per word than the agent does saying it. */
const TICK = 80;
const SPEAK_PER = 260;
const LISTEN_PER = 330;
const wordsOf = (t: string) => t.split(/\s+/);
const thinkFor = (t: string) => Math.max(700, wordsOf(t).length * 55);

type VState =
  | "idle"
  | "listening"
  | "heard"
  | "thinking"
  | "speaking"
  | "interrupted"
  | "unclear"
  | "silent"
  | "yours"
  | "ended";

const STATE_LABEL: Record<VState, string> = {
  idle: "Ready",
  listening: "Listening",
  heard: "Heard you",
  thinking: "Working",
  speaking: "Speaking",
  interrupted: "Stopped",
  unclear: "Didn't catch that",
  silent: "Still there?",
  yours: "Your turn",
  ended: "Ended",
};

type Msg = {
  id: number;
  who: "ai" | "user";
  text: string;
  spoken: boolean;
  cut?: boolean;
  card?: boolean;
};

type VM = {
  mode: "chat" | "preflight" | "voice" | "paused";
  vs: VState;
  msgs: Msg[];
  turn: number;
  el: number;
  secs: number;
  id: number;
  /* A line the agent says that is not in the script: a re-ask, a nudge, a
     read-back after a repair. Held apart from `turn` so recovering from a
     mumble does not lose the place in the conversation. */
  inject: string | null;
  nudges: number;
  muted: boolean;
  /* Wall clock, not a tick count: a background tab throttles intervals to
     once a second, and speech paced by counting ticks would drift out of
     step with the words it is meant to be revealing. */
  last: number;
};

const FRESH: VM = {
  mode: "chat",
  vs: "idle",
  msgs: [
    {
      id: 1,
      who: "ai",
      text: "Hi! I can help with flights, dates and bookings.",
      spoken: false,
    },
  ],
  turn: 0,
  el: 0,
  secs: 0,
  id: 2,
  inject: null,
  nudges: 0,
  muted: false,
  last: 0,
};

const CARD_MSG = (id: number): Msg => ({
  id,
  who: "ai",
  text: "",
  spoken: false,
  card: true,
});

/* ── the machine ──────────────────────────────────────────────────────────
   One pure step function, ticked by one interval. Every transition is
   computed from the previous value, so nothing depends on a stale closure
   and nothing is written during render. */
function step(vm: VM, now: number): VM {
  if (vm.mode !== "voice") return vm;
  const dt = Math.min(400, Math.max(0, now - vm.last));
  const el = vm.el + dt;
  const secs = vm.secs + dt / 1000;
  const base = { ...vm, el, secs, last: now };
  const scripted = SCRIPT[vm.turn];

  switch (vm.vs) {
    case "speaking": {
      const text = vm.inject ?? scripted?.text ?? "";
      const total = wordsOf(text).length;
      if (el < total * SPEAK_PER + 300) return base;
      const msgs = [...vm.msgs, { id: vm.id, who: "ai" as const, text, spoken: true }];
      let id = vm.id + 1;
      if (vm.inject) {
        return { ...base, msgs, id, inject: null, vs: "listening", el: 0 };
      }
      if (scripted?.card) {
        msgs.push(CARD_MSG(id));
        id += 1;
      }
      const next = SCRIPT[vm.turn + 1];
      return {
        ...base,
        msgs,
        id,
        turn: vm.turn + 1,
        el: 0,
        vs: next ? "listening" : "yours",
      };
    }

    case "listening": {
      const total = wordsOf(scripted?.text ?? "").length;
      if (!scripted || el < total * LISTEN_PER + 400) return base;
      return { ...base, vs: "heard", el: 0 };
    }

    case "heard": {
      if (el < 260) return base;
      /* The turn lands in the thread the moment it is accepted — not while it
         is still being heard. A bubble that rewrites itself word by word is
         unreadable, and it makes a mishearing look like the agent's opinion
         changing. */
      const msgs = [
        ...vm.msgs,
        { id: vm.id, who: "user" as const, text: scripted?.text ?? "", spoken: true },
      ];
      return { ...base, msgs, id: vm.id + 1, turn: vm.turn + 1, vs: "thinking", el: 0 };
    }

    case "thinking": {
      const text = vm.inject ?? SCRIPT[vm.turn]?.text ?? "";
      if (el < thinkFor(text)) return base;
      return { ...base, vs: "speaking", el: 0 };
    }

    case "interrupted": {
      if (el < 420) return base;
      return { ...base, vs: "listening", el: 0 };
    }

    case "unclear":
    case "silent": {
      if (el < 500) return base;
      return { ...base, vs: "speaking", el: 0 };
    }

    default:
      return base;
  }
}

/* ── pieces ───────────────────────────────────────────────────────────── */

function Bubble({
  m,
  onFix,
}: {
  m: Msg;
  onFix: (id: number, text: string) => void;
}) {
  const [edit, setEdit] = useState<string | null>(null);
  const mine = m.who === "user";

  if (m.card) {
    return (
      <div className="flex flex-col gap-1.5 self-start">
        {[
          { price: "£212", via: "1 stop · Madrid", dur: "5h 40m" },
          { price: "£248", via: "Direct", dur: "2h 45m" },
        ].map((f) => (
          <button
            key={f.price}
            onClick={() => onFix(-1, f.via === "Direct" ? "the direct one" : "the cheaper one")}
            className="flex w-[232px] items-center gap-2.5 rounded-xl border bg-white px-3 py-2.5 text-left transition-colors hover:border-[#D9CBEE]"
            style={{ borderColor: LINE }}
          >
            <Plane className="size-4 shrink-0" strokeWidth={2} style={{ color: ACCENT }} />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold">{f.price}</span>
              <span className="block truncate text-[11px]" style={{ color: MUTED }}>
                {f.via} · {f.dur}
              </span>
            </span>
            <ArrowRight className="size-3.5 shrink-0" strokeWidth={2} style={{ color: FAINT }} />
          </button>
        ))}
      </div>
    );
  }

  if (edit !== null) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (edit.trim()) onFix(m.id, edit.trim());
          setEdit(null);
        }}
        className="flex max-w-[248px] items-center gap-1.5 self-end rounded-2xl border px-2.5 py-1.5"
        style={{ borderColor: ACCENT, background: "#FBF8FF" }}
      >
        <input
          autoFocus
          value={edit}
          onChange={(e) => setEdit(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
        />
        <button type="submit" className="shrink-0">
          <Check className="size-3.5" strokeWidth={2.5} style={{ color: ACCENT }} />
        </button>
      </form>
    );
  }

  return (
    <div className={`group flex max-w-[268px] items-end gap-1 ${mine ? "self-end" : "self-start"}`}>
      <div
        className="rounded-2xl px-3 py-2 text-[13px] leading-snug"
        style={{
          background: mine ? ACCENT : "#F4F4F6",
          color: mine ? "white" : INK,
          borderBottomRightRadius: mine ? 6 : undefined,
          borderBottomLeftRadius: mine ? undefined : 6,
        }}
      >
        {m.text}
        {m.cut ? <span style={{ opacity: 0.5 }}>…</span> : null}
        {m.spoken ? (
          <span className="mt-1 flex items-center gap-1 text-[10px]" style={{ opacity: 0.6 }}>
            {mine ? <Mic className="size-2.5" strokeWidth={2.5} /> : <Volume2 className="size-2.5" strokeWidth={2.5} />}
            {mine ? "heard" : "spoken"}
          </span>
        ) : null}
      </div>
      {mine && m.spoken ? (
        <button
          onClick={() => setEdit(m.text)}
          title="Fix what it heard"
          className="mb-1 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Pencil className="size-3" strokeWidth={2} style={{ color: FAINT }} />
        </button>
      ) : null}
    </div>
  );
}

function Meter({ live, tone }: { live: boolean; tone: string }) {
  const [bars, setBars] = useState([0.3, 0.6, 0.4, 0.8, 0.5]);
  useEffect(() => {
    if (!live) return;
    const id = setInterval(
      () => setBars((b) => b.map(() => 0.22 + Math.random() * 0.78)),
      130,
    );
    return () => {
      clearInterval(id);
      setBars([0.3, 0.6, 0.4, 0.8, 0.5]);
    };
  }, [live]);
  return (
    <span className="flex h-6 items-center gap-[3px]">
      {bars.map((b, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full transition-all duration-150"
          style={{ height: live ? 4 + b * 20 : 4, background: tone, opacity: live ? 1 : 0.35 }}
        />
      ))}
    </span>
  );
}

export default function VoiceMessenger() {
  const [vm, setVm] = useState<VM>(FRESH);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (vm.mode !== "voice") return;
    const id = setInterval(() => setVm((v) => step(v, Date.now())), TICK);
    return () => clearInterval(id);
  }, [vm.mode]);

  const { vs, mode } = vm;
  const staged = SCRIPT[vm.turn];
  const speakText = vm.inject ?? (vs === "speaking" ? staged?.text : "") ?? "";
  const shownSpoken =
    vs === "speaking"
      ? wordsOf(speakText).slice(0, Math.floor(vm.el / SPEAK_PER) + 1).join(" ")
      : "";
  const shownHeard =
    vs === "listening" && staged?.who === "user"
      ? wordsOf(staged.text).slice(0, Math.floor(vm.el / LISTEN_PER)).join(" ")
      : "";

  const tone =
    vs === "unclear" || vs === "silent"
      ? "#E8A33D"
      : vs === "ended" || vs === "idle"
        ? "#C4C8D1"
        : ACCENT;

  const nudge = (kind: "unclear" | "silent") =>
    setVm((v) => ({
      ...v,
      vs: kind,
      el: 0,
      last: Date.now(),
      nudges: v.nudges + 1,
      inject:
        kind === "unclear"
          ? "Sorry — I didn't catch that. Say it again, or type it?"
          : "Still with me?",
    }));

  const interrupt = () =>
    setVm((v) => {
      const text = v.inject ?? SCRIPT[v.turn]?.text ?? "";
      const cut = wordsOf(text).slice(0, Math.floor(v.el / SPEAK_PER) + 1).join(" ");
      return {
        ...v,
        msgs: [...v.msgs, { id: v.id, who: "ai", text: cut, spoken: true, cut: true }],
        id: v.id + 1,
        inject: null,
        turn: v.inject ? v.turn : v.turn + 1,
        vs: "interrupted",
        el: 0,
        last: Date.now(),
      };
    });

  /* A repaired word is worth a read-back and nothing more: re-asking the whole
     question is what makes people give up and type. */
  const fix = (id: number, text: string) =>
    setVm((v) =>
      id === -1
        ? {
            ...v,
            msgs: [...v.msgs, { id: v.id, who: "user", text, spoken: false }],
            id: v.id + 1,
            vs: "thinking",
            el: 0,
            last: Date.now(),
            inject: "Booked — I've emailed the confirmation.",
          }
        : {
            ...v,
            msgs: v.msgs.map((m) => (m.id === id ? { ...m, text } : m)),
            vs: "thinking",
            el: 0,
            last: Date.now(),
            inject: `Got it — ${text}.`,
          },
    );

  const send = () => {
    if (!typed.trim()) return;
    setVm((v) => ({
      ...v,
      msgs: [...v.msgs, { id: v.id, who: "user", text: typed.trim(), spoken: false }],
      id: v.id + 1,
    }));
    setTyped("");
  };

  return (
    <div className="flex min-h-screen bg-[#F4F4F6]" style={{ color: INK }}>
      {/* ── notes and the three states a happy path never reaches ── */}
      <aside className="w-[300px] shrink-0 border-r bg-white p-5" style={{ borderColor: LINE }}>
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: FAINT }}>
          Voice · the front
        </p>
        <h1 className="mt-1 text-[19px] font-bold leading-tight">
          The composer becomes the call
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed" style={{ color: MUTED }}>
          The window never changes. The thread stays readable, every spoken turn
          lands in it, and the bar is where the turn in progress is staged.
        </p>

        <div className="mt-5 rounded-xl p-3" style={{ background: "#F8F4FF" }}>
          <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: ACCENT }}>
            State
          </p>
          <p className="mt-0.5 text-[15px] font-semibold">{STATE_LABEL[vs]}</p>
          <p className="text-[11px]" style={{ color: MUTED }}>
            {mode === "voice" ? `${vm.secs.toFixed(0)}s of voice` : "composer"}
          </p>
        </div>

        <p className="mt-5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: FAINT }}>
          Force an edge case
        </p>
        <div className="mt-2 flex flex-col gap-1.5">
          <button
            onClick={interrupt}
            disabled={vs !== "speaking"}
            className="rounded-lg border px-3 py-2 text-left text-[13px] disabled:opacity-35"
            style={{ borderColor: LINE }}
          >
            Talk over it
            <span className="block text-[11px]" style={{ color: FAINT }}>
              Stops mid-word, keeps what it said
            </span>
          </button>
          <button
            onClick={() => nudge("unclear")}
            disabled={vs !== "listening"}
            className="rounded-lg border px-3 py-2 text-left text-[13px] disabled:opacity-35"
            style={{ borderColor: LINE }}
          >
            Mumble
            <span className="block text-[11px]" style={{ color: FAINT }}>
              Second ask is easier than the first
            </span>
          </button>
          <button
            onClick={() => nudge("silent")}
            disabled={vs !== "listening"}
            className="rounded-lg border px-3 py-2 text-left text-[13px] disabled:opacity-35"
            style={{ borderColor: LINE }}
          >
            Say nothing
            <span className="block text-[11px]" style={{ color: FAINT }}>
              One nudge, then it stops asking
            </span>
          </button>
          <button
            onClick={() => setVm(FRESH)}
            className="mt-1 flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px]"
            style={{ borderColor: LINE, color: MUTED }}
          >
            <RotateCcw className="size-3.5" strokeWidth={2} />
            Start over
          </button>
        </div>

        <p className="mt-5 text-[12px] leading-relaxed" style={{ color: FAINT }}>
          Hover a heard message to fix what it thought you said. The two flight
          cards are a gambit that cannot speak: the voice summarises them, the
          screen shows them, and tapping one still works.
        </p>
      </aside>

      {/* ── the widget ── */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div
          className="flex h-[620px] w-[380px] flex-col overflow-hidden rounded-3xl bg-white"
          style={{ boxShadow: "0 24px 60px -18px rgba(15,17,26,0.28), 0 0 0 1px rgba(15,17,26,0.05)" }}
        >
          {/* header — the only thing voice adds is a live dot, because the
              identity of the agent does not change with the mode */}
          <div className="flex items-center gap-2.5 border-b px-4 py-3" style={{ borderColor: LINE }}>
            <span className="grid size-8 shrink-0 place-items-center rounded-full text-[13px] font-bold text-white" style={{ background: ACCENT }}>
              A
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-semibold">Ada</span>
              <span className="flex items-center gap-1.5 text-[11px]" style={{ color: mode === "voice" ? ACCENT : MUTED }}>
                {mode === "voice" ? (
                  <>
                    <span className="size-1.5 rounded-full" style={{ background: ACCENT }} />
                    Voice · {STATE_LABEL[vs].toLowerCase()}
                  </>
                ) : (
                  "Travel support"
                )}
              </span>
            </span>
            <Captions className="size-4 shrink-0" strokeWidth={2} style={{ color: FAINT }} />
            <X className="size-4 shrink-0" strokeWidth={2} style={{ color: FAINT }} />
          </div>

          {/* thread — one thread, spoken and typed together */}
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
            {vm.msgs.map((m) => (
              <Bubble key={m.id} m={m} onFix={fix} />
            ))}
            {vs === "thinking" ? (
              <div className="flex items-center gap-1.5 self-start rounded-2xl px-3 py-2.5" style={{ background: "#F4F4F6" }}>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="size-1.5 rounded-full"
                    style={{ background: ACCENT, animation: `vdot 900ms ${i * 140}ms ease-in-out infinite` }}
                  />
                ))}
              </div>
            ) : null}
          </div>

          {/* ── the bar ── */}
          {mode === "chat" || mode === "paused" ? (
            <div className="border-t p-3" style={{ borderColor: LINE }}>
              {mode === "paused" ? (
                <p className="mb-2 flex items-center gap-1.5 px-1 text-[11px]" style={{ color: MUTED }}>
                  <MicOff className="size-3" strokeWidth={2} />
                  Voice paused — it is still listening for nothing. Tap the mic to carry on.
                </p>
              ) : null}
              <div className="flex items-center gap-2 rounded-2xl border px-3 py-2" style={{ borderColor: LINE }}>
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Write a message"
                  className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
                  style={{ color: INK }}
                />
                {typed.trim() ? (
                  <button onClick={send} className="shrink-0">
                    <Send className="size-4" strokeWidth={2} style={{ color: ACCENT }} />
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      setVm((v) =>
                        v.mode === "paused"
                          ? { ...v, mode: "voice", vs: "listening", el: 0, last: Date.now() }
                          : { ...v, mode: "preflight" },
                      )
                    }
                    className="grid size-7 shrink-0 place-items-center rounded-full"
                    style={{ background: "#F3ECFB" }}
                    title="Talk instead"
                  >
                    <Mic className="size-4" strokeWidth={2} style={{ color: ACCENT }} />
                  </button>
                )}
              </div>
            </div>
          ) : null}

          {/* the mic is asked for inside the widget, before the browser asks —
              a permission sheet nobody expected is a permission nobody grants */}
          {mode === "preflight" ? (
            <div className="border-t p-4" style={{ borderColor: LINE }}>
              <p className="text-[13px] font-semibold">Talk to Ada instead?</p>
              <p className="mt-1 text-[12px] leading-snug" style={{ color: MUTED }}>
                She answers out loud and the words stay here in writing. Your mic
                is only on while the bar says <strong>Listening</strong>.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setVm((v) => ({ ...v, mode: "voice", vs: "thinking", el: 0, turn: 0, last: Date.now() }))}
                  className="flex-1 rounded-xl py-2 text-[13px] font-semibold text-white"
                  style={{ background: ACCENT }}
                >
                  Turn on mic
                </button>
                <button
                  onClick={() => setVm((v) => ({ ...v, mode: "chat" }))}
                  className="rounded-xl border px-3 text-[13px]"
                  style={{ borderColor: LINE, color: MUTED }}
                >
                  Keep typing
                </button>
              </div>
            </div>
          ) : null}

          {mode === "voice" ? (
            <div
              className="border-t px-4 pb-3 pt-2.5"
              style={{ borderColor: vs === "unclear" || vs === "silent" ? "#F0E3CC" : LINE, background: vs === "unclear" || vs === "silent" ? WARN_BG : "white" }}
            >
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: vs === "unclear" || vs === "silent" ? WARN : ACCENT }}>
                  {vs === "speaking" ? <Volume2 className="size-3" strokeWidth={2.5} /> : null}
                  {vs === "listening" ? <Mic className="size-3" strokeWidth={2.5} /> : null}
                  {vs === "heard" ? <Check className="size-3" strokeWidth={3} /> : null}
                  {vs === "unclear" ? <Ear className="size-3" strokeWidth={2.5} /> : null}
                  {vs === "silent" ? <AlertTriangle className="size-3" strokeWidth={2.5} /> : null}
                  {STATE_LABEL[vs]}
                </span>
                <span className="ml-auto text-[11px] tabular-nums" style={{ color: FAINT }}>
                  {Math.floor(vm.secs / 60)}:{String(Math.floor(vm.secs % 60)).padStart(2, "0")}
                </span>
              </div>

              {/* the staging line: what is being said, or what it thinks it is
                  hearing. Grey and unsettled until the turn is accepted. */}
              <div className="mt-1.5 flex min-h-[40px] items-center">
                <p className="text-[13px] leading-snug">
                  {vs === "speaking" ? <span>{shownSpoken}</span> : null}
                  {vs === "listening" ? (
                    <span style={{ color: shownHeard ? MUTED : FAINT, fontStyle: "italic" }}>
                      {shownHeard || "Go ahead — just talk"}
                      {shownHeard ? <span style={{ color: ACCENT }}>▌</span> : null}
                    </span>
                  ) : null}
                  {vs === "heard" ? <span style={{ color: MUTED }}>{staged?.text}</span> : null}
                  {vs === "thinking" ? (
                    <span style={{ color: FAINT }}>One moment — looking that up.</span>
                  ) : null}
                  {vs === "interrupted" ? <span style={{ color: FAINT }}>Go on.</span> : null}
                  {vs === "unclear" || vs === "silent" ? (
                    <span style={{ color: WARN }}>
                      {vs === "unclear" ? "Say it again, or type it instead." : "One more try, then I'll leave you to it."}
                    </span>
                  ) : null}
                  {vs === "yours" ? (
                    <span style={{ color: FAINT }}>Pick one on screen, or tell me which.</span>
                  ) : null}
                </p>
              </div>

              <div className="mt-1 flex items-center gap-2">
                <button
                  onClick={() => setVm((v) => ({ ...v, muted: !v.muted }))}
                  className="grid size-9 shrink-0 place-items-center rounded-full border"
                  style={{ borderColor: LINE, background: vm.muted ? "#F4F4F6" : "white" }}
                  title={vm.muted ? "Unmute" : "Mute"}
                >
                  {vm.muted ? (
                    <MicOff className="size-4" strokeWidth={2} style={{ color: MUTED }} />
                  ) : (
                    <Mic className="size-4" strokeWidth={2} style={{ color: MUTED }} />
                  )}
                </button>

                {/* one big target in the middle: it means "stop talking" while
                    it speaks and "I'm done" while it listens, which is the same
                    gesture a person would use */}
                <button
                  onClick={() => (vs === "speaking" ? interrupt() : setVm((v) => ({ ...v, vs: "heard", el: 260, last: Date.now() })))}
                  className="flex h-9 min-w-0 flex-1 items-center justify-center gap-2 rounded-full transition-colors"
                  style={{ background: vs === "unclear" || vs === "silent" ? "#FBEFDC" : "#F3ECFB" }}
                >
                  <Meter live={vs === "listening" || vs === "speaking"} tone={tone} />
                  <span className="truncate text-[12px] font-semibold" style={{ color: vs === "speaking" ? ACCENT : MUTED }}>
                    {vs === "speaking" ? "Tap to interrupt" : vs === "listening" ? "Tap when done" : ""}
                  </span>
                </button>

                <button
                  onClick={() => setVm((v) => ({ ...v, mode: "paused" }))}
                  className="grid size-9 shrink-0 place-items-center rounded-full border"
                  style={{ borderColor: LINE }}
                  title="Type instead — voice stays available"
                >
                  <Keyboard className="size-4" strokeWidth={2} style={{ color: MUTED }} />
                </button>

                <button
                  onClick={() => setVm((v) => ({ ...v, mode: "chat", vs: "ended" }))}
                  className="h-9 shrink-0 rounded-full px-3 text-[12px] font-semibold text-white"
                  style={{ background: "#D9534F" }}
                >
                  End
                </button>
              </div>
            </div>
          ) : null}

          <style>{`@keyframes vdot{0%,100%{opacity:.25;transform:translateY(0)}50%{opacity:1;transform:translateY(-2px)}}`}</style>
        </div>
      </div>
    </div>
  );
}
