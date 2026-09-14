# Messenger 3.0 — handoff

Everything the launcher and messenger do, and the numbers they do it with.
Written against the code at `app/design/page.tsx` (the design tool) and
`components/launcher/GlassComposer.tsx` (the component the tenant demos run),
so where this document and the code disagree, the code is right and this is a
bug report.

Signed off at the design review on 11 September 2026. Four things are still
open — they are at the end, and the first of them blocks the event schema.

---

## 0. Start here

1. Run it — `npm install && npm run dev`, then open `/design`. Both launcher
   styles, three placements, six visitor states, three devices. Clicking
   through it is faster than reading about it.
2. **The lifecycle is §5.** Six states, when each applies, what the launcher
   shows, what opening lands on, and the priority order when more than one is
   true at once.
3. **The specs are §2–§11.** Geometry, motion, theming, every number.
4. **Build from `components/launcher/GlassComposer.tsx`** — the working
   launcher and messenger, and what `/brightline` runs.

Two implementations exist and it matters: `GlassComposer` is the component
that ships, and `app/design/page.tsx` is a preview of it with its own copy of
the UI so the settings panel can drive it. Where they disagree, this document
is the tiebreak; where this document is wrong too, the component wins.

§12 is four decisions still open. The first one blocks the event schema.

---

## 1. What ships

| Route | What it is |
|---|---|
| `/design` | The design tool: both launcher styles, three placements, six visitor states, three devices. This is the design. |
| `/brightline` | The same launcher on a customer's real site. What a tenant is in practice: one accent, one content pack. |
| `app/_explored` | Everything tried on the way here. Out of routing, not built, not deployed. Its README says how to bring a route back. |

**Vocabulary.** *Launcher* is the thing resting on the customer's page.
*Messenger* is the window it opens. They used to both be called "the widget";
they are two objects with two jobs and the names are not interchangeable.

---

## 2. Launcher — composer

An input bar inviting a question. The ChatGPT pattern: nothing speaks first,
because the shape of the control is the invitation.

### Geometry

| | Centred | Left / right |
|---|---|---|
| Resting width | 340 | 340 |
| Open width | 600 | 400 |
| Height | 64 (mobile 52) | 64 |
| Corner radius | 32 (mobile 26) | 32 |
| Inner padding | 8 | 8 |
| Control disc | 44 (mobile 40) | 44 |

Mobile rests at **250** and opens to **342** inside a 380 viewport. The open
width is clamped to the frame with a **24px gutter each side**, so a tablet
opens to ~532 rather than spanning the page — a launcher with no page showing
either side of it has stopped being a widget.

### The control disc

One disc at the right end, always filled with the tenant's accent, glyph in
white. What it holds depends on the state:

| State | Glyph | Press does |
|---|---|---|
| Resting, empty field | mic | opens the messenger **and starts the recogniser** |
| Something typed | send arrow | sends |
| Recent / open conversation | chat mark with a dot | opens onto that conversation |
| Unread | chat mark + count badge | opens onto the unread messages |
| Dictating | tick | keeps what was said, leaves it in the field |

The mic at rest is deliberate: the send arrow it replaced offered to send a
message that did not exist yet, and the mic is the only mark on a resting
launcher that says a visitor may speak to this site.

### Expanding

Desktop expands on **hover**; touch expands on **scroll** (see §9). Expanding
reveals the contextual suggestions inside the pane. The panel and the composer
are one surface once open — panel top corners 40, composer foot corners 40,
one shadow cast by a single ghost element behind both.

---

## 3. Launcher — button

The classic corner button, for customers whose visitors need telling what the
thing is before they will use it.

- **Placements**: left and right only. No centre.
- **Shapes**: square, circle, chip (chip carries a label, default "Ask AI").
- **Sizes**: sm / md / lg, with a separate mobile size (defaults md desktop,
  sm mobile).
- **Icon**: a preset or an uploaded one.
- **Greeting** (on by default): the agent's own first message, beside the
  button. Switching it off does not stop the agent greeting — that line is the
  conversation's first message and belongs to the conversation.
- On hover the greeting card gives way to the contextual suggestions.
- The card carries a **dismiss ×** in the four states that raise one.

