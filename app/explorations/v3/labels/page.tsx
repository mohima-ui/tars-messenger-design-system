const AI_BUBBLE = "#F9F3EA";
const INK = "#333333";
const MUTED = "#6E6E6E";
const LINE = "#E0DAD3";
const ACCENT = "#A1593E";

const SAMPLE =
  "I hear you — give me one moment to look into that. I'll pull up your order and confirm the timing.";

function Option1() {
  return (
    <div className="flex flex-col items-start gap-1">
      <p
        className="ml-1 text-[11px] font-medium tracking-wide"
        style={{ color: MUTED }}
      >
        Tars <span className="text-[#A8A096]">· just now</span>
      </p>
      <div
        className="max-w-[300px] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] rounded-bl-[6px] border px-[14px] py-[10px] text-[12px] leading-[1.55]"
        style={{ backgroundColor: AI_BUBBLE, borderColor: LINE, color: INK }}
      >
        {SAMPLE}
      </div>
    </div>
  );
}

function Option2() {
  return (
    <div className="flex justify-start">
      <div
        className="flex max-w-[300px] items-start gap-2 rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] rounded-bl-[6px] border px-[14px] py-[10px] text-[12px] leading-[1.55]"
        style={{ backgroundColor: AI_BUBBLE, borderColor: LINE, color: INK }}
      >
        <span
          className="mt-[7px] size-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: ACCENT }}
          aria-hidden
        />
        <span>{SAMPLE}</span>
      </div>
    </div>
  );
}

function Option3() {
  return (
    <div className="relative inline-block max-w-[300px]">
      <span
        className="absolute -top-2 right-3 z-10 inline-flex items-center rounded-full border px-2 py-[2px] text-[10px] font-semibold tracking-wide uppercase"
        style={{
          backgroundColor: "white",
          borderColor: LINE,
          color: ACCENT,
        }}
      >
        Tars
      </span>
      <div
        className="rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] rounded-bl-[6px] border px-[14px] py-[10px] text-[12px] leading-[1.55]"
        style={{ backgroundColor: AI_BUBBLE, borderColor: LINE, color: INK }}
      >
        {SAMPLE}
      </div>
    </div>
  );
}

const variations = [
  {
    id: "1",
    title: "01 · Time-stamped persona",
    note: "Muted micro-label above the bubble. Reads like modern messaging apps. Anchors the conversation temporally.",
    render: () => <Option1 />,
  },
  {
    id: "2",
    title: "02 · Inline accent dot",
    note: "Brand-color dot at the start of the message, inside the bubble. Zero vertical cost. Subtlest signal.",
    render: () => <Option2 />,
  },
  {
    id: "3",
    title: "03 · Floating corner badge",
    note: "Small pill overlapping the top edge. Visible but out of the reading flow.",
    render: () => <Option3 />,
  },
];

export default function LabelsPage() {
  return (
    <div className="min-h-screen bg-[#FFFAF3] px-8 py-12">
      <div className="mx-auto max-w-[760px]">
        <header className="mb-12">
          <a
            href="/explorations/v3"
            className="mb-6 inline-block text-[12px] text-[#6E6E6E] transition-colors hover:text-[#333333]"
          >
            ← Back to /explorations/v3
          </a>
          <h1
            className="text-[24px] font-semibold tracking-tight"
            style={{ color: INK }}
          >
            AI message label — three directions
          </h1>
          <p
            className="mt-2 text-[14px] leading-relaxed"
            style={{ color: MUTED }}
          >
            Same bubble, three label treatments. Pick one and I&apos;ll wire it
            into /v3.
          </p>
        </header>

        <div className="flex flex-col gap-12">
          {variations.map((v) => (
            <section key={v.id}>
              <div className="mb-3">
                <p
                  className="text-[13px] font-semibold"
                  style={{ color: INK }}
                >
                  {v.title}
                </p>
                <p
                  className="mt-1 text-[12px] leading-relaxed"
                  style={{ color: MUTED }}
                >
                  {v.note}
                </p>
              </div>
              <div className="pt-3">{v.render()}</div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
