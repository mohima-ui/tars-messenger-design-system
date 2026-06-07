"use client";

import {
  ChevronLeft,
  Mic,
  MoreVertical,
  Plus,
  Send,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const CARD_BG = "#fbf7f1";
const AI_BUBBLE_BG = "#efeae0";

interface Theme {
  id: string;
  label: string;
  description: string;
  userBubble: string;
  userText: string;
}

const themes: Theme[] = [
  {
    id: "charcoal",
    label: "Charcoal",
    description: "#2D2926 — editorial, timeless",
    userBubble: "#2D2926",
    userText: "#ffffff",
  },
  {
    id: "terracotta",
    label: "Terracotta",
    description: "#C66B3D — committed warm palette",
    userBubble: "#C66B3D",
    userText: "#ffffff",
  },
  {
    id: "forest",
    label: "Forest",
    description: "#3D5B3D — earthy, premium",
    userBubble: "#3D5B3D",
    userText: "#ffffff",
  },
  {
    id: "vodafone",
    label: "Vodafone red",
    description: "#E60000 — brand",
    userBubble: "#E60000",
    userText: "#ffffff",
  },
  {
    id: "global-payments",
    label: "Global Payments blue",
    description: "#120bf4 — brand",
    userBubble: "#120bf4",
    userText: "#ffffff",
  },
  {
    id: "amex",
    label: "Amex light blue",
    description: "#009DDA — brand",
    userBubble: "#009DDA",
    userText: "#ffffff",
  },
];

type Variant = "user" | "ai";

interface MessageBubbleProps {
  variant: Variant;
  children: React.ReactNode;
  fullWidth?: boolean;
  theme: Theme;
}

function MessageBubble({
  variant,
  children,
  fullWidth,
  theme,
}: MessageBubbleProps) {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (variant === "user") {
    return (
      <div className="flex w-full justify-end">
        <div
          className={cn(
            "rounded-tl-lg rounded-br-lg rounded-bl-lg p-2 text-[12px] leading-5 font-medium",
            fullWidth ? "w-[300px]" : "max-w-fit",
          )}
          style={{ backgroundColor: theme.userBubble, color: theme.userText }}
        >
          {children}
        </div>
      </div>
    );
  }

  const handleSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const text = bubbleRef.current?.textContent?.trim();
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  return (
    <div className="flex w-full justify-start">
      <div className="group flex w-[300px] flex-col items-start gap-0.5">
        <div
          ref={bubbleRef}
          className="w-full rounded-tr-lg rounded-br-lg rounded-bl-lg p-2 text-[12px] leading-5 text-[#333] backdrop-blur-[20px]"
          style={{ backgroundColor: AI_BUBBLE_BG }}
        >
          {children}
        </div>
        <button
          type="button"
          onClick={handleSpeak}
          className={cn(
            "flex size-5 items-center justify-center rounded-full transition-all hover:bg-[#f5f7f9]",
            speaking ? "opacity-100" : "text-[#979797] opacity-0 group-hover:opacity-100 focus:opacity-100",
          )}
          style={speaking ? { color: theme.userBubble } : undefined}
          aria-label={speaking ? "Stop reading" : "Read aloud"}
        >
          {speaking ? (
            <VolumeX className="size-3" strokeWidth={1.75} />
          ) : (
            <Volume2 className="size-3" strokeWidth={1.75} />
          )}
        </button>
      </div>
    </div>
  );
}

function ChatHeader({ theme }: { theme: Theme }) {
  return (
    <header
      className="flex w-full items-center gap-1 border-b border-[#eee] px-4 py-3"
      style={{ backgroundColor: CARD_BG }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <button
          className="flex size-7 shrink-0 items-center justify-center rounded-[2px] text-[#333] transition-colors hover:bg-[#E3E3E3] active:bg-[#C4C4C4]"
          aria-label="View chat history"
        >
          <ChevronLeft className="size-5" strokeWidth={1.5} />
        </button>
        <div
          className="ml-1 flex size-9 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white"
          style={{ backgroundColor: theme.userBubble }}
          aria-hidden="true"
        >
          G
        </div>
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
        <button
          className="flex size-7 items-center justify-center rounded-[2px] text-[#333] transition-colors hover:bg-[#E3E3E3] active:bg-[#C4C4C4]"
          aria-label="More options"
        >
          <MoreVertical className="size-4" strokeWidth={1.5} />
        </button>
        <button
          className="flex size-7 items-center justify-center rounded-[2px] text-[#333] transition-colors hover:bg-[#E3E3E3] active:bg-[#C4C4C4]"
          aria-label="Close"
        >
          <X className="size-4" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}

function Composer({
  theme,
  onSend,
}: {
  theme: Theme;
  onSend: (m: string) => void;
}) {
  const [value, setValue] = useState("");
  const hasInput = value.trim().length > 0;

  const handleSend = () => {
    if (!hasInput) return;
    onSend(value.trim());
    setValue("");
  };

  return (
    <div className="flex h-11 w-full items-center gap-2 rounded-lg border border-[#f1f2f3] bg-white px-2 transition-colors hover:border-[#d4d4d4] focus-within:!border-[var(--user-color)]"
      style={{ ["--user-color" as string]: theme.userBubble }}
    >
      <button
        type="button"
        className="flex size-7 shrink-0 items-center justify-center rounded-[2px] text-[#555] transition-colors hover:bg-[#E3E3E3] active:bg-[#C4C4C4]"
        aria-label="Add attachment"
      >
        <Plus className="size-4" strokeWidth={1.5} />
      </button>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Ask me anything..."
        className="h-full min-w-0 flex-1 bg-transparent text-[12px] leading-4 text-[#333] outline-none placeholder:text-[#555]"
      />
      {hasInput ? (
        <button
          type="button"
          onClick={handleSend}
          className="flex size-7 shrink-0 items-center justify-center rounded-[2px] text-white transition-opacity hover:opacity-90 active:opacity-80"
          style={{ backgroundColor: theme.userBubble }}
          aria-label="Send message"
        >
          <Send className="size-4" strokeWidth={1.75} />
        </button>
      ) : (
        <button
          type="button"
          className="flex size-7 shrink-0 items-center justify-center rounded-[2px] text-[#555] transition-colors hover:bg-[#E3E3E3] active:bg-[#C4C4C4]"
          aria-label="Voice input"
        >
          <Mic className="size-4" strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}

type Message =
  | { id: string; type: "ai"; content: React.ReactNode }
  | { id: string; type: "user"; content: string; fullWidth?: boolean };

const initialMessages: Message[] = [
  {
    id: "1",
    type: "ai",
    content: (
      <>
        Welcome to <span className="font-semibold">Tars</span> — your one-stop
        automation solution!
      </>
    ),
  },
  {
    id: "2",
    type: "ai",
    content: (
      <>
        Easily create and customize your Agent using a drag-and-drop interface
        and pre-built templates with our No{" "}
        <span className="font-semibold">Code AI Agent Builder.</span>
      </>
    ),
  },
  { id: "3", type: "user", content: "Provide a URL" },
  {
    id: "4",
    type: "ai",
    content:
      "Want to see how it works? You can book a demo or let me know what you're looking for! 😊",
  },
  {
    id: "5",
    type: "user",
    content: "Corem ipsum dolor sit amet, consectetur adipiscing elit.",
    fullWidth: true,
  },
  {
    id: "6",
    type: "ai",
    content: (
      <>
        Easily create and customize your Agent using a drag-and-drop interface
        and pre-built templates with our No{" "}
        <span className="font-semibold">Code AI Agent Builder.</span>
      </>
    ),
  },
];

function ChatWidget({ theme }: { theme: Theme }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const handleSend = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), type: "user", content: text },
    ]);
  };

  return (
    <div
      className="flex h-[640px] w-[380px] flex-col overflow-hidden rounded-[20px]"
      style={{
        backgroundColor: CARD_BG,
        boxShadow: "8.322px 8.322px 80.6px 0px rgba(0,0,0,0.18)",
      }}
    >
      <ChatHeader theme={theme} />
      <main className="flex-1 overflow-y-auto px-4 pt-3 pb-4">
        <div className="flex w-full flex-col gap-1">
          {messages.map((m) =>
            m.type === "user" ? (
              <MessageBubble
                key={m.id}
                variant="user"
                fullWidth={m.fullWidth}
                theme={theme}
              >
                {m.content}
              </MessageBubble>
            ) : (
              <MessageBubble key={m.id} variant="ai" theme={theme}>
                {m.content}
              </MessageBubble>
            ),
          )}
        </div>
      </main>
      <div className="px-4 pb-4">
        <Composer theme={theme} onSend={handleSend} />
      </div>
    </div>
  );
}

export default function V4Page() {
  return (
    <div className="min-h-screen bg-[#f4ede3] px-8 py-12">
      <div className="mx-auto max-w-[1320px]">
        <header className="mb-10">
          <h1 className="text-[24px] font-semibold tracking-tight text-[#1a1a1a]">
            User bubble — design directions & brand colors
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-[#555]">
            Same chat bg{" "}
            <code className="rounded bg-white/60 px-1.5 py-0.5 text-[12px]">
              #fbf7f1
            </code>{" "}
            and agent bubble{" "}
            <code className="rounded bg-white/60 px-1.5 py-0.5 text-[12px]">
              #efeae0
            </code>
            . Top row: design directions. Bottom row: live customer brand
            colors — tests whether the beige theme stays brand-agnostic.
          </p>
        </header>

        <div className="flex flex-wrap gap-8">
          {themes.map((t) => (
            <section key={t.id} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span
                  className="size-5 rounded-full border border-black/10"
                  style={{ backgroundColor: t.userBubble }}
                />
                <div>
                  <p className="text-[14px] font-semibold text-[#1a1a1a]">
                    {t.label}
                  </p>
                  <p className="text-[12px] text-[#6e6e6e]">{t.description}</p>
                </div>
              </div>
              <ChatWidget theme={t} />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
