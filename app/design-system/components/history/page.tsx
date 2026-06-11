import { Plus, MessageSquare, HelpCircle, Search, ChevronRight } from "lucide-react";

const LINE = "#E0DAD3";
const CHROME = "#E5E5E5";
const PAPER = "#F9F3EA";
const INK = "#333333";
const MUTED = "#6E6E6E";
const ACCENT = "#632E9A";

const CHATS = [
  { id: "1", title: "mohimathapa@gmail.com", preview: "You: thanks, all sorted — really appreciate the quick help!", time: "Now", initial: "M", selected: true, group: "Today" },
  { id: "2", title: "s.chen@gmail.com", preview: "Tars: here are the differences between Pro and Studio…", time: "2h", initial: "S", selected: false, group: "Today" },
  { id: "3", title: "j.rivera@gmail.com", preview: "Priya: I've added the DNS records on our side now.", time: "Yesterday", initial: "J", selected: false, group: "Earlier" },
  { id: "4", title: "alex.kim@gmail.com", preview: "Tars: Sent the reset link to your account email a moment ago.", time: "May 18", initial: "A", selected: false, group: "Earlier" },
];

const GROUPS = ["Today", "Earlier"];

function HistoryRow({
  chat,
}: {
  chat: (typeof CHATS)[number];
}) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-3 rounded-[12px] px-2.5 py-2.5 text-left transition-colors ${chat.selected ? "bg-[#F9F3EA]" : "hover:bg-[#F9F3EA]"}`}
    >
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-full border text-[12px] font-semibold"
        style={{ backgroundColor: "#E0DAD3", borderColor: LINE, color: INK }}
      >
        {chat.initial}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-[13px] font-medium" style={{ color: INK }}>
            {chat.title}
          </p>
          <span className="shrink-0 text-[10px] font-medium" style={{ color: "#A8A096" }}>{chat.time}</span>
        </div>
        <p className="truncate text-[12px]" style={{ color: MUTED }}>{chat.preview}</p>
      </div>
    </button>
  );
}

function HistoryPreview() {
  return (
    <div
      className="flex h-[680px] w-[400px] flex-col overflow-hidden rounded-[20px] border bg-[#FFFDFA]"
      style={{
        borderColor: "#D9D5CC",
        boxShadow:
          "0 4px 12px -3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <header className="flex items-center justify-between border-b border-[#EBE3D4] px-4 py-4">
        <p className="text-[18px] leading-6 font-semibold text-[#333333]">
          History
        </p>
        <NewChatCta />
      </header>
      <div className="flex-1 overflow-y-auto px-2 py-1.5">
        {GROUPS.map((g) => (
          <div key={g} className="mb-1">
            <p className="px-2.5 pt-2.5 pb-1 text-[10px] font-semibold tracking-wider uppercase" style={{ color: "#A8A096" }}>{g}</p>
            {CHATS.filter((c) => c.group === g).map((c) => (
              <HistoryRow key={c.id} chat={c} />
            ))}
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}

function NavTab({ Icon, label, active }: { Icon: typeof MessageSquare; label: string; active?: boolean }) {
  return (
    <button type="button" className="flex flex-1 flex-col items-center gap-1 rounded-[8px] py-1 transition-colors">
      <Icon className="size-5" strokeWidth={active ? 2.25 : 1.75} style={{ color: active ? ACCENT : "#A8A096" }} />
      <span className={`text-[10px] ${active ? "font-semibold" : "font-medium"}`} style={{ color: active ? ACCENT : "#A8A096" }}>{label}</span>
    </button>
  );
}

function BottomNav({ active = "messages" }: { active?: "messages" | "help" }) {
  return (
    <div className="flex shrink-0 items-center justify-around border-t border-[#EBE3D4] px-2 py-2">
      <NavTab Icon={MessageSquare} label="Messages" active={active === "messages"} />
      <NavTab Icon={HelpCircle} label="Help" active={active === "help"} />
    </div>
  );
}

const HELP_LINKS = [
  { label: "Getting started guide", href: "https://docs.hellotars.com/" },
  { label: "Schedule a demo", href: "https://hellotars.com/demo" },
  { label: "AI agent templates", href: "https://hellotars.com/ai-agents" },
  { label: "Community", href: "https://discord.com/invite/2tGHGm8kt7" },
];

function HelpState() {
  return (
    <div
      className="flex h-[680px] w-[400px] flex-col overflow-hidden rounded-[20px] border bg-[#FFFDFA]"
      style={{ borderColor: "#D9D5CC", boxShadow: "0 4px 12px -3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)" }}
    >
      <header className="flex items-center justify-between border-b border-[#EBE3D4] px-4 py-4">
        <p className="text-[18px] leading-6 font-semibold text-[#333333]">Help</p>
      </header>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        {/* search */}
        <div className="flex items-center gap-2 rounded-[10px] border px-3 py-2.5" style={{ borderColor: LINE, backgroundColor: "#FFFFFF" }}>
          <Search className="size-4 shrink-0" strokeWidth={2} style={{ color: MUTED }} />
          <span className="text-[13px]" style={{ color: "#A8A096" }}>Search for help</span>
        </div>
        {/* video */}
        <div className="aspect-video w-full overflow-hidden rounded-[12px] border" style={{ borderColor: LINE }}>
          <iframe
            className="size-full"
            src="https://www.youtube.com/embed/yLPNYoRxhtE"
            title="Getting started with Tars"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {/* links */}
        <div className="flex flex-col gap-1">
          {HELP_LINKS.map(({ label, href }) => {
            const cls = "flex w-full items-center gap-3 rounded-[12px] px-2.5 py-2.5 text-left transition-colors hover:bg-[#F9F3EA]";
            const inner = (
              <>
                <span className="flex-1 truncate text-[13px] font-medium" style={{ color: INK }}>{label}</span>
                <ChevronRight className="size-4 shrink-0" strokeWidth={2} style={{ color: "#A8A096" }} />
              </>
            );
            return href ? (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
            ) : (
              <button key={label} type="button" className={cls}>{inner}</button>
            );
          })}
        </div>
      </div>
      <BottomNav active="help" />
    </div>
  );
}

function NewChatCta() {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 rounded-full border bg-[#F9F3EA] px-2.5 py-1 text-[11px] font-semibold text-[#333333] transition-colors hover:bg-[#F0EBE0]"
      style={{ borderColor: "#E0DAD3" }}
      aria-label="New chat"
    >
      <Plus className="size-3" strokeWidth={2.25} />
      New
    </button>
  );
}

function EmptyState() {
  return (
    <div
      className="flex h-[680px] w-[400px] flex-col overflow-hidden rounded-[20px] border bg-[#FFFDFA]"
      style={{
        borderColor: "#D9D5CC",
        boxShadow:
          "0 4px 12px -3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <header className="flex items-center justify-between border-b border-[#EBE3D4] px-4 py-4">
        <p className="text-[18px] leading-6 font-semibold text-[#333333]">
          History
        </p>
        <NewChatCta />
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
        <p className="text-[13px] font-semibold text-[#333333]">No conversations yet</p>
        <p className="text-[12px] leading-relaxed text-[#6E6E6E]">
          Start a chat and your conversations will live here — easy to pick up
          where you left off.
        </p>
      </div>
      <BottomNav />
    </div>
  );
}

const ANATOMY = [
  { label: "Header bar", token: "Title 'History' (left) · New chat CTA (right)" },
  { label: "Group header", token: "10px · 600 · uppercase · muted (Today / Earlier)" },
  { label: "Row", token: "rounded-[12px] inset · avatar + content · px-2.5 py-2.5" },
  { label: "Avatar", token: "size-8 round · #E0DAD3 fill · line border · ink letter" },
  { label: "Title", token: "Visitor email · 13 · medium · ink · truncate" },
  { label: "Preview", token: "12 · 400 secondary · full-width · single line, truncate" },
  { label: "Time", token: "10px muted · top-right of the row" },
  { label: "Bottom nav", token: "Messages · Help · icon + label, active in --accent" },
];

const SPECS = [
  { prop: "Row", value: "rounded-[12px] · px-2.5 py-2.5", note: "Inset rounded — no hard dividers" },
  { prop: "Row hover", value: "#F9F3EA bg", note: "--bg-paper warm fill" },
  { prop: "Row selected", value: "#F9F3EA bg", note: "Same fill as hover, persistent" },
  { prop: "Row gap", value: "gap-3", note: "12px between avatar and content" },
  { prop: "Group header", value: "10 · 600 · uppercase #A8A096", note: "Today / Yesterday / Earlier" },
  { prop: "Avatar", value: "size-8 · #E0DAD3 · 1px #E0DAD3", note: "Letter #333333 (--text-ink)" },
  { prop: "Title", value: "13 · 500 · #333333", note: "Medium, ink, single line" },
  { prop: "Preview", value: "12 · 400 · #6E6E6E", note: "Full-width, single line, truncate" },
  { prop: "Time", value: "10 · 500 · #A8A096", note: "Relative, then absolute date" },
  { prop: "Bottom nav", value: "Messages / Help", note: "Active tab in --accent (#632E9A)" },
  { prop: "New chat CTA", value: "rounded-full · px-2.5 py-1 · 11/600", note: "paper fill · line border · Plus + 'New'" },
];

const STATES = [
  { name: "Default", desc: "Conversations grouped by recency (Today / Earlier), most recent first within each group." },
  { name: "Hover", desc: "Row lifts to --bg-paper (#F9F3EA) with rounded corners." },
  { name: "Selected", desc: "The open conversation keeps the same #F9F3EA fill, persistently." },
  { name: "Empty", desc: "Centered copy: 'No conversations yet' + helper line. No icon, no illustration." },
];

const DOS = [
  "Sort by most recent activity, not creation date.",
  "Show a relative time ('Now', '2h', 'Yesterday') for items <7d; switch to absolute date older.",
  "Reuse the header component spec for consistency — same chevron, same close.",
  "Resume conversations in-place — keep the existing thread, never start fresh.",
];

const DONTS = [
  "Don't add filters or search at the row level — too noisy for a widget.",
  "Don't show timestamps on the row in absolute form when relative reads better.",
  "Don't paginate — the widget is for active recall, not archive browsing.",
  "Don't show 'delete' affordances on hover — destructive options belong in row-level overflow menu, not the list view.",
];

function StateRow({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="flex items-baseline gap-4 py-2.5">
      <span className="w-44 shrink-0 text-[12px] font-semibold text-[#333333]">{name}</span>
      <p className="text-[12px] leading-relaxed text-[#6E6E6E]">{desc}</p>
    </div>
  );
}

export default function HistoryPage() {
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
            <span className="text-[12px] font-semibold text-[#333333]">History</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-8 py-12">
        <div className="mb-12 max-w-[640px]">
          <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Component</p>
          <h1 className="mt-2 text-[32px] leading-tight font-semibold tracking-tight text-[#333333]">History</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[#555]">
            Past conversations as gentle entries. Each row is one resumable thread — avatar,
            the visitor&apos;s email, last preview, and relative time. Continue where you left
            off; never start fresh.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {/* Preview */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Preview</p>
            <div className="flex flex-wrap justify-center gap-8 rounded-[14px] border bg-white p-8" style={{ borderColor: CHROME }}>
              <div className="flex flex-col gap-3">
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Default</p>
                <HistoryPreview />
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Empty</p>
                <EmptyState />
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Help</p>
                <HelpState />
              </div>
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
          <a href="/design-system/components/launcher" className="transition-colors hover:text-[#333333]">← Launcher</a>
          <a href="/design-system" className="transition-colors hover:text-[#333333]">All components →</a>
        </footer>
      </main>
    </div>
  );
}
