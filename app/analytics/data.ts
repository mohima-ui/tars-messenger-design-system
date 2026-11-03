/* ─── Analytics — the seeded dataset ──────────────────────────────────────
   The shape here is the shape the real thing will have: one row per agent,
   per variant, per day — the daily rollup an ingest pipeline produces out of
   raw widget events. Nothing in the UI reads anything else, so when the API
   exists this file becomes a fetch and no screen changes.

   Seeded rather than random: the same numbers every render, on the server and
   in the browser alike. Math.random() here would hydrate one set of figures
   over another and throw a mismatch — and a dashboard whose numbers move when
   you refresh is impossible to design against.

   The quirks at the foot of AGENTS are the point of a mock dataset. A month of
   tidy averages designs a dashboard that only works in a good week; what the
   screens have to survive is an agent with forty impressions, an agent that
   broke on Tuesday, and a customer whose Monday was ten times their Sunday. */

export type Variant = "composer" | "button";

/* Where an agent is deployed. One agent can be live on several at once, which
   is why this sits on the row rather than on the agent.

   The distinction that matters for the whole screen: what happens before a
   conversation starts is different on every one of these — a launcher is seen
   and pressed, a link is opened, a WhatsApp message is delivered and read —
   and what happens after it starts is identical on all of them. So the surface
   decides the top of the funnel and nothing else. */
export type Surface = "widget" | "link" | "mobile" | "whatsapp";

export const SURFACES: Record<
  Surface,
  {
    label: string;
    /* The arrival steps, in order, named in that surface's own words. Two on
       the surfaces with a launcher, one where opening the thing *is* the
       arrival. The keys are the row fields they read. */
    arrival: { key: "impressions" | "opens"; label: string; hint: string }[];
    /* What the first two tiles say. The last two never change. */
    reach: string;
    passed: string;
  }
> = {
  widget: {
    label: "Web widget",
    arrival: [
      { key: "impressions", label: "Seen", hint: "visible ≥1s, once per session" },
      { key: "opens", label: "Opened", hint: "pressed the launcher" },
    ],
    reach: "Impressions",
    passed: "Open rate",
  },
  link: {
    label: "Agent link",
    /* One step: there is no impression to count, because the impression
       happened wherever the link was posted — an email, a QR code on a
       leaflet, someone's signature — and none of that is ours to see. */
    arrival: [{ key: "impressions", label: "Visits", hint: "the link was opened" }],
    reach: "Visits",
    passed: "Start rate",
  },
  mobile: {
    label: "Mobile app",
    arrival: [
      { key: "impressions", label: "Shown", hint: "entry point on screen" },
      { key: "opens", label: "Tapped", hint: "opened the assistant" },
    ],
    reach: "Entry points shown",
    passed: "Tap rate",
  },
  whatsapp: {
    label: "WhatsApp",
    /* Delivery, not visibility. Nothing here is an impression and none of it
       should be called one. */
    arrival: [
      { key: "impressions", label: "Delivered", hint: "messages that arrived" },
      { key: "opens", label: "Read", hint: "receipts from the handset" },
    ],
    reach: "Delivered",
    passed: "Read rate",
  },
};

export const SURFACE_ORDER: Surface[] = ["widget", "link", "mobile", "whatsapp"];

export type Row = {
  date: string;
  tenant: TenantId;
  agent: string;
  surface: Surface;
  variant: Variant;
  /* The funnel, in order. Every rate the UI shows is two of these divided. */
  impressions: number;
  opens: number;
  engaged: number;
  /* Conversations that got past the first exchange — three turns or more.
     The step that separates "asked one thing" from "had a conversation". */
  deep: number;
  turns: number;
  outcomes: number;
  /* Quality, not funnel: opened and shut inside three seconds with nothing
     typed. A high CTR made of these is a launcher people press by accident. */
  misclicks: number;
  handoffs: number;
  errors: number;
  /* Dollars. Only WhatsApp has one — Meta bills per 24-hour conversation —
     and it is the number that surface's customers ask about first. Zero
     everywhere else, and the tile that shows it only appears where it is
     real. */
  cost: number;
};

