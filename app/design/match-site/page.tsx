"use client";

/* ── MATCH MY SITE ────────────────────────────────────────────────────────
   The answer to "make it look like it's actually there" is not more sliders.
   Nobody has ever matched a typeface by dragging a number.

   The widget runs on the customer's page, which means it can read the real
   values — font-family, border-radius, box-shadow, background — off their own
   elements. So the panel should open on a proposal rather than a blank form:
   here is what we found, use it or adjust it.

   What is real here: the derivation. Site tokens go in, a messenger theme
   comes out, and you can see the two side by side. What is staged is the
   reading — a browser cannot inspect a third-party page from here, so the
   sites below are fixtures. In the product that step is a getComputedStyle
   call in the install snippet, which is less clever and more accurate than
   anything this file could do. ────────────────────────────────────────── */

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Loader2,
  Mic,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";

/* ── what a site tells us about itself ─────────────────────────────────── */

type Elevation = "shadow" | "border" | "flat";
type Density = "comfortable" | "compact";

type SiteTokens = {
  id: string;
  host: string;
  name: string;
  font: string;
  fontLabel: string;
  radius: number;
  elevation: Elevation;
  /* the page's own ground, which is rarely pure white */
  page: string;
  card: string;
  ink: string;
  muted: string;
  line: string;
  accent: string;
  density: Density;
};

const SITES: SiteTokens[] = [
  {
    id: "gp",
    host: "globalpayments.com",
    name: "Global Payments",
    font: "system-ui, -apple-system, sans-serif",
    fontLabel: "system-ui",
    radius: 8,
    elevation: "flat",
    page: "#FFFFFF",
    card: "#F6F7FB",
    ink: "#0B1020",
    muted: "#5A6178",
    line: "#E3E6EF",
    accent: "#120BF4",
    density: "comfortable",
  },
  {
    id: "beacon",
    host: "beaconhealth.co",
    name: "Beacon Health",
    font: "Georgia, 'Times New Roman', serif",
    fontLabel: "Georgia",
    radius: 20,
    elevation: "shadow",
    page: "#FFFDF8",
    card: "#FFFFFF",
    ink: "#1F2420",
    muted: "#6B7268",
    line: "#E8E2D6",
    accent: "#0F766E",
    density: "comfortable",
  },
  {
    id: "northwind",
    host: "northwind.supply",
    name: "Northwind Supply",
    font: "'Helvetica Neue', Arial, sans-serif",
    fontLabel: "Helvetica Neue",
    radius: 2,
    elevation: "border",
    page: "#FAFAFA",
    card: "#FFFFFF",
    ink: "#18181B",
    muted: "#71717A",
    line: "#D4D4D8",
    accent: "#C2410C",
    density: "compact",
  },
];

/* The platform's own look, which is what a tenant gets today if they change
   nothing but the accent. */
const DEFAULT_THEME = {
  font: "var(--font-sans), sans-serif",
  fontLabel: "Poppins",
  radius: 16,
  elevation: "shadow" as Elevation,
  surface: "#FFFFFF",
  paper: "#F2F2F2",
  ink: "#16181D",
  muted: "#9CA3AF",
  line: "#E9EAEA",
  accent: "#632E9A",
  density: "comfortable" as Density,
};
type Theme = typeof DEFAULT_THEME;

/* ── the derivation, which is the part being designed ──────────────────── */

/* Six values out, from what the page already says about itself. Not a copy of
   the site — a messenger that agrees with it. The bubble radius is the site's
   radius nudged up, because a speech bubble at 2px is a box and at 20px is a
   pill, and both of those are still recognisably "their corners". */
function themeFrom(s: SiteTokens): Theme {
  return {
    font: s.font,
    fontLabel: s.fontLabel,
    radius: s.radius,
    elevation: s.elevation,
    /* The panel sits on their page, so it takes their card colour rather than
       a white that would punch a hole in a warm ground. */
    surface: s.card,
    paper: mix(s.card, s.ink, 0.06),
    ink: s.ink,
    muted: s.muted,
    line: s.line,
    accent: s.accent,
    density: s.density,
  };
}

