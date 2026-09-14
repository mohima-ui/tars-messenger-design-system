"use client";

/* ─── Analytics ───────────────────────────────────────────────────────────
   One screen, and a picker that says what it is counting.

   It started as three screens behind a sidebar — fleet, customer, agent — and
   the sidebar was doing two jobs badly: half its items were kinds of question
   (Conversations, Outcomes, Quality) and half were scopes of the same
   question. The scopes won. The funnel does not change meaning between an
   agent and an account, so there was never a second screen to build — only a
   second thing to count.

   So: the dropdown is the navigation. An account holder sees their own agents
   in it; a super admin sees every customer's. Same body underneath, and the
   blocks that only make sense at one scope (the A/B, what got pressed, the
   list of things that need a look) appear and disappear with it.

   The picker is not the permission boundary. It shows what the account is
   already allowed to read — the filtering that matters happens where the rows
   come from, which here is a fixture and in production is a query with the
   account id in it. */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Globe,
  Link2,
  MessageCircle,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import { DashboardRails } from "@/components/dashboard/DashboardRails";
import {
  AGENT,
  AGENTS,
  DAYS,
  FLOOR,
  ROWS,
  SUGGESTIONS,
  SURFACES,
  SURFACE_ORDER,
  TENANT,
  TENANTS,
  type Surface,
  type TenantId,
  type Totals,
  byDate,
  compact,
  full,
  pct,
  periods,
  rate,
  total,
} from "./data";
import {
  AB,
  Card,
  Funnel,
  NotEnough,
  SERIES,
  Spark,
  StatTile,
  StatusChip,
  type Step,
  type Tone,
  Trend,
} from "./parts";

/* What the screen is counting. */
type Scope =
  | { kind: "all" }
  | { kind: "tenant"; id: TenantId }
  | { kind: "agent"; id: string };

/* Who is looking. A customer sees one account; a super admin sees the fleet.
   Here it is a toggle so both versions can be walked through in one demo — in
   production it is whatever the session says and not a control at all. */
type Role = { kind: "admin" } | { kind: "tenant"; id: TenantId };

const RANGES = [7, 30, 90] as const;

/* Identified by mark and word, never by colour — the same rule the status
   chips follow, and for the same reason. */
const SURFACE_ICON: Record<Surface, typeof Globe> = {
  widget: Globe,
  link: Link2,
  mobile: Smartphone,
  whatsapp: MessageCircle,
};

/* ── derived reads ──────────────────────────────────────────────────────── */

/* The half of the funnel that is identical on every surface. A conversation
   is a conversation whether it began with a launcher, a link or a message,
   and this is the only part of the screen that may be added up across them. */
const conversation = (t: Totals, outcome: string): Step[] => [
  { label: "Started", value: t.engaged, hint: "sent at least one message" },
  { label: "3+ turns", value: t.deep, hint: "got past the first exchange" },
  { label: outcome, value: t.outcomes, hint: "the customer's own goal" },
];

/* The half that isn't. Each surface names its own steps and reads its own
   fields; where a surface has no second step, there is one row and no
   invented one. */
const arrival = (t: Totals, surface: Surface): Step[] =>
  SURFACES[surface].arrival.map((a) => ({
    label: a.label,
    value: t[a.key],
    hint: a.hint,
  }));

/* Order matters: "no opens at all" outranks "a few too many mis-clicks", and
   both outrank "fine". */
function health(t: Totals): { tone: Tone; label: string } {
  if (t.impressions < FLOOR) return { tone: "idle", label: "Not enough data" };
  if (t.opens === 0) return { tone: "critical", label: "No opens" };
  if (rate(t.errors, t.impressions) > 0.05) return { tone: "critical", label: "Errors" };
  if (rate(t.misclicks, t.opens) > 0.22) return { tone: "warning", label: "Mis-clicks" };
  if (rate(t.engaged, t.opens) < 0.4) return { tone: "warning", label: "Low engagement" };
  return { tone: "good", label: "Healthy" };
}

const delta = (now: number, prev: number) => (prev === 0 ? undefined : (now - prev) / prev);

const TONE_DOT: Record<Tone, string> = {
  good: "#0ca30c",
  warning: "#fab219",
  critical: "#d03b3b",
  idle: "#C9C9D2",
};

/* ── the picker ─────────────────────────────────────────────────────────── */

/* Defined out here rather than inside the picker: a component declared in a
   render body is a new component type on every keystroke, so React throws away
   the DOM under it — which in a menu with a search field means the field loses
   focus as you type. */