export type TenantId = "brightline" | "globalpayments" | "amex" | "tars";

export const TENANTS: {
  id: TenantId;
  name: string;
  site: string;
  /* Each customer's own definition of success — the last step of the funnel
     is not the same event on a pediatric clinic's site as on a payments one,
     and a dashboard that calls both "conversions" tells neither of them
     anything. */
  outcome: string;
}[] = [
  { id: "brightline", name: "Brightline", site: "brightline.com", outcome: "Appointment requested" },
  { id: "globalpayments", name: "Global Payments", site: "globalpayments.com", outcome: "Demo booked" },
  { id: "amex", name: "American Express", site: "americanexpress.com", outcome: "Application started" },
  { id: "tars", name: "Tars", site: "hellotars.com", outcome: "Trial started" },
];

export const TENANT = Object.fromEntries(TENANTS.map((t) => [t.id, t])) as Record<
  TenantId,
  (typeof TENANTS)[number]
>;

export type Deployment = {
  surface: Surface;
  /* Daily reach at the start of the window, before seasonality — impressions
     on a launcher, visits on a link, messages delivered on WhatsApp. */
  base: number;
  /* Reach → the second arrival step. 1 where there is only one step. */
  passed: number;
  /* Second arrival step → conversation started. */
  started: number;
  engagedDeep?: number;
  outcome: number;
};

export type Agent = {
  id: string;
  tenant: TenantId;
  name: string;
  scope: string;
  variant: Variant;
  sdk: string;
  deploy: Deployment[];
  /* Days since the window opened before this agent went live. */
  livesOn?: number;
  quirk?: "broken" | "spike" | "ab";
};

/* The same conversation costs the same to run wherever it happens, except on
   WhatsApp, where Meta charges per 24-hour session. */
const WA_SESSION_COST = 0.035;

export const DAYS = 90;
/* Fixed, so every figure on screen is stable between sessions. */
export const TODAY = new Date("2026-09-11T00:00:00Z");

