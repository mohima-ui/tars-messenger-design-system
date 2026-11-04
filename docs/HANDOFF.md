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
- **Icon**: a preset or an uploaded one. Finer options sit in a **⋯ popover**
  beside the Icon label (236 wide, anchored under the ⋯), not as permanent
  controls. The ⋯ has no background at rest (`#9A9A9A` glyph); light purple
  `#F6F0FF` with a `#6D33AA` glyph on hover and while open.
  - **Button background**: three swatches — Accent (default) · Custom · None.
    - *Custom* reveals the same picker as the messenger's Accent field: a hue
      wheel (32px, conic gradient) with the chosen colour as a 16px dot in its
      centre, and a hex field beside it (36 high, mono 13px). Starts at
      `#FFB020`.
    - On a custom colour the glyph flips to `#16171A` when the fill's OKLCH
      L > 0.72, else white. Applies to the resting icon, the chip label and the
      resume badge.
    - *None* is for an uploaded image only (a transparent PNG that is already
      the shape): no body, no shadow. With a preset icon it is shown
      **disabled** (40% opacity), not hidden.
  - **Image padding** (uploaded image only, otherwise shown disabled): 0–16px,
    step 2. 0 = edge to edge, cropped to the shape; above 0 the image is inset
    and shown whole on the button's background.
- **Logo options** (Messenger → Brand identity): a **⋮ box** of its own beside
  the logo upload box — 44 wide, full height of the upload box, radius 12,
  1px `#E5E5E5` border; `#C4A9E8` border on `#F6F0FF` while open. Always
  present, logo or not (settings made before an upload apply when it lands).
  It opens a popover **268 wide**, fixed to the viewport (it may hang outside
  the settings column), **6px below the box and centred on it**, clamped 8px
  inside the window. Contents, top to bottom, 16px apart:
  - **Transparent background** — toggle, with an ⓘ tooltip ("For a PNG with
    transparency. Off, the accent shows behind it.").
  - **Logo spacing** — slider, −30% to 30%, step 1. One continuous zoom: the
    image is drawn at `100 − 2 × spacing` % of the mark. Positive = padding,
    negative = zoom in (crops a margin baked into the file), 0 = edge to edge.
  - **Logo width** — slider, px.
  - **Logo corner radius** — slider, px.
  - **Reset to default** — text link, 11px, Tars purple `#632E9A`
    (`#4A2275` hover).
  - Slider anatomy: label 12px medium `#555` left, value 12px semibold with a
    10px unit right, **8px** from the label row to the track; track 4px,
    `#632E9A` filled to the thumb, `#ECECEE` after it; thumb 16px white with a
    2px `#632E9A` ring.

  Two separate sets of values, switched by the Center toggle:

  | | Round mark (default) | Centred wordmark |
  |---|---|---|
  | Transparent background | off (accent behind) | **on** (nothing behind, as before) |
  | Logo spacing | 0% | 0% |
  | Logo width | **36px**, range 28–48 | **120px**, range 60–200 |
  | Logo corner radius | 18 (round), range 0–width/2 | 0, range 0–22 |
- **Greeting** (on by default): the agent's own first message, beside the
  button. Switching it off does not stop the agent greeting — that line is the
  conversation's first message and belongs to the conversation.
- On hover the greeting card gives way to the contextual suggestions.
- The card carries a **dismiss ×** in the four states that raise one.

---

## 4. Placement

Composer: left, centre, right. Button: left, right.
Offsets default to **40px** horizontal and vertical, adjustable 0–120 in steps
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

**Recent, expanded (composer launcher).** When the pane opens (hover on
desktop, scroll on touch), the field reads **"Continue your conversation"**,
followed by **"or start new"**. Only **"start new"** is the control: a ghost
button that starts a new conversation. "or" is part of the sentence.

| | Value |
|---|---|
| "Continue your conversation" and "or" | the field's placeholder style: 14px, light 300, `hint` colour. Pressing the field continues the thread, as before |
| "start new" | ghost button: no fill, no border. 14px, **medium 500**, the accent made readable on the surface (`readableOn(accent, surface)`, §11.1), **underlined**, 2px underline offset |
| Spacing | 4px between "Continue your conversation", "or" and "start new" |
| Pressing "start new" | opens the messenger on a **new** conversation. The old thread stays in history |
| Narrow pill (phone) | the label truncates with "…"; "or start new" never shrinks or wraps |
| Not shown | at rest (the field reads "Continue your conversation..." alone), or when the field holds a draft or an unread |

In `/design` the link sits inside the field, which is itself a button, so the
link stops its press from reaching the field. In production, build them as
**two sibling controls** rather than one nested in the other.

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

- **Layout.** In the composer launcher: always one line, scrolled sideways.
  Above the button launcher: a stack, one per line. In the messenger: stacked on desktop and tablet (up to 4 lines, no scroll),
  sideways on a phone (one line, or two when the suggestions are long).
  Full rule and how they arrive: §11.3.

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
- **Mic disc at rest is filled with the accent, white glyph** — the same as the
  composer launcher's resting mic, for every tenant. Listening keeps the fill,
  swaps the glyph for a tick and adds a pulsing `rgba(255,255,255,.3)` ring.
  (Was a `paper` disc in `ink` at rest.)

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

**Preview on your site — tenant pages.** `brightline.com` (any path) shows the
twelve section captures in `public/brightline/screens/` stacked as one page, and
the preview runs **Brightline's conversation** from `app/brightline/content.ts`:
the greeting ("Hi there!" + the intro) with its four prompts, scripted replies
with their follow-ups, `replyFallback` for anything unscripted, and a Recent /
Open thread that walks "How do I get started?" down its follow-ups.
`globalpayments.com` shows its single capture; every other URL is a live
capture. Agent name, logo and accent still come from Brand identity. `**bold**`
in a reply renders semibold.

Content pack (`app/brightline/content.ts` is the worked example): agent name,
header title and subtitle, logomark, disclaimer, starters, questions, canned
replies, follow-ups, accordions, forms, sources, past conversations, greeting.

### 11.1 Dark mode

> **For engineering:** apply this on top of the current build. It changes
> colours in dark mode only — no layout, sizes or behaviour, and light mode is
> untouched. Every value here is from `/design`. Where an older section of this
> document gives a different colour for dark, this section wins.

**One mode for the whole unit.** Light / dark is a single setting (Messenger →
Theme → Mode) and it drives the launcher *and* the messenger together: composer
launcher, button launcher, greeting card, suggestion chips, recall card and the
panel. There is no separate launcher mode. A dark panel opening out of a light
launcher is two products.

The one rule behind everything below: **in dark mode, readability is never
traded away.** Every colour here was chosen, or is computed, so that text a
visitor has to read clears **4.5 : 1** and icons / strokes clear **3 : 1**
(WCAG AA).

#### Principles

1. **No pure black, no pure white.** The panel is a charcoal, text is an
   off-white. Black reads as a hole cut in the customer's page and pure white
   text on it glares.
2. **Elevation goes lighter, not darker.** canvas → surface → paper each step
   *up* in lightness. A drop shadow has nothing darker to cast on a dark page,
   so every raised thing (panel, cards, popovers) also carries a **1px inset
   hairline in `line`** and a deeper, softer shadow pool.
3. **Three text levels, by lightness, never by colour.** `ink` (body),
   `secondary` (supporting), `muted` (timestamps, hints). All three clear 4.5.
4. **The accent splits in two.** As a **fill** (user-facing buttons, discs) it
   stays the tenant's exact colour. As **ink** (text, icons, hairlines on the
   dark surface) it is recomputed per tenant so it can be read — see
   *Readable accent*. A brand colour picked against white falls to ~1.6 : 1 on
   charcoal and simply disappears.
