"use client";

/* ─── Disclaimer + branding — where they go ───────────────────────────────
   Two pieces of small print that both want the same strip, and a rule that
   nothing may sit below the composer. Sharing one row is what that rule leads
   to directly, and it is cramped: the disclaimer truncates mid-word to make
   room for a credit nobody reads.

   Each option below breaks the deadlock differently — by stacking, by moving
   one of them somewhere else entirely, by merging them into one line, or by
   reducing one to a mark. All are shown with both switched on, because that is
   the case that is actually hard; either alone has always been fine. */

import { useState } from "react";
import { MoreVertical, Plus, Mic, Zap, Info, X, ArrowUp } from "lucide-react";

const ACCENT = "#6D33AA";
const INK = "#16181D";
const MUTED = "#979797";
const LINE = "#ECECEF";

const DISCLAIMER = "AI can make mistakes. Check important info.";

function Field() {
  return (
    <div
      className="flex items-center gap-2 rounded-[14px] bg-white px-2 py-2"
      style={{ boxShadow: `inset 0 0 0 1px ${LINE}` }}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#F4F4F6]">
        <Plus className="size-4 text-[#6B7280]" strokeWidth={1.6} />
      </span>
      <span className="flex-1 text-[14px] text-[#A1A1AA]">Ask me anything…</span>
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#F4F4F6]">
        <Mic className="size-4 text-[#6B7280]" strokeWidth={1.6} />
      </span>
    </div>
  );
}

function Header({ credit = false }: { credit?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 border-b px-4 py-3" style={{ borderColor: LINE }}>
      <span className="grid size-8 shrink-0 place-items-center rounded-full" style={{ background: `${ACCENT}1A` }}>
        <Zap className="size-4" style={{ color: ACCENT }} strokeWidth={2} fill="currentColor" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-semibold" style={{ color: INK }}>Tars</span>
        <span className="block truncate text-[11px]" style={{ color: MUTED }}>
          {credit ? "Powered by Tars" : "Virtual Assistant"}
        </span>
      </span>
      <MoreVertical className="size-4 shrink-0" style={{ color: MUTED }} strokeWidth={2} />
    </div>
  );
}

const Credit = ({ className = "" }: { className?: string }) => (
  <span className={`flex shrink-0 items-center gap-1 text-[11px] ${className}`} style={{ color: MUTED }}>
    <Zap className="size-3" strokeWidth={2} fill="currentColor" />
    Powered by <span className="font-semibold">Tars</span>
  </span>
);

/* ─── A. Shared row — what is built today ────────────────────────────────
   Here for comparison, not as a candidate. The disclaimer gets whatever the
   credit leaves, which on a 380px panel is not enough for a sentence. */
function SharedRow() {
  return (
    <>
      <div className="flex items-center gap-2 px-4 pb-2">
        <span className="min-w-0 flex-1 truncate text-[12px]" style={{ color: "#6E6E6E" }}>
          {DISCLAIMER}
        </span>
        <Credit />
      </div>
      <Field />
    </>
  );
}

/* ─── B. Stacked ─────────────────────────────────────────────────────────
   The obvious answer: give each its own line. The disclaimer reads in full and
   nothing is cut. It costs a second line of chrome above the field — about
   18px — which is the whole objection, and worth measuring against how often
   both are actually on. */
function Stacked() {
  return (
    <>
      <p className="px-4 pb-1 text-center text-[12px] leading-snug" style={{ color: "#6E6E6E" }}>
        {DISCLAIMER}
      </p>
      <div className="flex justify-center pb-2">
        <Credit />
      </div>
      <Field />
    </>
  );
}

/* ─── C. Credit in the header ────────────────────────────────────────────
   The credit moves to the one place already reserved for identity, as the
   agent's subtitle. The bottom strip then belongs entirely to the disclaimer,
   which is the only one of the two with a legal reason to be near the input.

   The trade is the subtitle — a customer who wants "Virtual Assistant" there
   cannot also have this, so it is only free where that line is unused. */
function CreditInHeader() {
  return (
    <>
      <Header credit />
      <div className="flex-1" />
      <p className="px-4 pb-2 text-center text-[12px]" style={{ color: "#6E6E6E" }}>
        {DISCLAIMER}
      </p>
      <Field />
    </>
  );
}

/* ─── D. One sentence ────────────────────────────────────────────────────
   Not two notices sharing a line but one line carrying both, separated by a
   divider. It fits because the credit stops being a badge and becomes three
   more words — and it reads as one piece of small print, which is what a
   visitor takes it for anyway. */
