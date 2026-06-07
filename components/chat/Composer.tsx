"use client";

import { ArrowUp, Loader2, Mic, Plus, Square, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface ComposerProps {
  onSend?: (message: string) => void;
}

const DEMO_TRANSCRIPT = "Can you tell me more about the Studio plan?";

// Approximate chars-per-line in the single-line textarea (12px text in a
// ~280px-wide slot after + button, send button, gaps, container padding).
// Used to detect whether the content would wrap to a second visual line —
// purely from value, never from DOM measurement, so the state never
// feedback-loops with the layout change.
const SINGLE_LINE_MAX_CHARS = 40;

export function Composer({ onSend }: ComposerProps) {
  const [value, setValue] = useState("");
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const transcribeTimer = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasInput = value.trim().length > 0;

  // Content-driven multi-line: count the visual lines the value would take
  // in the single-line textarea slot. Stable per value — never depends on
  // measured width, so it doesn't oscillate at the boundary.
  const isMultiline = useMemo(() => {
    if (!value) return false;
    const lines = value.split("\n");
    const totalVisualLines = lines.reduce(
      (acc, line) =>
        acc + Math.max(1, Math.ceil(line.length / SINGLE_LINE_MAX_CHARS)),
      0,
    );
    return totalVisualLines > 1;
  }, [value]);

  useEffect(() => {
    return () => {
      if (transcribeTimer.current) window.clearTimeout(transcribeTimer.current);
    };
  }, []);

  // Height growth is independent of multiline state — the textarea sizes
  // itself to its content regardless of layout, capped at 140px.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, [value]);

  const handleSend = () => {
    if (!hasInput) return;
    onSend?.(value.trim());
    setValue("");
  };

  const handleMicClick = () => {
    setValue("");
    setRecording(true);
  };

  const handleStopClick = () => {
    setRecording(false);
    setTranscribing(true);
    transcribeTimer.current = window.setTimeout(() => {
      setValue(DEMO_TRANSCRIPT);
      setTranscribing(false);
    }, 1500);
  };

  const handleCancelRecording = () => {
    setRecording(false);
    setTranscribing(false);
    if (transcribeTimer.current) {
      window.clearTimeout(transcribeTimer.current);
      transcribeTimer.current = null;
    }
  };

  const waveformHeights = useMemo(() => {
    return Array.from({ length: 44 }, (_, i) => {
      const seed =
        Math.sin(i * 0.45) * 0.35 + Math.sin(i * 1.7 + 1.2) * 0.45 + 0.55;
      return Math.max(0.18, Math.min(1, seed));
    });
  }, []);

  const inputDisabled = recording || transcribing;
  const placeholder = recording
    ? ""
    : transcribing
      ? "Transcribing…"
      : "Ask me anything...";

  return (
    <div className="flex w-full flex-col gap-1.5">
      {hasInput && !recording && !transcribing && (
        <div
          className="flex items-center justify-center gap-1 px-1 text-[10px] leading-4 text-[#979797]"
          style={{ animation: "fade-in 180ms ease-out both" }}
        >
          Press
          <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded-[3px] border border-[#D8CFC0] bg-white px-1 font-sans text-[10px] leading-none text-[#6E6E6E]">
            ↵
          </kbd>
          to send
        </div>
      )}
      <div
        className={`flex w-full rounded-[12px] border border-[#E4E4E7] bg-[#FAFAFA] transition-all duration-200 hover:border-[#D4D4D8] focus-within:!border-[#120bf4] focus-within:!ring-4 focus-within:!ring-[#120bf4]/15 ${
          recording
            ? "h-11 items-center gap-2 px-2"
            : isMultiline
              ? "flex-wrap items-end gap-x-1.5 gap-y-1 px-2 py-1.5"
              : "items-end gap-1.5 px-2 py-2"
        }`}
      >
        {recording ? (
          <>
            <button
              type="button"
              onClick={handleCancelRecording}
              className="tooltip-host flex size-7 shrink-0 items-center justify-center rounded-full bg-[#F0F0F0] text-[#1a1a1a] transition-colors hover:bg-[#E4E4E7]"
              aria-label="Cancel recording"
              data-tooltip="Cancel"
            >
              <X className="size-3.5" strokeWidth={2} />
            </button>
            <div
              className="flex flex-1 items-center justify-center gap-[3px] overflow-hidden px-1"
              aria-hidden
            >
              {waveformHeights.map((h, i) => (
                <span
                  key={i}
                  className="block w-px origin-center rounded-full bg-[#120bf4]"
                  style={{
                    height: `${Math.round(h * 18)}px`,
                    animation: `wave-bar 1.6s ease-in-out ${i * 45}ms infinite`,
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleStopClick}
              className="tooltip-host flex size-7 shrink-0 items-center justify-center rounded-full bg-[#120bf4] text-white transition-colors hover:bg-[#0a06d4] active:bg-[#0805b0]"
              aria-label="Stop recording"
              data-tooltip="Stop"
            >
              <Square
                className="size-2.5"
                strokeWidth={0}
                fill="currentColor"
              />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              disabled={inputDisabled}
              className={`tooltip-host flex size-7 shrink-0 items-center justify-center rounded-[6px] text-[#6E6E6E] transition-colors hover:bg-[#F0F0F0] hover:text-[#333333] active:bg-[#F0F0F0] disabled:opacity-40 ${
                isMultiline ? "order-2 mr-auto" : ""
              }`}
              aria-label="Add attachment"
              data-tooltip="Attach"
            >
              <Plus className="size-4" strokeWidth={1.5} />
            </button>
            <textarea
              ref={textareaRef}
              rows={1}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !inputDisabled) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={inputDisabled}
              placeholder={placeholder}
              className={`block min-w-0 resize-none bg-transparent text-[14px] leading-[1.5] tracking-tight text-[#333] outline-none placeholder:text-[#555] disabled:placeholder:text-[#777] ${
                isMultiline
                  ? "order-1 w-full basis-full py-1"
                  : "flex-1 py-[5px]"
              }`}
              style={{
                maxHeight: "140px",
                overflowY: "auto",
                boxSizing: "border-box",
              }}
            />
            {transcribing ? (
              <button
                type="button"
                disabled
                className={`tooltip-host flex size-7 shrink-0 items-center justify-center rounded-[6px] text-[#6E6E6E] ${
                  isMultiline ? "order-3" : ""
                }`}
                aria-label="Transcribing"
                data-tooltip="Transcribing"
              >
                <Loader2 className="size-4 animate-spin" strokeWidth={1.75} />
              </button>
            ) : hasInput ? (
              <button
                type="button"
                onClick={handleSend}
                className={`tooltip-host flex size-7 shrink-0 items-center justify-center rounded-[6px] bg-[#120bf4] text-white transition-colors hover:bg-[#0a06d4] active:bg-[#0805b0] ${
                  isMultiline ? "order-3" : ""
                }`}
                aria-label="Send message"
                data-tooltip="Send"
              >
                <ArrowUp className="size-4" strokeWidth={2} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleMicClick}
                className={`tooltip-host flex size-7 shrink-0 items-center justify-center rounded-[6px] text-[#6E6E6E] transition-colors hover:bg-[#F0F0F0] hover:text-[#333333] active:bg-[#F0F0F0] ${
                  isMultiline ? "order-3" : ""
                }`}
                aria-label="Voice input"
                data-tooltip="Voice"
              >
                <Mic className="size-4" strokeWidth={1.5} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
