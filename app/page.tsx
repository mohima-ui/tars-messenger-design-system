/* The way in.

   Two routes ship and this is the page that says so. It replaced a 2,400-line
   demo that happened to be sitting at the root — which meant anyone opening
   the project landed on something that was never part of the handoff and had
   to be told which URL to go to instead. That demo is still here, in
   _explored/starter. */

import Link from "next/link";

const ROUTES = [
  {
    href: "/design",
    name: "Design",
    note: "The design tool. Both launcher styles, three placements, six visitor states, three devices — this is the design being handed over.",
  },
  {
    href: "/brightline",
    name: "Brightline",
    note: "The same launcher on a customer's own site, screen-captured. What a tenant looks like in practice: one accent, one content pack.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] px-8 py-16 text-[#27272A]">
      <div className="mx-auto max-w-[640px]">
        <h1 className="text-[22px] font-semibold text-[#18181B]">
          Tars Messenger 3.0
        </h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-[#71717A]">
          The launcher and messenger design, and one tenant demo of it.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {ROUTES.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="rounded-xl border border-[#EAEAEF] bg-white px-5 py-4 transition-colors hover:border-[#D9D9E3]"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-[15px] font-medium text-[#18181B]">
                  {r.name}
                </span>
                <span className="text-[12px] text-[#A1A1AA]">{r.href}</span>
              </div>
              <p className="mt-1 text-[12.5px] leading-relaxed text-[#71717A]">
                {r.note}
              </p>
            </Link>
          ))}
        </div>

        {/* Said here rather than left to be discovered: a developer opening
            this repo will find a folder of thirty routes that do not build,
            and the useful thing is knowing on the first screen that it is
            deliberate. */}
        <p className="mt-8 text-[12.5px] leading-relaxed text-[#A1A1AA]">
          Everything tried on the way here is kept in{" "}
          <code className="rounded bg-[#F0F0F3] px-1 py-0.5 text-[11.5px] text-[#52525B]">
            app/_explored
          </code>{" "}
          — out of routing, so it is not built or deployed. Its README says how
          to bring a route back.
        </p>
      </div>
    </main>
  );
}