5. **Less saturation.** Recomputed accent inks drop chroma to 85% as they get
   lighter; saturated colour vibrates on dark grounds.
6. **Overlays, not fixed colours, for washes.** Hovers, discs, highlights are
   the ink (or white) at low alpha over whatever is underneath, so they are
   correct on every surface and every tone.

#### Neutrals — the shipped palette

`/design` always runs the **"light"** palette (`themeKey` is fixed to
`"light"`; Warm / Slate / Midnight palettes exist in `NEUTRALS` but are not
exposed). Light values are listed for comparison.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `canvas` | `#FFFFFF` | `#242427` | page-level ground behind the panel |
| `surface` | `#FFFFFF` | `#2C2C30` | the panel, the launcher pill, greeting / recall cards |
| `paper` | `#F2F2F2` | `#36363B` | user bubble, discs, chip and control fills |
| `line` | `#E9EAEA` | `#45454B` | hairlines, header rule, the dark elevation ring |
| `ink` | `#16181D` | `#EFEFF1` | body text, AI replies, user bubble text |
| `secondary` | `#6B7280` | `#B4B4B9` | supporting text, toolbar icons, notice line |
| `muted` | `#9CA3AF` | `#A1A1A7` | timestamps, hints, faint labels |

**Dark contrast (white surface tone):**

| | on `surface` `#2C2C30` | on `paper` `#36363B` |
|---|---|---|
| `ink` | 12.1 : 1 | 10.5 : 1 |
| `secondary` | 6.7 : 1 | 5.8 : 1 |
| `muted` | 5.4 : 1 | 4.7 : 1 |
| `line` (non-text) | 1.5 : 1 | — |