function OneSentence() {
  return (
    <>
      <p className="flex items-center justify-center gap-1.5 px-4 pb-2 text-[11.5px]" style={{ color: MUTED }}>
        <span>AI can make mistakes.</span>
        <span className="opacity-40">·</span>
        <span>
          Powered by <span className="font-semibold">Tars</span>
        </span>
      </p>
      <Field />
    </>
  );
}

/* ─── E. Mark only ───────────────────────────────────────────────────────
   The credit reduced to its mark, tucked at the end of the row. The disclaimer
   gets the full width back and the attribution survives — which is what Vinit
   actually asked for: somewhere the branding cannot be silently removed, not
   necessarily somewhere it is spelled out. */
function MarkOnly() {
  return (
    <>
      <div className="flex items-center gap-2 px-4 pb-2">
        <span className="min-w-0 flex-1 text-[12px]" style={{ color: "#6E6E6E" }}>
          {DISCLAIMER}
        </span>
        <span
          title="Powered by Tars"
          className="grid size-4 shrink-0 place-items-center rounded"
          style={{ color: MUTED }}
        >
          <Zap className="size-3" strokeWidth={2} fill="currentColor" />
        </span>
      </div>
      <Field />
    </>
  );
}

/* ─── F. Inside the field ────────────────────────────────────────────────
   Both attached to the composer rather than floating above it: the disclaimer
   as a line inside the field's own container, the credit at its end. One
   object instead of a field with notices stacked over it — and the strip stops
   competing with the conversation, because it is visibly part of the input. */
function InsideField() {
  return (
    <div className="rounded-[16px] bg-[#F7F7F9] p-1.5" style={{ boxShadow: `inset 0 0 0 1px ${LINE}` }}>
      <div className="flex items-center gap-2 px-2.5 pb-1.5 pt-1">
        <span className="min-w-0 flex-1 truncate text-[11.5px]" style={{ color: MUTED }}>
          {DISCLAIMER}
        </span>
        <Credit />
      </div>
      <Field />
    </div>
  );
}

/* ─── G. Disclaimer as a mark ────────────────────────────────────────────
   The other way round: the credit keeps its words and the disclaimer becomes
   an ⓘ beside the field, with the sentence on hover. Legally the weaker of the
   two — a notice nobody can read without hovering is a notice that has not
   really been given — so this is here to be rejected knowingly. */
function DisclaimerAsMark() {
  return (
    <>
      <div className="flex items-center justify-center gap-1.5 px-4 pb-2">
        <Credit />
        <span title={DISCLAIMER} className="cursor-help" style={{ color: MUTED }}>
          <Info className="size-3.5" strokeWidth={2} />
        </span>
      </div>
      <Field />
    </>
  );
}

/* ─── H. Dismissible, then credit ────────────────────────────────────────
   The disclaimer takes the row on its own and can be dismissed; the credit is
   underneath it and is revealed once it goes. Only one is ever on screen, so
   neither is cramped — at the cost of the credit being invisible until someone
   dismisses something, which most visitors never will. */
function ThenCredit() {
  return (
    <>
      <div className="flex items-center gap-2 rounded-lg px-3 py-1.5" style={{ background: "#F4F4F6" }}>
        <span className="min-w-0 flex-1 text-[12px]" style={{ color: "#6E6E6E" }}>
          {DISCLAIMER}
        </span>
        <X className="size-3.5 shrink-0" style={{ color: MUTED }} strokeWidth={2} />
      </div>
      <div className="pb-2 pt-1.5 text-center opacity-40">
        <Credit className="justify-center" />
      </div>
      <Field />
    </>
  );
}

/* ─── I. Swap on typing ──────────────────────────────────────────────────
   The strip holds one thing at a time and chooses which by what the visitor is
   doing. Idle, it is the credit. The moment there is something in the field it
   becomes the disclaimer, and it goes back when the field empties.

   This dissolves the problem rather than dividing the space: neither notice is
   ever cramped, because they are never both there. And each lands when it is
   actually relevant — a credit is fine to read while idle, and a warning about
   AI output means most at the moment someone is about to send something to an
   AI. A disclaimer permanently on screen is one nobody reads; the same
   sentence arriving as you type is one that is genuinely given.

   Worth putting to whoever owns the wording before it ships: "always visible"
   and "visible whenever the visitor is composing" are not the same commitment,
   and only one of them is what was agreed. */