export const AGENTS: Agent[] = [
  /* Three surfaces on one agent: the widget on the site, a link the clinic
     puts in appointment emails, and the WhatsApp number on the back of the
     card. Same agent, same answers, three completely different arrivals —
     which is the case the whole screen exists to handle. */
  {
    id: "bl-web-01",
    tenant: "brightline",
    name: "Site assistant",
    scope: "All pages",
    variant: "composer",
    sdk: "3.0.2",
    deploy: [
      { surface: "widget", base: 8200, passed: 0.07, started: 0.54, outcome: 0.39 },
      /* A link arrives already intended: nobody opens it by accident, so the
         start rate is four times the widget's and the reach is a fraction. */
      { surface: "link", base: 940, passed: 1, started: 0.43, outcome: 0.46 },
      /* Read rates on WhatsApp are enormous and mean much less than they look
         like they mean — a read receipt is not an intention. What it converts
         into afterwards is the number that counts. */
      { surface: "whatsapp", base: 520, passed: 0.79, started: 0.34, outcome: 0.51 },
    ],
  },
  /* Live for eight days on one page. Every rate it reports is noise, and the
     UI has to say so rather than print "CTR 2.6%" next to a number built out
     of four clicks. */
  {
    id: "bl-pricing",
    tenant: "brightline",
    name: "Pricing page",
    scope: "/pricing",
    variant: "composer",
    sdk: "3.0.2",
    deploy: [{ surface: "widget", base: 41, passed: 0.093, started: 0.6, outcome: 0.42 }],
    livesOn: DAYS - 8,
  },
  {
    id: "gp-web-01",
    tenant: "globalpayments",
    name: "Site assistant",
    scope: "All pages",
    variant: "composer",
    sdk: "3.0.1",
    deploy: [{ surface: "widget", base: 14300, passed: 0.048, started: 0.47, outcome: 0.21 }],
  },
  /* Impressions, no opens. A deploy on the POS pages broke the click handler
     and nobody noticed for a fortnight — which is the single most valuable
     thing this dashboard can catch. */
  {
    id: "gp-pos",
    tenant: "globalpayments",
    name: "POS pages",
    scope: "/pos/*",
    variant: "composer",
    sdk: "3.0.1",
    deploy: [{ surface: "widget", base: 3100, passed: 0.052, started: 0.44, outcome: 0.18 }],
    quirk: "broken",
  },
  {
    id: "gp-support",
    tenant: "globalpayments",
    name: "Support centre",
    scope: "/support/*",
    variant: "button",
    sdk: "2.8.4",
    deploy: [
      { surface: "widget", base: 5400, passed: 0.104, started: 0.63, outcome: 0.12 },
      { surface: "whatsapp", base: 2400, passed: 0.81, started: 0.36, outcome: 0.16 },
    ],
  },
  /* One campaign send, one enormous Tuesday. The trend line has to stay
     readable with a 9x day in it. */
  {
    id: "amx-web-01",
    tenant: "amex",
    name: "Cards explorer",
    scope: "/credit-cards/*",
    variant: "composer",
    sdk: "3.0.2",
    deploy: [
      { surface: "widget", base: 9600, passed: 0.061, started: 0.51, outcome: 0.27 },
      /* In-app the entry point is a row in a menu rather than a floating
         launcher, and it is tapped far more often than a launcher is
         pressed — a different surface, not a better design. */
      { surface: "mobile", base: 3300, passed: 0.138, started: 0.58, outcome: 0.31 },
    ],
    quirk: "spike",
  },
  /* The A/B: the same agent shipping both launchers, split by visitor id.
     Both halves are the last 21 days; before that it was button only. */
  {
    id: "tars-site",
    tenant: "tars",
    name: "hellotars.com",
    scope: "All pages",
    variant: "composer",
    sdk: "3.0.2",
    deploy: [
      { surface: "widget", base: 4300, passed: 0.081, started: 0.58, outcome: 0.16 },
      { surface: "link", base: 610, passed: 1, started: 0.49, outcome: 0.22 },
    ],
    quirk: "ab",
  },
  {
    id: "tars-docs",
    tenant: "tars",
    name: "Docs",
    scope: "docs.hellotars.com",
    variant: "button",
    sdk: "2.8.4",
    deploy: [{ surface: "widget", base: 2100, passed: 0.031, started: 0.41, outcome: 0.04 }],
  },
];

export const AGENT = Object.fromEntries(AGENTS.map((a) => [a.id, a])) as Record<string, Agent>;

/* ── the generator ──────────────────────────────────────────────────────── */

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

/* mulberry32 — small, fast, and the same sequence everywhere. */
const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const dayKey = (offset: number) => {
  const d = new Date(TODAY);
  d.setUTCDate(d.getUTCDate() - (DAYS - 1 - offset));
  return d.toISOString().slice(0, 10);
};

export const DATES = Array.from({ length: DAYS }, (_, i) => dayKey(i));

