const SAMPLE =
  "Yes — refunds are available within 30 days and you're well inside that window. I just pulled up the order; everything looks eligible. Want me to start the return for you?";

function CurrentBubble() {
  return (
    <div className="border-bubble-ai-border text-bubble-ai-foreground max-w-[80%] rounded-2xl rounded-bl-md border px-4 py-2.5 text-[15px] leading-relaxed">
      {SAMPLE}
    </div>
  );
}

function AccentBarBubble() {
  return (
    <div className="border-accent text-bubble-ai-foreground max-w-[80%] border-l-2 py-1 pl-4 text-[15px] leading-relaxed">
      {SAMPLE}
    </div>
  );
}

function GlowBubble() {
  return (
    <div
      className="border-bubble-ai-border text-bubble-ai-foreground max-w-[80%] rounded-2xl rounded-bl-md border px-4 py-2.5 text-[15px] leading-relaxed"
      style={{ boxShadow: "0 12px 32px -8px rgba(91, 91, 214, 0.28)" }}
    >
      {SAMPLE}
    </div>
  );
}

function FrostedBubble() {
  return (
    <div
      className="rounded-3xl p-6"
      style={{
        background:
          "linear-gradient(135deg, #EEF2FF 0%, #FAFAFA 45%, #F5EFFF 100%)",
      }}
    >
      <div className="text-bubble-ai-foreground max-w-[85%] rounded-2xl rounded-bl-md border border-white/60 bg-white/40 px-4 py-2.5 text-[15px] leading-relaxed backdrop-blur-md">
        {SAMPLE}
      </div>
    </div>
  );
}

function AvatarThreadBubble() {
  return (
    <div className="flex max-w-[85%] gap-3">
      <div className="bg-accent text-accent-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium">
        T
      </div>
      <div className="text-bubble-ai-foreground pt-1 text-[15px] leading-relaxed">
        {SAMPLE}
      </div>
    </div>
  );
}

function GradientStrokeBubble() {
  return (
    <div
      className="max-w-[80%] rounded-2xl rounded-bl-md p-[1.5px]"
      style={{
        background:
          "linear-gradient(135deg, var(--ds-accent) 0%, var(--n-200) 80%)",
      }}
    >
      <div className="bg-canvas text-bubble-ai-foreground rounded-2xl rounded-bl-md px-4 py-2.5 text-[15px] leading-relaxed">
        {SAMPLE}
      </div>
    </div>
  );
}

const variations: { id: string; label: string; note?: string; render: () => React.ReactElement }[] = [
  {
    id: "current",
    label: "01 · Current — stroke only",
    note: "Today's default. Light neutral border, transparent fill.",
    render: () => <CurrentBubble />,
  },
  {
    id: "accent-bar",
    label: "02 · Hairline + indigo accent bar",
    note: "No bubble, left edge brand bar. Content-first, scales well to long replies.",
    render: () => <AccentBarBubble />,
  },
  {
    id: "glow",
    label: "03 · Soft indigo glow",
    note: "Same shape as today + a low-opacity indigo drop-shadow. Ambient brand presence.",
    render: () => <GlowBubble />,
  },
  {
    id: "frosted",
    label: "04 · Frosted glass",
    note: "Semi-transparent + backdrop-blur. Shown on an ambient gradient so the effect is visible.",
    render: () => <FrostedBubble />,
  },
  {
    id: "avatar-thread",
    label: "05 · Avatar-led thread (no bubble)",
    note: "Avatar to the left, indented copy. Reads as a document, not a message log.",
    render: () => <AvatarThreadBubble />,
  },
  {
    id: "gradient-stroke",
    label: "06 · Gradient stroke",
    note: "Indigo-to-neutral 1.5px gradient border. Subtle premium signal without a glow.",
    render: () => <GradientStrokeBubble />,
  },
];

export default function VariationsPage() {
  return (
    <div className="bg-canvas min-h-screen px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-2xl">
        <header className="mb-12">
          <a
            href="/"
            className="text-muted-foreground hover:text-foreground mb-6 inline-block text-sm transition-colors"
          >
            ← Back to chat
          </a>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            AI bubble — variations
          </h1>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Same content, six treatments. Tell me which one (or which mix) you
            want as the new default and I&apos;ll wire it into{" "}
            <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
              MessageBubble
            </code>
            .
          </p>
        </header>

        <div className="flex flex-col gap-12">
          {variations.map((v) => (
            <section key={v.id}>
              <div className="mb-3 flex items-baseline justify-between gap-4">
                <div className="text-foreground text-sm font-medium">
                  {v.label}
                </div>
              </div>
              {v.note && (
                <p className="text-muted-foreground mb-4 text-xs leading-relaxed">
                  {v.note}
                </p>
              )}
              <div className="flex justify-start">{v.render()}</div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
