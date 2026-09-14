import {
  MessageCircle,
  UserRound,
  Sparkles,
  Send,
  Moon,
  MessagesSquare,
  CalendarCheck,
  Check,
  X,
  ArrowRight,
  Lock,
  CreditCard,
  HeartPulse,
  Landmark,
  Star,
} from "lucide-react";
import {
  Shell,
  GreenButton,
  PurpleButton,
  Display,
  Squiggle,
  Ticks,
  TorusPlate,
  PURPLE,
  PURPLE_DEEP,
  INK,
  BODY,
} from "./ui";

/* ═══ 1 · Hero ═══════════════════════════════════════════════════════════ */

export function Hero() {
  return (
    <section
      id="top"
      className="relative -mt-[92px] flex min-h-[860px] flex-col justify-center overflow-hidden pt-[92px]"
    >
      <NebulaBackdrop />
      <Shell className="relative pb-32 pt-16 text-center">
        <h1
          className="mx-auto max-w-[1000px] text-[clamp(44px,6.2vw,84px)] font-bold leading-[1.06] tracking-[-0.03em]"
          style={{ color: INK }}
        >
          Customer experience
          <br />
          built around{" "}
          <span className="relative inline-block">
            outcomes
            <Squiggle className="absolute -bottom-3 left-0 h-6 w-full" />
          </span>
        </h1>

        <p
          className="mx-auto mt-10 max-w-[720px] text-[clamp(16px,1.4vw,21px)] leading-relaxed"
          style={{ color: BODY }}
        >
          AI Agents for customer support and sales that make every conversation feel like your
          brand actually cares.
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <GreenButton>Schedule a Demo</GreenButton>
          <PurpleButton>Get started for free</PurpleButton>
        </div>
      </Shell>
    </section>
  );
}

/** The production hero art, pulled from the live site
    (hero-violet-current-bg.svg). It carries its own pale base and edge fades,
    so it only needs to cover the section. */