---

## 4. Placement

Composer: left, centre, right. Button: left, right.
Offsets default to **16px** horizontal and vertical, adjustable 0–120 in steps
of 4. Centred placement has no horizontal offset to set.

---

## 5. Visitor lifecycle

Six states. The strip under the preview in `/design` is these, in order.

| State | When | Resting launcher shows | Opening lands on |
|---|---|---|---|
| **First conversation** | no thread, or the last closed itself | placeholder cycling the suggestions | a new conversation |
| **Recent** | within **24 hours** | the last exchange, typed once and held | that conversation |
| **Open** | 24 hours to **7 days**, not closed | the last exchange, cycling question then reply | a fresh conversation, with the old one offered as a card |
| **Unread** | the agent wrote after they left | "You have *n* new messages" | the unread messages |
| **Unsent draft** | they typed and closed without sending | their own words, back in the field | the conversation, draft intact |
| **Floating message** | the agent goes first on a page | the message itself, on the page | that message |

A conversation **auto-closes after 7 days**.

**Priority**, when more than one applies: unsent draft → unread → open →
recent. Ordered by closeness to the next turn: a draft is a sentence already
begun; an unread is something that arrived; the rest is memory.

**Dismissal.** The button launcher's card carries a × in all four returning
states. Pressing it drops that state for the session — across pages — and the
launcher rests as a first visit. The unread comes back on the next inbound
message; recent, open and draft stay down. The composer launcher has no × by
decision: its row is already a field, a mic and a line of text.

---

## 6. Contextual suggestions

Three at a time (`SLOTS = 3`), the visitor's own words — each becomes their
message the moment it is pressed, so they are phrased as questions a visitor
asks, never instructions aimed at them.

- **Automatic** (default on): generated from the page, the conversation so far
  and what the agent is configured to do.
- **Manual**: page rules matched on a path prefix; most specific match wins.
- **Fallback**: shown until generation has run, when it has nothing to offer,
  or when no rule matches. Also the place to pin one suggestion that should
  always be present.
- Owned by Configure, not Design — it is content, not appearance.
- At rest the composer launcher **cycles these through its placeholder**; the
  placeholder text itself is the label on the input, shown once open.

Open: how these interact with an agent's own configured buttons — §12.

---

## 7. Unread

The badge alone could not carry it. A badge painted in the brand colour is, by
construction, the colour the customer's site is already full of.

- **Disc** fills with the accent, chat mark goes white.
- **Count badge** on the mark's top-right corner: **12px at rest, 16px through
  the buzz**, white with the number in the accent, 1.5px accent ring.
- **Buzz** (`mark-nudge`, `app/globals.css`): 2400ms cycle, still for the first
  62%, then a −6° wind-up, +16 / −14 / +11 / −8 / +5 / −2 with a 1.06 scale at
  the peak. A negative delay of −1488ms starts the cycle *inside* the buzz, so
  the first shake lands on the frame the state arrives.
- **Chime**: two sine notes, B5 (987.77Hz) into E6 (1318.51Hz) 110ms apart,
  low-passed at 3.2kHz, peak gain 0.05, under half a second. Synthesised, not a
  file. Browsers will not play it before the visitor has interacted with the
  page — the badge and the favicon carry the first one.
- **Favicon**: the site's own icon painted into a canvas with a red disc in the
  corner, restored when the state clears. This is the only red in the product
  and the only thing that does not re-theme, because it is on the browser's
  chrome rather than the customer's page.

---

## 8. The messenger

| | Value |
|---|---|
| Corner radius | **40** (`SURFACE_RADIUS`, one constant, read by panel, composer foot and shadow ghost) |
| Height, centred | 620 default — Brightline overrides to 580 |
| Height, corner | 720 default — Brightline overrides to 700 |
| Width | 600 centred, 400 in a corner |
| Max height | `calc(100dvh - 120px)`, and the shadow ghost carries the same clamp |
| Disclaimer measure | **500** centred, **320** in a corner; truncates with the rest on a hover tail |

Height is per-tenant through a `unifiedHeight` prop rather than by editing the
shared table, so one customer's shorter window does not become everyone's.

### Composer inside the messenger

