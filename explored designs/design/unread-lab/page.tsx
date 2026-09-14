"use client";

/* ─── Unread — indicator variations ───────────────────────────────────────
   The problem, from the 11 Sep review: nobody sees it. "Would this pop to my
   eyes? No" — a small badge in the tenant's own accent, on a page built out of
   that accent, is by construction the colour the visitor has already learned
   to ignore.

   The first answer was to make it bigger and paint it red, and that was
   rejected for good reasons: 18px of alarm red on someone's marketing site is
   the widget shouting, and red is the one colour a brand did not choose. So
   the question is put differently here — what else can carry "there is
   something waiting for you" without size and without a foreign colour?

   Eight answers, each running live. Every one of them stays inside the
   tenant's palette; what varies is whether the signal is carried by mass,
   by motion, by position, or by the launcher itself changing state. The
   accent switcher at the top is the whole test: a variation that only works
   in purple has not solved the thing that was wrong. */

import { useState } from "react";

const TENANTS = [
  { name: "Tars", accent: "#6D33AA", lite: "#9D59E9" },
  { name: "Global Payments", accent: "#120BF4", lite: "#5B56F7" },
  { name: "Brightline", accent: "#FFA300", lite: "#F6AE5B" },
  { name: "Vodafone", accent: "#E60000", lite: "#FF5B5B" },
];

const INK = "#16181D";
const INK_MUTE = "#6B7280";
const DISC = "rgba(15,17,26,0.055)";
const PILL_SHADOW =
  "inset 0 0 0 1px rgba(15,17,26,0.06), 0 1px 2px rgba(15,17,26,0.10), 0 6px 16px rgba(15,17,26,0.12), 0 16px 40px rgba(15,17,26,0.18)";

/* The mark the badge sits on, copied at the size the launcher draws it. */
function ChatMark({ color = INK_MUTE }: { color?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      aria-hidden
    >
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22Z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12H8.009M11.991 12H12M15.991 12H16"
      />
    </svg>
  );
}

type Variant = {
  id: string;
  name: string;
  note: string;
  /* What the variation changes: the line, the disc, the whole pill, or the
     badge alone. Written out so the trade-off is legible at a glance rather
     than only in the running thing. */
  costs: string;
};

const VARIANTS: Variant[] = [
  {
    id: "fillping",
    name: "Filled disc, count inside, nudge",
    note: "The disc takes the accent, the mark goes white, the count sits on the mark — and the whole disc tips twice, like a handset buzzing.",
    costs:
      "Mass, the number and a buzz that ends. Loudest of the set, and still at rest between cycles.",
  },
  {
    id: "ping",
    name: "Ping",
    note: "The dot it already had, with one ring leaving it every few seconds.",
    costs: "Motion carries it, so the mark stays 6px and stays in the accent.",
  },
  {
    id: "fill",
    name: "Filled disc",
    note: "The 44px disc takes the accent and the mark goes white.",
    costs: "Mass instead of a badge. Costs the disc's neutrality when open.",
  },
  {
    id: "nudge",
    name: "Nudge",
    note: "The mark tips twice, like a handset buzzing, then holds still.",
    costs: "Announces on arrival and stops. Nothing moving at rest.",
  },
  {
    id: "count",
    name: "Count in the line",
    note: "The number joins the sentence instead of riding the mark.",
    costs: "Legible at any accent — it is type, not a coloured shape.",
  },
  {
    id: "sweep",
    name: "Edge sweep",
    note: "A highlight travels the pill's hairline while something waits.",
    costs: "The launcher signals, not a badge on it. Competes with the ring at rest.",
  },
  {
    id: "rise",
    name: "Message rise",
    note: "The waiting line slides up into the field every few seconds.",
    costs: "Says what is waiting, not just that something is.",
  },
  {
    id: "corner",
    name: "Corner fold",
    note: "A wedge of accent on the pill's own corner, pulsing once a cycle.",
    costs: "Part of the object rather than stuck to it. Subtle on a busy page.",
  },
];

