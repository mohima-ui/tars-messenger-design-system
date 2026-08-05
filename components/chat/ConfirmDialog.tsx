"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";

/* Confirmation dialog — a yes/no prompt for something the agent is about to do.

   Inline rather than a modal overlay: the agent is asking, not interrupting,
   and a modal over a chat widget hides the very conversation that explains why
   it's asking.

   The confirm button names the action ("Cancel it") rather than saying "Yes" —
   a person skimming should be able to read the button alone and know what
   happens. Destructive actions take the danger tone, so approving a
   cancellation never looks like approving a purchase.

   Once answered it fades back and goes inert, matching the form: the question
   and the options stay readable in context, but nothing invites a second
   answer. The choice itself is posted as the visitor's message. */

const LINE = "#E0DAD3";
const INK = "#333333";
const MUTED = "#6E6E6E";
const DANGER = "#C0392B";
const DANGER_SOFT = "#FCEBE9";

export type ConfirmData = {
  title: string;
  detail?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the confirm as destructive and adds a warning mark. */
  destructive?: boolean;
};

export function ConfirmDialog({
  data,
  onConfirm,
  onCancel,
}: {
  data: ConfirmData;
  onConfirm?: () => void;
  onCancel?: () => void;
}) {
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);

  const answered = answer !== null;

  return (
    <div
      className="w-full min-w-0 rounded-[12px] border bg-white p-3 transition-opacity"
      style={{
        borderColor: data.destructive ? "#EBC9C4" : LINE,
        opacity: answered ? 0.5 : 1,
        pointerEvents: answered ? "none" : undefined,
      }}
      aria-disabled={answered}
    >
      <div className="flex gap-2.5">
        {data.destructive && (
          <span
            className="mt-[1px] flex size-5 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: DANGER_SOFT }}
          >
            <AlertTriangle className="size-3" strokeWidth={2.5} style={{ color: DANGER }} aria-hidden />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-semibold leading-snug" style={{ color: INK }}>
            {data.title}
          </p>
          {data.detail && (
            <p className="mt-1 text-[11.5px] leading-snug" style={{ color: MUTED }}>
              {data.detail}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        {/* the safe choice sits first and stays quiet */}
        <button
          type="button"
          disabled={answered}
          onClick={() => {
            setAnswer("no");
            onCancel?.();
          }}
          className="flex-1 rounded-full border px-3 py-2 text-[12.5px] font-medium transition-colors hover:bg-[#FAF7F1]"
          style={{ borderColor: LINE, color: MUTED }}
        >
          {data.cancelLabel ?? "No, keep it"}
        </button>
        <button
          type="button"
          disabled={answered}
          onClick={() => {
            setAnswer("yes");
            onConfirm?.();
          }}
          className="flex-1 rounded-full px-3 py-2 text-[12.5px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: data.destructive ? DANGER : "var(--ds-accent)" }}
        >
          {data.confirmLabel ?? "Yes, go ahead"}
        </button>
      </div>
    </div>
  );
}