function SwapOnTyping() {
  const [value, setValue] = useState("");
  const typing = value.trim().length > 0;

  return (
    <>
      {/* one row, one height, whichever is in it — so the composer never moves
          as the two swap */}
      <div className="relative h-[18px] px-4 pb-1">
        <span
          className="absolute inset-x-4 top-0 flex items-center justify-center gap-1 text-[11px] transition-all duration-200"
          style={{
            color: MUTED,
            opacity: typing ? 0 : 1,
            transform: typing ? "translateY(-3px)" : "none",
          }}
        >
          <Zap className="size-3" strokeWidth={2} fill="currentColor" />
          Powered by <span className="font-semibold">Tars</span>
        </span>
        <span
          className="absolute inset-x-4 top-0 truncate text-center text-[11.5px] transition-all duration-200"
          style={{
            color: "#6E6E6E",
            opacity: typing ? 1 : 0,
            transform: typing ? "none" : "translateY(3px)",
          }}
        >
          {DISCLAIMER}
        </span>
      </div>
      <div
        className="flex items-center gap-2 rounded-[14px] bg-white px-2 py-2"
        style={{ boxShadow: `inset 0 0 0 1px ${LINE}` }}
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#F4F4F6]">
          <Plus className="size-4 text-[#6B7280]" strokeWidth={1.6} />
        </span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask me anything…"
          className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#A1A1AA]"
          style={{ color: INK }}
        />
        <span
          className="grid size-8 shrink-0 place-items-center rounded-full transition-colors"
          style={{
            background: typing ? ACCENT : "#F4F4F6",
            color: typing ? "#FFFFFF" : "#6B7280",
          }}
        >
          {typing ? (
            <ArrowUp className="size-4" strokeWidth={2} />
          ) : (
            <Mic className="size-4" strokeWidth={1.6} />
          )}
        </span>
      </div>
    </>
  );
}

const VARIANTS = [
  { key: "shared", name: "A · Shared row", note: "What is built today. The disclaimer gets whatever the credit leaves.", Render: SharedRow, tall: false },
  { key: "stacked", name: "B · Stacked", note: "A line each. Nothing is cut; costs about 18px of extra chrome.", Render: Stacked, tall: false },
  { key: "header", name: "C · Credit in the header", note: "The credit becomes the agent's subtitle; the bottom strip is the disclaimer's alone.", Render: CreditInHeader, tall: true },
  { key: "sentence", name: "D · One sentence", note: "One line carrying both. The credit stops being a badge and becomes three words.", Render: OneSentence, tall: false },
  { key: "mark", name: "E · Mark only", note: "The credit reduced to its bolt. Attribution survives; the sentence gets its width back.", Render: MarkOnly, tall: false },
  { key: "inside", name: "F · Inside the field", note: "Both attached to the composer, so the strip is part of the input rather than over it.", Render: InsideField, tall: false },
  { key: "info", name: "G · Disclaimer as a mark", note: "The reverse. Legally the weaker — here to be rejected knowingly.", Render: DisclaimerAsMark, tall: false },
  { key: "then", name: "H · Dismissible, then credit", note: "One at a time: the credit appears once the disclaimer is dismissed.", Render: ThenCredit, tall: false },
  { key: "swap", name: "I · Swap on typing — try it", note: "Credit while idle, disclaimer the moment there is something in the field. Type into this one.", Render: SwapOnTyping, tall: false },
] as const;

export default function FooterLab() {
  return (
    <div className="min-h-screen bg-[#F4F4F5] px-8 py-10 text-[#16181D]">
      <header className="mx-auto mb-8 max-w-[1180px]">
        <h1 className="text-[20px] font-semibold">Disclaimer + branding — eight placements</h1>
        <p className="mt-1.5 max-w-[660px] text-[14px] leading-relaxed text-[#52525B]">
          Nothing may sit below the composer, and both of these want the strip above it. Every
          option is shown with both switched on, which is the only case that is actually hard.
        </p>
      </header>

      <div className="mx-auto grid max-w-[1180px] gap-5 lg:grid-cols-2">
        {VARIANTS.map(({ key, name, note, Render, tall }) => (
          <section key={key} className="overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white">
            <div className="flex justify-center bg-[#FBFBFC] p-6">
              {/* the bottom of a docked panel at its real width — the strip can
                  only be judged at the width it actually has */}
              <div
                className="flex w-[380px] flex-col overflow-hidden rounded-[20px] bg-white pb-4"
                style={{ boxShadow: "0 10px 30px -12px rgba(15,17,26,0.22)", minHeight: tall ? 210 : 150 }}
              >
                {!tall && (
                  <div className="flex flex-1 flex-col justify-end gap-2 px-4 pb-3 pt-4">
                    <span className="h-2.5 w-2/3 rounded bg-[#F1F1F4]" />
                    <span className="h-2.5 w-1/2 rounded bg-[#F1F1F4]" />
                  </div>
                )}
                <div className={tall ? "flex flex-1 flex-col px-0" : "px-4"}>
                  <div className={tall ? "flex flex-1 flex-col" : ""}>
                    <div className={tall ? "px-4" : ""}>
                      <Render />
                    </div>
                  </div>
                </div>
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
