"use client";

import { MessageSquare, X } from "lucide-react";
import { useEffect, useState } from "react";

type VoiceState = "listening" | "thinking" | "speaking";

interface VoiceAgentProps {
  onCancel: () => void;
  onChat: () => void;
}

const STATE_LABEL: Record<VoiceState, string> = {
  listening: "AI is listening...",
  thinking: "AI is thinking...",
  speaking: "AI is speaking...",
};

const DEMO_STEPS: Array<{ delay: number; state: VoiceState }> = [
  { delay: 0, state: "listening" },
  { delay: 4500, state: "thinking" },
  { delay: 7000, state: "speaking" },
  { delay: 12000, state: "listening" },
];

export function VoiceAgent({ onCancel, onChat }: VoiceAgentProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>("listening");

  useEffect(() => {
    const timers: number[] = [];
    DEMO_STEPS.forEach(({ delay, state }) => {
      timers.push(window.setTimeout(() => setVoiceState(state), delay));
    });
    return () => timers.forEach(window.clearTimeout);
  }, []);

  const ringSpeed =
    voiceState === "speaking" ? "3s" : voiceState === "thinking" ? "6s" : "4.5s";

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center overflow-hidden rounded-[20px]"
      style={{
        background: "#ffffff",
        animation: "voice-agent-in 260ms cubic-bezier(0.2, 0.6, 0.2, 1) both",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes voice-agent-in {
            from { opacity: 0; transform: scale(0.97); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes orb-cw {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes orb-ccw {
            from { transform: rotate(0deg); }
            to { transform: rotate(-360deg); }
          }
          @keyframes orb-breathe {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.045); }
          }
          @keyframes ring-spin {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to { transform: translate(-50%, -50%) rotate(360deg); }
          }
          @keyframes status-in {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `,
        }}
      />

      {/* Status text — top center */}
      <p
        key={voiceState}
        className="mt-12 text-[14px] font-semibold tracking-tight text-[#4a6a8a]"
        style={{ animation: "status-in 300ms ease-out both" }}
      >
        {STATE_LABEL[voiceState]}
      </p>

      {/* Orb area */}
      <div className="relative flex flex-1 items-center justify-center">
        {/* Ambient glow behind orb */}
        <div
          className="absolute rounded-full"
          style={{
            width: 260,
            height: 260,
            background:
              "radial-gradient(circle, rgba(120,170,240,0.35) 0%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />

        {/* Scalloped SVG ring */}
        <svg
          className="absolute"
          style={{
            width: 240,
            height: 240,
            top: "50%",
            left: "50%",
            animation: `ring-spin ${ringSpeed} linear infinite`,
          }}
          viewBox="0 0 240 240"
        >
          <defs>
            <filter id="va-scallop">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.028"
                numOctaves="2"
                seed="4"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="10"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
          <circle
            cx="120"
            cy="120"
            r="105"
            fill="none"
            stroke="rgba(100,175,145,0.5)"
            strokeWidth="1.5"
            filter="url(#va-scallop)"
          />
        </svg>

        {/* Orb */}
        <div
          className="relative overflow-hidden rounded-full"
          style={{
            width: 180,
            height: 180,
            animation: `orb-breathe ${voiceState === "speaking" ? "1s" : "3s"} ease-in-out infinite`,
            boxShadow:
              "0 8px 40px rgba(80,120,220,0.3), 0 2px 8px rgba(80,100,200,0.2)",
          }}
        >
          {/* Base layer */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "linear-gradient(135deg, #7c3af8 0%, #5b11f0 40%, #8b2cf8 100%)",
            }}
          />
          {/* Rotating layer 1 — highlight sweep */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.88) 0%, transparent 42%)",
              animation: "orb-cw 10s linear infinite",
            }}
          />
          {/* Rotating layer 2 — secondary color mass */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 68% 65%, rgba(180,120,255,0.65) 0%, transparent 48%)",
              animation: "orb-ccw 7s linear infinite",
            }}
          />
          {/* Rotating layer 3 — pink-purple accent */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 65% 28%, rgba(210,180,255,0.6) 0%, transparent 38%)",
              animation: "orb-cw 14s linear infinite",
            }}
          />
          {/* Soft bottom shadow inside */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 50% 100%, rgba(60,10,120,0.35) 0%, transparent 55%)",
            }}
          />
        </div>
      </div>

      {/* Bottom controls */}
      <div className="mb-10 flex items-center gap-8">
        {/* Chat */}
        <button
          type="button"
          onClick={onChat}
          className="flex size-12 items-center justify-center rounded-full transition-colors"
          style={{
            background: "rgba(255,255,255,0.35)",
            backdropFilter: "blur(8px)",
            color: "#4a6a8a",
          }}
          aria-label="Go to chat"
        >
          <MessageSquare className="size-5" strokeWidth={1.5} />
        </button>

        {/* Mic — center, larger */}
        <button
          type="button"
          className="flex size-16 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95"
          style={{
            background: "rgba(255,255,255,0.9)",
            boxShadow:
              "0 4px 20px rgba(80,120,220,0.2), 0 1px 4px rgba(0,0,0,0.08)",
            color: "#120bf4",
          }}
          aria-label="Microphone"
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="2" width="6" height="11" rx="3" />
            <path d="M5 10a7 7 0 0 0 14 0" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="9" y1="22" x2="15" y2="22" />
          </svg>
        </button>

        {/* Close */}
        <button
          type="button"
          onClick={onCancel}
          className="flex size-12 items-center justify-center rounded-full transition-colors hover:opacity-90 active:opacity-80"
          style={{
            background: "rgba(255,255,255,0.35)",
            backdropFilter: "blur(8px)",
            color: "#4a6a8a",
          }}
          aria-label="Close"
        >
          <X className="size-5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
