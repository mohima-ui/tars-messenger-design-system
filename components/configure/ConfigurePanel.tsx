"use client";

/* ─── Configure — General + Suggestions ───────────────────────────────────
   A mock of the dashboard's Configure section. General is reproduced from the
   live screen so the new Suggestions page has something to sit next to and be
   judged against; only Suggestions is new work.

   Shared by two callers: /configure renders it on its own with local state,
   and the design tool opens it over the preview with the launcher's own
   settings passed in — so editing a suggestion here changes what the launcher
   preview shows. That is the whole point of building it here rather than
   describing it: the handoff between the two sections is the thing in
   question, and it can only be judged by using it.

   The nav lists the real sections but only these two are wired — the rest are
   present so the page reads at its true density instead of looking emptier
   than the thing it is proposing to change. */

import { useState } from "react";

import { DashboardRails } from "../../components/dashboard/DashboardRails";
import {
  Settings,
  Bug,
  Languages,
  Mail,
  Plus,
  Save,
  Sparkles,
  Target,
  Trash2,
  Volume2,
} from "lucide-react";

type Section = "general" | "suggestions";

/* Grouped by kind, not by importance: identity, then channel and delivery,
   then what the agent does in a conversation, then Debug. Suggestions sits with
   Goals & Behavior because it is the same kind of thing — how the agent engages
   — just before the conversation rather than during it. Ordering by importance
   instead would put it second, and would be re-argued by every feature that
   lands after it. */
const NAV: {
  key: Section | string;
  label: string;
  Icon: typeof Settings;
  live?: boolean;
}[] = [
  { key: "general", label: "General", Icon: Settings, live: true },
  { key: "language", label: "Language", Icon: Languages },
  { key: "notifications", label: "Notifications", Icon: Mail },
  { key: "voice", label: "Voice & Audio", Icon: Volume2 },
  { key: "goals", label: "Goals & Behavior", Icon: Target },
  { key: "suggestions", label: "Suggestions", Icon: Sparkles, live: true },
  { key: "debug", label: "Debug", Icon: Bug },
];

/* ── shared bits ────────────────────────────────────────────────────────── */

function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
      style={{ background: on ? "#8B5CF6" : "#D8D8DE" }}
    >
      <span
        className="absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-all"
        style={{ left: on ? 22 : 2 }}
      />
    </button>
  );
}

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-2 block text-[14px] font-medium text-[#27272A]">
      {children}
      {required && <span className="ml-1 text-[#E11D48]">*</span>}
    </label>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 text-[12px] leading-relaxed text-[#71717A]">
      {children}
    </p>
  );
}

const inputCls =
  "w-full rounded-lg border border-[#D9D9DF] bg-white px-3.5 py-3 text-[14px] text-[#27272A] outline-none transition-colors placeholder:text-[#A1A1AA] focus:border-[#A78BFA]";

function SaveBar({ label }: { label: string }) {
  return (
    <div className="mt-8 flex justify-end border-t border-[#EAEAEF] pt-6">
      <button className="flex items-center gap-2 rounded-lg bg-[#A78BFA] px-5 py-3 text-[14px] font-medium text-white transition-opacity hover:opacity-90">
        <Save className="size-4" strokeWidth={2} />
        {label}
      </button>
    </div>
  );
}

/* A row of free-text lines. Used for both a page rule's prompts and the
   fallback list, which is deliberate: they are the same kind of content and
   should not look like two different features. */
