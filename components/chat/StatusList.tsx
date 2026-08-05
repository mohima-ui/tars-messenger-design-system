"use client";

import { Check } from "lucide-react";

/* Status list — work grouped by state. Each group carries a coloured dot, its
   name and a count; rows sit in a card underneath with a completion mark, the
   item, its tags and a timestamp.

   Grouping beats a flat list here: the count in the header answers "how much is
   sitting in each state" without the reader tallying rows themselves. */

const LINE = "#E0DAD3";
const INK = "#333333";
const MUTED = "#6E6E6E";

/** Dot colour per group state. */
const TONES = {
  done: "#16A34A", // green
  active: "#2563EB", // blue — in progress
  waiting: "#D97706", // amber
  urgent: "#C0392B", // red
} as const;

export type StatusTone = keyof typeof TONES;

/** Tag tints cycle so a row's tags stay distinguishable without meaning
    anything on their own. */
const TAG_TINTS = [
  { bg: "#EAF3EC", ink: "#3C6B4A" }, // green
  { bg: "#E8F0FB", ink: "#1E4E8C" }, // blue
  { bg: "#FBF0E4", ink: "#8A5308" }, // amber
];

export type StatusItem = {
  title: string;
  tags?: string[];
  meta?: string;
  /** Struck through with a filled check, as in a completed task. */
  done?: boolean;
};

export type StatusGroup = {
  name: string;
  tone: StatusTone;
  items: StatusItem[];
};

export type StatusListData = {
  title?: string;
  groups: StatusGroup[];
};

const COLUMN_W = 200;

export function StatusList({
  data,
  /** "list" stacks the groups; "board" lays them out as scrolling columns. */
  layout = "list",
}: {
  data: StatusListData;
  layout?: "list" | "board";
}) {
  if (layout === "board") return <Board data={data} />;

  return (
    <div className="w-full min-w-0">
      {data.title && (
        <p className="mb-2 text-[12px] font-semibold" style={{ color: INK }}>
          {data.title}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {data.groups.map((group) => (
          <div key={group.name}>
            {/* group header — dot, name, count */}
            <div className="mb-1.5 flex items-center gap-2 px-0.5">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: TONES[group.tone] }}
                aria-hidden
              />
              <span className="text-[12px] font-semibold" style={{ color: INK }}>
                {group.name}
              </span>
              <span
                className="rounded-[4px] px-1.5 py-[1px] text-[10px] font-semibold"
                style={{ backgroundColor: "var(--ds-bg-subtle)", color: MUTED }}
              >
                {group.items.length}
              </span>
            </div>

            <div
              className="overflow-hidden rounded-[12px] border bg-white"
              style={{ borderColor: LINE }}
            >
              {group.items.map((item, i) => (
                <div
                  key={item.title}
                  className="flex items-start gap-2.5 px-3 py-2.5"
                  style={{ borderTop: i === 0 ? undefined : `1px solid ${LINE}` }}
                >
                  {item.done ? (
                    <span
                      className="mt-[1px] flex size-4 shrink-0 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: TONES.done }}
                    >
                      <Check className="size-2.5" strokeWidth={3} aria-hidden />
                    </span>
                  ) : (
                    <span
                      className="mt-[1px] size-4 shrink-0 rounded-full border"
                      style={{ borderColor: "#CFC7B8" }}
                      aria-hidden
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[12.5px] font-medium leading-snug"
                      style={{
                        color: item.done ? MUTED : INK,
                        textDecoration: item.done ? "line-through" : undefined,
                      }}
                    >
                      {item.title}
                    </p>

                    {(item.tags?.length || item.meta) && (
                      <div className="mt-1 flex flex-wrap items-center gap-1">
                        {item.meta && (
                          <span className="mr-0.5 text-[10.5px]" style={{ color: "#A8A096" }}>
                            {item.meta}
                          </span>
                        )}
                        {item.tags?.map((tag, t) => {
                          const tint = TAG_TINTS[t % TAG_TINTS.length];
                          return (
                            <span
                              key={tag}
                              className="rounded-[4px] px-1.5 py-[1px] text-[10px] font-medium"
                              style={{ backgroundColor: tint.bg, color: tint.ink }}
                            >
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Board layout — one column per state, scrolling sideways. Columns are 200px,
   so about one and a half fit the thread; w-full + min-w-0 keep the overflow
   inside the rail rather than widening the panel. */
function Board({ data }: { data: StatusListData }) {
  return (
    <div className="w-full min-w-0">
      {data.title && (
        <p className="mb-2 text-[12px] font-semibold" style={{ color: INK }}>
          {data.title}
        </p>
      )}

      <div className="flex w-full min-w-0 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {data.groups.map((group) => (
          <div key={group.name} className="shrink-0" style={{ width: COLUMN_W }}>
            <div className="mb-1.5 flex items-center gap-2 px-1">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: TONES[group.tone] }}
                aria-hidden
              />
              <span className="truncate text-[12px] font-semibold" style={{ color: INK }}>
                {group.name}
              </span>
              <span className="text-[11px]" style={{ color: MUTED }}>
                {group.items.length}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              {group.items.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[10px] border bg-white p-2.5"
                  style={{ borderColor: LINE }}
                >
                  {item.meta && (
                    <p className="font-mono text-[9px] uppercase tracking-wider" style={{ color: "#A8A096" }}>
                      {item.meta}
                    </p>
                  )}
                  <p
                    className="mt-1 text-[12px] font-medium leading-snug"
                    style={{
                      color: item.done ? MUTED : INK,
                      textDecoration: item.done ? "line-through" : undefined,
                    }}
                  >
                    {item.title}
                  </p>
                  {item.tags?.length ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.tags.map((tag, t) => {
                        const tint = TAG_TINTS[t % TAG_TINTS.length];
                        return (
                          <span
                            key={tag}
                            className="rounded-[4px] px-1.5 py-[1px] text-[10px] font-medium"
                            style={{ backgroundColor: tint.bg, color: tint.ink }}
                          >
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
