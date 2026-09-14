"use client";

import {
  ArrowUp,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronLeft,
  BookOpen,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Globe,
  ArrowLeftToLine,
  ArrowRightToLine,
  MessageCircle,
  MoreHorizontal,
  MoreVertical,
  Mic,
  Pencil,
  Plus,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ThinkingOrb } from "thinking-orbs";

/* Composer-based launcher — a floating composer chip rather than a bubble.

   The invitation is the input itself: instead of an orb that has to be opened
   before you learn what it does, the thing you'd type into is already on
   screen, and a rotating placeholder shows the kind of question it takes.

   Real glass, not a grey pill: the fill is mostly transparent and the blur is
   paired with saturate(), which is what separates glassmorphism from a flat
   scrim — the colour behind it bleeds through and intensifies rather than
   washing out. The bright top border and inset highlight give it an edge to
   catch light, so it reads as a pane above the page instead of a hole in it. */

/* Kept short on purpose. These type into the resting chip, which is the
   narrowest the composer ever gets — see WIDTH_SHUT for how little field
   that leaves. A longer question types past the edge and clips mid-word. */
const QUESTIONS = [
  "How do AI Agents work?",
  "Can one agent do it all?",
  "What can I automate?",
  "Show me a demo",
  "How fast can we go live?",
];

/* Typing cadence. The hold is derived from the question rather than fixed, so a
   long one isn't yanked away at the same moment a short one is — roughly the
   time it takes to read what was typed. Erasing runs at half the typing speed
   because nobody reads a line backwards; the interesting part is the arrival. */
const TYPE_MS = 45;
const ERASE_MS = 22;
const HOLD_PER_WORD_MS = 280;
const HOLD_BASE_MS = 600;
const holdFor = (s: string) => HOLD_BASE_MS + s.trim().split(/\s+/).length * HOLD_PER_WORD_MS;

type Phase = "typing" | "holding" | "erasing";

/* Openers offered once the chip expands. Kept to three: the row has to fit the
   expanded width on one line, and a starter list long enough to scan is a menu,
   not a nudge. */
export const STARTERS = [
  "How do AI agents work?",
  "Schedule a demo",
  "Can one agent do it all?",
];

/* The transcript.

   Canned, because this is a launcher demo — the point is the shape of the
   exchange, not an answer. Keyed by the starter that produced it so a chip
   gets a reply that actually addresses it; anything typed by hand falls
   through to the catch-all. */
export const REPLIES: Record<string, string> = {
  /* Deliberately the long one. The other two are short because they're
     transactional, but this is the answer that has to prove the panel can
     hold a real reply — it's what shows the line height, the word-by-word
     reveal running at length, and whether the 530px pane still reads well
     once it's most of the way full. */
  "What can Tars do?":
    "**Tars (AI Agent & Chatbot Platform)** If you mean the software platform Hellotars.com:\n\n- Conversational AI & Lead Gen: Automatically handles customer support queries, qualifies sales leads, and books appointments across web and mobile platforms.\n\n- Multichannel Messaging: Deploys AI agents on WhatsApp, web widgets, and direct landing pages.\n\n- Knowledge Base RAG (Retrieval-Augmented Generation): Ingests documentation (PDFs, sites, Notion, etc.) to give contextual answers with source attribution.\n\n- Live Chat Handover: Seamlessly transfers complex chats from AI to human support agents.",
  /* Reached from the follow-up under the answer above, so this is the one
     that shows what a second turn looks like once the panel is already most
     of the way full — three bullets, each with a figure in it, which is
     roughly the densest thing an answer here has to hold. */
  "What does it cost?":
    "Tars offers three main pricing tiers:\n\n- Freemium ($0/month): Includes 50 conversations per month, basic LLM models, up to 5 Knowledge Bases, and community support.\n\n- Premium ($499/month or $4,999/year): Designed for mid-sized businesses. Includes 500 to 10,000 conversations per month, advanced LLM models, up to 20 Knowledge Bases, live chat support, and ISO/SOC 2 compliance. Annual billing saves 17% (equivalent to $416.58/month).\n\n- Enterprise (Custom pricing): Tailored for large organizations requiring custom conversation volume, unlimited Knowledge Bases, dedicated account management, custom integrations, white-glove onboarding, and HIPAA/SOC 2/ISO compliance.",
  "Schedule a demo":
    "Happy to set that up. What day works for you, and roughly how many people will be joining?",
  "Check Tars pricing":
    "Pricing scales with resolved conversations rather than seats. Tell me your rough monthly volume and I'll give you a real number.",
};
/* What to say next, offered under each reply.

   Keyed by the question that produced the answer, the same key REPLIES uses,
   so a reply and its follow-ups are written together and can't drift apart.

   Three at most, and phrased as things you'd say rather than topics you'd
   browse — "What does it cost?" is a message, "Pricing" is a menu item, and
   a menu under every answer turns a conversation into a phone tree. */
export const FOLLOW_UPS: Record<string, string[]> = {
  /* Short enough that all three sit on one line at 640px. The row wraps if
     they don't, which turns a single staggered movement into two — the
     entrance reads as one offer only while it stays on one line. */
  "What can Tars do?": [
    "Learn our help centre?",
    "When it can't answer?",
    "What does it cost?",
  ],
  /* The one place the row is likely to wrap to two lines — "Tell me more
     about Tars" is longer than anything in the other sets. Worth it: after
     three tiers of pricing the next move is either to talk to someone or to
     back out to what the product is, and both of those need saying in full.
     The stagger divides its window by the count, so a wrapped row still lands
     its last pill at the same moment a single-line one would. */
  "What does it cost?": [
    "Schedule a demo",
    "Talk to a human",
    "Tell me more about Tars",
  ],
  "Schedule a demo": ["Thursday works", "Who should join?", "Send me some times"],
  "Check Tars pricing": [
    "Roughly 2,000 a month",
    "What counts as resolved?",
    "Talk to sales",
  ],
};
/* Deliberately two, not three. The catch-all reply doesn't know what was
   asked, so anything more specific than these would be a guess dressed up as
   a suggestion. */
export const FOLLOW_UP_FALLBACK = ["Tell me more", "Talk to a human"];

export const REPLY_FALLBACK =
  "Good question — let me look into that. In the meantime, is there anything else you'd like to cover?";

/* Everything a tenant says through the composer, in one bag.

   The component was written against TARS's own fixtures; a client demo needs
   the same shapes filled with the client's words. One object rather than a
   prop per fixture, because the fixtures reference each other — a reply keyed
   by a starter that isn't in `starters` is unreachable — and a single value
   keeps a pack internally consistent or visibly broken, never half-swapped.

   `greeting` is the one behavioural entry: when present, the agent speaks
   first — seeded as the opening message the first time the thread opens, and
   an empty submit opens the thread on it instead of being a no-op. That's the
   gambit handshake from the platform (workflows begin with the agent's node),
   and it's opt-in because this file's own demo argued the opposite for a
   cold launcher; both are right for their tenant. */
export type ComposerForm = {
  fields: {
    key: string;
    label: string;
    type?: string;
    half?: boolean;
    /* A choice field: renders as a select instead of a text input. */
    options?: string[];
  }[];
  submitLabel?: string;
  reply: string;
  /* Node buttons on the acknowledgement itself — the closing chooser. */
  replyButtons?: string[];
  /* The workflow's next node after the acknowledgement — another agent
     message, optionally a chooser. */
  followOn?: { text: string; buttons?: string[] };
};

/* A disclosure list a reply ships with — the node UI equivalent of a form,
   for an answer whose honest shape is four answers.

   The alternative is one long reply, and for something like "how does
   insurance work here" that runs to a screen of text where a visitor only
   ever wanted one of its paragraphs. Sections let the turn say the whole
   thing while asking the reader for one line of attention at a time. First
   item opens by default, so the component is never four closed doors. */
export type ComposerAccordion = {
  /* A heading over the group. Optional — a single set of sections under a
     reply that already introduced them doesn't need naming twice. */
  title?: string;
  items: { label: string; body: string }[];
};

export type ComposerContent = {
  /* Who is speaking: the transcript prefix ("Tars: …") and the panel title. */
  agentName: string;
  headerTitle: string;
  /* The second line under the title — Design's own `subtitle` field
     (defaults to "Virtual Assistant" there). Optional so a content pack
     that hasn't set one keeps the single-line header rather than an empty
     gap under it. */
  subtitle?: string;
  /* The caveat under the field. Optional — falls back to the TARS default
     ("AI can make mistakes...") — so a tenant only sets this when the
     generic line is wrong for what they're answering, the way Brightline's
     medical-advice disclaimer needs to be. */
  disclaimer?: string;
  ariaPrompt: string;
  questions: string[];
  /* Launcher chips. Empty means derived: the greeting's node buttons are
     previewed on the launcher, so the chips and the opening message can't
     drift apart. Fill this only to override the preview for one channel. */
  starters: string[];
  replies: Record<string, string>;
  followUps: Record<string, string[]>;
  /* Node buttons carried by a scripted reply, keyed like `replies`. A reply
     with buttons is the workflow moving to another chooser node — the same
     shape the greeting uses, one hop deeper. */
  replyButtons?: Record<string, string[]>;
  /* An input node: a reply that ships a form. `reply` is what the agent says
     once it's submitted — {firstName} etc. interpolate the submitted values. */
  replyForms?: Record<string, ComposerForm>;
  /* Disclosure sections a reply ships with, keyed like `replyForms`. */
  replyAccordions?: Record<string, ComposerAccordion>;
  followUpFallback: string[];
  replyFallback: string;
  reasoningTrace: string[];
  /* The live narration while thinking — worked through in order, where
     `reasoningTrace` is the kept summary shown above the finished reply. */
  reasoningSteps: string[];
  sources: { name: string; description: string; url: string }[];
  conversations: { group: string; items: Conversation[] }[];
  greeting?: {
    text: string;
    /* An illustration above the first line. A tenant with a mark of its own
       for this moment gets to lead with it; without one the greeting is
       just the sentence. */
    image?: string;
    prompts?: string[];
    buttons?: string[];
    /* A second opening turn, landing as its own message rather than as more
       paragraphs in the first. Two turns because they are doing two jobs —
       the first says hello, the second says what this is and what to do
       next — and a greeting that says both in one block is a wall of text
       where a hello should be. Its prompts/buttons are the ones that end up
       pinned at the foot, since it is the turn that asks something. */
    then?: { text: string; prompts?: string[]; buttons?: string[] };
  };
  /* The node-button label that ends the conversation instead of sending —
     it opens the close confirmation, then the rating, then the closed card. */
  endChatLabel?: string;
  /* One line of the agent's voice shown above the launcher's chips in the
     focused state — the teaser. Launcher-only; the thread greeting stays
     whatever `greeting.text` says. */
  teaser?: string;
  /* The header's identity mark. Omit for the TARS file; a path for a tenant
     with an asset; empty string for none, which falls back to a monogram on
     the brand tile. */
  logomark?: string;
  monogram?: string;
};

/* How long the agent takes to answer, read off the question rather than
   fixed: a one-word message coming back after the same pause as a long one
   is the tell that nothing is actually being considered. This is thinking
   time only — the reply then reveals word by word, which covers the typing.

   Held inside 4–5s by the clamp. The derivation still does the work within
   that band, so a longer question waits longer, but neither end can run away
   from it. The clamp is what makes the band a guarantee rather than a hope —
   a long typed message would otherwise scale straight past it, and a
   one-word one would land under.

   Long enough that the state is now the main thing on screen for a couple of
   shimmer passes rather than a beat between messages. That's fine while the
   orb and the sweep are what's being shown off; it is worth remembering it's
   a demo pace, not a plausible one, if this ever fronts a real model. */
const THINK_BASE_MS = 3400;
const THINK_PER_WORD_MS = 300;
const THINK_MIN_MS = 4000;
const THINK_MAX_MS = 5000;
export const thinkFor = (s: string) =>
  Math.min(
    THINK_MAX_MS,
    Math.max(
      THINK_MIN_MS,
      THINK_BASE_MS + s.trim().split(/\s+/).length * THINK_PER_WORD_MS,
    ),
  );

/* What the agent narrates while it works, and what it keeps afterwards.

   Scripted, like the replies — the point is the shape of the disclosure, not
   real telemetry. A real one would push these as they happen; the list is the
   same either way, which is why the message carries it rather than the
   thinking state owning it.

   Ordered as the work actually happens: understand, look, read, act, write.
   Out of order it reads as a loading spinner with captions. */
/* The merged surface's orb, defined once.

   Thinking, and then the reasoning chip above the finished reply, are the
   same mark at the same size — but they were two separate blocks of JSX that
   only happened to agree, and "happens to agree" is how one of them ends up a
   size or a filter behind the other after an edit. One component means there
   is no second copy to drift.

   Everything is fixed here rather than passed in: 36px, the chat filter, the
   idle speed. A prop for any of them would just re-open the gap this exists
   to close. */
/* An agent's answer is rarely one paragraph, so the reply is stored with a
   little structure and rendered rather than dumped into a <p>.

   Three marks, all of which survive being cut off mid-way — which matters,
   because the text arrives a word at a time and every intermediate state gets
   rendered:

     ## …   a section heading
     - …    a bullet
     Label: a lead-in, bolded up to the colon

   The marks stay out of `text` itself as little as possible: they're stripped
   at render, and `plain()` strips them again for copy and read-aloud, so what
   you paste is prose rather than someone's markup. */
export const plain = (text: string) =>
  text.replace(/^(## |- )/gm, "");

/* **bold** inside a line, so a heading and the sentence qualifying it can
   share one line at two different weights — which a block-level "## " can't
   do, since it takes the whole line with it.

   An unclosed run bolds to the end of the line rather than showing its
   asterisks. That case is not an error, it's every frame of the stream
   between the opening ** arriving and the closing one: without it the heading
   would flash its own markup while being written. */
function Inline({ text }: { text: string }) {
  const parts = text.split("**");
  return (
    <>
      {parts.map((part, i) =>
        i % 2 ? (
          <span key={i} className="font-semibold text-[var(--ink)]">
            {part}
          </span>
        ) : (
          <Linkify key={i} text={part} />
        ),
      )}
    </>
  );
}

/* Bare domains in the answer become links.

   Matched out of the prose rather than marked up in it, because these come
   from whatever the agent wrote — a marker would only work for the ones we
   happened to author. The pattern is deliberately narrow: a hostname with a
   known-looking TLD and no space in it, so "e.g." and "etc." are left alone.

   target="_blank" with rel="noreferrer": the chat is the thing the visitor
   came for, and navigating the page out from under a half-read answer loses
   it. noreferrer because opening a new tab otherwise hands the destination a
   window.opener it can navigate. */
const LINK_CLASS =
  /* Ink text on an accent underline rather than the web's blue.

     A link inside a sentence has to be findable without being the loudest
     thing in the answer, and a fixed blue is also the one colour in here that
     never re-themes — on Brightline's marigold it was the only blue on the
     page. The underline carries the tenant's colour and thickens on hover;
     the word itself stays readable ink, which a light accent set as text
     would not be. */
  "font-semibold text-[var(--ink)] underline decoration-[color-mix(in_srgb,var(--brand)_60%,transparent)] decoration-[1.5px] underline-offset-[3px] transition-colors hover:decoration-[var(--brand)]";

/* The four things in an answer that aren't prose.

   An address, a phone number and a set of opening hours are the parts of a
   reply someone acts on — they get copied into a dialler, a mail client, a
   calendar — and in flat body text they are the hardest parts to find again
   after reading past them. So they're matched out of the sentence and set
   apart: the two you can follow become links, the two you can only read
   become semibold.

   Order matters. The email pattern runs before the bare-domain one, or
   "information@hellobrightline.com" gets its tail linkified as a website and
   the address itself stays inert — which is exactly what it used to do.

   Narrow on purpose, all four: a hostname needs a known-looking TLD so "e.g."
   is left alone, a phone number needs its separators, and an hours range
   needs two clock times with a dash between them, so "8am" on its own in a
   sentence stays prose. */
const EMAIL_RE = "[a-z0-9._%+-]+@(?:[a-z0-9-]+\\.)+[a-z]{2,}";
const DOMAIN_RE = "(?:[a-z0-9-]+\\.)+(?:com|io|ai|co|org|net|dev)\\b";
/* (888) 255-7040, 888-255-7040, +1 888 255 7040 — the shapes a tenant pack
   actually writes a number in. */
const PHONE_RE =
  "(?:\\+\\d{1,2}\\s?)?\\(?\\d{3}\\)?[\\s.-]\\d{3}[\\s.\\u2013-]\\d{4}";
/* 8am–7pm, 8:30am - 7 pm, either dash, with the zone if one follows. */
const HOURS_RE =
  "\\d{1,2}(?::\\d{2})?\\s?(?:am|pm)\\s?[\\u2013\\u2014-]\\s?\\d{1,2}(?::\\d{2})?\\s?(?:am|pm)(?:\\s(?:ET|CT|MT|PT))?";
const ATOM = new RegExp(
  `(${EMAIL_RE})|(${DOMAIN_RE})|(${PHONE_RE})|(${HOURS_RE})`,
  "gi",
);

function Linkify({ text }: { text: string }) {
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(ATOM)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const [, email, domain, phone] = m;
    if (email) {
      /* The whole address is the link, but only the host is marked as one.

         Underlining "information@hellobrightline.com" end to end draws a rule
         under half a line of prose — the mailbox name is not the thing you
         are being pointed at, it is an address you read. So the domain
         carries the underline and the weight, the local part stays body text,
         and the anchor around both is still one click. */
      const [box, host] = email.split(/@(.*)/);
      out.push(
        <a
          key={at}
          href={`mailto:${email}`}
          className="font-light text-[var(--ink-soft)] no-underline"
        >
          {box}@<span className={LINK_CLASS}>{host}</span>
        </a>,
      );
    } else if (domain) {
      out.push(
        /* target="_blank" with rel="noreferrer": the chat is the thing the
           visitor came for, and navigating the page out from under a
           half-read answer loses it. noreferrer because opening a new tab
           otherwise hands the destination a window.opener it can navigate. */
        <a
          key={at}
          href={`https://${domain}`}
          target="_blank"
          rel="noreferrer"
          className={LINK_CLASS}
        >
          {domain}
        </a>,
      );
    } else if (phone) {
      /* A link as well as a weight: on a phone this is the one thing in the
         answer you want to be one tap from dialling. No underline — the
         semibold is already saying "this is the number", and a rule under a
         string of digits reads as a correction mark. */
      out.push(
        <a
          key={at}
          href={`tel:${phone.replace(/[^+\d]/g, "")}`}
          className="font-semibold text-[var(--ink)] no-underline"
        >
          {phone}
        </a>,
      );
    } else {
      out.push(
        <span key={at} className="font-semibold text-[var(--ink)]">
          {m[0]}
        </span>,
      );
    }
    last = at + m[0].length;
  }
  out.push(text.slice(last));
  return <>{out}</>;
}

/* Bold the "Label:" that opens a line, if there is one. Bounded length and no
   newline in the label so a sentence that merely contains a colon halfway
   through doesn't get its first half bolded.

   Both halves still go through Inline. They used to be printed as raw text,
   which meant a line that used both marks — "- **Self-pay** — therapy: $350
   …", the shape every priced bullet in a tenant pack is written in — showed
   its own asterisks, and any domain after the colon stopped being a link.
   Bolding a label that is already bold costs nothing; the span is the same
   weight either way. */
function Lead({ line }: { line: string }) {
  const at = line.indexOf(":");
  if (at > 1 && at < 64 && !line.slice(0, at).includes("\n")) {
    return (
      <>
        <span className="font-semibold text-[var(--ink)]">
          <Inline text={line.slice(0, at + 1)} />
        </span>
        <Inline text={line.slice(at + 1)} />
      </>
    );
  }
  return <Inline text={line} />;
}

/* A citation, and the card behind it.

   The number alone tells you a claim is sourced but not by what, which is the
   part that decides whether you trust it. Hovering gives the title, the line
   on what it is, and a link out — enough to judge without leaving the answer.

   Hover rather than click: this is a glance, not a place to read. The trace
   and the source list both open on click because you read those against the
   text; a card that only has to answer "what is 3?" shouldn't cost a click
   and a second click to dismiss.

   pb-2 on the wrapper is a transparent bridge, so moving the pointer from the
   badge up onto the card doesn't cross a gap and dismiss it. */
function Citation({ index }: { index: number }) {
  /* From context rather than the module fixture: a citation in a tenanted
     thread has to point at the tenant's sources. Outside any provider the
     context defaults to the TARS pack, so standalone RichText mounts keep
     the footnotes they had. */
  const src = useContext(ContentContext).sources[index];
  if (!src) return null;
  return (
    <span className="group/cite relative inline-block align-[0.08em]">
      <span
        tabIndex={0}
        className="inline-flex size-[18px] cursor-default items-center justify-center rounded-full bg-[var(--fill)] text-[11px] font-normal leading-none text-[var(--ink-mute)] outline-none transition-colors group-hover/cite:bg-[var(--fill-hover)] group-hover/cite:text-[var(--ink)] group-focus-within/cite:bg-[var(--fill-hover)]"
      >
        {index + 1}
      </span>

      {/* left-0 rather than centred: a card pinned to the badge's left edge
          can only overflow the panel on one side, and these sit at the end of
          a line where there is room to the right and none to the left. */}
      <span className="pointer-events-none absolute bottom-full left-0 z-30 block w-max max-w-[260px] pb-2 opacity-0 transition-opacity duration-150 group-hover/cite:pointer-events-auto group-hover/cite:opacity-100 group-focus-within/cite:pointer-events-auto group-focus-within/cite:opacity-100">
        <span
          className="flex flex-col gap-1 rounded-[12px] bg-[var(--pane)] p-3 text-left"
          style={{
            /* Heavier than a normal popover, because this one lands on a
               surface its own colour. With nothing between them, the card
               has only its edge and its shadow to say it's in front — a
               hairline at 0.07 disappears entirely against white, so the
               ring goes to 0.12 and the drop gets a second, tighter layer to
               keep the lift readable close to the box. */
            boxShadow:
              "0 16px 36px -10px rgba(15,17,26,0.30), 0 3px 10px -2px rgba(15,17,26,0.12), 0 0 0 1px rgba(15,17,26,0.12)",
          }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-faint)]">
            Source {index + 1}
          </span>
          <span className="text-[13px] font-medium leading-snug text-[var(--ink)]">
            {src.name}
          </span>
          <span className="text-[12px] leading-[1.5] text-[var(--ink-mute)]">
            {src.description}
          </span>
          <a
            href={`https://${src.url}`}
            target="_blank"
            rel="noreferrer"
            className="mt-0.5 inline-flex max-w-full items-center gap-1 text-[11px] text-[#2563EB] underline underline-offset-2"
          >
            <span className="truncate">{src.url}</span>
            <ExternalLink className="size-3 shrink-0" strokeWidth={2} aria-hidden />
          </a>
        </span>
      </span>
    </span>
  );
}

export function RichText({ text }: { text: string }) {
  const blocks = text.split("\n\n");
  const out: React.ReactNode[] = [];
  let bullets: string[] = [];

  /* Bullets are flushed as one list rather than one list each, so the gap
     between two items is the list's own spacing instead of the gap between
     two block elements that happen to sit next to each other. */
  const flush = (key: string) => {
    if (!bullets.length) return;
    out.push(
      /* Markers drawn rather than `list-disc`: the browser's own disc is a
         full-size bullet in the text's colour, set on a baseline that leaves
         it riding high beside a 14px line, and it takes the indent with it.
         A 5px dot in the text's own ink, positioned against the first
         line's optical centre, reads as punctuation instead of a glyph —
         and the hanging indent can then be 16px rather than the 20 the list
         style forced.

         Ink, not the accent: the marker is punctuation, and punctuation in
         the tenant's colour turns a list into a branded element. The accent
         is for things you can act on. */
      <ul key={key} className="flex flex-col gap-[7px]">
        {bullets.map((b, i) => (
          <li key={i} className="relative pl-4">
            <span
              aria-hidden
              className="absolute left-[3px] top-[0.62em] size-[5px] rounded-full"
              style={{ background: "var(--ink)" }}
            />
            <Lead line={b} />
            {/* The source the claim came from, numbered in reading order.

                Glued to the sentence with a non-breaking space so it can
                never wrap onto a line of its own — a citation adrift on the
                next line stops pointing at anything.

                A circle: a fixed 18px box with no padding, rather than a pill
                that happens to look round at one digit. Padding sizes the box
                to its contents, so "10" would stretch into a lozenge while
                "1" stayed circular, and the column of citations would change
                shape partway down. */}
            {"\u00A0"}
            <Citation index={i} />
          </li>
        ))}
      </ul>,
    );
    bullets = [];
  };

  blocks.forEach((block, i) => {
    if (block.startsWith("- ")) {
      bullets.push(block.slice(2));
      return;
    }
    flush(`ul-${i}`);
    out.push(
      /* space-y-1 inside a block, the list's gap between blocks: the lines of
         one paragraph belong together and a heading belongs to the paragraph
         under it, so the tighter gap is the one that goes inside. */
      <div key={i} className="space-y-1">
        {block.split("\n").map((line, j) =>
          line.startsWith("## ") ? (
            /* A heading is the same size as the text it introduces, in the
               full ink and with air above it. Bigger type would make a
               two-line answer look like a document; the weight and the space
               are enough to say "new section" at this scale. */
            <p key={j} className="pt-0.5 font-semibold text-[var(--ink)]">
              {line.slice(3)}
            </p>
          ) : (
            /* The opening paragraph carries the full ink, the rest the soft.

               An answer is a topline and then its qualifications, and at one
               colour those read as one undifferentiated block — the eye has
               nowhere to land first. Colour rather than size or weight,
               because the sentence has to stay prose: a heavier first
               paragraph reads as a heading that ran long. */
            <p key={j} className={i === 0 ? "text-[var(--ink)]" : undefined}>
              <Lead line={line} />
            </p>
          ),
        )}
      </div>,
    );
  });
  flush("ul-last");

  /* 14px between blocks, against the 22px line the text sets: a paragraph
     break has to be visibly more than a line break or the block reads as one
     long paragraph with a stutter in it, and visibly less than a line of
     blank space or the answer falls apart into separate notes. */
  return <div className="space-y-3.5">{out}</div>;
}

/* A variation on the orb: one four-point sparkle, drawn in line rather than
   in dots.

   The orb is a field of particles and reads as machinery working; a single
   mark reads as a signature on the turn. That is the whole argument for
   trying it — the chip it sits in says "Thought for 8s" under a finished
   answer for the rest of the conversation, and a finished answer wants a mark
   that is comfortable being still.

   Not a drawn icon — a light. The reference is a four-point flare with no
   edge anywhere on it: needle arms fading into the page, a bright core, and
   the hue travelling from cool at one tip to warm at the other. That is three
   things, and only one of them is the path.

   The shape is drawn twice. The back copy is blurred wide and low-opacity —
   the bloom the flare sits in — and the front copy is blurred just enough to
   take the edge off without losing the arms. One copy at either blur is a
   different picture: sharp alone is an icon, soft alone is a smudge.

   The arms pinch almost the whole way to their points, because everything
   here is filled rather than stroked and a shallow waist blurs into a
   diamond. What survives the blur is the taper.

   Sized in the viewBox with room to spare — the box is padded 8 units past
   the star on every side, since a blur that reaches past its own viewBox is
   simply cut off, and the cut lands exactly where the glow was meant to be
   softest.

   The ids are per-instance. Two of these on a page sharing one means whichever
   mounted last owns the definition and the others render unpainted. */
export function AccentSparkle({ size, paused }: { size: number; paused?: boolean }) {
  const id = useId();
  const grad = `${id}-g`;
  const soft = `${id}-s`;
  const bloom = `${id}-b`;
  /* Four cubics, one per quadrant, each running from a tip to the next with
     both handles pulled almost onto the centre. That is what makes the waist
     between two arms deep: the curve leaves the tip travelling along the arm
     and only turns at the last moment. Written out symmetrically — the same
     two numbers mirrored in each quadrant — so the star can't end up subtly
     lopsided, which at this size shows up as it appearing to lean. */
  const star = [
    "M12 0.5",
    "C12.35 8.6 15.4 11.65 23.5 12",
    "C15.4 12.35 12.35 15.4 12 23.5",
    "C11.65 15.4 8.6 12.35 0.5 12",
    "C8.6 11.65 11.65 8.6 12 0.5",
    "Z",
  ].join(" ");

  return (
    <span
      className="flex shrink-0 items-center justify-center"
      style={{
        width: size,
        height: size,
        animation: paused
          ? undefined
          : "sparkle-turn 4200ms cubic-bezier(0.4, 0, 0.6, 1) infinite",
      }}
      aria-hidden
    >
      {/* The canvas is bigger than the mark.

          The viewBox is 40 units wide to give the bloom somewhere to go, but
          the star inside it is still 24 — so drawing the svg at `size` renders
          a star at 24/40 of it, and asking for 32px got you 19. Scaling the
          canvas by that same ratio makes `size` mean the star again, which is
          the number anyone tuning this is actually looking at.

          The span around it stays at `size`, so the layout box is the mark and
          the glow spills outside it. That is the right way round: a bloom that
          reserved space would push the label beside it away by an amount
          nobody can see. */}
      <svg
        width={size * (40 / 24)}
        height={size * (40 / 24)}
        viewBox="-8 -8 40 40"
        fill="none"
        className="overflow-visible"
      >
        <defs>
          <linearGradient
            id={grad}
            x1="1"
            y1="22"
            x2="23"
            y2="2"
            gradientUnits="userSpaceOnUse"
          >
            {/* Pale at the bottom-left tip, through the accent at the core, to
                deep at the top-right — the reference's own direction. The
                accent sits in the middle rather than at an end so it is what
                the eye lands on: the core is the brightest part of a flare,
                and the brand colour should be the part you look at.

                Both tips are the accent's own neighbours now (see sparkTips),
                published as variables by the composer. The hexes here are the
                old fixed pair, kept as the fallback for the button launcher
                and Design's own preview, which mount this outside any
                composer and so outside the element that defines them. */}
            <stop offset="0%" style={{ stopColor: "var(--spark-cool, #7DD3FC)" }} />
            {/* Styles, not attributes: stop-color as an attribute can't hold
                a var(). The fallbacks matter here — the sparkle is imported
                by the button launcher, which mounts it outside any composer
                and so outside the element that defines the variables. */}
            <stop offset="45%" style={{ stopColor: "var(--brand-lite, #8B5CF6)" }} />
            <stop offset="72%" style={{ stopColor: "var(--brand, #6D33AA)" }} />
            <stop offset="100%" style={{ stopColor: "var(--spark-warm, #E879F9)" }} />
          </linearGradient>

          <filter id={soft} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="0.55" />
          </filter>
          <filter id={bloom} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="2.6" />
          </filter>
        </defs>

        <g
          style={{
            transformOrigin: "12px 12px",
            animation: paused
              ? undefined
              : "sparkle-bloom 1800ms ease-in-out infinite",
            opacity: paused ? 0.45 : undefined,
          }}
        >
          <path d={star} fill={`url(#${grad})`} filter={`url(#${bloom})`} />
        </g>

        <path d={star} fill={`url(#${grad})`} filter={`url(#${soft})`} />
      </svg>
    </span>
  );
}

/* The caveat line, truncated, with the full text on the tail.

   The line is one line by decision: a disclaimer specific enough to name who
   to ask (Brightline's does) runs past the panel's width, and wrapping it
   pushes the field down by a line that isn't part of the conversation. So it
   truncates, and the rest lives in a tooltip.

   What is new here is where that tooltip answers from. It used to be the
   whole line: run the pointer anywhere across a sentence that is already
   fully legible and a black box appeared over the conversation to tell you
   what you were already reading. The ellipsis is the only part of the line
   that is hiding anything, so the ellipsis — and the half-word it ate — is
   the only part that should offer to show it. Everything to its left is
   inert text.

   Which means measuring, because CSS truncation does not say where it cut.
   The paragraph is laid out as normal and a Range walks it for the first
   character whose right edge passes the box, then backs up to the start of
   that word; the hover target is everything from there to the right edge, so
   it covers the clipped word and the ellipsis after it and nothing else. It
   is remeasured on resize, since the pane this sits in animates its width
   and the cut moves with it.

   Zero when the line fits: nothing is hidden, so there is nothing to offer,
   and the target unmounts rather than sitting there invisible. */
