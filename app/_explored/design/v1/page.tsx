"use client";

import {
  ConfigurePanel,
  type SuggestionState,
} from "@/components/configure/ConfigurePanel";
import { DashboardRails } from "@/components/dashboard/DashboardRails";

import {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
  createElement,
  Fragment,
  type CSSProperties,
} from "react";
import { Button } from "@/components/ui/button";
/* the composer's own mark, so the thinking state here and in the real
   product are the same object rather than two similar stars */
import { AccentSparkle } from "@/components/launcher/GlassComposer";
import {
  Check,
  RotateCcw,
  Download,
  Link as LinkIcon,
  Lock,
  Monitor,
  Tablet,
  Smartphone,
  ImagePlus,
  MoreVertical,
  ArrowUp,
  Plus,
  Mic,
  X,
  Info,
  Sparkles,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Bot,
  Users,
  Settings,
  ChevronLeft,
  ChevronDown,
  Circle,
  RectangleHorizontal,
  Square,
  ExternalLink,
  Sun,
  Moon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  BookOpen,
  Globe,
  MoreHorizontal,
  Pencil,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────
   Design section — the customer-facing customization panel.
   Philosophy: one accent + logo + a few words. Everything else derived.
   The dashboard chrome is always neutral; only the PREVIEW reflects the
   customer's theme. ───────────────────────────────────────────────────── */

type Device = "desktop" | "tablet" | "mobile";

/* accent lives on the Agent side of the product; the launcher inherits it */
const ACCENT = "#632E9A";

/* ─── launcher settings model ─────────────────────────────────────────────
   Two launcher designs share one settings shape. Fields that only apply to
   one of them are still held here so switching type is lossless — you don't
   lose your button icon by previewing the composer. */
type LauncherType = "composer" | "button";
type Placement = "left" | "center" | "right";

/* a contextual prompt set — matched against the page path the visitor is on */
type ContextRule = {
  id: string;
  label: string;
  match: string;
  prompts: string[];
};

type LauncherSettings = {
  type: LauncherType;
  placement: Placement;
  offsetX: number;
  offsetY: number;
  shape: ButtonShape;
  style: LauncherStyle;
  chipLabel: string;
  iconKey: string;
  customIcon: string | null;
  /* kept so the row can say which file, not just that there is one */
  customIconName: string | null;
  placeholder: string;
  defaultPrompts: string[];
  contextualOn: boolean;
  greetingOn: boolean;
  rules: ContextRule[];
  delay: number;
  soundOn: boolean;
};

const DEFAULT_LAUNCHER: LauncherSettings = {
  type: "composer",
  placement: "center",
  offsetX: 24,
  offsetY: 24,
  shape: "square",
  style: "fill",
  chipLabel: "Ask AI",
  iconKey: "sparkles",
  customIcon: null,
  customIconName: null,
  /* One line, used everywhere the visitor types: the launcher once it is open
     or focused, and the messenger's own composer. At rest the launcher cycles
     the contextual suggestions instead — those are the sales pitch, this is
     the label on an input. */
  placeholder: "Ask me anything…",
  /* The visitor's own words, not the agent's: each of these becomes the user's
     message the moment it is clicked, so "Check Tars pricing" — an instruction
     aimed at the visitor — read wrong the second it appeared in their bubble. */
  defaultPrompts: [
    "What can Tars do?",
    "Can I book a demo?",
    "How much does it cost?",
  ],
  contextualOn: true,
  /* On by default: plenty of customers still want to say who is answering
     before anyone commits to a conversation, and the ones who don't can switch
     it off. The composer launcher has no equivalent — it is the ChatGPT
     pattern, where nothing speaks first. */
  greetingOn: true,
  rules: [
    {
      id: "pricing",
      label: "Pricing",
      match: "/pricing",
      prompts: [
        "Compare the plans",
        "Is there a free trial?",
        "How does billing work?",
      ],
    },
    {
      id: "about",
      label: "About",
      match: "/about",
      prompts: [
        "Who founded the company?",
        "Where are you based?",
        "Are you hiring?",
      ],
    },
  ],
  delay: 0.5,
  soundOn: false,
};

/* ─── /composer-launcher/v6 ───────────────────────────────────────────────
   The composer preview reproduces the v6 build — <GlassComposer theme="white"
   orb={false} unified /> — at rest. Values are lifted from GlassComposer's
   THEME.white and its layout constants rather than re-picked by eye, so the
   two stay comparable. It rests narrow and widens to show its prompts, which
   on the real site is triggered by scrolling; here it's hover. */
const V6 = {
  widthShut: 340,
  /* Expanded width depends on where it sits: centred it can afford 600,
     but pinned to an edge that is two-thirds of the frame shoved against
     one side, so the original drops to 400 there. */
  widthOpen: 600,
  widthEdge: 400,
  height: 64,
  radius: 32,
  pad: 8,
  sendPx: 44,
  ink: "#16181D",
  inkSoft: "#2B2F36",
  inkMute: "#6B7280",
  disc: "rgba(15,17,26,0.055)",
  discHover: "rgba(15,17,26,0.11)",
  ring: "inset 0 0 0 1px rgba(15,17,26,0.06), 0 1px 2px rgba(15,17,26,0.10), 0 6px 16px rgba(15,17,26,0.12), 0 16px 40px rgba(15,17,26,0.18), 0 32px 80px rgba(15,17,26,0.12)",
  panelMs: 280,
  panelEase: "cubic-bezier(0.16, 1, 0.3, 1)",
  ringMs: 5200,
  ringPx: 2,
};

/* Typing cadence, copied from the original. The hold is derived from the
   question's word count rather than fixed, so a long line gets the time it
   needs to be read and a short one doesn't outstay its welcome. */
const TYPE_MS = 45;
const ERASE_MS = 22;
const holdFor = (s: string) => 600 + s.trim().split(/\s+/).length * 280;

/* Sites we hold a picture of rather than capture on demand.

   A screenshot service gets served a bot-check page for anything behind
   Cloudflare — globalpayments.com among them — so the capture "succeeds" and
   returns a near-blank security notice. For those, a checked-in shot of the
   real page is both accurate and instant. */
const LOCAL_SITES: { match: RegExp; src: string }[] = [
  { match: /globalpayments\.com/i, src: "/site-previews/globalpayments.jpg" },
];
const localSiteFor = (origin: string) =>
  LOCAL_SITES.find((s) => s.match.test(origin)) ?? null;

/* thum.io renders a public page to an image. `fullpage` returns the whole
   document rather than a viewport crop, which is what makes the preview
   scrollable. Private, blocked or slow sites fail, which is why every shot has
   the sample skeleton behind it. */
const shotUrl = (origin: string, path: string) =>
  `https://image.thum.io/get/width/1200/fullpage/noanimate/${origin.replace(/\/+$/, "")}${
    path === "/" ? "" : path
  }`;

/* ─── the four marks ──────────────────────────────────────────────────────
   Each comes from a different set and is drawn to its own margins inside the
   24-unit box: the sparkle fills 23 of it, the robot 22, the bubble and the
   headset 20. Rendered at one size that is a 15% difference, and the sparkle
   looked oversized on the button next to the others.

   Rather than rescale the paths — which would mean re-deriving coordinates
   every time one is swapped — each carries a viewBox framing its own drawing:
   a square centred on what the mark actually occupies, sized so the drawing
   fills 20 of every 24 units. Same centre and same bounding box, whatever the
   source did. Swapping an icon means measuring it and setting one viewBox.

   With the boxes equal, the sparkle is then rendered larger — 24px where the
   others are 20. Matching bounding boxes only equalises size where the shapes
   carry similar mass, and a four-pointed star with thin arms inks about 18% of
   its box against 55–66% for the three solid marks, so boxed identically it
   measured the same and looked small. Kept as a rendered size rather than a
   tighter viewBox so there is one place the allowance lives, and it reads as
   what it is: this mark is drawn bigger because it is lighter. */

/* The element, not the mark. Every viewBox frames its drawing at 20 of 24
   units, so an svg sized 24 puts a 20px mark on the button — which is the size
   worth thinking in, since it is what anyone looking at the button sees. 24
   here means 20px of icon, and the sparkle's 1.2 makes it 24px of icon. */
const ICON_PX = 24;

/* 1 renders at the base size; the sparkle takes 1.2 of it. */
const ICON_SCALE: Record<string, number> = { sparkles: 1.2 };
const iconScale = (key: string) => ICON_SCALE[key] ?? 1;

/* The Tars mark: the tile with its four staggered bars, measured off the logo
   and mapped onto the 24 grid. One path — the bars are subpaths knocked out of
   the tile with evenodd, so the whole thing is a single shape in currentColor
   and takes whatever colour the line around it is using. Drawn rather than
   loaded, because a credit that depends on an image request is a credit that
   is missing when the request fails. */
function TarsMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.20 1.00 H17.80 A4.20 4.20 0 0 1 22.00 5.20 V18.80 A4.20 4.20 0 0 1 17.80 23.00 H6.20 A4.20 4.20 0 0 1 2.00 18.80 V5.20 A4.20 4.20 0 0 1 6.20 1.00 Z M6.42 6.06 H13.44 A0.93 0.93 0 0 1 13.44 7.92 H6.42 A0.93 0.93 0 0 1 6.42 6.06 Z M10.61 9.25 H17.53 A1.03 1.03 0 0 1 17.53 11.31 H10.61 A1.03 1.03 0 0 1 10.61 9.25 Z M6.42 12.59 H13.34 A1.03 1.03 0 0 1 13.34 14.65 H6.42 A1.03 1.03 0 0 1 6.42 12.59 Z M12.51 15.83 H17.83 A1.03 1.03 0 0 1 17.83 17.89 H12.51 A1.03 1.03 0 0 1 12.51 15.83 Z"
      />
    </svg>
  );
}

/* Thin and uniform. The set was stroked at 1.9, close to the weight of the text
   beside it — an icon that heavy reads as a glyph rather than a mark, and it is
   the single thing that dated the old set most. At 1.2 the line sits under a
   label without competing with it, and every icon carries the same weight so the
   grid looks like one family — the sizes here are tuned to that number, so
   changing it means re-checking that the narrow shapes still read as outlines
   rather than closing up.

   The sparkle is exempt: it is filled, not stroked, so weight does not apply. */
const ICON_STROKE = 1.2;

/* MingCute's message-3-fill, from the Iconify API, inlined rather than fetched
   at runtime — an icon that arrives over the network is an icon that is missing
   on a slow connection.

   evenodd is what knocks the two eyes out of the bubble: they are subpaths
   inside the same filled shape, so without the rule they would be filled solid
   along with it and the mark would have no face. Solid, so `strokeWidth` is
   accepted and ignored — it is in the signature only so the set can call every
   mark the same way. */
function ChatBubbleMark({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
  strokeWidth?: number;
}) {
  return (
    <svg
      style={style}
      viewBox="0 0.5 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13 20v1a1 1 0 0 1-1 1C6.984 22 2 18.087 2 11.5A8.5 8.5 0 0 1 10.5 3h3a8.5 8.5 0 0 1 0 17zm-6-8.5a1.5 1.5 0 1 1 3 0a1.5 1.5 0 0 1-3 0m7 0a1.5 1.5 0 1 1 3 0a1.5 1.5 0 0 1-3 0"
      />
    </svg>
  );
}

/* MDI's robot, from the Iconify API, inlined rather than fetched at runtime —
   an icon that arrives over the network is an icon that is missing on a slow
   connection.

   Solid, so `strokeWidth` is accepted and ignored: it is in the signature only
   so the set can call every mark the same way. */
function BotMark({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
  strokeWidth?: number;
}) {
  return (
    <svg
      style={style}
      viewBox="-1.2 -1.2 26.4 26.4"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5A2.5 2.5 0 0 0 7.5 18a2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5a2.5 2.5 0 0 0 2.5 2.5a2.5 2.5 0 0 0 2.5-2.5a2.5 2.5 0 0 0-2.5-2.5" />
    </svg>
  );
}

/* Solar's headphones-round-bold, from the Iconify API, inlined rather than
   fetched at runtime — an icon that arrives over the network is an icon that is
   missing on a slow connection, and this one sits on a launcher that has to be
   there the moment the page is.

   Solid, so `strokeWidth` is accepted and ignored: it is in the signature only
   so the set can call every mark the same way. Being filled makes it the one
   heavy mark among stroked ones, which is worth knowing when comparing it in
   the grid — the weight is the icon's own, not a mistake in the set. */
function HeadsetMark({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
  strokeWidth?: number;
}) {
  return (
    <svg
      style={style}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M2 12.124C2 6.53269 6.47713 2 11.9999 2C17.5228 2 21.9999 6.53269 21.9999 12.124L21.9999 17.3675C22.0002 18.1844 22.0004 18.7446 21.8568 19.2364C21.576 20.1982 20.9046 20.9937 20.01 21.4245C19.5525 21.6449 19.0059 21.732 18.2088 21.8591L18.0789 21.8799C17.7954 21.9252 17.5532 21.9639 17.3522 21.9839C17.1431 22.0047 16.9299 22.0111 16.7118 21.9676C15.9942 21.8245 15.4024 21.3126 15.1508 20.6172C15.0744 20.4059 15.0474 20.1916 15.035 19.9793C15.0232 19.7753 15.0232 19.527 15.0232 19.2365L15.0231 15.0641C15.0226 14.6386 15.0222 14.2725 15.1195 13.959C15.3422 13.2416 15.9238 12.6975 16.6477 12.5292C16.9641 12.4556 17.3246 12.4849 17.7435 12.5189L17.8367 12.5264L17.9465 12.5352C18.7302 12.5975 19.2664 12.6402 19.7216 12.8106C20.0415 12.9304 20.3381 13.0953 20.6046 13.2976V12.124C20.6046 7.31288 16.7521 3.41266 11.9999 3.41266C7.24776 3.41266 3.39534 7.31288 3.39534 12.124V13.2976C3.66176 13.0953 3.95843 12.9304 4.27829 12.8106C4.73345 12.6402 5.26965 12.5975 6.05335 12.5352L6.16318 12.5264L6.25641 12.5189C6.67534 12.4849 7.03581 12.4556 7.35224 12.5292C8.07612 12.6975 8.65766 13.2416 8.88039 13.959C8.97774 14.2725 8.9773 14.6386 8.97678 15.0641L8.97671 19.2365C8.97671 19.527 8.97672 19.7753 8.96487 19.9793C8.95254 20.1916 8.9255 20.4059 8.84906 20.6172C8.59754 21.3126 8.00574 21.8245 7.28812 21.9676C7.07001 22.0111 6.85675 22.0047 6.64768 21.9839C6.44671 21.9639 6.20449 21.9252 5.92102 21.8799L5.79106 21.8591C4.99399 21.732 4.44737 21.6449 3.98991 21.4245C3.09534 20.9937 2.42388 20.1982 2.14308 19.2364C2.02467 18.8309 2.00404 18.3788 2.0006 17.7747L2 17.5803V12.124Z" />
    </svg>
  );
}

/* A single four-pointed star with a deep waist, rather than lucide's cluster
   of three. Four cubics, one per quadrant, both handles pulled almost onto the
   centre: the curve leaves each tip travelling along the arm and only turns at
   the last moment, which is what makes the points sharp and the waist between
   them deep. The same path GlassComposer's own sparkle uses, so the two
   launcher types carry one mark. Written symmetrically — the same pair of
   numbers mirrored per quadrant — so it cannot end up subtly lopsided, which at
   this size shows as a lean. */
function SparkleMark({
  className,
  style,
}: {
  className?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      style={style}
      viewBox="-1.8 -1.8 27.6 27.6"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 0.5 C12.35 8.6 15.4 11.65 23.5 12 C15.4 12.35 12.35 15.4 12 23.5 C11.65 15.4 8.6 12.35 0.5 12 C8.6 11.65 11.65 8.6 12 0.5 Z" />
    </svg>
  );
}

/* Sparkles leads, and is the default. The stock speech bubble is the tell —
   every live chat since 2005 has used one, so it dates the product before a
   visitor has read a word, and it describes a chat window rather than something
   that answers questions. The bubbles stay for customers who want the familiar
   read; they are no longer the first thing offered. */
/* Lucide's components and the two drawn here share only the props actually
   used, so the list can hold either. Typing it as lucide's own component type
   would exclude our own marks; typing it loosely would lose the check that a
   row is a component at all. */
type MarkComponent = React.ComponentType<{
  className?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}>;

const LAUNCHER_ICONS: { key: string; label: string; Icon: MarkComponent }[] = [
  { key: "sparkles", label: "Sparkle", Icon: SparkleMark },
  { key: "chat", label: "Chat", Icon: ChatBubbleMark },
  { key: "bot", label: "Agent", Icon: BotMark },
  { key: "headset", label: "Support", Icon: HeadsetMark },
];

const iconFor = (key: string) =>
  LAUNCHER_ICONS.find((i) => i.key === key)?.Icon ?? SparkleMark;

/* Which prompt set shows on a given page. Longest match wins so "/pricing/pro"
   still resolves to the /pricing rule; anything unmatched falls back to the
   default set — that fallback is why the default list is never optional. */
/* Stands in for the generation engine, which does not run in a preview.

   The real thing reads the visitor's page along with the conversation and the
   agent's own configuration; here a handful of known sites carry the questions
   their visitors would actually arrive with. Enough to show the point the
   fallback set cannot: that the suggestions belong to the site they appear on,
   not to Tars. Anything unrecognised falls back, which is also what happens in
   the product before generation has run.

   Kept to roughly twenty characters each. The pane is 600 centred and 400 on an
   edge, so three long questions wrap to three lines against a side and the pill
   turns into a paragraph. Short ones sit on one line centred and two on an edge,
   which is the shape the launcher was drawn for. */
const GENERATED: { host: RegExp; prompts: string[] }[] = [
  {
    host: /globalpayments\./i,
    prompts: [
      "Where's my payout?",
      "How do disputes work?",
      "What are your fees?",
    ],
  },
  {
    host: /hellotars\./i,
    prompts: [
      "How do I get started?",
      "Can it use my docs?",
      "What does it cost?",
    ],
  },
];

const generatedFor = (url: string) =>
  GENERATED.find((g) => g.host.test(url))?.prompts ?? null;

function promptsFor(s: LauncherSettings, path: string) {
  const clean = (list: string[]) => list.map((p) => p.trim()).filter(Boolean);
  if (!s.contextualOn) return clean(s.defaultPrompts);
  const hit = s.rules
    .filter((r) => r.match.trim().length > 1 && path.startsWith(r.match.trim()))
    .sort((a, b) => b.match.length - a.match.length)[0];
  const chosen = hit ? clean(hit.prompts) : [];
  return chosen.length ? chosen : clean(s.defaultPrompts);
}

/* soft two-note chime on entrance — synthesised so there's no asset to ship.
   Browsers block audio until the page has been interacted with, so the very
   first auto-play after load may be silent; Replay always works. */
function playChime() {
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const t0 = ctx.currentTime;
    [660, 990].forEach((freq, i) => {
      const at = t0 + i * 0.1;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.05, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.34);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(at);
      osc.stop(at + 0.36);
    });
    setTimeout(() => void ctx.close(), 900);
  } catch {
    /* audio unavailable — the visual entrance still plays */
  }
}

/* ─── colour engine: brand hex → accent-soft / border / ink ───────────────
   Convert to OKLCH, hold the hue, set lightness + a (mostly fixed) chroma,
   convert back to hex. Fixed-chroma targets match the hand-tuned tenant
   trios across hues (purple / blue / red) far better than mixing-with-white,
   which greys the tint out. Computed in JS so we can show real hex values
   and so the embed never depends on CSS relative-colour support. */
const srgbToLin = (c: number) =>
  c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const linToSrgb = (c: number) =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

function hexToOklch(hex: string) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) =>
    srgbToLin(parseInt(h.slice(i, i + 2), 16) / 255),
  );
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(A, B), H: Math.atan2(B, A) };
}