function PromptList({
  items,
  onChange,
  placeholder = "Suggestion text",
  max,
  note,
}: {
  items: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  /* A hard cap, not a warning. The launcher has a fixed number of slots, so a
     list longer than that would produce suggestions that exist in settings and
     never appear anywhere — the one failure nothing on screen would explain. */
  max?: number;
  note?: (used: number) => string;
}) {
  const set = (i: number, v: string) =>
    onChange(items.map((x, n) => (n === i ? v : x)));
  const full = max !== undefined && items.length >= max;
  return (
    <div className="flex flex-col gap-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={it}
            onChange={(e) => set(i, e.target.value)}
            placeholder={placeholder}
            className={inputCls + " py-2.5 text-[14px]"}
          />
          <button
            onClick={() => onChange(items.filter((_, n) => n !== i))}
            aria-label="Remove"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-[#B4B4BC] transition-colors hover:bg-[#F4F4F6] hover:text-[#52525B]"
          >
            <Trash2 className="size-4" strokeWidth={2} />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-3">
        {!full && (
          <button
            onClick={() => onChange([...items, ""])}
            className="flex w-fit items-center gap-1.5 text-[12px] font-medium text-[#7C3AED] transition-opacity hover:opacity-80"
          >
            <Plus className="size-4" strokeWidth={2} /> Add
          </button>
        )}
        {/* The count is the point: every line written costs a generated one,
            and that trade is invisible unless it is stated. */}
        {note && (
          <span className="text-[12px] text-[#A1A1AA]">
            {note(items.length)}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── General ────────────────────────────────────────────────────────────── */

function GeneralSettings() {
  const [name, setName] = useState("testing");
  const [description, setDescription] = useState("");
  const [consent, setConsent] = useState(false);

  return (
    <>
      <h1 className="text-[18px] font-semibold text-[#18181B]">
        General Settings
      </h1>
      <p className="mt-2 max-w-[620px] text-[14px] leading-relaxed text-[#52525B]">
        Configure the basic identity of your agent — name, description, and
        data-consent disclaimer.
      </p>

      <div className="mt-7 border-t border-[#EAEAEF] pt-7">
        <FieldLabel required>Name</FieldLabel>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputCls}
        />
        <Hint>
          The display name for your agent. Visible to your team and in the agent
          widget header.
        </Hint>
      </div>

      <div className="mt-6">
        <FieldLabel>Description</FieldLabel>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 500))}
          placeholder="A brief description of your agent..."
          rows={3}
          className={inputCls + " resize-y"}
        />
        <p className="mt-2 text-[12px] text-[#71717A]">
          {description.length}/500 chars
        </p>
        <Hint>
          Internal description to help your team understand this agent&rsquo;s
          purpose.
        </Hint>
      </div>

      <div className="mt-7 flex items-start justify-between gap-8 border-t border-[#EAEAEF] pt-7">
        <div>
          <span className="block text-[14px] font-medium text-[#27272A]">
            Require Data Consent
          </span>
          <Hint>
            Show a consent message with Accept / Decline before the conversation
            starts.
          </Hint>
        </div>
        <div className="pt-1">
          <Toggle on={consent} onChange={setConsent} />
        </div>
      </div>

      <SaveBar label="Save General Settings" />
    </>
  );
}

/* ── Suggestions ────────────────────────────────────────────────────────── */

type Rule = { id: string; match: string; prompts: string[] };

/* How many suggestions the launcher shows — the cap on every list that feeds
   those slots, so nothing can be written that never appears. One number for
   both launcher types: the button stack could take a fourth, but a cap that
   changes when you switch type would silently drop a line already written.

   Generated suggestions replace this list rather than sharing with it. Sharing
   was the other option and it defaults badly: a pre-filled list would leave no
   slot for the engine, so on most installs the generation would never be seen
   to run. */
const SLOTS = 3;

export type SuggestionState = {
  automatic: boolean;
  rules: Rule[];
  fallback: string[];
};

function SuggestionSettings({
  value,
  onChange,
}: {
  value: SuggestionState;
  onChange: (v: SuggestionState) => void;
}) {
  const { automatic, rules, fallback } = value;
  const patch = (p: Partial<SuggestionState>) => onChange({ ...value, ...p });
  const setAutomatic = (automatic: boolean) => patch({ automatic });
  const setRules = (rules: Rule[]) => patch({ rules });

  const setRule = (id: string, patch: Partial<Rule>) =>
    setRules(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <>
      <h1 className="text-[18px] font-semibold text-[#18181B]">Suggestions</h1>
      <p className="mt-2 max-w-[620px] text-[14px] leading-relaxed text-[#52525B]">
        The prompts a visitor can click instead of typing — in the launcher
        before the conversation starts, and above the composer once it has.
      </p>

      {/* ── automatic ── */}
      <div className="mt-7 flex items-start justify-between gap-8 border-t border-[#EAEAEF] pt-7">
        <div>
          <span className="block text-[14px] font-medium text-[#27272A]">
            Automatic
          </span>
          <Hint>
            Generated from the page the visitor is on, the conversation so far,
            and what this agent is configured to do.
          </Hint>
        </div>
        <div className="pt-1">
          <Toggle on={automatic} onChange={setAutomatic} />
        </div>
      </div>

      {/* ── manual: page rules ──
          Only when automatic is off. Two ways of deciding the same thing, so
          showing both at once would leave it ambiguous which one is in force. */}
      {!automatic && (
        <div className="mt-6">
          <span className="block text-[14px] font-medium text-[#27272A]">
            Page rules
          </span>
          <Hint>
            Match the start of a page path. The most specific match wins.
          </Hint>

          <div className="mt-4 flex flex-col gap-3">
            {rules.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-[#EAEAEF] bg-[#FCFCFD] p-4"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="shrink-0 text-[12px] font-medium text-[#8A8A94]">
                    On
                  </span>
                  <input
                    value={r.match}
                    onChange={(e) => setRule(r.id, { match: e.target.value })}
                    placeholder="/pricing"
                    className={inputCls + " py-2 font-mono text-[12px]"}
                  />
                  <button
                    onClick={() => setRules(rules.filter((x) => x.id !== r.id))}
                    aria-label={`Remove the ${r.match} rule`}
                    className="grid size-9 shrink-0 place-items-center rounded-lg text-[#B4B4BC] transition-colors hover:bg-[#F0F0F3] hover:text-[#52525B]"
                  >
                    <Trash2 className="size-4" strokeWidth={2} />
                  </button>
                </div>
                <PromptList
                  items={r.prompts}
                  onChange={(prompts) => setRule(r.id, { prompts })}
                  max={SLOTS}
                  note={(used) => `${used} of ${SLOTS}`}
                />
              </div>
            ))}
            <button
              onClick={() =>
                setRules([
                  ...rules,
                  { id: `r${rules.length + 1}`, match: "", prompts: [""] },
                ])
              }
              className="flex w-fit items-center gap-1.5 text-[12px] font-medium text-[#7C3AED] transition-opacity hover:opacity-80"
            >
              <Plus className="size-4" strokeWidth={2} /> Add a page rule
            </button>
          </div>
        </div>
      )}

      {/* ── fallback ──
          One list in both modes, because it answers the same question either
          way: what shows when nothing more specific applies. Automatic — the
          engine has not generated yet, or could not. Manual — no page rule
          matched. */}
      <div className="mt-7 border-t border-[#EAEAEF] pt-7">
        <span className="block text-[14px] font-medium text-[#27272A]">
          Fallback
        </span>
        <Hint>
          {automatic
            ? "Shown until suggestions are generated, and any time generation has nothing to offer."
            : "Shown on any page without a rule of its own."}
        </Hint>

        <div className="mt-4">
          <PromptList
            items={fallback}
            onChange={(fallback) => patch({ fallback })}
            max={SLOTS}
            note={(used) => `${used} of ${SLOTS}`}
          />
        </div>
      </div>

      <SaveBar label="Save Suggestions" />
    </>
  );
}