- Textarea, one row, grows to its content, capped at 140px then scrolls.
- **Enter sends, Shift+Enter breaks a line.**
- Past **two lines** the pill becomes a stack: field on its own row, attach and
  mic/send wrapped onto a second row at either end, radius drops from a pill to
  24 — a pill that tall bows its sides inward and sets the message in a lens.
- The mic runs the browser's own recogniser: continuous, interim results, so
  words appear as they are said. Speech is appended to whatever was typed. A
  tick accepts. Hidden entirely where the browser has no recogniser.

---

## 9. Touch

**Tablet counts as touch, not desktop.** It is wide enough to lay out like a
desktop and has no pointer to hover with.

- Scroll **down** → contextual suggestions. Scroll **up** → back to the
  greeting, immediately: the offer took a scroll to earn its place, and an undo
  that waits reads as lag.
- 6px threshold before either counts, so a thumb settling does not flip it.
- Suggestions fold away **4500ms** after the page stops moving.
- No `mouseenter` handlers are wired on touch at all — a tap fires enter with
  no leave to match it, which latches a pane open forever.
- History rows swipe **132px** to reveal rename/delete, triggered at a third of
  that.

---

## 10. Floating message

A conversation on the page with no panel around it — the least intrusive way
to say something after the visitor has closed the messenger.

- Bubbles float above the launcher, the column matching the launcher's width.
- **No top fade.** The thread runs to the top of the screen and scrolls from
  there.
- **Close ×** hangs 20px above the column's top-right corner.
- The composer is **real**: typing, Enter to send, the same voice input, and
  the same two-line rule that stacks the controls below the field. Answering
  here never opens the panel — that is the whole point of the mode.
- Nothing else is drawn: no avatar, no name, no back arrow, no menu, no
  timestamps.

Open: when it should appear at all — §12.

---

## 11. Theming

A tenant is **one accent** plus a content pack. Everything tinted is mixed from
it:

- `--brand` and `--brand-lite` are published as CSS variables; every tinted
  surface mixes from those rather than naming a hex.
- The sparkle's four gradient stops derive from the accent: a pale tip at
  +18° hue and a deep one at −26°, with saturation floored at 58%. It used to
  be a fixed sky blue and fuchsia, which read as two foreign colours on any
  accent but purple.
- Links in a reply are ink text on an accent underline — an accent-coloured
  link fails contrast on a light brand colour.
- **What does not re-theme**: the favicon's red dot, and status colours in the
  analytics tool. Both are conventions borrowed from outside the product.

Content pack (`app/brightline/content.ts` is the worked example): agent name,
header title and subtitle, logomark, disclaimer, starters, questions, canned
replies, follow-ups, accordions, forms, sources, past conversations, greeting.

---

## 12. Still open

These four need answers before or during the build. The first one blocks the
event schema.

1. **Recent vs Open windows.** Currently 24 hours and 7 days. Vinit's note was
   24/48/72 for short-term memory. Whatever is chosen has to be the same
   boundary analytics uses to count a conversation, or the launcher and the
   dashboard will disagree about what one is.
2. **Floating-message triggers.** When does it appear rather than the resting
   launcher? The review's own words: define it, or remove it.
3. **Gambit vs contextual suggestions.** If the agent already has configured
   buttons, they currently win and the contextual set is dropped — which loses
   the context exactly when the visitor is deepest in the site. Options: merge,
   cap at three mixed, or let context win below the fold.
4. **Persisting open/closed across navigation.** If the messenger was open, it
   stays open on the next page, at the bottom of the thread, with **no entrance
   animation** — replaying it on every page makes the widget look like it is
   relaunching. If it was closed, it stays closed. `sessionStorage`, and how
   long "open" survives is answered by #1.

---

## 13. Analytics

Not built into the product — the dashboard is a mock in `_explored/analytics`
— but the event shape is the part that has to be right first, because nothing
can be counted retroactively.

**Conversation events, identical on every surface:**
`message_sent` · `agent_reply` · `goal_completed` · `handoff_requested` ·
`conversation_end`

**Arrival events, surface-specific:**