function oklchToHex(L: number, C: number, H: number) {
  const A = C * Math.cos(H);
  const B = C * Math.sin(H);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((v) => Math.round(clamp(linToSrgb(v), 0, 1) * 255));
  return (
    "#" +
    rgb
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

/* The same hue at three lightnesses. Dark mode inverts the relationship — the
   bubble becomes a dark accent wash carrying light text — rather than reusing
   the light trio, which would put a near-white bubble on a near-black canvas. */
function deriveShades(accent: string, mode: "light" | "dark" = "light") {
  const valid = /^#[0-9a-fA-F]{6}$/.test(accent);
  const { L, C, H } = hexToOklch(valid ? accent : "#632E9A");
  if (mode === "dark") {
    return {
      soft: oklchToHex(0.3, Math.min(0.07, C), H),
      border: oklchToHex(0.42, Math.min(0.1, C), H),
      ink: oklchToHex(0.88, Math.min(0.06, C), H),
    };
  }
  return {
    soft: oklchToHex(0.93, Math.min(0.03, C), H),
    border: oklchToHex(0.78, Math.min(0.09, C), H),
    ink: oklchToHex(clamp(L * 0.8, 0.28, 0.5), C * 0.8, H),
  };
}

/* The accent's lighter partner, used for the composer's travelling edge.
   GlassComposer takes this as a second hand-picked prop (accentLite); deriving
   it instead keeps the promise that re-theming a tenant means changing one
   colour. Both hand-tuned pairs in the repo sit at roughly L 0.61 / C 0.21, so
   that is the target — hue held, which stays sane for red and blue tenants
   where the hand-tuned pairs also drift the hue a little. */
function liteOf(accent: string) {
  const valid = /^#[0-9a-fA-F]{6}$/.test(accent);
  const { C, H } = hexToOklch(valid ? accent : "#632E9A");
  return oklchToHex(0.61, Math.min(0.21, C * 1.25), H);
}

/* derived theme + accent shades — the whole engine in one place */
/* ─── platform neutrals ───────────────────────────────────────────────────
   Three curated palettes, each with a light and a dark set. Only the neutrals
   live here: the tenant's accent is derived separately and sits on top, so a
   palette never has to know which brand it is carrying. */
type ThemeKey = "light" | "warm" | "slate" | "midnight";
type Mode = "light" | "dark";

const NEUTRALS: Record<ThemeKey, Record<Mode, Record<string, string>>> = {
  warm: {
    light: {
      canvas: "#FFFDFA",
      surface: "#FFFFFF",
      paper: "#F9F3EA",
      line: "#E0DAD3",
      ink: "#333333",
      secondary: "#6E6E6E",
      muted: "#979797",
    },
    dark: {
      canvas: "#1C1917",
      surface: "#242020",
      paper: "#2A2523",
      line: "#3A3330",
      ink: "#F5EFE8",
      secondary: "#B8AFA6",
      muted: "#8A827A",
    },
  },
  /* GlassComposer's own `theme="white"`, which is what the Global Payments
     demo renders. Its alpha swatches resolved over white: fill/bubble 5.5%
     → #F2F2F2, divider 9% → #E9EAEA. Kept opaque here because these sit on a
     coloured page rather than on the component's own pane. */
  light: {
    light: {
      canvas: "#FFFFFF",
      surface: "#FFFFFF",
      paper: "#F2F2F2",
      line: "#E9EAEA",
      ink: "#16181D",
      secondary: "#6B7280",
      muted: "#9CA3AF",
    },
    dark: {
      canvas: "#0F0F10",
      surface: "#161617",
      paper: "#1D1D1F",
      line: "#2B2B2D",
      ink: "#F4F4F5",
      secondary: "#A6A6A9",
      muted: "#78787C",
    },
  },
  slate: {
    light: {
      canvas: "#FCFCFD",
      surface: "#FFFFFF",
      paper: "#F1F2F4",
      line: "#DCDEE3",
      ink: "#2E3138",
      secondary: "#666B75",
      muted: "#949AA5",
    },
    dark: {
      canvas: "#17181B",
      surface: "#1F2124",
      paper: "#26282C",
      line: "#35383E",
      ink: "#EDEEF0",
      secondary: "#A8ADB6",
      muted: "#7C828C",
    },
  },
  midnight: {
    light: {
      canvas: "#FBFCFE",
      surface: "#FFFFFF",
      paper: "#EEF1F6",
      line: "#D7DCE5",
      ink: "#1F2430",
      secondary: "#5C6472",
      muted: "#8B94A3",
    },
    dark: {
      canvas: "#101521",
      surface: "#171D2B",
      paper: "#1D2433",
      line: "#2B3446",
      ink: "#E8ECF4",
      secondary: "#9FA9BC",
      muted: "#74809A",
    },
  },
};

function useTheme(
  accent: string,
  themeKey: ThemeKey = "light",
  mode: Mode = "light",
) {
  return useMemo(() => {
    const neutral = NEUTRALS[themeKey][mode];
    const { soft, border, ink } = deriveShades(accent, mode);
    /* Paper runs the agent's replies bare on the surface; the others enclose
       both speakers. A palette property rather than a separate setting, since
       it is the palette that decides whether a second bubble reads at all. */
    const aiBubble = themeKey !== "light";
    /* Paper's one bubble is neutral rather than accent-tinted: it is the only
       enclosure in the thread, so it marks whose turn it is by containment and
       does not need colour to do the same job twice. */
    const userNeutral = themeKey === "light";
    /* and its composer is the pill: white, fully rounded, a hairline in the
       accent's lighter partner, with the controls as discs at either end. */
    const pillComposer = themeKey === "light";
    /* Slate and Midnight outline the composer instead of filling it: on a cool
       or dark neutral a filled field and its surface sit too close together to
       tell apart, so the edge does the work the fill was failing to do. A
       heavier stroke because it is now the only thing defining the control. */
    const outlineComposer = themeKey === "slate" || themeKey === "midnight";
    /* Slate draws that stroke from the accent rather than a neutral. Its greys
       are cool and close together, so a grey edge on a grey field barely
       separates the two — and with the fill and the ring both gone, the stroke
       is the only thing left to define the control. The border shade of the
       accent trio, not the accent itself: full strength on a 1.5px line around
       the whole field reads as an error state. */
    const accentStroke = themeKey === "slate";
    /* Slate stacks its composer — the field on its own line with the controls
       beneath. A single row makes the input compete for width with three
       controls, which is why the placeholder is always the first thing to get
       squeezed; giving the text the full width and the controls their own row
       costs about 30px of height and stops the two arguing. */
    const stackedComposer = themeKey === "slate";
    /* Light states the notice as a bare line above the composer: no surface
       behind it, no dismiss, held to one line with the rest on hover. The panel
       is the tightest of the four — bare replies, no bubble to sit against — so
       a grey card carrying three lines of legal copy becomes the largest block
       on screen and outweighs the conversation. Undismissable is the honest
       form once it is only a line: there is nothing to get out of the way of. */
    const bareNotice = themeKey === "light";
    return {
      neutral,
      accent,
      mode,
      aiBubble,
      userNeutral,
      pillComposer,
      outlineComposer,
      accentStroke,
      stackedComposer,
      bareNotice,
      bubbleFill: soft,
      bubbleBorder: border,
      bubbleInk: ink,
    };
  }, [accent, themeKey, mode]);
}

export default function DesignPage() {
  // top-level tab: the launcher, or the full agent messenger.
  // when on "agent", a device sub-selector picks the width.
  const [tab, setTab] = useState<"launcher" | "agent">("launcher");
  const [device, setDevice] = useState<Device>("desktop");
  /* A preview control, not a customer setting — which is why it lives out here
     with the device rather than in the settings panel, and why changing it
     never marks the design dirty. Nobody can review a returning visitor by
     waiting a day, so the four states have to be reachable by clicking. */
  const [session, setSession] = useState<SessionState>("first");

  /* Configure opens over the design tool rather than beside it. The two are
     different sections of the product and the point of showing them together
     is the handoff — you leave Design to change what the suggestions say, and
     come back to see it. Docking it in a corner would imply they are one
     screen, which is the thing we decided they are not. */
  const [configureOpen, setConfigureOpen] = useState(false);

  const [name, setName] = useState("Tars");
  const [subtitle, setSubtitle] = useState("Virtual Assistant");
  const [disclaimer, setDisclaimer] = useState(
    "AI can make mistakes. Check important info.",
  );
  const [disclaimerOn, setDisclaimerOn] = useState(true);
  const [brandingOn, setBrandingOn] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [logoOnly, setLogoOnly] = useState(false);
  const [accent, setAccent] = useState(ACCENT);
  /* Pinned. The direction is Light, so the palette is no longer a choice —
     this stays as the one value the theme engine still reads. */
  const themeKey: ThemeKey = "light";
  const [mode, setMode] = useState<Mode>("light");
  const [font, setFont] = useState("Poppins");

  // preview-only, so deliberately outside the saved config — pointing the
  // preview at a site isn't a change to the customer's launcher
  const [siteUrl, setSiteUrl] = useState("");

  const [launcher, setLauncher] = useState<LauncherSettings>(DEFAULT_LAUNCHER);
  const patchLauncher = useCallback(
    (patch: Partial<LauncherSettings>) =>
      setLauncher((l) => ({ ...l, ...patch })),
    [],
  );

  const t = useTheme(accent, themeKey, mode);

  /* ── save / dirty / publish state ── */
  const current = useMemo(
    () => ({
      name,
      subtitle,
      disclaimer,
      disclaimerOn,
      brandingOn,
      avatar,
      logoOnly,
      accent,
      themeKey,
      mode,
      font,
      launcher,
    }),
    [
      name,
      subtitle,
      disclaimer,
      disclaimerOn,
      brandingOn,
      avatar,
      logoOnly,
      accent,
      themeKey,
      mode,
      font,
      launcher,
    ],
  );
  const [saved, setSaved] = useState(current);
  const [justSaved, setJustSaved] = useState(false);
  const dirty = JSON.stringify(current) !== JSON.stringify(saved);

  const handleSave = useCallback(() => {
    setSaved(current);
    setJustSaved(true);
  }, [current]);

  const handleDiscard = () => {
    setName(saved.name);
    setSubtitle(saved.subtitle);
    setDisclaimer(saved.disclaimer);
    setDisclaimerOn(saved.disclaimerOn);
    setBrandingOn(saved.brandingOn);
    setAvatar(saved.avatar);
    setLogoOnly(saved.logoOnly);
    setAccent(saved.accent);
    setMode(saved.mode);
    setFont(saved.font);
    setLauncher(saved.launcher);
  };

  // clear the "Saved ✓" flash after a moment
  useEffect(() => {
    if (!justSaved) return;
    const id = setTimeout(() => setJustSaved(false), 2200);
    return () => clearTimeout(id);
  }, [justSaved]);

  // ⌘S / Ctrl+S to save
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirty) handleSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dirty, handleSave]);

  // warn before leaving with unsaved changes
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  /* The launcher settings and Configure's Suggestions page are two views of
     one thing, so they are adapted rather than copied: edit a suggestion in
     Configure and the launcher preview shows it on the way back. */
  const suggestionState: SuggestionState = {
    automatic: launcher.contextualOn,
    rules: launcher.rules.map(({ id, match, prompts }) => ({
      id,
      match,
      prompts,
    })),
    fallback: launcher.defaultPrompts,
  };
  const applySuggestions = (v: SuggestionState) =>
    patchLauncher({
      contextualOn: v.automatic,
      // label is Design's own; Configure never sees it, so it is rebuilt here
      rules: v.rules.map((r) => ({ ...r, label: r.match || "New page" })),
      defaultPrompts: v.fallback,
    });

  if (configureOpen) {
    return (
      <div className="h-screen">
        <ConfigurePanel
          suggestions={suggestionState}
          onSuggestions={applySuggestions}
          onBack={() => setConfigureOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FAFAFA] text-[#333333]">
      {/* preview fonts (Poppins already loaded app-wide via next/font). Loaded
          per-page on purpose: these exist only to preview the Font control. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Lato:wght@400;700&family=Nunito:wght@400;600;700&family=Roboto:wght@400;500;700&display=swap"
      />
      <DashboardRails
        section="design"
        onNavigate={(s) => setConfigureOpen(s === "configure")}
      />

      {/* ── main column ───────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* ── top bar ───────────────────────────────────────────────── */}
        {/* Three columns rather than three flex siblings. With justify-between the
              device tabs sat wherever the title and the save controls left them, so
              Discard appearing — which only happens once you have changed something
              — shoved the tabs sideways. Equal 1fr gutters pin the middle column to
              the centre of the bar whatever grows on either side. */}
        <header className="grid h-16 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-[#ECECEC] bg-white px-5">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-[15px] font-semibold leading-tight">
                Design
              </h1>
              <p className="text-[11px] text-[#979797]">
                Customize the look and feel
              </p>
            </div>
          </div>

          {/* Device selector, on both tabs. */}
          <div className="flex gap-0.5 rounded-lg border border-[#E5E5E5] bg-white p-0.5">
            {(
              [
                ["desktop", "Desktop"],
                ["tablet", "Tablet"],
                ["mobile", "Mobile"],
              ] as [Device, string][]
            ).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setDevice(v)}
                className={`rounded-md px-4 py-1.5 text-center text-[12px] transition-colors ${
                  device === v
                    ? "bg-[#F6F0FF] font-semibold text-[#6D33AA]"
                    : "font-medium text-[#666] hover:text-[#333]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* save / dirty state — status is transient (comes and goes) */}
          <div className="flex items-center justify-end gap-3">
            {justSaved && !dirty && (
              <span
                className="flex items-center gap-1.5 text-[12px] font-medium text-[#0F7A38]"
                style={{ animation: "fade-in 200ms ease-out both" }}
              >
                <Check className="size-3.5" strokeWidth={2.5} />
                Saved
              </span>
            )}
            {dirty && (
              <button
                onClick={handleDiscard}
                className="flex items-center gap-1.5 text-[13px] font-medium text-[#6E6E6E] transition-colors hover:text-[#333]"
              >
                <RotateCcw className="size-3.5" strokeWidth={2} />
                Discard
              </button>
            )}
            <Button
              onClick={handleSave}
              disabled={!dirty}
              className="text-[13px]"
            >
              Save Changes
            </Button>
          </div>
        </header>

        {/* ── body: controls + preview ──────────────────────────────── */}
        <div className="flex min-h-0 flex-1">
          {/* controls rail — one unified config */}
          <aside className="flex w-[320px] shrink-0 flex-col overflow-hidden border-r border-[#ECECEC] bg-white pt-5">
            {/* Pinned. The tab row says which thing you are configuring, so it
              has to stay legible while its own settings scroll past — scrolled
              away, a long panel gives no answer to "which tab am I in".

              Inverted against the device selector: the track carries the tint
              and the selected tab is the white chip lifted out of it. */}
            <div className="shrink-0 px-6">
              <div className="mb-[14px] flex gap-0.5 rounded-lg bg-[#F6F0FF] p-0.5">
                {(
                  [
                    ["launcher", "Launcher"],
                    ["agent", "Messenger"],
                  ] as const
                ).map(([v, label]) => (
                  <button
                    key={v}
                    onClick={() => setTab(v)}
                    className={`flex-1 rounded-md px-1.5 py-1.5 text-center text-[12px] transition-colors ${
                      tab === v
                        ? "bg-white font-semibold text-[#6D33AA] shadow-[0_1px_2px_rgba(15,17,26,0.06)]"
                        : "font-medium text-[#7A6A8C] hover:text-[#4A3A5C]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {/* the only thing that scrolls */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
              {tab === "launcher" && (
                <LauncherControls
                  s={launcher}
                  set={patchLauncher}
                  siteUrl={siteUrl}
                  setSiteUrl={setSiteUrl}
                  device={device}
                  accent={accent}
                />
              )}

              {tab === "agent" && (
                <AppearanceControls
                  name={name}
                  setName={setName}
                  subtitle={subtitle}
                  setSubtitle={setSubtitle}
                  disclaimer={disclaimer}
                  setDisclaimer={setDisclaimer}
                  disclaimerOn={disclaimerOn}
                  setDisclaimerOn={setDisclaimerOn}
                  brandingOn={brandingOn}
                  setBrandingOn={setBrandingOn}
                  avatar={avatar}
                  setAvatar={setAvatar}
                  logoOnly={logoOnly}
                  setLogoOnly={setLogoOnly}
                  accent={accent}
                  setAccent={setAccent}
                  mode={mode}
                  setMode={setMode}
                  font={font}
                  setFont={setFont}
                />
              )}
            </div>
          </aside>

          {/* preview canvas */}
          <main className="flex min-w-0 flex-1 flex-col bg-[#F4F4F5]">
            <div
              className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-5"
              style={{ fontFamily: fontStack(font) }}
            >
              {tab === "launcher" ? (
                <LauncherPreview
                  accent={accent}
                  theme={t}
                  settings={launcher}
                  siteUrl={siteUrl}
                  device={device}
                  name={name}
                  subtitle={subtitle}
                  disclaimer={disclaimer}
                  disclaimerOn={disclaimerOn}
                  brandingOn={brandingOn}
                  avatar={avatar}
                  logoOnly={logoOnly}
                  session={session}
                />
              ) : (
                <AgentPreview
                  theme={t}
                  name={name}
                  subtitle={subtitle}
                  placeholder={launcher.placeholder}
                  /* the same resolution the launcher does, so the two tabs
                     never disagree about what is on offer */
                  suggestions={
                    generatedFor(siteUrl.trim()) ?? promptsFor(launcher, "/")
                  }
                  disclaimer={disclaimer}
                  disclaimerOn={disclaimerOn}
                  brandingOn={brandingOn}
                  avatar={avatar}
                  logoOnly={logoOnly}
                  accent={accent}
                  device={device}
                />
              )}
            </div>
            {/* Under the frame rather than in the settings panel: everything on
                the left is something the customer configures and saves, and
                this is a lens on the preview. Launcher only — the returning
                visitor is a question about what greets them, and the Messenger
                tab has already skipped past that. */}
            {tab === "launcher" && (
              <div className="shrink-0 border-t border-[#E7E7E9] bg-white px-5 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-[#8A8A8A]">
                    Visitor
                  </span>
                  {SESSIONS.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setSession(o.id)}
                      className={`rounded-full px-3 py-1 text-[12px] transition-colors ${
                        session === o.id
                          ? "bg-[#F6F0FF] font-semibold text-[#6D33AA]"
                          : "font-medium text-[#666] hover:bg-[#F4F4F5] hover:text-[#333]"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                {/* The rule this state is standing for, in words. The picker on
                    its own shows what happens; this says why, which is the part
                    that has to survive the meeting. */}
                <p className="mt-1.5 text-[11px] leading-snug text-[#8A8A8A]">
                  {SESSIONS.find((o) => o.id === session)?.note}
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Dashboard rails ──────────────────────── */

/* ───────────────────────── Agent controls ───────────────────────── */

/* selectable preview fonts — Poppins is the product default (--font-sans) */
const FONTS = ["Poppins", "Inter", "Roboto", "Nunito", "Lato"] as const;
const fontStack = (f: string) =>
  f === "Poppins" ? "var(--font-sans), sans-serif" : `"${f}", sans-serif`;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[12px] font-medium text-[#555]">
      {children}
    </label>
  );
}

/* ─────────────────── shared control primitives ──────────────────── */

/* collapsible group — the launcher panel has more settings than fit on one
   screen, so every group can be folded away once it's set. */
function Group({
  title,
  children,
  defaultOpen = true,
  badge,
  action,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
  /* sits between the title and the chevron. Rendered outside the collapse
     button, since a control nested inside a button is neither valid nor
     clickable without swallowing the collapse. */
  action?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-[#F0F0F0] pb-3 last:border-b-0">
      <div className="flex items-center py-2.5">
        <button
          onClick={() => setOpen(!open)}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9A9A9A]">
            {title}
          </span>
          {badge && (
            <span className="rounded bg-[#F1ECFB] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#7C3AED]">
              {badge}
            </span>
          )}
        </button>
        {action && (
          <div className="ml-2 flex shrink-0 items-center gap-1.5">
            {action}
          </div>
        )}
        <button
          onClick={() => setOpen(!open)}
          aria-label={`${open ? "Collapse" : "Expand"} ${title}`}
          className="group ml-2 grid size-4 shrink-0 place-items-center"
        >
          <ChevronDown
            className={`size-3.5 text-[#C0C0C0] transition-transform duration-200 group-hover:text-[#8A8A8A] ${
              open ? "" : "-rotate-90"
            }`}
            strokeWidth={2.5}
          />
        </button>
      </div>
      {open && <div className="pb-1">{children}</div>}
    </section>
  );
}

/* segmented picker — icon over label, used for type / placement / shape */
function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { v: T; label: string; Icon: typeof Bot }[];
}) {
  return (
    <div className="flex gap-1.5">
      {options.map(({ v, label, Icon }) => {
        const on = value === v;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`flex flex-1 flex-col items-center gap-1 rounded-lg border py-2 transition-colors ${
              on
                ? "border-[#C4A9E8] bg-[#F8F4FF] text-[#6D33AA]"
                : "border-[#E5E5E5] text-[#8A8A8A] hover:border-[#D5D5D5] hover:text-[#555]"
            }`}
          >
            <Icon className="size-[18px]" strokeWidth={on ? 2.2 : 1.9} />
            <span
              className={`text-[11px] ${on ? "font-semibold" : "font-medium"}`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* number field with steppers — friendlier than a bare input for px / seconds */
function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix: string;
}) {
  const set = (v: number) => onChange(Math.round(clamp(v, min, max) * 10) / 10);
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[12px] text-[#666]">{label}</span>
      <div className="flex h-8 items-center rounded-lg border border-[#E5E5E5]">
        <button
          onClick={() => set(value - step)}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          className="grid h-full w-7 place-items-center rounded-l-lg text-[#8A8A8A] transition-colors hover:bg-[#F5F5F5] hover:text-[#333] disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <span className="text-[14px] leading-none">−</span>
        </button>
        <span className="w-11 text-center text-[12px] font-medium tabular-nums text-[#333]">
          {value}
          <span className="ml-0.5 text-[10px] font-normal text-[#A0A0A0]">
            {suffix}
          </span>
        </span>
        <button
          onClick={() => set(value + step)}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
          className="grid h-full w-7 place-items-center rounded-r-lg text-[#8A8A8A] transition-colors hover:bg-[#F5F5F5] hover:text-[#333] disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <span className="text-[14px] leading-none">+</span>
        </button>
      </div>
    </div>
  );
}

/* editable list of short strings — prompts and rotating placeholders both use it */
function StringList({
  items,
  onChange,
  max = 4,
  placeholder,
  addLabel,
  activeCount,
}: {
  items: string[];
  onChange: (v: string[]) => void;
  max?: number;
  placeholder: string;
  addLabel: string;
  /* how many rows are actually in play. Rows past this are greyed out rather
     than hidden, so you can see what you wrote without it pretending to work. */
  activeCount?: number;
}) {
  const canAdd =
    items.length < max &&
    (activeCount === undefined || items.length < activeCount);
  return (
    <div className="flex flex-col gap-2">
      {items.map((s, i) => {
        const inert = activeCount !== undefined && i >= activeCount;
        return (
          <div key={i} className="group flex items-center">
            <input
              value={s}
              onChange={(e) =>
                onChange(
                  items.map((v, idx) => (idx === i ? e.target.value : v)),
                )
              }
              placeholder={placeholder}
              disabled={inert}
              className="h-9 min-w-0 flex-1 rounded-lg border border-[#E5E5E5] px-3 text-[13px] text-[#333] outline-none focus:border-[#C9C9C9] disabled:border-[#EEEEEE] disabled:bg-[#FAFAFA] disabled:text-[#AFAFAF]"
            />
            {items.length > 1 && (
              <button
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                aria-label="Remove"
                className="grid h-7 w-0 shrink-0 place-items-center overflow-hidden rounded-md text-[#9A9A9A] opacity-0 transition-all duration-200 hover:bg-[#F2F2F2] hover:text-[#555] focus-visible:ml-1.5 focus-visible:w-7 focus-visible:opacity-100 group-hover:ml-1.5 group-hover:w-7 group-hover:opacity-100"
              >
                <X className="size-3.5 shrink-0" strokeWidth={2} />
              </button>
            )}
          </div>
        );
      })}
      {canAdd && (
        <button
          onClick={() => onChange([...items, ""])}
          className="mt-0.5 flex items-center gap-1.5 text-[12px] font-medium text-[#7C3AED] transition-opacity hover:opacity-80"
        >
          <Plus className="size-3.5" strokeWidth={2} /> {addLabel}
        </button>
      )}
    </div>
  );
}

function RowToggle({
  label,
  hint,
  on,
  onChange,
}: {
  label: string;
  hint?: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <span className="block text-[12px] font-medium text-[#555]">
          {label}
        </span>
        {hint && (
          <span className="mt-0.5 block text-[11px] leading-snug text-[#A8A8A8]">
            {hint}
          </span>
        )}
      </div>
      <div className="pt-0.5">
        <Toggle on={on} onChange={onChange} size="sm" />
      </div>
    </div>
  );
}

/* ─────────────────────── Launcher controls ──────────────────────── */

function LauncherControls({
  s,
  set,
  siteUrl,
  setSiteUrl,
  device,
  accent,
}: {
  s: LauncherSettings;
  set: (patch: Partial<LauncherSettings>) => void;
  siteUrl: string;
  setSiteUrl: (v: string) => void;
  device: Device;
  /* the swatches draw themselves in the tenant's own colour, so picking a style
     shows what it will actually look like rather than a generic purple */
  accent: string;
}) {
  const isComposer = s.type === "composer";
  const isMobile = device === "mobile";

  const readIcon = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () =>
      set({ customIcon: reader.result as string, customIconName: file.name });
    reader.readAsDataURL(file);
  };

  // the button launcher has no centre position — fall back to right
  const setType = (type: LauncherType) =>
    set({
      type,
      placement:
        type === "button" && s.placement === "center" ? "right" : s.placement,
    });

  const setRule = (id: string, patch: Partial<ContextRule>) =>
    set({ rules: s.rules.map((r) => (r.id === id ? { ...r, ...patch } : r)) });

  return (
    <div>
      {/* ── PREVIEW ON YOUR SITE — a lens on the preview, not a setting ── */}
      <Group title="Preview on your site">
        <div className="group relative mb-1.5 flex items-center gap-1.5">
          <span className="text-[12px] font-medium text-[#555]">
            Website URL
          </span>
          <Info
            className="size-3.5 cursor-help text-[#B8B8B8]"
            strokeWidth={2}
          />
          <span className="pointer-events-none absolute left-0 top-full z-30 mt-1 w-[240px] rounded-md bg-[#333] px-2 py-1.5 text-[11px] leading-snug text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
            Previews the launcher over a snapshot of your own pages, one per
            page rule. Some protected sites won’t capture.
          </span>
        </div>
        <input
          value={siteUrl}
          onChange={(e) => setSiteUrl(e.target.value)}
          placeholder="yourcompany.com"
          className="h-9 w-full rounded-lg border border-[#E5E5E5] px-3 text-[13px] text-[#333] outline-none focus:border-[#C9C9C9]"
        />
      </Group>

      {/* ── TYPE — the choice everything else hangs off ── */}
      <Group title="Launcher style">
        <div className="flex gap-2">
          {(
            [
              ["composer", "Composer", "An input bar inviting a question"],
              ["button", "Button", "A single tap target in the corner"],
            ] as const
          ).map(([v, label, hint]) => {
            const on = s.type === v;
            return (
              <button
                key={v}
                onClick={() => setType(v)}
                className={`flex-1 rounded-xl border p-2.5 text-left transition-colors ${
                  on
                    ? "border-[#C4A9E8] bg-[#F8F4FF]"
                    : "border-[#E5E5E5] hover:border-[#D5D5D5]"
                }`}
              >
                {/* miniature of the launcher itself */}
                <span className="mb-2 flex h-9 items-end justify-center rounded-md bg-white p-1.5 ring-1 ring-black/5">
                  {v === "composer" ? (
                    <span className="flex h-4 w-full items-center gap-1 rounded-[5px] bg-[#F0F0F3] px-1">
                      <span className="h-1 flex-1 rounded-full bg-[#D5D5DC]" />
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ background: on ? ACCENT : "#C7C7CF" }}
                      />
                    </span>
                  ) : (
                    <span
                      className="size-4 self-end rounded-full"
                      style={{
                        background: on ? ACCENT : "#C7C7CF",
                        marginLeft: "auto",
                      }}
                    />
                  )}
                </span>
                <span
                  className={`block text-[12px] ${on ? "font-semibold text-[#6D33AA]" : "font-medium text-[#555]"}`}
                >
                  {label}
                </span>
                <span className="mt-0.5 block text-[10px] leading-snug text-[#A8A8A8]">
                  {hint}
                </span>
              </button>
            );
          })}
        </div>
      </Group>

      {/* ── PLACEMENT ── */}
      <Group title="Placement">
        {isMobile && isComposer ? (
          /* Not a disabled control: for the composer on a phone there is no
             choice to disable. It spans the width, so this says what happens
             instead of offering three options that all land in the same
             place. The button keeps its corners. */
          <div className="flex items-center gap-2.5 rounded-lg bg-[#FAFAFA] px-3 py-2.5">
            <AlignCenter
              className="size-4 shrink-0 text-[#666]"
              strokeWidth={1.8}
            />
            <p className="text-[12px] leading-snug text-[#666]">
              Centred on mobile. The launcher spans the screen, so there is no
              left or right to place it in.
            </p>
          </div>
        ) : (
          <Segmented
            value={s.placement}
            onChange={(placement) => set({ placement })}
            options={
              isComposer
                ? [
                    { v: "left" as Placement, label: "Left", Icon: AlignLeft },
                    {
                      v: "center" as Placement,
                      label: "Center",
                      Icon: AlignCenter,
                    },
                    {
                      v: "right" as Placement,
                      label: "Right",
                      Icon: AlignRight,
                    },
                  ]
                : [
                    { v: "left" as Placement, label: "Left", Icon: AlignLeft },
                    {
                      v: "right" as Placement,
                      label: "Right",
                      Icon: AlignRight,
                    },
                  ]
            }
          />
        )}
        {!isComposer && (
          <div className="mt-3 flex flex-col gap-2">
            <NumberField
              label="Horizontal offset"
              value={s.offsetX}
              onChange={(offsetX) => set({ offsetX })}
              min={0}
              max={120}
              step={4}
              suffix="px"
            />
            <NumberField
              label="Vertical offset"
              value={s.offsetY}
              onChange={(offsetY) => set({ offsetY })}
              min={0}
              max={120}
              step={4}
              suffix="px"
            />
          </div>
        )}
      </Group>

      {/* ── APPEARANCE — differs entirely by type ── */}
      {isComposer ? (
        <Group title="Placeholder">
          <span className="mb-2 block text-[11px] leading-snug text-[#A8A8A8]">
            Shown once the launcher is open, and in the messenger. At rest it
            cycles the contextual suggestions.
          </span>
          <input
            value={s.placeholder}
            onChange={(e) => set({ placeholder: e.target.value })}
            placeholder="Ask me anything…"
            className="w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-[13px] text-[#333] outline-none focus:border-[#C9C9C9]"
          />
        </Group>
      ) : (
        <Group title="Button">
          {/* First, because it is the one that overrides everything below it:
              a custom image replaces the icon set entirely, so meeting it after
              choosing an icon means discovering the choice did not matter. */}
          <FieldLabel>Custom icon</FieldLabel>
          {s.customIcon ? (
            <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-[#E5E5E5] p-2">
              <span
                className="size-9 shrink-0 rounded-lg bg-cover bg-center ring-1 ring-black/5"
                style={{ backgroundImage: `url(${s.customIcon})` }}
              />
              <span className="min-w-0 flex-1 truncate text-[12px] text-[#666]">
                {s.customIconName || "Custom image"}
              </span>
              <button
                onClick={() => set({ customIcon: null, customIconName: null })}
                className="grid size-7 shrink-0 place-items-center rounded-md text-[#9A9A9A] transition-colors hover:bg-[#F2F2F2] hover:text-[#555]"
                aria-label="Remove custom image"
              >
                <Trash2 className="size-3.5" strokeWidth={2} />
              </button>
            </div>
          ) : (
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                readIcon(e.dataTransfer.files?.[0]);
              }}
              className="mb-4 flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-dashed border-[#D8D8D8] px-3 py-4 text-center transition-colors hover:border-[#C0C0C0]"
            >
              <ImagePlus className="size-4 text-[#B0B0B0]" strokeWidth={1.8} />
              <span className="text-[12px] font-medium text-[#666]">
                No file chosen
              </span>
              <span className="text-[11px] text-[#A8A8A8]">
                Drop an image or click to upload
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => readIcon(e.target.files?.[0])}
              />
            </label>
          )}
          <FieldLabel>Shape</FieldLabel>
          <Segmented
            value={s.shape}
            onChange={(shape) => set({ shape })}
            options={[
              { v: "square" as ButtonShape, label: "Square", Icon: Square },
              { v: "circle" as ButtonShape, label: "Circle", Icon: Circle },
              {
                v: "chip" as ButtonShape,
                label: "Chip",
                Icon: RectangleHorizontal,
              },
            ]}
          />

          <div className="mt-4" />
          <FieldLabel>Style</FieldLabel>
          {/* Each option draws itself, from the same styleSpec the preview uses
              — so the swatch cannot fall out of step with what picking it does.
              The name is under the swatch and the sentence is a tooltip: at this
              size the picture carries the difference and the words only have to
              settle which is which. */}
          <div className="mb-4 grid grid-cols-3 gap-1.5">
            {LAUNCHER_STYLES.map(({ key, label, hint }) => {
              const on = s.style === key;
              const sw = styleSpec(key, accent, liteOf(accent));
              const chip = s.shape === "chip";
              return (
                <button
                  key={key}
                  onClick={() => set({ style: key })}
                  title={hint}
                  className={`group/sw flex flex-col items-center gap-1.5 rounded-lg border px-1 pb-1.5 pt-2.5 transition-colors ${
                    on
                      ? "border-[#C4A9E8] bg-[#F8F4FF]"
                      : "border-[#E5E5E5] hover:border-[#D5D5D5]"
                  }`}
                >
                  <span className="relative grid h-8 place-items-center">
                    <span
                      className="flex items-center justify-center"
                      style={{
                        width: chip ? undefined : 30,
                        height: chip ? 22 : 30,
                        padding: chip ? "0 8px" : undefined,
                        gap: chip ? 4 : undefined,
                        borderRadius: chip || s.shape === "circle" ? 999 : 10,
                        background: sw.background,
                        color: sw.color,
                        /* the swatch keeps the fill and the edge, not the cast
                           shadow — ten drop shadows in a 272px column is mud */
                        boxShadow: sw.shadow.includes("inset")
                          ? sw.shadow
                              .split(",")
                              .filter((x) => x.includes("inset"))
                              .join(",")
                          : "0 1px 2px rgba(15,17,26,0.14)",
                      }}
                    >
                      {
                        <>
                          {createElement(iconFor(s.iconKey), {
                            className: "shrink-0",
                            style: {
                              width: Math.round(16 * iconScale(s.iconKey)),
                              height: Math.round(16 * iconScale(s.iconKey)),
                            },
                            strokeWidth: ICON_STROKE,
                          })}
                          {chip && (
                            <span className="text-[9px] font-medium">Ask</span>
                          )}
                        </>
                      }
                    </span>
                  </span>
                  <span
                    className={`text-center text-[10px] leading-tight ${
                      on ? "font-medium text-[#6D33AA]" : "text-[#8A8A8A]"
                    }`}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
          {s.shape === "chip" && (
            <div className="mt-3">
              <FieldLabel>Chip label</FieldLabel>
              <input
                value={s.chipLabel}
                onChange={(e) => set({ chipLabel: e.target.value })}
                placeholder="Ask AI"
                className="h-9 w-full rounded-lg border border-[#E5E5E5] px-3 text-[13px] text-[#333] outline-none focus:border-[#C9C9C9]"
              />
            </div>
          )}

          {/* Nothing to choose from while a custom image is in place — it is
              what the button shows. */}
          {!s.customIcon && (
            <div className="mt-4">
              <FieldLabel>Icon</FieldLabel>
              <div className="grid grid-cols-4 gap-1.5">
                {LAUNCHER_ICONS.map(({ key, label, Icon }) => {
                  const on = s.iconKey === key;
                  return (
                    <button
                      key={key}
                      onClick={() => set({ iconKey: key })}
                      title={label}
                      aria-label={label}
                      className={`grid aspect-square place-items-center rounded-lg border transition-colors ${
                        on
                          ? "border-[#C4A9E8] bg-[#F8F4FF] text-[#6D33AA]"
                          : "border-[#E5E5E5] text-[#8A8A8A] hover:border-[#D5D5D5] hover:text-[#555]"
                      }`}
                    >
                      {/* One weight for every icon, selected or not. Thickening
                          the chosen one made the grid read as two different sets
                          — colour already says which is picked, and it says so
                          without redrawing the icon. */}
                      <Icon
                        style={{
                          width: Math.round(22 * iconScale(key)),
                          height: Math.round(22 * iconScale(key)),
                        }}
                        strokeWidth={ICON_STROKE}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </Group>
      )}

      {/* ── GREETING — button launcher only ──
          Its own group rather than a row inside Button: it is a separate
          element of the launcher, not a property of the button, and it is the
          one part of the resting state a customer is most likely to switch off.
          The composer launcher has no equivalent — nothing speaks first there. */}
      {!isComposer && (
        <Group
          title="Greeting"
          action={
            <Toggle
              on={s.greetingOn}
              onChange={(greetingOn) => set({ greetingOn })}
              size="sm"
            />
          }
        >
          <p className="text-[11px] leading-snug text-[#A8A8A8]">
            The agent&rsquo;s opening line, shown beside the button. Same
            message the conversation starts with.
          </p>
        </Group>
      )}

      {/* ── BEHAVIOUR ── */}
      <Group title="Entrance">
        <NumberField
          label="Appears after"
          value={s.delay}
          onChange={(delay) => set({ delay })}
          min={0}
          max={30}
          step={0.5}
          suffix="s"
        />
        <p className="mt-1.5 mb-3 text-[11px] leading-snug text-[#A8A8A8]">
          Counted from page load. Zero shows it immediately.
        </p>
        <RowToggle
          label="Play a sound"
          hint="A soft chime as it arrives. Muted until the visitor interacts with the page."
          on={s.soundOn}
          onChange={(soundOn) => set({ soundOn })}
        />
      </Group>
    </div>
  );
}

const MAX_LOGO_BYTES = 5 * 1024 * 1024;

function AppearanceControls({
  name,
  setName,
  subtitle,
  setSubtitle,
  disclaimer,
  setDisclaimer,
  disclaimerOn,
  setDisclaimerOn,
  brandingOn,
  setBrandingOn,
  avatar,
  setAvatar,
  logoOnly,
  setLogoOnly,
  accent,
  setAccent,
  mode,
  setMode,
  font,
  setFont,
}: {
  name: string;
  setName: (v: string) => void;
  subtitle: string;
  setSubtitle: (v: string) => void;
  disclaimer: string;
  setDisclaimer: (v: string) => void;
  disclaimerOn: boolean;
  setDisclaimerOn: (v: boolean) => void;
  brandingOn: boolean;
  setBrandingOn: (v: boolean) => void;
  avatar: string | null;
  setAvatar: (v: string | null) => void;
  logoOnly: boolean;
  setLogoOnly: (v: boolean) => void;
  accent: string;
  setAccent: (v: string) => void;
  mode: Mode;
  setMode: (v: Mode) => void;
  font: string;
  setFont: (v: string) => void;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  const readFile = (file: File | undefined) => {
    if (!file) return;
    if (!/^image\/(png|jpeg)$/.test(file.type)) {
      setLogoError("PNG or JPG only.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError("That file is over 5 MB.");
      return;
    }
    setLogoError(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearLogo = () => {
    setAvatar(null);
    setFileName(null);
    setLogoError(null);
  };

  /* The expansion rewrites the field's value, so the caret lands wherever React
     puts it after the re-render — at the end. Held in a ref rather than state
     because it is a one-shot instruction to the DOM, not something rendered;
     the effect runs after every render, applies it once, and clears it. */
  const discRef = useRef<HTMLTextAreaElement>(null);
  const pendingSel = useRef<[number, number] | null>(null);
  useEffect(() => {
    const sel = pendingSel.current;
    if (!sel || !discRef.current) return;
    pendingSel.current = null;
    discRef.current.focus();
    discRef.current.setSelectionRange(sel[0], sel[1]);
  });

  /* Open while the link is being described; `at` is where in the copy it goes,
     captured when the command was typed so later edits elsewhere cannot move
     the insertion point out from under it. */
  const [linkDraft, setLinkDraft] = useState<{
    at: number;
    text: string;
    url: string;
  } | null>(null);

  const insertLink = () => {
    if (!linkDraft) return;
    const label = linkDraft.text.trim() || LINK_LABEL;
    const url = linkDraft.url.trim();
    if (!url) return;
    const md = `[${label}](${url})`;
    const caret = linkDraft.at + md.length;
    pendingSel.current = [caret, caret];
    setDisclaimer(
      disclaimer.slice(0, linkDraft.at) + md + disclaimer.slice(linkDraft.at),
    );
    setLinkDraft(null);
  };

  // what the header falls back to with no logo uploaded
  const initial = (name.trim()[0] ?? "T").toUpperCase();

  return (
    <div>
      {/* ── BRAND IDENTITY ── */}
      <Group title="Brand identity">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[12px] font-medium text-[#555]">
            Logo <span className="text-[#D03A3A]">*</span>
          </span>
          <span className="group relative flex items-center gap-1.5">
            <span className="text-[11px] text-[#888]">Center</span>
            <Toggle on={logoOnly} onChange={setLogoOnly} size="sm" />
            <Info
              className="size-3.5 cursor-help text-[#B8B8B8]"
              strokeWidth={2}
            />
            <span className="pointer-events-none absolute right-0 top-full z-20 mt-1 w-max max-w-[190px] rounded-md bg-[#333] px-2 py-1 text-[11px] leading-snug text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
              Centers a wordmark logo and hides the name &amp; subtitle.
            </span>
          </span>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            readFile(e.dataTransfer.files?.[0]);
          }}
          className="relative flex items-center gap-3 rounded-xl border border-dashed border-[#D8D8D8] p-3 transition-colors hover:border-[#C0C0C0]"
        >
          {avatar ? (
            logoOnly ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt=""
                className="h-10 w-14 shrink-0 object-contain"
              />
            ) : (
              <span
                className="size-10 shrink-0 rounded-full bg-cover bg-center ring-1 ring-black/5"
                style={{ backgroundImage: `url(${avatar})` }}
              />
            )
          ) : (
            /* the initial is not decoration — it is exactly what ships when no
               logo is uploaded, so the control previews its own fallback */
            <span
              className="grid size-10 shrink-0 place-items-center rounded-full text-[15px] font-semibold text-white"
              style={{ backgroundColor: accent }}
            >
              {initial}
            </span>
          )}

          <label className="min-w-0 flex-1 cursor-pointer">
            <span className="block truncate text-[12px] font-medium text-[#555]">
              {fileName ?? "No file chosen"}
            </span>
            <span className="mt-0.5 block text-[11px] leading-snug text-[#9A9A9A]">
              Drag &amp; drop, or click to upload
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={(e) => readFile(e.target.files?.[0])}
            />
          </label>

          {avatar && (
            <button
              onClick={clearLogo}
              aria-label="Remove logo"
              className="grid size-7 shrink-0 place-items-center rounded-md text-[#9A9A9A] transition-colors hover:bg-[#F2F2F2] hover:text-[#555]"
            >
              <Trash2 className="size-3.5" strokeWidth={2} />
            </button>
          )}
        </div>
        <p className="mt-1.5 text-[11px] leading-snug text-[#A8A8A8]">
          PNG / JPG · square · ≤ 5 MB · falls back to the name&rsquo;s initial
        </p>
        {logoError && (
          <p className="mt-1 text-[11px] font-medium leading-snug text-[#D03A3A]">
            {logoError}
          </p>
        )}

        <div className="mt-4">
          <FieldLabel>
            Agent name <span className="text-[#D03A3A]">*</span>
          </FieldLabel>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Bot name"
            disabled={logoOnly}
            className={`h-9 w-full rounded-lg border px-3 text-[13px] text-[#333] outline-none focus:border-[#C9C9C9] disabled:bg-[#FAFAFA] disabled:text-[#AAA] ${
              !logoOnly && !name.trim()
                ? "border-[#F0C4C4]"
                : "border-[#E5E5E5]"
            }`}
          />
        </div>

        <div className="mt-4">
          <FieldLabel>
            Subtitle{" "}
            <span className="font-normal text-[#A8A8A8]">· optional</span>
          </FieldLabel>
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="e.g. AI Agent · online"
            disabled={logoOnly}
            className="h-9 w-full rounded-lg border border-[#E5E5E5] px-3 text-[13px] text-[#333] outline-none focus:border-[#C9C9C9] disabled:bg-[#FAFAFA] disabled:text-[#AAA]"
          />
        </div>

        <div className="mt-4">
          <FieldLabel>
            Accent <span className="font-normal text-[#A8A8A8]">· custom</span>
          </FieldLabel>
          <div className="flex items-center gap-2">
            {/* native picker behind a hue-wheel swatch */}
            <label
              className="relative grid size-8 shrink-0 cursor-pointer place-items-center rounded-full ring-1 ring-black/10"
              style={{
                background:
                  "conic-gradient(from 90deg, #CE3838, #CEB238, #3BB24E, #38A8B2, #3854CE, #9E38B2, #CE3838)",
              }}
              aria-label="Pick a colour"
            >
              <input
                type="color"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <span
                className="size-4 rounded-full ring-1 ring-white/70"
                style={{ backgroundColor: accent }}
              />
            </label>
            <input
              value={accent.toUpperCase()}
              onChange={(e) => setAccent(e.target.value)}
              className="h-9 flex-1 rounded-lg border border-[#E5E5E5] px-3 font-mono text-[13px] text-[#333] outline-none focus:border-[#C9C9C9]"
            />
          </div>
        </div>
      </Group>

      {/* ── THEME ── */}
      {/* ── THEME ──
          One palette, so this is only a font and a mode. The four-way picker
          went when the direction was settled on Light: three unchosen palettes
          in the panel invite a decision that has already been made, and each is
          another set of states to keep working.

          Font leads. It is the choice that changes every screen, where the mode
          only changes which end of one palette is used. */}
      <Group title="Theme">
        <FieldLabel>Font</FieldLabel>
        <div className="relative">
          <select
            value={font}
            onChange={(e) => setFont(e.target.value)}
            style={{ fontFamily: fontStack(font) }}
            className="h-9 w-full appearance-none rounded-lg border border-[#E5E5E5] bg-white pl-3 pr-9 text-[13px] text-[#333] outline-none focus:border-[#C9C9C9]"
          >
            {FONTS.map((f) => (
              <option key={f} value={f} style={{ fontFamily: fontStack(f) }}>
                {f}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#9A9A9A]"
            strokeWidth={2}
          />
        </div>
        <div className="mb-4" />

        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { v: "light" as Mode, label: "Light", Icon: Sun },
            { v: "dark" as Mode, label: "Dark", Icon: Moon },
          ]}
        />
      </Group>

      {/* ── MESSAGES ── */}
      <Group title="Messages">
        <div className="mb-2 flex items-center justify-between">
          <span className="group relative inline-flex items-center gap-1">
            <FieldLabel>Disclaimer</FieldLabel>
            <span className="mb-1.5 inline-flex items-center gap-0.5 rounded bg-[#F1E4C9] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#9A6E12]">
              <Lock className="size-2.5" strokeWidth={2.5} />
              Pro
            </span>
            <Info
              className="mb-1.5 size-3.5 cursor-help text-[#B8B8B8]"
              strokeWidth={2}
            />
            <span className="pointer-events-none absolute left-0 top-full z-20 w-max max-w-[200px] rounded-md bg-[#333] px-2 py-1 text-[11px] leading-snug text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
              Shown above the composer until the visitor dismisses it.
            </span>
          </span>
          <Toggle on={disclaimerOn} onChange={setDisclaimerOn} size="sm" />
        </div>
        <div className="relative">
          <textarea
            ref={discRef}
            value={disclaimer}
            onChange={(e) => setDisclaimer(e.target.value)}
            /* Enter confirms the command rather than typing alone doing it: a
               disclaimer can legitimately contain the characters, and firing
               mid-word means the popup jumps open while someone is still
               writing. Enter makes it something you ask for. */
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              const el = e.currentTarget;
              const cmd = takeLinkCommand(el.value, el.selectionStart);
              if (!cmd) return;
              e.preventDefault();
              setDisclaimer(cmd.next);
              setLinkDraft({ at: cmd.at, text: LINK_LABEL, url: "" });
            }}
            placeholder="e.g. By chatting, you agree to our privacy policy."
            rows={3}
            disabled={!disclaimerOn}
            className="w-full resize-none rounded-lg border border-[#E5E5E5] px-3 py-2 text-[13px] leading-relaxed text-[#333] outline-none focus:border-[#C9C9C9] disabled:bg-[#FAFAFA] disabled:text-[#AAA]"
          />

          {linkDraft && (
            <div
              role="dialog"
              aria-label="Add link"
              onKeyDown={(e) => {
                if (e.key === "Escape") setLinkDraft(null);
                if (e.key === "Enter") {
                  e.preventDefault();
                  insertLink();
                }
              }}
              /* Above the field and pushed out past its right edge. Flush and
                 the same width, it read as another section of the form rather
                 than something floating over it — the overhang and the deeper
                 shadow are what say "popup". 16px lands inside the panel's own
                 24px gutter, so nothing clips or scrolls sideways. */
              className="absolute bottom-full -right-4 z-30 mb-2 w-[230px] rounded-lg border border-[#E0E0E0] bg-white p-2.5 shadow-[0_14px_36px_-10px_rgba(15,17,26,0.3)]"
            >
              <div className="mb-2 flex items-center gap-1.5">
                <LinkIcon className="size-3 text-[#8A8A8A]" strokeWidth={2} />
                <span className="text-[11px] font-semibold text-[#555]">
                  Add link
                </span>
              </div>
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-[#A8A8A8]">
                Text
              </label>
              <input
                value={linkDraft.text}
                onChange={(e) =>
                  setLinkDraft({ ...linkDraft, text: e.target.value })
                }
                placeholder={LINK_LABEL}
                className="mb-2 w-full rounded-md border border-[#E5E5E5] px-2 py-1.5 text-[12px] text-[#333] outline-none focus:border-[#C9C9C9]"
              />
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-[#A8A8A8]">
                Link
              </label>
              {/* the address is the one field with nothing sensible to guess,
                  so it takes focus and the insert waits on it */}
              <input
                autoFocus
                value={linkDraft.url}
                onChange={(e) =>
                  setLinkDraft({ ...linkDraft, url: e.target.value })
                }
                placeholder="https://…"
                className="w-full rounded-md border border-[#E5E5E5] px-2 py-1.5 text-[12px] text-[#333] outline-none focus:border-[#C9C9C9]"
              />
              <div className="mt-2.5 flex justify-end gap-1.5">
                <button
                  onClick={() => setLinkDraft(null)}
                  className="rounded-md px-2.5 py-1 text-[11px] font-medium text-[#666] transition-colors hover:bg-[#F4F4F4]"
                >
                  Cancel
                </button>
                <button
                  onClick={insertLink}
                  disabled={!linkDraft.url.trim()}
                  className="rounded-md bg-[#6D33AA] px-2.5 py-1 text-[11px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  Insert
                </button>
              </div>
            </div>
          )}
        </div>
        <p className="mt-1.5 text-[11px] leading-snug text-[#A8A8A8]">
          Type{" "}
          <span className="rounded bg-[#F1F1F1] px-1 py-px font-mono text-[10px] text-[#666]">
            /link
          </span>{" "}
          and press Enter to add a link.
        </p>

        <div className="mt-5 flex items-center justify-between">
          <FieldLabel>Tars branding</FieldLabel>
          <Toggle on={brandingOn} onChange={setBrandingOn} size="sm" />
        </div>
        <p className="text-[11px] leading-relaxed text-[#A8A8A8]">
          Shows &ldquo;⚡ Powered by Tars&rdquo; under the chat.
        </p>
      </Group>
    </div>
  );
}

function Toggle({
  on,
  onChange,
  size = "md",
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  size?: "sm" | "md";
}) {
  const sm = size === "sm";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative shrink-0 rounded-full transition-colors ${sm ? "h-4 w-7" : "h-5 w-9"} ${
        on ? "bg-[#8B55C3]" : "bg-[#D8D8D8]"
      }`}
    >
      <span
        className={`absolute top-0.5 rounded-full bg-white shadow ring-1 ring-black/5 transition-all ${
          sm
            ? `size-3 ${on ? "left-[14px]" : "left-0.5"}`
            : `size-4 ${on ? "left-[18px]" : "left-0.5"}`
        }`}
      />
    </button>
  );
}

/* ───────────────────────── Agent preview ────────────────────────── */

/* ─── grounded-answer parts ───────────────────────────────────────────────
   A reply that cites its sources needs three things the plain ones don't: a
   marker in the prose, somewhere to look the marker up, and an account of how
   the answer was reached. */

/* [1] in the text becomes a small numbered chip, sized so it sits on the line
   without pushing it apart. */
/* Whether a one-line element is actually cut off, so the tooltip is offered
   only when there is something more to read. ResizeObserver fires once on
   observe, which covers the first measure — and re-running on `text` disconnects
   and re-observes, so a wording change is measured again even though the box it
   sits in never changed size. */
/* `/link` typed in the disclaimer field opens a small link builder.

   The markup form — [text](url) — is the thing people get wrong: brackets and
   parentheses the wrong way round, or a label with no address. Two labelled
   fields ask for the two things a link is made of and assemble the syntax,
   so the format is never something anyone has to remember or type.

   The command itself is consumed the moment it is recognised: leaving "/link"
   sitting in the copy while a popup collects the parts means it shows up in
   the preview, and in the saved value if the popup is dismissed. */
const LINK_LABEL = "Know more";

function takeLinkCommand(value: string, caret: number) {
  if (!value.slice(0, caret).endsWith("/link")) return null;
  const at = caret - "/link".length;
  return { next: value.slice(0, at) + value.slice(caret), at };
}

/* A pasted or typed address with no scheme is a relative path, which from a
   chat panel points back at the host site rather than out to the policy. */
const href = (url: string) =>
  /^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `https://${url}`;

function useTruncated(text: string) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [truncated, setTruncated] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() =>
      setTruncated(el.scrollWidth > el.clientWidth + 1),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);
  return [ref, truncated] as const;
}

/* One renderer for every agent turn.

   Paragraphs, lines opening with "- " as bullets, and [n] as a citation chip —
   all revealed a word at a time on a single running clock, so a reply with a
   list and citations arrives the same way a one-line answer does rather than
   appearing whole. The counter is why this is one component and not three:
   the stagger has to carry across blocks to read as one sentence being
   written. */
/* How long a set of suggestions takes to finish arriving, however many there
   are. Short enough to read as one gesture rather than a queue. */
const REPLY_RUN_MS = 210;

const WORD_MS = 36;
const WORD_IN_MS = 320;
const wordCount = (t: string) => t.split(/\s+/).filter(Boolean).length;
const streamMs = (t: string) => wordCount(t) * WORD_MS + WORD_IN_MS;

function RichText({
  text,
  neutral,
  instant,
}: {
  text: string;
  neutral: Record<string, string>;
  /* A message that was already there when the panel opened. The word-by-word
     reveal is how a reply arrives; running it over a conversation from this
     morning would show the visitor their own history being written out in
     front of them, which is the opposite of picking something back up. */
  instant?: boolean;
}) {
  let w = 0;
  const reveal = (d: number): CSSProperties =>
    instant
      ? {}
      : {
          animation: `word-in ${WORD_IN_MS}ms cubic-bezier(0.2,0.6,0.2,1) ${d}ms both`,
        };

  const inline = (str: string, key: string) =>
    str.split(/(\[\d+\])/).map((part, pi) => {
      const cite = /^\[(\d+)\]$/.exec(part);
      if (cite) {
        return (
          <span
            key={`${key}-c${pi}`}
            className="ml-1 inline-flex size-[18px] translate-y-[2px] items-center justify-center rounded-full text-[11px] leading-none"
            style={{
              background: neutral.paper,
              color: neutral.secondary,
              ...reveal(w++ * WORD_MS),
            }}
          >
            {cite[1]}
          </span>
        );
      }
      return part.split(/(\s+)/).map((tok, ti) => {
        if (tok === "" || /^\s+$/.test(tok)) return tok;
        return (
          <span
            key={`${key}-${pi}-${ti}`}
            className="inline-block"
            style={reveal(w++ * WORD_MS)}
          >
            {tok}
          </span>
        );
      });
    });

  return (
    <>
      {text.split("\n\n").map((block, i) => {
        if (!block.startsWith("- ")) {
          return (
            <p key={i} className={i === 0 ? "" : "mt-3"}>
              {inline(block, `b${i}`)}
            </p>
          );
        }
        const body = block.slice(2);
        const colon = body.indexOf(":");
        const lead = colon > -1 ? body.slice(0, colon + 1) : "";
        const rest = colon > -1 ? body.slice(colon + 1) : body;
        // the dot lands on the same tick as the line's first word, so a bullet
        // never sits there waiting for text that hasn't arrived
        const dotAt = w * WORD_MS;
        return (
          <p key={i} className="mt-2 flex gap-2">
            <span
              className="mt-[9px] size-[3px] shrink-0 rounded-full"
              style={{ background: neutral.secondary, ...reveal(dotAt) }}
            />
            <span>
              {lead && (
                <span className="font-medium">{inline(lead, `l${i}`)}</span>
              )}
              {inline(rest, `r${i}`)}
            </span>
          </p>
        );
      })}
    </>
  );
}

/* "Thought for 8s", with the composer's own sparkle. Collapsed by default —
   the trace is there to be checked, not read every time. */
function ThoughtTrace({
  secs,
  steps,
  accent,
  neutral,
  streaming,
}: {
  secs: number;
  steps: string[];
  accent: string;
  neutral: Record<string, string>;
  streaming: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="mb-2"
      /* the sparkle reads its colours off these, so it carries the tenant's
         accent rather than the composer's default violet */
      style={
        {
          "--brand": accent,
          "--brand-lite": liteOf(accent),
        } as CSSProperties
      }
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full py-0.5 pr-2 text-[13px] transition-colors"
        style={{ color: open ? accent : neutral.secondary }}
      >
        <AccentSparkle size={SPARKLE_PX} paused={!streaming} />
        Thought for {secs}s
        <ChevronDown
          className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>
      {open && (
        <ul className="mt-1.5 ml-1 flex flex-col gap-1">
          {steps.map((st) => (
            <li
              key={st}
              className="flex items-center gap-2 text-[13px]"
              style={{ color: neutral.secondary }}
            >
              <Check
                className="size-3.5 shrink-0"
                strokeWidth={2.5}
                style={{ color: accent }}
              />
              {st}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SourcesPanel({
  sources,
  neutral,
}: {
  sources: Source[];
  neutral: Record<string, string>;
}) {
  return (
    <div
      className="mt-2 flex flex-col gap-2 rounded-xl p-3"
      style={{ background: neutral.paper }}
    >
      {sources.map((src, i) => (
        <div key={src.url} className="flex items-baseline gap-3 text-[13px]">
          <span
            className="w-3 shrink-0 tabular-nums"
            style={{ color: neutral.muted }}
          >
            {i + 1}
          </span>
          <span
            className="min-w-0 flex-1 truncate"
            style={{ color: neutral.ink }}
          >
            {src.name}
          </span>
          <span
            className="inline-flex shrink-0 items-center gap-1 underline underline-offset-2"
            style={{ color: neutral.secondary }}
          >
            {src.url}
            <ExternalLink className="size-3" strokeWidth={2} />
          </span>
        </div>
      ))}
    </div>
  );
}

/* AI message action toolbar — reveals on hover (matches ai-message DS) */
/* Always on, rather than revealed on hover. The row also carries the
   timestamp now that the speaker label above the message is gone — one line
   under the reply doing both jobs, which is where the eye already is once it
   has finished reading. Colours come off the palette so the hover wash is not
   a beige hardcode on a dark theme. */
function AiToolbar({
  time,
  neutral,
  sources,
}: {
  time: string;
  neutral: Record<string, string>;
  sources?: Source[];
}) {
  const [showSources, setShowSources] = useState(false);
  const btn =
    /* Fully round, like every other icon control in the panel. A 4px corner on
       a 24px square reads as a small tile; the circle reads as the icon's own
       hit area, which is what it is. */
    "flex size-6 items-center justify-center rounded-full transition-colors";
  const tint = { color: neutral.secondary } as CSSProperties;
  return (
    <>
      <div
        className="ai-actions mt-1 -ml-[5px] flex flex-wrap items-center gap-0.5"
        style={
          {
            "--act-hover": neutral.paper,
            "--act-ink": neutral.ink,
          } as CSSProperties
        }
      >
        <button className={btn} style={tint} aria-label="Read aloud">
          <Volume2 className="size-3.5" strokeWidth={1.5} />
        </button>
        <button className={btn} style={tint} aria-label="Good response">
          <ThumbsUp className="size-3" strokeWidth={1.5} />
        </button>
        <button className={btn} style={tint} aria-label="Bad response">
          <ThumbsDown className="size-3" strokeWidth={1.5} />
        </button>
        <button className={btn} style={tint} aria-label="Copy">
          <Copy className="size-3" strokeWidth={1.5} />
        </button>
        <span
          className="ml-1.5 text-[11px] tabular-nums"
          style={{ color: neutral.muted }}
        >
          {time}
        </span>
        {sources && sources.length > 0 && (
          <button
            onClick={() => setShowSources((v) => !v)}
            className="ml-2 flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium transition-colors"
            style={{ background: neutral.paper, color: neutral.secondary }}
          >
            <BookOpen className="size-3" strokeWidth={2} />
            Sources
          </button>
        )}
      </div>
      {sources && showSources && (
        <SourcesPanel sources={sources} neutral={neutral} />
      )}
    </>
  );
}

const DEVICE_WIDTH: Record<Device, number> = {
  desktop: 820,
  tablet: 580,
  mobile: 380,
};

type Source = { name: string; url: string };

/* Two kinds of offer, which look alike but are not the same thing.

   `buttons` are configured — authored alongside the message and part of it,
   the way the opening turn names the routes into the conversation. They sit
   with the message because they are what it says.

   `followUps` are generated per answer, so they belong to the conversation
   rather than to any paragraph: they sit above the composer, replaced by
   whatever the next reply suggests.

   `sources` back the [n] citations in the text; `steps` is what the agent did
   before answering, shown behind the "Thought for Ns" disclosure. */
type Msg = {
  from: "ai" | "user";
  text: string;
  buttons?: string[];
  followUps?: string[];
  sources?: Source[];
  steps?: string[];
  thoughtSecs?: number;
  /* A label drawn above this message, dividing what came before from what
     comes after — "Earlier today" over a resumed thread. Carried on the
     message rather than inserted as its own entry so the transcript stays a
     list of turns, and a divider can never end up orphaned at the bottom. */
  dayBreak?: string;
};

/* live "thinking" indicator — sparkle + cycling shimmer phrase (matches /web) */
/* The composer launcher on a phone. A fixed width rather than one derived
   from the screen's insets, so it is the same size on every handset instead of
   growing with the display; 24 up from the bottom clears the browser's own
   controls. The pill shrinks with it — at the desktop 64 it is a slab across a
   phone — and the radius stays half the height so it remains a stadium. This
   is the launcher only: once the chat is open it is its own surface and keeps
   its size. Applies to the composer; a button launcher keeps its corner. */
const MOBILE = { width: 300, bottom: 24 };
const PILL_MOBILE = { height: 58, radius: 29, pad: 7, sendPx: 40 };

/* GlassComposer's own SPARKLE_PX. A stroked star fills its box corner to
   corner, so it needs this much room to read at the same weight as the
   label beside it — 16 looked like a different, smaller mark. */
const SPARKLE_PX = 28;

/* How close to the bottom counts as "following along". Below this the
   thread keeps itself pinned; above it the visitor is reading and is left
   alone. */
const STICK_PX = 80;

/* The composer field at rest — both styles are 64px. Half of it is how far
   the notice surface comes down behind it. */
const FIELD_H = 64;

const THINKING_PHRASES = [
  "AI is thinking…",
  "Still thinking…",
  "Thinking some more…",
  "Almost done…",
];
/* ─── conversation history ────────────────────────────────────────────────
   The archive behind the back button. Lifted from GlassComposer so the two
   surfaces show the same thing: same record shape, same chips, same grouping,
   same 260ms slide.

   Channel and status are enums with their words looked up here rather than
   stored on the record — a fixture holds what a real row would, and "waiting"
   becoming "Waiting on you" stays a presentation decision in one place. */
const CHANNELS = {
  web: { label: "Web", tint: "#2563EB" },
  whatsapp: { label: "WhatsApp", tint: "#16A34A" },
} as const;

/* Amber only for the one that wants something from you. Resolved is green
   because it is the good end state; closed takes the row's own faint ink,
   since "nothing happened and nothing will" is what no colour says. */
const STATUSES = {
  resolved: { label: "Resolved", dot: "#16A34A" },
  waiting: { label: "Waiting on you", dot: "#D97706" },
  closed: { label: "Closed", dot: "#A1A1AA" },
} as const;

type Conversation = {
  id: string;
  title: string;
  description: string;
  time: string;
  channel: keyof typeof CHANNELS;
  status: keyof typeof STATUSES;
  handedTo?: string;
};

const CONVERSATIONS: { group: string; items: Conversation[] }[] = [
  {
    group: "Today",
    items: [
      {
        id: "c1",
        title: "Chargeback on order #4417",
        description: "You: got it — I've uploaded the delivery confirmation.",
        time: "11:02 AM",
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
        title: "Terminal vs. POS bundle",
        description:
          "Global Payments: here's how the two setups compare for a single register.",
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
        title: "Switching from our old processor",
        description: "Marcus: I've started the statement review on our side.",
        time: "Aug 12",
        channel: "whatsapp",
        status: "waiting",
        handedTo: "Marcus",
      },
      {
        id: "c4",
        title: "First look at payment options",
        description:
          "Global Payments: Hi — welcome. I can help with rates, payouts, or getting set up.",
        time: "Aug 6",
        channel: "web",
        status: "closed",
      },
    ],
  },
];

/* Enough hue to read as a chip and not enough to compete with the title above
   it — these sit on a row being scanned past, not looked at. */
const CHIP_TINT = "14%";

const VIEW_SLIDE_MS = 260;
const VIEW_SLIDE_EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";

/* One row of the archive, in three states.

   Default is bare — a list of ten rows with a background each is a list of
   boxes. Hover tints it and brings out the menu; selected keeps the tint
   permanently, so "where I am" and "where the pointer is" read as the same
   kind of thing at different strengths rather than two different treatments.

   The menu takes the time's slot rather than sitting beside it. Both are on
   the right edge, both are secondary, and only one is useful at a time: the
   timestamp is for scanning, the menu is for acting on the row you have
   already found. */
function HistoryRow({
  item,
  active,
  menuOpen,
  renaming,
  neutral,
  onOpen,
  onMenu,
  onRename,
  onDelete,
}: {
  item: Conversation;
  active: boolean;
  menuOpen: boolean;
  renaming: boolean;
  neutral: Record<string, string>;
  onOpen: () => void;
  onMenu: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}) {
  const ch = CHANNELS[item.channel];
  const st = STATUSES[item.status];
  return (
    <div
      className="group/row relative flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors"
      style={{ background: active || menuOpen ? neutral.paper : undefined }}
    >
      {!active && !menuOpen && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover/row:opacity-100"
          style={{ background: neutral.paper }}
        />
      )}
      <span
        className="relative mt-0.5 grid size-9 shrink-0 place-items-center rounded-full text-[13px] font-semibold"
        style={{ background: "#E6E6E6", color: neutral.secondary }}
      >
        {item.handedTo ? (
          item.handedTo[0].toUpperCase()
        ) : (
          <SparkleMark className="size-4" />
        )}
      </span>

      <span className="relative min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {renaming ? (
            /* The title in place, at the same size and weight, so committing
               the change does not make the row jump. */
            <input
              autoFocus
              defaultValue={item.title}
              onBlur={(e) => onRename(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onRename(e.currentTarget.value);
                if (e.key === "Escape") onRename(item.title);
              }}
              className="min-w-0 flex-1 rounded border bg-transparent px-1 py-0.5 text-[14px] font-medium leading-snug outline-none"
              style={{ color: neutral.ink, borderColor: neutral.line }}
            />
          ) : (
            <>
              <button
                onClick={onOpen}
                className="text-left text-[14px] font-medium leading-snug"
                style={{ color: neutral.ink }}
              >
                {item.title}
              </button>
              <span
                className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                style={{
                  color: ch.tint,
                  background: `color-mix(in srgb, ${ch.tint} ${CHIP_TINT}, transparent)`,
                }}
              >
                <Globe className="size-3" strokeWidth={2} />
                {ch.label}
              </span>
              <span
                className="inline-flex shrink-0 items-center gap-1.5 text-[11px]"
                style={{ color: neutral.secondary }}
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ background: st.dot }}
                />
                {st.label}
              </span>
            </>
          )}
        </span>
        <button
          onClick={onOpen}
          className="mt-0.5 block w-full truncate text-left text-[13px]"
          style={{ color: neutral.secondary }}
        >
          {item.description}
        </button>
      </span>

      {/* Its own column at the row's right edge, holding the menu on the title's
          line and the time under it. Both belong to the edge, and putting the
          time inside the description's line left it floating short of the
          margin wherever the description was.

          The visibility is a class and not an inline style: an inline
          `opacity: 0` outranks `group-hover:opacity-100` no matter what the
          pointer is doing, which is why the menu never appeared. */}
      <span className="relative flex shrink-0 flex-col items-end justify-between self-stretch">
        <button
          /* Stopped here. The list closes any open menu on click, and without
             this the button's own click carried straight up to it — the menu
             opened and shut inside the same event, so nothing appeared. */
          onClick={(e) => {
            e.stopPropagation();
            onMenu();
          }}
          aria-label={`Options for ${item.title}`}
          className={`-mr-1 grid size-6 place-items-center rounded-full transition-opacity hover:bg-black/5 ${
            menuOpen ? "opacity-100" : "opacity-0 group-hover/row:opacity-100"
          }`}
          style={{ color: neutral.secondary }}
        >
          <MoreHorizontal className="size-4" strokeWidth={2} />
        </button>
        <span className="text-[11px]" style={{ color: neutral.muted }}>
          {item.time}
        </span>
        {menuOpen && (
          <span
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-7 z-20 flex w-[132px] flex-col overflow-hidden rounded-lg py-1"
            style={{
              background: neutral.surface,
              boxShadow:
                "0 10px 26px -10px rgba(15,17,26,0.24), 0 0 0 1px rgba(15,17,26,0.07)",
            }}
          >
            <button
              onClick={() => onRename(item.title)}
              className="flex items-center gap-2 px-3 py-1.5 text-left text-[13px] transition-colors hover:bg-black/[0.04]"
              style={{ color: neutral.ink }}
            >
              <Pencil className="size-3.5" strokeWidth={2} />
              Rename
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-3 py-1.5 text-left text-[13px] transition-colors hover:bg-black/[0.04]"
              style={{ color: "#D03A3A" }}
            >
              <Trash2 className="size-3.5" strokeWidth={2} />
              Delete
            </button>
          </span>
        )}
      </span>
    </div>
  );
}

/* The archive: a way to start a new one, then the rows in date groups. */
function HistoryList({
  neutral,
  accent,
  onOpen,
}: {
  neutral: Record<string, string>;
  accent: string;
  onOpen: () => void;
}) {
  const [groups, setGroups] = useState(CONVERSATIONS);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);

  const rename = (id: string, title: string) => {
    setGroups((gs) =>
      gs.map((g) => ({
        ...g,
        items: g.items.map((it) => (it.id === id ? { ...it, title } : it)),
      })),
    );
    setRenamingId(null);
    setMenuFor(null);
  };

  return (
    /* Clicking anywhere else in the list closes an open menu — cheaper than a
       document listener, and the list is the only place a click can land while
       one is open. */
    <div onClick={() => setMenuFor(null)}>
      {/* Top rather than bottom: starting fresh is the one thing here that is
          not about the past, and it is what someone with no relevant history
          has come for. */}
      <button
        onClick={onOpen}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-black/[0.03]"
      >
        <span
          className="grid size-9 shrink-0 place-items-center rounded-full text-white"
          style={{ background: accent }}
        >
          <Plus className="size-4.5" strokeWidth={2.2} />
        </span>
        <span
          className="text-[14px] font-medium"
          style={{ color: neutral.ink }}
        >
          New conversation
        </span>
      </button>

      {groups.map(({ group, items }) =>
        items.length === 0 ? null : (
          <div key={group} className="mt-3">
            <div
              className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wider"
              style={{ color: neutral.muted }}
            >
              {group}
            </div>
            {items.map((item) => (
              <HistoryRow
                key={item.id}
                item={item}
                active={item.id === "c1"}
                menuOpen={menuFor === item.id}
                renaming={renamingId === item.id}
                neutral={neutral}
                onOpen={onOpen}
                onMenu={() => setMenuFor(menuFor === item.id ? null : item.id)}
                onRename={(title) =>
                  renamingId === item.id
                    ? rename(item.id, title.trim() || item.title)
                    : (setRenamingId(item.id), setMenuFor(null))
                }
                onDelete={() => {
                  setGroups((gs) =>
                    gs.map((g) => ({
                      ...g,
                      items: g.items.filter((it) => it.id !== item.id),
                    })),
                  );
                  setMenuFor(null);
                }}
              />
            ))}
          </div>
        ),
      )}
    </div>
  );
}

function AiThinking({ accent }: { accent: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setI((p) => (p + 1) % THINKING_PHRASES.length),
      850,
    );
    return () => clearInterval(id);
  }, []);
  return (
    <div
      className="flex items-center gap-2 text-[14px] font-medium text-[#333333]"
      /* the sparkle takes its gradient from these, so it is the tenant's
         accent rather than the composer's default violet */
      style={
        {
          "--brand": accent,
          "--brand-lite": liteOf(accent),
        } as CSSProperties
      }
    >
      <AccentSparkle size={SPARKLE_PX} />
      <span className="ai-shimmer">{THINKING_PHRASES[i]}</span>
    </div>
  );
}

/* canned demo replies so the preview feels live */
/* The support route is written out in full — citations, the sources behind
   them, and the trace of what the agent did — because it is the one reply
   that has to show what a grounded answer looks like. The rest stay one-liners.
   Copy and sources are lifted from the Global Payments content pack. */
const SUPPORT_REPLY: Omit<Msg, "from"> = {
  text: [
    "I can help with most things right here. What's going on?",
    "- Payouts: a transfer that hasn't landed, or your payout schedule.",
    "- Disputes: respond to a chargeback and upload evidence.",
    "- Hardware: a terminal or POS that's misbehaving.",
    "If it's urgent, I can hand you straight to the support team with the conversation attached.",
  ].join("\n\n"),
  sources: [
    { name: "Card processing rates", url: "globalpayments.com/pricing" },
    { name: "Payout schedule", url: "globalpayments.com/docs/payouts" },
    { name: "Online payments", url: "globalpayments.com/online" },
    { name: "Talking to a person", url: "globalpayments.com/support" },
  ],
  steps: ["Searched the pricing guide", "Read 3 sources", "Called check_rates"],
  thoughtSecs: 8,
  /* The message ends on a question — "What's going on?" — so each of these
     answers it, in the visitor's voice, one per route the answer named. Third
     person labels like "Terminal issue" read as a category to file yourself
     under; a sentence you would actually say does the same work and sounds
     like a conversation. The verbs echo the bullets they come from, so
     pressing one is visibly picking up the thread rather than starting over. */
  followUps: [
    "My payout hasn't arrived",
    "I need to respond to a chargeback",
    "My terminal isn't working",
    "Talk to a human",
  ],
};

/* The opening turn. Hoisted out of the component so its length is known when
   state is created — the greeting streams on mount like any other reply, and
   what follows it has to be held back for exactly as long.

   Offered as follow-ups rather than as configured buttons attached to the
   message: these are contextual suggestions, and the whole point of them is
   that they change with the conversation. Bolted to the greeting they would sit
   in the transcript for the rest of the session, still offering the first thing
   you could have said ten turns ago. Above the composer they are replaced by
   whatever each reply suggests next, and they scroll away with the thread.

   The list itself is passed in, not written here: it is the same set the
   launcher is showing, so pressing one of the launcher's chips and opening the
   chat cold offer the same three things. Two lists would drift the moment
   either was edited, and the visitor would be shown one set of options and then
   a different set a second later. */
const GREETING: Omit<Msg, "from"> = {
  text: "Hi there 👋 welcome to Global Payments. Looking to learn more? I can help!",
};

function cannedReply(text: string): Omit<Msg, "from"> {
  const t = text.toLowerCase();
  if (/support|help|problem|issue|payout|dispute|chargeback/.test(t))
    return SUPPORT_REPLY;
  if (/(pric|plan|cost|subscri|tier)/.test(t))
    return {
      text: "We offer Studio and Enterprise plans — Studio suits small teams, Enterprise adds SSO, analytics and priority support. Want a quick side-by-side?",
    };
  if (/(stripe|payment|integrat|connect|api)/.test(t))
    return {
      text: "Yes — Stripe, plus 30+ other payment providers. Want me to show you how to connect it?",
    };
  if (/(demo|trial|try|book|call)/.test(t))
    return {
      text: "Absolutely — I can set up a live demo. What day works best for you?",
    };
  if (/(hi|hello|hey|yo)\b/.test(t))
    return { text: "Hi! 👋 How can I help you today?" };
  if (/(agent|ai|bot|work)/.test(t))
    return {
      text: "An AI agent answers questions, qualifies leads and books meetings automatically — trained on your content. Want to see it in action?",
    };
  return {
    text: "Great question! Let me help with that. Could you share a little more about what you're looking for?",
  };
}

/* ───────────────────── the returning visitor ─────────────────────
   What the launcher is for someone who has already used it. One axis — how
   long since they last had the chat open — and one thing that beats it.

   The first of the three is not a return at all: it is the same visit. They
   used the messenger, closed it, and carried on round the site, and the
   launcher follows them from page to page. The other two are actual returns,
   a session or a day later.

   The ages are a claim about when old context stops helping and starts
   misleading, not a measurement. Half an hour is roughly "still on the same
   errand"; a day is "whatever brought them here has probably moved on". They
   are the numbers most worth arguing about, so they are written down as
   numbers rather than left implicit in the behaviour.

   Unread overrides all three: if the agent wrote after the visitor left, that
   is the only thing the launcher should say, however long ago it was. And a
   conversation that ended properly — rated, or closed — is treated as cold
   whatever the clock says, because "continue where you left off" to someone
   who already said thanks reads as not having listened. */
type SessionState =
  /* the axis — how long since they were last on the site */
  | "first"
  | "live"
  | "warm"
  | "cold"
  /* and the two things that can be waiting at any point along it */
  | "unread"
  | "draft";

const LIVE_WITHIN_MIN = 30;

/* Typed and not sent. An unfinished sentence rather than a complete one: a
   whole message left unsent reads as a decision, and half of one reads as an
   interruption, which is what actually happened. */
const DRAFT = "I've been waiting three days for the";

/* Who they are, when the site knows — signed in, or told the agent earlier in
   the conversation. Nullable on purpose: most visitors to most pages are
   anonymous, and a greeting that has to be personal is a greeting that breaks
   for the majority. The name makes a good line better; its absence has to
   leave a line that still works. */
const VISITOR_NAME: string | null = "Mohima";
const welcomeBack = (name: string | null) =>
  name ? `Welcome back, ${name} 👋` : "Welcome back! 👋";
const COLD_AFTER_HOURS = 24;

type SessionOption = { id: SessionState; label: string; note: string };

const SESSIONS: SessionOption[] = [
  { id: "first", label: "First visit", note: "Never opened the chat." },
  {
    id: "live",
    label: "Just left",
    note: `Closed the chat and carried on, or left the site and came back inside ${LIVE_WITHIN_MIN} minutes. Same errand either way, so the thread is offered back.`,
  },
  {
    id: "warm",
    label: "Earlier today",
    note: `A later visit, within ${COLD_AFTER_HOURS} hours. Rests as normal, but opens on the old conversation.`,
  },
  {
    id: "cold",
    label: "Yesterday",
    note: `Away over ${COLD_AFTER_HOURS} hours. Opens fresh, and offers the old conversation as a card rather than putting them back in it.`,
  },
  {
    id: "unread",
    label: "Unread message",
    note: "The agent wrote after they left. Beats the clock at any age.",
  },
  {
    id: "draft",
    label: "Unsent draft",
    note: "They typed and closed without sending. Their own words go back in the field — that slot belongs to the visitor, which is exactly why the agent's lines cannot live there.",
  },
];

/* The first chip in the row, not a replacement for the placeholder. Written
   in the agent's voice, which is why it cannot live in the field: the
   placeholder slot is where the visitor's own words go, and the agent
   speaking from inside the visitor's input is the same category error as
   putting the visitor's question in the agent's speech bubble. */
const RESUME_LABEL = "Continue your conversation";

/* The field's own form of it. Same words plus the ellipsis, which belongs in a
   field and nowhere else: in the button launcher's bubble the agent is saying
   the line out loud, and a spoken sentence does not trail off. */
const RESUME_FIELD = `${RESUME_LABEL}…`;

/* The same offer at chip length. The long form has a whole line to itself and
   can afford to explain; in the row it sits beside three suggestions and has
   to be the same size as them, or it stops reading as one of the choices and
   starts reading as a heading over them.

   One word, and not "continue chat": the product calls this a conversation
   everywhere else — the header menu restarts one, the archive lists them — and
   a chip that called it a chat would be the only surface using a second noun
   for the same object. Cut rather than lengthened, because the chip carries a
   dot and sits under the thread it refers to, so there is nothing left for the
   noun to disambiguate. */
const RESUME_CHIP = "Continue";

/* What the agent said after the visitor left. Deliberately something worth
   coming back for — an unread that turns out to be "are you still there?"
   spends the visitor's attention and returns nothing. */
/* What the visitor said before they left, taken from the very follow-ups the
   agent had just offered — which is the only reason the reply below is allowed
   to know it is a payout at all. */
const INBOUND_ASK = "My payout hasn't arrived";

/* Written against the turn it follows, and long because the answer is. This
   is the shape of message that actually arrives after someone leaves: not a
   nudge, but the work done in their absence — a finding, the reason for it,
   what happens next, and what they would have to do if it does not resolve
   itself. A short unread is usually a "are you still there?", and that is the
   fastest way to teach people the dot is noise. */
const INBOUND = [
  "The transfer settled on our side at 16:40 on Friday and left for your bank the same evening. Anything that leaves after 16:00 on a Friday sits with the receiving bank over the weekend, so it clears on Monday morning rather than the same day.",
  "Nothing on your side is holding it up — the payout schedule and the account on file both look right.",
  "If it still is not showing by midday Monday, send me the last four digits of the account and I will pull the trace reference and chase it with the bank directly.",
].join("\n\n");

/* The conversation they are being handed back. Built rather than declared so
   the agent's side is the same canned answer the live preview would give: a
   resumed thread that reads differently from a fresh one is a lie about what
   they will find when they open it. */
const PRIOR_ASK = "Where's my payout?";

/* Where they went next. Deliberately not the page the conversation was about:
   the whole point of this state is that the visitor now has two live reasons
   to press the launcher, and a page that matched the thread would collapse
   them back into one. */
/* What the thread was about, in the form the agent would refer back to it.
   Named separately from the question because they are different registers:
   "Where's my payout?" is what the visitor typed, "the payout" is what the
   agent calls it a few hours later. */
const PRIOR_TOPIC = "the payout";

/* When the thread was last touched. The same stamp the messages carry, so the
   rule at the top of a resumed conversation and the time under its last bubble
   cannot disagree about when this happened. */
const LAST_SEEN = "10:24 AM";
const WHEN_EARLIER = `Earlier today · ${LAST_SEEN}`;
const WHEN_YESTERDAY = `Yesterday · ${LAST_SEEN}`;

/* What the last conversation was about and how it ended. A day on, the visitor
   is being offered a thread they may not remember, so the offer has to say what
   it is — "continue" alone asks them to accept something unseen. The count is
   derived from the thread rather than written here: a summary that says six
   messages over a conversation of three is the one kind of error this card
   cannot afford, since its whole job is to be trusted sight unseen. */
const LAST_CHAT_ABOUT = "Payout timing for the Friday transfer";
const LAST_CHAT_OUTCOME = "ended unresolved";

function priorThread(): Msg[] {
  return [
    { from: "ai", text: GREETING.text },
    { from: "user", text: PRIOR_ASK },
    { from: "ai", ...cannedReply(PRIOR_ASK) },
  ];
}

/* The turn the agent takes the moment a resumed thread is opened. It arrives
   now — it streams in and its follow-ups appear after it, like any other reply —
   which is why it is not part of the seed: the seed is history and renders
   whole, and this is the agent noticing someone came back.

   It asks rather than assumes. The visitor may be here to finish the old thing
   or to start a new one, and a launcher that reopened straight into the payout
   would be answering a question nobody asked. The follow-ups are in the
   visitor's voice, one per route the question named. */
function resumeTurnFor(session: SessionState): Msg | null {
  if (session !== "live" && session !== "warm") return null;
  return {
    from: "ai",
    dayBreak: "Now",
    text: `Welcome back. Still on ${PRIOR_TOPIC}, or is this something new?`,
    followUps: [`Still ${PRIOR_TOPIC}`, "Something else", "Talk to a human"],
  };
}

/* Yesterday's conversation, stamped with when it happened. Not the panel's
   seed — a day on, the visitor opens on a fresh greeting and is *offered* this,
   which is a different thing from being put back into it. */
function lastChatFor(session: SessionState) {
  if (session !== "cold") return null;
  const thread = priorThread().map((m, i) =>
    i === 0 ? { ...m, dayBreak: WHEN_YESTERDAY } : m,
  );
  return {
    when: "Yesterday",
    about: LAST_CHAT_ABOUT,
    outcome: LAST_CHAT_OUTCOME,
    thread,
    opening: {
      from: "ai" as const,
      dayBreak: "Now",
      text: `Picking up where we left off on ${PRIOR_TOPIC}. Has the transfer landed since?`,
      followUps: ["Still not arrived", "Yes, it's there", "Talk to a human"],
    },
  };
}
type LastChat = NonNullable<ReturnType<typeof lastChatFor>>;

/* The thread the panel opens on, per state. Null means the ordinary first-run
   greeting — which is what both ends of the range get, for opposite reasons:
   nobody has been here yet, or it has been long enough that they may as well
   not have been. */
function seedFor(session: SessionState): Msg[] | null {
  /* No divider on these: it is still the same visit — or near enough — and a
     rule labelled "earlier today" over a conversation from four minutes ago
     would be the product telling the visitor something they know better than
     it does. */
  /* Stamped, because they left the site and came back: the thread opens on a
     conversation they were in a while ago rather than one they were in a
     moment ago, and the rule says which. */
  if (session === "live")
    return priorThread().map((m, i) =>
      i === 0 ? { ...m, dayBreak: WHEN_EARLIER } : m,
    );
  if (session === "draft") return priorThread();
  if (session === "warm") {
    const t = priorThread();
    return t.map((m, i) => (i === 0 ? { ...m, dayBreak: WHEN_EARLIER } : m));
  }
  if (session === "unread") {
    const t = priorThread();
    return [
      ...t.map((m, i) => (i === 0 ? { ...m, dayBreak: WHEN_EARLIER } : m)),
      /* Their last word before leaving, so the unread has something to be a
         reply to. Without it the agent answers a question nobody asked. */
      { from: "user", text: INBOUND_ASK },
      { from: "ai", text: INBOUND, dayBreak: "Just now" },
    ];
  }
  return null;
}

/* A labelled hairline across the thread. Same object whether it is marking a
   date, a handover, or the moment the visitor picked this back up — they are
   all the same kind of thing, a fact about the conversation rather than a turn
   in it. Declared out here rather than inside the panel: a component defined
   during render is a new type on every pass, which remounts whatever it draws. */
function Rule({
  label,
  neutral,
}: {
  label: string;
  neutral: Record<string, string>;
}) {
  return (
    <span
      className="flex items-center gap-3 px-1 text-[11px] uppercase tracking-[0.06em]"
      style={{ color: neutral.muted }}
    >
      <span className="h-px flex-1" style={{ background: neutral.line }} />
      {label}
      <span className="h-px flex-1" style={{ background: neutral.line }} />
    </span>
  );
}

function AgentPreview({
  theme,
  name,
  subtitle,
  disclaimer,
  disclaimerOn,
  brandingOn,
  avatar,
  logoOnly,
  accent,
  device,
  width,
  height = 680,
  initialPrompt,
  seed,
  initialDraft,
  opening,
  lastChat,
  onClose,
  placeholder,
  suggestions,
}: {
  theme: ReturnType<typeof useTheme>;
  name: string;
  subtitle: string;
  disclaimer: string;
  disclaimerOn: boolean;
  brandingOn: boolean;
  avatar: string | null;
  logoOnly: boolean;
  accent: string;
  device: Device;
  width?: number;
  height?: number;
  initialPrompt?: string;
  /* an existing conversation to open on, for a returning visitor */
  seed?: Msg[] | null;
  /* what was in the composer when they closed it, unsent */
  initialDraft?: string;
  /* the agent's first turn of this sitting, appended after the seed and
     treated as newly arrived rather than as history */
  opening?: Msg | null;
  /* a conversation from a previous day, offered above the greeting rather than
     opened into */
  lastChat?: LastChat | null;
  onClose?: () => void;
  placeholder: string;
  /* whatever the launcher is offering — the opening turn hands the same set on */
  suggestions: string[];
}) {
  const { neutral } = theme;
  const aiBubble: CSSProperties = {
    background: neutral.paper,
    borderColor: neutral.line,
    color: neutral.ink,
  };

  /* ── interactive conversation ── */
  // Opens on the agent's greeting alone, the way a real first visit does —
  // the visitor's side appears only once they say something. The docked
  // launcher starts empty and auto-sends whatever prompt was tapped.
  const [convo, setConvo] = useState<Msg[]>(
    initialPrompt
      ? []
      : seed?.length
        ? opening
          ? [...seed, opening]
          : seed
        : [{ from: "ai", ...GREETING, followUps: suggestions }],
  );
  /* Everything the panel opened with is history; everything after it is this
     visit. Fixed at mount rather than derived from the seed each render, so a
     turn sent now never slips back into the silent half. */
  const [historyLen, setHistoryLen] = useState(seed?.length ?? 0);
  const [draft, setDraft] = useState(initialDraft ?? "");
  const [thinking, setThinking] = useState(false);
  /* Only the newest turn can still be arriving, so one flag is enough. It ends
     the sparkle: the mark turns while the answer is being written and settles
     when the last word lands. */
  const [streaming, setStreaming] = useState(
    !initialPrompt && (!seed?.length || !!opening),
  );
  /* Which configured option was taken on a given turn. Configured buttons are
     part of the message, so they stay on screen after the choice — but spent:
     the set dims and the one that was pressed keeps its outline, so the
     transcript still reads as a question that was answered rather than a live
     offer. Keyed by index, which is stable because turns only ever append. */
  const [picked, setPicked] = useState<Record<number, string>>({});
  /* The notice is shown until it is acknowledged, then it is gone. That is the
     difference between a disclosure and permanent furniture: it costs the
     composer its space once instead of for the whole session, and closing it
     is a clearer record of having been read than merely having been on screen. */
  const [noticeOpen, setNoticeOpen] = useState(true);
  // …and settles on its own clock, the same way a sent reply does
  useEffect(() => {
    if (initialPrompt) return;
    if (seed?.length && !opening) return;
    const t = setTimeout(
      () => setStreaming(false),
      streamMs(opening?.text ?? GREETING.text),
    );
    return () => clearTimeout(t);
    // seed is read once, at mount — a thread handed back mid-session would be
    // a different conversation, not this one changing under the visitor
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);
  /* Taking the offer swaps the fresh greeting for the real thread. The count
     of what is now history moves with it, so yesterday's messages render whole
     like the history they are, and only the agent's new turn arrives word by
     word. The card goes: it was an offer, and it has been answered. */
  const [offerOpen, setOfferOpen] = useState(true);
  const takeLastChat = useCallback(() => {
    if (!lastChat) return;
    const { thread, opening: op } = lastChat;
    setHistoryLen(thread.length);
    setConvo(op ? [...thread, op] : thread);
    setPicked({});
    setOfferOpen(false);
    if (op) {
      setStreaming(true);
      setTimeout(() => setStreaming(false), streamMs(op.text));
    }
  }, [lastChat]);

  /* ── what the header menu does ── */
  // Back to a first visit: the greeting alone, nothing typed, nothing spent.
  // The thread is emptied rather than hidden, so a restart is not recoverable
  // by scrolling — which is the point of the word.
  const restart = useCallback(() => {
    setConvo([{ from: "ai", ...GREETING, followUps: suggestions }]);
    setDraft("");
    setPicked({});
    setThinking(false);
    setStreaming(true);
    setTimeout(() => setStreaming(false), streamMs(GREETING.text));
  }, [suggestions]);

  // Plain text, not JSON: the visitor is the audience, and this is the file
  // they forward to a colleague or attach to a complaint.
  const downloadTranscript = useCallback(() => {
    const body = convo
      .map((m) => `${m.from === "ai" ? "Agent" : "You"}: ${m.text}`)
      .join("\n\n");
    const url = URL.createObjectURL(
      new Blob([body], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "conversation.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [convo]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const started = useRef(false);

  /* Nothing that belongs to a turn shows until the turn has finished
     arriving: quick replies you could click mid-sentence, and an action row
     offering to copy an answer still being written, both read as the interface
     getting ahead of itself. The reasoning trace is the exception — it is what
     the sparkle lives in, so it is there for the wait. */
  const streamingIdx = streaming ? convo.length - 1 : -1;

  /* The replies on offer belong to the conversation, not to the paragraph that
     prompted them: they sit above the composer, where the visitor's attention
     already is when deciding what to say. Read off the newest turn, so they
     clear themselves the moment something is sent and are replaced by whatever
     the next answer offers. */
  const last = convo[convo.length - 1];
  const quickReplies =
    !thinking && !streaming && last?.from === "ai" ? last.followUps : undefined;

  /* 380 centred, 360 on an edge. Keyed off the panel's own width rather than a
     placement prop, because the width is what the cap is really about.

     580 was most of a centred panel, so three suggestions ran across it as one
     long line — which reads as a sentence rather than a set of choices. Held to
     380 the row wraps at roughly the same point it does docked, so the block
     keeps its shape whichever placement it is in and only the panel around it
     changes. */
  const replyCap = (width ?? 0) >= 600 ? 380 : 360;

  const [headerMenu, setHeaderMenu] = useState(false);
  const [autoRead, setAutoRead] = useState(false);

  /* thread | history. The back arrow in the header moves between them; the two
     sit side by side in one clipped frame and slide, so the panel reads as a
     window onto a rail rather than two screens being swapped. */
  const [view, setView] = useState<"thread" | "history">("thread");

  const showNotice = disclaimerOn && noticeOpen && disclaimer.trim().length > 0;

  /* Which of the two notices the strip is carrying, when both are switched on.

     Keyed to the conversation, not to the field. Tying it to typing put the
     disclaimer on screen while the visitor was composing their own words and
     took it away while they were reading the agent's — sending clears the
     field, so the credit came back exactly when there was generated output to
     qualify. Backwards: the sentence is about the output.

     So: the credit holds the opening turn, where nothing has been generated
     and there is nothing to disclaim, and the disclaimer arrives with the
     first reply and stays for the rest of the session. "Shown whenever AI
     output is on screen" is also a commitment that can be defended; "shown
     whenever the visitor is typing" is not really one. */
  const conversing = convo.some((m) => m.from === "user");

  /* The outlined field is a fixed 54px, and 28px controls left 11.5px of dead
     space above and below each one — the field read as mostly air. 34px leaves
     8.5px, enough to fill it without the discs crowding the stroke. Only the
     outlined variant: the filled one grows with its contents, so bigger
     controls would make it taller rather than fuller. */
  const ctlSize = theme.outlineComposer ? "size-[34px]" : "size-7";
  const ctlIcon = "size-4";
  /* A short label before a colon is set in semibold, so "Disclaimer:" reads as
     what the line is rather than as the start of the sentence. Capped at 24
     characters so a colon further into real prose doesn't bold half a line —
     the same lead-in rule the bulleted answers use. */
  const noticeColon = disclaimer.indexOf(":");
  const noticeLead =
    noticeColon > 0 && noticeColon <= 24
      ? disclaimer.slice(0, noticeColon + 1)
      : "";
  const noticeBody = noticeLead
    ? disclaimer.slice(noticeColon + 1)
    : disclaimer;

  /* Clamped to one line, the link has to be held out of the truncation — cut
     off with the prose it would be unreachable, which is the one part of a
     disclaimer that has to stay clickable. The prose truncates, the link keeps
     its width. Written for a link that closes the sentence ("… Know more"),
     which is where this copy always puts it. */
  const noticeLink = /\[([^\]]+)\]\(([^)]+)\)/.exec(noticeBody);
  const noticeProse = noticeLink
    ? noticeBody.replace(noticeLink[0], "").trim()
    : noticeBody;
  // the tooltip reads as a sentence, so link markup collapses to its label
  const noticeFull = disclaimer.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  const [noticeRef, noticeCut] = useTruncated(noticeProse);

  const hasInput = draft.trim().length > 0;
  // content-driven multiline (char count, not DOM measure — no oscillation)
  const isMultiline = useMemo(() => {
    if (!draft) return false;
    const total = draft
      .split("\n")
      .reduce((a, l) => a + Math.max(1, Math.ceil(l.length / 56)), 0);
    return total > 1;
  }, [draft]);
  // auto-grow the textarea to its content, capped
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, [draft]);

  const send = (text: string) => {
    const msg = text.trim();
    if (!msg || thinking) return;
    setDraft("");
    setConvo((c) => [...c, { from: "user", text: msg }]);
    setThinking(true);
    const reply = cannedReply(msg);
    // think-time derived from reply length — long enough to cycle phrases
    const delay = Math.min(
      3200,
      Math.max(2200, reply.text.split(/\s+/).length * 90),
    );
    setTimeout(() => {
      setThinking(false);
      setConvo((c) => [...c, { from: "ai", ...reply }]);
      setStreaming(true);
      setTimeout(() => setStreaming(false), streamMs(reply.text));
    }, delay);
  };

  /* Follow the conversation by watching the thread's height rather than by
     listing the things that change it. A new turn, the reasoning trace opening,
     the sources panel unfolding — all of them just make the content taller, and
     one observer catches every case, including ones added later.

     It lets go the moment the visitor scrolls up: sticking only while they are
     already near the bottom means re-reading an earlier answer isn't fought by
     the scroll snapping back. */
  useEffect(() => {
    const el = scrollRef.current;
    const content = contentRef.current;
    if (!el || !content || typeof ResizeObserver === "undefined") return;
    const atBottom = () =>
      el.scrollHeight - el.scrollTop - el.clientHeight < STICK_PX;
    let stick = true;
    const onScroll = () => {
      stick = atBottom();
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(() => {
      if (stick) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });
    ro.observe(content);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, []);

  // docked launcher: start the conversation from the tapped prompt (once)
  useEffect(() => {
    if (!initialPrompt || started.current) return;
    started.current = true;
    send(initialPrompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  return (
    <div
      /* 32px, matching GlassComposer. It splits the radius across two
         elements — 32 on the panel's top corners, 32 on the composer's
         bottom — which come to the same window; here the two are one
         container, so it carries all four. */
      className="flex flex-col overflow-hidden rounded-[32px] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.18)]"
      style={
        {
          width: width ?? DEVICE_WIDTH[device],
          height,
          background: neutral.canvas,
          /* Declared on the panel, not on the row of action items, so the
             header's controls resolve it too — it was scoped to `.ai-actions`,
             which meant the header's hover pointed at a variable that did not
             exist there and painted nothing. One grey for every icon control in
             the panel. */
          "--act-hover": neutral.paper,
          "--act-ink": neutral.ink,
        } as CSSProperties
      }
    >
      {/* header — neutral, no accent fill (matches /web).
          A fixed 60 that includes the rule beneath it, so the header is the
          same height whatever it is carrying: the agent's 36px avatar in the
          thread, or the bare title on the archive. Padding alone made it the
          taller of the two and left the archive's rule a pixel off. */}
      <div
        className="flex h-[60px] shrink-0 items-center border-b pl-4 pr-5"
        style={{ borderColor: neutral.line }}
      >
        <div className="mx-auto flex w-full max-w-[720px] items-center gap-2.5">
          {logoOnly ? (
            /* wordmark logo — centered, no name/subtitle */
            <>
              {/* Both side slots are the same width so the logo stays on the
                  centre line — widened from 8 because the right one now carries
                  two controls, and a centred thing is only centred while what
                  flanks it is equal. */}
              <div className="flex w-[68px] shrink-0 items-center">
                {
                  /* Always: this opens the archive now, which is there
                   whether or not the panel can be closed. */
                  true && (
                    <button
                      onClick={() =>
                        setView(view === "history" ? "thread" : "history")
                      }
                      className="hdr-action -ml-1 grid size-8 place-items-center rounded-full transition-colors"
                      style={{ color: neutral.secondary }}
                      aria-label="Back"
                    >
                      <ChevronLeft className="size-5" strokeWidth={2} />
                    </button>
                  )
                }
              </div>
              <div className="flex h-9 flex-1 items-center justify-center">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatar}
                    alt=""
                    className="h-7 w-auto max-w-full object-contain"
                  />
                ) : (
                  <span
                    className="text-[14px] font-semibold tracking-tight"
                    style={{ color: neutral.ink }}
                  >
                    {name || "Agent"}
                  </span>
                )}
              </div>
              <div className="flex w-[68px] shrink-0 items-center justify-end gap-0.5">
                <span className="relative">
                  <button
                    onClick={() => setHeaderMenu(!headerMenu)}
                    aria-label="More"
                    aria-expanded={headerMenu}
                    className="hdr-action grid size-8 shrink-0 place-items-center rounded-full transition-colors"
                    style={{ color: neutral.secondary }}
                  >
                    <MoreVertical className="size-[18px]" strokeWidth={1.75} />
                  </button>
                  {headerMenu && (
                    <>
                      {/* A full-panel catcher rather than a document listener:
                          the menu only exists while the panel does, and a click
                          anywhere else in it should close this first. */}
                      <span
                        className="fixed inset-0 z-30"
                        onClick={() => setHeaderMenu(false)}
                      />
                      <span
                        className="absolute right-0 top-10 z-40 flex w-[214px] flex-col overflow-hidden rounded-xl py-1"
                        style={{
                          background: neutral.surface,
                          boxShadow:
                            "0 12px 30px -10px rgba(15,17,26,0.26), 0 0 0 1px rgba(15,17,26,0.07)",
                        }}
                      >
                        <button
                          onClick={() => {
                            restart();
                            setHeaderMenu(false);
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors hover:bg-black/[0.04]"
                          style={{ color: neutral.ink }}
                        >
                          <RotateCcw
                            className="size-4 shrink-0"
                            strokeWidth={1.8}
                          />
                          Restart conversation
                        </button>
                        <button
                          onClick={() => {
                            downloadTranscript();
                            setHeaderMenu(false);
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors hover:bg-black/[0.04]"
                          style={{ color: neutral.ink }}
                        >
                          <Download
                            className="size-4 shrink-0"
                            strokeWidth={1.8}
                          />
                          Download transcript
                        </button>
                        {/* Stays open: this one is a setting, and closing the
                            menu on a switch hides the state you just changed. */}
                        <button
                          onClick={() => setAutoRead(!autoRead)}
                          className="flex items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors hover:bg-black/[0.04]"
                          style={{ color: neutral.ink }}
                        >
                          <Volume2
                            className="size-4 shrink-0"
                            strokeWidth={1.8}
                          />
                          <span className="flex-1">
                            {autoRead
                              ? "Turn off auto-read"
                              : "Turn on auto-read"}
                          </span>
                          <span
                            className="relative h-4 w-7 shrink-0 rounded-full transition-colors"
                            style={{
                              background: autoRead ? accent : neutral.line,
                            }}
                          >
                            <span
                              className="absolute top-0.5 size-3 rounded-full bg-white transition-all"
                              style={{ left: autoRead ? 14 : 2 }}
                            />
                          </span>
                        </button>
                      </span>
                    </>
                  )}
                </span>
                {/* This layout never had a close control — which is why it
                    vanished on switching the centred logo on. Same treatment as
                    the other header: a button where there is something to
                    close, the mark alone where there is not. */}
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="hdr-action grid size-8 shrink-0 place-items-center rounded-full transition-colors"
                  style={{ color: neutral.secondary }}
                >
                  <X className="size-[18px]" strokeWidth={2} />
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Back goes to the archive, not out of the panel — the way it
                  does in the launcher. Closing has its own control on the
                  right; a back arrow that dismissed the whole thing would be
                  the only one on the page that meant "leave". */}
              {
                /* Always: this opens the archive now, which is there
                   whether or not the panel can be closed. */
                true && (
                  <button
                    onClick={() =>
                      setView(view === "history" ? "thread" : "history")
                    }
                    className="-ml-1 hdr-action grid size-8 shrink-0 place-items-center rounded-full transition-colors"
                    style={{ color: neutral.secondary }}
                    aria-label="Back"
                  >
                    <ChevronLeft className="size-5" strokeWidth={2} />
                  </button>
                )
              }
              {/* avatar — uploaded image, else default user-bubble fill + ink bot.
                  Not on the archive: the agent's face belongs to a conversation
                  with it, and a list of past ones is about them rather than
                  about the agent. */}
              {view === "history" ? null : avatar ? (
                <span
                  className="size-9 shrink-0 rounded-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${avatar})` }}
                />
              ) : (
                <div
                  className="grid size-9 shrink-0 place-items-center rounded-full"
                  style={{ background: theme.bubbleFill }}
                >
                  <Bot
                    className="size-[18px]"
                    style={{ color: theme.bubbleInk }}
                    strokeWidth={2}
                  />
                </div>
              )}
              <div className="flex flex-col leading-tight">
                <span
                  className="text-[14px] font-semibold tracking-tight"
                  style={{ color: neutral.ink }}
                >
                  {view === "history"
                    ? "Conversation history"
                    : name || "Agent"}
                </span>
                {view !== "history" && subtitle.trim() && (
                  <span
                    className="mt-0.5 text-[12px]"
                    style={{ color: neutral.muted }}
                  >
                    {subtitle}
                  </span>
                )}
              </div>
              {/* One set: same 32px box, same round hover, same secondary grey. The
                  menu used to be a bare icon with no target at all and the close
                  a 24px one, so three controls in a row had three sizes and only
                  two of them answered a pointer. */}
              <div className="ml-auto flex items-center gap-0.5">
                <span className="relative">
                  <button
                    onClick={() => setHeaderMenu(!headerMenu)}
                    aria-label="More"
                    aria-expanded={headerMenu}
                    className="hdr-action grid size-8 shrink-0 place-items-center rounded-full transition-colors"
                    style={{ color: neutral.secondary }}
                  >
                    <MoreVertical className="size-[18px]" strokeWidth={1.75} />
                  </button>
                  {headerMenu && (
                    <>
                      {/* A full-panel catcher rather than a document listener:
                          the menu only exists while the panel does, and a click
                          anywhere else in it should close this first. */}
                      <span
                        className="fixed inset-0 z-30"
                        onClick={() => setHeaderMenu(false)}
                      />
                      <span
                        className="absolute right-0 top-10 z-40 flex w-[214px] flex-col overflow-hidden rounded-xl py-1"
                        style={{
                          background: neutral.surface,
                          boxShadow:
                            "0 12px 30px -10px rgba(15,17,26,0.26), 0 0 0 1px rgba(15,17,26,0.07)",
                        }}
                      >
                        <button
                          onClick={() => {
                            restart();
                            setHeaderMenu(false);
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors hover:bg-black/[0.04]"
                          style={{ color: neutral.ink }}
                        >
                          <RotateCcw
                            className="size-4 shrink-0"
                            strokeWidth={1.8}
                          />
                          Restart conversation
                        </button>
                        <button
                          onClick={() => {
                            downloadTranscript();
                            setHeaderMenu(false);
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors hover:bg-black/[0.04]"
                          style={{ color: neutral.ink }}
                        >
                          <Download
                            className="size-4 shrink-0"
                            strokeWidth={1.8}
                          />
                          Download transcript
                        </button>
                        {/* Stays open: this one is a setting, and closing the
                            menu on a switch hides the state you just changed. */}
                        <button
                          onClick={() => setAutoRead(!autoRead)}
                          className="flex items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors hover:bg-black/[0.04]"
                          style={{ color: neutral.ink }}
                        >
                          <Volume2
                            className="size-4 shrink-0"
                            strokeWidth={1.8}
                          />
                          <span className="flex-1">
                            {autoRead
                              ? "Turn off auto-read"
                              : "Turn on auto-read"}
                          </span>
                          <span
                            className="relative h-4 w-7 shrink-0 rounded-full transition-colors"
                            style={{
                              background: autoRead ? accent : neutral.line,
                            }}
                          >
                            <span
                              className="absolute top-0.5 size-3 rounded-full bg-white transition-all"
                              style={{ left: autoRead ? 14 : 2 }}
                            />
                          </span>
                        </button>
                      </span>
                    </>
                  )}
                </span>
                {/* Always drawn, because it is part of the header being
                    designed — it used to appear only where something could
                    actually be closed, which meant it was missing from the
                    Messenger tab, the one view whose whole job is showing what
                    the header looks like.

                    Without anything to close it is rendered rather than
                    offered: same mark in the same place, but not a button, so
                    there is no click that quietly does nothing. The three-dot
                    menu beside it is drawn the same way. */}
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="hdr-action grid size-8 shrink-0 place-items-center rounded-full transition-colors"
                  style={{ color: neutral.secondary }}
                >
                  <X className="size-[18px]" strokeWidth={2} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* body — beige canvas */}
      {/* One clipped frame holding both screens side by side, so moving between
          them is a rail sliding rather than two panels being swapped. Only the
          screen that is leaving carries a transform — the one that has arrived
          sits at `none`, which means the settled state is exactly the
          untransformed layout that existed before any of this. */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div
          className="absolute inset-0 flex flex-col overflow-y-auto px-2 pt-2 transition-transform motion-reduce:transition-none"
          style={{
            transform: view === "history" ? "none" : "translateX(-100%)",
            transitionDuration: `${VIEW_SLIDE_MS}ms`,
            transitionTimingFunction: VIEW_SLIDE_EASE,
          }}
          aria-hidden={view !== "history"}
        >
          <HistoryList
            neutral={neutral}
            accent={accent}
            onOpen={() => setView("thread")}
          />
        </div>

        <div
          ref={scrollRef}
          /* No bottom padding. It was 24, then 12, and both landed between the
           suggestions and the disclaimer on top of the spacing those two
           already carry — the conversation used to end at the last message,
           which is what that padding was for. */
          className="absolute inset-0 flex flex-col overflow-y-auto px-5 pt-5 transition-transform motion-reduce:transition-none"
          style={{
            transform: view === "history" ? "translateX(100%)" : "none",
            transitionDuration: `${VIEW_SLIDE_MS}ms`,
            transitionTimingFunction: VIEW_SLIDE_EASE,
          }}
          aria-hidden={view === "history"}
        >
          <div
            ref={contentRef}
            /* flex-1, not min-h-full. min-h-full is 100% of the content box and
             the scroll area adds its own py-6 on top of that, so an empty panel
             was already taller than its container and showed a scrollbar with
             nothing to scroll. Filling the space as a flex child costs no extra
             height. */
            className="mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-4"
          >
            {/* Yesterday's conversation, offered rather than opened. Inside
                the scroll rather than pinned above it: it is a thing that
                happened, so it belongs at the top of the transcript and should
                scroll away like anything else there once the visitor has moved
                past it. */}
            {lastChat && offerOpen && (
              <div
                className="flex flex-col gap-2.5 rounded-xl p-3.5"
                /* Outlined, not filled. A tinted block at the head of the
                   transcript reads as a message the agent sent; the outline
                   keeps it a card about the conversation rather than a turn
                   in it. */
                style={{
                  boxShadow: `inset 0 0 0 1px ${neutral.line}`,
                  animation: "fade-in 240ms ease-out both",
                }}
              >
                <span
                  className="text-[11px] uppercase tracking-[0.06em]"
                  style={{ color: neutral.muted }}
                >
                  Your last conversation · {lastChat.when}
                </span>
                <span
                  className="text-[13px] leading-snug"
                  style={{ color: neutral.ink }}
                >
                  {lastChat.about} — {lastChat.thread.length} messages,{" "}
                  {lastChat.outcome}.
                </span>
                <button
                  onClick={takeLastChat}
                  className="w-fit rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-opacity hover:opacity-90"
                  style={{ background: accent, color: "#fff" }}
                >
                  Continue that
                </button>
              </div>
            )}

            {/* live conversation */}
            {convo.map((m, i) => (
              <Fragment key={i}>
                {/* Where a resumed thread stops being now. Only drawn on the
                    turn that starts a new stretch of time, so a conversation
                    that never paused never shows one. */}
                {m.dayBreak && <Rule label={m.dayBreak} neutral={neutral} />}
                {m.from === "user" ? (
                  <div
                    key={i}
                    /* a column now, so the stamp can sit under the bubble and stay
                   ranged to the visitor's side with it */
                    className="flex flex-col items-end"
                    style={{
                      animation:
                        "bubble-in 240ms cubic-bezier(0.2,0.6,0.2,1) both",
                    }}
                  >
                    <div
                      className={
                        theme.userNeutral
                          ? "w-fit max-w-[80%] whitespace-pre-line rounded-[20px] px-5 py-3 text-[14px] font-light"
                          : "w-fit max-w-[80%] rounded-[12px] rounded-br-[4px] px-3.5 py-2 text-[14px] leading-relaxed"
                      }
                      style={
                        theme.userNeutral
                          ? { background: neutral.paper, color: neutral.ink }
                          : {
                              background: theme.bubbleFill,
                              boxShadow: `inset 0 0 0 1px ${theme.bubbleBorder}`,
                              color: theme.bubbleInk,
                            }
                      }
                    >
                      {m.text}
                    </div>
                    {/* The time only. The agent's turn carries a toolbar under it —
                    replay, the two votes, copy — because those act on something
                    the agent produced; there is nothing to do to a message the
                    visitor wrote themselves. So the two turns share the stamp
                    and its position, and nothing else. */}
                    <span
                      className="mt-1 px-1 text-[11px]"
                      style={{ color: neutral.muted }}
                    >
                      10:24 AM
                    </span>
                  </div>
                ) : (
                  <div
                    key={i}
                    className="group flex flex-col items-start"
                    style={{
                      animation:
                        "bubble-in 240ms cubic-bezier(0.2,0.6,0.2,1) both",
                    }}
                  >
                    {/* Paper sets the agent's reply directly on the surface — no
                    bubble, no border. Only the visitor's turn is enclosed, so
                    the two speakers are told apart by containment rather than
                    by two competing bubble colours. */}
                    {m.steps && m.thoughtSecs && (
                      <ThoughtTrace
                        secs={m.thoughtSecs}
                        steps={m.steps}
                        accent={accent}
                        neutral={neutral}
                        streaming={streaming && i === convo.length - 1}
                      />
                    )}
                    <div
                      className={
                        theme.aiBubble
                          ? "w-fit max-w-[90%] whitespace-pre-wrap rounded-[12px] rounded-bl-[4px] border px-3.5 py-2 text-[14px] leading-relaxed transition-shadow duration-200 group-hover:shadow-[var(--ds-shadow-sm)]"
                          : "w-full text-[14px] leading-relaxed"
                      }
                      style={theme.aiBubble ? aiBubble : { color: neutral.ink }}
                    >
                      <RichText
                        text={m.text}
                        neutral={neutral}
                        instant={i < historyLen}
                      />
                    </div>
                    {m.buttons &&
                      m.buttons.length > 0 &&
                      i !== streamingIdx && (
                        /* Configured buttons belong to the message, so they stay with
                     it. Pulled out 6px because a fully rounded chip reads as
                     starting later than its box does — the cap curves away from
                     the text edge above it. */
                        <div
                          className="mt-2 -ml-1.5 flex flex-wrap gap-2 transition-opacity duration-200"
                          style={{
                            /* The entrance fade has to be dropped once a choice is
                         made. It fills forwards, and a filling animation beats
                         a plain declaration — so its `to { opacity: 1 }` was
                         quietly overriding the dim below and nothing happened. */
                            animation: picked[i]
                              ? undefined
                              : "fade-in 220ms ease-out both",
                            opacity: picked[i] ? 0.65 : 1,
                          }}
                        >
                          {m.buttons.map((b) => (
                            <button
                              key={b}
                              disabled={!!picked[i]}
                              onClick={() => {
                                setPicked((prev) => ({ ...prev, [i]: b }));
                                send(b);
                              }}
                              className="starter-chip shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[14px] transition-[background-color,box-shadow] duration-200 ease-out"
                              style={{
                                color: theme.bubbleInk,
                                backgroundColor: theme.bubbleFill,
                                ["--chip-stroke" as string]: `color-mix(in srgb, ${accent} 45%, transparent)`,
                                // the one taken holds the hover outline for good
                                boxShadow:
                                  picked[i] === b
                                    ? `inset 0 0 0 1px color-mix(in srgb, ${accent} 45%, transparent)`
                                    : undefined,
                              }}
                            >
                              {b}
                            </button>
                          ))}
                        </div>
                      )}
                    {i !== streamingIdx && (
                      <div
                        className="w-full"
                        style={{ animation: "fade-in 220ms ease-out both" }}
                      >
                        <AiToolbar
                          time="10:24 AM"
                          neutral={neutral}
                          sources={m.sources}
                        />
                      </div>
                    )}
                  </div>
                )}
              </Fragment>
            ))}

            {/* thinking indicator — sparkle + cycling shimmer phrase */}
            {thinking && (
              <div style={{ animation: "fade-in 200ms ease-out both" }}>
                <AiThinking accent={accent} />
              </div>
            )}
          </div>
          {quickReplies && quickReplies.length > 0 && (
            /* Last in the thread, inside the scroll area, so it travels with the
             conversation instead of hovering over it. Look back through a long
             exchange and the suggestions go with the turn that prompted them —
             which is what they are: an offer made at a point in the
             conversation, not a permanent control.

             Capped and wrapping: 580 centred, 360 docked to an edge — the two
             panel widths these were drawn for. Ranged right, because pressing
             one sends it as the visitor's own message. */
            <div
              /* mb-3 carries the gap itself rather than leaning on the notice
                 below it: with the disclaimer switched off that layer collapses,
                 and the chips were left sitting on the composer's edge. */
              /* mt-auto, not a bottom-aligned thread. The messages keep their
               place at the top; only this block is pushed to the foot of the
               scroll area, so on a short conversation it sits by the composer
               where it always did. Once the thread is taller than the panel
               there is no spare room to absorb, mt-auto stops doing anything,
               and the block scrolls with the turn that produced it. */
              /* pt-3 rather than a top margin: the block sits outside the message
               list, so the list's own gap never reaches it, and mt-auto is
               already using the margin to push it down. */
              className="mb-3 ml-auto mt-auto flex flex-wrap justify-end gap-2 pt-3"
              style={{ maxWidth: replyCap }}
            >
              {quickReplies.map((b, i) => (
                <button
                  key={b}
                  onClick={() => send(b)}
                  className="starter-chip shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[14px] transition-[background-color,box-shadow] duration-200 ease-out"
                  style={{
                    color: theme.bubbleInk,
                    backgroundColor: theme.bubbleFill,
                    ["--chip-stroke" as string]: `color-mix(in srgb, ${accent} 45%, transparent)`,
                    /* The step is the whole run divided by the set, so three
                       arrive in the same time four would — the sequence keeps its
                       length instead of growing with the number of options. */
                    animation: `reply-in 260ms cubic-bezier(0.16, 1, 0.3, 1) ${
                      (i * REPLY_RUN_MS) / Math.max(quickReplies.length, 1)
                    }ms both`,
                  }}
                >
                  {b}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* composer — ported from the DS Message Composer, brand-themed */}
      {/* pb-5 rather than pb-3: the disclaimer and branding lines used to
         cushion the field, so with both off it sat 12px from the edge and
         read as falling out of the panel. A constant 20px holds whatever
         is toggled above it. */}
      {/* Hidden on the archive: there is nothing to type into a list. Height
          rather than display, so the panel keeps its size and the screens slide
          across a frame that is not also resizing under them. */}
      <div
        className="px-4 pb-5 pt-1 transition-opacity"
        style={{
          opacity: view === "history" ? 0 : 1,
          pointerEvents: view === "history" ? "none" : undefined,
          transitionDuration: `${VIEW_SLIDE_MS}ms`,
        }}
      >
        <style>{`
          /* The ring is on at rest now, not only under the pointer, so a
             suggestion looks like something you can press before you have
             touched it. Inset, so it costs no layout; and any drop shadow the
             chip carries rides alongside it in --chip-shadow rather than being
             replaced by the hover rule, which is what used to make the button
             launcher's chips lose their shadow the moment you pointed at one. */
          .starter-chip {
            box-shadow: var(--chip-shadow, 0 0 #0000);
          }
          .starter-chip:hover {
            box-shadow: inset 0 0 0 1.5px var(--chip-stroke), var(--chip-shadow, 0 0 #0000);
          }
          /* Each suggestion rises a little as it fades, and they arrive in
             order rather than as a block. A set appearing all at once reads as
             a panel switching state; one after another reads as the agent
             offering them, which is what it is. */
          @keyframes reply-in {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .pill-field textarea::placeholder { color: var(--ph); }
          /* The header's controls hover exactly as the agent's action items do:
             the same grey behind, the same ink in front. It needs !important
             for the same reason that rule does: the resting colour is an inline
             style, which a class cannot otherwise beat. */
          .hdr-action:hover {
            background: var(--act-hover);
            color: var(--act-ink) !important;
          }
          .ai-actions button:hover {
            background: var(--act-hover);
            color: var(--act-ink) !important;
          }
          .dsc-field { box-shadow: 0 0 0 0 transparent; }
          .dsc-field:focus-within {
            border-color: var(--acc) !important;
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--acc) 18%, transparent);
          }
        `}</style>
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-1.5">
          {/* The notice and the field share one surface rather than stacking
              two. Floating above it, the notice reads as a separate thing that
              happens to be nearby; inside the same box it reads as a condition
              on the control it sits with — which is what it is. */}
          {/* The grey is a layer behind, not a box around. It stops half way
              down the field, so the composer sits over its bottom edge and the
              lower half reads as being on the panel itself. Wrapping the whole
              composer made the surface taller than anything in it needed.

              Absolutely positioned so it can end short without the field
              leaving the flow — a negative margin would have pulled everything
              below it up by the same amount. */}
          <div className="relative">
            {(showNotice || brandingOn) && !theme.bareNotice && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 rounded-[12px]"
                style={{ bottom: FIELD_H / 2, background: neutral.paper }}
              />
            )}
            <div
              className={showNotice || brandingOn ? "relative pt-2" : undefined}
            >
              {/* One notice for every theme. The text behaves the same way
                throughout — one line, ellipsis, the rest on hover — because a
                disclaimer running to three lines is the largest block on the
                panel whatever surface it sits on, and it outweighs the
                conversation it is qualifying.

                What still differs is the enclosure: Light states it bare, as a
                line of small print with nothing behind it and nothing to
                dismiss; the others keep the grey card and its X. */}
              {/* Nothing goes below the composer. Both of these used to: the
                  branding sat under the field, which is the most cluttered strip
                  of the panel and the first thing to look cheap on a phone.

                  They share one row instead of stacking, which is what makes
                  "both switched on" work — the disclaimer takes the width it
                  needs and the branding sits at the end of the same line, so two
                  notices cost the height of one. It is also why the disclaimer
                  had to be a single line with the rest on hover: a wrapping one
                  could not share a row with anything. */}
              {(showNotice || brandingOn) && (
                /* `relative` and a settled height: with both features on the two
                   notices swap in the same strip, and one of them is taken out
                   of flow while it waits. Without a fixed height the composer
                   would jog up and down on every keystroke. */
                <div
                  className="relative flex items-start gap-2 px-4 pb-2 pt-0.5"
                  style={
                    showNotice && brandingOn ? { minHeight: 22 } : undefined
                  }
                >
                  {/* Light centres its line; the boxed themes keep it ranged
                    left. Centred text inside a card that also carries a dismiss
                    control on one side never looks centred — it reads as offset
                    by whatever the X leaves behind. Bare, with nothing else on
                    the row, there is nothing to be off from. */}
                  <div
                    className={`group/notice relative flex min-w-0 flex-1 items-baseline gap-1 transition-all duration-200 ${
                      showNotice ? "" : "hidden"
                    } ${
                      theme.bareNotice && (!brandingOn || conversing)
                        ? "justify-center"
                        : ""
                    }`}
                    /* Out of flow while it waits. Left in the row at zero
                       opacity it still held its flex slot, which is what was
                       pushing the credit off to the right instead of letting it
                       centre — an invisible element taking up half the strip. */
                    style={
                      brandingOn
                        ? {
                            opacity: conversing ? 1 : 0,
                            transform: conversing ? "none" : "translateY(3px)",
                            pointerEvents: conversing ? undefined : "none",
                            position: conversing ? undefined : "absolute",
                            insetInline: conversing ? undefined : 16,
                          }
                        : undefined
                    }
                  >
                    <p
                      ref={noticeRef}
                      className={`min-w-0 truncate text-[12px] leading-snug ${
                        theme.bareNotice ? "text-center" : "flex-1"
                      }`}
                      style={{ color: neutral.secondary }}
                    >
                      {noticeLead && (
                        <span className="font-semibold">{noticeLead}</span>
                      )}
                      {noticeProse}
                    </p>
                    {/* held out of the truncation: cut off with the prose the
                      link would be unreachable, and it is the one part of a
                      disclaimer that has to stay clickable */}
                    {noticeLink && (
                      <a
                        href={href(noticeLink[2])}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 text-[12px] leading-snug underline underline-offset-2"
                        style={{ color: neutral.ink }}
                      >
                        {noticeLink[1]}
                      </a>
                    )}
                    {/* only when there is more to read — a tooltip repeating a
                      line already fully visible is noise */}
                    {noticeCut && (
                      <span
                        role="tooltip"
                        className="pointer-events-none absolute bottom-full left-0 z-30 mb-1.5 max-w-[280px] rounded-md bg-[#333] px-2 py-1.5 text-[11px] leading-snug text-white opacity-0 shadow-md transition-opacity group-hover/notice:opacity-100"
                      >
                        {noticeFull}
                      </span>
                    )}
                  </div>
                  {brandingOn && (
                    /* Only while the field is empty. The strip holds one notice
                       at a time and lets the visitor decide which: idle it is
                       the credit, and the moment there is something to send it
                       becomes the disclaimer. Neither is ever cramped, because
                       they are never both there — and each lands when it is
                       relevant. A credit is fine to read while idle; a warning
                       about AI output means most at the moment someone is about
                       to send something to an AI. */
                    <span
                      className="flex flex-1 items-center justify-center gap-1 text-[11px] transition-all duration-200"
                      style={{
                        /* secondary, not muted. Muted is the palette's lightest
                           text — right for a hint beside a control, too light
                           for a mark with four bars and gaps between them, which
                           closes to a grey smudge before the words beside it are
                           even hard to read. Same weight as the disclaimer it
                           swaps with, so the strip does not change value as the
                           two trade places. */
                        color: neutral.secondary,
                        opacity: conversing && showNotice ? 0 : 1,
                        transform:
                          conversing && showNotice
                            ? "translateY(-3px)"
                            : "none",
                        pointerEvents:
                          conversing && showNotice ? "none" : undefined,
                        position:
                          conversing && showNotice ? "absolute" : undefined,
                        insetInline: conversing && showNotice ? 16 : undefined,
                      }}
                    >
                      <TarsMark className="size-3.5" />
                      Powered by <span className="font-semibold">Tars</span>
                    </span>
                  )}
                  {showNotice && !theme.bareNotice && (
                    <button
                      onClick={() => setNoticeOpen(false)}
                      aria-label="Dismiss notice"
                      className="-mr-1 grid size-5 shrink-0 place-items-center rounded-md transition-opacity hover:opacity-70"
                      style={{ color: neutral.muted }}
                    >
                      <X className="size-3.5" strokeWidth={2} />
                    </button>
                  )}
                </div>
              )}
              {theme.pillComposer ? (
                /* Paper's composer: a white pill with a hairline in the accent's
               lighter partner, and the two controls as discs at either end.
               Rendered separately rather than branched into the bubble
               composer — the two disagree on shape, padding and control size,
               and interleaving them would obscure both. */
                <div
                  className="pill-field flex w-full items-center rounded-full"
                  style={{
                    background: neutral.surface,
                    boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${liteOf(accent)} 55%, transparent)`,
                    padding: 8,
                    minHeight: 64,
                    ["--ph" as string]: neutral.secondary,
                  }}
                >
                  <button
                    className="grid size-11 shrink-0 place-items-center rounded-full transition-opacity hover:opacity-80"
                    style={{ background: neutral.paper, color: neutral.ink }}
                    aria-label="Add attachment"
                  >
                    <Plus className="size-5" strokeWidth={1.5} />
                  </button>
                  <textarea
                    ref={taRef}
                    rows={1}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send(draft);
                      }
                    }}
                    placeholder={placeholder}
                    className="block min-w-0 flex-1 resize-none bg-transparent px-3 text-[14px] font-light leading-[1.5] tracking-[0.01em] outline-none"
                    style={{
                      color: neutral.ink,
                      maxHeight: 140,
                      overflowY: "auto",
                    }}
                  />
                  {/* the disc holds a mic until there is something to send */}
                  {hasInput ? (
                    <button
                      onClick={() => send(draft)}
                      disabled={thinking}
                      aria-label="Send message"
                      className="grid size-11 shrink-0 place-items-center rounded-full text-white transition-opacity disabled:opacity-40"
                      style={{ background: accent }}
                    >
                      <ArrowUp className="size-6" strokeWidth={1.75} />
                    </button>
                  ) : (
                    <button
                      aria-label="Voice input"
                      className="grid size-11 shrink-0 place-items-center rounded-full transition-opacity hover:opacity-80"
                      style={{ background: neutral.paper, color: neutral.ink }}
                    >
                      <Mic className="size-5" strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              ) : theme.stackedComposer ? (
                <div
                  className="flex w-full flex-col rounded-[12px] border p-2"
                  style={{
                    background: neutral.surface,
                    borderColor: theme.bubbleBorder,
                    borderWidth: 1.5,
                  }}
                >
                  <textarea
                    ref={taRef}
                    rows={1}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send(draft);
                      }
                    }}
                    placeholder={placeholder}
                    className="block w-full resize-none bg-transparent px-2 pb-2 pt-1.5 text-[14px] leading-[1.5] tracking-tight outline-none placeholder:text-[#979797]"
                    style={{
                      color: neutral.ink,
                      maxHeight: 140,
                      overflowY: "auto",
                      boxSizing: "border-box",
                    }}
                  />
                  <div className="flex items-center">
                    <button
                      className={`flex ${ctlSize} shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80`}
                      style={{ background: neutral.paper, color: neutral.ink }}
                      aria-label="Add attachment"
                    >
                      <Plus className={ctlIcon} strokeWidth={1.5} />
                    </button>
                    {/* the same slot the send button takes over once there is
                    something to send — a colour change, not a move */}
                    {hasInput ? (
                      <button
                        onClick={() => send(draft)}
                        disabled={thinking}
                        aria-label="Send message"
                        className={`ml-auto flex ${ctlSize} shrink-0 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-40`}
                        style={{ background: accent }}
                      >
                        <ArrowUp className={ctlIcon} strokeWidth={2} />
                      </button>
                    ) : (
                      <button
                        aria-label="Voice input"
                        className={`ml-auto flex ${ctlSize} shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80`}
                        style={{
                          background: neutral.paper,
                          color: neutral.ink,
                        }}
                      >
                        <Mic className={ctlIcon} strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  /* dsc-field carries the focus ring, so the outlined variant simply
                 doesn't take the class — the standing stroke is the state. */
                  className={`${theme.outlineComposer ? "" : "dsc-field"} flex w-full rounded-[12px] border transition-all duration-200 ${
                    isMultiline
                      ? "flex-wrap items-end gap-x-1.5 gap-y-1 px-2 py-1.5"
                      : theme.outlineComposer
                        ? "items-center gap-1.5 px-2"
                        : "items-end gap-1.5 px-2 py-2"
                  }`}
                  style={{
                    /* Filled with the surface, not left transparent: the notice
                   layer sits behind the composer, and a see-through field let
                   that grey read straight through so the two became one shape.

                   Surface for every theme here. Warm used to take `paper`, its
                   beige, which put the field the same colour as the notice
                   behind it and as the agent's own bubbles — the one control
                   you type into read as another panel. White separates it from
                   both. `surface` rather than a literal white so dark mode
                   fills with its own panel colour instead of glaring. */
                    background: neutral.surface,
                    borderColor: theme.accentStroke
                      ? theme.bubbleBorder
                      : neutral.line,
                    borderWidth: theme.outlineComposer ? 1.5 : 1,
                    ...(theme.outlineComposer && !isMultiline
                      ? { height: 54 }
                      : null),
                    ["--acc" as string]: accent,
                    ["--ctl-hover" as string]: neutral.paper,
                  }}
                >
                  <button
                    /* Hover from the theme, not a fixed beige: on the now-white
                   field that literal read as a stain rather than a highlight,
                   and it was invisible in dark mode. */
                    className={`flex ${ctlSize} shrink-0 items-center justify-center rounded-[6px] transition-colors hover:bg-[var(--ctl-hover)] ${
                      isMultiline ? "order-2 mr-auto" : ""
                    }`}
                    style={{ color: neutral.secondary }}
                    aria-label="Add attachment"
                  >
                    <Plus className={ctlIcon} strokeWidth={1.5} />
                  </button>
                  <textarea
                    ref={taRef}
                    rows={1}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send(draft);
                      }
                    }}
                    placeholder={placeholder}
                    /* On the outlined variant the field has a fixed height, so the
                   textarea carries no padding of its own and is centred as a
                   flex item — its box is then the line of text itself, which is
                   what the icons either side are centred against. */
                    className={`block min-w-0 resize-none bg-transparent text-[14px] leading-[1.5] tracking-tight outline-none placeholder:text-[#979797] ${
                      isMultiline
                        ? "order-1 w-full basis-full py-1"
                        : theme.outlineComposer
                          ? "flex-1 self-center py-0"
                          : "flex-1 py-[5px]"
                    }`}
                    style={{
                      color: neutral.ink,
                      maxHeight: 140,
                      overflowY: "auto",
                      boxSizing: "border-box",
                    }}
                  />
                  {/* One control, not two. It holds a mic until there is something
                  to send and becomes the send button the moment there is —
                  which is what the pill composer already does, and what the
                  real composer does on every width. A permanently disabled
                  send sitting beside a mic was two affordances competing for
                  the same corner, one of them inert most of the time. */}
                  {hasInput ? (
                    <button
                      onClick={() => send(draft)}
                      disabled={thinking}
                      aria-label="Send message"
                      className={`flex ${ctlSize} shrink-0 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-40 ${
                        isMultiline ? "order-3" : ""
                      }`}
                      style={{ background: accent }}
                    >
                      <ArrowUp className={ctlIcon} strokeWidth={2} />
                    </button>
                  ) : (
                    <button
                      /* A filled disc like the launcher's, and round rather than a
                     squircle: this is the same slot the send button takes over,
                     so the swap should be a change of colour, not of shape.
                     Hover moves opacity rather than swapping to a fixed beige,
                     which was wrong on the dark palettes. */
                      className={`flex ${ctlSize} shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80 ${
                        isMultiline ? "order-3" : ""
                      }`}
                      style={{ background: neutral.paper, color: neutral.ink }}
                      aria-label="Voice input"
                    >
                      <Mic className={ctlIcon} strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
/* ──────────────────────── Launcher preview ──────────────────────── */

/* A neutral drop under a coloured button is what makes it look pasted on: the
   light and the object disagree about what colour the thing is. The key shadow
   is tinted with the accent and thrown further, and a tight neutral one sits
   under it for contact — that pairing is what reads as resting on the page
   rather than floating over it.

   Written as a function because the raised state is not the same shadow scaled:
   it travels further and softens, the way a real one does when an object lifts. */
const buttonShadow = (accent: string, raised: boolean) =>
  raised
    ? `0 16px 34px -10px ${accent}59, 0 3px 8px -2px rgba(15,17,26,0.16), inset 0 1px 0 rgba(255,255,255,0.26)`
    : `0 10px 24px -8px ${accent}47, 0 2px 5px -1px rgba(15,17,26,0.12), inset 0 1px 0 rgba(255,255,255,0.26)`;

/* ─── launcher styles ────────────────────────────────────────────────────
   One list replacing the old Shape control, because each of these already
   implies its shape: a chip is a chip, a disc is a disc. Two pickers where the
   second is mostly determined by the first is a choice nobody wants to make.

   Shape and style are separate because they answer different questions. Shape
   is the outline the button cuts on the page; style is what its surface is made
   of. Folded together, "soft square" and "soft circle" were two entries for one
   surface, and a chip could only ever be white — every new surface would have
   needed a chip twin to go with it. */
type ButtonShape = "square" | "circle" | "chip";

type LauncherStyle = "fill" | "outlined" | "glass" | "haloed";

const LAUNCHER_STYLES: { key: LauncherStyle; label: string; hint: string }[] = [
  { key: "fill", label: "Fill", hint: "Your accent, flat" },
  {
    key: "outlined",
    label: "Outlined",
    hint: "Hairline only, lets the page through",
  },
  { key: "glass", label: "Glass", hint: "Frosted, picks up what is behind it" },
  {
    key: "haloed",
    label: "Haloed",
    hint: "Fill, with a breathing ring around it",
  },
];

/* Everything the preview needs to draw one, in one place — so a new style is a
   row here rather than another branch scattered through the markup. */
function styleSpec(style: LauncherStyle, accent: string, accentLite: string) {
  const lift =
    "0 16px 34px -10px rgba(15,17,26,0.26), 0 3px 8px rgba(15,17,26,0.12)";
  const rest =
    "0 10px 26px -10px rgba(15,17,26,0.20), 0 2px 5px rgba(15,17,26,0.08)";
  /* The accent as given, not a ramp built from it. A gradient reads as a
     surface catching light, which is the right call for glass and was the right
     call while this style was called Soft — but a flat fill is the tenant's
     colour exactly as they specified it, and that is worth more on the one
     element every visitor sees. */
  const accentFill = accent;

  switch (style) {
    case "outlined":
      return {
        background: "rgba(255,255,255,0.92)",
        color: accent,
        shadow: `inset 0 0 0 1.5px ${accent}59, 0 8px 22px -10px rgba(15,17,26,0.18)`,
        lift: `inset 0 0 0 1.5px ${accent}, 0 14px 30px -10px rgba(15,17,26,0.24)`,
      };
    case "glass": {
      /* Tinted glass, not white frost. The old version was 86% white with a
         trace of accent behind it, which is a frosted window — it takes its
         colour from whatever is behind it and has none of its own. This is a
         coloured body you can see through: the accent itself at partial alpha,
         lighter at the top corner where the light lands.

         The depth comes from three inset layers, and they are doing different
         jobs. A bright hairline along the top edge is the lit rim. A broad
         white glow falling from that edge is the light entering the material.
         A faint ring all round keeps the silhouette when neither of those is
         near. Together they read as a solid you can see into rather than a
         translucent rectangle. */
      const bed =
        `linear-gradient(152deg in oklab, ` +
        `color-mix(in oklab, ${accentLite} 72%, transparent) 0%, ` +
        `color-mix(in oklab, ${accent} 82%, transparent) 58%, ` +
        `color-mix(in oklab, ${accent} 66%, transparent) 100%)`;
      const inner =
        "inset 0 1px 0 rgba(255,255,255,0.62), " +
        "inset 0 0 0 1px rgba(255,255,255,0.26), " +
        "inset 0 12px 24px -12px rgba(255,255,255,0.55)";
      return {
        background: bed,
        color: "#FFFFFF",
        shadow: `${inner}, 0 10px 26px -8px ${accent}4D, 0 2px 6px rgba(15,17,26,0.10)`,
        lift: `${inner}, 0 18px 36px -10px ${accent}5E, 0 3px 8px rgba(15,17,26,0.14)`,
        blur: true,
        sheen: true,
      };
    }
    case "haloed":
      return {
        background: accentFill,
        color: "#FFFFFF",
        shadow: buttonShadow(accent, false),
        lift: buttonShadow(accent, true),
        halo: true,
        sheen: true,
      };
    default:
      return {
        background: accentFill,
        color: "#FFFFFF",
        shadow: buttonShadow(accent, false),
        lift: buttonShadow(accent, true),
        sheen: true,
      };
  }
}

/* the chip and the suggestion chips are white, so they take a neutral shadow —
   an accent-tinted one under white reads as a colour cast, not as light */
const BUTTON_SHADOW =
  "0 10px 26px -10px rgba(15,17,26,0.20), 0 2px 5px rgba(15,17,26,0.08)";

/* ─── suggestions above a button launcher ────────────────────────────────
   A short stack that sits there, rather than prompts flying up past the corner
   one at a time. The travelling version reads as a demo of itself: it is always
   moving, so it always asks to be watched, and a visitor who wants the third
   option has to wait for it to come round again. Nothing accumulating was the
   point of it, but with three suggestions there is nothing to accumulate.

   Ranged to the button's own side and hugging their text, so the column stays
   inside the corner the launcher occupies. */
function ButtonSuggestions({
  prompts,
  side,
  show,
  greeting,
  fill,
  ink,
  stroke,
  onOpen,
  onStart,
  children,
}: {
  prompts: string[];
  side: "left" | "right";
  show: boolean;
  /* the conversation's own opening line, or null when it is switched off —
     the same text the messenger starts with, so the two cannot disagree */
  greeting: string | null;
  /* the accent trio off the OKLCH engine, not mixed here — see deriveShades */
  fill: string;
  ink: string;
  stroke: string;
  onOpen: () => void;
  onStart: (text: string) => void;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`flex flex-col gap-2 ${side === "left" ? "items-start" : "items-end"}`}
    >
      {show && greeting && (
        /* Pressing it opens the conversation rather than sending anything: it
           is the agent talking, not something the visitor could say. Held to a
           narrow measure so it reads as a remark beside the button and not as a
           panel that has already opened. */
        <button
          type="button"
          onClick={onOpen}
          className={`mb-2 max-w-[260px] rounded-2xl px-4 py-3 text-left text-[14px] leading-snug transition-transform hover:scale-[1.02] ${
            side === "left" ? "rounded-bl-md" : "rounded-br-md"
          }`}
          /* The chips' fill, not white. The greeting and the suggestions are one
             offer in two parts — the agent speaking and the things you can say
             back — and a white bubble above tinted chips read as two separate
             widgets that happened to stack. */
          style={{
            background: fill,
            color: ink,
            boxShadow: BUTTON_SHADOW,
            animation: "reply-in 260ms cubic-bezier(0.16, 1, 0.3, 1) both",
          }}
        >
          {greeting}
        </button>
      )}

      {show && prompts.length > 0 && (
        <span
          className={`mb-1 flex flex-col gap-2 ${
            side === "left" ? "items-start" : "items-end"
          }`}
        >
          {prompts.map((p, i) => (
            <button
              key={p}
              type="button"
              onClick={() => onStart(p)}
              /* identical to the composer's suggestions — same padding, radius,
                 size and accent-derived colours; width hugs the text */
              className="starter-chip w-max shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[14px] transition-[background-color,box-shadow] duration-200 ease-out"
              style={{
                color: ink,
                backgroundColor: fill,
                ["--chip-stroke" as string]: stroke,
                ["--chip-shadow" as string]: BUTTON_SHADOW,
                /* the same arrival the messenger's suggestions use, so the two
                   places a visitor meets them behave alike */
                animation: `reply-in 260ms cubic-bezier(0.16, 1, 0.3, 1) ${
                  (greeting ? REPLY_RUN_MS / 2 : 0) +
                  (i * REPLY_RUN_MS) / Math.max(prompts.length, 1)
                }ms both`,
              }}
            >
              {p}
            </button>
          ))}
        </span>
      )}
      {children}
    </span>
  );
}

function LauncherPreview({
  accent,
  theme,
  settings: s,
  siteUrl,
  device,
  name,
  subtitle,
  disclaimer,
  disclaimerOn,
  brandingOn,
  avatar,
  logoOnly,
  session,
}: {
  accent: string;
  theme: ReturnType<typeof useTheme>;
  settings: LauncherSettings;
  siteUrl: string;
  device: Device;
  /* who is arriving — a first-timer or someone coming back, and how long they
     were gone. Drives the resting launcher and what the panel opens on. */
  session: SessionState;
  name: string;
  subtitle: string;
  disclaimer: string;
  disclaimerOn: boolean;
  brandingOn: boolean;
  avatar: string | null;
  logoOnly: boolean;
}) {
  const isMobile = device === "mobile";
  // launcher embeds on a real site — wider than the chatbot panel
  /* Desktop fills whatever the canvas gives it, so the 20px padding around it
     is the only gap. Tablet and mobile keep their literal widths — those are
     simulating a device, not filling the panel. */
  const fills = device === "desktop";
  const frameRef = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState({ w: 1000, h: 680 });
  useEffect(() => {
    const el = frameRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      const r = entry.contentRect;
      setMeasured({ w: Math.round(r.width), h: Math.round(r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const siteWidth = fills
    ? measured.w
    : { desktop: 1000, tablet: 580, mobile: 380 }[device];
  const isComposer = s.type === "composer";

  /* Every state that has a thread behind it. What separates them is not the
     conversation — it is the same one — but how loudly the launcher is
     entitled to say so. */
  const unread = session === "unread";
  /* The one resuming state that takes the field's line rather than waiting in
     the chip row. They left the site and came back, so unlike someone who just
     closed it on this page they may genuinely not remember there is a thread —
     and unlike someone a page on, there is no new page competing for the same
     line. Nothing else here has a better claim on it. */
  const justLeft = session === "live";
  const hasDraft = session === "draft";
  const resuming = justLeft || hasDraft;
  /* Every state with a thread to go back to, which is a wider set than the
     ones whose resting launcher is changed by it. "Earlier today" rests like a
     first visit and still has a conversation waiting, and without a chip its
     only way back would be catching the greeting mid-rotation — a door that is
     open for four seconds at a time is not a door. */
  const offersThread = resuming || session === "warm";
  /* The dot marks a launcher with something behind it — a thread waiting, or
     a message the visitor has not read. */

  /* With no page switcher the preview otherwise sits on the site root, so the
     contextual suggestions resolve to the fallback set. Page rules still save and
     still apply in the product; they just cannot be exercised from here. */
  const activePath = "/";
  /* Memoised because the rising prompts time off it: a fresh array each render
     would clear and restart the emission timer on every parent update, so
     nothing would ever be emitted. */

  /* ── snapshot of the customer's own site, one per page ──
     Debounced: each distinct URL is a fresh render on the capture service, so
     firing one per keystroke would mean ~35 captures to type one address. */
  const [committedUrl, setCommittedUrl] = useState(siteUrl);
  useEffect(() => {
    const id = setTimeout(() => setCommittedUrl(siteUrl), 700);
    return () => clearTimeout(id);
  }, [siteUrl]);

  const trimmed = committedUrl.trim();

  /* Generated suggestions replace the fallback rather than sharing slots with
     it — the same rule the product follows. */
  const prompts = useMemo(
    () => generatedFor(trimmed) ?? promptsFor(s, activePath),
    [trimmed, s, activePath],
  );
  const origin = trimmed
    ? /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`
    : "";
  const looksLikeUrl = !!origin && /\.[a-z]{2,}/i.test(origin);
  const [failedShots, setFailedShots] = useState<string[]>([]);
  const [loadedShots, setLoadedShots] = useState<string[]>([]);
  const localSite = looksLikeUrl ? localSiteFor(origin) : null;
  /* The frame is a viewport and the page scrolls inside it, so a shot taller
     than the frame is browsed rather than cropped or squeezed. */
  const frameHeight = fills ? measured.h : 680;
  const shot = looksLikeUrl && !localSite ? shotUrl(origin, activePath) : "";
  const showSite = !!shot && !failedShots.includes(shot);
  const shotReady = showSite && loadedShots.includes(shot);
  const host = looksLikeUrl
    ? origin.replace(/^https?:\/\//i, "").replace(/\/+$/, "")
    : "";

  // interactive: tap the launcher or a prompt to open the docked chat
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState<string | undefined>(undefined);
  /* Whether this opening picks the old thread up or starts a new one. Which
     of the two is not a property of the visitor's state — it is a property of
     what they just pressed, and the expanded launcher gives them one of each:
     the chip that says continue, and a field that says ask me anything. A
     field offering a blank sentence and then producing a conversation already
     in progress would be answering a different question from the one it
     asked. */
  const [fresh, setFresh] = useState(false);
  /* Resolved once, here, rather than at each of the three places the panel is
     rendered: they must agree about which thread is being opened, and three
     calls to seedFor is three chances for them not to. */
  const seeded = fresh ? null : seedFor(session);
  const opening = seeded ? resumeTurnFor(session) : null;
  /* Only when the panel is not already opening on a thread — the offer and the
     seed are two answers to the same question, and showing both would put
     yesterday's conversation above a copy of itself. */
  const lastChat = seeded ? null : lastChatFor(session);
  const openChat = (p?: string, startFresh = false) => {
    setPrompt(p);
    setFresh(startFresh);
    setOpen(true);
  };

  /* ── entrance: the launcher is absent until the delay elapses ──
     Replay re-arms it so you can feel the wait you just dialled in, and
     doubles as the user gesture browsers need before they'll play sound. */
  // identity of the current entrance run — any change re-arms the wait, so
  // `entered` falls back to false without an effect having to reset it
  const runKey = `${s.type}-${s.delay}-${s.soundOn}`;
  const [enteredKey, setEnteredKey] = useState<string | null>(null);
  const entered = enteredKey === runKey;

  useEffect(() => {
    const id = setTimeout(() => {
      setEnteredKey(runKey);
      if (s.soundOn) playChime();
    }, s.delay * 1000);
    return () => clearTimeout(id);
  }, [runKey, s.delay, s.soundOn]);

  /* the resting bar widens to show its prompts — scroll does this on the real
     site, which a static preview frame has no equivalent for, so hover does.
     Declared here because the typewriter below reads it: the two are one
     behaviour, the pill either cycles its suggestions or shows them. */
  const [barOpen, setBarOpen] = useState(false);

  /* ── typewriter placeholder (composer) ──
     Types a line, holds it for as long as its word count deserves, erases it
     and moves on. A single line is typed once and left. */
  /* One source, shown two ways. The chips and the placeholder are the same
     content — a list of things worth asking — so the pill cycles whatever
     contextual suggestions are live and only falls back to the typed lines
     when there are none. Configured placeholders are the cold start, not a
     second script that keeps reciting while the chips beside it move on. */
  const lines = useMemo(() => {
    const base = prompts.map((p) => p.trim()).filter(Boolean);
    /* First in the rotation, then out of the way. A returning visitor gets the
       greeting once as the field types it, and after that the same suggestions
       everyone else sees — which is the right shape for a state whose whole
       claim is that they were here a few hours ago, not that they are owed a
       banner for the rest of the visit. */
    return session === "warm" ? [welcomeBack(VISITOR_NAME), ...base] : base;
  }, [prompts, session]);
  /* The run is stamped with the lines it belongs to, so when the suggestions
     change underneath it the typewriter restarts at the first of the new set
     rather than carrying a half-typed word over from the old one. */
  const runStamp = lines.join(" ");
  const [tw, setTw] = useState({
    stamp: runStamp,
    idx: 0,
    typed: "",
    phase: "typing" as "typing" | "holding" | "erasing",
  });
  const cur = useMemo(
    () =>
      tw.stamp === runStamp
        ? tw
        : { stamp: runStamp, idx: 0, typed: "", phase: "typing" as const },
    [tw, runStamp],
  );
  /* True only while the greeting is the line being typed. The rotation is one
     span, so the colour has to follow the content through it: the suggestions
     are placeholder text and wear placeholder grey, and the greeting is the
     product speaking to someone by name, which is the accent's job. */
  const onGreeting =
    session === "warm" &&
    /* Hovered, the field is showing the placeholder rather than the rotation —
       the index still points at the greeting, but the greeting is not what is
       on screen, and the accent would be colouring the wrong words. */
    !barOpen &&
    lines[cur.idx] === welcomeBack(VISITOR_NAME);

  /* The field opens what it says. Pressed while it is showing the resume line,
     the greeting, an unread, or the visitor's own unsent draft, it picks the
     thread up — every one of those is a reference to a conversation that
     exists. Pressed while it is showing "ask me anything" or a suggestion
     cycling past, it starts a new one, because that is what it just offered.

     The thread is never lost either way: the states whose field starts fresh
     are the ones carrying a "Continue" chip beside it, and the archive is
     behind the back arrow regardless. */
  const fieldResumes =
    (justLeft && !barOpen) || onGreeting || hasDraft || unread;

  /* Stops once the pane is open: the chips are the same suggestions in a form
     you can click, so a line typing itself underneath is the same content
     competing with itself. */
  /* Warm and cold rest exactly as a first visit does: the difference between
     them is only what opens, and a launcher that advertised "you were here
     yesterday" would be telling the visitor something they did not ask about
     on a page they came to for another reason. Live and unread are the two
     that have something to say before they are clicked. */

  /* …and drops once the pane is open. Hovered, the thread is offered by the
     first chip in the row, and a dot over a field that has gone back to saying
     "ask me anything" is marking something the field is no longer saying. */
  const showDot = (resuming || unread) && !(justLeft && barOpen);

  const typing =
    isComposer &&
    entered &&
    !open &&
    !barOpen &&
    !unread &&
    !hasDraft &&
    !justLeft &&
    lines.length > 0;

  useEffect(() => {
    if (!typing) return;
    const full = lines[cur.idx % lines.length];

    if (cur.phase === "typing") {
      if (cur.typed.length === full.length) {
        const t = setTimeout(() => setTw({ ...cur, phase: "holding" }), 0);
        return () => clearTimeout(t);
      }
      const t = setTimeout(
        () => setTw({ ...cur, typed: full.slice(0, cur.typed.length + 1) }),
        TYPE_MS,
      );
      return () => clearTimeout(t);
    }

    if (cur.phase === "holding") {
      // cycling off, or a single line — it is typed once and left
      if (lines.length < 2) return;
      const t = setTimeout(
        () => setTw({ ...cur, phase: "erasing" }),
        holdFor(full),
      );
      return () => clearTimeout(t);
    }

    if (cur.typed.length === 0) {
      const t = setTimeout(
        () =>
          setTw({ ...cur, idx: (cur.idx + 1) % lines.length, phase: "typing" }),
        0,
      );
      return () => clearTimeout(t);
    }
    const t = setTimeout(
      () => setTw({ ...cur, typed: full.slice(0, cur.typed.length - 1) }),
      ERASE_MS,
    );
    return () => clearTimeout(t);
  }, [typing, cur, lines]);

  /* Open, the chips above the field already list the suggestions, so a frozen
     one repeated in the field is the same line twice. It reverts to being the
     label on an input — which is also what shows when there are no suggestions
     to cycle in the first place. */
  const placeholderText = hasDraft
    ? DRAFT
    : barOpen
      ? s.placeholder
      : unread
        ? INBOUND
        : !lines.length
          ? s.placeholder
          : cur.typed;

  /* ── geometry ── */
  /* On a phone the composer spans most of the width, so left and right land in
     nearly the same place and only read as off-centre — it is forced centre,
     which is what GlassComposer does on a phone too. The button is a small
     disc with room around it, so its corner still means something and it keeps
     the choice. */
  const centreOnPhone = isMobile && isComposer;
  const side = centreOnPhone
    ? "center"
    : isComposer
      ? s.placement
      : s.placement === "center"
        ? "right"
        : s.placement;
  const alignItems =
    side === "center" ? "center" : side === "left" ? "flex-start" : "flex-end";

  // 600 centred, 400 on an edge — GlassComposer's own GEOMETRY table
  const paneOpen = side === "center" ? V6.widthOpen : V6.widthEdge;
  const paneW = barOpen && prompts.length > 0 ? paneOpen : V6.widthShut;

  /* The composer is placed by a plain left offset in pixels rather than by
     anchoring to an edge and centring with translateX(-50%).

     That transform used to be transitioned along with the entrance, so
     changing placement animated it: switching to an edge left the -50% in
     flight, which at the left anchor starts the pane 170px outside the frame
     and slides it inward. Positioning in px makes every switch the same
     move — a straight slide across, symmetric, always on screen — and leaves
     transform to do nothing but the entrance. */
  const xFor = (w: number) =>
    side === "left"
      ? 12
      : side === "right"
        ? siteWidth - w - 12
        : Math.round((siteWidth - w) / 2);

  const pill = isMobile
    ? PILL_MOBILE
    : { height: V6.height, radius: V6.radius, pad: V6.pad, sendPx: V6.sendPx };

  /* Centred is wider, so it needs less height to hold the same conversation —
     GlassComposer's own table makes the same call. */
  /* Clamped to the frame it is docked in. Centred the panel wants 600, which
     is wider than the 580 a tablet gives it — so `xFor` handed it a negative
     left and it hung off the edge, reading as a full-bleed sheet rather than a
     panel on a page. 24 a side is the least that still looks docked. */
  const chatW = Math.min(side === "center" ? 600 : 380, siteWidth - 48);
  const chatH = Math.min(side === "center" ? 580 : 650, frameHeight - 48);

  const position: CSSProperties = centreOnPhone
    ? /* Full-width track, 24 up from the bottom; the pill is a fixed 300
         centred in it by the column's own alignment. Fixed rather than
         inset-derived so the launcher is the same size on every handset
         instead of growing with the screen. */
      { bottom: MOBILE.bottom, left: 0, right: 0 }
    : isComposer
      ? { bottom: 24, left: xFor(paneW) }
      : {
          bottom: s.offsetY,
          ...(side === "left" ? { left: s.offsetX } : { right: s.offsetX }),
        };

  // the launcher slides in from whichever edge it is pinned to — same offsets
  // the real composer uses, so the arrival reads the same
  const enterFrom =
    side === "center"
      ? "translateY(calc(100% + 32px))"
      : side === "left"
        ? "translateX(calc(-100% - 32px))"
        : "translateX(calc(100% + 32px))";
  const restTransform = "none";
  const enterTransform = enterFrom;

  /* Hover stroke. Mixing toward `transparent` is only an alpha change, so it
     doesn't suffer the greying that mixing toward white does — and at 1px the
     accent at 45% reads more definite over the tint than the engine's own
     border shade, which is tuned for a larger area. */
  const chipStroke = `color-mix(in srgb, ${accent} 45%, transparent)`;
  // the composer's travelling edge, derived rather than a second brand colour
  const accentLite = liteOf(accent);
  const spec = styleSpec(s.style, accent, accentLite);
  /* geometry, which is the shape's business rather than the style's */
  const isChip = s.shape === "chip";
  const radius = s.shape === "square" ? 18 : 999;

  const agentProps = {
    theme,
    name,
    subtitle,
    disclaimer,
    disclaimerOn,
    brandingOn,
    avatar,
    logoOnly,
    accent,
    placeholder: s.placeholder,
    suggestions: prompts,
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-[#E6E6E6] bg-white shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)]"
      ref={frameRef}
      style={
        fills
          ? { width: "100%", height: "100%" }
          : { width: siteWidth, height: frameHeight }
      }
    >
      {/* entrance + chip motion for the launcher */}
      <style>{`
        /* No ring at rest out here. On the customer's own page the chips are
           white objects with a shadow under them, and that shadow is already
           doing the separating — an accent outline on top of it is a second
           edge saying the same thing, and three of them in a corner turn into
           a stack of outlined boxes.

           The hover ring stays: inset, so it costs no layout, and it is the
           only thing distinguishing the one under the pointer.

           This is the launcher's rule only. Inside the messenger the chips sit
           on a panel with no shadow of their own, where the ring is the only
           edge they have. */
        .starter-chip {
          box-shadow: var(--chip-shadow, 0 0 #0000);
        }
        .starter-chip:hover {
          box-shadow: inset 0 0 0 1.5px var(--chip-stroke), var(--chip-shadow, 0 0 #0000);
        }
        @keyframes halo {
          0%   { box-shadow: 0 0 0 0 var(--halo); }
          70%  { box-shadow: 0 0 0 14px transparent; }
          100% { box-shadow: 0 0 0 0 transparent; }
        }
        .dsc-launcher:hover {
          transform: translateY(-2px);
          box-shadow: var(--lift-shadow);
        }
        /* The suggestions above a button launcher arrive on the same clock as
           the messenger's, so the two places a visitor meets them behave alike. */
        @keyframes reply-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* The entrance only — on close the panel unmounts, so nothing here
           runs. 0.97 was too shallow to read as growth; at 0.90, anchored to
           the corner the launcher sits in, the panel unfolds out of the pill
           instead of arriving in front of it. The curve is GlassComposer's own
           PANEL_EASE, which is what the GP launcher opens on. */
        /* left and width travel together so the box stays anchored where the
           pill was — centred it opens out both ways, on an edge it grows inward
           from the same margin. */
        @keyframes launcher-grow {
          from {
            left: var(--from-x);
            width: var(--from-w);
            height: var(--from-h);
          }
          to {
            left: var(--to-x);
            width: var(--to-w);
            height: var(--to-h);
          }
        }
        @keyframes launcher-open {
          from { opacity: 0; transform: translateY(10px) scale(0.90); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* ── the page the launcher sits on. The frame is the viewport; this
             scrolls inside it, so a full-page shot is browsed rather than
             cropped. Every overlay below sits outside it and stays put. ── */}
      <div className="absolute inset-0 overflow-y-auto overscroll-contain bg-white">
        {/* a shot renders at its natural height — that is what there is to scroll */}
        {localSite && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={localSite.src}
            src={localSite.src}
            alt=""
            className="relative z-[1] block w-full"
          />
        )}
        {showSite && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={shot}
              src={shot}
              alt=""
              onLoad={() =>
                setLoadedShots((l) => (l.includes(shot) ? l : [...l, shot]))
              }
              onError={() =>
                setFailedShots((f) => (f.includes(shot) ? f : [...f, shot]))
              }
              className="relative z-[1] block w-full bg-white transition-opacity duration-300"
              style={{ opacity: shotReady ? 1 : 0 }}
            />
            {!shotReady && (
              <span className="absolute left-1/2 top-4 z-[2] -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-[#8A8794] shadow-sm backdrop-blur">
                Capturing {host}
                {activePath === "/" ? "" : activePath}…
              </span>
            )}
          </>
        )}
        {/* the sample page — the base layer, so a slow or failed capture
            degrades to something rather than to nothing */}
        <div
          className={`absolute inset-x-0 top-0 min-h-full space-y-3 ${isMobile ? "p-5" : "p-8"}`}
        >
          <div className="h-5 w-40 rounded bg-[#EEEDF6]" />
          <div className="h-4 w-1/2 rounded bg-[#F1F0F7]" />
          <div
            className={`mt-8 grid gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-3"}`}
          >
            {(isMobile ? [0, 1] : [0, 1, 2]).map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-28 rounded-xl bg-[#F4F3F9]" />
                <div className="h-3 w-3/4 rounded bg-[#F1F0F7]" />
                <div className="h-3 w-1/2 rounded bg-[#F1F0F7]" />
              </div>
            ))}
          </div>
          <div className="mt-10 space-y-2.5">
            <div className="h-4 w-32 rounded bg-[#EEEDF6]" />
            <div className="h-3 w-full rounded bg-[#F1F0F7]" />
            <div className="h-3 w-[92%] rounded bg-[#F1F0F7]" />
            <div className="h-3 w-3/4 rounded bg-[#F1F0F7]" />
          </div>
        </div>
      </div>

      {open ? (
        /* ── opened chat — docked on the site (full-screen on mobile) ── */
        isMobile ? (
          <div
            className="absolute inset-0 z-10"
            style={{
              transformOrigin: "bottom center",
              animation:
                "launcher-open 280ms cubic-bezier(0.16, 1, 0.3, 1) both",
            }}
          >
            <AgentPreview
              seed={seeded}
              opening={opening}
              lastChat={lastChat}
              initialDraft={hasDraft ? DRAFT : undefined}
              key={prompt ?? "blank"}
              {...agentProps}
              device="mobile"
              width={siteWidth}
              height={frameHeight}
              initialPrompt={prompt}
              onClose={() => setOpen(false)}
            />
          </div>
        ) : isComposer ? (
          /* ── the pill growing into the window — GlassComposer's own move ──
             Not a panel arriving in front of the launcher but one surface
             changing size: the box starts at the pill's exact rect and grows to
             the window's, clipping the chat rather than scaling it. The first
             frame therefore shows the chat's own composer at the size and place
             the pill just occupied, and the conversation is uncovered above it.

             The shadow lives out here rather than on the chat, so one caster
             wraps whatever the silhouette currently is — GlassComposer keeps a
             separate "ghost" element for exactly this reason. Clipped to the
             box, the chat's own shadow never shows.

             Entrance only. Closing still unmounts this whole branch, untouched. */
          <div
            className="absolute z-10 flex items-end overflow-hidden"
            style={
              {
                bottom: 24,
                justifyContent:
                  side === "left"
                    ? "flex-start"
                    : side === "right"
                      ? "flex-end"
                      : "center",
                borderRadius: 32,
                boxShadow: "0 12px 40px -8px rgba(0,0,0,0.18)",
                animation:
                  "launcher-grow 280ms cubic-bezier(0.16, 1, 0.3, 1) both",
                "--from-x": `${xFor(V6.widthShut)}px`,
                "--to-x": `${xFor(chatW)}px`,
                "--from-w": `${V6.widthShut}px`,
                "--to-w": `${chatW}px`,
                "--from-h": `${pill.height}px`,
                "--to-h": `${chatH}px`,
              } as CSSProperties
            }
          >
            {/* Fixed at the final size so the chat lays out once and is then
                merely revealed — a chat re-flowing at every frame of the growth
                is what would make this stutter. */}
            <div style={{ width: chatW, height: chatH, flexShrink: 0 }}>
              <AgentPreview
                seed={seeded}
                opening={opening}
                lastChat={lastChat}
                initialDraft={hasDraft ? DRAFT : undefined}
                key={prompt ?? "blank"}
                {...agentProps}
                device="desktop"
                width={chatW}
                height={chatH}
                initialPrompt={prompt}
                onClose={() => setOpen(false)}
              />
            </div>
          </div>
        ) : (
          <div className="absolute z-10" style={position}>
            <div
              className="origin-bottom"
              style={{
                animation:
                  "launcher-open 280ms cubic-bezier(0.16, 1, 0.3, 1) both",
              }}
            >
              <AgentPreview
                seed={seeded}
                opening={opening}
                lastChat={lastChat}
                initialDraft={hasDraft ? DRAFT : undefined}
                key={prompt ?? "blank"}
                {...agentProps}
                device="desktop"
                width={380}
                height={Math.min(650, frameHeight - 48)}
                initialPrompt={prompt}
                onClose={() => setOpen(false)}
              />
            </div>
          </div>
        )
      ) : (
        /* ── the launcher itself ── */
        <div
          className="absolute z-10 flex flex-col gap-3"
          style={{
            ...position,
            alignItems,
            opacity: entered ? 1 : 0,
            transform: entered ? restTransform : enterTransform,
            transition: `left ${V6.panelMs}ms ${V6.panelEase}, transform 620ms cubic-bezier(0.25, 0.1, 0.25, 1), opacity 300ms ease-out`,
            pointerEvents: entered ? "auto" : "none",
          }}
        >
          {isComposer ? (
            /* v6 — a white pane that rests narrow and widens to offer its
               prompts. The chips live inside it rather than floating above. */
            <div
              onMouseEnter={() => setBarOpen(true)}
              onMouseLeave={() => setBarOpen(false)}
              className="relative overflow-hidden bg-white"
              style={{
                /* On a phone it holds one width in both states — there is
                   no room to widen into — so hover only reveals the prompts. */
                /* One source for the width, so the box and the offset that
                   centres it can never disagree — they did, and the launcher
                   sat 130px right of centre because it was placed as a 340
                   and drawn as a 600. */
                width: centreOnPhone ? MOBILE.width : paneW,
                maxWidth: "100%",
                borderRadius: pill.radius,
                boxShadow: V6.ring,
                transition: `width ${V6.panelMs}ms ${V6.panelEase}`,
              }}
            >
              {/* the travelling hairline — a conic sweep around the perimeter,
                  masked to the 2px border so only the edge lights up */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 z-10 overflow-hidden motion-reduce:hidden"
                style={{
                  borderRadius: "inherit",
                  padding: V6.ringPx,
                  WebkitMask:
                    "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                  WebkitMaskComposite: "xor",
                  mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                  maskComposite: "exclude",
                }}
              >
                <span
                  className="absolute left-1/2 top-1/2 aspect-square w-[150%] -translate-x-1/2 -translate-y-1/2 animate-spin"
                  style={{
                    background: `conic-gradient(${accentLite} 0deg, color-mix(in srgb, ${accentLite} 55%, transparent) 30deg, transparent 90deg, transparent 270deg, color-mix(in srgb, ${accentLite} 40%, transparent) 330deg, ${accentLite} 360deg)`,
                    animationDuration: `${V6.ringMs}ms`,
                    animationTimingFunction: "linear",
                  }}
                />
              </span>

              {/* prompts — revealed by the same gesture that widens the pane.
                  The row is pinned to the open width so the chips don't reflow
                  while it travels. */}
              <div
                className="grid"
                style={{
                  gridTemplateRows:
                    barOpen && prompts.length > 0 ? "1fr" : "0fr",
                  transition: `grid-template-rows ${V6.panelMs}ms ${V6.panelEase}`,
                }}
              >
                <div className="overflow-hidden">
                  <div
                    className="flex flex-wrap gap-2 px-3 pt-3 pb-2"
                    style={{ width: paneOpen }}
                  >
                    {/* The way back in, sitting among the things you can press
                        rather than on top of the field. It is one of the
                        choices, so it belongs in the row of choices; the field
                        goes on being a field, which is the whole premise of a
                        composer launcher and the thing a returning visitor
                        needs most, since most of them come back to ask
                        something new rather than to finish something old.

                        Outlined in the accent instead of filled like the
                        suggestions: same shape, visibly not the same kind of
                        thing. First, because it is the only one of these the
                        visitor has already started. */}
                    {offersThread && (
                      <button
                        onClick={() => openChat()}
                        /* The same chip as the suggestions beside it — same
                           class, same fill, same ink. The dot is the whole
                           difference, and it is enough: outlining it in the
                           accent as well made it read as a heading over the
                           row rather than as one of the things in it. */
                        className="starter-chip flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-[14px] transition-[background-color,box-shadow] duration-200 ease-out"
                        style={{
                          color: theme.bubbleInk,
                          backgroundColor: theme.bubbleFill,
                          ["--chip-stroke" as string]: chipStroke,
                        }}
                      >
                        <span
                          className="size-1.5 shrink-0 rounded-full"
                          style={{ background: accent }}
                        />
                        {RESUME_CHIP}
                      </button>
                    )}
                    {/* One fewer suggestion, not one more chip. The row is
                        sized to hold three across the open pane, and a fourth
                        wraps to a second line — which makes the pane taller for
                        the returning visitor than for anyone else, on a launcher
                        whose whole trick is that it is the same size at rest. */}
                    {(offersThread ? prompts.slice(0, -1) : prompts).map(
                      (p, i) => (
                        <button
                          key={`${activePath}-${i}-${p}`}
                          onClick={() => openChat(p)}
                          className="starter-chip shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[14px] transition-[background-color,box-shadow] duration-200 ease-out"
                          style={{
                            color: theme.bubbleInk,
                            backgroundColor: theme.bubbleFill,
                            ["--chip-stroke" as string]: chipStroke,
                          }}
                        >
                          {p}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </div>

              {/* the field row — no left slot, since v6 runs without the orb */}
              <button
                onClick={() => openChat(undefined, !fieldResumes)}
                className="relative flex w-full items-center text-left"
                style={{ height: pill.height, padding: pill.pad }}
              >
                {/* A dot, not a count. Out here the number is noise — there
                    is either something waiting or there is not, and the count
                    belongs inside, where the messages are. The returning
                    visitor gets the same mark for the same reason: it says
                    there is a live thread behind this, which is the one thing
                    a resting launcher cannot say in words without spending the
                    line it has. */}
                {showDot && (
                  <span
                    className="ml-3 size-2 shrink-0 rounded-full"
                    style={{ background: accent }}
                  />
                )}
                {justLeft && !barOpen ? (
                  /* Set as a label, not as a sentence: uppercase in the accent,
                     12 with tracking, regular weight. Capitals at body size and
                     body spacing read as shouting, and bold on top of capitals
                     and colour makes it the loudest thing on the page. Held
                     through the hover, because the thread is waiting whether or
                     not the visitor is pointing at the launcher. */
                  <span
                    className="min-w-0 flex-1 truncate px-3 text-[12px] font-normal uppercase tracking-[0.06em]"
                    style={{ color: accent }}
                  >
                    {RESUME_FIELD}
                  </span>
                ) : (
                  <span
                    className={`min-w-0 flex-1 truncate px-3 text-[14px] tracking-[0.01em] ${
                      unread || hasDraft ? "font-normal" : "font-light"
                    }`}
                    /* Ink, not placeholder grey, for the two cases where the
                     line is real text rather than a hint: an unread is
                     something the agent said, and a draft is something the
                     visitor typed. The draft is the one thing that genuinely
                     belongs in this slot — it is the visitor's own words, put
                     back exactly where they left them, which is the same
                     reason the agent's lines have to stay out of it. */
                    style={{
                      color: onGreeting
                        ? accent
                        : unread || hasDraft
                          ? V6.ink
                          : V6.inkMute,
                    }}
                  >
                    {placeholderText || " "}
                  </span>
                )}
                <span
                  className="flex shrink-0 items-center justify-center rounded-full"
                  style={{
                    width: pill.sendPx,
                    height: pill.sendPx,
                    backgroundColor: V6.disc,
                  }}
                >
                  <ArrowUp
                    className={isMobile ? "size-5" : "size-6"}
                    strokeWidth={1.75}
                    style={{ color: V6.ink }}
                  />
                </span>
              </button>
            </div>
          ) : (
            <ButtonSuggestions
              /* Nothing to suggest to someone mid-errand: the stack is a menu
                 for a visitor with no conversation, and beside "continue where
                 you left off" it reads as three ways to start over. */
              prompts={resuming || unread ? [] : prompts}
              side={side === "left" ? "left" : "right"}
              show={entered && !open}
              /* An unread outranks the greeting whether or not the greeting is
                 switched on — it is not the agent introducing itself, it is the
                 agent having said something and waiting. */
              greeting={
                unread
                  ? INBOUND
                  : resuming
                    ? RESUME_LABEL
                    : s.greetingOn
                      ? GREETING.text
                      : null
              }
              /* White, not the accent's soft tint. These sit on the customer's
                 own page rather than inside the panel, where the tint is what
                 separates the agent's turns from the visitor's — out here there
                 is no conversation to separate, and a tinted stack next to a
                 saturated button turns the corner into a block of brand colour.
                 White objects with a shadow read as things resting on the page,
                 which is what they are; the accent stays on the hover stroke
                 and the button. */
              fill={theme.neutral.surface}
              ink={theme.neutral.ink}
              stroke={chipStroke}
              onOpen={() => openChat()}
              onStart={(text) => openChat(text)}
            >
              <span className="relative inline-flex">
                {/* Outside the button, because the button clips its own
                    overflow for the sheen and a badge inside would be cut in
                    half by the corner it is meant to sit on. */}
                {unread && (
                  <span
                    className="absolute -right-1 -top-1 z-[2] grid min-w-[20px] place-items-center rounded-full px-1 text-[11px] font-semibold leading-[20px] text-white"
                    style={{
                      background: accent,
                      boxShadow: `0 0 0 2px ${theme.neutral.surface}`,
                    }}
                  >
                    1
                  </span>
                )}
                {spec.halo && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 motion-reduce:hidden"
                    style={{
                      borderRadius: radius,
                      animation:
                        "halo 3200ms cubic-bezier(0.4, 0, 0.6, 1) infinite",
                      ["--halo" as string]: `${accent}59`,
                    }}
                  />
                )}
                <button
                  onClick={() => openChat()}
                  aria-label="Open chat"
                  /* Lifts rather than swells. Scaling a button on hover enlarges
                     its shadow with it, which reads as the whole thing zooming;
                     moving it up two pixels and throwing the shadow further is
                     what actually looks like something being picked up. */
                  className={`dsc-launcher relative flex items-center justify-center overflow-hidden transition-[transform,box-shadow] duration-300 ${
                    spec.blur ? "backdrop-blur-md" : ""
                  }`}
                  style={{
                    background:
                      s.customIcon && !isChip ? undefined : spec.background,
                    color: spec.color,
                    boxShadow: spec.shadow,
                    ["--lift-shadow" as string]: spec.lift,
                    height: isChip ? 48 : 56,
                    width: isChip ? undefined : 56,
                    gap: isChip ? 10 : undefined,
                    padding: isChip ? "0 20px 0 10px" : undefined,
                    borderRadius: radius,
                  }}
                >
                  {spec.sheen && (
                    /* A highlight travelling the inside edge, masked to a
                       ring so only the edge lights — white and within the
                       button's own radius, so it reads as light moving across a
                       surface rather than as a ring around an object.

                       Slower than the composer's hairline: that one is a resting
                       launcher's only motion and has to carry it, where this is
                       on a filled button that is already doing the work. */
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden"
                      style={{
                        borderRadius: "inherit",
                        padding: 1.25,
                        WebkitMask:
                          "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                        WebkitMaskComposite: "xor",
                        mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                        maskComposite: "exclude",
                      }}
                    >
                      <span
                        className="absolute left-1/2 top-1/2 aspect-square w-[180%] -translate-x-1/2 -translate-y-1/2 animate-spin"
                        style={{
                          background:
                            "conic-gradient(rgba(255,255,255,0.92) 0deg, rgba(255,255,255,0.12) 55deg, rgba(255,255,255,0) 120deg, rgba(255,255,255,0) 240deg, rgba(255,255,255,0.12) 305deg, rgba(255,255,255,0.92) 360deg)",
                          animationDuration: "5200ms",
                          animationTimingFunction: "linear",
                        }}
                      />
                    </span>
                  )}
                  {s.customIcon ? (
                    isChip ? (
                      <>
                        <span
                          className="size-8 shrink-0 rounded-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${s.customIcon})` }}
                        />
                        <span className="text-[15px] font-medium">
                          {s.chipLabel || "Ask AI"}
                        </span>
                      </>
                    ) : (
                      <span
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${s.customIcon})` }}
                      />
                    )
                  ) : (
                    <>
                      {createElement(iconFor(s.iconKey), {
                        className: "relative shrink-0",
                        style: {
                          width: Math.round(ICON_PX * iconScale(s.iconKey)),
                          height: Math.round(ICON_PX * iconScale(s.iconKey)),
                        },
                        strokeWidth: ICON_STROKE,
                      })}
                      {isChip && (
                        <span className="text-[15px] font-medium">
                          {s.chipLabel || "Ask AI"}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </span>
            </ButtonSuggestions>
          )}
        </div>
      )}
    </div>
  );
}