function DisclaimerLine({
  text,
  wrapClassName,
  wrapStyle,
  pClassName,
}: {
  text: string;
  wrapClassName: string;
  /* The measure, which is a number the placement decides rather than a class
     — see noticeW. */
  wrapStyle?: CSSProperties;
  pClassName: string;
}) {
  const pRef = useRef<HTMLParagraphElement>(null);
  const [tailW, setTailW] = useState(0);

  useEffect(() => {
    const el = pRef.current;
    if (!el) return;

    const measure = () => {
      const node = el.firstChild;
      const body = node?.textContent ?? "";
      /* Nothing clipped, nothing to reveal. */
      if (!node || node.nodeType !== 3 || el.scrollWidth <= el.clientWidth + 1) {
        setTailW(0);
        return;
      }
      const box = el.getBoundingClientRect();
      const r = document.createRange();
      /* Ranges report the line as laid out, not as clipped, so the
         characters past the edge still have geometry to compare against —
         which is the whole reason this can find a cut the box itself has
         already hidden. */
      let cut = body.length;
      for (let i = 0; i < body.length; i++) {
        r.setStart(node, i);
        r.setEnd(node, i + 1);
        if (r.getBoundingClientRect().right > box.right) {
          cut = i;
          break;
        }
      }
      /* Back to the head of the last word on the line.

         Two steps, because there are two ways a line can end. Usually the
         cut lands mid-word — "diag…" — and the target has to start at that
         word's head, or the visible half of it would be dead. But the cut
         can also land exactly on the space between words, and then there is
         no half-word to include: walking back from the space alone left a
         target a few pixels wide, hanging off the ellipsis with nothing you
         could reasonably aim at. Skipping the whitespace first puts the
         search inside the last word that is actually on screen, so either
         ending gives a target the width of a word. */
      let i = cut;
      while (i > 0 && body[i - 1] === " ") i--;
      let start = i;
      while (start > 0 && body[start - 1] !== " ") start--;
      r.setStart(node, start);
      r.setEnd(node, Math.min(start + 1, body.length));
      setTailW(Math.max(0, box.right - r.getBoundingClientRect().left));
    };

    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  return (
    <div className={wrapClassName} style={wrapStyle}>
      {/* Inert. The text is read, not operated — every pointer event on the
          line belongs to the tail below. */}
      <p ref={pRef} className={`pointer-events-none truncate ${pClassName}`}>
        {text}
      </p>

      {tailW > 0 && (
        <span
          /* group/disclaimer scopes the hover to this span specifically;
             plain `group` would answer to any ancestor's hover too, which is
             the whole-line behaviour this replaces. */
          className="group/disclaimer absolute inset-y-0 right-0 cursor-default"
          style={{ width: tailW }}
        >
          {/* Right-aligned to the tail rather than centred on the line.
              Centred, the box appeared over the middle of a sentence with
              nothing under it to explain why — it read as a notification.
              Hung off the ellipsis it reads as that ellipsis opening, which
              is what it is.

              Not the browser's native `title`: that is the OS's own square
              grey box, positioned off the cursor rather than the text, on
              its own delay — it reads as the browser interrupting, not as
              part of the window it is floating over. */}
          <span
            role="tooltip"
            className="pointer-events-none absolute right-0 bottom-full z-30 mb-1.5 block w-max max-w-[280px] rounded-[8px] px-2.5 py-1.5 text-left text-[11px] leading-snug text-white opacity-0 shadow-[0_8px_20px_-4px_rgba(15,17,26,0.35),0_2px_6px_-1px_rgba(15,17,26,0.2)] transition-opacity duration-150 group-hover/disclaimer:opacity-100"
            style={{ background: "var(--ink)" }}
          >
            {text}
          </span>
        </span>
      )}
    </div>
  );
}

/* Solar's chat-round-dots-outline, inlined — the same mark Design's launcher
   shows on a conversation waiting to be resumed, so the two surfaces carry
   one icon rather than two drawings of the same idea. Kept as source rather
   than an <img> for two reasons: an icon that arrives over the network is an
   icon that is missing on a slow connection, and as source it inherits
   currentColor and can hold the badge inside its own artwork.

   The `outline` cut, not `linear`: outline draws the bubble as a filled
   even-odd shape rather than a stroked path, so the weight is baked into the
   artwork and stays put at any size — a stroked mark at `size-6` inside a
   44px disc needs its width retuned every time either number moves. The dots
   are filled discs for the same reason, rather than three round line-caps
   pretending to be discs. */
function ChatDotsMark({
  className,
  style,
  dot,
  dotRing,
  dotR = 3.5,
}: {
  className?: string;
  style?: CSSProperties;
  /* Inside the artwork rather than positioned over the button, so it scales
     with the mark and sits at the same point on it at every size — a badge
     hung off the disc drifts to wherever that box's corner happens to be. */
  dot?: string | null;
  /* Knocked out in whatever is behind the mark. The dot's centre sits on the
     bubble's own outline — the classic badge position — so without a ring it
     would read as a bulge in the stroke rather than a thing on top of it. */
  dotRing?: string | null;
  /* In viewBox units, so it comes down as the mark goes up: the same radius
     drawn at 32 renders half again as large as at 24, and a badge that scales
     with its mark stops being a badge. */
  dotR?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="currentColor"
      aria-hidden
    >
      <path d="M9 12C9 12.5523 8.55228 13 8 13C7.44772 13 7 12.5523 7 12C7 11.4477 7.44772 11 8 11C8.55228 11 9 11.4477 9 12Z" />
      <path d="M13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12Z" />
      <path d="M17 12C17 12.5523 16.5523 13 16 13C15.4477 13 15 12.5523 15 12C15 11.4477 15.4477 11 16 11C16.5523 11 17 11.4477 17 12Z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22.75 12C22.75 6.06294 17.9371 1.25 12 1.25C6.06294 1.25 1.25 6.06294 1.25 12C1.25 13.7183 1.65371 15.3445 2.37213 16.7869C2.47933 17.0021 2.50208 17.2219 2.4526 17.4068L1.857 19.6328C1.44927 21.1566 2.84337 22.5507 4.3672 22.143L6.59324 21.5474C6.77814 21.4979 6.99791 21.5207 7.21315 21.6279C8.65553 22.3463 10.2817 22.75 12 22.75C17.9371 22.75 22.75 17.9371 22.75 12ZM12 2.75C17.1086 2.75 21.25 6.89137 21.25 12C21.25 17.1086 17.1086 21.25 12 21.25C10.5189 21.25 9.12121 20.9025 7.88191 20.2852C7.38451 20.0375 6.78973 19.9421 6.20553 20.0984L3.97949 20.694C3.57066 20.8034 3.19663 20.4293 3.30602 20.0205L3.90163 17.7945C4.05794 17.2103 3.96254 16.6155 3.7148 16.1181C3.09752 14.8788 2.75 13.4811 2.75 12C2.75 6.89137 6.89137 2.75 12 2.75Z"
      />
      {dot && (
        <circle
          cx="19.6"
          cy="4.6"
          r={dotR}
          fill={dot}
          stroke={dotRing === null ? "none" : (dotRing ?? "#fff")}
          strokeWidth={dotRing === null ? 0 : 1.6}
        />
      )}
    </svg>
  );
}


/* `paused` freezes it on the frame it reached.

   The chip outlives the work it was reporting: it says "Thought for 8s" under
   a finished answer, for the rest of the conversation. An orb still turning
   there is a progress indicator for something that stopped, and with several
   replies on screen it's three or four of them turning at once — the panel
   ends up permanently busy over text that isn't going anywhere.

   Frozen rather than swapped for a static mark, so the same object that was
   spinning while it worked is the one sitting still afterwards: the animation
   stopping is the thing that reports the work finishing. */
function MergedOrb({ filter, paused }: { filter: string; paused?: boolean }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center"
      style={{
        width: ORB_PX_UNIFIED,
        height: ORB_PX_UNIFIED,
        filter,
        /* Pinned to its own layer so the filter always rasterises the same
           way. An SVG filter is resolved against whatever texture the
           compositor happens to be drawing its subtree into, and that texture
           belongs to the nearest composited ancestor — so the same orb picks
           up a different raster scale next to the shimmering step text than
           it does under a settled reply, and a dilate measured in those
           pixels comes out coarser in one place than the other. Its own layer
           means its own texture, at its own scale, everywhere it appears.

           This is why the two looked different while measuring identical:
           the canvas, the box, the transform and the filter really were the
           same. What differed was the surface underneath them. */
        transform: "translateZ(0)",
      }}
      aria-hidden
    >
      {/* The 64 preset scaled down rather than the 20 lifted up: connecting
          needs nodes and edges, and the sparse design doesn't have enough of
          either to read as a constellation once it's small. */}
      <span style={{ transform: `scale(${ORB_PX_UNIFIED / 64})` }}>
        <ThinkingOrb
          state="connecting"
          size={64}
          speed={1.5}
          theme="dark"
          paused={paused}
        />
      </span>
    </span>
  );
}

/* What the trace lists, as against what the row says while it's working.

   Two lists rather than one because the tense genuinely differs: the labels
   above run while the work is happening, and the trace is read afterwards
   under a tick. "Searching" under a tick claims something is still in flight
   that plainly isn't.

   Three, and the three that carry information — where it looked, how much it
   read, what it ran. The rest of the live labels ("Thinking", "Writing the
   answer") exist to fill a wait; in a record they'd be filler. */
/* What the citations point at.

   Ordered to match the numbers in the answer — the badge on a bullet and the
   avatar in this row are the same source, so they have to agree. Kept as data
   rather than four hardcoded <img> tags so the "+N" overflow count is derived
   from the list instead of being a number someone has to remember to bump. */
const SOURCES = [
  {
    name: "How Tars agents work",
    description:
      "Product overview — what an agent is trained on and what it can act on.",
    url: "hellotars.com/ai-agents",
  },
  {
    name: "Channels & deployment",
    description:
      "Where an agent can be published: WhatsApp, web widget, landing pages.",
    url: "hellotars.com/channels",
  },
  {
    name: "Knowledge base & RAG",
    description:
      "How documents are ingested, and how answers cite what they drew on.",
    url: "hellotars.com/docs/knowledge-base",
  },
  {
    name: "Live chat handover",
    description:
      "When a conversation moves to a human, and what travels with it.",
    url: "hellotars.com/docs/handover",
  },
];

/* How many faces before the count takes over. Three is where a stack still
   reads as distinct things rather than as a smear. */
/* How long the whole suggestion row takes to arrive, and the curve it uses.

   The window is fixed; the step between buttons is divided out of it, so the
   last pill lands at the same moment whether there are two suggestions or
   five. A fixed per-button delay would make a long row drag and a short one
   look abrupt — the thing that should stay constant is when the row is
   finished, not the gap between its parts. */
const SUGGEST_IN_MS = 380;
const SUGGEST_WINDOW_MS = 260;
/* When the last pill has settled — the stagger window plus one button's own
   entrance. Derived rather than typed, so retuning either half of the
   animation moves what happens after it too. */
const SUGGEST_SETTLED_MS = SUGGEST_IN_MS + SUGGEST_WINDOW_MS;
const SUGGEST_EASE = "cubic-bezier(0.25, 0.1, 0.25, 1)";

const SOURCE_FACES = 3;
/* The chip's surfaces, opaque.

   Matched to the user's own bubble — the white theme's `bubble` is
   rgba(15,17,26,0.055) over a #FFFFFF pane, which composites to exactly this.
   Written out solid rather than reused as the token because the disc sits on
   the pill and the pill on the pane: stacking the same alpha twice would
   darken the disc by accident, and a transparent ring would show whatever is
   under it instead of cutting.

   The other two are that colour stepped once darker for the pressed state and
   once more for the disc, so the chip stays one family rather than borrowing
   a second grey. */
const CHIP_FILL = "#F2F2F3";
const CHIP_FILL_ON = "#E8E8EA";
const CHIP_DISC = "#DDDDE0";

/* The sources box, a step lighter than the chip that opens it.

   Matching the chip made the panel the heaviest thing under the reply: the
   chip is a 100px lozenge and the box is four rows of it, so the same grey
   reads as far more grey once it's that much larger. Lighter keeps the edge
   doing the enclosing — the panel is defined by having a boundary at all,
   not by being darker than the pane it sits on.

   The hover follows it down by the same step, so a row still lifts out of
   the box by the amount it did before. */
const SOURCE_BOX = "#F8F8F9";
const SOURCE_ROW_ON = "#EFEFF1";

/* How long the panel takes to unfold, and how much room is left under it once
   it has. One number for the transition and for the scroll that follows it, so
   the thread stops moving on the same frame the box stops growing — two
   numbers here would show up as a scroll that either quits early or carries on
   after everything has settled.

   Nothing here says how much room to leave under the panel — that's the
   transcript's own bottom padding, read off the element at scroll time. A
   constant of its own would be a second opinion on the same gap, and the one
   that loses is the one you can see: scrolling to a smaller number parks the
   panel above the padding and hides it below the fold, so the 24px set on the
   thread arrives on screen as 8. */
const SOURCES_OPEN_MS = 300;

export const REASONING_TRACE = [
  "Searched your help centre",
  "Read 3 sources",
  "Called check_pricing",
];

export const REASONING_STEPS = [
  "Thinking",
  "Searching your help centre",
  "Reading 3 sources",
  "Calling check_pricing",
  "Writing the answer",
];

type Message = {
  id: number;
  from: "user" | "agent";
  text: string;
  at: number;
  /* An illustration the turn opens with, above its text. Only the greeting
     uses one so far: a mark is a thing to be met by, which is a greeting's
     job and nothing else's — a picture over an answer is decoration on top
     of the part someone actually asked for. */
  image?: string;
  /* Carried on the message rather than looked up at render time, so a reply
     keeps the follow-ups it was written with even after the question that
     produced it has scrolled away. */
  prompts?: string[];
  /* Node UI, not suggestions. `prompts` are quick replies — the composer's
     offer, pinned at the panel foot. `buttons` are components the workflow
     node shipped *with* the message, so they render inside the turn, under
     the bubble, and stay in the transcript the way anything said does. */
  buttons?: string[];
  /* An input component the node shipped: rendered as a form card in the
     turn, filled in place, and closed by the agent's follow-on reply. */
  form?: ComposerForm;
  /* Disclosure sections the node shipped: rendered under the text, in the
     turn, and kept in the transcript like anything else said. */
  accordion?: ComposerAccordion;
  /* No footer. An acknowledgement mid-flow isn't a turn anyone rates,
     copies, or reads aloud — a toolbar under "thanks" is furniture. */
  quiet?: boolean;
  /* Carried on the message so the trace survives the thinking state that
     produced it — the chip above a reply has to still be there ten turns
     later, when nothing is thinking. */
  steps?: string[];
  /* The reply exists before it has anything to say.

     On the merged surface the agent's turn is one row from the moment the
     question lands: the orb and its label mount immediately, and the answer
     is written into the same message when it arrives. That's the difference
     between the mark carrying on and the mark being swapped — a separate
     thinking row would unmount at the handover, and its replacement would
     start its animation from frame zero in a slightly different place, which
     is exactly the jump this is here to remove. */
  pending?: boolean;
  /* How long the agent actually spent, in ms, stamped when the reply lands.

     The chip reports this rather than a fixed string. thinkFor() already
     scales the wait to the length of the answer being written, so a short
     reply and a long one genuinely take different times — printing a constant
     would be a claim the rest of the component contradicts on screen. */
  thoughtMs?: number;
};

/* The conversation list behind the back button.

   Grouped by recency rather than shown as one run, because a flat list of
   dates makes you read every row to find where "recent" stops. The labels do
   that work — and the groups are held as data rather than derived from the
   timestamps, since these are fixtures with no real dates behind them.
   Deriving them would mean inventing dates purely to turn them back into
   the words already written here. */
/* `title` is what the conversation was about and `description` is where it
   got to — the last thing said in it, which is what tells you whether it is
   finished. Both are one line and truncate: a row you can read at a glance is
   the whole point of a list, and two lines of wrapped subject line turns
   scanning into reading.

   `handedTo` is the human who took the conversation over, if one did.

   The slot on the left used to be the visitor's own monogram, which is a
   thing this product can't know: the messenger sits on a homepage, the person
   talking to it hasn't registered, and every row in the list is the same
   anonymous someone. An initial there was either their email address —
   which they haven't given — or the first letter of the subject line drawn
   as if it were a face.

   So it answers the other question instead, and the only one in the row that
   the title, the description, the tag and the time don't already answer: did
   this end up with a person? The agent's own mark where it didn't, and the
   colleague's monogram where it did. That also makes the odd one out the
   thing that stands out, which is the right way round — a handover is the
   exception and the reason you'd go looking for a conversation again.

   `channel` and `status` go on a third line rather than into the two above
   them, and quieter than either.

   They're the answer to a question you only ask about a row you have already
   found — where did I have this, and is it finished — so they read as a
   footnote to the row rather than as part of what it says. Pushed up beside
   the title they would compete with it: four marks on one line and the eye
   stops scanning and starts parsing.

   Status carries a colour, channel doesn't. One of the two has states worth
   telling apart at a glance — waiting on you is a thing to act on, resolved
   isn't — where a channel is just a fact, and colouring both would mean
   neither reads as urgent. The dot is what the colour lands on rather than
   the text, so the label stays at the same weight as everything else on the
   line.

   Written on the fixture rather than derived. In the real thing these come
   from whatever classifies a conversation server-side; inferring one here by
   matching words in the preview would be a fake classifier dressed as a real
   one, and the first thing anyone would ask is what it does with a
   conversation about two things. */
/* Annotated rather than inferred, so `channel` and `status` stay the enums
   the lookups are keyed by instead of widening to string — a typo in a
   fixture should be a red squiggle here, not a blank space in the row. */
type Conversation = {
  id: string;
  title: string;
  description: string;
  time: string;
  channel: keyof typeof CHANNELS;
  status: keyof typeof STATUSES;
  handedTo?: string;
};

/* Which row the thread behind the list belongs to.

   A constant because the archive is fixtures: nothing here stores a
   transcript, so there is no real link between a row and the conversation on
   the other side of the chevron. The newest row is the one being had — which
   is what the list would show anyway, since a conversation you are in the
   middle of is by definition the most recent one. */
const ACTIVE_CONVERSATION = "c1";

const CONVERSATIONS: { group: string; items: Conversation[] }[] = [
  {
    group: "Today",
    items: [
      {
        id: "c1",
        title: "Refund on a duplicate charge",
        description: "You: thanks, all sorted — really appreciate the quick turnaround.",
        time: "9:24 AM",
        channel: "web",
        status: "resolved",
      },
    ],
  },
  {
    group: "Yesterday",
    items: [
      {
        id: "c2",
        title: "Pro and Studio, side by side",
        description: "Tars: here are the differences between Pro and Studio.",
        time: "Yesterday",
        channel: "web",
        status: "resolved",
      },
    ],
  },
  {
    group: "Earlier",
    items: [
      {
        id: "c3",
        title: "Pointing a custom domain at the widget",
        description: "Priya: I've added the DNS records on our side now.",
        time: "Mar 12",
        channel: "whatsapp",
        status: "waiting",
        handedTo: "Priya",
      },
      {
        id: "c4",
        title: "First look at what Tars can do",
        description: "Tars: Good morning. I'm here whenever you need a hand.",
        time: "Mar 8",
        channel: "web",
        status: "closed",
      },
    ],
  },
];

/* What the two footnote fields render as.

   Keyed lookups rather than the label being the data, so the fixture stores
   what a real record would — an enum — and the words and colours stay a
   presentation decision that can be retuned in one place. "Waiting" reads as
   "Waiting on you" here; the record shouldn't have to carry the sentence.

   Two channels, because two is what ships: the widget on a site and
   WhatsApp. A landing page was listed here as a third and isn't one — it's
   another place the same web widget is embedded, so a row would have claimed
   a distinction the product doesn't make.

   The icons are the plainest available for each: a globe for the web, a chat
   bubble for WhatsApp. Not brand logos, but brand-coloured — the shape says
   which channel and the colour makes it findable without reading, which is
   what a footnote line wants.

   Each is a chip in its own colour: a pale wash of the channel's hue behind a
   darkened version of it, so the fill and the ink are the same colour at two
   ends of its range rather than a tint and a grey that happen to sit
   together.

   `tint` is the hue and the fill is mixed from it at render, so there is one
   value per channel to change rather than three that have to be kept in
   agreement. `ink` is written out rather than mixed toward black, because a
   readable dark of a colour isn't a linear step from it — the blue wants
   less darkening than the green does to hold the same contrast against its
   own wash. */
const CHANNELS = {
  web: { label: "Web", Icon: Globe, tint: "#2563EB", ink: "#1D4ED8" },
  whatsapp: {
    label: "WhatsApp",
    Icon: MessageCircle,
    tint: "#25D366",
    ink: "#0E7A3D",
  },
} as const;

/* How much of the hue survives into the fill. Low: this is a wash for a chip
   the size of two words on a row you are scanning past, and anything that
   reads as a solid colour here competes with the title above it. */
const CHIP_TINT = "14%";

/* Amber only for the one that wants something from you. Resolved is green
   because it's the good end state and the palette expects it there; closed is
   the row's own faint ink, since "nothing happened and nothing will" is
   exactly what no colour says. */
const STATUSES = {
  resolved: { label: "Resolved", dot: "#16A34A" },
  waiting: { label: "Waiting on you", dot: "#D97706" },
  closed: { label: "Closed", dot: "var(--ink-faint)" },
} as const;

/* The slice of Web Speech this uses, written out rather than pulled from the
   DOM lib.

   SpeechRecognition isn't in TypeScript's standard DOM types — it's a draft
   spec that Chrome and Safari ship behind `webkit`, so there is no shared
   definition to import. Declaring only what's touched here keeps the cast at
   one line and makes the surface this depends on visible: four properties and
   three handlers. */
type Recogniser = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onstart: (() => void) | null;
  onaudiostart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
};

/* The recording waveform, on real amplitude.

   A looping set of bars is the easy version and it's the wrong one: the whole
   job of this thing is to answer "is it hearing me?", and a shape that moves
   identically whether you speak or not answers that question wrongly. It
   costs one AnalyserNode on a second capture of the microphone, which the
   recogniser tolerates — that was checked, after a spell of blaming it for a
   transcript that was appearing somewhere else on screen.

   Bars are fixed and the levels scroll through them, oldest at the left, so
   the row reads as a trace of what was just said rather than a meter rising
   and falling in place. WAVE_MIN is the floor: silence draws a line of dots
   rather than nothing, which is what says the mic is open during a pause
   instead of broken.

   Sampled on an interval rather than every frame. At 60Hz neighbouring bars
   differ by less than a pixel and the trace reads as a blur; ~18Hz is slow
   enough that each bar is a distinguishable syllable-sized event. */
/* Bar count is what sets the spacing, now that the row spreads them across
   whatever width it has: fewer bars means a wider gap, not a shorter trace.
   96 lands them about 3px apart at the composer's open width, which is where
   the row reads as one waveform rather than as a line of separate ticks — and
   at 55ms a bar it still holds the last five seconds of speech. */
const WAVE_BARS = 96;
const WAVE_SAMPLE_MS = 55;
const WAVE_MIN = 0.12;
/* Speech at a conversational distance sits well under half of full scale, so
   the raw RMS would draw an almost flat line. Lifted until normal speech uses
   most of the height, then clamped. */
const WAVE_GAIN = 3.2;

/* `live` opens the capture; the bars exist either way. Mounting the row only
   once the microphone is available would pop a control into a row that has
   already settled, and a resting line of dots is a truthful picture of a
   recogniser that hasn't heard anything yet.

   It waits for the recogniser's own audiostart rather than racing it to the
   device, so the order the two open in is deterministic. */
function VoiceWave({ live }: { live: boolean }) {
  const barsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!live) return;
    let stream: MediaStream | null = null;
    let ctx: AudioContext | null = null;
    let raf = 0;
    let gone = false;
    const levels = new Array<number>(WAVE_BARS).fill(0);
    let last = 0;

    /* Written straight to the DOM rather than held in state. This runs about
       eighteen times a second for as long as someone is talking, and putting
       it through React would re-render the composer — and the transcript
       inside it — on every sample. */
    const paint = () => {
      const el = barsRef.current;
      if (!el) return;
      for (let i = 0; i < el.children.length; i++) {
        (el.children[i] as HTMLElement).style.transform = `scaleY(${
          WAVE_MIN + (1 - WAVE_MIN) * levels[i]
        })`;
      }
    };

    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then((s) => {
        /* The grant can land after the button has already been let go of. */
        if (gone) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        ctx = new AudioContext();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        ctx.createMediaStreamSource(s).connect(analyser);
        const buf = new Uint8Array(analyser.fftSize);

        const tick = (now: number) => {
          raf = requestAnimationFrame(tick);
          if (now - last < WAVE_SAMPLE_MS) return;
          last = now;
          /* Time domain, not frequency: this is a loudness trace, and the
             spectrum would be a different picture answering a question nobody
             asked of a composer. */
          analyser.getByteTimeDomainData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) {
            const v = (buf[i] - 128) / 128;
            sum += v * v;
          }
          levels.push(Math.min(1, Math.sqrt(sum / buf.length) * WAVE_GAIN));
          levels.shift();
          paint();
        };
        raf = requestAnimationFrame(tick);
      })
      /* Denied, or no device. The bars stay at their floor and dictation
         carries on — the recogniser holds its own permission, so losing the
         meter doesn't mean losing the words. */
      .catch(() => {});

    return () => {
      gone = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
      ctx?.close();
    };
  }, [live]);

  return (
    <div
      ref={barsRef}
      /* justify-between rather than a fixed gap: the bar count is fixed and
         the row isn't, so a set gap leaves the trace hanging in the left half
         of whatever width it's given. Spreading them puts the spacing where
         it belongs — derived from the space available — and the wave reaches
         both controls at any composer width. */
      className="flex min-w-0 flex-1 items-center justify-between overflow-hidden px-3"
      aria-hidden
    >
      {Array.from({ length: WAVE_BARS }, (_, i) => (
        <span
          key={i}
          className="h-4 w-[2px] shrink-0 origin-center rounded-full bg-[var(--ink-mute)] [will-change:transform]"
          style={{ transform: `scaleY(${WAVE_MIN})` }}
        />
      ))}
    </div>
  );
}

const speechRecognition = (): (new () => Recogniser) | undefined => {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as {
    SpeechRecognition?: new () => Recogniser;
    webkitSpeechRecognition?: new () => Recogniser;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};

/* Streaming cadence. Fast enough to stay ahead of reading rather than being
   waited on — the orb should feel like it's outrunning you, not spelling
   things out. This replaced the design system's CSS-staggered reveal, which
   couldn't work here: that puts the whole reply in the DOM at once and fades
   the words in on delays, so a marker placed after it sits at the end of the
   finished paragraph from the first frame. To have something travel with the
   text, the text has to genuinely not be there yet. */
export const STREAM_MS_PER_WORD = 40;

/* How long the panel takes to drop away, and therefore how long it has to
   stay mounted after being closed. One number for both, so the element can't
   be pulled out from under its own animation — the commonest way an exit
   transition ends up looking like an instant disappearance. */
/* The same move the messenger's maximise makes: a transition on the box's own
   dimension, 300ms ease-out, on an element that never unmounts.

   That last part is the whole difference from what was here before. Keyframes
   need the element to appear and disappear, which means mounting it, running
   an animation, and tearing it down on a timer — three things to keep in step,
   and the panel is a different element each time. A transition just moves one
   number on one element that is always there, so opening and closing are the
   same operation in opposite directions and an interrupted one reverses from
   wherever it had got to instead of restarting. */
/* The merged surface's total height — panel, field and disclaimer together.

   Set as a whole rather than as a panel height, because merged that's the
   only number anyone can see: the conversation area is whatever is left after
   the foot, not a figure of its own.

   FOOT is that remainder — the field's 12px top margin, its 60px box, the 8px
   below it and the disclaimer's line plus 12px padding. It's a constant
   because nothing here declares a height; each part is padding plus its
   tallest child, so there's nothing to read it from. Change the disc size,
   the field padding or the disclaimer's type and this has to follow, or the
   total quietly stops being the total. */
/* How the two screens change places.

   Shorter than the panel's own open/close, and on a decelerating curve rather
   than an eased-both-ends one: a push transition is a thing arriving, so it
   should come in fast and settle, not creep away from the edge it started
   at. 260ms is about where the movement still reads as the screens being
   connected without making anyone wait to press the next thing. */
const VIEW_SLIDE_MS = 260;
const VIEW_SLIDE_EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";

/* The merged surface's height, per placement.

   Its own table rather than GEOMETRY's `chatH`: that number is the panel
   alone, which is what the two-pane variants need, where this is the whole
   object — panel, composer and caveat line together. Sizing one off the
   other would tie the merged surface to measurements chosen for a panel that
   ends above the field.

   620 centred, 720 in a corner, and the difference is what the placement is
   for. Centred, the launcher is across the middle of someone's page and its
   height is taken out of the thing they were reading — so it stops where the
   conversation is comfortable rather than where the viewport ends. In a
   corner it has an edge to hang from and is beside the page instead of over
   it, so the extra hundred pixels cost nothing and buy two more turns before
   anyone has to scroll. The same argument the corner widths make in
   reverse: height is cheap at the edge, width is not. */
/* The window's corner, in one place.

   It was written as a literal 32 in three: the panel's top corners, the
   composer's bottom ones, and the shadow ghost that has to trace both. Three
   copies of a number that must agree is the same setup that let the height
   drift — so the window reads it from here and the resting pill keeps its own
   32, which is not this number but half of a 64px row. */
const SURFACE_RADIUS = 40;

const UNIFIED_HEIGHT: Record<Align, number> = {
  center: 620,
  left: 720,
  right: 720,
};
/* How long the highlight takes to go round the launcher once.

   Slow. This runs for as long as the page is open with nothing happening, so
   it has to survive sitting in the corner of someone's eye for minutes — much
   under three seconds and it reads as a control loading, and a launcher that
   looks permanently busy is worse than one with no ring at all. */
const LAUNCHER_RING_MS = 5200;

/* How thick the travelling hairline is.

   It was 1px, which is the right weight for a static edge and the wrong one
   for a moving highlight: a hairline that only shows its colour over a
   fraction of the perimeter has that much less of itself to be seen with, and
   the brightest part of the sweep was gone before the eye found it. 2px is
   still an edge rather than a border, and it's the number the mask's padding
   reads from — the ring is the gap between the border box and the content
   box, so this value is the ring. */
const LAUNCHER_RING_PX = 2;

/* The two ends of the thinking line's sweep, both derived from the accent
   so a tenant's shimmer is its own colour rather than TARS purple. `_LIT` is
   the same accent ink the suggestion chips take — 75% of the brand into
   black — and `_BASE` is that colour pulled most of the way to the pane's
   faint grey, which is what keeps a light accent legible where a plain
   alpha would leave it a rumour on white. */
const SHIMMER_BASE =
  "color-mix(in srgb, var(--brand) 40%, var(--ink-faint))";
const SHIMMER_LIT = "color-mix(in srgb, var(--brand) 75%, black)";

const UNIFIED_FOOT = 110;
/* No separate width constant for the merged surface any more. There was
   one (620) while `geo.open` was 600, and the two being different by 20px
   is what put the shadow ghost's silhouette outside the white it belongs
   to. The column, the ghost, the panel and the composer all read `geo.open`
   now — one number, so they cannot disagree. */

/* One duration for the whole open, and everything that moves during it reads
   from here.

   It was 540 for the panel against 650 for the composer around it, on
   different curves — and two halves of one surface arriving 110ms apart is
   exactly the seam you see: the window settles, then the pill under it is
   still finishing. Shared, the join holds, and a single number is the only
   thing to change when it wants to be quicker again. */
const PANEL_MS = 280;
/* A decelerating curve, not a symmetric one.

   0.25,0.1,0.25,1 eases at both ends, which means the panel starts slowly —
   and a window that hesitates before moving reads as lag rather than as
   easing, however short it is. This one leaves immediately and spends its
   whole budget settling: most of the distance is covered in the first third,
   and the last few pixels arrive gently, which is what "smooth" is describing
   when someone says a panel opens smoothly. */
const PANEL_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

/* How big the chat orbs render. This is the number that decides whether the
   dense preset is legible at all.

   The 64 preset is drawn for 64. Shown at 27 that's a 0.42 scale, which puts
   a single dot under one pixel — and a sub-pixel dot doesn't get smaller, it
   gets averaged with the transparent space around it and comes out as grey
   haze. Which is exactly what it looked like. The dense design is the one
   wanted, so the size has to be kept high enough to carry it: at 40 the scale
   is 0.63 and the dots keep enough pixels to stay dots.

   That's the floor to be careful of, not a preference. Going much below this
   walks back towards the haze — if it ever needs to be small, switch to the
   20 preset in the same edit rather than scaling this one further down. */
const ORB_PX = 40;
/* The merged variant uses the 20px preset at 24px — a 1.2x lift rather than
   the 0.63x reduction the 64 preset needs, so the dots stay whole pixels
   either way. Small because it now sits beside a line of narration and above
   a chip, not alone in a panel. */
const ORB_PX_UNIFIED = 36;

/* The sparkle's box, kept separate from the orb's rather than derived from
   it. They are different drawings — one is a sphere of dots that falls away
   at its edges, the other a filled flare with a bloom around it — so matching
   their numbers would be matching the wrong thing. What has to agree is how
   heavy they look next to the label, and the flare gets there smaller: its
   glow reads as part of the mark, so the drawn star can be well under the
   orb's 36 and still hold the same weight in the row. */
const SPARKLE_PX = 28;

/* Stamped when the message is made, formatted when it's drawn — the message
   carries the moment, not a pre-rendered string, so a thread left open across
   the hour can't go stale.

   Pinned to en-US rather than the visitor's locale, because the format asked
   for is 7:42 PM and the default would render 19:42 on any 24-hour machine —
   this one included, which is what the earlier screenshot showed. That's a
   deliberate trade: it now reads the same everywhere, and no longer matches
   what a non-US visitor's own clock looks like. Drop the locale argument to
   go back to following the browser. */
export const formatTime = (at: number) =>
  new Date(at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

/* One button for the whole toolbar. Small enough to inline, but repeating six
   sets of these classes is how the row ends up with one icon a pixel off. */
function GlassAction({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      onClick={onClick}
      className={`flex size-6 items-center justify-center rounded-full transition-colors hover:bg-[var(--fill)] hover:text-[var(--ink)] ${
        active ? "text-[var(--ink)]" : "text-inherit"
      }`}
    >
      {children}
    </button>
  );
}

/* At rest the chip is only as wide as it needs to be to read as an invitation
   — narrow enough that it sits on the page rather than spanning it, and the
   click that focuses it is what earns the full width.

   340 is close to the floor. The two discs and their insets take 114px of
   this, leaving about 226px of field, and the longest rotating question
   ("How fast can we go live?") measures near 190 at 16px light. Going much
   below this starts clipping the placeholder mid-word, which is the one thing
   the resting state exists to show. */
const WIDTH_SHUT = 340;

/* Where the merged surface stops being a window on a page and becomes the
   page.

   640 rather than a device: it's the width at which a 620px panel can no
   longer sit inside the viewport with margins either side, which is the fact
   that actually matters. Below it there is no room for the messenger to be a
   thing floating over a site, so it stops pretending — full bleed, square
   corners, the whole height.

   Read in JS rather than expressed as a Tailwind breakpoint because the
   sizes it changes are inline: the panel's height and the composer's width
   are numbers computed and set as styles, and a media query can't reach
   them. */
const PHONE_MAX_PX = 640;

/* A media query as state.

   Matched in an effect rather than at render, and false until it runs: the
   server has no viewport, so any answer given during SSR is a guess, and a
   guess that disagrees with the client is a hydration mismatch. Starting at
   the desktop layout and correcting on mount means the wrong frame at worst,
   where the alternative is React discarding the tree.

   Subscribed rather than read once — a phone rotating is a real resize, and
   so is a desktop window being dragged narrow, which is how anyone reviewing
   this will actually look at it. */
function useMedia(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const on = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return matches;
}

/* Geometry per placement, because the two placements want different shapes.

   Centred, the launcher is the page's invitation: wide and short, sitting
   across the middle where a squat panel reads as a banner rather than a
   window.

   In a corner it's a messenger, and a messenger is tall and narrow — it has
   an edge to hang from, so height costs nothing, where width would push it
   across content it's meant to sit beside.

   The composer's open width matches the panel in both, since the two are
   stacked 8px apart and any step between them reads as a misalignment. `shut`
   is shared: the resting chip has the same job everywhere, and its floor is
   set by the placeholder rather than by the layout. */
/* Where the launcher comes in from on first load — off the edge it's anchored
   to, so it reads as arriving from outside the page rather than fading up in
   place. 100% of its own width plus the inset clears the viewport entirely,
   so nothing is visible before it starts.

   The centred one rises instead. It has no side edge to come from, and
   sliding it in horizontally would mean crossing the whole page to reach the
   middle. */
const ENTER_FROM: Record<Align, string> = {
  center: "translateY(calc(100% + 32px))",
  left: "translateX(calc(-100% - 32px))",
  right: "translateX(calc(100% + 32px))",
};
/* Long enough to be a move rather than a jump, and held back until the page
   behind it has settled — a launcher that arrives with everything else is
   just more content loading. */
const ENTER_MS = 620;
const ENTER_DELAY_MS = 500;

/* Palette, as CSS custom properties rather than props threaded through every
   element. The alternative was a theme object read at each call site, which
   turns every coloured class into a template string — and Tailwind has to be
   able to read arbitrary values statically. `text-[var(--ink)]` is a constant
   string whose *value* varies, which is what makes this work.

   The tints are named by role, not by lightness: --ink-faint means the same
   thing in both themes (a label you aren't meant to read first) even though
   one resolves to a translucent white and the other to a warm grey. */
type Theme = "glass" | "beige" | "neutral" | "white";
type Swatch =
  | "pane" | "paneSoft" | "paneFilter" | "ring"
  | "ink" | "inkSoft" | "inkMute" | "inkFaint" | "note"
  | "fill" | "fillHover" | "bubble" | "disc" | "discHover" | "divider"
  | "orbChat" | "orbLauncher" | "shimmer";

const THEME: Record<Theme, Record<Swatch, string>> = {
  glass: {
    pane: "linear-gradient(to bottom, rgba(58,58,62,0.58), rgba(58,58,62,0.50))",
    /* Identical to the panel. It was thinner — 0.4/0.3 against 0.58/0.50 — on
       the argument that the panel is a surface text is read off while the
       composer is only a control strip a line passes through.

       That reasoning holds when the two are apart, and stops holding here:
       they sit 8px from each other, so the difference doesn't read as one
       being lighter, it reads as two panes that were meant to match and
       don't. Whatever separation they need comes from the gap and the
       hairline, not from a change of fill. */
    paneSoft: "linear-gradient(to bottom, rgba(58,58,62,0.58), rgba(58,58,62,0.50))",
    /* Frostier: 44 → 56 blur, brightness 1.08 → 1.18, saturate 70 → 58.
       Each does a different half of it.

       Blur is diffusion — how far the backdrop is spread. On its own it gives
       a smooth, wet-looking pane, the way water on glass looks.

       brightness is the frost proper. Etched glass scatters light rather than
       only spreading it, which lifts the dark end of whatever is behind it,
       so shadows go milky instead of staying black. This is the value doing
       most of the work, and the one to reach for first next time.

       saturate coming down helps too, and is easy to miss: real frost mutes
       colour as it scatters it. Leaving it high keeps the page's hues intact
       behind the pane, which reads as tinted glass rather than frosted. */
    paneFilter: "blur(56px) saturate(58%) brightness(1.18)",
    ring: "inset 0 0 0 1px rgba(255,255,255,0.2)",
    divider: "rgba(255,255,255,0.12)",
    ink: "rgba(255,255,255,1)",
    inkSoft: "rgba(255,255,255,0.9)",
    inkMute: "rgba(255,255,255,0.6)",
    inkFaint: "rgba(255,255,255,0.45)",
    /* The disclaimer, and nothing else. It kept being asked to go lighter
       while --ink-mute — which it borrowed — also drives the conversation
       previews and the header's icons at rest, and those have no reason to
       fade with it. Two things wanting different values out of one swatch is
       the point at which the swatch should split. */
    note: "rgba(255,255,255,0.55)",
    fill: "rgba(255,255,255,0.16)",
    fillHover: "rgba(255,255,255,0.25)",
    /* Split from `fill` because the two stopped agreeing. On glass they're
       the same value — the user's bubble and a starter chip are both "a
       lighter patch of the pane" — but beige wants them different, and one
       swatch doing two jobs is how a theme quietly loses a distinction. */
    bubble: "rgba(255,255,255,0.16)",
    disc: "rgba(255,255,255,0.22)",
    discHover: "rgba(255,255,255,0.3)",
    orbChat: "url(#orb-chat)",
    orbLauncher: "url(#orb-launcher)",
    shimmer:
      "linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.5) 40%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.5) 60%, rgba(255,255,255,0.5) 100%)",
  },
  /* Near-black, and deliberately achromatic: 22,22,24 is a hair cool but
     carries effectively no hue, so there is nothing in it to argue with a
     tenant's brand colour. Every tinted surface picks a side; this one
     doesn't have to.

     Dark because dark reads as *interface*. Tooltips, toasts, command
     palettes and video controls are all near-black, so the value already
     means "chrome, not content" before anyone thinks about it — which is
     exactly what a launcher wants to be on someone else's page.

     0.92 rather than the glass theme's 0.5: opaque enough that white text
     holds over photography, with just enough left for the blur to stop it
     reading as a black rectangle pasted on.

     The 8% inner hairline is load-bearing. On a light page the fill defines
     the shape by itself; on a dark one it vanishes into the background, and
     that edge is the only thing keeping the panel legible at both extremes.
     It's the single line that makes this work anywhere. */
  neutral: {
    pane: "rgba(22,22,24,0.92)",
    /* The composer sits a touch lighter, the same relationship the glass
       theme uses — a control strip rather than a reading surface. */
    paneSoft: "rgba(28,28,31,0.9)",
    paneFilter: "blur(20px) saturate(110%)",
    ring: "inset 0 0 0 1px rgba(255,255,255,0.08)",
    divider: "rgba(255,255,255,0.08)",
    ink: "rgba(255,255,255,1)",
    inkSoft: "rgba(255,255,255,0.88)",
    inkMute: "rgba(255,255,255,0.62)",
    inkFaint: "rgba(255,255,255,0.42)",
    note: "rgba(255,255,255,0.52)",
    fill: "rgba(255,255,255,0.1)",
    fillHover: "rgba(255,255,255,0.16)",
    bubble: "rgba(255,255,255,0.12)",
    disc: "rgba(255,255,255,0.14)",
    discHover: "rgba(255,255,255,0.22)",
    orbChat: "url(#orb-chat)",
    orbLauncher: "url(#orb-launcher)",
    shimmer:
      "linear-gradient(90deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.45) 40%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.45) 60%, rgba(255,255,255,0.45) 100%)",
  },
  /* Plain white, and the opposite bet to the neutral. Where that one goes
     dark so a light page can't wash it out, this goes light so it reads as
     paper the site has handed you — which is what most messengers do, and
     what visitors have been trained by Intercom and Zendesk to expect.

     Solid #FFFFFF, and no backdrop-filter at all — the one theme with no
     glass in it anywhere. It was 94% with a blur, which is what caused the
     chips to vanish over dark sections of the page: at 94% the remaining 6%
     is enough to shift the pane's rendered colour, so anything sitting on it
     changed contrast with the background. Opaque, the surface is the same
     colour on every page, and everything on it can be reasoned about once.

     Blurring behind an opaque surface is work the compositor does that
     nobody can see, so the filter goes with it.

     A real shadow instead of the inset ring the others use. This is the one
     theme where a hairline does nothing — a pale edge on a pale pane is
     invisible — so separation comes from the panel casting rather than being
     outlined. It's also why this version is the most fragile on a dark site:
     a white slab glares where a dark one recedes. */
  white: {
    pane: "#FFFFFF",
    paneSoft: "#FFFFFF",
    paneFilter: "none",
    /* Four layers, tuned to survive a host page rather than a demo backdrop:
       a contact shadow for the crisp near edge, a mid shadow for body, a
       wide ambient one that still reads over photography and colour bands,
       and an inset hairline so the edge holds even where the page behind is
       the same white as the pane. One diffuse layer looked fine on white and
       vanished on the first busy hero it floated over. */
    ring: "inset 0 0 0 1px rgba(15,17,26,0.06), 0 1px 2px rgba(15,17,26,0.10), 0 6px 16px rgba(15,17,26,0.12), 0 16px 40px rgba(15,17,26,0.18), 0 32px 80px rgba(15,17,26,0.12)",
    divider: "rgba(15,17,26,0.09)",
    ink: "#16181D",
    inkSoft: "#2B2F36",
    inkMute: "#6B7280",
    inkFaint: "#9CA3AF",
    note: "#A8AEB8",
    /* Still alpha rather than fixed hex, even though the pane is opaque now
       and either would render identically. Kept because it's the honest
       description: these are "a step darker than the surface", not a
       particular grey, and if the pane is ever tinted or made translucent
       again they follow it instead of quietly drifting out of contrast the
       way #F1F2F4 did. */
    fill: "rgba(15,17,26,0.055)",
    fillHover: "rgba(15,17,26,0.1)",
    bubble: "rgba(15,17,26,0.055)",
    disc: "rgba(15,17,26,0.055)",
    discHover: "rgba(15,17,26,0.11)",
    orbChat: "url(#orb-chat-lit)",
    orbLauncher: "url(#orb-launcher-lit)",
    shimmer:
      "linear-gradient(90deg, rgba(107,114,128,0.5) 0%, rgba(107,114,128,0.5) 40%, #16181D 50%, rgba(107,114,128,0.5) 60%, rgba(107,114,128,0.5) 100%)",
  },
  /* The warm surface the rest of the project uses — #FEFCF8 over #F9F3EA, the
     same pair as ChatbotShell — kept translucent so it stays glass, just glass
     held against a light wall rather than a dark one.

     Less blur and no brightness lift. Those exist on the dark theme to stop
     the backdrop reading as a hole in the page; a pale pane has the opposite
     problem and they would only wash it out. saturate near 100 so the page's
     own colour doesn't tint the beige. */
  beige: {
    /* Solid, not glass. A flat #FDFAF5 with no blur behind it — which makes
       this the one theme that isn't glassmorphism at all, and the panel stops
       depending on what's behind it to look right. Both panes take the same
       fill: the panel/composer distinction on the dark theme is carried by
       opacity, and with nothing translucent there's nothing to vary. */
    pane: "#FDFAF5",
    paneSoft: "#FDFAF5",
    /* No backdrop-filter at all. Blurring behind an opaque surface is work
       the compositor does and nobody sees. */
    paneFilter: "none",
    /* The hairline warms with everything else. A neutral black edge on a warm
       pane is the detail that makes a beige theme look like a grey one someone
       tinted — the outline gives it away before the fills do. */
    ring: "inset 0 0 0 1px rgba(140,106,42,0.13)",
    divider: "rgba(140,106,42,0.15)",
    ink: "#2C261C",
    inkSoft: "#3E362A",
    /* Back to a true mid-tone. This had been lightened three times chasing
       the disclaimer and had drifted past --ink-faint, which left previews
       and timestamps in the wrong order. The disclaimer has its own swatch
       now and this one can go back to meaning what it says. */
    inkMute: "#7D7264",
    inkFaint: "#A2947C",
    /* Lighter than --ink-faint, which is the whole reason it exists. A warm
       pale surface has far less range below its ink than a dark one has
       above it, so a tint that reads as quiet on glass lands close to body
       text on paper and has to travel further to sit in the same place. */
    note: "#BCB2A5",
    /* Sand rather than the near-neutral cream this was. #F7F3EC sat about 6
       points off the pane and had almost no hue in it, so the chips and discs
       read as slightly dirty white — the theme was called beige but the only
       thing actually warm was the paper.

       #EFE7DA is beige proper. The previous #F4E8CC went too far the other
       way — at ~45° with a 40-point spread between its red and blue channels
       it read as yellow, and a chip that yellow stops being a surface and
       starts being a highlight.

       This keeps the same hue but roughly halves the saturation: a 21-point
       channel spread instead of 40. That's the line between beige and wheat —
       beige is a warm grey, wheat is a pale yellow, and the difference is
       almost entirely how far blue sits below red rather than which hue you
       picked. Still ~10 points off the pane, so the chips stay findable.

       Starters, discs, bubble and the conversation-list rows all share it, so
       everything the visitor puts words into or takes words from sits on one
       surface. The only things carrying their own colour are the agent's —
       its text and its orb. */
    fill: "#EFE7DA",
    fillHover: "#E7DDCA",
    bubble: "#EFE7DA",
    /* The composer's discs take the bubble's fill rather than a warmer one of
       their own. Both are "the visitor's surface" — the thing they type into
       and the thing they said — so giving them one value ties the two ends of
       the interaction together, and stops the buttons reading as a separate
       component sitting inside the composer.

       Only 6 points off the #FDFAF5 pane, which is deliberate but is the
       thing to watch: at this contrast the discs are shapes you find rather
       than shapes you see. The hover is a firmer step down so the button
       confirms itself under the pointer. */
    disc: "#EFE7DA",
    discHover: "#E7DDCA",
    orbChat: "url(#orb-chat-ink)",
    orbLauncher: "url(#orb-launcher-ink)",
    shimmer:
      "linear-gradient(90deg, rgba(120,114,106,0.5) 0%, rgba(120,114,106,0.5) 40%, #2E2A26 50%, rgba(120,114,106,0.5) 60%, rgba(120,114,106,0.5) 100%)",
  },
};

const GEOMETRY: Record<Align, { open: number; chatW: number; chatH: number }> = {
  center: { open: 600, chatW: 600, chatH: 550 },
  left: { open: 400, chatW: 400, chatH: 640 },
  right: { open: 400, chatW: 400, chatH: 640 },
};
/* No sound. There were two cues here (cuelume, synthesized via Web Audio) —
   a tick on send and a chime on the reply, the two halves of an exchange —
   and before those, four about furniture moving. They are all gone.

   The argument for the last two was that a reply can land while you are
   looking somewhere else, which is true and still doesn't earn it: this is a
   widget on someone else's site, and a page that makes noise is a page the
   visitor didn't agree to make noise. The right place for that decision is
   the host's, not a component's default. */

/* Where the launcher sits along the bottom edge.

   A prop rather than a second copy of the component: the variants differ by
   one axis of alignment and nothing else, and forking 1,400 lines to move a
   flex value would guarantee they drift the first time either is touched. */
type Align = "center" | "left" | "right";
const ALIGN: Record<Align, string> = {
  /* px-4 on the centred one is only a small-screen guard — it never touches
     the panel otherwise. The two edge variants need a real inset, or the
     glass sits flush against the viewport with nothing to read it against.

     The bottom inset is per-placement too, and the two don't match. Centred
     keeps the original 24/32px, where the launcher reads as part of the page
     it sits under. The corner placements sit lower at 8/12px, closer to the
     edge they hang from — a widget tucked into a corner wants to look
     attached to it, where the same gap under a centred bar just looks like
     the bar floating. */
  center: "justify-center px-4 pb-6 sm:pb-8",
  left: "justify-start pl-6 pr-4 pb-6 sm:pl-6 sm:pb-8",
  right: "justify-end pl-4 pr-6 pb-6 sm:pr-6 sm:pb-8",
};

/* The TARS pack — the fixtures above, gathered. The constants stay exported
   individually because the button launcher imports several of them; this is
   the same data with a handle, not a second copy. No greeting: the cold
   launcher's own argument (see the send path) holds for the default. */
export const TARS_CONTENT: ComposerContent = {
  agentName: "Tars",
  headerTitle: "Tars AI Agent",
  ariaPrompt: "Ask Tars anything",
  questions: QUESTIONS,
  starters: STARTERS,
  replies: REPLIES,
  followUps: FOLLOW_UPS,
  followUpFallback: FOLLOW_UP_FALLBACK,
  replyFallback: REPLY_FALLBACK,
  reasoningTrace: REASONING_TRACE,
  reasoningSteps: REASONING_STEPS,
  sources: SOURCES,
  conversations: CONVERSATIONS,
};

/* A context rather than a prop thread, because the consumers are deep and
   some are exported on their own (RichText renders citations wherever the
   button launcher mounts it). The default means a component rendered outside
   any provider — which is every existing route — behaves exactly as before. */
const ContentContext = createContext<ComposerContent>(TARS_CONTENT);

/* The accent, as numbers the SVG filters can eat.

   CSS variables cover every colour in the component except the orb: its tint
   is written into feColorMatrix/feComponentTransfer values, which are 0–1
   floats in an attribute string — no var() reaches them. So the ramps are
   derived from the accent at render: the mid stop is the accent itself, the
   far stop is the accent washed toward white (distance pales, the same aerial
   perspective the hand-tuned tables encoded), the near stop toward black.
   The mix fractions were fitted against the TARS tables, so the default
   accent reproduces them to within a couple of hundredths per channel. */
const hexRgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3 ? h.split("").map((c) => c + c).join("") : h,
    16,
  );
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255) as [
    number,
    number,
    number,
  ];
};
const mix = (c: number, to: number, t: number) => c + (to - c) * t;
const f3 = (n: number) => n.toFixed(3);
/* The flat ink matrix: every dot painted the accent, alpha scaled. */
const inkMatrix = ([r, g, b]: [number, number, number]) =>
  `0 0 0 0 ${f3(r)}
   0 0 0 0 ${f3(g)}
   0 0 0 0 ${f3(b)}
   0 0 0 1.6 0`;
