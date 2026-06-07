import { MessageCircle, X } from "lucide-react";

const LINE = "#E0DAD3";
const PAPER = "#F9F3EA";
const INK = "#333333";
const MUTED = "#6E6E6E";
const ACCENT = "#120BF4";
const ACCENT_INK = "#0A06A0";

function LauncherButton({ withBadge }: { withBadge?: boolean }) {
  return (
    <button
      type="button"
      className="relative flex size-14 items-center justify-center rounded-full text-white transition-all duration-200 will-change-transform hover:-translate-y-0.5"
      style={{
        backgroundColor: ACCENT,
        boxShadow:
          "0 4px 12px -3px rgba(18,11,244,0.35), 0 8px 24px -6px rgba(0,0,0,0.12)",
      }}
      aria-label="Open chat"
    >
      <MessageCircle className="size-6" strokeWidth={1.75} />
      {withBadge && (
        <span
          className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white"
          style={{ backgroundColor: "#DC2626" }}
        >
          1
        </span>
      )}
    </button>
  );
}

function Tease({ onDismiss }: { onDismiss?: () => void }) {
  return (
    <div
      className="flex max-w-[260px] items-start gap-2 rounded-[14px] border bg-white p-3"
      style={{
        borderColor: LINE,
        boxShadow:
          "0 4px 12px -3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <img
        src="/global-payments-avatar.png"
        alt="Tars"
        className="size-7 shrink-0 rounded-full object-cover"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-[11px] font-semibold text-[#333333]">Tars</p>
        <p className="text-[11px] leading-[1.45] text-[#555]">
          Hey there — looking to learn more? I can help.
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="flex size-5 shrink-0 items-center justify-center rounded-[4px] text-[#979797] transition-colors hover:bg-[#F0EBE0] hover:text-[#333333]"
        aria-label="Dismiss"
      >
        <X className="size-3" strokeWidth={2} />
      </button>
    </div>
  );
}

function CornerScene({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative h-[280px] overflow-hidden rounded-[14px] border"
      style={{
        borderColor: LINE,
        backgroundImage:
          "linear-gradient(180deg, #FAF6EE 0%, #F1EADD 100%)",
      }}
    >
      <div className="absolute right-5 bottom-5 flex flex-col items-end gap-3">
        {children}
      </div>
    </div>
  );
}

const ANATOMY = [
  { label: "Bubble button", token: "size-14 round · accent fill · MessageCircle icon" },
  { label: "Soft shadow", token: "0 4px 12px accent/35 + 0 8px 24px black/12" },
  { label: "Tease card", token: "Avatar + name + line — 260px max · paired with button on first load" },
  { label: "Dismiss", token: "X · size-5 · top-right of tease" },
  { label: "Unread badge", token: "size-4 circle · danger fill · white border ring" },
];

const SPECS = [
  { prop: "Button size", value: "size-14", note: "56px — standard FAB" },
  { prop: "Button bg", value: "--accent", note: "#120BF4 default · per-tenant" },
  { prop: "Icon", value: "MessageCircle size-6", note: "Lucide · strokeWidth 1.75" },
  { prop: "Shadow", value: "accent/35 + black/12", note: "Layered: accent glow + neutral lift" },
  { prop: "Hover", value: "translateY(-2px)", note: "Subtle lift, 200ms" },
  { prop: "Tease bg", value: "#FFFFFF", note: "--bg-surface" },
  { prop: "Tease border", value: "1px #E0DAD3", note: "--border-line" },
  { prop: "Tease padding", value: "p-3", note: "12px all sides" },
  { prop: "Tease text", value: "11 / 16 · 400", note: "Body, single line preferred" },
  { prop: "Badge", value: "size-4 #DC2626", note: "--danger · white border ring" },
];

const STATES = [
  { name: "Asleep (default)", desc: "Just the bubble. No tease. The chat is closed." },
  { name: "Tease (first visit)", desc: "Tease bubble appears once next to the launcher with a welcome line. Dismissable; never repeats." },
  { name: "Hover", desc: "Button lifts 2px. Tease card stays static." },
  { name: "Unread", desc: "Red badge with count appears top-right of the button when the agent has replied since the user last opened the chat." },
  { name: "Open", desc: "Button morphs into the chat widget (or the chat slides up over it). Launcher hides while open." },
];

const DOS = [
  "Show the tease at most once per session — then sleep.",
  "Place bottom-right; respect 24px breathing room from page edges.",
  "Use the brand --accent as the fill — this is the only place it appears at full saturation alongside the User bubble.",
  "Animate the unread badge in with a soft pop, not a flash.",
];

const DONTS = [
  "Don't replay the tease every page load — it trains users to dismiss.",
  "Don't put the launcher above the fold or in unusual corners.",
  "Don't add a 'Chat now' label permanently — the icon is universal.",
  "Don't pulse continuously — quiet at rest, loud only on real activity.",
];

function StateRow({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="flex items-baseline gap-4 py-2.5">
      <span className="w-44 shrink-0 text-[12px] font-semibold text-[#333333]">{name}</span>
      <p className="text-[12px] leading-relaxed text-[#6E6E6E]">{desc}</p>
    </div>
  );
}

export default function LauncherPage() {
  return (
    <div className="min-h-screen bg-[#FFFDFA]">
      <header className="sticky top-0 z-10 border-b border-[#E0DAD3] bg-[#FFFDFA]/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between px-8 py-4">
          <div className="flex items-baseline gap-3">
            <a href="/design-system" className="text-[12px] text-[#6E6E6E] transition-colors hover:text-[#333333]">
              ← Foundation
            </a>
            <span className="text-[#D9D5CC]">/</span>
            <span className="text-[12px] font-medium text-[#333333]">Components</span>
            <span className="text-[#D9D5CC]">/</span>
            <span className="text-[12px] font-semibold text-[#333333]">Launcher</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-8 py-12">
        <div className="mb-12 max-w-[640px]">
          <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Component</p>
          <h1 className="mt-2 text-[32px] leading-tight font-semibold tracking-tight text-[#333333]">Launcher</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[#555]">
            The bubble at rest. A tease appears once, then sleeps. Quiet by default —
            loud only when the user is actually being talked to. Always bottom-right, always
            brand-accent.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {/* States */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">States</p>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Asleep</p>
                <CornerScene>
                  <LauncherButton />
                </CornerScene>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Tease (first visit)</p>
                <CornerScene>
                  <Tease />
                  <LauncherButton />
                </CornerScene>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Unread</p>
                <CornerScene>
                  <LauncherButton withBadge />
                </CornerScene>
              </div>
            </div>
          </section>

          {/* Anatomy */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Anatomy</p>
            <div className="flex flex-col divide-y overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: LINE }}>
              {ANATOMY.map((a, i) => (
                <div key={a.label} className="flex items-baseline gap-4 px-4 py-3">
                  <span className="w-6 font-mono text-[11px] text-[#979797]">{String(i + 1).padStart(2, "0")}</span>
                  <span className="w-56 shrink-0 text-[12px] font-semibold text-[#333333]">{a.label}</span>
                  <span className="text-[11px] text-[#6E6E6E]">{a.token}</span>
                </div>
              ))}
            </div>
          </section>

          {/* State details */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">State details</p>
            <div className="divide-y rounded-[12px] border bg-white px-4 py-2" style={{ borderColor: LINE }}>
              {STATES.map((s) => (
                <StateRow key={s.name} name={s.name} desc={s.desc} />
              ))}
            </div>
          </section>

          {/* Specs */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Specs</p>
            <div className="flex flex-col divide-y overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: LINE }}>
              {SPECS.map((s) => (
                <div key={s.prop} className="flex items-baseline gap-4 px-4 py-3">
                  <span className="w-48 shrink-0 text-[12px] font-semibold text-[#333333]">{s.prop}</span>
                  <code className="w-56 shrink-0 font-mono text-[11px] text-[#333333]">{s.value}</code>
                  <span className="text-[11px] text-[#6E6E6E]">{s.note}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Do / Don't */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Guidance</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-[12px] border bg-white p-4" style={{ borderColor: LINE }}>
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
              <div className="rounded-[12px] border bg-white p-4" style={{ borderColor: LINE }}>
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

        <footer className="mt-20 flex items-center justify-between border-t pt-8 pb-12 text-[12px] text-[#979797]" style={{ borderColor: LINE }}>
          <a href="/design-system/components/error" className="transition-colors hover:text-[#333333]">← Error</a>
          <a href="/design-system/components/history" className="transition-colors hover:text-[#333333]">History →</a>
        </footer>
      </main>
    </div>
  );
}