| Surface | Arrival |
|---|---|
| Web widget / on your domain | `launcher_impression` (visible ≥1s, once per session) → `launcher_click` |
| Agent link | `link_visit` |
| Mobile SDK | `entry_shown` → `entry_tapped` |
| WhatsApp | `message_delivered` → `message_read` |

Every event carries: `tenant`, `agent_id`, `surface`, `session_id`,
`visitor_id`, hashed page, device, launcher `variant`, `sdk_version`.

**Rules that matter:** counts roll up across surfaces, rates never do; identity
never crosses surfaces (a cookie and a phone number are two people); a metric
that does not exist on a surface is absent, not zero.

---

## 14. Measurements

Every number below is read off `components/launcher/GlassComposer.tsx` — the
component that ships. Tailwind's scale is in quarters of a rem, so `size-9` is
36px and `gap-2.5` is 10px; the values here are already converted.

### Composer launcher

| | Resting | Expanded |
|---|---|---|
| Width | 340 | 600 centred · 400 left/right |
| Height | 64 (8 + 48 + 8) | 64 |
| Radius | 32 | 32 — drops to 24 while dictating, when the row wraps |
| Padding | 10 × 8 | 10 × 8 |
| Control disc | 48 | 48 |

- **Placeholder**: 16px, weight 300, `--ink-mute`. Accent instead when there is
  a conversation to resume. 14px inside the messenger.
- **Mic disc**: 48, filled `var(--brand)`, 20px glyph in white, stroke 1.5.
- **Suggestion chips**: 14px/400, padding 16 × 8, full radius, fill
  `color-mix(var(--brand) 14%, white)`, ink
  `color-mix(var(--brand) 75%, black)`. Hover adds an inset 1.5px ring at 45%.
- **Travelling highlight**: 2px, one revolution per 5200ms.

### Messenger

| | Centred | Left / right |
|---|---|---|
| Width | 600 | 400 |
| Height | 620 (Brightline 580) | 720 (Brightline 700) |
| Radius | 40 | 40 |
| Max height | `calc(100dvh - 120px)` | same |

### Header

| Part | Value |
|---|---|
| Row | padding 20 × 13, gap 10, content height 36 |
| Logomark | 36 circle, brand fill, image fills the disc; monogram fallback 12px bold white |
| Title | 14px / 18px, semibold, `--ink-soft` |
| Subtitle | 12px / 14px, `--ink-faint`, 4px under the title |
| Back · menu · close | 32 buttons, 20px icons, `--ink-mute`, hover fills `--fill` |
| Right cluster | gap 4, pulled 4px into the row's padding |

### Conversation

| Part | Value |
|---|---|
| Thread padding | 20 sides, 16 top, 12 bottom |
| Gap between turns | 16 |
| AI message | no width cap — the full column (560 centred, 360 in a corner). 14px / 1.62, weight 300, `--ink-soft` |
| User bubble | max 80%, radius 20, padding 20 × 12, 14px weight 300 |
| Action row | 24 buttons, 2 gaps, 14px icons — the speaker is 16 because at a matched box it carries visibly less ink. Row pulled 6px left so the first glyph aligns with the text above it |
| Suggestion chips | right-aligned, one row, horizontal scroll, gap 8, chip spec as above |
| Disclaimer | 12px, `--note`, centred, max width 500 centred / 320 in a corner, truncated with the remainder on a hover tail |

### Composer inside the messenger

| Part | Value |
|---|---|
| Width | panel − 40 → 560 centred, 360 in a corner |
| Padding | 10 all round; 12 above, 20 below |
| Radius | full, → 24 past two lines |
| Discs | 44 attach and mic/send, 20px glyphs |
| Ring | inset 1px `brand-lite` at 55%, solid `var(--brand)` on focus |

---

## 15. Where things are

```
app/design/page.tsx                     the design tool
app/brightline/page.tsx + content.ts    the tenant demo
components/launcher/GlassComposer.tsx   launcher + messenger component
components/configure/ConfigurePanel.tsx contextual suggestions
components/dashboard/DashboardRails.tsx dashboard shell
app/globals.css                         keyframes, incl. mark-nudge
docs/CONVERSATION.md                    the demo script every state is a depth into
app/_explored/                          the archive, with its own README
```

Run it: `npm install && npm run dev`.