#### Surface tone in dark (White / Warm / Cool)

The Surface setting tints `canvas`, `surface`, `paper` and `line` (never the
inks).

- **Light mode:** an sRGB mix toward the tone's hue — Warm `#F5E7D0`, Cool
  `#DCE4F2` — at **22%**.
- **Dark mode:** *not a mix* (mixing a pale cream into charcoal is mostly mixing
  in white and lifts every surface). Each surface **keeps its own OKLCH
  lightness** and takes only the tone's **hue**, at chroma
  `max(own C, tone C × 0.5)`.

| Dark | canvas | surface | paper | line | muted on paper |
|---|---|---|---|---|---|
| White | `#242427` | `#2C2C30` | `#36363B` | `#45454B` | 4.7 : 1 |
| Warm | `#29241B` | `#312C23` | `#3B362D` | `#4B453C` | 4.7 : 1 |
| Cool | `#22242A` | `#2A2D32` | `#34373C` | `#43464B` | 4.7 : 1 |

`ink` stays ≥ 10.4 and `secondary` ≥ 5.8 on every dark paper.

#### Readable accent (`readableOn`)

Wherever the accent is **read** rather than filled, it goes through
`readableOn(fg, bg, min)`:

1. If `contrast(fg, bg) ≥ min`, return `fg` untouched.
2. Otherwise convert to OKLCH, keep the **hue**, and step **L** by 0.01 away
   from the ground (up on a dark ground, down on a light one); on the way up,
   chroma is **× 0.85**. Return the first step that clears `min`.
3. Fallback `#FFFFFF` / `#000000` if nothing clears.

`min` is **4.5** for text, **3** for icons and strokes. Contrast is the WCAG
relative-luminance ratio.

Applied to:

| Element | min | ground |
|---|---|---|
| Recall card label + time ("Your last message", unread label) | 4.5 | `surface` |
| Composer launcher second line (accent text in the pill) | 4.5 | launcher `surface` |
| "Thought for Ns" label, when the trace is open | 4.5 | `surface` (input is the lighter partner, see below) |
| Tool-call icon (wrench) and output arrow in the trace | 3 | `surface` |
| "+" on the in-thread rule | 3 | `surface` |
| Unread count on the white badge | 4.5 | `#FFFFFF` |

Resolved, dark, white tone (`surface #2C2C30`):

| Tenant | Accent | as given | text (4.5) | icon (3) |
|---|---|---|---|---|
| Tars | `#632E9A` | 1.6 : 1 | `#AA81E1` 4.6 | `#8B63C0` 3.1 |
| Global Payments | `#120BF4` | 1.6 : 1 | `#5592FF` 4.6 | `#3469FF` 3.1 |
| Vodafone | `#E60000` | 2.9 : 1 | `#FF5C4B` 4.6 | `#DC382B` 3.1 |
| Amex | `#006FCF` | 2.8 : 1 | `#4D96E9` 4.5 | `#2D77C8` 3.0 |
| Brightline | `#FFA300` | 7.0 : 1 | unchanged | unchanged |

#### The lighter partner (`liteOf`) in dark

`liteOf(accent)` = OKLCH L **0.61**, C **min(0.21, C × 1.25)**, accent hue.
Dark swaps the accent for it on things that are **marks or strokes**, not text
(all clear 3 : 1):

- the thinking sparkle / orb ink,
- the trace's ticks and the configured thinking mark,
- the suggestion-chip hover ring: `color-mix(in oklab, liteOf 88%, transparent)`
  (light: `color-mix(in srgb, accent 45%, transparent)`), plus a wash of
  `rgba(255,255,255,0.07)` over the chip (light: none).

Where it is used as text (the trace label) it is passed through `readableOn`
at 4.5 first.

#### Accent fills — unchanged in dark

The tenant's exact accent, white glyph on top: the send button, the **mic disc
at rest and while listening**, the button launcher, the composer launcher's
disc, the unread disc. White on Tars / GP is 8.8 : 1.

**Known gap:** on a very light accent the white glyph is low — Brightline
`#FFA300` is **2.0 : 1**. A glyph flip (`#16171A` when the fill's OKLCH
L > 0.72, the same rule the custom button background uses) is the fix; not
applied to the shared fills yet — decision pending.

#### Bubbles

- **User bubble** (shipped palette): `paper` fill, `ink` text — **10.5 : 1**
  dark. Same in both modes structurally.
- **Accent-tinted bubbles** (the unexposed palettes, and the header's avatar
  fallback disc) use the dark trio from `deriveShades`:
  `soft` = L 0.40 / C ≤ 0.08, `border` = L 0.51 / C ≤ 0.11,
  `ink` = L 0.93 / C ≤ 0.05, accent hue. `ink` on `soft` ≈ **7.5 : 1** for every
  tenant above.

