const LINE = "#E0DAD3";
const CHROME = "#E5E5E5";
const USER_BG = "#E0E5FA";
const USER_BORDER = "#A5B0EE";
const USER_TEXT = "#0A06A0";

function Bubble({ children, fullWidth }: { children: React.ReactNode; fullWidth?: boolean }) {
  return (
    <div className="flex justify-end">
      <div
        className={`rounded-tl-[12px] rounded-tr-[12px] rounded-br-[6px] rounded-bl-[12px] border px-[14px] py-[10px] text-[12px] leading-[1.45] ${
          fullWidth ? "w-full" : "max-w-[78%]"
        }`}
        style={{ backgroundColor: USER_BG, borderColor: USER_BORDER, color: USER_TEXT }}
      >
        {children}
      </div>
    </div>
  );
}

const ANATOMY = [
  { label: "Bubble container", token: "max-w-[78%] · rounded 12/12/6/12 · accent-border" },
  { label: "Content", token: "12/17 regular · accent-ink" },
  { label: "Alignment", token: "justify-end (right-aligned)" },
];

const SPECS = [
  { prop: "Background", value: "#E0E5FA", note: "--accent-soft (per tenant)" },
  { prop: "Border", value: "1px #A5B0EE", note: "--accent-border (per tenant)" },
  { prop: "Text", value: "#0A06A0", note: "--accent-ink (per tenant)" },
  { prop: "Font", value: "12 / 17 · 400", note: "Body S · Normal (1.45) · Regular" },
  { prop: "Padding", value: "px-[14px] py-[10px]", note: "Matches AI bubble" },
  { prop: "Max width", value: "78%", note: "Tighter than AI's 88% — typed messages are shorter" },
  { prop: "Radius", value: "12 · 12 · 6 (br) · 12", note: "Sharp corner anchors right (speaker side)" },
  { prop: "Alignment", value: "justify-end", note: "Right-aligned" },
  { prop: "Animation", value: "bubble-in 240ms", note: "No word streaming — typed messages appear whole" },
];

const STATES = [
  { name: "Rest", desc: "Only state — no hover, click, or toolbar. Speech is committed once sent." },
  { name: "Entrance", desc: "Bubble fades + slides up 6px over 240ms when added to the conversation." },
];

const TENANT_VARIANTS = [
  { name: "Global Payments", bg: "#E0E5FA", border: "#A5B0EE", text: "#0A06A0" },
  { name: "Vodafone", bg: "#FEE2E2", border: "#FCA5A5", text: "#A30000" },
  { name: "Amex", bg: "#DBF0FA", border: "#7DC8E8", text: "#006FA0" },
];

const DOS = [
  "Right-align user bubbles always — never centered or left.",
  "Use the tenant accent-soft/accent-border/accent-ink trio — never neutral fills.",
  "Allow long-pressing the bubble to copy the text (system default).",
];

const DONTS = [
  "Don't put a toolbar on user messages — actions are for AI replies.",
  "Don't show timestamps inside the bubble; if needed, place them above on hover.",
  "Don't deepen the fill to --accent — it competes with the send button.",
];

function StateRow({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="flex items-baseline gap-4 py-2.5">
      <span className="w-32 shrink-0 text-[12px] font-semibold text-[#333333]">{name}</span>
      <p className="text-[12px] leading-relaxed text-[#6E6E6E]">{desc}</p>
    </div>
  );
}