function Pill({
  variant,
  accent,
  lite,
  playing,
}: {
  variant: string;
  accent: string;
  lite: string;
  playing: boolean;
}) {
  const anim = (name: string, spec: string) =>
    playing ? { animation: `${name} ${spec}` } : undefined;

  const filled = variant === "fill" || variant === "fillping";
  const line =
    variant === "rise" ? "Sofia: I've checked your plan —" : "Ask me anything…";

  return (
    <div
      className="relative flex items-center overflow-hidden bg-white"
      style={{
        width: 340,
        height: 64,
        borderRadius: 32,
        padding: 8,
        boxShadow: PILL_SHADOW,
      }}
    >
      {/* Edge sweep — a conic highlight masked to the 2px border, the same
          trick the resting launcher uses for its idle ring, run brighter and
          only while something is waiting. */}
      {variant === "sweep" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
          style={{
            borderRadius: "inherit",
            padding: 2,
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            maskComposite: "exclude",
          }}
        >
          <span
            className="absolute top-1/2 left-1/2 aspect-square w-[150%] -translate-x-1/2 -translate-y-1/2"
            style={{
              background: `conic-gradient(${accent} 0deg, color-mix(in srgb, ${accent} 45%, transparent) 40deg, transparent 110deg, transparent 250deg, color-mix(in srgb, ${lite} 45%, transparent) 320deg, ${accent} 360deg)`,
              ...anim("spin", "2600ms linear infinite"),
            }}
          />
        </span>
      )}

      {/* Corner fold — the accent as part of the pill's own silhouette. */}
      {variant === "corner" && (
        <span
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 z-10"
          style={{
            width: 46,
            height: 46,
            background: `linear-gradient(225deg, ${accent} 0%, ${accent} 46%, transparent 46%)`,
            ...anim("fold-pulse", "3200ms ease-in-out infinite"),
          }}
        />
      )}

      <span className="relative min-w-0 flex-1 overflow-hidden px-3">
        {variant === "count" && (
          <span
            className="mr-2 inline-grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 align-[-3px] text-[11px] font-semibold text-white"
            style={{ background: accent }}
          >
            2
          </span>
        )}
        <span
          className="text-[14px] font-light tracking-[0.01em]"
          style={{
            color: variant === "rise" ? INK : INK_MUTE,
            display: "inline-block",
            ...anim("line-rise", "4200ms cubic-bezier(0.16,1,0.3,1) infinite"),
          }}
        >
          {variant === "count" ? "new messages" : line}
        </span>
      </span>

      <span
        className="relative grid shrink-0 place-items-center rounded-full"
        style={{
          width: 44,
          height: 44,
          background: filled ? accent : DISC,
          /* The buzz, on the plain mark and on the filled disc alike. It
             fires for under a second in every cycle and is still the rest of
             the time — which is the argument for it over a pulse: the launcher
             announces, then stops, rather than keeping something moving in the
             corner of the page for as long as the visitor is on it. */
          ...(variant === "nudge" || variant === "fillping"
            ? anim("mark-nudge", "2400ms ease-in-out -1488ms infinite")
            : null),
        }}
      >
        {/* The mark in its own box, so anything hung on it is offset from the
            mark's 24px corner rather than from the disc's 44px bounding box.
            /design is built this way, and a badge anchored to the other box
            swings through a different arc under the nudge — which is what made
            the same animation read as two. */}
        <span className="relative inline-flex">
          <ChatMark color={filled ? "#FFFFFF" : INK_MUTE} />

        {/* Ping — the ring leaves the dot rather than the dot growing, so the
            thing being noticed is still a 6px mark in the tenant's colour. */}
        {variant === "ping" && (
          <span className="absolute -top-1 -right-1 grid place-items-center">
            <span
              aria-hidden
              className="absolute size-[7px] rounded-full"
              style={{
                background: accent,
                ...anim("ping-out", "2400ms cubic-bezier(0,0,0.2,1) infinite"),
              }}
            />
            <span
              className="relative size-[7px] rounded-full"
              style={{ background: accent, boxShadow: "0 0 0 2px #FFFFFF" }}
            />
          </span>
        )}

        {/* The pulse came off and a nudge went on in its place: a ring that
            breathes forever is something the visitor learns to look away from,
            where a buzz is over in a second and leaves the launcher still.

            The count sits in white on the accent, which is the same pairing
            the filled disc already uses for the mark — so the badge reads as
            part of the control rather than as a sticker on it, and the number
            is legible at every tenant colour without a red anywhere. */}
        {variant === "fillping" && (
          <>
            {/* On the mark, not on the disc's corner.

               The mark is 24px centred in a 44px disc, so its own top-right
               corner sits inside the disc's — which is where the badge
               goes: over the bubble, the way a notification count has always
               sat on the icon it belongs to. Hung off the disc instead it read
               as a badge on the launcher, and the launcher is not the thing
               with two messages in it. */}
            <span
              className="absolute -top-0.5 -right-0.5 grid h-[12px] min-w-[12px] place-items-center rounded-full px-[3px] text-[8.5px] font-semibold"
              style={{
                background: "#FFFFFF",
                color: accent,
                boxShadow: `0 0 0 1.5px ${accent}`,
                ...anim("badge-swell", "2400ms ease-in-out -1488ms infinite"),
              }}
            >
              2
            </span>
          </>
        )}
        </span>

        {variant === "nudge" && (
          <span
            className="absolute -top-1 -right-1 size-[7px] rounded-full"
            style={{ background: accent, boxShadow: "0 0 0 2px #FFFFFF" }}
          />
        )}
      </span>
    </div>
  );
}