#### Elevation, washes, popovers

| | Light | Dark |
|---|---|---|
| Panel (elevation "shadow") | `0 18px 50px -12px rgba(15,17,26,.26), 0 2px 6px rgba(15,17,26,.06)` | `inset 0 0 0 1px line, 0 18px 50px -12px rgba(0,0,0,.5)` |
| Composer launcher ring | V6 ring (five-layer light shadow) | `inset 0 0 0 1px line, 0 6px 16px rgba(0,0,0,.30), 0 16px 40px rgba(0,0,0,.38), 0 32px 80px rgba(0,0,0,.30)` |
| Greeting / recall card | `inset 0 0 0 1px rgba(18,21,33,.06)` + card shadow | `inset 0 0 0 1px line, 0 10px 30px rgba(0,0,0,.34), 0 28px 60px -20px rgba(0,0,0,.38)` |
| Popover (header menu etc.) | `0 12px 30px -10px rgba(15,17,26,.26), 0 0 0 1px rgba(15,17,26,.07)` | `0 12px 30px -10px rgba(0,0,0,.42), 0 0 0 1px line` |
| Launcher control disc | `rgba(15,17,26,.055)`, hover `.11` | `rgba(255,255,255,.08)`, hover `.16` |
| Row / menu hover wash | `rgba(15,17,26,.04)` | `rgba(255,255,255,.07)` |
| Tooltip | `#333333` bg, white text | `ink` bg, `canvas` text (inverted) |
| Launcher pill's cycling hint | `muted` | `ink` (muted reads as "off" on charcoal; weight stays light) |

#### Read-aloud highlight

See §14 Conversation → *Read aloud*. The highlight is the accent's dark `soft`
tint (OKLCH L 0.40, C ≤ 0.08, accent hue):

| Tenant | Highlight | ink on it |
|---|---|---|
| Tars | `#503C6B` | 8.3 : 1 |
| Global Payments | `#334673` | 8.1 : 1 |
| Vodafone | `#6C352E` | 8.4 : 1 |
| Amex | `#264972` | 8.0 : 1 |
| Brightline | `#633F0C` | 8.1 : 1 |

Light uses the light `soft` (L 0.93) — ≈ 14.4 : 1 for every tenant.

#### Still to do

- **Light-mode `muted`** (`#9CA3AF`) is **2.5 : 1** on white and 2.3 on
  `paper` — below 4.5. Same fix as dark (lift it); not done yet.
- **White glyph on light accents** (above).
- `outlined` launcher style hard-codes a white body (`rgba(255,255,255,.92)`);
  it is not exposed in `/design` (the button launcher is fixed at Fill), so it
  has no dark treatment.

### 11.2 Motion and shine

Everything that moves or shines, with the exact values. **Every looping effect
is removed under `prefers-reduced-motion`** (`motion-reduce:hidden` on the
shine layers). Keyframes live in `app/globals.css` unless noted.

#### The shining edge — composer launcher

A highlight travels round the pill's border, forever, at rest and expanded.

