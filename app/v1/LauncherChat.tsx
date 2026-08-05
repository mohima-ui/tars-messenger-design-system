"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ChatbotShell } from "@/components/chat/ChatbotShell";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ThinkingTrace, ThoughtSummary } from "@/components/chat/ThinkingTrace";
import { QuickReplies } from "@/components/chat/QuickReplies";
import { Sources, type Source } from "@/components/chat/Sources";
import { PlanCards, type Plan } from "@/components/chat/PlanCards";
import { DataTable, type TableData } from "@/components/chat/DataTable";
import { StatusList, type StatusListData } from "@/components/chat/StatusList";
import { Charts, CHART_COLORS, type ChartData } from "@/components/chat/Charts";
import { ProgressTracker, type ProgressData } from "@/components/chat/ProgressTracker";
import { ImageGallery, type GalleryData } from "@/components/chat/ImageGallery";
import { CodeBlock, type CodeData } from "@/components/chat/CodeBlock";
import { MetricCards, type MetricData } from "@/components/chat/MetricCards";
import { Timeline, type TimelineData } from "@/components/chat/Timeline";
import { Accordion, type AccordionData } from "@/components/chat/Accordion";
import { MapDisplay, type MapData } from "@/components/chat/MapDisplay";
import {
  InlineForm,
  FormSummary,
  entriesOf,
  type FormData,
  type FormEntry,
} from "@/components/chat/InlineForm";
import { ConfirmDialog, type ConfirmData } from "@/components/chat/ConfirmDialog";
import { Scheduler, type SchedulerData } from "@/components/chat/Scheduler";
import { PURPLE } from "./ui";

/* The conversation that runs inside the launcher's chatbot.

   It opens from whatever the visitor tapped in the launcher — that phrase
   becomes the first user bubble — then the scripted turns play out. Anything
   typed into the composer is appended and answered. Generative UI components
   get added as further entries in SCRIPT. */

type Turn = {
  from: "user" | "ai";
  text: string;
  /** Beat before this turn lands, in ms. */
  delay?: number;
  /** Clock time stamped when the turn lands. */
  time?: string;
  /** Show the reasoning trace before this turn instead of a typing pulse. */
  reasoning?: boolean;
  /** Seconds the trace ran — collapses into the "Thought for Ns" chip. */
  thoughtSeconds?: number;
  /** What the answer drew on. */
  sources?: Source[];
  /** Plan cards rendered under the answer. */
  plans?: Plan[];
  /** Data table rendered under the answer. */
  table?: TableData;
  /** Status list rendered under the answer. */
  status?: StatusListData;
  /** Charts rendered under the answer. */
  charts?: ChartData;
  /** Progress tracker rendered under the answer. */
  progress?: ProgressData;
  /** Image gallery rendered under the answer. */
  gallery?: GalleryData;
  /** Code block rendered under the answer. */
  code?: CodeData;
  /** Metric cards rendered under the answer. */
  metrics?: MetricData;
  /** Timeline rendered under the answer. */
  timeline?: TimelineData;
  /** Accordion rendered under the answer. */
  accordion?: AccordionData;
  /** Map rendered under the answer. */
  map?: MapData;
  /** Form rendered under the answer — pauses the turn until submitted. */
  form?: FormData;
  /** Yes/no confirmations — each pauses the turn until answered. */
  confirms?: ConfirmData[];
  /** Date + time picker — pauses the turn until a slot is taken. */
  scheduler?: SchedulerData;
  /** Submitted form, rendered as a recap inside the visitor's bubble. */
  formSummary?: { title: string; entries: FormEntry[] };
};

/** 12-hour clock, matching the AI Message component's "2:14 PM" format. */
const clock = () =>
  new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

/** Scripted turns that follow the opening user message. */
const SCRIPT: Turn[] = [
  {
    from: "ai",
    text: "Happy to help. I'm the Tars agent — I can answer questions, look things up, and actually get things done for you.",
    reasoning: true,
  },
];

