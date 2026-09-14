"use client";

/* ─── Button launcher — composition variations ────────────────────────────
   The pieces are settled: a button, an opening line, three suggestions. What
   is not settled is how they sit together, and that is the thing that reads as
   unresolved in the current build — the greeting is a wide left-aligned bubble,
   the chips are narrow and right-aligned, the button is a third object again.
   Three widths, three alignments, nothing grouping them.

   Each variation below answers that differently. They are shown in a page
   corner rather than on a swatch, because the question is how much of the
   customer's page the cluster claims and how it sits over their content. */

import { useState } from "react";
import { ChevronRight } from "lucide-react";

const ACCENT = "#6D33AA";
const ACCENT_LITE = "#9D59E9";
const INK = "#16181D";

const GREETING = "Hi there 👋 welcome to Global Payments. Looking to learn more?";
const SUGGESTIONS = ["Where's my payout?", "How do disputes work?", "What are your fees?"];

const LIFT = "0 10px 26px -10px rgba(15,17,26,0.20), 0 2px 5px rgba(15,17,26,0.08)";
const LIFT_HI = "0 16px 34px -10px rgba(15,17,26,0.26), 0 3px 8px rgba(15,17,26,0.12)";

/* the four-pointed star the launcher already uses */
function Sparkle({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <svg
      viewBox="-1.8 -1.8 27.6 27.6"
      style={{ width: size, height: size, color }}
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 0.5 C12.35 8.6 15.4 11.65 23.5 12 C15.4 12.35 12.35 15.4 12 23.5 C11.65 15.4 8.6 12.35 0.5 12 C8.6 11.65 11.65 8.6 12 0.5 Z" />
    </svg>
  );
}

function LauncherButton({ size = 56, radius = 999 }: { size?: number; radius?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center transition-transform duration-300 hover:-translate-y-0.5"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: ACCENT,
        boxShadow: `0 10px 24px -8px ${ACCENT}47, 0 2px 5px rgba(15,17,26,0.12)`,
      }}
    >
      <Sparkle size={size * 0.42} />
    </span>
  );
}

/* ─── A. One card ────────────────────────────────────────────────────────
   Greeting and suggestions share a single surface, so the cluster is two
   objects — a card and a button — instead of five. The suggestions are rows
   inside it rather than free-floating pills, which is what lets them run to a
   common width and stop looking ragged. */
function OneCard() {
  return (
    <div className="flex flex-col items-end gap-3">
      <div
        className="w-[290px] overflow-hidden rounded-2xl bg-white"
        style={{ boxShadow: LIFT_HI }}
      >
        <p className="px-4 pb-3 pt-3.5 text-[14px] leading-snug" style={{ color: INK }}>
          {GREETING}
        </p>
        <div className="border-t border-[#F0F0F3]">
          {SUGGESTIONS.map((t) => (
            <button
              key={t}
              className="flex w-full items-center justify-between gap-2 border-b border-[#F0F0F3] px-4 py-2.5 text-left text-[13.5px] transition-colors last:border-b-0 hover:bg-[#FAFAFB]"
              style={{ color: ACCENT }}
            >
              {t}
              <ChevronRight className="size-3.5 shrink-0 opacity-50" strokeWidth={2} />
            </button>
          ))}
        </div>
      </div>
      <LauncherButton />
    </div>
  );
}

/* ─── B. Aligned stack ───────────────────────────────────────────────────
   The current idea, made deliberate: everything ranged right, every element
   to the same 260px measure, one gap value throughout. The greeting keeps a
   tail so it still reads as speech. Nothing new — it just stops the three
   widths from arguing. */
function AlignedStack() {
  return (
    <div className="flex w-[260px] flex-col items-end gap-2">
      <div
        className="w-full rounded-2xl rounded-br-md bg-white px-4 py-3 text-[14px] leading-snug"
        style={{ color: INK, boxShadow: LIFT }}
      >
        {GREETING}
      </div>
      {SUGGESTIONS.map((t) => (
        <button
          key={t}
          className="rounded-full bg-white px-4 py-2 text-[13.5px] transition-shadow"
          style={{ color: INK, boxShadow: `inset 0 0 0 1px ${ACCENT}40, ${LIFT}` }}
        >
          {t}
        </button>
      ))}
      <LauncherButton />
    </div>
  );
}

/* ─── C. Collapsed panel ─────────────────────────────────────────────────
   A miniature of the messenger it opens into: header, line, replies. The most
   informative and the most furniture — it answers "who is this" before the
   visitor has to ask, at the cost of claiming a real piece of the page. */
