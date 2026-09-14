"use client";

import { useMemo, useState, useEffect, useRef, useCallback, type CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import {
  Check,
  RotateCcw,
  Lock,
  Monitor,
  Tablet,
  Smartphone,
  ImagePlus,
  MoreVertical,
  ArrowUp,
  Plus,
  Mic,
  X,
  Zap,
  Info,
  Sparkles,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Bot,
  PanelLeft,
  BookOpen,
  Wrench,
  MessagesSquare,
  Megaphone,
  Users,
  BarChart3,
  LayoutGrid,
  Settings,
  Palette,
  Share2,
  Activity,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────
   Design section — the customer-facing customization panel.
   Philosophy: one accent + logo + a few words. Everything else derived.
   The dashboard chrome is always neutral; only the PREVIEW reflects the
   customer's theme. ───────────────────────────────────────────────────── */

type Device = "desktop" | "tablet" | "mobile";

/* ─── colour engine: brand hex → accent-soft / border / ink ───────────────
   Convert to OKLCH, hold the hue, set lightness + a (mostly fixed) chroma,
   convert back to hex. Fixed-chroma targets match the hand-tuned tenant
   trios across hues (purple / blue / red) far better than mixing-with-white,
   which greys the tint out. Computed in JS so we can show real hex values
   and so the embed never depends on CSS relative-colour support. */
const srgbToLin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const linToSrgb = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

function hexToOklch(hex: string) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => srgbToLin(parseInt(h.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(A, B), H: Math.atan2(B, A) };
}

function oklchToHex(L: number, C: number, H: number) {
  const A = C * Math.cos(H);
  const B = C * Math.sin(H);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((v) => Math.round(clamp(linToSrgb(v), 0, 1) * 255));
  return "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
}

function deriveShades(accent: string) {
  const valid = /^#[0-9a-fA-F]{6}$/.test(accent);
  const { L, C, H } = hexToOklch(valid ? accent : "#632E9A");
  return {
    soft: oklchToHex(0.93, Math.min(0.03, C), H),
    border: oklchToHex(0.78, Math.min(0.09, C), H),
    ink: oklchToHex(clamp(L * 0.8, 0.28, 0.5), C * 0.8, H),
  };
}

/* derived theme + accent shades — the whole engine in one place */
function useTheme(accent: string) {
  return useMemo(() => {
    const neutral = {
      canvas: "#FFFDFA",
      surface: "#FFFFFF",
      paper: "#F9F3EA",
      line: "#E0DAD3",
      ink: "#333333",
      secondary: "#6E6E6E",
      muted: "#979797",
    };
    const { soft, border, ink } = deriveShades(accent);
    return { neutral, accent, bubbleFill: soft, bubbleBorder: border, bubbleInk: ink };
  }, [accent]);
}

export default function DesignPage() {
  // single view selector drives the preview: launcher widget, or the
  // messenger at desktop / tablet / mobile widths.
  const [view, setView] = useState<"widget" | Device>("widget");

  const [accent, setAccent] = useState("#632E9A");
  const [name, setName] = useState("Tars");
  const [subtitle, setSubtitle] = useState("Virtual Assistant");
  const [disclaimer, setDisclaimer] = useState("Tars can make mistakes. Check important info.");
  const [disclaimerOn, setDisclaimerOn] = useState(false);
  const [brandingOn, setBrandingOn] = useState(true);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [logoOnly, setLogoOnly] = useState(false);

  const [placeholder, setPlaceholder] = useState("Ask me anything…");
  // preview-only: show the widget over a screenshot of the customer's site
  const [siteUrl, setSiteUrl] = useState("");
  const [starters, setStarters] = useState<string[]>([
    "Get a product demo",
    "Check pricing and plans",
    "What is an AI agent?",
  ]);

  const t = useTheme(accent);

  /* ── save / dirty / publish state ── */
  const current = useMemo(
    () => ({ accent, name, subtitle, disclaimer, disclaimerOn, brandingOn, avatar, logoOnly, placeholder, starters }),
    [accent, name, subtitle, disclaimer, disclaimerOn, brandingOn, avatar, logoOnly, placeholder, starters],
  );
  const [saved, setSaved] = useState(current);
  const [justSaved, setJustSaved] = useState(false);
  const dirty = JSON.stringify(current) !== JSON.stringify(saved);

  const handleSave = useCallback(() => {
    setSaved(current);
    setJustSaved(true);
  }, [current]);

  const handleDiscard = () => {
    setAccent(saved.accent);
    setName(saved.name);
    setSubtitle(saved.subtitle);
    setDisclaimer(saved.disclaimer);
    setDisclaimerOn(saved.disclaimerOn);
    setBrandingOn(saved.brandingOn);
    setAvatar(saved.avatar);
    setLogoOnly(saved.logoOnly);
    setPlaceholder(saved.placeholder);
    setStarters(saved.starters);
  };

  // clear the "Saved ✓" flash after a moment
  useEffect(() => {
    if (!justSaved) return;
    const id = setTimeout(() => setJustSaved(false), 2200);
    return () => clearTimeout(id);
  }, [justSaved]);

  // ⌘S / Ctrl+S to save
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirty) handleSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dirty, handleSave]);

  // warn before leaving with unsaved changes
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  return (
    <div className="flex h-screen bg-[#FAFAFA] text-[#333333]">
      <DashboardRails />

      {/* ── main column ───────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
      {/* ── top bar ───────────────────────────────────────────────── */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#ECECEC] bg-white px-5">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-[15px] font-semibold leading-tight">Appearance</h1>
            <p className="text-[11px] text-[#979797]">Customize the look and feel</p>
          </div>
        </div>

        <div />

        {/* save / dirty state — status is transient (comes and goes) */}
        <div className="flex items-center gap-3">
          {justSaved && !dirty && (
            <span
              className="flex items-center gap-1.5 text-[12px] font-medium text-[#0F7A38]"
              style={{ animation: "fade-in 200ms ease-out both" }}
            >
              <Check className="size-3.5" strokeWidth={2.5} />
              Saved
            </span>
          )}
          {dirty && (
            <button
              onClick={handleDiscard}
              className="flex items-center gap-1.5 text-[13px] font-medium text-[#6E6E6E] transition-colors hover:text-[#333]"
            >
              <RotateCcw className="size-3.5" strokeWidth={2} />
              Discard
            </button>
          )}
          <Button onClick={handleSave} disabled={!dirty} className="text-[13px]">
            Save Changes
          </Button>
        </div>
      </header>

      {/* ── body: controls + preview ──────────────────────────────── */}
      <div className="flex min-h-0 flex-1">
        {/* controls rail — one unified config */}
        <aside className="w-[300px] shrink-0 overflow-y-auto border-r border-[#ECECEC] bg-white px-6 py-6">
          {/* view selector — launcher widget, or messenger at a device size */}
          <div className="mb-6 flex gap-0.5 rounded-lg border border-[#E5E5E5] bg-white p-0.5">
            {(
              [
                ["widget", "Widget"],
                ["desktop", "Desktop"],
                ["tablet", "Tablet"],
                ["mobile", "Mobile"],
              ] as const
            ).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex-1 rounded-md px-1.5 py-1.5 text-center text-[12px] transition-colors ${
                  view === v ? "bg-[#F6F0FF] font-semibold text-[#6D33AA]" : "font-medium text-[#666] hover:text-[#333]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <AppearanceControls
            accent={accent}
            setAccent={setAccent}
            name={name}
            setName={setName}
            subtitle={subtitle}
            setSubtitle={setSubtitle}
            disclaimer={disclaimer}
            setDisclaimer={setDisclaimer}
            disclaimerOn={disclaimerOn}
            setDisclaimerOn={setDisclaimerOn}
            brandingOn={brandingOn}
            setBrandingOn={setBrandingOn}
            avatar={avatar}
            setAvatar={setAvatar}
            logoOnly={logoOnly}
            setLogoOnly={setLogoOnly}
            starters={starters}
            setStarters={setStarters}
            siteUrl={siteUrl}
            setSiteUrl={setSiteUrl}
          />
        </aside>

        {/* preview canvas */}
        <main className="flex min-w-0 flex-1 flex-col bg-[#F4F4F5]">
          <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-6 py-8">
            {view === "widget" ? (
              <WidgetPreview
                accent={accent}
                theme={t}
                placeholder={placeholder}
                starters={starters}
                siteUrl={siteUrl}
                device="desktop"
                name={name}
                subtitle={subtitle}
                disclaimer={disclaimer}
                disclaimerOn={disclaimerOn}
                brandingOn={brandingOn}
                avatar={avatar}
                logoOnly={logoOnly}
              />
            ) : (
              <AgentPreview
                theme={t}
                name={name}
                subtitle={subtitle}
                disclaimer={disclaimer}
                disclaimerOn={disclaimerOn}
                brandingOn={brandingOn}
                avatar={avatar}
                logoOnly={logoOnly}
                accent={accent}
                device={view}
              />
            )}
          </div>
        </main>
      </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Dashboard rails ──────────────────────── */

function RailIcon({
  Icon,
  active,
}: {
  Icon: typeof Bot;
  active?: boolean;
}) {
  return (
    <button
      className={`grid size-9 place-items-center rounded-lg transition-colors ${
        active ? "bg-[#F1ECFB] text-[#7C3AED]" : "text-[#6E6E6E] hover:bg-[#F0F0F0]"
      }`}
    >
      <Icon className="size-[18px]" strokeWidth={1.9} />
    </button>
  );
}

function RailDivider() {
  return <div className="my-1 h-px w-7 self-center bg-[#ECECEC]" />;
}

function DashboardRails() {
  return (
    <div className="flex h-full shrink-0">
      {/* primary rail */}
      <nav className="flex w-[60px] flex-col items-center gap-1.5 border-r border-[#ECECEC] bg-[#FAFAFA] py-3">
        <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] text-white shadow-sm">
          <Bot className="size-[18px]" strokeWidth={2} />
        </div>
        <RailIcon Icon={PanelLeft} />
        <RailDivider />
        <RailIcon Icon={Bot} active />
        <RailIcon Icon={BookOpen} />
        <RailIcon Icon={Wrench} />
        <RailDivider />
        <RailIcon Icon={MessagesSquare} />
        <RailIcon Icon={Megaphone} />
        <RailIcon Icon={Users} />
        <RailDivider />
        <RailIcon Icon={BarChart3} />
        <div className="mt-auto grid size-9 place-items-center rounded-full bg-[#1BA8A0] text-[13px] font-semibold text-white">
          M
        </div>
      </nav>

      {/* secondary rail — section sub-nav */}
      <nav className="flex w-[60px] flex-col items-center gap-1.5 border-r border-[#ECECEC] bg-white py-3">
        <RailIcon Icon={LayoutGrid} />
        <RailIcon Icon={Settings} />
        <RailIcon Icon={Palette} active />
        <RailIcon Icon={Share2} />
        <RailIcon Icon={Activity} />
        <button className="mt-auto grid size-9 place-items-center rounded-lg text-[#9A9A9A] transition-colors hover:bg-[#F0F0F0]">
          <ChevronRight className="size-[18px]" />
        </button>
      </nav>
    </div>
  );
}

/* ───────────────────────── Agent controls ───────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#9A9A9A]">{children}</p>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-[12px] font-medium text-[#555]">{children}</label>;
}

function AppearanceControls({
  accent,
  setAccent,
  name,
  setName,
  subtitle,
  setSubtitle,
  disclaimer,
  setDisclaimer,
  disclaimerOn,
  setDisclaimerOn,
  brandingOn,
  setBrandingOn,
  avatar,
  setAvatar,
  logoOnly,
  setLogoOnly,
  starters,
  setStarters,
  siteUrl,
  setSiteUrl,
}: {
  accent: string;
  setAccent: (v: string) => void;
  name: string;
  setName: (v: string) => void;
  subtitle: string;
  setSubtitle: (v: string) => void;
  disclaimer: string;
  setDisclaimer: (v: string) => void;
  disclaimerOn: boolean;
  setDisclaimerOn: (v: boolean) => void;
  brandingOn: boolean;
  setBrandingOn: (v: boolean) => void;
  avatar: string | null;
  setAvatar: (v: string | null) => void;
  logoOnly: boolean;
  setLogoOnly: (v: boolean) => void;
  starters: string[];
  setStarters: (v: string[]) => void;
  siteUrl: string;
  setSiteUrl: (v: string) => void;
}) {
  const readFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };
  const setStarter = (i: number, v: string) =>
    setStarters(starters.map((s, idx) => (idx === i ? v : s)));
  return (
    <div className="space-y-7">
      {/* PREVIEW ON YOUR SITE */}
      <section>
        <SectionLabel>Preview on your site</SectionLabel>
        <div className="group relative mb-1.5 flex items-center gap-1.5">
          <span className="text-[12px] font-medium text-[#555]">
            Website URL
          </span>
          <Info className="size-3.5 cursor-help text-[#B8B8B8]" strokeWidth={2} />
          <span className="pointer-events-none absolute left-0 top-full z-30 mt-1 w-[230px] rounded-md bg-[#333] px-2 py-1 text-[11px] leading-snug text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
            Drops the widget over a snapshot of your site (Widget view). Some sites can’t be captured — falls back to the sample page.
          </span>
        </div>
        <input
          value={siteUrl}
          onChange={(e) => setSiteUrl(e.target.value)}
          placeholder="yourcompany.com"
          className="h-9 w-full rounded-lg border border-[#E5E5E5] px-3 text-[13px] text-[#333] outline-none focus:border-[#C9C9C9]"
        />
      </section>

      {/* SUGGESTED PROMPTS */}
      <section>
        <SectionLabel>Suggested prompts</SectionLabel>
        <div className="flex flex-col gap-2">
          {starters.map((s, i) => (
            <input
              key={i}
              value={s}
              onChange={(e) => setStarter(i, e.target.value)}
              placeholder="Prompt text"
              className="h-9 w-full rounded-lg border border-[#E5E5E5] px-3 text-[13px] text-[#333] outline-none focus:border-[#C9C9C9]"
            />
          ))}
        </div>
      </section>

      <div className="h-px bg-[#F0F0F0]" />

      {/* BRAND IDENTITY */}
      <section>
        <SectionLabel>Brand Identity</SectionLabel>

        <FieldLabel>
          Accent color <span className="text-[#D03A3A]">*</span>
        </FieldLabel>
        <div className="flex items-center gap-2">
          {/* custom color — native picker behind a hue-wheel swatch */}
          <label
            className="relative grid size-8 shrink-0 cursor-pointer place-items-center rounded-full ring-1 ring-black/10"
            style={{
              background:
                "conic-gradient(from 90deg, #CE3838, #CEB238, #3BB24E, #38A8B2, #3854CE, #9E38B2, #CE3838)",
            }}
            aria-label="Pick a color"
          >
            <input
              type="color"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            <Plus className="size-4 text-white [filter:drop-shadow(0_0_1px_rgba(0,0,0,.5))]" strokeWidth={3} />
          </label>
          <input
            value={accent.toUpperCase()}
            onChange={(e) => setAccent(e.target.value)}
            className="h-9 flex-1 rounded-lg border border-[#E5E5E5] px-3 font-mono text-[13px] text-[#333] outline-none focus:border-[#C9C9C9]"
          />
        </div>

        <div className="h-6" />

        {/* logo — with an inline "center" option for wordmark logos */}
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[12px] font-medium text-[#555]">
            Logo <span className="text-[#D03A3A]">*</span>
          </span>
          <span className="group relative flex items-center gap-1.5">
            <span className="text-[11px] text-[#888]">Center</span>
            <Toggle on={logoOnly} onChange={setLogoOnly} size="sm" />
            <Info className="size-3.5 cursor-help text-[#B8B8B8]" strokeWidth={2} />
            <span className="pointer-events-none absolute right-0 top-full z-20 mt-1 w-max max-w-[190px] rounded-md bg-[#333] px-2 py-1 text-[11px] leading-snug text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
              Centers a wordmark logo and hides the name &amp; subtitle.
            </span>
          </span>
        </div>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            readFile(e.dataTransfer.files?.[0]);
          }}
          className="relative mb-4 flex h-16 w-full items-center justify-center rounded-xl border border-dashed border-[#D8D8D8] p-1.5"
        >
          {avatar ? (
            <>
              {logoOnly ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="" className="h-9 max-w-[200px] object-contain" />
              ) : (
                <span
                  className="block size-11 rounded-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${avatar})` }}
                />
              )}
              <button
                onClick={() => setAvatar(null)}
                aria-label="Remove logo"
                className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-white text-[#6E6E6E] shadow-sm ring-1 ring-black/10 transition-colors hover:text-[#333]"
              >
                <X className="size-2.5" strokeWidth={2.5} />
              </button>
            </>
          ) : (
            <label className="flex size-full cursor-pointer flex-col items-center justify-center gap-1 text-[#9A9A9A] transition-colors hover:text-[#7A7A7A]">
              <ImagePlus className="size-5" />
              <span className="text-[11px] leading-tight">Drop logo or click</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => readFile(e.target.files?.[0])}
              />
            </label>
          )}
        </div>

        <FieldLabel>
          Agent name <span className="text-[#D03A3A]">*</span>
        </FieldLabel>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Bot name"
          disabled={logoOnly}
          className={`mb-4 h-9 w-full rounded-lg border px-3 text-[13px] text-[#333] outline-none focus:border-[#C9C9C9] disabled:bg-[#FAFAFA] disabled:text-[#AAA] ${
            !logoOnly && !name.trim() ? "border-[#F0C4C4]" : "border-[#E5E5E5]"
          }`}
        />

        <FieldLabel>
          Subtitle <span className="font-normal text-[#A8A8A8]">· optional</span>
        </FieldLabel>
        <input
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Virtual Assistant"
          disabled={logoOnly}
          className="h-9 w-full rounded-lg border border-[#E5E5E5] px-3 text-[13px] text-[#333] outline-none focus:border-[#C9C9C9] disabled:bg-[#FAFAFA] disabled:text-[#AAA]"
        />
      </section>

      <div className="h-px bg-[#F0F0F0]" />

      {/* FOOTER */}
      <section>
        <SectionLabel>Footer</SectionLabel>

        {/* disclaimer — toggle + editable copy; label has a hover tooltip */}
        <div className="mb-2 flex items-center justify-between">
          <span className="group relative inline-flex items-center gap-1">
            <FieldLabel>Disclaimer</FieldLabel>
            <Info className="mb-1.5 size-3.5 cursor-help text-[#B8B8B8]" strokeWidth={2} />
            <span className="pointer-events-none absolute left-0 top-full z-20 w-max max-w-[200px] rounded-md bg-[#333] px-2 py-1 text-[11px] leading-snug text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
              Small print shown under the composer.
            </span>
          </span>
          <Toggle on={disclaimerOn} onChange={setDisclaimerOn} size="sm" />
        </div>
        <textarea
          value={disclaimer}
          onChange={(e) => setDisclaimer(e.target.value)}
          placeholder="Tars can make mistakes. Check important info."
          rows={2}
          disabled={!disclaimerOn}
          className="w-full resize-none rounded-lg border border-[#E5E5E5] px-3 py-2 text-[13px] leading-relaxed text-[#333] outline-none focus:border-[#C9C9C9] disabled:bg-[#FAFAFA] disabled:text-[#AAA]"
        />

        {/* TARS branding — show/hide "Powered by TARS" (premium to remove) */}
        <div className="mt-5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <FieldLabel>Tars branding</FieldLabel>
            <span className="mb-1.5 inline-flex items-center gap-0.5 rounded bg-[#F1E4C9] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#9A6E12]">
              <Lock className="size-2.5" strokeWidth={2.5} />
              Pro
            </span>
          </span>
          <Toggle on={brandingOn} onChange={setBrandingOn} size="sm" />
        </div>
        <p className="text-[11px] leading-relaxed text-[#A8A8A8]">
          Shows “⚡ Powered by Tars” under the chat. Removing it is available on paid plans.
        </p>
      </section>
    </div>
  );
}

