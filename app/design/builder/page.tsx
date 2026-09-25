"use client";

/* ── THE MESSENGER, AS A DOCUMENT ─────────────────────────────────────────
   A settings panel can only ever offer the properties somebody thought to
   expose. Past a certain depth of customisation that stops scaling: every new
   request is a new control, the panel grows a section a month, and a tenant
   who wants 3px of extra padding on one row still cannot have it.

   So this stops being a form and becomes an editor. The messenger is a tree
   of nodes; the three panes are three views of that one tree — the layers
   list is its structure, the canvas is its render, the inspector is the
   selected node's style. Nothing is "a setting" any more. Everything is a
   property of a node, which is why the depth has no floor.

   The style model is deliberately CSS rather than a house vocabulary. A
   tenant's designer already knows what letter-spacing does, and a bespoke
   name for it is a thing to learn for no gain. ─────────────────────────── */

import { useCallback, useMemo, useRef, useState } from "react";
import {
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignHorizontalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  ChevronDown,
  ChevronRight,
  Circle,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Layers,
  Link2,
  Link2Off,
  Monitor,
  MousePointer2,
  Plus,
  RotateCcw,
  Smartphone,
  Square,
  Type as TypeIcon,
} from "lucide-react";

/* ── the model ─────────────────────────────────────────────────────────── */

type Style = {
  display?: "block" | "flex" | "none";
  flexDirection?: "row" | "column";
  alignItems?: "flex-start" | "center" | "flex-end" | "stretch";
  justifyContent?: "flex-start" | "center" | "flex-end" | "space-between";
  gap?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  width?: string;
  height?: string;
  minHeight?: string;
  maxWidth?: string;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: number;
  color?: string;
  background?: string;
  borderWidth?: number;
  borderColor?: string;
  radiusTL?: number;
  radiusTR?: number;
  radiusBR?: number;
  radiusBL?: number;
  shadow?: string;
  opacity?: number;
};

type Kind = "box" | "text" | "avatar" | "icon" | "field";

type Node = {
  id: string;
  name: string;
  kind: Kind;
  text?: string;
  style: Style;
  children?: Node[];
};

/* The seed. Written as the messenger anyone would recognise, so the editor
   opens on something finished rather than on an empty artboard — the job here
   is adjusting a product, not drawing one from nothing. */
