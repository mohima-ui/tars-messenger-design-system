import { Plus } from "lucide-react";

const LINE = "#E0DAD3";
const PAPER = "#F9F3EA";
const INK = "#333333";
const MUTED = "#6E6E6E";

const CHATS = [
  {
    id: "1",
    title: "Refund on order #GP-48291",
    preview: "I've queued the refund — you should see it shortly.",
    time: "Now",
    initial: "T",
    color: "#120BF4",
    unread: true,
  },
  {
    id: "2",
    title: "Talk to sales",
    preview: "Thanks for your interest — a teammate will reach out…",
    time: "2h",
    initial: "P",
    color: "#A1593E",
    unread: false,
  },
  {
    id: "3",
    title: "Integration question",
    preview: "Here's how the webhook payload looks for new orders…",
    time: "Yesterday",
    initial: "T",
    color: "#120BF4",
    unread: false,
  },
  {
    id: "4",
    title: "Password reset",
    preview: "Sent the reset link to your account email.",
    time: "May 18",
    initial: "T",
    color: "#120BF4",
    unread: false,
  },
];

function HistoryRow({
  chat,
}: {
  chat: (typeof CHATS)[number];
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 border-b border-[#EBE3D4] px-4 py-3 text-left transition-colors hover:bg-[#F9F3EA]"
    >
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-full border text-[12px] font-semibold text-[#555555]"
        style={{
          backgroundColor: "#F4EFE5",
          borderColor: "#E0DAD3",
        }}
      >
        {chat.initial}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-[13px] font-medium text-[#333333]">
            {chat.title}
          </p>
          <p className="shrink-0 text-[10px] font-medium text-[#979797]">
            {chat.time}
          </p>
        </div>
        <p className="truncate text-[12px] text-[#6E6E6E]">{chat.preview}</p>
      </div>
      {chat.unread && (
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: "#120BF4" }}
          aria-label="Unread"
        />
      )}
    </button>
  );
}

function HistoryPreview() {
  return (
    <div
      className="flex h-[480px] w-[400px] flex-col overflow-hidden rounded-[20px] border bg-[#FFFDFA]"
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
      <div className="flex-1 overflow-y-auto">
        {CHATS.map((c) => (
          <HistoryRow key={c.id} chat={c} />
        ))}
      </div>
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
      className="flex h-[300px] w-[400px] flex-col overflow-hidden rounded-[20px] border bg-[#FFFDFA]"
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
    </div>
  );
}

const ANATOMY = [
  { label: "Header bar", token: "Title 'History' (left) · New chat CTA (right)" },
  { label: "New chat CTA", token: "Pill · paper fill · line border · plus + 'New' label" },
  { label: "Row", token: "Avatar (size-9) · title + preview + time · 12px vertical padding" },
  { label: "Avatar", token: "size-9 round · paper fill · line border · neutral letter" },
  { label: "Title", token: "13 / 20 · 500 ink · single line, truncate" },
  { label: "Preview", token: "12 / 18 · 400 secondary · single line, truncate" },
  { label: "Time", token: "10 / 16 · 500 muted · relative ('Now', '2h', 'Yesterday', date)" },
  { label: "Unread dot", token: "size-2 round · --accent · trailing edge of the row" },
];

const SPECS = [
  { prop: "Row height", value: "≈64px", note: "py-3 (12px) × 2 + content (~40px)" },
  { prop: "Row padding", value: "px-4 py-3", note: "Same horizontal as header" },
  { prop: "Row gap", value: "gap-3", note: "12px between avatar and content" },
  { prop: "Row divider", value: "1px #F9F3EA", note: "Soft, paper-tinted hairline (lighter than --border-line)" },
  { prop: "Row hover", value: "#F9F3EA bg", note: "--bg-paper warm fill" },
  { prop: "Avatar bg", value: "#F4EFE5", note: "Light paper — same for every conversation" },
  { prop: "Avatar border", value: "1px #E0DAD3", note: "--border-line" },
  { prop: "Avatar text", value: "12 / 600 #555555", note: "Single uppercase initial · --text-label" },
  { prop: "Title", value: "13 · 500 · #333333", note: "Subtitle scale, medium, ink" },
  { prop: "Preview", value: "12 · 400 · #6E6E6E", note: "Body S, regular, secondary" },
  { prop: "Time", value: "10 · 500 · #979797", note: "Caption, medium, muted" },
  { prop: "Unread dot", value: "size-2 · --accent", note: "8px circle on trailing edge" },
  { prop: "New chat CTA", value: "rounded-full · px-2.5 py-1 · 11/600", note: "paper fill · line border · ink text + Plus icon" },
  { prop: "CTA hover", value: "bg #F0EBE0", note: "Warm hover fill (--bg-subtle)" },
];

const STATES = [
  { name: "Default", desc: "All past conversations listed, most recent first." },
  { name: "Hover", desc: "Row fills with --bg-paper (#F9F3EA). Cursor pointer." },
  { name: "Unread", desc: "Per-row 8px --accent dot on the trailing edge. Cleared once the user opens that chat." },
  { name: "Loading (first paint)", desc: "Skeleton rows: greyed avatar + two grey bars. Three skeleton entries." },
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
            title, last preview, relative time, unread dot. Continue where you left off;
            never start fresh.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {/* Preview */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Preview</p>
            <div className="flex flex-wrap justify-center gap-8 rounded-[14px] border bg-[#FAF6EE] p-8" style={{ borderColor: LINE }}>
              <div className="flex flex-col gap-3">
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Default</p>
                <HistoryPreview />
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Empty</p>
                <EmptyState />
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

          {/* States */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">States</p>
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
          <a href="/design-system/components/launcher" className="transition-colors hover:text-[#333333]">← Launcher</a>
          <a href="/design-system/components/voice-stt" className="transition-colors hover:text-[#333333]">Voice STT →</a>
        </footer>
      </main>
    </div>
  );
}