/** Answer per starter; anything typed falls back to the generic reply. */
const ANSWERS: Record<string, string> = {
  "See how it works":
    "Think of a Tars agent as a teammate who already knows your business. You point it at what you already have — help docs, past tickets, product data — and it answers in your voice instead of reading from a script.\n\nIt doesn't just reply, though. It looks things up and acts: checking an order, booking a slot, raising a ticket. And when it needs something back, it asks with the right control — a form, a calendar, a set of options.\n\nThe whole conversation follows the customer across every channel, so nobody re-explains themselves — and when a person is genuinely needed, it hands over with the full history attached.",
};
/** What each answer was grounded in. */
const SOURCES: Record<string, Source[]> = {
  "See how it works": [
    {
      name: "How Tars agents work",
      description: "Product overview — what an agent is trained on and what it can act on.",
      url: "hellotars.com/ai-agents",
    },
    {
      name: "Actions & integrations",
      description: "The systems an agent can read from and write to during a conversation.",
      url: "hellotars.com/platform/integrations",
    },
    {
      name: "Handoff to a human",
      description: "How context transfers when a conversation moves to your team.",
      url: "help.hellotars.com/handoff",
    },
  ],
};
const REPLY = "Got it — here's what I found. Ask me anything else and I'll dig in.";
const REPLY_DELAY_MS = 1200;

/* Pricing is a worked answer — it earns the reasoning trace and returns cards
   rather than prose. */
const PRICING_RE = /\b(pricing|plans?|cost|how much)\b/i;
const TABLE_RE = /\b(data table|table|compare|comparison)\b/i;
/* \b matters here: without it "stat" matches inside "status" and this
   branch swallows the status list. */
