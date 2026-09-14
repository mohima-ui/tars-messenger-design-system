"use client";

/* ─── Launcher button — four directions ───────────────────────────────────
   Vinit's note was that the current button reads like 2000s live chat: the
   icon set, the flat disc, the hard shadow. These are four ways out of that,
   shown together and in place rather than described, because the whole
   question is how they sit on a page.

   Each is the same size and in the same corner. What varies is the surface,
   the mark inside it, and how much the thing announces itself — which is the
   real axis here, since the brief is "premium" and "not on the face" at once. */

import { useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";

const ACCENT = "#6D33AA";
const ACCENT_LITE = "#C2AAE8";
const SIZE = 56;

/* ── the mark ──
   The stock chat bubble is the tell. Everyone's live chat from 2005 used one,
   so it dates the product before a visitor has read a word. A sparkle says
   "this answers things" instead of "this is a chat window", which is also the
   more honest description of what is behind it now. */
function Mark({ size = 22, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return <Sparkles style={{ width: size, height: size, color }} strokeWidth={1.7} />;
}

/* ─── 1. Soft square ─────────────────────────────────────────────────────
   The squircle rather than the circle. A disc is what every chat widget is,
   so the shape alone reads as one; a generous corner radius on a square is
   the shape modern app icons use, and it borrows that association. A single
   inner highlight along the top edge keeps it from looking like flat fill. */
function SoftSquare({ hover }: { hover: boolean }) {
  return (
    <span
      className="grid place-items-center transition-transform duration-300"
      style={{
        width: SIZE,
        height: SIZE,
        borderRadius: 18,
        background: `linear-gradient(160deg, ${ACCENT_LITE} -40%, ${ACCENT} 55%)`,
        boxShadow: hover
          ? `0 14px 30px -8px ${ACCENT}66, 0 2px 6px rgba(15,17,26,0.16), inset 0 1px 0 rgba(255,255,255,0.28)`
          : `0 10px 24px -8px ${ACCENT}4D, 0 2px 5px rgba(15,17,26,0.12), inset 0 1px 0 rgba(255,255,255,0.28)`,
        transform: hover ? "translateY(-2px)" : "none",
      }}
    >
      <Mark />
    </span>
  );
}

/* ─── 2. Quiet disc ──────────────────────────────────────────────────────
   The opposite bet: the button stops competing with the site and becomes a
   white object resting on it, with the accent only in the mark. On a designed
   page — the enterprise case — a saturated blob in the corner is the thing
   that looks bolted on, and this is what "blends in" actually looks like. */
function QuietDisc({ hover }: { hover: boolean }) {
  return (
    <span
      className="grid place-items-center transition-transform duration-300"
      style={{
        width: SIZE,
        height: SIZE,
        borderRadius: 999,
        background: "#FFFFFF",
        boxShadow: hover
          ? "0 16px 34px -10px rgba(15,17,26,0.26), 0 2px 6px rgba(15,17,26,0.10), inset 0 0 0 1px rgba(15,17,26,0.07)"
          : "0 10px 26px -10px rgba(15,17,26,0.20), 0 2px 5px rgba(15,17,26,0.08), inset 0 0 0 1px rgba(15,17,26,0.07)",
        transform: hover ? "translateY(-2px)" : "none",
      }}
    >
      <Mark color={ACCENT} />
    </span>
  );
}

/* ─── 3. Named chip ──────────────────────────────────────────────────────
   Vinit's point that customers brand these — Intercom's "Noti", and the rest.
   A chip says what it is in words, which is the only version that needs no
   convention to be understood, and it is the one that carries a name. Costs
   width, which is why it is a choice and not the default. */
function NamedChip({ hover, label = "Ask Tars" }: { hover: boolean; label?: string }) {
  return (
    <span
      className="flex items-center gap-2.5 transition-transform duration-300"
      style={{
        height: SIZE,
        paddingLeft: 10,
        paddingRight: 20,
        borderRadius: 999,
        background: "#FFFFFF",
        boxShadow: hover
          ? "0 16px 34px -10px rgba(15,17,26,0.26), 0 2px 6px rgba(15,17,26,0.10), inset 0 0 0 1px rgba(15,17,26,0.07)"
          : "0 10px 26px -10px rgba(15,17,26,0.20), 0 2px 5px rgba(15,17,26,0.08), inset 0 0 0 1px rgba(15,17,26,0.07)",
        transform: hover ? "translateY(-2px)" : "none",
      }}
    >
      <span
        className="grid size-9 shrink-0 place-items-center rounded-full"
        style={{ background: `linear-gradient(160deg, ${ACCENT_LITE} -30%, ${ACCENT} 60%)` }}
      >
        <Mark size={17} />
      </span>
      <span className="text-[15px] font-medium" style={{ color: "#16181D" }}>
        {label}
      </span>
    </span>
  );
}

/* ─── 4. Haloed ──────────────────────────────────────────────────────────
   The soft square with one thing added: a ring that breathes, slowly enough
   to be noticed rather than watched. This is the "something subtle around it"
   Vinit remembered liking — and the direction most likely to be the one that
   goes too far, which is why it is here to be compared rather than assumed. */
function Haloed({ hover }: { hover: boolean }) {
  return (
    <span className="relative grid place-items-center" style={{ width: SIZE, height: SIZE }}>
      <span
        aria-hidden
        className="absolute inset-0 rounded-[18px] motion-reduce:hidden"
        style={{
          boxShadow: `0 0 0 0 ${ACCENT}59`,
          animation: "halo 3200ms cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      />
      <SoftSquare hover={hover} />
    </span>
  );
}

/* ─── 5. Outlined ────────────────────────────────────────────────────────
   The lightest footprint there is: no fill at all, a hairline in the accent
   and the mark inside it. On a photographic or busy page a filled button has
   to fight the background; an outline lets the page through and still reads
   as an object because of the shadow underneath. */
function Outlined({ hover }: { hover: boolean }) {
  return (
    <span
      className="grid place-items-center transition-transform duration-300"
      style={{
        width: SIZE,
        height: SIZE,
        borderRadius: 999,
        background: "rgba(255,255,255,0.92)",
        boxShadow: hover
          ? `inset 0 0 0 1.5px ${ACCENT}, 0 14px 30px -10px rgba(15,17,26,0.24)`
          : `inset 0 0 0 1.5px ${ACCENT}59, 0 8px 22px -10px rgba(15,17,26,0.18)`,
        transform: hover ? "translateY(-2px)" : "none",
      }}
    >
      <Mark color={ACCENT} />
    </span>
  );
}

/* ─── 6. Ink ─────────────────────────────────────────────────────────────
   Near-black rather than the brand colour. This is what Chatbase, Linear and
   most of the current crop use, and the reason is that black is the one colour
   that never clashes with the site it is placed on — a tenant with an orange
   brand does not get an orange blob fighting their header. The accent survives
   inside the panel, where it has room to mean something. */
function Ink({ hover }: { hover: boolean }) {
  return (
    <span
      className="grid place-items-center transition-transform duration-300"
      style={{
        width: SIZE,
        height: SIZE,
        borderRadius: 999,
        background: "linear-gradient(160deg, #3A3A44 -30%, #16181D 60%)",
        boxShadow: hover
          ? "0 16px 34px -10px rgba(15,17,26,0.46), 0 3px 8px rgba(15,17,26,0.22), inset 0 1px 0 rgba(255,255,255,0.16)"
          : "0 10px 26px -10px rgba(15,17,26,0.38), 0 2px 6px rgba(15,17,26,0.16), inset 0 1px 0 rgba(255,255,255,0.16)",
        transform: hover ? "translateY(-2px)" : "none",
      }}
    >
      <Mark />
    </span>
  );
}

/* ─── 7. Avatar ──────────────────────────────────────────────────────────
   A face, with a presence dot. Plenty of customers upload a photo or a logo
   already; this treats that as the design rather than as an override that
   happens to fill the same box. The dot is doing real work — it is the one
   element here that says someone is available rather than that a tool exists. */
function Avatar({ hover }: { hover: boolean }) {
  return (
    <span className="relative transition-transform duration-300" style={{ transform: hover ? "translateY(-2px)" : "none" }}>
      <span
        className="grid place-items-center overflow-hidden"
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: 999,
          background: `linear-gradient(150deg, ${ACCENT_LITE}, ${ACCENT})`,
          boxShadow: hover
            ? "0 16px 34px -10px rgba(15,17,26,0.28), inset 0 0 0 2px rgba(255,255,255,0.9)"
            : "0 10px 26px -10px rgba(15,17,26,0.22), inset 0 0 0 2px rgba(255,255,255,0.9)",
        }}
      >
        <span className="text-[20px] font-semibold text-white">T</span>
      </span>
      <span
        aria-hidden
        className="absolute bottom-0.5 right-0.5 size-3.5 rounded-full"
        style={{ background: "#22C55E", boxShadow: "0 0 0 2.5px #FBFBFC" }}
      />
    </span>
  );
}

/* ─── 8. Glass ───────────────────────────────────────────────────────────
   Frosted, picking up whatever it sits over. The same material the composer
   launcher is built from, so the two launcher types would finally look like
   one family rather than two products. Costs a backdrop-filter, and it only
   works where there is something behind it worth blurring. */
function Glass({ hover }: { hover: boolean }) {
  return (
    <span
      className="grid place-items-center backdrop-blur-md transition-transform duration-300"
      style={{
        width: SIZE,
        height: SIZE,
        borderRadius: 20,
        background: `linear-gradient(150deg, rgba(255,255,255,0.86), ${ACCENT}1F)`,
        boxShadow: hover
          ? `inset 0 0 0 1px rgba(255,255,255,0.9), inset 0 -1px 0 ${ACCENT}33, 0 16px 34px -10px rgba(15,17,26,0.26)`
          : `inset 0 0 0 1px rgba(255,255,255,0.9), inset 0 -1px 0 ${ACCENT}33, 0 10px 26px -10px rgba(15,17,26,0.20)`,
        transform: hover ? "translateY(-2px)" : "none",
      }}
    >
      <Mark color={ACCENT} />
    </span>
  );
}

/* ─── 9. Edge-lit ────────────────────────────────────────────────────────
   A light travelling the rim, masked to the border so only the edge glows.
   Lifted from the composer launcher's own hairline, which is the argument for
   it: the button would carry the same signature the composer already has, and
   a customer switching between the two launcher types would recognise it. */
function EdgeLit({ hover }: { hover: boolean }) {
  return (
    <span className="relative grid place-items-center" style={{ width: SIZE, height: SIZE }}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[18px] motion-reduce:hidden"
        style={{
          padding: 1.5,
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          maskComposite: "exclude",
        }}
      >
        <span
          className="absolute left-1/2 top-1/2 aspect-square w-[170%] -translate-x-1/2 -translate-y-1/2"
          style={{
            background: `conic-gradient(${ACCENT_LITE} 0deg, transparent 80deg, transparent 280deg, ${ACCENT_LITE} 360deg)`,
            animation: "rim 4200ms linear infinite",
          }}
        />
      </span>
      <span
        className="grid place-items-center transition-transform duration-300"
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: 18,
          background: "linear-gradient(160deg, #2A2A33 -30%, #16181D 60%)",
          boxShadow: hover
            ? "0 16px 34px -10px rgba(15,17,26,0.46)"
            : "0 10px 26px -10px rgba(15,17,26,0.38)",
          transform: hover ? "translateY(-2px)" : "none",
        }}
      >
        <Mark />
      </span>
    </span>
  );
}

