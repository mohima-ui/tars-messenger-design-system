"use client";

import { MessageSquare, Mic, Plus, X } from "lucide-react";
import type { CSSProperties } from "react";

/* Recency bands. Held on the chat rather than worked out from a date,
   because these are fixtures with no real timestamps behind them — deriving
   the labels would mean inventing dates purely to turn them back into the
   three words written here. Swap to a date field and a comparison when this
   is fed by anything real. */
type Group = "Today" | "Yesterday" | "Earlier";
const GROUP_ORDER: Group[] = ["Today", "Yesterday", "Earlier"];

interface Chat {
  id: string;
  title: string;
  preview: string;
  time: string;
  /** What the conversation was about. Free text rather than a union, so a
      tenant can name its own queues without editing this file. */
  tag: string;
  group: Group;
}

const ACTIVE_CHAT_ID = "1";

const HISTORY_CHATS: Chat[] = [
  {
    id: "1",
    tag: "Sales",
    title: "Talk to sales · Studio plan",
    preview:
      "Tars: Perfect — you're booked in for Thursday at 2pm, and I've sent the calendar invite over.",
    /* A clock time, not "Now" or "Today". The band heading already says which
       day, so repeating it in the row spends the only column that could carry
       something new — where in the day it happened. The two together read as
       one fact: Today · 9:24 AM.

       Rows under Earlier keep their dates, because a bare time there says
       nothing: "Mar 12" is the useful half, and the band is too wide for a
       clock to place anything within it. */
    time: "9:24 AM",
    group: "Today",
  },
  {
    id: "2",
    tag: "Billing",
    title: "Refund for Order #3081",
    preview:
      "You: thanks, all sorted — really appreciate the quick turnaround on the refund.",
    /* Moved out of Today so the middle band isn't empty. A group label with
       nothing under it is worse than not grouping at all. */
    time: "4:12 PM",
    group: "Yesterday",
  },
  {
    id: "3",
    tag: "Technical",
    title: "Custom domain setup",
    preview:
      "Priya: I've added the DNS records on our side now, so the domain should verify within the hour.",
    time: "Mar 12",
    group: "Earlier",
  },
  {
    id: "4",
    tag: "Onboarding",
    title: "Welcome to Tars",
    preview:
      "Tars: Good morning. I'm here whenever you need a hand with anything at all.",
    time: "Mar 8",
    group: "Earlier",
  },
];

type Tab = "messages" | "voice";

interface ChatHistoryProps {
  onSelectChat: (id: string) => void;
  onClose: () => void;
  /** Start a fresh conversation. Falls back to onClose, which is what the
      button did when it lived in the header — so nothing changes for callers
      that don't pass it, and one that wants "new" to mean new can say so
      without the two actions having to stay conflated. */
  onNew?: () => void;
  onVoice?: () => void;
  /** Offer the voice agent. Off for surfaces that don't have one — which
      takes the tab bar with it, since a tab strip with a single tab is a
      title bar drawn as a control. */
  voice?: boolean;
  /** Tenant accent. One value — every other shade here is derived from it
      with color-mix, so re-theming is this prop and nothing else. Defaults
      to the Global Payments blue the component shipped with. */
  accent?: string;
  tab?: Tab;
  onTabChange?: (tab: Tab) => void;
}