const SCHEDULE_RE = /\b(calendar|schedule|book|booking|appointment|time slots?|pick a time)\b/i;
const SCHEDULE_REPLY = "Pick a day that suits you and I'll show what's free.";
const SLOTS = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "1:00 PM", "1:30 PM", "2:00 PM",
];
const SCHEDULE: SchedulerData = {
  year: 2026,
  month: 5, // June
  availability: Object.fromEntries(
    [15, 16, 17, 18, 19, 22, 23, 24, 25, 26, 29, 30].map((d) => [d, SLOTS]),
  ),
};
const CONFIRM_RE = /\b(confirm|confirmation|dialog|cancel my|are you sure)\b/i;
const CONFIRM_REPLY = "Just to check before I do it —";
const CONFIRMS: ConfirmData[] = [
  {
    title: "Confirm contact details",
    detail:
      "Are these details correct for follow-up: Mohima Thapa, mohimathapa02@gmail.com, personal, 09366056679?",
    confirmLabel: "Yes, confirm",
    cancelLabel: "No, edit",
  },
  {
    title: "Cancel your appointment on 14 Aug, 10:30?",
    detail:
      "Westminster Family Clinic with Dr Mehta. Cancelling frees the slot immediately and it may not still be there if you change your mind.",
    destructive: true,
    confirmLabel: "Cancel it",
    cancelLabel: "Keep it",
  },
];
const FORM_RE = /\b(form|forms|sign up|signup|register|details|contact)\b/i;
const FORM_REPLY = "A few details and I'll get you booked in.";
const FORM: FormData = {
  title: "Book an appointment",
  submitLabel: "Request appointment",
  fields: [
    { name: "name", label: "Full name", placeholder: "Jane Cooper", required: true },
    {
      name: "email",
      label: "Email ID",
      type: "email",
      placeholder: "jane@company.com",
      required: true,
    },
    { name: "phone", label: "Phone", type: "tel", placeholder: "+44 7700 900123" },
    {
      name: "clinic",
      label: "Clinic",
      type: "select",
      required: true,
      options: ["Westminster Family Clinic", "Riverside Medical Centre", "St James Paediatrics"],
    },
    {
      name: "reason",
      label: "What's it about?",
      type: "textarea",
      placeholder: "A sentence is plenty",
    },
  ],
};
const MAP_RE = /\b(map|maps|location|locations|nearest|clinics?|branch(es)?|directions)\b/i;
const MAP_REPLY = "Three clinics near you — the first has same-day slots.";
const MAP: MapData = {
  title: "Clinics near SW1A",
  markers: [
    {
      label: "Westminster Family Clinic",
      detail: "12 Victoria St · same-day appointments",
      meta: "6 min",
      query: "12 Victoria St, London SW1H",
      x: 26,
      y: 40,
    },
    {
      label: "Riverside Medical Centre",
      detail: "8 Millbank · Dr Kaur consults here",
      meta: "12 min",
      query: "8 Millbank, London SW1P",
      x: 62,
      y: 68,
    },
    {
      label: "St James Paediatrics",
      detail: "3 Petty France · under-16s only",
      meta: "18 min",
      query: "3 Petty France, London SW1H",
      x: 84,
      y: 30,
    },
  ],
};
const FAQ_RE = /\b(accordion|faqs?|common questions|questions)\b/i;
const FAQ_REPLY = "These come up most often — open any one.";
const FAQ: AccordionData = {
  title: "Frequently asked",
  defaultOpen: 0,
  items: [
    {
      question: "How long does setup take?",
      answer:
        "Most teams are answering real questions within a day. You point the agent at your help docs and past tickets, check a handful of answers, and publish — no model training on your side.",
    },
    {
      question: "Where does the agent get its answers?",
      answer:
        "From what you already have: help centre articles, past conversations, product data, and any system you connect. If it can't find grounds for an answer, it says so rather than guessing.",
    },
    {
      question: "What happens when it can't help?",
      answer:
        "It hands over to your team with the full conversation attached, so nobody asks the customer to repeat themselves. You decide which topics always route to a human.",
    },
    {
      question: "Which channels does it work on?",
      answer:
        "Website, WhatsApp, email and in-app. It's one thread behind the scenes, so a customer can start in one place and pick up in another without losing context.",
    },
    {
      question: "Is our data used to train shared models?",
      answer:
        "No. Your content is used to answer your customers only. Tars is GDPR, ISO 27001, SOC 2 Type 2 and HIPAA compliant.",
    },
  ],
};
const TIMELINE_RE = /\b(timeline|history|what happened|activity)\b/i;
const TIMELINE_REPLY = "Here's how Tars got here — the milestones so far.";
const TIMELINE: TimelineData = {
  title: "Tars AI Agent Development Timeline",
  events: [
    {
      time: "15 Jan 2025, 15:30",
      title: "Project Kick-off",
      detail: "Initial planning and requirement gathering for Tars AI Agent development.",
    },
    {
      time: "20 Mar 2025, 20:00",
      title: "Core AI Model Training Completed",
      detail: "Successful training of the foundational AI model.",
    },
    {
      time: "1 Jun 2025, 14:30",
      title: "Beta Launch",
      detail: "First release of Tars AI Agent to a select group of beta testers.",
    },
    {
      time: "10 Sept 2025, 16:30",
      title: "Public Release",
      detail: "Tars AI Agent officially launched for general availability.",
    },
    {
      time: "5 Feb 2026, 21:30",
      title: "Feature Expansion: Multilingual Support",
      detail: "Added support for multiple languages to enhance global reach.",
    },
  ],
};
const METRIC_RE = /\b(metrics?|metric cards?|kpis?|stats?|numbers|performance)\b/i;
const METRIC_REPLY = "Here's how the agent performed last month.";
const METRICS: MetricData = {
  title: "Last 30 days",
  hero: {
    label: "Conversations handled",
    value: "1,947",
    delta: "+15%",
    period: "vs last month",
    /* real weeks wobble — a perfectly monotonic series draws as a ruler */
    trend: [980, 1150, 1080, 1240, 1190, 1360, 1300, 1480, 1620, 1550, 1810, 1947],
  },
  metrics: [
    {
      label: "Resolved without a human",
      value: "79%",
      delta: "+5pt",
      trend: [58, 62, 59, 64, 63, 68, 66, 71, 70, 75, 77, 79],
    },
    {
      label: "Median first reply",
      value: "4s",
      delta: "-2s",
      trend: [9, 8.2, 8.6, 7.5, 7.8, 6.9, 7.2, 6.1, 5.8, 5.1, 4.6, 4],
    },
    {
      label: "Leads qualified",
      value: "312",
      delta: "+22%",
      trend: [188, 210, 199, 228, 217, 246, 238, 268, 259, 288, 296, 312],
    },
    {
      label: "Escalated to a human",
      value: "8%",
      delta: "-3pt",
      trend: [14, 12.8, 13.4, 12.1, 12.6, 11.2, 11.6, 10.3, 9.6, 9.9, 8.6, 8],
    },
  ],
};
const CODE_RE = /\b(code|snippet|api|embed|install|sdk)\b/i;
const CODE_REPLY = "Here\u2019s the Python client — swap in your own key and agent ID.";
const CODE: CodeData = {
  title: "Tars AI Agent Python Integration Example",
  language: "python",
  filename: "agent.py",
  code: `# Send a message to your agent and read what it did
import os
from tars import TarsClient

client = TarsClient(api_key=os.environ["TARS_API_KEY"])
agent = client.agents.get("tars_9f3c21")

response = agent.send(
    message="Where is my order?",
    user_id="cus_2481",
    context={"plan": "growth", "channel": "web"},
)

print(response.reply)
print(response.actions)  # tools the agent ran`,
};
const GALLERY_RE = /\b(image gallery|gallery|photos?|images?|screenshots?)\b/i;
const GALLERY_REPLY =
  "Here are the consultants taking appointments this week — tap one to see their full profile.";
