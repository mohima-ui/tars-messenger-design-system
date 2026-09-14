# Update — action points from 1 Sept call

Everything below is live at `/design/v2`. The visitor states are the strip under
the preview, so each point can be clicked through rather than described.

---

## Done

**Conversation states**
- Three-state lifecycle built as discussed — First conversation → Recent (within
  24h) → Open (24h to 7 days) → auto-closed after 7 days.
- Unread message and Unsent draft kept as their own states on top of those.
- Standardised for now, but the thresholds sit in one place so we can make them
  per-organisation later without reworking anything.

**Recall on the launcher**
- Recent and Open no longer say "Continue your conversation" — they show the last
  exchange itself: the visitor's own question and the start of the reply.
- The launcher opens on whatever it is showing, so pressing it never lands
  somewhere different from what it just said.

**Conversation history**
- Channel tag removed entirely.
- Each row now shows the last message across two lines, using the space the tag
  freed up. Title + last message, which is what people scan for.
- Speaker prefixes ("Global Payments:", "Marcus:") removed — every conversation
  in the list is with the same agent.

**Unread**
- Real counts — "2 new messages", and the badge matches.

**Mobile**
- History rows swipe to reveal Rename / Delete, since there is no hover.
- Suggestions come up on scroll instead of hover, and fold away a few seconds
  after scrolling stops.
- Spacing tightened across the launcher; type left at 14px so it stays readable
  one-handed.

**Composer launcher**
- No text cursor on hover — hover expands, click opens, as you asked.
- Mic button added; clicking it opens the widget straight into recording.
- Contextual suggestions are one horizontally scrolling row on desktop, two rows
  on mobile. They no longer take three rows of the panel.
- Offsets are now configurable for the composer too, not just the button. Both
  launchers rest at the same distance from the edge by default.

**Start a new conversation**
- Compared seven placements in the tool — top bar, floating pill, header icon,
  above the composer, and three in-thread variants.
- Landed on a compact chip on a divider at the foot of the thread, which is
  where the panel opens. The earlier version was above the fold and effectively
  invisible.

**Header menu**
- "New conversation" instead of "Restart", since conversations are persistent now.
- Auto-read is off by default.

**Floating messenger**
- Built as a full mode and as a visitor state, on both launchers.
- Message bubbles are translucent frosted glass, as you suggested — the page
  stays readable behind them. Shadows kept light so the glass does not sit in a
  pool of grey.
- The column scrolls on its own without taking the website with it, and the
  oldest turn dissolves at the top edge rather than being cut.
- Suggestions can be answered in place without opening the messenger. Clicking
  the input field opens the full panel, carrying whatever was said on the page
  into it.

---

## Open — need your call

1. **Icon picker rows.** You asked for one row with the custom-image slot first.
   It is currently two rows of three, which fits the column exactly. Happy to go
   to one row if you would rather — it means either scrolling or fewer icons.

2. **Persistent suggestion.** The always-on "Book a demo" button. Designed and
   ready, held back until we finalise how it sits alongside the generated ones —
   whether it takes one of the three slots or gets its own.

3. **Remaining icons.** You said the first one is fine and the other three still
   look old. Not touched yet — want to redraw the set rather than swap them one
   at a time.

4. **Intercom's floating mode.** Still have not found a reference for how they
   handle it. If you or Sushmita have a link, it would help settle the dismiss
   behaviour — right now there is a close control but no rule behind it (per
   page, per session, or permanently).

---

## Also worth a look

- **Reasoning trace** now appears on every agent message, with the duration
  derived from the answer rather than fixed.
- **Message actions** (copy, feedback, timestamp) appear once per reply rather
  than under every paragraph of a multi-part answer.
- **Suggestions are read off the conversation** rather than from a separate list,
  so they always answer the question the current turn ends on and cannot drift.
