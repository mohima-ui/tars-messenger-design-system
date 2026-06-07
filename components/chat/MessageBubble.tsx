"use client";

import { Volume2, VolumeX } from "lucide-react";
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
}

export function MessageBubble({
  variant,
  children,
  fullWidth,
  animateWords = true,
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
      <div
        className="flex w-full justify-end"
        style={{ animation: "bubble-in 240ms cubic-bezier(0.2, 0.6, 0.2, 1) both" }}
      >
        <div
          className={cn(
            "rounded-tl-[12px] rounded-tr-[12px] rounded-br-[6px] rounded-bl-[12px] bg-[#120bf4] px-3 py-2 text-[14px] leading-[1.5] tracking-tight text-white",
            fullWidth ? "w-[300px]" : "max-w-fit",
          )}
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
    <div
      className="flex w-full justify-start"
      style={{ animation: "bubble-in 240ms cubic-bezier(0.2, 0.6, 0.2, 1) both" }}
    >
      <div className="group flex max-w-[88%] flex-col items-start">
        <div
          ref={bubbleRef}
          className="rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] rounded-bl-[6px] border border-[var(--ds-border-line)] bg-[var(--ds-bg-paper)] px-[14px] py-[10px] text-[12px] leading-[1.55] text-[var(--ds-text-ink)]"
        >
          {animateWords ? <Words>{children}</Words> : children}
        </div>
        <button
          type="button"
          onClick={handleSpeak}
          className={cn(
            "size-5 items-center justify-center rounded-full transition-colors hover:bg-[#f5f7f9] hover:text-[#120bf4]",
            speaking
              ? "mt-0.5 flex text-[#120bf4]"
              : "hidden text-[#979797] group-hover:mt-0.5 group-hover:flex focus:mt-0.5 focus:flex",
          )}
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