const GALLERY: GalleryData = {
  title: "Available consultants",
  images: [
    {
      src: "/v1/doctors/dr-mehta.png",
      caption: "Dr Anil Mehta",
      detail: "General medicine",
    },
    {
      src: "/v1/doctors/dr-kaur.png",
      caption: "Dr Simran Kaur",
      detail: "Dermatology",
    },
    {
      src: "/v1/doctors/dr-paul.png",
      caption: "Dr Audrey Paul",
      detail: "Paediatrics",
    },
    {
      src: "/v1/doctors/dr-gilbert.png",
      caption: "Dr Erin Gilbert",
      detail: "Obstetrics",
    },
    {
      src: "/v1/doctors/dr-novak.png",
      caption: "Dr Luka Novak",
      detail: "Cardiology",
    },
  ],
};
const PROGRESS_RE = /\b(progress|tracker|steps?|status of my)\b/i;
const PROGRESS_REPLY = "Your refund is moving — here's where it's up to.";
const PROGRESS: ProgressData = {
  title: "Refund · order #48120",
  steps: [
    { label: "Request received", detail: "Raised in chat, 2:14 PM", state: "done" },
    { label: "Identity verified", detail: "Matched to your account", state: "done" },
    { label: "Transaction located", detail: "£38.00 · 14 Jul", state: "done" },
    { label: "Refund processing", detail: "With your bank now", state: "current" },
    { label: "Confirmation sent", detail: "Email and in-chat receipt", state: "pending" },
  ],
};
const CHART_RE = /\b(charts?|graphs?|breakdown|volume)\b/i;
const CHART_REPLY = "Here's the last six months — volume, outcomes, and how it all split.";
const CHARTS: ChartData = {
  column: {
    title: "Conversations handled",
    unit: "Per month, last 6 months",
    points: [
      { label: "Feb", value: 980 },
      { label: "Mar", value: 1120 },
      { label: "Apr", value: 1265 },
      { label: "May", value: 1410 },
      { label: "Jun", value: 1690 },
      { label: "Jul", value: 1947 },
    ],
  },
  line: {
    title: "Resolved without a human",
    unit: "Share of conversations, last 6 months",
    suffix: "%",
    points: [
      { label: "Feb", value: 58 },
      { label: "Mar", value: 61 },
      { label: "Apr", value: 66 },
      { label: "May", value: 71 },
      { label: "Jun", value: 74 },
      { label: "Jul", value: 79 },
    ],
  },
  bar: {
    title: "Top intents",
    unit: "Share of conversations",
    suffix: "%",
    points: [
      { label: "Order status", value: 34 },
      { label: "Refunds", value: 22 },
      { label: "Booking", value: 18 },
      { label: "Pricing", value: 14 },
      { label: "Everything else", value: 12 },
    ],
  },
  donut: {
    title: "Conversation mix",
    total: "8,412",
    unit: "conversations",
    segments: [
      { label: "Support questions", value: 52, color: CHART_COLORS.blue },
      { label: "Sales enquiries", value: 27, color: CHART_COLORS.orange },
      { label: "Bookings", value: 14, color: CHART_COLORS.aqua },
      { label: "Other", value: 7, color: CHART_COLORS.other },
    ],
  },
  pie: {
    title: "Where they came from",
    segments: [
      { label: "Website", value: 46, color: CHART_COLORS.blue },
      { label: "WhatsApp", value: 31, color: CHART_COLORS.orange },
      { label: "Email", value: 16, color: CHART_COLORS.aqua },
      { label: "Other", value: 7, color: CHART_COLORS.other },
    ],
  },
};
const STATUS_RE = /\b(status list|status|where things stand)\b/i;
const STATUS_REPLY =
  "Here's a week in the life of a banking agent — support and sales work sitting side by side.";