/* ── shell ──────────────────────────────────────────────────────────────── */

/* Automatic is the default because it is the feature: the manual path exists
   for customers who will not accept generated copy on their site, which is a
   real and stated position, not an edge case. */
export const DEFAULT_SUGGESTIONS: SuggestionState = {
  automatic: true,
  rules: [
    {
      id: "r1",
      match: "/pricing",
      prompts: ["Compare the plans", "Is there a free trial?"],
    },
    { id: "r2", match: "/about", prompts: ["Who are you?"] },
  ],
  fallback: [
    "What can Tars do?",
    "Can I book a demo?",
    "How much does it cost?",
  ],
};

export function ConfigurePanel({
  suggestions,
  onSuggestions,
  onBack,
  initialSection = "general",
}: {
  suggestions: SuggestionState;
  onSuggestions: (v: SuggestionState) => void;
  /* Present when the panel is open over something else — the design tool —
     and absent on its own route, where there is nothing to go back to. */
  onBack?: () => void;
  initialSection?: Section;
}) {
  const [section, setSection] = useState<Section>(initialSection);

  return (
    <div className="flex h-full min-h-0 bg-white text-[#27272A]">
      <DashboardRails
        section="configure"
        onNavigate={(v) => v === "design" && onBack?.()}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* agent header */}
        {/* 64px, the same as the design tool's top bar — the rails run past both, so
            a different height puts a visible step in the page when you cross over. */}
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-[#EDEDF1] px-6">
          <div>
            {/* Same two lines and sizes as the design tool's bar: the section
                name, then what it is for. The agent's name used to lead here,
                which named the thing you are editing rather than the place you
                are in — and it left the two headers saying different kinds of
                thing in the same slot. */}
            <h1 className="text-[15px] font-semibold leading-tight text-[#18181B]">
              Configure
            </h1>
            <p className="text-[11px] text-[#979797]">
              Set up how the agent behaves
            </p>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          {/* settings nav */}
          <aside className="w-[212px] shrink-0 overflow-y-auto border-r border-[#EDEDF1] px-4 pt-5 pb-6">
            <div className="px-2 pb-2 text-[12px] font-medium tracking-[0.08em] text-[#A1A1AA]">
              SETTINGS
            </div>
            <div className="flex flex-col gap-0.5">
              {NAV.map(({ key, label, Icon, live }) => {
                const active = key === section;
                return (
                  <button
                    key={key}
                    onClick={() => live && setSection(key as Section)}
                    aria-current={active ? "page" : undefined}
                    /* Every item reads the same. The unbuilt ones were greyed,
                       which made the nav look half-disabled rather than like the
                       real thing this is standing in for — and greying is how a
                       product says "not available to you", which is not what is
                       true of these. */
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[14px] transition-colors ${
                      active
                        ? "bg-[#F3EEFC] font-medium text-[#6D33AA]"
                        : "text-[#3F3F46] hover:bg-[#F7F7F9]"
                    }`}
                  >
                    <Icon className="size-[18px] shrink-0" strokeWidth={1.8} />
                    {label}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* content */}
          <main className="min-w-0 flex-1 overflow-y-auto px-10 py-8">
            <div className="mx-auto w-full max-w-[624px]">
              {section === "general" ? (
                <GeneralSettings />
              ) : (
                <SuggestionSettings
                  value={suggestions}
                  onChange={onSuggestions}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
