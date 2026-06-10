"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Search, Component } from "lucide-react";

type NavItem = { label: string; href: string };
type NavGroup = { group: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    group: "Foundations",
    items: [
      { label: "Colors", href: "/design-system#color" },
      { label: "Typography", href: "/design-system#typography" },
      { label: "Spacing", href: "/design-system#spacing" },
      { label: "Border Radius", href: "/design-system#radius" },
      { label: "Shadows", href: "/design-system#shadow" },
    ],
  },
  {
    group: "Components",
    items: [
      { label: "Chatbot", href: "/design-system/components/chatbot" },
      { label: "Header", href: "/design-system/components/header" },
      { label: "AI Message", href: "/design-system/components/ai-message" },
      { label: "User Message", href: "/design-system/components/user-message" },
      { label: "Human Agent", href: "/design-system/components/human-agent" },
      { label: "Human Handoff", href: "/design-system/components/handoff" },
      { label: "Suggested Replies", href: "/design-system/components/suggested-replies" },
      { label: "CSAT", href: "/design-system/components/csat" },
      { label: "Error", href: "/design-system/components/error" },
      { label: "Launcher", href: "/design-system/components/launcher" },
      { label: "History", href: "/design-system/components/history" },
      { label: "Voice — Speech to text", href: "/design-system/components/voice-stt" },
      { label: "Voice — Text to speech", href: "/design-system/components/voice-tts" },
    ],
  },
  {
    group: "Guideline",
    items: [],
  },
];

function SidebarGroup({
  group,
  pathname,
  query,
}: {
  group: NavGroup;
  pathname: string;
  query: string;
}) {
  const [open, setOpen] = useState(true);
  const q = query.trim().toLowerCase();
  const items = q
    ? group.items.filter((i) => i.label.toLowerCase().includes(q))
    : group.items;

  if (q && items.length === 0) return null;

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase transition-colors hover:text-[#333333]"
      >
        <ChevronDown
          className="size-3.5 transition-transform"
          strokeWidth={2}
          style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}
        />
        {group.group}
      </button>
      {open && (
        <div className="mt-0.5 flex flex-col">
          {items.length === 0 ? (
            <span className="px-3 py-1.5 pl-9 text-[12px] italic text-[#979797]">
              Coming soon
            </span>
          ) : (
            items.map((item) => {
              // anchor links (foundations) share one route, so only exact route matches highlight
              const isCurrent = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-[6px] px-3 py-1.5 pl-3 text-[13px] transition-colors ${
                    isCurrent
                      ? "bg-[#F0E7FA] font-medium text-[#4A1F77]"
                      : "text-[#444] hover:bg-[#F9F3EA] hover:text-[#333333]"
                  }`}
                >
                  <Component
                    className="size-3.5 shrink-0"
                    strokeWidth={1.75}
                    style={{ color: isCurrent ? "#632E9A" : "#979797" }}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  return (
    <div className="flex min-h-screen bg-white">
      {/* sidebar */}
      <aside className="sticky top-0 flex h-screen w-[264px] shrink-0 flex-col border-r border-[#E3E3E3] bg-white">
        {/* brand */}
        <Link href="/design-system" className="flex items-center gap-2.5 px-4 py-4">
          <img src="/tars-logo-primary.png" alt="TARS" className="size-7 rounded-[6px] object-contain" />
          <span className="leading-tight tracking-tight">
            <span className="block text-[18px] font-semibold text-[#333333]">TARS Messenger</span>
            <span className="block text-[12px] font-medium text-[#6E6E6E]">Design System</span>
          </span>
        </Link>

        {/* search */}
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2 rounded-[8px] border border-[#E5E5E5] bg-white px-2.5 py-1.5">
            <Search className="size-3.5 text-[#979797]" strokeWidth={2} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find components"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-[#333333] outline-none placeholder:text-[#979797]"
            />
          </div>
        </div>

        {/* nav */}
        <nav className="flex-1 overflow-y-auto px-1 pb-6">
          {NAV.map((g) => (
            <SidebarGroup key={g.group} group={g} pathname={pathname} query={query} />
          ))}
        </nav>
      </aside>

      {/* content */}
      <main className="min-w-0 flex-1 overflow-x-auto">{children}</main>
    </div>
  );
}
