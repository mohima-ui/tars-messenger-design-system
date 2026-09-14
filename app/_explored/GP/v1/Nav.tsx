"use client";

import { ChevronDown, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { GP_ACCENT } from "./content";

const MENUS = [
  ["Take payments", true],
  ["Manage your business", true],
  ["Who we serve", true],
  ["Resources", true],
  ["Partners", false],
] as const;

/* The real site's header is two headers: a white one with a utility row at
   the top of the page, and a slimmer blue one that rides along once you've
   scrolled into the content. Same markup, two coats — the swap is just a
   class change on a scroll listener, and the utility row collapses because
   Help Centre and Log in are top-of-page errands. */
export function GpNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const ink = scrolled ? "text-white" : "text-[#14142b]";

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-200 ${
        scrolled ? "" : "bg-white"
      }`}
      style={scrolled ? { backgroundColor: GP_ACCENT } : undefined}
    >
      {/* Utility row — top of page only. */}
      {!scrolled && (
        <div className="mx-auto flex max-w-[1400px] items-center justify-end gap-8 px-8 pt-4 text-[15px] text-[#14142b]">
          <a href="#" className="hover:underline">Help Centre</a>
          <a href="#" className="hover:underline">Log in</a>
          <a href="#" className="hover:underline">Developers</a>
        </div>
      )}

      <div className="mx-auto flex h-[74px] max-w-[1400px] items-center justify-between gap-6 px-8">
        {/* The wordmark: a circled g, then global bold + payments light —
            close enough to read as the brand without borrowing its artwork. */}
        <a href="#" className={`flex items-baseline text-[26px] tracking-tight ${ink}`}>
          <span
            className={`mr-1 grid size-8 translate-y-1 place-items-center rounded-full border-2 text-[19px] font-bold ${
              scrolled ? "border-white" : "border-[#14142b]"
            }`}
            style={scrolled ? undefined : { color: GP_ACCENT, borderColor: GP_ACCENT }}
          >
            g
          </span>
          <span className="font-bold" style={scrolled ? undefined : { color: GP_ACCENT }}>
            lobal
          </span>
          <span className="font-light" style={scrolled ? undefined : { color: GP_ACCENT }}>
            payments
          </span>
        </a>

        <nav className={`hidden items-center gap-8 text-[16px] lg:flex ${ink}`}>
          {MENUS.map(([label, chevron]) => (
            <a key={label} href="#" className="flex items-center gap-1.5 whitespace-nowrap hover:opacity-70">
              {label}
              {chevron && (
                <ChevronDown
                  className="size-4"
                  strokeWidth={2.5}
                  style={scrolled ? undefined : { color: GP_ACCENT }}
                  aria-hidden
                />
              )}
            </a>
          ))}
        </nav>

        <div className={`flex items-center gap-6 ${ink}`}>
          <button aria-label="Search" className="hover:opacity-70">
            <Search className="size-5" strokeWidth={2.25} />
          </button>
          <a
            href="#"
            className={`rounded-full border px-7 py-3 text-[16px] font-medium transition-colors ${
              scrolled
                ? "border-white text-white hover:bg-white/10"
                : "border-[#14142b] text-[#14142b] hover:bg-black/5"
            }`}
          >
            Contact sales
          </a>
        </div>
      </div>
    </header>
  );
}