function build(): Row[] {
  const out: Row[] = [];

  for (const a of AGENTS) {
    for (const dep of a.deploy) {
      for (let d = 0; d < DAYS; d++) {
        if (a.livesOn !== undefined && d < a.livesOn) continue;

        const date = DATES[d];
        /* Seeded per agent *and* surface, so the widget's Tuesday and the
           WhatsApp Tuesday are independent rather than the same wobble
           printed twice. */
        const r = rng(hash(a.id + dep.surface + date));
        const weekday = new Date(date + "T00:00:00Z").getUTCDay();
        /* Traffic is a working-week shape on every one of these sites. */
        const season = weekday === 0 || weekday === 6 ? 0.55 : 1;
        /* A gentle climb across the window, so period-on-period deltas have
           something real to report. */
        const trend = 1 + 0.18 * (d / DAYS);
        const noise = 0.88 + 0.24 * r();

        let reach = Math.round(dep.base * season * trend * noise);
        let passed = dep.passed * (0.9 + 0.2 * r());
        let startedRate = dep.started * (0.94 + 0.12 * r());
        const outcomeRate = dep.outcome * (0.9 + 0.2 * r());
        let errors = Math.round(reach * 0.002 * r());

        if (a.quirk === "spike" && dep.surface === "widget" && d === DAYS - 24) {
          reach = Math.round(reach * 9.2);
        }
        /* Broken 16 days ago: the launcher still renders, the click does
           nothing, and the error count goes with it. */
        if (a.quirk === "broken" && d >= DAYS - 16) {
          passed = 0;
          startedRate = 0;
          errors = Math.round(reach * 0.31);
        }

        const opens = Math.round(reach * passed);
        const engaged = Math.round(opens * startedRate);
        const outcomes = Math.round(engaged * outcomeRate);

        const row: Row = {
          date,
          tenant: a.tenant,
          agent: a.id,
          surface: dep.surface,
          variant: a.variant,
          impressions: reach,
          opens,
          engaged,
          deep: Math.round(engaged * (0.52 + 0.22 * r())),
          turns: Math.round(engaged * (3.2 + 3 * r())),
          outcomes,
          /* A mis-click needs something to click. There is no such gesture in
             a chat thread, so the field stays at zero on WhatsApp and the tile
             that reads it is not drawn there. */
          misclicks:
            dep.surface === "widget" || dep.surface === "mobile"
              ? Math.round(opens * (0.05 + 0.05 * r()))
              : 0,
          handoffs: Math.round(engaged * 0.08 * (0.6 + 0.8 * r())),
          errors,
          cost: dep.surface === "whatsapp" ? engaged * WA_SESSION_COST : 0,
        };

        /* The A/B splits one agent's traffic in two for the last three weeks,
           and only on the surface that has two launchers to compare — there is
           no composer and no button inside a WhatsApp thread. Same row shape,
           one per arm, which is the whole reason `variant` is on the row and
           not on the agent. Before the test this agent shipped the button
           launcher alone, so the composer arm simply does not exist on those
           days: a series with a hole in the left of the window, which is a
           state the chart has to draw rather than pack over. */
        if (a.quirk === "ab" && dep.surface === "widget" && d >= DAYS - 21) {
          const half = (n: number) => Math.round(n / 2);
          const arm = (variant: Variant, lift: number): Row => ({
            ...row,
            variant,
            impressions: half(row.impressions),
            opens: Math.round(half(row.opens) * lift),
            engaged: Math.round(half(row.engaged) * lift),
            deep: Math.round(half(row.deep) * lift),
            turns: half(row.turns),
            outcomes: Math.round(half(row.outcomes) * lift),
            misclicks: half(row.misclicks),
            handoffs: half(row.handoffs),
            errors: half(row.errors),
            cost: row.cost / 2,
          });
          out.push(arm("composer", 1.18), arm("button", 0.74));
          continue;
        }

        out.push(
          a.quirk === "ab" && dep.surface === "widget"
            ? { ...row, variant: "button" }
            : row,
        );
      }
    }
  }

  return out;
}

export const ROWS: Row[] = build();

/* ── reading the rows ───────────────────────────────────────────────────── */

export type Totals = {
  impressions: number;
  opens: number;
  engaged: number;
  deep: number;
  turns: number;
  outcomes: number;
  misclicks: number;
  handoffs: number;
  errors: number;
  cost: number;
};

export const ZERO: Totals = {
  impressions: 0,
  opens: 0,
  engaged: 0,
  deep: 0,
  turns: 0,
  outcomes: 0,
  misclicks: 0,
  handoffs: 0,
  errors: 0,
  cost: 0,
};