function mix(a: string, b: string, t: number) {
  const hx = (h: string) =>
    [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r1, g1, b1] = hx(a);
  const [r2, g2, b2] = hx(b);
  const out = [r1, g1, b1].map((v, i) =>
    Math.round(v + ([r2, g2, b2][i] - v) * t),
  );
  return "#" + out.map((v) => v.toString(16).padStart(2, "0")).join("");
}

const lift = (t: Theme, deep = false) => {
  if (t.elevation === "flat") return `inset 0 0 0 1px ${t.line}`;
  if (t.elevation === "border") return `inset 0 0 0 1px ${t.line}`;
  return deep
    ? `0 18px 50px -12px rgba(15,17,26,0.24), 0 2px 6px rgba(15,17,26,0.06)`
    : `0 6px 20px -8px rgba(15,17,26,0.18)`;
};
const pad = (t: Theme) => (t.density === "compact" ? 10 : 14);

/* ── the customer's page ───────────────────────────────────────────────── */

function SiteCanvas({ s, children }: { s: SiteTokens; children: React.ReactNode }) {
  const box =
    s.elevation === "shadow"
      ? "0 10px 30px -14px rgba(15,17,26,0.22)"
      : s.elevation === "border"
        ? `inset 0 0 0 1px ${s.line}`
        : `inset 0 0 0 1px ${s.line}`;
  return (
    <div
      className="relative h-[560px] w-full overflow-hidden rounded-xl"
      style={{ background: s.page, fontFamily: s.font, color: s.ink }}
    >
      {/* their header */}
      <div
        className="flex items-center gap-4 px-6 py-4"
        style={{ borderBottom: `1px solid ${s.line}` }}
      >
        <span className="text-[15px] font-bold tracking-tight">{s.name}</span>
        <span className="ml-auto flex items-center gap-5 text-[12px]" style={{ color: s.muted }}>
          <span>Products</span>
          <span>Pricing</span>
          <span>Support</span>
          <Search className="size-3.5" strokeWidth={2} />
        </span>
        <span
          className="px-3 py-1.5 text-[12px] font-semibold text-white"
          style={{ background: s.accent, borderRadius: s.radius }}
        >
          Get started
        </span>
      </div>

      {/* their hero */}
      <div className="px-6 pt-10">
        <h2 className="max-w-[420px] text-[28px] font-bold leading-[1.15] tracking-tight">
          Payments that keep up with your business
        </h2>
        <p className="mt-3 max-w-[380px] text-[13px] leading-relaxed" style={{ color: s.muted }}>
          Take payments in person, online and on the move — with one account
          and one place to see all of it.
        </p>
        <span
          className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white"
          style={{ background: s.accent, borderRadius: s.radius }}
        >
          Talk to sales
          <ArrowRight className="size-3.5" strokeWidth={2.5} />
        </span>

        <div className="mt-8 grid grid-cols-3 gap-3">
          {["In person", "Online", "On the move"].map((t) => (
            <div
              key={t}
              className="p-4"
              style={{ background: s.card, borderRadius: s.radius, boxShadow: box }}
            >
              <p className="text-[12px] font-semibold">{t}</p>
              <p className="mt-1.5 text-[11px] leading-snug" style={{ color: s.muted }}>
                Terminals, tap to pay and a till that talks to your books.
              </p>
            </div>
          ))}
        </div>
      </div>

      {children}
    </div>
  );
}

/* ── the messenger, in whichever theme it has been given ───────────────── */

