type Swatch = {
  name: string;
  token: string;
  hex: string;
  note?: string;
  light?: boolean;
};

const ACCENTS: { tenant: string; accent: string; ink: string; soft: string; border: string }[] = [
  {
    tenant: "Global Payments",
    accent: "#120BF4",
    ink: "#0A06A0",
    soft: "#E0E5FA",
    border: "#A5B0EE",
  },
  {
    tenant: "Vodafone",
    accent: "#E60000",
    ink: "#A30000",
    soft: "#FEE2E2",
    border: "#FCA5A5",
  },
  {
    tenant: "Amex",
    accent: "#009DDA",
    ink: "#006FA0",
    soft: "#DBF0FA",
    border: "#7DC8E8",
  },
];

const NEUTRALS: Swatch[] = [
  { name: "0", token: "--n-0", hex: "#FFFFFF", note: "Surface · paper", light: true },
  { name: "25", token: "--n-25", hex: "#FFFDFA", note: "Chatbot background", light: true },
  { name: "50", token: "--n-50", hex: "#F9F3EA", note: "AI message", light: true },
  { name: "100", token: "--n-100", hex: "#F0EBE0", note: "Hover · warm", light: true },
  { name: "200", token: "--n-200", hex: "#E0DAD3", note: "Line · stroke", light: true },
  { name: "300", token: "--n-300", hex: "#D9D5CC", note: "Card border" },
  { name: "400", token: "--n-400", hex: "#C4B9A8" },
  { name: "500", token: "--n-500", hex: "#979797", note: "Muted text" },
  { name: "600", token: "--n-600", hex: "#6E6E6E", note: "Secondary text" },
  { name: "700", token: "--n-700", hex: "#555555", note: "Label text" },
  { name: "800", token: "--n-800", hex: "#333333", note: "Ink · primary text" },
  { name: "900", token: "--n-900", hex: "#1A1A1A" },
];

const SEMANTIC = [
  { name: "Success", base: "#16A34A", soft: "#E8F5EC", ink: "#0F7A38" },
  { name: "Warning", base: "#D97706", soft: "#FEF3DC", ink: "#92500B" },
  { name: "Danger", base: "#DC2626", soft: "#FEE2E2", ink: "#991B1B" },
  { name: "Info", base: "#0284C7", soft: "#DBEAFE", ink: "#0369A1" },
];

const ROLE_GROUPS: {
  name: string;
  tokens: { token: string; refers: string; hex: string; use: string }[];
}[] = [
  {
    name: "Surface",
    tokens: [
      { token: "--bg-canvas", refers: "neutral-25", hex: "#FFFDFA", use: "Main messenger background" },
      { token: "--bg-surface", refers: "neutral-0", hex: "#FFFFFF", use: "Card · modal · primary surface" },
      { token: "--bg-paper", refers: "neutral-50", hex: "#F9F3EA", use: "AI bubble · composer · option pill" },
      { token: "--bg-subtle", refers: "neutral-100", hex: "#F0EBE0", use: "Warm hover · pressed fill" },
    ],
  },
  {
    name: "Text",
    tokens: [
      { token: "--text-ink", refers: "neutral-800", hex: "#333333", use: "Primary text · bubble content · headings · icon hover" },
      { token: "--text-label", refers: "neutral-700", hex: "#555555", use: "Strong labels · composer text" },
      { token: "--text-secondary", refers: "neutral-600", hex: "#6E6E6E", use: "Secondary text · captions · icon rest" },
      { token: "--text-muted", refers: "neutral-500", hex: "#979797", use: "Tertiary text · timestamps · placeholders · typing dots" },
    ],
  },
  {
    name: "Border",
    tokens: [
      { token: "--border-line", refers: "neutral-200", hex: "#E0DAD3", use: "Default stroke · bubble · composer" },
      { token: "--border-line-strong", refers: "neutral-300", hex: "#D9D5CC", use: "Card edge · hover stroke" },
    ],
  },
  {
    name: "Accent (per tenant)",
    tokens: [
      { token: "--accent", refers: "brand", hex: "#120BF4", use: "Send button · focus border · primary CTA" },
      { token: "--accent-ink", refers: "brand", hex: "#0A06A0", use: "Text on accent-soft · pressed · arrow · icon active" },
      { token: "--accent-soft", refers: "brand", hex: "#E0E5FA", use: "User bubble · suggestion hover · focus ring tint" },
      { token: "--accent-border", refers: "brand", hex: "#A5B0EE", use: "User bubble border · subtle accent stroke" },
    ],
  },
];