const STATUS: StatusListData = {
  title: "Banking · last 7 days",
  groups: [
    {
      name: "In progress",
      tone: "active",
      items: [
        {
          title: "Loan enquiry — income and amount captured",
          meta: "Today",
          tags: ["Sales", "Qualified"],
        },
        {
          title: "Branch appointment booked in chat",
          meta: "Tomorrow",
          tags: ["Support", "Scheduled"],
        },
      ],
    },
    {
      name: "Escalated",
      tone: "urgent",
      items: [
        {
          title: "Suspected fraud passed to the fraud desk",
          meta: "2h ago",
          tags: ["Support", "Handoff"],
        },
      ],
    },
    {
      name: "Completed",
      tone: "done",
      items: [
        {
          title: "Card dispute raised and confirmed",
          meta: "Mon",
          tags: ["Support"],
          done: true,
        },
        {
          title: "412 balance & statement requests answered",
          meta: "This week",
          tags: ["Support", "Automated"],
          done: true,
        },
      ],
    },
  ],
};
const TABLE_REPLY = "Here's how the three agent types compare.";
const TABLE: TableData = {
  title: "Tars AI Agent Feature Comparison",
  columns: ["Feature", "Sales agent", "Support agent", "General AI agent"],
  rows: [
    ["24/7 availability", "Yes", "Yes", "Yes"],
    ["FAQ answering", "No", "Yes", "Yes"],
    ["Ticket creation", "No", "Yes", "Yes"],
    ["Lead qualification", "Yes", "No", "Yes"],
    ["Product recommendations", "Yes", "No", "Yes"],
  ],
};
const PRICING_REPLY = "Here's how the plans compare — most teams start on Growth.";
const PLANS: Plan[] = [
  {
    name: "Starter",
    description:
      "For small teams getting started — 1 agent, 2,000 conversations a month, and basic analytics.",
    price: "$29/mo",
  },
  {
    name: "Growth",
    description:
      "The full Tars stack — 5 agents, 15,000 conversations, full analytics, and API access.",
    price: "$79/mo",
  },
  {
    name: "Enterprise",
    description:
      "Everything unlimited — SSO, a dedicated SLA, and a dedicated customer success manager.",
    price: "Custom",
  },
];

/* A typed question gets the full reasoning trace rather than a typing pulse:
   the indicator should be the lightest one that's honest about the work. */
const REASONING_STEPS = [
  { title: "Reading your question", body: "Working out what you're actually asking for." },
  { title: "Checking your context", body: "Cross-referencing anything relevant from earlier in this chat." },
  { title: "Tool calling", body: "Querying the knowledge base for the most relevant material." },
];
const TOOL_CALL = { name: "button_group", ms: 64 };

/** Offered once the agent has finished introducing itself. */
const STARTERS = ["Schedule a demo", "See how it works", "Check Tars pricing and plans"];
/** Only this branch is built out so far; the others are shown but inert. */
const LIVE_STARTERS = ["See how it works"];
/* The starters belong to the last scripted turn, so they stay anchored there
   as the conversation grows rather than following the newest message. */
const STARTERS_AT = SCRIPT.length;

/** Spacing between turns, and the tighter gap inside a run of agent turns. */
const GAP_TURN = 12;
const GAP_RUN = 8;

function Typing() {
  return (
    <div
      className="flex w-full justify-start"
      style={{ animation: "bubble-in 240ms ease-out both" }}
    >
      <div className="flex items-center gap-1 rounded-[12px] rounded-bl-[6px] border border-[var(--ds-border-line)] bg-[var(--ds-bg-paper)] px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 rounded-full bg-[var(--ds-text-muted)]"
            style={{ animation: `thread-dot 1.2s ease-in-out ${i * 160}ms infinite` }}
          />
        ))}
      </div>
    </div>
  );
}

