import type { ReactNode, CSSProperties } from "react";

/* Shared primitives + decorative art for the Tars 3.0 marketing page.
   Brand palette lives here so a re-theme is a one-file change. */
export const GREEN = "#22C55E";
export const GREEN_DARK = "#16A34A";
export const PURPLE = "#6D33AA";
export const PURPLE_DEEP = "#5B189E";
export const INK = "#2F3037";
export const BODY = "#55565F";

export function Shell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto w-full max-w-[1240px] px-6 ${className}`}>{children}</div>;
}

export function GreenButton({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      className={`rounded-lg px-7 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-transform hover:-translate-y-px active:translate-y-0 ${className}`}
      style={{ backgroundColor: GREEN }}
    >
      {children}
    </button>
  );
}

export function PurpleButton({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      className={`rounded-lg px-7 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-transform hover:-translate-y-px ${className}`}
      style={{ backgroundColor: PURPLE_DEEP }}
    >
      {children}
    </button>
  );
}

/** Section heading — the page uses one heavy geometric display style throughout. */
export function Display({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <h2
      className={`text-balance font-bold tracking-[-0.02em] ${className}`}
      style={{ color: INK, ...style }}
    >
      {children}
    </h2>
  );
}

/* ── Decorative art ─────────────────────────────────────────────────────── */

/** Hand-drawn green underline that sits below "outcomes" in the hero. */
export function Squiggle({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 40"
      fill="none"
      aria-hidden
      className={className}
      preserveAspectRatio="none"
    >
      <path
        d="M8 26C120 8 300 4 470 16"
        stroke={GREEN}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M26 34C150 22 320 20 452 28"
        stroke={GREEN}
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}

/** The little ink "sparkle" ticks that flank a few headings. */
export function Ticks({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden className={className}>
      <path d="M6 22L2 30" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M16 14L14 4" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 20L32 12" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/** Stand-in for the 3D torus renders. Swap for real art by dropping a file in
    public/v1/ and replacing this with an <img>. */
export function TorusPlate({
  rings = 3,
  className = "",
}: {
  rings?: 1 | 3;
  className?: string;
}) {
  const positions = rings === 1 ? [0.34] : [0.3, 0.5, 0.7];
  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      <svg viewBox="0 0 760 480" className="block h-full w-full">
        <defs>
          <linearGradient id="plate" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#EFEAF7" />
            <stop offset="55%" stopColor="#E4DDF2" />
            <stop offset="100%" stopColor="#DCD4EC" />
          </linearGradient>
          <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#F5F3FF" />
          </linearGradient>
          <radialGradient id="ringFace" cx="0.35" cy="0.3">
            <stop offset="0%" stopColor="#3B3B45" />
            <stop offset="100%" stopColor="#141419" />
          </radialGradient>
          <filter id="glow" x="-30%" y="-200%" width="160%" height="500%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
          <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>

        <rect width="760" height="480" fill="url(#plate)" />

        {/* dashed contour lines on the "paper" */}
        <g stroke="#9A93AC" strokeWidth="2" strokeDasharray="14 12" opacity="0.45" fill="none">
          <path d="M-20 380C160 330 300 350 460 300S700 250 800 226" />
          <path d="M-20 442C180 400 320 420 500 366S740 320 800 300" />
        </g>

        {/* shadows under each ring */}
        {positions.map((p, i) => (
          <ellipse
            key={`sh-${i}`}
            cx={760 * p + 40}
            cy={rings === 1 ? 360 : 330 - i * 26}
            rx="120"
            ry="16"
            fill="#8B82A3"
            opacity="0.35"
            filter="url(#soft)"
          />
        ))}

        {/* the beam passes behind the rings */}
        <path
          d={
            rings === 1
              ? "M170 400C330 372 520 250 700 96"
              : "M40 330C240 300 520 250 730 200"
          }
          stroke="url(#beam)"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
          filter="url(#glow)"
        />
        <path
          d={
            rings === 1
              ? "M170 400C330 372 520 250 700 96"
              : "M40 330C240 300 520 250 730 200"
          }
          stroke="#F7F2FF"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* rings */}
        {positions.map((p, i) => {
          const cx = 760 * p + 40;
          const cy = rings === 1 ? 300 : 268 - i * 26;
          const rx = rings === 1 ? 78 : 66;
          const ry = rings === 1 ? 92 : 78;
          return (
            <g key={`ring-${i}`}>
              <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#ringFace)" />
              <ellipse cx={cx} cy={cy} rx={rx * 0.42} ry={ry * 0.48} fill="#100F14" />
              <ellipse
                cx={cx}
                cy={cy}
                rx={rx}
                ry={ry}
                fill="none"
                stroke="#585862"
                strokeWidth="1.5"
                opacity="0.7"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