const SEED: Node = {
  id: "root",
  name: "Messenger",
  kind: "box",
  style: {
    display: "flex",
    flexDirection: "column",
    width: "390px",
    height: "620px",
    background: "#FFFFFF",
    radiusTL: 20,
    radiusTR: 20,
    radiusBR: 20,
    radiusBL: 20,
    shadow: "0 18px 50px -12px rgba(15,17,26,0.28)",
  },
  children: [
    {
      id: "header",
      name: "Header",
      kind: "box",
      style: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingTop: 12,
        paddingRight: 16,
        paddingBottom: 12,
        paddingLeft: 16,
        borderWidth: 1,
        borderColor: "#E9EAEA",
        background: "#FFFFFF",
      },
      children: [
        {
          id: "avatar",
          name: "Avatar",
          kind: "avatar",
          text: "T",
          style: {
            width: "36px",
            height: "36px",
            background: "#632E9A",
            color: "#FFFFFF",
            fontSize: 13,
            fontWeight: 600,
            radiusTL: 999,
            radiusTR: 999,
            radiusBR: 999,
            radiusBL: 999,
          },
        },
        {
          id: "titles",
          name: "Titles",
          kind: "box",
          style: { display: "flex", flexDirection: "column", gap: 1 },
          children: [
            {
              id: "title",
              name: "Agent name",
              kind: "text",
              text: "Tars",
              style: { fontSize: 14, fontWeight: 600, color: "#16181D", lineHeight: 1.2 },
            },
            {
              id: "subtitle",
              name: "Subtitle",
              kind: "text",
              text: "Virtual Assistant",
              style: { fontSize: 11, fontWeight: 400, color: "#9CA3AF", lineHeight: 1.2 },
            },
          ],
        },
      ],
    },
    {
      id: "thread",
      name: "Conversation",
      kind: "box",
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        paddingTop: 16,
        paddingRight: 16,
        paddingBottom: 16,
        paddingLeft: 16,
        height: "auto",
        background: "#FFFFFF",
      },
      children: [
        {
          id: "aiMsg",
          name: "AI message",
          kind: "text",
          text: "Hi — looking for the right setup for your business?",
          style: {
            fontSize: 14,
            lineHeight: 1.55,
            color: "#16181D",
            maxWidth: "90%",
          },
        },
        {
          id: "userMsg",
          name: "User message",
          kind: "text",
          text: "I take payments online",
          style: {
            fontSize: 14,
            lineHeight: 1.55,
            color: "#16181D",
            background: "#F2F2F2",
            paddingTop: 8,
            paddingRight: 14,
            paddingBottom: 8,
            paddingLeft: 14,
            marginLeft: 60,
            radiusTL: 14,
            radiusTR: 14,
            radiusBR: 4,
            radiusBL: 14,
          },
        },
        {
          id: "chips",
          name: "Suggestions",
          kind: "box",
          style: { display: "flex", flexDirection: "row", gap: 6 },
          children: [
            {
              id: "chip1",
              name: "Chip",
              kind: "text",
              text: "Get a quote",
              style: {
                fontSize: 12,
                color: "#4B2A7B",
                background: "#F4EEFC",
                paddingTop: 6,
                paddingRight: 12,
                paddingBottom: 6,
                paddingLeft: 12,
                radiusTL: 999,
                radiusTR: 999,
                radiusBR: 999,
                radiusBL: 999,
              },
            },
            {
              id: "chip2",
              name: "Chip",
              kind: "text",
              text: "Talk to sales",
              style: {
                fontSize: 12,
                color: "#4B2A7B",
                background: "#F4EEFC",
                paddingTop: 6,
                paddingRight: 12,
                paddingBottom: 6,
                paddingLeft: 12,
                radiusTL: 999,
                radiusTR: 999,
                radiusBR: 999,
                radiusBL: 999,
              },
            },
          ],
        },
      ],
    },
    {
      id: "composer",
      name: "Composer",
      kind: "box",
      style: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 0,
        marginRight: 16,
        marginBottom: 16,
        marginLeft: 16,
        paddingTop: 6,
        paddingRight: 6,
        paddingBottom: 6,
        paddingLeft: 10,
        borderWidth: 1,
        borderColor: "#E9EAEA",
        background: "#FFFFFF",
        radiusTL: 999,
        radiusTR: 999,
        radiusBR: 999,
        radiusBL: 999,
      },
      children: [
        {
          id: "field",
          name: "Input",
          kind: "field",
          text: "Ask me anything…",
          style: { fontSize: 14, color: "#9CA3AF", width: "100%" },
        },
        {
          id: "send",
          name: "Send",
          kind: "icon",
          style: {
            width: "34px",
            height: "34px",
            background: "#632E9A",
            color: "#FFFFFF",
            radiusTL: 999,
            radiusTR: 999,
            radiusBR: 999,
            radiusBL: 999,
          },
        },
      ],
    },
  ],
};

/* ── tree helpers ──────────────────────────────────────────────────────── */

function findNode(n: Node, id: string): Node | null {
  if (n.id === id) return n;
  for (const c of n.children ?? []) {
    const hit = findNode(c, id);
    if (hit) return hit;
  }
  return null;
}
function pathTo(n: Node, id: string, trail: Node[] = []): Node[] | null {
  const next = [...trail, n];
  if (n.id === id) return next;
  for (const c of n.children ?? []) {
    const hit = pathTo(c, id, next);
    if (hit) return hit;
  }
  return null;
}
function mapNode(n: Node, id: string, fn: (n: Node) => Node): Node {
  if (n.id === id) return fn(n);
  if (!n.children) return n;
  return { ...n, children: n.children.map((c) => mapNode(c, id, fn)) };
}

