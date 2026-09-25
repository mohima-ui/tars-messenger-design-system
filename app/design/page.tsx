"use client";

import {
  ConfigurePanel,
  type SuggestionState,
} from "@/components/configure/ConfigurePanel";
import { DashboardRails } from "@/components/dashboard/DashboardRails";
import {
  SEARCH_DOCS_INPUT,
  SEARCH_DOCS_OUTPUT,
  type Json,
} from "./trace-fixtures";

import {
  useMemo,
  useState,
  useEffect,
  useId,
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
import { ThinkingOrb } from "thinking-orbs";
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
  MoreHorizontal,
  Pencil,
  Wrench,
  CornerDownRight,
  Type,
  Link2,
  Link2Off,
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
  /* One per device rather than one with a rule applied to it. A phone is a
     different amount of screen, not a smaller version of the same one — and a
     single value that quietly rendered a step down left the picker saying
     Medium while the preview drew Small. */
  size: LauncherSize;
  sizeMobile: LauncherSize;
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
  sound: SoundId;
};

const DEFAULT_LAUNCHER: LauncherSettings = {
  type: "composer",
  placement: "center",
  offsetX: 16,
  offsetY: 16,
  shape: "square",
  style: "fill",
  chipLabel: "Ask AI",
  iconKey: "sparkles",
  size: "md",
  sizeMobile: "sm",
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
  sound: "chime",
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
  /* The light-mode elevation, kept here because it is the shape of the
     launcher's lift rather than a colour decision — launcherInk picks it up
     for light and draws dark's differently. The inks that used to sit beside
     it have gone there too. */
  ring: "inset 0 0 0 1px rgba(15,17,26,0.06), 0 1px 2px rgba(15,17,26,0.10), 0 6px 16px rgba(15,17,26,0.12), 0 16px 40px rgba(15,17,26,0.18), 0 32px 80px rgba(15,17,26,0.12)",
  panelMs: 280,
  panelEase: "cubic-bezier(0.16, 1, 0.3, 1)",
  ringMs: 5200,
  ringPx: 2,
};

/* V6 above holds the launcher's geometry and timing, which do not change with
   the mode. Its inks did not either, and that was the bug: the composer drew
   itself in a fixed near-black on a fixed white however the palette was set,
   so switching the agent to dark themed the messenger and left the launcher
   behind — one product, two minds about what colour it was.

   These come off the palette instead. Only the two that cannot be a neutral
   are computed here: a disc is a wash of the surface's own ink, which flips
   direction in dark, and a drop shadow is a light-mode idea — on a dark page
   there is nothing darker to cast, so the elevation is carried by a hairline
   and a deeper, softer pool instead. */
function launcherInk(theme: ReturnType<typeof useTheme>) {
  const n = theme.neutral;
  const dark = theme.mode === "dark";
  return {
    surface: n.surface,
    ink: n.ink,
    inkMute: n.muted,
    /* The cycling line in the pill. In light it is a hint and takes the muted
       grey, like any placeholder. In dark that grey sits close enough to the
       surface to read as switched off — so it takes the ink, and the weight
       carries what the colour used to: the hint stays light, a draft or a
       resume offer comes in at normal. */
    hint: dark ? n.ink : n.muted,
    disc: dark ? "rgba(255,255,255,0.08)" : "rgba(15,17,26,0.055)",
    discHover: dark ? "rgba(255,255,255,0.16)" : "rgba(15,17,26,0.11)",
    ring: dark
      ? `inset 0 0 0 1px ${n.line}, 0 6px 16px rgba(0,0,0,0.30), 0 16px 40px rgba(0,0,0,0.38), 0 32px 80px rgba(0,0,0,0.30)`
      : V6.ring,
  };
}

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

/* An uploaded page, carrying its filename so the control can name what is in
   it without re-reading the file. */
type SiteShot = { src: string; name: string };

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


/* A single four-pointed star with a deep waist, rather than lucide's cluster
   of three. Four cubics, one per quadrant, both handles pulled almost onto the
   centre: the curve leaves each tip travelling along the arm and only turns at
   the last moment, which is what makes the points sharp and the waist between
   them deep. The same path GlassComposer's own sparkle uses, so the two
   launcher types carry one mark. Written symmetrically — the same pair of
   numbers mirrored per quadrant — so it cannot end up subtly lopsided, which at
   this size shows as a lean. */
/* Solar's chat-round-dots, at its own stroke rather than the icon set's 1.2:
   this one sits inside a 40px disc at 20px, where a hairline reads as a smudge.
   Kept as source instead of an <img> because it inherits currentColor, so it
   answers to the same ink the arrow it replaces did. */
/* The one colour in the launcher that does not re-theme.

   Everything else here is mixed from the tenant's accent, which is what makes
   a re-skin a two-value change. A waiting-message badge is the exception, and
   the review is why: on a blue-grey site the accent badge simply was not seen
   — "it's kind of getting lost, the whole blue and grey" — because a badge
   painted in the brand colour is, by construction, the colour the page is
   already full of. Notification red belongs to the message, not to the
   customer. */
const NOTIFY = "#E5484D";

/* Explore, from the review: a notifier on the browser tab itself.

   The badge on the launcher can only be seen by someone looking at the page.
   The tab is the one place that reaches a visitor who has wandered into
   another one — which is exactly the visitor an unread message is for, since
   the reply came back while they were somewhere else.

   Drawn rather than shipped as a second icon file: the site's own favicon is
   loaded, painted into a canvas and given a red disc in the corner, so it
   badges whatever icon the customer already has instead of replacing their
   brand with ours. The original links are put back on cleanup.

   Silent by design. Pratiksha asked about a ping; a widget that makes noise on
   someone else's site is the host's decision to make, not the component's. */
function useFaviconBadge(active: boolean) {
  useEffect(() => {
    if (!active || typeof document === "undefined") return;

    const head = document.head;
    const prior = Array.from(
      head.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]'),
    );
    const source = prior[0]?.href || "/favicon.ico";
    let live = true;

    const paint = (icon?: HTMLImageElement) => {
      if (!live) return;
      const c = document.createElement("canvas");
      c.width = 64;
      c.height = 64;
      const ctx = c.getContext("2d");
      if (!ctx) return;

      if (icon) {
        ctx.drawImage(icon, 0, 0, 64, 64);
      } else {
        /* No icon to badge — a plain dark tile, so the dot still has
           something to sit on rather than floating on transparency. */
        ctx.fillStyle = "#16181D";
        ctx.beginPath();
        ctx.roundRect(2, 2, 60, 60, 14);
        ctx.fill();
      }

      /* Knocked out of the icon first, for the same reason the launcher's
         badge carries a ring: the dot has to read as a thing on top of the
         mark rather than as part of it. */
      ctx.beginPath();
      ctx.arc(46, 18, 18, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(46, 18, 14, 0, Math.PI * 2);
      ctx.fillStyle = NOTIFY;
      ctx.fill();

      prior.forEach((l) => l.remove());
      const badge = document.createElement("link");
      badge.rel = "icon";
      badge.type = "image/png";
      badge.dataset.unreadBadge = "1";
      badge.href = c.toDataURL("image/png");
      head.appendChild(badge);
    };

    const icon = new Image();
    icon.onload = () => paint(icon);
    icon.onerror = () => paint();
    icon.src = source;

    return () => {
      live = false;
      head
        .querySelectorAll("link[data-unread-badge]")
        .forEach((l) => l.remove());
      prior.forEach((l) => head.appendChild(l));
    };
  }, [active]);
}

/* Dictation, for the floating composer.

   The browser's own recogniser rather than anything shipped: it is free, it is
   local, and the alternative is streaming a visitor's voice off a customer's
   site to somewhere. Absent in Firefox and in older Safaris, which is why
   every call site checks before drawing a mic — a control that does nothing is
   worse than no control.

   Continuous with interim results, because dictating a question is a sentence:
   the default stops at the first pause, and silence until the end of a
   sentence reads as the mic not working. */
type Recogniser = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

/* One hook, so the floating composer and the messenger's own field dictate
   identically. They are the same control in two places — a field with a mic
   on the end of it — and the moment the two have separate implementations is
   the moment one of them grows a behaviour the other does not. */
function useDictation(onText: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const rec = useRef<Recogniser | null>(null);
  const base = useRef("");
  /* Held in a ref so a caller passing an inline arrow does not restart the
     recogniser on every keystroke. Written after the render rather than during
     it: a ref assigned mid-render is a value React cannot see changing. */
  const sink = useRef(onText);
  useEffect(() => {
    sink.current = onText;
  });
  const canDictate = useMemo(() => recogniserCtor() !== null, []);

  /* stop, not abort: it flushes what has been heard so far into a final
     result, so the last few words survive the button being pressed. */
  const stop = useCallback(() => {
    rec.current?.stop();
    rec.current = null;
    setListening(false);
  }, []);

  const toggle = useCallback(
    (from: string) => {
      if (rec.current) {
        stop();
        return;
      }
      const Ctor = recogniserCtor();
      if (!Ctor) return;
      const r = new Ctor();
      r.lang = typeof navigator === "undefined" ? "en-US" : navigator.language;
      r.continuous = true;
      r.interimResults = true;
      /* Whatever was typed before the mic opened. Speech is appended to it
         rather than replacing it — someone who starts a sentence and finishes
         it aloud should end up with one sentence. */
      base.current = from;
      r.onresult = (e) => {
        let heard = "";
        for (let i = 0; i < e.results.length; i++) {
          heard += e.results[i][0].transcript;
        }
        const b = base.current;
        sink.current(b && heard ? `${b} ${heard.trim()}` : b + heard);
      };
      r.onend = () => setListening(false);
      r.onerror = () => setListening(false);
      rec.current = r;
      setListening(true);
      r.start();
    },
    [stop],
  );

  useEffect(() => () => rec.current?.stop(), []);

  return { listening, canDictate, toggle, stop };
}

const recogniserCtor = (): (new () => Recogniser) | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => Recogniser;
    webkitSpeechRecognition?: new () => Recogniser;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

/* The arrival chime.

   Held back for a long time on the grounds that a widget which makes noise on
   someone else's site is the host's decision rather than the component's — and
   that still holds for everything else here. An unread is the one event with a
   case for it: the reply came back while the visitor was looking somewhere
   else, which is exactly the situation a sound is for and a badge is not.

   So it is soft and it is short. Two sine notes a fourth apart, B5 into E6,
   the second entering before the first has finished, under a low-pass so no
   part of it is bright. Total length under half a second, peak gain 0.05 —
   audible in a quiet room, lost in a noisy one, which is the right way round
   for something nobody asked to hear.

   Synthesised rather than loaded: it is four oscillator lines against a file,
   a request and a cache entry on the customer's page. The browser will not let
   it play before the visitor has interacted with the document, which is the
   correct policy and not worth working around. */
function useArrivalChime(active: boolean) {
  useEffect(() => {
    if (!active || typeof window === "undefined") return;

    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;

    let ctx: AudioContext | null = null;
    try {
      ctx = new Ctor();
    } catch {
      return;
    }

    const now = ctx.currentTime;
    /* One filter for both notes, so the pair reads as a single sound rather
       than two beeps that happen to be adjacent. */
    const soft = ctx.createBiquadFilter();
    soft.type = "lowpass";
    soft.frequency.value = 3200;
    soft.connect(ctx.destination);

    const note = (hz: number, at: number, peak: number) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = "sine";
      osc.frequency.value = hz;
      /* A fast rise and a long fall — struck, not switched on. A linear
         release ends audibly; the exponential one simply stops being there. */
      gain.gain.setValueAtTime(0.0001, now + at);
      gain.gain.exponentialRampToValueAtTime(peak, now + at + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + at + 0.42);
      osc.connect(gain).connect(soft);
      osc.start(now + at);
      osc.stop(now + at + 0.45);
    };

    note(987.77, 0, 0.05);
    note(1318.51, 0.11, 0.038);

    const done = window.setTimeout(() => ctx?.close(), 900);
    return () => {
      window.clearTimeout(done);
      ctx?.close().catch(() => {});
    };
  }, [active]);
}