function ScopeRow({
  target,
  scope,
  name,
  detail,
  indent,
  state,
  onPick,
}: {
  target: Scope;
  scope: Scope;
  name: string;
  detail?: string;
  indent?: boolean;
  state: { tone: Tone; label: string };
  onPick: (s: Scope) => void;
}) {
  const on =
    target.kind === scope.kind &&
    ("id" in target && "id" in scope ? target.id === scope.id : true);
  return (
    <button
      onClick={() => onPick(target)}
      className={`flex w-full items-center gap-2.5 rounded-lg py-2 pr-2 text-left transition-colors hover:bg-[#F5F4F8] ${
        indent ? "pl-7" : "pl-2.5"
      } ${on ? "bg-[#F3EEFC]" : ""}`}
    >
      {/* The dot is the alert list, folded into the picker: a broken agent has
          to be findable before it is selected, or the only way to notice one is
          to open all twelve. */}
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{ background: TONE_DOT[state.tone] }}
        aria-hidden
      />
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-[13px] ${on ? "font-medium text-[#6D33AA]" : "text-[#27272A]"}`}
        >
          {name}
        </span>
        {detail && <span className="block truncate text-[11px] text-[#A1A1AA]">{detail}</span>}
      </span>
      {state.tone !== "good" && state.tone !== "idle" && (
        <span className="shrink-0 text-[10.5px] font-medium text-[#A1A1AA]">{state.label}</span>
      )}
      {on && <Check className="size-3.5 shrink-0 text-[#6D33AA]" strokeWidth={2.4} />}
    </button>
  );
}

function ScopePicker({
  role,
  scope,
  onScope,
  stateOf,
}: {
  role: Role;
  scope: Scope;
  onScope: (s: Scope) => void;
  stateOf: (s: Scope) => { tone: Tone; label: string };
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const tenants = role.kind === "admin" ? TENANTS : TENANTS.filter((t) => t.id === role.id);
  const visible = AGENTS.filter((a) => role.kind === "admin" || a.tenant === role.id);

  const label =
    scope.kind === "all"
      ? role.kind === "admin"
        ? "All customers"
        : "All agents"
      : scope.kind === "tenant"
        ? TENANT[scope.id].name
        : AGENT[scope.id].name;

  const sub =
    scope.kind === "agent"
      ? `${TENANT[AGENT[scope.id].tenant].name} · ${AGENT[scope.id].scope}`
      : scope.kind === "tenant"
        ? `${AGENTS.filter((a) => a.tenant === scope.id).length} agents`
        : `${visible.length} agents`;

  /* Search only once the list is long enough to need it — a search box над
     five rows is furniture. */
  const pick = (s: Scope) => {
    onScope(s);
    setOpen(false);
    setQuery("");
  };

  const searchable = visible.length > 8;
  const hit = (text: string) => text.toLowerCase().includes(query.trim().toLowerCase());

  return (
    <div ref={box} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex min-w-[220px] items-center gap-2.5 rounded-lg border border-[#E4E4EA] px-3 py-1.5 text-left transition-colors hover:bg-[#FAFAFB]"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-[#18181B]">{label}</span>
          <span className="block truncate text-[11px] text-[#A1A1AA]">{sub}</span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-[#A1A1AA]" strokeWidth={2} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute top-full left-0 z-40 mt-1.5 max-h-[420px] w-[330px] overflow-y-auto rounded-xl border border-[#EAEAEF] bg-white p-1.5 shadow-[0_18px_40px_-12px_rgba(15,17,26,0.28)]"
        >
          {searchable && (
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search agents"
              className="mb-1 w-full rounded-lg bg-[#F5F4F8] px-3 py-2 text-[13px] text-[#27272A] outline-none placeholder:text-[#A1A1AA]"
            />
          )}

          {!query && (
            <ScopeRow
              target={{ kind: "all" }}
              scope={scope}
              state={stateOf({ kind: "all" })}
              onPick={pick}
              name={role.kind === "admin" ? "All customers" : "All agents"}
              detail={`Every agent you can see · ${visible.length}`}
            />
          )}

          {tenants.map((t) => {
            const mine = visible.filter((a) => a.tenant === t.id);
            const shown = mine.filter((a) => !query || hit(a.name) || hit(a.scope) || hit(t.name));
            if (shown.length === 0) return null;
            return (
              <div key={t.id} className="mt-1">
                {/* A customer is a row you can select, not just a heading —
                    "how is Brightline doing" is a question, and making it a
                    label would mean answering it by selecting each agent in
                    turn and adding up. */}
                {role.kind === "admin" && !query && (
                  <ScopeRow
                    target={{ kind: "tenant", id: t.id }}
                    scope={scope}
                    state={stateOf({ kind: "tenant", id: t.id })}
                    onPick={pick}
                    name={t.name}
                    detail={t.site}
                  />
                )}
                {shown.map((a) => (
                  <ScopeRow
                    key={a.id}
                    target={{ kind: "agent", id: a.id }}
                    scope={scope}
                    state={stateOf({ kind: "agent", id: a.id })}
                    onPick={pick}
                    name={a.name}
                    detail={
                      role.kind === "admin" && query ? `${t.name} · ${a.scope}` : a.scope
                    }
                    indent={role.kind === "admin" && !query}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── who is looking ─────────────────────────────────────────────────────── */

function RoleMenu({ role, onRole }: { role: Role; onRole: (r: Role) => void }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [open]);

  return (
    <div ref={box} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] text-[#52525B] transition-colors hover:bg-[#F4F4F6]"
      >
        {role.kind === "admin" ? (
          <>
            <ShieldCheck className="size-3.5 text-[#6D33AA]" strokeWidth={2} aria-hidden />
            <span className="font-medium text-[#6D33AA]">Super admin</span>
          </>
        ) : (
          <>Signed in as {TENANT[role.id].name}</>
        )}
        <ChevronDown className="size-3.5 text-[#A1A1AA]" strokeWidth={2} />
      </button>

      {open && (
        <div className="absolute top-full right-0 z-40 mt-1.5 w-[230px] rounded-xl border border-[#EAEAEF] bg-white p-1.5 shadow-[0_18px_40px_-12px_rgba(15,17,26,0.28)]">
          <div className="px-2.5 py-1.5 text-[10.5px] font-medium tracking-[0.06em] text-[#A1A1AA] uppercase">
            View this demo as
          </div>
          {[{ kind: "admin" } as Role, ...TENANTS.map((t) => ({ kind: "tenant", id: t.id }) as Role)].map(
            (r) => {
              const on =
                r.kind === role.kind && (r.kind === "admin" || r.id === (role as { id: TenantId }).id);
              return (
                <button
                  key={r.kind === "admin" ? "admin" : r.id}
                  onClick={() => {
                    onRole(r);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors hover:bg-[#F5F4F8] ${
                    on ? "font-medium text-[#6D33AA]" : "text-[#27272A]"
                  }`}
                >
                  {r.kind === "admin" ? "Super admin — every customer" : TENANT[r.id].name}
                  {on && <Check className="ml-auto size-3.5" strokeWidth={2.4} />}
                </button>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}

