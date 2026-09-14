/* ─── Explored ────────────────────────────────────────────────────────────
   Everything that was tried and is not the answer.

   The repo ships two live routes — the design tool at /design and the
   tenant demo at /brightline — and then this, which is the record of how
   they were arrived at. Kept rather than deleted because the questions come
   back: someone asks why the launcher is a composer and not a button, or why
   the unread badge is a filled disc, and the honest answer is a page showing
   the eight that were drawn before it.

   Nothing in here is maintained. A route below may not match the shipping
   design, and that is the point of the folder. */

import Link from "next/link";

const GROUPS: { title: string; note: string; items: { href: string; name: string; note: string }[] }[] = [
  {
    title: "Labs",
    note: "One open question each, still useful to look at.",
    items: [
      { href: "/explored/design/unread-lab", name: "Unread indicators", note: "Eight ways to say something is waiting" },
      { href: "/explored/design/launcher-lab", name: "Launcher composition", note: "How button, greeting and suggestions sit together" },
      { href: "/explored/design/button-lab", name: "Button styles", note: "What the button itself looks like" },
      { href: "/explored/design/footer-lab", name: "Footer strip", note: "Disclaimer vs Powered by Tars" },
      { href: "/explored/design/floating", name: "Floating message", note: "A messenger with the messenger taken away" },
    ],
  },
  {
    title: "Tools",
    note: "Built alongside the design; not part of the handoff.",
    items: [
      { href: "/explored/configure", name: "Configure", note: "Contextual suggestions setup" },
      { href: "/explored/analytics", name: "Analytics", note: "Launcher funnel, per customer and per surface" },
      { href: "/explored/design", name: "Design tool — index", note: "Earlier version of /design" },
      { href: "/explored/design/v1", name: "Design tool v1", note: "The first pass" },
      { href: "/explored/design/case-study", name: "Case study", note: "The write-up" },
    ],
  },
  {
    title: "Composer launcher",
    note: "Six bets on the input-bar launcher, settled by /design.",
    items: [
      { href: "/explored/composer-launcher", name: "Base", note: "The original centred composer" },
      { href: "/explored/composer-launcher/v2", name: "v2", note: "Same page, different composer" },
      { href: "/explored/composer-launcher/v3", name: "v3", note: "A placement, not a variant" },
      { href: "/explored/composer-launcher/v4", name: "v4", note: "One thing changed — also /left and /right" },
      { href: "/explored/composer-launcher/v5", name: "v5", note: "Dark, so a light page cannot wash it out" },
      { href: "/explored/composer-launcher/v7", name: "v7", note: "White, everything else held still" },
    ],
  },
  {
    title: "Button launcher",
    note: "Five animation bets on the classic corner button.",
    items: [
      { href: "/explored/button-launcher/v1", name: "v1 — Orbit", note: "One small light going round it" },
      { href: "/explored/button-launcher/v2", name: "v2 — Pulse", note: "The same launcher, the opposite gesture" },
      { href: "/explored/button-launcher/v3", name: "v3 — Orbit prompts", note: "The starters become the animation" },
      { href: "/explored/button-launcher/v4", name: "v4 — Chip cycle", note: "A pill whose prompt changes" },
      { href: "/explored/button-launcher/v5", name: "v5 — Rise", note: "Starters climbing out one at a time" },
    ],
  },
  {
    title: "Earlier work",
    note: "Predates 3.0.",
    items: [
      { href: "/explored/design-system", name: "Design system", note: "Component pages, including launcher variants" },
      { href: "/explored/explorations", name: "Explorations", note: "v1 through v7 and the variations sheet" },
      { href: "/explored/v1", name: "Messenger v1", note: "The generative-UI demo" },
      { href: "/explored/web", name: "Web", note: "The same messenger on a clinic site" },
      { href: "/explored/widget-lab", name: "Widget lab", note: "Standalone widget sketches" },
      { href: "/explored/GP/v1", name: "Global Payments", note: "Tenant demo" },
    ],
  },
];

export default function Explored() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] px-8 py-12 text-[#27272A]">
      <header className="mx-auto mb-10 max-w-[880px]">
        <h1 className="text-[22px] font-semibold text-[#18181B]">Explored</h1>
        <p className="mt-1.5 max-w-[560px] text-[13px] leading-relaxed text-[#71717A]">
          The record of how Messenger 3.0 was arrived at. The two live routes are{" "}
          <Link href="/design" className="underline underline-offset-2">
            /design
          </Link>{" "}
          and{" "}
          <Link href="/brightline" className="underline underline-offset-2">
            /brightline
          </Link>
          . Nothing below is maintained.
        </p>
      </header>

      <div className="mx-auto flex max-w-[880px] flex-col gap-9">
        {GROUPS.map((g) => (
          <section key={g.title}>
            <div className="mb-3">
              <h2 className="text-[11px] font-semibold tracking-[0.08em] text-[#A1A1AA] uppercase">
                {g.title}
              </h2>
              <p className="mt-0.5 text-[12px] text-[#A1A1AA]">{g.note}</p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {g.items.map((i) => (
                <Link
                  key={i.href}
                  href={i.href}
                  className="rounded-xl border border-[#EAEAEF] bg-white px-4 py-3 transition-colors hover:border-[#D9D9E3]"
                >
                  <div className="text-[13.5px] font-medium text-[#18181B]">{i.name}</div>
                  <div className="mt-0.5 text-[12px] text-[#A1A1AA]">{i.note}</div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
