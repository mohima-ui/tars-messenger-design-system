"use client";

import {
  ArrowRight,
  ArrowUp,
  Brain,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Database,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  Image as ImageIcon,
  Lock,
  Mic,
  MoreVertical,
  Pause,
  Pin,
  Play,
  Plus,
  RefreshCw,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Volume2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const LINE = "var(--ds-border-line)";
const LINE_SOFT = "var(--ds-border-line-soft)";
const PAPER = "var(--ds-bg-paper)";
const SURFACE = "#FFFFFF";
const CANVAS = "var(--ds-bg-canvas)";
const INK = "var(--ds-text-ink)";
const SECONDARY = "var(--ds-text-secondary)";
const MUTED = "var(--ds-text-muted)";
const FAINT = "var(--ds-text-faint)";
const ACCENT = "var(--ds-accent)";
const ACCENT_INK = "var(--ds-accent-ink)";
const ACCENT_SOFT = "var(--ds-accent-soft)";
const ACCENT_BORDER = "var(--ds-accent-border)";

const SHOWCASE_KEYFRAMES = `
@keyframes v6-pulse { 0%,100% { opacity:1; transform:scale(1);} 50%{opacity:.6;transform:scale(.85);} }
@keyframes v6-glow { 0%,100% { transform:scale(1); opacity:.35;} 50%{transform:scale(2.2); opacity:.7;} }
@keyframes v6-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
@keyframes v6-cursor { 0%,49%{opacity:1} 50%,100%{opacity:0} }
@keyframes v6-bar { 0%,100%{transform:scaleY(.3)} 50%{transform:scaleY(1)} }
@keyframes v6-ring { 0%{transform:translate(-50%,-50%) scale(1); opacity:.5;} 100%{transform:translate(-50%,-50%) scale(2.6); opacity:0;} }
@keyframes v6-fade { 0%{opacity:0; transform:translateY(4px);} 100%{opacity:1; transform:translateY(0);} }
@keyframes v6-spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
`;

// ─── Bubble primitives ────────────────────────────────────
function AiBubble({
  children,
  showLabel,
}: {
  children: React.ReactNode;
  showLabel?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      {showLabel && (
        <p
          className="ml-1 text-[11px] font-medium tracking-wide"
          style={{ color: SECONDARY }}
        >
          Tars <span style={{ color: FAINT }}>• AI Agent</span>
        </p>
      )}
      <div className="flex justify-start">
        <div
          className="max-w-[88%] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] rounded-bl-[6px] border px-[14px] py-[10px] text-[12px] leading-[1.55]"
          style={{ backgroundColor: PAPER, borderColor: LINE, color: INK }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[78%] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[6px] rounded-bl-[12px] border px-[14px] py-[10px] text-[12px] leading-[1.45]"
        style={{
          backgroundColor: ACCENT_SOFT,
          borderColor: ACCENT_BORDER,
          color: ACCENT_INK,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Pinned banner ────────────────────────────────────────
function PinnedBanner() {
  return (
    <div
      className="flex items-center gap-2 border-b px-4 py-2"
      style={{ borderColor: LINE_SOFT, backgroundColor: "#FFFCF6" }}
    >
      <Pin className="size-3" strokeWidth={2} style={{ color: ACCENT_INK }} />
      <p className="flex-1 truncate text-[11px]" style={{ color: SECONDARY }}>
        <span className="font-semibold" style={{ color: INK }}>
          Account #GP-48291
        </span>{" "}
        · Studio plan · 18 days left
      </p>
      <button className="text-[10px]" style={{ color: MUTED }}>
        Unpin
      </button>
    </div>
  );
}


// ─── Reasoning card ───────────────────────────────────────
function ReasoningCard() {
  const [open, setOpen] = useState(true);
  const steps = [
    { label: "Verifying account", icon: Database, done: true },
    { label: "Reading plan tiers", icon: FileText, done: true },
    { label: "Comparing usage to Studio benefits", icon: Brain, done: false },
  ];
  return (
    <div
      className="flex max-w-[88%] flex-col gap-2 self-start rounded-[12px] border px-3 py-2.5"
      style={{ backgroundColor: SURFACE, borderColor: LINE }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2">
          <Brain
            className="size-3.5"
            strokeWidth={1.75}
            style={{ color: ACCENT_INK }}
          />
          <p className="text-[11px] font-semibold" style={{ color: INK }}>
            Reasoning
          </p>
          <span
            className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
            style={{ backgroundColor: PAPER, color: SECONDARY }}
          >
            3 steps
          </span>
        </div>
        <ChevronDown
          className="size-3 transition-transform"
          strokeWidth={2}
          style={{
            color: MUTED,
            transform: open ? "rotate(0)" : "rotate(-90deg)",
          }}
        />
      </button>
      {open && (
        <div className="flex flex-col gap-1.5">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-2 text-[11px]"
                style={{ color: s.done ? INK : SECONDARY }}
              >
                <span
                  className="flex size-4 shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: s.done ? "#E8F5EC" : PAPER,
                    color: s.done ? "#0F7A38" : MUTED,
                  }}
                >
                  {s.done ? (
                    <Check className="size-2.5" strokeWidth={3} />
                  ) : (
                    <span
                      className="size-2 rounded-full border-2"
                      style={{
                        borderColor: ACCENT_INK,
                        borderTopColor: "transparent",
                        animation: "v6-spin 800ms linear infinite",
                      }}
                    />
                  )}
                </span>
                <Icon
                  className="size-3 shrink-0"
                  strokeWidth={1.75}
                  style={{ color: MUTED }}
                />
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Tool usage card ──────────────────────────────────────
function ToolCard() {
  return (
    <div
      className="flex max-w-[88%] items-center gap-2 self-start rounded-[10px] border px-3 py-2"
      style={{ backgroundColor: "#F0F4FF", borderColor: "#CDD4F4" }}
    >
      <div
        className="flex size-6 items-center justify-center rounded-[6px]"
        style={{ backgroundColor: SURFACE, borderColor: LINE }}
      >
        <Database
          className="size-3.5"
          strokeWidth={1.75}
          style={{ color: ACCENT_INK }}
        />
      </div>
      <div className="flex flex-1 flex-col">
        <p className="text-[11px] font-semibold" style={{ color: INK }}>
          Called{" "}
          <code
            className="rounded-[3px] px-1 font-mono text-[10px]"
            style={{ backgroundColor: SURFACE, color: ACCENT_INK }}
          >
            getInvoice
          </code>
        </p>
        <p className="text-[10px]" style={{ color: SECONDARY }}>
          Resolved in 1.2s · 1 result
        </p>
      </div>
    </div>
  );
}

// ─── Inline strips (live inside an AI bubble) ────────────
function TrailStripHeader({
  Icon,
  label,
  count,
  elapsed,
  open,
  onToggle,
}: {
  Icon: typeof Sparkles;
  label: string;
  count: number;
  elapsed: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-2 self-start rounded-[6px] py-0.5 text-left transition-colors hover:opacity-80"
    >
      <span
        className="flex size-3.5 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: ACCENT_SOFT, color: ACCENT_INK }}
      >
        <Icon className="size-2" strokeWidth={2.5} />
      </span>
      <span className="text-[11px] font-medium" style={{ color: SECONDARY }}>
        {label}{" "}
        <span style={{ color: MUTED }}>· {count}</span>
      </span>
      <span className="font-mono text-[10px]" style={{ color: MUTED }}>
        · {elapsed}
      </span>
      <ChevronDown
        className="size-3 transition-transform"
        strokeWidth={2}
        style={{
          color: MUTED,
          transform: open ? "rotate(180deg)" : "rotate(0)",
        }}
      />
    </button>
  );
}

function ToolChip({ name }: { name: string }) {
  return (
    <code
      className="mx-0.5 inline-flex items-center rounded-[4px] px-1 py-px align-baseline font-mono text-[10px] tracking-tight"
      style={{
        backgroundColor: ACCENT_SOFT,
        color: ACCENT_INK,
      }}
    >
      {name}
    </code>
  );
}

function ReasoningBox({
  steps,
  elapsed,
}: {
  steps: React.ReactNode[];
  elapsed: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex w-full justify-start">
      <div
        className="flex w-[88%] flex-col rounded-[10px] border px-3 py-2"
        style={{
          backgroundColor: PAPER,
          borderColor: LINE,
          animation: "v6-fade 200ms ease-out both",
        }}
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 text-left transition-opacity hover:opacity-80"
        >
          <Sparkles
            className="size-3.5 shrink-0"
            strokeWidth={1.75}
            style={{ color: ACCENT }}
          />
          <span
            className="text-[12px] font-semibold"
            style={{ color: ACCENT }}
          >
            Reasoning
          </span>
          <span className="text-[11px]" style={{ color: MUTED }}>
            · {steps.length} steps · {elapsed}
          </span>
          <ChevronDown
            className="ml-auto size-3 transition-transform"
            strokeWidth={2}
            style={{
              color: MUTED,
              transform: open ? "rotate(180deg)" : "rotate(0)",
            }}
          />
        </button>
        {open && (
          <div
            className="mt-2.5 flex flex-col"
            style={{ animation: "v6-fade 200ms ease-out both" }}
          >
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col">
                <div className="flex items-start gap-2">
                  <span
                    className="mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full border"
                    style={{
                      backgroundColor: ACCENT_SOFT,
                      borderColor: ACCENT_BORDER,
                      color: ACCENT_INK,
                    }}
                  >
                    <Check className="size-2" strokeWidth={2.5} />
                  </span>
                  <span
                    className="text-[12px] leading-[1.5]"
                    style={{ color: SECONDARY }}
                  >
                    {s}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <span
                    className="ml-[7px] h-2 w-px"
                    style={{ backgroundColor: ACCENT_BORDER }}
                    aria-hidden
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ToolsStrip({
  tools,
  elapsed,
}: {
  tools: { label: string; tool: string }[];
  elapsed: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col">
      <TrailStripHeader
        Icon={Database}
        label="Tools used"
        count={tools.length}
        elapsed={elapsed}
        open={open}
        onToggle={() => setOpen((o) => !o)}
      />
      {open && (
        <div
          className="mt-1.5 flex flex-col gap-1 pl-5"
          style={{ animation: "v6-fade 200ms ease-out both" }}
        >
          {tools.map((t, i) => (
            <div
              key={i}
              className="flex items-baseline gap-2 text-[10.5px]"
              style={{ color: SECONDARY }}
            >
              <Check
                className="mt-px size-2.5 shrink-0"
                strokeWidth={3}
                style={{ color: "#0F7A38" }}
              />
              <span className="min-w-0 flex-1">{t.label}</span>
              <span
                className="inline-flex shrink-0 items-center gap-1 rounded-[3px] border px-1 py-px font-mono text-[9px]"
                style={{
                  backgroundColor: SURFACE,
                  borderColor: LINE,
                  color: ACCENT_INK,
                }}
              >
                <Database className="size-2" strokeWidth={2.5} />
                {t.tool}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Citation chip + inline AI message with sources ───────
function CitationChip({ n, active }: { n: number; active: boolean }) {
  return (
    <span
      className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-[4px] border px-1 align-middle text-[10px] font-semibold transition-colors"
      style={{
        backgroundColor: active ? ACCENT_SOFT : SURFACE,
        borderColor: active ? ACCENT_BORDER : LINE,
        color: active ? ACCENT_INK : SECONDARY,
      }}
    >
      {n}
    </span>
  );
}

function CitationSource({
  n,
  source,
}: {
  n: number;
  source: { title: string; description: string; url: string };
}) {
  const chipRef = useRef<HTMLSpanElement>(null);
  const [transformX, setTransformX] = useState("-50%");

  const recalc = () => {
    const chip = chipRef.current;
    if (!chip) return;
    const card = chip.closest<HTMLElement>("[data-chat-card]");
    if (!card) return;
    const chipRect = chip.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const POPOVER_W = 320;
    const PAD = 8;
    const chipCenter = chipRect.left + chipRect.width / 2;
    let popoverLeft = chipCenter - POPOVER_W / 2;
    const minLeft = cardRect.left + PAD;
    const maxLeft = cardRect.right - POPOVER_W - PAD;
    if (popoverLeft < minLeft) popoverLeft = minLeft;
    if (popoverLeft > maxLeft) popoverLeft = maxLeft;
    const newCenter = popoverLeft + POPOVER_W / 2;
    const delta = newCenter - chipCenter;
    setTransformX(`calc(-50% + ${delta}px)`);
  };

  return (
    <span
      className="group/cite relative inline-block align-baseline"
      onMouseEnter={recalc}
      onFocus={recalc}
    >
      <span
        ref={chipRef}
        className="ml-0.5 inline-flex size-4 cursor-pointer items-center justify-center rounded-full align-middle text-[10px] font-semibold transition-colors group-hover/cite:!bg-[var(--ds-accent-soft)] group-hover/cite:!text-[var(--ds-accent-ink)]"
        style={{
          backgroundColor: "#E0DAD3",
          color: SECONDARY,
        }}
      >
        {n}
      </span>
      <span
        className="pointer-events-none absolute bottom-full left-1/2 z-20 w-[320px] pb-2 opacity-0 transition-opacity duration-150 group-hover/cite:pointer-events-auto group-hover/cite:opacity-100"
        style={{ transform: `translateX(${transformX})` }}
      >
        <span
          className="block rounded-[10px] border bg-white p-3"
          style={{
            borderColor: LINE,
            boxShadow:
              "0 4px 14px -3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          <span
            className="block text-[12px] font-semibold leading-[1.35]"
            style={{ color: INK }}
          >
            {source.title}
          </span>
          <span
            className="mt-1 block text-[11px] leading-[1.45]"
            style={{ color: SECONDARY }}
          >
            {source.description}
          </span>
          <a
            href={`https://${source.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-flex max-w-full items-center gap-1 font-mono text-[11px] hover:underline"
            style={{ color: ACCENT_INK }}
          >
            <span className="truncate">{source.url}</span>
            <ExternalLink
              className="size-3 shrink-0"
              strokeWidth={2}
              aria-hidden
            />
          </a>
        </span>
      </span>
    </span>
  );
}

const CITATION_SOURCES = [
  {
    title: "Studio plan tier details",
    description:
      "Full breakdown of monthly and annual pricing for the Studio tier, including auto-renewal terms.",
    url: "tars.com/plans/studio",
  },
  {
    title: "Annual discount terms",
    description:
      "Conditions for the 20% annual discount — eligibility, refund window, and prorated billing.",
    url: "tars.com/legal/discounts",
  },
];

function CitedAiBubble() {
  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex w-full justify-start">
        <div
          className="max-w-[88%] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] rounded-bl-[6px] border px-[14px] py-[10px] text-[12px] leading-[1.55]"
          style={{ backgroundColor: PAPER, borderColor: LINE, color: INK }}
        >
          On your <span className="font-semibold">Studio plan</span> you&apos;re
          currently on the monthly tier ($49). Switching to annual saves you{" "}
          <span className="font-semibold">20%</span>{" "}
          <CitationSource n={1} source={CITATION_SOURCES[0]} /> and unlocks the
          new audit log <CitationSource n={2} source={CITATION_SOURCES[1]} />.
        </div>
      </div>
    </div>
  );
}

// ─── Variation: chips below content inside the AI bubble ─
function ChipVariationBubble() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex w-full justify-start">
      <div
        className="max-w-[88%] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] rounded-bl-[6px] border px-[14px] py-[10px] text-[12px] leading-[1.55]"
        style={{ backgroundColor: PAPER, borderColor: LINE, color: INK }}
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 text-left transition-opacity hover:opacity-80"
        >
          <Sparkles
            className="size-3 shrink-0"
            strokeWidth={1.75}
            style={{ color: ACCENT }}
          />
          <span className="text-[11px]" style={{ color: SECONDARY }}>
            Reasoned through 4 steps · used 2 tools
          </span>
          <ChevronDown
            className="size-2.5 transition-transform"
            strokeWidth={2}
            style={{
              color: MUTED,
              transform: open ? "rotate(180deg)" : "rotate(0)",
            }}
          />
        </button>
        {open && (
          <div
            className="mt-2 flex flex-col"
            style={{ animation: "v6-fade 200ms ease-out both" }}
          >
            {[
              <>
                Verified your account on the{" "}
                <strong style={{ color: INK }}>Studio plan</strong>
              </>,
              <>
                Called <ToolChip name="get_Invoice" /> to pull your current
                invoice
              </>,
              <>
                Used <ToolChip name="compare_Plans" /> to weigh monthly vs
                annual
              </>,
              <>Decided annual would be the better value</>,
            ].map((s, i, arr) => (
              <div key={i} className="flex flex-col">
                <div className="flex items-start gap-2">
                  <span
                    className="mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full border"
                    style={{
                      backgroundColor: ACCENT_SOFT,
                      borderColor: ACCENT_BORDER,
                      color: ACCENT_INK,
                    }}
                  >
                    <Check className="size-2" strokeWidth={2.5} />
                  </span>
                  <span
                    className="text-[12px] leading-[1.5]"
                    style={{ color: SECONDARY }}
                  >
                    {s}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <span
                    className="ml-[7px] h-2 w-px"
                    style={{ backgroundColor: ACCENT_BORDER }}
                    aria-hidden
                  />
                )}
              </div>
            ))}
          </div>
        )}
        <div
          className="mt-2.5 mb-2.5 h-px"
          style={{ backgroundColor: LINE }}
        />
        On your <span className="font-semibold">Studio plan</span> you&apos;re
        currently on the monthly tier ($49). Switching to annual saves you{" "}
        <span className="font-semibold">20%</span>{" "}
        <CitationSource n={1} source={CITATION_SOURCES[0]} /> and unlocks the
        new audit log <CitationSource n={2} source={CITATION_SOURCES[1]} />.
      </div>
    </div>
  );
}

// ─── Variation 3: inline text links (Reasoning ▶ | Tools used ▶) ─
function LinkVariationBubble() {
  const [expanded, setExpanded] = useState<"reasoning" | "tools" | null>(null);
  const openReasoning = expanded === "reasoning";
  const openTools = expanded === "tools";
  const toggle = (which: "reasoning" | "tools") =>
    setExpanded((prev) => (prev === which ? null : which));

  const linkButton = (
    Icon: typeof Sparkles,
    label: string,
    open: boolean,
    onToggle: () => void,
  ) => (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-1 text-[11px] font-medium transition-colors hover:opacity-80"
      style={{ color: open ? ACCENT : SECONDARY }}
    >
      <Icon
        className="size-3 shrink-0"
        strokeWidth={1.75}
        style={{ color: ACCENT }}
      />
      {label}
      <ChevronRight
        className="size-2.5 transition-transform"
        strokeWidth={2}
        style={{ transform: open ? "rotate(90deg)" : "rotate(0)" }}
      />
    </button>
  );

  return (
    <div className="flex w-full justify-start">
      <div
        className="max-w-[88%] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] rounded-bl-[6px] border px-[14px] py-[10px] text-[12px] leading-[1.55]"
        style={{ backgroundColor: PAPER, borderColor: LINE, color: INK }}
      >
        {/* Inline text-link toggles */}
        <div className="flex items-center gap-4">
          {linkButton(Sparkles, "Reasoning", openReasoning, () =>
            toggle("reasoning"),
          )}
          {linkButton(Database, "Tools used", openTools, () =>
            toggle("tools"),
          )}
        </div>

        {/* Reasoning expansion — plain inline */}
        {openReasoning && (
          <div
            className="mt-2"
            style={{ animation: "v6-fade 200ms ease-out both" }}
          >
            <div className="flex flex-col">
              {[
                <>
                  Verified your account on the{" "}
                  <strong style={{ color: INK }}>Studio plan</strong>
                </>,
                <>
                  Called <ToolChip name="get_Invoice" /> to pull your current
                  invoice
                </>,
                <>
                  Used <ToolChip name="compare_Plans" /> to weigh monthly vs
                  annual
                </>,
                <>Decided annual would be the better value</>,
              ].map((s, i, arr) => (
                <div key={i} className="flex flex-col">
                  <div className="flex items-start gap-2">
                    <span
                      className="mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full border"
                      style={{
                        backgroundColor: ACCENT_SOFT,
                        borderColor: ACCENT_BORDER,
                        color: ACCENT_INK,
                      }}
                    >
                      <Check className="size-2" strokeWidth={2.5} />
                    </span>
                    <span
                      className="text-[12px] leading-[1.5]"
                      style={{ color: SECONDARY }}
                    >
                      {s}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <span
                      className="ml-[7px] h-2 w-px"
                      style={{ backgroundColor: ACCENT_BORDER }}
                      aria-hidden
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tools expansion — one stroked box per tool */}
        {openTools && (
          <div
            className="mt-2 flex flex-col gap-2"
            style={{ animation: "v6-fade 200ms ease-out both" }}
          >
            {[
              {
                name: "get_Invoice",
                args: `{ "accountId": "GP-48291" }`,
                result: `{ "plan": "Studio", "tier": "monthly", "amount": 49 }`,
              },
              {
                name: "compare_Plans",
                args: `{ "current": "monthly", "target": "annual" }`,
                result: `{ "delta": -118, "saves": "20%" }`,
              },
            ].map((t) => (
              <div
                key={t.name}
                className="rounded-[8px] border px-3 py-2.5"
                style={{ borderColor: LINE }}
              >
                <p
                  className="mb-1.5 font-mono text-[9px] font-semibold tracking-wider uppercase"
                  style={{ color: MUTED }}
                >
                  Called <ToolChip name={t.name} />
                </p>
                <div className="flex flex-col gap-1.5">
                  <div>
                    <span
                      className="font-mono text-[10px]"
                      style={{ color: MUTED }}
                    >
                      Arguments
                    </span>
                    <pre
                      className="mt-0.5 overflow-x-auto rounded-[4px] px-2 py-1 font-mono text-[10px] leading-[1.5]"
                      style={{
                        backgroundColor: PAPER,
                        color: ACCENT_INK,
                      }}
                    >
                      {t.args}
                    </pre>
                  </div>
                  <div>
                    <span
                      className="font-mono text-[10px]"
                      style={{ color: MUTED }}
                    >
                      Result
                    </span>
                    <pre
                      className="mt-0.5 overflow-x-auto rounded-[4px] px-2 py-1 font-mono text-[10px] leading-[1.5]"
                      style={{
                        backgroundColor: PAPER,
                        color: ACCENT_INK,
                      }}
                    >
                      {t.result}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div
          className="mt-1.5 mb-1.5 h-px"
          style={{ backgroundColor: LINE }}
        />

        On your <span className="font-semibold">Studio plan</span> you&apos;re
        currently on the monthly tier ($49). Switching to annual saves you{" "}
        <span className="font-semibold">20%</span>{" "}
        <CitationSource n={1} source={CITATION_SOURCES[0]} /> and unlocks the
        new audit log <CitationSource n={2} source={CITATION_SOURCES[1]} />.
      </div>
    </div>
  );
}

// ─── Inline actions toolbar ───────────────────────────────
function InlineActions() {
  return (
    <div className="ml-1 flex items-center gap-0.5">
      {[
        { icon: Volume2, label: "Read aloud" },
        { icon: ThumbsUp, label: "Like" },
        { icon: ThumbsDown, label: "Dislike" },
        { icon: Copy, label: "Copy" },
        { icon: RefreshCw, label: "Regenerate" },
      ].map((a, i) => {
        const Icon = a.icon;
        return (
          <button
            key={i}
            type="button"
            className="flex size-6 items-center justify-center rounded-[4px] transition-colors"
            style={{ color: SECONDARY }}
            aria-label={a.label}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F0EBE0";
              e.currentTarget.style.color = INK as string;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = SECONDARY as string;
            }}
          >
            <Icon className="size-3" strokeWidth={1.75} />
          </button>
        );
      })}
    </div>
  );
}

// ─── File attachment preview ──────────────────────────────
function FileAttachment() {
  return (
    <div className="flex justify-end">
      <div className="flex max-w-[78%] flex-col gap-2">
        <div
          className="flex items-center gap-2.5 rounded-[10px] border bg-white px-3 py-2"
          style={{ borderColor: ACCENT_BORDER }}
        >
          <div
            className="flex size-8 items-center justify-center rounded-[6px]"
            style={{ backgroundColor: ACCENT_SOFT }}
          >
            <FileText
              className="size-4"
              strokeWidth={1.75}
              style={{ color: ACCENT_INK }}
            />
          </div>
          <div className="flex min-w-0 flex-col">
            <p
              className="truncate text-[11px] font-semibold"
              style={{ color: INK }}
            >
              error-log.pdf
            </p>
            <p className="text-[10px]" style={{ color: MUTED }}>
              82 KB · uploaded
            </p>
          </div>
        </div>
        <UserBubble>Can you look at this error?</UserBubble>
      </div>
    </div>
  );
}

// ─── Image preview from user ──────────────────────────────
function ImageAttachment() {
  return (
    <div className="flex justify-end">
      <div className="flex max-w-[78%] flex-col items-end gap-2">
        <div
          className="relative h-28 w-44 overflow-hidden rounded-[10px] border"
          style={{ borderColor: ACCENT_BORDER }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, #DDE4FF 0%, #C5CFF7 50%, #A5B0EE 100%)",
            }}
          />
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ color: ACCENT_INK }}
          >
            <ImageIcon className="size-7 opacity-50" strokeWidth={1.5} />
          </div>
          <div
            className="absolute right-1.5 bottom-1.5 rounded-[3px] bg-white/90 px-1.5 py-0.5 text-[9px] font-medium"
            style={{ color: INK }}
          >
            screenshot.png
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Rich link preview from AI ────────────────────────────
function LinkPreview() {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <div
        className="flex max-w-[280px] gap-2.5 rounded-[10px] border p-2.5"
        style={{ backgroundColor: SURFACE, borderColor: LINE }}
      >
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-[6px]"
          style={{
            background:
              "linear-gradient(135deg, #E0E5FA 0%, #A5B0EE 100%)",
          }}
        >
          <Globe className="size-5" strokeWidth={1.5} style={{ color: SURFACE }} />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span
            className="font-mono text-[9px] font-medium uppercase tracking-wider"
            style={{ color: MUTED }}
          >
            tars.com/help
          </span>
          <p className="text-[12px] font-semibold" style={{ color: INK }}>
            Switching from monthly to annual
          </p>
          <p
            className="line-clamp-2 text-[11px] leading-[1.4]"
            style={{ color: SECONDARY }}
          >
            Plans switch at the next billing cycle. You can downgrade or upgrade
            mid-cycle from your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Suggested chips ──────────────────────────────────────
function SuggestionChips({ items }: { items: string[] }) {
  return (
    <div className="flex max-w-[88%] flex-col items-start gap-1.5">
      {items.map((label, i) => (
        <button
          key={label}
          type="button"
          className="inline-flex items-center gap-2 rounded-full border px-[13px] py-[7px] text-[12px] leading-5 font-medium transition-all duration-200"
          style={{
            backgroundColor: PAPER,
            borderColor: LINE,
            color: INK,
            animation: `v6-fade 240ms ease-out ${i * 70}ms both`,
          }}
        >
          {label}
          <ArrowRight
            className="size-3.5"
            strokeWidth={2}
            style={{ color: ACCENT_INK }}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Smart follow-up chips ────────────────────────────────
function FollowUps() {
  return (
    <div className="flex max-w-[88%] flex-wrap items-center gap-1.5">
      <span
        className="font-mono text-[9px] font-semibold tracking-wider uppercase"
        style={{ color: MUTED }}
      >
        Follow up
      </span>
      {["Show comparison", "Apply now", "Email me a summary"].map((t) => (
        <button
          key={t}
          type="button"
          className="rounded-full border px-2.5 py-1 text-[11px]"
          style={{ backgroundColor: SURFACE, borderColor: LINE, color: INK }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

// ─── Personalized recommendation ──────────────────────────
function RecommendationCard() {
  return (
    <div
      className="flex max-w-[88%] flex-col gap-2 self-start overflow-hidden rounded-[12px] border"
      style={{ backgroundColor: SURFACE, borderColor: LINE }}
    >
      <div
        className="h-14 w-full"
        style={{
          background:
            "linear-gradient(135deg, #E0E5FA 0%, #C5CFF7 50%, #DDE4FF 100%)",
        }}
      />
      <div className="flex flex-col gap-1.5 px-3 pb-3">
        <div className="flex items-center gap-1.5">
          <Sparkles
            className="size-3"
            strokeWidth={2}
            style={{ color: ACCENT_INK }}
          />
          <span
            className="font-mono text-[9px] font-semibold tracking-wider uppercase"
            style={{ color: ACCENT_INK }}
          >
            For you
          </span>
        </div>
        <p className="text-[12px] font-semibold" style={{ color: INK }}>
          Save $156/yr on Studio
        </p>
        <p className="text-[11px] leading-[1.4]" style={{ color: SECONDARY }}>
          Based on how you&apos;ve used Tars this quarter, annual would have
          saved you about $156.
        </p>
        <div className="mt-1 flex items-center gap-2">
          <button
            className="rounded-full px-3 py-1 text-[11px] font-semibold text-white"
            style={{ backgroundColor: ACCENT }}
          >
            Switch to annual
          </button>
          <button
            className="rounded-full px-3 py-1 text-[11px]"
            style={{ color: SECONDARY }}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Voice message bubble ─────────────────────────────────
function VoiceBubble() {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 1) {
          setPlaying(false);
          return 0;
        }
        return p + 0.04;
      });
    }, 200);
    return () => window.clearInterval(id);
  }, [playing]);
  const heights = [8, 14, 10, 18, 12, 16, 8, 13, 11, 17, 9, 15, 11, 18, 13, 10, 16, 8, 14, 11];
  const active = Math.floor(progress * heights.length);
  return (
    <div className="flex justify-end">
      <div
        className="flex max-w-[78%] items-center gap-2 rounded-tl-[12px] rounded-tr-[12px] rounded-br-[6px] rounded-bl-[12px] border px-2 py-2"
        style={{
          backgroundColor: ACCENT_SOFT,
          borderColor: ACCENT_BORDER,
          color: ACCENT_INK,
        }}
      >
        <button
          type="button"
          onClick={() => {
            if (playing) setPlaying(false);
            else {
              setProgress(0);
              setPlaying(true);
            }
          }}
          className="flex size-5 items-center justify-center rounded-full"
          style={{ color: ACCENT_INK }}
        >
          {playing ? (
            <Pause className="size-2.5" strokeWidth={2} fill="currentColor" />
          ) : (
            <Play
              className="size-2.5 translate-x-[1px]"
              strokeWidth={2}
              fill="currentColor"
            />
          )}
        </button>
        <div className="flex items-center gap-[2px]">
          {heights.map((h, i) => (
            <span
              key={i}
              className="inline-block w-[2px] rounded-full"
              style={{
                height: `${h}px`,
                backgroundColor:
                  i < active ? ACCENT_INK : ACCENT_BORDER,
              }}
            />
          ))}
        </div>
        <span className="ml-1 font-mono text-[11px] tabular-nums">0:08</span>
      </div>
    </div>
  );
}

// ─── Thinking state ──────────────────────────────────────
function ThinkingBubble() {
  return (
    <div className="flex w-full justify-start">
      <div
        className="flex w-[260px] flex-col gap-2.5 rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] rounded-bl-[6px] border px-[14px] py-[12px]"
        style={{ backgroundColor: PAPER, borderColor: LINE }}
      >
        <div className="flex items-center gap-2">
          <span
            className="size-1.5 shrink-0 rounded-full"
            style={{
              backgroundColor: ACCENT,
              animation: "v6-pulse 1.4s ease-in-out infinite",
              boxShadow: "0 0 6px rgba(18,11,244,.45)",
            }}
          />
          <span className="text-[12px] font-medium" style={{ color: INK }}>
            Tars is thinking
          </span>
          <span
            className="inline-block h-3 w-[1.5px] -translate-y-px"
            style={{
              backgroundColor: ACCENT_INK,
              animation: "v6-cursor 1s steps(2) infinite",
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          {[88, 70, 50].map((w, i) => (
            <span
              key={i}
              className="block h-2 rounded-full"
              style={{
                width: `${w}%`,
                background:
                  "linear-gradient(90deg, var(--ds-border-line) 0%, var(--ds-bg-canvas) 50%, var(--ds-border-line) 100%)",
                backgroundSize: "200% 100%",
                animation: `v6-shimmer 1.6s ease-in-out ${i * 200}ms infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Handoff + connecting card ────────────────────────────
function HandoffSeam() {
  return (
    <div className="flex w-full items-center gap-3 py-1">
      <div className="h-px flex-1" style={{ backgroundColor: LINE }} />
      <div
        className="flex items-center gap-2 rounded-full border bg-white px-3 py-1.5"
        style={{ borderColor: LINE }}
      >
        <div
          className="flex size-5 items-center justify-center rounded-full text-[9px] font-semibold text-white"
          style={{ backgroundColor: "#A1593E" }}
        >
          P
        </div>
        <p className="text-[11px]" style={{ color: INK }}>
          <span className="font-semibold">Priya</span>{" "}
          <span style={{ color: SECONDARY }}>· Support Specialist</span>
        </p>
      </div>
      <div className="h-px flex-1" style={{ backgroundColor: LINE }} />
    </div>
  );
}

function ConnectingCard() {
  return (
    <div
      className="flex flex-col items-center gap-3 self-stretch rounded-[14px] border bg-white px-4 py-4"
      style={{ borderColor: LINE }}
    >
      <div className="flex items-center gap-2">
        <div
          className="flex size-9 items-center justify-center rounded-full text-[13px] font-semibold text-white"
          style={{ backgroundColor: ACCENT }}
        >
          T
        </div>
        <ArrowRight
          className="size-3.5"
          strokeWidth={2}
          style={{ color: SECONDARY }}
        />
        <div className="relative">
          <div
            className="flex size-9 items-center justify-center rounded-full text-[13px] font-semibold text-white"
            style={{ backgroundColor: "#A1593E" }}
          >
            P
          </div>
          <span
            className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full border-2 border-white"
            style={{ backgroundColor: "#16A34A" }}
          />
        </div>
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <p className="text-[12px] font-semibold" style={{ color: INK }}>
          Connecting you with Priya
        </p>
        <p className="text-[10px]" style={{ color: SECONDARY }}>
          You&apos;re #1 in queue · typically &lt;1 min
        </p>
      </div>
    </div>
  );
}

// ─── Human agent message ──────────────────────────────────
function HumanAgentMessage({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="ml-1 flex items-center gap-1.5">
        <div
          className="flex size-4 items-center justify-center rounded-full text-[8px] font-semibold text-white"
          style={{ backgroundColor: "#A1593E" }}
        >
          P
        </div>
        <p
          className="text-[11px] font-medium tracking-wide"
          style={{ color: SECONDARY }}
        >
          Priya <span style={{ color: FAINT }}>• Support Specialist</span>
        </p>
      </div>
      <div className="flex justify-start">
        <div
          className="max-w-[88%] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] rounded-bl-[6px] border px-[14px] py-[10px] text-[12px] leading-[1.55]"
          style={{ backgroundColor: PAPER, borderColor: LINE, color: INK }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}

// ─── Streaming AI bubble ──────────────────────────────────
function StreamingBubble() {
  return (
    <AiBubble showLabel>
      Looking at your <span className="font-semibold">Studio plan</span>,
      I&apos;ll pull your invoice and check what&apos;s renewable.
    </AiBubble>
  );
}

// ─── Header ───────────────────────────────────────────────
function ChatHeader() {
  return (
    <header
      className="flex w-full items-center gap-1 border-b px-4 py-3.5"
      style={{ borderColor: LINE_SOFT }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <button
          className="flex size-7 shrink-0 items-center justify-center rounded-[6px] transition-colors"
          style={{ color: SECONDARY }}
          aria-label="View chat history"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--ds-bg-subtle)";
            e.currentTarget.style.color = INK as string;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = SECONDARY as string;
          }}
        >
          <ChevronLeft className="size-5" strokeWidth={1.5} />
        </button>
        <div
          className="ml-1 flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full"
          style={{ backgroundColor: "#632E9A" }}
        >
          <img
            src="/tars-avatar.png"
            alt="Tars"
            className="size-9 scale-110 object-contain"
          />
        </div>
        <p
          className="ml-1 truncate text-[14px] leading-5 font-semibold"
          style={{ color: INK }}
        >
          Tars Agent
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          className="flex size-7 items-center justify-center rounded-[6px] transition-colors"
          style={{ color: SECONDARY }}
          aria-label="More options"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--ds-bg-subtle)";
            e.currentTarget.style.color = INK as string;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = SECONDARY as string;
          }}
        >
          <MoreVertical className="size-4" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className="flex size-7 items-center justify-center rounded-[6px] transition-colors"
          style={{ color: SECONDARY }}
          aria-label="Close"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--ds-bg-subtle)";
            e.currentTarget.style.color = INK as string;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = SECONDARY as string;
          }}
        >
          <X className="size-4" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}

// ─── Composer with multi-modal ────────────────────────────
function Composer() {
  return (
    <div className="flex w-full flex-col gap-2 px-3 pb-3">
      <div
        className="flex w-full items-end gap-2 rounded-[14px] border px-2 py-2"
        style={{ backgroundColor: PAPER, borderColor: LINE }}
      >
        <button
          type="button"
          className="flex size-7 shrink-0 items-center justify-center rounded-[6px] transition-colors"
          style={{ color: SECONDARY }}
          aria-label="Attach"
        >
          <Plus className="size-4" strokeWidth={1.5} />
        </button>
        <input
          type="text"
          placeholder="Ask anything…"
          className="min-w-0 flex-1 self-center bg-transparent text-[12px] outline-none"
          style={{ color: INK }}
        />
        <button
          type="button"
          className="flex size-7 shrink-0 items-center justify-center rounded-[6px]"
          style={{ color: SECONDARY }}
          aria-label="Image"
        >
          <ImageIcon className="size-4" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className="flex size-7 shrink-0 items-center justify-center rounded-[6px]"
          style={{ color: SECONDARY }}
          aria-label="Voice"
        >
          <Mic className="size-4" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className="flex size-7 shrink-0 items-center justify-center rounded-[6px] text-white"
          style={{ backgroundColor: ACCENT }}
          aria-label="Send"
        >
          <ArrowUp className="size-4" strokeWidth={2} />
        </button>
      </div>
      <div
        className="flex items-center justify-between px-1 text-[10px]"
        style={{ color: MUTED }}
      >
        <span className="flex items-center gap-1.5">
          <Lock className="size-2.5" strokeWidth={2} />
          Encrypted end-to-end
        </span>
        <span>Tars • AI Agent</span>
      </div>
    </div>
  );
}


// ─── Page ─────────────────────────────────────────────────
export default function V6Page() {
  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={
        {
          backgroundImage: "url('/tars-hero-bg.png')",
          "--ds-accent": "#632E9A",
          "--ds-accent-ink": "#4A1F77",
          "--ds-accent-soft": "#F0E7FA",
          "--ds-accent-border": "#C5A8E0",
          "--ds-accent-hover": "#57267F",
          "--ds-accent-pressed": "#3D1962",
        } as React.CSSProperties
      }
    >
      <style dangerouslySetInnerHTML={{ __html: SHOWCASE_KEYFRAMES }} />

      <div
        data-chat-card
        className="absolute top-24 right-6 flex h-[680px] w-[400px] flex-col overflow-hidden rounded-[20px] border"
        style={{
          backgroundColor: CANVAS,
          borderColor: "var(--ds-border-line-strong)",
          boxShadow:
            "0 -3px 14px rgba(0,0,0,.04), 0 2px 4px rgba(0,0,0,.05), 0 18px 44px rgba(0,0,0,.12), 0 40px 80px rgba(0,0,0,.08)",
        }}
      >
        <ChatHeader />

        <main
          className="scrollbar-subtle flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
          style={{ scrollBehavior: "smooth" }}
        >
          {/* Onboarding AI message */}
          <AiBubble showLabel>
            Welcome back, <span className="font-semibold">Sarah</span> 👋
            <br />
            What can I help you with today?
          </AiBubble>

          {/* Soft prompts */}
          <SuggestionChips
            items={["Update my plan", "Check my invoice", "Talk to billing"]}
          />

          {/* User reply */}
          <UserBubble>Help me update my plan.</UserBubble>

          {/* Streaming + thinking */}
          <StreamingBubble />

          {/* Variation 1 — Reasoning shown as a separate box above the AI reply */}
          <ReasoningBox
            elapsed="1.4s"
            steps={[
              <>
                Verified your account on the{" "}
                <strong style={{ color: INK }}>Studio plan</strong>
              </>,
              <>
                Called tool <ToolChip name="get_Invoice" /> to pull your
                current invoice
              </>,
              <>
                Used <ToolChip name="compare_Plans" /> to weigh monthly vs
                annual
              </>,
              <>Decided annual would be the better value</>,
            ]}
          />
          <CitedAiBubble />

          {/* Inline actions */}
          <InlineActions />

          {/* Variation 2 — chips inside the bubble (Show reasoning + tool chips) */}
          <ChipVariationBubble />
          <InlineActions />

          {/* Variation 3 — inline text links: "Reasoning ▶ | Tools used ▶" */}
          <LinkVariationBubble />
          <InlineActions />

          {/* Voice message */}
          <VoiceBubble />

          {/* Thinking state */}
          <ThinkingBubble />

          {/* AI with link preview */}
          <AiBubble>
            Got the file. Looking at the screenshot, here&apos;s the relevant
            help article — it covers the exact error you&apos;re hitting.
          </AiBubble>
          <LinkPreview />

          {/* Reactions on the link-preview message */}
          <InlineActions />

          {/* Handoff: connecting */}
          <AiBubble>
            Let me bring in a teammate who can look at the account directly.
          </AiBubble>
          <ConnectingCard />

          {/* Seam */}
          <HandoffSeam />

          {/* Human message */}
          <HumanAgentMessage text="Hi Sarah — Tars filled me in. I'm pulling up your dashboard now." />

          {/* Co-browsing indicator */}
          <div
            className="flex items-center gap-2 self-start rounded-full border px-2.5 py-1"
            style={{ backgroundColor: "#F7F3FF", borderColor: "#E1D7FA" }}
          >
            <Eye className="size-3" strokeWidth={2} style={{ color: "#6A2BFF" }} />
            <span className="text-[11px]" style={{ color: "#6A2BFF" }}>
              Priya is viewing your dashboard
            </span>
          </div>

          {/* Trailing presence */}
          <ThinkingBubble />
        </main>

        <Composer />

      </div>
    </div>
  );
}