const FAMILIES = [
  {
    name: "Sans",
    token: "--font-sans",
    family: "Poppins",
    note: "Default. Used in every UI surface.",
    sample: "The agent speaks plainly.",
    fontFamily: "var(--font-sans)",
  },
  {
    name: "Mono",
    token: "--font-mono",
    family: "Geist Mono",
    note: "Code, kbd chips, timestamps, brand wordmark.",
    sample: "Press ↵ to send · acme.co/help",
    fontFamily: "var(--font-mono)",
  },
];

const TYPE_SCALE = [
  { name: "8 · Nano", size: 8, line: 12, weight: 500, sample: "BETA" },
  { name: "10 · Caption", size: 10, line: 14, weight: 500, sample: "Press ↵ to send" },
  { name: "11 · Micro", size: 11, line: 16, weight: 500, sample: "Tars • AI Agent" },
  { name: "12 · Body S", size: 12, line: 18, weight: 400, sample: "Message bubble text — the default for chat content." },
  { name: "14 · Body", size: 14, line: 22, weight: 400, sample: "Header name · composer input · component labels." },
  { name: "16 · Body L", size: 16, line: 24, weight: 500, sample: "Paragraph or in-line section title." },
  { name: "18 · Title", size: 18, line: 26, weight: 600, sample: "Card title" },
  { name: "20 · Subhead", size: 20, line: 28, weight: 600, sample: "Subhead" },
  { name: "24 · Heading", size: 24, line: 32, weight: 600, sample: "Design System" },
  { name: "28 · Heading L", size: 28, line: 36, weight: 600, sample: "Large heading" },
  { name: "32 · Display", size: 32, line: 40, weight: 600, sample: "Display" },
];

const WEIGHTS = [
  { name: "Regular", value: 400, sample: "The agent speaks plainly." },
  { name: "Medium", value: 500, sample: "Labels and chips." },
  { name: "Semibold", value: 600, sample: "Emphasized words & titles." },
  { name: "Bold", value: 700, sample: "Brand wordmark · tars" },
];

const LINE_HEIGHTS = [
  { name: "Tight", token: "--lh-tight", value: "1.1", use: "Display · large headings", sample: "Display heading\nover two lines" },
  { name: "Compact", token: "--lh-compact", value: "1.2", use: "Headings · titles", sample: "Section title\nshown compact" },
  { name: "Snug", token: "--lh-snug", value: "1.4", use: "UI labels · dense rows", sample: "Form labels and dense UI rows sit at snug height." },
  { name: "Normal", token: "--lh-normal", value: "1.45", use: "User bubble · default body", sample: "User bubble text uses normal line-height for readable but dense chat." },
  { name: "Relaxed", token: "--lh-relaxed", value: "1.55", use: "AI bubble · long-form replies", sample: "AI bubble messages get more breathing room since replies tend to be longer and explanatory." },
  { name: "Loose", token: "--lh-loose", value: "1.7", use: "Documentation · long-form", sample: "Long-form documentation, FAQ pages, and help-center articles use the loosest setting for sustained reading." },
];