function CollapsedPanel() {
  return (
    <div className="flex flex-col items-end gap-3">
      <div
        className="w-[300px] overflow-hidden rounded-2xl bg-white"
        style={{ boxShadow: LIFT_HI }}
      >
        <div className="flex items-center gap-2.5 px-4 pb-2.5 pt-3.5">
          <span
            className="relative grid size-8 shrink-0 place-items-center rounded-full"
            style={{ background: ACCENT }}
          >
            <Sparkle size={15} />
            <span
              className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full"
              style={{ background: "#22C55E", boxShadow: "0 0 0 2px #FFFFFF" }}
            />
          </span>
          <span>
            <span className="block text-[13px] font-semibold" style={{ color: INK }}>
              Tars
            </span>
            <span className="block text-[11px] text-[#8A8A94]">Replies instantly</span>
          </span>
        </div>
        <p className="px-4 pb-3 text-[14px] leading-snug" style={{ color: INK }}>
          {GREETING}
        </p>
        <div className="flex flex-wrap gap-1.5 px-4 pb-4">
          {SUGGESTIONS.map((t) => (
            <button
              key={t}
              className="rounded-full px-3 py-1.5 text-[12.5px] transition-colors"
              style={{ color: ACCENT, boxShadow: `inset 0 0 0 1px ${ACCENT}33` }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <LauncherButton />
    </div>
  );
}

/* ─── D. Beside ──────────────────────────────────────────────────────────
   The greeting sits on the button's own line instead of above it, so the two
   read as one unit and the suggestions stack cleanly over both. Costs width
   rather than height — the trade worth making on a desktop page, and the wrong
   one on a phone. */
function Beside() {
  return (
    <div className="flex flex-col items-end gap-2.5">
      {SUGGESTIONS.map((t) => (
        <button
          key={t}
          className="rounded-full bg-white px-4 py-2 text-[13.5px]"
          style={{ color: INK, boxShadow: `inset 0 0 0 1px ${ACCENT}40, ${LIFT}` }}
        >
          {t}
        </button>
      ))}
      <div className="flex items-center gap-2.5">
        <span
          className="rounded-full rounded-br-md bg-white px-4 py-2.5 text-[13.5px] leading-snug"
          style={{ color: INK, boxShadow: LIFT, maxWidth: 230 }}
        >
          Looking to learn more? I can help.
        </span>
        <LauncherButton />
      </div>
    </div>
  );
}

/* ─── E. Quiet ───────────────────────────────────────────────────────────
   No greeting at all, no shadows on the chips, a hairline instead. What is
   left is the only thing a visitor actually acts on. The restrained option,
   and the one an enterprise review is least likely to argue with. */
function Quiet() {
  return (
    <div className="flex w-[240px] flex-col items-end gap-1.5">
      {SUGGESTIONS.map((t) => (
        <button
          key={t}
          className="rounded-lg bg-white/90 px-3.5 py-2 text-[13px] backdrop-blur-sm transition-colors hover:bg-white"
          style={{ color: INK, boxShadow: "inset 0 0 0 1px rgba(15,17,26,0.10)" }}
        >
          {t}
        </button>
      ))}
      <div className="mt-1">
        <LauncherButton size={52} radius={16} />
      </div>
    </div>
  );
}

/* ─── F. Accent card ─────────────────────────────────────────────────────
   The cluster as one branded object: the agent's voice on the accent, the
   things you can say knocked out in white. The most eye-catching and the
   loudest — it stops being a widget resting on the page and becomes part of
   the page's own design, for better or worse. */
function AccentCard() {
  return (
    <div className="flex flex-col items-end gap-3">
      <div
        className="w-[286px] overflow-hidden rounded-2xl"
        style={{
          background: `linear-gradient(155deg in oklab, ${ACCENT_LITE} 0%, ${ACCENT} 72%)`,
          boxShadow: `0 16px 34px -10px ${ACCENT}5E, 0 3px 8px rgba(15,17,26,0.14)`,
        }}
      >
        <p className="px-4 pb-3.5 pt-4 text-[14px] leading-snug text-white">{GREETING}</p>
        <div className="flex flex-col gap-1.5 px-3 pb-3">
          {SUGGESTIONS.map((t) => (
            <button
              key={t}
              className="rounded-lg bg-white/95 px-3.5 py-2 text-left text-[13.5px] transition-colors hover:bg-white"
              style={{ color: INK }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <LauncherButton />
    </div>
  );
}

/* ─── G. Ask field ───────────────────────────────────────────────────────
   A composer, shrunk. The strongest argument for it is that the two launcher
   types stop being two products: a customer switching from composer to button
   keeps the same offer, just smaller. It also asks for a question rather than
   offering a menu, which is the ChatGPT read Vinit wanted to be available. */
function AskField() {
  return (
    <div className="flex w-[290px] flex-col items-end gap-2">
      {SUGGESTIONS.map((t) => (
        <button
          key={t}
          className="rounded-full bg-white px-3.5 py-1.5 text-[13px]"
          style={{ color: INK, boxShadow: `inset 0 0 0 1px ${ACCENT}33, ${LIFT}` }}
        >
          {t}
        </button>
      ))}
      <div
        className="flex w-full items-center gap-2 rounded-full bg-white py-2 pl-4 pr-2"
        style={{ boxShadow: LIFT_HI }}
      >
        <span className="flex-1 text-[14px] text-[#9A9AA4]">Ask me anything…</span>
        <LauncherButton size={36} />
      </div>
    </div>
  );
}

/* ─── H. Notice ──────────────────────────────────────────────────────────
   Borrowed from the one pattern every visitor already knows how to dismiss: a
   system notification. Icon, name, message, actions. It reads as something
   that just arrived rather than something that has always been there, which is
   what makes it noticed — and what makes it wear out if it never changes. */
function Notice() {
  return (
    <div className="flex flex-col items-end gap-3">
      <div
        className="w-[300px] rounded-[18px] bg-white p-3.5"
        style={{ boxShadow: LIFT_HI }}
      >
        <div className="flex gap-2.5">
          <span
            className="grid size-8 shrink-0 place-items-center rounded-lg"
            style={{ background: ACCENT }}
          >
            <Sparkle size={15} />
          </span>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-[13px] font-semibold" style={{ color: INK }}>
                Tars
              </span>
              <span className="text-[11px] text-[#A1A1AA]">now</span>
            </div>
            <p className="mt-0.5 text-[13.5px] leading-snug" style={{ color: "#52525B" }}>
              {GREETING}
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5 pl-[42px]">
          {SUGGESTIONS.slice(0, 2).map((t) => (
            <button
              key={t}
              className="rounded-md px-2.5 py-1.5 text-[12.5px] font-medium"
              style={{ color: ACCENT, background: `${ACCENT}0F` }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <LauncherButton />
    </div>
  );
}

/* ─── I. Split card ──────────────────────────────────────────────────────
   The agent's identity on the accent, the conversation on white. One object,
   but the brand colour is confined to a strip instead of the whole surface —
   which is the compromise between the accent card and the plain one. */
function SplitCard() {
  return (
    <div className="flex flex-col items-end gap-3">
      <div
        className="w-[290px] overflow-hidden rounded-2xl bg-white"
        style={{ boxShadow: LIFT_HI }}
      >
        <div
          className="flex items-center gap-2.5 px-4 py-3"
          style={{ background: ACCENT }}
        >
          <Sparkle size={16} />
          <span className="text-[13px] font-semibold text-white">Tars</span>
          <span className="ml-auto flex items-center gap-1.5 text-[11px] text-white/75">
            <span className="size-1.5 rounded-full bg-[#4ADE80]" />
            Online
          </span>
        </div>
        <p className="px-4 pb-3 pt-3.5 text-[14px] leading-snug" style={{ color: INK }}>
          {GREETING}
        </p>
        <div className="flex flex-col gap-1.5 px-3 pb-3.5">
          {SUGGESTIONS.map((t) => (
            <button
              key={t}
              className="rounded-lg px-3.5 py-2 text-left text-[13.5px] transition-colors hover:bg-[#FAFAFB]"
              style={{ color: INK, boxShadow: "inset 0 0 0 1px rgba(15,17,26,0.09)" }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <LauncherButton />
    </div>
  );
}

/* ─── J. Rail ────────────────────────────────────────────────────────────
   Everything on one line along the bottom of the page. Claims almost no
   height, which is the whole point on a page whose content runs down — but it
   only works where there is width to spare, so it is a desktop answer with a
   mobile fallback rather than one design. */
function Rail() {
  return (
    <div
      className="flex items-center gap-2 rounded-full bg-white p-2 pl-4"
      style={{ boxShadow: LIFT_HI }}
    >
      <span className="whitespace-nowrap text-[13.5px]" style={{ color: INK }}>
        Looking to learn more?
      </span>
      <span className="mx-1 h-5 w-px bg-[#E8E8EC]" />
      {SUGGESTIONS.slice(0, 2).map((t) => (
        <button
          key={t}
          className="whitespace-nowrap rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors"
          style={{ color: ACCENT, background: `${ACCENT}0F` }}
        >
          {t}
        </button>
      ))}
      <LauncherButton size={40} />
    </div>
  );
}

/* ─── K. Bare ────────────────────────────────────────────────────────────
   No card, no bubble, no shadow — the greeting set directly on the page and
   the suggestions as links under it. The lightest possible footprint, and the
   only variation that inherits the site's own typography rather than importing
   a widget's. Depends entirely on the page behind it being calm. */
function Bare() {
  return (
    <div className="flex w-[250px] flex-col items-end gap-2 text-right">
      <p className="text-[14px] leading-snug" style={{ color: INK }}>
        Looking to learn more?
      </p>
      <div className="flex flex-col items-end gap-1.5">
        {SUGGESTIONS.map((t) => (
          <button
            key={t}
            className="text-[13.5px] underline decoration-1 underline-offset-4 transition-opacity hover:opacity-70"
            style={{ color: ACCENT }}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-2">
        <LauncherButton size={50} />
      </div>
    </div>
  );
}

/* ─── L. Deck ────────────────────────────────────────────────────────────
   The suggestions as a shallow stack, the top one fully out and the rest
   showing an edge. Says "there is more here" in the space of one chip, and
   costs the least height of anything with three options in it. The risk is
   that a stack invites a swipe that does not exist. */
function Deck() {
  return (
    <div className="flex flex-col items-end gap-3">
      <div
        className="w-[270px] rounded-2xl rounded-br-md bg-white px-4 py-3 text-[14px] leading-snug"
        style={{ color: INK, boxShadow: LIFT }}
      >
        {GREETING}
      </div>
      <div className="relative h-[46px] w-[250px]">
        {SUGGESTIONS.map((t, i) => (
          <button
            key={t}
            className="absolute right-0 truncate rounded-full bg-white px-4 py-2 text-[13.5px] transition-all"
            style={{
              bottom: i * 6,
              width: `${100 - i * 8}%`,
              zIndex: SUGGESTIONS.length - i,
              opacity: 1 - i * 0.18,
              color: INK,
              boxShadow: `inset 0 0 0 1px ${ACCENT}33, ${LIFT}`,
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <LauncherButton />
    </div>
  );
}

/* ─── M. Glass ───────────────────────────────────────────────────────────
   Frosted, so the page shows through the cluster instead of being covered by
   it. The one design here that gets less obtrusive the busier the page is,
   because it takes its colour from whatever it is over. Costs a backdrop
   filter, and it needs something behind it worth blurring — over flat white it
   is just a grey card. */
function GlassStack() {
  return (
    <div className="flex w-[276px] flex-col items-end gap-2">
      <div
        className="w-full rounded-2xl rounded-br-md px-4 py-3 text-[14px] leading-snug backdrop-blur-xl"
        style={{
          color: INK,
          background: "rgba(255,255,255,0.62)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.85), 0 12px 30px -10px rgba(15,17,26,0.22)",
        }}
      >
        {GREETING}
      </div>
      {SUGGESTIONS.map((t) => (
        <button
          key={t}
          className="rounded-full px-4 py-2 text-[13.5px] backdrop-blur-xl transition-colors"
          style={{
            color: INK,
            background: "rgba(255,255,255,0.62)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.85), 0 8px 22px -10px rgba(15,17,26,0.18)",
          }}
        >
          {t}
        </button>
      ))}
      <LauncherButton />
    </div>
  );
}

/* ─── N. Lit edge ────────────────────────────────────────────────────────
   A white card with a light travelling its border — the composer launcher's
   own signature, moved onto the button one. The argument is recognition: a
   customer who has seen one of the two launchers should recognise the other as
   the same product. It is also the only motion here that does not ask to be
   clicked. */
function LitEdge() {
  return (
    <div className="flex flex-col items-end gap-3">
      <div className="relative w-[288px] overflow-hidden rounded-2xl" style={{ boxShadow: LIFT_HI }}>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl motion-reduce:hidden"
          style={{
            padding: 1.5,
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            maskComposite: "exclude",
          }}
        >
          <span
            className="absolute left-1/2 top-1/2 aspect-square w-[180%] -translate-x-1/2 -translate-y-1/2 animate-spin"
            style={{
              background: `conic-gradient(${ACCENT_LITE} 0deg, transparent 70deg, transparent 290deg, ${ACCENT_LITE} 360deg)`,
              animationDuration: "5200ms",
              animationTimingFunction: "linear",
            }}
          />
        </span>
        <div className="relative rounded-2xl bg-white">
          <p className="px-4 pb-3 pt-3.5 text-[14px] leading-snug" style={{ color: INK }}>
            {GREETING}
          </p>
          <div className="flex flex-wrap gap-1.5 px-4 pb-4">
            {SUGGESTIONS.map((t) => (
              <button
                key={t}
                className="rounded-full px-3 py-1.5 text-[12.5px]"
                style={{ color: ACCENT, background: `${ACCENT}0F` }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
      <LauncherButton />
    </div>
  );
}

/* ─── O. In progress ─────────────────────────────────────────────────────
   Two turns of a conversation instead of an opening line — a question already
   asked and the beginning of an answer. It shows what the thing does rather
   than announcing that it exists, which is a stronger pitch. The catch is that
   it is fiction until the visitor has actually asked something, so it can only
   ever run before the first real turn. */
function InProgress() {
  return (
    <div className="flex w-[280px] flex-col items-end gap-2">
      <div
        className="max-w-[78%] rounded-2xl rounded-br-md px-3.5 py-2 text-[13px]"
        style={{ background: ACCENT, color: "#FFFFFF" }}
      >
        Where&rsquo;s my payout?
      </div>
      <div
        className="w-full rounded-2xl rounded-bl-md bg-white px-4 py-3 text-[13.5px] leading-snug"
        style={{ color: INK, boxShadow: LIFT }}
      >
        Most payouts land within 2 business days. I can check yours —
        <span style={{ color: ACCENT }}> what&rsquo;s the reference?</span>
      </div>
      <div className="flex flex-wrap justify-end gap-1.5">
        {SUGGESTIONS.slice(1).map((t) => (
          <button
            key={t}
            className="rounded-full bg-white px-3 py-1.5 text-[12.5px]"
            style={{ color: INK, boxShadow: `inset 0 0 0 1px ${ACCENT}33, ${LIFT}` }}
          >
            {t}
          </button>
        ))}
      </div>
      <LauncherButton />
    </div>
  );
}

/* ─── P. Marquee ─────────────────────────────────────────────────────────
   The suggestions on one line that scrolls, so the number of them stops
   deciding the height of the cluster. Six would cost nothing where a stack
   would cost 150px. The trade is that anything off-screen is a suggestion
   nobody reads, and a moving target is harder to press. */
function Marquee() {
  return (
    <div className="flex w-[300px] flex-col items-end gap-2.5">
      <div
        className="w-full rounded-2xl rounded-br-md bg-white px-4 py-3 text-[14px] leading-snug"
        style={{ color: INK, boxShadow: LIFT }}
      >
        {GREETING}
      </div>
      <div className="relative w-full overflow-hidden">
        <div className="flex gap-1.5 [animation:marquee_16s_linear_infinite] motion-reduce:[animation:none]">
          {[...SUGGESTIONS, ...SUGGESTIONS].map((t, i) => (
            <button
              key={i}
              className="shrink-0 whitespace-nowrap rounded-full bg-white px-3.5 py-1.5 text-[12.5px]"
              style={{ color: INK, boxShadow: `inset 0 0 0 1px ${ACCENT}33, ${LIFT}` }}
            >
              {t}
            </button>
          ))}
        </div>
        {/* the row has to fade at both ends or it looks cut off rather than
            continuing */}
        <span className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#FBFBFC] to-transparent" />
        <span className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#FBFBFC] to-transparent" />
      </div>
      <LauncherButton />
    </div>
  );
}

/* ─── Q. Edge tab ────────────────────────────────────────────────────────
   Flush to the side of the window rather than floating clear of it, the way a
   feedback tab is. It occupies the one strip of a page nothing else uses, and
   it never covers content — but it is also the least conventional thing here,
   and a corner nobody looks at is a corner nobody clicks. */
function EdgeTab() {
  return (
    <div className="flex items-end gap-2.5">
      <div className="flex flex-col items-end gap-1.5">
        {SUGGESTIONS.map((t) => (
          <button
            key={t}
            className="rounded-l-full bg-white py-2 pl-4 pr-3 text-[13px]"
            style={{ color: INK, boxShadow: `inset 0 0 0 1px ${ACCENT}2E, ${LIFT}` }}
          >
            {t}
          </button>
        ))}
      </div>
      <span
        className="flex h-[132px] items-center gap-2 rounded-l-2xl px-3 text-[13px] font-medium text-white"
        style={{ background: ACCENT, writingMode: "vertical-rl", boxShadow: LIFT_HI }}
      >
        <Sparkle size={16} />
        Ask Tars
      </span>
    </div>
  );
}

/* ─── R. The team ────────────────────────────────────────────────────────
   Faces before words. It is the only variation that makes a claim about who is
   behind the agent, and the reason to reach for it is that "a person will
   answer" outperforms almost any wording — provided it is true. Where it is
   not, this is the variation that will be resented. */
function Team() {
  const faces = ["#E9C46A", "#8ECAE6", "#F4A261"];
  return (
    <div className="flex flex-col items-end gap-3">
      <div className="w-[286px] rounded-2xl bg-white p-4" style={{ boxShadow: LIFT_HI }}>
        <div className="flex items-center gap-2.5">
          <span className="flex -space-x-2">
            {faces.map((c) => (
              <span
                key={c}
                className="size-7 rounded-full"
                style={{ background: c, boxShadow: "0 0 0 2px #FFFFFF" }}
              />
            ))}
          </span>
          <span className="text-[12.5px] text-[#71717A]">
            Usually replies in <span style={{ color: INK }}>under a minute</span>
          </span>
        </div>
        <p className="mt-3 text-[14px] leading-snug" style={{ color: INK }}>
          {GREETING}
        </p>
        <div className="mt-3 flex flex-col gap-1.5">
          {SUGGESTIONS.map((t) => (
            <button
              key={t}
              className="rounded-lg px-3.5 py-2 text-left text-[13.5px] transition-colors hover:bg-[#FAFAFB]"
              style={{ color: INK, boxShadow: "inset 0 0 0 1px rgba(15,17,26,0.09)" }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <LauncherButton />
    </div>
  );
}

/* ─── the marquee family ─────────────────────────────────────────────────
   P's idea was that the suggestions run along one line instead of stacking, so
   their number stops deciding how much page the cluster claims. These six take
   that further and each fix one of its problems: it moves while you are trying
   to press it, only two of three are ever on screen, and a loop with no end
   never stops asking for attention. */

/* A row that carries its own fades and stops under the pointer. Every variation
   below uses it, because a moving target you cannot catch is the one thing that
   would sink the whole family. */
function ScrollRow({
  items,
  seconds = 16,
  reverse = false,
  fadeFrom = "#FBFBFC",
}: {
  items: string[];
  seconds?: number;
  reverse?: boolean;
  fadeFrom?: string;
}) {
  return (
    <div className="group/row relative w-full overflow-hidden">
      <div
        className="flex w-max gap-1.5 group-hover/row:[animation-play-state:paused] motion-reduce:[animation:none]"
        style={{
          animation: `${reverse ? "marquee-rev" : "marquee"} ${seconds}s linear infinite`,
        }}
      >
        {[...items, ...items].map((t, i) => (
          <button
            key={i}
            className="shrink-0 whitespace-nowrap rounded-full bg-white px-3.5 py-1.5 text-[12.5px] transition-transform hover:-translate-y-0.5"
            style={{ color: INK, boxShadow: `inset 0 0 0 1px ${ACCENT}33, ${LIFT}` }}
          >
            {t}
          </button>
        ))}
      </div>
      <span
        className="pointer-events-none absolute inset-y-0 left-0 w-8"
        style={{ background: `linear-gradient(to right, ${fadeFrom}, transparent)` }}
      />
      <span
        className="pointer-events-none absolute inset-y-0 right-0 w-8"
        style={{ background: `linear-gradient(to left, ${fadeFrom}, transparent)` }}
      />
    </div>
  );
}

/* ─── S. Marquee, held ───────────────────────────────────────────────────
   P with the one fix it needed: the row stops the moment the pointer is over
   it. Everything else about it is unchanged — which is the point, because the
   motion was never the problem, the un-pressability was. */
function MarqueeHeld() {
  return (
    <div className="flex w-[300px] flex-col items-end gap-2.5">
      <div
        className="w-full rounded-2xl rounded-br-md bg-white px-4 py-3 text-[14px] leading-snug"
        style={{ color: INK, boxShadow: LIFT }}
      >
        {GREETING}
      </div>
      <ScrollRow items={SUGGESTIONS} />
      <LauncherButton />
    </div>
  );
}

/* ─── T. Two rows ────────────────────────────────────────────────────────
   Two lines travelling opposite ways. Twice the suggestions in barely more
   height, and the counter-motion reads as a surface with things on it rather
   than a single strip sliding past. Six options is also the point at which
   this stops being a menu and starts being scenery — worth watching for. */
function TwoRows() {
  const more = ["Update my details", "Talk to a human", "Where do I integrate?"];
  return (
    <div className="flex w-[300px] flex-col items-end gap-2">
      <div
        className="w-full rounded-2xl rounded-br-md bg-white px-4 py-3 text-[14px] leading-snug"
        style={{ color: INK, boxShadow: LIFT }}
      >
        {GREETING}
      </div>
      <ScrollRow items={SUGGESTIONS} seconds={18} />
      <ScrollRow items={more} seconds={22} reverse />
      <LauncherButton />
    </div>
  );
}

/* ─── U. Enclosed ────────────────────────────────────────────────────────
   The row inside the card rather than under it, so the cluster is one object
   and the motion is contained by something. A strip scrolling in open space
   reads as loose; the same strip inside a card reads as a component. */
function Enclosed() {
  return (
    <div className="flex flex-col items-end gap-3">
      <div
        className="w-[300px] overflow-hidden rounded-2xl bg-white pb-3"
        style={{ boxShadow: LIFT_HI }}
      >
        <p className="px-4 pb-3 pt-3.5 text-[14px] leading-snug" style={{ color: INK }}>
          {GREETING}
        </p>
        <div className="px-3">
          <ScrollRow items={SUGGESTIONS} fadeFrom="#FFFFFF" />
        </div>
      </div>
      <LauncherButton />
    </div>
  );
}

/* ─── V. One at a time ───────────────────────────────────────────────────
   The furthest the idea goes: not a row that scrolls but a single suggestion
   that changes. One line of text gets the whole width, so it can be a real
   question rather than three words — and there is nothing to chase, because
   nothing is moving. The cost is that two of the three are always unseen. */
function OneAtATime() {
  const long = [
    "Where's my payout?",
    "How do chargeback disputes work?",
    "What are your transaction fees?",
  ];
  return (
    <div className="flex w-[300px] flex-col items-end gap-2.5">
      <div
        className="w-full rounded-2xl rounded-br-md bg-white px-4 py-3 text-[14px] leading-snug"
        style={{ color: INK, boxShadow: LIFT }}
      >
        {GREETING}
      </div>
      <div className="relative h-[38px] w-full">
        {long.map((t, i) => (
          <button
            key={t}
            className="absolute inset-x-0 top-0 truncate rounded-full bg-white px-4 py-2 text-[13.5px] motion-reduce:[animation:none]"
            style={{
              color: INK,
              boxShadow: `inset 0 0 0 1px ${ACCENT}33, ${LIFT}`,
              animation: `cycle-3 9s ${i * 3}s ease-in-out infinite`,
              opacity: 0,
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <LauncherButton />
    </div>
  );
}

/* ─── W. Rail, scrolling ─────────────────────────────────────────────────
   The whole cluster on one line: a word from the agent, the suggestions
   running past, the button at the end. The least height anything here claims,
   and the version that would survive on a page whose content is what matters. */
function ScrollingRail() {
  return (
    <div
      className="flex w-[360px] items-center gap-2 rounded-full bg-white py-2 pl-4 pr-2"
      style={{ boxShadow: LIFT_HI }}
    >
      <span className="shrink-0 whitespace-nowrap text-[13.5px]" style={{ color: INK }}>
        Ask about
      </span>
      <ScrollRow items={SUGGESTIONS} seconds={14} fadeFrom="#FFFFFF" />
      <LauncherButton size={40} />
    </div>
  );
}

/* ─── X. Ticker ──────────────────────────────────────────────────────────
   The same loop turned on its side. Vertical costs width instead of height,
   which is the right way round in a corner — a column of chips is narrow, and
   the page it sits over is scrolling vertically anyway, so motion across the
   grain is easier to ignore than motion with it. */
function Ticker() {
  return (
    <div className="flex items-end gap-3">
      <div className="group/t relative h-[104px] w-[190px] overflow-hidden">
        <div
          className="flex flex-col gap-1.5 group-hover/t:[animation-play-state:paused] motion-reduce:[animation:none]"
          style={{ animation: "ticker 14s linear infinite" }}
        >
          {[...SUGGESTIONS, ...SUGGESTIONS].map((t, i) => (
            <button
              key={i}
              className="w-full shrink-0 truncate rounded-full bg-white px-3.5 py-1.5 text-right text-[12.5px]"
              style={{ color: INK, boxShadow: `inset 0 0 0 1px ${ACCENT}33, ${LIFT}` }}
            >
              {t}
            </button>
          ))}
        </div>
        <span className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-[#FBFBFC] to-transparent" />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#FBFBFC] to-transparent" />
      </div>
      <LauncherButton />
    </div>
  );
}

const VARIANTS = [
  { key: "one-card", name: "A · One card", note: "Greeting and suggestions share a surface — two objects instead of five.", Render: OneCard },
  { key: "aligned", name: "B · Aligned stack", note: "Today's idea made deliberate: one measure, one gap, everything ranged right.", Render: AlignedStack },
  { key: "panel", name: "C · Collapsed panel", note: "A miniature of the messenger. Most informative, most furniture.", Render: CollapsedPanel },
  { key: "beside", name: "D · Beside", note: "Greeting on the button's own line. Costs width instead of height.", Render: Beside },
  { key: "quiet", name: "E · Quiet", note: "Suggestions only, hairlines not shadows. The restrained one.", Render: Quiet },
  { key: "accent", name: "F · Accent card", note: "One branded object. The loudest, and the least like a widget.", Render: AccentCard },
  { key: "ask", name: "G · Ask field", note: "A composer, shrunk — so the two launcher types stop being two products.", Render: AskField },
  { key: "notice", name: "H · Notice", note: "The one pattern every visitor already knows: icon, name, message, actions.", Render: Notice },
  { key: "split", name: "I · Split card", note: "Identity on the accent, conversation on white. Brand colour confined to a strip.", Render: SplitCard },
  { key: "rail", name: "J · Rail", note: "One line along the bottom. Claims almost no height; needs width to spare.", Render: Rail },
  { key: "bare", name: "K · Bare", note: "No card, no shadow — inherits the site's typography instead of importing a widget's.", Render: Bare },
  { key: "deck", name: "L · Deck", note: "Three options in the height of one. Says there is more without showing it.", Render: Deck },
  { key: "glass", name: "M · Glass", note: "The page shows through it. Gets less obtrusive the busier the page is.", Render: GlassStack },
  { key: "lit", name: "N · Lit edge", note: "The composer launcher's travelling light, moved onto the button one.", Render: LitEdge },
  { key: "progress", name: "O · In progress", note: "Two turns instead of a greeting — shows what it does rather than that it exists.", Render: InProgress },
  { key: "marquee", name: "P · Marquee", note: "One scrolling line, so the number of suggestions stops setting the height.", Render: Marquee },
  { key: "tab", name: "Q · Edge tab", note: "Flush to the window edge. Never covers content; least conventional.", Render: EdgeTab },
  { key: "team", name: "R · The team", note: "Faces before words. The only one that claims a person is behind it.", Render: Team },
  { key: "held", name: "S · Marquee, held", note: "P with the fix it needed — the row stops under the pointer.", Render: MarqueeHeld },
  { key: "two-rows", name: "T · Two rows", note: "Opposite directions. Six suggestions in barely more height than three.", Render: TwoRows },
  { key: "enclosed", name: "U · Enclosed", note: "The row inside the card. Contained motion reads as a component, not a loose strip.", Render: Enclosed },
  { key: "one-at-a-time", name: "V · One at a time", note: "Not a row that scrolls — a single suggestion that changes. Nothing to chase.", Render: OneAtATime },
  { key: "scroll-rail", name: "W · Rail, scrolling", note: "The whole cluster on one line. The least height anything here claims.", Render: ScrollingRail },
  { key: "ticker", name: "X · Ticker", note: "The same loop on its side — costs width instead of height.", Render: Ticker },
] as const;

export default function LauncherLab() {
  const [dark, setDark] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F4F5] px-8 py-10 text-[#16181D]">
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marquee-rev {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        @keyframes ticker {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }
        /* on screen for a third of the cycle, with a beat either side to fade */
        @keyframes cycle-3 {
          0%, 4%    { opacity: 0; transform: translateY(4px); }
          8%, 30%   { opacity: 1; transform: translateY(0); }
          34%, 100% { opacity: 0; transform: translateY(-4px); }
        }
      `}</style>
      <header className="mx-auto mb-8 flex max-w-[1180px] items-start justify-between gap-6">
        <div>
          <h1 className="text-[20px] font-semibold">Button launcher — six compositions</h1>
          <p className="mt-1.5 max-w-[640px] text-[14px] leading-relaxed text-[#52525B]">
            Same three pieces every time — button, opening line, three suggestions. What
            changes is how they are grouped, and how much of the page the cluster claims.
          </p>
        </div>
        <button
          onClick={() => setDark(!dark)}
          className="shrink-0 rounded-lg border border-[#E4E4E7] bg-white px-3 py-2 text-[12px] font-medium text-[#52525B] transition-colors hover:bg-[#FAFAFB]"
        >
          {dark ? "On a light page" : "On a dark page"}
        </button>
      </header>

      <div className="mx-auto grid max-w-[1180px] gap-5 lg:grid-cols-2">
        {VARIANTS.map(({ key, name, note, Render }) => (
          <section
            key={key}
            className="overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white"
          >
            {/* a page corner, not a swatch — the cluster can only be judged
                against content it is sitting over */}
            <div
              className="relative h-[430px] p-6"
              style={{ background: dark ? "#16181D" : "#FBFBFC" }}
            >
              <div className="space-y-2.5">
                {[1 / 3, 3 / 4, 2 / 3].map((w, i) => (
                  <div
                    key={i}
                    className="h-3 rounded"
                    style={{
                      width: `${w * 100}%`,
                      background: dark ? "#26262E" : "#ECECEF",
                    }}
                  />
                ))}
              </div>
              <div className="absolute bottom-6 right-6">
                <Render />
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