/* ── the canvas ────────────────────────────────────────────────────────── */

function toCss(s: Style): React.CSSProperties {
  const r = (v?: number) => (v === undefined ? undefined : v);
  return {
    display: s.display,
    flexDirection: s.flexDirection,
    alignItems: s.alignItems,
    justifyContent: s.justifyContent,
    gap: s.gap,
    paddingTop: s.paddingTop,
    paddingRight: s.paddingRight,
    paddingBottom: s.paddingBottom,
    paddingLeft: s.paddingLeft,
    marginTop: s.marginTop,
    marginRight: s.marginRight,
    marginBottom: s.marginBottom,
    marginLeft: s.marginLeft,
    width: s.width,
    height: s.height,
    minHeight: s.minHeight,
    maxWidth: s.maxWidth,
    fontSize: s.fontSize,
    fontWeight: s.fontWeight,
    lineHeight: s.lineHeight,
    letterSpacing: s.letterSpacing === undefined ? undefined : `${s.letterSpacing}px`,
    color: s.color,
    background: s.background,
    /* One inset ring rather than a real border, so adding an edge never
       changes the box it is drawn on — a border that reflows the layout is
       the single most annoying thing in an editor like this. */
    boxShadow: [
      s.borderWidth ? `inset 0 0 0 ${s.borderWidth}px ${s.borderColor ?? "#E5E5E5"}` : "",
      s.shadow ?? "",
    ]
      .filter(Boolean)
      .join(", "),
    borderTopLeftRadius: r(s.radiusTL),
    borderTopRightRadius: r(s.radiusTR),
    borderBottomRightRadius: r(s.radiusBR),
    borderBottomLeftRadius: r(s.radiusBL),
    opacity: s.opacity,
  };
}