/* ─── 10. Ask pill ───────────────────────────────────────────────────────
   The chip stripped to one word and an arrow. A name is what most customers
   want the chip for, but a verb is what a visitor needs — "Ask" says what
   pressing it does, in less width than any name would take. */
function AskPill({ hover }: { hover: boolean }) {
  return (
    <span
      className="flex items-center gap-2 transition-transform duration-300"
      style={{
        height: 48,
        padding: "0 8px 0 18px",
        borderRadius: 999,
        background: "linear-gradient(160deg, #3A3A44 -30%, #16181D 60%)",
        boxShadow: hover
          ? "0 16px 34px -10px rgba(15,17,26,0.46), 0 3px 8px rgba(15,17,26,0.22)"
          : "0 10px 26px -10px rgba(15,17,26,0.38), 0 2px 6px rgba(15,17,26,0.16)",
        transform: hover ? "translateY(-2px)" : "none",
      }}
    >
      <span className="text-[15px] font-medium text-white">Ask</span>
      <span
        className="grid size-8 place-items-center rounded-full"
        style={{ background: `linear-gradient(150deg, ${ACCENT_LITE}, ${ACCENT})` }}
      >
        <ArrowUp className="size-4 text-white" strokeWidth={2.2} />
      </span>
    </span>
  );
}

