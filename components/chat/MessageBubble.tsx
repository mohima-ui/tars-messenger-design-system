"use client";

import { Check, Copy, ThumbsDown, ThumbsUp, Volume2, VolumeX } from "lucide-react";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const WORD_STEP_MS = 38;

type WordCounter = { current: number; textIdx: number };

function splitNodeIntoWords(
  node: React.ReactNode,
  counter: WordCounter,
  keyPrefix: string,
): React.ReactNode {
  if (node === null || node === undefined || typeof node === "boolean") {
    return node;
  }
  if (typeof node === "string") {
    const tokens = node.split(/(\s+)/);
    return tokens.map((tok, i) => {
      if (tok === "") return null;
      if (/^\s+$/.test(tok)) return tok;
      const idx = counter.current++;
      const textIdx = counter.textIdx++;
      return (
        <span
          key={`${keyPrefix}-w-${idx}-${i}`}
          data-text-word-idx={textIdx}
          className="inline-block rounded-[3px] transition-colors duration-150 will-change-transform"
          style={{
            animation: `word-in 320ms cubic-bezier(0.2, 0.6, 0.2, 1) ${idx * WORD_STEP_MS}ms both`,
          }}
        >
          {tok}
        </span>
      );
    });
  }
  if (typeof node === "number") return node;
  if (Array.isArray(node)) {
    return node.map((child, i) => (
      <Fragment key={`${keyPrefix}-${i}`}>
        {splitNodeIntoWords(child, counter, `${keyPrefix}-${i}`)}
      </Fragment>
    ));
  }
  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<{ children?: React.ReactNode }>;
    if (element.props.children === undefined) {
      const idx = counter.current++;
      return (
        <span
          key={`${keyPrefix}-el-${idx}`}
          className="inline-block will-change-transform"
          style={{
            animation: `word-in 320ms cubic-bezier(0.2, 0.6, 0.2, 1) ${idx * WORD_STEP_MS}ms both`,
          }}
        >
          {element}
        </span>
      );
    }
    return React.cloneElement(
      element,
      undefined,
      splitNodeIntoWords(
        element.props.children,
        counter,
        `${keyPrefix}-el`,
      ),
    );
  }
  return node;
}

export function Words({ children }: { children: React.ReactNode }) {
  const counter: WordCounter = { current: 0, textIdx: 0 };
  return <>{splitNodeIntoWords(children, counter, "w")}</>;
}

type Variant = "user" | "ai";

interface MessageBubbleProps {
  variant: Variant;
  children: React.ReactNode;
  fullWidth?: boolean;
  animateWords?: boolean;
  /** Speaker label above the bubble, e.g. "AI agent". */
  label?: string;
  /** Timestamp shown next to the label, e.g. "2:14 PM". */
  time?: string;
  /** Single-letter avatar shown to the left of the label row. */
  initial?: string;
  /** Show the action toolbar. Off for all but the last of a consecutive run. */
  actions?: boolean;
  /** Slot between the label and the bubble — e.g. the "Thought for Ns" chip. */
  beforeBubble?: React.ReactNode;
  /** Slot after the bubble — quick replies, cards, any generative UI. The
      action toolbar renders below this, so it always trails the turn. */
  afterBubble?: React.ReactNode;
  /** Slot inside the bubble, under a hairline rule — e.g. sources. */
  bubbleFooter?: React.ReactNode;
}