const LETTER_SPACINGS = [
  { name: "Tighter", token: "--ls-tighter", value: "-0.02em", use: "Display headings", sample: "Display Heading" },
  { name: "Tight", token: "--ls-tight", value: "-0.01em", use: "Large headings", sample: "Large Heading" },
  { name: "Normal", token: "--ls-normal", value: "0", use: "Default body", sample: "Default body text" },
  { name: "Wide", token: "--ls-wide", value: "0.04em", use: "Small labels", sample: "Subdued label" },
  { name: "Wider", token: "--ls-wider", value: "0.08em", use: "Section eyebrows", sample: "FOUNDATION" },
  { name: "Widest", token: "--ls-widest", value: "0.12em", use: "Tiny uppercase tags", sample: "AI AGENT" },
];

const SPACING: { name: string; token: string; px: number; use?: string }[] = [
  { name: "1", token: "--sp-1", px: 4, use: "Inside a message group — label → bubble → toolbar stack" },
  { name: "1.5", token: "--sp-1.5", px: 6, use: "Between suggestion / option buttons" },
  { name: "2", token: "--sp-2", px: 8, use: "Composer icon gap · bubble → options gap" },
  { name: "3", token: "--sp-3", px: 12, use: "Between message turns in the history list" },
  { name: "4", token: "--sp-4", px: 16, use: "Card padding — header · main · composer" },
  { name: "5", token: "--sp-5", px: 20, use: "Section breathing" },
  { name: "6", token: "--sp-6", px: 24, use: "Card margins · top offset" },
  { name: "8", token: "--sp-8", px: 32, use: "Major section gaps" },
];

const RADII = [
  { name: "2", token: "--r-xs", px: 2, use: "Subtle clip" },
  { name: "4", token: "--r-sm", px: 4, use: "Inline kbd · tag" },
  { name: "6", token: "--r-md", px: 6, use: "Icon button" },
  { name: "8", token: "--r-lg", px: 8, use: "Secondary chip" },
  { name: "10", token: "--r-xl", px: 10, use: "Inline card" },
  { name: "12", token: "--r-2xl", px: 12, use: "Bubble · composer · primary chip" },
  { name: "20", token: "--r-3xl", px: 20, use: "Chat card" },
  { name: "full", token: "--r-full", px: 9999, use: "Pill button · avatar" },
];

const SHADOWS = [
  {
    name: "sh-1",
    use: "Toolbar · subtle lift",
    css: "0 1px 2px rgba(0,0,0,0.05)",
  },
  {
    name: "sh-2",
    use: "Hover card · button",
    css: "0 4px 12px -3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  },
  {
    name: "sh-3",
    use: "Chat widget · floating panel",
    css: "0 -3px 14px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.05), 0 14px 36px rgba(0,0,0,0.10), 0 36px 72px rgba(0,0,0,0.08)",
  },
  {
    name: "ring-focus",
    use: "Focus ring (accent)",
    css: "0 0 0 4px rgba(18,11,244,0.15)",
  },
];

const COMPONENTS = [
  { name: "Launcher", slug: "launcher", note: "The bubble at rest. A tease appears once, then sleeps." },
  { name: "Header", slug: "header", note: "Chat top bar — avatar, name, status, controls." },
  { name: "AI Message", slug: "ai-message", note: "The agent speaks plainly. Citations are inline; sources expand on demand." },
  { name: "Indicators", slug: "indicators", note: "Pending states — typing pulse, thinking line, reasoning checklist, tool running." },
  { name: "Human Agent Message", slug: "human-agent", note: "Same shape as AI, but a named avatar (Priya, P) takes over." },
  { name: "User Message", slug: "user-message", note: "The person speaks back. Brand-soft, accent-ink." },
  { name: "Human Handoff", slug: "handoff", note: "The seam. AI hands the conversation off — context intact." },
  { name: "Input Types", slug: "input-types", note: "Buttons, cards, calendar, auto-suggest, rating, geo — scaffolded replies." },
  { name: "Message Composer", slug: "composer", note: "The input bar. Voice at rest, send on intent, stop while recording." },
  { name: "History", slug: "history", note: "Past conversations as gentle entries. Continue where you left off." },
  { name: "CSAT", slug: "csat", note: "Inline rating after resolution." },
  { name: "Error", slug: "error", note: "Soft, never alarming. Recoverable." },
];

function ColorTile({ swatch }: { swatch: Swatch }) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className="aspect-[5/2] rounded-[10px] border border-black/5"
        style={{ backgroundColor: swatch.hex }}
      />
      <div className="flex items-baseline justify-between text-[11px]">
        <span className="font-semibold text-[#333333]">{swatch.name}</span>
        <span className="font-mono text-[10px] text-[#6E6E6E]">{swatch.hex}</span>
      </div>
      {swatch.note && (
        <p className="text-[10px] text-[#979797]">{swatch.note}</p>
      )}
    </div>
  );
}