function Render({
  node,
  sel,
  hover,
  onSelect,
  onHover,
}: {
  node: Node;
  sel: string | null;
  hover: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const on = sel === node.id;
  const hot = hover === node.id;
  const css = toCss(node.style);
  const ring = on
    ? "0 0 0 1.5px #2563EB"
    : hot
      ? "0 0 0 1px rgba(37,99,235,0.45)"
      : "";
  const style: React.CSSProperties = {
    ...css,
    boxShadow: [css.boxShadow, ring].filter(Boolean).join(", "),
    position: "relative",
  };

  const props = {
    style,
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(node.id);
    },
    onMouseEnter: (e: React.MouseEvent) => {
      e.stopPropagation();
      onHover(node.id);
    },
    onMouseLeave: () => onHover(null),
  };

  if (node.kind === "avatar" || node.kind === "icon") {
    return (
      <div {...props} style={{ ...style, display: "grid", placeItems: "center" }}>
        {node.kind === "avatar" ? (
          node.text
        ) : (
          <Plus className="size-4" strokeWidth={2} />
        )}
      </div>
    );
  }
  if (node.kind === "text" || node.kind === "field") {
    return (
      <div {...props} style={{ ...style, width: style.width ?? "fit-content" }}>
        {node.text}
      </div>
    );
  }
  return (
    <div {...props}>
      {node.children?.map((c) => (
        <Render
          key={c.id}
          node={c}
          sel={sel}
          hover={hover}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}
    </div>
  );
}

/* ── the layers list ───────────────────────────────────────────────────── */

const KIND_ICON: Record<Kind, typeof Square> = {
  box: Square,
  text: TypeIcon,
  avatar: Circle,
  icon: ImageIcon,
  field: TypeIcon,
};

function LayerRow({
  node,
  depth,
  sel,
  open,
  toggle,
  onSelect,
  onHover,
  hidden,
  toggleHidden,
}: {
  node: Node;
  depth: number;
  sel: string | null;
  open: Set<string>;
  toggle: (id: string) => void;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  hidden: Set<string>;
  toggleHidden: (id: string) => void;
}) {
  const kids = node.children ?? [];
  const isOpen = open.has(node.id);
  const Icon = KIND_ICON[node.kind];
  const off = hidden.has(node.id);
  return (
    <>
      <div
        onClick={() => onSelect(node.id)}
        onMouseEnter={() => onHover(node.id)}
        onMouseLeave={() => onHover(null)}
        className={`group flex cursor-pointer items-center gap-1 rounded py-1 pr-1 text-[12px] ${
          sel === node.id
            ? "bg-[#EEF3FF] font-medium text-[#1D4ED8]"
            : "text-[#444] hover:bg-[#F4F4F5]"
        }`}
        style={{ paddingLeft: 4 + depth * 12 }}
      >
        {kids.length ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggle(node.id);
            }}
            className="grid size-4 shrink-0 place-items-center text-[#9A9A9A]"
          >
            {isOpen ? (
              <ChevronDown className="size-3" strokeWidth={2.5} />
            ) : (
              <ChevronRight className="size-3" strokeWidth={2.5} />
            )}
          </button>
        ) : (
          <span className="size-4 shrink-0" />
        )}
        <Icon className="size-3 shrink-0 text-[#9A9A9A]" strokeWidth={2} />
        <span className={`min-w-0 flex-1 truncate ${off ? "opacity-40" : ""}`}>
          {node.name}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleHidden(node.id);
          }}
          className={`grid size-4 shrink-0 place-items-center text-[#9A9A9A] ${
            off ? "" : "opacity-0 group-hover:opacity-100"
          }`}
          aria-label={off ? "Show" : "Hide"}
        >
          {off ? (
            <EyeOff className="size-3" strokeWidth={2} />
          ) : (
            <Eye className="size-3" strokeWidth={2} />
          )}
        </button>
      </div>
      {isOpen &&
        kids.map((c) => (
          <LayerRow
            key={c.id}
            node={c}
            depth={depth + 1}
            sel={sel}
            open={open}
            toggle={toggle}
            onSelect={onSelect}
            onHover={onHover}
            hidden={hidden}
            toggleHidden={toggleHidden}
          />
        ))}
    </>
  );
}

/* ── inspector primitives ──────────────────────────────────────────────── */

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-[#EFEFF1] px-3 py-2.5">
      <button
        onClick={() => setOpen(!open)}
        className="mb-2 flex w-full items-center text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]"
      >
        <span className="flex-1 text-left">{title}</span>
        <ChevronDown
          className={`size-3 text-[#B0B0B0] transition-transform ${open ? "" : "-rotate-90"}`}
          strokeWidth={2.5}
        />
      </button>
      {open && <div className="flex flex-col gap-2">{children}</div>}
    </section>
  );
}

function Num({
  label,
  value,
  onChange,
  step = 1,
  suffix,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  step?: number;
  suffix?: string;
}) {
  /* Drag the label to scrub, the way every editor of this kind works — the
     keyboard is for a value you know and the drag is for one you are looking
     for. */
  const drag = useRef<{ x: number; from: number } | null>(null);
  return (
    <div className="flex h-7 items-center rounded-md bg-[#F4F4F6] pl-1.5 pr-1">
      <span
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, from: value ?? 0 };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          onChange(Math.max(0, Math.round(d.from + (e.clientX - d.x) * step)));
        }}
        onPointerUp={() => (drag.current = null)}
        className="w-[42px] shrink-0 cursor-ew-resize select-none text-[10px] uppercase tracking-wide text-[#9A9A9A]"
      >
        {label}
      </span>
      <input
        value={value ?? ""}
        placeholder="auto"
        onChange={(e) => {
          const v = e.target.value.trim();
          onChange(v === "" ? undefined : Number(v));
        }}
        className="h-full min-w-0 flex-1 bg-transparent text-right text-[12px] tabular-nums text-[#222] outline-none placeholder:text-[#C0C0C0]"
      />
      {suffix && <span className="pl-0.5 text-[10px] text-[#B0B0B0]">{suffix}</span>}
    </div>
  );
}

