"use client";

import {
  ChevronLeft,
  Download,
  Maximize2,
  Minimize2,
  MoreVertical,
  RotateCcw,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ChatHeaderProps {
  onBack?: () => void;
  onClose?: () => void;
  onRestart?: () => void;
  onDownload?: () => void;
  onToggleExpand?: () => void;
  expanded?: boolean;
}

export function ChatHeader({
  onBack,
  onClose,
  onRestart,
  onDownload,
  onToggleExpand,
  expanded,
}: ChatHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <header className="flex w-full items-center gap-1 rounded-t-[20px] border-b border-[#eee] bg-white px-4 py-[14px]">
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <button
          onClick={onBack}
          className="tooltip-host tooltip-below tooltip-left flex size-7 shrink-0 items-center justify-center rounded-[6px] text-[#6E6E6E] transition-colors hover:bg-[#F0F0F0] hover:text-[#333333] active:bg-[#F0F0F0]"
          aria-label="View messages"
          data-tooltip="Messages"
        >
          <ChevronLeft className="size-5" strokeWidth={1.5} />
        </button>
        <img
          src="/global-payments-avatar.png"
          alt="Global Payments"
          className="ml-1 size-9 shrink-0 rounded-[8px] bg-[#120bf4] object-cover"
        />
        <div className="ml-1 flex min-w-0 flex-col">
          <p className="truncate text-[14px] leading-5 font-semibold text-[#333]">
            Global Payments
          </p>
          <p className="truncate text-[10px] leading-4 font-medium text-[#979797]">
            Virtual Assistant
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className={`tooltip-host tooltip-below flex size-7 items-center justify-center rounded-[6px] transition-colors ${
              menuOpen
                ? "bg-[#F0F0F0] text-[#333333]"
                : "text-[#6E6E6E] hover:bg-[#F0F0F0] hover:text-[#333333]"
            }`}
            aria-label="More options"
            aria-expanded={menuOpen}
            data-tooltip="More"
          >
            <MoreVertical className="size-4" strokeWidth={1.5} />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-[calc(100%+6px)] z-20 flex flex-col overflow-hidden rounded-[10px] border bg-white p-1"
              style={{
                borderColor: "#E0DAD3",
                boxShadow:
                  "0 4px 12px -3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
                animation: "fade-in 160ms ease-out both",
              }}
              role="menu"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onToggleExpand?.();
                }}
                className="flex w-full items-center gap-2 whitespace-nowrap rounded-[6px] px-2 py-1.5 text-left text-[12px] text-[#333] transition-colors hover:bg-[#F9F3EA]"
              >
                {expanded ? (
                  <Minimize2
                    className="size-3.5 text-[#6E6E6E]"
                    strokeWidth={1.75}
                  />
                ) : (
                  <Maximize2
                    className="size-3.5 text-[#6E6E6E]"
                    strokeWidth={1.75}
                  />
                )}
                {expanded ? "Collapse window" : "Expand window"}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onRestart?.();
                }}
                className="flex w-full items-center gap-2 whitespace-nowrap rounded-[6px] px-2 py-1.5 text-left text-[12px] text-[#333] transition-colors hover:bg-[#F9F3EA]"
              >
                <RotateCcw
                  className="size-3.5 text-[#6E6E6E]"
                  strokeWidth={1.75}
                />
                Restart
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onDownload?.();
                }}
                className="flex w-full items-center gap-2 whitespace-nowrap rounded-[6px] px-2 py-1.5 text-left text-[12px] text-[#333] transition-colors hover:bg-[#F9F3EA]"
              >
                <Download
                  className="size-3.5 text-[#6E6E6E]"
                  strokeWidth={1.75}
                />
                Download transcript
              </button>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="tooltip-host tooltip-below flex size-7 items-center justify-center rounded-[6px] text-[#6E6E6E] transition-colors hover:bg-[#F0F0F0] hover:text-[#333333] active:bg-[#F0F0F0]"
          aria-label="Close"
          data-tooltip="Close"
        >
          <X className="size-4" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
