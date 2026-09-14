/* ── the case study, read from the file it is written in ─────────────────
   A server component that renders app/design/CASE-STUDY.md rather than a copy
   of it. The alternative — the prose in JSX and the markdown beside it — is two
   sources for one document, which is the defect this project spent a fortnight
   removing everywhere else. Editing the file is editing the page.

   The renderer handles only the constructs the document actually uses:
   headings, paragraphs, tables, lists, blockquotes, rules, and inline bold,
   italic and code. It is deliberately not a markdown library. */

import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ReactNode } from "react";

const SOURCE = path.join(process.cwd(), "app/design/CASE-STUDY.md");

/* ── inline ──────────────────────────────────────────────────────────────
   Bold before italic, because ** would otherwise be read as two singles. */
function inline(text: string, key = 0): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${key}-${i++}`;
    if (m[1])
      out.push(
        <strong key={k} className="font-semibold text-[#18181B]">
          {m[1]}
        </strong>,
      );
    else if (m[2]) out.push(<em key={k}>{m[2]}</em>);
    else
      out.push(
        <code
          key={k}
          className="rounded bg-[#F4F4F6] px-1.5 py-0.5 text-[0.9em] text-[#3F3F46]"
        >
          {m[3]}
        </code>,
      );
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

/* ── blocks ─────────────────────────────────────────────────────────────── */
function render(md: string) {
  /* Paragraphs are separated by blank lines; everything inside a block keeps
     its line breaks so tables and lists survive the split. */
  const blocks = md.trim().split(/\n{2,}/);
  const nodes: ReactNode[] = [];
  const contents: { text: string; id: string }[] = [];

  blocks.forEach((raw, i) => {
    const block = raw.trim();
    if (!block) return;
    const lines = block.split("\n");

    if (block === "---") {
      nodes.push(<hr key={i} className="my-14 border-t border-[#EAEAEF]" />);
      return;
    }
    if (block.startsWith("# ")) {
      nodes.push(
        <h1
          key={i}
          className="text-balance text-[34px] font-semibold leading-[1.2] tracking-[-0.01em] text-[#18181B] sm:text-[42px]"
        >
          {inline(block.slice(2), i)}
        </h1>,
      );
      return;
    }
    if (block.startsWith("## ")) {
      const text = block.slice(3);
      const id = slug(text);
      contents.push({ text, id });
      nodes.push(
        <h2
          key={i}
          id={id}
          className="mt-16 scroll-mt-10 text-[22px] font-semibold leading-snug tracking-[-0.005em] text-[#18181B]"
        >
          {inline(text, i)}
        </h2>,
      );
      return;
    }
    if (block.startsWith("### ")) {
      nodes.push(
        <h3
          key={i}
          className="mt-10 text-[16px] font-semibold leading-snug text-[#18181B]"
        >
          {inline(block.slice(4), i)}
        </h3>,
      );
      return;
    }
    /* The three rules are the argument of the whole document, so they are set
       as pull quotes rather than as indented paragraphs. */
    if (block.startsWith("> ")) {
      nodes.push(
        <blockquote
          key={i}
          className="my-8 border-l-2 border-[#7C3AED] py-1 pl-5 text-[19px] font-medium leading-relaxed text-[#27272A]"
        >
          {inline(lines.map((l) => l.replace(/^>\s?/, "")).join(" "), i)}
        </blockquote>,
      );
      return;
    }
    if (block.startsWith("|")) {
      const rows = lines
        .filter((l) => !/^\|[\s:|-]+\|$/.test(l))
        .map((l) =>
          l
            .replace(/^\||\|$/g, "")
            .split("|")
            .map((c) => c.trim()),
        );
      const [head, ...body] = rows;
      nodes.push(
        <div key={i} className="my-8 overflow-x-auto">
          <table className="w-full border-collapse text-left text-[14px]">
            <thead>
              <tr>
                {head.map((c, j) => (
                  <th
                    key={j}
                    className="border-b border-[#E4E4E9] pb-2.5 pr-6 align-bottom text-[12px] font-semibold uppercase tracking-wide text-[#8A8A94]"
                  >
                    {inline(c, i)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((r, j) => (
                <tr key={j}>
                  {r.map((c, k) => (
                    <td
                      key={k}
                      className="border-b border-[#F1F1F4] py-3 pr-6 align-top leading-relaxed text-[#52525B]"
                    >
                      {inline(c, i)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      return;
    }
    if (block.startsWith("- ")) {
      /* A wrapped bullet continues on an indented line, so the block is joined
         back together before it is split on the markers. */
      const items = block
        .split(/\n(?=- )/)
        .map((it) => it.replace(/^-\s+/, "").replace(/\n\s+/g, " "));
      nodes.push(
        <ul key={i} className="my-5 flex flex-col gap-2.5">
          {items.map((it, j) => (
            <li
              key={j}
              className="relative pl-5 text-[16px] leading-relaxed text-[#3F3F46] before:absolute before:left-0 before:top-[0.7em] before:size-1.5 before:rounded-full before:bg-[#D4D4D8]"
            >
              {inline(it, i)}
            </li>
          ))}
        </ul>,
      );
      return;
    }
    /* The metadata line under the title, and the note at the foot, are the only
       paragraphs set apart — one is a caption on the document, the other is a
       reminder to the author. */
    const meta = block.startsWith("**Role:**");
    const aside = block.startsWith("*") && block.endsWith("*");
    nodes.push(
      <p
        key={i}
        className={
          meta
            ? "mt-5 text-[14px] leading-relaxed text-[#6B6B76]"
            : aside
              ? "mt-8 rounded-xl bg-[#FAFAFB] px-5 py-4 text-[14px] leading-relaxed text-[#8A8A94]"
              : "mt-5 text-[16px] leading-[1.75] text-[#3F3F46]"
        }
      >
        {inline(block.replace(/\n/g, " "), i)}
      </p>,
    );
  });

  return { nodes, contents };
}

export default async function CaseStudyPage() {
  const md = await readFile(SOURCE, "utf8");
  const { nodes, contents } = render(md);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex max-w-[1100px] gap-16 px-6 py-16 sm:px-10 sm:py-24">
        {/* ── contents ──
            Sticky, and only where there is room for it. A case study is read
            in one pass, so this is for returning to a section rather than for
            navigating on the way in — which is why it is quiet. */}
        <nav className="sticky top-24 hidden h-fit w-[190px] shrink-0 lg:block">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#A1A1AA]">
            Contents
          </span>
          <ul className="mt-3 flex flex-col gap-2">
            {contents.map((c) => (
              <li key={c.id}>
                <a
                  href={`#${c.id}`}
                  className="block text-[13px] leading-snug text-[#71717A] transition-colors hover:text-[#18181B]"
                >
                  {c.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* A measure, not a container width. Long-form prose is read at around
            sixty-five characters a line whatever the screen is doing. */}
        <article className="min-w-0 max-w-[680px] flex-1">{nodes}</article>
      </div>
    </div>
  );
}