function Text({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}) {
  return (
    <div className="flex h-7 items-center rounded-md bg-[#F4F4F6] pl-1.5 pr-1">
      <span className="w-[42px] shrink-0 text-[10px] uppercase tracking-wide text-[#9A9A9A]">
        {label}
      </span>
      <input
        value={value ?? ""}
        placeholder="auto"
        onChange={(e) => onChange(e.target.value || undefined)}
        className="h-full min-w-0 flex-1 bg-transparent text-right text-[12px] text-[#222] outline-none placeholder:text-[#C0C0C0]"
      />
    </div>
  );
}

function Swatch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex h-7 items-center gap-1.5 rounded-md bg-[#F4F4F6] pl-1.5 pr-1">
      <span className="w-[42px] shrink-0 text-[10px] uppercase tracking-wide text-[#9A9A9A]">
        {label}
      </span>
      <label
        className="size-4 shrink-0 cursor-pointer rounded ring-1 ring-black/10"
        style={{ background: value ?? "transparent" }}
      >
        <input
          type="color"
          value={value ?? "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="size-0 opacity-0"
        />
      </label>
      <input
        value={value ?? ""}
        placeholder="none"
        onChange={(e) => onChange(e.target.value)}
        className="h-full min-w-0 flex-1 bg-transparent text-right font-mono text-[11px] uppercase text-[#222] outline-none placeholder:text-[#C0C0C0]"
      />
    </div>
  );
}

function Seg<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T | undefined;
  onChange: (v: T) => void;
  options: { v: T; label?: string; Icon?: typeof Square }[];
}) {
  return (
    <div className="flex gap-0.5 rounded-md bg-[#F4F4F6] p-0.5">
      {options.map((o) => {
        const on = value === o.v;
        return (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            title={o.label}
            className={`flex h-6 flex-1 items-center justify-center gap-1 rounded text-[11px] transition-colors ${
              on ? "bg-white font-medium text-[#1D4ED8] shadow-sm" : "text-[#777]"
            }`}
          >
            {o.Icon ? <o.Icon className="size-3.5" strokeWidth={2} /> : o.label}
          </button>
        );
      })}
    </div>
  );
}

/* The box model, drawn. Four paddings inside four margins, which is the one
   place a picture beats four labelled fields — the numbers mean nothing
   without knowing which edge they are on. */
function BoxModel({
  s,
  set,
}: {
  s: Style;
  set: (patch: Partial<Style>) => void;
}) {
  const cell =
    "w-9 bg-transparent text-center text-[10px] tabular-nums text-[#555] outline-none placeholder:text-[#C8C8C8]";
  const n = (v?: number) => (v === undefined ? "" : String(v));
  const put = (k: keyof Style) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.trim();
    set({ [k]: v === "" ? undefined : Number(v) } as Partial<Style>);
  };
  return (
    <div className="rounded-md border border-dashed border-[#D8D8DC] p-1.5">
      <div className="mb-0.5 flex justify-center">
        <input className={cell} placeholder="0" value={n(s.marginTop)} onChange={put("marginTop")} />
      </div>
      <div className="flex items-stretch gap-1">
        <div className="flex items-center">
          <input className={cell} placeholder="0" value={n(s.marginLeft)} onChange={put("marginLeft")} />
        </div>
        <div className="flex-1 rounded border border-[#E3E3E7] bg-[#FAFAFB] p-1.5">
          <div className="mb-0.5 flex justify-center">
            <input className={cell} placeholder="0" value={n(s.paddingTop)} onChange={put("paddingTop")} />
          </div>
          <div className="flex items-center gap-1">
            <input className={cell} placeholder="0" value={n(s.paddingLeft)} onChange={put("paddingLeft")} />
            <span className="flex-1 rounded bg-[#E9EDF7] py-2 text-center text-[9px] uppercase tracking-wide text-[#8A93A8]">
              content
            </span>
            <input className={cell} placeholder="0" value={n(s.paddingRight)} onChange={put("paddingRight")} />
          </div>
          <div className="mt-0.5 flex justify-center">
            <input className={cell} placeholder="0" value={n(s.paddingBottom)} onChange={put("paddingBottom")} />
          </div>
        </div>
        <div className="flex items-center">
          <input className={cell} placeholder="0" value={n(s.marginRight)} onChange={put("marginRight")} />
        </div>
      </div>
      <div className="mt-0.5 flex justify-center">
        <input className={cell} placeholder="0" value={n(s.marginBottom)} onChange={put("marginBottom")} />
      </div>
    </div>
  );
}