function ChatDotsMark({
  className,
  style,
  dot,
  dotRing,
  dotR = 3.5,
  hideDot,
}: {
  className?: string;
  style?: CSSProperties;
  /* Drawn inside the artwork rather than positioned over the button, so it
     scales with the mark and sits at the same point on it at every size. */
  dot?: string | null;
  /* Knocked out in whatever is behind the mark. Its centre sits on the
     bubble's own outline — the classic badge position — so without a ring it
     would read as a bulge in the stroke rather than as a thing on top of it.
     Pass null to draw the dot bare, which is right where the dot and the
     stroke are the same colour and the ring was only adding weight. */
  dotRing?: string | null;
  /* In viewBox units, so it has to come down as the mark goes up: the same
     radius drawn at 32 renders half again as large as it does at 24, and a
     badge that scales with its mark stops being a badge. */
  dotR?: number;
  /* Suppresses the badge without unwiring it, for the cases where something
     larger is sitting in the same corner. */
  hideDot?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22Z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12H8.009M11.991 12H12M15.991 12H16"
      />
      {dot && !hideDot && (
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

/* Solar's magic-stick-3, headphones-round and question-circle. All three come
   from one family, drawn on the same 24 grid at the same weight — which is what
   the old set was missing: four marks from four sources look like four
   decisions rather than a set. */
function WandMark({
  className,
  style,
  strokeWidth,
}: {
  className?: string;
  style?: CSSProperties;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeWidth={strokeWidth ?? 1.5}
        d="M3.84453 7.92226C2.71849 6.79623 2.71849 4.97056 3.84453 3.84453C4.97056 2.71849 6.79623 2.71849 7.92226 3.84453L20.1555 16.0777C21.2815 17.2038 21.2815 19.0294 20.1555 20.1555C19.0294 21.2815 17.2038 21.2815 16.0777 20.1555L3.84453 7.92226Z"
      />
      <path
        strokeLinecap="round"
        strokeWidth={strokeWidth ?? 1.5}
        d="M6 10L10 6"
      />
      <path
        fill="currentColor"
        stroke="none"
        d="M16.1 2.30719C16.261 1.8976 16.8385 1.8976 16.9994 2.30719L17.4298 3.40247C17.479 3.52752 17.5776 3.62651 17.7022 3.67583L18.7934 4.1078C19.2015 4.26934 19.2015 4.849 18.7934 5.01054L17.7022 5.44252C17.5776 5.49184 17.479 5.59082 17.4298 5.71587L16.9995 6.81115C16.8385 7.22074 16.261 7.22074 16.1 6.81116L15.6697 5.71587C15.6205 5.59082 15.5219 5.49184 15.3973 5.44252L14.3061 5.01054C13.898 4.849 13.898 4.26934 14.3061 4.1078L15.3973 3.67583C15.5219 3.62651 15.6205 3.52752 15.6697 3.40247L16.1 2.30719Z"
      />
      <path
        fill="currentColor"
        stroke="none"
        d="M19.9672 9.12945C20.1281 8.71987 20.7057 8.71987 20.8666 9.12945L21.0235 9.5288C21.0727 9.65385 21.1713 9.75284 21.2959 9.80215L21.6937 9.95965C22.1018 10.1212 22.1018 10.7009 21.6937 10.8624L21.2959 11.0199C21.1713 11.0692 21.0727 11.1682 21.0235 11.2932L20.8666 11.6926C20.7057 12.1022 20.1281 12.1022 19.9672 11.6926L19.8103 11.2932C19.7611 11.1682 19.6625 11.0692 19.5379 11.0199L19.14 10.8624C18.732 10.7009 18.732 10.1212 19.14 9.95965L19.5379 9.80215C19.6625 9.75284 19.7611 9.65385 19.8103 9.5288L19.9672 9.12945Z"
      />
      <path
        fill="currentColor"
        stroke="none"
        d="M5.1332 15.3072C5.29414 14.8976 5.87167 14.8976 6.03261 15.3072L6.18953 15.7065C6.23867 15.8316 6.33729 15.9306 6.46188 15.9799L6.85975 16.1374C7.26783 16.2989 7.26783 16.8786 6.85975 17.0401L6.46188 17.1976C6.33729 17.2469 6.23867 17.3459 6.18953 17.471L6.03261 17.8703C5.87167 18.2799 5.29414 18.2799 5.1332 17.8703L4.97628 17.471C4.92714 17.3459 4.82852 17.2469 4.70393 17.1976L4.30606 17.0401C3.89798 16.8786 3.89798 16.2989 4.30606 16.1374L4.70393 15.9799C4.82852 15.9306 4.92714 15.8316 4.97628 15.7065L5.1332 15.3072Z"
      />
    </svg>
  );
}

function HeadphonesMark({
  className,
  style,
  strokeWidth,
}: {
  className?: string;
  style?: CSSProperties;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth ?? 1.5}
      aria-hidden
    >
      <path d="M21 17V12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12V17" />
      <path strokeLinecap="round" d="M22 15.5V17.5" />
      <path strokeLinecap="round" d="M2 15.5V17.5" />
      <path d="M8 13.8446C8 13.0802 8 12.698 7.82526 12.4323C7.73733 12.2985 7.62061 12.188 7.4844 12.1095C7.21371 11.9535 6.84812 11.9896 6.11694 12.0617C4.88487 12.1831 4.26884 12.2439 3.82737 12.5764C3.60394 12.7448 3.41638 12.9593 3.27646 13.2067C3 13.6955 3 14.3395 3 15.6276V17.1933C3 18.4685 3 19.1061 3.28198 19.5986C3.38752 19.7829 3.51981 19.9491 3.67416 20.0913C4.08652 20.4714 4.68844 20.5901 5.89227 20.8275C6.73944 20.9945 7.16302 21.078 7.47564 20.9021C7.591 20.8372 7.69296 20.7493 7.77572 20.6434C8 20.3565 8 19.9078 8 19.0104V13.8446Z" />
      <path d="M16 13.8446C16 13.0802 16 12.698 16.1747 12.4323C16.2627 12.2985 16.3794 12.188 16.5156 12.1095C16.7863 11.9535 17.1519 11.9896 17.8831 12.0617C19.1151 12.1831 19.7312 12.2439 20.1726 12.5764C20.3961 12.7448 20.5836 12.9593 20.7235 13.2067C21 13.6955 21 14.3395 21 15.6276V17.1933C21 18.4685 21 19.1061 20.718 19.5986C20.6125 19.7829 20.4802 19.9491 20.3258 20.0913C19.9135 20.4714 19.3116 20.5901 18.1077 20.8275C17.2606 20.9945 16.837 21.078 16.5244 20.9021C16.409 20.8372 16.307 20.7493 16.2243 20.6434C16 20.3565 16 19.9078 16 19.0104V13.8446Z" />
    </svg>
  );
}

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
  { key: "chat", label: "Chat", Icon: ChatDotsMark },
  { key: "wand", label: "Magic", Icon: WandMark },
  { key: "headphones", label: "Support", Icon: HeadphonesMark },
  { key: "bot", label: "Agent", Icon: BotMark },
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
/* The demo's own site. Its suggestions are not in the table above because they
   are not invented for it — they are the four the agent's first message offers,
   read off the script, so the launcher cannot offer one thing and the panel open
   on another. */
const SCRIPT_SITE = /globalpayments\./i;

function promptsFor(s: LauncherSettings, path: string) {
  const clean = (list: string[]) => list.map((p) => p.trim()).filter(Boolean);
  if (!s.contextualOn) return clean(s.defaultPrompts);
  const hit = s.rules
    .filter((r) => r.match.trim().length > 1 && path.startsWith(r.match.trim()))
    .sort((a, b) => b.match.length - a.match.length)[0];
  const chosen = hit ? clean(hit.prompts) : [];
  return chosen.length ? chosen : clean(s.defaultPrompts);
}

/* ─── the sounds ──────────────────────────────────────────────────────────
   The built-in chime stays first and stays the default: it is synthesised, so
   it costs nothing to ship and it is the one that cannot fail to load. The
   rest are files, and a file is a request on the customer's page — which is
   why only the chosen one is ever fetched, and never before someone asks to
   hear it.

   Named for what they sound like rather than for the file on disk. Nobody
   picks "universfield-new-notification-040" out of a list. */
type SoundId =
  | "chime"
  | "ping"
  | "soft"
  | "bright"
  | "double"
  | "marimba"
  | "arcade"
  | "success"
  | "scifi"
  | "reject";

const SOUNDS: { id: SoundId; label: string; src?: string }[] = [
  {
    id: "chime",
    label: "Chime",
  },
  {
    id: "ping",
    label: "Ping",
    src: "/sounds/universfield-message-ping-351298.mp3",
  },
  {
    id: "soft",
    label: "Soft",
    src: "/sounds/universfield-new-notification-040-493469.mp3",
  },
  {
    id: "bright",
    label: "Bright",
    src: "/sounds/universfield-new-notification-036-485897.mp3",
  },
  {
    id: "double",
    label: "Double tap",
    src: "/sounds/universfield-new-notification-051-494246.mp3",
  },
  {
    id: "marimba",
    label: "Marimba",
    src: "/sounds/preview.mp3",
  },
  {
    id: "arcade",
    label: "Arcade",
    src: "/sounds/mixkit-arcade-bonus-alert-767.wav",
  },
  {
    id: "success",
    label: "Success",
    src: "/sounds/mixkit-game-success-alert-2039.wav",
  },
  {
    id: "scifi",
    label: "Sci-fi",
    src: "/sounds/mixkit-sci-fi-positive-notification-266.wav",
  },
  {
    id: "reject",
    label: "Blip",
    src: "/sounds/mixkit-sci-fi-reject-notification-896.wav",
  },
];

/* One element, reused. A new Audio per press leaves a pile of them decoding
   in the background, and a tenant auditioning ten sounds should not end up
   with ten of them overlapping. */
let audioEl: HTMLAudioElement | null = null;
function playSound(id: SoundId) {
  const found = SOUNDS.find((x) => x.id === id);
  if (!found || !found.src) {
    playChime();
    return;
  }
  try {
    if (!audioEl) audioEl = new Audio();
    audioEl.pause();
    audioEl.src = found.src;
    audioEl.currentTime = 0;
    audioEl.volume = 0.5;
    /* Browsers refuse audio until the page has been interacted with, and the
       refusal is a rejected promise rather than an error — swallowed, because
       there is nothing to tell the tenant that the next press will not fix. */
    void audioEl.play().catch(() => {});
  } catch {
    /* no sound is a fine outcome; a thrown error in a preview is not */
  }
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
      /* Levelled against the files, which play at 0.5 of a normalised
         recording. 0.05 on a bare sine was a fraction of that, so the one
         sound without a download was also the one nobody could hear — and a
         picker where the default is the quietest option is a picker that
         argues for changing it. */
      gain.gain.exponentialRampToValueAtTime(0.28, at + 0.02);
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
    /* These were tuned against a near-black canvas. Once the dark neutrals
       were lifted to a charcoal, a fill at L 0.30 was sitting at the same
       lightness as the surface under it — which is why an accent-tinted chip
       read as a dull rectangle rather than as a raised one. The fill now
       clears the paper it sits on, the edge clears the fill, and the ink
       comes up with them; the chroma caps rise a little too, since a tint
       this light can carry more colour before it starts shouting. */
    return {
      soft: oklchToHex(0.4, Math.min(0.08, C), H),
      border: oklchToHex(0.51, Math.min(0.11, C), H),
      ink: oklchToHex(0.93, Math.min(0.05, C), H),
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
    /* Not black. A near-black panel on somebody's page reads as a hole cut in
       it, and every surface above the canvas has to be even blacker to sit
       under the one before it — which is where the ramp ran out. Lifted to a
       charcoal instead: the same achromatic hue, ten or so points of lightness
       up, so canvas → surface → paper still separate but none of the three is
       trying to be the absence of light. */
    dark: {
      canvas: "#242427",
      surface: "#2C2C30",
      paper: "#36363B",
      line: "#45454B",
      ink: "#EFEFF1",
      secondary: "#B4B4B9",
      muted: "#8B8B92",
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

/* One selectable region of the preview.

   Outlined on hover rather than permanently: a preview covered in dotted
   boxes stops being a preview, and the whole point is to look at the thing
   you are shipping. The outline sits outside the content on an offset, so
   nothing inside moves when it appears — a layout that shifts under the
   pointer is how you end up clicking the wrong part. */
function Hot({
  part,
  sel,
  onSelect,
  accent,
  styles,
  className = "",
  style,
  children,
}: {
  part: Part;
  sel?: Part | null;
  onSelect?: (p: Part | null) => void;
  accent: string;
  /* The override sheet for every part, so the wrapper can apply its own
     without each call site threading one through. */
  styles?: PartStyles;
  className?: string;
  style?: CSSProperties;
  children: React.ReactNode;
}) {
  const override = partCss(styles?.[part]);
  /* Outside the editor the wrapper still has to apply the overrides — a
     tenant's saved styling is part of the product, not part of the tool. */
  if (!onSelect) {
    return hasStyle(styles?.[part]) ? (
      <div className={className} style={{ ...style, ...override }}>
        {children}
      </div>
    ) : (
      <>{children}</>
    );
  }
  const on = sel === part;
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={on}
      aria-label={`Edit ${PARTS[part].label.toLowerCase()}`}
      onClick={(e) => {
        e.stopPropagation();
        /* Pressing the selected part again clears it, so the way out is the
           same gesture as the way in. */
        onSelect(on ? null : part);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(on ? null : part);
        }
      }}
      className={`hot relative cursor-pointer rounded-[10px] ${on ? "hot-on" : ""} ${className}`}
      style={{ ["--hot" as string]: accent, ...style, ...override }}
    >
      {children}
    </div>
  );
}

/* ─── editing by pointing at it ───────────────────────────────────────────
   A settings panel makes you hold two things in your head: the name somebody
   gave a control, and which part of the product it moves. Both are guesses.
   Point at the thing instead and only one of them is left.

   So the preview is selectable. Click the header and the panel is the
   header's settings; click a bubble and it is the bubble's. The full list is
   still there — selection filters it rather than replacing it, so nothing is
   reachable only by knowing where to click. */
type Part =
  | "header"
  | "avatar"
  | "title"
  | "subtitle"
  | "bubble"
  | "userBubble"
  | "composer"
  | "thinking";
type GroupKey = "brand" | "colour" | "theme" | "shape" | "thinking" | "messages";

/* The tree, as a flat list with a parent — flat because the panel shows it as
   an indented list and nothing here ever moves, so a real tree structure
   would be ceremony around a fixed shape. */
const PARTS: Record<
  Part,
  { label: string; parent?: Part; groups: GroupKey[]; text?: boolean }
> = {
  /* Who the agent is, which is what the top of the panel is for. */
  header: { label: "Header", groups: ["brand"] },
  avatar: { label: "Avatar", parent: "header", groups: ["brand"] },
  title: { label: "Agent name", parent: "header", groups: ["brand"], text: true },
  subtitle: { label: "Subtitle", parent: "header", groups: ["brand"], text: true },
  /* A bubble is the accent and the corner scale meeting — the two settings
     people actually come here to change. */
  bubble: { label: "AI message", groups: ["colour", "shape"], text: true },
  userBubble: { label: "User message", groups: ["colour", "shape"], text: true },
  composer: { label: "Composer", groups: ["shape"] },
  thinking: { label: "Thinking", groups: ["thinking"], text: true },
};
const PART_ORDER: Part[] = [
  "header",
  "avatar",
  "title",
  "subtitle",
  "bubble",
  "userBubble",
  "thinking",
  "composer",
];

/* ─── the style layer ─────────────────────────────────────────────────────
   Underneath the named settings, every part carries an override sheet. The
   settings above stay the fast path — one press for the nine decisions almost
   everyone makes — and this is the floor under them, for the tenth that
   nobody anticipated.

   Written as CSS rather than a house vocabulary: a tenant's designer already
   knows what letter-spacing does, and a bespoke name for it is a thing to
   learn for no gain. Empty by default, so a part with nothing set renders
   exactly as the product does. */
type PartStyle = {
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  gap?: number;
  background?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: number;
  borderWidth?: number;
  borderColor?: string;
  radiusTL?: number;
  radiusTR?: number;
  radiusBR?: number;
  radiusBL?: number;
  shadow?: string;
  opacity?: number;
};
type PartStyles = Partial<Record<Part, PartStyle>>;

/* Turned into real CSS at the point of use. The border is an inset ring
   rather than a border property, so adding an edge never changes the box it
   is drawn on — a stroke that reflows the layout under the pointer is the
   most irritating thing an editor like this can do. */
function partCss(ps?: PartStyle): CSSProperties {
  if (!ps) return {};
  const ring = ps.borderWidth
    ? `inset 0 0 0 ${ps.borderWidth}px ${ps.borderColor ?? "#E5E5E5"}`
    : "";
  const box = [ring, ps.shadow ?? ""].filter(Boolean).join(", ");
  return {
    paddingTop: ps.paddingTop,
    paddingRight: ps.paddingRight,
    paddingBottom: ps.paddingBottom,
    paddingLeft: ps.paddingLeft,
    gap: ps.gap,
    background: ps.background,
    color: ps.color,
    fontSize: ps.fontSize,
    fontWeight: ps.fontWeight,
    lineHeight: ps.lineHeight,
    letterSpacing:
      ps.letterSpacing === undefined ? undefined : `${ps.letterSpacing}px`,
    boxShadow: box || undefined,
    borderTopLeftRadius: ps.radiusTL,
    borderTopRightRadius: ps.radiusTR,
    borderBottomRightRadius: ps.radiusBR,
    borderBottomLeftRadius: ps.radiusBL,
    opacity: ps.opacity,
  };
}
const hasStyle = (ps?: PartStyle) =>
  !!ps && Object.values(ps).some((v) => v !== undefined);

/* A bubble's corners, from the scale. The tail stays tighter than the other
   three so a bubble still points at its speaker whatever the scale is set to
   — four equal corners at "round" is a pill, and a pill has stopped saying
   who is talking. */
function bubbleShape(r: number, side: "user" | "ai") {
  const tail = Math.max(3, Math.round(r / 3));
  return side === "user"
    ? { borderRadius: r, borderBottomRightRadius: tail }
    : { borderRadius: r, borderBottomLeftRadius: tail };
}

/* ─── the four shape settings ─────────────────────────────────────────────
   A widget looks foreign for a small number of reasons, and none of them is
   "not enough sliders". These are the ones that carry it: the corners, the
   way a surface sits off the page, how much air it keeps, and whether its
   white is the same white. Each is one decision with a handful of answers
   rather than a number to drag, because matching a page is a perceptual job
   and nobody has ever done it by typing 14.

   Deliberately none of them is per-component. Separate bubble and button
   radii is how a widget ends up not matching itself. */
type Corners = "sharp" | "soft" | "round";
type Elevation = "shadow" | "border" | "flat";
type Density = "comfortable" | "compact";
type SurfaceTone = "white" | "warm" | "cool";

/* One scale, four roles. A bubble runs a little tighter than the panel it
   sits in and a control a little looser, so the set stays recognisably one
   radius rather than four. */
const CORNERS: Record<
  Corners,
  { panel: number; bubble: number; control: number; chip: number }
> = {
  sharp: { panel: 8, bubble: 4, control: 8, chip: 6 },
  soft: { panel: 18, bubble: 12, control: 14, chip: 999 },
  round: { panel: 26, bubble: 20, control: 999, chip: 999 },
};

/* Comfortable is the product's own rhythm; compact is for a dense site where
   the agent would otherwise read as the roomiest thing on the page. Only the
   air moves — type sizes stay put, because a 12px reply is not "denser", it
   is harder to read. */
const DENSITY: Record<Density, { pad: number; gap: number; row: number }> = {
  comfortable: { pad: 20, gap: 16, row: 12 },
  compact: { pad: 14, gap: 10, row: 8 },
};

/* The ground, which is rarely pure white on a real site. Mixed rather than
   listed, so the tone rides on top of whichever palette and mode are in play
   instead of being a fourth set of hexes to keep in sync. */
const TONE: Record<SurfaceTone, { hue: string; amount: number }> = {
  white: { hue: "#FFFFFF", amount: 0 },
  warm: { hue: "#F5E7D0", amount: 0.22 },
  cool: { hue: "#DCE4F2", amount: 0.22 },
};

function mixHex(a: string, b: string, t: number) {
  const ok = (h: string) => /^#[0-9a-fA-F]{6}$/.test(h);
  if (!ok(a) || !ok(b)) return a;
  const ch = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r1, g1, b1] = ch(a);
  const [r2, g2, b2] = ch(b);
  return (
    "#" +
    [r1, g1, b1]
      .map((v, i) =>
        Math.round(v + ([r2, g2, b2][i] - v) * t)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
      .toUpperCase()
  );
}

type Look = {
  corners: Corners;
  elevation: Elevation;
  density: Density;
  tone: SurfaceTone;
};
const DEFAULT_LOOK: Look = {
  corners: "soft",
  elevation: "shadow",
  density: "comfortable",
  tone: "white",
};

function useTheme(
  accent: string,
  themeKey: ThemeKey = "light",
  mode: Mode = "light",
  look: Look = DEFAULT_LOOK,
) {
  return useMemo(() => {
    const base = NEUTRALS[themeKey][mode];
    /* The tone tints the three surfaces and the hairline that separates them.
       Ink is left alone: a warm page does not want warm text, it wants the
       same text on a warm ground. */
    const t = TONE[look.tone];
    const tint = (hex: string) =>
      t.amount === 0 ? hex : mixHex(hex, t.hue, mode === "dark" ? t.amount * 0.5 : t.amount);
    const neutral =
      t.amount === 0
        ? base
        : {
            ...base,
            canvas: tint(base.canvas),
            surface: tint(base.surface),
            paper: tint(base.paper),
            line: tint(base.line),
          };
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
    const radius = CORNERS[look.corners];
    const space = DENSITY[look.density];
    /* Three ways a surface can sit off the page, and they are mutually
       exclusive — a shadow and a border together is the look of something
       that could not decide. */
    const panelShadow =
      look.elevation === "shadow"
        ? mode === "dark"
          ? `inset 0 0 0 1px ${neutral.line}, 0 18px 50px -12px rgba(0,0,0,0.5)`
          : "0 18px 50px -12px rgba(15,17,26,0.26), 0 2px 6px rgba(15,17,26,0.06)"
        : look.elevation === "border"
          ? `inset 0 0 0 1px ${neutral.line}`
          : "none";
    return {
      neutral,
      accent,
      mode,
      look,
      radius,
      space,
      panelShadow,
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
  }, [accent, themeKey, mode, look]);
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
  /* The four that decide whether the messenger reads as part of the page it
     is sitting on. Held separately and folded into one object for the theme,
     so adding a fifth later is one line here rather than a new prop on every
     component between here and the preview. */
  const [corners, setCorners] = useState<Corners>("soft");
  const [tone, setTone] = useState<SurfaceTone>("white");
  /* What is selected in the preview, and therefore what the panel is showing.
     Null is the whole list, which is also where a first visit starts — the
     panel has to be readable before anyone knows it is clickable. */
  /* The preview still takes a sheet; nothing writes to it now that selection
     has gone from the panel, so every part renders as the product does. */
  const partStyles: PartStyles = {};
  const look = useMemo<Look>(
    () => ({
      corners,
      elevation: "shadow" as Elevation,
      density: "comfortable" as Density,
      tone,
    }),
    [corners, tone],
  );
  /* What the agent looks and sounds like while it is working. Two settings
     rather than one, because they answer different questions: the mark says
     who is thinking and the line says what about. */
  const [thinkMark, setThinkMark] = useState<ThinkingMark>("sparkle");
  /* The uploaded mark, held whether or not it is the one selected: switching
     to the sparkle to compare and back again should not cost the upload. */
  const [thinkMarkSrc, setThinkMarkSrc] = useState<string | null>(null);
  /* Empty means the platform's own rotation. A tenant writing one line here
     is choosing to say the same thing every time, which is a different
     decision from wanting different words — so it is the presence of a value
     that switches the behaviour, not a second toggle beside it. */
  const [thinkLabel, setThinkLabel] = useState("");

  // preview-only, so deliberately outside the saved config — pointing the
  // preview at a site isn't a change to the customer's launcher
  const [siteUrl, setSiteUrl] = useState("");
  /* The other way to point it: a picture of a page the capture service can't
     reach — anything behind a login, a staging build, a page that isn't
     published yet. Held beside the URL rather than instead of it, so removing
     the upload falls back to whatever was typed. */
  const [siteShot, setSiteShot] = useState<SiteShot | null>(null);

  const [launcher, setLauncher] = useState<LauncherSettings>(DEFAULT_LAUNCHER);
  const patchLauncher = useCallback(
    (patch: Partial<LauncherSettings>) =>
      setLauncher((l) => ({ ...l, ...patch })),
    [],
  );

  const t = useTheme(accent, themeKey, mode, look);

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
      corners,
      tone,
      thinkMark,
      thinkMarkSrc,
      thinkLabel,
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
      corners,
      tone,
      thinkMark,
      thinkMarkSrc,
      thinkLabel,
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
    setCorners(saved.corners);
    setTone(saved.tone);
    setThinkMark(saved.thinkMark);
    setThinkMarkSrc(saved.thinkMarkSrc);
    setThinkLabel(saved.thinkLabel);
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
                  siteShot={siteShot}
                  setSiteShot={setSiteShot}
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
                  siteUrl={siteUrl}
                  setSiteUrl={setSiteUrl}
                  corners={corners}
                  setCorners={setCorners}
                  tone={tone}
                  setTone={setTone}
                  thinkMark={thinkMark}
                  setThinkMark={setThinkMark}
                  thinkMarkSrc={thinkMarkSrc}
                  setThinkMarkSrc={setThinkMarkSrc}
                  thinkLabel={thinkLabel}
                  setThinkLabel={setThinkLabel}
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
                  siteShot={siteShot}
                  thinkMark={thinkMark}
                  thinkMarkSrc={thinkMarkSrc}
                  thinkLabel={thinkLabel}
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
                  /* The greeting's own options, off the script. This tab has
                     no page to be contextual about — it is the messenger by
                     itself — so it resolved to the configured fallback and the
                     panel opened on the demo's greeting with somebody else's
                     three suggestions under it. They are the agent's first turn
                     and its own follow-ups now, which is the rule everywhere
                     else: a suggestion answers the question the turn it sits
                     under ends on. */
                  suggestions={scriptPrompts(SCRIPT.slice(0, 1))}
                  disclaimer={disclaimer}
                  disclaimerOn={disclaimerOn}
                  brandingOn={brandingOn}
                  avatar={avatar}
                  logoOnly={logoOnly}
                  accent={accent}
                  thinkMark={thinkMark}
                  thinkMarkSrc={thinkMarkSrc}
                  thinkLabel={thinkLabel}
                  partStyles={partStyles}
                  device={device}
                />
              )}
            </div>
            {/* Under the frame rather than in the settings panel: everything on
                the left is something the customer configures and saves, and
                this is a lens on the preview. Launcher only — the returning
                visitor is a question about what greets them, and the Messenger
                tab has already skipped past that. */}
            <div className="shrink-0 border-t border-[#E7E7E9] bg-white px-5 py-3">
              {tab === "launcher" && (
                <>
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
                  {/* The rule this state is standing for, in words. The picker
                      on its own shows what happens; this says why, which is the
                      part that has to survive the meeting. */}
                  <p className="mt-1.5 text-[11px] leading-snug text-[#8A8A8A]">
                    {SESSIONS.find((o) => o.id === session)?.note}
                  </p>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Dashboard rails ──────────────────────── */

/* ───────────────────────── Agent controls ───────────────────────── */

/* selectable preview fonts — Poppins is the product default (--font-sans) */
/* ─── the typefaces ───────────────────────────────────────────────────────
   One list, A to Z. Grouping them by "common" and "distinctive" was our
   judgement about other people's brands, and it made the list something to
   navigate rather than something to scan — alphabetical means a tenant who
   knows what they want stops looking the moment they reach the letter. */
const FONTS = [
  "Barlow",
  "Bricolage Grotesque",
  "Cormorant Garamond",
  "DM Sans",
  "Figtree",
  "Fraunces",
  "IBM Plex Sans",
  "Instrument Sans",
  "Inter",
  "Lato",
  "Manrope",
  "Merriweather",
  "Montserrat",
  "Mulish",
  "Noto Sans",
  "Nunito",
  "Open Sans",
  "Outfit",
  "Playfair Display",
  "Plus Jakarta Sans",
  "Poppins",
  "Raleway",
  "Roboto",
  "Rubik",
  "Schibsted Grotesk",
  "Sora",
  "Source Sans 3",
  "Space Grotesk",
  "Syne",
  "Work Sans",
];

/* Behind every choice, so a font that has not finished downloading falls back
   to something rather than to Times. */
const SYSTEM_STACK =
  'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const fontStack = (f: string) =>
  /* Poppins is self-hosted by the app, so it comes from the local variable
     rather than from a request. */
  f === "Poppins" ? "var(--font-sans), sans-serif" : `"${f}", ${SYSTEM_STACK}`;

/* Fetched when it is chosen rather than all thirty up front, and kept once
   fetched so flicking back and forth does not re-request. Poppins is already
   self-hosted by the app, so it never asks for anything.

   400 and 700 only: every family here has both, where 500 and 600 are missing
   from several of the serifs — a css2 request naming a weight a family does
   not ship fails outright and leaves the whole font unloaded. */
const fontLoaded = new Set<string>(["Poppins"]);
function loadFont(family: string) {
  if (typeof document === "undefined" || fontLoaded.has(family)) return;
  fontLoaded.add(family);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@400;700&display=swap`;
  document.head.appendChild(link);
}

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

/* One cell of the thinking-mark row. Segmented's look without Segmented's
   shape: the row has an upload in it, and an upload is not an option with an
   icon — it is a place to put a file that then becomes one. */
function MarkCell({
  on,
  onClick,
  label,
  children,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`flex flex-1 flex-col items-center gap-1 rounded-lg border py-2 transition-colors ${
        on
          ? "border-[#C4A9E8] bg-[#F8F4FF] text-[#6D33AA]"
          : "border-[#E5E5E5] text-[#8A8A8A] hover:border-[#D5D5D5] hover:text-[#555]"
      }`}
    >
      {children}
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  );
}

const MAX_MARK_BYTES = 1024 * 1024;

/* The upload cell. Empty it is a target; filled it is the mark itself, which
   is the only preview of it worth having — a filename would say less about a
   16px glyph than the glyph does. */
function MarkUploadCell({
  on,
  src,
  onPick,
  onClear,
}: {
  on: boolean;
  src: string | null;
  onPick: (src: string) => void;
  onClear: () => void;
}) {
  const read = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > MAX_MARK_BYTES) return;
    const reader = new FileReader();
    reader.onload = () => onPick(reader.result as string);
    reader.readAsDataURL(file);
  };
  return (
    <div className="relative flex-1">
      <label
        className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border py-2 transition-colors ${
          on
            ? "border-[#C4A9E8] bg-[#F8F4FF] text-[#6D33AA]"
            : "border-dashed border-[#DADADA] text-[#8A8A8A] hover:border-[#C0C0C0] hover:text-[#555]"
        }`}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="size-4 rounded-full object-cover" />
        ) : (
          <ImagePlus className="size-4" strokeWidth={1.8} />
        )}
        <span className="text-[11px] font-medium">
          {src ? "Custom" : "Upload"}
        </span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => read(e.target.files?.[0])}
        />
      </label>
      {src && (
        <button
          onClick={onClear}
          aria-label="Remove custom mark"
          className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-white text-[#A8A8A8] shadow-sm ring-1 ring-black/5 transition-colors hover:text-[#555]"
        >
          <X className="size-2.5" strokeWidth={2.5} />
        </button>
      )}
    </div>
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
  siteShot,
  setSiteShot,
  device,
  accent,
}: {
  s: LauncherSettings;
  set: (patch: Partial<LauncherSettings>) => void;
  siteUrl: string;
  setSiteUrl: (v: string) => void;
  siteShot: SiteShot | null;
  setSiteShot: (v: SiteShot | null) => void;
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

  const readShot = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () =>
      setSiteShot({ src: reader.result as string, name: file.name });
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
      {/* ── PREVIEW ON YOUR SITE — a lens on the preview, not a setting ──
             Two sources, one field. A URL is what nearly everyone uses; an
             upload is the fallback for a page the capture service can’t
             reach, so it lives in the field’s trailing slot rather than as a
             second labelled sub-section with a dropzone of its own. Picking a
             file replaces the field with the file; removing it gives the URL
             back. */}
      <Group title="Preview on your site">
        {siteShot ? (
          <div className="flex h-9 items-center gap-2 rounded-lg border border-[#E5E5E5] pl-1.5 pr-1">
            <span className="grid size-6 shrink-0 place-items-center overflow-hidden rounded bg-[#F2EEFA]">
              {/* the page itself, not an icon standing in for it */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={siteShot.src}
                alt=""
                className="size-full object-cover object-top"
              />
            </span>
            <span
              className="min-w-0 flex-1 truncate text-[12px] text-[#333]"
              title={siteShot.name}
            >
              {siteShot.name}
            </span>
            <button
              onClick={() => setSiteShot(null)}
              aria-label="Remove screenshot"
              className="grid size-6 shrink-0 place-items-center rounded text-[#A8A8A8] transition-colors hover:bg-[#F5F5F5] hover:text-[#555]"
            >
              <X className="size-3.5" strokeWidth={2} />
            </button>
          </div>
        ) : (
          <div className="flex h-9 items-center rounded-lg border border-[#E5E5E5] pl-2.5 pr-1 transition-colors focus-within:border-[#C9C9C9]">
            <LinkIcon
              className="size-3.5 shrink-0 text-[#B8B8B8]"
              strokeWidth={2}
            />
            <input
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="yourcompany.com"
              className="h-full min-w-0 flex-1 bg-transparent px-2 text-[13px] text-[#333] outline-none placeholder:text-[#B0B0B0]"
            />
            <span className="mr-1 h-4 w-px bg-[#EAEAEA]" />
            <label
              title="Upload a screenshot instead"
              className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-md text-[#8A8A8A] transition-colors hover:bg-[#F5F5F5] hover:text-[#555]"
            >
              <ImagePlus className="size-4" strokeWidth={1.8} />
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => readShot(e.target.files?.[0])}
              />
            </label>
          </div>
        )}
        {/* the tooltip’s sentence, said out loud — it is short enough that
            hiding it behind an ⓘ cost more room than printing it */}
        <p className="mt-1.5 text-[11px] leading-snug text-[#A8A8A8]">
          A URL, or upload a screenshot. Some protected sites won’t capture.
        </p>
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
        {/* Both launchers, not just the button. The reason these exist — a
            cookie banner, a back-to-top arrow, a sticky footer already sitting
            in that corner — is the same whichever launcher is in it, and the
            composer is the wider of the two, so it collides more often. */}
        <div className="mt-3 flex flex-col gap-2">
          {/* Nothing to offset from when it is centred: the launcher is placed
              by the frame's middle, and a horizontal nudge would only push it
              off centre. The vertical one still applies. */}
          {s.placement !== "center" && (
            <NumberField
              label="Horizontal offset"
              value={s.offsetX}
              onChange={(offsetX) => set({ offsetX })}
              min={0}
              max={120}
              step={4}
              suffix="px"
            />
          )}
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
      </Group>

      {!isComposer && (
        <Group title="Button">
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

          {/* 16, the gap every other field in this panel leaves under itself.
              Segmented carries no bottom margin — the Style picker that used to
              follow it brought its own spacer, and removing that left the next
              label sitting directly on the control. */}
          <div className="mt-4" />

          {/* No Style picker in this variant: the launcher is fixed at Fill,
              the tenant's colour exactly as they specified it, and the glass
              lives on the cluster beside it instead — so the corner is one
              deliberate pairing rather than two independently chosen
              materials.

              Custom icon sits after the shape and before the icon set, because
              it overrides the set entirely: meeting it afterwards means
              discovering the choice did not matter. */}
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

          {/* Always shown, custom image or not. The upload is the first
              slot in this row now, so gating the row on there being no
              custom image hid the only control that could replace or
              remove one — upload once and the size, the icon set and the
              upload itself all disappeared together. */}
          <div className="mt-4">
            <FieldLabel>Icon</FieldLabel>
            {/* One row that scrolls, with the upload as its first slot. The
                custom image used to be a dropzone of its own above this —
                three lines of chrome for a control most customers never
                touch, and it made the icon set look like the second-choice
                option rather than the row the upload belongs to. */}
            {/* Two rows of three. A grid rather than a scrolling rail: six
                slots fit the column exactly, and anything that fits should not
                ask to be scrolled through. */}
            <div className="grid grid-cols-3 gap-1.5">
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  readIcon(e.dataTransfer.files?.[0]);
                }}
                title={s.customIconName || "Upload an image"}
                className={`relative grid h-[52px] cursor-pointer place-items-center rounded-lg border transition-colors ${
                  s.customIcon
                    ? "border-[#C4A9E8] bg-[#F8F4FF]"
                    : "border-dashed border-[#D8D8D8] text-[#B0B0B0] hover:border-[#C0C0C0]"
                }`}
              >
                {!s.customIcon && (
                  <ImagePlus className="size-[18px]" strokeWidth={1.8} />
                )}
                {/* Inset and contained once something is uploaded, not bleeding
                    to the card's edges. The other five slots hold a 22px mark in
                    a 52px cell, and a full-bleed tile beside them reads as a
                    different kind of thing rather than the same choice made with
                    your own artwork. Contained rather than cropped, so a wide
                    logo is shown whole. */}
                {s.customIcon && (
                  <span
                    className="absolute inset-2 rounded-md bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${s.customIcon})` }}
                  />
                )}
                {/* Clearing rides the slot rather than taking one of its own: a
                    seventh cell would break the grid, and the thing being
                    removed is right here. */}
                {s.customIcon && (
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label="Remove custom image"
                    onClick={(e) => {
                      e.preventDefault();
                      set({ customIcon: null, customIconName: null });
                    }}
                    className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-white text-[#9A9A9A] shadow-[0_1px_3px_rgba(15,17,26,0.2)] transition-colors hover:text-[#555]"
                  >
                    <X className="size-3" strokeWidth={2.4} />
                  </span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => readIcon(e.target.files?.[0])}
                />
              </label>
              {LAUNCHER_ICONS.map(({ key, label, Icon }) => {
                const on = !s.customIcon && s.iconKey === key;
                return (
                  <button
                    key={key}
                    onClick={() =>
                      set({
                        iconKey: key,
                        customIcon: null,
                        customIconName: null,
                      })
                    }
                    title={label}
                    aria-label={label}
                    className={`grid h-[52px] place-items-center rounded-lg border transition-colors ${
                      on
                        ? "border-[#C4A9E8] bg-[#F8F4FF] text-[#6D33AA]"
                        : "border-[#E5E5E5] text-[#8A8A8A] hover:border-[#D5D5D5] hover:text-[#555]"
                    }`}
                  >
                    {/* One weight for every icon, selected or not. Thickening
                        the chosen one made the row read as two different sets
                        — colour already says which is picked. */}
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

            <div className="mt-4" />
            <FieldLabel>Size{isMobile ? " on mobile" : ""}</FieldLabel>
            <div className="flex gap-1.5">
              {LAUNCHER_SIZES.map(({ v, label, px }) => {
                /* Edits whichever device is being previewed, so the option
                   lit is always the one on screen. */
                const on = (isMobile ? s.sizeMobile : s.size) === v;
                return (
                  <button
                    key={v}
                    onClick={() =>
                      set(isMobile ? { sizeMobile: v } : { size: v })
                    }
                    className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg border py-2 transition-colors ${
                      on
                        ? "border-[#C4A9E8] bg-[#F8F4FF] text-[#6D33AA]"
                        : "border-[#E5E5E5] text-[#666] hover:border-[#D5D5D5] hover:text-[#333]"
                    }`}
                  >
                    <span className="text-[12px] font-medium">{label}</span>
                    {/* The number under the name. It is the thing a customer
                        matching a launcher to their own design system
                        actually needs, and "medium" on its own tells them
                        nothing about whether it will fit. */}
                    <span className="text-[11px] opacity-70">{px}px</span>
                  </button>
                );
              })}
            </div>
          </div>
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
          {/* What the toggle actually governs. Off, it removes the card from
              beside the button — it does not stop the agent greeting, because
              that line is the conversation's first message and belongs to the
              conversation. The old wording said the same thing but read as a
              description of the card rather than as the caveat it is. */}
          <p className="text-[11px] leading-snug text-[#A8A8A8]">
            Shown beside the button. The conversation still opens with it.
          </p>
        </Group>
      )}

      {/* ── APPEARANCE — differs entirely by type ── */}
      {/* Both launchers have one.

          It was inside the composer's branch, which read as "the composer has
          a placeholder and the button does not" — and that is not true of
          either. The button launcher has no field of its own, but it opens the
          messenger, and the messenger's field is the same field with the same
          placeholder in it. Hiding the setting there meant a customer on the
          button launcher could not change a line of copy their visitors see on
          every conversation.

          What differs is only how much of the sentence applies: the composer
          also cycles the suggestions through it at rest, and the button
          launcher has nothing resting to cycle them through. */}
      <Group title="Placeholder">
        <span className="mb-2 block text-[11px] leading-snug text-[#A8A8A8]">
          {isComposer
            ? "Shown in the expanded launcher and the messenger. At rest it cycles the suggestions."
            : "Shown in the messenger's message field."}
        </span>
        <input
          value={s.placeholder}
          onChange={(e) => set({ placeholder: e.target.value })}
          placeholder="Ask me anything…"
          className="w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-[13px] text-[#333] outline-none focus:border-[#C9C9C9]"
        />
      </Group>

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
          hint="As it arrives. Muted until the visitor interacts with the page."
          on={s.soundOn}
          onChange={(soundOn) => set({ soundOn })}
        />
        {/* Only once the toggle is on. A picker for a sound nobody will hear
            is a decision offered for no reason. */}
        {s.soundOn && (
          <div className="mt-2.5">
            <div className="flex items-center gap-1.5">
              <div className="relative min-w-0 flex-1">
                <select
                  value={s.sound}
                  onChange={(e) => {
                    const sound = e.target.value as SoundId;
                    set({ sound });
                    /* Choosing plays it. A dropdown of sounds you have to
                       press a second button to hear is a list of words. */
                    playSound(sound);
                  }}
                  className="h-9 w-full appearance-none rounded-lg border border-[#E5E5E5] bg-white pl-3 pr-9 text-[13px] text-[#333] outline-none focus:border-[#C9C9C9]"
                >
                  {SOUNDS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#9A9A9A]"
                  strokeWidth={2}
                />
              </div>
              <button
                onClick={() => playSound(s.sound)}
                aria-label="Play this sound"
                title="Play"
                className="grid size-9 shrink-0 place-items-center rounded-lg border border-[#E5E5E5] text-[#666] transition-colors hover:border-[#D5D5D5] hover:text-[#333]"
              >
                <Volume2 className="size-4" strokeWidth={1.8} />
              </button>
            </div>
          </div>
        )}
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
  siteUrl,
  setSiteUrl,
  corners,
  setCorners,
  tone,
  setTone,
  thinkMark,
  setThinkMark,
  thinkMarkSrc,
  setThinkMarkSrc,
  thinkLabel,
  setThinkLabel,
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
  /* Shared with the launcher's preview field rather than asked for twice: it
     is the same site either way, and a tenant who has already typed it should
     not have to type it again to be matched to it. */
  siteUrl: string;
  setSiteUrl: (v: string) => void;
  corners: Corners;
  setCorners: (v: Corners) => void;
  tone: SurfaceTone;
  setTone: (v: SurfaceTone) => void;
  thinkMark: ThinkingMark;
  setThinkMark: (v: ThinkingMark) => void;
  thinkMarkSrc: string | null;
  setThinkMarkSrc: (v: string | null) => void;
  thinkLabel: string;
  setThinkLabel: (v: string) => void;
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

  /* Every group, every time. Selection came out of the preview, so there is
     nothing left to filter against — and a panel that shows everything is
     what it was before any of it. */
  const show = (_k: GroupKey) => true;

  // what the header falls back to with no logo uploaded
  const initial = (name.trim()[0] ?? "T").toUpperCase();

  return (
    <div>

      {/* ── BRAND IDENTITY ── */}
      {show("brand") && (
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

      </Group>
      )}

      {/* ── COLOUR ── its own group rather than a field at the foot of Brand
             identity. The accent was filed under the agent's name and the
             surface tone under Shape, which left "make it blue" spread over
             three headings and findable only by someone who already knew. */}
      {show("colour") && (
      <Group title="Colour">
        <div>
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
      )}

      {/* ── THEME ── everything the messenger is made of, in one group: the
             typeface, the corners, the ground it sits on, and which end of the
             palette it draws from.

             Corners and surface used to be a Shape group of their own, which
             split the look across two headings for no reason a tenant could
             see — they are the same decision as the font, made about a
             different property.

             Font leads: it changes every screen. Mode reads last, because it
             does not change what any of the others are, only which end of one
             palette they resolve to. */}
      {show("theme") && (
      <Group title="Theme">
        <FieldLabel>Font</FieldLabel>
        <div className="relative">
          <select
            value={font}
            onChange={(e) => {
              /* Fetched on choosing rather than on opening: a picker with
                 thirty families in it should not pull thirty stylesheets to
                 show a list of names. */
              loadFont(e.target.value);
              setFont(e.target.value);
            }}
            style={{ fontFamily: fontStack(font) }}
            className="h-9 w-full appearance-none rounded-lg border border-[#E5E5E5] bg-white pl-3 pr-9 text-[13px] text-[#333] outline-none focus:border-[#C9C9C9]"
          >
            {FONTS.map((f) => (
              <option key={f} value={f}>
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

        <FieldLabel>Corners</FieldLabel>
        <div className="flex gap-1.5">
          {(
            [
              ["sharp", "Sharp"],
              ["soft", "Soft"],
              ["round", "Round"],
            ] as const
          ).map(([v, label]) => {
            const on = corners === v;
            return (
              <button
                key={v}
                onClick={() => setCorners(v)}
                className={`flex flex-1 flex-col items-center gap-1.5 rounded-lg border py-2 transition-colors ${
                  on
                    ? "border-[#C4A9E8] bg-[#F8F4FF]"
                    : "border-[#E5E5E5] hover:border-[#D5D5D5]"
                }`}
              >
                {/* the corner itself, at the scale it will be drawn */}
                <span
                  className="size-5 border-2"
                  style={{
                    borderColor: on ? ACCENT : "#C7C7CF",
                    borderRadius: CORNERS[v].bubble,
                    borderRightColor: "transparent",
                    borderBottomColor: "transparent",
                  }}
                />
                <span
                  className={`text-[11px] ${on ? "font-semibold text-[#6D33AA]" : "font-medium text-[#777]"}`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mb-4" />
        <FieldLabel>Surface</FieldLabel>
        <div className="flex gap-1.5">
          {(
            [
              ["white", "White"],
              ["warm", "Warm"],
              ["cool", "Cool"],
            ] as const
          ).map(([v, label]) => {
            const on = tone === v;
            const swatch = mixHex("#FFFFFF", TONE[v].hue, TONE[v].amount);
            return (
              <button
                key={v}
                onClick={() => setTone(v)}
                className={`flex flex-1 flex-col items-center gap-1.5 rounded-lg border py-2 transition-colors ${
                  on
                    ? "border-[#C4A9E8] bg-[#F8F4FF]"
                    : "border-[#E5E5E5] hover:border-[#D5D5D5]"
                }`}
              >
                <span
                  className="size-5 rounded-full ring-1 ring-black/10"
                  style={{ background: swatch }}
                />
                <span
                  className={`text-[11px] ${on ? "font-semibold text-[#6D33AA]" : "font-medium text-[#777]"}`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 text-[11px] leading-snug text-[#A8A8A8]">
          Most sites are not pure white. Matching their ground is what stops
          the panel reading as a bright rectangle cut into the page.
        </p>

        <div className="mb-4" />
        <FieldLabel>Mode</FieldLabel>
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { v: "light" as Mode, label: "Light", Icon: Sun },
            { v: "dark" as Mode, label: "Dark", Icon: Moon },
          ]}
        />
      </Group>
      )}


      {/* ── THINKING ── the one moment the agent is visibly working, and the
             only part of the transcript it writes before it has anything to
             say. Two settings, because they answer different questions: the
             mark says who is working and the line says what about. */}
      {show("thinking") && (
      <Group title="Thinking">
        <FieldLabel>Mark</FieldLabel>
        <div className="flex gap-1.5">
          {/* The upload leads. It is the only cell with anything to receive,
              and a tenant who has their own mark is here for that one — the
              two platform marks are already in the room. */}
          <MarkUploadCell
            on={thinkMark === "custom"}
            src={thinkMarkSrc}
            onPick={(src) => {
              setThinkMarkSrc(src);
              /* Uploading is choosing. Landing an image in a cell that then
                 sits unselected beside the one still in use is a second
                 press for a decision already made. */
              setThinkMark("custom");
            }}
            onClear={() => {
              setThinkMarkSrc(null);
              if (thinkMark === "custom") setThinkMark("sparkle");
            }}
          />
          <MarkCell
            on={thinkMark === "sparkle"}
            onClick={() => setThinkMark("sparkle")}
            label="Sparkle"
          >
            <Sparkles className="size-4" strokeWidth={1.8} />
          </MarkCell>
          <MarkCell
            on={thinkMark === "orb"}
            onClick={() => setThinkMark("orb")}
            label="Orb"
          >
            <Circle className="size-4" strokeWidth={1.8} />
          </MarkCell>
        </div>
        <div className="mb-4" />
        <FieldLabel>Label</FieldLabel>
        <input
          value={thinkLabel}
          onChange={(e) => setThinkLabel(e.target.value)}
          /* The placeholder is the first line of the rotation, so an empty
             field shows what leaving it empty gets you rather than inviting
             a word for it. */
          placeholder={THINKING_PHRASES[0]}
          className="h-9 w-full rounded-lg border border-[#E5E5E5] px-3 text-[13px] text-[#333] outline-none focus:border-[#C9C9C9]"
        />
        <p className="mt-1.5 text-[11px] leading-snug text-[#A8A8A8]">
          {thinkLabel.trim()
            ? "Shown every time the agent is working."
            : `Empty cycles the default four — “${THINKING_PHRASES[0]}”, then “${THINKING_PHRASES[1]}”, and so on.`}
        </p>
      </Group>
      )}

      {/* ── MESSAGES ── */}
      {show("messages") && (
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
      )}
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

/* How long a hovered launcher takes to lay its suggestions out, however many
   there are. Longer than the messenger's run because this one is answering a
   gesture rather than a message — the visitor has just arrived at the cluster,
   and something that finishes before they have focused on it may as well have
   been there all along. */
const REVEAL_RUN_MS = 260;

/* How long the suggestions stay up after a phone stops scrolling. Long enough
   to read three of them and reach for one; short enough that a launcher does
   not end up permanently expanded over the page it is sitting on. */
const SCROLL_HOLD_MS = 4500;
/* How far the page has to move before it counts as a direction rather than a
   thumb settling. */
const SCROLL_TURN_PX = 6;

const WORD_MS = 36;
const WORD_IN_MS = 320;
const wordCount = (t: string) => t.split(/\s+/).filter(Boolean).length;
const streamMs = (t: string) => wordCount(t) * WORD_MS + WORD_IN_MS;
/* How long the trace says it thought, off the answer it produced. A longer
   reply is a longer piece of work, so the number moves with the message rather
   than being picked per turn — nine turns all claiming eight seconds is the one
   thing that would give the trace away as decoration. Floored at two, because
   nothing takes one second, and capped at nine, because a chat that stops for
   ten is a chat that has stalled. */
const traceSecs = (t: string) =>
  Math.max(2, Math.min(9, Math.round(wordCount(t) / 9)));

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
  dark,
  mark = "sparkle",
  markSrc = null,
  neutral,
  streaming,
}: {
  secs: number;
  steps: TraceStep[];
  accent: string;
  dark?: boolean;
  mark?: ThinkingMark;
  markSrc?: string | null;
  neutral: Record<string, string>;
  streaming: boolean;
}) {
  const [open, setOpen] = useState(false);
  /* The accent as a foreground, which is a different question from the accent
     as a fill. On white the brand reads as given; on charcoal a mid-dark brand
     is a smudge, so dark takes its lighter partner — the same one the sparkle
     and the chip ring already switch to, so the trace agrees with everything
     else on the surface rather than being the one thing still in the base
     colour. */
  const ink = dark ? liteOf(accent) : accent;
  return (
    <div
      /* w-full because the turn above is `items-start`, which shrinks every
         child to its own content — without it the trace is only as wide as
         its longest sentence, and the tool block's measure is computed
         against that rather than against the reply. */
      className="mb-2 w-full"
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
        className="flex w-fit items-center gap-2 rounded-full py-0.5 pr-2 text-[13px] transition-colors"
        style={{ color: open ? ink : neutral.secondary }}
      >
        {/* The configured mark, not the platform sparkle. The row that says
            what the agent did should be wearing the same face it wore while
            doing it — a mark that changes at the handover reads as two
            different things having happened. */}
        <ThinkingMarkView
          mark={mark}
          src={markSrc}
          dark={!!dark}
          accent={accent}
          paused={!streaming}
        />
        Thought for {secs}s
        <ChevronDown
          className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>
      {open && (
        <ul className="mt-1.5 ml-1 flex flex-col gap-1">
          {steps.map((st, i) =>
            isToolCall(st) ? (
              <ToolCallStep
                key={st.tool + i}
                call={st}
                accent={ink}
                neutral={neutral}
              />
            ) : (
              <li
                key={st}
                className="flex items-center gap-2 text-[13px]"
                style={{ color: neutral.secondary }}
              >
                <Check
                  className="size-3.5 shrink-0"
                  strokeWidth={2.5}
                  style={{ color: ink }}
                />
                {st}
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}

/* One tool call in the trace.

   It sits at the same indent as the sentences around it and reads as one of
   them — the name of the thing that ran, in the type the arguments are
   actually written in. Closed, that is all it says: the fact that a tool ran
   belongs in the sequence, and what it was handed does not.

   Opening it is the second question. Input and output are stacked rather than
   side by side, because the panel is 380px on a phone and two columns of code
   at that width is one character per line. */
function ToolCallStep({
  call,
  accent,
  neutral,
}: {
  call: ToolCall;
  accent: string;
  neutral: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-fit items-center gap-2 text-left text-[13px] transition-colors"
        style={{ color: open ? neutral.ink : neutral.secondary }}
      >
        <Wrench
          className="size-3.5 shrink-0"
          strokeWidth={2.5}
          style={{ color: accent }}
        />
        <span className="font-mono text-[12px]">{call.tool}</span>
        <ChevronDown
          className={`size-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2.5}
          style={{ color: neutral.muted }}
        />
      </button>
      {open && (
        /* The reply's own measure — the same 90% the AI bubble is capped at,
           so the trace and the answer it belongs to share one right edge
           instead of the trace running wider than the message that produced
           it. No left indent: that was costing 22px off every line of an
           input already the narrowest thing in the panel, and the row above
           says what the block belongs to.

           One scroll region rather than one per half: two boxes each with
           their own bar, inside a transcript that also scrolls, is three
           things to get lost in. The call scrolls as the single thing it
           is. */
        <div
          className="scrollbar-subtle mt-1.5 flex max-h-[250px] w-full max-w-[90%] flex-col gap-2 overflow-y-auto rounded-lg p-2.5"
          style={{ background: neutral.paper }}
        >
          <TraceIO label="Input" value={call.input} neutral={neutral} />
          <TraceIO
            label="Output"
            value={call.output}
            neutral={neutral}
            accent={accent}
          />
        </div>
      )}
    </li>
  );
}

/* Either half of a tool call, printed as the JSON it is.

   Not flattened into rows: a payload is nested, and the nesting is part of
   what someone opening this is checking. The block wraps rather than scrolls
   sideways — a 380px panel and a 400-character content string only agree
   with each other if the lines break — and it caps its height, because a
   five-result response is taller than the transcript it sits in. */
function TraceIO({
  label,
  value,
  neutral,
  accent,
}: {
  label: string;
  value: Json;
  neutral: Record<string, string>;
  /* Only the output is marked, and only with the arrow — this is the half
     that came back. */
  accent?: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1">
        {accent && (
          <CornerDownRight
            className="size-3 shrink-0"
            strokeWidth={2.5}
            style={{ color: accent }}
          />
        )}
        <span
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: neutral.muted }}
        >
          {label}
        </span>
        {/* Against the right edge, on the line that names what it copies —
            a payload is the one thing in a transcript nobody retypes. */}
        <CopyJson value={value} neutral={neutral} />
      </div>
      <JsonBlock value={value} neutral={neutral} accent={accent} />
    </div>
  );
}

/* How long "Copied" stands before the control goes back to offering. Long
   enough to be read as an answer to the press, short enough that a second
   copy doesn't have to wait for it. */
const COPIED_MS = 1200;

function CopyJson({
  value,
  neutral,
}: {
  value: Json;
  neutral: Record<string, string>;
}) {
  const [done, setDone] = useState(false);
  /* Held so a press that lands while the last one is still showing restarts
     the window rather than cutting it short, and so a block collapsed
     mid-window doesn't set state on something that has gone. */
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const copy = () => {
    navigator.clipboard?.writeText(JSON.stringify(value, null, 2));
    setDone(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDone(false), COPIED_MS);
  };
  return (
    <button
      onClick={copy}
      aria-label={done ? "Copied" : "Copy"}
      className="ml-auto flex shrink-0 items-center gap-1 rounded px-1 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors hover:bg-[color-mix(in_oklab,currentColor_10%,transparent)]"
      style={{ color: neutral.muted }}
    >
      {done ? (
        <Check className="size-3" strokeWidth={2.5} />
      ) : (
        <Copy className="size-3" strokeWidth={2} />
      )}
      {done ? "Copied" : "Copy"}
    </button>
  );
}

/* Tokens worth colouring, in one pass over the stringified payload: a quoted
   run followed by a colon is a key, any other quoted run is a string, and the
   bare words are the literals. Everything the regex skips — braces, brackets,
   commas, indentation — falls through as punctuation and takes the faint ink,
   which is what lets the structure sit behind the content instead of in front
   of it. */
const JSON_TOKENS =
  '("(?:\\\\.|[^"\\\\])*")(\\s*:)|("(?:\\\\.|[^"\\\\])*")|\\b(true|false|null)\\b|(-?\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?)';

function JsonBlock({
  value,
  neutral,
  accent,
}: {
  value: Json;
  neutral: Record<string, string>;
  accent?: string;
}) {
  const text = JSON.stringify(value, null, 2);
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  /* Built per call rather than shared: a global regex carries `lastIndex`
     between uses, and two blocks open at once would each start scanning
     wherever the other one stopped. */
  const scan = new RegExp(JSON_TOKENS, "g");
  while ((m = scan.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const [, key, colon, str, lit, num] = m;
    const tint = key
      ? neutral.secondary
      : str
        ? neutral.ink
        : (accent ?? neutral.ink);
    out.push(
      <span key={m.index} style={{ color: tint }}>
        {key ?? str ?? lit ?? num}
      </span>,
    );
    if (colon) out.push(colon);
    last = m.index + m[0].length;
  }
  out.push(text.slice(last));
  return (
    <pre
      /* 12px rather than the 11 the rest of the small print runs at: this is
         the one block in the panel meant to be read character by character,
         and a monospace face at 11 gives up more than the line it saves.
         No scroll of its own — the block it sits in owns that. */
      className="whitespace-pre-wrap break-words font-mono text-[12px] leading-[1.65]"
      style={{ color: neutral.muted }}
    >
      {out}
    </pre>
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
          className="ml-1.5 text-[12px] tabular-nums"
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
/* A line of the trace. Most are a sentence about something the agent did and
   need nothing more than to be read. A tool call is the exception: what went
   in and what came back are the whole point of showing it, so it carries them
   and opens to say so. Kept as a union rather than a second list, because the
   order the two happened in is the one thing the trace is actually for. */
type ToolCall = {
  tool: string;
  /* Whatever the tool was actually handed and actually returned — nested
     objects, arrays, the lot. Printed as JSON rather than flattened into
     rows: the shape is part of what you are checking, and a list of
     key/value pairs quietly throws it away. */
  input: Json;
  output: Json;
};
type TraceStep = string | ToolCall;
const isToolCall = (s: TraceStep): s is ToolCall => typeof s !== "string";

type Msg = {
  from: "ai" | "user";
  text: string;
  buttons?: string[];
  followUps?: string[];
  sources?: Source[];
  steps?: TraceStep[];
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
/* The phone launcher rests at 300 and opens to 342 — 24 either side of a 390
   handset, which is the widest it can go and still read as an object resting on
   the page rather than a bar across the bottom of it. The preview frame is 380,
   so it shows a little tighter than a real phone would. */
/* 250 at rest in a 380 frame, opening to 342. The gap between the two is the
   point on a phone: the resting pill is a small thing parked over someone's
   page, and the suggestions are what it grows to hold. */
const MOBILE = { width: 250, widthOpen: 342, bottom: 24 };
/* What the open pane leaves either side of itself. Enough that the customer's
   page is visibly still there behind the launcher, which is the difference
   between a widget and a bar. */
const PANE_GUTTER = 24;
/* Shorter and tighter than the desktop pill, and the radius follows the height
   so it stays a true stadium rather than a rounded box. The weight comes off in
   space rather than in type: 14px is the smallest a line of body text can be on
   a phone and still be read one-handed, in motion, outdoors — the padding around
   it has no such floor. */
const PILL_MOBILE = { height: 52, radius: 26, pad: 6, sendPx: 40 };

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

/* A suggestion's hover, which is one thing in light and needs to be two in
   dark.

   In light the chip is a pale fill on a white panel and an accent ring at 45%
   is plenty — there is nothing else near that colour. In dark the chip is
   already a dark fill on a dark panel, and a half-transparent accent laid over
   it lands within a few points of the surface it is meant to be lifting off:
   the ring is technically there and effectively invisible. So dark gets the
   accent's lighter partner at close to full strength, and a wash over the
   whole chip as well — because at that contrast one hairline is a smaller
   signal than the same hairline is on white, and the fill makes up the
   difference. */
function chipHover(accent: string, dark: boolean) {
  return {
    stroke: dark
      ? `color-mix(in oklab, ${liteOf(accent)} 88%, transparent)`
      : `color-mix(in srgb, ${accent} 45%, transparent)`,
    /* Painted as an inset spread rather than a background, so it layers over
       whatever fill the chip was given instead of competing with an inline
       style for the same property. Transparent in light: the ring alone is
       already the clearest thing on a white panel. */
    wash: dark ? "rgba(255,255,255,0.07)" : "transparent",
  };
}

/* The mark beside the thinking line: the tenant's own image, the platform
   sparkle, or a live orb. The upload comes first because it is the only one
   that needs somewhere to put something — the other two are already here. */
type ThinkingMark = "custom" | "sparkle" | "orb";

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
/* The row's last message: two lines at 13px, and the box holds both whether
   the message needs them or not. The line box is set here rather than left to
   the cascade, because the height below is measured in them. */
const DESC_LINES = 2;
const DESC_LINE_PX = Math.round(13 * 1.4);

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
        description:
          "Got it — I've uploaded the delivery confirmation and proof of receipt.",
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
        description: "Here's how the two setups compare for a single register.",
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
        description:
          "I've started the statement review — I'll come back with the fee comparison.",
        time: "Aug 12",
        channel: "whatsapp",
        status: "waiting",
        handedTo: "Marcus",
      },
      {
        id: "c4",
        title: "First look at payment options",
        description:
          "Hi — welcome. I can help with rates, payouts, or getting set up.",
        time: "Aug 6",
        channel: "web",
        status: "closed",
      },
    ],
  },
];

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
/* How far the row slides, and how far it has to be dragged before letting go
   opens it rather than snapping back. The width is two 66px targets, which is
   the smallest a thumb reliably hits; the trigger is a third of that, so a
   deliberate pull opens and a stray one while scrolling does not. */
const SWIPE_W = 132;
const SWIPE_TRIGGER = SWIPE_W / 3;

function HistoryRow({
  item,
  active,
  menuOpen,
  renaming,
  neutral,
  swipe,
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
  /* No pointer to hover with, so the row is pulled aside instead. Same two
     actions, same state — what changes is the gesture that asks for them. */
  swipe?: boolean;
  onOpen: () => void;
  onMenu: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}) {
  const st = STATUSES[item.status];
  /* Where the finger started and how far it has travelled since. Held in state
     rather than driven by CSS because the row has to follow the thumb — a
     transition that only played on release would be a button that opens late,
     not a drawer being pulled. */
  const from = useRef<number | null>(null);
  const [dx, setDx] = useState(0);
  const dragging = dx !== 0;
  const shift = swipe
    ? Math.max(-SWIPE_W, Math.min(0, (menuOpen ? -SWIPE_W : 0) + dx))
    : 0;
  const onTouchStart = (e: React.TouchEvent) => {
    from.current = e.touches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (from.current === null) return;
    setDx(e.touches[0].clientX - from.current);
  };
  const onTouchEnd = () => {
    from.current = null;
    /* Judged on where the row ended up, not on how hard it was flicked. The
       drawer is either far enough open to be aimed at or it is not. */
    const wantsOpen = shift < -SWIPE_TRIGGER;
    if (wantsOpen !== menuOpen) onMenu();
    setDx(0);
  };
  const row = (
    <div
      className="group/row relative flex w-full items-start rounded-xl px-5 py-2.5 text-left transition-colors"
      onTouchStart={swipe ? onTouchStart : undefined}
      onTouchMove={swipe ? onTouchMove : undefined}
      onTouchEnd={swipe ? onTouchEnd : undefined}
      style={{
        /* Opaque while it can be pulled aside, or the actions behind it show
           through the row that is meant to be covering them. */
        background:
          active || menuOpen
            ? neutral.paper
            : swipe
              ? neutral.surface
              : undefined,
        transform: swipe ? `translateX(${shift}px)` : undefined,
        /* Follows the thumb while it is down, eases home when it lets go. */
        transition: dragging
          ? "none"
          : `transform 220ms cubic-bezier(0.16, 1, 0.3, 1), background-color 150ms`,
      }}
    >
      {!active && !menuOpen && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover/row:opacity-100"
          style={{ background: neutral.paper }}
        />
      )}
      {/* No avatar. Every row in this list is a conversation with the same
          agent, so a mark that is identical down the whole column identifies
          nothing — it was 36px of indent bought with the width the last message
          needed. */}
      <span className="relative min-w-0 flex-1">
        {/* One line, and it does not wrap. Wrapping is what made every card a
            different shape: where the title and the status filled the width the
            time dropped to a line of its own, where they did not it stayed up —
            so four rows of the same component had four layouts. The title gives
            way instead, which is the one part of the line that can lose its end
            and still be read. */}
        <span className="flex items-center gap-2">
          {renaming ? (
            /* The title in place, at the same size and weight, so committing the
               change does not make the row jump. */
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
            <button
              onClick={onOpen}
              className="min-w-0 flex-1 truncate text-left text-[14px] font-medium leading-snug"
              style={{ color: neutral.ink }}
            >
              {item.title}
            </button>
          )}
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
          <span className="relative shrink-0">
            <span
              className={`block text-[11px] tabular-nums transition-opacity ${
                swipe
                  ? ""
                  : menuOpen
                    ? "opacity-0"
                    : "group-hover/row:opacity-0"
              }`}
              style={{ color: neutral.muted }}
            >
              {item.time}
            </span>
            <button
              /* Stopped here. The list closes any open menu on click, and without
               this the button's own click carried straight up to it — the menu
               opened and shut inside the same event, so nothing appeared. */
              onClick={(e) => {
                e.stopPropagation();
                onMenu();
              }}
              hidden={swipe}
              aria-label={`Options for ${item.title}`}
              className={`absolute -right-1 -top-1 grid size-6 place-items-center rounded-full transition-opacity hover:bg-[color-mix(in_oklab,currentColor_10%,transparent)] ${
                menuOpen
                  ? "opacity-100"
                  : "opacity-0 group-hover/row:opacity-100"
              }`}
              style={{ color: neutral.secondary }}
            >
              <MoreHorizontal className="size-4" strokeWidth={2} />
            </button>
            {menuOpen && !swipe && (
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
                  className="flex items-center gap-2 px-3 py-1.5 text-left text-[13px] transition-colors hover:bg-[var(--wash)]"
                  style={{ color: neutral.ink }}
                >
                  <Pencil className="size-3.5" strokeWidth={2} />
                  Rename
                </button>
                <button
                  onClick={onDelete}
                  className="flex items-center gap-2 px-3 py-1.5 text-left text-[13px] transition-colors hover:bg-[var(--wash)]"
                  style={{ color: "#D03A3A" }}
                >
                  <Trash2 className="size-3.5" strokeWidth={2} />
                  Delete
                </button>
              </span>
            )}
          </span>
        </span>
        {/* The last message, not a description. It is the second of the two
            things a visitor is scanning for — the title says which
            conversation, this says where it got to — and it is the reason the
            channel tag and the live-agent mark gave up their space. Two lines,
            because one truncates most replies before they say anything. */}
        <button
          onClick={onOpen}
          className="mt-0.5 block w-full text-left text-[13px]"
          /* Two lines of room, always — held open whether the message fills
             them or not. Clamping alone gave a one-line message a shorter card
             than a two-line one, so the rows in a list were three different
             heights and the eye had to re-find the shape at every one. The
             height is the line box times the cap rather than a number picked to
             look right, so changing either keeps them in step. */
          style={{
            color: neutral.secondary,
            lineHeight: `${DESC_LINE_PX}px`,
            minHeight: DESC_LINE_PX * DESC_LINES,
          }}
        >
          <span
            className="block w-full"
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: DESC_LINES,
              overflow: "hidden",
            }}
          >
            {item.description}
          </span>
        </button>
      </span>
    </div>
  );

  if (!swipe) return row;
  /* The drawer the row is pulled off. It sits underneath rather than sliding in
     beside, so the row itself is the thing that moves — one surface travelling
     over another, which is what a swipe has always meant on a phone. Rename
     first because it is the reversible one; delete last, in the corner a thumb
     only reaches by overshooting. */
  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Only while the row is off its mark. Left mounted underneath, it showed
          through the corners and the right-hand edge as a hairline: the row is
          opaque and rounded, the wrapper clips to the same radius, and where two
          antialiased curves meet neither quite covers the other — so a pixel of
          the drawer leaked all the way round every card. Nothing behind the row
          means nothing to leak. */}
      {(menuOpen || dragging) && (
        <span
          className="absolute inset-y-0 right-0 flex"
          style={{ width: SWIPE_W }}
        >
          <button
            onClick={() => onRename(item.title)}
            className="flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium"
            style={{ background: neutral.paper, color: neutral.secondary }}
          >
            <Pencil className="size-4" strokeWidth={2} />
            Rename
          </button>
          <button
            onClick={onDelete}
            className="flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium text-white"
            style={{ background: "#D03A3A" }}
          >
            <Trash2 className="size-4" strokeWidth={2} />
            Delete
          </button>
        </span>
      )}
      {row}
    </div>
  );
}

/* The archive: a way to start a new one, then the rows in date groups. */
function HistoryList({
  neutral,
  accent,
  swipe,
  onOpen,
}: {
  neutral: Record<string, string>;
  accent: string;
  swipe?: boolean;
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
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[color-mix(in_oklab,currentColor_10%,transparent)]"
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
                swipe={swipe}
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

function AiThinking({
  accent,
  mark = "sparkle",
  markSrc = null,
  label = "",
  steps = [],
  neutral,
  dark = false,
}: {
  accent: string;
  mark?: ThinkingMark;
  markSrc?: string | null;
  /* The opening line. Empty takes the platform's own. */
  label?: string;
  /* The trace of the turn being produced. The row narrates it rather than a
     generic rotation: what the agent is doing is the most specific thing it
     could be saying while it does it, and it is already known — the reply is
     decided before the row goes up. */
  steps?: TraceStep[];
  neutral?: Record<string, string>;
  dark?: boolean;
}) {
  const [i, setI] = useState(0);

  /* The opening line, then the work. A tool call narrates as the tool it
     called — the name is what ran, and a sentence about it would be inventing
     copy the trace does not carry. */
  const lines = useMemo(() => {
    const first = label.trim() || THINKING_PHRASES[0];
    const work = steps.map((st) => (isToolCall(st) ? st.tool : st));
    if (work.length) return [first, ...work];
    /* Nothing to narrate: a custom line stands alone, and the platform's
       rotation is what is left otherwise. */
    return label.trim() ? [first] : THINKING_PHRASES;
  }, [label, steps]);

  /* No reset needed when a turn changes: the row is only mounted while
     something is in flight, so every narration starts on a fresh component. */

  useEffect(() => {
    if (lines.length < 2) return;
    /* Each line is held for as long as it takes to read — a three-word step
       and a nine-word one do not deserve the same beat, and a fixed interval
       gave the long ones no chance. Wraps to 1 rather than 0: the opening
       line is how the row starts, not something it keeps coming back to. */
    const hold = Math.min(1500, 520 + wordCount(lines[i] ?? "") * 190);
    const id = setTimeout(
      () => setI((p) => (p + 1 >= lines.length ? 1 : p + 1)),
      hold,
    );
    return () => clearTimeout(id);
  }, [i, lines]);
  return (
    <div
      className="flex items-center gap-2 text-[14px] font-medium"
      /* the sparkle takes its gradient from these, so it is the tenant's
         accent rather than the composer's default violet */
      style={
        {
          "--brand": accent,
          "--brand-lite": liteOf(accent),
          color: neutral?.ink ?? "#333333",
        } as CSSProperties
      }
    >
      <ThinkingMarkView
        mark={mark}
        src={markSrc}
        dark={dark}
        accent={accent}
      />
      <span
        className="ai-shimmer"
        /* The sweep's two ends are mixed toward black in the stylesheet, which
           is the right direction on a white panel and exactly the wrong one on
           a charcoal: the brand pulled 78% into black is a line you have to
           look for. In dark it goes the other way — the accent lifted into
           white for the body, and white itself for the shine. Set here rather
           than in globals because the element carries its own class rule, and
           only an inline value on the same element outranks it. */
        style={
          dark
            ? ({
                "--shimmer-ink":
                  "color-mix(in oklab, var(--brand, #632E9A) 45%, white)",
                "--shimmer-shine": "#FFFFFF",
              } as CSSProperties)
            : undefined
        }
      >
        {lines[i] ?? lines[0]}
      </span>
    </div>
  );
}

/* The thinking row's mark box, matching SPARKLE_PX — the sparkle is the mark
   the row was built around, so it is the one the others are measured against
   rather than all three meeting at some smaller number. */
const ORB_MARK_PX = 28;

/* The orb's ink, as numbers an SVG filter can eat.

   The component paints monochrome — light ink or dark ink, chosen by its
   theme prop — and takes no colour. CSS variables do not reach a canvas
   either. So the tint is applied after the fact: a flat colour matrix that
   throws away whatever RGB the canvas painted and replaces it with the
   accent, keeping only the alpha, which is where the constellation actually
   lives. The 1.6 on alpha is GlassComposer's own value for the same move —
   the dots are drawn faint enough that a straight copy comes out weaker than
   the mark beside it. */
/* Fattening every dot turned the constellation into a blob: at 28px the gaps
   between nodes are smaller than the nodes, so growing all of them closes the
   gaps and what is left is a disc. Only the front few get fattened instead.

   The pick is GlassComposer's: a steep alpha ramp that passes nothing under
   about 0.97 and everything above it, which isolates the two or three dots
   nearest the viewer — the orb draws depth as opacity, so "brightest" and
   "frontmost" are the same set. Those are dilated; the rest are merged back
   underneath at the size they were drawn. The result reads as a few lit nodes
   in a field of faint ones, which is what the 64px design looks like before
   it is shrunk. */
/* Growing the alpha with a blur, then bringing it back with a gain.

   Not feMorphology: SVG's dilate walks a *box* kernel, so everything it grows
   comes out with the kernel's corners — which is why the dots were square. A
   Gaussian is round.

   And a gain rather than a threshold. Thresholding was the second mistake: a
   blur spreads a hairline's alpha thin, so a ramp steep enough to re-harden
   the edge cut the line off entirely and left a ghost. Multiplying the alpha
   instead can only ever make something more visible — the blur decides how far
   it reaches, the gain decides how solid it comes back, and nothing is
   discarded on the way. */
const ORB_DOT = { soft: 1, gain: 6 };
const ORB_LINE = { soft: 0.3, gain: 3.4 };
/* Where the field stops and the subject begins. The orb draws depth as
   opacity, so this cut is really "how far forward does a node have to be to
   count as one of the lit ones" — at 0.97 a third of the constellation
   qualified and the mark had no subject at all. 0.985 leaves four or five. */
const ORB_PICK = { slope: 70, intercept: -68.9 };

function orbInk(hex: string, alpha = 1) {
  const h = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#632E9A";
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const f = (n: number) => n.toFixed(3);
  return `0 0 0 0 ${f(r)} 0 0 0 0 ${f(g)} 0 0 0 0 ${f(b)} 0 0 0 ${f(alpha)} 0`;
}

/* The mark, at the size the sparkle already occupies so the three are
   interchangeable rather than three different row heights. */
function ThinkingMarkView({
  mark,
  src,
  dark,
  accent,
  paused = false,
}: {
  mark: ThinkingMark;
  src?: string | null;
  dark: boolean;
  accent: string;
  /* Frozen rather than swapped for something else once the work is done: the
     same object that was moving while the agent worked is the one sitting
     still under the finished answer, so the animation stopping is what
     reports the work finishing. */
  paused?: boolean;
}) {
  /* Scoped to this instance: two orbs on screen with the same filter id is one
     filter, and the second one to mount wins. */
  const tintId = useId().replace(/:/g, "");
  if (mark === "orb") {
    return (
      /* Connecting — the constellation wiring itself, the same state the
         composer's own orb runs.

         The 64 preset scaled down rather than the 20 lifted up, which is the
         finding GlassComposer already arrived at: connecting is built from
         nodes and edges, and the sparse 20 design has too few of either to
         read as a constellation once it is small. The box is 22 and the canvas
         inside it is scaled to fit, so the row keeps the height every other
         mark has. */
      <span
        className="flex shrink-0 items-center justify-center overflow-hidden"
        style={{
          width: ORB_MARK_PX,
          height: ORB_MARK_PX,
          /* Its own layer, so the canvas rasterises at one scale wherever the
             row appears — the shimmering label beside it is enough to change
             the compositor's mind otherwise. */
          transform: "translateZ(0)",
          filter: `url(#${tintId})`,
        }}
      >
        <svg width="0" height="0" className="absolute" aria-hidden>
          <filter
            id={tintId}
            colorInterpolationFilters="sRGB"
            /* Room for the dilate to grow into — at the default region a
               fattened dot on the edge is cut in half by the filter box. */
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            {/* the whole drawing, edges included, thickened a little — this
                is the field, not the subject, so it stays under full strength.
                The accent on a light panel; its lighter partner on a dark one,
                which is the same swap the sparkle, the chip ring and the
                trace's ticks already make. */}
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation={ORB_LINE.soft}
              result="lineSpread"
            />
            <feColorMatrix
              in="lineSpread"
              type="matrix"
              values={orbInk(dark ? liteOf(accent) : accent, ORB_LINE.gain)}
              result="base"
            />
            {/* the front few, picked off the alpha and grown round */}
            <feComponentTransfer in="SourceGraphic" result="picked">
              <feFuncA
                type="linear"
                slope={ORB_PICK.slope}
                intercept={ORB_PICK.intercept}
              />
            </feComponentTransfer>
            <feGaussianBlur
              in="picked"
              stdDeviation={ORB_DOT.soft}
              result="dotSpread"
            />
            <feColorMatrix
              in="dotSpread"
              type="matrix"
              values={orbInk(dark ? liteOf(accent) : accent, ORB_DOT.gain)}
              result="fat"
            />
            <feMerge>
              <feMergeNode in="base" />
              <feMergeNode in="fat" />
            </feMerge>
          </filter>
        </svg>
        <span style={{ transform: `scale(${ORB_MARK_PX / 64})` }}>
          {/* Always the light-ink source: the matrix replaces its colour
              outright, so what matters is that the alpha profile is the same
              in both modes rather than which monochrome it started as. */}
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
  /* An upload chosen and then cleared leaves the setting pointing at nothing,
     so the sparkle is what "custom" degrades to rather than a gap in the row. */
  if (mark === "custom" && src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className="size-[22px] shrink-0 rounded-full object-cover"
      />
    );
  }
  return <AccentSparkle size={SPARKLE_PX} paused={paused} />;
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
  steps: [
    "Searched the pricing guide",
    "Read 3 sources",
    {
      tool: "check_rates",
      input: { product: "card_present", region: "UK", monthly_volume: 50000 },
      output: { rate: "1.5% + 20p", settlement: "next day", contract: "none" },
    },
  ],
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

/* ─────────────────── the conversation's state ───────────────────
   Not "how long since they left" but "what state is their conversation in",
   which is the same axis read from the other end and the one engineering is
   already managing. Three states, and two things that can be true inside any
   of them.

   A conversation is RECENT while the visitor still remembers it — they were
   here today, and coming back they will almost always want to carry on. After
   a day it is still OPEN but no longer in mind: it exists, it was never
   finished, and a returning visitor is now as likely to start something new as
   to continue. After a week it closes itself, and the next visit is a first
   visit again.

   The windows are a claim about memory, not a measurement. A day is roughly
   "still remembers asking"; a week is "the reason has passed". They are worth
   arguing about, so they are written down as numbers. Standard across tenants
   for now — the shape allows for per-tenant windows later, but making them
   configurable before anyone has run the standard ones is a lot of surface for
   a question nobody has asked yet.

   Unread and unsent override the lot: something is waiting, and how long ago
   it started does not change that. */
type SessionState =
  /* the state of their conversation */
  | "first"
  | "recent"
  | "open"
  /* and the two things that can be waiting inside any of them */
  | "unread"
  | "draft"
  /* the agent going first, before there is a conversation at all */
  | "floating";

/* Recent while they still remember it; open but no longer recent after that;
   closed, and therefore a first visit again, after a week. */
const RECENT_WITHIN_HOURS = 24;
const CLOSES_AFTER_DAYS = 7;

/* Typed and not sent. An unfinished sentence rather than a complete one: a
   whole message left unsent reads as a decision, and half of one reads as an
   interruption, which is what actually happened. */
const DRAFT = "Can you send me a quote for";

type SessionOption = { id: SessionState; label: string; note: string };

const SESSIONS: SessionOption[] = [
  {
    id: "first",
    label: "First conversation",
    note: `No conversation, or the last one closed itself after ${CLOSES_AFTER_DAYS} days.`,
  },
  {
    id: "recent",
    label: "Recent conversation",
    note: `A conversation from the last ${RECENT_WITHIN_HOURS} hours. They still remember it, so the launcher offers it back and the panel opens on it.`,
  },
  {
    id: "open",
    label: "Open conversation",
    note: `Older than ${RECENT_WITHIN_HOURS} hours and not yet closed. It exists but is out of mind, so the panel opens fresh and offers the old one as a card.`,
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
  {
    id: "floating",
    label: "Floating message",
    note: "The agent goes first, on a page the visitor is reading. Nothing has been said yet — so pressing it opens the conversation on that message rather than on a greeting.",
  },
];

/* ─── what can go wrong, and the one thing that is not wrong at all ───────
   Parked. The picker that drove these came out from under the preview until
   the states themselves are built — a row of chips that change a caption and
   nothing else is a promise the panel cannot keep. The catalogue stays
   because the writing is the part worth keeping; the row is a dozen lines to
   put back.

   A second lens on the preview, next to the visitor's state. The two are
   independent: a send can fail on a first visit or a fifth, so this is its
   own row rather than more entries in that one.

   Handoff sits in the list because it is where people look for it, not
   because it is a failure — it is the flow working. Its failure is the entry
   under it. */
type ErrState =
  | "none"
  | "loading"
  | "aiFailed"
  | "sendFailed"
  | "handoff"
  | "handoffFailed"
  | "offline"
  | "reconnecting"
  | "tooLong"
  | "fileRejected"
  | "transcriptionFailed";

const ERROR_STATES: { id: ErrState; label: string; note: string }[] = [
  {
    id: "none",
    label: "None",
    note: "The conversation as it runs when nothing is in the way.",
  },
  {
    id: "loading",
    label: "Loading",
    note: "The panel is open and the history is still coming. A skeleton of the shape that is arriving, rather than a spinner in an empty box.",
  },
  {
    id: "aiFailed",
    label: "AI couldn’t reply",
    note: "The work happened and the answer did not. The trace stays on screen with the retry under it — dropping it would make a turn that half-happened look like one that never started.",
  },
  {
    id: "sendFailed",
    label: "Send failed",
    note: "Their message never left. The failure belongs on their own bubble, because that is the thing that failed, and their words stay exactly where they typed them.",
  },
  {
    id: "handoff",
    label: "Human handoff",
    note: "Not an error. The agent is handing the conversation to a person, and the transcript goes with it — nobody should have to say it twice.",
  },
  {
    id: "handoffFailed",
    label: "Handoff failed",
    note: "Nobody is available. Offers the fallback beside the retry, since trying again may not be the right move at 2am.",
  },
  {
    id: "offline",
    label: "Visitor offline",
    note: "The network dropped on their side. The conversation stays readable and the composer keeps taking text, because what they write now is what they will send when it comes back.",
  },
  {
    id: "reconnecting",
    label: "Reconnecting",
    note: "Transient, so it says what is happening rather than offering a button. Nothing to decide.",
  },
  {
    id: "tooLong",
    label: "Message too long",
    note: "The count arrives only once it matters. A counter present from the first keystroke is a limit nobody asked about.",
  },
  {
    id: "fileRejected",
    label: "File rejected",
    note: "Wrong type or over the size. Names the actual file and the actual limit, at the field, and clears on the next keystroke.",
  },
  {
    id: "transcriptionFailed",
    label: "Transcription failed",
    note: "They spoke and nothing came back as words. The recording is the thing to protect — offer it again before offering the keyboard.",
  },
];

/* The visitor's way back in, worn as the field's own line. Written in the
   agent's voice, which is why the ordinary placeholder cannot say it: that
   slot is where the visitor's own words go. */

/* The recall card's measure, and how many lines of the reply it gives. Two
   lines is the glimpse: enough to recognise the answer, not so much that a
   launcher resting on someone's page turns into a paragraph.

   The reply is cut to what those two lines hold rather than left to overflow
   them, because it types itself in — a typewriter that keeps running after the
   text stops changing is three seconds of nothing happening. */

const CARD_W = 300;
/* The card the agent talks from — a greeting, an unread, the visitor's own
   draft. Fixed rather than hugging its text: three states whose card sized
   itself to whatever sentence it happened to be holding gave three different
   silhouettes for one object, and the difference showed the moment anyone
   flipped between them. */
const TALK_W = 232;
const CARD_LINES = 2;
const CARD_CHARS = Math.floor((CARD_W - 32) / 6.7) * CARD_LINES;

/* What the resting field can hold before it clips: its own width less the mark,
   the send disc and the padding either side, over the average advance of a
   character at 14px in this weight. Measured off the geometry rather than
   picked, so widening the pill types more of the sentence instead of leaving a
   number behind that has to be retuned by hand. */
const FIELD_CHARS = Math.floor(
  (V6.widthShut - V6.pad * 2 - 20 - 24 - V6.sendPx) / 6.7,
);

/* Cut on a word, never mid-syllable, and marked as cut. A line that stops
   halfway through "experi" reads as a rendering fault; the same line ending on
   a whole word with an ellipsis reads as a quotation, which is what it is. */
function clipWords(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const at = cut.lastIndexOf(" ");
  return `${(at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[.,;:]$/, "")}…`;
}

/* The two things the resting launcher cycles for someone with a conversation
   behind them: what they said, and what they got back. Both quoted from the
   thread itself rather than written for the launcher — a line composed for this
   slot is the product summarising the conversation, and the visitor is here to
   recognise it, not to read a summary of it.

   The reply is the real one, cut to the single line this field has. The message
   in full is one hover away, where the card has three lines to give it. */
const recallLines = () => [
  `“${lastPair(openThread()).ask}”`,
  clipWords(lastPair(openThread()).reply, FIELD_CHARS),
];

/* What the conversation itself offers next: the follow-ups on the last thing
   the agent said in that thread.

   The contextual suggestions take three inputs — the agent's configuration, the
   page, and the conversation history — so a visitor with a conversation behind
   them does not get the set a first-timer gets. Written by hand, the returning
   set drifted: it was offering "Mostly in my country" to someone whose thread
   had stopped on "what type of business do you run?", which is an answer to a
   question nobody had asked yet. Read off the thread, it cannot drift — the
   suggestions are the ones the agent actually put on the table, wherever the
   visitor happens to have stopped.

   Three of them. Some turns offer four, and the fourth is always the escape
   hatch — Other, Not sure, Talk to a specialist — which is the one the field
   underneath already is. */
const scriptPrompts = (thread: Msg[]) =>
  ([...thread].reverse().find((m) => m.from === "ai")?.followUps ?? []).slice(
    0,
    3,
  );

const RESUME_LABEL = "Continue your conversation";
const RESUME_FIELD = `${RESUME_LABEL}...`;

/* What the launcher shows once a returning visitor reaches for it: not an
   offer to continue, but the conversation itself — their own last question and
   the start of the answer they got.

   That pair is the strongest recall there is. "Continue your conversation"
   asks them to remember; "Existing website / Great, Global Payments can
   integrate payments into your existing ecommerce experience…" reminds them,
   and reminding is what actually makes someone press it. The line on the resting launcher still makes the offer; this is
   what it opens into. */
const RECALL_LABEL = "Your last message";
/* The last exchange of whichever thread is behind the launcher. The recent one
   is three turns in and the open one has run its course, so "what were we
   talking about" is a different pair depending on which. */
const recallAsk = (session: SessionState) =>
  lastPair(session === "open" ? openThread() : priorThread()).ask;
const recallReply = (session: SessionState) =>
  lastPair(session === "open" ? openThread() : priorThread()).reply;

/* The same offer worn as the field's own line. Set like a placeholder rather
   than like a label — sentence case, body size — because it sits where a
   placeholder sits and has to be the same kind of object; the accent is what
   says it is an action rather than a hint.

   Its own string rather than the chip's or the rule's. The chip is cut to one
   word because the thread is right under it; out here on the resting launcher
   there is no thread on screen yet, so the line has to name what it is
   offering — and "your" is what makes it theirs rather than an instruction. */
/* The field's own form of it — the same words, typed out on a loop. One line
   rather than two: there is nothing else this launcher needs to say, and a
   second line would only be filling the rotation for its own sake. It still
   erases and rewrites itself, because the motion is what draws the eye back to
   a launcher the visitor has already walked past once.

/* What the agent said after the visitor left. Deliberately something worth
   coming back for — an unread that turns out to be "are you still there?"
   spends the visitor's attention and returns nothing. */

/* Written against the turn it follows, and long because the answer is. This
   is the shape of message that actually arrives after someone leaves: not a
   nudge, but the work done in their absence — a finding, the reason for it,
   what happens next, and what they would have to do if it does not resolve
   itself. A short unread is usually a "are you still there?", and that is the
   fastest way to teach people the dot is noise. */
/* Two messages, not one long one — which is what the agent actually does with
   an answer this shape, and what makes the count on the launcher a real number
   rather than a rounding of "some". The badge says 2 because there are 2. */
const INBOUND_PARTS = [
  "One more thing while you were away — from what you told me I can put a quote together without you filling anything in: an existing store, customers worldwide, and a few markets you want to add.",
  "It comes by email and takes about a minute. Say the word and I will send it.",
];
const INBOUND = INBOUND_PARTS.join("\n\n");

/* How long the message has been waiting. Elapsed rather than a clock time,
   which is the opposite of the choice the resumed thread's rule makes — and
   for the opposite reason: a rule is dating something the visitor was present
   for, where this is measuring a wait they were absent for, and "2h ago" is
   what tells them how stale it might be. */
const INBOUND_AGO = "2m ago";
/* Counted, because the agent splits a long answer across bubbles — so "two new
   messages" is a real number and not a rounding of "some". It also sizes the
   thing waiting: one is a remark, three is a conversation that carried on
   without them. */
const INBOUND_COUNT = INBOUND_PARTS.length;
const INBOUND_LABEL = `${INBOUND_COUNT} new message${INBOUND_COUNT === 1 ? "" : "s"}`;

/* At rest the launcher stays the size it always is and says only that there is
   something waiting — the message itself is a paragraph, and a paragraph on an
   idle launcher is the product reading its post out on the page. Reaching for
   it opens the message; until then, one line.

   One line and not two: "tap to continue" was telling the visitor to do the
   thing a launcher is already for, and the dot beside it had already said the
   rest. */
const UNREAD_TITLE = `You have ${INBOUND_COUNT} new message${INBOUND_COUNT === 1 ? "" : "s"}`;

/* The agent speaking first, on a page the visitor is reading rather than in a
   conversation they started. It has to earn the interruption, which means
   naming what it noticed and what it is offering to do about it — a floating
   "Hi, can I help?" is the same nudge as an unread that says "are you still
   there?", and teaches people to dismiss the thing without reading it.

   It opens the conversation it describes: pressing it does not drop the visitor
   into a greeting, it drops them into this message with the same options under
   it that the agent's own first turn carries. */
const FLOATING =
  "You're reading about online payments — tell me what you sell and where, and I can say what taking payments would involve for you.";
/* The agent going first, then the script picking up from there. Built rather
   than written out, so the floating conversation and the one the panel opens on
   are the same conversation — the visitor who answers a chip out here and the
   one who opens the panel end up in the same place. */
const floatingThread = (): Msg[] => [
  { from: "ai", text: FLOATING },
  ...SCRIPT.slice(1, 5),
];
/* How many turns were already there when the column appeared. Only those are
   staggered — see FloatingColumn.

   A function rather than a value: SCRIPT is declared further down the file, and
   anything that reads it while the module is still initialising throws before a
   single component renders. */
const floatingSettled = () => floatingThread().length;

/* The conversation they are being handed back. Built rather than declared so
   the agent's side is the same canned answer the live preview would give: a
   resumed thread that reads differently from a fresh one is a lie about what
   they will find when they open it. */
/* When the conversation was last touched. One stamp, so the rule at the top of
   a resumed thread and the card that describes it cannot disagree. */
const LAST_SEEN = "10:24 AM";
const WHEN_EARLIER = `Earlier today · ${LAST_SEEN}`;
/* A date, not "yesterday": the open conversation is anything from one day to
   seven, so a relative word is either wrong or has to be recalculated. */
const WHEN_OPEN = `28 Aug · ${LAST_SEEN}`;

/* What the card calls it. A summary of the conversation, not of the last
   message — it is being offered to someone who may not remember any of it. */
const LAST_CHAT_ABOUT = "Accepting payments online";

/* ─────────────────────── the demo conversation ───────────────────────
   One script, sliced at a different depth per state — see
   app/design/CONVERSATION.md for the readable copy. Nothing here is written
   twice, so the launcher's preview, the card and the thread itself cannot
   disagree about what was said.

   Every set of suggestions answers the question its own turn ends on. A set
   that does not follow from the message above it is furniture. */
const SCRIPT: Msg[] = [
  {
    from: "ai",
    text: GREETING.text,
    steps: ["Read the page", "Loaded the agent's brief"],
    followUps: [
      "Accept payments",
      "Explore POS solutions",
      "Online payments",
      "Talk to sales",
    ],
  },
  { from: "user", text: "I want to accept payments online" },
  {
    from: "ai",
    text: [
      "Absolutely. Global Payments helps businesses accept payments online with secure checkout and flexible integration options.",
      "To recommend the right solution, what type of business do you run?",
    ].join("\n\n"),
    thoughtSecs: 3,
    sources: [
      { name: "Online payments", url: "globalpayments.com/online" },
      { name: "Checkout integration", url: "globalpayments.com/docs/checkout" },
    ],
    steps: [
      "Matched “accept payments online”",
      {
        tool: "search_docs",
        input: SEARCH_DOCS_INPUT,
        output: SEARCH_DOCS_OUTPUT,
      },
      "Read the online payments guide",
      "Checked integration options",
    ],
    followUps: [
      "Retail / Ecommerce",
      "Restaurant",
      "Professional services",
      "Other",
    ],
  },
  { from: "user", text: "Ecommerce" },
  {
    from: "ai",
    text: "Got it. Are you looking to add payments to an existing website or build a new checkout experience?",
    steps: ["Noted the business type", "Narrowed to the two checkout paths"],
    followUps: ["Existing website", "Building a new site", "Not sure"],
  },
  { from: "user", text: "Existing website" },
  {
    from: "ai",
    text: [
      "Great. Global Payments can integrate payments into your existing ecommerce experience, so customers can pay securely without requiring you to build the payment infrastructure from scratch.",
      "Do you already have an online store up and running?",
    ].join("\n\n"),
    steps: [
      "Checked integration into an existing site",
      "Read the checkout docs",
    ],
    followUps: ["Yes, it's live", "Not yet"],
  },
  { from: "user", text: "Yes, it's live" },
  {
    from: "ai",
    text: [
      "Perfect. That means we can focus on making your existing checkout experience work better for your customers.",
      "What would you most like to improve about your current payment setup?",
    ].join("\n\n"),
    steps: [
      "Confirmed the store is live",
      "Listed what a live checkout can improve",
    ],
    followUps: [
      "Offer more payment options",
      "Improve checkout",
      "Accept international payments",
      "Reduce payment issues",
    ],
  },
  { from: "user", text: "Offer more payment options" },
  {
    from: "ai",
    text: [
      "Absolutely. Giving customers more ways to pay can help you support different preferences and markets.",
      "Where are most of your customers located?",
    ].join("\n\n"),
    steps: [
      "Looked up payment methods by market",
      "Checked what is available where",
    ],
    followUps: ["Mostly in my country", "US & Canada", "Europe", "Worldwide"],
  },
  { from: "user", text: "Worldwide" },
  {
    from: "ai",
    text: [
      "Got it. If you're selling globally, payment preferences can vary quite a bit from one market to another.",
      "Are you currently accepting payments from customers outside your home market?",
    ].join("\n\n"),
    steps: [
      "Compared preferences across markets",
      "Checked cross-border support",
    ],
    followUps: [
      "Yes, already",
      "Only a few markets",
      "Not yet",
      "I'm not sure",
    ],
  },
  { from: "user", text: "Only a few markets" },
  {
    from: "ai",
    text: [
      "That makes sense. If you're already selling internationally and planning to expand, having a payment setup that can support different markets and customer payment preferences can make that growth much easier.",
      "Based on what you've shared — an existing ecommerce store, customers worldwide, and plans to expand into more markets — Global Payments' ecommerce solutions could be a good fit.",
      "Would you like to see what Global Payments can offer for your business?",
    ].join("\n\n"),
    thoughtSecs: 5,
    sources: [
      { name: "Ecommerce solutions", url: "globalpayments.com/ecommerce" },
      { name: "Where we operate", url: "globalpayments.com/coverage" },
    ],
    steps: [
      "Reviewed the whole conversation",
      "Matched it to ecommerce solutions",
      {
        tool: "check_coverage",
        input: { product: "ecommerce", markets: "worldwide" },
        output:
          "38 markets supported, 120+ currencies, local methods in 24 of them.",
      },
    ],
    followUps: [
      "Explore ecommerce solutions",
      "See payment options",
      "Get a quote",
      "Talk to a specialist",
    ],
  },
  { from: "user", text: "Explore ecommerce solutions" },
  {
    from: "ai",
    text: [
      "Global Payments can help you build a payment experience that supports your international customers, with options to accept payments across markets and give customers more ways to pay.",
      "Since you already have an ecommerce store, the next step would be to find the solution that best fits your business and current setup.",
      "What would you like to do?",
    ].join("\n\n"),
    steps: ["Pulled the ecommerce solution set", "Worked out the next step"],
    followUps: [
      "Get a quote",
      "Talk to a specialist",
      "See how integration works",
    ],
  },
];

/* Pressing any suggestion walks the script forward. The chips are the script's
   own follow-ups, so whichever one is pressed, the next thing the agent says is
   the next thing it says — the demo plays the conversation rather than falling
   through to the generic canned responder, which is what left "Retail /
   Ecommerce" answered by a paragraph about AI agents with no suggestions under
   it.

   Matched on the offer rather than on the exact words: all four chips at a
   given point lead to the same next turn, because in the real product the
   choice narrows what the agent knows, not which question it asks next. */
function scriptedReply(sent: string): Omit<Msg, "from"> | null {
  const asked = sent.trim().toLowerCase();
  const at = SCRIPT.findIndex(
    (m) =>
      m.from === "ai" &&
      m.followUps?.some((f) => f.trim().toLowerCase() === asked),
  );
  if (at < 0) return null;
  const next = SCRIPT.slice(at + 1).find((m) => m.from === "ai");
  if (!next) return null;
  const { from: _from, ...turn } = next;
  return turn;
}

/* Three turns in. They were here today and need very little to recognise it. */
const RECENT_DEPTH = 3;
function priorThread(): Msg[] {
  return SCRIPT.slice(0, RECENT_DEPTH);
}

/* All of it, ending on a question nobody answered — which is what lets the
   card say "ended unresolved" without inventing anything. */
function openThread(): Msg[] {
  return SCRIPT;
}

/* What the launcher recalls: the last exchange of whichever thread is behind
   it. Derived rather than written, so it moves when the script does. */
const lastPair = (thread: Msg[]) => {
  const reply = [...thread].reverse().find((m) => m.from === "ai");
  const ask = [...thread].reverse().find((m) => m.from === "user");
  return { ask: ask?.text ?? "", reply: (reply?.text ?? "").split("\n\n")[0] };
};

/* The thread the panel opens on, per state. Null means the ordinary first-run
   greeting — which is what both ends of the range get, for opposite reasons:
   nobody has been here yet, or it has been long enough that they may as well
   not have been. */
function seedFor(session: SessionState): Msg[] | null {
  /* No divider on these: it is still the same visit — or near enough — and a
     rule labelled "earlier today" over a conversation from four minutes ago
     would be the product telling the visitor something they know better than
     it does. */
  /* Stamped with when it happened, so a conversation reopened hours later does
     not read as one still in progress. */
  if (session === "recent")
    return priorThread().map((m, i) =>
      i === 0 ? { ...m, dayBreak: WHEN_EARLIER } : m,
    );
  /* The whole conversation, with what they were typing still in the composer —
     the draft answers the question the last turn ends on, which is the only
     reason it makes sense sitting there. */
  if (session === "draft") return openThread();
  /* Opened into, not offered. A week is still inside recall, so the visitor is
     handed the conversation rather than a blank one — what changes after a day
     is that a fresh start becomes likely enough to be offered inside it.

     No rule at the top. The card sitting above it already carries the stamp,
     and a hairline repeating "Yesterday · 10:24 AM" two lines under a card that
     says exactly that is dating the same thing twice. The NOW rule still
     appears the moment they say something, which is the boundary that has not
     been marked anywhere else. */
  if (session === "open") return openThread();
  /* The whole conversation, then the agent following up on the question it
     ended on. The follow-up is only allowed to know what it knows because the
     script above it established all of it. */
  if (session === "unread")
    return [
      ...openThread().map((m, i) =>
        i === 0 ? { ...m, dayBreak: WHEN_EARLIER } : m,
      ),
      ...INBOUND_PARTS.map((text, i) => ({
        from: "ai" as const,
        text,
        ...(i === 0 ? { dayBreak: "Just now" } : {}),
      })),
    ];
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
  thinkMark = "sparkle",
  thinkMarkSrc = null,
  thinkLabel = "",
  sel = null,
  onSelect,
  partStyles,
  device,
  width,
  height = 680,
  initialPrompt,
  seed,
  initialDraft,
  opening,
  offerNewChat,
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
  thinkMark?: ThinkingMark;
  thinkMarkSrc?: string | null;
  thinkLabel?: string;
  /* Only the messenger tab passes these. Everywhere else the preview is a
     preview and nothing in it is pressable for settings. */
  sel?: Part | null;
  onSelect?: (p: Part | null) => void;
  partStyles?: PartStyles;
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
  /* whether the way out of this conversation is offered inside it. Only the
     open conversation gets one: after a day a fresh start is genuinely likely,
     where inside a day it is not and the three-dot menu is enough. */
  offerNewChat?: boolean;
  onClose?: () => void;
  placeholder: string;
  /* whatever the launcher is offering — the opening turn hands the same set on */
  suggestions: string[];
}) {
  const { neutral } = theme;
  /* Two things a light palette gets for free and a dark one does not.

     A hover wash has to come from whichever end of the palette the surface is
     not — black at 4% over white is a shade; over near-black it is nothing.
     And a drop shadow is a light-mode idea: on a dark surface there is no
     darker to cast, so what carries a popover off the panel is a hairline in
     the palette's own line colour with a deeper, softer pool under it. */
  const isDark = theme.mode === "dark";
  /* One hover for every suggestion in the panel, so the picked chips and the
     quick replies cannot drift apart. Memoised because the compiler otherwise
     gives up optimising the whole component around it. */
  const chip = useMemo(() => chipHover(accent, isDark), [accent, isDark]);
  const wash = isDark ? "rgba(255,255,255,0.07)" : "rgba(15,17,26,0.04)";
  const popShadow = isDark
    ? `0 12px 30px -10px rgba(0,0,0,0.42), 0 0 0 1px ${neutral.line}`
    : "0 12px 30px -10px rgba(15,17,26,0.26), 0 0 0 1px rgba(15,17,26,0.07)";
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
  const [historyLen] = useState(seed?.length ?? 0);
  const [draft, setDraft] = useState(initialDraft ?? "");
  /* The same hook the floating composer uses, so the mic behaves identically
     in both places: hold to speak, words appearing as they are said, a tick to
     keep them. It was drawn but not wired in here, which made the panel's own
     field the one place in the product where the microphone was decoration. */
  const mic = useDictation(setDraft);
  const [thinking, setThinking] = useState(false);
  /* The steps of the turn currently being produced — empty until there is one
     in flight, which is also what the row falls back on when a reply has no
     trace of its own. */
  const [pending, setPending] = useState<TraceStep[]>([]);
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

  /* ── what the header menu does ── */
  /* A new conversation, not a restart: conversations persist now, so this
     starts another one rather than wiping the one they were in. What was here
     is in the archive; the panel simply opens on a fresh greeting. */
  const restart = useCallback(() => {
    setConvo([{ from: "ai", ...GREETING, followUps: suggestions }]);
    setDraft("");
    setPicked({});
    setThinking(false);
    setStreaming(true);
    setTimeout(() => setStreaming(false), streamMs(GREETING.text));
    /* setDraft is listed because the compiler infers it and refuses to keep
       the memoisation otherwise. It is a state setter and never changes, so
       naming it costs nothing and keeps the whole component optimised. */
  }, [suggestions, setDraft]);

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

  /* The way out of the conversation they were handed — a chip on a rule at the
     foot of the thread, in the same language the day breaks are drawn in.

     At the foot because that is where a handed-back conversation opens. It used
     to be the first thing in the scrolling column, which is the right place in
     reading order and the wrong place on screen: the panel lands at the end, so
     the offer started seventeen messages above the fold and nobody met it.

     Under the suggestions rather than over them. Above the rail it would sit
     between the agent's last message and the replies to it, which is what makes
     starting again read as one of the replies.

     It goes the moment they say anything — on their own message, not on the
     reply to it. The offer asks whether this is still the conversation they
     want; typing into it answers that, and leaving the way out on screen while
     the agent is already replying is the panel still asking a question the
     visitor has just closed. */
  const showNewChat =
    !!offerNewChat && !!seed?.length && convo.length <= historyLen;
  /* Two words, and the same two the header menu uses: the rules either side
     already say this is a boundary, so the chip only has to name what pressing
     it does. */
  const newChatLabel = "New conversation";
  const newChatPill = (
    <button
      onClick={restart}
      className="flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-medium transition-colors"
      style={{
        background: neutral.surface,
        color: neutral.ink,
        /* A hairline, not a lift. The chip sits on a flat white panel with a
           rule running through it, so elevation had nothing to be raised off —
           and the shadow it cast hugged the box tightly enough to draw a hard
           edge along the bottom, which is the corner that looked cut. Level
           with the rule it interrupts, in the same ink, it reads as part of the
           line rather than as an object dropped on it. */
        boxShadow: `inset 0 0 0 1px ${neutral.line}`,
        /* Half the height, stated. rounded-full leaves the browser to clamp
           9999 down to whatever it thinks the box is, and while it is settling
           on that the cap can land a fraction short of a true semicircle — the
           straight run at the ends that made the pill look like a rounded
           rectangle. */
        borderRadius: 999,
        animation: "fade-in 240ms ease-out both",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = neutral.paper;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = neutral.surface;
      }}
    >
      <Plus className="size-3.5" strokeWidth={2.4} style={{ color: accent }} />
      {newChatLabel}
    </button>
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  /* A handed-back conversation opens at its end. The stick-to-bottom watcher
     measures the message list, and the suggestion rail is a sibling of it — so
     on a thread long enough to overflow, the panel settled where the messages
     stopped and the rail sat just under the fold, present and unreachable.
     One jump after layout, with no animation, because there is nothing to
     animate: this is where the conversation already was. */
  useEffect(() => {
    if (!seed?.length) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    // seed is read once, at mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const contentRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const started = useRef(false);

  /* Nothing that belongs to a turn shows until the turn has finished
     arriving: quick replies you could click mid-sentence, and an action row
     offering to copy an answer still being written, both read as the interface
     getting ahead of itself. The reasoning trace is the exception — it is what
     the sparkle lives in, so it is there for the wait. */
  const streamingIdx = streaming ? convo.length - 1 : -1;
  /* The actions belong to the answer, and an answer that arrives in three
     paragraphs is still one answer. Repeating the row under each of them reads
     as three separate replies to rate — and puts a timestamp on every paragraph
     of a message that was written in one breath.

     A run ends where the next turn is the visitor's, where the transcript ends,
     or where a day break falls: a message arriving hours later is a new thing
     to answer, whoever said the last one. */
  const endsRun = (i: number) => {
    const next = convo[i + 1];
    return !next || next.from !== "ai" || !!next.dayBreak;
  };

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
  /* The panel's own device, which AgentPreview already receives — the
     suggestion rail wraps to two rows on a phone and holds one on a desktop. */
  const onPhone = device === "mobile";

  const [headerMenu, setHeaderMenu] = useState(false);
  /* Off, and off by default forever. Auto-read is an accessibility affordance
     for someone who needs it, not a feature to introduce yourself with — a
     launcher that starts talking out loud on a page nobody expected it to is
     the kind of thing people close the tab over. */
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

  /* Read off the panel's own width rather than off the placement it came
     from: the panel is 600 centred and 380–400 in a corner, and what the line
     can afford is a fact about the pane it is sitting in. One number, so the
     two never disagree about which case this is. */
  const noticeW = (width ?? 600) >= 520 ? 500 : 320;

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
    setConvo((c) => [
      ...c,
      {
        from: "user",
        text: msg,
        /* The first thing said this sitting gets the rule above it. The thread
           they were handed is history and carries its own stamp; this is where
           it stops being history, and without a mark the new turn reads as the
           tail of a conversation from this morning. */
        ...(c.length === historyLen && historyLen > 0
          ? { dayBreak: "Now" }
          : {}),
      },
    ]);
    const reply = scriptedReply(msg) ?? cannedReply(msg);
    /* What the row will narrate. Taken from the reply that is already decided
       rather than from a generic list, so the line running while the agent
       works and the trace it leaves behind are the same three things. */
    setPending(reply.steps ?? []);
    setThinking(true);
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
        <Hot
          part="header"
          sel={sel}
          onSelect={onSelect}
          accent={accent}
          styles={partStyles}
          className="mx-auto w-full max-w-[720px]"
        >
        <div className="flex w-full items-center gap-2.5">
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
                        style={
                          {
                            background: neutral.surface,
                            boxShadow: popShadow,
                            "--wash": wash,
                          } as CSSProperties
                        }
                      >
                        <button
                          onClick={() => {
                            restart();
                            setHeaderMenu(false);
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors hover:bg-[var(--wash)]"
                          style={{ color: neutral.ink }}
                        >
                          <RotateCcw
                            className="size-4 shrink-0"
                            strokeWidth={1.8}
                          />
                          New conversation
                        </button>
                        <button
                          onClick={() => {
                            downloadTranscript();
                            setHeaderMenu(false);
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors hover:bg-[var(--wash)]"
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
                          className="flex items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors hover:bg-[var(--wash)]"
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
              {view === "history" ? null : (
                <Hot
                  part="avatar"
                  sel={sel}
                  onSelect={onSelect}
                  accent={accent}
                  styles={partStyles}
                  className="shrink-0"
                >
                  {avatar ? (
                    <span
                      className="block size-9 rounded-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${avatar})` }}
                    />
                  ) : (
                    <div
                      className="grid size-9 place-items-center rounded-full"
                      style={{ background: theme.bubbleFill }}
                    >
                      <Bot
                        className="size-[18px]"
                        style={{ color: theme.bubbleInk }}
                        strokeWidth={2}
                      />
                    </div>
                  )}
                </Hot>
              )}
              <div className="flex min-w-0 flex-col leading-tight">
                <Hot
                  part="title"
                  sel={sel}
                  onSelect={onSelect}
                  accent={accent}
                  styles={partStyles}
                >
                  <span
                    className="block text-[14px] font-semibold tracking-tight"
                    style={{ color: neutral.ink }}
                  >
                    {view === "history"
                      ? "Conversation history"
                      : name || "Agent"}
                  </span>
                </Hot>
                {view !== "history" && subtitle.trim() && (
                  <Hot
                  part="subtitle"
                  sel={sel}
                  onSelect={onSelect}
                  accent={accent}
                  styles={partStyles}
                  className="mt-0.5"
                >
                    <span
                      className="block text-[12px]"
                      style={{ color: neutral.muted }}
                    >
                      {subtitle}
                    </span>
                  </Hot>
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
                        style={
                          {
                            background: neutral.surface,
                            boxShadow: popShadow,
                            "--wash": wash,
                          } as CSSProperties
                        }
                      >
                        <button
                          onClick={() => {
                            restart();
                            setHeaderMenu(false);
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors hover:bg-[var(--wash)]"
                          style={{ color: neutral.ink }}
                        >
                          <RotateCcw
                            className="size-4 shrink-0"
                            strokeWidth={1.8}
                          />
                          New conversation
                        </button>
                        <button
                          onClick={() => {
                            downloadTranscript();
                            setHeaderMenu(false);
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors hover:bg-[var(--wash)]"
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
                          className="flex items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors hover:bg-[var(--wash)]"
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
        </Hot>
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
            /* A phone has no hover, so the row's actions cannot live behind
               one. Pulled aside instead — see HistoryRow. */
            swipe={device === "mobile"}
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
            {/* live conversation */}
            {convo.map((m, i) => (
              <Fragment key={i}>
                {/* Where a resumed thread stops being now. Only drawn on the
                    turn that starts a new stretch of time, so a conversation
                    that never paused never shows one. */}
                {m.dayBreak && <Rule label={m.dayBreak} neutral={neutral} />}
                {/* The mirror of the card a cold visitor gets, at the other end
                    of the thread and pointing the other way: theirs offers a
                    conversation they have not chosen, this one names the
                    conversation they are now in and offers the way out of it.

                    One button, not two. They already chose to come back in, so a
                    pair here would be re-asking a question the click answered.
                    It carries the same accent fill the cold visitor's card
                    does, because the two are one component in two moods and a
                    filled button next to an outlined one would read as two
                    different kinds of offer.

                    It goes the moment they say anything: by then this is simply
                    the conversation they are having. */}
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
                    <Hot
                      part="userBubble"
                      sel={sel}
                      onSelect={onSelect}
                      accent={accent}
                      styles={partStyles}
                      className={
                        theme.userNeutral
                          ? "w-fit max-w-[80%] whitespace-pre-line px-5 py-3 text-[14px] font-light"
                          : "w-fit max-w-[80%] px-3.5 py-2 text-[14px] leading-relaxed"
                      }
                      style={{
                        ...bubbleShape(theme.radius.bubble, "user"),
                        ...(theme.userNeutral
                          ? { background: neutral.paper, color: neutral.ink }
                          : {
                              background: theme.bubbleFill,
                              boxShadow: `inset 0 0 0 1px ${theme.bubbleBorder}`,
                              color: theme.bubbleInk,
                            }),
                      }}
                    >
                      {m.text}
                    </Hot>
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
                  <Hot
                    key={i}
                    part="bubble"
                    sel={sel}
                    onSelect={onSelect}
                    accent={accent}
                    styles={partStyles}
                    className="group flex flex-col items-start"
                    /* the animation stays on the region so a new turn still
                       arrives the way it did before any of this */
                  >
                    {/* Paper sets the agent's reply directly on the surface — no
                    bubble, no border. Only the visitor's turn is enclosed, so
                    the two speakers are told apart by containment rather than
                    by two competing bubble colours. */}
                    {m.steps && (
                      <ThoughtTrace
                        /* Stated where a turn states it, derived from the
                           answer everywhere else — see traceSecs. */
                        secs={m.thoughtSecs ?? traceSecs(m.text)}
                        steps={m.steps}
                        accent={accent}
                        dark={isDark}
                        mark={thinkMark}
                        markSrc={thinkMarkSrc}
                        neutral={neutral}
                        streaming={streaming && i === convo.length - 1}
                      />
                    )}
                    <div
                      className={
                        theme.aiBubble
                          ? "w-fit max-w-[90%] whitespace-pre-wrap border px-3.5 py-2 text-[14px] leading-relaxed transition-shadow duration-200 group-hover:shadow-[var(--ds-shadow-sm)]"
                          : "w-full text-[14px] leading-relaxed"
                      }
                      style={
                        theme.aiBubble
                          ? { ...aiBubble, ...bubbleShape(theme.radius.bubble, "ai") }
                          : { color: neutral.ink }
                      }
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
                                ["--chip-stroke" as string]: chip.stroke,
                                ["--chip-wash" as string]: chip.wash,
                                // the one taken holds the hover outline for good
                                boxShadow:
                                  picked[i] === b
                                    ? `inset 0 0 0 1px ${chip.stroke}`
                                    : undefined,
                              }}
                            >
                              {b}
                            </button>
                          ))}
                        </div>
                      )}
                    {i !== streamingIdx && endsRun(i) && (
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
                  </Hot>
                )}
              </Fragment>
            ))}
            {/* thinking indicator — sparkle + cycling shimmer phrase */}
            {thinking && (
              <Hot
                part="thinking"
                sel={sel}
                onSelect={onSelect}
                accent={accent}
                styles={partStyles}
                className="w-fit"
              >
              <div style={{ animation: "fade-in 200ms ease-out both" }}>
                <AiThinking
                  accent={accent}
                  mark={thinkMark}
                  markSrc={thinkMarkSrc}
                  label={thinkLabel}
                  steps={pending}
                  neutral={neutral}
                  dark={theme.mode === "dark"}
                />
              </div>
              </Hot>
            )}
            {quickReplies && quickReplies.length > 0 && (
              /* Last in the thread, inside the scroll area, so it travels with the
            onversation instead of hovering over it. Look back through a long
            xchange and the suggestions go with the turn that prompted them —
            hich is what they are: an offer made at a point in the
            onversation, not a permanent control.

            ne row that scrolls, not a wrapped block. Wrapped, four suggestions
            ook three rows and half the panel — and the conversation is the
            ain content, so the offer of what to say next cannot outweigh what
            as already said. Two rows on a phone, where the measure is narrow
            nough that one row would leave most of a suggestion off-screen.

            anged right, because pressing one sends it as the visitor's own
            essage. */
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
                /* Sized to its chips and capped at the panel, then pushed right
               by the margin rather than by justify-end.

               justify-end on an overflowing flex row spills the content off
               the left, where there is nothing to scroll back to — the chips
               were all in the DOM and the first of them were simply gone.
               Laying them out from the start and moving the whole rail keeps
               the right-hand alignment while it fits and gives a reachable
               overflow once it does not. */
                /* justify-end only where the row wraps. On a phone the chips
                   fall onto two lines and each line lays out from the left, so
                   ml-auto moved the block right and left the lines inside it
                   ragged against the wrong edge — the rail looked right-aligned
                   and its contents did not.

                   It stays off the scrolling row for the reason above: on that
                   one it spills the first chips off the left. */
                className={`chip-rail mb-3 ml-auto mt-auto flex w-max max-w-full gap-2 overflow-x-auto pt-3 ${
                  onPhone ? "flex-wrap justify-end" : "flex-nowrap"
                }`}
                style={{
                  /* No measure. It existed to force the wrap into a tidy block;
                 the row scrolls now, so a cap only decides where the chips
                 start disappearing — and the full width is what makes it
                 obvious there are more of them. */
                  /* Two rows on a phone: enough for the wrap Vinit asked for, and
                 a hard stop before it becomes the block it used to be. */
                  maxHeight: onPhone ? 96 : undefined,
                }}
              >
                {quickReplies.map((b, i) => (
                  <button
                    key={b}
                    onClick={() => send(b)}
                    className="starter-chip shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[14px] transition-[background-color,box-shadow] duration-200 ease-out"
                    style={{
                      color: theme.bubbleInk,
                      backgroundColor: theme.bubbleFill,
                      ["--chip-stroke" as string]: chip.stroke,
                      ["--chip-wash" as string]: chip.wash,
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

            {/* The same chip, at the end of the thread rather than the start.
                  A handed-back conversation opens at its foot, so this is the
                  one place inside the scroll that is on screen when they
                  arrive — the reason the top one is not.

                  It sits under the suggestions, so what it is offering reads as
                  an alternative to them rather than as one of them. */}
            {showNewChat && (
              <span
                className="flex items-center gap-3"
                style={{ animation: "fade-in 240ms ease-out both" }}
              >
                <span
                  className="h-px flex-1"
                  style={{ background: neutral.line }}
                />
                {newChatPill}
                <span
                  className="h-px flex-1"
                  style={{ background: neutral.line }}
                />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* composer — ported from the DS Message Composer, brand-themed */}
      {/* pb-5 rather than pb-3: the disclaimer and branding lines used to
         cushion the field, so with both off it sat 12px from the edge and
         read as falling out of the panel. A constant 20px holds whatever
         is toggled above it. */}
      {/* Hidden on the archive: there is nothing to type into a list.

          Its height goes with it. Fading it out alone left the space it
          occupies sitting empty under the list — a white strip at the foot of
          the panel, with the archive scrolling inside whatever was left above
          it even when four rows would have fitted. A max-height rather than a
          display swap, so it collapses over the same duration the screens
          slide and the frame is never seen resizing. */}
      <Hot
        part="composer"
        sel={sel}
        onSelect={onSelect}
        accent={accent}
        styles={partStyles}
      >
      <div
        className="overflow-hidden px-4 pt-1 transition-all"
        style={{
          opacity: view === "history" ? 0 : 1,
          maxHeight: view === "history" ? 0 : 260,
          paddingBottom: view === "history" ? 0 : 20,
          pointerEvents: view === "history" ? "none" : undefined,
          transitionDuration: `${VIEW_SLIDE_MS}ms`,
          transitionTimingFunction: VIEW_SLIDE_EASE,
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
          /* Ring first so it paints above the wash; the wash is a full-bleed
             inset spread, which tints the chip without touching the fill it
             was given inline. */
          .starter-chip:hover {
            box-shadow: inset 0 0 0 1.5px var(--chip-stroke), inset 0 0 0 999px var(--chip-wash, transparent), var(--chip-shadow, 0 0 #0000);
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
          /* A scrolling row with no scrollbar drawn. The bar is 15px of
             chrome under a 36px chip — it would read as a divider between the
             suggestions and the composer rather than as a control. */
          .chip-rail {
            scrollbar-width: none;
            -ms-overflow-style: none;
            scroll-behavior: smooth;
          }
          .chip-rail::-webkit-scrollbar { display: none; }
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
                  /* The caveat's measure, set by where the messenger sits.

                     Centred the panel is 600 wide and the line can run to 500
                     before it truncates (see noticeW) — a disclaimer specific enough to name
                     who to ask instead of the agent is worth reading whole,
                     and cutting it short in a wide pane leaves an ellipsis with
                     half the width empty beside it. In a corner the panel is
                     400, so 320 is already most of the row and the rest stays
                     on the hover. */
                  className="relative mx-auto flex w-full items-start gap-2 px-4 pb-2 pt-0.5"
                  style={{
                    maxWidth: noticeW,
                    ...(showNotice && brandingOn ? { minHeight: 22 } : null),
                  }}
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
                        /* A tooltip is the palette inverted — near-black on a
                           light panel, near-white on a dark one. A fixed #333
                           read as a slightly different panel once the panel
                           went dark. */
                        style={{
                          background: isDark ? neutral.ink : "#333333",
                          color: isDark ? neutral.canvas : "#FFFFFF",
                        }}
                        className="pointer-events-none absolute bottom-full left-0 z-30 mb-1.5 max-w-[280px] rounded-md px-2 py-1.5 text-[11px] leading-snug opacity-0 shadow-md transition-opacity group-hover/notice:opacity-100"
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
                  /* A row until the message outgrows it, then a stack: the
                     field takes the top on its own and both controls drop to a
                     line underneath.

                     Wrapped, not stacked: a flex column puts every child on a
                     line of its own, which left attach and send on separate
                     rows. A wrapping row with the field given the full basis
                     is one line of text and one line of controls — the two
                     discs on the same baseline, at either end, which is what
                     they are in the single-line state too.

                     Past two lines a field sharing its row with two 44px discs
                     is a column of text a few words wide, and the discs end up
                     floating against the middle of a tall box with nothing to
                     align to. The radius goes with it — a pill this tall bows
                     its sides inward and sets the message inside a lens, so it
                     becomes the same 24 the panel's own corners use. */
                  className={`pill-field flex w-full items-center ${
                    isMultiline
                      ? "flex-wrap gap-y-1.5 rounded-[24px]"
                      : "rounded-full"
                  }`}
                  style={{
                    background: neutral.surface,
                    boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${liteOf(accent)} 55%, transparent)`,
                    padding: 8,
                    minHeight: 64,
                    ["--ph" as string]: neutral.secondary,
                  }}
                >
                  {/* Ordered, not moved: in the stack the field is the first
                      line and the two controls share the second, so attach
                      takes order-2 and the send/mic disc order-3 rather than
                      the markup being written out twice. */}
                  <button
                    className={`grid size-11 shrink-0 place-items-center rounded-full transition-opacity hover:opacity-80 ${
                      isMultiline ? "order-2" : ""
                    }`}
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
                    className={`block min-w-0 flex-1 resize-none bg-transparent px-3 text-[14px] font-light leading-[1.5] tracking-[0.01em] outline-none ${
                      isMultiline ? "order-1 w-full basis-full py-1" : ""
                    }`}
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
                      className={`grid size-11 shrink-0 place-items-center rounded-full text-white transition-opacity disabled:opacity-40 ${
                        isMultiline ? "order-3 ml-auto" : ""
                      }`}
                      style={{ background: accent }}
                    >
                      <ArrowUp className="size-6" strokeWidth={1.75} />
                    </button>
                  ) : (
                    <button
                      onClick={() => mic.toggle(draft)}
                      hidden={!mic.canDictate}
                      aria-label={mic.listening ? "Use what you said" : "Voice input"}
                      aria-pressed={mic.listening}
                      className={`relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full transition-opacity hover:opacity-80 ${
                        isMultiline ? "order-3 ml-auto" : ""
                      }`}
                      style={{
                        background: mic.listening ? accent : neutral.paper,
                        color: mic.listening ? "#FFFFFF" : neutral.ink,
                      }}
                    >
                      {mic.listening && (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-0 rounded-full bg-white/30"
                          style={{ animation: "mic-pulse 1600ms ease-out infinite" }}
                        />
                      )}
                      {mic.listening ? (
                        <Check className="relative size-5" strokeWidth={2} />
                      ) : (
                        <Mic className="relative size-5" strokeWidth={1.5} />
                      )}
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
                    className="block w-full resize-none bg-transparent px-2 pb-2 pt-1.5 text-[14px] leading-[1.5] tracking-tight outline-none placeholder:text-[var(--ph)]"
                    style={{
                      /* the palette's own muted rather than a fixed grey, which
                         was a light-mode value sitting on a dark field */
                      ["--ph" as string]: neutral.muted,
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
                        onClick={() => mic.toggle(draft)}
                        hidden={!mic.canDictate}
                        aria-label={mic.listening ? "Use what you said" : "Voice input"}
                        aria-pressed={mic.listening}
                        className={`relative ml-auto flex ${ctlSize} shrink-0 items-center justify-center overflow-hidden rounded-full transition-opacity hover:opacity-80`}
                        style={{
                          background: mic.listening ? accent : neutral.paper,
                          color: mic.listening ? "#FFFFFF" : neutral.ink,
                        }}
                      >
                        {mic.listening && (
                          <span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 rounded-full bg-white/30"
                            style={{ animation: "mic-pulse 1600ms ease-out infinite" }}
                          />
                        )}
                        {mic.listening ? (
                          <Check className={`relative ${ctlIcon}`} strokeWidth={2} />
                        ) : (
                          <Mic className={`relative ${ctlIcon}`} strokeWidth={1.5} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  /* dsc-field carries the focus ring, so the outlined variant simply
                 doesn't take the class — the standing stroke is the state. */
                  className={`${theme.outlineComposer ? "" : "dsc-field"} flex w-full border transition-all duration-200 ${
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
                    borderRadius: theme.radius.control,
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
                    className={`block min-w-0 resize-none bg-transparent text-[14px] leading-[1.5] tracking-tight outline-none placeholder:text-[var(--ph)] ${
                      isMultiline
                        ? "order-1 w-full basis-full py-1"
                        : theme.outlineComposer
                          ? "flex-1 self-center py-0"
                          : "flex-1 py-[5px]"
                    }`}
                    style={{
                      ["--ph" as string]: neutral.muted,
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
                      onClick={() => mic.toggle(draft)}
                      hidden={!mic.canDictate}
                      aria-pressed={mic.listening}
                      className={`relative flex ${ctlSize} shrink-0 items-center justify-center overflow-hidden rounded-full transition-opacity hover:opacity-80 ${
                        isMultiline ? "order-3" : ""
                      }`}
                      style={{
                        background: mic.listening ? accent : neutral.paper,
                        color: mic.listening ? "#FFFFFF" : neutral.ink,
                      }}
                      aria-label={mic.listening ? "Use what you said" : "Voice input"}
                    >
                      {mic.listening && (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-0 rounded-full bg-white/30"
                          style={{ animation: "mic-pulse 1600ms ease-out infinite" }}
                        />
                      )}
                      {mic.listening ? (
                        <Check className={`relative ${ctlIcon}`} strokeWidth={2} />
                      ) : (
                        <Mic className={`relative ${ctlIcon}`} strokeWidth={1.5} />
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </Hot>
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

/* Three sizes, because a launcher's job on a busy page and on a sparse one is
   not the same size of job. The chip runs 8 under the round shapes at every
   step — a pill reads larger than a circle of the same height, so matching the
   numbers would not match what you see. */
type LauncherSize = "sm" | "md" | "lg";
const LAUNCHER_SIZES: { v: LauncherSize; label: string; px: number }[] = [
  { v: "sm", label: "Small", px: 48 },
  { v: "md", label: "Medium", px: 56 },
  { v: "lg", label: "Large", px: 64 },
];
const sizePx = (v: LauncherSize) =>
  LAUNCHER_SIZES.find((o) => o.v === v)?.px ?? 56;

type LauncherStyle = "fill" | "outlined" | "glass" | "haloed";

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
/* How many lines the card gives a message before it stops. Three is the shape
   of a greeting or an unread; past that the launcher is a paragraph sitting on
   someone's page. */
const INLINE_LINES = 3;

/* Solid white, lifted by light rather than by transparency.

   Glassmorphism borrows its looks from its backdrop — which is why it is
   beautiful over a photograph and washed out over the corner of a marketing
   page. A launcher never gets to choose what is behind it, so the surface stops
   depending on it.

   ── the shadow ──

   Six layers, each roughly doubling the blur of the one before it, all at the
   same low opacity. That ramp is the whole technique and it is worth being able
   to explain:

   A real shadow is not one blurred shape. Light arrives from an area rather
   than a point, so the darkness under an object falls off along a curve —
   nearly solid where it touches the surface, fading over distance. One layer
   can only draw a straight line through that curve, which is why a single
   `0 4px 12px rgba(0,0,0,0.15)` always reads as a sticker: too dark far out,
   too light at the contact edge. Stacking doublings approximates the curve
   instead, and the eye reads depth rather than a grey smear.

   The colour is a blue-leaning ink, not black. Shadows in daylight take the
   colour of the sky, and pure black against a white page goes muddy — the
   commonest tell of a shadow that was picked rather than reasoned about.

   And the last layer carries a negative spread, so the widest, faintest fall
   stays under the object rather than haloing out past its edges. */
const CARD_SHADOW = [
  "0 1px 1px rgba(18,21,33,0.045)",
  "0 2px 4px rgba(18,21,33,0.045)",
  "0 4px 8px rgba(18,21,33,0.045)",
  "0 8px 16px rgba(18,21,33,0.045)",
  "0 16px 32px rgba(18,21,33,0.05)",
  "0 32px 56px -20px rgba(18,21,33,0.10)",
].join(", ");

/* The cluster's cards take no colour of their own, which used to mean white.
   It means the palette's surface now: these are the agent talking on somebody
   else's page, and an agent set to dark that keeps posting white cards is
   half-themed. The page behind them stays whatever it is — that part is not
   ours to invert. */
function clusterGlass(theme: ReturnType<typeof useTheme>) {
  const n = theme.neutral;
  const dark = theme.mode === "dark";
  return {
    background: n.surface,
    color: n.ink,
    /* A hairline inside the edge before the ramp begins. It is what keeps the
       card from dissolving into a white page, where the shadow alone would
       leave the top edge with nothing to draw it — and in dark it is the
       whole job, since a shadow on a dark page has nothing to darken. */
    shadow: dark
      ? `inset 0 0 0 1px ${n.line}, 0 10px 30px rgba(0,0,0,0.34), 0 28px 60px -20px rgba(0,0,0,0.38)`
      : `inset 0 0 0 1px rgba(18,21,33,0.06), ${CARD_SHADOW}`,
    markRing: n.surface,
  };
}

/* Types a line out, holds it for as long as its word count deserves, erases it
   and begins again. The composer launcher has had this since the beginning; the
   button launcher's greeting was the one line in the product that just appeared
   and sat there.

   The caller wraps the text before passing it in, and this only ever slices
   that wrapped string — so the line breaks are decided once and the words fill
   into a shape that never changes. Typing an unwrapped sentence would re-wrap
   it on every character and the card would jump about as it went. */
function useTyped(full: string, on: boolean) {
  const [n, setN] = useState(0);
  const [phase, setPhase] = useState<"typing" | "holding" | "erasing">(
    "typing",
  );
  useEffect(() => {
    if (!on) return;
    if (phase === "typing") {
      /* The hand-off between phases is a timer like every other step, not a set
         during the render pass — which keeps the whole machine to one shape and
         keeps React out of a cascading update. */
      const t =
        n >= full.length
          ? setTimeout(() => setPhase("holding"), 400)
          : setTimeout(() => setN(n + 1), TYPE_MS);
      return () => clearTimeout(t);
    }
    if (phase === "holding") {
      const t = setTimeout(() => setPhase("erasing"), holdFor(full));
      return () => clearTimeout(t);
    }
    const t =
      n <= 0
        ? setTimeout(() => setPhase("typing"), 300)
        : setTimeout(() => setN(n - 1), ERASE_MS);
    return () => clearTimeout(t);
  }, [on, full, n, phase]);
  return on ? full.slice(0, n) : full;
}

/* The same cadence as the field's, run once. useTyped loops — type, hold,
   erase, repeat — which is right for a line that is cycling through a set and
   wrong for a message: a reply that erased itself would be the launcher taking
   the conversation back. This one types and stops. */
function useTypedOnce(full: string, on: boolean) {
  /* Stamped with the message it belongs to, and read back through that stamp
     rather than reset by an effect. Switching states mid-run would otherwise
     carry a half-typed sentence over into a different one — and clearing it
     with a setState inside an effect is a second render for something the
     first one already knows. */
  const [run, setRun] = useState({ stamp: full, n: 0 });
  const cur = run.stamp === full ? run : { stamp: full, n: 0 };
  useEffect(() => {
    if (!on || cur.n >= full.length) return;
    const t = setTimeout(() => setRun({ stamp: full, n: cur.n + 1 }), TYPE_MS);
    return () => clearTimeout(t);
  }, [on, full, cur.n]);
  return on ? full.slice(0, cur.n) : full;
}

/* ── the floating messenger ───────────────────────────────────────────────
   The conversation on the page, with the panel taken away. The agent's turn
   sits directly above whichever launcher the site runs, the visitor's options
   under it, and nothing is drawn behind either — no card, no pane, no header.

   Two things make it work without a container:

   · The bubble is white and lifted rather than tinted. Out here it is not being
     told apart from another bubble, it is being told apart from a website, and
     a shadow says "on top of the page" in a way no fill can.

   · The column is masked at the top. A panel's scroll stops at a header; this
     has no edge to stop at, so the oldest turn dissolves rather than being cut,
     which is also what says there is more above. */
function FloatingColumn({
  turns,
  width,
  settled,
  chips,
  side,
  accent,
  neutral,
  onStart,
  maxHeight,
  onClose,
}: {
  /* A conversation, not a notice. The whole point of the mode is that the
     exchange happens on the page — one bubble would be a card without a card
     around it. */
  turns: Msg[];
  /* The launcher's own width. The column was a fixed 340 while the phone's
     launcher is 300, so it hung ten pixels past the pill on either side and
     everything in it read as sitting off to the left of the thing it belongs
     to. A conversation floating above a launcher has to share its measure —
     it is the only edge either of them has. */
  width: number;
  /* How many of them arrived together. Everything past this was sent by the
     visitor just now and must land at once. */
  settled: number;
  chips: string[];
  side: "left" | "right" | "center";
  accent: string;
  neutral: Record<string, string>;
  onStart: (text: string) => void;
  /* How tall the column may grow before it scrolls. Passed in rather than
     fixed, because the answer is "as much of the screen as there is" — see
     the ceiling below. */
  maxHeight: number;
  /* The way out. This mode is the most intrusive thing the launcher does — a
     conversation on the customer's page with no panel around it — so it is the
     one that most needs a way to be told no. */
  onClose: () => void;
}) {
  /* The opening turns arrive one after another, because they are a
     conversation being replayed. Anything the visitor has just sent arrives
     now — it is their own action, and a bubble that waits half a second to
     acknowledge a press reads as the product thinking about whether to.

     The bug this replaces: the delay was the turn's index, so the tenth turn
     waited 900ms and the twentieth waited two seconds. The stagger belongs to
     the arrival, not to the position. */
  const lag = (i: number) => (i < settled ? i * 90 : 0);
  /* No fade at the top any more.

     The oldest turns used to recede into a gradient, which was the column
     drawing itself an edge where it had no panel to have one. Design review,
     11 Sep: "it can float all the way to the end of the screen, instead of
     fading… it is very natural." So it does — the thread simply runs up the
     page until it reaches the top of the screen and scrolls from there, and
     the measuring, the per-turn mask and the fade constant that served it are
     all gone with it.

     Worth noting what that removal buys beyond the look: a mask on an element
     creates a backdrop root, so every bubble carrying one was fighting its own
     backdrop-filter. Without it the frost is simply the frost. */
  const listRef = useRef<HTMLSpanElement>(null);
  /* Pinned to the newest turn. The column is anchored to its bottom, so without
     this a reply landing while the visitor is reading further up would push the
     thread rather than follow it. */
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [turns.length]);
  return (
    /* A frame around the scroller, holding nothing but the cross.

       The viewport's own corner was tried and it was too far from the thing it
       closes — a cross at the top of the frame with the conversation halfway
       down the page reads as belonging to the site, not to the widget. On the
       column it sits on the top edge of the thread itself, which is where the
       conversation visibly ends, and it travels with it. */
    <span className="relative flex max-w-full flex-col" style={{ width }}>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close the conversation"
        /* Clear above the column rather than notched into its corner: a cross
           overlapping the first bubble is a control sitting on a message, and
           at 20px up it has the gap to itself while still reading as attached
           to the thread below it. */
        className="absolute -top-5 -right-2.5 z-20 grid size-6 place-items-center rounded-full transition-colors"
        style={{
          background: "rgba(255,255,255,0.76)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          color: neutral.secondary ?? neutral.ink,
          boxShadow:
            "inset 0 0 0 1px rgba(15,17,26,0.08), 0 2px 6px -1px rgba(15,17,26,0.16)",
        }}
      >
        <X className="size-3.5" strokeWidth={2.2} />
      </button>

    <span
      /* The scroller. Two boxes rather than one, and the inner one is what
         makes it work: a flex column with justify-end pushes its overflow off
         the *top*, where there is nothing to scroll back to — the same trap the
         suggestion rail hit horizontally. Anchoring the content with an auto
         top margin instead sits it on the bottom while it fits and releases it
         the moment it does not, so the whole thread stays reachable.

         overscroll-contain stops a flick that reaches the oldest message from
         carrying on into the customer's page. The two scrollers are stacked,
         and without it the visitor scrolling the conversation takes the site
         with them.

         No bar: there is no panel edge out here for one to sit against, and a
         scrollbar drawn on nothing is a grey line floating over a website. */
      ref={listRef}
      className="scrollbar-subtle flex max-w-full flex-col overflow-y-auto overscroll-contain"
      /* No mask on this column, and that is not a style choice.

         A mask on an ancestor creates a new backdrop root: everything inside it
         can only sample what is painted within the mask, not the page beneath.
         So the bubbles' backdrop-filter had nothing to blur and quietly did
         nothing — which is why the headline behind them was coming through
         sharp and colliding with the message text. Translucent without blur is
         not glass, it is a wash. */
      style={{
        width,
        /* A ceiling, not a height: the column grows up from the launcher until
           it runs out of screen, and scrolls after. It was a flat 440 — a
           conversation that stopped halfway up a tall page for no reason the
           visitor could see. */
        maxHeight,
      }}
    >
      <span
        className={`mt-auto flex shrink-0 flex-col gap-2.5 ${
          side === "left" ? "items-start" : "items-end"
        }`}
      >
        {/* Messages, not controls. Pressing a bubble does nothing, because there
          is nothing it could do that the suggestions under it and the field
          below it are not already offering. */}
        {turns.map((m, i) => (
          <span
            key={i}
            className={`w-fit max-w-[88%] shrink-0 whitespace-pre-wrap px-4 py-2.5 text-left text-[14px] leading-relaxed ${
              m.from === "ai"
                ? "self-start rounded-[18px] rounded-bl-[6px]"
                : "self-end rounded-[18px] rounded-br-[6px]"
            }`}
            /* Frosted, not solid. A solid fill is a panel's habit, and out here
             there is no panel — a bubble that blocks the page it sits on does
             the one thing this mode exists to avoid.

             The alpha is high (82 and 86) rather than the 40–50 glass usually
             wears, because these hold running text over an unknown background.
             The blur is what makes that alpha work: it turns whatever is behind
             into a soft field rather than competing detail, so the page reads as
             present without reading as legible. Saturate keeps the colour behind
             from going grey, which is what a plain blur does to it.

             Depth comes from the shadow ramp rather than the fill, which is what
             lets the fill be this light at all. */
            style={
              m.from === "ai"
                ? {
                    /* Properly glassy: more of the page comes through, and a
                     heavier blur carries the legibility the fill gives up. The
                     two move together — dropping alpha without raising blur is
                     how glass ends up looking like a stain rather than a pane.

                     Not flat, either. A pane catches light unevenly, so the fill
                     is a gradient from a brighter top-left corner down to the
                     body, which is what stops it reading as a rectangle of
                     translucent paint. */
                    background:
                      "linear-gradient(148deg, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.5) 48%, rgba(255,255,255,0.46) 100%)",
                    backdropFilter: "blur(30px) saturate(180%)",
                    WebkitBackdropFilter: "blur(30px) saturate(180%)",
                    color: neutral.ink,
                    /* The rim, the light entering it, and the ramp underneath.
                     The bright inset along the top edge is the lit rim; the
                     broad white glow falling from it is light in the material;
                     the faint ring keeps the silhouette where neither reaches.
                     Together they read as a solid you can see into rather than
                     a translucent rectangle. */
                    /* Lighter than it was. A ramp that reads as considered on an
                     opaque card reads as heavy under glass: the fill is barely
                     there, so the shadow becomes the loudest thing about the
                     bubble and the frost ends up sitting in a pool of grey. The
                     insets do most of the lifting now — the lit rim is what
                     separates glass from the page — and the cast shadow only
                     has to say the bubble is above it, not how far. */
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 0 0 1px rgba(255,255,255,0.4), inset 0 10px 22px -12px rgba(255,255,255,0.7), inset 0 0 0 1px rgba(15,17,26,0.05), 0 1px 2px rgba(15,17,26,0.04), 0 8px 20px -12px rgba(15,17,26,0.12)",
                    animation: `reply-in 320ms cubic-bezier(0.16, 1, 0.3, 1) ${lag(i)}ms both`,
                  }
                : {
                    /* The tenant's colour, as glass. Lit from the same corner as
                     the agent's bubble so the two are one material in two
                     values, and held higher — 88 falling to 80 — because white
                     type needs more behind it than dark type does, and an
                     accent thinned far enough to see through stops being the
                     accent and becomes whatever is underneath it. */
                    background: `linear-gradient(148deg, color-mix(in srgb, ${accent} 82%, transparent) 0%, color-mix(in srgb, ${accent} 74%, transparent) 100%)`,
                    backdropFilter: "blur(30px) saturate(160%)",
                    WebkitBackdropFilter: "blur(30px) saturate(160%)",
                    color: "#FFFFFF",
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.32), inset 0 0 0 1px rgba(255,255,255,0.14), 0 1px 2px rgba(15,17,26,0.05), 0 8px 20px -12px color-mix(in srgb, ${accent} 30%, transparent)`,
                    animation: `reply-in 320ms cubic-bezier(0.16, 1, 0.3, 1) ${lag(i)}ms both`,
                  }
            }
          >
            {m.text}
          </span>
        ))}
        {/* The message's own options, on their own line rather than in a rail.
          There is no panel edge out here to pin a row to, and chips floating
          under the turn read as part of the question that asked them.

          Gone the moment one is pressed. They belong to the turn above them, so
          the instant the visitor answers they are spent — leaving them up until
          the reply arrives left the old options sitting under the new message,
          still pressable, offering answers to a question already answered. */}
        {chips.length > 0 && (
          <span
            className={`flex w-full shrink-0 flex-wrap gap-2 ${
              side === "left" ? "justify-start" : "justify-end"
            }`}
          >
            {chips.map((c, i) => (
              <button
                key={c}
                type="button"
                onClick={() => onStart(c)}
                className="rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-transform hover:scale-[1.03]"
                /* The visitor's own material. A suggestion is a sentence they
                   are about to say, so it belongs to their side of the
                   conversation — and pressing one puts those exact words in a
                   bubble of this colour directly above. White chips read as a
                   third party offering options; these read as the words
                   already half-said.

                   The same glass recipe as that bubble, lit from the same
                   corner, so the row and the turn it produces are one
                   material. */
                style={{
                  color: "#FFFFFF",
                  background: `linear-gradient(148deg, color-mix(in srgb, ${accent} 82%, transparent) 0%, color-mix(in srgb, ${accent} 74%, transparent) 100%)`,
                  backdropFilter: "blur(30px) saturate(160%)",
                  WebkitBackdropFilter: "blur(30px) saturate(160%)",
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.32), inset 0 0 0 1px rgba(255,255,255,0.14), 0 1px 2px rgba(15,17,26,0.05), 0 8px 20px -12px color-mix(in srgb, ${accent} 30%, transparent)`,
                  /* Behind the last bubble on the opening replay, immediately
                 after it once the conversation is live — the options belong to
                 the turn that asked them and should not beat it onto the
                 page. */
                  animation: `reply-in 320ms cubic-bezier(0.16, 1, 0.3, 1) ${
                    lag(turns.length - 1) + 120 + i * 60
                  }ms both`,
                }}
              >
                {c}
              </button>
            ))}
          </span>
        )}
      </span>
    </span>
    </span>
  );
}

function ButtonSuggestions({
  prompts,
  side,
  show,
  greeting,
  greetingInline,
  hoverReveal,
  promptsOpen,
  greetingMarkDot,
  greetingDot,
  glass,
  fill,
  ink,
  stroke,
  accent,
  accentLite,
  recall,
  compact,
  wash,
  onOpen,
  onStart,
  onDismiss,
  children,
}: {
  prompts: string[];
  side: "left" | "right";
  show: boolean;
  /* Present only for the states that put something beside the button the
     visitor did not ask for — an unread, a resume offer, their own unsent
     draft. A greeting on a first visit has no cross: there is nothing to
     decline yet, and a launcher that offers to remove itself before it has
     said anything is asking a question nobody has. */
  onDismiss?: () => void;
  /* the conversation's own opening line, or null when it is switched off —
     the same text the messenger starts with, so the two cannot disagree */
  greeting: string | null;
  /* Beside the button rather than above it. A greeting is the agent opening a
     conversation, which belongs over the top of the stack it introduces; an
     offer to resume one is a label on the button itself, and reads like one
     sitting on the same line. */
  greetingInline?: boolean;
  /* Drawn at the head of the inline box, when the box is a label. A message
     does not get one: the mark says "there is a conversation here", which the
     message is already demonstrating by being one. */
  greetingMarkDot?: string | null;
  /* The composer's dot, on the card instead of in the field. Same 8px in the
     accent, same job: there is either something waiting behind this launcher or
     there is not, and the dot says so without spending any of the line. */
  greetingDot?: boolean;
  /* The surface every part of the cluster is made of — the greeting, the
     suggestions and the resume box alike. Passed in rather than built here: it
     is the same recipe the launcher's own glass style uses, off the same OKLCH
     pair, so the things beside the button are the same material as the button. */
  glass?: {
    background: string;
    shadow: string;
    color: string;
    /* an edge for the type, when the surface is too thin to give it one */
    textShadow?: string;
    /* what the badge is knocked out in, once the mark is no longer sitting on
       the chips' flat fill */
    markRing: string;
  } | null;
  /* the accent trio off the OKLCH engine, not mixed here — see deriveShades */
  fill: string;
  ink: string;
  stroke: string;
  /* Dark only — see chipHover. Absent in light, where the ring alone reads. */
  wash?: string;
  accent: string;
  accentLite: string;
  /* The last exchange, shown in place of the suggestions. Someone coming back
     a few hours later is not choosing between four openings — they are checking
     whether this is the conversation they think it is, and the pair that answers
     that is the same pair the composer launcher opens into. So the reveal
     carries it instead of the chips: one gesture, one answer, and the two
     launchers say the same thing when they are reached for. */
  recall?: { label: string; when: string; ask: string; reply: string } | null;
  /* Phone spacing. The type is the same size — 14px is the floor for something
     read one-handed and in motion — but a chip and a card sized for a 1000px
     page take more of a 380px one than they are worth. */
  compact?: boolean;
  /* Hold the suggestions back until the cluster is reached for, the way the
     composer holds its pane shut. The button's own job is to say what this
     thing is; the suggestions are what you can do with it, and showing both at
     once puts a menu on the customer's page before anyone has asked for one.

     Off on a phone, where there is no hover to reach with — that case needs its
     own answer and does not get to be a worse version of this one. */
  hoverReveal?: boolean;
  /* The same reveal, driven by something other than a pointer. A phone has no
     hover, so the caller says when — on a scroll — and the chips and the
     greeting swap exactly as they do under the cursor. */
  promptsOpen?: boolean;
  onOpen: () => void;
  onStart: (text: string) => void;
  children: React.ReactNode;
}) {
  /* Hover in CSS, not in state, and the suggestions taken out of the flow.

     Tracking it with onMouseEnter/onMouseLeave meant revealing the chips
     resized the very element whose hover was being tracked: the cursor could
     end up outside the new bounds, leave fired, the chips went, the box shrank
     back under the cursor, enter fired again. That is the flicker — the
     suggestions staying up sometimes and strobing others.

     Absolutely positioned above the row, they add nothing to the box, so the
     hover target is the same size whether they are showing or not. And :hover
     follows the DOM rather than the layout, so pointing at a chip still counts
     as pointing at the cluster. */
  const showGreeting = show && greeting;
  /* With the greeting switched off there is nothing for the suggestions to
     take turns with, and a launcher whose only content is behind a hover has
     nothing to say at rest. So they stop being a reveal and become the resting
     state — which is what they already are in the composer launcher when its
     placeholder has nothing else to cycle. */
  const swaps = !!greeting;
  const hoverGate = hoverReveal && swaps;
  const openGate = swaps ? promptsOpen : true;
  /* Beside the button, in the greeting's place. The row is what the hover
     already shows — the card gone, the chips where it stood — so with the
     greeting switched off the launcher simply rests in the state it used to
     hover into. The slot collapses to a point and the chips, anchored to its
     bottom corner, land on the same corner the card was aligned to. */
  const restingReveal = !!show && !swaps && (prompts.length > 0 || !!recall);
  /* The message as one run of words, wrapped by the browser and cut by the
     measure — no line breaks chosen here at all.

     Breaking it in code meant counting characters against a width, and the
     count was wrong twice over: it was an average advance standing in for real
     glyphs, and it knew nothing of the dot and the gap that share the row with
     the text on a draft. Lines sized to 28 characters landed in a column with
     room for fewer, so the browser wrapped them a second time — a chosen break
     followed by a forced one, which is where the ragged short lines and the
     empty right-hand side came from.

     The browser is the only thing that knows how wide the words actually are.
     It gets the whole sentence, wraps it to whatever the column really is, and
     line-clamp cuts it at three with its own ellipsis. */
  const greetingLines = greeting ? greeting.replace(/\s+/g, " ").trim() : "";
  const clampGreeting: CSSProperties = {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: INLINE_LINES,
    overflow: "hidden",
  };
  const typedGreeting = useTyped(greetingLines, !!show && !!greeting);
  const showPrompts = show && prompts.length > 0 && !recall;
  /* Where the revealed thing sits, and how it arrives. Both the chips and the
     recall card take these: they are the same object in the layout — whatever
     the cluster has to say once it is reached for — and only their contents
     differ. */
  const revealPos = `z-10 flex flex-col gap-2 ${
    /* Beside the button it is lifted out of the flow and pinned to the slot's
       corner, so the row cannot resize under the cursor driving the hover.
       Stacked above the button — the phone layout — it has to sit in the column
       like any other child, or it anchors to the bottom of the cluster and
       lands on top of the button it is meant to sit above. */
    greetingInline
      ? `absolute bottom-0 ${side === "left" ? "left-0" : "right-0"}`
      : ""
  } ${side === "left" ? "items-start" : "items-end"} ${
    hoverGate
      ? "pointer-events-none group-hover:pointer-events-auto"
      : openGate
        ? ""
        : "pointer-events-none"
  }`;
  const revealIn = hoverGate
    ? "translate-y-1 opacity-0 transition-[opacity,transform,background-color,box-shadow] duration-200 [transition-delay:0ms] group-hover:translate-y-0 group-hover:opacity-100 group-hover:[transition-delay:var(--in-delay)]"
    : "transition-[background-color,box-shadow] duration-200";
  /* Revealed under a cursor, the reveal transitions out of a hidden state that
     is already on the page. Mounted on a scroll it has no such state to leave,
     so it carries an animation instead — the same 4px rise, the same duration
     and the same per-item step, so both triggers produce the same arrival. */
  const revealAnim = hoverGate
    ? undefined
    : "chip-in 200ms cubic-bezier(0.16, 1, 0.3, 1) var(--in-delay) both";
  /* One block, placed by the layout it lands in. Beside the button it is taken
     out of the flow and anchored to the slot's corner so the row cannot resize;
     stacked above the button — which is what a phone gets, where there is no
     room beside it — it sits in the column like any other child. */
  const chips = showPrompts ? (
    <span
      /* Each chip carries its own arrival now; the container only
             decides whether they can be clicked. Fading the block as a
             whole made three suggestions appear as one object, and hiding
             the parent would cut the children's exit off mid-fade. */
      className={revealPos}
    >
      {prompts.map((p, i) => (
        <button
          key={p}
          type="button"
          onClick={() => onStart(p)}
          /* identical to the composer's suggestions — same padding, radius,
                 size and accent-derived colours; width hugs the text */
          className={`starter-chip w-max shrink-0 whitespace-nowrap rounded-full text-[14px] ease-out ${
            compact ? "px-3 py-1.5" : "px-4 py-2"
          } ${revealIn}`}
          style={{
            color: glass?.color ?? ink,
            background: glass?.background ?? fill,
            /* The accent, same as the messenger's own suggestions — one
               hover ring for a chip wherever the visitor meets it. It used to
               go white on the glass surface, which was right while that surface
               was a dark translucent body and invisible the moment it became a
               white card. */
            ["--chip-stroke" as string]: stroke,
            ["--chip-wash" as string]: wash ?? "transparent",
            ["--chip-shadow" as string]: glass?.shadow ?? BUTTON_SHADOW,
            /* Stepped by position on the way in, so the set eases in
                   one after the other. The step is the whole run divided
                   by the count, so three chips take the same time four
                   would — the sequence keeps its length instead of
                   growing with the number of options.

                   Held in a variable rather than set directly, because
                   it must apply on hover only. Leaving is not an event
                   worth choreographing: the visitor has already moved on,
                   and a set that dismantles itself one piece at a time
                   reads as the launcher being slow to let go. They all
                   go at once. */
            ["--in-delay" as string]: `${Math.round(
              (i * REVEAL_RUN_MS) / Math.max(prompts.length, 1),
            )}ms`,
            animation: revealAnim,
          }}
        >
          {p}
        </button>
      ))}
    </span>
  ) : null;

  /* Cut to the two lines the card gives it, then typed into them. The card is
     the resting state now rather than something a hover produces, so the reply
     arriving a word at a time is the only motion saying a conversation is
     waiting — and it stops, because it is a message and not a rotation. */
  const replyFull = recall ? clipWords(recall.reply, CARD_CHARS) : "";
  const replyTyped = useTypedOnce(replyFull, !!show && !!recall);
  const clampStyle: CSSProperties = {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: CARD_LINES,
    overflow: "hidden",
  };
  /* The composer launcher's expand view, in the button launcher's slot. Same
     four parts in the same order — who it belongs to, when it was, what they
     asked, what they got — because it is the same moment in the same product,
     and two different recall panels would be two answers to one question. */
  const recallCard =
    show && recall ? (
      <span className={`${revealPos} relative`}>
        {/* On the recall card's own corner.

            It used to be drawn once, up on the greeting slot — which is the
            right corner for the message card and the wrong one here: recent
            and open have no greeting card, so that slot collapses to a point
            at the bottom of the cluster and the cross landed under the card
            instead of on it. The card that is actually on screen carries its
            own. */}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            className="absolute -top-2 -right-2 z-20 grid size-6 place-items-center rounded-full bg-white transition-colors hover:bg-[#F0F0F3]"
            style={{ color: ink, boxShadow: BUTTON_SHADOW }}
          >
            <X className="size-3.5" strokeWidth={2.2} />
          </button>
        )}
        <button
          type="button"
          onClick={onOpen}
          /* Wider than a chip and narrower than the panel it opens. The reply
             needs a measure to break over two lines; much past this and the
             cluster stops being something resting beside the button. */
          className={`flex flex-col gap-2 rounded-2xl px-4 py-3.5 text-left ease-out ${revealIn}`}
          style={{
            width: CARD_W,
            background: glass?.background ?? fill,
            color: glass?.color ?? ink,
            boxShadow: glass?.shadow ?? BUTTON_SHADOW,
            ["--in-delay" as string]: "0ms",
            animation: revealAnim,
          }}
        >
          <span className="flex items-center gap-2">
            <span
              className="min-w-0 flex-1 truncate text-[10px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: accent }}
            >
              {recall.label}
            </span>
            {/* On the label's line, not the question's. Both are facts about
                the exchange rather than part of it, so they belong on the same
                row — and the question keeps its full width for the words. */}
            <span className="shrink-0 text-[10px]" style={{ color: accent }}>
              {recall.when}
            </span>
          </span>
          {/* Their question, marked as a quotation. A rule down the left is the
              cheapest thing that says "these are your words, not ours" —
              without it the question and the answer are two paragraphs at
              different sizes, which is a wall rather than an exchange. */}
          <span
            className="truncate border-l-2 pl-2.5 text-[13px]"
            /* The card's own ink at reduced strength rather than a named grey:
               on a glass or accent-filled card that grey was a light-mode
               assumption printed on top of a coloured surface. */
            style={{
              borderColor: accentLite,
              color: "color-mix(in oklab, currentColor 62%, transparent)",
            }}
          >
            {recall.ask}
          </span>
          {/* The answer, unattributed. The rule beside the question already
              marks one of the two as the visitor's, which is enough to make the
              other the agent's.

              Clamped in the style rather than by a line-clamp class: the count
              comes from CARD_LINES, and a class name built from a variable is
              one Tailwind cannot see in the source — it would be stripped from
              the build and the reply would run to as many lines as it liked.

              The whole cut sits underneath at zero opacity to hold the box
              open, and the typed portion is laid over it — without the sizer
              the card would grow line by line as it wrote and push the button
              along the row. */}
          <span
            className="relative text-[14px] leading-snug"
            style={{ color: glass?.color ?? ink }}
          >
            <span className="invisible" style={clampStyle}>
              {replyFull}
            </span>
            <span className="absolute inset-0" style={clampStyle}>
              {replyTyped}
            </span>
          </span>
        </button>
      </span>
    ) : null;
  const reveal = recallCard ?? chips;

  return (
    <span
      className={`group relative flex flex-col gap-2 ${
        side === "left" ? "items-start" : "items-end"
      }`}
    >
      {/* Stacked, the two take turns by being rendered or not rather than by
          being hidden in place. There is no cursor to lose here, so nothing
          needs its space held open — and a column that reserved room for three
          chips would push the greeting up the page while showing none of
          them. */}
      {/* The chips' arrival lives here rather than in globals.css: Tailwind
          strips keyframes it cannot see referenced, and this one is named from
          an inline style, so it was being removed from the build and the
          animation resolved to nothing. Declared beside the thing that uses it,
          it survives — and unlike the panel's own style block, this component is
          on the page whenever the launcher is. */}
      <style>{`
        @keyframes chip-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
      {!greetingInline && openGate && reveal}
      {showGreeting && !greetingInline && !openGate && (
        /* Pressing it opens the conversation rather than sending anything: it
           is the agent talking, not something the visitor could say. Held to a
           narrow measure so it reads as a remark beside the button and not as a
           panel that has already opened. */
        <button
          type="button"
          onClick={onOpen}
          /* No bottom margin. The column already carries gap-2 between its
             children, and the two stacked gave 16 where the row beside the
             button gives 8 — the same cluster spaced differently depending on
             which way it was laid out. */
          className={`flex items-center gap-2.5 rounded-2xl text-left text-[14px] leading-snug transition-transform hover:scale-[1.02] ${
            compact ? "px-3 py-2.5" : "px-4 py-3"
          } ${hoverReveal ? "group-hover:opacity-0 transition-opacity" : ""}`}
          /* The same surface as the chips below it. The greeting and the
             suggestions are one offer in two parts — the agent speaking and the
             things you can say back — and two different materials stacked read
             as two separate widgets that happened to line up. */
          style={{
            /* The width the card beside the button has. It used to hug its own
               text — one line for a short label, a 260 cap for a message — so
               the same card was a different size in every state and a phone
               flipping between them watched it change shape. The desktop one
               was fixed for the same reason; this is the other half of it. */
            width: TALK_W,
            background: glass?.background ?? fill,
            color: glass?.color ?? ink,
            boxShadow: glass?.shadow ?? BUTTON_SHADOW,
            animation: "reply-in 260ms cubic-bezier(0.16, 1, 0.3, 1) both",
          }}
        >
          {greetingDot && (
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ background: accent }}
            />
          )}
          {greetingMarkDot && (
            <ChatDotsMark
              className="size-6 shrink-0"
              style={{ color: glass?.color ?? ink }}
              dot={greetingMarkDot}
              dotRing={glass ? glass.markRing : fill}
              /* The same 24px mark and 3.5 radius the composer launcher uses,
                 so the badge is 7px in both places by simply being identical. */
              dotR={3.5}
            />
          )}
          <span
            className={greetingMarkDot ? undefined : "min-w-0 flex-1"}
            style={clampGreeting}
          >
            {greetingLines}
          </span>
        </button>
      )}

      {greetingInline && (showGreeting || restingReveal) ? (
        /* One row with the button. Reversed on the left placement so the box
           always sits on the outside — away from the page edge the button is
           tucked into, which is the only side it has room to open on. */
        <span
          /* Bottoms aligned, not centres. The box is taller than the button and
             centring left it hanging above the launcher's baseline — sat on the
             same line they read as two things resting on the page rather than
             one floating beside the other. */
          className={`flex items-end gap-2 ${
            side === "left" ? "flex-row-reverse" : ""
          }`}
        >
          {/* One slot holding both. The greeting sizes it; the suggestions are
              taken out of the flow and anchored to the same corner, so at rest
              the box is exactly the greeting and not the greeting plus room for
              three chips nobody has asked for yet.

              Out of the flow is also what keeps the swap stable: the slot never
              resizes, so the cursor cannot lose the element whose hover is
              driving it. */}
          <span className="relative">
            {reveal}
            {/* On the card's corner, half off it. Inside the box it would be
                competing with the message for the same padding; hung on the
                corner it reads as the standard way out of a thing that
                appeared on its own — and the slot is not clipped, so it can
                sit where it belongs.

                The recall card carries its own — see recallCard — because it
                sits in the reveal slot rather than this one. */}
            {onDismiss && showGreeting && (
              <button
                type="button"
                onClick={onDismiss}
                aria-label="Dismiss"
                className="absolute -top-2 -right-2 z-20 grid size-6 place-items-center rounded-full bg-white transition-colors hover:bg-[#F0F0F3]"
                style={{ color: ink, boxShadow: BUTTON_SHADOW }}
              >
                <X className="size-3.5" strokeWidth={2.2} />
              </button>
            )}
            {showGreeting && (
              <button
                type="button"
                onClick={onOpen}
                /* Every corner the same. The tail that squares one corner is what
               makes a bubble point at its speaker; on this line the box is
               beside the button rather than above it, and a tail would be
               pointing at the page. */
                /* Measured to break the sentence over two lines. A single line
               runs wider than the button it sits beside and turns the cluster
               into a bar across the corner; two lines give the box roughly the
               button's own proportions, so the pair reads as one object rather
               than as a label with something stuck to it.

               The break is chosen rather than left to a max-width — see
               twoLines above for why. */
                className={`flex items-center gap-2.5 rounded-2xl px-4 py-[14px] text-left text-[14px] leading-snug transition-transform hover:scale-[1.02] ${
                  /* 16 either side whatever is in it. The short label used to be
                     tuned by eye — 30 and 34, hand-balanced around a mark that
                     is no longer on this card — and a phrase padded differently
                     from a message made two cards out of one component. It is
                     also the recall card's gutter, so everything that can sit
                     beside the button shares an edge. */
                  ""
                } ${
                  /* Fades with the same gesture that brings the suggestions in, so
                 the two read as one thing giving way to another rather than two
                 things toggling. It keeps its space: the row must not resize,
                 or the cursor loses the element whose hover is driving all
                 this. */
                  hoverReveal
                    ? /* Both, and for the same reason the chips take both: opacity
                       leaves it painted and hit-testable, and `invisible` is
                       the half that guarantees it is actually gone. */
                      "transition-opacity duration-200 group-hover:invisible group-hover:opacity-0"
                    : promptsOpen
                      ? "invisible opacity-0 transition-opacity duration-200"
                      : "transition-opacity duration-200"
                }`}
                style={{
                  width: TALK_W,
                  background: glass?.background ?? fill,
                  color: glass?.color ?? ink,
                  textShadow: glass?.textShadow,
                  boxShadow: glass?.shadow ?? BUTTON_SHADOW,
                  animation:
                    "reply-in 260ms cubic-bezier(0.16, 1, 0.3, 1) both",
                }}
              >
                {greetingDot && (
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ background: accent }}
                  />
                )}
                {greetingMarkDot && (
                  <ChatDotsMark
                    className="size-6 shrink-0"
                    style={{ color: glass?.color ?? ink }}
                    dot={greetingMarkDot}
                    dotRing={glass ? glass.markRing : fill}
                    /* The same 24px mark and 3.5 radius the composer launcher
                   uses, so the badge is 7px in both places by simply being
                   identical. */
                    dotR={3.5}
                  />
                )}
                {/* A label sizes to itself, broken over two balanced lines; a
                message needs a measure and runs to three. The first is a
                fixed phrase and looks wrong with a ragged edge; the second is
                whatever the agent wrote and would be a single long line
                without one. */}
                {/* The full wrapped line sits underneath at zero opacity to hold
                  the box open, and the typed portion is laid over it. Without
                  the sizer the card would grow letter by letter and shove the
                  button along the row. */}
                <span className="relative min-w-0 flex-1">
                  <span className="invisible" style={clampGreeting}>
                    {greetingLines}
                  </span>
                  <span className="absolute inset-0" style={clampGreeting}>
                    {typedGreeting}
                  </span>
                </span>
              </button>
            )}
          </span>
          {children}
        </span>
      ) : (
        children
      )}
    </span>
  );
}

function LauncherPreview({
  accent,
  theme,
  settings: s,
  siteUrl,
  siteShot,
  thinkMark,
  thinkMarkSrc,
  thinkLabel,
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
  /* An uploaded page outranks the URL: it is the more deliberate of the two,
     and it is usually there because the capture could not reach the site. */
  siteShot: SiteShot | null;
  /* Configured on the messenger side, but the launcher opens the same agent —
     a thinking mark that changed depending on which preview you were looking
     at would be describing two different products. */
  thinkMark: ThinkingMark;
  thinkMarkSrc: string | null;
  thinkLabel: string;
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
  /* Layout is one question and interaction is another, and the tablet answers
     them differently: it is wide enough to lay out like a desktop and has no
     pointer to hover with, so everything the launcher opens on a hover has to
     open on a scroll there instead. Vinit's note, 11 Sep — "tablet is more
     similar to mobile than desktop… tablet is touch-based now."

     So `isMobile` keeps its job of sizing things and this one owns the
     gestures. */
  const isTouch = device === "mobile" || device === "tablet";
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
  /* Dismissed chips, by the state that raised them.

     Design review, 11 Sep: "in order to remove it, they have to click on it
     and then close it" — the launcher was making someone open a conversation
     they had already decided not to have, purely to get the line off their
     screen. So each of the four states that carries a chip carries a cross,
     and once it is pressed the launcher rests like a first visit for the rest
     of the session, across pages.

     Sticky per state, and the one exception is the unread: a dismissal
     declines the information you were shown, and a new message is information
     you were not — so in production the unread re-arms on the next inbound
     event, where recent, open and the unsent draft stay down for good. The
     fixture here has no second message to arrive with, so all four stay
     dismissed until the preview is reset. */
  const [dismissed, setDismissed] = useState<string[]>([]);
  const chipShut = dismissed.includes(session);

  const unread = session === "unread" && !chipShut;
  /* The tab notifier, on while the previewed state is an unread one. Wired
     here so the idea can be judged in the review the way a visitor would meet
     it — by looking at the browser tab, not at a mock of one. */
  useFaviconBadge(unread);
  /* Fires on the transition into the state, not on every render of it — the
     hook's dependency is the flag, so switching visitor states plays it once
     and staying in one plays nothing. */
  useArrivalChime(unread);
  /* The agent going first. It behaves like an unread everywhere the launcher is
     concerned — a message on the card, a badge, no suggestions talking over
     it — and differs in the one place that matters: there is no conversation
     behind it, so pressing it starts one on this message. */
  const floating = session === "floating" && !chipShut;
  /* Where the two are still the same thing: neither has suggestions beside the
     launcher, because both are holding something the visitor has to read
     first — the unread on its card, the floating one on the page above it. */
  const announces = unread || floating;
  /* The one resuming state that takes the field's line rather than waiting in
     the chip row. They left the site and came back, so unlike someone who just
     closed it on this page they may genuinely not remember there is a thread —
     and unlike someone a page on, there is no new page competing for the same
     line. Nothing else here has a better claim on it. */
  /* Both the recent and the open conversation. What differs between them is
     not whether there is a thread — there is, for a week — but how likely the
     visitor is to want a different one, and that shows up inside the panel
     rather than on the launcher. */
  const resumable = (session === "recent" || session === "open") && !chipShut;
  /* The mark on the button while a conversation is waiting to be picked back
     up — a few hours old or a week, either way pressing it goes somewhere that
     already exists. Not on an unread: that one already has a count sitting in
     the same corner, and two badges on one button is the launcher shouting. */
  const resumeMark = resumable;
  const hasDraft = session === "draft" && !chipShut;
  /* The two states whose card is carrying something the visitor has to read
     rather than an offer they can act on. They get no suggestions and no
     reveal — what is on the card is the whole of it. */
  const holdsMessage = announces || hasDraft;
  const resuming = resumable || hasDraft;
  /* Every state with a thread to go back to, which is a wider set than the
     ones whose resting launcher is changed by it. "Earlier today" rests like a
     first visit and still has a conversation waiting, and without a chip its
     only way back would be catching the greeting mid-rotation — a door that is
     open for four seconds at a time is not a door. */
  /* Nothing, now. Every resting state carries whatever it has to offer in the
     field itself — the resume line, the greeting, the draft — so a chip
     repeating it would be the same door twice, and the row is worth more as
     three suggestions than as two plus a duplicate. */
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
    () =>
      /* History outranks the page for someone who has a conversation behind
         them: what they were in the middle of is a better guess at what they
         are here for than what the page happens to be about. Either way the
         set comes off the script, so pressing one carries the conversation on
         instead of starting a different one beside it. */
      resumable
        ? scriptPrompts(session === "open" ? openThread() : priorThread())
        : SCRIPT_SITE.test(trimmed)
          ? scriptPrompts(SCRIPT.slice(0, 1))
          : (generatedFor(trimmed) ?? promptsFor(s, activePath)),
    [trimmed, s, activePath, resumable, session],
  );
  const origin = trimmed
    ? /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`
    : "";
  const looksLikeUrl = !!origin && /\.[a-z]{2,}/i.test(origin);
  const [failedShots, setFailedShots] = useState<string[]>([]);
  const [loadedShots, setLoadedShots] = useState<string[]>([]);
  /* An upload is a picture we already hold, so it takes the same path as a
     checked-in shot: straight into the frame, no capture, no failure state. */
  const localSite = siteShot
    ? { src: siteShot.src }
    : looksLikeUrl
      ? localSiteFor(origin)
      : null;
  /* The frame is a viewport and the page scrolls inside it, so a shot taller
     than the frame is browsed rather than cropped or squeezed. */
  const frameHeight = fills ? measured.h : 680;
  const shot =
    looksLikeUrl && !localSite && !siteShot ? shotUrl(origin, activePath) : "";
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
  /* The floating conversation, held here because it is a live conversation and
     not a fixture: pressing one of its suggestions answers in place, on the
     page, without a panel ever opening. */
  const [floatRun, setFloatRun] = useState({
    stamp: session,
    turns: floatingThread(),
  });
  /* Stamped with the state it belongs to and read back through the stamp
     rather than reset by an effect. Switching visitor mid-conversation would
     otherwise carry half an exchange into a different state — and clearing it
     with a setState inside an effect is a second render for something the
     first one already knows. */
  const floatTurns =
    floatRun.stamp === session ? floatRun.turns : floatingThread();
  const setFloatTurns = useCallback(
    (next: (t: Msg[]) => Msg[]) =>
      setFloatRun((r) => ({
        stamp: session,
        turns: next(r.stamp === session ? r.turns : floatingThread()),
      })),
    [session],
  );
  const floatReply = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (floatReply.current) clearTimeout(floatReply.current);
    },
    [],
  );
  /* Answered where it was asked. The turn goes up immediately and the reply
     follows at the pace it would take to write — the same derivation the panel
     uses, so a conversation held on the page moves like one held inside it. */
  const sendFloating = useCallback(
    (text: string) => {
      setFloatTurns((t) => [...t, { from: "user", text }]);
      if (floatReply.current) clearTimeout(floatReply.current);
      const turn = scriptedReply(text) ?? cannedReply(text);
      floatReply.current = setTimeout(
        () => setFloatTurns((t) => [...t, { from: "ai", ...turn }]),
        Math.min(1400, 400 + wordCount(turn.text) * 18),
      );
    },
    [setFloatTurns],
  );
  /* The floating composer's own field.

     In every other state the launcher's line is a button: pressing it opens
     the messenger, because that is where a conversation happens. Floating is
     the exception the mode exists for — the conversation is already happening
     on the page — so the field is a real one, and the whole point is that a
     visitor can answer without a panel ever opening over what they were
     reading.

     Held here rather than in the pill so a reply landing mid-sentence cannot
     clear what is being typed. */
  const [floatDraft, setFloatDraft] = useState("");
  const mic = useDictation(setFloatDraft);
  /* Past two lines the pill stops being a row.

     Same rule the messenger's composer uses — counted off the characters
     rather than measured from the DOM, because a measure taken while the box
     is growing feeds its own result back in and the layout oscillates on the
     boundary. The divisor is the floating pill's own measure rather than the
     panel's: it is a narrower field, so a line ends sooner in it. */
  const floatMultiline = useMemo(() => {
    if (!floatDraft) return false;
    const lines = floatDraft
      .split("\n")
      .reduce((a, l) => a + Math.max(1, Math.ceil(l.length / 34)), 0);
    return lines > 2;
  }, [floatDraft]);

  /* Grown by hand, the way the messenger's field is: a textarea has no
     content-height of its own, so it is reset to one row and set to whatever
     the text actually measures, capped by the max-height in the style. */
  const floatFieldRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = floatFieldRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [floatDraft]);

  const submitFloating = useCallback(() => {
    const text = floatDraft.trim();
    if (!text) return;
    mic.stop();
    setFloatDraft("");
    sendFloating(text);
  }, [floatDraft, mic, sendFloating]);

  /* What the panel opens on when the field is pressed: whatever has been said
     out here. The launcher opens what it says, and by then it has said several
     things. */
  const seeded = floating ? floatTurns : fresh ? null : seedFor(session);
  /* Nothing. Continuing means seeing the last message — the agent does not
     announce that it has noticed. An extra "welcome back, still on that?"
     turn is a message the visitor has to read before reaching the one they
     came back for, and it says nothing the thread above it is not already
     saying. */
  const opening: Msg | null = null;
  /* Whether pressing the launcher itself picks the old thread up. The rule is
     the same everywhere: it opens what it says. "Just left" says continue, so
     it continues; a button greeting by name has not mentioned the thread, so
     it starts new and offers the thread as a card above the greeting. */
  /* Not the floating one: there is no thread to pick up. It opens a new
     conversation whose first turn is the message the card was showing — the
     same rule as everywhere else, the launcher opens what it says. */
  const opensThread = resumable || hasDraft || unread;

  const openChat = (p?: string, startFresh = false) => {
    setPrompt(p);
    setFresh(startFresh);
    setOpen(true);
  };
  /* Back to rest, not back to whatever it was doing when the panel covered it.
     The pane is held open by hover, and while the panel is up the pointer is on
     the panel — so no mouseleave ever fires and the flag is still set when the
     panel goes. Closing then revealed a launcher already expanded, offering the
     suggestions of a conversation the visitor had just finished with. */
  const closeChat = () => {
    setOpen(false);
    setHoverOpen(false);
  };

  /* ── entrance: the launcher is absent until the delay elapses ──
     Replay re-arms it so you can feel the wait you just dialled in, and
     doubles as the user gesture browsers need before they'll play sound. */
  // identity of the current entrance run — any change re-arms the wait, so
  // `entered` falls back to false without an effect having to reset it
  /* Which sound is chosen is deliberately *not* in the key. The entrance is
     the launcher arriving; picking a different chime is not a new arrival,
     and keying off it meant the picker replayed the whole entrance — which
     played the sound a second time on top of the one the picker had just
     played itself. */
  const runKey = `${s.type}-${s.delay}-${s.soundOn}`;
  const [enteredKey, setEnteredKey] = useState<string | null>(null);
  const entered = enteredKey === runKey;

  /* Kept in a ref so the timer can read whichever sound is current when it
     fires: naming the value as a dependency would put it straight back into
     the re-run it was just taken out of. Written in an effect rather than
     during render, since a ref is not a rendering concern. */
  const soundRef = useRef(s.sound);
  useEffect(() => {
    soundRef.current = s.sound;
  }, [s.sound]);

  useEffect(() => {
    const id = setTimeout(() => {
      setEnteredKey(runKey);
      if (s.soundOn) playSound(soundRef.current);
    }, s.delay * 1000);
    return () => clearTimeout(id);
  }, [runKey, s.delay, s.soundOn]);

  /* the resting bar widens to show its prompts — scroll does this on the real
     site, which a static preview frame has no equivalent for, so hover does.
     Declared here because the typewriter below reads it: the two are one
     behaviour, the pill either cycles its suggestions or shows them. */
  const [hoverOpen, setHoverOpen] = useState(false);
  /* A phone has no hover, so the suggestions answer a scroll instead — and
     they answer the direction of it, not merely the fact of it.

     Down is reading on: the visitor is moving through the page, so the
     launcher offers the three things it can help with. Up is going back for
     something, and at that moment the greeting — who this is and that it is
     here — is the more useful of the two. Design review, 11 Sep: "if they
     scroll down you can show the buttons, but if they scroll up, show back the
     message."

     Either way the suggestions fold themselves away a few seconds after the
     page stops moving, so a launcher does not end up permanently expanded over
     the site it is sitting on. The next scroll is a new offer.

     A small threshold, because a thumb never moves in one axis alone: a few
     pixels of drift while the finger settles would otherwise flip the launcher
     back and forth under a hand that is holding still. */
  const [scrolled, setScrolled] = useState(false);
  const scrollHold = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastY = useRef(0);
  const onSiteScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const y = e.currentTarget.scrollTop;
    const dy = y - lastY.current;
    lastY.current = y;
    if (Math.abs(dy) < SCROLL_TURN_PX) return;

    if (scrollHold.current) clearTimeout(scrollHold.current);

    if (dy < 0) {
      /* Back to the greeting at once. The offer took a scroll to earn its
         place; taking it away is an undo, and an undo that waits is a delay. */
      setScrolled(false);
      return;
    }

    setScrolled(true);
    scrollHold.current = setTimeout(() => setScrolled(false), SCROLL_HOLD_MS);
  }, []);
  useEffect(
    () => () => {
      if (scrollHold.current) clearTimeout(scrollHold.current);
    },
    [],
  );
  /* One flag, two gestures. Everything downstream — the prompts, the recall,
     the width, whether the typewriter is running — asks whether the pane is
     open, not how it was opened, so the phone's answer is substituted here
     rather than at each of the dozen places that ask. */
  const barOpen = floating
    ? /* Never, while the conversation is on the page. The pane exists to hand
         over the suggestions the resting launcher cannot show — and out here
         they are already showing, under the turn that asked for them. Opening
         a second copy of them under the field would be the launcher answering
         a question nobody asked twice. */
      false
    : isTouch
      ? scrolled
      : hoverOpen;

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
    /* Only the recent one holds the offer still. There the visitor is mid-errand
       and the launcher has one thing worth saying, so cycling it against three
       questions would put it on screen a quarter of the time and hide it the
       rest.

       A day later that stops being true: by his own argument they are now more
       likely to want something new than to finish the old thing, and a line
       that only ever says "continue" is answering the less likely half. So the
       open conversation rests the way a first one does — cycling what they
       could ask — and keeps the mark on the disc to say a thread is still
       there, with the thread itself one hover away. */
    /* The recent one holds still. They are mid-errand and the launcher has one
       thing worth saying, so cycling it against five other lines would put the
       offer on screen a sixth of the time and hide it the rest. A single line
       is typed once and left, which is what makes it hold.

       A day later they may well have forgotten what the conversation was, so
       the open one cycles the exchange itself — what they said, then what they
       got back. Not the suggestions with it: those are already the chips one
       hover away, and running them through the same line turns a reminder into
       a menu. */
    if (chipShut) return base;
    if (session === "recent") return [RESUME_FIELD];
    if (session === "open") return recallLines();
    return base;
  }, [prompts, session, chipShut]);
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
  /* The line the typewriter is writing is the offer, so it takes the accent
     rather than the grey a placeholder wears — until the pane opens, when it
     goes grey with everything else and the chips carry the colour. */
  /* The two recalled lines take the accent; the suggestions that follow them
     wear placeholder grey, so the colour says which kind of thing is on screen
     as the rotation moves between them. */
  /* The offer on the recent launcher, and the two recalled lines on the open
     one. The suggestions that follow them wear placeholder grey, so the colour
     says which kind of thing is on screen as the rotation moves. */
  const onResume =
    !barOpen &&
    !chipShut &&
    (session === "recent" || recallLines().includes(lines[cur.idx]));

  /* Nothing greets in the field any more: an unfinished conversation rests like
     a first visit and makes its offer inside, and a resumable one has its own
     line rather than a greeting. */
  const onGreeting = false;

  /* The field opens what it says. Pressed while it is showing the resume line,
     the greeting, an unread, or the visitor's own unsent draft, it picks the
     thread up — every one of those is a reference to a conversation that
     exists. Pressed while it is showing "ask me anything" or a suggestion
     cycling past, it starts a new one, because that is what it just offered.

     The thread is never lost either way: the states whose field starts fresh
     are the ones carrying a "Continue" chip beside it, and the archive is
     behind the back arrow regardless. */
  /* Only "just left", whose field says so in words. Expanded, "earlier today"
     is showing "ask me anything" — and a field offering a blank sentence that
     then produced a conversation already in progress would be answering a
     different question from the one it asked. It gets the card instead. */
  /* Both states with a thread behind them. It was scoped to the recent one,
     which left the open conversation opening from its button and starting
     fresh from its field — two doors into the same launcher going to different
     places.

     The suggestions are still the way out: pressing a chip is asking something
     new and opens a new conversation, and the card inside offers the same exit
     once they are in. The field itself goes where the launcher goes. */
  const resumeInField = resumable;

  const fieldResumes = resumeInField || onGreeting || hasDraft || unread;

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
  /* Not for an unread any more: the whole launcher is the notification now,
     ringed in the accent with the message inside it. A dot as well would be
     pointing at something already impossible to miss. */
  /* Not for the unread any more: the badge on the chat mark is already saying
     it, at the end of the same line. Two dots 250px apart making one point is
     one dot too many, and the badge is the conventional place for it. */
  /* Only where the disc is not already carrying one. Both resting states with
     a thread behind them wear the badge on the chat mark now, which is the
     conventional place for it — a second dot at the other end of the same line
     would be the same point made twice. That leaves the unsent draft, whose
     field is holding the visitor's own words and needs something to say why. */
  /* Only the draft. "Just left" rotates its offer through the field, so the
     line itself says what is waiting — a dot in front of a sentence that
     changes every few seconds ends up marking whichever suggestion happens to
     be up, which is not what it means. The unread has its badge on the chat
     mark; the draft has neither, and needs one. */
  const showDot = hasDraft;

  /* Which states have something to dismiss — the button launcher's card only.

     The composer's pill had one too and it came back off: the row is already
     a field, a mic and a line of text, and a fourth control on it turned the
     resting launcher into a toolbar. The card beside a button is a different
     object — something that arrived next to the launcher rather than the
     launcher itself — and a cross on its corner reads as closing the thing
     that appeared, which is what it is.

     The floating message is not on this list: it is a pane of its own with its
     own close. */
  const chipCloseable =
    !chipShut && (unread || resumable || hasDraft);

  const typing =
    isComposer &&
    entered &&
    !open &&
    !barOpen &&
    !announces &&
    !hasDraft &&
    session !== "recent" &&
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
    : announces
      ? s.placeholder
      : /* Written whole, not typed. The offer is a fact about the launcher, not
           something arriving — and a line that types itself out asks the
           visitor to wait for a sentence they can already act on. Held through
           the hover too; only the colour drops back. */
        session === "recent" && !chipShut
        ? RESUME_FIELD
        : barOpen
          ? s.placeholder
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
  /* …clamped to the frame it is opening inside.

     Those two numbers are desktop numbers. A tablet is 580 across, so a 600px
     pane could not fit and `maxWidth: 100%` quietly resolved it into a bar
     spanning the whole site — edge to edge, no page showing either side of it,
     which is the one thing a launcher must never look like. Now it takes
     whatever the frame can give it with a 24px gutter left on each side, and
     only opens to the full 600 where there is room for it.

     Floored at the resting width: a frame too narrow even for that is a frame
     where the pill should simply stay the size it already was rather than
     shrink as it opens. */
  const paneOpen = Math.min(
    side === "center" ? V6.widthOpen : V6.widthEdge,
    Math.max(V6.widthShut, siteWidth - PANE_GUTTER * 2),
  );
  /* Opens to exactly the width every other state opens to. The pane is one
     object with one expanded size — a state that widened further would read as
     a different component rather than as the same launcher holding something
     else. */
  const unreadOpen = unread && barOpen;
  /* Reaching for an existing conversation opens onto the conversation rather
     than onto the suggestions. The resting line makes the offer; this is what
     the offer is for. */
  const recallOpen = resumable && barOpen;
  const paneW =
    unreadOpen || recallOpen || (barOpen && prompts.length > 0)
      ? paneOpen
      : V6.widthShut;

  /* The composer is placed by a plain left offset in pixels rather than by
     anchoring to an edge and centring with translateX(-50%).

     That transform used to be transitioned along with the entrance, so
     changing placement animated it: switching to an edge left the -50% in
     flight, which at the left anchor starts the pane 170px outside the frame
     and slides it inward. Positioning in px makes every switch the same
     move — a straight slide across, symmetric, always on screen — and leaves
     transform to do nothing but the entrance. */
  /* The customer's own inset, the same one the button uses. It was a hardcoded
     12 here and a configurable 24 there, so the two launchers rested at
     different distances from the same edge and only one of them could be
     moved. */
  const xFor = (w: number) =>
    side === "left"
      ? s.offsetX
      : side === "right"
        ? siteWidth - w - s.offsetX
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
      ? { bottom: s.offsetY, left: xFor(paneW) }
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
  const chip = chipHover(accent, theme.mode === "dark");
  const chipStroke = chip.stroke;
  // the composer's travelling edge, derived rather than a second brand colour
  const accentLite = liteOf(accent);
  const spec = styleSpec(s.style, accent, accentLite);
  /* The launcher's own surface and inks for whichever mode is on — see
     launcherInk. V6 still owns the geometry. */
  const L = launcherInk(theme);
  /* geometry, which is the shape's business rather than the style's */
  const isChip = s.shape === "chip";
  const buttonPx = sizePx(isMobile ? s.sizeMobile : s.size);
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
    thinkMark,
    thinkMarkSrc,
    thinkLabel,
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
          box-shadow: inset 0 0 0 1.5px var(--chip-stroke), inset 0 0 0 999px var(--chip-wash, transparent), var(--chip-shadow, 0 0 #0000);
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
      <div
        onScroll={onSiteScroll}
        className="absolute inset-0 overflow-y-auto overscroll-contain bg-white"
      >
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
              offerNewChat={session === "open"}
              initialDraft={hasDraft ? DRAFT : undefined}
              key={prompt ?? "blank"}
              {...agentProps}
              device="mobile"
              width={siteWidth}
              height={frameHeight}
              initialPrompt={prompt}
              onClose={closeChat}
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
                offerNewChat={session === "open"}
                initialDraft={hasDraft ? DRAFT : undefined}
                key={prompt ?? "blank"}
                {...agentProps}
                device="desktop"
                width={chatW}
                height={chatH}
                initialPrompt={prompt}
                onClose={closeChat}
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
                offerNewChat={session === "open"}
                initialDraft={hasDraft ? DRAFT : undefined}
                key={prompt ?? "blank"}
                {...agentProps}
                device="desktop"
                width={380}
                height={Math.min(650, frameHeight - 48)}
                initialPrompt={prompt}
                onClose={closeChat}
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
          {/* Above the launcher, whichever it is. The wrapper is already a
              column aligned to the launcher's own corner, so the conversation
              lands where the panel would have opened and the launcher stays
              exactly where it was. */}
          {floating && (
            <FloatingColumn
              turns={floatTurns}
              /* The launcher's measure, whichever it is: the phone composer's
                 300, the desktop one's 340, and the button cluster's card
                 width when there is no pill to match. */
              width={
                isComposer
                  ? centreOnPhone
                    ? MOBILE.width
                    : V6.widthShut
                  : TALK_W + 108
              }
              settled={floatingSettled()}
              /* Only while the agent has the floor. Once the visitor has
                 spoken the options are spent, and the next set arrives with the
                 next turn. */
              chips={
                floatTurns.at(-1)?.from === "ai"
                  ? scriptPrompts(floatTurns)
                  : []
              }
              side={side}
              /* All the way to the top of the screen, less the launcher's own
                 room at the foot of it. */
              maxHeight={Math.max(200, frameHeight - 190)}
              onClose={() => setDismissed((d) => [...d, session])}
              accent={accent}
              neutral={theme.neutral}
              /* Pressing a suggestion answers here. Pressing the field opens
                 the messenger — which is the difference between the two: one is
                 continuing the conversation on the page, the other is asking
                 for the room. */
              onStart={sendFloating}
            />
          )}
          {isComposer ? (
            /* v6 — a white pane that rests narrow and widens to offer its
               prompts. The chips live inside it rather than floating above. */
            <div
              /* Not wired at all on a touch device. A tap fires mouseenter
                 with no leave to match it, so a tablet that kept these would
                 latch the pane open on the first tap and never close it. */
              onMouseEnter={
                floating || isTouch ? undefined : () => setHoverOpen(true)
              }
              onMouseLeave={
                floating || isTouch ? undefined : () => setHoverOpen(false)
              }
              className="relative overflow-hidden"
              style={{
                /* One source for the width, so the box and the offset that
                   centres it can never disagree — they did, and the launcher
                   sat 130px right of centre because it was placed as a 340
                   and drawn as a 600.

                   The phone is centred by a full-width track rather than by an
                   offset, so it can widen without anything having to be moved
                   to keep up. */
                width: centreOnPhone
                  ? barOpen
                    ? MOBILE.widthOpen
                    : MOBILE.width
                  : paneW,
                maxWidth: "100%",
                borderRadius: pill.radius,
                /* The same edge as every other state. The strip becomes the
                   message rather than becoming a different object: an accent
                   ring here would say the launcher had changed into a
                   notification, when what actually happened is that the
                   launcher is holding one. The travelling hairline is already
                   the accent and already moving — it does not need help. */
                background: L.surface,
                boxShadow: L.ring,
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
                    (barOpen && prompts.length > 0) || unreadOpen || recallOpen
                      ? "1fr"
                      : "0fr",
                  transition: `grid-template-rows ${V6.panelMs}ms ${V6.panelEase}`,
                }}
              >
                <div className="overflow-hidden">
                  {recallOpen ? (
                    <div
                      /* Tighter on a phone. The panel is four rows deep — a
                         label, a time, their question and the answer — and on a
                         handset those rows sit above a pill that is already a
                         third of the way up the screen. The rows stay; the air
                         between them and around them is what gives. */
                      className={`flex w-full flex-col ${
                        isMobile
                          ? "gap-1.5 px-4 pb-3 pt-3"
                          : "gap-2.5 px-5 pb-4 pt-4"
                      }`}
                      style={{
                        borderBottom: `1px solid ${theme.neutral.line}`,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="min-w-0 flex-1 truncate text-[10px] font-semibold uppercase tracking-[0.08em]"
                          style={{ color: accent }}
                        >
                          {RECALL_LABEL}
                        </span>
                        {/* On the label's line, not the question's. Both are
                            facts about the exchange rather than part of it, so
                            they belong on the same row — and the question keeps
                            its full width for the words. */}
                        <span
                          className="shrink-0 text-[10px]"
                          style={{ color: accent }}
                        >
                          {LAST_SEEN}
                        </span>
                      </div>

                      {/* Their question, marked as a quotation. A rule down the
                          left is the cheapest thing that says "these are your
                          words, not ours" — without it the question and the
                          answer were two paragraphs at different sizes, which
                          is a wall rather than an exchange. */}
                      <span
                        className="truncate border-l-2 pl-2.5 text-[13px]"
                        style={{
                          borderColor: accentLite,
                          color: L.inkMute,
                        }}
                      >
                        {recallAsk(session)}
                      </span>

                      {/* The answer, unattributed. The rule beside the question
                          already marks one of the two as the visitor's, which
                          is enough to make the other the agent's — a mark here
                          as well would be labelling both halves of a pair that
                          only needs one of them labelled. */}
                      <span
                        className="line-clamp-2 text-[14px] leading-snug"
                        style={{ color: L.ink }}
                      >
                        {recallReply(session)}
                      </span>
                    </div>
                  ) : unreadOpen ? (
                    <div
                      className="flex w-full flex-col gap-2 px-5 pb-4 pt-4"
                      style={{
                        /* The rule the reply field sits under, inside the
                           collapsing row so it belongs to the message. */
                        borderBottom: `1px solid ${theme.neutral.line}`,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {/* Small, because this row is a caption on the
                            message rather than a heading over it — the mark
                            says who, the label says what kind, and neither is
                            the thing the visitor came back for. */}
                        {avatar ? (
                          <span
                            className="size-5 shrink-0 rounded-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${avatar})` }}
                          />
                        ) : (
                          <span
                            className="grid size-5 shrink-0 place-items-center rounded-full"
                            style={{ background: accent }}
                          >
                            <Bot
                              className="size-3"
                              style={{ color: "#fff" }}
                              strokeWidth={2}
                            />
                          </span>
                        )}
                        <span
                          className="min-w-0 flex-1 truncate text-[10px] font-semibold uppercase tracking-[0.08em]"
                          style={{ color: accent }}
                        >
                          {INBOUND_LABEL}
                        </span>
                        <span
                          className="shrink-0 text-[10px]"
                          style={{ color: accent }}
                        >
                          {INBOUND_AGO}
                        </span>
                      </div>
                      {/* The message itself, at reading size. It is the reason
                          the launcher grew, so it gets the weight — the label
                          above only says what kind of thing it is.

                          Clamped to two lines. A real reply can run to four
                          paragraphs, and a launcher that grew to hold all of it
                          would be a panel sitting on the customer's page
                          uninvited; two lines is enough to tell whether it is
                          worth opening, which is the only decision being asked
                          for out here. */}
                      <span
                        className={`line-clamp-2 whitespace-pre-line leading-snug ${
                          isMobile ? "text-[14px]" : "text-[15px]"
                        }`}
                        style={{ color: L.ink }}
                      >
                        {INBOUND}
                      </span>
                    </div>
                  ) : (
                    <div
                      /* One row that scrolls, not a block that wraps. Wrapped,
                         a set that does not fit changes the pane's height as
                         well as its width, so the launcher grows upward as it
                         opens and the suggestions arrive on a line that was not
                         there a moment ago. Scrolled, the row is one line
                         whatever is in it, and the set can be as long as the
                         page deserves.

                         The bar is hidden because the chips already show they
                         continue — the third one runs off the edge, which is the
                         same thing a scrollbar would be saying more loudly. */
                      className="scrollbar-subtle flex gap-2 overflow-x-auto px-3 pt-3 pb-2"
                      /* Its own width on a phone, where the pane is narrower
                         than the desktop pane this was pinned to — 600 inside a
                         342 box was a row that could not be reached past its
                         first two chips. */
                      style={{ width: centreOnPhone ? "100%" : paneOpen }}
                    >
                      {/* Always the same three, whatever the visitor's state.
                        Everything a returning visitor is offered is carried by
                        the field — the resume line, the greeting, their own
                        draft — so the row never gives a slot up, and the pane is
                        the same height for everybody. */}
                      {prompts.map((p, i) => (
                        <button
                          key={`${activePath}-${i}-${p}`}
                          /* A suggestion is a new question, whatever state
                             the visitor is in — appending it to a thread they
                             did not choose to reopen would put an unrelated
                             answer directly under their old one. The thread is
                             still in the archive. */
                          onClick={() => openChat(p, true)}
                          className={`starter-chip shrink-0 whitespace-nowrap rounded-full text-[14px] transition-[background-color,box-shadow] duration-200 ease-out ${
                            /* Tighter on a phone, where the row has 342 to fit
                               three suggestions into rather than 400. The words
                               keep their size; the box around them gives. */
                            isMobile ? "px-3 py-1.5" : "px-4 py-2"
                          }`}
                          style={{
                            color: theme.bubbleInk,
                            backgroundColor: theme.bubbleFill,
                            ["--chip-stroke" as string]: chipStroke,
                            ["--chip-wash" as string]: chip.wash,
                          }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* the field row — no left slot, since v6 runs without the orb */}
              {/* Floating gets a real composer.

                  Everywhere else this row is a button and pressing it opens
                  the messenger — the conversation belongs in a room. Out here
                  the room is the page, the thread is already above the pill,
                  and sending the panel up over it would undo the one thing
                  the mode is for. So: an input, a send, and a mic, and the
                  visitor answers without anything opening.

                  The disc holds the mic until there is something to send, the
                  way the messenger's own composer does — the arrow appears
                  when there is a sentence for it to carry. */}
              {floating ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitFloating();
                  }}
                  /* One row until the sentence outgrows it, then two: the field
                     takes the top on its own and the controls drop underneath.

                     Same move the messenger's composer makes, and for the same
                     reason — past two lines a field sharing its row with two
                     44px discs is a column of text three words wide. The pill
                     gives up its fixed height at that point, because the height
                     is now whatever the message needs. */
                  className={`relative flex w-full ${
                    floatMultiline ? "flex-col items-stretch gap-1" : "items-center"
                  }`}
                  style={{
                    height: floatMultiline ? undefined : pill.height,
                    padding: pill.pad,
                  }}
                >
                  {/* A textarea on one row, exactly as the messenger's field
                      is: Enter sends, shift-Enter breaks a line, and the box
                      grows with the sentence up to a ceiling and scrolls after.
                      An input cannot do the second or the third, and a visitor
                      who has just been answered on the page should not find a
                      poorer field than the one inside the panel. */}
                  <textarea
                    ref={floatFieldRef}
                    rows={1}
                    value={floatDraft}
                    onChange={(e) => setFloatDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        submitFloating();
                      }
                    }}
                    placeholder={s.placeholder}
                    aria-label="Message"
                    className="block min-w-0 flex-1 resize-none bg-transparent px-3 text-[14px] font-light leading-[1.5] tracking-[0.01em] outline-none"
                    style={{ color: L.ink, maxHeight: 120, overflowY: "auto" }}
                  />
                  {/* The control row. In one line it is just the disc on the
                      right of the field; in two it is a row of its own, with
                      attach at the left end and the same disc at the right —
                      the two ends of the composer, now on their own line. */}
                  <span
                    className={
                      floatMultiline
                        ? "flex w-full items-center gap-1"
                        : "contents"
                    }
                  >
                  {floatMultiline && (
                    <button
                      type="button"
                      aria-label="Add attachment"
                      className="grid shrink-0 place-items-center rounded-full transition-opacity hover:opacity-80"
                      style={{
                        width: pill.sendPx,
                        height: pill.sendPx,
                        background: L.disc,
                        color: L.ink,
                      }}
                    >
                      <Plus className={isMobile ? "size-4" : "size-5"} strokeWidth={1.5} />
                    </button>
                  )}
                  <button
                    type={floatDraft.trim() ? "submit" : "button"}
                    onClick={
                      floatDraft.trim()
                        ? undefined
                        : mic.canDictate
                          ? () => mic.toggle(floatDraft)
                          : undefined
                    }
                    aria-label={
                      floatDraft.trim()
                        ? "Send"
                        : mic.listening
                          ? "Use what you said"
                          : "Dictate"
                    }
                    className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full transition-[filter] hover:brightness-95 ${
                      floatMultiline ? "ml-auto" : ""
                    }`}
                    style={{
                      width: pill.sendPx,
                      height: pill.sendPx,
                      background: accent,
                    }}
                  >
                    {/* The recording light: the disc's own ring scaled out and
                        faded on a loop, slow enough not to read as an alarm. */}
                    {mic.listening && (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-full bg-white/30"
                        style={{ animation: "mic-pulse 1600ms ease-out infinite" }}
                      />
                    )}
                    {floatDraft.trim() ? (
                      <ArrowUp
                        className={isMobile ? "size-5" : "size-6"}
                        strokeWidth={1.75}
                        style={{ color: "#FFFFFF" }}
                      />
                    ) : mic.listening ? (
                      /* A tick, not a crossed-out mic: pressing this keeps what
                         was said and leaves it in the field. */
                      <Check
                        className={isMobile ? "size-4" : "size-5"}
                        strokeWidth={2}
                        style={{ color: "#FFFFFF" }}
                      />
                    ) : (
                      <Mic
                        className={isMobile ? "size-4" : "size-5"}
                        strokeWidth={1.75}
                        style={{ color: "#FFFFFF" }}
                      />
                    )}
                  </button>
                  </span>
                </form>
              ) : (
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
                {unread && !barOpen ? (
                  /* Two lines inside the pill's existing height: what happened,
                     then what to do about it. The second is smaller and in the
                     accent, doing a link's job rather than competing with the
                     line above for the same weight. */
                  <span
                    className="min-w-0 flex-1 truncate px-3 text-[14px] tracking-[0.01em]"
                    style={{ color: accent }}
                  >
                    {UNREAD_TITLE}
                  </span>
                ) : (
                  <span
                    className={`min-w-0 flex-1 truncate px-3 text-[14px] tracking-[0.01em] ${
                      hasDraft || onResume ? "font-normal" : "font-light"
                    }`}
                    /* Ink, not placeholder grey, for the two cases where the
                     line is real text rather than a hint: an unread is
                     something the agent said, and a draft is something the
                     visitor typed. The draft is the one thing that genuinely
                     belongs in this slot — it is the visitor's own words, put
                     back exactly where they left them, which is the same
                     reason the agent's lines have to stay out of it. */
                    style={{
                      color:
                        onGreeting || onResume
                          ? accent
                          : hasDraft
                            ? L.ink
                            : L.hint,
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
                    /* Filled while a message is waiting.

                       The badge alone could not carry it — at 12px in the
                       tenant's own accent, on a page built out of that accent,
                       nobody saw it. Mass is what the accent is good for out
                       here: the whole 44px control changes state, which is
                       visible at the edge of vision in a way a dot never was,
                       and it costs no colour the customer did not choose. The
                       red badge that was tried instead lasted one review. */
                    /* Accent under the mic as well as under the unread mark.

                       The disc is the one element in the resting launcher that
                       is a control rather than a surface, and in the tenant's
                       grey it read as a spacer holding a glyph. Filled, it is
                       the thing the eye lands on after the line of text — and
                       it says the brand's colour once, in the smallest place
                       it can be said, instead of tinting the whole pill.

                       Held through the hover, and in every state the launcher
                       has. Filling only some of them would make the disc's
                       colour mean something — and it does not: it is the same
                       control doing the same job whether it holds a mic, a
                       waiting count or a thread to go back to. What changes
                       between the states is what is drawn on it. */
                    backgroundColor: accent,
                    /* And it buzzes — twice, then holds still for four
                       seconds. See mark-nudge, and /design/unread-lab for the
                       eight this was picked out of. */
                    /* The negative delay is the point: it starts the cycle
                       1488ms in, which is where the buzz begins, so the first
                       shake happens on the frame the state arrives — the same
                       moment the chime sounds. Left at zero the launcher
                       played a sound and then sat still for a second and a
                       half, which reads as two unrelated events rather than
                       one message landing. */
                    animation:
                      unread && !barOpen
                        ? "mark-nudge 2400ms ease-in-out -1488ms infinite"
                        : undefined,
                  }}
                >
                  {/* A conversation, not a send. At rest with a message
                      waiting the visitor is not composing anything — pressing
                      this opens something already written — and an up-arrow
                      there is an instruction to type.

                      Same mark for an unread and for a thread left open: what
                      is waiting differs, that something is waiting does not. */}
                  {(unread || resumable) && !barOpen ? (
                    <span className="relative inline-flex">
                      <ChatDotsMark
                        className={isMobile ? "size-5" : "size-6"}
                        /* No dot when a number is going over it — the badge is
                           the same mark doing the same job, with the count in
                           it. */
                        hideDot={unread}
                        /* Grey, not ink: the bubble is the container and the
                           dot is the news. Drawing both at full strength would
                           make the visitor read the shape before the signal.

                           White throughout now that the disc is filled in
                           every state — the disc carries the colour, the mark
                           draws on it. */
                        style={{ color: "#FFFFFF" }}
                        /* Reversed out of the accent, like the count beside
                           it: the mark is white on a filled disc now, so a
                           white dot needs the accent around it to be a dot at
                           all rather than a gap in the stroke. */
                        dot="#FFFFFF"
                        dotRing={accent}
                      />
                      {/* The count, not a dot. "Something is waiting" and "two
                          things are waiting" are different facts, and the second
                          is the one that decides whether to look now.

                          Anchored to the mark, not to the disc around it — on
                          the disc it hung off the pill's own edge, where the
                          dot it replaced had always sat inside the artwork. */}
                      {unread && (
                        <span
                          /* 18px against the 12 it was, in notification red
                             against the accent it was, ringed in the pane's
                             white rather than the disc's grey.

                             All three come from the same finding: at 12px in
                             the brand colour, on a site built out of the brand
                             colour, nobody saw it — "would this pop to my eyes?
                             No". A badge is not a tinted surface, it is an
                             interruption, and it is allowed to be the loudest
                             8mm of the launcher. */
                          /* On the mark's corner.

                             Offset by 2, not by 6. The old inset was tuned
                             for a 16px badge, where half of it hanging past
                             the mark still overlapped the bubble; at 12 the
                             same offset pushed the whole badge off the icon
                             and left it floating in the disc. Anchored this
                             close it sits on the mark's top-right corner at
                             rest, and the swell grows it from its own centre
                             — so it stays on the icon at both sizes.

                             Reversed out of the accent rather than painted in
                             it. The disc underneath is the brand colour now,
                             so a badge in the same colour would disappear into
                             it; white with the count in the accent keeps the
                             number legible at every tenant — including the
                             orange and the red ones, where a red badge would
                             have been invisible twice over. */
                          className="absolute -top-0.5 -right-0.5 grid h-[12px] min-w-[12px] place-items-center rounded-full px-[3px] text-[8.5px] font-semibold"
                          style={{
                            background: "#FFFFFF",
                            color: accent,
                            boxShadow: `0 0 0 1.5px ${accent}`,
                            /* 12 at rest, 16 through the buzz — see
                               badge-swell. Same duration as the disc's nudge
                               or the two drift apart. */
                            animation: barOpen
                              ? undefined
                              : "badge-swell 2400ms ease-in-out -1488ms infinite",
                          }}
                        >
                          {floating ? 1 : INBOUND_COUNT}
                        </span>
                      )}
                    </span>
                  ) : barOpen ? (
                    /* Expanded, a mic. Nothing can be typed even here — the
                       field is a button and pressing anywhere opens the widget
                       — so an up-arrow is promising to send something that does
                       not exist yet, where a mic promises the one thing a
                       single press can deliver: start talking, and let the
                       panel open around it. */
                    /* A step down from the arrow. The arrow is a wide, open
                       shape that fills its box; a mic is a tall narrow one, so
                       at the same nominal size it reads as the larger of the
                       two — matching the numbers would not match what you
                       see. */
                    <Mic
                      className={isMobile ? "size-4" : "size-5"}
                      strokeWidth={1.75}
                      style={{ color: "#FFFFFF" }}
                    />
                  ) : (
                    /* At rest, a mic as well.

                       It was the send arrow, on the argument that the arrow is
                       half of what makes a resting launcher read as a composer.
                       That held until someone asked what the arrow promises:
                       nothing can be typed here, so it offers to send a message
                       that does not exist. The mic is the one mark on the
                       resting pill that names something a single press can do —
                       and it tells a visitor they may speak to this site, which
                       the arrow never said. Design review, 11 Sep. */
                    <Mic
                      className={isMobile ? "size-4" : "size-5"}
                      strokeWidth={1.75}
                      /* White on the filled disc, like the mark on the unread
                         one — the disc carries the colour, the glyph draws on
                         it. */
                      style={{ color: "#FFFFFF" }}
                    />
                  )}
                </span>
              </button>
              )}
            </div>
          ) : (
            <ButtonSuggestions
              /* The same three as a first visit. Someone coming back may want
                 to finish the old thing or ask a new one, and the cluster can
                 hold both — the bubble offers the thread, the chips offer the
                 alternatives. Cleared for the two states that are holding a
                 message rather than making an offer — an unread waiting on an
                 answer, and a sentence the visitor left half-typed — where
                 three other questions underneath is talking over it. */
              prompts={holdsMessage ? [] : prompts}
              side={side === "left" ? "left" : "right"}
              show={entered && !open}
              /* Same rule as the composer's: the four states that raise a chip
                 can put it down, and once it is down the launcher rests like a
                 first visit for the rest of the session. */
              onDismiss={
                chipCloseable ? () => setDismissed((d) => [...d, session]) : undefined
              }
              /* An unread outranks the greeting whether or not the greeting is
                 switched on — it is not the agent introducing itself, it is the
                 agent having said something and waiting. */
              /* Beside the button for the two states holding a message. A
                 resume offer is the agent saying something — the same shape as
                 a greeting, in the same place, with different words — so that
                 one stacks above the chips like any other opening line. */
              /* Not on a phone: there is nothing to hover with, and the
                 scroll-triggered answer for mobile is its own piece of work
                 rather than a degraded version of this.

                 Not where the card is holding a message either. Those two have
                 no suggestions behind them — an unread waiting on an answer and
                 a half-typed sentence are not moments to talk over — so the
                 hover had nothing to swap to and simply faded the message away
                 under the cursor. A gesture that takes something off the screen
                 and puts nothing in its place is a bug wearing a transition. */
              hoverReveal={!isTouch && !holdsMessage}
              /* On a phone the chips are held back until the page moves, which
                 is what hover does on a desktop. Same exception: a message on
                 the card stays put while the page scrolls under it. */
              promptsOpen={isMobile && !holdsMessage ? scrolled : undefined}
              /* Beside the button, always. Above it the callout was a
                 banner over a menu; on the same line it is a remark next to
                 the thing that made it — and on hover the suggestions take
                 the row under both, which is the shape the composer's pane
                 already has. */
              /* Beside the button on a desktop, above it on a phone — there
                 is no room for a card and a button side by side at 390px. */
              greetingInline={!isMobile}
              /* Only on the resume line. The mark says "there is a
                 conversation here", which a first-visit greeting cannot claim
                 and an unread is already demonstrating by being one. */
              /* Never on the card. The badged mark sits on the button itself
                 wherever there is a conversation behind it, and the card
                 repeating it puts the same badge twice in one cluster. */
              greetingMarkDot={null}
              /* The one state the composer marks and this one did not: a
                 sentence the visitor left half-typed is waiting on them, and
                 the dot is what says so before they have read a word of it. */
              greetingDot={hasDraft}
              /* White on the glass, like the mark it sits on. The badge is
                 read against the tinted body behind it rather than against the
                 mark, so it does not need a second colour to be seen — and the
                 accent ring is what keeps it from merging into the stroke. */
              /* The launcher's own glass, exactly, and for the whole cluster
                 rather than only the resume box. styleSpec builds it from the
                 accent pair rather than from hand-picked colours, so a tenant
                 re-theme carries all of it — and everything beside the button
                 is the same material as a glass-styled button. */
              /* White frosted glass — see clusterGlass. It takes no colour of
                 its own, so the cluster sits on the customer's page rather than
                 painting over it. */
              glass={clusterGlass(theme)}
              greeting={
                /* Nothing. The floating messenger puts the message on the page
                   above the launcher — see FloatingColumn — so a card saying the
                   same thing beside it would be the agent talking twice. */
                floating
                  ? null
                  : unread
                    ? INBOUND
                    : /* No card where the recall takes the slot. A launcher with
                       a thread behind it rests on the exchange itself — see
                       recall below — rather than on an offer to continue one,
                       so there is nothing here to take turns with. */
                      resumable
                      ? null
                      : /* Their own words, quoted back. The box is not a speech
                       bubble here — it is a label on the button — so the
                       visitor's half-finished sentence can sit in it without
                       reading as something the agent said. */
                        hasDraft
                        ? `“${DRAFT}…”`
                        : resuming
                          ? RESUME_LABEL
                          : !s.greetingOn
                            ? null
                            : GREETING.text
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
              wash={chip.wash}
              accent={accent}
              accentLite={accentLite}
              compact={isMobile}
              /* Both states with a thread behind them. Reaching for the
                 launcher asks the same question in either — is this the
                 conversation I think it is — and the pair that answers it is
                 the same pair the composer launcher opens into. */
              recall={
                resumable
                  ? {
                      label: RECALL_LABEL,
                      /* A clock time for the thread from this morning, the date
                         as well for the one from last week. "10:24 AM" on
                         something eight days old is a launcher that has lost
                         track of when it happened. */
                      when: session === "open" ? WHEN_OPEN : LAST_SEEN,
                      ask: recallAsk(session),
                      reply: recallReply(session),
                    }
                  : null
              }
              /* The same rule the composer's field follows: the launcher
                 opens what it says. A button whose bubble greets by name has
                 not mentioned the old thread, so pressing it starts a new
                 conversation and the thread is offered above it as a card —
                 which is also what happens a day later. Where the bubble does
                 say "continue", it resumes. */
              onOpen={() => openChat(undefined, !opensThread)}
              onStart={(text) => openChat(text, true)}
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
                    {INBOUND_COUNT}
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
                  onClick={() => openChat(undefined, !opensThread)}
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
                      s.customIcon && !isChip && !resumeMark
                        ? undefined
                        : spec.background,
                    color: spec.color,
                    boxShadow: spec.shadow,
                    ["--lift-shadow" as string]: spec.lift,
                    /* A step down on a phone. The setting is the customer's
                       choice for their site; the phone is a different amount of
                       screen, and the same 56 that reads as a comfortable
                       target on a desktop takes a noticeable bite out of a
                       handset — the same reason the composer launcher already
                       shrinks its own pill there. */
                    height: isChip ? buttonPx - 8 : buttonPx,
                    width: isChip ? undefined : buttonPx,
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
                  {resumeMark ? (
                    /* The conversation, badged — whatever the customer chose
                       for the resting launcher. An icon's job here is to say
                       what pressing it does, and for these few hours it does
                       something different from usual: it goes back to a thread
                       that is already running. A logo cannot say that, and a
                       sparkle says the opposite. */
                    <>
                      <ChatDotsMark
                        className="relative shrink-0"
                        style={{ width: ICON_PX, height: ICON_PX }}
                        dot={spec.color}
                        /* Knocked out in the button's own body, so the badge
                           sits on top of the bubble's outline rather than
                           reading as a bulge in it. */
                        dotRing={
                          spec.color === "#FFFFFF"
                            ? accent
                            : theme.neutral.surface
                        }
                        dotR={3}
                      />
                      {isChip && (
                        <span
                          className={`font-medium ${isMobile ? "text-[14px]" : "text-[15px]"}`}
                        >
                          {s.chipLabel || "Ask AI"}
                        </span>
                      )}
                    </>
                  ) : s.customIcon ? (
                    isChip ? (
                      <>
                        <span
                          className="size-8 shrink-0 rounded-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${s.customIcon})` }}
                        />
                        <span
                          className={`font-medium ${isMobile ? "text-[14px]" : "text-[15px]"}`}
                        >
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
                        <span
                          className={`font-medium ${isMobile ? "text-[14px]" : "text-[15px]"}`}
                        >
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
