import Link from "next/link";

const EXPLORATIONS: { href: string; title: string; note: string }[] = [
  {
    href: "/explorations/v2",
    title: "v2 — Glassy",
    note: "Glassmorphism chatbot. Translucent surfaces, blur, ambient gradients.",
  },
  {
    href: "/explorations/v3",
    title: "v3",
    note: "Earlier full chatbot exploration (see /explorations/v3/labels for label studies).",
  },
  {
    href: "/",
    title: "v4 — Beige Stroke (selected → now the root /)",
    note: "Warm opaque outlined chatbot. The chosen direction; lives at the root route.",
  },
  {
    href: "/explorations/v6",
    title: "v6",
    note: "Later chatbot exploration.",
  },
  {
    href: "/explorations/variations",
    title: "AI bubble variations",
    note: "Six bubble treatments compared side by side.",
  },
  {
    href: "/explorations/v1",
    title: "v1 — ChatWindow",
    note: "First component-based chat window (components/chat/*).",
  },
];

export default function ExplorationsPage() {
  return (
    <div className="min-h-screen bg-[#FFFAF3] px-8 py-16">
      <div className="mx-auto max-w-[760px]">
        <header className="mb-12">
          <Link
            href="/"
            className="mb-6 inline-block text-[12px] text-[#6E6E6E] transition-colors hover:text-[#333333]"
          >
            ← Back to main (v4)
          </Link>
          <h1 className="text-[26px] font-semibold tracking-tight text-[#333333]">
            Explorations
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-[#6E6E6E]">
            Archived chatbot variations and HTML examples. v4 (Beige Stroke) was
            selected and is now the main app at{" "}
            <code className="rounded bg-black/5 px-1.5 py-0.5 text-[12px]">/</code>
            ; the TARS Messenger design system is built from it.
          </p>
        </header>

        <div className="flex flex-col gap-4">
          {EXPLORATIONS.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className="group rounded-2xl border border-black/10 bg-white/60 px-5 py-4 transition-colors hover:border-black/20 hover:bg-white"
            >
              <div className="text-[15px] font-medium text-[#333333]">
                {e.title}
              </div>
              <div className="mt-1 text-[13px] leading-relaxed text-[#6E6E6E]">
                {e.note}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