export const total = (rows: Row[]): Totals =>
  rows.reduce(
    (acc, r) => ({
      impressions: acc.impressions + r.impressions,
      opens: acc.opens + r.opens,
      engaged: acc.engaged + r.engaged,
      deep: acc.deep + r.deep,
      turns: acc.turns + r.turns,
      outcomes: acc.outcomes + r.outcomes,
      misclicks: acc.misclicks + r.misclicks,
      handoffs: acc.handoffs + r.handoffs,
      errors: acc.errors + r.errors,
      cost: acc.cost + r.cost,
    }),
    { ...ZERO },
  );

/* The window, and the window before it — deltas are always period-on-period,
   because "up 12%" against no stated baseline is a number with no claim in
   it. */
export const periods = (rows: Row[], days: number) => {
  const start = DATES[DAYS - days];
  const prevStart = DATES[Math.max(0, DAYS - days * 2)];
  return {
    now: rows.filter((r) => r.date >= start),
    prev: rows.filter((r) => r.date >= prevStart && r.date < start),
  };
};

export const rate = (num: number, den: number) => (den === 0 ? 0 : num / den);

/* Under this many impressions a rate is noise. The UI says so instead of
   printing it — see the "Not enough data" state. */
export const FLOOR = 500;

export const byDate = (rows: Row[]) => {
  const map = new Map<string, Totals>();
  for (const r of rows) {
    const cur = map.get(r.date) ?? { ...ZERO };
    map.set(r.date, {
      impressions: cur.impressions + r.impressions,
      opens: cur.opens + r.opens,
      engaged: cur.engaged + r.engaged,
      deep: cur.deep + r.deep,
      turns: cur.turns + r.turns,
      outcomes: cur.outcomes + r.outcomes,
      misclicks: cur.misclicks + r.misclicks,
      handoffs: cur.handoffs + r.handoffs,
      errors: cur.errors + r.errors,
      cost: cur.cost + r.cost,
    });
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([date, t]) => ({ date, ...t }));
};

/* ── formatting ─────────────────────────────────────────────────────────── */

export const compact = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 10_000
      ? `${Math.round(n / 1000)}k`
      : n >= 1000
        ? `${(n / 1000).toFixed(1)}k`
        : `${n}`;

export const pct = (v: number, digits = 1) => `${(v * 100).toFixed(digits)}%`;

export const full = (n: number) => n.toLocaleString("en-US");

export const shortDate = (iso: string) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

/* What got pressed, per agent. Not derived from the rollup — this is its own
   event (`suggestion_click`) and its own little table, because "which words
   did people press" is the one number on here that changes what you design
   next rather than what you fix. */
export const SUGGESTIONS: Record<string, { label: string; clicks: number }[]> = {
  "bl-web-01": [
    { label: "Insurance & pricing", clicks: 1840 },
    { label: "How do I get started?", clicks: 1216 },
    { label: "How does care work?", clicks: 702 },
    { label: "Something else", clicks: 233 },
  ],
  "bl-pricing": [
    { label: "What does it cost?", clicks: 14 },
    { label: "Do you take my insurance?", clicks: 9 },
  ],
  "gp-web-01": [
    { label: "Accept payments", clicks: 2210 },
    { label: "Explore POS solutions", clicks: 1044 },
    { label: "Online payments", clicks: 861 },
  ],
  "gp-support": [
    { label: "Track a payout", clicks: 3180 },
    { label: "Reset my password", clicks: 2940 },
    { label: "Talk to a human", clicks: 2610 },
  ],
  "amx-web-01": [
    { label: "Compare cards", clicks: 4120 },
    { label: "Check if I'm pre-approved", clicks: 3380 },
    { label: "Rewards & points", clicks: 1190 },
  ],
  "tars-site": [
    { label: "What can Tars do?", clicks: 980 },
    { label: "Can I book a demo?", clicks: 742 },
    { label: "How much does it cost?", clicks: 655 },
  ],
  "tars-docs": [
    { label: "Install the widget", clicks: 410 },
    { label: "Event reference", clicks: 288 },
  ],
  "gp-pos": [],
};
