# Changelog

Design changes for engineering. Newest first. Each entry says what changed in
`/design` and where the spec lives in `docs/HANDOFF.md`.

## 2026-11-03 — from the launch review with engineering

**Changed in the design**

1. **Launcher offset defaults to 40 / 40** (was 16). Live sites sat at 12–24
   and looked stuck to the bottom of the screen. Fall back to 32 only if 40
   reads too loose on a real site. → HANDOFF §4 Placement
2. **"Press Enter to send" replaces the disclaimer while typing.** Same strip
   under the composer, same size, crossfades in when the field has text and
   back out when it is empty. Desktop only. Not layered on top of the
   disclaimer, and no blur: it takes the slot. → HANDOFF Conversation table,
   "Typing hint"
3. **Button launcher: background colour and image options, behind a ⋯
   popover.** Replaces the stacked sliders. The ⋯ sits beside the Icon label
   and opens a small anchored popover (not a modal):
   - Button background: Accent (default) / Custom colour / None.
     None only appears for an uploaded image (transparent PNG).
   - Image padding 0–16 (uploaded image only).
   - The ⋯ has no background at rest; light purple (#F6F0FF) on hover and while open.
   → HANDOFF §3 Button launcher, "Icon"

4. **Header logo options behind a ⋯ popover.** Once a logo is uploaded, the
   upload row gets a ⋯ beside the remove button. Transparent background,
   Logo spacing (−30% to 30%; negative zooms in), Logo width (28–48px) and Logo
   corner radius (0 to half the width) live
   there instead of four permanent controls under the upload. Defaults: accent
   behind, 0%, 36px, round. The ⋯ has no background at rest; light purple (#F6F0FF) on hover and while open.
   Hidden when the logo is centred (a wordmark has no mark to style).
   → HANDOFF Header table, "Logomark"
5. **Light / dark is one setting.** The Mode control lives in the messenger's
   Theme group only, and it applies to the launcher and the messenger together.

**Already in the design. Engineering to match**

- **Centred logo hides and disables Agent name and Subtitle.** In the design
  the two fields go disabled when Center is on.
- **After a visitor closes mid-conversation, the launcher shows where they
  are, not the flow's first message.** See the "Recent conversation" and
  "Open conversation" states in the strip under the Launcher preview: the
  launcher rests on their last exchange.

**Engineering only (no design change)**

- Remove the stage/behaviour explainer that was copied from the design
  walkthrough. It was for explaining the states, not for the product.
- Auto-open: desktop only, never on mobile (the open messenger is full screen
  there).
- Re-enable speech-to-text (mic) in the composer.

**Next release, not now**

- Logo (header) background colour when "transparent background" is on.
- Intelligent / personalised greeting from the visitor's conversation and page.
- Embedded composer concepts (separate project).
