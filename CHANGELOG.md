# Changelog

Design changes for engineering. Newest first. Each entry says what changed in
`/design` and where the full spec lives in `docs/HANDOFF.md`. Where the two
disagree, HANDOFF has the numbers; this file has the list.

## 2026-11-05 — text in more than one language

### Added to the design

1. **Header, callout and placeholder can be written per language.** →
   HANDOFF §8 *Text in more than one language*
   - A flag-and-code picker inside each field lists **only the languages set
     in Configure → Language**.
   - **The header, callout and placeholder each pick their language
     separately**; the header's name and subtitle go together.
   - **An empty translation falls back to the primary language**, so visitors
     never see a blank. No machine translation; brand names stay as typed.
   - In `/design`: Messenger tab → Brand identity; Launcher tab → Greeting
     and Placeholder.
2. **Still open:** right-to-left layout for Arabic, Hebrew and Urdu. →
   HANDOFF §12 #5

## 2026-11-04 — layouts and motion, from the review with engineering

### Changed in the design

1. **Suggestions in the messenger, by screen size.** → HANDOFF §11.3
   *Desktop, tablet, phone*
   - **Desktop and tablet: stacked.** No sideways scroll. They wrap against the
     right edge, with short ones sharing a line, and climb upward from the
     field to **at most 4 lines**. The first suggestions stay nearest the field.
   - **Phone: sideways scroll.** One line, or **two lines** that scroll
     together once the set averages over **24 characters**.
   - **The launcher's own suggestions are unchanged:** one line, scrolled
     sideways, on every device.
   - In `/design`: Launcher tab → Visitor strip → Bigger screen / Small screen
     → Long questions / Short questions.
2. **Closing the messenger is animated:** the open in reverse, 200ms (quicker than the open's 280), ease-in
   `cubic-bezier(0.7, 0, 0.84, 0)`. The composer shrinks back into the pill;
   the button launcher's panel and the phone's full screen sink and fade
   toward the bottom. The launcher returns only when the close finishes.
   → HANDOFF §11.3 *Closing the messenger*
3. **Loading skeleton.** The thread is drawn as the conversation it is about
   to be (visitor turns right, agent lines left) in the accent's soft tint,
   breathing at 1600ms. Header and composer are real. In `/design`: Visitor
   strip → Loading. → HANDOFF §11.3 *Loading*
4. **The composer's open no longer starts 16px low.** The growing box now
   starts at the launcher's own vertical offset (it was a fixed 24, left over
   from the old 16 default).
5. **Loading skeleton stops breathing under reduced motion.**
6. **Button launcher on a tablet now reveals its suggestions on scroll.**
   Before this, with a greeting set, they never showed (no hover on touch, and
   the scroll reveal was phone-only).
7. **Recent conversation, composer launcher expanded: "or start new".**
   After "Continue your conversation" in the field. "or" is plain text;
   "start new" is a ghost button (accent, underlined, medium weight) that
   opens a new conversation. On a phone the label
   truncates and the link stays whole. → HANDOFF §5 *Recent, expanded*
8. **Motion spec written down:** opening and closing the messenger,
   suggestions arriving (staggered, y axis only), loading, and one
   desktop / tablet / phone table. → HANDOFF §11.3

### Engineering to note

- The **composer launcher's suggestions** arrive with the pane in the design,
  as one row with no per-chip stagger. Production staggers them. If that stays,
  use the button launcher's values (HANDOFF §11.3 *Suggestions arriving*).

## 2026-11-03 — from the launch review with engineering

Fathom recording of the review: shared separately.

### Changed in the design

1. **Dark mode: readable everywhere.** → HANDOFF §11.1 *Dark mode* (rules,
   every colour, every contrast number).
   - One Mode setting (Messenger → Theme) drives the launcher and the
     messenger together. There is no Mode control on the Launcher tab.
   - **Readable accent:** wherever the accent is read as text or an icon on a
     dark surface, it is recomputed per tenant (`readableOn`: keep the hue,
     raise OKLCH lightness until it clears **4.5 : 1** for text, **3 : 1** for
     icons). Tars purple and GP blue were 1.6 : 1. Accent *fills* stay the
     exact brand colour.
   - **Dark `muted` lifted** to `#A1A1A7` (was `#8B8B92`): timestamps and hints
     now clear 4.5 : 1 on every dark surface.
   - **Surface tone in dark** (Warm / Cool) no longer lightens the panel. It
     keeps each surface's lightness and takes only the tone's hue. Before,
     muted text fell to 3.4 : 1 on Warm / Cool dark.
   - "Thought for Ns" label in the trace: held to 4.5 : 1 in dark.
