"use client";

import { Check, Minus } from "lucide-react";

/* Data table — tabular data inside the thread. Four columns don't fit a 364px
   column, so the table scrolls sideways within its own container (w-full +
   min-w-0, or the flex parent would size to the table and slide the panel).

   "Yes" / "No" cells render as marks rather than words: at a glance a column of
   ticks reads far faster than a column of text, and the label is kept for
   screen readers. */

const LINE = "#E0DAD3";
const INK = "#333333";
const MUTED = "#6E6E6E";
const SUCCESS = "#16A34A";

export type TableData = {
  title?: string;
  columns: string[];
  /** Row cells, aligned to `columns`. "Yes"/"No" become marks. */
  rows: string[][];
};

function Cell({ value }: { value: string }) {
  const yes = value.toLowerCase() === "yes";
  const no = value.toLowerCase() === "no";

  if (!yes && !no) {
    return (
      <span className="text-[12px]" style={{ color: INK }}>
        {value}
      </span>
    );
  }

  return (
    <span className="inline-flex" title={value} aria-label={value}>
      {yes ? (
        <Check className="size-4" strokeWidth={2.5} style={{ color: SUCCESS }} aria-hidden />
      ) : (
        <Minus className="size-4" strokeWidth={2.5} style={{ color: "#C4BDB1" }} aria-hidden />
      )}
    </span>
  );
}

export function DataTable({ data }: { data: TableData }) {
  return (
    <div className="w-full min-w-0">
      {data.title && (
        <p className="mb-1.5 text-[12px] font-semibold" style={{ color: INK }}>
          {data.title}
        </p>
      )}

      <div
        className="w-full min-w-0 overflow-x-auto rounded-[12px] border bg-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ borderColor: LINE }}
      >
        <table className="w-max min-w-full border-collapse text-left">
          <thead>
            <tr style={{ backgroundColor: "var(--ds-bg-paper)" }}>
              {data.columns.map((c, i) => (
                <th
                  key={c}
                  scope="col"
                  className={`whitespace-nowrap px-3 py-2 text-[10px] font-semibold uppercase tracking-wider ${
                    i === 0 ? "" : "text-center"
                  }`}
                  style={{ color: MUTED, borderBottom: `1px solid ${LINE}` }}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, r) => (
              <tr key={row[0]}>
                {row.map((cell, i) => (
                  <td
                    key={i}
                    className={`whitespace-nowrap px-3 py-2 ${i === 0 ? "" : "text-center"}`}
                    style={{
                      borderTop: r === 0 ? undefined : `1px solid ${LINE}`,
                      color: INK,
                    }}
                  >
                    {i === 0 ? (
                      <span className="text-[12px] font-medium">{cell}</span>
                    ) : (
                      <Cell value={cell} />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
