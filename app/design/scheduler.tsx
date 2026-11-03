"use client";

/* ── THE MEETING SCHEDULER ────────────────────────────────────────────────
   A booking gambit that renders inside the thread, themed by whatever the
   panel is themed by.

   What the current one gets wrong, and what each of these is a fix for:

   · The slot list is the host's calendar converted into your timezone and
     then printed flat, so midnight sits above tea time and the first thing
     offered is 12:00 AM. Slots are bucketed into morning / afternoon /
     evening here, and anything outside waking hours folds behind a line that
     says how many there are.
   · A dot under a day is not availability. The strip carries counts, so you
     can see where the times are before spending a click finding out.
   · The timezone was a permanent control in the header, which is prominence
     for a thing nine visitors in ten never touch. Detected, stated in a line
     under the slots, changeable from there.
   · "Open times can change with your details. Refresh to confirm." is a
     warning that explains nothing and offers a refresh button as the remedy.
     The honest version is to hold the slot and show the hold running down —
     and to handle losing it properly, which is the `taken` state.
   · Confirm said Confirm. It says the time now, because that is the fact
     somebody is agreeing to.
   · Booking ended on a full card containing one green tick, then re-rendered
     into a third layout. One card throughout: it becomes the receipt.

   Everything is driven from `step`, so the strip under the preview can jump
   to any state and the card can still be clicked through end to end. ────── */

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CalendarPlus,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Loader2,
  Search,
  X,
} from "lucide-react";

export type SchedStep =
  | "pick"
  | "zone"
  | "details"
  | "booking"
  | "booked"
  | "taken";

export const SCHED_STEPS: { id: SchedStep; label: string; note: string }[] = [
  {
    id: "pick",
    label: "Pick a time",
    note: "Counts on the day strip, slots grouped by part of day, late times folded away. Thursday and the weekend are empty — click one.",
  },
  {
    id: "zone",
    label: "Timezone",
    note: "Detected, not asked. The header control became a line under the slots, and the search only appears once somebody disagrees with it.",
  },
  {
    id: "details",
    label: "Your details",
    note: "The slot is held for five minutes and the hold is visible. Name and email come from the conversation rather than being asked for twice.",
  },
  { id: "booking", label: "Booking", note: "The button carries the wait. Nothing else moves." },
  {
    id: "booked",
    label: "Booked",
    note: "The same card, become the receipt — who, when, in both timezones, and the two things anyone does next.",
  },
  {
    id: "taken",
    label: "Slot taken",
    note: "What the refresh warning was really about. It happens while they are typing, so it offers the two nearest times instead of sending them back to the grid.",
  },
];

/* ── the week ─────────────────────────────────────────────────────────── */

const DAYS = [
  { dow: "Mon", d: 28, mon: "Sep" },
  { dow: "Tue", d: 29, mon: "Sep" },
  { dow: "Wed", d: 30, mon: "Sep" },
  { dow: "Thu", d: 1, mon: "Oct" },
  { dow: "Fri", d: 2, mon: "Oct" },
  { dow: "Sat", d: 3, mon: "Oct" },
  { dow: "Sun", d: 4, mon: "Oct" },
];

/* Minutes from midnight, in the visitor's zone. Tuesday carries two after
   midnight on purpose: they are the slots the old grid led with. */
const SLOTS: number[][] = [
  [600, 630, 690, 900, 930, 1200],
  [540, 570, 660, 840, 870, 990, 1260, 1290, 0, 30],
  [660, 960, 1290],
  [],
  [570, 720, 840, 1080, 1320],
  [],
  [],
];

const HOST_OFFSET = 330; // Kolkata is 5h30 ahead of the host's UTC

const fmt = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const ampm = h < 12 ? "AM" : "PM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, "0")} ${ampm}`;
};
const hostFmt = (min: number) => fmt((min - HOST_OFFSET + 1440) % 1440);
const isLate = (min: number) => min < 360 || min >= 1380;
const bucketOf = (min: number) =>
  min < 720 ? "Morning" : min < 1020 ? "Afternoon" : "Evening";