function NebulaBackdrop() {
  return (
    /* No negative z-index here — that would put it behind the page wrapper's
       white background and hide it entirely. */
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#F3EDFB]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/v1/hero-bg.svg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center opacity-45"
      />
      {/* Edge fades only — the art itself is held back by its own opacity, so
          the veil just blends the top and bottom into the page. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.10) 16%, rgba(255,255,255,0.06) 66%, rgba(255,255,255,0.62) 93%, #fff 100%)",
        }}
      />
    </div>
  );
}

/* ═══ 2 · Logo strip ═════════════════════════════════════════════════════ */

const BRANDS = [
  { name: "Qatar Foundation", color: "#4B5B3F" },
  { name: "UNITEL", color: "#F26522" },
  { name: "vodafone", color: "#E60000" },
  { name: "Amen Clinics", color: "#1B2A4A" },
  { name: "brightline", color: "#F0A030" },
  { name: "GAMA HOSPITAL", color: "#D32029" },
];

export function LogoStrip() {
  return (
    <section className="relative bg-[#FBFAFE] pb-24 pt-4">
      <Shell>
        {/* the card's rainbow hairline border */}
        <div
          className="rounded-[28px] p-px"
          style={{
            backgroundImage:
              "linear-gradient(105deg, #A78BFA 0%, #C4B5FD 22%, #86EFAC 48%, #FDE68A 72%, #FBBF24 100%)",
          }}
        >
          <div className="rounded-[27px] bg-white px-10 py-14">
            <p className="text-center text-[22px] font-semibold" style={{ color: "#8C8C96" }}>
              Chosen by 800+ global brands across industries
            </p>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-14 gap-y-8">
              {BRANDS.map((b) => (
                <span
                  key={b.name}
                  className="text-[22px] font-bold tracking-tight opacity-90"
                  style={{ color: b.color }}
                >
                  {b.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Shell>
    </section>
  );
}

/* ═══ 3 · The wrong thing (dark) ═════════════════════════════════════════ */

const METRICS = ["60% deflection rate", "Ticket resolved", "Fast response time", "High automation rate"];
const EXPERIENCE = [
  "Explaining the same problem twice",
  "Chat ended. Problem did not",
  "Three channels. Three fresh starts",
  "Giving up before getting help",
];

export function WrongThing() {
  return (
    <section className="relative overflow-hidden bg-[#0B0714] py-32">
      {/* two planet-limb arcs sweeping through the section */}
      <div
        className="pointer-events-none absolute -left-[45%] top-[-30%] h-[1400px] w-[1400px] rounded-full opacity-70"
        style={{
          border: "2px solid rgba(255,168,110,0.55)",
          boxShadow: "0 0 90px 6px rgba(255,150,80,0.28)",
          filter: "blur(1px)",
        }}
      />
      <div
        className="pointer-events-none absolute -right-[40%] top-[-45%] h-[1500px] w-[1500px] rounded-full opacity-60"
        style={{
          border: "2px solid rgba(150,190,255,0.5)",
          boxShadow: "0 0 90px 6px rgba(120,170,255,0.22)",
          filter: "blur(1px)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(60% 45% at 50% 50%, rgba(88,28,135,0.35) 0%, rgba(11,7,20,0) 70%)",
        }}
      />

      <Shell className="relative text-center">
        <h2 className="mx-auto max-w-[1100px] text-[clamp(34px,4.4vw,60px)] font-bold leading-[1.12] tracking-[-0.025em] text-[#E9E2F5]">
          For years, we measured the wrong thing
        </h2>
        <p className="mx-auto mt-8 max-w-[900px] text-[clamp(15px,1.25vw,20px)] leading-relaxed text-[#B7B0C6]">
          How many support tickets never reached a human? The number looked good. But your
          customers were not getting happier. We rebuilt Tars around the question that actually
          matters:
          <br />
          <span className="font-medium text-white">Did they get what they came for?</span>
        </p>

        <div className="mx-auto mt-20 max-w-[1120px] rounded-3xl border border-white/[0.07] bg-white/[0.03] px-8 py-10 backdrop-blur-sm sm:px-12">
          <div className="grid gap-x-16 md:grid-cols-2">
            <Column
              label="What the metrics showed"
              labelColor="#9C93AE"
              items={METRICS}
              tone="bad"
            />
            <Column
              label="What the customer experienced"
              labelColor="#C084FC"
              items={EXPERIENCE}
              tone="good"
            />
          </div>
        </div>
      </Shell>
    </section>
  );
}

function Column({
  label,
  labelColor,
  items,
  tone,
}: {
  label: string;
  labelColor: string;
  items: string[];
  tone: "bad" | "good";
}) {
  const bad = tone === "bad";
  return (
    <div className="text-left">
      <p
        className="pb-6 text-[13px] font-bold uppercase tracking-[0.14em]"
        style={{ color: labelColor }}
      >
        {label}
      </p>
      <ul>
        {items.map((t) => (
          <li
            key={t}
            className="flex items-center gap-5 border-t border-dashed border-white/10 py-6"
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                bad ? "bg-[#4A1D24]" : "bg-[#123A24]"
              }`}
            >
              {bad ? (
                <X className="h-4 w-4 text-[#F87171]" strokeWidth={3} />
              ) : (
                <Check className="h-4 w-4 text-[#4ADE80]" strokeWidth={3} />
              )}
            </span>
            <span
              className={
                bad
                  ? "text-[19px] text-[#7C7589] line-through decoration-[#7C7589]"
                  : "text-[19px] font-semibold text-white"
              }
            >
              {t}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ═══ 4 · One thread. Every channel. ═════════════════════════════════════ */

const SUPPORT = [
  { icon: MessageCircle, title: "Arrives", note: "No form. No ticket number." },
  { icon: UserRound, title: "Recognised", note: "Nothing to re-explain" },
  {
    icon: Sparkles,
    title: "The Agent acts",
    note: "Looks it up. Changes it. Decides on its own.",
    accent: true,
  },
  { icon: Send, title: "Followed up", note: "It comes back on its own" },
];

const SALES = [
  { icon: Moon, title: "Arrives", note: "Late. Undecided." },
  { icon: MessagesSquare, title: "Answered", note: "A real answer, not a form" },
  {
    icon: Sparkles,
    title: "The Agent qualifies",
    note: "Sizes them up. Places them. Decides on its own.",
    accent: true,
  },
  { icon: CalendarCheck, title: "Moved forward", note: "Handed on with full context" },
];

export function OneThread() {
  return (
    <section className="relative overflow-hidden bg-white py-28">
      <ThreadBackdrop />

      <Shell className="relative text-center">
        <Display className="text-[clamp(32px,3.9vw,54px)] leading-tight">
          One thread. Every channel.
        </Display>
        <p className="mx-auto mt-6 max-w-[760px] text-[clamp(15px,1.2vw,19px)]" style={{ color: BODY }}>
          No more chaos. No more switching channels. One chat thread that handles all.
        </p>

        <div className="relative mx-auto mt-24 w-full max-w-[1000px]">
          <div className="grid grid-cols-2 gap-x-[16%] text-left">
            <Rail label="Support" items={SUPPORT} side="left" />
            <Rail label="Sales" items={SALES} side="right" />
          </div>

          {/* rails converge on the outcome node */}
          <svg
            viewBox="0 0 1000 200"
            preserveAspectRatio="none"
            className="block h-[200px] w-full"
            fill="none"
            aria-hidden
          >
            <path
              d="M22 0 V70 Q22 150 200 168 L470 186"
              stroke="#D9CDF2"
              strokeWidth="1.5"
            />
            <path
              d="M978 0 V70 Q978 150 800 168 L530 186"
              stroke="#D9CDF2"
              strokeWidth="1.5"
            />
          </svg>

          <div className="flex justify-center">
            <div
              className="rounded-2xl p-px"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #A78BFA, #93C5FD 35%, #86EFAC 65%, #FDE68A)",
              }}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white">
                <span className="text-2xl font-bold" style={{ color: INK }}>
                  ?
                </span>
              </div>
            </div>
          </div>
        </div>

        <h3
          className="mt-20 text-[clamp(28px,3.4vw,46px)] font-bold tracking-[-0.02em]"
          style={{ color: PURPLE_DEEP }}
        >
          Did the visit serve its purpose?
        </h3>
        <h3
          className="mt-10 text-[clamp(26px,3.2vw,44px)] font-bold tracking-[-0.02em]"
          style={{ color: "#8B5CF6" }}
        >
          The only outcome either journey is judged on!
        </h3>
      </Shell>
    </section>
  );
}

function Rail({
  label,
  items,
  side,
}: {
  label: string;
  items: typeof SUPPORT;
  side: "left" | "right";
}) {
  const right = side === "right";
  return (
    <div className="relative">
      <p
        className={`mb-10 text-[15px] font-bold uppercase tracking-[0.2em] ${
          right ? "text-right" : ""
        }`}
        style={{ color: PURPLE_DEEP }}
      >
        {label}
      </p>

      {/* connector behind the icon column */}
      <span
        className={`absolute top-[64px] bottom-8 w-px bg-[#D9CDF2] ${
          right ? "right-[21px]" : "left-[21px]"
        }`}
      />

      <ul className="space-y-14">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <li
              key={it.title}
              className={`relative flex items-start gap-5 ${right ? "flex-row-reverse" : ""}`}
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-white"
                style={{
                  borderColor: it.accent ? "#C4B5FD" : "#E4E4EA",
                  backgroundColor: it.accent ? "#F5F1FE" : "#fff",
                }}
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={1.8}
                  style={{ color: it.accent ? "#7C3AED" : "#4B4B55" }}
                />
              </span>
              <div className={right ? "text-right" : ""}>
                <p
                  className="text-[21px] font-bold tracking-[-0.01em]"
                  style={{ color: it.accent ? "#7C3AED" : INK }}
                >
                  {it.title}
                </p>
                <p className="mt-1.5 text-[17px]" style={{ color: BODY }}>
                  {it.note}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Production line-wave art (one-thread-linewave-bg.png) plus a pastel bloom
    in the lower left. */
function ThreadBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/v1/one-thread-lines.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center opacity-80"
      />
      <div
        className="absolute -bottom-40 -left-40 h-[720px] w-[720px] rounded-full opacity-70"
        style={{
          background:
            "conic-gradient(from 200deg, #FFF7D6, #E6F7E2, #E4EEFB, #F3E9FB, #FFF7D6)",
          filter: "blur(90px)",
        }}
      />
    </div>
  );
}

/* ═══ 5 · Two front doors ════════════════════════════════════════════════ */

export function TwoFrontDoors() {
  return (
    <section className="relative overflow-hidden bg-white pb-28 pt-24">
      <div
        className="pointer-events-none absolute -left-56 top-1/4 h-[600px] w-[600px] rounded-full opacity-60"
        style={{
          background: "conic-gradient(from 160deg, #FFF8DA, #E9F7E6, #E7EFFC, #F5EBFC, #FFF8DA)",
          filter: "blur(90px)",
        }}
      />

      <Shell className="relative text-center">
        <Display className="text-[clamp(32px,3.9vw,54px)] leading-tight">
          Two front doors. One memory behind them.
        </Display>
        <p className="mx-auto mt-6 max-w-[860px] text-[clamp(15px,1.2vw,19px)]" style={{ color: BODY }}>
          No matter which door your customers walk through, they leave with what they need.
        </p>

        <div className="mt-20 space-y-8">
          <SplitCard
            title={
              <>
                Support that feels like
                <br />
                someone remembered
              </>
            }
            body="Your customers have history with your brand. Tars keeps it. AI Agents that handle high-volume support with full context across every channel, so every interaction feels like it picked up where the last one ended."
            media={<TorusPlate rings={3} className="h-full min-h-[380px]" />}
          />
          <SplitCard
            reverse
            title={
              <>
                Turn interest into a relationship before it goes cold
              </>
            }
            body="Someone lands on your site at 2 am with a question. Tars qualifies them, answers them, and moves them forward before they close the tab. AI Agents that capture and convert 24/7 without you having to be there."
            media={<TorusPlate rings={1} className="h-full min-h-[380px]" />}
          />
        </div>

        <IndustryCards />
      </Shell>
    </section>
  );
}

function SplitCard({
  title,
  body,
  media,
  reverse = false,
}: {
  title: React.ReactNode;
  body: string;
  media: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <div className="rounded-[28px] bg-[#F4F4F6] p-8 sm:p-12">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className={`text-left ${reverse ? "lg:order-2" : ""}`}>
          <Display className="text-[clamp(26px,2.6vw,38px)] leading-[1.18]">{title}</Display>
          <p className="mt-7 max-w-[540px] text-[17px] leading-[1.75]" style={{ color: BODY }}>
            {body}
          </p>
          <GreenButton className="mt-9">Schedule a Demo</GreenButton>
        </div>
        <div className={reverse ? "lg:order-1" : ""}>{media}</div>
      </div>
    </div>
  );
}

const INDUSTRIES = [
  {
    icon: CreditCard,
    tint: "#EAF2FE",
    ink: "#2563EB",
    title: "Banking",
    body: "A customer disputes an unfamiliar charge. The agent finds the transaction, initiates the dispute, and confirms the resolution in the same conversation. No transfer. No hold",
  },
  {
    icon: HeartPulse,
    tint: "#E8F8EE",
    ink: "#16A34A",
    title: "Healthcare",
    body: "Someone searches for a specialist at midnight. The agent identifies the right doctor, checks availability, and books the appointment. They arrive already knowing where to go.",
  },
  {
    icon: Landmark,
    tint: "#F1EBFD",
    ink: "#7C3AED",
    title: "Government",
    body: "A citizen reports a service issue. The agent logs the request, creates the work order, and sends a confirmation with a tracking number. No callback needed.",
  },
];

function IndustryCards() {
  return (
    <div className="mt-8 grid gap-6 md:grid-cols-3">
      {INDUSTRIES.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.title} className="rounded-[24px] bg-[#F7F7F9] p-8 text-left">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: c.tint }}
            >
              <Icon className="h-5 w-5" strokeWidth={1.9} style={{ color: c.ink }} />
            </span>
            <h3 className="mt-8 text-[24px] font-bold" style={{ color: INK }}>
              {c.title}
            </h3>
            <p className="mt-4 text-[17px] leading-[1.65]" style={{ color: BODY }}>
              {c.body}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* ═══ 6 · Believe what you can measure ═══════════════════════════════════ */

const CASES = [
  {
    brand: "GAMA HOSPITAL",
    bg: "#C7202B",
    headline: "Gama Hospital turned its crowded lobby into a 24/7 multilingual AI front desk.",
    tag: "Healthcare",
    tagBg: "#6D28D9",
  },
  {
    brand: "Croí Laighean CREDIT UNION",
    bg: "#4ED88B",
    headline: "CLCU reduced call volume by 12% and contact form submissions by 20%.",
    tag: "Finance",
    tagBg: "#22C55E",
  },
  {
    brand: "VM GROUP",
    bg: "#F0973A",
    headline: "VM Group reduced support requests by 45% with conversational AI agents.",
    tag: "Finance",
    tagBg: "#22C55E",
  },
];

export function BelieveMeasure() {
  return (
    <section className="relative overflow-hidden bg-white py-24">
      <div
        className="pointer-events-none absolute -left-52 top-1/3 h-[560px] w-[560px] rounded-full opacity-60"
        style={{
          background: "conic-gradient(from 30deg, #FFF8DA, #E9F7E6, #E7EFFC, #F5EBFC, #FFF8DA)",
          filter: "blur(90px)",
        }}
      />

      <Shell className="relative">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="relative">
            <Display className="text-[clamp(30px,3.6vw,50px)]">Believe what you can measure</Display>
            <Ticks className="absolute -right-8 -top-6 h-8 w-8" />
          </div>
          <PurpleButton>Get started for free</PurpleButton>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {CASES.map((c) => (
            <article
              key={c.brand}
              className="overflow-hidden rounded-[20px] bg-white shadow-[0_2px_18px_rgba(0,0,0,0.08)]"
            >
              <div
                className="flex h-[300px] items-center justify-center px-8"
                style={{ backgroundColor: c.bg }}
              >
                <span className="text-center text-[26px] font-bold leading-tight text-white">
                  {c.brand}
                </span>
              </div>
              <div className="p-7">
                <h3 className="text-[21px] font-bold leading-[1.35]" style={{ color: INK }}>
                  {c.headline}
                </h3>
                <span
                  className="mt-5 inline-block rounded-full px-4 py-1.5 text-[14px] font-semibold text-white"
                  style={{ backgroundColor: c.tagBg }}
                >
                  {c.tag}
                </span>
                <a
                  href="#"
                  className="mt-6 flex items-center gap-2 text-[15px] font-semibold"
                  style={{ color: BODY }}
                >
                  Read More <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </Shell>
    </section>
  );
}

/* ═══ 7 · Real results (testimonials) ════════════════════════════════════ */

const QUOTES = [
  {
    tint: "#F6F3FE",
    badge: "#A78BFA",
    quote: "“Professional and creative”",
    body: "An automated chat that customers actually used and reduced our support volume by a serious amount.",
    name: "Alhaddad",
    role: "Journey Designer",
    logo: "vodafone",
  },
  {
    tint: "#FEF4EA",
    badge: "#F59E0B",
    quote: "“Flexibility and good service”",
    body: "Tars platform is very flexible, so you can do pretty much any flux you desire. Also integrates with any third party through APIs with a very simple and easy-to-use interface. Also tars team is great! Always at disposal and brings suggestions and solutions for any issue encountered during the process of building the chatbot.",
    name: "Lucas Von Lachmann",
    role: "Process Manager",
    logo: "INOA",
  },
  {
    tint: "#EDFBF2",
    badge: "#34D399",
    quote: "“The AI agent implementation has exceeded expectations!”",
    body: "The implementation has delivered 24/7 customer support and is proving its value by reducing Contact center calls by around 5% in just four months of operation. Beyond enhancing the e-care experience, the AI agent is driving impressive business results, achieving a remarkable 20% month-on-month growth.",
    name: "Victor Pereira",
    role: "Customer Care and CX Manager",
    logo: "UNITEL",
  },
  {
    tint: "#FEF4EA",
    badge: "#F59E0B",
    quote: "“We're saving an average of 4,000+ calls a month.”",
    body: "Implementing an Agent revolutionized our customer service channels and our service to Indiana business owners. We're saving an average of 4,000+ calls a month and can now provide 24x7x365 customer service along with our business services.",
    name: "Lindsey Roark Mayes",
    role: "Ex-Director of SOS IT (State of Indiana)",
    logo: "INBIZ",
  },
];

export function RealResults() {
  return (
    <section className="overflow-hidden bg-white py-24">
      <Shell>
        <Display className="text-[clamp(30px,3.6vw,50px)]">
          Real results, real customers, real stories
        </Display>
      </Shell>

      {/* horizontal rail — cards bleed past both gutters like a carousel */}
      <div className="mt-12 flex gap-8 overflow-x-auto px-6 pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {QUOTES.map((q) => (
          <figure
            key={q.name}
            className="relative w-[380px] shrink-0 rounded-[20px] border border-black/5 p-9 pt-12"
            style={{ backgroundColor: q.tint }}
          >
            <span
              className="absolute -left-1 -top-6 flex h-14 w-14 items-center justify-center rounded-xl text-3xl font-bold text-white"
              style={{ backgroundColor: q.badge }}
            >
              ”
            </span>
            <blockquote>
              <p className="text-[26px] font-bold leading-[1.25]" style={{ color: INK }}>
                {q.quote}
              </p>
              <p className="mt-4 text-[17px] leading-[1.6]" style={{ color: BODY }}>
                {q.body}
              </p>
            </blockquote>
            <figcaption className="mt-10">
              <p className="text-[19px] font-bold" style={{ color: INK }}>
                {q.name}
              </p>
              <p className="text-[16px]" style={{ color: BODY }}>
                {q.role}
              </p>
              <p className="mt-6 text-[18px] font-semibold" style={{ color: "#9A9AA4" }}>
                {q.logo}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/* ═══ 8 · Integrations ═══════════════════════════════════════════════════ */

const TOOLS_TOP = [
  "Discord", "Airtable", "AWS", "GitHub", "Calendar", "HubSpot",
  "Notion", "Monday", "Airtable", "Slack", "WhatsApp", "Wikipedia",
];
const TOOLS_BOTTOM = [
  "Brave", "DuckDuckGo", "Firecrawl", "Apify", "Contentful", "Analytics",
  "Google Ads", "Drive", "Mem0", "Notion AI", "Search", "Unstructured",
];

export function Integrations() {
  return (
    <section className="relative overflow-hidden bg-white py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(50% 50% at 20% 55%, #FBF6DF 0%, rgba(255,255,255,0) 70%), radial-gradient(45% 45% at 78% 40%, #EDF1FD 0%, rgba(255,255,255,0) 70%), radial-gradient(45% 45% at 60% 80%, #F6EEFC 0%, rgba(255,255,255,0) 70%)",
        }}
      />

      <div className="relative">
        <Shell>
          <div className="relative mx-auto w-fit">
            <Ticks className="absolute -left-10 -top-4 h-8 w-8 -scale-x-100" />
            <Display className="text-center text-[clamp(30px,3.6vw,50px)]">
              Connect with tools where your data lies
            </Display>
          </div>
        </Shell>

        <div className="relative mt-16">
          <ToolRow tools={TOOLS_TOP} />

          {/* the hub, with its concentric rings */}
          <div className="relative flex justify-center py-10">
            <span className="absolute top-1/2 h-[260px] w-[260px] -translate-y-1/2 rounded-full border border-[#D9CDF2]" />
            <span className="absolute top-1/2 h-[190px] w-[190px] -translate-y-1/2 rounded-full border border-[#D9CDF2]" />
            <span className="absolute top-1/2 h-[120px] w-[120px] -translate-y-1/2 rounded-full border border-[#D9CDF2]" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/tars-logomark.png"
              alt="Tars"
              className="relative h-[76px] w-[76px] rounded-2xl shadow-lg"
            />
          </div>

          <ToolRow tools={TOOLS_BOTTOM} />
        </div>
      </div>
    </section>
  );
}

function ToolRow({ tools }: { tools: string[] }) {
  return (
    <div className="flex justify-center gap-5 overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tools.map((t, i) => (
        <span
          key={`${t}-${i}`}
          title={t}
          className="flex h-[84px] w-[84px] shrink-0 items-center justify-center rounded-2xl bg-white px-2 text-center text-[11px] font-semibold leading-tight text-[#6B6B76] shadow-[0_2px_14px_rgba(0,0,0,0.07)]"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

/* ═══ 9 · Privacy & security ═════════════════════════════════════════════ */

const BADGES = [
  { title: "GDPR", sub: "", bg: "#1D2A6B", ink: "#FCD34D", round: true },
  { title: "ISO 27001", sub: "Certified", bg: "#F4F6FB", ink: "#2B4C8C", round: true },
  { title: "SOC 2 TYPE 2", sub: "AICPA SOC", bg: "#EDEFF3", ink: "#1F2937", round: false },
  { title: "HIPAA", sub: "COMPLIANCE", bg: "#F2F4FB", ink: "#3B4A9C", round: false },
];

export function PrivacySecurity() {
  return (
    <section className="relative overflow-hidden bg-white py-28">
      {/* faint vertical grid columns */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(90deg, #F1F1F5 1px, transparent 1px), radial-gradient(45% 40% at 15% 30%, #FCF8E4 0%, rgba(255,255,255,0) 70%), radial-gradient(40% 40% at 85% 55%, #F1EDFB 0%, rgba(255,255,255,0) 70%)",
          backgroundSize: "165px 100%, 100% 100%, 100% 100%",
        }}
      />

      <Shell className="relative">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className="text-center">
            <span
              className="inline-flex items-center gap-2 rounded-full p-px"
              style={{
                backgroundImage: "linear-gradient(100deg, #A78BFA, #86EFAC, #FBBF24)",
              }}
            >
              <span className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5">
                <Lock className="h-4 w-4" style={{ color: PURPLE }} />
                <span className="text-[15px] font-semibold" style={{ color: INK }}>
                  Privacy &amp; Security
                </span>
              </span>
            </span>

            <Display className="mt-9 text-[clamp(32px,3.8vw,52px)] leading-[1.15]">
              We&rsquo;ll never let you lose sleep over privacy and security concerns
            </Display>

            <p className="mx-auto mt-8 max-w-[520px] text-[18px] leading-[1.7]" style={{ color: BODY }}>
              At Tars, we take privacy and security very seriously. We are compliant with GDPR,
              ISO, SOC 2, and HIPAA.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {BADGES.map((b) => (
              <div
                key={b.title}
                className="flex aspect-square items-center justify-center rounded-[28px] bg-gradient-to-br from-[#FAF7FE] to-[#F3EFFB]"
              >
                <div
                  className={`flex h-[150px] w-[150px] flex-col items-center justify-center px-4 text-center ${
                    b.round ? "rounded-full" : "rounded-2xl"
                  }`}
                  style={{ backgroundColor: b.bg }}
                >
                  <span
                    className="text-[20px] font-bold leading-tight"
                    style={{ color: b.ink }}
                  >
                    {b.title}
                  </span>
                  {b.sub && (
                    <span className="mt-1 text-[11px] font-medium" style={{ color: b.ink }}>
                      {b.sub}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Shell>
    </section>
  );
}

/* ═══ 10 · Final CTA ═════════════════════════════════════════════════════ */

const G2 = [
  { top: "High Performer", band: "WINTER", year: "2025", bandBg: "#E4322B" },
  { top: "High Performer", band: "Enterprise", year: "WINTER 2025", bandBg: "#F0653A" },
  { top: "Mid-Market High Performer", band: "Asia Pacific", year: "WINTER 2025", bandBg: "#7C3AED" },
  { top: "High Performer", band: "Europe", year: "WINTER 2025", bandBg: "#7C3AED" },
];

export function FinalCTA() {
  return (
    <section
      className="relative overflow-hidden py-28 text-center"
      style={{
        background:
          "radial-gradient(70% 90% at 50% 45%, #7B2BC9 0%, #6A1FB5 45%, #4E1191 100%)",
      }}
    >
      {/* concentric ripples */}
      {[420, 620, 820, 1020].map((d) => (
        <span
          key={d}
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
          style={{ height: d, width: d }}
        />
      ))}

      <Shell className="relative">
        <h2 className="mx-auto max-w-[900px] text-[clamp(30px,3.7vw,50px)] font-bold leading-[1.15] tracking-[-0.02em] text-white">
          Still scrolling? We both know you&rsquo;re interested.
        </h2>
        <p className="mx-auto mt-8 max-w-[760px] text-[clamp(15px,1.25vw,20px)] leading-relaxed text-[#E4D8F6]">
          Let&rsquo;s chat about AI Agents the old-fashioned way. Get a demo tailored to your
          requirements.
        </p>

        <GreenButton className="mt-10 !px-14 !py-4 !text-[17px]">Schedule a Demo</GreenButton>

        <div className="mt-16 flex flex-wrap items-start justify-center gap-4">
          {G2.map((b, i) => (
            <div key={i} className="w-[110px] overflow-hidden rounded-sm bg-white pt-2 text-center shadow-md">
              <span className="mx-auto block h-5 w-5 rounded-sm bg-[#E4322B]" />
              <p className="mt-1 px-2 text-[11px] font-bold leading-tight text-[#1F2937]">
                {b.top}
              </p>
              <p className="mt-1 py-0.5 text-[10px] font-semibold text-white" style={{ backgroundColor: b.bandBg }}>
                {b.band}
              </p>
              <p className="px-2 py-1 text-[11px] font-bold text-[#1F2937]">{b.year}</p>
              <span
                className="block h-3 w-full"
                style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)", backgroundColor: "#fff" }}
              />
            </div>
          ))}
        </div>
      </Shell>
    </section>
  );
}

/* ═══ 11 · Footer ════════════════════════════════════════════════════════ */

const FOOTER_COLS = [
  {
    title: "Company",
    links: ["About us", "Terms and Conditions", "Privacy Policy", "Contact us", "Careers"],
  },
  {
    title: "Resources",
    links: ["Case Studies", "Blog", "Help Docs", "Partner Program", "Community", "AI Apps"],
  },
  {
    title: "Product",
    links: [
      "Knowledge Hub",
      "Tools",
      "Categorizer",
      "Conversational AI",
      "AI Analytics",
      "AI Evaluation",
    ],
  },
  {
    title: "Use cases",
    links: [
      "Finance & Banking",
      "Insurance",
      "Government",
      "Healthcare",
      "Telecom",
      "Education",
      "Retail",
      "Real Estate",
    ],
  },
];

/* lucide dropped brand glyphs, so the social marks are inline paths. */
const SOCIALS = [
  {
    label: "Discord",
    path: "M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.3.5c1.7.4 2.5 1 3.4 1.7a13.6 13.6 0 0 0-10.9 0C8.4 4.4 9.3 3.9 11 3.5L10.7 3a19.8 19.8 0 0 0-5 1.4C2.6 9 2 13.4 2.3 17.8A19.9 19.9 0 0 0 8.3 21l.8-1.2a13 13 0 0 1-2-1l.4-.3a14.2 14.2 0 0 0 12.2 0l.4.3c-.6.4-1.3.7-2 1l.8 1.2a19.9 19.9 0 0 0 6-3.2c.4-5-.6-9.4-4.6-13.4ZM9 15.3c-1.2 0-2.1-1.1-2.1-2.4 0-1.3.9-2.4 2-2.4 1.3 0 2.2 1.1 2.2 2.4s-1 2.4-2.1 2.4Zm6 0c-1.2 0-2.1-1.1-2.1-2.4 0-1.3.9-2.4 2.1-2.4s2.1 1.1 2.1 2.4-.9 2.4-2.1 2.4Z",
  },
  {
    label: "YouTube",
    path: "M23 12s0-3.6-.5-5.3a2.8 2.8 0 0 0-2-2C18.8 4.2 12 4.2 12 4.2s-6.8 0-8.5.5a2.8 2.8 0 0 0-2 2C1 8.4 1 12 1 12s0 3.6.5 5.3a2.8 2.8 0 0 0 2 2c1.7.5 8.5.5 8.5.5s6.8 0 8.5-.5a2.8 2.8 0 0 0 2-2C23 15.6 23 12 23 12ZM9.8 15.4V8.6l5.7 3.4-5.7 3.4Z",
  },
  {
    label: "LinkedIn",
    path: "M6.9 21H3.3V9.4h3.6V21ZM5.1 7.8a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2ZM21 21h-3.6v-5.6c0-1.4 0-3.1-1.9-3.1s-2.2 1.5-2.2 3v5.7H9.7V9.4h3.4V11h.1a3.8 3.8 0 0 1 3.4-1.9c3.6 0 4.3 2.4 4.3 5.5V21Z",
  },
  {
    label: "X",
    path: "M17.5 3h3.2l-7 8 8.2 10h-6.4l-5-6.2L4.7 21H1.5l7.5-8.6L1.1 3h6.6l4.5 5.7L17.5 3Zm-1.1 16h1.8L7.7 4.8H5.8L16.4 19Z",
  },
];

export function Footer() {
  return (
    <footer className="bg-[#4C0F8F] pb-10 pt-24 text-white">
      <Shell>
        <div className="grid gap-14 lg:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/tars-logomark.png" alt="" className="h-10 w-10 rounded-lg" />
              <span className="text-[30px] font-bold tracking-[0.04em]">TARS</span>
            </div>

            <p className="mt-12 text-[17px] font-bold uppercase tracking-[0.06em]">
              Get in touch.
            </p>
            <p className="mt-5 text-[17px] text-[#E0D3F2]">Email - sales@hellotars.com</p>

            <div className="mt-7 flex gap-4">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 transition-colors hover:bg-white/10"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>

            <div className="mt-14 flex flex-wrap gap-12">
              <Rating brand="G2 CROWD" />
              <Rating brand="Gartner Peer Insights" />
            </div>
          </div>

          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <p className="text-[17px] font-bold uppercase tracking-[0.06em]">{col.title}</p>
              <ul className="mt-6 space-y-4">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-[17px] text-[#E0D3F2] transition-colors hover:text-white"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 border-t border-white/15 pt-8">
          <p className="text-[15px] text-[#CBB9E4]">© 2025 Copyright Tars Technologies Inc.</p>
        </div>
      </Shell>
    </footer>
  );
}

function Rating({ brand }: { brand: string }) {
  return (
    <div>
      <p className="text-[18px] font-bold">{brand}</p>
      <div className="mt-2 flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className="h-4 w-4"
            fill={i < 4 ? "#F59E0B" : "#8B6BB5"}
            stroke="none"
          />
        ))}
      </div>
      <p className="mt-2 text-[15px] font-semibold">4.7 of 5 Rating</p>
    </div>
  );
}