| | Value |
|---|---|
| Layer | absolute, `inset: 0`, `border-radius: inherit`, z above the pill, pointer-events none |
| Masked to the border | `padding: 2px` + mask `linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)` with `mask-composite: exclude` (`-webkit-mask-composite: xor`) — only the 2px ring shows |
| Inside it | a square **150%** of the pill's width, centred, rotating (`animate-spin`) |
| Its fill | `conic-gradient(lite 0deg, lite@55% 30deg, transparent 90deg, transparent 270deg, lite@40% 330deg, lite 360deg)` — `lite` = `liteOf(accent)` (§11.1); `@55%` = `color-mix(in srgb, lite 55%, transparent)` |
| Speed | one revolution per **5200ms**, `linear` |
| Light / dark | same in both (it is the accent's lighter partner, which already clears 3 : 1 on dark) |

#### The shine on the button launcher

Every Fill button carries a white highlight travelling its inside edge — light
moving across the surface, not a ring around it.

| | Value |
|---|---|
| Masked ring | same mask as above, **1.25px** wide, inside the button's own radius |
| Inside it | a square **180%** of the button, centred, rotating |
| Its fill | `conic-gradient(rgba(255,255,255,.92) 0deg, rgba(255,255,255,.12) 55deg, transparent 120deg, transparent 240deg, rgba(255,255,255,.12) 305deg, rgba(255,255,255,.92) 360deg)` |
| Speed | **5200ms** per revolution, `linear` |
| Button body | the accent flat (no gradient) + `inset 0 1px 0 rgba(255,255,255,.26)` top highlight |

#### Hover — the button launcher lifts

| | Rest | Hover |
|---|---|---|
| Transform | none | `translateY(-2px)` |
| Shadow | `0 10px 24px -8px accent@28%, 0 2px 5px -1px rgba(15,17,26,.12), inset 0 1px 0 rgba(255,255,255,.26)` | `0 16px 34px -10px accent@35%, 0 3px 8px -2px rgba(15,17,26,.16), inset 0 1px 0 rgba(255,255,255,.26)` |
| Transition | `transform, box-shadow 300ms` | |

It lifts rather than scaling: scaling enlarges the shadow too and reads as
zooming. (`accent@28%` = the accent hex with alpha `47`; `@35%` = alpha `59`.)

#### Hover — everything else

| Element | Hover |
|---|---|
| Suggestion chips (launcher and messenger) | `inset 0 0 0 1.5px stroke` + `inset 0 0 0 999px wash` over the chip's own shadow. Light: stroke `color-mix(in srgb, accent 45%, transparent)`, no wash. Dark: stroke `color-mix(in oklab, liteOf 88%, transparent)`, wash `rgba(255,255,255,.07)` |
| Header back / menu / close, reply toolbar icons | background `paper`, glyph `ink` (from `secondary`) |
| Composer launcher control disc | light `rgba(15,17,26,.055)` → `.11`; dark `rgba(255,255,255,.08)` → `.16` |
| Send / mic disc | `opacity .8` (messenger) or `brightness(.95)` (launcher field) |

#### "AI is thinking" — the shimmering line

| | Value |
|---|---|
| Mark | the configured thinking mark beside it (sparkle by default) |
| Text | 14px medium; the phrase cycles: "AI is thinking…", "Still thinking…", "Thinking some more…", "Almost done…" (or the tenant's own single line) |
| Phrase hold | `min(1500, 520 + 190 × words)` ms each |
| Shimmer | text filled by `linear-gradient(90deg, ink 0%, ink 40%, shine 50%, ink 60%, ink 100%)`, `background-size: 200% 100%`, clipped to the text (`background-clip: text`, transparent fill) |
| Sweep | `text-shimmer`: `background-position` 150% → −50%, **2.2s linear infinite** |
| Light | `ink` = `color-mix(in oklab, brand 78%, black)`, `shine` = `color-mix(in oklab, brand 45%, white)` |
| Dark | `ink` = `color-mix(in oklab, brand 45%, white)`, `shine` = `#FFFFFF` (the light pair is a black line on charcoal) |

#### The sparkle at work

| | Value |
|---|---|
| Star | `sparkle-turn` **4200ms** `cubic-bezier(.4,0,.6,1)` infinite: rotate 0 → 180° → 360°, scale .94 → 1.06 → .94 |
| Bloom behind it | `sparkle-bloom` **1800ms** ease-in-out infinite: opacity .35 → .70, scale .92 → 1.12. A different period from the star on purpose, so the two never land on the same beat |
| Gradient | four stops from the accent (§11) |
| Dark | ink from `liteOf(accent)` |

#### Arrivals

| Element | Animation |
|---|---|
| A reply, word by word | `word-in` **320ms** `cubic-bezier(.2,.6,.2,1)` per word: opacity 0 → 1, `translateY(3px)` → 0, `blur(1.5px)` → 0. Words start **36ms** apart. Bullets' dots arrive with their line's first word. Turns already there when the panel opens are not animated |
| User bubble | `bubble-in` **240ms** `cubic-bezier(.2,.6,.2,1)`: opacity 0 → 1, `translateY(6px)` → 0 |
| Suggestion chips | One after another, never as a block. Exact values per surface in §11.3 *Suggestions arriving* |
| Messenger opening | §11.3 *Opening the messenger* |
| Composer launcher widening on hover | `width` over **280ms** `cubic-bezier(0.16, 1, 0.3, 1)` |
| Notice strip swap (disclaimer ↔ credit ↔ typing hint) | 200ms, opacity + 3px vertical slide |

#### Recording and unread

| | Value |
|---|---|
| Mic listening | `mic-pulse` **1600ms** ease-out infinite on a `rgba(255,255,255,.3)` layer inside the disc: opacity .45 → 0, scale .85 → 1.35 |
| Unread buzz | `mark-nudge` 2400ms (see §7) and the count badge's `badge-swell` 12 → 16px on the same clock |
| Read-aloud highlight | 100ms slide between words (§14, *Read aloud*) |

### 11.3 Transitions and devices

What the Nov 4 review asked for: how the messenger opens and closes, how the
suggestions arrive, the loading state, and one table of what changes between
desktop, tablet and phone. Every value here is what `/design` runs.

#### One curve for opening

Every open uses **`cubic-bezier(0.16, 1, 0.3, 1)`** over **280ms**
(`V6.panelEase`, `V6.panelMs`). In the review this was called "ease in, ease
out". Strictly, it is an ease-*out*: it starts fast and lands softly, which is
what makes the open feel like one surface settling rather than a box popping
in. Use this curve for every open.

#### Opening the messenger

It rises from the launcher, bottom to top. The bottom edge stays where the
launcher was, and the panel grows up from it.

| From | Device | What moves | Values |
|---|---|---|---|
| Composer launcher | Desktop, tablet | **One surface changing size**, not a panel arriving. A box starts at the pill's exact rect (340 × 64) and grows to the panel's rect: `left`, `width` and `height` animate together (`launcher-grow`). Centred, it opens out both ways; on an edge, it grows inward from the same margin. The chat inside is laid out once at its **final** size and uncovered by the growing box (`overflow: hidden`), never scaled or re-flowed. The first frame therefore shows the chat's own composer exactly where the pill was | 280ms, the curve above. Box: radius 32, shadow `0 12px 40px -8px rgba(0,0,0,.18)` on the growing box (not on the chat). Its bottom is the launcher's own vertical offset (§4), so it starts on the pill's exact rect |
| Button launcher | Desktop, tablet | The panel takes the button's place: same corner, same offsets (§4), its bottom edge where the button's was. The button is hidden while it is open. `launcher-open`: opacity 0 → 1, `translateY(10px) scale(.90)` → none, `transform-origin: bottom` | 280ms, the curve above |
| Either launcher | Phone | Full screen. `launcher-open` as above, `transform-origin: bottom center` | 280ms, the curve above |

The scale starts at **.90**: .97 was too shallow to read as growth.

Panel sizes:

- **Composer launcher:** centred **600 × 580**, on an edge **380 × 650**. Each
  is clamped to the frame less 48, so a tablet's centred panel is ~532 wide.
- **Button launcher:** always **380** wide, **650** tall, with the height
  clamped to the frame less 48. The button is never centred.

#### Closing the messenger

It goes back **the same way it came**: the open, played in reverse.

| From | Device | What moves | Values |
|---|---|---|---|
| Composer launcher | Desktop, tablet | The box shrinks from the panel's rect back to the pill's (`launcher-shrink`: `left`, `width`, `height`), with the chat clipped inside it | **200ms**, `cubic-bezier(0.7, 0, 0.84, 0)` |
| Button launcher | Desktop, tablet | `launcher-close`: opacity 1 → 0, `translateY(0)` → `10px`, scale 1 → .90, `transform-origin: bottom` | the same |
| Either launcher | Phone | `launcher-close`, `transform-origin: bottom center` | the same |

- **The curve** is the open's, mirrored end over end
  (`0.16, 1, 0.3, 1` → `0.7, 0, 0.84, 0`). It is an ease-*in*: it leaves
  slowly and finishes fast, so the launcher is back without a long tail.
- **200ms, quicker than the open's 280.** Opening is something arriving and
  is worth watching; closing is the visitor done with it, and at 280 the
  panel lingered.
- **The panel stays mounted until the close finishes**, then unmounts, and the
  launcher returns on that frame. The two are never on screen together.
- The close runs on its **own keyframes**, not `animation-direction: reverse`
  on the open's: a browser treats a direction change on the same animation
  name as the same animation, and does not replay it.
- **Reduced motion** (`prefers-reduced-motion: reduce`): no close animation;
  the panel goes at once.

#### Suggestions arriving

Wherever chips stagger, each one arrives on its own, one after another. They
rise a few pixels on the **y axis only**; there is no x slide. In the messenger
and the button launcher, the stagger is a fixed total divided by the count, so
three chips take as long as four would: the set keeps its length instead of
growing with the number of options.

| Where | Trigger | Animation | Stagger (chip *i*, from 0) |
|---|---|---|---|
| Messenger, under a reply | the reply has finished writing | `reply-in` **260ms**, `cubic-bezier(0.16, 1, 0.3, 1)`: opacity 0 → 1, `translateY(6px)` → 0 | `i × 210 ÷ count` ms (`REPLY_RUN_MS = 210`) |
| Composer launcher | hover (desktop), scroll down (touch, §9) | **No per-chip animation.** The row unfolds with the pane: `grid-template-rows` 0fr → 1fr while the pill widens, both **280ms** `cubic-bezier(0.16, 1, 0.3, 1)`. The row is pinned to the open width, so the chips do not reflow while it travels | none: the row arrives as one |
| Button launcher, desktop | hover | CSS transition **200ms** `ease-out` on opacity and transform: opacity 0 → 1, `translateY(4px)` → 0 | `i × 260 ÷ count` ms on the way **in** (`REVEAL_RUN_MS = 260`). On the way out they all go together, with no delay |
| Button launcher, phone and tablet | scroll down (§9) | `chip-in` **200ms**, `cubic-bezier(0.16, 1, 0.3, 1)`: opacity 0 → 1, `translateY(4px)` → none | `i × 260 ÷ count` ms, the same as hover |
| Under a floating message | the message has arrived | `reply-in` **320ms**, the same curve | **120ms** after the last message starts, then **60ms** apart. (On the opening replay the messages themselves start 90ms apart; once the conversation is live, a new message starts at once) |

The composer launcher's row in production now staggers (engineering's change,
shown in the review). The design does not stagger it. If the stagger stays,
use the button launcher's values.

The button launcher takes longer than the messenger (260 against 210) because it is
answering a gesture: the visitor has only just arrived at it, and a set that
finishes before they have focused on it may as well have been there already.

#### Loading

When the panel is open and the conversation is still on its way: **a skeleton
of the shape that is arriving, in the tenant's colour**, never a spinner in an
empty box. The header and the composer are already known, so they are drawn
for real; only the thread is a skeleton.

| | Value |
|---|---|
| Order, top to bottom | visitor turn · agent turn (3 lines) · visitor turn · agent turn (2 lines) |
| Visitor turn | right-aligned, **40** tall, radius **24** with **4** bottom-right (the user bubble's own silhouette). Widths **46%**, then **34%** |
| Agent turn | left-aligned bars, **12** tall, fully rounded, **11** apart (the AI message's 14px / 1.625 line rhythm), 4px above and below. Widths **100 / 94 / 62%**, then **88 / 48%** |
| Gap between turns | 16, the thread's own |
| Visitor colour | the user bubble's fill, `theme.bubbleFill` (the accent's soft tint) |
| Agent colour | `color-mix(in oklab, bubbleFill 55%, canvas)`: the same tint, quieter, because the agent's real messages carry no fill |
| Motion | the whole block breathes together, `skeleton-breathe` **1600ms** ease-in-out infinite, opacity 1 → .55 → 1. One breath for the block, not a sweep per bar. Off under reduced motion |
| Dark mode | handled by the same tokens (`bubbleFill` and `canvas` are both per-mode) |
| Accessibility | `aria-busy`, labelled "Loading conversation" |

See it in `/design`: Launcher tab → Visitor strip → **Loading**. It follows the
device switch at the top (panel 380 × 650 on desktop and tablet, full width on a
phone).

#### Desktop, tablet, phone

**Tablet counts as touch** (§9). It is wide enough to lay out like a desktop,
but it has no pointer to hover with.

| | Desktop | Tablet | Phone |
|---|---|---|---|
| Input | pointer | touch | touch |
| Launcher reveals its suggestions on (button launcher: only while a greeting is set; with no greeting its suggestions rest on show) | **hover** | **scroll down** (6px threshold); scroll up hides them at once; they fold away 4500ms after the page stops | the same as tablet |
| Composer launcher width | 340 → 600 centred, 400 on an edge | clamped to the frame less 48 (~532 centred) | 250 → 342, always centred |
| Placement | composer: left / centre / right. Button: left / right | the same as desktop | composer: forced centre. Button: left / right |
| Launcher suggestions, composer | one line, sideways scroll | one line, sideways scroll | one line, sideways scroll |
| Launcher suggestions, button | a stack, one per line, beside the button (in the greeting's place) | the same as desktop | a stack, one per line, above the button |
| Messenger opens as | panel: composer 600 × 580 centred / 380 × 650 on an edge; button 380 × 650 | the same, clamped to the frame | full screen |
| Open motion | composer grows from the pill; button rises from its corner | the same as desktop | rises from the bottom |
| Close motion | the open in reverse | the same as desktop | the open in reverse |
| Loading | skeleton in the panel | the same as desktop | skeleton, full screen |
| Suggestions in the messenger | **stacked**: wrap against the right edge, short ones sharing a line, climbing upward from the field, **at most 4 lines**, no sideways scroll | stacked, the same as desktop | **sideways scroll**: one line, or **two lines** that scroll together once they average over **24 characters** |

Suggestion layout in the messenger, in detail:

- **Stacked (desktop and tablet).** The first suggestions sit on the bottom
  line, nearest the field. A suggestion wider than the panel wraps inside its
  own chip. Past four lines, the extra lines are cut from the top, so the last
  suggestions go and the first ones stay.
- **Sideways (phone).** "Long" is the set's average length against
  `CHIP_CHARS = 24`, the length suggestions are written to. On two lines, the
  first half goes on the top line so they still read in order, and both lines
  sit in one scroller so a chip stays above the one it sat above.
- See it in `/design`: Launcher tab → **Visitor** strip → **Bigger screen** /
  **Small screen**, then **Long questions** / **Short questions**.

#### Fixed on Nov 4

- **The composer's open started 16px low.** The growing box was pinned 24px
  from the bottom, left over from when the offset defaulted to 16; with the
  offset at 40 the open began with a drop. It now starts at the launcher's own
  offset, on the pill's exact rect.
- **Loading skeleton under reduced motion** kept breathing (the animation was
  inline, which outranks the reduced-motion rule). It now stops.
- **Button launcher on a tablet** never revealed its suggestions while a
  greeting was set: hover was off (a tablet is touch) and the scroll reveal was
  wired to phones only. It now takes the scroll reveal, the same as the phone.

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
- **Travelling highlight**: 2px, one revolution per 5200ms. Full spec in §11.2.

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
| Logomark | 36 circle, image fills the disc; with no upload, the fallback is a `bubbleFill` disc with the bot glyph in `bubbleInk`. Styled by the **Logo options** (below) |
| Centred wordmark | Center toggle on: the logo is drawn in the middle of the header with no name or subtitle (both fields are disabled in the panel). Box width = Logo width, height follows the file's shape, capped at **44**. Styled by its own Logo options |
| Title | 14px / 18px, semibold, `--ink-soft` |
| Subtitle | 12px / 14px, `--ink-faint`, 4px under the title |
| Back · menu · close | 32 buttons, 20px icons, `--ink-mute`, hover fills `--fill` |
| Right cluster | gap 4, pulled 4px into the row's padding |

### Conversation

| Part | Value |
|---|---|
| Thread padding | 20 sides, 16 top, 12 bottom |
| Gap between turns | 16 |
| AI message | no width cap — the full column (560 centred, 360 in a corner). In `/design`: **14px / 1.625 (`leading-relaxed`), regular 400**, `ink` |
| User bubble | max 80%, padding 20 × 12, `paper` fill, `ink` text. **Type is the AI message's exactly: 14px / 1.625, regular 400** (was weight 300 with no line height). **Radius 24 on three corners, 4 on the bottom-right**, which the tail covers |
| User bubble tail | An SVG on the bubble's bottom-right, **15 × 20**, positioned `bottom: 0; right: -6px`, filled with the bubble's own fill. Path `M0 0 H9 C9 9 10.5 15.5 15 20 H0 Z`: runs down the bubble's right edge and flicks out 6px past it to a point on the baseline. Bordered palettes also stroke the outer curve (`M8.5 0 C8.5 9 10 15.5 13.8 19.5 H2`, 1px, `bubbleBorder`) so the outline is continuous. Pointer-events none |
| Action row | 24 buttons, 2 gaps, 14px icons — the speaker is 16 because at a matched box it carries visibly less ink. Row pulled 6px left so the first glyph aligns with the text above it |
| Read aloud | The speaker reads that reply with the browser's speech synthesis. While reading, the button shows a **filled 10px square (stop)** on a `paper` disc in `ink`; pressing again stops. One message at a time — starting another stops the first. Citations (`[2]`) are not spoken; `**bold**` is spoken as plain text |
| Read-aloud highlight | The word being spoken gets a background only — **the accent's soft tint in both modes** (`soft` from `deriveShades`, accent hue). Light: OKLCH L 0.93, C ≤ 0.03 — Tars `#EBE4F9`, GP `#DEE8FD`, Brightline `#F5E5D3`; ink on it ≈ 14.4 : 1. Dark: L 0.40, C ≤ 0.08 — Tars `#503C6B`, GP `#334673`, Brightline `#633F0C`; ink on it ≥ 8.0 : 1, `box-shadow: 0 0 0 2px` of the same colour (so it costs no width), radius 3. Text colour and weight never change (no reflow). `transition: background-color, box-shadow 100ms`; none under `prefers-reduced-motion` |
| Read-aloud timing | Position comes from the voice's `boundary` events (char offset → word). If no boundary arrives within **700ms** of starting (some voices never send them), a clock takes over at **170 wpm**, × 1.8 on a word ending `. ! ?`. The first word is lit the moment it starts |
| Suggestion chips | right-aligned, one row, horizontal scroll, gap 8, chip spec as above |
| Disclaimer | 12px, `--note`, centred, max width 500 centred / 320 in a corner, truncated with the remainder on a hover tail |
| Typing hint | While the field has text (desktop only), the notice strip swaps the disclaimer / credit for **"Press Enter to send · Shift + Enter for a new line"** — same strip, same 12px, 200ms fade + 3px slide; back as soon as the field empties. Not on touch: there is no Enter key to describe |

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