const VARIANTS = [
  {
    key: "soft-square",
    name: "Soft square",
    note: "App-icon shape instead of the universal chat disc. Gradient and a top highlight so it is not flat fill.",
    Render: SoftSquare,
  },
  {
    key: "quiet-disc",
    name: "Quiet disc",
    note: "White object resting on the page, accent only in the mark. The restrained one — likeliest to survive an enterprise review.",
    Render: QuietDisc,
  },
  {
    key: "named-chip",
    name: "Named chip",
    note: "Says what it is in words and carries a name. Needs no convention to be understood; costs width.",
    Render: NamedChip,
  },
  {
    key: "haloed",
    name: "Haloed",
    note: "Soft square plus a slow breathing ring. The most alive, and the one most at risk of being too much.",
    Render: Haloed,
  },
  {
    key: "outlined",
    name: "Outlined",
    note: "No fill — a hairline and the mark. Lets a busy or photographic page through instead of fighting it.",
    Render: Outlined,
  },
  {
    key: "ink",
    name: "Ink",
    note: "Near-black rather than the brand colour, so it never clashes with the site it is placed on. What most of the current crop use.",
    Render: Ink,
  },
  {
    key: "avatar",
    name: "Avatar",
    note: "A face with a presence dot. The only one that says someone is available rather than that a tool exists.",
    Render: Avatar,
  },
  {
    key: "glass",
    name: "Glass",
    note: "Frosted, picking up what it sits over — the same material the composer launcher is built from, so the two would look like one family.",
    Render: Glass,
  },
  {
    key: "edge-lit",
    name: "Edge-lit",
    note: "A light travelling the rim, masked to the border. Carries the composer launcher's own signature.",
    Render: EdgeLit,
  },
  {
    key: "ask-pill",
    name: "Ask pill",
    note: "The chip cut to a verb and an arrow. Says what pressing it does, in less width than a name.",
    Render: AskPill,
  },
] as const;