/* ── the editor ────────────────────────────────────────────────────────── */

const SHADOWS: { label: string; v: string }[] = [
  { label: "None", v: "" },
  { label: "Soft", v: "0 6px 20px -8px rgba(15,17,26,0.18)" },
  { label: "Lifted", v: "0 18px 50px -12px rgba(15,17,26,0.28)" },
  { label: "Deep", v: "0 28px 70px -16px rgba(15,17,26,0.38)" },
];

export default function Builder() {
  const [tree, setTree] = useState<Node>(SEED);
  const [sel, setSel] = useState<string | null>("userMsg");
  const [hover, setHover] = useState<string | null>(null);
  const [open, setOpen] = useState<Set<string>>(
    new Set(["root", "header", "thread", "composer", "titles", "chips"]),
  );
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [linked, setLinked] = useState(true);

  const node = sel ? findNode(tree, sel) : null;
  const trail = useMemo(() => (sel ? (pathTo(tree, sel) ?? []) : []), [tree, sel]);

  const set = useCallback(
    (patch: Partial<Style>) => {
      if (!sel) return;
      setTree((t) =>
        mapNode(t, sel, (n) => ({ ...n, style: { ...n.style, ...patch } })),
      );
    },
    [sel],
  );

  const toggle = (id: string) =>
    setOpen((o) => {
      const next = new Set(o);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleHidden = (id: string) =>
    setHidden((h) => {
      const next = new Set(h);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  /* Hidden is a view state, not a style: a node someone has switched off in
     the layers list is still in the document, and turning it back on must
     return exactly what was there. */
  const visible = useMemo(() => {
    const strip = (n: Node): Node | null => {
      if (hidden.has(n.id)) return null;
      return {
        ...n,
        children: (n.children ?? [])
          .map(strip)
          .filter((c): c is Node => c !== null),
      };
    };
    return strip(tree) ?? tree;
  }, [tree, hidden]);

  const s = node?.style ?? {};
  const radii = [s.radiusTL, s.radiusTR, s.radiusBR, s.radiusBL];
  const setRadius = (v: number | undefined, which?: 0 | 1 | 2 | 3) => {
    if (linked || which === undefined) {
      set({ radiusTL: v, radiusTR: v, radiusBR: v, radiusBL: v });
    } else {
      set(
        [
          { radiusTL: v },
          { radiusTR: v },
          { radiusBR: v },
          { radiusBL: v },
        ][which],
      );
    }
  };

  return (
    <main className="flex h-screen flex-col bg-[#F1F1F3] text-[#222]">
      {/* top bar */}
      <div className="flex h-11 shrink-0 items-center gap-3 border-b border-[#E2E2E6] bg-white px-3">
        <Layers className="size-4 text-[#632E9A]" strokeWidth={2} />
        <span className="text-[13px] font-semibold">Messenger</span>
        <span className="text-[11px] text-[#A8A8A8]">Builder</span>
        <div className="ml-4 flex items-center gap-0.5 rounded-md bg-[#F4F4F6] p-0.5">
          {(
            [
              ["desktop", Monitor],
              ["mobile", Smartphone],
            ] as const
          ).map(([v, Icon]) => (
            <button
              key={v}
              onClick={() => setDevice(v)}
              className={`grid size-6 place-items-center rounded ${
                device === v ? "bg-white text-[#1D4ED8] shadow-sm" : "text-[#888]"
              }`}
            >
              <Icon className="size-3.5" strokeWidth={2} />
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setTree(SEED);
            setHidden(new Set());
          }}
          className="ml-auto flex items-center gap-1.5 rounded-md border border-[#E2E2E6] px-2.5 py-1 text-[12px] text-[#555]"
        >
          <RotateCcw className="size-3" strokeWidth={2} />
          Reset
        </button>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* ── layers ── */}
        <aside className="flex w-[228px] shrink-0 flex-col border-r border-[#E2E2E6] bg-white">
          <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
            Layers
          </p>
          <div className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-3">
            <LayerRow
              node={tree}
              depth={0}
              sel={sel}
              open={open}
              toggle={toggle}
              onSelect={setSel}
              onHover={setHover}
              hidden={hidden}
              toggleHidden={toggleHidden}
            />
          </div>
        </aside>

        {/* ── canvas ── */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div
            className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-8"
            onClick={() => setSel(null)}
          >
            <div style={{ width: device === "mobile" ? 360 : undefined }}>
              <Render
                node={visible}
                sel={sel}
                hover={hover}
                onSelect={setSel}
                onHover={setHover}
              />
            </div>
          </div>
          {/* breadcrumb — where the selection sits in the tree, which the
              canvas alone cannot say */}
          <div className="flex h-8 shrink-0 items-center gap-1 border-t border-[#E2E2E6] bg-white px-3 text-[11px] text-[#777]">
            <MousePointer2 className="size-3 shrink-0 text-[#A8A8A8]" strokeWidth={2} />
            {trail.length === 0 ? (
              <span className="text-[#A8A8A8]">Nothing selected</span>
            ) : (
              trail.map((n, i) => (
                <span key={n.id} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="size-3 text-[#C8C8C8]" strokeWidth={2.5} />}
                  <button
                    onClick={() => setSel(n.id)}
                    className={i === trail.length - 1 ? "font-medium text-[#1D4ED8]" : ""}
                  >
                    {n.name}
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* ── inspector ── */}
        <aside className="flex w-[268px] shrink-0 flex-col border-l border-[#E2E2E6] bg-white">
          {!node ? (
            <p className="p-4 text-[12px] leading-relaxed text-[#999]">
              Select a layer on the left, or click a part of the messenger.
            </p>
          ) : (
            <>
              <div className="flex h-9 shrink-0 items-center gap-2 border-b border-[#EFEFF1] px-3">
                <span className="text-[12px] font-semibold">{node.name}</span>
                <span className="rounded bg-[#F4F4F6] px-1.5 py-0.5 font-mono text-[10px] text-[#888]">
                  {node.kind}
                </span>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                {node.children && (
                  <Section title="Layout">
                    <Seg
                      value={s.display}
                      onChange={(v) => set({ display: v })}
                      options={[
                        { v: "block", label: "Block" },
                        { v: "flex", label: "Flex" },
                        { v: "none", label: "None" },
                      ]}
                    />
                    {s.display === "flex" && (
                      <>
                        <Seg
                          value={s.flexDirection}
                          onChange={(v) => set({ flexDirection: v })}
                          options={[
                            { v: "row", label: "Row" },
                            { v: "column", label: "Column" },
                          ]}
                        />
                        <Seg
                          value={s.alignItems}
                          onChange={(v) => set({ alignItems: v })}
                          options={[
                            { v: "flex-start", label: "Start", Icon: AlignVerticalJustifyStart },
                            { v: "center", label: "Centre", Icon: AlignVerticalJustifyCenter },
                            { v: "flex-end", label: "End", Icon: AlignVerticalJustifyEnd },
                          ]}
                        />
                        <Seg
                          value={s.justifyContent}
                          onChange={(v) => set({ justifyContent: v })}
                          options={[
                            { v: "flex-start", label: "Start", Icon: AlignHorizontalJustifyStart },
                            { v: "center", label: "Centre", Icon: AlignHorizontalJustifyCenter },
                            { v: "flex-end", label: "End", Icon: AlignHorizontalJustifyEnd },
                          ]}
                        />
                        <Num label="Gap" value={s.gap} onChange={(v) => set({ gap: v })} suffix="px" />
                      </>
                    )}
                  </Section>
                )}

                <Section title="Spacing">
                  <BoxModel s={s} set={set} />
                </Section>

                <Section title="Size">
                  <div className="grid grid-cols-2 gap-1.5">
                    <Text label="W" value={s.width} onChange={(v) => set({ width: v })} />
                    <Text label="H" value={s.height} onChange={(v) => set({ height: v })} />
                    <Text label="Min H" value={s.minHeight} onChange={(v) => set({ minHeight: v })} />
                    <Text label="Max W" value={s.maxWidth} onChange={(v) => set({ maxWidth: v })} />
                  </div>
                </Section>

                {(node.kind === "text" || node.kind === "field" || node.kind === "avatar") && (
                  <Section title="Typography">
                    <div className="grid grid-cols-2 gap-1.5">
                      <Num label="Size" value={s.fontSize} onChange={(v) => set({ fontSize: v })} suffix="px" />
                      <Num label="Weight" value={s.fontWeight} onChange={(v) => set({ fontWeight: v })} step={10} />
                      <Num label="Line" value={s.lineHeight} onChange={(v) => set({ lineHeight: v })} />
                      <Num label="Track" value={s.letterSpacing} onChange={(v) => set({ letterSpacing: v })} suffix="px" />
                    </div>
                    <Swatch label="Colour" value={s.color} onChange={(v) => set({ color: v })} />
                  </Section>
                )}

                <Section title="Fill">
                  <Swatch label="BG" value={s.background} onChange={(v) => set({ background: v })} />
                </Section>

                <Section title="Border">
                  <div className="grid grid-cols-2 gap-1.5">
                    <Num label="Width" value={s.borderWidth} onChange={(v) => set({ borderWidth: v })} suffix="px" />
                    <Swatch label="Colour" value={s.borderColor} onChange={(v) => set({ borderColor: v })} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setLinked(!linked)}
                      title={linked ? "Corners linked" : "Corners independent"}
                      className={`grid size-7 shrink-0 place-items-center rounded-md ${
                        linked ? "bg-[#EEF3FF] text-[#1D4ED8]" : "bg-[#F4F4F6] text-[#888]"
                      }`}
                    >
                      {linked ? (
                        <Link2 className="size-3.5" strokeWidth={2} />
                      ) : (
                        <Link2Off className="size-3.5" strokeWidth={2} />
                      )}
                    </button>
                    {linked ? (
                      <div className="min-w-0 flex-1">
                        <Num
                          label="Radius"
                          value={radii[0]}
                          onChange={(v) => setRadius(v)}
                          suffix="px"
                        />
                      </div>
                    ) : (
                      <div className="grid min-w-0 flex-1 grid-cols-2 gap-1.5">
                        {(["TL", "TR", "BR", "BL"] as const).map((k, i) => (
                          <Num
                            key={k}
                            label={k}
                            value={radii[i]}
                            onChange={(v) => setRadius(v, i as 0 | 1 | 2 | 3)}
                            suffix="px"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </Section>

                <Section title="Effects">
                  <Seg
                    value={SHADOWS.find((x) => x.v === (s.shadow ?? ""))?.label}
                    onChange={(label) =>
                      set({ shadow: SHADOWS.find((x) => x.label === label)?.v || undefined })
                    }
                    options={SHADOWS.map((x) => ({ v: x.label, label: x.label }))}
                  />
                  <Num
                    label="Opacity"
                    value={s.opacity === undefined ? undefined : Math.round(s.opacity * 100)}
                    onChange={(v) => set({ opacity: v === undefined ? undefined : v / 100 })}
                    suffix="%"
                  />
                </Section>
              </div>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