function Messenger({ t }: { t: Theme }) {
  const p = pad(t);
  return (
    <div
      className="absolute bottom-5 right-5 flex w-[300px] flex-col overflow-hidden"
      style={{
        background: t.surface,
        borderRadius: t.radius + 6,
        boxShadow: lift(t, true),
        fontFamily: t.font,
        color: t.ink,
      }}
    >
      <div
        className="flex items-center gap-2.5"
        style={{ padding: `${p - 2}px ${p}px`, borderBottom: `1px solid ${t.line}` }}
      >
        <span
          className="grid size-7 shrink-0 place-items-center text-[11px] font-bold text-white"
          style={{ background: t.accent, borderRadius: t.radius >= 16 ? 999 : t.radius }}
        >
          T
        </span>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-[12px] font-semibold">Assistant</span>
          <span className="truncate text-[10px]" style={{ color: t.muted }}>
            Usually replies instantly
          </span>
        </span>
      </div>

      <div className="flex flex-col gap-2.5" style={{ padding: p }}>
        <div
          className="w-fit max-w-[85%] text-[12px] leading-relaxed"
          style={{
            background: t.paper,
            color: t.ink,
            borderRadius: t.radius,
            padding: `${p - 6}px ${p - 4}px`,
          }}
        >
          Hi — looking for the right setup for your business?
        </div>
        <div
          className="ml-auto w-fit max-w-[85%] text-[12px] leading-relaxed text-white"
          style={{
            background: t.accent,
            borderRadius: t.radius,
            padding: `${p - 6}px ${p - 4}px`,
          }}
        >
          I take payments online
        </div>
        <div
          className="flex items-center gap-1.5 text-[12px] font-medium"
          style={{ color: t.accent }}
        >
          <Sparkles className="size-3.5" strokeWidth={2} />
          Thinking…
        </div>
      </div>

      <div style={{ padding: `0 ${p}px ${p}px` }}>
        <div
          className="flex items-center gap-2 px-2 py-1.5"
          style={{
            borderRadius: t.radius >= 14 ? 999 : t.radius,
            boxShadow: `inset 0 0 0 1px ${t.line}`,
          }}
        >
          <Plus className="size-3.5 shrink-0" strokeWidth={2} style={{ color: t.muted }} />
          <span className="min-w-0 flex-1 truncate text-[12px]" style={{ color: t.muted }}>
            Ask me anything…
          </span>
          <span
            className="grid size-6 shrink-0 place-items-center rounded-full text-white"
            style={{ background: t.accent }}
          >
            <Mic className="size-3" strokeWidth={2} />
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── the proposal ──────────────────────────────────────────────────────── */

const ELEV_LABEL: Record<Elevation, string> = {
  shadow: "Soft shadow",
  border: "Hairline border",
  flat: "Flat, with a hairline",
};

function Found({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="w-[86px] shrink-0 text-[11px] uppercase tracking-wider text-[#A8A8A8]">
        {label}
      </span>
      <span className="min-w-0 flex-1 truncate text-[12px] text-[#333]">{value}</span>
      {children}
    </div>
  );
}

export default function MatchSite() {
  const [site, setSite] = useState(SITES[0]);
  /* idle → looking → found. The wait is staged, but it is the shape the real
     one has: a request goes out and an answer comes back. */
  const [phase, setPhase] = useState<"idle" | "looking" | "found">("found");
  const [matched, setMatched] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const scan = (s: SiteTokens) => {
    setSite(s);
    setPhase("looking");
    setMatched(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setPhase("found"), 1100);
  };

  const proposed = themeFrom(site);
  const theme = matched ? proposed : DEFAULT_THEME;

  return (
    <main className="min-h-screen bg-[#F7F7F8] px-8 py-10">
      <header className="mb-7 max-w-[720px]">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#632E9A]">
          Design panel · study
        </p>
        <h1 className="mt-1 text-[24px] font-semibold text-[#1A1A1A]">
          Match my site
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-[#666]">
          The widget runs on their page, so it can read the real values off
          their own elements rather than asking someone to guess them. The
          panel opens on a proposal, and one press is a better match than
          twenty minutes of sliders. Switch sites, then toggle between the
          platform default and the proposal.
        </p>
      </header>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-[#8A8A8A]">
          Site
        </span>
        {SITES.map((s) => (
          <button
            key={s.id}
            onClick={() => scan(s)}
            className={`rounded-lg border px-3 py-1.5 text-[12px] transition-colors ${
              site.id === s.id
                ? "border-[#C4A9E8] bg-[#F8F4FF] font-semibold text-[#6D33AA]"
                : "border-[#E5E5E5] text-[#666] hover:border-[#D5D5D5]"
            }`}
          >
            {s.host}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-start gap-6">
        {/* the page, with the messenger on it */}
        <div className="min-w-[520px] flex-1">
          <div className="mb-2 flex items-center gap-2">
            {(
              [
                ["Platform default", false],
                ["Matched to site", true],
              ] as const
            ).map(([label, v]) => (
              <button
                key={label}
                onClick={() => setMatched(v)}
                disabled={phase !== "found"}
                className={`rounded-lg border px-3 py-1.5 text-[12px] transition-colors disabled:opacity-50 ${
                  matched === v
                    ? "border-[#C4A9E8] bg-[#F8F4FF] font-semibold text-[#6D33AA]"
                    : "border-[#E5E5E5] text-[#666] hover:border-[#D5D5D5]"
                }`}
              >
                {label}
              </button>
            ))}
            <span className="ml-1 text-[11px] text-[#A8A8A8]">
              {matched
                ? `${theme.fontLabel} · ${theme.radius}px · ${ELEV_LABEL[theme.elevation].toLowerCase()}`
                : "Poppins · 16px · soft shadow · white"}
            </span>
          </div>
          <SiteCanvas s={site}>
            <Messenger t={theme} />
          </SiteCanvas>
        </div>

        {/* the proposal card */}
        <div className="w-[320px] shrink-0">
          <div className="rounded-2xl border border-[#E8E8E8] bg-white p-4 shadow-sm">
            {phase === "looking" ? (
              <div className="flex items-center gap-2 py-6 text-[13px] text-[#777]">
                <Loader2 className="size-4 animate-spin" strokeWidth={2} />
                Looking at {site.host}…
              </div>
            ) : (
              <>
                <p className="text-[13px] font-semibold text-[#222]">
                  We looked at {site.host}
                </p>
                <p className="mt-1 text-[11px] leading-snug text-[#999]">
                  Read from your own pages. Nothing is applied until you say so.
                </p>
                <div className="mt-3 border-y border-[#F0F0F2] py-1">
                  <Found label="Typeface" value={site.fontLabel}>
                    <span
                      className="shrink-0 text-[13px] text-[#333]"
                      style={{ fontFamily: site.font }}
                    >
                      Ag
                    </span>
                  </Found>
                  <Found label="Corners" value={`${site.radius}px`}>
                    <span
                      className="size-4 shrink-0 bg-[#E9E4F5]"
                      style={{ borderRadius: site.radius / 2 }}
                    />
                  </Found>
                  <Found label="Elevation" value={ELEV_LABEL[site.elevation]}>
                    <span
                      className="size-4 shrink-0 rounded bg-white"
                      style={{
                        boxShadow:
                          site.elevation === "shadow"
                            ? "0 3px 8px -2px rgba(15,17,26,0.35)"
                            : `inset 0 0 0 1px ${site.line}`,
                      }}
                    />
                  </Found>
                  <Found label="Surface" value={site.card.toUpperCase()}>
                    <span
                      className="size-4 shrink-0 rounded ring-1 ring-black/10"
                      style={{ background: site.card }}
                    />
                  </Found>
                  <Found label="Accent" value={site.accent.toUpperCase()}>
                    <span
                      className="size-4 shrink-0 rounded"
                      style={{ background: site.accent }}
                    />
                  </Found>
                  <Found
                    label="Density"
                    value={site.density === "compact" ? "Compact" : "Comfortable"}
                  />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => setMatched(true)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#632E9A] px-3 py-2 text-[12px] font-semibold text-white"
                  >
                    {matched && <Check className="size-3.5" strokeWidth={3} />}
                    {matched ? "Applied" : "Use these"}
                  </button>
                  <button className="rounded-lg border border-[#E5E5E5] px-3 py-2 text-[12px] font-medium text-[#555]">
                    Adjust
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="mt-5 text-[12px] leading-relaxed text-[#777]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A8A8A8]">
              Why six
            </p>
            <p className="mt-2">
              These are the values that carry &ldquo;looks like ours&rdquo;.
              Typeface is the loudest — a Poppins panel on a Helvetica site is
              spotted before anyone reads a word. Nothing here is per-component:
              separate bubble and button radii is how a widget ends up not
              matching itself.
            </p>
            <p className="mt-2">
              What is staged is the reading. In the product it is a
              <span className="font-mono text-[11px]"> getComputedStyle </span>
              call in the install snippet — less clever than a guess, and right.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