export function ChatHistory({
  onSelectChat,
  onClose,
  onNew,
  onVoice,
  voice = true,
  accent = "#120bf4",
  /* Optional now, so a caller with no voice doesn't have to hold state for a
     choice it never offers. */
  tab = "messages",
  onTabChange,
}: ChatHistoryProps) {
  const setTab = onTabChange ?? (() => {});
  /* Guards against being handed tab="voice" with voice off — the list is the
     only thing that can render in that case, and honouring the prop would
     leave the panel blank with no way back. */
  const activeTab: Tab = voice ? tab : "messages";

  return (
    /* The accent goes in as a custom property rather than being spread across
       inline styles, because the states that need it — hover, active, the 8%
       tint — can only be expressed as classes, and a class can't interpolate
       a prop. Through a variable, Tailwind's arbitrary values can reach it
       and color-mix can derive the rest from the one value. */
    <div
      className="flex h-full flex-col rounded-[20px] bg-[#FEFCF8]"
      style={{ ["--accent" as string]: accent } as CSSProperties}
    >
      {/* Declared rather than derived from padding, so changing an icon size
          can't move the band — and matched to the chat header's 64px, since
          the two views swap in place and any difference shows up as the title
          hopping between them. */}
      {activeTab === "messages" && (
        <header className="flex h-16 shrink-0 items-center justify-between rounded-t-[20px] border-b border-[#EBE7E3] px-6">
          <p className="text-[18px] leading-6 font-semibold text-[#333]">
            Conversations
          </p>
          {/* Dismiss on the right, matching the chat header's × rather than
              its back chevron — the two views swap in place, so the control
              that closes the panel stays in one corner across both.

              The 28px box now ends flush on the header's 24px inset, no
              negative margin. That squares it with the title on the other
              side; the glyph itself sits a few pixels further in, since its
              hit area is larger than the mark it carries. */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close conversations"
            className="flex size-7 shrink-0 items-center justify-center rounded-[6px] text-[#6E6E6E] transition-colors hover:bg-[#F0EBE0] hover:text-[#333]"
          >
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </header>
      )}

      {/* Content */}
      {activeTab === "messages" && (
        <div className="scrollbar-subtle flex-1 overflow-y-auto">
          {GROUP_ORDER.map((group) => {
            const chats = HISTORY_CHATS.filter((c) => c.group === group);
            /* An empty band is skipped rather than shown as a heading over
               nothing — a label is a promise that something follows it. */
            if (chats.length === 0) return null;
            return (
              <section key={group}>
                {/* Sticky, so the band you're reading stays named as you
                    scroll past its rows. Opaque for the same reason it has to
                    be: rows would otherwise slide visibly under the text. */}
                {/* pb-0.5 rather than pb-1.5: the row below contributes 2px of
                    its own from py-0.5, so the visible gap is the two added
                    together. 2 + 2 = the 4px wanted; setting this to 4 would
                    have given 6. */}
                <h3 className="sticky top-0 z-10 bg-[#FEFCF8] px-6 pb-0.5 pt-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#979797]">
                  {group}
                </h3>
                {chats.map((c) => {
                  const isActive = c.id === ACTIVE_CHAT_ID;
                  return (
                    /* The fill is on an inner card, not the button. Selected
                       used to be a full-bleed band running edge to edge,
                       which reads as a highlighted row in a table; inset and
                       rounded, it reads as one thing lifted out of the list.

                       Splitting it in two is what keeps the text still: the
                       button holds the 12px outer margin, the card holds the
                       12px inner padding, and 12 + 12 lands the text on the
                       same 24px inset the group headings use — so nothing
                       moves between the states, only the fill appears.

                       No divider between rows either. The group headings
                       already cut the list where it means something, and a
                       rule under every row on top of that chops it into
                       slices of equal weight. */
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onSelectChat(c.id)}
                      className="flex w-full justify-center py-0.5 text-left"
                    >
                      {/* Fixed 383 × 60 with a flat 10px inset. The button
                          centres it, since 383 inside the panel's 400 leaves
                          8.5px a side and nothing else would place it evenly.

                          60px is tight for what's in here: 10px of padding
                          top and bottom leaves 40px, and the two lines of
                          text measure about 38. It fits, but there's no room
                          to raise a font size without the card growing or the
                          text clipping. */}
                      {/* Selected takes --ds-bg-paper, the same token the AI
                          bubble fills with, rather than a hex copy of it — so
                          a tenant that re-themes paper moves both together
                          instead of leaving the list behind.

                          That colour was the hover state until now, so hover
                          moved down to roughly half of it, mixed against the
                          panel. The order matters more than the exact values:
                          rest is the panel, hover is part-way, selected is
                          the full paper. Giving hover and selected the same
                          fill would have made the pointer look like it was
                          selecting things as it passed over them. */}
                      <div
                        className={`flex h-[60px] w-[383px] max-w-full items-center gap-3 rounded-[14px] p-[10px] transition-colors ${
                          isActive
                            ? "bg-[var(--ds-bg-paper)]"
                            : "hover:bg-[color-mix(in_srgb,var(--ds-bg-paper)_55%,#FEFCF8)]"
                        }`}
                      >
                      {/* The logomark rather than an initial. rounded-full is
                          belt and braces — the PNG's own alpha is already a
                          circle — but it keeps the shape if the asset is ever
                          swapped for a square one.

                          alt="" because the row's own title and preview say
                          who the conversation is with; a screen reader
                          announcing the brand on every row would bury that.

                          Worth knowing this flattens the distinction the
                          initials carried: one of these threads is with Priya
                          rather than the agent, and every row now shows the
                          same Tars mark regardless. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/tars-logomark.png"
                        alt=""
                        className="size-9 shrink-0 rounded-full object-cover"
                      />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-baseline gap-2">
                          {/* min-w-0 lets the title give way first: with the
                              tag pinned beside it, something has to yield
                              when the row runs out of room, and it should be
                              the long string rather than the four-letter
                              label being squeezed to nothing. */}
                          <p
                            className={`min-w-0 truncate text-[13px] ${
                              isActive ? "font-semibold" : "font-medium"
                            } text-[#333]`}
                          >
                            {c.title}
                          </p>
                          {/* Beside the title, not on the preview line. It
                              qualifies what the conversation *is*, so it
                              reads with the name; under the preview it looked
                              like a label on the last message instead.

                              relative -top-px because the row aligns on the
                              baseline — correct for the title and the time,
                              but a pill has no baseline of its own, so it
                              hangs a pixel low without the nudge. */}
                          <span className="relative -top-px shrink-0 rounded-full bg-[#F0EBE0] px-1.5 py-px text-[10px] font-medium text-[#6E6E6E]">
                            {c.tag}
                          </span>
                          <p className="ml-auto shrink-0 text-[10px] font-medium text-[#979797]">
                            {c.time}
                          </p>
                        </div>
                        <p className="truncate text-[12px] text-[#6E6E6E]">
                          {c.preview}
                        </p>
                      </div>
                      </div>
                    </button>
                  );
                })}
              </section>
            );
          })}
        </div>
      )}

      {activeTab === "voice" && (
        <div
          className="flex flex-1 flex-col items-center justify-center gap-5 px-6"
          style={{ animation: "fade-in 180ms ease-out both" }}
        >
          <div className="flex size-20 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]">
            <Mic className="size-8 text-[var(--accent)]" strokeWidth={1.25} />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-[15px] font-semibold text-[#333333]">Talk to AI Agent</p>
            <p className="max-w-[220px] text-[12px] leading-[1.55] text-[#979797]">
              Start a real-time voice conversation with the AI agent
            </p>
          </div>
          <button
            type="button"
            onClick={onVoice}
            className="inline-flex items-center rounded-full bg-[var(--accent)] px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_85%,black)] active:bg-[color-mix(in_srgb,var(--accent)_72%,black)]"
          >
            Use voice
          </button>
        </div>
      )}

      {/* New sits under the list rather than in the header.

          It's the one action on this view, and it belongs at the end of what
          it acts on: you read the conversations, don't find the one you
          wanted, and the way to start another is where your eye already
          finished. In the header it was competing with the title for the
          corner and reading as a header control rather than a next step.

          No rule above it: every row already carries a bottom border, so a
          band line landed straight under one and read as a doubled hairline.
          The button's own fill separates it well enough. shrink-0 so the list
          gives up the height rather than this.

          Centred rather than stretched, now that the button is a fixed 346px:
          w-full would have left it flush left with 22px of dead space on the
          right, since the panel's content box is 368px. max-w-full keeps it
          inside anything narrower. */}
      {activeTab === "messages" && (
        <div className="flex shrink-0 justify-center px-4 pb-6 pt-3">
          <button
            type="button"
            onClick={onNew ?? onClose}
            /* Declared height rather than py- padding, so the text size and
               the icon can be retuned without the button changing size. */
            className="inline-flex h-[46px] w-[346px] max-w-full items-center justify-center gap-1.5 rounded-[16px] bg-[var(--accent)] px-3 text-[13px] font-semibold text-white transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_85%,black)] active:bg-[color-mix(in_srgb,var(--accent)_72%,black)]"
          >
            <Plus className="size-4" strokeWidth={2.25} />
            New conversation
          </button>
        </div>
      )}

      {/* Bottom tab bar. Goes with voice — the strip exists to choose between
          the two, so with one left it would be a label pretending to be a
          control, and it would eat 49px of list to say nothing. */}
      {voice && (
      <div className="flex shrink-0 rounded-b-[20px] border-t border-[#EBE7E3]">
        {(["messages", "voice"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors ${
              tab === t ? "text-[var(--accent)]" : "text-[#979797] hover:text-[#555]"
            }`}
          >
            {t === "messages" ? (
              <MessageSquare
                className="size-5"
                strokeWidth={tab === t ? 2 : 1.5}
              />
            ) : (
              <Mic
                className="size-5"
                strokeWidth={tab === t ? 2 : 1.5}
              />
            )}
            {t === "messages" ? "Messages" : "Voice"}
          </button>
        ))}
      </div>
      )}
    </div>
  );
}
