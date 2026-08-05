import { ChatbotShell } from "@/components/chat/ChatbotShell";

const CHROME = "#E5E5E5";

const ANATOMY = [
  { label: "Header", token: "h-16 · back/history · avatar · agent name + caption · menu — border-bottom" },
  { label: "Message area", token: "flex-1 scrollable canvas — empty in the bare shell" },
  { label: "Composer", token: "Docked input — attach · field · mic/send, on paper surface" },
  { label: "Powered by", token: "“powered by TARS” under the composer — hidden with poweredBy={false}" },
];

const SPECS = [
  { prop: "Panel", value: "400 × 712 · r-40", note: "--bg-surface #FEFCF8" },
  { prop: "Elevation", value: "--ds-shadow-xl", note: "4-layer cast — floating over the host page" },
  { prop: "Header height", value: "80px", note: "1px #EBE7E3 divider" },
  { prop: "Avatar", value: "40px · r-10", note: "Tenant agent avatar" },
  { prop: "Composer field", value: "r-16 · paper", note: "--bg-paper #F9F3EA · 1px border-line" },
  { prop: "Placeholder", value: "14px #979797", note: "“Ask me anything...”" },
  { prop: "Powered by", value: "10px/16", note: "MUTED label · “TARS” bold in ink" },
];

export default function ChatbotPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-[1080px] px-8 py-12">
        <div className="mb-3 flex items-baseline gap-3">
          <span className="text-[12px] font-medium text-[#6E6E6E]">Components</span>
          <span className="text-[#D4D4D4]">/</span>
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
            <div className="flex justify-center overflow-x-auto rounded-[14px] border p-10" style={{ borderColor: CHROME, backgroundColor: "#FFFFFF" }}>
              <ChatbotShell />
            </div>
          </section>

          {/* Anatomy */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Anatomy</p>
            <div className="flex flex-col divide-y overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: CHROME }}>
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
            <div className="flex flex-col divide-y overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: CHROME }}>
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
