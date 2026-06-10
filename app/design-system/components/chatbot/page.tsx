import { ChevronLeft, MoreVertical, Plus, Mic, X } from "lucide-react";

const LINE = "#E0DAD3";
const INK = "#333333";
const MUTED = "#6E6E6E";
const PAPER = "#F9F3EA";

/* ── bare chatbot shell: header · message area · composer ── */
function ChatbotShell() {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-[28px] border bg-[#FEFCF8]"
      style={{ width: 400, height: 680, borderColor: LINE, boxShadow: "0 12px 40px -8px rgba(0,0,0,0.18), 0 2px 10px rgba(0,0,0,0.06)" }}
    >
      {/* header */}
      <div className="flex h-[68px] w-full shrink-0 items-center gap-1 border-b px-4" style={{ borderColor: LINE }}>
        <div className="flex min-w-0 flex-1 items-center gap-1">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-[6px]" style={{ color: MUTED }}>
            <ChevronLeft className="size-5" strokeWidth={1.5} />
          </span>
          <img src="/tars-logomark.png" alt="" className="ml-0.5 size-[38px] shrink-0 rounded-[10px] object-cover" />
          <div className="ml-1.5 min-w-0">
            <p className="truncate text-[16px] font-semibold leading-tight" style={{ color: INK }}>Tars</p>
            <p className="mt-0.5 truncate text-[12px] leading-tight" style={{ color: MUTED }}>Virtual Assistant</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <span className="flex size-7 items-center justify-center rounded-[6px]" style={{ color: MUTED }}>
            <MoreVertical className="size-4" strokeWidth={1.5} />
          </span>
          <span className="flex size-7 items-center justify-center rounded-[6px]" style={{ color: MUTED }}>
            <X className="size-4" strokeWidth={1.5} />
          </span>
        </div>
      </div>

      {/* message area — empty */}
      <div className="flex-1" />

      {/* composer */}
      <div className="flex flex-col gap-1.5 px-3 pb-3 pt-2 shrink-0">
        <div className="flex w-full items-end gap-2 rounded-[16px] border px-3 py-2" style={{ borderColor: LINE, backgroundColor: PAPER }}>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-[6px]" style={{ color: MUTED }}>
            <Plus className="size-4" strokeWidth={1.5} />
          </span>
          <span className="min-w-0 flex-1 py-[5px] text-[14px] leading-[1.5]" style={{ color: "#979797" }}>
            Ask me anything...
          </span>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-[6px]" style={{ color: MUTED }}>
            <Mic className="size-4" strokeWidth={1.5} />
          </span>
        </div>
      </div>
    </div>
  );
}

const ANATOMY = [
  { label: "Header", token: "h-[68px] · back/history · avatar · agent name + caption · menu — border-bottom" },
  { label: "Message area", token: "flex-1 scrollable canvas — empty in the bare shell" },
  { label: "Composer", token: "Docked input — attach · field · mic, on paper surface" },
];

const SPECS = [
  { prop: "Panel", value: "400 × 680 · r-28", note: "--bg-surface #FEFCF8" },
  { prop: "Header height", value: "68px", note: "border-line bottom" },
  { prop: "Avatar", value: "38px · r-10", note: "Tenant agent avatar" },
  { prop: "Composer field", value: "r-16 · paper", note: "--bg-paper #F9F3EA · 1px border-line" },
  { prop: "Placeholder", value: "14px #979797", note: "“Ask me anything...”" },
];

export default function ChatbotPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <main className="mx-auto max-w-[1080px] px-8 py-12">
        <div className="mb-3 flex items-baseline gap-3">
          <span className="text-[12px] font-medium text-[#6E6E6E]">Components</span>
          <span className="text-[#D9D5CC]">/</span>
          <span className="text-[12px] font-semibold text-[#333333]">Chatbot</span>
        </div>
        <div className="mb-12 max-w-[640px]">
          <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Component</p>
          <h1 className="mt-2 text-[32px] leading-tight font-semibold tracking-tight text-[#333333]">Chatbot</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[#555]">
            The container that holds a conversation — nothing more. Header, a scrollable message
            area, and the composer. Everything else (messages, replies, voice, handoff) renders
            inside the message area.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {/* Preview */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Preview</p>
            <div className="flex justify-center overflow-x-auto rounded-[14px] border p-10" style={{ borderColor: LINE, backgroundImage: "linear-gradient(180deg, #FAFAFA 0%, #F0F0F0 100%)" }}>
              <ChatbotShell />
            </div>
          </section>

          {/* Anatomy */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Anatomy</p>
            <div className="flex flex-col divide-y overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: LINE }}>
              {ANATOMY.map((a, i) => (
                <div key={a.label} className="flex items-baseline gap-4 px-4 py-3">
                  <span className="w-6 font-mono text-[11px] text-[#979797]">{String(i + 1).padStart(2, "0")}</span>
                  <span className="w-40 shrink-0 text-[12px] font-semibold text-[#333333]">{a.label}</span>
                  <span className="text-[11px] text-[#6E6E6E]">{a.token}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Specs */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Specs</p>
            <div className="flex flex-col divide-y overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: LINE }}>
              {SPECS.map((s) => (
                <div key={s.prop} className="flex items-baseline gap-4 px-4 py-3">
                  <span className="w-44 shrink-0 text-[12px] font-semibold text-[#333333]">{s.prop}</span>
                  <code className="w-44 shrink-0 font-mono text-[11px] text-[#333333]">{s.value}</code>
                  <span className="text-[11px] text-[#6E6E6E]">{s.note}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
