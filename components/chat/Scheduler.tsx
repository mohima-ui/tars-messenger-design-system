"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

/* Calendar + time picker — the scheduling input.

   The design-system preview lays the month grid beside a 160px time column,
   which needs ~440px. The launcher column is 364px, so here the two stack: the
   grid first, then the slots for the chosen day underneath. Same parts, same
   states — only the axis changes.

   Only days with availability are selectable; the rest are visible but muted,
   so the shape of the month still reads. Picking a slot submits, matching the
   other input components: no separate confirm step for a two-tap choice. */

const LINE = "#E0DAD3";
const INK = "#333333";
const MUTED = "#6E6E6E";
const FAINT = "#A8A096";
const OUT_OF_MONTH = "#D9D2C7";
const UNAVAILABLE = "#C4B9A8";
const AVAILABLE_BG = "#F0EBE0";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const WEEKDAY_FULL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export type SchedulerData = {
  /** Four-digit year and 0-indexed month, passed in rather than read from the
      clock so server and client render the same grid. */
  year: number;
  month: number;
  /** Day-of-month → the slots free on that day. */
  availability: Record<number, string[]>;
  title?: string;
};

type Cell = { day: number; inMonth: boolean };

/** Leading days from the previous month, the month itself, then trailing. */
function buildCells(year: number, month: number): Cell[] {
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();

  const lead = Array.from({ length: first }, (_, i) => ({
    day: prevDays - first + i + 1,
    inMonth: false,
  }));
  const body = Array.from({ length: days }, (_, i) => ({ day: i + 1, inMonth: true }));
  const trail = Array.from({ length: (7 - ((lead.length + days) % 7)) % 7 }, (_, i) => ({
    day: i + 1,
    inMonth: false,
  }));
  return [...lead, ...body, ...trail];
}

export function Scheduler({
  data,
  onPick,
}: {
  data: SchedulerData;
  onPick?: (label: string) => void;
}) {
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const cells = buildCells(data.year, data.month);
  const slots = day !== null ? (data.availability[day] ?? []) : [];
  const spent = time !== null;

  const weekday = (d: number) => WEEKDAY_FULL[new Date(data.year, data.month, d).getDay()];
  const monthName = MONTHS[data.month];

  const choose = (t: string) => {
    if (spent || day === null) return;
    setTime(t);
    onPick?.(`${weekday(day)}, ${monthName} ${day} at ${t}`);
  };

  return (
    <div
      className="w-full min-w-0 overflow-hidden rounded-[12px] border bg-white transition-opacity"
      style={{ borderColor: LINE, opacity: spent ? 0.5 : 1, pointerEvents: spent ? "none" : undefined }}
      aria-disabled={spent}
    >
      {/* month grid */}
      <div className="p-3.5">
        <div className="mb-3 flex items-center justify-between">
          {/* single month of availability, so the arrows are present but inert */}
          <span className="flex size-6 items-center justify-center" style={{ color: FAINT }}>
            <ChevronLeft className="size-4" strokeWidth={2} aria-hidden />
          </span>
          <span className="text-[13px] font-semibold" style={{ color: INK }}>
            {monthName} {data.year}
          </span>
          <span className="flex size-6 items-center justify-center" style={{ color: FAINT }}>
            <ChevronRight className="size-4" strokeWidth={2} aria-hidden />
          </span>
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {WEEKDAYS.map((d) => (
            <span
              key={d}
              className="flex h-6 items-center justify-center text-[10px] font-medium"
              style={{ color: FAINT }}
            >
              {d}
            </span>
          ))}

          {cells.map((cell, i) => {
            if (!cell.inMonth)
              return (
                <span
                  key={`out-${i}`}
                  className="flex h-8 items-center justify-center text-[12px]"
                  style={{ color: OUT_OF_MONTH }}
                >
                  {cell.day}
                </span>
              );

            const free = cell.day in data.availability;
            if (!free)
              return (
                <span
                  key={cell.day}
                  className="flex h-8 items-center justify-center text-[12px]"
                  style={{ color: UNAVAILABLE }}
                >
                  {cell.day}
                </span>
              );

            const on = day === cell.day;
            return (
              <button
                key={cell.day}
                type="button"
                disabled={spent}
                onClick={() => {
                  setDay(cell.day);
                  setTime(null);
                }}
                aria-pressed={on}
                aria-label={`${weekday(cell.day)}, ${monthName} ${cell.day}`}
                className="flex h-8 items-center justify-center rounded-[7px] text-[12px] font-medium transition-colors"
                style={{
                  backgroundColor: on ? "var(--ds-accent)" : AVAILABLE_BG,
                  color: on ? "#FFFFFF" : INK,
                }}
              >
                {cell.day}
              </button>
            );
          })}
        </div>
      </div>

      {/* slots for the chosen day */}
      <div className="border-t p-3.5" style={{ borderColor: LINE }}>
        {day === null ? (
          <>
            <p className="text-[13px] font-semibold" style={{ color: INK }}>
              Please select a date
            </p>
            <p className="mt-1 text-[12px]" style={{ color: MUTED }}>
              No availability to show
            </p>
          </>
        ) : (
          <>
            <p className="text-[13px] font-semibold" style={{ color: INK }}>
              {weekday(day)}, {monthName} {day}
            </p>
            {/* capped so a long day's slots scroll rather than pushing the
                composer off-screen */}
            <div className="mt-2.5 grid max-h-[132px] grid-cols-2 gap-1.5 overflow-y-auto [scrollbar-width:thin]">
              {slots.map((t) => {
                const on = time === t;
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={spent}
                    onClick={() => choose(t)}
                    aria-pressed={on}
                    className="rounded-[8px] border py-1.5 text-center text-[12px] font-medium transition-colors"
                    style={{
                      borderColor: on ? "var(--ds-accent)" : LINE,
                      backgroundColor: on ? "var(--ds-accent)" : "#FFFFFF",
                      color: on ? "#FFFFFF" : INK,
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