export default function UserMessagePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-[#E5E5E5] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between px-8 py-4">
          <div className="flex items-baseline gap-3">
            <a href="/design-system" className="text-[12px] text-[#6E6E6E] transition-colors hover:text-[#333333]">
              ← Foundation
            </a>
            <span className="text-[#D4D4D4]">/</span>
            <span className="text-[12px] font-medium text-[#333333]">Components</span>
            <span className="text-[#D4D4D4]">/</span>
            <span className="text-[12px] font-semibold text-[#333333]">User Message</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-8 py-12">
        <div className="mb-12 max-w-[640px]">
          <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Component</p>
          <h1 className="mt-2 text-[32px] leading-tight font-semibold tracking-tight text-[#333333]">User Message</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[#555]">
            The person speaks back. Brand-soft fill, brand-ink text — the only place in the
            conversation where accent color appears as a surface. Right-aligned, no toolbar,
            no streaming — typed words arrive in full.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {/* Preview */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Previews</p>
            <div className="grid grid-cols-1 gap-3 rounded-[14px] border bg-white p-6 lg:grid-cols-2" style={{ borderColor: CHROME }}>
              <div className="flex flex-col gap-2 rounded-[10px] border bg-white p-4" style={{ borderColor: CHROME }}>
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Short</p>
                <Bubble>How long does it take?</Bubble>
              </div>
              <div className="flex flex-col gap-2 rounded-[10px] border bg-white p-4" style={{ borderColor: CHROME }}>
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Multi-line</p>
                <Bubble>
                  I&apos;d like to check whether my refund went through, and if not, what the next steps would be.
                </Bubble>
              </div>
            </div>
          </section>

          {/* Tenant variants */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Tenant variants</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {TENANT_VARIANTS.map((t) => (
                <div key={t.name} className="flex flex-col gap-2 rounded-[12px] border bg-white p-4" style={{ borderColor: CHROME }}>
                  <p className="text-[12px] font-semibold text-[#333333]">{t.name}</p>
                  <div className="flex justify-end">
                    <div
                      className="max-w-[80%] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[6px] rounded-bl-[12px] border px-[14px] py-[10px] text-[12px] leading-[1.45]"
                      style={{ backgroundColor: t.bg, borderColor: t.border, color: t.text }}
                    >
                      How long does it take?
                    </div>
                  </div>
                  <div className="mt-1 flex flex-col gap-0.5 font-mono text-[9px] text-[#6E6E6E]">
                    <span>bg {t.bg}</span>
                    <span>border {t.border}</span>
                    <span>text {t.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Anatomy */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Anatomy</p>
            <div className="flex flex-col divide-y overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: CHROME }}>
              {ANATOMY.map((a, i) => (
                <div key={a.label} className="flex items-baseline gap-4 px-4 py-3">
                  <span className="w-6 font-mono text-[11px] text-[#979797]">{String(i + 1).padStart(2, "0")}</span>
                  <span className="w-56 shrink-0 text-[12px] font-semibold text-[#333333]">{a.label}</span>
                  <span className="text-[11px] text-[#6E6E6E]">{a.token}</span>
                </div>
              ))}
            </div>
          </section>

          {/* States */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">States</p>
            <div className="divide-y rounded-[12px] border bg-white px-4 py-2" style={{ borderColor: CHROME }}>
              {STATES.map((s) => (
                <StateRow key={s.name} name={s.name} desc={s.desc} />
              ))}
            </div>
          </section>

          {/* Specs */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Specs</p>
            <div className="flex flex-col divide-y overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: CHROME }}>
              {SPECS.map((s) => (
                <div key={s.prop} className="flex items-baseline gap-4 px-4 py-3">
                  <span className="w-48 shrink-0 text-[12px] font-semibold text-[#333333]">{s.prop}</span>
                  <code className="w-56 shrink-0 font-mono text-[11px] text-[#333333]">{s.value}</code>
                  <span className="text-[11px] text-[#6E6E6E]">{s.note}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Pairing with AI */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">In context</p>
            <div className="rounded-[14px] border bg-white p-6" style={{ borderColor: CHROME }}>
              <div className="flex flex-col gap-3 rounded-[10px] border bg-white p-4" style={{ borderColor: CHROME }}>
                <div className="flex justify-start">
                  <div className="max-w-[88%] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] rounded-bl-[6px] border px-[14px] py-[10px] text-[12px] leading-[1.55]" style={{ backgroundColor: "#F9F3EA", borderColor: LINE, color: "#333333" }}>
                    Refunds usually land in 3–5 business days.
                  </div>
                </div>
                <Bubble>How long does it take?</Bubble>
                <div className="flex justify-start">
                  <div className="max-w-[88%] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] rounded-bl-[6px] border px-[14px] py-[10px] text-[12px] leading-[1.55]" style={{ backgroundColor: "#F9F3EA", borderColor: LINE, color: "#333333" }}>
                    I&apos;ve queued the refund — you should see it shortly.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Do / Don't */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Guidance</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-[12px] border bg-white p-4" style={{ borderColor: CHROME }}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#E8F5EC] text-[11px] font-bold text-[#0F7A38]">✓</span>
                  <p className="text-[12px] font-semibold text-[#333333]">Do</p>
                </div>
                <ul className="flex flex-col gap-2">
                  {DOS.map((t) => (
                    <li key={t} className="text-[12px] leading-relaxed text-[#555]">{t}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[12px] border bg-white p-4" style={{ borderColor: CHROME }}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#FEE2E2] text-[11px] font-bold text-[#991B1B]">✕</span>
                  <p className="text-[12px] font-semibold text-[#333333]">Don&apos;t</p>
                </div>
                <ul className="flex flex-col gap-2">
                  {DONTS.map((t) => (
                    <li key={t} className="text-[12px] leading-relaxed text-[#555]">{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>

        <footer className="mt-20 flex items-center justify-between border-t pt-8 pb-12 text-[12px] text-[#979797]" style={{ borderColor: CHROME }}>
          <a href="/design-system/components/ai-message" className="transition-colors hover:text-[#333333]">← AI Message</a>
          <span>Next: Suggested Replies →</span>
        </footer>
      </main>
    </div>
  );
}