export default function UnreadLab() {
  const [tenant, setTenant] = useState(0);
  const [playing, setPlaying] = useState(true);
  const t = TENANTS[tenant];

  return (
    <div className="min-h-screen bg-[#F4F4F6] px-8 py-10 text-[#27272A]">
      <style>{`
        @keyframes ping-out {
          0%   { transform: scale(1);   opacity: 0.55; }
          70%  { transform: scale(3.4); opacity: 0; }
          100% { transform: scale(3.4); opacity: 0; }
        }
        @keyframes mark-nudge {
          0%, 62%, 100% { transform: rotate(0deg) scale(1); }
          66% { transform: rotate(-6deg) scale(1.04); }
          71% { transform: rotate(16deg) scale(1.06); }
          76% { transform: rotate(-14deg) scale(1.05); }
          81% { transform: rotate(11deg) scale(1.04); }
          86% { transform: rotate(-8deg) scale(1.02); }
          91% { transform: rotate(5deg) scale(1.01); }
          95% { transform: rotate(-2deg) scale(1); }
        }
        @keyframes badge-swell {
          0%, 62%, 100% { transform: scale(1); }
          67%, 88% { transform: scale(1.333); }
          95% { transform: scale(1); }
        }
        @keyframes line-rise {
          0%, 64%  { transform: translateY(0); opacity: 1; }
          72%      { transform: translateY(-120%); opacity: 0; }
          73%      { transform: translateY(120%); opacity: 0; }
          82%, 100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes fold-pulse {
          0%, 100% { opacity: 0.42; }
          50%      { opacity: 1; }
        }
        @keyframes spin { to { transform: translate(-50%, -50%) rotate(360deg); } }
      `}</style>

      <header className="mx-auto mb-8 flex max-w-[1180px] flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-semibold text-[#18181B]">
            Unread — indicator variations
          </h1>
          <p className="mt-1 max-w-[620px] text-[13px] leading-relaxed text-[#6B7280]">
            Eight ways to say “something is waiting” without a bigger badge and
            without red. Switch the tenant: anything that only reads in purple
            has not fixed what was wrong.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-white p-1 shadow-[0_1px_2px_rgba(15,17,26,0.10)]">
            {TENANTS.map((x, i) => (
              <button
                key={x.name}
                onClick={() => setTenant(i)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors ${
                  i === tenant ? "text-[#18181B]" : "text-[#71717A] hover:text-[#27272A]"
                }`}
                style={i === tenant ? { background: "#F2F2F4" } : undefined}
              >
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: x.accent }}
                  aria-hidden
                />
                {x.name}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPlaying(!playing)}
            className="rounded-lg bg-white px-3 py-[7px] text-[12px] font-medium text-[#27272A] shadow-[0_1px_2px_rgba(15,17,26,0.10)]"
          >
            {playing ? "Pause" : "Play"}
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {VARIANTS.map((v) => (
          <section
            key={v.id}
            className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(15,17,26,0.06)]"
          >
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="text-[14px] font-semibold text-[#18181B]">{v.name}</h2>
              <span className="text-[11px] text-[#A1A1AA]">{v.id}</span>
            </div>

            {/* On the page's own grey rather than on white, because that is
                where the launcher actually sits — a badge judged on a white
                card is judged against the one background it will never have. */}
            <div className="grid place-items-center rounded-xl bg-[#EDEDF0] py-6">
              <Pill variant={v.id} accent={t.accent} lite={t.lite} playing={playing} />
            </div>

            <p className="mt-4 text-[12.5px] leading-relaxed text-[#3F3F46]">{v.note}</p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-[#A1A1AA]">{v.costs}</p>
          </section>
        ))}
      </div>

      <p className="mx-auto mt-8 max-w-[1180px] text-[12px] text-[#A1A1AA]">
        All eight keep the tenant’s accent and the 7px mark. None of them is the
        18px red badge.
      </p>
    </div>
  );
}