export function MessageBubble({
  variant,
  children,
  fullWidth,
  animateWords = true,
  label,
  time,
  initial,
  actions = true,
  beforeBubble,
  afterBubble,
  bubbleFooter,
}: MessageBubbleProps) {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (variant === "user") {
    return (
      <div
        className="flex w-full justify-end"
        style={{ animation: "bubble-in 240ms cubic-bezier(0.2, 0.6, 0.2, 1) both" }}
      >
        <div
          className={cn(
            /* Same geometry as the agent bubble, mirrored: the 2px corner
               anchors right, to the speaker. Fill, stroke and ink come from the
               accent role tokens (#F0E7FA / #C5A8E0 / #4A1F77 for Tars purple),
               which a tenant overrides as a set. */
            "whitespace-pre-line rounded-[16px] rounded-br-[2px] p-[10px] text-[14px] leading-[1.6] tracking-normal",
            fullWidth ? "w-[300px]" : "max-w-[80%]",
          )}
          style={{
            backgroundColor: "var(--ds-accent-soft)",
            boxShadow: "inset 0 0 0 1px var(--ds-accent-border)",
            color: "var(--ds-accent-ink)",
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    const text = bubbleRef.current?.textContent?.trim();
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

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
    <div
      className="flex w-full justify-start"
      style={{ animation: "bubble-in 240ms cubic-bezier(0.2, 0.6, 0.2, 1) both" }}
    >
      {/* Avatar sits outside the column so the label and bubble stay aligned
          with each other, indented past it. */}
      {initial && (
        <span
          className="mr-2 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-[var(--ds-border-line)] bg-white text-[11px] font-semibold text-[#6E6E6E]"
          aria-hidden
        >
          {initial}
        </span>
      )}

      <div className="group flex w-full min-w-0 flex-col items-start gap-1">
        {(label || time) && (
          <p className="text-[11px] font-medium tracking-wide text-[#6E6E6E]">
            {label}
            {time && <span className="text-[#A8A096]">{label ? " · " : ""}{time}</span>}
          </p>
        )}

        {beforeBubble}

        {/* Geometry matches the AI Message component: r-16 with a 2px corner
            anchoring to the speaker, 12px padding, 14px/160%. */}
        <div
          ref={bubbleRef}
          /* Hairline as an inset ring, not a border: a real border would eat
             2px of the 364px bubble and drop a word to the next line. */
          className="max-w-full whitespace-pre-line rounded-[16px] rounded-bl-[2px] bg-[var(--ds-bg-paper)] p-3 text-[14px] leading-[1.6] tracking-normal text-[var(--ds-text-ink)]"
          style={{ boxShadow: "inset 0 0 0 1px var(--ds-border-line)" }}
        >
          {animateWords ? <Words>{children}</Words> : children}

          {bubbleFooter && (
            <div
              className="mt-3 border-t pt-2.5"
              style={{ borderColor: "var(--ds-border-line-soft)" }}
            >
              {bubbleFooter}
            </div>
          )}
        </div>

        {afterBubble}

        {/* Same action set as the component — revealed on hover so a long
            thread doesn't carry a toolbar under every turn. Sits after
            afterBubble so it always trails the turn's last piece of content.

            Always laid out, only faded: toggling display would change the
            turn's height on hover and shove the thread around. */}
        {actions && (
        <div
          className={cn(
            "flex items-center gap-0.5 transition-opacity",
            speaking
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
          )}
        >
          <BubbleAction
            onClick={handleSpeak}
            label={speaking ? "Stop reading" : "Read aloud"}
            active={speaking}
          >
            {speaking ? (
              <VolumeX className="size-3.5" strokeWidth={1.5} />
            ) : (
              <Volume2 className="size-3.5" strokeWidth={1.5} />
            )}
          </BubbleAction>
          <BubbleAction label="Good response">
            <ThumbsUp className="size-3" strokeWidth={1.5} />
          </BubbleAction>
          <BubbleAction label="Bad response">
            <ThumbsDown className="size-3" strokeWidth={1.5} />
          </BubbleAction>
          <BubbleAction onClick={handleCopy} label={copied ? "Copied" : "Copy"} active={copied}>
            {copied ? (
              <Check className="size-3" strokeWidth={2} />
            ) : (
              <Copy className="size-3" strokeWidth={1.5} />
            )}
          </BubbleAction>
        </div>
        )}
      </div>
    </div>
  );
}

function BubbleAction({
  children,
  onClick,
  label,
  active,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex size-6 items-center justify-center rounded-[4px] transition-colors hover:bg-[#F0EBE0] hover:text-[#333333]",
        active ? "text-[#333333]" : "text-[#6E6E6E]",
      )}
    >
      {children}
    </button>
  );
}
