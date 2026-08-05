"use client";

import { ArrowUp, ChevronLeft, MoreVertical, Plus, Mic, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

/* The container that holds a conversation — header, scrollable message area,
   composer. Nothing else. Messages, replies, voice and handoff all render
   inside `children`.

   Extracted from the design-system page so the docs preview and any live
   surface (e.g. the /v1 launcher) render the exact same shell. */

const LINE = "#E0DAD3";
/** Header divider — lighter and cooler than the general line colour. */
const HEADER_LINE = "#EBE7E3";
const INK = "#333333";
const MUTED = "#6E6E6E";
const PAPER = "#F9F3EA";

/* Composer field is 54px at rest: 1px borders + py-2 (16px) + a 36px field.
   The field grows with content up to FIELD_MAX. */
const FIELD_MIN = 36;
const FIELD_MAX = 120;

export type ChatbotShellProps = {
  /** Agent name shown in the header. */
  name?: string;
  /** Caption under the name. */
  caption?: string;
  /** Avatar source — defaults to the Tars logomark. */
  avatar?: string;
  onBack?: () => void;
  onClose?: () => void;
  onMenu?: () => void;
  /** Fired when the visitor sends from the composer. */
  onSend?: (message: string) => void;
  onAttach?: () => void;
  onMic?: () => void;
  /** Focus ring / send button colour — the tenant accent. */
  accent?: string;
  /** "powered by TARS" line under the composer. Pass false to hide. */
  poweredBy?: boolean;
  /** Rendered into the message area. */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function ChatbotShell({
  name = "Tars",
  caption = "Virtual Assistant",
  avatar = "/tars-logomark.png",
  onBack,
  onClose,
  onMenu,
  onSend,
  onAttach,
  onMic,
  accent = "var(--ds-accent)",
  poweredBy = true,
  children,
  className = "",
  style,
}: ChatbotShellProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const hasInput = value.trim().length > 0;

  /* Grow the field with its content, floored so it keeps a stable resting
     height and capped so the thread keeps its room. */
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height =
      Math.max(FIELD_MIN, Math.min(el.scrollHeight, FIELD_MAX)) + "px";
  }, [value]);

  const send = () => {
    if (!hasInput) return;
    onSend?.(value.trim());
    setValue("");
  };

  return (
    <div
      /* No border — the panel is defined by its elevation alone, which also
         keeps the content box a true 400px (18px gutters → 364px column). */
      className={`flex flex-col overflow-hidden rounded-[40px] bg-[#FEFCF8] ${className}`}
      style={{
        width: 400,
        height: 680,
        boxShadow: "var(--ds-shadow-xl)",
        ...style,
      }}
    >
      {/* header */}
      <div
        /* 20px on the right so the close button isn't crowded against the panel edge */
        className="flex h-16 w-full shrink-0 items-center gap-1 border-b pl-4 pr-5"
        style={{ borderColor: HEADER_LINE }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-1">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="flex size-7 shrink-0 items-center justify-center rounded-[6px] transition-colors hover:bg-[#F0EBE0]"
            style={{ color: MUTED }}
          >
            <ChevronLeft className="size-5" strokeWidth={1.5} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatar}
            alt=""
            className="ml-0.5 size-9 shrink-0 rounded-[10px] object-cover"
          />
          <div className="ml-1.5 min-w-0">
            <p
              className="truncate text-[16px] font-semibold leading-tight"
              style={{ color: INK }}
            >
              {name}
            </p>
            <p className="mt-0.5 truncate text-[12px] leading-tight" style={{ color: MUTED }}>
              {caption}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={onMenu}
            aria-label="More options"
            className="flex size-7 items-center justify-center rounded-[6px] transition-colors hover:bg-[#F0EBE0]"
            style={{ color: MUTED }}
          >
            <MoreVertical className="size-5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="flex size-7 items-center justify-center rounded-[6px] transition-colors hover:bg-[#F0EBE0]"
            style={{ color: MUTED }}
          >
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* message area */}
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>

      {/* composer */}
      <div className="flex shrink-0 flex-col gap-3 px-3 pb-3 pt-2">
        {hasInput && (
          <div
            className="flex items-center justify-center gap-1 px-1 text-[10px] leading-4"
            style={{ color: "#979797", animation: "fade-in 180ms ease-out both" }}
          >
            Press
            <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded-[3px] border bg-white px-1 font-sans text-[10px] leading-none"
              style={{ borderColor: "#D8CFC0", color: MUTED }}>
              ↵
            </kbd>
            to send
          </div>
        )}
        <div
          className="flex w-full items-center gap-2 rounded-[16px] border px-3 py-2 transition-shadow"
          style={{
            borderColor: focused ? accent : LINE,
            backgroundColor: PAPER,
            boxShadow: focused
              ? `0 0 0 4px color-mix(in srgb, ${accent} 15%, transparent)`
              : undefined,
          }}
        >
          <button
            type="button"
            onClick={onAttach}
            aria-label="Add attachment"
            className="flex size-7 shrink-0 items-center justify-center rounded-[6px] transition-colors hover:bg-[#F0EBE0]"
            style={{ color: MUTED }}
          >
            <Plus className="size-4" strokeWidth={2} />
          </button>

          <textarea
            ref={areaRef}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask me anything..."
            /* Vertical padding centres the 21px line inside the FIELD_MIN box —
               textarea text is top-aligned, so without this the caret and
               placeholder sit high in the taller field. */
            className="min-w-0 flex-1 resize-none bg-transparent py-[7.5px] text-[14px] leading-[1.5] outline-none placeholder:text-[#979797]"
            style={{
              color: INK,
              minHeight: FIELD_MIN,
              maxHeight: FIELD_MAX,
              overflowY: "auto",
            }}
          />

          {hasInput ? (
            <button
              type="button"
              onClick={send}
              aria-label="Send message"
              className="flex size-7 shrink-0 items-center justify-center rounded-full text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: accent }}
            >
              <ArrowUp className="size-4" strokeWidth={2} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onMic}
              aria-label="Record a message"
              className="flex size-7 shrink-0 items-center justify-center rounded-[6px] transition-colors hover:bg-[#F0EBE0]"
              style={{ color: MUTED }}
            >
              <Mic className="size-4" strokeWidth={2} />
            </button>
          )}
        </div>

        {poweredBy && (
          <p className="text-center text-[10px] leading-4" style={{ color: MUTED }}>
            powered by{" "}
            <span className="font-bold" style={{ color: INK }}>
              TARS
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
