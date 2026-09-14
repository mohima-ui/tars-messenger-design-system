"use client";

/* ─── Dashboard rails ─────────────────────────────────────────────────────
   The two fixed sidebars, shared by every section that sits behind them. */

import {
  Activity,
  BarChart3,
  BookOpen,
  Bot,
  ChevronRight,
  LayoutGrid,
  Megaphone,
  MessagesSquare,
  Palette,
  PanelLeft,
  Settings,
  Share2,
  Users,
  Wrench,
} from "lucide-react";

function RailIcon({
  Icon,
  active,
  label,
  onClick,
}: {
  Icon: typeof Bot;
  active?: boolean;
  label?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-current={active ? "page" : undefined}
      className={`grid size-9 place-items-center rounded-lg transition-colors ${
        active
          ? "bg-[#F1ECFB] text-[#7C3AED]"
          : "text-[#6E6E6E] hover:bg-[#F0F0F0]"
      }`}
    >
      <Icon className="size-[18px]" strokeWidth={1.9} />
    </button>
  );
}

function RailDivider() {
  return <div className="my-1 h-px w-7 self-center bg-[#ECECEC]" />;
}

/* The section rail is the real navigation: Configure and Design are siblings
   in the product, so moving between them is a rail click.

   One component for both, because two copies of the same two rails is exactly
   how they drifted apart — the sidebar must not change when you cross between
   sections, so there is only one of it. `section` moves the highlight; nothing
   else about the rails differs. */
type Section = "design" | "configure" | "analytics";

export function DashboardRails({
  section,
  onNavigate,
}: {
  section: Section;
  onNavigate: (s: Section) => void;
}) {
  return (
    <div className="flex h-full shrink-0">
      {/* primary rail */}
      <nav className="flex w-[60px] flex-col items-center gap-1.5 border-r border-[#ECECEC] bg-[#FAFAFA] py-3">
        <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] text-white shadow-sm">
          <Bot className="size-[18px]" strokeWidth={2} />
        </div>
        <RailIcon Icon={PanelLeft} />
        <RailDivider />
        <RailIcon Icon={Bot} active />
        <RailIcon Icon={BookOpen} />
        <RailIcon Icon={Wrench} />
        <RailDivider />
        <RailIcon Icon={MessagesSquare} />
        <RailIcon Icon={Megaphone} />
        <RailIcon Icon={Users} />
        <RailDivider />
        {/* Analytics is a product-level section rather than a per-agent one,
            so it lives on the primary rail beside Campaigns and Contacts —
            not in the agent sub-nav, which is scoped to one agent's setup. */}
        <RailIcon
          Icon={BarChart3}
          label="Analytics"
          active={section === "analytics"}
          onClick={() => onNavigate("analytics")}
        />
        <div className="mt-auto grid size-9 place-items-center rounded-full bg-[#1BA8A0] text-[13px] font-semibold text-white">
          M
        </div>
      </nav>

      {/* secondary rail — section sub-nav */}
      <nav className="flex w-[60px] flex-col items-center gap-1.5 border-r border-[#ECECEC] bg-white py-3">
        <RailIcon Icon={LayoutGrid} label="Overview" />
        <RailIcon
          Icon={Settings}
          label="Configure"
          active={section === "configure"}
          onClick={() => onNavigate("configure")}
        />
        <RailIcon
          Icon={Palette}
          label="Design"
          active={section === "design"}
          onClick={() => onNavigate("design")}
        />
        <RailIcon Icon={Share2} />
        <RailIcon Icon={Activity} />
        <button className="mt-auto grid size-9 place-items-center rounded-lg text-[#9A9A9A] transition-colors hover:bg-[#F0F0F0]">
          <ChevronRight className="size-[18px]" />
        </button>
      </nav>
    </div>
  );
}