const BUCKETS = ["Morning", "Afternoon", "Evening"] as const;

const ZONES = [
  { city: "Kolkata", off: "GMT+5:30" },
  { city: "Dubai", off: "GMT+4:00" },
  { city: "London", off: "GMT+1:00" },
  { city: "Berlin", off: "GMT+2:00" },
  { city: "New York", off: "GMT−4:00" },
  { city: "Chicago", off: "GMT−5:00" },
  { city: "Los Angeles", off: "GMT−7:00" },
  { city: "Toronto", off: "GMT−4:00" },
  { city: "Mexico City", off: "GMT−6:00" },
  { city: "São Paulo", off: "GMT−3:00" },
  { city: "Singapore", off: "GMT+8:00" },
  { city: "Tokyo", off: "GMT+9:00" },
  { city: "Sydney", off: "GMT+10:00" },
];

const HOLD_SECS = 300;

/* Its own component so the countdown starts from the top whenever the details
   step is entered, without an effect reaching in to reset it — mounting is
   the reset. It stays mounted across the booking step, which is right: the
   hold does not restart because somebody pressed Confirm. */
function Hold({ ink, mute, tint }: { ink: string; mute: string; tint: string }) {
  const [left, setLeft] = useState(HOLD_SECS);
  useEffect(() => {
    const id = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex items-center gap-2 px-3.5 pt-2.5">
      <Clock className="size-3 shrink-0" strokeWidth={2.5} style={{ color: tint }} />
      <span className="text-[11px]" style={{ color: mute }}>
        Held for you ·{" "}
        <span className="font-semibold tabular-nums" style={{ color: ink }}>
          {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
        </span>
      </span>
    </div>
  );
}

type Theme = {
  neutral: Record<string, string>;
  accent: string;
  mode: "light" | "dark";
  radius: { panel: number; bubble: number; control: number; chip: number };
};

export function SchedulerCard({
  theme,
  accent,
  step,
  onStep,
  title = "Chillical integration discussion",
  mins = 30,
  host = "Aditya Punase",
}: {
  theme: Theme;
  accent: string;
  step: SchedStep;
  onStep: (s: SchedStep) => void;
  title?: string;
  mins?: number;
  host?: string;
}) {
  const { neutral, radius } = theme;
  const dark = theme.mode === "dark";
  const [dayIdx, setDayIdx] = useState(1);
  const [slot, setSlot] = useState<number | null>(540);
  const [lateOpen, setLateOpen] = useState(false);
  const [zone, setZone] = useState(ZONES[0]);
  const [q, setQ] = useState("");
  const [name, setName] = useState("Shaun");
  const [email, setEmail] = useState("shaun@example.com");

  /* Booking is a wait, not a screen. Two seconds, then the receipt. */
  useEffect(() => {
    if (step !== "booking") return;
    const id = setTimeout(() => onStep("booked"), 1800);
    return () => clearTimeout(id);
  }, [step, onStep]);

  const day = DAYS[dayIdx];
  const all = SLOTS[dayIdx];
  const open = all.filter((s) => !isLate(s));
  const late = all.filter(isLate);
  const chosen = slot ?? open[0] ?? 0;

  const nextOpen = DAYS.findIndex((_, i) => i > dayIdx && SLOTS[i].length > 0);
  const nearest = open
    .filter((s) => s !== chosen)
    .sort((a, b) => Math.abs(a - chosen) - Math.abs(b - chosen))
    .slice(0, 2);

  const line = neutral.line;
  const ink = neutral.ink;
  const mute = neutral.secondary;
  const faint = neutral.muted;
  const wash = dark
    ? `color-mix(in oklab, ${accent} 22%, ${neutral.surface})`
    : `color-mix(in oklab, ${accent} 8%, white)`;
  const softInk = dark
    ? `color-mix(in oklab, ${accent} 55%, white)`
    : `color-mix(in oklab, ${accent} 80%, black)`;

  const card: React.CSSProperties = {
    background: neutral.surface,
    borderRadius: radius.panel,
    boxShadow: `inset 0 0 0 1px ${line}`,
  };

  const zoneOpen = step === "zone";
  const matches = ZONES.filter((z) =>
    z.city.toLowerCase().includes(q.trim().toLowerCase()),
  );

  /* ── header — one identity for the whole flow ── */
  const header = (
    <div
      className="flex items-start gap-2.5 px-3.5 py-3"
      style={{ borderBottom: `1px solid ${line}` }}
    >
      <span
        className="mt-0.5 grid size-7 shrink-0 place-items-center"
        style={{ background: wash, borderRadius: radius.control, color: softInk }}
      >
        {step === "booked" ? (
          <Check className="size-4" strokeWidth={2.5} />
        ) : (
          <Clock className="size-4" strokeWidth={2} />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-semibold" style={{ color: ink }}>
          {title}
        </span>
        <span className="block truncate text-[12px]" style={{ color: mute }}>
          {mins} min · with {host}
        </span>
      </span>
      {step === "booked" ? (
        <span
          className="shrink-0 px-2 py-0.5 text-[11px] font-semibold"
          style={{ background: wash, color: softInk, borderRadius: radius.chip }}
        >
          Booked
        </span>
      ) : null}
    </div>
  );

  /* ── the chosen slot, restated wherever it matters ── */
  const slotLine = (
    <div className="flex items-center gap-3 px-3.5 py-2.5" style={{ background: neutral.paper }}>
      <span
        className="grid size-9 shrink-0 place-items-center text-center leading-none"
        style={{ background: neutral.surface, borderRadius: radius.control, boxShadow: `inset 0 0 0 1px ${line}` }}
      >
        <span className="block">
          <span className="block text-[9px] font-semibold uppercase tracking-wide" style={{ color: faint }}>
            {day.mon}
          </span>
          <span className="block text-[13px] font-bold" style={{ color: ink }}>
            {day.d}
          </span>
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold" style={{ color: ink }}>
          {day.dow} {day.d} {day.mon} · {fmt(chosen)} – {fmt(chosen + mins)}
        </span>
        <span className="block text-[11px]" style={{ color: mute }}>
          {hostFmt(chosen)} for {host.split(" ")[0]} · UTC
        </span>
      </span>
      {step === "details" ? (
        <button
          onClick={() => onStep("pick")}
          className="shrink-0 text-[12px] font-semibold"
          style={{ color: softInk }}
        >
          Change
        </button>
      ) : null}
    </div>
  );

  return (
    <div className="mt-2 w-full max-w-[460px] overflow-hidden" style={card}>
      {header}

      {step === "pick" || step === "zone" ? (
        <>
          {/* ── week strip: counts, not dots ── */}
          <div className="flex items-center justify-between px-3.5 pb-2 pt-3">
            <span className="text-[12px] font-semibold" style={{ color: ink }}>
              Sep 28 – Oct 4
            </span>
            <span className="flex items-center gap-1">
              <button
                className="grid size-6 place-items-center"
                style={{ borderRadius: radius.control, color: faint }}
                aria-label="Previous week"
              >
                <ChevronLeft className="size-4" strokeWidth={2} />
              </button>
              <button
                className="grid size-6 place-items-center"
                style={{ borderRadius: radius.control, color: mute }}
                aria-label="Next week"
              >
                <ChevronRight className="size-4" strokeWidth={2} />
              </button>
            </span>
          </div>

          <div className="flex gap-1 px-3.5">
            {DAYS.map((d, i) => {
              const n = SLOTS[i].filter((s) => !isLate(s)).length;
              const on = i === dayIdx;
              const empty = SLOTS[i].length === 0;
              return (
                <button
                  key={d.dow}
                  onClick={() => {
                    setDayIdx(i);
                    setSlot(null);
                    setLateOpen(false);
                  }}
                  disabled={empty}
                  className="flex min-w-0 flex-1 flex-col items-center gap-0.5 py-1.5 transition-colors"
                  style={{
                    borderRadius: radius.control,
                    background: on ? accent : "transparent",
                    boxShadow: on ? undefined : `inset 0 0 0 1px ${line}`,
                    opacity: empty ? 0.45 : 1,
                  }}
                >
                  <span
                    className="text-[10px] font-medium uppercase"
                    style={{ color: on ? "rgba(255,255,255,0.75)" : faint }}
                  >
                    {d.dow}
                  </span>
                  <span
                    className="text-[15px] font-bold leading-none"
                    style={{ color: on ? "white" : ink }}
                  >
                    {d.d}
                  </span>
                  {/* A count, because a dot only ever said "maybe" */}
                  <span
                    className="text-[9px] font-semibold tabular-nums"
                    style={{ color: on ? "rgba(255,255,255,0.8)" : empty ? faint : softInk }}
                  >
                    {empty ? "—" : n}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── slots, grouped by when in the day they are ── */}
          <div className="max-h-[248px] overflow-y-auto px-3.5 pb-1 pt-3">
            {open.length === 0 ? (
              <div className="px-1 py-6 text-center">
                <p className="text-[13px] font-semibold" style={{ color: ink }}>
                  No times on {day.dow} {day.d} {day.mon}
                </p>
                {nextOpen >= 0 ? (
                  <button
                    onClick={() => {
                      setDayIdx(nextOpen);
                      setSlot(null);
                    }}
                    className="mt-2 px-3 py-1.5 text-[12px] font-semibold"
                    style={{ background: wash, color: softInk, borderRadius: radius.chip }}
                  >
                    See {SLOTS[nextOpen].filter((s) => !isLate(s)).length} times on{" "}
                    {DAYS[nextOpen].dow} {DAYS[nextOpen].d} {DAYS[nextOpen].mon}
                  </button>
                ) : (
                  <p className="mt-1 text-[12px]" style={{ color: mute }}>
                    Try next week.
                  </p>
                )}
              </div>
            ) : (
              BUCKETS.map((b) => {
                const inB = open.filter((s) => bucketOf(s) === b);
                if (inB.length === 0) return null;
                return (
                  <div key={b} className="mb-3 last:mb-1">
                    <p
                      className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: faint }}
                    >
                      {b}
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {inB.map((s) => {
                        const on = s === slot;
                        return (
                          <button
                            key={s}
                            onClick={() => {
                              setSlot(s);
                              onStep("details");
                            }}
                            className="py-2 text-[13px] font-semibold transition-colors"
                            style={{
                              borderRadius: radius.control,
                              color: on ? "white" : ink,
                              background: on ? accent : "transparent",
                              boxShadow: on ? undefined : `inset 0 0 0 1px ${line}`,
                            }}
                            title={`${hostFmt(s)} for ${host.split(" ")[0]}`}
                          >
                            {fmt(s)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}

            {/* The 12:00 AM problem: real slots, but never the first thing
                anyone should be offered. */}
            {late.length > 0 && open.length > 0 ? (
              <div className="mb-1">
                <button
                  onClick={() => setLateOpen((o) => !o)}
                  className="flex items-center gap-1 py-1 text-[11px] font-medium"
                  style={{ color: mute }}
                >
                  <ChevronDown
                    className="size-3 transition-transform"
                    strokeWidth={2.5}
                    style={{ transform: lateOpen ? undefined : "rotate(-90deg)" }}
                  />
                  {late.length} more after midnight
                </button>
                {lateOpen ? (
                  <div className="mt-1 grid grid-cols-3 gap-1.5">
                    {late.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setSlot(s);
                          onStep("details");
                        }}
                        className="py-2 text-[13px] font-semibold"
                        style={{
                          borderRadius: radius.control,
                          color: mute,
                          boxShadow: `inset 0 0 0 1px ${line}`,
                        }}
                      >
                        {fmt(s)}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* ── the timezone, stated rather than asked ── */}
          <div
            className="relative flex items-center gap-2 px-3.5 py-2.5"
            style={{ borderTop: `1px solid ${line}` }}
          >
            <Globe className="size-3.5 shrink-0" strokeWidth={2} style={{ color: faint }} />
            <span className="min-w-0 flex-1 truncate text-[11px]" style={{ color: mute }}>
              Times in {zone.city} · {zone.off}
            </span>
            <button
              onClick={() => onStep(zoneOpen ? "pick" : "zone")}
              className="shrink-0 text-[11px] font-semibold"
              style={{ color: softInk }}
            >
              {zoneOpen ? "Close" : "Change"}
            </button>

            {zoneOpen ? (
              <div
                className="absolute bottom-full right-3.5 z-10 mb-1.5 w-[232px] overflow-hidden"
                style={{
                  background: neutral.surface,
                  borderRadius: radius.control,
                  boxShadow: dark
                    ? `inset 0 0 0 1px ${line}, 0 12px 30px -8px rgba(0,0,0,0.6)`
                    : `inset 0 0 0 1px ${line}, 0 12px 30px -10px rgba(15,17,26,0.24)`,
                }}
              >
                <div
                  className="flex items-center gap-2 px-2.5 py-2"
                  style={{ borderBottom: `1px solid ${line}` }}
                >
                  <Search className="size-3.5 shrink-0" strokeWidth={2} style={{ color: faint }} />
                  <input
                    autoFocus
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search a city"
                    className="min-w-0 flex-1 bg-transparent text-[12px] outline-none"
                    style={{ color: ink }}
                  />
                  {q ? (
                    <button onClick={() => setQ("")} className="shrink-0">
                      <X className="size-3.5" strokeWidth={2} style={{ color: faint }} />
                    </button>
                  ) : null}
                </div>
                <div className="max-h-[168px] overflow-y-auto py-1">
                  {matches.length === 0 ? (
                    <p className="px-3 py-3 text-[12px]" style={{ color: faint }}>
                      Nothing matches “{q}”.
                    </p>
                  ) : (
                    matches.map((z) => (
                      <button
                        key={z.city}
                        onClick={() => {
                          setZone(z);
                          setQ("");
                          onStep("pick");
                        }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left"
                        style={{
                          background: z.city === zone.city ? wash : "transparent",
                        }}
                      >
                        <span className="min-w-0 flex-1 truncate text-[12px]" style={{ color: ink }}>
                          {z.city}
                        </span>
                        <span className="shrink-0 text-[11px] tabular-nums" style={{ color: faint }}>
                          {z.off}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      {step === "details" || step === "booking" ? (
        <>
          {slotLine}
          {/* What the refresh notice was gesturing at, done honestly */}
          <Hold ink={ink} mute={mute} tint={softInk} />

          <div className="flex flex-col gap-2.5 px-3.5 py-3">
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold" style={{ color: mute }}>
                Your name
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={step === "booking"}
                className="w-full px-2.5 py-2 text-[13px] outline-none"
                style={{
                  borderRadius: radius.control,
                  color: ink,
                  background: neutral.surface,
                  boxShadow: `inset 0 0 0 1px ${line}`,
                }}
              />
            </label>
            <label className="block">
              <span className="mb-1 flex items-center gap-1.5">
                <span className="text-[11px] font-semibold" style={{ color: mute }}>
                  Email for the invite
                </span>
                {/* It was already said in the conversation. Asking again is the
                    kind of thing that makes a booking feel like a form. */}
                <span
                  className="flex items-center gap-0.5 px-1.5 py-px text-[10px] font-medium"
                  style={{ background: wash, color: softInk, borderRadius: radius.chip }}
                >
                  <Check className="size-2.5" strokeWidth={3} />
                  from your chat
                </span>
              </span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={step === "booking"}
                className="w-full px-2.5 py-2 text-[13px] outline-none"
                style={{
                  borderRadius: radius.control,
                  color: ink,
                  background: neutral.surface,
                  boxShadow: `inset 0 0 0 1px ${line}`,
                }}
              />
            </label>
          </div>

          <div className="flex items-center gap-2 px-3.5 pb-3.5">
            <button
              onClick={() => onStep("pick")}
              disabled={step === "booking"}
              className="px-3 py-2 text-[13px] font-medium disabled:opacity-40"
              style={{ borderRadius: radius.control, color: mute, boxShadow: `inset 0 0 0 1px ${line}` }}
            >
              Back
            </button>
            {/* Named with the time, because that is what is being agreed to */}
            <button
              onClick={() => onStep("booking")}
              disabled={step === "booking"}
              className="flex min-w-0 flex-1 items-center justify-center gap-2 py-2 text-[13px] font-semibold text-white"
              style={{ borderRadius: radius.control, background: accent }}
            >
              {step === "booking" ? (
                <>
                  <Loader2 className="size-3.5 shrink-0 animate-spin" strokeWidth={2.5} />
                  Booking…
                </>
              ) : (
                <>Confirm {day.dow} {fmt(chosen)}</>
              )}
            </button>
          </div>
        </>
      ) : null}

      {step === "booked" ? (
        <>
          {slotLine}
          <div className="flex flex-col gap-2 px-3.5 py-3">
            {[
              { who: host, role: "Host", sub: "" },
              { who: name, role: "You", sub: `Invite sent to ${email}` },
            ].map((p) => (
              <div key={p.role} className="flex items-center gap-2.5">
                <span
                  className="grid size-7 shrink-0 place-items-center text-[11px] font-bold"
                  style={{ background: wash, color: softInk, borderRadius: 999 }}
                >
                  {p.who.charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium" style={{ color: ink }}>
                    {p.who}
                  </span>
                  {p.sub ? (
                    <span className="block truncate text-[11px]" style={{ color: mute }}>
                      {p.sub}
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 text-[11px]" style={{ color: faint }}>
                  {p.role}
                </span>
              </div>
            ))}
          </div>
          <div
            className="flex items-center gap-2 px-3.5 py-2.5"
            style={{ borderTop: `1px solid ${line}` }}
          >
            <button
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-semibold"
              style={{ background: wash, color: softInk, borderRadius: radius.control }}
            >
              <CalendarPlus className="size-3.5" strokeWidth={2} />
              Add to calendar
            </button>
            <button
              onClick={() => onStep("pick")}
              className="px-2.5 py-1.5 text-[12px] font-medium"
              style={{ color: mute }}
            >
              Reschedule
            </button>
          </div>
        </>
      ) : null}

      {step === "taken" ? (
        <>
          <div className="flex items-start gap-2.5 px-3.5 py-3">
            <AlertTriangle
              className="mt-0.5 size-4 shrink-0"
              strokeWidth={2}
              style={{ color: "#B45309" }}
            />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold" style={{ color: ink }}>
                {fmt(chosen)} went while you were typing
              </span>
              <span className="block text-[12px] leading-snug" style={{ color: mute }}>
                Somebody else took it a moment ago. Nothing else has changed —
                your details are still here.
              </span>
            </span>
          </div>
          <div className="px-3.5 pb-3">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: faint }}>
              Closest to it
            </p>
            <div className="flex gap-1.5">
              {nearest.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSlot(s);
                    onStep("details");
                  }}
                  className="flex-1 py-2 text-[13px] font-semibold text-white"
                  style={{ borderRadius: radius.control, background: accent }}
                >
                  {fmt(s)}
                </button>
              ))}
              <button
                onClick={() => onStep("pick")}
                className="flex-1 py-2 text-[13px] font-medium"
                style={{ borderRadius: radius.control, color: mute, boxShadow: `inset 0 0 0 1px ${line}` }}
              >
                All times
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