export default function ButtonLab() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#F4F4F5] px-8 py-10 text-[#16181D]">
      <style>{`
        @keyframes rim {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes halo {
          0%   { box-shadow: 0 0 0 0 ${ACCENT}59; }
          70%  { box-shadow: 0 0 0 14px ${ACCENT}00; }
          100% { box-shadow: 0 0 0 0 ${ACCENT}00; }
        }
      `}</style>

      <header className="mx-auto mb-8 max-w-[1100px]">
        <h1 className="text-[20px] font-semibold">Launcher button — four directions</h1>
        <p className="mt-1.5 max-w-[620px] text-[14px] leading-relaxed text-[#52525B]">
          Same size, same corner, same mark. What changes is the surface and how much the
          button announces itself. Hover any card to see its resting and raised states.
        </p>
      </header>

      <div className="mx-auto grid max-w-[1100px] gap-5 md:grid-cols-2">
        {VARIANTS.map(({ key, name, note, Render }) => (
          <section
            key={key}
            onMouseEnter={() => setHovered(key)}
            onMouseLeave={() => setHovered(null)}
            className="overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white"
          >
            {/* on a page, not on a swatch — a corner button can only be judged
                against the content it sits over */}
            <div className="relative h-[260px] bg-[#FBFBFC] p-6">
              <div className="space-y-2.5">
                <div className="h-3 w-1/3 rounded bg-[#ECECEF]" />
                <div className="h-3 w-3/4 rounded bg-[#F1F1F4]" />
                <div className="h-3 w-2/3 rounded bg-[#F1F1F4]" />
              </div>
              <div className="absolute bottom-6 right-6 flex flex-col items-end gap-2">
                <span
                  className="rounded-full bg-white px-4 py-2 text-[13px] whitespace-nowrap"
                  style={{ boxShadow: "0 6px 20px -4px rgba(0,0,0,0.16)" }}
                >
                  Where&rsquo;s my payout?
                </span>
                <Render hover={hovered === key} />
              </div>
            </div>
            <div className="border-t border-[#EFEFF2] px-5 py-4">
              <div className="text-[14px] font-semibold">{name}</div>
              <p className="mt-1 text-[12px] leading-relaxed text-[#71717A]">{note}</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