export function LauncherChat({
  opener,
  onClose,
  style,
}: {
  opener: string;
  onClose?: () => void;
  style?: CSSProperties;
}) {
  /* The opener is the visitor's first message; scripted turns land after it. */
  const [turns, setTurns] = useState<Turn[]>([
    { from: "user", text: opener, time: clock() },
  ]);
  const [scripted, setScripted] = useState(0);
  const [replying, setReplying] = useState(false);
  const [picked, setPicked] = useState(false);
  /** What the pending reply should answer. */
  const [asked, setAsked] = useState<string | null>(null);
  /** The plan the visitor picked from the cards. */
  const [plan, setPlan] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* Reveal one scripted turn at a time — the timeout carries the state change
     so nothing is set synchronously inside the effect. Turns marked `reasoning`
     are released by the trace finishing instead of by a timer. */
  useEffect(() => {
    if (scripted >= SCRIPT.length) return;
    const step = SCRIPT[scripted];
    if (step.reasoning) return;
    const t = setTimeout(() => {
      setTurns((prev) => [...prev, { ...step, time: clock() }]);
      setScripted((n) => n + 1);
    }, step.delay ?? 900);
    return () => clearTimeout(t);
  }, [scripted]);

  const finishScripted = useCallback(
    (seconds: number) => {
      setTurns((prev) => [
        ...prev,
        { ...SCRIPT[scripted], time: clock(), thoughtSeconds: seconds },
      ]);
      setScripted((n) => n + 1);
    },
    [scripted],
  );

  const schedule = !!asked && SCHEDULE_RE.test(asked);
  const confirm = !schedule && !!asked && CONFIRM_RE.test(asked);
  const form = !schedule && !confirm && !!asked && FORM_RE.test(asked);
  const map = !schedule && !confirm && !form && !!asked && MAP_RE.test(asked);
  const faq = !schedule && !confirm && !form && !map && !!asked && FAQ_RE.test(asked);
  const timeline = !schedule && !confirm && !form && !map && !faq && !!asked && TIMELINE_RE.test(asked);
  const metrics = !schedule && !confirm && !form && !map && !faq && !timeline && !!asked && METRIC_RE.test(asked);
  const code = !schedule && !confirm && !form && !map && !faq && !timeline && !metrics && !!asked && CODE_RE.test(asked);
  const gallery = !schedule && !confirm && !form && !map && !faq && !timeline && !metrics && !code && !!asked && GALLERY_RE.test(asked);
  const progress = !schedule && !confirm && !form && !map && !faq && !timeline && !metrics && !code && !gallery && !!asked && PROGRESS_RE.test(asked);
  const charts = !schedule && !confirm && !form && !map && !faq && !timeline && !metrics && !code && !gallery && !progress && !!asked && CHART_RE.test(asked);
  const status =
    !schedule &&
    !confirm &&
    !form &&
    !map &&
    !faq &&
    !timeline &&
    !metrics &&
    !code && !gallery && !progress && !charts && !!asked && STATUS_RE.test(asked);
  const table =
    !schedule &&
    !confirm &&
    !form &&
    !map &&
    !faq &&
    !timeline &&
    !metrics &&
    !code && !gallery && !progress && !charts && !status && !!asked && TABLE_RE.test(asked);
  const pricing =
    !schedule &&
    !confirm &&
    !form &&
    !map &&
    !faq &&
    !timeline &&
    !metrics &&
    !code &&
    !gallery &&
    !progress &&
    !charts &&
    !status &&
    !table &&
    !!asked &&
    PRICING_RE.test(asked);
  /* All of these are worked answers, so each earns the reasoning trace. */
  const worked =
    pricing ||
    table ||
    status ||
    charts ||
    progress ||
    gallery ||
    code ||
    metrics ||
    timeline ||
    faq ||
    map ||
    form ||
    confirm ||
    schedule;

  const replyTurn = useCallback(
    (thoughtSeconds?: number): Turn => ({
      from: "ai",
      text: schedule
        ? SCHEDULE_REPLY
        : confirm
        ? CONFIRM_REPLY
        : form
        ? FORM_REPLY
        : map
        ? MAP_REPLY
        : faq
        ? FAQ_REPLY
        : timeline
        ? TIMELINE_REPLY
        : metrics
        ? METRIC_REPLY
        : code
        ? CODE_REPLY
        : gallery
        ? GALLERY_REPLY
        : progress
        ? PROGRESS_REPLY
        : charts
        ? CHART_REPLY
        : status
        ? STATUS_REPLY
        : table
          ? TABLE_REPLY
          : pricing
            ? PRICING_REPLY
            : (asked && ANSWERS[asked]) || REPLY,
      time: clock(),
      sources: asked ? SOURCES[asked] : undefined,
      plans: pricing ? PLANS : undefined,
      table: table ? TABLE : undefined,
      status: status ? STATUS : undefined,
      charts: charts ? CHARTS : undefined,
      progress: progress ? PROGRESS : undefined,
      gallery: gallery ? GALLERY : undefined,
      code: code ? CODE : undefined,
      metrics: metrics ? METRICS : undefined,
      timeline: timeline ? TIMELINE : undefined,
      accordion: faq ? FAQ : undefined,
      map: map ? MAP : undefined,
      form: form ? FORM : undefined,
      confirms: confirm ? CONFIRMS : undefined,
      scheduler: schedule ? SCHEDULE : undefined,
      thoughtSeconds,
    }),
    [
      asked,
      pricing,
      table,
      status,
      charts,
      progress,
      gallery,
      code,
      metrics,
      timeline,
      faq,
      map,
      form,
      confirm,
      schedule,
    ],
  );

  /* Simple replies land on a short beat with a typing pulse; anything that
     needs work is released by the reasoning trace instead. */
  useEffect(() => {
    if (!replying || worked) return;
    const t = setTimeout(() => {
      setTurns((prev) => [...prev, replyTurn()]);
      setReplying(false);
    }, REPLY_DELAY_MS);
    return () => clearTimeout(t);
  }, [replying, worked, replyTurn]);

  const finishReply = useCallback(
    (seconds: number) => {
      setTurns((prev) => [...prev, replyTurn(seconds)]);
      setReplying(false);
    },
    [replyTurn],
  );

  /* Keep the newest turn in view as the thread grows. */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [turns, replying]);

  /* A submitted form posts as the visitor's message, but rendered rather than
     as plain text — the recap carries a check and a label/value list. */
  const sendForm = (form: FormData, values: Record<string, string>, summary: string) => {
    const title = form.title ?? "Details";
    setTurns((prev) => [
      ...prev,
      {
        from: "user",
        text: summary,
        time: clock(),
        formSummary: { title, entries: entriesOf(form, values) },
      },
    ]);
    setAsked(title);
    setReplying(true);
    setPicked(true);
  };

  const handleSend = (message: string) => {
    setTurns((prev) => [...prev, { from: "user", text: message, time: clock() }]);
    setAsked(message);
    setReplying(true);
    setPicked(true);
  };

  const pending = scripted < SCRIPT.length || replying;
  /* The trace shows for a typed reply, or for a scripted turn that asked for
     it; everything else gets the lighter typing pulse. */
  const tracing =
    (scripted < SCRIPT.length && !!SCRIPT[scripted].reasoning) || (replying && worked);
  /* The starters stay under the agent's opening turn for good — once one is
     taken they grey out in place rather than disappearing. */
  const startersReady = scripted >= SCRIPT.length;

  return (
    <ChatbotShell
      onClose={onClose}
      onBack={onClose}
      onSend={handleSend}
      accent={PURPLE}
      style={style}
    >
      <style>{`
        @keyframes thread-dot {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50%      { opacity: 1;   transform: translateY(-2px); }
        }
      `}</style>

      {/* 18px gutters → a 364px conversation column inside the 400px panel. */}
      <div ref={scrollRef} className="h-full overflow-y-auto px-[18px] py-4">
        {/* No gap on the column — spacing is per turn so a run of agent
            messages sits tight and reads as one reply. */}
        <div className="flex flex-col">
          {turns.map((turn, i) => {
            /* Consecutive agent turns read as one reply: the label heads the
               run, the toolbar closes it — and the toolbar waits until no
               further turns are on their way. */
            const prev = turns[i - 1];
            const next = turns[i + 1];
            const isAi = turn.from === "ai";
            const startsRun = isAi && (!prev || prev.from !== "ai");
            const endsRun = isAi && (next ? next.from !== "ai" : !pending);

            const continuesRun = isAi && !startsRun;

            return (
              <div
                key={i}
                style={{ marginTop: i === 0 ? 0 : continuesRun ? GAP_RUN : GAP_TURN }}
              >
                <MessageBubble
                  variant={turn.from}
                  label={startsRun ? "AI agent" : undefined}
                  time={startsRun ? turn.time : undefined}
                  actions={endsRun}
                  beforeBubble={
                    turn.thoughtSeconds ? (
                      <ThoughtSummary
                        steps={REASONING_STEPS}
                        tool={TOOL_CALL}
                        seconds={turn.thoughtSeconds}
                        accent={PURPLE}
                      />
                    ) : undefined
                  }
                  bubbleFooter={
                    turn.sources ? <Sources sources={turn.sources} /> : undefined
                  }
                  afterBubble={
                    turn.scheduler ? (
                      <div className="mt-1 w-full min-w-0">
                        <Scheduler data={turn.scheduler} onPick={handleSend} />
                      </div>
                    ) : turn.confirms ? (
                      <div className="mt-1 flex w-full min-w-0 flex-col gap-2">
                        {turn.confirms.map((c) => (
                          <ConfirmDialog
                            key={c.title}
                            data={c}
                            /* the button's own label is what gets said back */
                            onConfirm={() => handleSend(c.confirmLabel ?? "Yes")}
                            onCancel={() => handleSend(c.cancelLabel ?? "No")}
                          />
                        ))}
                      </div>
                    ) : turn.form ? (
                      <div className="mt-1 w-full min-w-0">
                        <InlineForm
                          data={turn.form}
                          onSubmit={(values, summary) =>
                            sendForm(turn.form!, values, summary)
                          }
                        />
                      </div>
                    ) : turn.map ? (
                      <div className="mt-1 w-full min-w-0">
                        <MapDisplay data={turn.map} />
                      </div>
                    ) : turn.accordion ? (
                      <div className="mt-1 w-full min-w-0">
                        <Accordion data={turn.accordion} />
                      </div>
                    ) : turn.timeline ? (
                      <div className="mt-1 w-full min-w-0">
                        <Timeline data={turn.timeline} />
                      </div>
                    ) : turn.metrics ? (
                      <div className="mt-1 w-full min-w-0">
                        <MetricCards data={turn.metrics} />
                      </div>
                    ) : turn.code ? (
                      <div className="mt-1 w-full min-w-0">
                        <CodeBlock data={turn.code} />
                      </div>
                    ) : turn.gallery ? (
                      <div className="mt-1 w-full min-w-0">
                        <ImageGallery data={turn.gallery} />
                      </div>
                    ) : turn.progress ? (
                      <div className="mt-1 w-full min-w-0">
                        <ProgressTracker data={turn.progress} />
                      </div>
                    ) : turn.charts ? (
                      <div className="mt-1 w-full min-w-0">
                        <Charts data={turn.charts} />
                      </div>
                    ) : turn.status ? (
                      <div className="mt-1 w-full min-w-0">
                        <StatusList data={turn.status} />
                      </div>
                    ) : turn.table ? (
                      <div className="mt-1 w-full min-w-0">
                        <DataTable data={turn.table} />
                      </div>
                    ) : turn.plans ? (
                      <div className="mt-1 w-full min-w-0">
                        <PlanCards
                          plans={turn.plans}
                          onPick={(p) => {
                            setPlan(p.name);
                            handleSend(p.name);
                          }}
                          spent={!!plan}
                          chosen={plan}
                        />
                      </div>
                    ) : startersReady && i === STARTERS_AT ? (
                      <div className="mt-1">
                        <QuickReplies
                          options={STARTERS}
                          onPick={handleSend}
                          enabled={LIVE_STARTERS}
                          spent={picked}
                          chosen={asked}
                        />
                      </div>
                    ) : undefined
                  }
                >
                  {turn.formSummary ? (
                    <FormSummary
                      title={turn.formSummary.title}
                      entries={turn.formSummary.entries}
                    />
                  ) : (
                    turn.text
                  )}
                </MessageBubble>
              </div>
            );
          })}

          {pending && (
            <div
              style={{
                marginTop: turns.length === 0
                  ? 0
                  : turns[turns.length - 1].from === "ai"
                    ? GAP_RUN
                    : GAP_TURN,
              }}
            >
              {tracing ? (
                <ThinkingTrace
                  steps={REASONING_STEPS}
                  tool={TOOL_CALL}
                  accent={PURPLE}
                  onDone={replying ? finishReply : finishScripted}
                />
              ) : (
                <Typing />
              )}
            </div>
          )}
        </div>
      </div>
    </ChatbotShell>
  );
}