function Toggle({ on, onChange, size = "md" }: { on: boolean; onChange: (v: boolean) => void; size?: "sm" | "md" }) {
  const sm = size === "sm";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative shrink-0 rounded-full transition-colors ${sm ? "h-4 w-7" : "h-5 w-9"} ${
        on ? "bg-[#8B55C3]" : "bg-[#D8D8D8]"
      }`}
    >
      <span
        className={`absolute top-0.5 rounded-full bg-white shadow ring-1 ring-black/5 transition-all ${
          sm ? `size-3 ${on ? "left-[14px]" : "left-0.5"}` : `size-4 ${on ? "left-[18px]" : "left-0.5"}`
        }`}
      />
    </button>
  );
}

/* ───────────────────────── Agent preview ────────────────────────── */

/* AI message action toolbar — reveals on hover (matches ai-message DS) */
function AiToolbar() {
  const btn =
    "flex size-6 items-center justify-center rounded-[4px] text-[#6E6E6E] transition-colors hover:bg-[#F0EBE0] hover:text-[#333333]";
  return (
    <div className="mt-1 ml-1 flex items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
      <button className={btn} aria-label="Read aloud">
        <Volume2 className="size-3.5" strokeWidth={1.5} />
      </button>
      <button className={btn} aria-label="Good response">
        <ThumbsUp className="size-3" strokeWidth={1.5} />
      </button>
      <button className={btn} aria-label="Bad response">
        <ThumbsDown className="size-3" strokeWidth={1.5} />
      </button>
      <button className={btn} aria-label="Copy">
        <Copy className="size-3" strokeWidth={1.5} />
      </button>
    </div>
  );
}

const DEVICE_WIDTH: Record<Device, number> = {
  desktop: 820,
  tablet: 580,
  mobile: 380,
};

type Msg = { from: "ai" | "user"; text: string };

/* live "thinking" indicator — sparkle + cycling shimmer phrase (matches /web) */
const THINKING_PHRASES = ["AI is thinking…", "Still thinking…", "Thinking some more…", "Almost done…"];
function AiThinking({ accent }: { accent: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % THINKING_PHRASES.length), 850);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex items-center gap-2 px-1 text-[14px] font-medium text-[#333333]">
      <Sparkles
        className="size-4 shrink-0"
        strokeWidth={1.75}
        style={{ color: accent, animation: "event-spin 2.4s linear infinite" }}
      />
      <span className="ai-shimmer">{THINKING_PHRASES[i]}</span>
    </div>
  );
}

/* word-by-word reveal (matches the real app's streaming) */
function Words({ text }: { text: string }) {
  let idx = 0;
  return (
    <>
      {text.split(/(\s+)/).map((tok, i) => {
        if (tok === "" || /^\s+$/.test(tok)) return tok;
        const d = idx++ * 36;
        return (
          <span
            key={i}
            className="inline-block"
            style={{ animation: `word-in 320ms cubic-bezier(0.2,0.6,0.2,1) ${d}ms both` }}
          >
            {tok}
          </span>
        );
      })}
    </>
  );
}

/* canned demo replies so the preview feels live */
function cannedReply(text: string): string {
  const t = text.toLowerCase();
  if (/(pric|plan|cost|subscri|tier)/.test(t))
    return "We offer Studio and Enterprise plans — Studio suits small teams, Enterprise adds SSO, analytics and priority support. Want a quick side-by-side?";
  if (/(stripe|payment|integrat|connect|api)/.test(t))
    return "Yes — Stripe, plus 30+ other payment providers. Want me to show you how to connect it?";
  if (/(demo|trial|try|book|call)/.test(t))
    return "Absolutely — I can set up a live demo. What day works best for you?";
  if (/(hi|hello|hey|yo)\b/.test(t)) return "Hi! 👋 How can I help you today?";
  if (/(agent|ai|bot|work)/.test(t))
    return "An AI agent answers questions, qualifies leads and books meetings automatically — trained on your content. Want to see it in action?";
  return "Great question! Let me help with that. Could you share a little more about what you're looking for?";
}

function AgentPreview({
  theme,
  name,
  subtitle,
  disclaimer,
  disclaimerOn,
  brandingOn,
  avatar,
  logoOnly,
  accent,
  device,
  width,
  height = 680,
  initialPrompt,
  onClose,
}: {
  theme: ReturnType<typeof useTheme>;
  name: string;
  subtitle: string;
  disclaimer: string;
  disclaimerOn: boolean;
  brandingOn: boolean;
  avatar: string | null;
  logoOnly: boolean;
  accent: string;
  device: Device;
  width?: number;
  height?: number;
  initialPrompt?: string;
  onClose?: () => void;
}) {
  const { neutral } = theme;
  const aiBubble: CSSProperties = {
    background: neutral.paper,
    borderColor: neutral.line,
    color: neutral.ink,
  };

  /* ── interactive conversation ── */
  // expanded reference seeds a sample exchange; the docked widget starts
  // empty and auto-sends whatever prompt the visitor tapped.
  const [convo, setConvo] = useState<Msg[]>(
    initialPrompt
      ? []
      : [
          { from: "user", text: "Do you integrate with Stripe?" },
          { from: "ai", text: "Yes — Stripe, plus 30+ other payment providers. Want me to show you how to connect it?" },
        ],
  );
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const started = useRef(false);

  const hasInput = draft.trim().length > 0;
  // content-driven multiline (char count, not DOM measure — no oscillation)
  const isMultiline = useMemo(() => {
    if (!draft) return false;
    const total = draft
      .split("\n")
      .reduce((a, l) => a + Math.max(1, Math.ceil(l.length / 56)), 0);
    return total > 1;
  }, [draft]);
  // auto-grow the textarea to its content, capped
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, [draft]);

  const send = (text: string) => {
    const msg = text.trim();
    if (!msg || thinking) return;
    setDraft("");
    setConvo((c) => [...c, { from: "user", text: msg }]);
    setThinking(true);
    const reply = cannedReply(msg);
    // think-time derived from reply length — long enough to cycle phrases
    const delay = Math.min(3200, Math.max(2200, reply.split(/\s+/).length * 90));
    setTimeout(() => {
      setThinking(false);
      setConvo((c) => [...c, { from: "ai", text: reply }]);
    }, delay);
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [convo, thinking]);

  // docked widget: start the conversation from the tapped prompt (once)
  useEffect(() => {
    if (!initialPrompt || started.current) return;
    started.current = true;
    send(initialPrompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl shadow-[0_12px_40px_-8px_rgba(0,0,0,0.18)]"
      style={{ width: width ?? DEVICE_WIDTH[device], height, background: neutral.canvas }}
    >
      {/* header — neutral, no accent fill (matches /web) */}
      <div className="border-b py-3 pl-4 pr-5" style={{ borderColor: neutral.line }}>
        <div className="mx-auto flex w-full max-w-[720px] items-center gap-2.5">
          {logoOnly ? (
            /* wordmark logo — centered, no name/subtitle */
            <>
              <div className="flex w-8 shrink-0 items-center">
                {(device !== "desktop" || onClose) && (
                  <button
                    onClick={onClose}
                    className="-ml-1 grid size-8 place-items-center rounded-full transition-colors hover:bg-[var(--ds-bg-subtle)]"
                    style={{ color: neutral.secondary }}
                    aria-label="Back"
                  >
                    <ChevronLeft className="size-5" strokeWidth={2} />
                  </button>
                )}
              </div>
              <div className="flex h-9 flex-1 items-center justify-center">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="" className="h-7 w-auto max-w-full object-contain" />
                ) : (
                  <span className="text-[16px] font-semibold tracking-tight" style={{ color: neutral.ink }}>
                    {name || "Agent"}
                  </span>
                )}
              </div>
              <div className="flex w-8 shrink-0 justify-end">
                <MoreVertical className="size-[18px]" style={{ color: neutral.secondary }} strokeWidth={1.75} />
              </div>
            </>
          ) : (
            <>
              {/* back button — tablet, mobile, and the docked widget (returns to history) */}
              {(device !== "desktop" || onClose) && (
                <button
                  onClick={onClose}
                  className="-ml-1 grid size-8 shrink-0 place-items-center rounded-full transition-colors hover:bg-[var(--ds-bg-subtle)]"
                  style={{ color: neutral.secondary }}
                  aria-label="Back"
                >
                  <ChevronLeft className="size-5" strokeWidth={2} />
                </button>
              )}
              {/* avatar — uploaded image, else default user-bubble fill + ink bot */}
              {avatar ? (
                <span
                  className="size-9 shrink-0 rounded-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${avatar})` }}
                />
              ) : (
                <div
                  className="grid size-9 shrink-0 place-items-center rounded-full"
                  style={{ background: theme.bubbleFill }}
                >
                  <Bot className="size-[18px]" style={{ color: theme.bubbleInk }} strokeWidth={2} />
                </div>
              )}
              <div className="flex flex-col leading-tight">
                <span className="text-[16px] font-semibold tracking-tight" style={{ color: neutral.ink }}>
                  {name || "Agent"}
                </span>
                {subtitle.trim() && (
                  <span className="mt-0.5 text-[12px]" style={{ color: neutral.secondary }}>
                    {subtitle}
                  </span>
                )}
              </div>
              <div className="ml-auto flex items-center gap-1">
                <MoreVertical className="size-[18px]" style={{ color: neutral.secondary }} strokeWidth={1.75} />
                {onClose && (
                  <button onClick={onClose} aria-label="Close" className="grid size-6 place-items-center rounded-full transition-colors hover:bg-[var(--ds-bg-subtle)]" style={{ color: neutral.secondary }}>
                    <X className="size-4" strokeWidth={2} />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* body — beige canvas */}
      <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-5 py-6">
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4">
          {/* live conversation */}
          {convo.map((m, i) =>
            m.from === "user" ? (
              <div key={i} className="flex justify-end" style={{ animation: "bubble-in 240ms cubic-bezier(0.2,0.6,0.2,1) both" }}>
                <div
                  className="w-fit max-w-[80%] rounded-[12px] rounded-br-[4px] px-3.5 py-2 text-[14px] leading-relaxed"
                  style={{
                    background: theme.bubbleFill,
                    boxShadow: `inset 0 0 0 1px ${theme.bubbleBorder}`,
                    color: theme.bubbleInk,
                  }}
                >
                  {m.text}
                </div>
              </div>
            ) : (
              <div key={i} className="group flex flex-col items-start" style={{ animation: "bubble-in 240ms cubic-bezier(0.2,0.6,0.2,1) both" }}>
                <p className="mb-1 ml-1 text-[11px] font-medium tracking-wide" style={{ color: neutral.secondary }}>
                  AI Agent <span style={{ color: "#A8A096" }}>· 10:24 AM</span>
                </p>
                <div
                  className="w-fit max-w-[90%] rounded-[12px] rounded-bl-[4px] border px-3.5 py-2 text-[14px] leading-relaxed transition-shadow duration-200 group-hover:shadow-[var(--ds-shadow-sm)]"
                  style={aiBubble}
                >
                  <Words text={m.text} />
                </div>
                <AiToolbar />
              </div>
            ),
          )}

          {/* thinking indicator — sparkle + cycling shimmer phrase */}
          {thinking && (
            <div style={{ animation: "fade-in 200ms ease-out both" }}>
              <AiThinking accent={accent} />
            </div>
          )}
        </div>
      </div>

      {/* composer — ported from the DS Message Composer, brand-themed */}
      <div className="px-4 pb-3 pt-1">
        <style>{`
          .dsc-field { box-shadow: 0 0 0 0 transparent; }
          .dsc-field:focus-within {
            border-color: var(--acc) !important;
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--acc) 18%, transparent);
          }
        `}</style>
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-1.5">
          {/* press-enter hint — only while typing */}
          {hasInput && (
            <div
              className="flex items-center justify-center gap-1 text-[10px] leading-4"
              style={{ color: neutral.muted, animation: "fade-in 180ms ease-out both" }}
            >
              Press
              <kbd
                className="inline-flex h-4 min-w-4 items-center justify-center rounded-[3px] border bg-white px-1 font-sans text-[10px] leading-none"
                style={{ borderColor: neutral.line, color: neutral.secondary }}
              >
                ↵
              </kbd>
              to send
            </div>
          )}

          <div
            className={`dsc-field flex w-full rounded-[12px] border transition-all duration-200 ${
              isMultiline ? "flex-wrap items-end gap-x-1.5 gap-y-1 px-2 py-1.5" : "items-end gap-1.5 px-2 py-2"
            }`}
            style={{ background: neutral.paper, borderColor: neutral.line, ["--acc" as string]: accent }}
          >
            <button
              className={`flex size-7 shrink-0 items-center justify-center rounded-[6px] transition-colors hover:bg-[#F0EBE0] ${
                isMultiline ? "order-2 mr-auto" : ""
              }`}
              style={{ color: neutral.secondary }}
              aria-label="Add attachment"
            >
              <Plus className="size-4" strokeWidth={1.5} />
            </button>
            <textarea
              ref={taRef}
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(draft);
                }
              }}
              placeholder="Ask me anything..."
              className={`block min-w-0 resize-none bg-transparent text-[14px] leading-[1.5] tracking-tight outline-none placeholder:text-[#979797] ${
                isMultiline ? "order-1 w-full basis-full py-1" : "flex-1 py-[5px]"
              }`}
              style={{ color: neutral.ink, maxHeight: 140, overflowY: "auto", boxSizing: "border-box" }}
            />
            {device === "mobile" ? (
              /* mobile: single button flips mic → send */
              hasInput ? (
                <button
                  onClick={() => send(draft)}
                  disabled={thinking}
                  aria-label="Send message"
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-40 ${
                    isMultiline ? "order-3" : ""
                  }`}
                  style={{ background: accent }}
                >
                  <ArrowUp className="size-4" strokeWidth={2} />
                </button>
              ) : (
                <button
                  className={`flex size-7 shrink-0 items-center justify-center rounded-[6px] transition-colors hover:bg-[#F0EBE0] ${
                    isMultiline ? "order-3" : ""
                  }`}
                  style={{ color: neutral.secondary }}
                  aria-label="Voice input"
                >
                  <Mic className="size-4" strokeWidth={1.5} />
                </button>
              )
            ) : (
              /* desktop & tablet: mic always sits to the left of send */
              <>
                <button
                  className={`flex size-7 shrink-0 items-center justify-center rounded-[6px] transition-colors hover:bg-[#F0EBE0] ${
                    isMultiline ? "order-3" : ""
                  }`}
                  style={{ color: neutral.secondary }}
                  aria-label="Voice input"
                >
                  <Mic className="size-4" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => send(draft)}
                  disabled={!hasInput || thinking}
                  aria-label="Send message"
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-40 ${
                    isMultiline ? "order-4" : ""
                  }`}
                  style={{ background: accent }}
                >
                  <ArrowUp className="size-4" strokeWidth={2} />
                </button>
              </>
            )}
          </div>
          {disclaimerOn && disclaimer.trim() && (
            <p className="text-center text-[11px]" style={{ color: neutral.muted }}>
              {disclaimer}
            </p>
          )}
          {brandingOn && (
            <p className="flex items-center justify-center gap-1 text-center text-[11px]" style={{ color: neutral.muted }}>
              <Zap className="size-3" strokeWidth={2} fill="currentColor" />
              Powered by <span className="font-semibold">Tars</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Widget preview ───────────────────────── */

const PILL_SHADOW = "0 2px 16px -4px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.06)";

function WidgetPreview({
  accent,
  theme,
  placeholder,
  starters,
  device,
  siteUrl,
  name,
  subtitle,
  disclaimer,
  disclaimerOn,
  brandingOn,
  avatar,
  logoOnly,
}: {
  accent: string;
  theme: ReturnType<typeof useTheme>;
  placeholder: string;
  starters: string[];
  device: Device;
  siteUrl: string;
  name: string;
  subtitle: string;
  disclaimer: string;
  disclaimerOn: boolean;
  brandingOn: boolean;
  avatar: string | null;
  logoOnly: boolean;
}) {
  const visibleStarters = starters.filter((s) => s.trim());
  const isMobile = device === "mobile";
  // launcher embeds on a real site — wider than the chatbot panel
  const siteWidth = { desktop: 1000, tablet: 580, mobile: 380 }[device];

  // preview over a screenshot of the customer's site (falls back to skeleton)
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const trimmed = siteUrl.trim();
  const normUrl = trimmed ? (/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`) : "";
  const showSite = !!normUrl && /\.[a-z]{2,}/i.test(normUrl) && failedUrl !== normUrl;
  const shot = showSite ? `https://image.thum.io/get/width/1200/crop/900/noanimate/${normUrl}` : "";

  // interactive: tap the pill or a prompt to open the docked chat
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState<string | undefined>(undefined);
  const openChat = (p?: string) => {
    setPrompt(p);
    setOpen(true);
  };
  const agentProps = { theme, name, subtitle, disclaimer, disclaimerOn, brandingOn, avatar, logoOnly, accent };
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-[#E6E6E6] bg-white shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)]"
      style={{ width: siteWidth, height: 680 }}
    >
      {/* animated gradient stroke + entrance — the launcher's signature */}
      <style>{`
        @property --lg-angle { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
        @keyframes liquid-edge-orbit { to { --lg-angle: 360deg; } }
        @keyframes pill-slide-in {
          from { opacity: 0; transform: translateX(calc(100% + 40px)); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes chip-rise {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes widget-open {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .lg-pill::before {
          content: ""; position: absolute; inset: 0; padding: 1px; border-radius: 16px;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none;
          background: conic-gradient(from var(--lg-angle),
            rgba(180,140,255,1) 0deg, rgba(150,200,255,1) 55deg, rgba(120,230,255,1) 110deg,
            rgba(220,255,255,1) 160deg, rgba(255,255,255,1) 180deg, rgba(220,255,255,1) 200deg,
            rgba(120,230,255,1) 250deg, rgba(150,200,255,1) 305deg, rgba(180,140,255,1) 360deg);
          animation: liquid-edge-orbit 5s linear infinite;
        }
      `}</style>

      {/* background — site screenshot if a URL is set, else faux skeleton */}
      {showSite ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={normUrl}
          src={shot}
          alt=""
          onError={() => setFailedUrl(normUrl)}
          className="absolute inset-0 size-full bg-[#F4F4F6] object-cover object-top"
        />
      ) : (
        <div className={`space-y-3 ${isMobile ? "p-5" : "p-8"}`}>
          <div className="h-5 w-40 rounded bg-[#EEEDF6]" />
          <div className="mx-auto h-4 w-1/2 rounded bg-[#F1F0F7]" />
          <div className="mx-auto h-4 w-2/5 rounded bg-[#F1F0F7]" />
          <div className={`mt-10 grid gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-3"}`}>
            {(isMobile ? [0, 1] : [0, 1, 2]).map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-28 rounded-xl bg-[#F4F3F9]" />
                <div className="h-3 w-3/4 rounded bg-[#F1F0F7]" />
                <div className="h-3 w-1/2 rounded bg-[#F1F0F7]" />
              </div>
            ))}
          </div>

          {/* more body content */}
          <div className="mt-10 space-y-2.5">
            <div className="h-4 w-32 rounded bg-[#EEEDF6]" />
            <div className="h-3 w-full rounded bg-[#F1F0F7]" />
            <div className="h-3 w-[92%] rounded bg-[#F1F0F7]" />
            <div className="h-3 w-[96%] rounded bg-[#F1F0F7]" />
            <div className="h-3 w-3/4 rounded bg-[#F1F0F7]" />
          </div>

          <div className={`mt-8 grid gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}>
            {(isMobile ? [0] : [0, 1]).map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-24 rounded-xl bg-[#F4F3F9]" />
                <div className="h-3 w-2/3 rounded bg-[#F1F0F7]" />
              </div>
            ))}
          </div>
        </div>
      )}

      {open ? (
        /* ── opened chat — docked on the site (full-screen on mobile) ── */
        isMobile ? (
          <div className="absolute inset-0" style={{ animation: "widget-open 280ms cubic-bezier(0.2,0.6,0.2,1) both" }}>
            <AgentPreview
              key={prompt ?? "blank"}
              {...agentProps}
              device="mobile"
              width={siteWidth}
              height={680}
              initialPrompt={prompt}
              onClose={() => setOpen(false)}
            />
          </div>
        ) : (
          <div
            className="absolute bottom-6 right-6 origin-bottom-right"
            style={{ animation: "widget-open 280ms cubic-bezier(0.2,0.6,0.2,1) both" }}
          >
            <AgentPreview
              key={prompt ?? "blank"}
              {...agentProps}
              device="desktop"
              width={384}
              height={600}
              initialPrompt={prompt}
              onClose={() => setOpen(false)}
            />
          </div>
        )
      ) : (
        /* ── launcher — corner pill + tappable prompts ── */
        <div
          className={`absolute bottom-6 flex flex-col gap-3 ${
            isMobile ? "left-1/2 -translate-x-1/2 items-center" : "right-6 items-end"
          }`}
        >
          {visibleStarters.length > 0 && (
            <div className={`flex flex-col gap-2 ${isMobile ? "items-end self-end" : "items-end"}`}>
              {visibleStarters.map((s, i) => (
                <button
                  key={i}
                  onClick={() => openChat(s)}
                  className="rounded-full border px-3.5 py-1.5 text-[14px] whitespace-nowrap transition-[filter] hover:brightness-[0.98]"
                  style={{
                    borderColor: theme.bubbleBorder,
                    backgroundColor: theme.bubbleFill,
                    color: accent,
                    animation: `chip-rise 380ms cubic-bezier(0.2,0.6,0.2,1) ${800 + (visibleStarters.length - 1 - i) * 110}ms both`,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* the pill — opens the chat on tap */}
          <button
            onClick={() => openChat()}
            className="lg-pill relative flex items-center gap-2.5 bg-white text-left"
            style={{
              width: 300,
              minHeight: 52,
              borderRadius: 16,
              boxShadow: PILL_SHADOW,
              padding: "0 8px 0 16px",
              animation: "pill-slide-in 700ms cubic-bezier(0.22,0.61,0.36,1) 200ms both",
            }}
          >
            <span className="flex-1 text-[14px] tracking-tight text-[#979797]">
              {placeholder || "Ask me anything…"}
            </span>
            <span className="flex size-7 items-center justify-center rounded-full text-white" style={{ backgroundColor: accent }}>
              <Mic className="size-3.5" strokeWidth={2} />
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