/* ── the screen ─────────────────────────────────────────────────────────── */

/* Four tiles, and the last two never move.

   Whatever is selected, "Outcomes" and "Outcome rate" sit in the third and
   fourth slot — so the answer to "is this working" is always in the same place
   and the page reads as one screen rather than one per surface. The first two
   change with the surface, because reach and the step after it are the parts
   that genuinely differ: impressions and an open rate on a launcher, delivered
   and a read rate on WhatsApp, visits and a start rate on a link.

   Nothing is ever drawn as zero because it does not apply. A tile that cannot
   be computed on this surface is not rendered. */
function Tiles({
  now,
  prev,
  outcome,
  surface,
}: {
  now: Totals;
  prev: Totals;
  outcome: string;
  surface: Surface | "all";
}) {
  const thin = now.impressions < FLOOR;
  /* At the longest range there is no earlier window held to compare against,
     so the tiles say that rather than printing a delta against nothing. */
  const base = prev.impressions > 0 ? undefined : "no earlier window held";

  const lead: React.ReactNode[] =
    surface === "all"
      ? [
          /* Counts roll up across surfaces; rates do not. So the cross-surface
             pair is a count and one of the two rates that mean the same thing
             everywhere. */
          <StatTile
            key="conv"
            label="Conversations"
            value={compact(now.engaged)}
            delta={delta(now.engaged, prev.engaged)}
            note={base ?? "started, every surface"}
          />,
          <StatTile
            key="deep"
            label="Kept going"
            value={thin ? "—" : pct(rate(now.deep, now.engaged))}
            delta={thin ? undefined : delta(rate(now.deep, now.engaged), rate(prev.deep, prev.engaged))}
            muted={thin}
            note={thin ? "below the reporting floor" : (base ?? "reached three turns")}
          />,
        ]
      : [
          <StatTile
            key="reach"
            label={SURFACES[surface].reach}
            value={compact(now.impressions)}
            delta={delta(now.impressions, prev.impressions)}
            note={base}
          />,
          <StatTile
            key="passed"
            label={SURFACES[surface].passed}
            value={
              thin
                ? "—"
                : pct(
                    surface === "link"
                      ? rate(now.engaged, now.impressions)
                      : rate(now.opens, now.impressions),
                  )
            }
            delta={
              thin
                ? undefined
                : surface === "link"
                  ? delta(rate(now.engaged, now.impressions), rate(prev.engaged, prev.impressions))
                  : delta(rate(now.opens, now.impressions), rate(prev.opens, prev.impressions))
            }
            muted={thin}
            note={thin ? "below the reporting floor" : base}
          />,
        ];

  const tiles = [
    ...lead,
    <StatTile
      key="out"
      label={outcome}
      value={full(now.outcomes)}
      delta={delta(now.outcomes, prev.outcomes)}
      note={base ?? "count"}
    />,
    <StatTile
      key="rate"
      label="Outcome rate"
      value={thin ? "—" : pct(rate(now.outcomes, now.engaged))}
      delta={
        thin ? undefined : delta(rate(now.outcomes, now.engaged), rate(prev.outcomes, prev.engaged))
      }
      muted={thin}
      note={thin ? "below the reporting floor" : "of conversations started"}
    />,
  ];

  /* WhatsApp is billed per 24-hour conversation, so it carries a number the
     other surfaces have no equivalent of. It appears only where it is real
     rather than as an empty column everywhere else. */
  if (now.cost > 0) {
    tiles.push(
      <StatTile
        key="cost"
        label="Cost per outcome"
        value={now.outcomes === 0 ? "—" : `$${(now.cost / now.outcomes).toFixed(2)}`}
        delta={
          prev.outcomes === 0 || prev.cost === 0
            ? undefined
            : delta(now.cost / Math.max(now.outcomes, 1), prev.cost / prev.outcomes)
        }
        goodWhen="down"
        note={`$${now.cost.toFixed(0)} in session fees`}
      />,
    );
  }

  return (
    <div
      className={`grid grid-cols-2 gap-3 ${tiles.length > 4 ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}
    >
      {tiles}
    </div>
  );
}

/* The arrival half at "all surfaces": a row per surface instead of a funnel.

   Impressions and deliveries cannot be added together, and a stacked bar of
   the two would say they can. So the comparison is left as a table, and the
   line above it says why. */
function SurfaceSplit({
  rows,
  outcome,
  onPick,
}: {
  rows: { surface: Surface; t: Totals }[];
  outcome: string;
  onPick: (s: Surface) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[10.5px] font-medium tracking-[0.08em] text-[#A1A1AA] uppercase">
        Arrival — not comparable across surfaces
      </div>
      <table className="w-full border-collapse text-[12.5px]">
        <tbody>
          {rows.map(({ surface, t }) => {
            const Icon = SURFACE_ICON[surface];
            return (
              <tr
                key={surface}
                onClick={() => onPick(surface)}
                className="cursor-pointer border-b border-[#F4F4F6] transition-colors last:border-0 hover:bg-[#FAFAFB]"
              >
                <td className="py-2 pr-3">
                  <span className="flex items-center gap-2 text-[#27272A]">
                    <Icon className="size-4 shrink-0 text-[#A1A1AA]" strokeWidth={1.9} aria-hidden />
                    {SURFACES[surface].label}
                  </span>
                </td>
                <td className="py-2 pr-3 text-right tabular-nums text-[#52525B]">
                  {compact(t.impressions)}{" "}
                  <span className="text-[#A1A1AA]">{SURFACES[surface].reach.toLowerCase()}</span>
                </td>
                <td className="py-2 pr-3 text-right tabular-nums text-[#52525B]">
                  → {compact(t.engaged)} <span className="text-[#A1A1AA]">started</span>
                </td>
                <td className="py-2 pr-3 text-right tabular-nums text-[#52525B]">
                  {full(t.outcomes)} <span className="text-[#A1A1AA]">{outcome.toLowerCase()}</span>
                </td>
                <td className="w-[58px] py-2 text-right font-medium tabular-nums text-[#18181B]">
                  {t.engaged === 0 ? "—" : pct(rate(t.outcomes, t.engaged), 0)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* The line between the two halves. Dotted rather than solid: the halves belong
   to one funnel, and a rule heavy enough to read as a card edge would make
   them two. */
function Split() {
  return <div className="my-4 border-t border-dashed border-[#E4E4EA]" />;
}

export function AnalyticsPanel({ onLeave }: { onLeave?: (s: "design" | "configure") => void }) {
  const [role, setRole] = useState<Role>({ kind: "admin" });
  const [scope, setScope] = useState<Scope>({ kind: "all" });
  const [range, setRange] = useState<number>(30);
  /* "all" is the default and stays the default when the scope changes: a
     surface that isn't deployed on the newly selected agent can't stay
     selected, and silently keeping one that is would mean two agents showing
     different things for the same click. */
  const [surface, setSurface] = useState<Surface | "all">("all");

  /* Changing who you are changes what you may count. Dropping back to "all"
     rather than trying to keep the selection is the honest reset: a customer
     who inherits the previous customer's agent selected is a bug report. */
  const setWho = (r: Role) => {
    setRole(r);
    setScope({ kind: "all" });
    setSurface("all");
  };

  /* Everything the signed-in account may read. The screen never touches ROWS
     directly — this is the line production replaces with a query. */
  const readable = useMemo(
    () => (role.kind === "admin" ? ROWS : ROWS.filter((r) => r.tenant === role.id)),
    [role],
  );

  const inScope = useCallback(
    (s: Scope) =>
      s.kind === "all"
        ? readable
        : s.kind === "tenant"
          ? readable.filter((r) => r.tenant === s.id)
          : readable.filter((r) => r.agent === s.id),
    [readable],
  );

  /* Scope says which agents; surface says which deployments of them. Two
     independent filters over one set of rows — which is why neither needed a
     screen of its own. */
  const rowsIn = useCallback(
    (s: Scope) =>
      surface === "all" ? inScope(s) : inScope(s).filter((r) => r.surface === surface),
    [inScope, surface],
  );

  /* Only the surfaces this selection is actually deployed on. An agent that
     lives on the web alone shows no control at all — one deployment is not a
     choice, and a greyed-out WhatsApp tab advertises something they do not
     have. */
  const surfacesHere = useMemo(() => {
    const live = new Set(inScope(scope).map((r) => r.surface));
    return SURFACE_ORDER.filter((s) => live.has(s));
  }, [inScope, scope]);

  /* A scope change can strip the selected surface away — picking an agent
     that isn't on WhatsApp while WhatsApp is selected. Resolved where the
     change happens rather than in an effect afterwards: an effect would render
     one frame of a surface this agent does not have, and that frame is an
     empty funnel. */
  const chooseScope = (next: Scope) => {
    setScope(next);
    if (surface !== "all") {
      const live = new Set(inScope(next).map((r) => r.surface));
      if (!live.has(surface)) setSurface("all");
    }
  };

  const { now, prev } = useMemo(() => periods(rowsIn(scope), range), [scope, range, rowsIn]);
  const t = total(now);
  const p = total(prev);
  const days = useMemo(() => byDate(now), [now]);
  const dates = days.map((d) => d.date);

  /* The outcome is the customer's own word for success wherever one customer
     is in view, and the neutral count when several are. */
  const outcome =
    scope.kind === "agent"
      ? TENANT[AGENT[scope.id].tenant].outcome
      : scope.kind === "tenant"
        ? TENANT[scope.id].outcome
        : role.kind === "tenant"
          ? TENANT[role.id].outcome
          : "Outcomes";

  /* The picker's dots and the alert list read the same function over the same
     window, so a dot that says "critical" and a row that says "healthy" can't
     disagree. */
  const stateOf = (s: Scope) => health(total(periods(rowsIn(s), range).now));

  const agentsInView = AGENTS.filter(
    (a) =>
      (role.kind === "admin" || a.tenant === role.id) &&
      (scope.kind === "all" ||
        (scope.kind === "tenant" && a.tenant === scope.id) ||
        (scope.kind === "agent" && a.id === scope.id)),
  );

  const alerts = agentsInView
    .map((a) => ({ agent: a, ...stateOf({ kind: "agent", id: a.id }) }))
    .filter((x) => x.tone === "critical" || x.tone === "warning");

  const agent = scope.kind === "agent" ? AGENT[scope.id] : null;
  const thin = t.impressions < FLOOR;

  /* Agent-only blocks. */
  const armed =
    !!agent && now.some((r) => r.variant === "button") && now.some((r) => r.variant === "composer");
  const abFrom = armed
    ? now.filter((r) => r.variant === "composer").reduce((min, r) => (r.date < min ? r.date : min), "9999")
    : "";
  const abDays = now.filter((r) => r.date >= abFrom);
  const arm = (v: "composer" | "button") => total(abDays.filter((r) => r.variant === v));
  const clicks = agent ? (SUGGESTIONS[agent.id] ?? []) : [];
  const clickTop = Math.max(...clicks.map((c) => c.clicks), 1);

  return (
    <div className="flex h-full min-h-0 bg-white text-[#27272A]">
      <DashboardRails section="analytics" onNavigate={(s) => s !== "analytics" && onLeave?.(s)} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Same 64px bar as Configure and Design — the rails run past all three,
            and a different height puts a visible step in the page when you
            cross between sections.

            The picker sits in the bar rather than in the page, because it is
            what the page is of: scrolling the thing that names the numbers out
            of view leaves a screen of figures with no subject. */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-[#EDEDF1] px-6">
          <div className="shrink-0">
            <h1 className="text-[15px] font-semibold leading-tight text-[#18181B]">Analytics</h1>
            <p className="text-[11px] text-[#979797]">How the messenger is performing</p>
          </div>

          <ScopePicker role={role} scope={scope} onScope={chooseScope} stateOf={stateOf} />

          {/* Surface sits beside scope, not under it: they are two questions
              about the same page — which agents, and which of their
              deployments — and either one alone is a complete selection.
              Drawn only when there is more than one to choose from. */}
          {surfacesHere.length > 1 && (
            <div className="flex shrink-0 items-center gap-1 rounded-lg bg-[#F4F4F6] p-1">
              {(["all", ...surfacesHere] as const).map((sf) => {
                const on = surface === sf;
                const Icon = sf === "all" ? null : SURFACE_ICON[sf];
                return (
                  <button
                    key={sf}
                    onClick={() => setSurface(sf)}
                    aria-pressed={on}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors ${
                      on
                        ? "bg-white text-[#18181B] shadow-[0_1px_2px_rgba(15,17,26,0.10)]"
                        : "text-[#71717A] hover:text-[#27272A]"
                    }`}
                  >
                    {Icon && <Icon className="size-3.5" strokeWidth={1.9} aria-hidden />}
                    {sf === "all" ? "All surfaces" : SURFACES[sf].label}
                  </button>
                );
              })}
            </div>
          )}

          <div className="ml-auto flex shrink-0 items-center gap-2">
            {/* The window, and it applies to everything on screen at once. A
                page where each card carries its own range is a page where two
                numbers side by side answer different questions. */}
            <div className="flex items-center gap-1 rounded-lg bg-[#F4F4F6] p-1">
              {RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  aria-pressed={range === r}
                  className={`rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors ${
                    range === r
                      ? "bg-white text-[#18181B] shadow-[0_1px_2px_rgba(15,17,26,0.10)]"
                      : "text-[#71717A] hover:text-[#27272A]"
                  }`}
                >
                  {r}d
                </button>
              ))}
            </div>
            <RoleMenu role={role} onRole={setWho} />
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto px-8 py-7">
          <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-5">
            {/* Said on the screen, not just in the menu: this view eventually
                gets screenshotted into a channel, and "why am I looking at
                another customer's numbers" is a question worth answering
                before it is asked. */}
            {role.kind === "admin" && (
              <div className="flex items-center gap-2 rounded-lg bg-[#F7F4FD] px-3 py-2 text-[12px] text-[#6D33AA]">
                <ShieldCheck className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                Super admin view — every customer&apos;s agents, across every account.
              </div>
            )}

            {agent && (
              <div className="flex flex-wrap items-center gap-2">
                <StatusChip {...stateOf(scope)} />
                <Meta>{TENANT[agent.tenant].name}</Meta>
                <Meta>{agent.scope}</Meta>
                <Meta>{agent.variant === "composer" ? "Composer launcher" : "Button launcher"}</Meta>
                <Meta>SDK {agent.sdk}</Meta>
              </div>
            )}

            {agent && t.opens === 0 && t.impressions > FLOOR && (
              <div className="flex items-start gap-3 rounded-xl border border-[#F3D3D3] bg-[#FBEDED] px-4 py-3">
                <AlertTriangle
                  className="mt-0.5 size-4 shrink-0 text-[#d03b3b]"
                  strokeWidth={2}
                  aria-hidden
                />
                <div className="text-[13px] leading-relaxed text-[#7F1D1D]">
                  <span className="font-medium">
                    The launcher is rendering but nothing opens it.
                  </span>{" "}
                  {compact(t.impressions)} impressions and no opens in this window, with errors on{" "}
                  {pct(rate(t.errors, t.impressions), 0)} of loads. This is a deploy to check, not a
                  number to explain.
                </div>
              </div>
            )}

            <Tiles now={t} prev={p} outcome={outcome} surface={surface} />

            {thin ? (
              <NotEnough impressions={t.impressions} floor={FLOOR} />
            ) : (
              <>
                {!agent && alerts.length > 0 && (
                  <Card
                    title="Needs a look"
                    hint="Agents whose numbers say something is wrong, not just down."
                  >
                    <div className="flex flex-col divide-y divide-[#F0F0F4]">
                      {alerts.map(({ agent: a, tone, label }) => {
                        const at = total(periods(rowsIn({ kind: "agent", id: a.id }), range).now);
                        return (
                          <button
                            key={a.id}
                            onClick={() => chooseScope({ kind: "agent", id: a.id })}
                            className="flex items-center gap-3 py-2.5 text-left transition-colors first:pt-0 last:pb-0 hover:bg-[#FAFAFB]"
                          >
                            <AlertTriangle
                              className="size-4 shrink-0"
                              strokeWidth={2}
                              style={{ color: tone === "critical" ? "#d03b3b" : "#fab219" }}
                              aria-hidden
                            />
                            <span className="min-w-0 flex-1 truncate text-[13px] text-[#27272A]">
                              <span className="font-medium">{TENANT[a.tenant].name}</span>
                              <span className="text-[#A1A1AA]"> · {a.name}</span>
                            </span>
                            <span className="shrink-0 text-[12px] tabular-nums text-[#71717A]">
                              {compact(at.impressions)} seen · {full(at.opens)} opened
                            </span>
                            <StatusChip tone={tone} label={label} />
                          </button>
                        );
                      })}
                    </div>
                  </Card>
                )}

                {/* One card, two halves. The bottom half is the same rows in
                    the same order whatever is selected; only the top half
                    changes, and at "all surfaces" it is a table rather than a
                    funnel because those steps cannot be added together. */}
                <Card
                  title="The funnel"
                  hint={`Last ${range} days. The gutter is the step-to-step rate.`}
                >
                  {surface === "all" ? (
                    <SurfaceSplit
                      rows={surfacesHere.map((sf) => ({
                        surface: sf,
                        t: total(inScope(scope).filter((r) => r.surface === sf && r.date >= dates[0])),
                      }))}
                      outcome={outcome}
                      onPick={setSurface}
                    />
                  ) : (
                    <Funnel
                      caption={`Arrival · ${SURFACES[surface].label}`}
                      steps={arrival(t, surface)}
                    />
                  )}

                  <Split />

                  <Funnel
                    caption={
                      surface === "all" ? "Conversation — every surface" : "Conversation"
                    }
                    steps={conversation(t, outcome)}
                    /* Drawn against the arrival's own scale, so the step down
                       from "everyone who arrived" to "everyone who spoke" is
                       the width of the drop rather than two full-width bars
                       implying they are the same quantity. */
                    scale={surface === "all" ? undefined : t.impressions}
                    /* Where the arrival half ends is where this one begins, so
                       the first rate in the bottom half is the join between
                       them rather than a dash. */
                    baseline={
                      surface === "all"
                        ? undefined
                        : surface === "link"
                          ? t.impressions
                          : t.opens
                    }
                  />
                </Card>

                {/* Two charts rather than two lines: an open rate of 6% and an
                    engaged rate of 52% share no useful axis, and giving them
                    one each is the honest version of what a dual axis pretends
                    to do. */}
                {/* Two charts rather than two lines: an open rate of 6% and an
                    engaged rate of 52% share no useful axis, and giving them
                    one each is the honest version of what a dual axis pretends
                    to do.

                    What they plot follows the surface. At "all surfaces" they
                    can only plot the two things that mean the same everywhere —
                    a count of conversations and the outcome rate — because an
                    open rate and a read rate averaged together is a number
                    about nothing. */}
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                  {(surface === "all"
                    ? [
                        {
                          key: "started",
                          title: "Conversations started",
                          hint: "Every surface, by day",
                          points: days.map((d) => d.engaged),
                          format: (v: number) => compact(Math.round(v)),
                        },
                        {
                          key: "outrate",
                          title: "Outcome rate",
                          hint: "Outcomes ÷ conversations started",
                          points: days.map((d) => rate(d.outcomes, d.engaged)),
                          format: undefined,
                        },
                      ]
                    : [
                        {
                          key: "passed",
                          title: SURFACES[surface].passed,
                          hint:
                            surface === "link"
                              ? "Conversations ÷ visits, by day"
                              : `${SURFACES[surface].arrival[1].label} ÷ ${SURFACES[
                                  surface
                                ].arrival[0].label.toLowerCase()}, by day`,
                          points: days.map((d) =>
                            surface === "link"
                              ? rate(d.engaged, d.impressions)
                              : rate(d.opens, d.impressions),
                          ),
                          format: undefined,
                        },
                        {
                          key: "second",
                          title:
                            surface === "link"
                              ? "Kept going"
                              : surface === "whatsapp"
                                ? "Reply rate"
                                : "Engagement",
                          hint:
                            surface === "link"
                              ? "Of conversations started, the share that reached three turns"
                              : surface === "whatsapp"
                                ? "Of everyone who read it, the share who replied"
                                : "Of everyone who opened, the share who typed",
                          points: days.map((d) =>
                            surface === "link"
                              ? rate(d.deep, d.engaged)
                              : rate(d.engaged, d.opens),
                          ),
                          format: undefined,
                        },
                      ]
                  ).map((c) => (
                    <Card key={c.key} title={c.title} hint={c.hint}>
                      <Trend
                        dates={dates}
                        format={c.format}
                        series={[
                          { key: c.key, label: c.title, color: SERIES, points: c.points },
                        ]}
                      />
                    </Card>
                  ))}
                </div>

                {armed && (
                  <Card
                    title="Composer vs button"
                    hint={`Split 50/50 by visitor id. The table counts only the ${
                      new Set(abDays.map((r) => r.date)).size
                    } days both arms have been running.`}
                  >
                    <Trend
                      dates={dates}
                      series={(["composer", "button"] as const).map((v) => {
                        /* Looked up by date rather than zipped by index: an arm
                           that started mid-window has fewer days than the axis,
                           and packing its points from the left would plot last
                           Tuesday's number under the first tick. */
                        const seen = new Map(
                          byDate(now.filter((r) => r.variant === v)).map((d) => [
                            d.date,
                            rate(d.opens, d.impressions),
                          ]),
                        );
                        return {
                          key: v,
                          label: v === "composer" ? "Composer" : "Button",
                          color: AB[v],
                          points: days.map((d) => seen.get(d.date) ?? null),
                        };
                      })}
                    />
                    <div className="mt-4 grid grid-cols-3 gap-3 border-t border-[#F0F0F4] pt-4 text-[12.5px]">
                      <div />
                      <div className="font-medium text-[#52525B]">Composer</div>
                      <div className="font-medium text-[#52525B]">Button</div>
                      {(
                        [
                          ["Open rate", (x: Totals) => pct(rate(x.opens, x.impressions))],
                          ["Engaged", (x: Totals) => pct(rate(x.engaged, x.opens))],
                          [outcome, (x: Totals) => full(x.outcomes)],
                        ] as const
                      ).map(([label, read]) => (
                        <Compare
                          key={label}
                          label={label}
                          a={read(arm("composer"))}
                          b={read(arm("button"))}
                        />
                      ))}
                    </div>
                  </Card>
                )}

                {agent && (
                  <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <Card title="What got pressed" hint="Suggestion clicks in this window">
                      {clicks.length === 0 ? (
                        <p className="text-[12.5px] text-[#A1A1AA]">
                          No suggestion clicks recorded — nothing is opening this agent.
                        </p>
                      ) : (
                        <div className="flex flex-col gap-2.5">
                          {clicks.map((c) => (
                            <div key={c.label} className="flex items-center gap-3">
                              <span className="w-[180px] shrink-0 truncate text-[12.5px] text-[#27272A]">
                                {c.label}
                              </span>
                              <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[#F5F4F8]">
                                <span
                                  className="block h-full rounded-full"
                                  style={{
                                    width: `${(c.clicks / clickTop) * 100}%`,
                                    background: SERIES,
                                  }}
                                />
                              </span>
                              <span className="w-[52px] shrink-0 text-right text-[12px] tabular-nums text-[#71717A]">
                                {compact(c.clicks)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>

                    <Card title="Quality" hint="The signals that say the numbers above are real">
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
                        {/* A mis-click is a gesture that only exists where
                            there is something to press. On WhatsApp the row is
                            absent rather than reading 0% — a zero here would
                            be the layout telling a lie to stay rectangular. */}
                        {t.misclicks > 0 && (
                          <Quality
                            label="Mis-clicks"
                            value={pct(rate(t.misclicks, t.opens), 0)}
                            hint="opened and shut inside 3s"
                          />
                        )}
                        <Quality
                          label="Turns per conversation"
                          value={(t.engaged === 0 ? 0 : t.turns / t.engaged).toFixed(1)}
                          hint="user and agent messages"
                        />
                        <Quality
                          label="Handed to a human"
                          value={pct(rate(t.handoffs, t.engaged), 0)}
                          hint="of conversations"
                        />
                        {t.cost > 0 && (
                          <Quality
                            label="Cost per conversation"
                            value={`$${(t.cost / Math.max(t.engaged, 1)).toFixed(3)}`}
                            hint="Meta session fees"
                          />
                        )}
                        <Quality
                          label="Errors"
                          value={pct(rate(t.errors, t.impressions), 1)}
                          hint="of loads"
                        />
                      </dl>
                    </Card>
                  </div>
                )}

                {/* The ranked list is a report, not navigation — but selecting
                    a row is the same act as picking it in the dropdown, so it
                    does that rather than opening a screen of its own. */}
                {!agent && (
                  <Card
                    title={scope.kind === "all" && role.kind === "admin" ? "Customers" : "Agents"}
                    hint="Select a row to scope the page to it."
                  >
                    <Table
                      rows={(scope.kind === "all" && role.kind === "admin"
                        ? TENANTS.map((tn) => ({
                            id: tn.id,
                            name: tn.name,
                            sub: tn.site,
                            target: { kind: "tenant", id: tn.id } as Scope,
                          }))
                        : agentsInView.map((a) => ({
                            id: a.id,
                            name: a.name,
                            sub:
                              role.kind === "admin" && scope.kind === "all"
                                ? `${TENANT[a.tenant].name} · ${a.scope}`
                                : a.scope,
                            target: { kind: "agent", id: a.id } as Scope,
                          }))
                      ).map((r) => {
                        const rows = periods(rowsIn(r.target), range).now;
                        return {
                          ...r,
                          t: total(rows),
                          spark: byDate(rows).map((d) => rate(d.opens, d.impressions)),
                          onClick: () => chooseScope(r.target),
                        };
                      })}
                    />
                  </Card>
                )}
              </>
            )}

            <p className="pb-2 text-[11.5px] text-[#A1A1AA]">
              Computed from the daily rollup — {DAYS} days held, {full(ROWS.length)} rows. Rates are
              hidden under {compact(FLOOR)} impressions in the window.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ── small shared bits ──────────────────────────────────────────────────── */

function Meta({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[#F4F4F6] px-2.5 py-[3px] text-[11.5px] text-[#52525B]">
      {children}
    </span>
  );
}

function Quality({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div>
      <dt className="text-[11.5px] text-[#A1A1AA]">{label}</dt>
      <dd className="mt-0.5 text-[18px] font-semibold tabular-nums text-[#18181B]">{value}</dd>
      <dd className="text-[11px] text-[#A1A1AA]">{hint}</dd>
    </div>
  );
}

function Compare({ label, a, b }: { label: string; a: string; b: string }) {
  return (
    <>
      <div className="text-[#71717A]">{label}</div>
      <div className="font-medium tabular-nums text-[#18181B]">{a}</div>
      <div className="font-medium tabular-nums text-[#18181B]">{b}</div>
    </>
  );
}

/* One table for customers and for agents: the columns are the funnel, so a row
   reads the same way at either scope. */
function Table({
  rows,
}: {
  rows: {
    id: string;
    name: string;
    sub: string;
    t: Totals;
    spark: number[];
    onClick: () => void;
  }[];
}) {
  return (
    <div className="min-w-0 overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-[13px]">
        <thead>
          <tr className="text-left text-[11px] font-medium tracking-[0.06em] text-[#A1A1AA] uppercase">
            <th className="pb-2 font-medium">Name</th>
            <th className="pb-2 text-right font-medium">Seen</th>
            <th className="pb-2 text-right font-medium">Open rate</th>
            <th className="pb-2 text-right font-medium">Engaged</th>
            <th className="pb-2 text-right font-medium">Outcomes</th>
            <th className="pb-2 pl-4 font-medium">Trend</th>
            <th className="pb-2 pl-4 font-medium">State</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const state = health(r.t);
            const thin = r.t.impressions < FLOOR;
            return (
              <tr
                key={r.id}
                onClick={r.onClick}
                className="cursor-pointer border-t border-[#F0F0F4] transition-colors hover:bg-[#FAFAFB]"
              >
                <td className="py-2.5">
                  <div className="font-medium text-[#18181B]">{r.name}</div>
                  <div className="text-[11.5px] text-[#A1A1AA]">{r.sub}</div>
                </td>
                <td className="py-2.5 text-right tabular-nums text-[#27272A]">
                  {compact(r.t.impressions)}
                </td>
                <td className="py-2.5 text-right tabular-nums text-[#27272A]">
                  {thin ? "—" : pct(rate(r.t.opens, r.t.impressions))}
                </td>
                <td className="py-2.5 text-right tabular-nums text-[#27272A]">
                  {thin ? "—" : pct(rate(r.t.engaged, r.t.opens))}
                </td>
                <td className="py-2.5 text-right tabular-nums text-[#27272A]">{full(r.t.outcomes)}</td>
                <td className="py-2.5 pl-4">
                  <Spark points={r.spark.length ? r.spark : [0, 0]} />
                </td>
                <td className="py-2.5 pl-4">
                  <StatusChip tone={state.tone} label={state.label} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export type { Scope, Role };
