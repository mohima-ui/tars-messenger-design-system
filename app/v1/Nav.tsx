"use client";

import { ChevronDown } from "lucide-react";
import { GREEN, PURPLE } from "./ui";

const LINKS = [
  { label: "Platform", caret: true },
  { label: "Solutions", caret: true },
  { label: "AI Agents", caret: false },
  { label: "Resources", caret: true },
  { label: "Pricing", caret: false },
];

/* Sticky and translucent: it floats over both the light and the dark
   sections, so it carries its own white scrim rather than a solid fill. */
export function Nav() {
  return (
    <header className="sticky top-0 z-50">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-white/85 to-white/0 backdrop-blur-[2px]" />
      <div className="mx-auto flex h-[92px] w-full max-w-[1240px] items-center gap-10 px-6">
        <a href="#top" className="flex shrink-0 items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/tars-logomark.png" alt="" className="h-9 w-9 rounded-lg" />
          <span
            className="text-[26px] font-bold tracking-[0.02em]"
            style={{ color: PURPLE }}
          >
            TARS
          </span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href="#"
              className="flex items-center gap-1.5 text-[15px] font-semibold text-[#2F3037] transition-colors hover:text-[#6D28D9]"
            >
              {l.label}
              {l.caret && <ChevronDown className="h-4 w-4" strokeWidth={2.5} />}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <button
            className="rounded-lg px-6 py-3 text-[15px] font-semibold text-white shadow-sm transition-transform hover:-translate-y-px"
            style={{ backgroundColor: GREEN }}
          >
            Schedule a Demo
          </button>
          <button className="rounded-lg border border-black/10 bg-white px-6 py-3 text-[15px] font-semibold text-[#2F3037] shadow-sm transition-colors hover:bg-neutral-50">
            Sign up
          </button>
        </div>
      </div>
    </header>
  );
}