2. **Read aloud with a word highlight.** The speaker under a reply reads it with
   the browser voice. The spoken word gets a background of the accent's soft tint
   (pale in light, deep in dark), no colour or weight change, 100ms slide. Speaker
   becomes a stop button while reading. Falls back to a 170 wpm clock when the
   voice sends no word positions. → HANDOFF §14 Conversation, *Read aloud*
3. **User bubble.**
   - It had lost its fill and shape in the preview (a bug in the preview's part
     wrapper since selection came out). Restored.
   - **Radius 24** on three corners, 4 on the bottom-right, with a
     **message-app tail** there (SVG, path in HANDOFF).
   - **Type matches the AI message exactly:** 14px / 1.625, regular 400 (was
     weight 300).
   → HANDOFF §14 Conversation, *User bubble* + *User bubble tail*
4. **Mic in the messenger composer, at rest: accent fill, white glyph** — the
   same as the composer launcher's resting mic, for every tenant. (Was a grey
   disc.) → HANDOFF §8 *Composer inside the messenger*
5. **Logo options (Messenger → Brand identity).** A **⋮ box** of its own beside
   the upload box, always present. Opens a 268-wide popover below it, centred,
   allowed outside the settings column, with **sliders**:
   Transparent background · Logo spacing (−30% to 30%, one continuous zoom:
   positive = padding, negative = zoom in) · Logo width · Logo corner radius ·
   Reset to default (Tars purple).
   **Works for the centred wordmark too**, with its own values: transparent by
   default, width 120 (60–200), radius 0 (0–22). The round mark defaults:
   accent behind, 0%, 36px (28–48), round.
   → HANDOFF §3 *Logo options*, §14 Header
6. **Button launcher: button background + image padding behind a ⋯ popover**
   next to the Icon label. Button background: Accent (default) · Custom (the
   same hue-wheel + hex picker as the messenger's Accent) · None (uploaded
   image only). Image padding 0–16. Options that need an uploaded image are
   shown disabled, not hidden. → HANDOFF §3 *Icon*
7. **"Press Enter to send" replaces the disclaimer while typing.** Same strip
   under the composer, crossfades in when the field has text, out when empty.
   Desktop only. Takes the slot — not layered over the disclaimer, no blur.
   → HANDOFF §14 Conversation, *Typing hint*
8. **Launcher offset defaults to 40 / 40** (was 16). Fall back to 32 only if 40
   reads too loose on a real site. → HANDOFF §4
9. **Preview on your site: Brightline.** `brightline.com` shows the Brightline
   site captures and runs Brightline's conversation from
   `app/brightline/content.ts`. `**bold**` in replies renders. → HANDOFF §11

### Already in the design — engineering to match

- **Centred logo hides and disables Agent name and Subtitle.**
- **After a visitor closes mid-conversation, the launcher shows where they are,
  not the flow's first message.** See the Recent / Open conversation states in
  the strip under the Launcher preview.
- **Light / dark is one unit** — launcher and messenger can never be in
  different modes.

### Engineering only (from the review; the design file is unchanged)

- **Messenger header:** height **60** (currently 59); **20px** left and right,
  measured to the outer edge of the back / close buttons' hover disc, not to
  the icon's centre.
- Remove the stage / behaviour explainer copied from the design walkthrough —
  it was for explaining the states, not for the product.
- **Auto-open: desktop only**, never on mobile (the open messenger is full
  screen there).
- **Re-enable speech-to-text** (the mic) in the composer.

### Open — decisions, not built

- White glyph on a very light accent (Brightline `#FFA300`: 2.0 : 1) on the
  send / mic / launcher fills. Proposed: flip to `#16171A` when the fill's
  OKLCH L > 0.72. → HANDOFF §11.1 *Still to do*
- Light-mode `muted` (`#9CA3AF`) is 2.5 : 1 on white — below 4.5.
- Shivani's thread on more launcher customisation: design reply pending.

### Next release, not now

- Header logo **background colour** when Transparent background is on.
- Intelligent / personalised greeting from the visitor's conversation and page.
- Embedded composer concepts (separate project).