/* The sparkle's two outer stops, derived from the accent.

   The flare is four stops — a light tip, the accent's lighter companion, the
   accent, a deep tip — and the two tips used to be a fixed sky blue and a
   fixed fuchsia. Those were chosen against TARS purple, where they read as
   the cool and warm edges of one violet light. On any other accent they read
   as two foreign colours stuck on the ends of the arms: Brightline's
   marigold came out blue at one tip and pink at the other, which is a
   Christmas light, not a sunburst.

   So the tips are the accent's own neighbours instead. A flame is one hue
   spread over a small arc — hotter and paler at the core, deeper and redder
   at the edge — so the tips sit a short arc either side of the accent's hue
   (+18 pale, -26 deep), one lifted most of the way to white, one taken down
   a step. The pale side travels less: a light tint shows its hue far more
   than a dark one does, so the same rotation that reads as "lit" on the deep
   tip reads as a different colour on the pale one. Analogous rather
   than complementary on purpose: 26 degrees is enough to make the mark look
   lit rather than flat, and not enough to read as a second colour.

   HSL rather than color-mix: rotating a hue is the one thing CSS mixing
   can't do, and mixing toward white alone gives a pale version of the same
   flat colour — which is the smudge this is trying not to be. */
const hexHsl = (hex: string): [number, number, number] => {
  const [r, g, b] = hexRgb(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const l = (max + min) / 2;
  const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [(h + 360) % 360, sat * 100, l * 100];
};
const sparkTips = (hex: string) => {
  const [h, s, l] = hexHsl(hex);
  /* Floored: a near-grey accent still has to give the flare something to be
     made of, or the sparkle turns into a smudge of the page. */
  const sat = Math.min(96, Math.max(58, s));
  return {
    cool: `hsl(${(h + 18) % 360} ${sat}% ${Math.min(86, l + 30)}%)`,
    warm: `hsl(${(h + 334) % 360} ${Math.min(92, sat)}% ${Math.max(38, l - 6)}%)`,
  };
};

/* The three-stop depth ramp for the white theme's orbs. `deep` nudges the
   whole ramp down a step — the launcher's copy sits alone on a wide white
   field and wants the extra contrast. */
const litRamp = ([r, g, b]: [number, number, number], deep: boolean) => {
  const wash = deep ? 0.5 : 0.52;
  const sink = deep ? 0.52 : 0.43;
  return {
    r: `${f3(mix(r, 1, wash))} ${f3(deep ? mix(r, 0, 0.06) : r)} ${f3(mix(r, 0, sink))}`,
    g: `${f3(mix(g, 1, wash) * 0.93)} ${f3(deep ? mix(g, 0, 0.16) : g)} ${f3(mix(g, 0, sink))}`,
    b: `${f3(mix(b, 1, wash))} ${f3(deep ? mix(b, 0, 0.04) : b)} ${f3(mix(b, 0, sink))}`,
  };
};

export function GlassComposer({
  align = "center",
  theme = "glass",
  orb = true,
  unified = false,
  startersOutside = false,
  accent = "#6D33AA",
  accentLite = "#8B5CF6",
  content = TARS_CONTENT,
  unifiedHeight,
}: {
  align?: Align;
  theme?: Theme;
  orb?: boolean;
  unified?: boolean;
  /* Starters as free-standing pills above the launcher instead of a row
     inside it. See the row itself for what the swap costs and buys. */
  startersOutside?: boolean;
  /* The tenant's brand colour and its lighter companion (ring gradients, the
     sparkle's lit edge). Everything tinted derives from these two. */
  accent?: string;
  accentLite?: string;
  content?: ComposerContent;
  /* Per-placement override of the merged surface's height — a tenant whose
     site wants a shorter window than the default table without changing what
     every other tenant gets. Partial on purpose: pass the one placement you
     mean and the rest keep UNIFIED_HEIGHT's numbers. */
  unifiedHeight?: Partial<Record<Align, number>>;
} = {}) {
  /* Where it sits, as state rather than the prop alone.

     `align` is still the host's decision and still the answer on first
     paint; this only exists so the header menu can move the widget while
     someone is looking at it. A demo of placement that needs the page
     rebuilt between options is not a demo of placement — the point is
     watching the thing travel.

     null means "nobody has touched it", so a host that changes its own prop
     mid-session is still obeyed. Once the menu has been used it wins, which
     is the right way round: the visitor's last instruction outranks the
     page's default. */
  const [moved, setMoved] = useState<Align | null>(null);
  const spot = moved ?? align;
  const geo = GEOMETRY[spot];
  /* The merged surface's height for the placement in play — the tenant's
     number if it named one, otherwise the table's. */
  const surfaceH = unifiedHeight?.[spot] ?? UNIFIED_HEIGHT[spot];
  /* How wide the caveat line may run before it truncates.

     Centred, the surface is 600 and the line has room to say what it needs to
     — a medical disclaimer naming who to ask instead is worth reading in full,
     and cutting it at 320 in a 600px pane leaves half the width empty beside a
     sentence ending in an ellipsis. In a corner the surface is 400, so 320 is
     already most of it, and the rest of the line stays on the hover. */
  const noticeW = spot === "center" ? 500 : 320;
  const t = THEME[theme];

  /* The merged surface is the only variant that reshapes for a phone. The
     others are a panel floating above a pill, which is a desktop idea to
     begin with — narrowing them would be inventing a second design rather
     than fitting this one to a smaller screen. */
  const phone = useMedia(`(max-width: ${PHONE_MAX_PX}px)`) && unified;
  /* Disc sizes. The flush composer's two differ — 50 for attach, 48 for send
     — because they were tuned against a 64px row where attach also had to
     hold the orb. The inset field has neither constraint, so both go to one
     number, and 44 keeps the field at 8 + 44 + 8 = 60 rather than the 66 a
     50px disc forced. */

  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [typed, setTyped] = useState("");
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  /* Which face of the panel is showing. Two views inside one pane rather than
     a second panel over the top: the header, the glass and the geometry all
     stay put, and only the body swaps — so going back reads as turning the
     thing round, not as another window arriving. */
  const [view, setView] = useState<"thread" | "history">("thread");

  /* The archive, as state rather than the constant it starts from.

     Renaming and deleting have to change something, and CONVERSATIONS is a
     module-level fixture shared by every instance on the page. Copied into
     state on mount, so edits are per-messenger and the fixture stays what it
     describes: a starting point, not the live list.

     The edits are session-local — there is no store behind any of this, so a
     reload brings the archive back. That is the same bargain the rest of the
     list already makes, where every row opens the same conversation. */
  const [rows, setRows] = useState(content.conversations);
  /* Which row's menu is open, and which row is being retitled. Two pieces of
     state rather than one, because the rename outlives the menu that starts
     it — the menu closes the moment the field appears. */
  const [rowMenu, setRowMenu] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const rowMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rowMenu) return;
    const away = (e: MouseEvent) => {
      if (!rowMenuRef.current?.contains(e.target as Node)) setRowMenu(null);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setRowMenu(null);
    };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [rowMenu]);

  /* A heading with nothing under it isn't a group, so the group goes with its
     last row. */
  const deleteRow = (id: string) =>
    setRows((prev) =>
      prev
        .map((section) => ({
          ...section,
          items: section.items.filter((c) => c.id !== id),
        }))
        .filter((section) => section.items.length > 0),
    );

  /* An empty title leaves a row with nothing to identify it by, so a blank
     draft is a cancel rather than a rename. */
  const commitRename = (id: string) => {
    const next = draft.trim();
    if (next)
      setRows((prev) =>
        prev.map((section) => ({
          ...section,
          items: section.items.map((c) =>
            c.id === id ? { ...c, title: next } : c,
          ),
        })),
      );
    setRenaming(null);
  };
  /* False for exactly one paint, so the browser has a start position to
     transition from. Setting it in an effect isn't enough on its own — React
     can batch the state change into the same frame as the mount, and a
     transition between two values committed in one frame doesn't run. Two
     nested rAFs guarantee the first style is painted before the second is
     applied. */
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setEntered(true);
      return;
    }
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setEntered(true));
    });
    /* The launcher arrives silently.

       It used to cue here, and it was the worst-placed sound in the
       component: nobody asked for the widget to appear, so the one moment the
       visitor has not initiated anything is the one moment a noise is
       unwelcome. It also couldn't play honestly — audio is refused until the
       page has been clicked, so it had to lie in wait for the first gesture
       and fire then, which meant a chime attached to some unrelated click
       several seconds after the thing it was announcing. */
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, []);
  /* Keyed by message id rather than held on the message itself: a rating and
     a copy are things done *to* a turn, not part of what was said, and
     keeping them out of the transcript means the message objects stay a
     record of the conversation. */
  /* Which reply is still arriving, and how much of it has. Held as a word
     count rather than a substring so the source text stays the single copy
     of what was said. */
  const [streaming, setStreaming] = useState<{ id: number; words: number } | null>(
    null,
  );

  /* Form-node state, keyed by the message that shipped the form. Values and
     done-ness live outside the message for the same reason ratings do — they
     are things done *to* a turn — and keying by id means two forms in one
     thread can't share a draft. */
  const [formValues, setFormValues] = useState<
    Record<number, Record<string, string>>
  >({});
  const [formDone, setFormDone] = useState<Record<number, boolean>>({});
  /* Which node button a turn's set was answered with. Once one is chosen the
     whole set fades and locks — the choice was made, and the chosen pill
     keeps its hover dress as the record of which one. */
  const [chosenButtons, setChosenButtons] = useState<Record<number, string>>(
    {},
  );

  /* The close flow, as footer states: the composer gives way to a
     confirmation, then the rating, then the closed card. Null is the
     ordinary conversation. closeSrc remembers which button set started it,
     so a "No" can hand that set back. */
  const [closeFlow, setCloseFlow] = useState<
    null | "confirm" | "csat" | "done"
  >(null);
  const closeSrc = useRef<number | null>(null);
  const [csatRating, setCsatRating] = useState(0);
  const [csatText, setCsatText] = useState("");
  const CSAT_EMOJI = ["😞", "😐", "🙂", "😊", "😍"];
  const CSAT_LABELS = ["Terrible", "Bad", "Okay", "Good", "Amazing"];
  /* A fresh conversation from the closed card: every per-thread record goes
     with the thread it recorded. */
  const restartChat = () => {
    setCloseFlow(null);
    closeSrc.current = null;
    setCsatRating(0);
    setCsatText("");
    setChosenButtons({});
    setFormValues({});
    setFormDone({});
    setMessages(greetingMessages());
  };
  const submitNodeForm = (m: Message) => {
    const form = m.form;
    if (!form || formDone[m.id]) return;
    const values = formValues[m.id] ?? {};
    if (form.fields.some((f) => !(values[f.key] ?? "").trim())) return;
    setFormDone((prev) => ({ ...prev, [m.id]: true }));
    /* Submission is a turn: what was entered goes into the transcript as the
       user's own bubble — the record of what was actually sent — then the
       agent acknowledges, then the workflow moves to its next node. The
       card keeps its values too (disabled, not cleared), so the form and
       the transcript agree. */
    const summary = form.fields
      .map((f) => (values[f.key] ?? "").trim())
      .filter(Boolean)
      .join("\n");
    const userId = nextId.current++;
    setMessages((prev) => [
      ...prev,
      { id: userId, from: "user", text: summary, at: Date.now() },
    ]);
    /* The acknowledgement is a reply like any other: it thinks, it streams,
       it carries the footer. A message that just materialises reads as the
       machine skipping its own ritual. Same shape as the send() tail. */
    const text = form.reply.replace(/\{(\w+)\}/g, (_, k) => values[k] ?? "");
    window.clearTimeout(replyTimer.current);
    setThinking(true);
    const replyId = nextId.current++;
    if (unified) {
      setMessages((prev) => [
        ...prev,
        {
          id: replyId,
          from: "agent",
          text: "",
          steps: content.reasoningTrace,
          pending: true,
          at: Date.now(),
        },
      ]);
    }
    const waited = thinkFor(summary);
    replyTimer.current = window.setTimeout(() => {
      setThinking(false);
      setStreaming({ id: replyId, words: 0 });
      const filled = {
        text,
        buttons: form.replyButtons,
        steps: content.reasoningTrace,
        thoughtMs: waited,
        pending: false,
        at: Date.now(),
      };
      setMessages((prev) =>
        unified
          ? prev.map((msg) => (msg.id === replyId ? { ...msg, ...filled } : msg))
          : [...prev, { id: replyId, from: "agent" as const, ...filled }],
      );
    }, waited);
  };
  const [rated, setRated] = useState<Record<number, "up" | "down">>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);
  /* Which traces are open, keyed by message. A set rather than a single id:
     two replies can both be worth checking, and closing one to read another
     would make comparing them impossible. */
  const [openTrace, setOpenTrace] = useState<Record<number, boolean>>({});
  const [openSources, setOpenSources] = useState<Record<number, boolean>>({});
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const copiedTimer = useRef<number | undefined>(undefined);

  /* The panel opening is silent now. It was the last of the four furniture
     sounds, and it fires on the same gesture as the send — so with a cue on
     the message going out, the first question of every conversation made two
     noises a fraction apart. */

  /* Walks the narration while the agent works. Stops on the last line rather
     than looping: a list that cycles says the work is going in circles, and
     the last step ("Writing the answer") is the one that should still be on
     screen when the reply arrives. */
  useEffect(() => {
    if (!thinking) {
      setStepIdx(0);
      return;
    }
    const id = window.setInterval(
      () => setStepIdx((i) => Math.min(i + 1, content.reasoningSteps.length - 1)),
      850,
    );
    return () => window.clearInterval(id);
  }, [thinking]);

  /* Advances the stream one word per tick. Driven off state rather than a
     single long-lived interval, so it can't outlive the message it belongs
     to — if the reply is dropped by a retry or a leave, the next pass finds
     nothing to stream and stops itself. */
  useEffect(() => {
    if (!streaming) return;
    const message = messages.find((m) => m.id === streaming.id);
    if (!message) {
      setStreaming(null);
      return;
    }
    if (streaming.words >= message.text.split(" ").length) {
      setStreaming(null);
      return;
    }
    const t = window.setTimeout(
      () => setStreaming((s) => s && { ...s, words: s.words + 1 }),
      STREAM_MS_PER_WORD,
    );
    return () => window.clearTimeout(t);
  }, [streaming, messages]);

  /* Speech outlives React — an utterance keeps talking after the component
     that started it is gone, so it has to be cancelled on the way out. */
  useEffect(() => {
    return () => {
      window.clearTimeout(copiedTimer.current);
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  const speak = (m: Message) => {
    if (!("speechSynthesis" in window)) return;
    /* Always cancel first: pressing play on a second message while the first
       is mid-sentence should replace it, not read both at once. */
    window.speechSynthesis.cancel();
    if (speakingId === m.id) {
      setSpeakingId(null);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(plain(m.text));
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(m.id);
    window.speechSynthesis.speak(utterance);
  };

  /* Dictation, on the browser's own recogniser.

     Web Speech is a browser feature rather than a service call — Chrome and
     Safari ship one, Firefox doesn't, and there is nothing here to fall back
     to. So the control is feature-detected and simply absent where it can't
     work: a mic that opens nothing is worse than no mic, because the visitor
     spends a click and a permission prompt finding that out.

     Detected in an effect rather than at render, because the answer only
     exists in the browser and rendering it differently on the server is the
     hydration mismatch this component would notice first. */
  const [listening, setListening] = useState(false);
  /* Separate from `listening` because they start at different moments: the
     controls swap the instant the button is pressed, and the meter only opens
     its own capture once the recogniser has the microphone. */
  const [metering, setMetering] = useState(false);
  const [canDictate, setCanDictate] = useState(false);
  const recogniser = useRef<Recogniser | null>(null);
  /* What was already in the field when the mic was pressed. Every result
     event replays the whole utterance from the start, so the field is rebuilt
     from this each time rather than appended to — appending would stutter the
     interim words in as the recogniser revised them. */
  const dictationBase = useRef("");

  useEffect(() => {
    setCanDictate(!!speechRecognition());
    /* The recogniser holds the microphone. Left running past unmount it keeps
       the browser's recording indicator lit on a page with no chat on it. */
    return () => recogniser.current?.abort();
  }, []);

  const dictate = () => {
    if (listening) {
      /* stop, not abort: it flushes what has been heard so far into a final
         result, so the last few words survive the button being pressed. */
      recogniser.current?.stop();
      return;
    }
    const Recognition = speechRecognition();
    if (!Recognition) return;

    const r = new Recognition();
    r.lang = navigator.language || "en-US";
    /* Continuous, because dictating a question is a sentence and the default
       stops at the first pause. Interim results so the words appear while
       they're being said — silence until the sentence ends reads as the mic
       not working. */
    r.continuous = true;
    r.interimResults = true;

    r.onresult = (e) => {
      let heard = "";
      for (let i = 0; i < e.results.length; i++) {
        heard += e.results[i][0].transcript;
      }
      const base = dictationBase.current;
      setValue(base && heard ? `${base} ${heard.trim()}` : base + heard);
    };
    /* The meter waits for this.

       Both the recogniser and the analyser want the microphone, and asking
       for it twice in the same tick is a race — on Chrome the loser is
       usually the recogniser, which then runs, reports no error, and hears
       nothing for as long as you talk at it. Letting recognition claim the
       device first and only then opening a second capture makes the order
       deterministic instead of whichever promise resolves first.

       onaudiostart rather than onstart: start means the request was accepted,
       audiostart means the microphone is actually feeding it. */
    r.onaudiostart = () => setMetering(true);
    /* onend fires for a stop, an error and a timeout alike, so the flags are
       cleared in one place rather than three that can disagree. */
    r.onend = () => {
      setListening(false);
      setMetering(false);
    };
    r.onerror = (e) => {
      /* Worth surfacing: the failures here are all things the visitor can
         act on — permission refused, no microphone, a language the service
         doesn't take — and they are otherwise completely silent. */
      console.warn("[dictation]", e?.error ?? "error");
      setListening(false);
      setMetering(false);
    };

    dictationBase.current = value.trim();
    recogniser.current = r;
    setListening(true);
    r.start();
    /* The field takes focus on the way in. The recogniser writes to it
       directly, but the platform's own dictation writes to whatever is
       focused — and a caret already sitting in the composer is also what
       makes the transcript editable the moment it stops.

       Not on a phone: there the keyboard comes up with the focus and covers
       the wave and the two buttons you need to end the recording with. The
       recogniser writes to the field either way. */
    if (!phone) inputRef.current?.focus();
  };

  /* Throw the utterance away and put the field back as it was.

     abort() rather than stop(): stop flushes what it has heard into a final
     result, which is exactly what cancel means not to do. The field is
     restored from the same base the live transcript was being built on, so
     cancelling out of a dictation you started mid-draft gives the draft
     back. */
  const cancelDictation = () => {
    recogniser.current?.abort();
    setListening(false);
    setMetering(false);
    setValue(dictationBase.current);
  };

  /* The header menu, and the two settings behind it.

     `autoRead` starts off. A messenger that speaks the moment it answers
     takes over the room it was embedded in — the visitor is on someone's
     homepage, probably not alone, and sound is the one thing a widget can do
     that they can't undo before it has happened. It's offered rather than
     assumed, and the menu item is where it's offered.

     The label always names the action rather than the state — "Turn on
     auto-read" here, "Turn off" once it is on. A checkbox would make you work
     out which way the tick points. */
  const [menuOpen, setMenuOpen] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  const menuRef = useRef<HTMLSpanElement>(null);

  /* A menu that only closes by its own items is a menu you can get stuck
     under. Pointer-down rather than click, so it closes on the press that
     starts an interaction somewhere else rather than on its release. */
  useEffect(() => {
    if (!menuOpen) return;
    const away = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [menuOpen]);

  const autoReadFor = useRef<number | null>(null);

  /* Closing runs the opening in reverse, which means running it in two steps
     rather than one.

     Opening is already sequential and nobody notices, because the two halves
     happen minutes apart: the composer widens when you go to write, and the
     panel unfolds out of it when you send. Closing fired both at once — the
     panel collapsing over 540ms while the composer narrowed over 650 — so the
     window and the pill it came from were moving at the same time on
     different clocks, and the whole thing came apart instead of folding away.

     So: the panel goes first, and the composer reverts once there is nothing
     above it. `open` is the hover flag now, not the scroll flag it used to
     be — clearing it is what returns the wide field with its
     starter chips to the resting pill, and holding that back until the panel
     has gone is what makes the close read as the open played backwards.

     `closingNow` is what stops the launcher rebuilding itself on the way out.
     Every one of the resting state's parts is keyed off "panel shut" — the
     starter chips, the orb in place of attach, the wide field — so the frame
     `chatOpen` goes false, all of them try to arrive, in front of a panel
     that is still on screen collapsing behind them. Closing something should
     not be the cue for four things to appear. While it is set, the composer
     holds exactly the shape it had, and the only thing moving is the window
     going down. */
  /* The starters leave without animating, but only on the way into a
     conversation.

     The panel is positioned against the composer's top edge, so anything that
     changes the composer's height moves the surface the panel is growing out
     of. The starter row collapsing is 44px of exactly that, on the same
     240ms — the panel opens upward while its own baseline slides down, and
     the two together read as the composer resizing first and the window
     arriving after it. One box opening is one edge moving.

     So the row is cut rather than collapsed at the moment of the send: the
     composer takes its final height on the first frame, and everything after
     that is a single height animating from nothing to full. Elsewhere the row
     still collapses normally — this is about the handover, not the row. */
  const [snapStarters, setSnapStarters] = useState(false);

  const closing = useRef<number | undefined>(undefined);
  const [closingNow, setClosingNow] = useState(false);
  useEffect(() => () => window.clearTimeout(closing.current), []);

  const closeChat = () => {
    inputRef.current?.blur();
    /* The close is the open played backwards, which means landing where the
       open took off from.

       It used to end at the resting pill — narrow, no attach, no starters.
       But you never open from there: by the time the panel can open, the
       launcher is expanded. So the close was undoing the open *and* a state
       change that had happened earlier, and that extra travel — 620 → 340,
       attach folding shut — is motion with no counterpart going the other
       way. It is the part that reads as the pill sliding off rather than
       closing.

       `open` is left set, so the launcher returns to the expanded form it was
       in a moment before. The only thing that animates is the panel's height,
       from full back to nothing — one edge, the same 280ms, the same curve,
       exactly reversed.

       The starters snap back out for the same reason they snapped shut on the
       way in: the composer takes its final shape on the first frame, so the
       panel collapses into something that is already still.

       This used to be two steps — panel first, composer reverting once it had
       gone — because the two were on different clocks and moving them
       closingNow no longer holds any of the composer's shape — it is left
       only to keep the travelling ring from starting its sweep across a
       perimeter that is still moving. */
    setSnapStarters(true);
    setClosingNow(true);
    setChatOpen(false);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setSnapStarters(false)),
    );
    window.clearTimeout(closing.current);
    closing.current = window.setTimeout(() => setClosingNow(false), PANEL_MS);
  };

  const restart = () => {
    window.speechSynthesis?.cancel();
    setSpeakingId(null);
    window.clearTimeout(replyTimer.current);
    setThinking(false);
    setStreaming(null);
    setMessages([]);
    setValue("");
  };

  /* The transcript as the plain thing it is.

     plain() strips the answer's own markup, so what lands in the file is what
     was read on screen rather than the bullets and asterisks behind it. Text
     rather than JSON for the same reason — this is for a person keeping a
     record of what was said, not for a system reading it back in.

     The object URL is revoked straight after the click. It holds the blob
     alive for as long as the document does otherwise, and a transcript is
     re-downloaded rather than kept around. */
  const downloadTranscript = () => {
    const body = messages
      .map((m) => `${m.from === "user" ? "You" : content.agentName}: ${plain(m.text)}`)
      .join("\n\n");
    const url = URL.createObjectURL(
      new Blob([body], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "tars-conversation.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copy = (m: Message) => {
    navigator.clipboard?.writeText(plain(m.text));
    setCopiedId(m.id);
    window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setCopiedId(null), 1500);
  };


  /* Rating twice clears it — the second press on an active thumb is someone
     undoing, and a rating you can't take back is a trap. */
  const rate = (id: number, value: "up" | "down") =>
    setRated((prev) => {
      const next = { ...prev };
      if (next[id] === value) delete next[id];
      else next[id] = value;
      return next;
    });
  const inputRef = useRef<HTMLInputElement>(null);
  /* A counter rather than a timestamp: two messages posted in the same
     millisecond would collide on Date.now() and React would reuse a key. */
  const nextId = useRef(0);
  const replyTimer = useRef<number | undefined>(undefined);

  /* The transcript, so opening something inside it can move it.

     Everything else in this component grows into space the panel already has
     — a reply lands at the foot of a thread that is scrolled to the foot. The
     sources panel is the exception: it opens in the middle of a turn that is
     already sitting on the bottom edge, so without help it unfolds straight
     past it. */
  const threadRef = useRef<HTMLDivElement>(null);

  /* The real height of the foot, measured rather than declared.

     UNIFIED_FOOT is a constant describing the field, its margins and the
     disclaimer — everything the composer holds at rest. It is right until the
     composer grows, and the composer grows for two reasons: the follow-up
     pills arriving when a reply lands, and the transcript line appearing when
     you dictate.

     On a desktop that costs nothing, because the panel is 620 inside a much
     taller window and the pair simply take more of it. On a phone the panel
     is sized to fill the screen minus the foot — so a foot that is 44px
     taller than the constant pushes the panel 44px further up, and what goes
     off the top is the header. That is the header disappearing exactly when a
     reply finishes and coming back while the next one streams: the pills are
     only there in between.

     Observed rather than recalculated, because the number depends on wrapped
     pill rows and rendered text — things only layout knows. The composer's
     overflow-hidden makes it a block formatting context, so its children's
     margins are inside the measurement rather than collapsing out of it. */
  const composerRef = useRef<HTMLDivElement>(null);
  const [footPx, setFootPx] = useState(UNIFIED_FOOT);
  useEffect(() => {
    const el = composerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setFootPx(entry.contentRect.height),
    );
    ro.observe(el);
    return () => ro.disconnect();
    /* On `view` rather than on `listOnly`, which is derived from it further
       down the component — the observer only has to be re-attached when the
       composer unmounts and remounts, and the list view is the only thing
       that does that. */
  }, [view]);

  /* Whether the thread is following its own foot.

     True until you scroll away from the bottom, and true again the moment you
     come back. Without the flag an auto-scroll is a yank: scrolling up to
     re-read an earlier answer while a reply is streaming would drag you back
     down on every word, and the one thing you were trying to do — read — is
     the one thing it prevents. */
  const pinned = useRef(true);

  /* The last scroll position this component set itself.

     `pinned` is derived from an onScroll handler, and a scroll event says
     nothing about who caused it — the visitor's wheel and our own follow
     loop arrive identically. That was survivable while the follow was a
     single jump straight to the bottom: the event it fired always measured
     as "at the bottom", so it re-confirmed `pinned` instead of clearing it.

     An eased follow spends every frame but the last *not* at the bottom, so
     each of its own writes came back through the handler as "the visitor has
     scrolled away", `pinned` went false, and the loop stopped itself one
     frame in — the auto-scroll looking like it had simply stopped working.

     So each write is recorded, and a scroll event landing on the value we
     just wrote is our own and leaves `pinned` alone. Anything else is a
     hand on the wheel. */
  const lastAuto = useRef(-1);

  /* Follow the conversation as it grows.

     Runs on the message list, the stream and the thinking flag, which between
     them cover every way the thread gets taller: a question posted, a reply
     mounting, a word landing, a reasoning row appearing and going.

     A frame loop easing toward the foot, not a jump and not scrollTo.

     It was `scrollTop = scrollHeight` — instant, every time. The argument was
     that per-word steps are a line-height apart so instant reads as smooth,
     and for the streaming case that is true. It is not true for the rest of
     them: a question posted, a reply row mounting, two greeting turns seeded
     at once, an accordion opening, the suggestion row arriving — those are
     tens or hundreds of pixels, and each one lands as a cut.

     `scrollTo({ behavior: "smooth" })` is the obvious fix and the wrong one
     here. Each call is an animation with its own duration, so at a word
     every 40ms each would interrupt the last and the thread would drift
     behind the text without ever arriving.

     Easing by a fraction of the remaining distance every frame has neither
     problem. The target is re-read each frame, so growth during the animation
     is absorbed rather than fought — a word landing mid-glide just moves the
     destination — and one loop is ever running, so nothing interrupts
     anything. Small steps settle within a frame or two and read as instant;
     large ones glide.

     0.22 is the pull. Lower drags a long jump out past the point where it
     stops being motion and starts being a wait; higher lands big jumps
     close enough to a cut to bring back what this is here to remove. */
  const follow = useRef(0);
  const followFoot = useCallback(() => {
    const el = threadRef.current;
    if (!el || !pinned.current) return;

    /* Nothing to animate if the visitor asked for no animation — and a
       transcript is the last place to argue with that setting. */
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      el.scrollTop = el.scrollHeight;
      lastAuto.current = el.scrollTop;
      return;
    }

    cancelAnimationFrame(follow.current);
    const step = () => {
      /* Re-read every frame: `pinned` can go false mid-glide if the visitor
         scrolls up to re-read something, and carrying on would drag them
         back down — the exact yank the flag exists to prevent. It can only
         say that about a real gesture now; see `lastAuto`. */
      if (!pinned.current) return;
      const target = el.scrollHeight - el.clientHeight;
      const delta = target - el.scrollTop;
      /* Half a pixel is under a device pixel on every display this runs on,
         so there is nothing left to see moving. Snapped rather than left to
         approach forever. */
      if (Math.abs(delta) < 0.5) {
        el.scrollTop = target;
        lastAuto.current = el.scrollTop;
        return;
      }
      el.scrollTop += delta * 0.22;
      lastAuto.current = el.scrollTop;
      follow.current = requestAnimationFrame(step);
    };
    follow.current = requestAnimationFrame(step);
  }, []);

  /* Every way the thread gets taller, in one place.

     The list, the stream and the thinking flag between them cover everything
     React knows about: a question posted, a reply mounting, a word landing,
     a reasoning row appearing and going.

     footPx is in here because the panel shrinks when the composer grows, and
     a shorter panel with the same scroll position has its last 44px cut off
     — which is exactly the transcript's bottom padding. The reply ended up
     sitting flush against the pill row with no gap until you scrolled by
     hand, not because the padding was missing but because it was below the
     fold. Re-pinning after the resize puts it back. */
  useEffect(() => {
    followFoot();
    return () => cancelAnimationFrame(follow.current);
  }, [messages, streaming, thinking, footPx, followFoot]);

  /* And every way it gets taller that React doesn't know about.

     The accordion is the one that matters: <details> is native, so opening a
     section is a browser-side layout change with no state behind it and no
     render to hang an effect on. Open a long section near the foot of a
     pinned transcript and the thread grows underneath the scroll position —
     the suggestion row, which is the last thing in the box, is pushed clean
     below the fold and arrives sliced in half. Nothing was broken; nothing
     had told the transcript to follow.

     Same class of problem for anything else that settles after its render:
     an image decoding, a font swapping, rich text rewrapping when the panel
     changes width. Rather than a handler per cause, the box watches its own
     contents and follows when they move.

     Children rather than the scroller itself — a ResizeObserver on an
     overflowing container reports the container's box, which never changes,
     so it would sit silent through exactly the growth this exists to catch.
     The thread is a flex column, so its content height is its children's,
     and the subscription is kept in step with a MutationObserver as turns
     arrive.

     `followFoot` returns immediately unless `pinned`, so a visitor who has
     scrolled up to re-read something can open all four sections without the
     box dragging them back down. */
  useEffect(() => {
    const el = threadRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver(() => followFoot());
    const watch = () => {
      ro.disconnect();
      for (const child of Array.from(el.children)) ro.observe(child);
    };
    watch();

    const mo = new MutationObserver(watch);
    mo.observe(el, { childList: true });

    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [followFoot, chatOpen, view]);

  /* Ride the transcript up as the panel comes down.

     The reader's eye is on the chip they just pressed, and the thing they
     asked for appears below it — so the scroll has to make room in the same
     motion, or the list arrives off-screen and the whole gesture reads as
     nothing having happened.

     A frame loop rather than one scrollTo: the panel's height doesn't exist
     yet at the moment of the click, it's being interpolated by CSS over the
     next 300ms, so there is no number to scroll to. Reading the turn's
     position every frame and taking up only the difference means the scroll
     is driven by the animation instead of racing it — and if the turn already
     fits, nothing moves at all.

     Bounded by the transition's own duration plus a frame, so a click that
     lands during a close, or on a panel that never grows, can't leave a loop
     running behind it. */
  const followOpen = (turn: HTMLElement | null) => {
    const el = threadRef.current;
    if (!el || !turn) return;
    const until = performance.now() + SOURCES_OPEN_MS + 40;
    /* The room to leave under the panel is the padding the transcript already
       carries, so the resting gap after this scroll is the same one every
       other reply ends on. Read once — it can't change mid-animation. */
    const pad = parseFloat(getComputedStyle(el).paddingBottom) || 0;
    const step = () => {
      const over =
        turn.getBoundingClientRect().bottom -
        el.getBoundingClientRect().bottom +
        pad;
      if (over > 0) {
        el.scrollTop += over;
        /* Recorded for the same reason the follow loop records its writes:
           this is us moving the transcript, not the visitor leaving it. */
        lastAuto.current = el.scrollTop;
      }
      if (performance.now() < until) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* Derive, don't configure: with no starters of its own, the launcher
     previews the gambit — the greeting's node buttons become the chips. One
     source of truth, so the chips can never promise something the opening
     message doesn't offer, and a tenant edits their bot in one place for
     every channel. An explicit starters list stays as the override. */
  const starters =
    content.starters.length > 0
      ? content.starters
      : content.greeting?.buttons ?? [];

  /* The field had an entrance inside the window: held at a narrow
     `fieldRest` for exactly one paint on open, via a two-rAF flip, so the
     browser had a start value to transition from and the field was seen
     opening along with the panel. It's gone — the field is simply at its
     one width from the first frame now. The argument for it was that a
     width which is just there is "a state, not an arrival", and that's
     true, but the arrival is the panel's job: with the panel unfolding
     above it on the same click, a field easing open underneath is a second
     thing moving, and what it reads as is the composer resizing itself
     after the window has already landed. */

  /* The greeting, as messages. Built here and used from two places — the
     open-without-sending path and the seed ahead of a first send — so the
     agent's opener is the same words however the thread came to exist.

     A list rather than one message, because `greeting.then` lands as its own
     turn: same speaker, two things said. Ids are minted in order so the
     second reads as having followed the first. */
  const greetingMessages = (): Message[] => {
    const g = content.greeting;
    if (!g) return [];
    const at = Date.now();
    const first: Message = {
      id: nextId.current++,
      from: "agent",
      text: g.text,
      image: g.image,
      prompts: g.then ? undefined : g.prompts,
      buttons: g.then ? undefined : g.buttons,
      at,
    };
    if (!g.then) return [first];
    return [
      first,
      {
        id: nextId.current++,
        from: "agent",
        text: g.then.text,
        prompts: g.then.prompts ?? g.prompts,
        buttons: g.then.buttons ?? g.buttons,
        at,
      },
    ];
  };

  /* Open the thread without saying anything.

     The answer to "what if I just want to open the chatbot?" — which the
     composer paradigm otherwise has no path for, because its only door used
     to be the send. Used to be offered only where a greeting exists, on the
     reasoning that an empty pane with no one speaking is a room with the
     lights off — but the resting field doesn't take typing any more (see the
     input's onMouseDown below: this is now the *only* door, for every
     tenant), so a pack with no greeting has to open into that empty room
     too. It opens on nothing rather than not opening, the same room with the
     lights off but the switch still works — the composer sits at the
     bottom, waiting the same way it would have a moment before. */
  const openChat = () => {
    if (chatOpen) return;
    window.clearTimeout(closing.current);
    /* The same snap the send path does, for the same reason: the panel's
       height target is the total minus the composer's measured foot, and the
       starter row is part of that foot. Left to animate closed, the row
       shrinks the foot continuously under the opening panel — a height
       transition whose destination moves every frame reads as the panel
       sticking near the composer and then lurching up. Collapsed in one
       frame, the foot lands before the growth starts and the open is a
       single move. */
    setSnapStarters(true);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setSnapStarters(false)),
    );
    setChatOpen(true);
    setView("thread");
    if (messages.length === 0) {
      const hello = greetingMessages();
      if (hello.length) setMessages(hello);
    }
    /* The field just stopped being a preview and started being a real one —
       so the same click that opened it should land the caret in it, the way
       clicking any other composer does. Deferred a frame past the state
       change for the same reason the snap above is, and skipped on a phone
       for the same reason dictate() skips it there: the keyboard arriving
       mid-animation is its own motion competing with the panel's. */
    if (!phone) requestAnimationFrame(() => inputRef.current?.focus());
  };

  const send = (text: string) => {
    const body = text.trim();
    /* An empty submit was a no-op — "a ghosted arrow reads as broken", so the
       arrow stays live and swallowing the press was the price. Now the press
       always does the honest thing instead: open the conversation, with the
       agent starting it where there's a greeting configured and the field
       simply waiting where there isn't. */
    if (!body) {
      openChat();
      return;
    }

    /* The question has been asked, so the microphone has nothing left to
       collect — and a recogniser still running would write the next thing it
       hears into a field that has just been cleared for a new message. */
    if (listening) recogniser.current?.stop();

    /* A close still finishing when a message is sent would revert the
       composer out from under the panel that is opening again. */
    window.clearTimeout(closing.current);

    /* Two frames, for the same reason the view swap needs them: the first is
       the commit that paints the collapsed row with no transition, and
       re-enabling in that frame would let the style land before the paint and
       animate anyway. */
    setSnapStarters(true);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setSnapStarters(false)),
    );

    setChatOpen(true);
    /* Sending from the list jumps back to the thread — the message has to
       land somewhere you can watch it land. */
    setView("thread");
    setValue("");
    /* No greeting seeded ahead of the first message — for the default pack.
       The thread opens on what was actually said; an introduction the agent
       gives itself before anyone has spoken is a message about nothing. A
       tenant whose workflow starts on the agent's node opts in via
       content.greeting, and the opener lands above the first send so the
       transcript matches the flow that produced it. Ids minted outside the
       updater, which may run twice in dev. */
    const hello = messages.length === 0 ? greetingMessages() : [];
    const userMsg = {
      id: nextId.current++,
      from: "user" as const,
      text: body,
      at: Date.now(),
    };
    setMessages((prev) => [...prev, ...hello, userMsg]);

    /* One reply in flight at a time — sending again while the agent is
       thinking replaces the pending answer rather than queueing a second one
       that would arrive out of step with the question it belongs to. */
    window.clearTimeout(replyTimer.current);
    /* The wait is shown rather than left blank. Same timer as before, so the
       pause is unchanged — it just says what it's doing while it passes. */
    setThinking(true);
    const replyId = nextId.current++;
    /* The merged surface opens the agent's row immediately, empty. Everything
       that row will hold — the orb, the label beside it — is mounted now and
       merely relabelled when the text arrives, so nothing is torn down and
       rebuilt at the handover. The other layouts keep their standalone
       thinking row and get the reply as a new message, as before. */
    if (unified) {
      setMessages((prev) => [
        ...prev,
        { id: replyId, from: "agent", text: "", steps: content.reasoningTrace,
          pending: true, at: Date.now() },
      ]);
    }
    const waited = thinkFor(body);
    replyTimer.current = window.setTimeout(() => {
      setThinking(false);
      setStreaming({ id: replyId, words: 0 });
      const filled = {
        text: content.replies[body] ?? content.replyFallback,
        prompts: content.followUps[body] ?? content.followUpFallback,
        buttons: content.replyButtons?.[body],
        form: content.replyForms?.[body],
        accordion: content.replyAccordions?.[body],
        steps: content.reasoningTrace,
        thoughtMs: waited,
        pending: false,
        /* Stamped when it lands, not when it was queued — the timestamp is
           when the agent spoke, and those differ by the whole think delay. */
        at: Date.now(),
      };
      setMessages((prev) =>
        unified
          ? prev.map((m) => (m.id === replyId ? { ...m, ...filled } : m))
          : [...prev, { id: replyId, from: "agent" as const, ...filled }],
      );
    }, waited);
  };

  useEffect(() => () => window.clearTimeout(replyTimer.current), []);


  /* Shut at rest, and opens on hover — a desktop website invites you toward
     the thing your cursor is already near, it doesn't watch how you scroll.
     Scroll drove this for a while (distance-accumulated, direction-committed,
     the usual momentum-noise guarding) and it was the wrong read: it opened
     while you were reading, not while you were near the composer, and it
     read as the pane watching the page rather than answering the cursor.
     `setOpen` is now called directly from the pill's onMouseEnter/onMouseLeave
     below, so there's no listener to own here — hover is already a browser
     event, not a signal that needs debouncing the way scroll did. */

  /* There was an effect here that warmed the audio graph on the first
     gesture anywhere on the page, so the first cue wasn't also the first
     time the engine was built. With no cues left there is no graph to warm,
     and two window listeners and a silent playback are gone with it. */

  /* The animation is only ever decoration — it stops the moment there's a real
     question in the field, for anyone who asked not to see motion, and once a
     conversation is up, where a field cycling sample questions under a live
     thread is competing with the answer above it. */
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  /* What the resting chip types out. The starters are the tenant's actual
     offer — the same three words a hover reveals as chips — so the rotation
     teaches exactly what the chips are about to show, instead of running a
     separately-authored list that happens to say something else by the time
     you hover. Falls back to `questions` only for a content pack that ships
     starters empty (the greeting-derived case: [[project-tenant-demos]]),
     so there's still something to type. */
  const rotation = content.starters.length > 0 ? content.starters : content.questions;

  /* A paused thread stops the rotation too. Cycling sample questions in a
     field that belongs to a conversation already underway invites you to
     start over, which is the opposite of what the state means.

     Hovering stops it as well, and for the same reason: the moment the pill
     is widening to show the starter chips themselves, a placeholder still
     typing one of those same chips out underneath them is teaching a lesson
     that just finished. `open` is the hover flag — see the pill's own
     onMouseEnter/onMouseLeave — so this reads as "not currently being
     looked at," which is exactly when the demonstration is useful. */
  const animating =
    !open && !focused && value === "" && !reduced && !chatOpen && messages.length === 0;

  /* One timeout per character rather than an interval, so each phase decides
     its own next step and the cycle can't drift out of sync with itself. */
  useEffect(() => {
    if (!animating) return;
    const full = rotation[index];

    if (phase === "typing") {
      if (typed.length === full.length) {
        const t = setTimeout(() => setPhase("holding"), 0);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setTyped(full.slice(0, typed.length + 1)), TYPE_MS);
      return () => clearTimeout(t);
    }

    if (phase === "holding") {
      const t = setTimeout(() => setPhase("erasing"), holdFor(full));
      return () => clearTimeout(t);
    }

    if (typed.length === 0) {
      setIndex((i) => (i + 1) % rotation.length);
      setPhase("typing");
      return;
    }
    const t = setTimeout(() => setTyped(full.slice(0, typed.length - 1)), ERASE_MS);
    return () => clearTimeout(t);
  }, [animating, phase, typed, index, rotation]);

  /* Four states, in order of specificity.

     A closed thread says "Continue conversation" — lifted from fin.ai, and
     the detail worth stealing from it: their composer doesn't return to a
     generic prompt after you collapse the messenger, it remembers there's
     something waiting. A rotating "How do AI Agents work?" over a thread you
     were three replies into reads as the launcher having forgotten you.

     A hover says "Type your message…" — the chips below are now the offer,
     so the field's job changes from demonstrating to inviting. Ahead of the
     animation check for the same reason `open` is ahead of it above: this is
     the state the rotation stopped for.

     Otherwise the animation's current frame, or — when it's off, including
     mid-cycle where `typed` would leave a half-finished word — a whole
     question, so the field is never unlabelled. */
  /* A thread behind the pill, waiting. Everything the resting launcher does
     differently for someone coming back reads off this one flag: the line it
     wears, the colour it wears it in, the mark where send would be, and the
     card the hover opens. */
  const resuming = messages.length > 0 && !chatOpen;

  const placeholder =
    /* Inside the merged window it's a plain, static prompt. The rotating
       sample questions exist to teach someone what the launcher takes before
       they've used it; once the conversation is on screen above the field
       that lesson is over, and a placeholder cycling suggestions under a
       live thread competes with the thread. */
    unified && chatOpen
      ? "Ask AI anything..."
      : resuming
        ? "Continue your conversation..."
        : open && !focused && value === "" && messages.length === 0
          ? "Type your message…"
          : animating
            ? typed
            : rotation[index];

  /* The caveat line's text — see ComposerContent.disclaimer. Derived here
     rather than inlined at each of its two render sites, so the default
     is written once and can't drift between the flush and merged
     variants. */
  const disclaimer =
    content.disclaimer ?? "AI can make mistakes. Check important information.";

  const composing = focused || value.trim() !== "";
  /* An open transcript deliberately does *not* count. It used to, on the
     reasoning that a conversation shouldn't have its field shrink underneath
     it — but that left the composer sitting at full width through the whole
     exchange, so it stopped being a thing that responds to you and became a
     bar at the bottom of the screen. Now it's narrow while you read and
     widens when you go to type, which is the same behaviour it has before
     the conversation starts. */
  const expanded = open || composing;

  /* The composer opening and closing is silent.

     This was the loudest thing in the component and the least earned: the
     pane expands on scroll and on focus, both of which happen repeatedly and
     neither of which is a decision — so the visitor got a sound for moving
     down a page, another for clicking into a field, another for clicking out
     of it. It needed a 400ms floor between cues to stop the wheel producing a
     warble, which is the tell that the trigger was wrong rather than the
     timing.

     A sound should mark something the visitor chose and can't miss. Scrolling
     past a widget is neither. */

  /* The two slots trade independently rather than in lockstep.

     Left: the orb belongs to the resting state, where it marks the field as an
     agent's. The moment the pane is open for any reason there's a message
     being started, and attach is worth more than decoration.

     Right: dictate only while browsing. Leaving it in place once someone is
     typing would take away the only way to submit. */
  /* Once there's a conversation the left slot is attach and stays attach.
     The orb belongs to the launcher: it's there to say the field is an
     agent's before anything has been said. After that the agent has been
     introducing itself in the transcript for several turns, so the orb has
     nothing left to announce — and because the hover flag still swings as
     the cursor moves, leaving it on `expanded` alone meant the mouse
     drifting off mid-thread swapped attach back out for decoration. */
  /* The list stands on its own.

     A composer under a list of past conversations is a field with nothing to
     type into: whatever you wrote there would have to belong to one of the
     rows, and none of them is open. Sending from here used to jump you into
     the thread, which is the same as saying the field was never about this
     screen.

     Merged only. On the separate-pane variants the composer *is* the
     launcher — the panel floats above it — so taking it away would remove the
     one control that can put the window back. */
  const listOnly = unified && chatOpen && view === "history";

  /* "There is a window on screen", which stays true while it is going down.

     Everything about the composer's shape — its radius, whether the field is
     inset or flush, the placeholder, the disclaimer under it — is written
     against `chatOpen`, and all of it flipped on the first frame of a close.
     The panel needs 360ms to leave; the thing it is joined to shouldn't
     rearrange itself in front of it while it does. */
  /* "There is a window on screen" is now just chatOpen.

     closingNow used to be folded in here to hold the composer's shape still
     while the panel left — which was right when the two moved one after the
     other, and is exactly what stops them moving together. The composer's
     radius, width and field now revert on the same frame the panel starts
     collapsing, which is what makes it one box closing rather than two
     things taking turns. closingNow still exists, but only to keep the
     starter row out of the way while that happens. */
  const panelUp = chatOpen;


  /* Whether the panel has finished arriving.

     The height transition belongs to the open and the close — the panel
     unfolding out of the pill and dropping back into it. Once it is up, every
     other change to its height is the foot being remeasured underneath it,
     and those have to be instant: the composer grows as its pill row unfolds,
     and a panel easing after it over 360ms would lag behind by a visible
     amount and arrive late, which is the seam this exists to remove. */
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!chatOpen) {
      setSettled(false);
      return;
    }
    const t = window.setTimeout(() => setSettled(true), PANEL_MS);
    return () => window.clearTimeout(t);
  }, [chatOpen]);

  /* Hold the page still while the conversation owns the screen.

     On a phone the panel is the viewport, and the site is still sitting
     behind it perfectly able to scroll. That is not a cosmetic problem: iOS
     collapses and expands its toolbars in response to that scroll, and doing
     so resizes the layout viewport that every `position: fixed` element here
     is anchored to. The panel slides, the header goes off the top, and the
     composer ends up behind the browser's own bottom bar — all without
     anything in this component having changed.

     overflow on both html and body, because which of the two is the scrolling
     element differs between engines and setting one is a coin toss.
     overscroll-behavior on top of it stops the rubber-band at the ends of the
     transcript from being handed to the page underneath, which is the other
     way the toolbars get woken up.

     Restored to whatever was there before rather than cleared, so this can't
     quietly take ownership of a property the host site was setting. */
  useEffect(() => {
    if (!phone || !chatOpen) return;
    const root = document.documentElement;
    const { body } = document;
    const prev = {
      rootOverflow: root.style.overflow,
      bodyOverflow: body.style.overflow,
      overscroll: body.style.overscrollBehavior,
    };
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    return () => {
      root.style.overflow = prev.rootOverflow;
      body.style.overflow = prev.bodyOverflow;
      body.style.overscrollBehavior = prev.overscroll;
    };
  }, [phone, chatOpen]);

  /* Swapping views is navigation, not a resize.

     The panel is 110px taller in the list, because the composer under it goes
     — and animating between the two makes pressing back look like the window
     growing rather than like a screen changing. The two things are on
     different timescales as well: the composer unmounts in one frame while
     the panel eases over 400ms, so the foot vanishes and then the panel
     catches up.

     So the height transition is switched off for the frame the view changes
     on, and back on immediately after. It still animates where it means
     something — the panel unfolding out of the pill when the conversation
     opens, and folding back when it closes — and simply cuts when you move
     between two screens of an open window.

     Two nested frames rather than one: the first is the commit that paints
     the new height with no transition, and re-enabling in that same frame
     would let the style land before the paint and animate anyway. */
  const [instantResize, setInstantResize] = useState(false);
  const swapView = (next: "thread" | "history") => {
    setInstantResize(true);
    setView(next);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setInstantResize(false)),
    );
  };

  /* Attach leaves with everything else rather than after it.

     It was held through the close so the slot couldn't swap back mid-collapse
     — which made sense when the composer reverted in a second step. Now that
     everything moves at once, holding it means the slot animates its 44px
     shut *after* the panel has gone, and the field's contents slide left in a
     motion of their own. That trailing shift is the close appearing to finish
     over on the left. */
  /* The attach button is gone from the launcher but lives inside the open
     window: a conversation is where a file has somewhere to go, and the
     resting pill stays a field and a mic. While dictating, the same slot
     holds the X that cancels the recogniser instead — removing that would
     leave a microphone running with no way to stop it. */
  const showAttach = listening || (unified && panelUp);

  /* The left slot's second job. While the mic is open the row is a recording
     control, not a composer: attach has nothing to attach to, and the pair of
     actions a recording actually has — throw it away, keep it — need two
     slots. So the slot that was attach becomes cancel, and the one that was
     the mic becomes confirm, which is also the arrangement anyone who has
     dictated on a phone already knows.

     Kept as three values rather than a second copy of the button, because the
     component renders that button twice already — once inside the orb's
     cross-fade slot and once in the slot that opens with the composer — and a
     third and fourth copy would be two more places for the two to drift. */
  const leftLabel = listening ? "Cancel dictation" : "Attach a file";
  const LeftIcon = listening ? X : Plus;
  const onLeft = listening ? cancelDictation : undefined;
  /* Dictate only in the one state that wants it: a conversation open and
     nothing being written. There, the field is idle mid-exchange and offering
     a second way to reply is worth the slot.

     Everywhere else, send. In the resting launcher the arrow is the clearer
     signal of what the field is for — an empty chip with a mic on it reads as
     a voice widget rather than as somewhere to type — and the send button is
     deliberately never disabled there, so it stays an invitation rather than
     a control waiting to be earned.

     Merged, the swap waits for text rather than for focus. Clicking into an
     empty field doesn't create anything to send, so turning the mic into a
     send button at that moment offers an action that isn't available yet —
     and it takes dictate away exactly when someone reaching for the field
     might still have wanted it. The button changes when the thing it does
     changes.

     Elsewhere it still goes on focus, where the composer's width is already
     moving and the two reading as one gesture matters more.

     Either way text counts even unfocused, so a draft you clicked away from
     keeps its send.

     Dictation overrides all of it. The words the recogniser hears go into the
     field, so on the merged surface the first one flips this to send and the
     mic disappears — taking the stop button with it, while the microphone
     stays open. Whatever else is true, a control that is currently running
     has to remain the control you can press. */
  /* The swap only happens if there is something to swap to.

     `swapped` hides the send arrow so the mic can take the slot — but the mic
     is feature-detected and simply absent where the browser has no
     recogniser, which is every iOS browser and Firefox. There the slot went
     empty: send hidden for a mic that was never rendered, and no way to
     submit but the return key.

     Gating on canDictate makes the two halves agree. Where dictation exists
     the row behaves as designed; where it doesn't, send stays put and the
     visitor never learns there was supposed to be a choice. */
  /* The merged surface no longer waits for the chat to be open: the focused
     composer is already a place to speak, so an empty field offers the mic
     and the first typed character trades it for send. The resting chip keeps
     its arrow — a microphone on a control nobody has engaged reads as the
     page listening. */
  const swapped =
    canDictate &&
    (listening ||
      (unified
        ? /* Empty field, mic — resting launcher included.

             It used to wait for the pill to be hovered or the panel to be up,
             so the thing a visitor saw first was a send arrow: a control that
             promises to send something that does not exist yet. The mic
             promises the one thing a single press can actually deliver, and
             it is also the only thing on the launcher that says out loud that
             you may talk to this rather than type at it. Design review,
             11 Sep: the arrow was hiding the feature. */
          value.trim() === ""
        : chatOpen && !composing));

  /* The third face of the right slot, for a launcher with a thread behind
     it. Send is the wrong mark there and so is the mic: both say "say
     something new", and what this control does is go back to something
     already said. A chat bubble with a dot on it is the one both the web and
     every phone on it already read as "there is something in here".

     Only while the field is untouched — the moment there is a character in
     it the visitor is writing rather than resuming, and send is the honest
     mark again.

     And only at rest. The bubble's job is to say there is something behind
     the pill, and the hover has just answered that: the card is open and the
     exchange is on screen, so the mark is still announcing news the visitor
     is already reading. What the slot is for at that point is the next
     thing, which is what `swapped` puts there — the mic, the same as any
     other expanded composer. Design's launcher makes the same trade on the
     same gesture. */
  const showResume = resuming && !composing && !swapped;
  /* Starters step aside once there's something typed — at that point they're
     competing with the question rather than offering one — and for good once
     the conversation is under way, where an opener is behind the thread. */
  /* One row of chips in the composer, holding whichever set is current.

     The composer's row carries the openers only. Follow-ups were tried here
     too and didn't hold: the composer is a narrow strip that has to widen to
     fit them, and a row of suggestions attached to the input reads as part
     of the control rather than as part of the conversation.

     They live pinned to the foot of the panel instead — inside the room the
     conversation is happening in, and above the field rather than around
     it. */
  const latest = messages[messages.length - 1];

  /* The last exchange, for the card the resting launcher opens on hover.

     Read backwards from the end rather than taken as the final two: the
     agent can answer in more than one turn, so "the last thing said" and
     "the last thing the agent said" are not the same message, and a card
     showing the visitor their own question next to the wrong half of the
     reply is worse than one that shows nothing. Either half can come back
     undefined — a thread that is only a greeting has no question in it — and
     the card asks for both before it renders. */
  const lastAsk = [...messages].reverse().find((m) => m.from === "user");
  const lastReply = [...messages].reverse().find((m) => m.from === "agent");
  /* Hover, and only where there is something to recall. `open` is the hover
     flag the pill already runs on, so the card opens with the same gesture
     that widens it — one movement, two things revealed, rather than a second
     affordance to discover. */
  const recallOpen = resuming && open && !composing && !!lastAsk && !!lastReply;
  const followUps =
    latest?.from === "agent" && !thinking && streaming?.id !== latest.id
      ? latest.prompts
      : undefined;

  /* The row keeps its space once it has had any.

     Sending from a pill clears `followUps`, which collapsed the row — the
     composer lost 44px, the panel grew 44px back into it, and the join
     between the two travelled the whole way and back again when the next
     answer arrived. That is the movement: not the pill, the surface behind
     it.

     So the last set is held and kept mounted, and only its opacity changes.
     The space stays claimed for the rest of the conversation, nothing
     resizes, and the pills fade out as the question goes and fade back in
     with the answer. Held rather than blanked, because an empty row of the
     right height needs something in it to be that height — and the old
     suggestions, greyed and unclickable for the second the reply takes, read
     as the row waiting rather than as a gap. */
  const heldFollowUps = useRef<string[] | undefined>(undefined);
  if (followUps && followUps.length > 0) heldFollowUps.current = followUps;
  const rowPrompts = heldFollowUps.current;
  const rowLive = !!followUps && followUps.length > 0;

  /* Hand the turn back once the suggestions have finished arriving.

     The reply lands, the pills come in one by one, and then the field opens
     and takes focus — so the last thing that moves is the thing you're meant
     to use. Doing it any earlier fights the entrance: a field widening while
     buttons are still animating reads as two things happening at once rather
     than one handover.

     Keyed off the reply's id, so it runs once per answer rather than on every
     render that happens to have follow-ups on screen. Merged surface only —
     elsewhere the composer is a separate pane and opening it unasked would
     pull the eye off the transcript that just finished writing itself. */
  const handedBack = useRef<number | null>(null);

  /* The reply is finished when it is the last message, nothing is thinking
     and nothing is still being written into it. Read here rather than at the
     effect, so the effect depends on a boolean that only changes twice per
     turn instead of on the message object, which changes every word. */
  const replyLanded =
    !!latest &&
    latest.from === "agent" &&
    !latest.pending &&
    !thinking &&
    streaming?.id !== latest.id;

  useEffect(() => {
    if (!unified || !chatOpen) return;
    /* Never on a phone.

       Focusing a field there does two things a desktop focus doesn't: it
       opens the keyboard, and it makes the browser scroll to reveal the
       focused element — which shifts the layout viewport the whole fixed
       panel is anchored to, taking the header off the top of the screen. So
       an answer arriving would hide the header and cover half the reply with
       a keyboard nobody asked for.

       The behaviour it's giving up is worth nothing here anyway. On a desktop
       the field widening says "your turn"; on a phone the field is already
       full width and the turn is obvious — the reply stopped. */
    if (phone) return;
    /* Every finished reply hands the turn back, whether or not it came with
       suggestions. The follow-ups were the trigger before, which made the
       field's opening a side effect of there happening to be pills — so a
       reply without them left the composer sitting narrow, and the visitor
       had to click into it to say anything. The answer being over is the
       thing that means it's your turn; the pills are just one way of taking
       it. */
    if (!replyLanded || !latest || handedBack.current === latest.id) return;
    handedBack.current = latest.id;
    /* Behind the pills where there are pills, immediately where there aren't.
       A field widening while buttons are still arriving reads as two things
       happening rather than one handover — but with nothing arriving, the
       same delay is just a pause with nothing in it. */
    const t = window.setTimeout(
      () => inputRef.current?.focus(),
      followUps && followUps.length > 0 ? SUGGEST_SETTLED_MS : 0,
    );
    return () => window.clearTimeout(t);
  }, [unified, chatOpen, replyLanded, followUps, latest]);

  /* The answer used to announce itself with a chime here, fired on
     `replyLanded` so it marked the moment there was something to read rather
     than the moment the agent started writing. Gone with the rest of the
     sound — auto-read, below, is the one thing left that makes noise, and
     that one is a setting the visitor turns on. */

  /* Reads each answer once it has finished arriving.

     After, not during: the stream adds a word every 40ms, and speaking a
     reply that is still being written would either restart on every word or
     read a sentence that hadn't been written yet.

     Keyed on the message id through a ref, so the same answer can't be read
     twice — the effect's dependencies include state that changes for reasons
     unrelated to a new reply landing.

     Turning the setting off cancels what is being read as well as what would
     have been: a switch that only applies to the next one leaves you
     listening to the thing you just turned off. */
  useEffect(() => {
    if (!autoRead) {
      window.speechSynthesis?.cancel();
      setSpeakingId(null);
      return;
    }
    if (!replyLanded || !latest) return;
    if (autoReadFor.current === latest.id) return;
    autoReadFor.current = latest.id;
    speak(latest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRead, replyLanded, latest]);

  /* Not while the window is going down. The starters' whole condition is
     "expanded, empty, and no conversation open" — which the frame after a
     close satisfies exactly, so the chips unfolded into a composer with a
     panel still collapsing above them. */
  /* And not while there is something to come back to. On a return visit the
     hover has already been spent: it opens the recall card, which says what
     the conversation was. Three openers underneath it offer to start a
     different one in the same breath — two offers stacked in one gesture,
     and the weaker of them is the one taking up the room. The launcher makes
     one offer at a time: start, or resume. */
  const showStarters =
    expanded && value.trim() === "" && !chatOpen && !resuming;
  /* Where they are shown, given that they are shown at all. The two rows are
     mutually exclusive and both read the same condition, so a variant can
     only ever move the chips, never accidentally render them twice. */
  const startersInside = showStarters && !startersOutside;

  const attachPx = unified ? 44 : 50;
  const sendPx = unified ? 44 : 48;

  /* There was a `fieldRest` (400) here — the narrow width the merged field
     started from before widening, the same bargain the launcher makes
     outside the window applied to the field inside it. It's gone with the
     entrance that used it: inside a conversation the field has one width,
     and there is nothing left to rest at. */
  /* Derived from the surface rather than typed, so it follows any resize —
     and the inset it leaves is 20px a side, not 12.

     20 is what the conversation above it already uses: the header, the
     messages and the quick replies are all on px-5. At 12 the field was
     reaching 8px further out than every line of text above it, which doesn't
     read as a smaller margin so much as no margin — the field looked like it
     was touching the walls while the thread sat comfortably inside them.
     Matching the inset puts the whole surface on one column. */
  /* How far the inset field stops short of the surface on each side. Named
     rather than folded into the width, because the suggestion row above the
     field has to start on the same line — two literals would drift apart the
     first time either is retuned. */
  const fieldInset = phone ? 12 : 20;
  /* A percentage on a phone rather than a number, because there is no fixed
     surface to subtract from — the pane is the viewport, and the viewport is
     whatever the device and its chrome leave. Percent lets the field track it
     without anything having to measure. */
  const fieldFocused: number | string = phone
    ? "100%"
    : (unified ? geo.open : geo.chatW) - fieldInset * 2;

  /* Send goes solid once there is something to send — text in the field, not
     merely focus in it. Focus means you're about to write; text means the
     button now does something, and that's the moment worth marking.

     Same purple as the focused stroke, solid rather than the 34% the
     hairline carries: a 1px line and a 44px disc need different alphas to
     read as the same colour, and the disc is the one that has to look filled
     rather than tinted.

     The disc takes the brand #6D33AA, the stroke a lighter #8B5CF6 at 55%.
     They aren't the same value on purpose: a 1px hairline in the brand purple
     is dark enough to read as a grey line, where a 44px disc in the lighter
     violet reads as washed out. Same colour family, each at the weight its
     own size needs. */
  const sendReady = unified && value.trim() !== "";


  /* The surface's width, resolved once and read by both halves.

     It used to be written inline on the composer only, with the panel taking
     the column's full width regardless. That's survivable when they're
     separate panes; merged, it meant the window was already 600 wide while
     the pill under it was still 340, so the "single surface" visibly wasn't
     one during the entire opening. */
  /* The composer keeps the panel's width for as long as the panel is on
     screen, collapsing included. Snapping to the launcher's width while the
     window above is still 620 wide puts a step in the surface exactly where
     the two are supposed to be joined — and it is the width the composer will
     end up at anyway once `open` clears a moment later, so nothing is lost by
     waiting. */
  const paneWidth: number | string =
    /* The full width available on a phone, which is the viewport less
       whatever inset the container is carrying — so the launcher is a wide
       pill with margins when it's shut, and the whole screen once the panel
       is up. One value, and the padding around it decides which. */
    phone
      ? "100%"
      : chatOpen
        ? unified
          ? geo.open
          : composing
            ? geo.chatW
            : WIDTH_SHUT
        : expanded
          ? geo.open
          : WIDTH_SHUT;

  /* The panel's open height, named rather than written inline at the one
     place it used to be used — because it is now needed in two: the box
     that grows animates between 0 and this, and the contents inside it are
     laid out at this from the first frame so the growth only reveals them.

     That split is the whole difference between this opening well and
     opening badly. Animating a height with the thread inside it means the
     thread's flex basis changes every frame: the transcript relayouts,
     re-measures and re-scrolls sixty times on the way up, under a backdrop
     filter, which is the stutter — and the slower it runs, the longer you
     watch it. Design's own launcher (app/design) is explicit about the
     same trick in its own words: "fixed at the final size so the chat lays
     out once and is then merely revealed — a chat re-flowing at every frame
     of the growth is what would make this stutter." */
  const panelH: number | string = phone
    ? `calc(100svh - ${listOnly ? 0 : footPx}px)`
    : surfaceH - (listOnly ? 0 : footPx);


  /* The orb filter numbers, derived once per accent. */
  const accentRgb = hexRgb(accent);
  const ink = inkMatrix(accentRgb);
  const chatLit = litRamp(accentRgb, false);
  const launcherLit = litRamp(accentRgb, true);
  const tips = sparkTips(accent);

  return (
    <ContentContext.Provider value={content}>
    <div
      /* The insets go only once the conversation is up.

         Full bleed is right for the panel — a screen-height window framed by
         16px of someone else's background reads as a bug rather than as
         breathing room. It is wrong for the launcher, which is a thing
         floating over a site and needs the margins to say so: edge to edge
         and flush to the bottom, the pill stops being a widget and becomes a
         browser toolbar, sitting directly on the phone's own. */
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-50 flex ${
        phone
          ? panelUp
            ? "justify-center p-0"
            : /* 28 a side rather than the desktop 16. The launcher's width is
                 whatever this leaves, so on a phone the inset is the only
                 thing setting it — and 16 read as the pill being pushed
                 against the screen rather than resting inside it. At 28 it
                 clears the rounded corners of the device and the browser's
                 own bottom controls, which is what makes it look like it is
                 floating rather than wedged. */
              "justify-center px-7 pb-6"
          : ALIGN[spot]
      }`}
      style={
        {
          "--ink": t.ink,
          "--ink-soft": t.inkSoft,
          "--ink-mute": t.inkMute,
          "--ink-faint": t.inkFaint,
          "--divider": t.divider,
          "--note": t.note,
          "--fill": t.fill,
          "--fill-hover": t.fillHover,
          "--disc": t.disc,
          "--disc-hover": t.discHover,
          /* The surface colour, published like the rest. The citation card
             needs an opaque background of its own and had been reaching for
             a --pane that was never declared — so it rendered with no fill at
             all and read as text floating on the transcript. */
          "--pane": t.pane,
          /* The tenant's colour, published beside the theme's greys. Every
             tinted surface below mixes from these two rather than naming a
             hex, which is what makes re-theming a client a two-value change. */
          "--brand": accent,
          "--brand-lite": accentLite,
          /* The sparkle's outer tips, derived from the accent — see
             sparkTips. Published as variables so the mark re-themes with the
             tenant like everything else tinted here. */
          "--spark-cool": tips.cool,
          "--spark-warm": tips.warm,
        } as CSSProperties
      }
    >
      {/* A column the width of the messenger, with everything centred inside
          it — rather than the two panes each aligning themselves to the
          screen edge.

          Edge-aligning them lines up the sides that touch the edge and
          nothing else, so a 340px composer under a 400px panel sat flush
          right and hung 60px off to the left of centre. Anchoring the column
          instead and centring within it makes the composer sit under the
          middle of the panel at every width.

          It also fixes the growth: right-aligned, expanding 340 → 400 moved
          the composer's left edge while its right stayed put, so it appeared
          to grow sideways out of the corner. In a fixed column it opens
          evenly from its own centre. */}
      <div
        /* relative so the panel can position against this column, and no gap
           any more — the panel is out of flow, so there is nothing left for a
           flex gap to sit between. It carries its own mb-2 instead. */
        /* `open` in, `open` out — a desktop website expands what your cursor
           is near, not what the page happens to be doing. On the whole
           column rather than the composer row alone: the column holds the
           panel too, and while it's up the pointer spends almost all its
           time up there — reading, pressing a follow-up, pressing Collapse
           — not on the narrow pill underneath. Bound to the row alone, every
           one of those crossed its edge and read as the pointer having left,
           which is the close that was landing while the conversation was
           still plainly being used: `open` (and with it `expanded`) went
           false under an open panel, and the composer reverted to its
           narrow shut width while the window was still open above it —
           the seam this comment already warns about, just arriving from a
           different edge than the one it was written for.

           Guarded to `!phone` because touch has no real hover: a tap fires
           enter with no leave to match it, which would latch this open until
           something else cleared it. On a phone the pill only ever widens
           for `composing` (focus or a value in the field), which is the
           input that actually exists there. */
        onMouseEnter={() => !phone && setOpen(true)}
        onMouseLeave={() => !phone && setOpen(false)}
        className="relative flex flex-col items-center"
        style={{
          /* The column has to be exactly as wide as the merged surface, not
             wider. Everything in it is either sized from this (the shadow
             ghost below spans it with inset-x-0) or centred in it (the
             composer's mx-auto, the panel), so a column even slightly wider
             than the surface puts the ghost's rounded silhouette a few
             pixels past the white it is supposed to be the shadow of — a
             second, larger rounded rectangle showing on both sides at once,
             which reads as two windows stacked rather than one lit from
             behind. `geo.open` is that number: the same one the composer and
             the panel take, so all three and the ghost agree by construction
             instead of by three constants staying in sync. */
          /* The column is the screen on a phone. It sizes the panes inside
             it, so leaving it at a fixed width under a viewport narrower
             than that would clamp them through maxWidth and leave the layout
             looking right while every derived width was quietly wrong. */
          width: phone ? "100%" : unified ? geo.open : geo.chatW,
          maxWidth: "100%",
          transform: entered ? "none" : ENTER_FROM[spot],
          opacity: entered ? 1 : 0,
          /* The delay is on the transition rather than on a timer, so the
             element is already in its start position from the first paint —
             a timer would show it parked mid-screen for half a second first.

             Opacity runs shorter and undelayed so it's solid by the time the
             movement is worth watching. */
          transition: `transform ${ENTER_MS}ms cubic-bezier(0.25, 0.1, 0.25, 1) ${ENTER_DELAY_MS}ms, opacity 300ms ease-out ${ENTER_DELAY_MS}ms`,
        }}
      >
      {/* One shadow for one window.

          The merged surface is two elements — a panel out of flow and the
          composer under it — and giving each its own directional shadow left
          a lighter notch at the waist where the two casts met: the panel's
          fades toward its bottom, the composer's toward its top, and the eye
          read the mismatch as a second surface. So neither of them casts any
          more. This ghost sits behind both, spans exactly their combined
          silhouette, and carries one ordinary symmetric shadow — the window
          floats as a single object because, as far as light is concerned, it
          is one.

          First in the column so every positioned sibling paints over it, and
          animated on the same clock as the panel's height so the silhouette
          the shadow wraps is always the silhouette on screen. */}
      {unified && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0"
          style={{
            /* The same clamp the panel carries, plus the foot it sits on.

               This is the bug that keeps coming back: the height of this
               window is declared in two places — the panel's own height and
               this ghost's — and only the panel had the short-screen clamp on
               it. So on any viewport where `calc(100dvh - 120px)` bit, the
               panel shrank and the ghost didn't, and the part of the ghost the
               panel no longer covered showed as a second rounded rectangle
               above the window. Most visible in a corner, because that
               placement is 700-720 tall and so is the first to hit the clamp.

               min() rather than a measurement: the clamp is a viewport unit
               and the browser is the only thing that knows what it comes to.
               Written as the panel's own limit plus footPx, which is exactly
               what the surface adds up to when the clamp is doing nothing. */
            height: chatOpen
              ? phone
                ? "100svh"
                : `min(${surfaceH}px, calc(100dvh - 120px + ${footPx}px))`
              : footPx,
            borderRadius: phone && chatOpen ? 0 : SURFACE_RADIUS,
            /* Modal-grade, not card-grade. The open window is the page's main
               event: a deep key shadow, a wide ambient one, and a broad soft
               falloff — all neutral grey. A brand-tinted aura was tried here
               and read as a blue cast rather than as light; depth should be
               colourless. One place to tune, because there is one caster. */
            boxShadow:
              "0 2px 8px rgba(15,17,26,0.08), 0 24px 56px -8px rgba(15,17,26,0.26), 0 48px 140px -12px rgba(15,17,26,0.32), 0 32px 110px -18px rgba(15,17,26,0.18)",
            /* Instant, like the panel it is the shadow of. It used to fade
               up over 200ms while the panel grew, which meant the window
               arrived at full strength with its shadow still catching up —
               the wash across the first few frames of an open. Now there is
               nothing to catch up with: both are simply there. */
            opacity: chatOpen ? 1 : 0,
            transition: "none",
          }}
        />
      )}
      {/* thinking-orbs paints greyscale — every dot is rgba(g,g,g,a) — so
          hue-rotate and saturate have nothing to work on here. A colour
          matrix is the way in, because it can write the output channels
          outright rather than shifting what's already there. */}
      <svg aria-hidden className="pointer-events-none absolute size-0">
        {/* The sparkle's fill. A flat purple reads as a sticker at this size;
            a gradient across the shape gives it a lit side and a shadowed one,
            which is what "shiny" is — the eye reads the variation as a
            surface catching light rather than as two colours.

            Diagonal rather than vertical, so the highlight runs across the
            star's points instead of banding it horizontally. Referenced by id
            from the icon's fill, which is why it lives in the document rather
            than in a style attribute — SVG paint servers can't be inlined. */}
        <linearGradient id="sparkle-shine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="45%" style={{ stopColor: "var(--brand-lite)" }} />
          <stop offset="100%" style={{ stopColor: "var(--brand)" }} />
        </linearGradient>

        {/* Flat white for every orb.

            Every dot is written to full white regardless of how the orb shaded
            it — coefficients zero, offsets 1 — so the depth shading goes and
            the sphere reads as an even scatter of dots rather than one with a
            far side. That's the trade for actually being white: the dimmed
            dots were exactly what made it look grey.

            Alpha is multiplied by 2.2, not passed through and not forced.

            Forcing it to 1 would be "100% opacity" in the literal sense and
            fill the whole canvas with a white square — the transparency
            between the dots is the drawing. Passing it through was the
            previous version, and it's why the orb stayed faint at full white:
            the connecting design draws most of its constellation at low alpha,
            so making the dots whiter changed nothing about how much of them
            was there. Multiplying scales what exists — faint dots clamp up
            towards solid, the empty space between them stays empty because
            anything times zero is still zero. */}
        {/* The launcher's orb: a few dots fattened and lit, the rest as-is.

            The dots can't be addressed individually — they're painted into a
            canvas by the library, and there's no handle on any one of them
            from out here. What there is, is brightness: the orb dims the dots
            on its far side, so the brightest are always the ones nearest the
            viewer. Selecting on that is better than picking dots by name
            would have been, because *which* dots qualify changes as the orb
            turns. They travel with it instead of sitting in fixed spots.

            The chain, in order:

            base   — the flat-white treatment the other orbs get.
            picked — alpha put through a very steep ramp that only clears zero
                     above ~0.97, which leaves two or three dots at the very
                     front and discards the rest. This is the dial for how
                     many: at ~0.85 it was most of the near face, which read
                     as the whole orb being chunky rather than as a few dots
                     catching the light. Raise the intercept for fewer, lower
                     it for more — and note the ramp has to stay steep as well
                     as high, or the dots either side of the cut come through
                     part-lit and blur the effect back into a general glow.
            fat    — dilate, which grows those survivors by a pixel and a
                     half. Morphology works on alpha, so it fattens the dot
                     shapes rather than smearing colour.
            glow   — the same fattened dots blurred wide, laid *under*
                     everything as bloom.

            Merged glow → base → fat, so the enlarged dots sit on top of the
            ordinary ones and their halo sits beneath both. The filter region
            is oversized because a blur that reaches past the default box gets
            cut off square, and a clipped glow is worse than none. */}
        <filter
          id="orb-launcher"
          colorInterpolationFilters="sRGB"
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
        >
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 2.2 0"
            result="base"
          />
          <feComponentTransfer in="SourceGraphic" result="picked">
            <feFuncA type="linear" slope="24" intercept="-23.3" />
          </feComponentTransfer>
          <feMorphology in="picked" operator="dilate" radius="1.5" result="fatAlpha" />
          <feColorMatrix
            in="fatAlpha"
            type="matrix"
            values="0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 1 0"
            result="fat"
          />
          <feGaussianBlur in="fat" stdDeviation="3" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="base" />
            <feMergeNode in="fat" />
          </feMerge>
        </filter>

        {/* The thread's orbs: the same highlights, without the dilate.

            Identical chain to #orb-launcher minus the feMorphology step, so
            the same two or three leading dots are picked out and lit but keep
            the size they were drawn at. The glow alone is enough to say
            "these are the ones at the front"; fattening them as well is
            detail for the orb that sits still and is looked at, not for the
            ones that appear beside text mid-read.

            A slightly tighter blur than the launcher's, 2.5 against 3 — with
            no dilated core underneath it, a wide halo has nothing solid at
            its centre and goes straight back to being haze. */}
        <filter
          id="orb-chat"
          colorInterpolationFilters="sRGB"
          x="-30%" y="-30%" width="160%" height="160%"
        >
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 2.2 0"
            result="base"
          />
          <feComponentTransfer in="SourceGraphic" result="picked">
            <feFuncA type="linear" slope="24" intercept="-23.3" />
          </feComponentTransfer>
          <feColorMatrix
            in="picked"
            type="matrix"
            values="0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 1 0"
            result="lit"
          />
          <feGaussianBlur in="lit" stdDeviation="2.5" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="base" />
            <feMergeNode in="lit" />
          </feMerge>
        </filter>

        {/* Purple ink for the beige theme, flat.

            #6D33AA — the value sampled off the logomark, so the orb and the
            mark in the panel header are the same purple rather than two that
            nearly agree.

            The orb has been round this whole loop — purple, terracotta,
            black, then the bubble's own beige — and purple is where it
            started for a reason: it's the only one of them that carries the
            brand rather than the surface. The warm options all read as
            belonging to the pane, which is exactly why they kept coming out
            either invisible or like more text.

            No highlight chain: no dilated dots, no bloom. Those earn their
            place on the dark theme, where white ink has nothing but its own
            light to separate it from the pane. A saturated mark on pale paper
            already reads clearly, and the glow only muddies the colour it's
            meant to show off.

            Alpha 1.6 rather than the white version's 2.2, which exists to
            survive a dark backdrop and here just fills the gaps between dots
            until the sphere is a solid blob.

            0.427 / 0.200 / 0.667 because feColorMatrix takes channels as 0–1
            floats, not hex. */}
        <filter id="orb-launcher-ink" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={ink} />
        </filter>

        <filter id="orb-chat-ink" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={ink} />
        </filter>

        {/* The white theme's orb — the one problem the ink filter above can't
            solve.

            On the dark themes the orb looks lit because its dots are brighter
            than the pane. Every dot is a light source, and the alpha the
            package varies between them reads straight off as luminosity: near
            dots blaze, far dots fade, and the eye assembles a sphere turning
            in light. None of that survives on white paper, because nothing
            can be brighter than the page. Flattening every dot to one purple
            — what the ink filter does — keeps the mark legible and throws the
            depth away, which is why it reads as a sticker.

            So the same signal is kept and pointed somewhere else. Instead of
            alpha → brightness, alpha → depth *and* hue: faint dots come out a
            pale cool lilac, solid dots a deep saturated violet. That's how
            depth actually looks on paper rather than in the dark — distance
            washes toward the surface and cools, nearness darkens and
            saturates, which is the same aerial perspective that makes far
            hills blue. The sphere still turns; it's just modelled in ink
            rather than in light.

            Two passes, because feColorMatrix can only paint one flat colour.
            The first copies alpha into RGB, so each dot's opacity becomes a
            number the next stage can read. The second maps that number onto
            the purple ramp through a table. Nothing here is per-position —
            it's all driven by the dot's own alpha, so it tracks the animation
            for free.

            feFuncA lifts the faint end. Left alone, far dots would be both
            pale *and* transparent, which is the same lightening applied
            twice, and the back of the sphere would disappear into the pane.

            The curve has to start at 0. A table's first value is what input 0
            maps to, so lifting the faint end by raising that entry lifts the
            *empty* pixels with it — every transparent pixel in the canvas
            becomes partly opaque and the orb arrives inside a lilac square.
            Pinning the first entry to 0 and putting the lift in the entries
            above it bends the same curve without moving nothing to
            something.

            */}
        {/* Dots first, colour second. feMorphology takes the max in its
            kernel, so dilating grows each dot outward from its own centre and
            leaves the gaps between them alone — the constellation gets
            heavier without getting denser, which is the difference between
            fattening the dots and filling the sphere in.

            Radius is in the canvas's own coordinates, and the orb is drawn at
            64 and scaled to 36, so it buys about half of that back on screen.
            It runs before the colour stages because the ramp reads each
            pixel's alpha: dilate afterwards and the newly-grown edges would
            already be locked to the old dot's colour instead of picking up
            the ramp themselves. */}
        <filter id="orb-chat-lit" colorInterpolationFilters="sRGB">
          <feMorphology operator="dilate" radius="0.25" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 1 0
                    0 0 0 1 0
                    0 0 0 1 0
                    0 0 0 1.4 0"
          />
          <feComponentTransfer>
            <feFuncR type="table" tableValues={chatLit.r} />
            <feFuncG type="table" tableValues={chatLit.g} />
            <feFuncB type="table" tableValues={chatLit.b} />
            <feFuncA type="table" tableValues="0 0.55 0.82 1" />
          </feComponentTransfer>
        </filter>

        {/* The launcher's copy of the same ramp, one step deeper at the near
            end. It sits on the composer rather than in the thread, where it's
            the only mark on a wide empty white field and has no text around
            it to borrow contrast from. */}
        <filter id="orb-launcher-lit" colorInterpolationFilters="sRGB">
          <feMorphology operator="dilate" radius="0.3" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 1 0
                    0 0 0 1 0
                    0 0 0 1 0
                    0 0 0 1.4 0"
          />
          <feComponentTransfer>
            <feFuncR type="table" tableValues={launcherLit.r} />
            <feFuncG type="table" tableValues={launcherLit.g} />
            <feFuncB type="table" tableValues={launcherLit.b} />
            <feFuncA type="table" tableValues="0 0.60 0.86 1" />
          </feComponentTransfer>
        </filter>
      </svg>


      {/* Transcript. A separate pane above the composer rather than more rows
          inside it: the composer stays put as the thread grows, which is what
          keeps the field where the hand already is.

          Opens to its full size on the first message rather than growing with
          the thread — the messenger arrives as a room to talk in, not as a
          box that inflates a line at a time under the reply being read.

          Sized outright rather than by ratio, and on its own numbers rather
          than the composer's. The max-height below still overrides the height
          on short screens — a panel taller than the window can't be scrolled
          to, so the declared height has to be a target rather than a
          guarantee. */}
      {(
        <div
          /* Absolute, sitting on top of the composer rather than stacked above
             it in the column.

             That's what buys the scale. A transform doesn't change the space
             an element occupies, so a panel left in the flow would hold its
             full 640px of column whether it was scaled to nothing or not, and
             push the composer down the screen the whole time it was shut.
             Out of flow, it can be any size it likes and the composer never
             moves. bottom-full puts its lower edge on the composer's upper
             one; mb-2 restores the gap the flex gap used to provide. */
          /* z-10 to keep the panel above the composer, which it was for free
             until the composer needed `position: relative` for the launcher's
             ring. Positioned elements paint over static ones, so that one
             class quietly reversed the two — and the composer's own drop
             shadow, which had been harmlessly covered by the panel, started
             landing on the join and greying a band across it. Both surfaces
             are pure white; the seam was shadow. */
          /* justify-end so the fixed-height contents inside sit against this
             box's bottom edge. Growing from 0, that is what makes the window
             unfold upward out of the pill — the last line of the
             conversation is against the composer from the first frame and
             everything above it is revealed, rather than the whole thing
             being drawn small and stretched. */
          className={`pointer-events-auto absolute inset-x-0 bottom-full z-10 flex flex-col justify-end overflow-hidden ${
            unified ? "" : "mb-2"
          }`}
          aria-hidden={!chatOpen}
          style={{
            /* One pixel into the composer rather than exactly on it. Both
               edges land on fractional device pixels at some zoom levels, and
               "exactly flush" then renders as a hairline of host page between
               two white boxes — dark ticks along the seam over photography.
               Overlapping white on white by 1px costs nothing visible and
               leaves rounding no gap to expose. */
            ...(unified ? { bottom: "calc(100% - 1px)" } : null),
            /* Unified: the panel's lower corners square off and its gap goes,
               so its bottom edge lands flush on the composer's top and the
               two read as one surface rather than two stacked ones.

               Except in the list, where there is no composer under it to be
               flush against. Square corners exist to hide a join; with
               nothing joined they're just a panel with its bottom cut off. */
            /* Square on a phone. A radius is what tells you a surface has an
               edge and something behind it; when the surface is the screen,
               the only thing a rounded top corner reveals is a sliver of the
               host page in a place that reads as a rendering fault. */
            borderRadius: phone
              ? 0
              : unified && !listOnly
                ? `${SURFACE_RADIUS}px ${SURFACE_RADIUS}px 0 0`
                : SURFACE_RADIUS,
            maxWidth: "100%",
            /* Only the scaled variant declares a height here — merged, the
               height *is* the animation and is set in the spread below. */
            ...(unified ? {} : { height: geo.chatH }),
            /* Leaves room for the composer, the gap between them and the page
               inset — dvh rather than vh so a mobile browser's collapsing
               toolbar doesn't push the top of the panel off-screen.

               120px, down from 200. The reserve only has to cover what's
               actually below the panel: a 64px composer, the 8px gap and up
               to 32px of page inset, which is ~104. The old 200 was guessing
               generously, and the cost of guessing high is invisible — the
               declared height silently stops being what you set. At 800 that
               mattered: on a typical laptop the panel was landing 100px short
               of its number with nothing to say why. */
            /* The 120px reserve is the composer plus page inset, and on a
               phone there is no page inset and the height is already dvh —
               so the reserve is the foot alone. Keeping 120 here would take a
               second bite out of a screen that has nothing spare. */
            maxHeight: phone ? "100svh" : "calc(100dvh - 120px)",
            /* Glass mutes what's behind it. It does not amplify it.

               saturate sat at 180% for a long time here, which is the usual
               glassmorphism advice and wrong for this page: the backdrop is
               lavender, and boosting its saturation pushed that purple
               through the pane until the panel stopped being an object and
               became a tint laid over the hero. At 70% the backdrop is pulled
               toward neutral instead, so the colour still bleeds — enough to
               know what's behind — but grey is what the panel is made of. The
               reference reads as a distinct pane for exactly this reason.

               Blur at 44. It went to 72 once and that was too far — the page
               averaged into one flat field, and a single even colour behind
               glass is indistinguishable from paint. 44 keeps a trace of the
               page's structure while diffusing it well past recognition.

               brightness(1.08) is the frost proper, and the part a blur alone
               can't give. Etched glass scatters light rather than only
               spreading it, which lifts the dark end of whatever is behind
               it — shadows go milky instead of staying black. Without this
               the pane is a smooth blur, which reads as looking through
               something wet rather than through something frosted.

               Fill carries the rest: 58,58,62 at 0.58 → 0.50. Left where it
               was, since raising the backdrop's black level already lightens
               the pane, and lifting both would undo the darkening. */
            background:
              t.pane,
            backdropFilter: t.paneFilter,
            WebkitBackdropFilter: t.paneFilter,
            /* Unified needs the shadow pulled clear of its own lower edge.
               The panel is absolutely positioned, so it paints above the
               static composer directly beneath it — and the theme's shadow is
               offset *downward* (0 8px 32px), which lands squarely on the
               composer's top, greys it and draws the exact seam the merge
               exists to remove. Both surfaces are pure white; that band was
               shadow, not fill.

               The -14px spread is what fixes it: the shadow rectangle shrinks
               before being offset, so the blur ends above the panel's own
               bottom edge and nothing reaches the composer. Aiming it upward
               alone wasn't enough — a 34px blur still bleeds well past the
               edge it started from. */
            boxShadow: unified
              ? /* No cast of its own any more — the shadow ghost at the top
                   of the column wraps the panel and composer as one
                   silhouette. A directional shadow here fought the ghost and
                   the composer's at the seam, which was visible as a lighter
                   notch at the window's waist. */
                "none"
              : t.ring,
            /* Which way it's travelling is decided here rather than by a
               class, because both directions have to be able to run on the
               same element — the exit only exists because the element is
               still mounted with chatOpen already false.

               pointer-events off on the way out so a click during the drop
               can't land on a panel that's leaving. */
            /* The scale is the whole point. It takes the contents with it —
               the header, the thread, every glyph — so the panel reads as
               growing rather than as a box being drawn at increasing sizes.
               Animating height instead lays the contents out at full size the
               whole way, which is why that version felt like only the window
               opening.

               0.7, after 0.92 and 0.86 both read as the box growing rather
               than the panel expanding. A 14% change is inside the range the
               eye writes off as the thing settling; 30% is unmistakably a
               different size.

               The curve matters as much as the distance. ease-out front-loads
               — at 320ms most of the growth was over inside 80ms, so there
               was nothing left to watch. cubic-bezier(.25,.1,.25,1) is plain
               ease: it starts gently, spends its speed in the middle where
               you can see it, and settles. That's the curve measured off
               Intercom's own messenger frame.

               Opacity is deliberately quicker than the scale, 230ms against
               540. Matching them leaves the panel faint while it's smallest,
               so you watch it fade in and miss it growing; arriving solid
               early means the growth is the only thing left to notice.

               Origin at bottom centre, not the default middle — and this is
               the part that was wrong. Scaling about the middle leaves the
               small panel floating clear of the composer and growing in both
               directions at once, which reads as a box appearing in mid-air.
               Anchored at the bottom, the edge nearest the composer stays
               put and everything unfolds upward out of it.

               Measured, not guessed: Intercom's own messenger frame carries
               transform-origin 175px 571px on a 350x571 box — exactly bottom
               centre. The scale makes the contents grow; the origin decides
               where they grow from, and both are needed. */
            /* Merged: the window is one box growing out of the pill, so it
               animates its own width and height rather than being a finished
               panel shown at 70% and scaled up.

               A scale was right when the panel was a separate object arriving
               above the composer — it reads as something approaching. Once
               the two are one surface it's wrong twice over: the contents are
               the wrong size for most of the animation, and the panel's width
               is inherited from the transform while the composer's comes from
               layout, so the two halves visibly disagree on how wide the
               "single" surface is the whole way up.

               Growing the box instead means the contents are laid out at
               their real size from the first frame, and both halves take
               their width from the same number. Height from 0 with the
               bottom edge pinned to the composer's top is what makes it
               unfold upward out of the pill.

               Same duration and curve on both, or the seam between them
               moves. */
            ...(unified
              ? {
                  width: paneWidth,
                  /* The panel is the total minus whatever the foot takes, and
                     in the list the foot takes nothing — so it gets the
                     whole surface rather than leaving a composer-shaped hole
                     under it.

                     Written as the same subtraction with a zero rather than as
                     a second height, so the two views can't disagree about how
                     tall the window is: UNIFIED_HEIGHT[spot] stays the one
                     number that describes the merged surface at this
                     placement, and the foot is the only thing that varies. */
                  /* On a phone the total is the screen rather than either. dvh
                     rather than vh: a mobile browser's toolbar collapses as
                     you scroll, and vh is measured against the tallest state
                     — so the panel would sit taller than the visible area and
                     push its own composer under the chrome. */
                  /* 0 → its open height and back: this element is the clip
                     box, and `panelH` (where it's declared) carries both the
                     number and the reasoning about svh, the measured foot,
                     and why the contents are sized from it rather than by
                     it. */
                  height: chatOpen ? panelH : 0,
                  /* No transition. The merged panel opens and closes by
                     simply being there or not.

                     It animated its height for a long time, and every
                     version of that was worse than none: growing the box
                     with the thread inside it relayouted the transcript on
                     every frame, and pulling the contents out to a fixed
                     height so the box only revealed them still left a
                     280ms wipe that read as slow next to a window that
                     could have just appeared. A messenger opening is not a
                     moment anyone needs narrated — the click already said
                     what was going to happen, and the fastest possible
                     confirmation is the thing being open.

                     Kept as an explicit `none` rather than deleted, so the
                     next person to reach for a transition here reads this
                     first. */
                  transition: "none",
                  /* No willChange either. It was hinting at a height that
                     was about to animate; nothing here animates now, and a
                     standing hint just holds a compositor layer for the
                     session in exchange for nothing. */
                }
              : {
                  transformOrigin: "bottom center",
                  transform: chatOpen ? "scale(1)" : "scale(0.7)",
                  opacity: chatOpen ? 1 : 0,
                  transition: `transform ${PANEL_MS}ms cubic-bezier(0.25, 0.1, 0.25, 1), opacity 230ms ease-out`,
                }),
            pointerEvents: chatOpen ? "auto" : "none",
          } as CSSProperties}
        >
          {/* The window, at its full size from the first frame.

              Everything below — the header, the thread, the thinking row —
              lays out once against this height and is then revealed by the
              box above growing to meet it. Sized rather than flexed, and
              shrink-0 so the growing parent can't compress it: the moment
              this height follows the parent's, the thread is relayouting on
              every frame of the animation again, which is the stutter this
              exists to remove. */}
          <div
            className="flex w-full shrink-0 flex-col"
            style={{ height: panelH }}
          >
          {/* 62px, from 13px of padding either side of the 36px logomark —
              the tallest child, so the band's height is a fact about its
              contents plus two equal margins rather than a number kept in
              sync with them by hand. Padding, not a declared height: Design's
              own header (app/design's AgentPreview) uses a flat 60px for
              the same reason a declared height usually wins here — swapping
              an icon size shouldn't silently move the header — but 62 isn't
              a round number any control in this row measures, so there's
              nothing to centre a fixed height against except the padding
              itself.

              Pinned by structure rather than position: this is a shrink-0
              sibling of the scrolling thread, so it holds while the thread
              moves under it, and no stacking context or sticky offset is
              involved. */}
          {/* The header clears the status bar on a phone.

              The panel starts at the very top of the viewport when it is
              full-screen, and on a notched device that top is underneath the
              clock and the dynamic island. The row keeps its own 13px of top
              padding and the inset is added above that, so the title sits
              below the hardware rather than the row being made taller and
              the title floating in the middle of it. Zero everywhere without
              a safe area. */}
          <div
            /* 62px from padding, not a declared height: 13px top and bottom
               around the 36px logomark (the tallest child) is 13+36+13=62,
               so the band is a fact about its contents plus two equal
               margins rather than a number that has to be kept in sync with
               them by hand. */
            className="flex shrink-0 items-center gap-2.5 px-5 py-[13px]"
            style={
              phone
                ? {
                    /* The safe-area inset adds to the top padding rather than
                       replacing it — the notch needs clearing, but the 13px
                       that centres the logo in the 62px band is still owed
                       on top of that clearance, or the row is 62px only on a
                       phone with no inset to begin with. */
                    paddingTop: "calc(13px + env(safe-area-inset-top, 0px))",
                  }
                : undefined
            }
          >
            {/* Back goes up a level to the conversation list rather than out
                of the panel — which is what the glyph has always promised.
                It used to exit and clear the thread, and a left chevron that
                destroys what you were reading is the wrong shape for the
                icon; leaving is the chevron on the right's job.

                Nothing is torn down on the way: the thread, the pending
                reply and the stream all keep running, so coming back finds
                the conversation exactly where it was left, mid-answer if
                that's when you stepped away.

                A toggle rather than a one-way trip. In the thread it opens the
                list; in the list it goes back to the conversation you came
                from — which is the only other place there is, and it means the
                header is one control doing one job in both views rather than
                a chevron that works on one screen and is dead on the other. */}
            {/* h-9 + overflow-y-hidden, hard rather than arithmetic.

               Every child on the left is now pinned to 36px or less by its
               own explicit size — the 32px buttons, the 36px logomark, the
               36px-pinned title stack — and by CSS's own rules that should
               already cap this row at 36. It measured 37 anyway (confirmed
               with an actual measuring tool, not another guess), which
               means something in that chain — browser font metrics, a
               flexbox cross-axis quirk, a rounding step I can't see without
               a browser — is adding half a pixel somewhere I haven't found.
               Rather than keep hunting for which of five children it is,
               this box just refuses to be anything but 36: clipping means
               whatever the true cause is, it can no longer reach the row's
               rendered height, only get quietly cropped at the edge it was
               already invisibly bleeding past.

               overflow-y-hidden, not overflow-hidden — plain overflow-hidden
               clips both axes, and this row's only job is capping the one
               that measured wrong. Horizontal clipping here is still live
               risk if anything in the row ever needs to sit outside its
               bounds again (the back button did, briefly, before its own
               negative margin was removed for a different reason — see
               below), so the narrower axis-specific property is the one
               that only does what it's here to do.

               The right-hand menu cluster stays outside this wrapper on
               purpose — its dropdown opens downward past 36px on purpose,
               and clipping it here would hide the menu along with the
               pixel. */}
            <div className="flex h-9 min-w-0 flex-1 items-center gap-2.5 overflow-y-hidden">
            <button
              type="button"
              aria-label={
                view === "history" ? "Back to the conversation" : "Back to conversations"
              }
              onClick={() => swapView(view === "history" ? "thread" : "history")}
              /* No -ml-1.5 any more. It was pulling the button's optical
                 edge onto the same 20px inset the messages below use, sized
                 against the button this was when it was 28px — at 32px the
                 same pull put it only 14px from the header's left edge, and
                 the panel's own top-left corner rounds at 32px (unified) —
                 close enough to the corner's curve that the button's hover
                 circle was landing partly outside it and getting clipped by
                 the panel's own overflow-hidden. Flush in the padding is a
                 few px off the message's own inset, which is a smaller cost
                 than a control that visibly loses its hover ring. */
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--ink-mute)] transition-colors hover:bg-[var(--fill)] hover:text-[var(--ink)]"
            >
              <ChevronLeft className="size-5" strokeWidth={1.5} aria-hidden />
            </button>

            {/* The identity line, in the conversation only.

                The logomark, not the orb. A header is an identity line — it
                says who you're talking to and then holds still — where the
                orb is an activity indicator, and one animating permanently
                next to a static label reads as perpetual thinking. The orb
                stays where it means something: the resting composer.

                Absent in the list, because there is nobody being talked to
                there. A mark that means "this is who you're with" over a
                screen of past conversations is decoration, and it would sit
                against three more discs in the column below it.

                alt="" because the label beside it already says the name, and
                a screen reader announcing it twice is worse than not at all.
                Plain <img> to match the nav, which loads the same file.

                rounded-full, not the squircle this used to be. The squircle
                existed to disguise a square tile behind a round logo file —
                sampling the tile's fill from the image's own colour so only
                the squircle's corner shape showed past the circle's edge.
                Brightline's mark is already the full circle, tile and all
                (its own orange fill baked in), so a round tile behind it is
                the shape it's actually asking for rather than a corner
                treatment standing in for one. */}
            {view !== "history" && (
              <span
                /* -ml-0.5 pulls this 2px tighter to the back button than the
                   row's own 10px gap — 8px there, still 10px on to the
                   title, so the one pair changes without the other having
                   to be re-specified to hold still. */
                className="-ml-0.5 flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full"
                style={{ backgroundColor: "var(--brand)" }}
              >
                {/* A tenant without a mark file gets its monogram on the
                    brand tile — same size, same round shape, so the header
                    doesn't change shape between tenants. */}
                {content.logomark === undefined ? (
                  <img src="/tars-logomark.png" alt="" className="size-full" />
                ) : content.logomark ? (
                  <img src={content.logomark} alt="" className="size-full" />
                ) : (
                  <span className="text-[12px] font-bold text-white">
                    {content.monogram ?? content.agentName.slice(0, 2).toLowerCase()}
                  </span>
                )}
              </span>
            )}

            {/* Named for what the screen is, since the two screens aren't the
                same kind of thing: one is a conversation with someone, the
                other is a list of them.

                Two lines when there's a subtitle to put on the second one —
                the name carries the weight, the subtitle sits under it in
                the pane's muted ink, same pairing Design's own header uses
                ("Tars" / "Virtual Assistant"). The list view has neither: a
                subtitle under "Conversation history" would be describing the
                screen, and the screen already has a name for that. */}
            {view === "history" || !content.subtitle ? (
              <span className="text-[14px] font-semibold tracking-tight text-[var(--ink-soft)]">
                {view === "history" ? "Conversation history" : content.headerTitle}
              </span>
            ) : (
              /* h-9, pinned — not left to add up to 36 on its own. 18+4+14
                 does the arithmetic right, but arithmetic is exactly what
                 put this a pixel over the first two times: it only takes
                 the browser rounding one of those three numbers a fraction
                 differently to be back explaining the same pixel again.
                 Pinning the box to the logomark's own 36px and centring the
                 two lines inside it makes them agree by construction — the
                 height is 36 because the box says so, not because three
                 numbers were added up correctly this time. */
              <span className="flex h-9 min-w-0 flex-col justify-center">
                <span className="truncate text-[14px] leading-[18px] font-semibold tracking-tight text-[var(--ink-soft)]">
                  {content.headerTitle}
                </span>
                {/* --ink-faint, not --ink-mute: the icons beside this use
                   ink-mute (Design's `neutral.secondary`, #6B7280), and the
                   subtitle is a step lighter than that in the reference
                   (`neutral.muted`, #9CA3AF) — ink-faint is the matching
                   token, not a lighter copy of the icon colour.

                   Exact pixel line-heights, not leading-none or
                   leading-tight — both were tried and both were wrong in a
                   different direction. leading-none (line-height:1) is
                   tighter than a font's own ascent+descent, and stacked
                   under `truncate` — overflow:hidden, for the ellipsis — it
                   cropped exactly what the shrunk line-height left hanging
                   below it: the descender on a "g", "y", "p". "Brightline"
                   has one. leading-tight (1.25) fixed that but overshot the
                   other way: 14×1.25 + 12×1.25 + this 4px margin is 36.5px,
                   half a pixel more than the 36px logomark beside it, so the
                   stack — not the logo — became the tallest child, and the
                   62px header (13px padding either side of what was meant
                   to be a 36px content group) grew with it. 18px and 14px
                   are exact, not multiples of the font-size — 18+4+14 is 36
                   on the nose, matched to the logomark rather than derived
                   from it, with still more headroom over each font-size (18/14 ≈
                   1.29, 14/12 ≈ 1.17) than leading-none had. */}
                <span className="mt-1 truncate text-[12px] leading-[14px] text-[var(--ink-faint)]">
                  {content.subtitle}
                </span>
              </span>
            )}
            </div>
            {/* The two right-hand controls are grouped rather than spaced by
                the header's own gap: 10px between the title and the first
                icon separates a label from a control, but the same 10px
                between two adjacent icons reads as two unrelated buttons
                instead of one cluster. 4px pairs them. */}
            <span
              className="relative -mr-1 ml-auto flex items-center gap-1"
              ref={menuRef}
            >
              {/* No menu behind it yet — the project has no dropdown primitive,
                  so this is the affordance without the panel it would open.
                  aria-haspopup is set so the intent is recorded in one place
                  when it is wired up. */}
              <button
                type="button"
                aria-label="More options"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
                className="flex size-8 items-center justify-center rounded-full text-[var(--ink-mute)] transition-colors hover:bg-[var(--fill)] hover:text-[var(--ink)]"
                style={menuOpen ? { backgroundColor: t.fill } : undefined}
              >
                <MoreVertical className="size-5" strokeWidth={1.5} aria-hidden />
              </button>

              {/* The menu, hung off the header's right edge.

                  Absolute inside the control cluster rather than a portal:
                  the panel has its own stacking and its own overflow, and a
                  menu rendered at the document root would need both of those
                  reproduced to sit in the right place. It opens downward into
                  the transcript, which is the one direction there is always
                  room in.

                  right-0 so it grows leftward from the button it belongs to —
                  anchored left it would run off the panel's edge, since the
                  button is already against it.

                  Three items and no submenus: this is a conversation, not an
                  application, and a menu that needs scrolling in a 620px
                  window is a settings screen wearing a popover. */}
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute top-full right-0 z-40 mt-1 flex w-[210px] flex-col rounded-[12px] p-1"
                  style={{
                    /* `background`, not `backgroundColor`: two of the themes
                       set their pane to a gradient, and a gradient assigned to
                       the colour property is dropped silently — the menu would
                       come out transparent on exactly the surfaces where being
                       in front matters most. */
                    background: t.pane,
                    /* The same two-layer lift the citation card uses. This
                       lands on a surface its own colour, so an edge and a
                       shadow are all it has to say it's in front. */
                    boxShadow:
                      "0 16px 36px -10px rgba(15,17,26,0.30), 0 3px 10px -2px rgba(15,17,26,0.12), 0 0 0 1px rgba(15,17,26,0.12)",
                    animation: "option-in 140ms cubic-bezier(0.25,0.46,0.45,0.94) both",
                    transformOrigin: "top right",
                  }}
                >
                  {[
                    /* "New conversation", not "Restart" — restart is what the
                       code does, a new conversation is what the visitor gets.
                       Same label Design's own header menu uses. */
                    {
                      key: "restart",
                      label: "New conversation",
                      Icon: RotateCcw,
                      run: restart,
                      toggle: false,
                    },
                    {
                      key: "download",
                      label: "Download transcript",
                      Icon: Download,
                      run: downloadTranscript,
                      toggle: false,
                    },
                    /* The label is the action, not the state. "Auto-read" with
                       a tick beside it makes you work out which way the tick
                       points; "Turn off auto-read" says what happens when you
                       press it, which is the only thing a menu item has to
                       say. The switch beside it says the state, so the row
                       carries both without the label having to do two jobs —
                       and the icon stays Volume2 either way, since it labels
                       what the setting is about rather than which way it is
                       currently set. */
                    {
                      key: "autoread",
                      label: autoRead ? "Turn off auto-read" : "Turn on auto-read",
                      Icon: Volume2,
                      run: () => setAutoRead((v) => !v),
                      toggle: true,
                    },
                    /* Placement, in the menu, for the demo.

                       This is not where a visitor would ever change it —
                       where the widget sits is the site's decision, made once
                       in Design and shipped — so these two rows are here to
                       be shown, not to be shipped. They are in the menu
                       rather than on a bar of their own because the menu is
                       already the header's "everything else", and a demo
                       control that needs its own chrome is a demo of the
                       chrome.

                       Only the other side is offered. A row that moves it
                       where it already is does nothing when pressed, and a
                       menu item that does nothing is a bug the first time
                       anyone tries it — so the right-hand launcher offers
                       left, and vice versa, and the centred one offers both.

                       Moving it is a placement change, not a nudge: the
                       corner geometry is a different shape from the centred
                       one — 400 wide and 640 tall against 600 by 550 —
                       because a launcher with an edge to hang from spends
                       its room on height, where a centred one has none and
                       spends it on width. Pressing these shows that, which
                       is the thing worth showing. */
                    ...(spot === "left"
                      ? []
                      : [
                          {
                            key: "left",
                            label: "Move to the left",
                            Icon: ArrowLeftToLine,
                            run: () => setMoved("left"),
                            toggle: false,
                          },
                        ]),
                    ...(spot === "right"
                      ? []
                      : [
                          {
                            key: "right",
                            label: "Move to the right",
                            Icon: ArrowRightToLine,
                            run: () => setMoved("right"),
                            toggle: false,
                          },
                        ]),
                  ].map(({ key, label, Icon, run, toggle }) => (
                    <button
                      key={key}
                      type="button"
                      role={toggle ? "menuitemcheckbox" : "menuitem"}
                      aria-checked={toggle ? autoRead : undefined}
                      onClick={() => {
                        run();
                        /* The switch stays open: this one is a setting, and
                           closing the menu on it hides the state that was
                           just changed. The other two are actions and have
                           somewhere to go. */
                        if (!toggle) setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-[8px] px-2 py-1.5 text-left text-[13px] text-[var(--ink-soft)] transition-colors hover:bg-[var(--fill)] hover:text-[var(--ink)]"
                    >
                      <Icon
                        className="size-4 shrink-0 text-[var(--ink-mute)]"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                      {toggle ? <span className="flex-1">{label}</span> : label}
                      {toggle && (
                        <span
                          aria-hidden
                          className="relative h-4 w-7 shrink-0 rounded-full transition-colors"
                          style={{
                            background: autoRead ? "var(--brand)" : t.fillHover,
                          }}
                        >
                          <span
                            className="absolute top-0.5 size-3 rounded-full bg-white transition-all"
                            style={{ left: autoRead ? 14 : 2 }}
                          />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Puts the thread away without ending it — the messages survive,
                  and sending again brings them back. Clearing on collapse
                  would make a mis-click cost the conversation.

                  setOpen(false) alongside it, and this is the part that isn't
                  obvious: `open` is the hover flag, set while the cursor is
                  near the composer and still set if it hasn't moved away.
                  Closing the panel without clearing it just uncovered that
                  state — the composer stayed wide with the starter chips out
                  and attach in place of the orb, which looks like the close
                  put the launcher into a focused state rather than putting it
                  away. Clearing it returns to the resting chip, and hovering
                  it again can set it back. */}
              <button
                type="button"
                aria-label="Collapse the conversation"
                onClick={closeChat}
                className="flex size-8 items-center justify-center rounded-full text-[var(--ink-mute)] transition-colors hover:bg-[var(--fill)] hover:text-[var(--ink)]"
              >
                {/* X, not a chevron — what it does is put the thread away
                    (the messages survive, per the comment above), but a
                    chevron reads as "collapse this section," which is a
                    document affordance. X reads as "I'm done here," which is
                    what the visitor is actually doing, and it's the glyph
                    Design's own header uses. */}
                <X className="size-5" strokeWidth={1.5} aria-hidden />
              </button>
            </span>
          </div>

          {/* Its own element, not a border-bottom on the header. The two read
              the same — a hairline where the header ends — but a border is
              part of the header's own box: it sits inside whatever height
              the header measures to, and the last time this line lived there
              it left a header that was "37px" by one measurement and "36px"
              by another depending on whether the border was included in what
              got measured. A separate 1px strip has no box of its own to
              blur into — it's just the line, sized to exactly what it is. */}
          <div className="h-px shrink-0" style={{ backgroundColor: "var(--divider)" }} />

          {/* flex-1 min-h-0 is what makes the fixed height usable: the thread
              takes the space the header leaves and scrolls inside it, rather
              than a flex child refusing to shrink below its content and
              pushing the panel past its own square. */}
          {/* Scrollbar hidden, scrolling kept. Two declarations because the
              engines disagree: scrollbar-width is the standard property, and
              WebKit still only answers to the ::-webkit-scrollbar
              pseudo-element. Setting just one leaves the bar showing in half
              the browsers. */}
          {/* Two screens on one rail.

              Both views are mounted side by side and the rail slides between
              them, the way a pushed screen and the one it came from move on a
              phone: the list sits to the left, the conversation to its right,
              and going back slides the pair rightward to reveal what was
              behind. A cross-fade or a swap would say the two are alternatives;
              sliding says one is inside the other, which is what the chevron
              already claims.

              Mounted rather than swapped also keeps the thread's scroll
              position, its pending reply and its stream running while you're
              in the list — stepping out and back finds the conversation where
              you left it, mid-answer if that's when you left.

              overflow-hidden on the frame is what makes it a window onto the
              rail rather than a 200%-wide panel. */}
          <div className="relative min-h-0 flex-1 overflow-hidden">
            {/* The list. Same scroll container and same insets as the thread,
               so the two views sit on identical margins and the pane doesn't
               appear to shift as they swap. */}
            <div
              className="absolute inset-0 flex flex-col overflow-y-auto px-2 pt-1 pb-4 transition-transform motion-reduce:transition-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{
                transform: view === "history" ? "none" : "translateX(-100%)",
                transitionDuration: `${VIEW_SLIDE_MS}ms`,
                transitionTimingFunction: VIEW_SLIDE_EASE,
              }}
              aria-hidden={view !== "history"}
            >
              {/* Starting a new one, at the top of the list.

                  Built to the rows' own anatomy — same radius, same insets,
                  same 36px mark in the left column — so it belongs to the list
                  rather than sitting on it. A button in another shape here
                  reads as a toolbar the list happens to begin with, and the
                  eye has to cross it before reaching what it came for.

                  Top rather than bottom: this is the one thing in the panel
                  that doesn't depend on reading the list first, and a list of
                  unknown length shouldn't hide its only action past the end of
                  it.

                  It clears the thread before switching. Without that, "new"
                  hands you back the conversation you already had — and the
                  timers behind it are cleared too, or a reply from the old
                  question lands in the empty one a second later. */}
              <button
                type="button"
                onClick={() => {
                  setMessages([]);
                  setThinking(false);
                  setStreaming(null);
                  window.clearTimeout(replyTimer.current);
                  swapView("thread");
                }}
                className="mt-1 mb-1 flex w-full items-center gap-3 rounded-[14px] px-5 py-2.5 text-left transition-colors hover:bg-[var(--fill)]"
              >
                {/* The accent, on the one control in the list that does
                    something rather than going somewhere.

                    The same fill the ready send button takes, for the same
                    reason: this is the affirmative action of the screen, and
                    the rows around it are all navigation. It reads as the
                    exception precisely because every other disc in this column
                    is the quiet grey — one purple mark in a grey list is
                    findable without being loud, where a purple row would
                    outrank the conversation you are actually in. */}
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: "var(--brand)" }}
                  aria-hidden
                >
                  <Plus className="size-4 text-white" strokeWidth={2} />
                </span>
                <span className="text-[14px] font-medium text-[var(--ink-soft)]">
                  New conversation
                </span>
              </button>

              {rows.map((section) => (
                <div key={section.group}>
                  <p className="px-5 pt-3 pb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--ink-faint)]">
                    {section.group}
                  </p>
                  {section.items.map((c) => (
                    /* The row and its menu are siblings in a positioned
                       wrapper rather than nested.

                       The row is a button, and a button cannot contain another
                       button — nor the text field the rename needs. So the
                       wrapper holds both: the row fills it, and the menu
                       control sits over the row's right-hand end, which is why
                       the row carries padding there for it to land in. */
                    <div key={c.id} className="group/row relative">
                    {renaming === c.id ? (
                      /* The rename happens in place. A dialog for one short
                         string is more apparatus than the edit deserves, and
                         editing the title where the title is means you can see
                         it against the rows either side of it while you type.

                         Enter and blur both commit, Escape cancels — the three
                         things anyone tries. Blur committing rather than
                         cancelling is the safer of the two defaults here: the
                         edit is one field with its text already in it, so
                         clicking away reads as "done", and an accidental
                         rename is undone by renaming again. */
                      /* No disc here either, so the field opens exactly where
                         the title it replaces was sitting — a rename that
                         indents the text it is editing reads as the row moving
                         rather than as the title becoming editable. */
                      <div className="flex w-full items-center rounded-[14px] px-5 py-2.5">
                        <input
                          autoFocus
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onBlur={() => commitRename(c.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitRename(c.id);
                            if (e.key === "Escape") setRenaming(null);
                          }}
                          aria-label="Conversation title"
                          className="min-w-0 flex-1 rounded-[8px] bg-transparent px-1.5 py-1 text-[14px] font-medium text-[var(--ink-soft)] outline-none"
                          style={{ boxShadow: `inset 0 0 0 1px ${t.divider}` }}
                        />
                      </div>
                    ) : (
                    <>
                    <button
                      type="button"
                      onClick={() => swapView("thread")}
                      /* The open one is marked. The thread behind this list is
                         a conversation, and it's this one — a list that shows
                         no sign of where you already are makes the back
                         chevron the only way to tell, which is a thing you
                         have to try rather than read.

                         Held fill rather than a tick or a rule: the row is
                         already a pressable block, so the state it wants is
                         the pressed one made permanent. Its hover then goes a
                         step further than the resting rows' does, or pointing
                         at the open row would look like leaving it.

                         aria-current says the same thing to a screen reader,
                         where a background colour says nothing at all. */
                      aria-current={c.id === ACTIVE_CONVERSATION ? "true" : undefined}
                      /* An even 12px inset, the same on both sides.

                         The reserve for the options control used to live here,
                         which meant every line in the row was indented for
                         something that only overlaps one of them — the
                         description stopped 40px short of an edge with nothing
                         on it. The reserve belongs to the line the control
                         sits over; this padding is just the row's margin, and
                         it is what the stamp and the control both line up
                         against. */
                      className={`flex w-full items-start gap-3 rounded-[14px] px-5 py-3 text-left transition-colors ${
                        c.id === ACTIVE_CONVERSATION
                          ? "bg-[var(--fill)] hover:bg-[var(--fill-hover)]"
                          : "hover:bg-[var(--fill)]"
                      }`}
                    >
                      {/* No avatar, and no channel chip.

                          Both were identifying things that don't vary. Every
                          row in this list is a conversation with the same
                          agent, so a mark that is identical down the whole
                          column identifies nothing — it was 36px of indent
                          bought with the width the last message needed. The
                          channel was the same argument one step weaker: a
                          widget on one site is a web conversation, and a chip
                          saying so on every row is a column of the word "Web".
                          What's left is what actually differs between two
                          rows — what it was about, where it got to, and when.

                          Status keeps its dot and loses its chip. A pill is
                          for something you can act on; this is a state you
                          read, and at 11px beside a title the dot is doing all
                          the work the fill used to. */}
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        {/* One line, and it never wraps.

                            Wrapping is what made every row a different shape:
                            where the title and the state filled the width the
                            stamp dropped to a line of its own, where they
                            didn't it stayed up — four rows of one component
                            with four layouts. The title gives way instead,
                            which is the one part of the line that can lose its
                            end and still be read.

                            The reserve on a phone is for the options control,
                            which is always drawn there; on a desktop the
                            control takes the stamp's place on hover rather
                            than sitting beside it, so the line needs no room
                            of its own for it. */}
                        <span
                          className="flex items-center gap-2"
                          style={{ paddingRight: phone ? 30 : 0 }}
                        >
                          <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-[var(--ink-soft)]">
                            {c.title}
                          </span>

                          <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-[var(--ink-mute)]">
                            <span
                              className="size-1.5 shrink-0 rounded-full"
                              style={{ backgroundColor: STATUSES[c.status].dot }}
                              aria-hidden
                            />
                            {STATUSES[c.status].label}
                          </span>

                          {/* The stamp, and the slot the options control
                              borrows.

                              It fades rather than unmounts: the control takes
                              the same corner, and a time that disappeared from
                              the layout would shorten the line and pull the
                              title along with it every time the pointer
                              crossed the row. Kept on a phone, where there is
                              no hover to trade it for. */}
                          <span
                            className={`shrink-0 text-[11px] tabular-nums text-[var(--ink-faint)] transition-opacity ${
                              rowMenu === c.id
                                ? "md:opacity-0"
                                : "md:group-hover/row:opacity-0"
                            }`}
                          >
                            {c.time}
                          </span>
                        </span>

                        <span className="min-w-0 truncate text-[13px] font-light text-[var(--ink-mute)]">
                          {c.description}
                        </span>
                      </span>
                    </button>

                    {/* The row's own controls.

                        Revealed on hover, and always present on a touch screen
                        where there is no hover to reveal it with —
                        group-hover alone would make renaming and deleting
                        unreachable on a phone. Quiet either way: this is
                        maintenance on a list you are here to read.

                        stopPropagation is not needed — the control is a
                        sibling of the row rather than inside it, so opening
                        the menu was never going to select the conversation. */}
                    <button
                      type="button"
                      aria-label={`Options for ${c.title}`}
                      aria-haspopup="menu"
                      aria-expanded={rowMenu === c.id}
                      onClick={() =>
                        setRowMenu(rowMenu === c.id ? null : c.id)
                      }
                      /* In the stamp's place, on the stamp's line.

                         12px of row padding plus half a ~20px line puts that
                         line's middle 22px down, and a 32px box centred there
                         starts at 6 — which is what top-1.5 is. Right-1.5 for
                         the same reason from the other side: the glyph is
                         ~16px inside its box, so the box's 6px inset lands the
                         dots on the row's own 12px margin rather than 6px
                         short of it.

                         32 rather than 28, because this is the one control in
                         the list that is aimed at rather than fallen into —
                         everything else here is a full-width row. Still under
                         the 44px a finger wants, which the extra 4px of hit
                         area either side of the glyph goes some way toward. */
                      className={`absolute top-1.5 right-3 flex size-8 items-center justify-center rounded-full text-[var(--ink-mute)] transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--ink)] md:opacity-0 md:group-hover/row:opacity-100 md:focus-visible:opacity-100 ${
                        rowMenu === c.id ? "md:opacity-100" : ""
                      }`}
                    >
                      <MoreHorizontal
                        className="size-4"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    </button>

                    {rowMenu === c.id && (
                      <div
                        ref={rowMenuRef}
                        role="menu"
                        className="absolute top-10 right-5 z-40 flex w-[150px] flex-col rounded-[10px] p-1"
                        style={{
                          background: t.pane,
                          boxShadow:
                            "0 16px 36px -10px rgba(15,17,26,0.30), 0 3px 10px -2px rgba(15,17,26,0.12), 0 0 0 1px rgba(15,17,26,0.12)",
                          animation:
                            "option-in 140ms cubic-bezier(0.25,0.46,0.45,0.94) both",
                          transformOrigin: "top right",
                        }}
                      >
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            /* The field opens with the current title in it and
                               selected — renaming is usually editing a word,
                               not typing from nothing. */
                            setDraft(c.title);
                            setRenaming(c.id);
                            setRowMenu(null);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-[7px] px-2 py-1.5 text-left text-[13px] text-[var(--ink-soft)] transition-colors hover:bg-[var(--fill)] hover:text-[var(--ink)]"
                        >
                          <Pencil
                            className="size-3.5 shrink-0 text-[var(--ink-mute)]"
                            strokeWidth={1.5}
                            aria-hidden
                          />
                          Rename
                        </button>
                        {/* Red, and the only red in the component. Delete is
                            the one action here that doesn't undo — the archive
                            has no store behind it, so a removed row is gone
                            for the session. The colour is the warning; a
                            confirmation step on a list of four demo rows would
                            be ceremony. */}
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            deleteRow(c.id);
                            setRowMenu(null);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-[7px] px-2 py-1.5 text-left text-[13px] text-[#DC2626] transition-colors hover:bg-[color-mix(in_srgb,#DC2626_10%,transparent)]"
                        >
                          <Trash2
                            className="size-3.5 shrink-0"
                            strokeWidth={1.5}
                            aria-hidden
                          />
                          Delete
                        </button>
                      </div>
                    )}
                    </>
                    )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

          <div
            ref={threadRef}
            /* One line of slack rather than an exact bottom. A scroll that
               lands a pixel or two short — which momentum scrolling and
               fractional device pixels both do routinely — shouldn't count as
               having left, or following would switch itself off at the moment
               you stopped scrolling. */
            /* Our own scrolling doesn't count as leaving. The follow loop
               writes scrollTop frame by frame and every write comes back
               here as an event; measured, mid-glide, they read as "away from
               the bottom" and would switch following off during the very
               scroll doing the following. A position we just wrote ourselves
               is ignored — see `lastAuto`. */
            onScroll={(e) => {
              const el = e.currentTarget;
              if (Math.abs(el.scrollTop - lastAuto.current) < 1.5) return;
              pinned.current =
                el.scrollHeight - el.scrollTop - el.clientHeight < 24;
            }}
            /* The whole gap between the last turn and the suggestions under
               it, in one place. On the merged surface the suggestion row sits
               on the composer rather than in the thread, so the distance
               between them used to be this padding plus that row's own — two
               numbers to add up, and neither of them the gap. The row's top
               padding is gone; this is the gap. */
            className={`absolute inset-0 flex flex-col gap-4 overflow-y-auto px-5 pt-4 transition-transform motion-reduce:transition-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
              unified ? "pb-3" : "pb-5"
            }`}
            /* Each view carries its own offset, and the one you are looking at
               carries none.

               A single rail translated between two positions is the obvious
               way to build this and it has a cost that shows up nowhere near
               the animation: a transform on an ancestor makes the subtree a
               composited layer, and the orb's SVG filter resolves its dilate
               against whatever texture that layer is drawn into — so the
               reasoning chip's dots came out visibly fatter for as long as the
               thread sat at translateX(-100%), which on this arrangement was
               always.

               Offsetting each view separately means the visible one is at
               `none` once it has arrived, so the settled state is exactly the
               untransformed one it was before any of this existed. Only the
               screen that is leaving holds a transform, and only while it
               leaves. */
            style={{
              transform: view === "history" ? "translateX(100%)" : "none",
              transitionDuration: `${VIEW_SLIDE_MS}ms`,
              transitionTimingFunction: VIEW_SLIDE_EASE,
            }}
            aria-hidden={view === "history"}
          >
            {messages.map((m, i) =>
              m.from === "user" ? (
                /* The only bubble in the thread. The agent's side is left
                   unbubbled on purpose: one speaker enclosed and the other
                   set plainly on the glass tells you who said what without a
                   label, and it keeps the agent's text feeling like the pane
                   talking rather than a card posted into it. */
                <div
                  key={m.id}
                  className="max-w-[80%] self-end whitespace-pre-line rounded-[20px] px-5 py-3 text-[14px] font-light text-[var(--ink)]"
                  style={{
                    backgroundColor: t.bubble,
                    animation: "bubble-in 240ms cubic-bezier(0.25,0.46,0.45,0.94) both",
                  }}
                >
                  {m.text}
                </div>
              ) : (
                /* Marked so the sources chip can find the turn it belongs to
                   and measure it. Its own ref per message would mean a map of
                   refs keyed by id to keep in step with the message list; the
                   button is inside the thing it needs, so a closest() from the
                   click is both shorter and always current. */
                <div
                  key={m.id}
                  data-turn
                  className="group flex flex-col items-start gap-3"
                >
                  {/* gap-3, so the reply and the actions under it sit 12px
                      apart. The trace above the text sets its own spacing with
                      mb-2 against this same gap, which is why that one doesn't
                      move when this changes. */}
                  {/* The trace, kept after the fact rather than thrown away.

                      While the agent works, the steps narrate one at a time
                      beside the orb. Once the reply lands they collapse into
                      this chip — the same information, folded up, because a
                      finished answer shouldn't be preceded by five lines of
                      how it was reached, and deleting them entirely would
                      make the work unverifiable the moment it mattered.

                      Hover-driven rather than click-driven, and CSS-only:
                      there's no state to track, so ten replies can't disagree
                      about which of them is open. group-focus-within opens it
                      from the keyboard too, since a hover target that can't
                      be reached any other way is decoration.

                      The 0fr → 1fr grid row animates to whatever the list
                      measures, so nothing has to be told its own height. */}
                  {unified && m.steps && (
                    <div className="mb-2 flex flex-col items-start">
                      {/* mb-2 against the column's 8px gap, less the 4px the
                          chip's own py-1 already contributes, for 12px of
                          real space between the trace and the reply. */}
                      {/* 12px while it works, 8px once it has finished.

                          Not a fussy distinction — the two states aren't the
                          same object. Working, the label is loose text running
                          through its steps beside a mark that is moving, and
                          the pair needs air or the sparkle's arms sit on the
                          first letter. Finished, the label becomes a chip with
                          its own padding and a hover fill, so the space
                          between them is the gap plus that padding; holding 12
                          there reads wider than it did a moment earlier, on a
                          row that has just gone still.

                          The 4px takes it back. Both states then look like the
                          same distance, which is what the eye is actually
                          measuring. */}
                      <div
                        className={`flex items-center ${
                          m.pending || streaming?.id === m.id
                            ? "gap-3"
                            : "gap-2"
                        }`}
                      >
                        {/* Outside the box, not in it. The sparkle marks the
                            turn as the agent's; the box is the hit area of a
                            control. Putting the mark inside the control makes
                            it look like part of the button's label, and it
                            then appears and disappears with the hover fill —
                            an identity that flickers. */}
                        {/* Turning only while this reply is still arriving.
                            Read per message rather than off a global flag, so
                            an older turn's chip stays still while the newest
                            one works.

                            The sparkle in place of the orb, and smaller than
                            the box the orb held. 36px is right for a field of
                            dots, which carries most of its ink in the middle
                            and fades at the edges; a single stroked star fills
                            its box corner to corner, so the same number reads
                            noticeably larger. 32 puts the two at about the
                            same weight beside the label. */}
                        <AccentSparkle
                          size={SPARKLE_PX}
                          paused={!m.pending && streaming?.id !== m.id}
                        />

                        {/* No fill at rest, filled on hover. A chip that is
                            always boxed reads as a button you're expected to
                            press; unboxed until you reach it, it reads as a
                            label that happens to be pressable — which is the
                            right weight for something above the answer rather
                            than part of it. */}
                        {/* One row, two labels. While the answer is still
                            coming this says what the agent is doing; once it
                            lands the same row becomes the way back to that
                            trace. Relabelling rather than replacing is the
                            whole point — the orb beside it never unmounts, so
                            it carries straight on through the handover
                            instead of restarting somewhere slightly
                            different. */}
                        {m.pending ? (
                          <span
                            className="ai-shimmer text-[14px] font-normal"
                            style={{
                              /* Its own accent sweep rather than the theme's
                                 grey one. The orb beside it carries the
                                 tenant's colour and the shine is the only
                                 thing moving while the answer is out — a
                                 neutral sweep next to a coloured mark reads
                                 as two unrelated things waiting rather than
                                 one agent working.

                                 Derived, not written down. This was a pair of
                                 literal purples — #6D33AA at 45% sweeping
                                 through #4C1D95 — from back when the accent
                                 was only ever TARS purple, so every other
                                 tenant got a violet shimmer under an orange
                                 or blue orb.

                                 The highlight is the same accent ink the
                                 chips use (75% into black), and the base is
                                 the accent pulled toward the pane's faint
                                 grey rather than simply made transparent:
                                 45% of a light hue like Brightline's orange
                                 on white is barely a word. Darker at the
                                 highlight, not lighter — on white paper a
                                 brighter pass sweeps the text toward the page
                                 and briefly erases it, where deepening keeps
                                 every word legible through the whole cycle
                                 and still reads as light crossing it. */
                              backgroundImage: `linear-gradient(90deg, ${SHIMMER_BASE} 0%, ${SHIMMER_BASE} 40%, ${SHIMMER_LIT} 50%, ${SHIMMER_BASE} 60%, ${SHIMMER_BASE} 100%)`,
                            }}
                            role="status"
                            aria-live="polite"
                          >
                            {content.reasoningSteps[stepIdx]}…
                          </span>
                        ) : (
                          <button
                            type="button"
                            aria-expanded={!!openTrace[m.id]}
                            onClick={() =>
                              setOpenTrace((prev) => ({
                                ...prev,
                                [m.id]: !prev[m.id],
                              }))
                            }
                            /* Purple, and its own purple rather than the
                               theme's ink. This chip is the one control on
                               the reply that leads somewhere else, and it
                               inherits the colour from the orb sitting next
                               to it — mark and label as one thing.

                               The hover fill is the same hue at low alpha,
                               not a grey. A neutral fill under coloured text
                               reads as two decisions; a tint of the text's
                               own colour reads as the label lighting up. */
                            /* Open holds the hover fill. A control that
                               reverts to bare the moment the pointer leaves
                               makes the panel below look like it opened on
                               its own — the fill is what ties the two
                               together, so it stays for as long as there is
                               something open to tie it to. */
                            style={{
                              /* Ink, not purple. The orb beside it already
                                 carries the colour, and two purple things
                                 side by side made the label look like part of
                                 the mark. The hover and open fill stay purple
                                 — that's the tie to the orb, and it only
                                 shows when the control is doing something. */
                              color: openTrace[m.id] ? "var(--brand)" : "var(--ink)",
                              ...(openTrace[m.id]
                                ? {
                                    backgroundColor:
                                      "color-mix(in srgb, var(--brand) 12%, transparent)",
                                  }
                                : null),
                            }}
                            /* -ml-2 cancels this chip's own left padding.

                               The row's gap is measured to the button's box,
                               and the box starts 8px before its text — so the
                               gap you set and the gap you see were different
                               numbers, and the settled state sat wider than
                               the working one however the row was tuned. Pull
                               the box back by exactly its padding and the row
                               gap becomes the distance to the word, which is
                               the thing being looked at. The hover fill still
                               has its padding; it just starts where the mark
                               ends. */
                            className="-ml-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[12px] font-medium transition-colors hover:!text-[var(--brand)] hover:bg-[color-mix(in_srgb,var(--brand)_12%,transparent)]"
                          >
                            Thought for 8s
                            <ChevronDown
                              className={`size-3.5 transition-transform duration-200 ${
                                openTrace[m.id] ? "rotate-180" : ""
                              }`}
                              strokeWidth={1.5}
                              aria-hidden
                            />
                          </button>
                        )}
                      </div>

                      {/* Click, not hover. Hover was fine while this only had
                          to peek, but a list of tool calls is something you
                          read — and a panel that vanishes when the pointer
                          drifts can't be read. The chevron says it opens; the
                          click makes it stay. */}
                      <div
                        className="grid transition-[grid-template-rows] duration-300 ease-out"
                        style={{
                          gridTemplateRows: openTrace[m.id] ? "1fr" : "0fr",
                        }}
                      >
                        <div className="overflow-hidden">
                          {/* No fill behind the steps. The chip above them
                              already carries one on hover, and a second
                              filled block directly under it made the two read
                              as one boxed unit rather than as a control and
                              the thing it reveals. Left bare, the indent and
                              the ticks are enough to hold the list
                              together. */}
                          {/* Flush with the orb, not indented under the
                              label. Hanging the list off the chip made it a
                              footnote to the chip; squared up with the orb it
                              belongs to the whole turn, and the reply's own
                              text below starts on the same line, so the
                              agent's column reads as one edge instead of
                              three. */}
                          <div className="ml-10 mt-1.5 pr-3">
                            {/* 40px = the orb's 36 plus the row's 4px gap, so
                                the list starts exactly where the chip above
                                it starts. Indenting under the control that
                                revealed it is what makes it read as that
                                control's contents rather than as another
                                paragraph of the reply. */}
                            {/* Ticked, one per line. These are steps the
                                agent has already completed by the time you
                                can read them — the panel only exists after
                                the answer has landed — so a tick states the
                                thing that is actually true. A bullet would
                                make them look like a plan it might still be
                                working through.

                                The tick sits in its own non-shrinking column
                                with the text beside it, so a step that wraps
                                aligns under itself rather than tucking back
                                under the mark. */}
                            <ol className="flex flex-col gap-1 text-[12px] leading-[1.6] text-[var(--ink-mute)]">
                              {m.steps.map((step) => (
                                <li key={step} className="flex items-start gap-1.5">
                                  <Check
                                    className="mt-[3px] size-3.5 shrink-0"
                                    strokeWidth={2.25}
                                    style={{ color: "var(--brand)" }}
                                    aria-hidden
                                  />
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Above the text, at its own size rather than stretched to
                      the turn's width: this is a mark, not a media
                      attachment, and a 140px illustration blown up to the
                      full column would read as an image someone sent. alt=""
                      because the line under it says the same thing in words —
                      a screen reader announcing both hears the greeting
                      twice. */}
                  {!m.pending && m.image && (
                    <img
                      src={m.image}
                      alt=""
                      className="h-[140px] w-auto"
                      style={{
                        animation:
                          "bubble-in 240ms cubic-bezier(0.25,0.46,0.45,0.94) both",
                      }}
                    />
                  )}

                  {/* 1.62 rather than 1.55: this column is ~70 characters
                      wide, and the longer the line the more leading it needs
                      for the eye to find the next one. Everything else about
                      the turn's typography — block rhythm, list markers,
                      which paragraph carries the full ink — is RichText's. */}
                  {!m.pending && (
                  <div className="text-[14px] font-light leading-[1.62] text-[var(--ink-soft)]">
                    <RichText
                      text={
                        streaming?.id === m.id
                          ? m.text.split(" ").slice(0, streaming.words).join(" ")
                          : m.text
                      }
                    />
                  </div>
                  )}

                  {/* The disclosure sections, once the text they belong to
                      has finished arriving — a component unfolding under a
                      sentence still being written is two things moving for
                      one turn.

                      Native <details>, so open/closed is the browser's to
                      remember and four sections need no state of their own.
                      The first carries `open` because a component that
                      arrives as four closed doors reads as work rather than
                      as an answer. */}
                  {!m.pending && streaming?.id !== m.id && m.accordion && (
                    <div className="w-full">
                      {m.accordion.title && (
                        <p className="mb-2 text-[13px] font-semibold text-[var(--ink)]">
                          {m.accordion.title}
                        </p>
                      )}
                      <div
                        className="divide-y overflow-hidden rounded-[12px]"
                        style={{
                          borderColor: "var(--divider)",
                          border: "1px solid var(--divider)",
                        }}
                      >
                        {m.accordion.items.map((item, idx) => (
                          <details
                            key={item.label}
                            open={idx === 0}
                            /* One at a time. `name` is the HTML exclusive-
                               accordion group: opening any section in the
                               group closes whichever was open, with no state
                               to hold and no handlers to keep in step.
                               Scoped to the message id, so two turns each
                               carrying an accordion don't end up in one
                               group closing each other's sections. */
                            name={`acc-${m.id}`}
                            className="group/acc"
                            style={{ borderColor: "var(--divider)" }}
                          >
                            {/* The open row keeps the hover fill. Open is the
                                state worth marking on a list whose whole job
                                is showing you which of four things you are
                                reading — and it is the same grey the pointer
                                already puts there, so the row under the
                                cursor and the row that is open are not two
                                different colours competing to mean
                                "current". */}
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3.5 py-2.5 text-[13px] font-medium text-[var(--ink)] transition-colors group-open/acc:bg-[var(--fill)] hover:bg-[var(--fill)]">
                              {item.label}
                              {/* One chevron that turns, not two glyphs
                                  swapped — the row should read as the same
                                  control in two positions. */}
                              <ChevronDown
                                className="size-4 shrink-0 text-[var(--ink-mute)] transition-transform group-open/acc:rotate-180"
                                strokeWidth={2}
                                aria-hidden
                              />
                            </summary>
                            <div className="px-3.5 pt-0 pb-3 text-[13px] leading-[1.55] text-[var(--ink-mute)]">
                              <RichText text={item.body} />
                            </div>
                          </details>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* On its own line under the text, not trailing the last
                      word. Inline was the obvious reading of "follows the
                      text" and it's the wrong one: an orb wedged into the
                      paragraph gets pushed around by every word that lands,
                      so the one thing meant to say "still working" is the
                      least stable thing on screen. Parked below, it holds
                      still while the text grows toward it, which is what
                      makes it read as a marker for the whole reply rather
                      than a cursor chasing the end of a sentence.

                      Full 27px, the same as the standalone thinking state —
                      it has a line to itself again, so there's no reason to
                      shrink it, and keeping one size means the orb doesn't
                      appear to jump when thinking hands over to streaming. */}
                  {/* Not on the merged surface. There the reasoning chip
                      already sits above the reply carrying the same orb, so a
                      second one below the text says the same thing twice and
                      the eye ends up tracking two marks for one turn. The
                      separate-panel layouts have no chip, so the orb below is
                      the only progress signal they get and it stays. */}
                  {streaming?.id === m.id && !unified && (
                    <span
                      className="mt-1 flex shrink-0 items-center justify-center"
                      style={{
                    width: unified ? ORB_PX_UNIFIED : ORB_PX,
                    height: unified ? ORB_PX_UNIFIED : ORB_PX,
                    filter: t.orbChat,
                  }}
                      aria-hidden
                    >
                      <span
                        style={{
                          transform: `scale(${
                            (unified ? ORB_PX_UNIFIED : ORB_PX) / 64
                          })`,
                        }}
                      >
                        <ThinkingOrb
                          state="connecting"
                          size={64}
                          speed={2.5}
                          theme="dark"
                        />
                      </span>
                    </span>
                  )}

                  {/* The node's input component: a form card, filled where
                      it was asked. Inside the turn like the buttons — it's
                      part of what the agent shipped — and it holds its
                      submitted values afterwards as the record of what was
                      sent, fields disabled rather than cleared. Held back
                      until the text has finished arriving, same as the
                      footer. */}
                  {m.form && !m.pending && streaming?.id !== m.id && (
                    <div
                      className="mt-1 w-full max-w-[400px] rounded-[14px] p-3"
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, var(--brand) 5%, white)",
                        boxShadow:
                          "inset 0 0 0 1px color-mix(in srgb, var(--brand-lite) 35%, transparent)",
                      }}
                    >
                      <div className="grid grid-cols-2 gap-2.5">
                        {m.form.fields.map((f) => (
                          <label
                            key={f.key}
                            className={f.half ? "" : "col-span-2"}
                          >
                            <span className="mb-1 block text-[11.5px] font-medium text-[var(--ink-mute)]">
                              {f.label}
                            </span>
                            {f.options ? (
                              <select
                                value={formValues[m.id]?.[f.key] ?? ""}
                                disabled={!!formDone[m.id]}
                                onChange={(e) =>
                                  setFormValues((prev) => ({
                                    ...prev,
                                    [m.id]: {
                                      ...prev[m.id],
                                      [f.key]: e.target.value,
                                    },
                                  }))
                                }
                                className="w-full cursor-pointer rounded-[10px] bg-white px-3 py-2 text-[13.5px] font-normal text-[var(--ink)] outline-none transition-shadow disabled:cursor-default disabled:text-[var(--ink-mute)]"
                                style={{
                                  boxShadow:
                                    "inset 0 0 0 1px color-mix(in srgb, var(--brand-lite) 45%, transparent)",
                                }}
                              >
                                {/* The placeholder is a real option with an
                                    empty value, so an untouched select still
                                    fails the required check. */}
                                <option value="" disabled>
                                  Select an option
                                </option>
                                {f.options.map((o) => (
                                  <option key={o} value={o}>
                                    {o}
                                  </option>
                                ))}
                              </select>
                            ) : (
                            <input
                              type={f.type ?? "text"}
                              value={formValues[m.id]?.[f.key] ?? ""}
                              disabled={!!formDone[m.id]}
                              onChange={(e) =>
                                setFormValues((prev) => ({
                                  ...prev,
                                  [m.id]: {
                                    ...prev[m.id],
                                    [f.key]: e.target.value,
                                  },
                                }))
                              }
                              className="w-full rounded-[10px] bg-white px-3 py-2 text-[13.5px] font-normal text-[var(--ink)] outline-none transition-shadow disabled:text-[var(--ink-mute)]"
                              style={{
                                boxShadow:
                                  "inset 0 0 0 1px color-mix(in srgb, var(--brand-lite) 45%, transparent)",
                              }}
                            />
                            )}
                          </label>
                        ))}
                      </div>
                      <button
                        type="button"
                        disabled={
                          !!formDone[m.id] ||
                          m.form.fields.some(
                            (f) =>
                              !(formValues[m.id]?.[f.key] ?? "").trim(),
                          )
                        }
                        onClick={() => submitNodeForm(m)}
                        className="mt-3 w-full cursor-pointer rounded-full py-2.5 text-[13.5px] font-medium text-white transition-opacity disabled:cursor-default disabled:opacity-40"
                        style={{ backgroundColor: "var(--brand)" }}
                      >
                        {formDone[m.id]
                          ? "Submitted ✓"
                          : m.form.submitLabel ?? "Submit"}
                      </button>
                    </div>
                  )}

                  {/* The node's own buttons, part of what the agent said —
                      so they come before the action row. The actions and the
                      stamp are the turn's footer: they close whatever the
                      node shipped, message and components alike, and always
                      sit last. */}
                  {m.buttons && m.buttons.length > 0 && (
                    /* A wrapping row: the buttons share a line for as long as
                       the turn's width allows and spill onto the next when it
                       doesn't. Each pill stays sized to its own label.

                       -ml-1 is optical, not structural: a fully-round pill's
                       left edge curves away at text height, so a pill whose
                       box sits flush with the bare message text reads as
                       indented from it — the same reason the action row
                       below carries -ml-1.5 for its icons. Four pixels puts
                       the pill's visual mass on the text's column line. */
                    <div className="-ml-1 mt-1 flex max-w-full flex-wrap gap-2">
                      {m.buttons.map((b) => {
                        const chosen = chosenButtons[m.id];
                        return (
                        <button
                          key={b}
                          type="button"
                          disabled={!!chosen}
                          onClick={() => {
                            setChosenButtons((prev) => ({
                              ...prev,
                              [m.id]: b,
                            }));
                            /* End Chat says itself in the transcript — the
                               choice is a turn like any other — but instead
                               of a reply it opens the close confirmation. */
                            if (
                              content.endChatLabel &&
                              b === content.endChatLabel
                            ) {
                              const uid = nextId.current++;
                              setMessages((prev) => [
                                ...prev,
                                {
                                  id: uid,
                                  from: "user",
                                  text: b,
                                  at: Date.now(),
                                },
                              ]);
                              closeSrc.current = m.id;
                              setCloseFlow("confirm");
                              return;
                            }
                            send(b);
                          }}
                          /* Background lives in the class so the hover class
                             can beat it; the frozen chosen state goes inline,
                             which beats them both. Once any choice is made
                             the set drops to half strength and stops taking
                             the pointer — a menu that has been ordered from. */
                          className="rounded-full bg-[color-mix(in_srgb,var(--brand)_9%,white)] px-4 py-2 text-[13.5px] font-normal text-[color-mix(in_srgb,var(--brand)_75%,black)] transition-[background-color,box-shadow,opacity] duration-200 ease-out hover:bg-[color-mix(in_srgb,var(--brand)_14%,white)] hover:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--brand)_45%,transparent)] active:bg-[color-mix(in_srgb,var(--brand)_26%,white)] active:shadow-none disabled:pointer-events-none"
                          style={{
                            ...(chosen === b
                              ? {
                                  backgroundColor:
                                    "color-mix(in srgb, var(--brand) 14%, white)",
                                  boxShadow:
                                    "inset 0 0 0 1px color-mix(in srgb, var(--brand) 45%, transparent)",
                                }
                              : null),
                            ...(chosen ? { opacity: 0.64 } : null),
                          }}
                        >
                          {b}
                        </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Actions on the agent's turn only — there's nothing to
                      rate or read aloud about your own message.

                      At full strength by default rather than dimmed and
                      revealed. The two dimmers were compounding: 55% white
                      inside a 60% opacity container is 33% ink, which on
                      glass this pale is barely there — the row read as
                      disabled rather than as quiet. One value at 80% now,
                      and hover takes the individual icon to full white, so
                      the hover still says which one is under the pointer
                      without the resting state having to be faint to make
                      room for it.

                      Held back until the reply has finished arriving. Rating
                      or copying half an answer isn't a thing anyone means to
                      do, and a toolbar appearing under text that's still
                      growing gets pushed down the screen as it goes.

                      And only on the last turn of a run. When the agent says
                      two things back to back — the greeting's hello and what
                      follows it, a form's acknowledgement and its follow-on —
                      they are one thing said in two parts, and a toolbar
                      under each part offers to rate, copy and read aloud a
                      half of it. The run's last turn carries the actions for
                      the whole run. */}
                  {!m.pending &&
                    streaming?.id !== m.id &&
                    !m.quiet &&
                    messages[i + 1]?.from !== "agent" && (
                  <div className="-ml-1.5 flex items-center gap-0.5 text-[var(--ink-soft)]">
                    <GlassAction
                      label={speakingId === m.id ? "Stop reading" : "Read aloud"}
                      active={speakingId === m.id}
                      onClick={() => speak(m)}
                    >
                      {/* 16px against everything else's 14. The speaker is a
                          small triangle and two thin arcs, so at a matched
                          box it carries visibly less ink than the thumbs or
                          the copy squares and reads as the runt of the row.
                          Optical size is what the eye compares, not the
                          declared one — the same reason the composer's plus
                          and arrow don't share a number either. */}
                      {speakingId === m.id ? (
                        <VolumeX className="size-4" strokeWidth={1.5} aria-hidden />
                      ) : (
                        <Volume2 className="size-4" strokeWidth={1.5} aria-hidden />
                      )}
                    </GlassAction>

                    <GlassAction
                      label="Good answer"
                      active={rated[m.id] === "up"}
                      onClick={() => rate(m.id, "up")}
                    >
                      <ThumbsUp className="size-[14px]" strokeWidth={1.5} aria-hidden />
                    </GlassAction>

                    <GlassAction
                      label="Bad answer"
                      active={rated[m.id] === "down"}
                      onClick={() => rate(m.id, "down")}
                    >
                      <ThumbsDown className="size-[14px]" strokeWidth={1.5} aria-hidden />
                    </GlassAction>

                    {/* The tick is the confirmation — a toast for a copy is
                        more apparatus than the action deserves. */}
                    <GlassAction
                      label={copiedId === m.id ? "Copied" : "Copy"}
                      active={copiedId === m.id}
                      onClick={() => copy(m)}
                    >
                      {copiedId === m.id ? (
                        <Check className="size-[14px]" strokeWidth={1.75} aria-hidden />
                      ) : (
                        <Copy className="size-[14px]" strokeWidth={1.5} aria-hidden />
                      )}
                    </GlassAction>

                    {/* Trailing the controls rather than leading them. In
                        front it read as a fifth button — the one thing in the
                        row you couldn't press — where after the last icon it
                        falls outside the run and goes back to being a note.

                        No colour of its own — it inherits the row's white/80,
                        so the stamp and the icons stay one set rather than
                        drifting apart every time the row's ink is retuned.

                        Tabular figures so the digits hold their columns and
                        the stamp doesn't twitch as the minute rolls over. */}
                    <span className="ml-1.5 text-[12px] tabular-nums">
                      {formatTime(m.at)}
                    </span>

                    {/* Sources last in the row, after the stamp. It's the one
                        control here that opens something rather than firing
                        and finishing, so it reads better at the end than
                        wedged between two icons.

                        Only on turns that carry a reasoning trace: sources
                        are what an answer read, and the greeting read
                        nothing — a citations chip on "hey there" claims
                        research that never happened. */}
                    {unified && m.steps && (
                      <span className="ml-2">
                      <button
                      type="button"
                      aria-expanded={!!openSources[m.id]}
                      onClick={(e) => {
                      /* Only on the way open. Closing shrinks the turn, and
                         the scroll clamps itself — following that would drag
                         the thread down after a list the reader has just
                         dismissed. */
                      if (!openSources[m.id]) {
                      followOpen(
                      e.currentTarget.closest("[data-turn]") as HTMLElement | null,
                      );
                      }
                      setOpenSources((prev) => ({
                      ...prev,
                      [m.id]: !prev[m.id],
                      }));
                      }}
                      /* The pill is back, and the ring follows it.

                      A cut-out ring only works when its colour is what
                      is actually behind the discs. Ringing them in the
                      pane while they sat on a filled pill drew a white
                      halo around each one and the stack stopped looking
                      stacked — so the ring now takes the pill's own
                      colour, and changes with it when the chip opens.

                      Opaque values rather than the theme's alpha fills:
                      a semi-transparent ring lets the disc underneath
                      show through, which is the same halo by another
                      route. These are the white theme's fills already
                      composited over its pane — unified is white-only,
                      so there is no other surface for them to land
                      on. */
                      className="group/src flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors"
                      style={{
                      backgroundColor: openSources[m.id]
                      ? CHIP_FILL_ON
                      : CHIP_FILL,
                      }}
                      >
                      {/* One icon, not a stack of numerals.

                      The numbers already live on the claims they
                      support, and repeating them here said the same
                      thing twice while making the chip the busiest mark
                      in the reply. A book is the category — this is
                      what was read — and the count is a job for the
                      list it opens, not for the label on the door. */}
                      <span
                      className="flex size-[18px] shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: CHIP_DISC }}
                      >
                      <BookOpen
                      className="size-[11px] text-[var(--ink-soft)]"
                      strokeWidth={2}
                      aria-hidden
                      />
                      </span>
                      <span className="text-[11px] font-medium text-[var(--ink)]">
                      Sources
                      </span>
                      </button>
                      </span>
                    )}
                  </div>
                  )}

                  {/* The list stays under the row it was opened from — inside
                      it, everything would have to fit on one line. */}
                  {unified && !m.pending && streaming?.id !== m.id && (
                    /* -mt-3 cancels the turn column's gap-3.

                       The wrapper is always mounted — that is what makes the
                       panel a transition rather than a mount — so closed it is
                       a zero-height flex child still claiming its 12px, which
                       left dead space under the action row on every reply
                       whose sources nobody opened. Cancelled here, the gap
                       becomes the panel's own margin, which lives inside the
                       collapsing region: 8px when open, nothing when shut. */
                    <div className="-mt-3 w-full">
{/* The list the chip is a summary of. Same measure-free
                            grid the reasoning trace uses, and the same rule:
                            click to open, and it stays open — a list of
                            references is something you read against the answer,
                            which you can't do if it closes when the pointer
                            moves back to the text. */}
                        <div
                          className="grid w-full transition-[grid-template-rows,opacity]"
                          style={{
                            gridTemplateRows: openSources[m.id] ? "1fr" : "0fr",
                            /* Inline rather than a duration class, because the
                               scroll that follows this open reads the same
                               constant — a Tailwind duration would be a second
                               copy of the number, in a form the loop can't
                               see. */
                            transitionDuration: `${SOURCES_OPEN_MS}ms`,
                            /* Height alone reads as the list being squeezed out
                               of a slot it was folded into. Fading with it makes
                               the panel arrive instead, and the overshoot curve
                               lets the box settle a beat after its contents are
                               already legible — the same curve the chip's own
                               press uses, so opening is one gesture. */
                            opacity: openSources[m.id] ? 1 : 0,
                            transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
                          }}
                        >
                          <div className="overflow-hidden">
                            {/* A box, not a run of lines under the chip.

                                Loose in the column the references sat at the
                                same altitude as the reply and read as more
                                answer — four extra sentences the agent had
                                appended. Enclosed, they become a thing the
                                answer refers to: one surface, its own edge, and
                                a lid that opens.

                                The fill is the chip's own, so the door and the
                                room behind it are the same material. Padding of
                                4px on the box against 6/4 on the rows is what
                                keeps a hovered row reading as inside the panel
                                rather than as a band across it. */}
                            {/* A border rather than a ring. A box-shadow paints
                                outside the element's box, and this one sits
                                inside the disclosure's own overflow-hidden — so
                                the left and right edges were being clipped
                                while the top and bottom, which had the margin
                                to sit in, survived. That reads as a box with
                                two sides missing. A border is part of the box
                                under border-box sizing, so there is nothing
                                outside the element left to clip. */}
                            <ol
                              className="mt-2 flex flex-col rounded-[12px] border p-1"
                              style={
                                {
                                  backgroundColor: SOURCE_BOX,
                                  /* The edge carries more of the enclosing now
                                     that the fill carries less — a shade over
                                     the old 0.05, which is the difference
                                     between an edge you can find and one that
                                     disappears against a near-white box. */
                                  borderColor: "rgba(15,17,26,0.07)",
                                  /* Handed to the rows as a variable rather
                                     than written into each one's class: a
                                     literal hex in four places is four places
                                     to miss when that colour is retuned. */
                                  "--src-hover": SOURCE_ROW_ON,
                                } as React.CSSProperties
                              }
                            >
                              {content.sources.map((src, i) => (
                                <li key={src.name}>
                                  {/* The row is the link. The citation's hover
                                      card already offers the url as a line of
                                      its own, but that one is a glance at a
                                      claim — this is the list you open when you
                                      mean to go and read the thing, so the whole
                                      row is the target rather than a few
                                      underlined characters inside it. */}
                                  <a
                                    href={`https://${src.url}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 rounded-[8px] px-1.5 py-1 text-[12px] text-[var(--ink-mute)] transition-colors duration-150 hover:bg-[var(--src-hover)] hover:text-[var(--ink)]"
                                  >
                                    {/* The same number as the badge on the
                                        bullet it supports, so the two can be
                                        matched by eye without counting down the
                                        list.

                                        Bare here, where the badge in the text is
                                        disced. The disc exists to hold a number
                                        apart from the sentence it interrupts;
                                        this one starts its own row and has
                                        nothing to be told apart from, so the
                                        circle was decoration — and four of them
                                        stacked read as a column of buttons.

                                        Fixed width so the names hold one column,
                                        but set from the left. Right-aligning it
                                        inside an 18px box put a single digit
                                        half a column away from the row's edge,
                                        which read as the list being indented
                                        from a margin that isn't there — the
                                        number is the start of the row, so it
                                        starts where the row does. 14px is two
                                        tabular digits, so a tenth source
                                        doesn't move the titles. */}
                                    <span className="w-[14px] shrink-0 text-[11px] tabular-nums text-[var(--ink-faint)]">
                                      {i + 1}
                                    </span>
                                    <span className="truncate">{src.name}</span>
                                    {/* Where it came from, pushed to the far
                                        edge, and dressed as what it is.

                                        The same blue and underline the answer's
                                        own links use — a reference list whose
                                        addresses are styled as quiet metadata
                                        makes you guess whether the row goes
                                        anywhere, and the whole point of opening
                                        this box is to leave for one of them.

                                        The icon says the leaving is to a new
                                        tab, which is what the anchor actually
                                        does. Outside the underline: it belongs
                                        to the act, not to the address, and
                                        underlining an arrow just thickens the
                                        rule under the last character. */}
                                    <span className="ml-auto flex shrink-0 items-center gap-1 pl-2 text-[#2563EB]">
                                      <span className="font-mono text-[10.5px] underline underline-offset-2">
                                        {src.url}
                                      </span>
                                      <ExternalLink
                                        className="size-3"
                                        strokeWidth={2}
                                        aria-hidden
                                      />
                                    </span>
                                  </a>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                                          </div>
                  )}

                  {/* Suggested next questions, under the reply they belong to.

                      Stacked rather than in a row: these are sentences, and
                      sentences set side by side get compared before they get
                      read. Down the left margin they scan the way a list of
                      options does — one after another, each on its own line,
                      at the same starting point as the reply above them.

                      No border. The outlined pills read as controls bolted to
                      the window; an arrow and a line of text reads as
                      something the agent is offering. The arrow does the work
                      the border was doing — it marks them as pressable
                      without drawing a box round each one.

                      Newest reply only, and only once it has finished
                      arriving. */}
                  {!unified && m.id === latest?.id && followUps && followUps.length > 0 && (
                    <div className="mt-1 flex flex-col items-start gap-0.5">
                      {followUps.map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => send(f)}
                          className="-ml-1 flex items-center gap-2 rounded-[10px] px-1 py-1 text-left text-[13px] font-light text-[var(--ink-mute)] transition-colors hover:text-[var(--ink)]"
                        >
                          {/* shrink-0 so a long suggestion wraps its text
                              rather than squashing the arrow. */}
                          <ArrowUpRight
                            className="size-4 shrink-0"
                            strokeWidth={1.5}
                            aria-hidden
                          />
                          {f}
                        </button>
                      ))}
                    </div>
                  )}

                </div>
              ),
            )}

            {/* The closed stamp, in the transcript where the conversation
                ended — a state the thread reached, not a message anyone
                sent. */}
            {(closeFlow === "csat" || closeFlow === "done") && (
              <div className="flex items-center justify-center gap-1.5 py-2 text-[12.5px] text-[var(--ink-mute)]">
                <span className="grid size-4 place-items-center rounded-full bg-[#16A34A]">
                  <Check className="size-2.5 text-white" strokeWidth={3} aria-hidden />
                </span>
                This conversation has been closed
              </div>
            )}

            {/* Thinking. Sits where the reply will, and at the same size and
                weight, so the answer arrives in place rather than shunting
                the line it replaces.

                The orb is the composer's, unfiltered — white here rather than
                violet-blue, because in the composer it marks the field as an
                agent's while here it's reporting live activity, and the
                filter would tie a status indicator to a brand colour.

                aria-live so it's announced rather than only drawn; the orb
                itself is decoration and stays hidden. */}
            {/* Only where the reply arrives as a new message. The merged
                surface mounts the agent's row up front and relabels it, so a
                second thinking row here would be a duplicate that unmounts at
                the very moment continuity matters. */}
            {thinking && !unified && (
              <div
                className="flex items-center gap-2.5"
                role="status"
                aria-live="polite"
                style={{ animation: "bubble-in 240ms cubic-bezier(0.25,0.46,0.45,0.94) both" }}
              >
                {/* 27px is not one of the presets — the package ships 64 and
                    20 only, and they're separate designs rather than one
                    scaled. The dense one is wanted here, so the size has to
                    rise to meet it — see ORB_PX. */}
                {(
                  <span
                    className="flex shrink-0 items-center justify-center"
                    style={{ width: ORB_PX, height: ORB_PX, filter: t.orbChat }}
                    aria-hidden
                  >
                    <span style={{ transform: `scale(${ORB_PX / 64})` }}>
                      <ThinkingOrb
                        state="connecting"
                        size={64}
                        speed={2.5}
                        theme="dark"
                      />
                    </span>
                  </span>
                )}
                <span
                  className="ai-shimmer text-[15px] font-medium"
                  style={{ backgroundImage: t.shimmer }}
                >
                  {unified ? content.reasoningSteps[stepIdx] + "…" : "Thinking…"}
                </span>
              </div>
            )}
        {/* Suggested replies, last in the transcript.

            They used to be pinned to the composer, on the reasoning that a
            suggestion parked at the bottom of the thread floats in whatever
            empty space the conversation hasn't filled yet, where the field
            gives it a fixed home. That holds for an empty thread and stops
            holding the moment there is one: pinned, the row belongs to the
            furniture, and what it actually is is the turn the agent just
            took, still speaking — three things it offered to be asked. So it
            lives in the conversation, scrolls with the conversation, and
            scrolls away when the conversation moves past it, like anything
            else that was said.

            Pills, and a scrolling row rather than a column. These are short
            enough to be scanned side by side, and a vertical stack of them
            under a horizontal turn reads as a menu bolted to the thread.

            One line that scrolls, not a wrap. Wrapped, a set that doesn't fit
            changes the row's height as well as its contents — so the
            transcript grows by a line the moment a fourth suggestion is a
            word longer, and everything above it shifts. On one line the row
            is the same height whatever it holds, and a set can be as long as
            the answer deserves; the chip running off the right edge is what
            says there is more, which is the same thing a scrollbar would say
            more loudly.

            The same 0fr → 1fr grid the starters use, so the row measures
            itself rather than being told a height.

            mt-auto is what puts it at the foot of the box rather than
            immediately under the last turn. The two only differ while the
            conversation is shorter than the panel — which is most of the
            first minute of one, and exactly when a row of suggestions
            stranded halfway up a tall empty pane looks like something that
            failed to load. The auto margin eats the free space above it, so
            the row sits on the bottom edge until there is a conversation
            long enough to push it there anyway; from then on there is no
            free space for it to absorb and it simply follows the last
            thing said, which is where it belongs once it has company. */}
        {unified && chatOpen && !closeFlow && rowPrompts && rowPrompts.length > 0 && (
          /* One element: the rail is the scroller, sized to its own chips.
             It was three — a 0fr → 1fr grid to animate the height, a
             scroller, and a track inside it — from when this lived on the
             composer and the foot had to grow and shrink around it. In the
             transcript there is nothing to grow: the row is either part of
             the conversation or it isn't, so it is rendered or it isn't, and
             the same element does the aligning, the scrolling and the
             sizing. Structure lifted from Design's own chip-rail, which
             arrived at the same three properties for the same reasons.

             mt-auto puts it at the foot of the box rather than immediately
             under the last turn. The two only differ while the conversation
             is shorter than the panel — which is most of the first minute of
             one, and exactly when a row stranded halfway up a tall empty
             pane looks like something that failed to load. Once there is
             enough conversation to fill the box there is no free space left
             to absorb, and it simply follows the last thing said.

             ml-auto with w-max, not justify-end, for the horizontal. They
             look identical until the row overflows, and then justify-end
             puts the start of the content out past the scroll origin where
             it cannot be reached — the first chips in the DOM and simply
             gone. ml-auto resolves to zero once the content is wider than
             the box, so a full row scrolls from its first chip. max-w-full
             is what stops the rail growing past the panel instead of
             scrolling inside it.

             py-1 -my-1 is headroom, not spacing: turning on horizontal
             overflow turns on the vertical axis with it — `visible` can't
             survive on one axis alone — so a focus ring on a chip flush
             against this edge would be shaved off. Four pixels of room,
             handed straight back as negative margin, so nothing moves.

             Scrollbar hidden, scrolling kept: the chip running past the
             right edge already says the row continues. Two declarations
             because the engines disagree — scrollbar-width is the standard,
             WebKit still only answers to the pseudo-element.

             shrink-0 is load-bearing, and the reason is the interaction
             between the two lines above it. A flex item's automatic minimum
             size is its content — which is what stops the turns above from
             being squeezed when the transcript overflows. A *scroll
             container* is the exception: min-height:auto resolves to zero
             for it, on the reasoning that it can always scroll instead. So
             once this row turned into a horizontal scroller it became the
             one child in the column that flex was allowed to compress, and
             an overflowing thread compressed it — to nothing. What was left
             was the row's own 4px of padding with three chips stretched flat
             inside it: a sliver of colour under the last reply that read as
             the suggestions being clipped by the bottom of the box. They
             weren't below the fold; they were 8px tall. Refusing to shrink
             puts the row's height back under its content's control. */
              <div
                className="mt-auto ml-auto flex w-max max-w-full shrink-0 flex-nowrap gap-2 overflow-x-auto py-1 -my-1 transition-opacity duration-200 ease-out [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                style={{
                  /* The row is always here once it has been here; only its
                     contents fade. pointer-events off while faded, or the
                     previous answer's suggestions are still clickable during
                     the second the next one is being written. */
                  opacity: rowLive ? 1 : 0,
                  pointerEvents: rowLive ? "auto" : "none",
                }}
                aria-hidden={!rowLive}
              >
                {rowPrompts?.map((f, i) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => send(f)}
                    /* The launcher's chip, exactly — same box (px-4 py-2,
                       14px), same fill (14% brand into white), same darkened
                       ink of the same hue, same hover (20% plus the 1.5px
                       ring) and press (32%).

                       They used to be two different chips: this one carried
                       the reasoning chip's colours — brand-coloured text on a
                       12%-into-transparent tint, a size smaller — on the
                       argument that it belonged with the other controls in a
                       turn. But a visitor doesn't meet these in a turn, they
                       meet them as the same offer they already saw on the
                       pill outside: three things to say, in a row, at the
                       foot of the window. Two treatments for one thing is the
                       drift, not the distinction.

                       The hover lift is gone with it, for the same reason it
                       isn't on the launcher's: the ring says pressable
                       without the row moving under the pointer. */
                    className="cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-center text-[14px] font-normal text-[color-mix(in_srgb,var(--brand)_75%,black)] transition-[background-color,box-shadow] duration-200 ease-out hover:bg-[color-mix(in_srgb,var(--brand)_20%,white)] hover:shadow-[inset_0_0_0_1.5px_color-mix(in_srgb,var(--brand)_45%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] active:bg-[color-mix(in_srgb,var(--brand)_32%,white)] active:shadow-none"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--brand) 14%, white)",
                      /* One after another rather than all at once: a row that
                         appears whole reads as part of the furniture, and
                         these are an offer the agent is making after it has
                         finished speaking. Arriving in sequence is what makes
                         them read as suggestions rather than as controls that
                         were always there.

                         `backwards`, not `both`. Backwards holds the start
                         state through the delay, which is what stops every
                         pill painting fully drawn on the first frame and then
                         jumping back to animate. Both would also keep the end
                         state afterwards — and an animation's final frame
                         outranks any other rule, so the lingering transform
                         would silently swallow the hover lift below. */
                      animation: `option-in ${SUGGEST_IN_MS}ms ${SUGGEST_EASE} ${
                        rowPrompts && rowPrompts.length > 1
                          ? (i * SUGGEST_WINDOW_MS) / (rowPrompts.length - 1)
                          : 0
                      }ms backwards`,
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
        )}

          </div>
          </div>

          {/* Inside the window now, not under the composer on the host page.

              That move solves the contrast problem rather than working around
              it: on glass the line has a known surface behind it and can use
              the pane's own faint ink, where sitting on the page it had to
              guess whether the site was light or dark.

              Last thing in the panel, centred, and outside the scroll area —
              a disclaimer that scrolls away with the conversation stops
              applying to the part you're reading. */}
          {view === "thread" && !unified && (
            /* --ink-mute, two steps below the header and the user bubble.
               A disclaimer that matches the loudest ink on the pane competes
               with the conversation for the same attention, and it isn't
               something anyone needs to read twice. --ink-soft at 90% was
               still reading as a full-strength line; 60% sits clearly under
               the thread without dropping to the 45% used for timestamps,
               where it stops being legible as a statement.

               Still a theme variable rather than a literal off-white, so it
               inverts on beige — a hardcoded pale value would vanish on that
               pane, which is the trap the page-level version of this line
               already fell into once. */
            /* pb-0 when the field below is inset: that field carries its own
               12px margin, and the two paddings stack. 8px total means
               nothing here and 8 on the margin — setting this to 8 as well
               would have produced 20. The flush variants keep pb-3, since
               there the composer has no margin of its own to contribute. */
            /* Truncated to one line rather than left to wrap, with the full
               text in a tooltip built from the pane's own surface — a
               disclaimer this specific (Brightline's names who to ask and
               what for) runs past one line at the panel's width, and
               wrapping it pushes the field down by a line that isn't part
               of the conversation. Not the browser's native `title`: that
               tooltip is the OS's own square grey box, positioned off the
               cursor rather than the text, on its own delay — it reads as
               the browser interrupting, not as part of the window it's
               floating over — see DisclaimerLine, which owns the truncation,
               the measured hover tail and the tooltip for both variants. */
            /* Capped at 320 and centred rather than running the pane's full
               width: the line truncates at whatever it is given, so the cap
               is also the decision about how much of it gets read before the
               ellipsis — and it is a decision, not a fit. A caveat is
               something to have been told, not something to read; the first
               clause carries the point and the ellipsis says the rest is
               there for anyone who wants it. It doubles as the tooltip's
               anchor, since that is positioned against this box, and as the
               hover tail's, since that is measured from this edge. */
            <DisclaimerLine
              text={disclaimer}
              wrapClassName="relative mx-auto w-full shrink-0"
              wrapStyle={{ maxWidth: noticeW }}
              pClassName={`text-center text-[12px] text-[var(--note)] ${
                unified ? "pb-0" : "pb-3"
              }`}
            />
          )}
          </div>
        </div>
      )}

      {/* One pane holds both rows, so the starters read as the chip opening up
          rather than as a second panel stacked on top of it.

          Unmounted in the list rather than hidden. Its width, radius and
          suggestion row all animate off state that keeps changing behind the
          list — an invisible composer would still be running those
          transitions, and would still be a focus target for anyone tabbing
          through. The draft lives in `value` on the component above, so it
          survives the trip and is still there when the thread comes back. */}
      {/* Starters as free-standing pills above the launcher.

          The row inside the composer is the default and is the better default:
          chips in the pane are part of one object, so the launcher stays a
          single thing that grows. Outside, they are three objects floating
          over the host page, which costs that unity and buys two things —

          The composer keeps its resting height. Inside, the row is 44px the
          pane has to grow by, so the surface the panel later unfolds from
          changes shape the moment you scroll. Out here the pill is the same
          size whether the offer is up or not.

          And the offer reads as the page's, not the field's. Chips sitting on
          the site rather than in a widget are closer to something being
          suggested than to a form with presets in it.

          They are laid out at the open width and left-aligned to the pane, so
          the group lines up with the composer's left edge rather than
          centring on it — a centred row over a left-aligned field reads as
          two unrelated elements that happen to be stacked. */}
      {startersOutside && !listOnly && (
        <div
          className="pointer-events-none mx-auto mb-3 flex w-full flex-wrap gap-2 motion-reduce:transition-none"
          style={{
            width: phone ? "100%" : geo.open,
            maxWidth: "100%",
            /* Not display:none when hidden — the chips animate out, and a row
               that is removed cannot. pointer-events is what stops the
               invisible ones from being clickable. */
            pointerEvents: showStarters ? "auto" : "none",
          }}
        >
          {starters.map((s, i) => (
            <button
              key={s}
              type="button"
              tabIndex={showStarters ? 0 : -1}
              /* Sends outright rather than loading the field, same as the
                 inside row: a starter is a thing to say, not a draft. */
              onClick={() => send(s)}
              className="shrink-0 rounded-full px-4 py-2 text-[14px] font-light whitespace-nowrap motion-reduce:transition-none"
              style={{
                color: "var(--ink-soft)",
                /* The pane's own surface, so a chip out here is made of the
                   same material as the launcher it came from rather than
                   being a white pill borrowed from somewhere else. */
                background: t.pane,
                backdropFilter: t.paneFilter,
                boxShadow: t.ring,
                opacity: showStarters ? 1 : 0,
                transform: showStarters ? "translateY(0)" : "translateY(8px)",
                /* Staggered from the left, and only on the way in. Arriving
                   in sequence reads as an offer being made; leaving in
                   sequence reads as a list being torn down, so they go
                   together. */
                transition: showStarters
                  ? `opacity 260ms ease-out ${i * 60}ms, transform 380ms ${PANEL_EASE} ${i * 60}ms`
                  : "opacity 160ms ease-out, transform 160ms ease-out",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {!listOnly && (
      <div
        ref={composerRef}
        /* mx-auto because the width animates.

           The pane sits in a column as wide as the widest thing in it — 620 —
           and carries its own width, which travels 620 → 340 on the close. A
           block element with a width is pinned to its container's left edge,
           so it shrank leftward and appeared to slide off toward the corner
           rather than closing into itself. Centred, both edges move by the
           same amount and the pill contracts on the spot. */
        /* The hover that drives `open` is bound to the column this sits in
           (see its own comment), not here — this row is only the bottom of
           that column, and binding it here as well meant leaving the pill for
           the panel above it (to read a message, to press Collapse) crossed
           this element's edge and closed the whole thing out from under the
           pointer that was still on it. */
        /* Clipped only while it is a pill. The overflow is what keeps the
           starter row — laid out at the open width whatever the box is
           currently doing — from spilling out of a 340px pill mid-animation.
           Once the conversation is open the box is static at its full width
           and has nothing left to clip, and clipping anyway is what was
           cutting the disclaimer's tooltip in half: that tooltip is anchored
           above a line sitting inside this element, so every pixel of it
           above this edge was being thrown away.

           flow-root rather than nothing for the open state, though. The
           ResizeObserver above measures this element to size the panel, and
           the note there is explicit that overflow-hidden is what makes it a
           block formatting context — without one, the form's mt-3/mb-5
           collapse out through the top and bottom and the measured foot
           comes back short by them, which the panel then reads as room it
           does not have. flow-root establishes the same context and clips
           nothing, so the measurement and the tooltip can both be right. */
        /* Centred in the column, except at a corner with the window shut.

           The centring above is written for the centred placement, where the
           column and the viewport share a middle and the resting pill is
           narrower than the panel that will open over it. There, centring is
           invisible and right. At a corner it is neither: the column is
           sized for the panel, so a 340px pill centred in 400 sits 30px
           further in than the window that opens above it, and the whole
           widget appears to shove itself outward into the corner the moment
           you open it — 42px from the edge at rest, 12px open, on a gesture
           that was not supposed to move it at all.

           So at a corner the shut pill hangs off the same edge the panel
           does, and the two states share one margin. What moves instead is
           the field, 20px inward as the window arrives — and that is the
           right thing to move: it is not the widget travelling, it is the
           window opening around the field and giving it the inset every
           other thing inside the window has.

           Only while shut. Once the panel is up the composer is the foot of
           it and centres under it again, which is the arrangement the note
           above is defending. */
        className={`pointer-events-auto relative w-full motion-reduce:transition-none ${
          chatOpen ? "flow-root" : "overflow-hidden"
        } ${
          chatOpen || spot === "center"
            ? "mx-auto"
            : spot === "right"
              ? "ml-auto"
              : "mr-auto"
        }`}
        style={{
          /* The panel's own timing, not a number of its own. This is the
             other half of the same surface — when the window grows out of it
             they have to move as one shape, and they can only do that if the
             duration and the curve are literally the same values.

             Except on the way to `chatOpen`, where the composer does not
             animate at all: it is simply already in its open shape on the
             first frame — width, radius and shadow together — while the
             panel unfolds above it. Anything moving down here at that
             moment is a second animation competing with the one the click
             was for, and the composer's part of it is only ever "be the
             foot of the window that just arrived".

             Everywhere else the transition stands: the hover-driven widen
             before there is a conversation, and the close on the way back
             down, which reads as the open played backwards and needs the
             motion. Read off `chatOpen` rather than `panelUp` — this has to
             flip on the very click that sets it, before `panelUp`'s own
             frame-deferred settling. */
          transition: chatOpen
            ? "none"
            : `width ${PANEL_MS}ms ${PANEL_EASE}, border-radius ${PANEL_MS}ms ${PANEL_EASE}, box-shadow ${PANEL_MS}ms ${PANEL_EASE}`,
          /* A 32px radius is exactly half the shut height, so the same value
             reads as a pill when closed and as a rounded panel when open — no
             radius animation needed. */
          /* Three widths.

             Typing under an open messenger: the panel's width, so the two
             stacked panes line up — at 580 under a 600 panel the 10px step
             each side reads as a misalignment rather than a decision.

             Typing with no messenger: the placement's open width.

             Anything else, including while a reply is arriving: the narrow
             chip. That last case is the point — the composer widens because
             you went to write, not because a conversation happens to be on
             screen, so it stays out of the way while you're reading and
             comes to meet you when you click into it.

             Note the messenger branch ignores `expanded` entirely. Scrolling
             is what set that flag on the way in, and it stays set for the
             rest of the session — so consulting it here would hold the
             composer wide through every conversation and undo the whole
             thing. Once there's a transcript, focus is the only input that
             should move this. */
          /* Unified holds the panel's width for as long as the conversation
             is open, focused or not. The narrowing that reads as the composer
             withdrawing when it's a separate pane reads as the bottom of one
             surface shrinking away from the rest of it — the two are joined
             now, so they have to agree on width. */
          width: paneWidth,
          maxWidth: "100%",
          /* Square top corners once a conversation is open and the panel is
             sitting on them — the composer becomes the foot of one surface
             rather than a pill of its own. Back to a full pill when it's
             closed, since then it is a pill of its own. */
          /* Square-topped under the panel, square all round on a phone —
             where the composer is the foot of the screen rather than a pill
             sitting on a page, and a rounded bottom edge would leave two
             corners of host site showing under the app. */
          /* Square only when it is the foot of a full-screen conversation.
             Closed, it goes back to the pill it is everywhere else — the
             radius is what says the thing is floating rather than docked. */
          borderRadius: phone
            ? panelUp
              ? 0
              : 32
            : unified && panelUp
              ? `0 0 ${SURFACE_RADIUS}px ${SURFACE_RADIUS}px`
              : 32,
          /* A hairline where the two halves meet, and only there. Merging
             them removed the gap that used to separate the conversation from
             the field — which was the point, but with nothing in its place
             the composer reads as the last row of the transcript rather than
             as the thing you type into.

             borderTop rather than a shadow: it needs to be exactly one pixel
             on exactly one edge. A shadow would spread, which is what caused
             the accidental band this replaces.

             Only when unified and open. Closed, the composer is a pill on its
             own and a line across its top edge would be a rule attached to
             nothing. */
          /* No rule when the field is inset. A bordered box sitting inside
             the surface separates itself; a line above it as well gives the
             composer two edges and reads as a toolbar bolted under the
             conversation. The rule only earns its place when the field runs
             flush to the pane's own edges. */
          borderTop: undefined,
          /* Smoked glass, neutral grey. No drop shadow — the pane sits flat
             against the page rather than hovering over it, which is what stops
             it reading as a "widget".

             The one edge it does carry is a faint white hairline, the way a
             real sheet of glass catches light along its cut. Low enough to be
             barely there on a pale background, and enough to hold the shape
             where the page goes near-black. */
          background:
            t.paneSoft,
          backdropFilter: t.paneFilter,
          WebkitBackdropFilter: t.paneFilter,
          /* The hairline is an inset ring rather than a border so it costs no
             layout: 64 = 8 + 48 + 8 exactly, and a real border would push the
             controls 2px past the height. */
          /* Same hairline whether or not the field is focused — no ring, no
             glow. The pane widening and the controls trading places already
             say it's engaged.

             Once the panel is up, the composer is the bottom of the merged
             surface and casts nothing — the column's shadow ghost wraps the
             whole window in one symmetric shadow. Anything painted here
             disagrees with that cast at the seam, and the disagreement is
             what kept reading as a second surface. */
          boxShadow: unified && panelUp ? "none" : t.ring,
        }}
      >
        {/* The launcher's hairline, travelling round it.

            The same violet the field takes when you focus, so the mark that
            says "live" is one colour in both places — and moving, because a
            static ring on a resting pill is just a border. A highlight going
            round is the launcher saying it's awake without growing, jumping or
            making a sound, which is about as much as something parked over
            someone else's page should do.

            Two elements, and the reason is worth writing down. A conic
            gradient can't be rotated as a paint — only the angle it starts
            from can move, and animating that means registering a custom
            property as an angle. An @property rule is what that takes, and
            adding one to the stylesheet is what broke the composer's
            transparent field the first time this was tried. So nothing is
            registered and no angle is interpolated: an oversized square of the
            gradient simply spins behind a mask, which is a plain transform and
            can't affect anything outside this element.

            The mask is the frame. Two layers, one clipped to the content box
            and one to the border box, composited to exclude — leaving the 1px
            of padding between them and nothing else. A mask applies to the
            whole subtree, so the spinning square inside is cut to that ring
            too.

            w-[150%] with a square aspect: the spinner has to cover the pill's
            diagonal at every angle, and the pill is far wider than it is tall.
            Anything less and the corners go bare four times a revolution.

            Only while the composer is a pill of its own, and not until the
            close has finished. `panelUp` is just chatOpen now, so without the
            second condition the ring mounts on the frame you press close and
            starts sweeping while the pill is still contracting — a bright
            point entering from one edge and travelling, on top of a shape
            that is meant to be settling. It waits for the perimeter it is
            going to travel to stop moving. */}
        {!panelUp && !closingNow && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[inherit] motion-reduce:hidden"
            style={{
              padding: LAUNCHER_RING_PX,
              WebkitMask:
                "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              maskComposite: "exclude",
            }}
          >
            <span
              className="absolute top-1/2 left-1/2 aspect-square w-[150%] -translate-x-1/2 -translate-y-1/2 animate-spin"
              style={{
                background:
                  "conic-gradient(var(--brand-lite) 0deg, color-mix(in srgb, var(--brand-lite) 55%, transparent) 30deg, transparent 90deg, transparent 270deg, color-mix(in srgb, var(--brand-lite) 40%, transparent) 330deg, var(--brand-lite) 360deg)",
                animationDuration: `${LAUNCHER_RING_MS}ms`,
                animationTimingFunction: "linear",
              }}
            />
          </span>
        )}

        {/* What you were in the middle of, on hover.

            The resting launcher can only afford one line, and for someone
            coming back it spends it on "continue your conversation" — which
            says there is something behind the pill without saying what. This
            is what. Opened by the same hover that widens the pill, so the
            gesture that says "I might" is also the one that answers "with
            what?".

            The exchange, not a summary: their own question with a rule
            beside it, then the answer under it. The rule is the cheapest
            thing that marks one of the two as theirs, and marking one is
            enough to make the other the agent's — labelling both would be
            captioning a pair that only needs one caption.

            Clamped to two lines. A real answer can run four paragraphs, and
            a launcher resting on someone's page that grows to hold all of it
            is a panel nobody opened. Two lines is enough to recognise which
            conversation this is, which is the only question being asked out
            here.

            The same 0fr → 1fr grid the starters use, so the card measures
            itself and the pill grows around it without a height to keep in
            sync. */}
        {unified && (
          <div
            className="grid motion-reduce:transition-none"
            style={{
              gridTemplateRows: recallOpen ? "1fr" : "0fr",
              transition: `grid-template-rows ${PANEL_MS}ms ${PANEL_EASE}`,
            }}
          >
            <div className="overflow-hidden">
              {/* A rule under it, dividing the card from the field.

                  It is doing a different job now than when the starters sat
                  between the two: then it was one of three separations and
                  read as furniture. With the openers gone it marks the only
                  join left on the pill — what was said, and where you say
                  the next thing. */}
              <div
                className="flex flex-col gap-2 px-5 pt-4 pb-3"
                style={{ borderBottom: `1px solid var(--divider)` }}
                aria-hidden={!recallOpen}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="min-w-0 flex-1 truncate text-[10px] font-semibold tracking-[0.08em] uppercase"
                    style={{ color: "var(--brand)" }}
                  >
                    Your last message
                  </span>
                  {/* On the label's line, not the question's. Both are facts
                      about the exchange rather than part of it, so they
                      belong on the same row — and the question keeps its full
                      width for the words. */}
                  <span
                    /* Same size, same weight, same colour as the label it
                       shares the row with. They are one line of metadata
                       about the exchange, and a lighter time beside a
                       semibold label read as two separate notes rather than
                       as the two ends of one. */
                    className="shrink-0 text-[10px] font-semibold"
                    style={{ color: "var(--brand)" }}
                  >
                    {lastReply ? formatTime(lastReply.at) : ""}
                  </span>
                </div>

                <span
                  className="truncate border-l-2 pl-2.5 text-[13px] text-[var(--ink-mute)]"
                  style={{ borderColor: "var(--brand-lite)" }}
                >
                  {lastAsk?.text}
                </span>

                <span className="line-clamp-2 text-[14px] leading-snug text-[var(--ink)]">
                  {lastReply ? plain(lastReply.text) : ""}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Unmounted, not merely collapsed, when the chips live outside.

            The row is inside an overflow-hidden 0fr grid track, so leaving it
            in place would look identical — but a clipped row is still three
            buttons in the accessibility tree, and still a thing the pane's
            transitions run against every time the state changes. */}
        {/* Starters. The 0fr → 1fr grid row animates to whatever the content
            measures, so nothing has to be told its own height. */}
        {!startersOutside && (
        <div
          className="grid motion-reduce:transition-none"
          style={{
            gridTemplateRows: startersInside ? "1fr" : "0fr",
            /* The starters row is part of the composer opening, so it takes
               the composer's timing. On its own 650 it was still unfolding
               after the pane around it had stopped — and zero while a message
               is being sent, so the composer settles on its final height
               before the panel starts growing out of it. */
            transition: `grid-template-rows ${
              snapStarters ? 0 : PANEL_MS
            }ms ${PANEL_EASE}`,
          }}
        >
          <div className="overflow-hidden">
            {/* Padding lives inside the clipped child, so it collapses too.
                Wider inset than the composer row below: at 8px the first chip
                lands inside the 32px corner arc, where the real gap is far
                tighter than the number suggests. */}
            {/* Laid out at the open width from the start, and nothing here may
                depend on the parent's width.

                The pane this sits in animates 400 → 580, and a flex row
                measures itself against its parent — so left alone, the three
                chips don't fit at the shut width, begin wrapped onto two
                lines, and snap up to one partway through the expand, taking
                the row's height with them. That snap is what reads as the
                buttons jumping.

                Hence the fixed width and, just as importantly, no max-width:
                `max-w-full` resolves against this same animating parent, so
                it silently clamps the row back to the pane's current width and
                undoes the pin completely. The row has to be genuinely rigid;
                the parent's overflow-hidden is what handles it being wider
                than the pane, uncovering the chips as the pane grows.

                The cost is narrow viewports: under ~610px the pane is capped
                below its open width and the last chip clips off the right
                rather than wrapping. Fixing that needs a scroll row or shorter
                labels, not a max-width — a max-width brings the jumping
                straight back.

                Wrapping is back on, which looks like undoing that fix and
                isn't. The jumping came from the row *resizing* mid-animation,
                not from wrapping as such: pinned to a fixed width, the wrap is
                computed once and never recomputed, so the chips land on
                whatever lines they need and stay there. It's needed because
                the corner placements open to 400 rather than 580, where three
                chips measuring ~457px can't share a line.

                shrink-0 and whitespace-nowrap are the other half. Flex items
                shrink before they wrap, so without them the chips squeezed
                instead of moving down and their labels broke across two lines
                inside the pills. */}
            {/* On a phone the pin comes off and the row takes the pane's own
                width, which is what lets the third chip wrap onto a second
                line instead of clipping off the right edge.

                That's safe here for the reason the pin existed in the first
                place: the jumping it prevents comes from the row being
                measured against a parent whose width is animating, 400 → 580.
                On a phone the pane doesn't animate — it is 100% of the screen
                open and shut — so there is no mid-animation remeasure to
                guard against, and a row that simply wraps is the correct
                answer rather than a compromise. */}
            {/* The teaser — the agent's voice reaching the launcher.

                One line of the greeting above the chips, so the focused
                composer reads as the conversation already underway rather
                than a bare row of buttons: the agent says something, the
                chips are the replies on offer. Inside the same collapsing
                grid as the chips, so it arrives and leaves with them and
                the open panel never shows it twice. */}
            {content.teaser && (
              <p
                className="px-4 pt-3 text-[13.5px] leading-snug text-[var(--ink-soft)]"
                style={{ width: phone ? "100%" : geo.open }}
              >
                {content.teaser}
              </p>
            )}
            <div
              /* relative + right padding for the expand icon, which is pinned
                 to the corner rather than flowing after the chips — as a flex
                 item it wrapped onto a line of its own whenever the derived
                 labels ran long, and an icon alone on a row reads as lost. */
              className="relative flex flex-wrap gap-2 px-3 pt-3 pb-2 pr-11"
              style={{ width: phone ? "100%" : geo.open }}
            >
              {/* No animation on the chips themselves — they're simply there,
                  and the row opening is what brings them into view. The only
                  transition left is the hover colour, which is a response to
                  the pointer rather than part of the opening. */}
              {starters.map((s) => {
                /* Two on the first line, the long one alone on the second.

                   Left to wrap on its own the row went to three lines: each
                   chip is sized to its label, and three labels of roughly a
                   phone-width between them means no two happen to fit
                   together. So the layout is stated rather than discovered —
                   the longest label takes a line of its own, and the other two
                   share the line above it by growing into equal halves.

                   Longest by label length, computed rather than named: the
                   starters are copy and copy gets rewritten, and a hardcoded
                   index would silently point at the wrong chip the first time
                   someone reorders them.

                   order-last is what puts it underneath regardless of where it
                   sits in the list — the pair above stays in written order,
                   which is the order the labels were chosen in. */
                const longest = starters.reduce((a, b) =>
                  b.length > a.length ? b : a,
                );
                const alone = phone && s === longest;
                /* The line is full width; the chip on it isn't.

                   `w-full` on the button itself is what claims the second
                   line, and it also stretches the pill the whole way across —
                   which turns a suggestion into a banner, and makes it the
                   heaviest thing in the launcher when it is the least
                   important of the three. A full-width wrapper does the
                   claiming instead, and the button inside goes back to being
                   sized by its label like the two above it. */
                const chip = (
                  <button
                    key={s}
                    type="button"
                    tabIndex={startersInside ? 0 : -1}
                    /* Sends outright rather than loading the field. A starter
                       is a thing to say, not a draft to edit — dropping it
                       into the input and waiting adds a step to the one
                       interaction that was meant to skip them. */
                    onClick={() => send(s)}
                    /* Brand-tinted rather than the pane's grey: a starter is
                       the agent's offer, and the offer should carry the
                       tenant's colour. Both ends mix from --brand — a pale
                       wash behind a darkened ink of the same hue — so the
                       chip stays one colour at two strengths, and re-theming
                       a tenant re-themes these for free. */
                    /* Rest moved 9% → 14%, matching what used to be only the
                       hover strength. A flat mix percentage isn't the same
                       wash on every hue: 9% of a deep blue (GP) still reads
                       as a definite tint, but 9% of a light, already-bright
                       orange (Brightline) mixes down to barely more than
                       white — the same number, two different amounts of
                       "there." 14% is the lightest step that still holds up
                       on a light accent without over-darkening a deep one, so
                       hover and active move up a step behind it (20%, 32%)
                       to keep the same three-step escalation. */
                    /* Hover holds still and outlines instead: a ring in the
                       brand colour plus one step more wash. The ring is what
                       the host site's own pills do on hover, and a chip that
                       doesn't move can't jiggle the row it shares with two
                       others. Pressed drops the ring and deepens the wash
                       again, so the click reads as the chip being taken
                       rather than pointed at.

                       1.5px at 45% — matching the ring Design's own launcher
                       preview draws (`chipStroke` in app/design), which is
                       the reference this chip is supposed to agree with. Not
                       the 1px this component had before: half a pixel doesn't
                       sound like a fix, but 1px rings are the ones that go
                       soft-to-invisible under browser antialiasing on a light
                       hue, and 1.5 is where the reference already landed. */
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-center text-[14px] font-normal text-[color-mix(in_srgb,var(--brand)_75%,black)] transition-[background-color,box-shadow] duration-200 ease-out hover:bg-[color-mix(in_srgb,var(--brand)_20%,white)] hover:shadow-[inset_0_0_0_1.5px_color-mix(in_srgb,var(--brand)_45%,transparent)] active:bg-[color-mix(in_srgb,var(--brand)_32%,white)] active:shadow-none ${
                      phone && !alone
                        ? /* basis-0 with grow, so the two split the line
                             evenly instead of each taking its label's width
                             and leaving a ragged gap between them. */
                          "min-w-0 flex-1 basis-0"
                        : "shrink-0"
                    }`}
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--brand) 14%, white)",
                    }}
                  >
                    {s}
                  </button>
                );

                /* The wrapper claims the line; the button keeps its own
                   width. justify-start so it sits under the pair above rather
                   than centred beneath them, which would read as a caption. */
                return alone ? (
                  <span key={s} className="order-last flex w-full justify-start">
                    {chip}
                  </span>
                ) : (
                  chip
                );
              })}

              {/* The expand control that used to sit in the corner of this
                  row is gone. It was the one way to open the conversation
                  without saying anything, back when the field itself only
                  answered to typing — and it stopped earning its place the
                  moment the field became a click target of its own: pressing
                  anywhere in the pill opens the messenger now, so a separate
                  icon for "open the messenger" is a second door beside an
                  unlocked one, in the corner of a row whose whole job is
                  offering the three things to say. */}
            </div>
          </div>
        </div>
        )}

        {/* Above the field, inside the surface. It moved from under the
            composer: as the last line of the pane it read as the window's
            colophon, and the ask was for the caveat to preface the field it
            applies to instead. pb-0 because the form below carries its own
            mt-3 — the gap is one number, kept on one element. The form is
            the pane's last child now, so the phone's safe-area padding rides
            on it instead. */}
        {unified && panelUp && !closeFlow && (
          /* Truncated to one line with the full text in a tooltip built
             from the pane's own surface — see the flush variant's copy of
             this comment for why not the browser's native `title`. A
             disclaimer specific enough to name who to ask (Brightline's
             does) runs past one line at this width, and wrapping it would
             push the field down a line that isn't part of the
             conversation. */
          /* 320 max, centred — see the flush variant's copy of this note.
             The cap is what decides how much of the line is read before the
             ellipsis, and it anchors the tooltip too. */
          <DisclaimerLine
            text={disclaimer}
            wrapClassName="relative mx-auto w-full"
            wrapStyle={{ maxWidth: noticeW }}
            pClassName="pt-2 pb-0 text-center text-[12px] text-[var(--note)]"
          />
        )}

        {/* The close flow replaces the composer: a conversation being closed
            has nothing to type into. Confirmation, then the rating, then the
            closed card — the panel's foot is whichever state the flow is in,
            and the pill comes back untouched if the panel is shut mid-flow. */}
        {unified && panelUp && closeFlow === "confirm" && (
          <div
            className="px-6 pb-5 pt-4 text-center"
            style={{ borderTop: `1px solid ${t.divider}` }}
          >
            <p className="text-[15px] font-medium text-[var(--ink)]">
              Close conversation
            </p>
            <p className="mt-1 text-[13px] text-[var(--ink-mute)]">
              Do you want to close this conversation?
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  /* Not closing after all — the set that offered End Chat
                     comes back to life. */
                  if (closeSrc.current !== null) {
                    const src = closeSrc.current;
                    setChosenButtons((prev) => {
                      const next = { ...prev };
                      delete next[src];
                      return next;
                    });
                  }
                  closeSrc.current = null;
                  setCloseFlow(null);
                }}
                className="cursor-pointer rounded-full bg-[var(--fill)] px-7 py-2.5 text-[13.5px] font-medium text-[var(--ink)] transition-colors hover:bg-[var(--fill-hover)]"
              >
                No
              </button>
              <button
                type="button"
                onClick={() => setCloseFlow("csat")}
                className="cursor-pointer rounded-full px-7 py-2.5 text-[13.5px] font-medium text-white transition-transform hover:-translate-y-px"
                style={{ backgroundColor: "var(--brand)" }}
              >
                Yes
              </button>
            </div>
          </div>
        )}

        {unified && panelUp && closeFlow === "csat" && (
          <div
            className="px-6 pb-5 pt-4 text-center"
            style={{ borderTop: `1px solid ${t.divider}` }}
          >
            <p className="text-[14.5px] font-medium text-[var(--ink)]">
              How was your conversation experience with us?
            </p>
            <div className="mt-3 flex items-start justify-center gap-2">
              {CSAT_EMOJI.map((e, i) => (
                <div key={e} className="flex w-12 flex-col items-center gap-1">
                  <button
                    type="button"
                    aria-label={CSAT_LABELS[i]}
                    onClick={() => setCsatRating(i + 1)}
                    className="cursor-pointer rounded-full p-1.5 text-[26px] leading-none transition-[background-color,transform,filter] duration-150 hover:scale-110"
                    style={
                      csatRating === i + 1
                        ? {
                            backgroundColor:
                              "color-mix(in srgb, var(--brand) 10%, white)",
                            boxShadow:
                              "0 0 0 1px color-mix(in srgb, var(--brand) 45%, transparent)",
                          }
                        : { filter: "grayscale(0.35)", opacity: 0.85 }
                    }
                  >
                    {e}
                  </button>
                  {/* Fixed-height label slot so choosing a rating doesn't
                      bump the rows below it. */}
                  <span
                    className="h-4 text-[11px] font-medium"
                    style={{ color: "var(--brand)" }}
                  >
                    {csatRating === i + 1 ? CSAT_LABELS[i] : ""}
                  </span>
                </div>
              ))}
            </div>
            <textarea
              value={csatText}
              onChange={(e) => setCsatText(e.target.value)}
              placeholder="Let us know how we can improve…"
              rows={2}
              className="mt-2 w-full resize-none rounded-[12px] bg-white px-3 py-2.5 text-left text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]"
              style={{
                boxShadow: `inset 0 0 0 1px ${t.divider}`,
              }}
            />
            <button
              type="button"
              disabled={csatRating === 0}
              onClick={() => setCloseFlow("done")}
              className="mt-3 w-full cursor-pointer rounded-full py-3 text-[14px] font-medium text-white transition-opacity disabled:cursor-default disabled:opacity-40"
              style={{ backgroundColor: "var(--brand)" }}
            >
              Submit Feedback
            </button>
            <button
              type="button"
              onClick={() => setCloseFlow("done")}
              className="mt-2 cursor-pointer text-[13px] text-[var(--ink-mute)] transition-colors hover:text-[var(--ink)]"
            >
              Cancel
            </button>
          </div>
        )}

        {unified && panelUp && closeFlow === "done" && (
          <div
            className="px-6 pb-5 pt-5 text-center"
            style={{ borderTop: `1px solid ${t.divider}` }}
          >
            <span className="relative inline-block text-[40px] leading-none">
              {CSAT_EMOJI[(csatRating || 4) - 1]}
              <span className="absolute -bottom-0.5 -right-1 grid size-4 place-items-center rounded-full bg-[#16A34A]">
                <Check className="size-3 text-white" strokeWidth={3} aria-hidden />
              </span>
            </span>
            <p className="mt-3 text-[15px] font-semibold text-[var(--ink)]">
              Thanks for your feedback!
            </p>
            <p className="mt-1 text-[13px] text-[var(--ink-mute)]">
              Your response helps us improve.
            </p>
            <p className="mt-5 text-[13px] text-[var(--ink-mute)]">
              Still have an issue?{" "}
              <button
                type="button"
                onClick={restartChat}
                className="cursor-pointer font-medium hover:underline"
                style={{ color: "var(--brand)" }}
              >
                Chat with us
              </button>
            </p>
          </div>
        )}

        {!(unified && panelUp && closeFlow) && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(value);
          }}
          /* Not while dictating: the input is hidden, and clicking the wave to
             focus something invisible only takes the focus ring somewhere
             nobody can see.

             Before the panel is up, a click anywhere in the row does what
             the field's own onMouseDown already stopped it from doing —
             opens the messenger, rather than focusing an input that isn't
             actually taking text yet. Once it's open the row goes back to
             being an ordinary field a click focuses. */
          onClick={() => {
            if (listening) return;
            if (!chatOpen) {
              openChat();
              return;
            }
            inputRef.current?.focus();
          }}
          /* Two shapes, one row.
 
             Flush (default): the form *is* the pane's bottom edge, 64px tall
             with a flat 8px inset — 8 + 48 + 8 is exactly the row height, so
             the vertical can't move, and the horizontal is kept equal to it
             because the discs sit hard against both ends and any difference
             shows as the row being off-centre. This was briefly widened to
             12 and then 16 while tuning the unified variant; that was a
             mistake, since it changed every other version too.

             Inset (unified, and only once a conversation is open): the field
             becomes a bordered box sitting inside the surface with 12px of
             pane around it, the way a messenger's input normally looks. The
             margin is what makes it read as inside something rather than as
             the bottom of it, and the ring is an inset shadow rather than a
             border so it costs no layout — a real border would add 2px and
             push the discs past the row height.

             rounded-full rather than a fixed radius, so the field's ends stay
             true half-circles whatever height it takes. At 56px a literal
             28px would be identical today and wrong the moment the row
             changes — the same reason the panel's 32px works: it's half its
             own shut height rather than a number that happens to fit.

             No fixed height: it comes from the padding plus the tallest
             child, which is what keeps the four sides genuinely equal. At 8px
             that lands the field on 8 + 50 + 8 = 66. Pinning a height instead
             would make the vertical padding a claim rather than a fact — the
             row would clip or centre-crop the discs and the number would stop
             describing what you see.

             Closed, it goes back to flush. The resting launcher is a pill on
             its own with nothing to sit inside, so a box drawn within a box
             is just a second outline round the same control. */
          /* Dictating turns the row into two.

             The transcript takes a full-width line of its own and the
             controls wrap under it — done with flex-wrap and a basis-full
             child rather than by switching the container to a column, so the
             three controls keep the single set of markup they have in the
             one-line state. A column would mean a second copy of the attach
             and send slots, which is two more places for the pair to drift.

             The pill has to stop being a pill at two lines: rounded-full on a
             box this tall bows the sides inward and the transcript ends up
             set inside a lens. The radius drops to the same 24 the panel's
             corners use.

             Same reason the fixed 64px row goes: it was 8 + 48 + 8 for one
             line of controls, and a second line has nowhere to go inside
             it. */
          /* 10px inside the window, and 10px across on the resting pill —
             but the pill keeps 8 down its vertical.

             That asymmetry is not a compromise, it is the constraint. The
             pill's row is a fixed h-16, which is exactly 8 + 48 + 8: the
             vertical padding is what centres a 48px disc in a 64px box, and
             raising it to 10 would ask for 68px of controls inside 64 and
             push them out of a height that cannot grow. The horizontal has
             no such job — the pill's width is set by the geometry table, so
             2px more inset each side simply moves the discs in off the
             corner arc and takes 4px from the field, which has it to give.

             Inside the window there is no conflict: that field has no fixed
             height at all (it comes from the padding plus the tallest child)
             so 10 a side just makes the box 10 + 50 + 10, and the panel above
             follows — its height is measured off this element rather than
             assumed. */
          className={
            unified && panelUp
              ? `mx-auto mt-3 mb-5 flex items-center gap-x-1 gap-y-2 p-2.5 ${
                  listening ? "flex-wrap rounded-[24px]" : "rounded-full"
                }`
              : `flex items-center gap-y-2 px-2.5 py-2 ${
                  listening ? "flex-wrap" : "h-16"
                }`
          }
          style={
            unified && panelUp
              ? {
                  /* One width, full stop. The narrow-at-rest / wide-on-focus
                     bargain was tried inside the window and read as the
                     composer having two states in a place that should have
                     one: inside a conversation, the field is the standing
                     invitation to speak, not a control that opens when
                     reached for. There was an entrance on top of that — one
                     narrow paint, then a 340ms ease — and that is gone too;
                     the field is at this width from the first frame. */
                  width: fieldFocused,
                  maxWidth: "100%",
                  /* The hairline stays inset; the focus halo sits outside.

                     Outside is the right read: an inset ring eats into the
                     field, so the halo appears to thicken the border and
                     shrink the space you're typing into at the exact moment
                     you commit to typing. Outside, the field keeps every
                     pixel it had and gains a glow around it — the control
                     lighting up rather than closing in.

                     Two shadows make it fade rather than stop. A single
                     `0 0 0 4px` ring has a hard outer edge — it reads as a
                     second border drawn around the first, which is what a
                     focus *outline* is and not what this wants to be. A 1px
                     ring for definition plus a 6px blurred spread behind it
                     falls off gradually instead, so the field looks lit from
                     within rather than fenced.

                     Both are outer shadows, so they cost no layout: the 12px
                     of pane around the field absorbs the glow without
                     anything moving.

                     Deliberately not the browser's default ring: that one has
                     to be visible against anything, so it's loud. This is a
                     field on a surface we control.

                     It lands faster than the width finishes, so the field
                     confirms the click before it has stopped opening — one
                     response rather than a resize followed by an
                     acknowledgement. */
                  /* Focus darkens the stroke rather than adding anything
                     around it. The halo made the field look wrapped — a ring
                     is a second shape, and two concentric outlines on a
                     control this small read as a highlight applied to it. One
                     hairline that goes from barely-there to legible is the
                     same information with nothing added: the edge you were
                     already looking at, now definite.

                     Still inset, so it costs no layout and the field can't
                     shift by a pixel as it darkens. */
                  /* One ring, always on. The grey divider hairline was the
                     resting state and it disappeared into the white pane —
                     a field you have to find isn't an invitation. The brand
                     ring is now constant, which also finishes the one-state
                     composer: no resting look, no focused look, just the
                     field. */
                  /* One ring, and focus makes it definite.

                     Resting it is the accent's lighter companion at 55% — a
                     hairline that says "field" without competing with the
                     answer above it. Clicking in takes the same 1px to the
                     accent itself: no halo, no second shape, no change in
                     thickness — the edge you were already looking at, now
                     certain. Anything that grew on focus would eat into the
                     space you just committed to typing in. */
                  boxShadow: focused
                    ? "inset 0 0 0 1px var(--brand)"
                    : "inset 0 0 0 1px color-mix(in srgb, var(--brand-lite) 55%, transparent)",
                  /* No width transition left to run: the field has one width
                     and takes it on the first frame. Kept as `none` rather
                     than deleted so it's explicit that this element is meant
                     to be still, not merely un-animated by omission. */
                  transition: "none",
                  /* The pane's last child carries the bottom safe area now
                     that the disclaimer moved above the field — otherwise
                     the home-indicator strip lands across the send button. */
                  ...(phone
                    ? {
                        marginBottom:
                          "calc(1rem + env(safe-area-inset-bottom, 0px))",
                      }
                    : null),
                }
              : undefined
          }
        >
        {/* Left slot — the orb trades places with attach.

            The orb is decoration, so it takes no focus and no label; the
            package ships only 64 and 20, and the 64 preset is scaled into the
            50px slot rather than dropping to the sparser 20 design.

            Both sit in the same box and cross-fade, so the row never reflows
            as they trade. */}
        {/* The left slot. With the orb it's a cross-fade between the two;
            without it, the slot itself opens and closes — empty at rest so
            the resting chip is just a field and a send button, and attach
            arriving with the expansion. */}
        {orb ? (
        <span className="relative size-[50px] shrink-0">
          <span
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 motion-reduce:transition-none"
            style={{ opacity: showAttach ? 0 : 1 }}
            aria-hidden
          >
            {/* The same orb as the thread's — connecting, at the same speed,
                under the same white-and-bloom treatment. One agent, one mark:
                the thing that sits in the resting field and the thing that
                answers you shouldn't be two different animations in two
                different colours.

                Only the scale differs, because the slot does: 50px here
                against 44 in the thread. Both scale from the 64 preset, so
                neither is fighting the sub-pixel problem.

                The shine is applied here rather than on the wrapper above so
                it doesn't bloom the attach button cross-fading in the same
                box — the two share a stacking slot, and a filter on the
                parent would catch both.

                #orb-launcher rather than the thread's shine: same animation
                and same white, with the brightest handful of dots fattened
                and lit. This is the one that's on screen at rest with nothing
                competing for attention, so it can carry the extra detail —
                the thread's two are glanced at mid-read and stay plain. */}
            <span
              style={{ transform: `scale(${50 / 64})`, filter: t.orbLauncher }}
            >
              <ThinkingOrb state="connecting" size={64} speed={2.5} theme="dark" />
            </span>
          </span>

          {/* preventDefault on mousedown keeps focus off this button — taking
              it would flip the row back to orb/send under the click. */}
          <button
            type="button"
            aria-label={leftLabel}
            tabIndex={showAttach ? 0 : -1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onLeft}
            className="absolute inset-[1px] flex items-center justify-center rounded-full bg-[var(--disc)] transition-opacity duration-300 hover:bg-[var(--disc-hover)] motion-reduce:transition-none"
            style={{ opacity: showAttach ? 1 : 0, pointerEvents: showAttach ? "auto" : "none" }}
          >
            {/* Lighter and smaller than the send arrow despite sharing a disc:
                the arrow is a sparse glyph, while a plus reads as two full
                strokes across the whole box and a mic is a dense shape. Same
                optical weight takes different numbers. */}
            <LeftIcon className="size-5 text-[var(--ink)]" strokeWidth={1.5} aria-hidden />
          </button>
        </span>
        ) : (
          /* Attach appears with the expansion and isn't there at rest.

             It animates its own width from 0 rather than being mounted and
             unmounted, on the same timing the pane uses — so the slot opens as
             part of the composer widening rather than a button popping into a
             row that has already finished moving. overflow hidden is what lets
             a 50px button live inside a 0px box while it's closed.

             Not while the messenger is opening, though: the composer takes
             its open shape on the first frame there (see its wrapper's
             transition), and a slot still sliding out underneath a panel
             that has already arrived is the one piece of the row left
             moving after everything else has stopped.

             tabIndex -1 when shut, or keyboard focus lands on a control
             nobody can see. */
          <span
            className="flex shrink-0 items-center overflow-hidden motion-reduce:transition-none"
            style={{
              width: showAttach ? attachPx : 0,
              opacity: showAttach ? 1 : 0,
              transition: chatOpen
                ? "none"
                : `width ${PANEL_MS}ms ${PANEL_EASE}, opacity ${PANEL_MS}ms ${PANEL_EASE}`,
            }}
          >
            <button
              type="button"
              aria-label={leftLabel}
              tabIndex={showAttach ? 0 : -1}
              onMouseDown={(e) => e.preventDefault()}
              onClick={onLeft}
              className="flex shrink-0 items-center justify-center rounded-full bg-[var(--disc)] transition-colors hover:bg-[var(--disc-hover)]"
              style={{ width: attachPx, height: attachPx }}
            >
              <LeftIcon className="size-5 text-[var(--ink)]" strokeWidth={1.5} aria-hidden />
            </button>
          </span>
        )}

        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          /* Before the panel is up this field is a preview of an input, not
             one — the launcher's job is to say what it takes and hand off to
             the messenger, not to collect the first message itself. Real
             focus (and the caret that comes with it) is what would promise
             otherwise, so it's stopped at the source: mousedown is where the
             browser would plant the caret, one event before our own onClick
             opens the messenger instead. readOnly is the second half of the
             same rule for every path that isn't a mouse — Tab then a paste,
             an OS autofill — and caretColor covers the one thing readOnly
             doesn't, which is a focused-but-empty field still blinking a
             caret nobody can type at. All three fall away the moment
             `chatOpen` is true and this is an ordinary field again.

             cursor: pointer for the same stretch — an I-beam is the browser
             promising a caret that preventDefault above just refused to
             plant, which is the cursor lying about what a click does here.
             Pointer is what the rest of the row's click-to-open controls
             already show; the field matches them instead of standing out
             as the one part of the pill still claiming to be text input. */
          onMouseDown={(e) => {
            if (!chatOpen) e.preventDefault();
          }}
          readOnly={!chatOpen}
          style={{
            caretColor: chatOpen ? undefined : "transparent",
            cursor: chatOpen ? undefined : "pointer",
          }}
          /* The empty state of a field that is waiting to be spoken into, not
             the invitation to type that the rest of the row is offering. */
          placeholder={listening ? "Listening…" : placeholder}
          aria-label={content.ariaPrompt}
          /* Light weight, softly translucent and unshadowed — the reference
             lets the prompt sit quietly in the glass rather than printing on
             top of it. */
          /* 14px on the merged variant, 16 everywhere else. The inset field
             is a box inside the window rather than the window's own bottom
             edge, so its type sits with the conversation rather than above
             it — 16 there read as the largest text in a panel whose messages
             are 14.

             Worth knowing 16 is also the threshold below which iOS Safari
             zooms the page on focus. That only bites on a real phone, and
             this variant hasn't been looked at on one yet. */
          /* The real field, on its own line while dictating — not a read-only
             copy of the transcript beside a hidden input.

             A mirror was the first attempt and it hides a fault: text only
             reaches a mirror if the recogniser is the thing producing it,
             where the field itself also catches anything the platform's own
             dictation types into whatever is focused. One element that shows
             the value, whoever wrote it, is both simpler and honest about
             what is actually in the composer.

             order-first with a full width is what puts it on the top line and
             wraps the controls under it. The DOM order stays attach, field,
             send — the order the row has when nobody is dictating. */
          /* The resting resume line wears the accent, not placeholder grey.
             Every other line this field shows is a hint — an example
             question, an invitation to type — and grey is what a hint looks
             like. "Continue your conversation" is not a hint: it is the
             launcher saying there is something of yours behind it, which is
             the one piece of information in the resting state worth colour.

             It drops back to grey the moment the card opens, because by then
             the colour has moved. Shut, the line is the only thing claiming
             there is a conversation here, so it carries the accent. Open,
             the card above it is doing that — its label and time are the
             accent now, and the exchange is right there — so the line
             underneath goes back to being what it actually is at that point:
             the prompt on a field. Two accent items on a pill this size is
             one too many, and the wrong one was shouting. */
          className={`min-w-0 bg-transparent px-3 font-light tracking-[0.01em] text-[var(--ink)] outline-none ${
            resuming && !recallOpen
              ? "placeholder:text-[var(--brand)]"
              : "placeholder:text-[var(--ink-mute)]"
          } ${unified ? "text-[14px]" : "text-[16px]"} ${
            listening ? "order-first w-full py-1" : "flex-1"
          }`}
        />

        {/* Below the field, between the two controls that act on it. */}
        {listening && <VoiceWave live={metering} />}

        {/* Right slot — send trades places with dictate.

            A lighter disc of the same glass rather than a filled brand button,
            so it belongs to the pane instead of sitting on it. Send stays at
            full strength rather than disabling on an empty field: this is a
            launcher, and a ghosted arrow reads as broken. Submitting empty is
            a no-op. */}
        <span
          className="relative shrink-0"
          style={{ width: sendPx, height: sendPx }}
        >
          <button
            type="submit"
            aria-label="Send"
            tabIndex={swapped ? -1 : 0}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-[var(--disc)] transition-[opacity,background-color] duration-300 hover:bg-[var(--disc-hover)] motion-reduce:transition-none"
            style={{
              opacity: swapped || showResume ? 0 : 1,
              pointerEvents: swapped || showResume ? "none" : "auto",
              /* Inline so it beats the hover class — the filled state is a
                 statement about whether the button will do anything, and a
                 hover shouldn't be able to wash it out. */
              ...(sendReady ? { backgroundColor: "var(--brand)" } : null),
            }}
          >
            <ArrowUp
              className="size-6"
              strokeWidth={1.75}
              style={{ color: sendReady ? "#FFFFFF" : "var(--ink)" }}
              aria-hidden
            />
          </button>

          {/* The resume mark. Same disc, same cross-fade as the other two
              faces of this slot, so the slot never resizes or reflows as
              they trade — only what is drawn inside it changes.

              The dot is the whole message: a bubble alone says "chat", a
              bubble with a dot says "chat, with something in it". Accent,
              because it is the same fact the line beside it is stating in
              words, and the two should be saying it in one colour. Ringed in
              the pane's own surface so it reads as sitting on the icon
              rather than as part of the glyph. */}
          <button
            type="button"
            aria-label="Continue your conversation"
            tabIndex={showResume ? 0 : -1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={openChat}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-[var(--disc)] transition-[opacity,background-color] duration-300 hover:bg-[var(--disc-hover)] motion-reduce:transition-none"
            style={{
              opacity: showResume ? 1 : 0,
              pointerEvents: showResume ? "auto" : "none",
            }}
          >
            {/* Design's own mark, and its own colouring with it.

                --ink-mute rather than --ink: the bubble is the container and
                the dot is the news, so drawing both at full strength makes
                the visitor read the shape before the signal.

                The badge is part of the artwork rather than a span hung off
                the button. Positioned over the disc it sat wherever that
                44px box's corner happened to be — near the glyph, not on it
                — and it stopped tracking the mark the moment either changed
                size. Inside the viewBox it is always at the same point on
                the bubble.

                CHIP_FILL for the ring because that is what is actually
                behind the dot: --disc is a translucent overlay, and a ring
                painted in it would show the bubble's own stroke through
                instead of cutting it. Same flattened grey Design writes out
                for the same reason. */}
            <ChatDotsMark
              className="size-6"
              style={{ color: "var(--ink-mute)" }}
              dot="var(--brand)"
              dotRing={CHIP_FILL}
            />
          </button>

          {/* Absent, not disabled, where the browser has no recogniser. */}
          {canDictate && (
          <button
            type="button"
            aria-label={listening ? "Use what you said" : "Dictate"}
            aria-pressed={listening}
            tabIndex={swapped ? 0 : -1}
            onMouseDown={(e) => e.preventDefault()}
            /* One press does both.

               It used to only open the messenger, on the argument that
               dictation into a closed launcher has nowhere to land — which is
               true of the words and wrong about the gesture. Pressing a
               microphone is an intention to speak, and answering it with a
               panel and a silent mic asks for the same press twice.

               So the panel opens and the recogniser starts with it. A frame
               apart, because dictate() puts the caret in the field and the
               field it should land in is the one inside the panel that is
               still being mounted. */
            onClick={() => {
              if (chatOpen) {
                dictate();
                return;
              }
              openChat();
              requestAnimationFrame(() => dictate());
            }}
            className="absolute inset-0 flex items-center justify-center rounded-full transition-[opacity,filter] duration-300 hover:brightness-95 motion-reduce:transition-none"
            style={{
              /* Stands down for the resume mark, which speaks for the same
                 slot and has more to say when there is a thread behind the
                 pill. */
              opacity: swapped && !showResume ? 1 : 0,
              pointerEvents: swapped && !showResume ? "auto" : "none",
              /* Filled, resting or listening.

                 It was the pane's own translucent grey until it opened, which
                 made the one control on a resting launcher read as a spacer
                 holding a glyph. Filled, it is what the eye lands on after the
                 line of text — and it says the tenant's colour once, in the
                 smallest place it can be said, rather than tinting the pill.

                 The listening state is then carried by the ring and the glyph
                 rather than by the fill, which is the right way round: a
                 microphone that is open is a different thing from a microphone
                 you could open, and that difference should not be a colour the
                 control already had. */
              backgroundColor: "var(--brand)",
            }}
          >
            {/* The ring is the recording light: a disc the size of the button
                scaled out and faded on a loop, clipped by the button's own
                rounding. Slow — a fast pulse under a live microphone reads as
                an alarm rather than as a state. */}
            {listening && (
              <span
                className="pointer-events-none absolute inset-0 rounded-full bg-white/30"
                style={{ animation: "mic-pulse 1600ms ease-out infinite" }}
                aria-hidden
              />
            )}
            {/* A tick, not a mic with a line through it. Pressing this keeps
                what was said and puts it in the field — the mic glyph would
                describe the state the button is in rather than what pressing
                it does, and next to a cancel cross the pair reads as discard
                and accept without either needing a label. */}
            {listening ? (
              <Check
                className="relative size-5 text-white"
                strokeWidth={2}
                aria-hidden
              />
            ) : (
              <Mic
                /* White on the filled disc — the disc carries the colour, the
                   glyph draws on it. */
                className="relative size-5 text-white"
                strokeWidth={1.5}
                aria-hidden
              />
            )}
          </button>
          )}
        </span>
        </form>
        )}

      </div>
      )}

      </div>
    </div>
    </ContentContext.Provider>
  );
}
