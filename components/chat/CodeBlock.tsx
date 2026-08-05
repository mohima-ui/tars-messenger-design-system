"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

/* Code block — syntax-highlighted, with language detection and a copy button.

   The highlighter is a small tokenizer rather than a syntax library: a chat
   message shows a snippet, not a file, and a full grammar per language would
   cost more than it returns here. It handles the things that actually aid
   reading — comments, strings, numbers, keywords, called functions — and
   leaves everything else as plain text.

   Light surface, so the block sits in the thread rather than punching a dark
   hole in it. Token colours were picked for contrast on white — the dark-theme
   pastels used on a code editor's surface would wash out here. */

const SURFACE = "#FFFFFF";
const HEAD = "#FAF7F1";
const EDGE = "#E0DAD3";

const TOKEN_INK = {
  plain: "#333333",
  comment: "#8A8378",
  string: "#1F7A4D",
  number: "#A85B10",
  keyword: "#6D33AA",
  fn: "#1E5FA8",
  meta: "#6E6E6E",
};

const KEYWORDS =
  "const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|import|from|export|default|async|await|try|catch|throw|typeof|interface|type|enum|public|private|def|lambda|None|True|False|null|undefined|true|false";

/* Ordered alternation: comments and strings must win before anything inside
   them is mistaken for a keyword or number. */
const TOKEN = new RegExp(
  [
    "(\\/\\/[^\\n]*|#[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)", // 1 comment
    "(\"(?:[^\"\\\\]|\\\\.)*\"|'(?:[^'\\\\]|\\\\.)*'|`(?:[^`\\\\]|\\\\.)*`)", // 2 string
    `\\b(${KEYWORDS})\\b`, // 3 keyword
    "\\b(\\d+(?:\\.\\d+)?)\\b", // 4 number
    "([A-Za-z_$][\\w$]*)(?=\\s*\\()", // 5 called function
  ].join("|"),
  "g",
);

type Kind = keyof typeof TOKEN_INK;

function highlight(code: string) {
  const out: Array<{ text: string; kind: Kind }> = [];
  let last = 0;
  for (const m of code.matchAll(TOKEN)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ text: code.slice(last, i), kind: "plain" });
    const kind: Kind = m[1]
      ? "comment"
      : m[2]
        ? "string"
        : m[3]
          ? "keyword"
          : m[4]
            ? "number"
            : "fn";
    out.push({ text: m[0], kind });
    last = i + m[0].length;
  }
  if (last < code.length) out.push({ text: code.slice(last), kind: "plain" });
  return out;
}

/** Best-effort language guess when the caller doesn't name one. */
export function detectLanguage(code: string) {
  const c = code.trim();
  if (/^\s*(curl|npm|npx|yarn|pnpm|git|cd|sudo|\$)\s/m.test(c)) return "bash";
  if (/^\s*[{[]/.test(c) && /"[^"]+"\s*:/.test(c) && !/;\s*$/m.test(c)) return "json";
  if (/^\s*(def |import \w+$|print\()/m.test(c)) return "python";
  if (/^\s*</.test(c)) return "html";
  if (/\b(interface|type)\s+\w+\s*[={]/.test(c) || /:\s*(string|number|boolean)\b/.test(c))
    return "typescript";
  return "javascript";
}

export type CodeData = {
  code: string;
  /** Headline above the snippet. */
  title?: string;
  /** Omit to detect from the source. */
  language?: string;
  /** Optional filename shown beside the language. */
  filename?: string;
};

export function CodeBlock({ data }: { data: CodeData }) {
  const [copied, setCopied] = useState(false);
  const language = data.language ?? detectLanguage(data.code);
  const tokens = highlight(data.code);

  const copy = () => {
    navigator.clipboard?.writeText(data.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div
      className="w-full min-w-0 overflow-hidden rounded-[12px] border"
      style={{ borderColor: EDGE, backgroundColor: SURFACE }}
    >
      <div
        className="border-b px-3 py-2"
        style={{ borderColor: EDGE, backgroundColor: HEAD }}
      >
        {data.title && (
          <p className="mb-1 text-[12px] font-semibold leading-snug" style={{ color: TOKEN_INK.plain }}>
            {data.title}
          </p>
        )}

        <div className="flex items-center gap-2">
        <span
          className="font-mono text-[10px] uppercase tracking-wider"
          style={{ color: TOKEN_INK.meta }}
        >
          {language}
        </span>
        {data.filename && (
          <span className="truncate font-mono text-[10px]" style={{ color: "#A8A096" }}>
            {data.filename}
          </span>
        )}

        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy code"}
          className="ml-auto flex items-center gap-1 rounded-[6px] px-1.5 py-1 text-[10px] transition-colors hover:bg-black/[0.04]"
          style={{ color: copied ? TOKEN_INK.string : TOKEN_INK.meta }}
        >
          {copied ? (
            <>
              <Check className="size-3" strokeWidth={2.5} />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3" strokeWidth={2} />
              Copy
            </>
          )}
        </button>
        </div>
      </div>

      {/* long lines scroll here rather than widening the thread */}
      <pre className="overflow-x-auto px-3 py-2.5 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5">
        <code className="font-mono text-[11.5px] leading-[1.65]">
          {tokens.map((t, i) => (
            <span key={i} style={{ color: TOKEN_INK[t.kind] }}>
              {t.text}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