function AccentRow({ tenant }: { tenant: typeof ACCENTS[number] }) {
  const items = [
    { label: "accent", hex: tenant.accent, role: "CTA · sends · focus" },
    { label: "accent-ink", hex: tenant.ink, role: "Text on tint · pressed" },
    { label: "accent-soft", hex: tenant.soft, role: "User bubble · soft hover" },
    { label: "accent-border", hex: tenant.border, role: "Soft border · ring" },
  ];
  return (
    <div className="flex flex-col gap-3 rounded-[14px] border border-[#E5E5E5] bg-[#FFFDFA] p-4">
      <p className="text-[13px] font-semibold text-[#333333]">{tenant.tenant}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((i) => (
          <div key={i.label} className="flex flex-col gap-1.5">
            <div
              className="h-12 rounded-[8px] border border-black/5"
              style={{ backgroundColor: i.hex }}
            />
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-[#333333]">{i.label}</span>
              <span className="font-mono text-[10px] text-[#6E6E6E]">{i.hex}</span>
              <span className="mt-0.5 text-[10px] text-[#979797]">{i.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-[#E5E5E5] pt-12 first:border-t-0 first:pt-0">
      <div className="mb-6">
        <h2 className="text-[20px] font-semibold tracking-tight text-[#333333]">
          {title}
        </h2>
        {intro && (
          <p className="mt-1.5 max-w-[560px] text-[13px] leading-relaxed text-[#6E6E6E]">
            {intro}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-[1080px] px-8 py-12">
        <div className="mb-16 max-w-[640px]">
          <p className="text-[12px] font-medium tracking-wider text-[#6E6E6E] uppercase">
            Foundation
          </p>
          <h2 className="mt-2 text-[32px] leading-tight font-semibold tracking-tight text-[#333333]">
            The smallest pieces. The first agreements.
          </h2>
          <p className="mt-4 text-[14px] leading-relaxed text-[#555]">
            Tokens are the contract between brand and product. Components consume{" "}
            <code className="rounded bg-[#F9F3EA] px-1.5 py-0.5 font-mono text-[12px]">
              var(--accent)
            </code>
            , never literal hexes. Tenants swap by changing one CSS variable
            block — the warm cream surface stays brand-agnostic.
          </p>
        </div>

        <div className="flex flex-col gap-16">
          <Section
            id="typography"
            title="Typography"
            intro="Poppins for everything. An 11-step scale spans 8px micro tags to 32px display. Weights, line-heights, and tracking are normalized so any combination reads cleanly."
          >
            <div className="flex flex-col gap-8">
              {/* Font families */}
              <div>
                <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">
                  Font families
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {FAMILIES.map((f) => (
                    <div
                      key={f.name}
                      className="flex flex-col gap-3 rounded-[12px] border border-[#E5E5E5] bg-white p-4"
                    >
                      <div className="flex items-baseline justify-between">
                        <p className="text-[13px] font-semibold text-[#333333]">
                          {f.name}
                        </p>
                        <span className="font-mono text-[10px] text-[#6E6E6E]">
                          {f.token}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#979797]">
                        {f.family} · {f.note}
                      </p>
                      <p
                        className="text-[16px] leading-snug text-[#333333]"
                        style={{ fontFamily: f.fontFamily }}
                      >
                        {f.sample}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Type scale */}
              <div>
                <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">
                  Type scale
                </p>
                <div className="flex flex-col divide-y divide-[#E5E5E5] overflow-hidden rounded-[12px] border border-[#E5E5E5] bg-white">
                  {TYPE_SCALE.map((t) => (
                    <div
                      key={t.name}
                      className="flex items-baseline gap-6 px-4 py-3"
                    >
                      <div className="w-28 shrink-0">
                        <p className="text-[11px] font-semibold text-[#333333]">
                          {t.name}
                        </p>
                        <p className="font-mono text-[10px] text-[#6E6E6E]">
                          {t.size} / {t.line} · {t.weight}
                        </p>
                      </div>
                      <p
                        className="min-w-0 truncate text-[#333333]"
                        style={{
                          fontSize: `${t.size}px`,
                          lineHeight: `${t.line}px`,
                          fontWeight: t.weight,
                        }}
                      >
                        {t.sample}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Font weight */}
              <div>
                <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">
                  Font weight
                </p>
                <div className="rounded-[12px] border border-[#E5E5E5] bg-white p-4">
                  <div className="flex flex-col gap-2.5">
                    {WEIGHTS.map((w) => (
                      <div key={w.name} className="flex items-baseline gap-4">
                        <span className="w-28 font-mono text-[11px] text-[#6E6E6E]">
                          {w.value} · {w.name}
                        </span>
                        <span
                          className="text-[14px] text-[#333333]"
                          style={{ fontWeight: w.value }}
                        >
                          {w.sample}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Line height */}
              <div>
                <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">
                  Line height
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {LINE_HEIGHTS.map((l) => (
                    <div
                      key={l.name}
                      className="flex flex-col gap-2 rounded-[12px] border border-[#E5E5E5] bg-white p-4"
                    >
                      <div className="flex items-baseline justify-between">
                        <span className="text-[12px] font-semibold text-[#333333]">
                          {l.name}
                        </span>
                        <span className="font-mono text-[10px] text-[#6E6E6E]">
                          {l.value}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#979797]">{l.use}</p>
                      <p
                        className="mt-1 text-[14px] whitespace-pre-line text-[#333333]"
                        style={{ lineHeight: l.value }}
                      >
                        {l.sample}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Letter spacing */}
              <div>
                <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">
                  Letter spacing
                </p>
                <div className="flex flex-col divide-y divide-[#E5E5E5] overflow-hidden rounded-[12px] border border-[#E5E5E5] bg-white">
                  {LETTER_SPACINGS.map((s) => (
                    <div
                      key={s.name}
                      className="flex items-baseline gap-6 px-4 py-3"
                    >
                      <div className="w-28 shrink-0">
                        <p className="text-[11px] font-semibold text-[#333333]">
                          {s.name}
                        </p>
                        <p className="font-mono text-[10px] text-[#6E6E6E]">
                          {s.value}
                        </p>
                      </div>
                      <span
                        className="text-[16px] text-[#333333]"
                        style={{ letterSpacing: s.value }}
                      >
                        {s.sample}
                      </span>
                      <span className="ml-auto text-[10px] text-[#979797]">
                        {s.use}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section
            id="color"
            title="Color"
            intro="Three layers. Primitives are raw values (Neutrals, Semantic). Brand is the per-tenant accent. Role tokens map the primitives to semantic component slots — and those are the only thing components reference."
          >
            <div className="flex flex-col gap-8">
              {/* Brand */}
              <div>
                <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">
                  Brand
                </p>
                <p className="mb-4 max-w-[560px] text-[12px] leading-relaxed text-[#979797]">
                  Per tenant. Four roles per accent: solid (
                  <code className="font-mono text-[11px] text-[#555]">
                    accent
                  </code>
                  ), pressed/text-on-tint (
                  <code className="font-mono text-[11px] text-[#555]">
                    accent-ink
                  </code>
                  ), bubble-fill (
                  <code className="font-mono text-[11px] text-[#555]">
                    accent-soft
                  </code>
                  ), border (
                  <code className="font-mono text-[11px] text-[#555]">
                    accent-border
                  </code>
                  ).
                </p>
                <div className="flex flex-col gap-4">
                  {ACCENTS.map((a) => (
                    <AccentRow key={a.tenant} tenant={a} />
                  ))}
                </div>
              </div>

              {/* Neutrals */}
              <div>
                <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">
                  Neutrals
                </p>
                <p className="mb-4 max-w-[560px] text-[12px] leading-relaxed text-[#979797]">
                  Warm grey scale. Surfaces, lines, and ink all live here. Use
                  role tokens at the component level, not the numeric step.
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {NEUTRALS.map((s) => (
                    <ColorTile key={s.name} swatch={s} />
                  ))}
                </div>
              </div>

              {/* Semantic */}
              <div>
                <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">
                  Semantic
                </p>
                <p className="mb-4 max-w-[560px] text-[12px] leading-relaxed text-[#979797]">
                  Three roles per intent:{" "}
                  <code className="font-mono text-[11px] text-[#555]">
                    base
                  </code>{" "}
                  (label),{" "}
                  <code className="font-mono text-[11px] text-[#555]">
                    soft
                  </code>{" "}
                  (fill),{" "}
                  <code className="font-mono text-[11px] text-[#555]">
                    ink
                  </code>{" "}
                  (text on soft). Used in Error, CSAT, and status badges.
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {SEMANTIC.map((s) => (
                    <div
                      key={s.name}
                      className="flex flex-col gap-2 rounded-[12px] border border-[#E5E5E5] bg-white p-4"
                    >
                      <p className="text-[12px] font-semibold text-[#333333]">
                        {s.name}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: "base", hex: s.base },
                          { label: "soft", hex: s.soft },
                          { label: "ink", hex: s.ink },
                        ].map((row) => (
                          <div key={row.label} className="flex flex-col gap-1">
                            <div
                              className="h-10 rounded-[6px] border border-black/5"
                              style={{ backgroundColor: row.hex }}
                            />
                            <span className="text-[10px] font-medium text-[#333333]">
                              {row.label}
                            </span>
                            <span className="font-mono text-[9px] text-[#6E6E6E]">
                              {row.hex}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Role tokens */}
              <div>
                <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">
                  Role tokens
                </p>
                <p className="mb-4 max-w-[560px] text-[12px] leading-relaxed text-[#979797]">
                  The bridge between primitives and components. A bubble
                  references{" "}
                  <code className="font-mono text-[11px] text-[#555]">
                    var(--bg-paper)
                  </code>
                  , not{" "}
                  <code className="font-mono text-[11px] text-[#555]">
                    #F9F3EA
                  </code>{" "}
                  — so retheming is one CSS-variable change away.
                </p>
                <div className="flex flex-col gap-4">
                  {ROLE_GROUPS.map((group) => (
                    <div
                      key={group.name}
                      className="rounded-[12px] border border-[#E5E5E5] bg-white"
                    >
                      <p className="border-b border-[#E5E5E5] px-4 py-2.5 text-[11px] font-semibold tracking-wider text-[#333333] uppercase">
                        {group.name}
                      </p>
                      <div className="divide-y divide-[#E5E5E5]">
                        {group.tokens.map((t) => (
                          <div
                            key={t.token}
                            className="flex items-center gap-4 px-4 py-3"
                          >
                            <div
                              className="size-8 shrink-0 rounded-[6px] border border-black/5"
                              style={{ backgroundColor: t.hex }}
                            />
                            <div className="flex min-w-0 flex-1 flex-col">
                              <code className="font-mono text-[11px] font-semibold text-[#333333]">
                                {t.token}
                              </code>
                              <span className="text-[10px] text-[#979797]">
                                → {t.refers}{" "}
                                <span className="font-mono">{t.hex}</span>
                              </span>
                            </div>
                            <p className="hidden max-w-[280px] text-right text-[11px] text-[#6E6E6E] sm:block">
                              {t.use}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section
            id="spacing"
            title="Spacing"
            intro="4px base. Most chat gaps use 1–2 (4–8px) within a message, 3 (12px) between turns, 4 (16px) for card padding."
          >
            <div className="flex flex-col gap-6">
              {/* Scale */}
              <div className="rounded-[12px] border border-[#E5E5E5] bg-white">
                <div className="flex flex-col divide-y divide-[#E5E5E5]">
                  {SPACING.map((s) => (
                    <div
                      key={s.name}
                      className="flex items-center gap-4 px-4 py-2.5"
                    >
                      <span className="w-20 font-mono text-[11px] text-[#6E6E6E]">
                        {s.token}
                      </span>
                      <span className="w-12 text-[11px] font-semibold text-[#333333]">
                        {s.px}px
                      </span>
                      <div
                        className="h-3 shrink-0 rounded-[2px] bg-[#0A06A0]"
                        style={{ width: `${s.px}px` }}
                      />
                      {s.use && (
                        <p className="ml-auto max-w-[420px] text-right text-[11px] text-[#6E6E6E]">
                          {s.use}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Composition — message spacing */}
              <div>
                <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">
                  In context — message spacing
                </p>
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {/* Within an AI message group */}
                  <div className="flex flex-col gap-3 rounded-[12px] border border-[#E5E5E5] bg-white p-4">
                    <div>
                      <p className="text-[12px] font-semibold text-[#333333]">
                        Inside a single AI message
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#6E6E6E]">
                        Label, bubble, toolbar, and option list stack with{" "}
                        <code className="font-mono text-[11px] text-[#333333]">
                          --sp-1
                        </code>{" "}
                        (4px). Options themselves use{" "}
                        <code className="font-mono text-[11px] text-[#333333]">
                          --sp-1.5
                        </code>{" "}
                        (6px) between each other.
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 rounded-[8px] border border-[#E5E5E5] bg-[#FFFDFA] p-3">
                      <p className="text-[10px] font-medium text-[#6E6E6E]">
                        Tars • AI Agent
                      </p>
                      <div className="w-fit max-w-full rounded-tl-[10px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[4px] border border-[#E0DAD3] bg-[#F9F3EA] px-3 py-1.5 text-[11px] text-[#333333]">
                        I can help with that.
                      </div>
                      <div className="flex flex-col items-start gap-1.5 pt-1">
                        <button className="rounded-full border border-[#E0DAD3] bg-[#F9F3EA] px-3 py-1 text-[11px] text-[#333333]">
                          Talk to sales
                        </button>
                        <button className="rounded-full border border-[#E0DAD3] bg-[#F9F3EA] px-3 py-1 text-[11px] text-[#333333]">
                          I need support
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Between messages in history */}
                  <div className="flex flex-col gap-3 rounded-[12px] border border-[#E5E5E5] bg-white p-4">
                    <div>
                      <p className="text-[12px] font-semibold text-[#333333]">
                        Between history messages
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#6E6E6E]">
                        Consecutive turns (AI → user → AI) sit{" "}
                        <code className="font-mono text-[11px] text-[#333333]">
                          --sp-3
                        </code>{" "}
                        (12px) apart in the scroll list.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 rounded-[8px] border border-[#E5E5E5] bg-[#FFFDFA] p-3">
                      <div className="w-fit max-w-full rounded-tl-[10px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[4px] border border-[#E0DAD3] bg-[#F9F3EA] px-3 py-1.5 text-[11px] text-[#333333]">
                        I hear you — give me one moment.
                      </div>
                      <div className="ml-auto w-fit max-w-full rounded-tl-[10px] rounded-tr-[10px] rounded-br-[4px] rounded-bl-[10px] border border-[#A5B0EE] bg-[#E0E5FA] px-3 py-1.5 text-[11px] text-[#0A06A0]">
                        How long does it take?
                      </div>
                      <div className="w-fit max-w-full rounded-tl-[10px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[4px] border border-[#E0DAD3] bg-[#F9F3EA] px-3 py-1.5 text-[11px] text-[#333333]">
                        About 3–5 business days.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Section
            id="radius"
            title="Radius"
            intro="Asymmetric on bubbles (sharp corner faces the speaker). Pills for chips, 12px for cards/composer, 20px for the widget shell."
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {RADII.map((r) => (
                <div
                  key={r.name}
                  className="flex flex-col gap-2 rounded-[12px] border border-[#E5E5E5] bg-white p-3"
                >
                  <div
                    className="h-16 border border-[#E5E5E5] bg-[#F9F3EA]"
                    style={{ borderRadius: `${r.px}px` }}
                  />
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-[10px] text-[#6E6E6E]">
                      {r.token}
                    </span>
                    <span className="text-[11px] font-semibold text-[#333333]">
                      {r.px === 9999 ? "∞" : `${r.px}px`}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#979797]">{r.use}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section
            id="shadow"
            title="Shadow"
            intro="Stacked neutral greys. The widget itself uses sh-3 (four layers including an upward shadow so the halo wraps top + bottom)."
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SHADOWS.map((s) => (
                <div
                  key={s.name}
                  className="flex flex-col gap-3 rounded-[12px] border border-[#E5E5E5] bg-white p-4"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] font-semibold text-[#333333]">
                      {s.name}
                    </span>
                    <span className="text-[10px] text-[#979797]">{s.use}</span>
                  </div>
                  <div
                    className="h-20 rounded-[12px] bg-white"
                    style={{ boxShadow: s.css }}
                  />
                  <code className="block overflow-x-auto rounded-[6px] bg-[#F9F3EA] px-2 py-1.5 font-mono text-[10px] text-[#555]">
                    {s.css}
                  </code>
                </div>
              ))}
            </div>
          </Section>

          <Section
            id="components"
            title="Components"
            intro="Twelve components, built next. Each gets its own page with anatomy, states, do/don't, and live previews."
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {COMPONENTS.map((c) => {
                const ready = [
                  "header",
                  "ai-message",
                  "indicators",
                  "user-message",
                  "input-types",
                  "composer",
                  "human-agent",
                  "handoff",
                  "csat",
                  "error",
                  "launcher",
                  "history",
                ].includes(c.slug);
                const Wrap = ready ? "a" : "div";
                const props = ready
                  ? { href: `/design-system/components/${c.slug}` }
                  : {};
                return (
                  <Wrap
                    key={c.slug}
                    {...props}
                    className={`flex flex-col gap-1 rounded-[12px] border border-[#E5E5E5] bg-white p-4 transition-colors ${
                      ready ? "hover:bg-[#FFFDFA]" : ""
                    }`}
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="text-[13px] font-semibold text-[#333333]">
                        {c.name}
                      </span>
                      <span
                        className={`rounded-[4px] px-1.5 py-0.5 font-mono text-[9px] tracking-wider uppercase ${
                          ready
                            ? "bg-[#E0E5FA] text-[#0A06A0]"
                            : "bg-[#F9F3EA] text-[#979797]"
                        }`}
                      >
                        {ready ? "Ready" : "Soon"}
                      </span>
                    </div>
                    <p className="text-[12px] leading-relaxed text-[#6E6E6E]">
                      {c.note}
                    </p>
                  </Wrap>
                );
              })}
            </div>
          </Section>
        </div>

        <footer className="mt-20 border-t border-[#E5E5E5] pt-8 pb-12">
          <p className="text-[11px] text-[#979797]">
            Tars Messenger Design System · v0.1 · Foundation
          </p>
        </footer>
      </main>
    </div>
  );
}
