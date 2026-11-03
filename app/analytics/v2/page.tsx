"use client";

/* ── ANALYTICS, REDESIGNED ────────────────────────────────────────────────
   The page it replaces answers "how many" six times and "so what" never.
   Four tiles, a Sankey, a heatmap, two bar charts — all of it counting, none
   of it judging, and all of it drawn at a scale the data does not have. A
   Sankey for four visits is a diagram whose entire job is showing proportion,
   applied to a number you can hold in your head. A 168-cell heatmap with one
   cell filled is 167 cells of nothing.

   So this is built around three questions in order:

     1  Is it working?        one sentence, one number, and whether that is
                              good — not four tiles of equal weight
     2  Where do people go?   one stepped bar that reads at n=4 and n=40,000,
                              with the largest drop named
     3  What do I do?         the part the old page has none of

   Everything below those is context, and everything has a floor: under it the
   section says so rather than drawing a chart of noise. A percentage to one
   decimal off three people is a lie told in a precise voice. ───────────── */

import { useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  BarChart3,
  BookOpen,
  Bot,
  ChevronsUpDown,
  Megaphone,
  PanelLeft,
  Wrench,
  ArrowRight,
  ArrowUp,
  Calendar,
  ChevronDown,
  Clock,
  Globe,
  Info,
  Lightbulb,
  MessageSquare,
  MousePointerClick,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

const ACCENT = "#6D33AA";
const INK = "#16181D";
const MUTED = "#6B7280";
const FAINT = "#9CA3AF";
const LINE = "#ECECEF";

/* Below this, a rate is arithmetic rather than evidence. Everything that
   reports a percentage checks it first. */
const FLOOR = 30;

/* ── the data ─────────────────────────────────────────────────────────────
   Two shapes, because the whole argument is about scale: the design has to be
   judged on the four visits a new agent actually has, and on the traffic it
   will have in three months. A layout that only works at one of those is not
   finished. */

type Period = {
  visits: number;
  opens: number;
  conversations: number;
  outcomes: number;
};
type Fixture = {
  id: string;
  label: string;
  now: Period;
  prev: Period;
  /* per-day, for the trend */
  series: { day: string; visits: number; conversations: number }[];
  hours: number[][];
  sources: { name: string; visits: number; conversations: number }[];
  fields: { name: string; count: number }[];
  /* What people actually asked, which is the thing a chat agent knows and a
     web analytics tool never can. Every other report here could be written
     about a landing page; this one could not. */
  questions: { text: string; count: number; answered: number }[];
  /* And where it failed them. Counting successes tells you the agent is busy;
     this tells you what to go and fix. */
  gaps: { kind: "unanswered" | "handoff" | "repeated" | "abandoned"; text: string; count: number }[];
  published?: { day: string; label: string };
};

const NEW_AGENT: Fixture = {
  id: "new",
  label: "Just launched",
  now: { visits: 4, opens: 3, conversations: 2, outcomes: 0 },
  prev: { visits: 0, opens: 0, conversations: 0, outcomes: 0 },
  series: [
    { day: "Mon", visits: 0, conversations: 0 },
    { day: "Tue", visits: 0, conversations: 0 },
    { day: "Wed", visits: 1, conversations: 0 },
    { day: "Thu", visits: 0, conversations: 0 },
    { day: "Fri", visits: 3, conversations: 2 },
    { day: "Sat", visits: 0, conversations: 0 },
    { day: "Sun", visits: 0, conversations: 0 },
  ],
  hours: Array.from({ length: 7 }, (_, d) =>
    Array.from({ length: 24 }, (_, h) => (d === 4 && h === 8 ? 3 : 0)),
  ),
  sources: [{ name: "/pricing", visits: 4, conversations: 2 }],
  fields: [],
  questions: [
    { text: "What does card processing cost?", count: 1, answered: 1 },
    { text: "Do you support Apple Pay?", count: 1, answered: 0 },
  ],
  gaps: [
    { kind: "unanswered", text: "Do you support Apple Pay?", count: 1 },
  ],
  published: { day: "Fri", label: "Published v1" },
};

const BUSY_AGENT: Fixture = {
  id: "busy",
  label: "Three months in",
  now: { visits: 12480, opens: 4120, conversations: 2380, outcomes: 412 },
  prev: { visits: 11150, opens: 3460, conversations: 2240, outcomes: 356 },
  series: [
    { day: "Mon", visits: 1810, conversations: 352 },
    { day: "Tue", visits: 1960, conversations: 388 },
    { day: "Wed", visits: 2040, conversations: 401 },
    { day: "Thu", visits: 1880, conversations: 356 },
    { day: "Fri", visits: 2210, conversations: 447 },
    { day: "Sat", visits: 1390, conversations: 241 },
    { day: "Sun", visits: 1190, conversations: 195 },
  ],
  hours: Array.from({ length: 7 }, (_, d) =>
    Array.from({ length: 24 }, (_, h) => {
      const work = h >= 8 && h <= 18 ? 1 : h >= 6 && h <= 21 ? 0.35 : 0.06;
      const week = d < 5 ? 1 : 0.42;
      const peak = h === 10 || h === 14 ? 1.35 : 1;
      return Math.round(120 * work * week * peak);
    }),
  ),
  sources: [
    { name: "/pricing", visits: 4820, conversations: 1180 },
    { name: "/product/payments", visits: 3110, conversations: 602 },
    { name: "/support", visits: 2240, conversations: 418 },
    { name: "/", visits: 1560, conversations: 132 },
    { name: "/docs/checkout", visits: 750, conversations: 48 },
  ],
  fields: [
    { name: "Email", count: 386 },
    { name: "Company size", count: 291 },
    { name: "Monthly volume", count: 214 },
    { name: "Phone", count: 96 },
  ],
  questions: [
    { text: "What are your fees?", count: 412, answered: 396 },
    { text: "How do I integrate with Shopify?", count: 288, answered: 271 },
    { text: "When do payouts land?", count: 204, answered: 198 },
    { text: "Do you support Apple Pay?", count: 176, answered: 41 },
    { text: "Can I take payments in euros?", count: 142, answered: 138 },
    { text: "How do I dispute a chargeback?", count: 118, answered: 52 },
  ],
  gaps: [
    { kind: "unanswered", text: "Do you support Apple Pay?", count: 135 },
    { kind: "unanswered", text: "How do I dispute a chargeback?", count: 66 },
    { kind: "handoff", text: "Asked for a person within two turns", count: 214 },
    { kind: "repeated", text: "Asked the same thing twice", count: 96 },
    { kind: "abandoned", text: "Left mid-answer", count: 181 },
  ],
  published: { day: "Wed", label: "Published v4" },
};

const FIXTURES = [NEW_AGENT, BUSY_AGENT];

/* ── numbers, said carefully ─────────────────────────────────────────────── */

const compact = (n: number) =>
  n >= 10000 ? `${(n / 1000).toFixed(0)}k` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

/* Precision is a claim about confidence. One decimal on thousands is fair; on
   three people it is a lie told in a precise voice, so small numbers round to
   whole percents and very small ones do not get a percentage at all. */
function rate(part: number, whole: number) {
  if (whole <= 0) return null;
  const r = (part / whole) * 100;
  return whole >= 1000 ? r.toFixed(1) : String(Math.round(r));
}

function delta(now: number, prev: number) {
  if (prev <= 0) return null;
  return ((now - prev) / prev) * 100;
}

/* ── pieces ───────────────────────────────────────────────────────────────── */

function Card({
  title,
  hint,
  action,
  children,
  muted = false,
}: {
  title?: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <section
      className="rounded-2xl border bg-white"
      style={{ borderColor: LINE, background: muted ? "#FBFBFC" : "#FFFFFF" }}
    >
      {title && (
        <div
          className="flex items-center gap-2 border-b px-5 py-3.5"
          style={{ borderColor: LINE }}
        >
          <h2 className="text-[14px] font-semibold" style={{ color: INK }}>
            {title}
          </h2>
          {hint && (
            <span className="group relative flex items-center">
              <Info className="size-3.5 cursor-help" style={{ color: "#C4C4CC" }} strokeWidth={2} />
              <span className="pointer-events-none absolute left-0 top-full z-20 mt-1 w-[240px] rounded-md bg-[#26262E] px-2.5 py-2 text-[11px] leading-snug text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                {hint}
              </span>
            </span>
          )}
          {action && <div className="ml-auto">{action}</div>}
        </div>
      )}
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

/* Not enough is a finding, not an empty state. It says what is missing, how
   far off it is, and what closes the gap. */
function TooEarly({ have, need, what }: { have: number; need: number; what: string }) {
  const pct = Math.min(100, Math.round((have / need) * 100));
  return (
    <div className="flex items-start gap-3 rounded-xl bg-[#FAFAFB] p-4">
      <Clock className="mt-0.5 size-4 shrink-0" style={{ color: FAINT }} strokeWidth={2} />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium" style={{ color: INK }}>
          Too early to read {what}
        </p>
        <p className="mt-1 text-[12px] leading-snug" style={{ color: MUTED }}>
          {have} of about {need} needed before a rate here means anything. Until
          then the number would move on one person.
        </p>
        <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-[#EAEAEF]">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: ACCENT }}
          />
        </div>
      </div>
    </div>
  );
}

function Delta({ value }: { value: number | null }) {
  if (value === null)
    return (
      <span className="text-[12px]" style={{ color: FAINT }}>
        no earlier period
      </span>
    );
  const up = value >= 0;
  const Icon = up ? ArrowUp : ArrowDown;
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[12px] font-medium"
      style={{ color: up ? "#15803D" : "#B91C1C" }}
    >
      <Icon className="size-3" strokeWidth={2.5} />
      {Math.abs(value) >= 100 ? Math.round(Math.abs(value)) : Math.abs(value).toFixed(0)}%
    </span>
  );
}

/* The journey. One row of steps, each a bar against the first — readable at
   four people and at forty thousand, which a Sankey is not. The drop between
   steps is the thing being measured, so it is drawn rather than left to be
   worked out. */
function Journey({
  now,
  prev,
  thin,
}: {
  now: Period;
  prev: Period;
  thin: boolean;
}) {
  const steps = [
    { key: "visits", label: "Saw the agent", value: now.visits, was: prev.visits, Icon: Users },
    { key: "opens", label: "Opened it", value: now.opens, was: prev.opens, Icon: MousePointerClick },
    { key: "conversations", label: "Said something", value: now.conversations, was: prev.conversations, Icon: MessageSquare },
    { key: "outcomes", label: "Reached an outcome", value: now.outcomes, was: prev.outcomes, Icon: Target },
  ];
  const top = steps[0].value || 1;

  /* Where the most people are lost, in absolute terms — a 90% drop on a step
     two people reach is not the problem a 40% drop on four thousand is. */
  const worst = steps
    .slice(1)
    .map((s, i) => ({ ...s, lost: steps[i].value - s.value, from: steps[i].label }))
    .sort((a, b) => b.lost - a.lost)[0];

  return (
    <div>
      <div className="flex flex-col gap-3">
        {steps.map((s, i) => {
          const share = (s.value / top) * 100;
          const ofPrev = i === 0 ? null : rate(s.value, steps[i - 1].value);
          const isWorst = worst && s.key === worst.key && worst.lost > 0;
          return (
            <div key={s.key} className="flex items-center gap-3">
              <s.Icon className="size-4 shrink-0" style={{ color: FAINT }} strokeWidth={2} />
              <span className="w-[150px] shrink-0 text-[13px]" style={{ color: INK }}>
                {s.label}
              </span>
              <div className="relative h-8 min-w-0 flex-1 overflow-hidden rounded-lg bg-[#F4F4F7]">
                <div
                  className="h-full rounded-lg transition-all duration-500"
                  style={{
                    width: `${Math.max(share, s.value > 0 ? 2 : 0)}%`,
                    background:
                      i === 0
                        ? "#D9CDEA"
                        : i === steps.length - 1
                          ? ACCENT
                          : `color-mix(in oklab, ${ACCENT} ${45 + i * 18}%, #E6E0F0)`,
                  }}
                />
              </div>
              <span
                className="w-[74px] shrink-0 text-right text-[14px] font-semibold tabular-nums"
                style={{ color: s.value === 0 ? FAINT : INK }}
              >
                {s.value === 0 ? "—" : compact(s.value)}
              </span>
              <span className="w-[86px] shrink-0 text-right text-[12px] tabular-nums" style={{ color: MUTED }}>
                {ofPrev === null ? (
                  "of everyone"
                ) : thin ? (
                  <span style={{ color: FAINT }}>
                    {s.value} of {steps[i - 1].value}
                  </span>
                ) : (
                  `${ofPrev}% of above`
                )}
              </span>
              {isWorst && !thin && (
                <span className="shrink-0 rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#92400E]">
                  biggest drop
                </span>
              )}
              {!isWorst && <span className="w-[86px] shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── what to do about it ──────────────────────────────────────────────────
   Derived from the numbers rather than written down, so a suggestion cannot
   outlive the thing that prompted it. Three at most: a list of twelve is a
   backlog, and nobody acts on a backlog. */
function advice(now: Period, thin: boolean) {
  const out: { title: string; why: string; cta: string }[] = [];
  if (now.outcomes === 0 && now.conversations > 0) {
    out.push({
      title: "Say what counts as a win",
      why: "Conversations are happening and none of them is being scored, so the one number a business cares about is blank.",
      cta: "Choose outcomes",
    });
  }
  const openRate = now.visits > 0 ? now.opens / now.visits : 0;
  if (!thin && openRate < 0.25 && now.visits > 0) {
    out.push({
      title: "Fewer than a quarter open it",
      why: `${compact(now.visits - now.opens)} people saw the launcher and walked past. A message that speaks first usually moves this more than anything on the button.`,
      cta: "Try a floating message",
    });
  }
  const talkRate = now.opens > 0 ? now.conversations / now.opens : 0;
  if (!thin && talkRate < 0.6 && now.opens > 0) {
    out.push({
      title: "People open it and leave",
      why: "They got as far as the panel and did not type. Usually the greeting asks for effort before it offers anything.",
      cta: "Edit the greeting",
    });
  }
  if (thin) {
    out.push({
      title: "Send it some traffic",
      why: "Nothing here will mean much until a few dozen people have seen it. Rates on single figures move on one person.",
      cta: "Check where it is installed",
    });
  }
  return out.slice(0, 3);
}

/* ── the sidebar ──────────────────────────────────────────────────────────
   Grouped by what a person is trying to do rather than by which team built
   it: the conversations and the people having them, then the things the
   agent is made of, then what came of it. Analytics sits under Insights on
   its own, because it is the only section that is about the others rather
   than a thing you edit. */
const NAV: { group: string; items: { label: string; Icon: typeof Users }[] }[] = [
  {
    group: "Engagement",
    items: [
      { label: "Conversations", Icon: MessageSquare },
      { label: "Campaigns", Icon: Megaphone },
      { label: "Users", Icon: Users },
    ],
  },
  {
    group: "AI resources",
    items: [
      { label: "AI Agents", Icon: Bot },
      { label: "Knowledge", Icon: BookOpen },
      { label: "Tools", Icon: Wrench },
    ],
  },
  { group: "Insights", items: [{ label: "Analytics", Icon: BarChart3 }] },
];

function Sidebar() {
  return (
    <aside
      className="flex w-[208px] shrink-0 flex-col border-r bg-white"
      style={{ borderColor: LINE }}
    >
      {/* the workspace, which is the thing everything below belongs to */}
      <button
        className="flex items-center gap-2.5 border-b px-4 py-4 text-left"
        style={{ borderColor: LINE }}
      >
        <span
          className="grid size-9 shrink-0 place-items-center rounded-xl text-white"
          style={{ background: ACCENT }}
        >
          <Sparkles className="size-[18px]" strokeWidth={2.2} />
        </span>
        <span className="min-w-0 flex-1 truncate text-[15px] font-semibold" style={{ color: INK }}>
          Tars
        </span>
        <ChevronsUpDown className="size-4 shrink-0" style={{ color: FAINT }} strokeWidth={2} />
      </button>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {NAV.map((g, gi) => (
          <div key={g.group} className={gi > 0 ? "mt-5 border-t pt-5" : ""} style={gi > 0 ? { borderColor: LINE } : undefined}>
            <p
              className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: FAINT }}
            >
              {g.group}
            </p>
            {g.items.map((it) => {
              const on = it.label === "Analytics";
              return (
                <button
                  key={it.label}
                  className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-[14px] transition-colors ${
                    on ? "bg-[#F4F1FB] font-semibold" : "hover:bg-[#F7F7F9]"
                  }`}
                  style={{ color: on ? "#5B2A8F" : "#3D4350" }}
                >
                  <it.Icon
                    className="size-[18px] shrink-0"
                    strokeWidth={2}
                    style={{ color: on ? ACCENT : "#8A8F9C" }}
                  />
                  {it.label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="flex items-center justify-between border-t px-4 py-3" style={{ borderColor: LINE }}>
        <span className="size-8 rounded-full bg-[#E7E3F0]" />
        <span className="grid size-8 place-items-center rounded-lg" style={{ color: FAINT }}>
          <PanelLeft className="size-[18px]" strokeWidth={2} />
        </span>
      </div>
    </aside>
  );
}

/* ── the agents ───────────────────────────────────────────────────────────
   The thing the old page hid in a dropdown labelled "testing". An account has
   several agents and they are the first choice anybody makes here — every
   number on the page is about one of them — so they belong in the column, not
   behind a chevron that shows one name and hides the rest.

   Each row carries its own headline number, which is the part a dropdown
   cannot do: you can see which agent is busy before you pick one. */
type Agent = {
  id: string;
  name: string;
  where: string;
  state: "live" | "draft" | "paused";
  conversations: number;
};

const AGENTS: Agent[] = [
  { id: "testing", name: "testing", where: "globalpayments.com", state: "live", conversations: 2 },
  { id: "support", name: "Support assistant", where: "/support", state: "live", conversations: 0 },
  { id: "pricing", name: "Pricing helper", where: "/pricing", state: "draft", conversations: 0 },
];

const STATE_DOT: Record<Agent["state"], string> = {
  live: "#22C55E",
  draft: "#C4C8D1",
  paused: "#E8A33D",
};

/* What people asked, most asked first, with how often the agent could answer.

   Volume alone would sort the list by what the website is about. The second
   number is the one worth reading: a question asked four hundred times and
   answered every time is the agent working, and the same question answered a
   quarter of the time is a content gap with four hundred people behind it. */
function Questions({ f, thin }: { f: Fixture; thin: boolean }) {
  const top = Math.max(...f.questions.map((q) => q.count), 1);
  return (
    <Card
      title="What people ask"
      hint="Grouped by meaning rather than by wording, so “what do you charge” and “how much is it” are one row."
      action={
        <span className="text-[12px]" style={{ color: MUTED }}>
          {f.questions.length} {f.questions.length === 1 ? "question" : "questions"}
        </span>
      }
    >
      <div className="flex flex-col gap-2.5">
        {f.questions.map((q) => {
          const ok = q.count > 0 ? q.answered / q.count : 0;
          const weak = ok < 0.7;
          return (
            <div key={q.text} className="flex items-center gap-3">
              <span className="w-[300px] shrink-0 truncate text-[13px]" style={{ color: INK }}>
                {q.text}
              </span>
              <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[#F1F1F5]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(q.count / top) * 100}%`, background: "#CDBCE4" }}
                />
              </div>
              <span className="w-[52px] shrink-0 text-right text-[12px] tabular-nums" style={{ color: MUTED }}>
                {compact(q.count)}
              </span>
              <span
                className="w-[92px] shrink-0 text-right text-[12px] font-medium tabular-nums"
                style={{ color: weak ? "#B45309" : "#15803D" }}
              >
                {thin
                  ? `${q.answered}/${q.count} answered`
                  : `${Math.round(ok * 100)}% answered`}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 border-t pt-3 text-[12px]" style={{ borderColor: LINE, color: MUTED }}>
        Anything under 70% answered is a gap in the knowledge base rather than
        a problem with the agent.
      </p>
    </Card>
  );
}

/* Where it let people down. Four failures, ranked by how many people hit
   them — a rare failure and a constant one are different problems, and a list
   sorted alphabetically hides which is which. */
const GAP_COPY: Record<
  Fixture["gaps"][number]["kind"],
  { label: string; fix: string; tone: string }
> = {
  unanswered: { label: "No answer", fix: "Add to knowledge", tone: "#B91C1C" },
  handoff: { label: "Asked for a person", fix: "Review the greeting", tone: "#B45309" },
  repeated: { label: "Asked twice", fix: "Check the answer reads", tone: "#B45309" },
  abandoned: { label: "Left mid-answer", fix: "Shorten the reply", tone: "#6B7280" },
};

function Gaps({ f, thin }: { f: Fixture; thin: boolean }) {
  const total = f.gaps.reduce((n, g) => n + g.count, 0);
  return (
    <Card
      title="Where it fails"
      hint="Counted per conversation, so one person asking the same unanswered thing twice is one gap rather than two."
      action={
        <span className="text-[12px]" style={{ color: MUTED }}>
          {compact(total)} in {thin ? `${f.now.conversations} conversations` : `${compact(f.now.conversations)} conversations`}
        </span>
      }
    >
      {f.gaps.length === 0 ? (
        <div className="rounded-xl bg-[#F6FBF7] p-4 text-[13px]" style={{ color: "#15803D" }}>
          Nothing went wrong in this period.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {f.gaps.map((g) => {
            const c = GAP_COPY[g.kind];
            return (
              <div
                key={g.text}
                className="flex items-center gap-3 rounded-xl border px-3.5 py-3"
                style={{ borderColor: LINE }}
              >
                <span
                  className="w-[130px] shrink-0 rounded-full px-2 py-0.5 text-center text-[11px] font-semibold"
                  style={{ color: c.tone, background: `color-mix(in oklab, ${c.tone} 10%, white)` }}
                >
                  {c.label}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px]" style={{ color: INK }}>
                  {g.text}
                </span>
                <span className="shrink-0 text-[14px] font-semibold tabular-nums" style={{ color: INK }}>
                  {compact(g.count)}
                </span>
                <button className="shrink-0 text-[12px] font-semibold" style={{ color: "#7C3AED" }}>
                  {c.fix}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

/* ── the second sidebar ───────────────────────────────────────────────────
   The first column says which part of the product you are in. This one says
   which question you are asking of it — and it is what lets Overview stay a
   single screen that answers three things, instead of a scroll that answers
   nine.

   Views rather than anchors. A sub-nav that scrolls a long page is a table of
   contents wearing a sidebar's clothes: you still pay for every section you
   are not reading, and the page still has no shape. */
type View = "overview" | "questions" | "gaps" | "dropoff" | "outcomes" | "where";

/* Named for the question each one answers, not for the shape of its data.
   "Sources" and "Captured" are column headings; "Where it works" and "What it
   produced" are things somebody wanted to know before they opened the page.

   Two of these did not exist before, and they are the two only a chat agent
   can answer: what people asked it, and where it let them down. Everything
   else on the old page could have been written about a landing page. */
const VIEWS: {
  id: View;
  label: string;
  note: string;
  Icon: typeof Users;
  needsTalk?: boolean;
}[] = [
  { id: "overview", label: "Is it working", note: "The short answer", Icon: TrendingUp },
  {
    id: "questions",
    label: "What people ask",
    note: "Every question, most asked first",
    Icon: MessageSquare,
    needsTalk: true,
  },
  {
    id: "gaps",
    label: "Where it fails",
    note: "Unanswered, handed off, given up on",
    Icon: AlertTriangle,
    needsTalk: true,
  },
  { id: "dropoff", label: "Where people leave", note: "The four steps, and the drop", Icon: MousePointerClick },
  { id: "outcomes", label: "What it produced", note: "Outcomes and what people shared", Icon: Target },
  { id: "where", label: "Where it works", note: "Pages, and the hours they arrive", Icon: Globe },
];

/* ── the page ─────────────────────────────────────────────────────────────── */

export default function AnalyticsV2() {
  /* The page reads whichever fixture is first. The switch that let you flip
     between a new agent and a busy one was the tool's own control rather than
     the product's, and it has served its purpose. */
  const fixtureId = "new";
  const [agentId, setAgentId] = useState("testing");
  const [view, setView] = useState<View>("overview");
  const [range, setRange] = useState("28d");
  const [metric, setMetric] = useState<"visits" | "conversations">("visits");

  const f = FIXTURES.find((x) => x.id === fixtureId)!;
  const { now, prev } = f;
  const thin = now.visits < FLOOR;

  const tips = advice(now, thin);
  const openPct = rate(now.opens, now.visits);
  const outcomePct = rate(now.outcomes, now.conversations);

  const maxSeries = Math.max(...f.series.map((d) => d[metric]), 1);
  const maxHour = Math.max(...f.hours.flat(), 1);

  return (
    <div className="flex h-screen bg-[#F7F7F9]">
      <Sidebar />
      <main className="min-h-0 flex-1 overflow-y-auto">
      {/* No max-width and no centring: capped at 1180 and centred, the gutter
          you measure is the leftover, not the padding — 12px of padding plus
          41px of nothing. Full width means the number in the style is the
          number on screen. */}
      <div className="p-4">
        {/* ── header ── */}
        <header className="mb-5 flex flex-wrap items-end gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-[26px] font-bold tracking-tight" style={{ color: INK }}>
              Analytics
            </h1>
            <p className="mt-1 text-[13px]" style={{ color: MUTED }}>
              {agentId === "all"
                ? `All ${AGENTS.length} agents, together`
                : `${AGENTS.find((a) => a.id === agentId)?.name} · ${AGENTS.find((a) => a.id === agentId)?.where}`}
            </p>
          </div>
        </header>

        {/* The reports, as a row. They were a column until the agents took it —
            and the agent is the bigger choice: every number in every report is
            about one of them. */}
        <div className="mb-4 flex flex-wrap gap-1 border-b pb-px" style={{ borderColor: LINE }}>
          {VIEWS.map((v) => {
            const on = view === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                title={v.note}
                className="relative flex items-center gap-1.5 px-3 py-2 text-[13px] transition-colors"
                style={{ color: on ? "#5B2A8F" : MUTED, fontWeight: on ? 600 : 400 }}
              >
                <v.Icon className="size-4" strokeWidth={2} style={{ color: on ? ACCENT : "#9AA0AC" }} />
                {v.label}
                {on && (
                  <span
                    className="absolute inset-x-2 -bottom-px h-[2px] rounded-full"
                    style={{ background: ACCENT }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ── filters ── */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-0.5 rounded-lg border bg-white p-0.5" style={{ borderColor: LINE }}>
            {["24h", "7d", "28d", "90d"].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-md px-3 py-1.5 text-[12px] transition-colors ${
                  range === r ? "bg-[#F4F1FB] font-semibold text-[#5B2A8F]" : "text-[#6B7280] hover:text-[#333]"
                }`}
              >
                {r}
              </button>
            ))}
            <button className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] text-[#6B7280]">
              <Calendar className="size-3.5" strokeWidth={2} />
              Custom
            </button>
          </div>
          <div className="relative">
            <select
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="h-[34px] appearance-none rounded-lg border bg-white pl-3 pr-8 text-[12px] text-[#4B5563] outline-none"
              style={{ borderColor: LINE }}
            >
              <option value="all">All agents</option>
              {AGENTS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2"
              style={{ color: FAINT }}
              strokeWidth={2}
            />
          </div>
          {["All channels", "Live"].map((x) => (
            <button
              key={x}
              className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-[12px] text-[#4B5563]"
              style={{ borderColor: LINE }}
            >
              {x}
              <ChevronDown className="size-3.5" style={{ color: FAINT }} strokeWidth={2} />
            </button>
          ))}
        </div>

        {view === "overview" && (
          <>
        {/* ── 1 · is it working ──
               One sentence and one number, not four tiles of equal weight.
               The old page opened on Visits, which is the metric a business
               cares about least — it counts people who did nothing. */}
        <section
          className="mb-4 overflow-hidden rounded-2xl border bg-white"
          style={{ borderColor: LINE }}
        >
          <div className="flex flex-wrap items-start gap-6 px-6 py-6">
            <div className="min-w-[260px] flex-1">
              <p className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: FAINT }}>
                Last {range}
              </p>
              <p className="mt-2 text-[22px] font-semibold leading-snug tracking-tight" style={{ color: INK }}>
                {thin ? (
                  <>
                    {now.visits} {now.visits === 1 ? "person" : "people"} saw the
                    agent, and {now.conversations} said something.
                  </>
                ) : (
                  <>
                    {compact(now.conversations)} conversations from{" "}
                    {compact(now.visits)} visits — {rate(now.conversations, now.visits)}%
                    of the people who saw it talked to it.
                  </>
                )}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: MUTED }}>
                {thin
                  ? "That is too little to draw a rate from, so nothing below is showing one yet. It will start once a few dozen people have been through."
                  : now.outcomes === 0
                    ? "No outcome is configured, so none of this is scored against anything a business would recognise."
                    : `${compact(now.outcomes)} reached an outcome — ${outcomePct}% of the conversations.`}
              </p>
            </div>

            <div className="flex shrink-0 gap-8">
              {[
                { label: "Conversations", value: now.conversations, was: prev.conversations },
                { label: "Outcomes", value: now.outcomes, was: prev.outcomes },
              ].map((m) => (
                <div key={m.label}>
                  <p className="text-[12px]" style={{ color: MUTED }}>
                    {m.label}
                  </p>
                  <p className="mt-1 text-[34px] font-bold leading-none tabular-nums" style={{ color: m.value ? INK : FAINT }}>
                    {m.value === 0 ? "—" : compact(m.value)}
                  </p>
                  <div className="mt-1.5">
                    <Delta value={delta(m.value, m.was)} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {tips.length > 0 && (
            /* ── 3 · what to do ── sitting with the headline rather than at
                   the bottom of the page: an observation nobody acts on is a
                   number, and the old page was six screens of those. */
            <div className="border-t px-6 py-4" style={{ borderColor: LINE, background: "#FCFBFE" }}>
              <p className="mb-2.5 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider" style={{ color: "#7C3AED" }}>
                <Lightbulb className="size-3.5" strokeWidth={2.2} />
                What to do next
              </p>
              <div className="grid gap-2.5 md:grid-cols-3">
                {tips.map((t) => (
                  <div
                    key={t.title}
                    className="rounded-xl border bg-white p-3.5"
                    style={{ borderColor: "#EDE7F8" }}
                  >
                    <p className="text-[13px] font-semibold" style={{ color: INK }}>
                      {t.title}
                    </p>
                    <p className="mt-1 text-[12px] leading-snug" style={{ color: MUTED }}>
                      {t.why}
                    </p>
                    <button className="mt-2.5 inline-flex items-center gap-1 text-[12px] font-semibold" style={{ color: "#7C3AED" }}>
                      {t.cta}
                      <ArrowRight className="size-3" strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── 2 · where people go ── */}
        <div className="mb-4">
          <Card
            title="The journey"
            hint="Every step is measured against the one above it. At small numbers the counts are shown instead of rates, because a rate off single figures moves on one person."
            action={
              <span className="text-[12px]" style={{ color: MUTED }}>
                {thin ? `${now.visits} people` : `${compact(now.visits)} people`}
              </span>
            }
          >
            <Journey now={now} prev={prev} thin={thin} />
            {!thin && (
              <p className="mt-4 border-t pt-3.5 text-[13px]" style={{ borderColor: LINE, color: MUTED }}>
                <span className="font-semibold" style={{ color: INK }}>
                  {compact(now.visits - now.opens)} of {compact(now.visits)}
                </span>{" "}
                never opened it — that is where most people are lost, and it is
                the cheapest step to move.
              </p>
            )}
          </Card>
        </div>

        {/* ── over time ── */}
        <div className="mb-4">
          <Card
            title="Over time"
            hint="Publishes are marked, so a change in the line can be read against a change you made."
            action={
              <div className="flex gap-0.5 rounded-lg bg-[#F4F4F7] p-0.5">
                {(["visits", "conversations"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMetric(m)}
                    className={`rounded-md px-2.5 py-1 text-[12px] capitalize transition-colors ${
                      metric === m ? "bg-white font-semibold text-[#5B2A8F] shadow-sm" : "text-[#6B7280]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            }
          >
            <div className="flex h-[160px] items-end gap-2">
              {f.series.map((d) => {
                const v = d[metric];
                const h = (v / maxSeries) * 100;
                const marked = f.published?.day === d.day;
                return (
                  <div key={d.day} className="group relative flex min-w-0 flex-1 flex-col items-center gap-2">
                    <div className="relative flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t-md transition-all"
                        style={{
                          height: `${Math.max(h, v > 0 ? 3 : 0)}%`,
                          background: v > 0 ? ACCENT : "transparent",
                          opacity: v > 0 ? 0.9 : 1,
                        }}
                      />
                      {marked && (
                        <span
                          className="pointer-events-none absolute inset-y-0 left-1/2 w-px"
                          style={{ background: "#E8A33D" }}
                        />
                      )}
                      <span className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 rounded bg-[#26262E] px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white opacity-0 transition-opacity group-hover:opacity-100">
                        {compact(v)}
                      </span>
                    </div>
                    <span className="text-[11px]" style={{ color: FAINT }}>
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
            {f.published && (
              <p className="mt-3 flex items-center gap-1.5 text-[11px]" style={{ color: MUTED }}>
                <span className="h-3 w-px" style={{ background: "#E8A33D" }} />
                {f.published.label} · {f.published.day}
              </p>
            )}
          </Card>
        </div>

        {/* ── where and when ── secondary, two up, and both honest when thin */}
        <div className="mb-4 grid gap-4 lg:grid-cols-2">
          <Card
            title="Where they come from"
            hint="The page the agent was on when somebody saw it."
          >
            {f.sources.length === 0 || thin ? (
              <TooEarly have={now.visits} need={FLOOR} what="which pages work" />
            ) : (
              <div className="flex flex-col gap-2.5">
                {f.sources.map((s) => {
                  const share = (s.visits / f.sources[0].visits) * 100;
                  const conv = rate(s.conversations, s.visits);
                  return (
                    <div key={s.name} className="flex items-center gap-3">
                      <Globe className="size-3.5 shrink-0" style={{ color: FAINT }} strokeWidth={2} />
                      <span className="w-[150px] shrink-0 truncate font-mono text-[12px]" style={{ color: INK }}>
                        {s.name}
                      </span>
                      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[#F1F1F5]">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${share}%`, background: "#CDBCE4" }}
                        />
                      </div>
                      <span className="w-[54px] shrink-0 text-right text-[12px] tabular-nums" style={{ color: MUTED }}>
                        {compact(s.visits)}
                      </span>
                      {/* The rate is the point: a page with a tenth of the
                          traffic and twice the conversion is the one worth
                          knowing about, and a bar sorted by volume hides it. */}
                      <span
                        className="w-[44px] shrink-0 text-right text-[12px] font-semibold tabular-nums"
                        style={{ color: Number(conv) >= 20 ? "#15803D" : INK }}
                      >
                        {conv}%
                      </span>
                    </div>
                  );
                })}
                <p className="mt-1 text-[11px]" style={{ color: FAINT }}>
                  Right-hand figure is the share who started a conversation.
                </p>
              </div>
            )}
          </Card>

          <Card title="When they come" hint="Local time, over the selected range.">
            {thin ? (
              <TooEarly have={now.visits} need={FLOOR} what="a weekly pattern" />
            ) : (
              <>
                <div className="flex flex-col gap-[3px]">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, di) => (
                    <div key={d} className="flex items-center gap-2">
                      <span className="w-7 shrink-0 text-[10px]" style={{ color: FAINT }}>
                        {d}
                      </span>
                      <div className="flex min-w-0 flex-1 gap-[3px]">
                        {f.hours[di].map((v, hi) => (
                          <span
                            key={hi}
                            title={`${d} ${hi}:00 — ${v}`}
                            className="h-4 min-w-0 flex-1 rounded-[3px]"
                            style={{
                              background:
                                v === 0
                                  ? "#F3F3F6"
                                  : `color-mix(in oklab, ${ACCENT} ${Math.round((v / maxHour) * 88) + 12}%, #EDE9F4)`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2 pl-9 text-[10px]" style={{ color: FAINT }}>
                  <span>12am</span>
                  <span className="flex-1 text-center">12pm</span>
                  <span>11pm</span>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* ── what people shared ── */}
        <Card
          title="What people shared"
          hint="Anything a form, a button or the agent itself saved during a conversation."
        >
          {f.fields.length === 0 ? (
            <div className="flex items-start gap-3 rounded-xl bg-[#FAFAFB] p-4">
              <Sparkles className="mt-0.5 size-4 shrink-0" style={{ color: FAINT }} strokeWidth={2} />
              <div>
                <p className="text-[13px] font-medium" style={{ color: INK }}>
                  Nothing captured yet
                </p>
                <p className="mt-1 text-[12px] leading-snug" style={{ color: MUTED }}>
                  {now.conversations > 0
                    ? `${now.conversations} conversations happened and none of them asked for anything. If the point is leads, the agent has to ask.`
                    : "Fields appear here once a conversation asks for something and someone answers."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {f.fields.map((x) => (
                <div key={x.name} className="rounded-xl border p-3.5" style={{ borderColor: LINE }}>
                  <p className="text-[12px]" style={{ color: MUTED }}>
                    {x.name}
                  </p>
                  <p className="mt-1 text-[20px] font-bold tabular-nums" style={{ color: INK }}>
                    {compact(x.count)}
                  </p>
                  <p className="mt-0.5 text-[11px]" style={{ color: FAINT }}>
                    {rate(x.count, now.conversations)}% of conversations
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

          </>
        )}
        {view === "questions" && <Questions f={f} thin={thin} />}

        {view === "gaps" && <Gaps f={f} thin={thin} />}

        {view === "dropoff" && <>
        {/* ── 2 · where people go ── */}
        <div className="mb-4">
          <Card
            title="The journey"
            hint="Every step is measured against the one above it. At small numbers the counts are shown instead of rates, because a rate off single figures moves on one person."
            action={
              <span className="text-[12px]" style={{ color: MUTED }}>
                {thin ? `${now.visits} people` : `${compact(now.visits)} people`}
              </span>
            }
          >
            <Journey now={now} prev={prev} thin={thin} />
            {!thin && (
              <p className="mt-4 border-t pt-3.5 text-[13px]" style={{ borderColor: LINE, color: MUTED }}>
                <span className="font-semibold" style={{ color: INK }}>
                  {compact(now.visits - now.opens)} of {compact(now.visits)}
                </span>{" "}
                never opened it — that is where most people are lost, and it is
                the cheapest step to move.
              </p>
            )}
          </Card>
        </div>

        {/* ── over time ── */}
        <div className="mb-4">
          <Card
            title="Over time"
            hint="Publishes are marked, so a change in the line can be read against a change you made."
            action={
              <div className="flex gap-0.5 rounded-lg bg-[#F4F4F7] p-0.5">
                {(["visits", "conversations"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMetric(m)}
                    className={`rounded-md px-2.5 py-1 text-[12px] capitalize transition-colors ${
                      metric === m ? "bg-white font-semibold text-[#5B2A8F] shadow-sm" : "text-[#6B7280]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            }
          >
            <div className="flex h-[160px] items-end gap-2">
              {f.series.map((d) => {
                const v = d[metric];
                const h = (v / maxSeries) * 100;
                const marked = f.published?.day === d.day;
                return (
                  <div key={d.day} className="group relative flex min-w-0 flex-1 flex-col items-center gap-2">
                    <div className="relative flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t-md transition-all"
                        style={{
                          height: `${Math.max(h, v > 0 ? 3 : 0)}%`,
                          background: v > 0 ? ACCENT : "transparent",
                          opacity: v > 0 ? 0.9 : 1,
                        }}
                      />
                      {marked && (
                        <span
                          className="pointer-events-none absolute inset-y-0 left-1/2 w-px"
                          style={{ background: "#E8A33D" }}
                        />
                      )}
                      <span className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 rounded bg-[#26262E] px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white opacity-0 transition-opacity group-hover:opacity-100">
                        {compact(v)}
                      </span>
                    </div>
                    <span className="text-[11px]" style={{ color: FAINT }}>
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
            {f.published && (
              <p className="mt-3 flex items-center gap-1.5 text-[11px]" style={{ color: MUTED }}>
                <span className="h-3 w-px" style={{ background: "#E8A33D" }} />
                {f.published.label} · {f.published.day}
              </p>
            )}
          </Card>
        </div>

        </>}
        {view === "where" && <>
        {/* ── where and when ── secondary, two up, and both honest when thin */}
        <div className="mb-4 grid gap-4 lg:grid-cols-2">
          <Card
            title="Where they come from"
            hint="The page the agent was on when somebody saw it."
          >
            {f.sources.length === 0 || thin ? (
              <TooEarly have={now.visits} need={FLOOR} what="which pages work" />
            ) : (
              <div className="flex flex-col gap-2.5">
                {f.sources.map((s) => {
                  const share = (s.visits / f.sources[0].visits) * 100;
                  const conv = rate(s.conversations, s.visits);
                  return (
                    <div key={s.name} className="flex items-center gap-3">
                      <Globe className="size-3.5 shrink-0" style={{ color: FAINT }} strokeWidth={2} />
                      <span className="w-[150px] shrink-0 truncate font-mono text-[12px]" style={{ color: INK }}>
                        {s.name}
                      </span>
                      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[#F1F1F5]">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${share}%`, background: "#CDBCE4" }}
                        />
                      </div>
                      <span className="w-[54px] shrink-0 text-right text-[12px] tabular-nums" style={{ color: MUTED }}>
                        {compact(s.visits)}
                      </span>
                      {/* The rate is the point: a page with a tenth of the
                          traffic and twice the conversion is the one worth
                          knowing about, and a bar sorted by volume hides it. */}
                      <span
                        className="w-[44px] shrink-0 text-right text-[12px] font-semibold tabular-nums"
                        style={{ color: Number(conv) >= 20 ? "#15803D" : INK }}
                      >
                        {conv}%
                      </span>
                    </div>
                  );
                })}
                <p className="mt-1 text-[11px]" style={{ color: FAINT }}>
                  Right-hand figure is the share who started a conversation.
                </p>
              </div>
            )}
          </Card>

        </div>

        {/* ── where and when ── secondary, two up, and both honest when thin */}
        <div className="mb-4 grid gap-4 lg:grid-cols-2">

          <Card title="When they come" hint="Local time, over the selected range.">
            {thin ? (
              <TooEarly have={now.visits} need={FLOOR} what="a weekly pattern" />
            ) : (
              <>
                <div className="flex flex-col gap-[3px]">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, di) => (
                    <div key={d} className="flex items-center gap-2">
                      <span className="w-7 shrink-0 text-[10px]" style={{ color: FAINT }}>
                        {d}
                      </span>
                      <div className="flex min-w-0 flex-1 gap-[3px]">
                        {f.hours[di].map((v, hi) => (
                          <span
                            key={hi}
                            title={`${d} ${hi}:00 — ${v}`}
                            className="h-4 min-w-0 flex-1 rounded-[3px]"
                            style={{
                              background:
                                v === 0
                                  ? "#F3F3F6"
                                  : `color-mix(in oklab, ${ACCENT} ${Math.round((v / maxHour) * 88) + 12}%, #EDE9F4)`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2 pl-9 text-[10px]" style={{ color: FAINT }}>
                  <span>12am</span>
                  <span className="flex-1 text-center">12pm</span>
                  <span>11pm</span>
                </div>
              </>
            )}
          </Card>
        </div>

        </>}
        {view === "outcomes" && <>
        {/* ── what people shared ── */}
        <Card
          title="What people shared"
          hint="Anything a form, a button or the agent itself saved during a conversation."
        >
          {f.fields.length === 0 ? (
            <div className="flex items-start gap-3 rounded-xl bg-[#FAFAFB] p-4">
              <Sparkles className="mt-0.5 size-4 shrink-0" style={{ color: FAINT }} strokeWidth={2} />
              <div>
                <p className="text-[13px] font-medium" style={{ color: INK }}>
                  Nothing captured yet
                </p>
                <p className="mt-1 text-[12px] leading-snug" style={{ color: MUTED }}>
                  {now.conversations > 0
                    ? `${now.conversations} conversations happened and none of them asked for anything. If the point is leads, the agent has to ask.`
                    : "Fields appear here once a conversation asks for something and someone answers."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {f.fields.map((x) => (
                <div key={x.name} className="rounded-xl border p-3.5" style={{ borderColor: LINE }}>
                  <p className="text-[12px]" style={{ color: MUTED }}>
                    {x.name}
                  </p>
                  <p className="mt-1 text-[20px] font-bold tabular-nums" style={{ color: INK }}>
                    {compact(x.count)}
                  </p>
                  <p className="mt-0.5 text-[11px]" style={{ color: FAINT }}>
                    {rate(x.count, now.conversations)}% of conversations
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        </>}
        <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px]" style={{ color: FAINT }}>
          <TrendingUp className="size-3" strokeWidth={2} />
          Rates are hidden under {FLOOR} visits. A percentage off single figures
          is a lie told in a precise voice.
        </p>
      </div>
      </main>
    </div>
  );
}
