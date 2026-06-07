"use client";

import { MessageSquare, Mic, Plus } from "lucide-react";

interface Chat {
  id: string;
  title: string;
  preview: string;
  time: string;
  initial: string;
}

const ACTIVE_CHAT_ID = "1";

const HISTORY_CHATS: Chat[] = [
  {
    id: "1",
    title: "Talk to sales · Studio plan",
    preview: "Tars: Perfect — you're booked!…",
    time: "Now",
    initial: "T",
  },
  {
    id: "2",
    title: "Refund for Order #3081",
    preview: "You: thanks, all sorted",
    time: "Today",
    initial: "T",
  },
  {
    id: "3",
    title: "Custom domain setup",
    preview: "Priya: I've added the DNS…",
    time: "Mar 12",
    initial: "P",
  },
  {
    id: "4",
    title: "Welcome to Tars",
    preview: "Tars: Good morning. I'm…",
    time: "Mar 8",
    initial: "T",
  },
];

type Tab = "messages" | "voice";

interface ChatHistoryProps {
  onSelectChat: (id: string) => void;
  onClose: () => void;
  onVoice?: () => void;
  tab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function ChatHistory({ onSelectChat, onClose, onVoice, tab, onTabChange }: ChatHistoryProps) {
  const setTab = onTabChange;

  return (
    <div className="flex h-full flex-col rounded-[20px] bg-white">
      {tab === "messages" && (
        <header className="flex items-center justify-between rounded-t-[20px] border-b border-[#EEEEEE] px-6 py-4">
          <p className="text-[18px] leading-6 font-semibold text-[#333]">
            Messages
          </p>
          <button
            type="button"
            onClick={onClose}
            className="tooltip-host tooltip-below tooltip-left inline-flex items-center gap-1 rounded-[8px] bg-[#120bf4] px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#0a06d4] active:bg-[#0805b0]"
            data-tooltip="New chat"
          >
            <Plus className="size-3" strokeWidth={2.25} />
            New
          </button>
        </header>
      )}

      {/* Content */}
      {tab === "messages" && (
        <div className="scrollbar-subtle flex-1 overflow-y-auto">
          {HISTORY_CHATS.map((c) => {
            const isActive = c.id === ACTIVE_CHAT_ID;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectChat(c.id)}
                className={`flex w-full items-center gap-3 border-b border-[#EEEEEE] px-6 py-3 text-left transition-colors ${
                  isActive ? "bg-[#F0F0F0]" : "hover:bg-[#FAFAFA]"
                }`}
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#E4E4E7] bg-[#F4F4F5] text-[12px] font-semibold text-[#555]">
                  {c.initial}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-baseline justify-between gap-2">
                    <p
                      className={`truncate text-[13px] ${
                        isActive ? "font-semibold" : "font-medium"
                      } text-[#333]`}
                    >
                      {c.title}
                    </p>
                    <p className="shrink-0 text-[10px] font-medium text-[#979797]">
                      {c.time}
                    </p>
                  </div>
                  <p className="truncate text-[12px] text-[#6E6E6E]">
                    {c.preview}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {tab === "voice" && (
        <div
          className="flex flex-1 flex-col items-center justify-center gap-5 px-6"
          style={{ animation: "fade-in 180ms ease-out both" }}
        >
          <div className="flex size-20 items-center justify-center rounded-full bg-[#120bf4]/8">
            <Mic className="size-8 text-[#120bf4]" strokeWidth={1.25} />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-[15px] font-semibold text-[#1a1a1a]">Talk to AI Agent</p>
            <p className="max-w-[220px] text-[12px] leading-[1.55] text-[#979797]">
              Start a real-time voice conversation with the AI agent
            </p>
          </div>
          <button
            type="button"
            onClick={onVoice}
            className="inline-flex items-center rounded-full bg-[#120bf4] px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#0a06d4] active:bg-[#0805b0]"
          >
            Use voice
          </button>
        </div>
      )}

      {/* Bottom tab bar */}
      <div className="flex shrink-0 rounded-b-[20px] border-t border-[#EEEEEE]">
        {(["messages", "voice"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors ${
              tab === t ? "text-[#120bf4]" : "text-[#979797] hover:text-[#555]"
            }`}
          >
            {t === "messages" ? (
              <MessageSquare
                className="size-5"
                strokeWidth={tab === t ? 2 : 1.5}
              />
            ) : (
              <Mic
                className="size-5"
                strokeWidth={tab === t ? 2 : 1.5}
              />
            )}
            {t === "messages" ? "Messages" : "Voice"}
          </button>
        ))}
      </div>
    </div>
  );
}
