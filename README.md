# Tars Messenger 3.0

The launcher and messenger design, and one tenant demo of it.

Live: **[tars-messenger-demo.vercel.app](https://tars-messenger-demo.vercel.app)**

```bash
npm install
npm run dev          # then open http://localhost:3000
```

## The two pages

| | |
|---|---|
| **`/design`** | The design tool. Both launcher styles — composer and button — three placements, six visitor states, desktop / tablet / mobile. This is the design. |
| **`/brightline`** | The same launcher on a customer's real site, screen-captured. What a tenant is in practice: one accent colour and one content file. |

## Building from it

**Read [`docs/HANDOFF.md`](docs/HANDOFF.md) first.** Every spec and rule, written
from the code: geometry per placement and device, the six-state visitor
lifecycle and its priority order, motion timings, composer and dictation
behaviour, touch rules, theming, the analytics event schema, and the four
decisions still open.

Then build from **`components/launcher/GlassComposer.tsx`** — the working
launcher and messenger, and what `/brightline` runs.

Worth knowing before you start: there are two implementations here.
`GlassComposer` is the component that ships; `app/design/page.tsx` is a preview
of it with its own copy of the UI, so the settings panel has something to
drive. Where the two disagree, `HANDOFF.md` is the tiebreak — and where the
document is wrong too, the component wins.

## Layout

```
app/                     the pages that go live
  page.tsx               the index at /
  design/                /design      — the design tool
  brightline/            /brightline  — the tenant demo (+ content.ts)
  globals.css            tokens, keyframes
components/              code the pages share; no routes come from here
  launcher/              GlassComposer — the launcher + messenger
  configure/             contextual-suggestions panel
  dashboard/             the dashboard rails
docs/
  HANDOFF.md             the spec
  CONVERSATION.md        the demo script every visitor state is a depth into
explored designs/        everything tried and set aside — outside app/, so it
                         is not routed, not built and not deployed. Its README
                         says how to bring a route back.
public/                  images, including Brightline's site captures
```

## Tenanting

A customer is one accent plus a content pack. `app/brightline/content.ts` is the
worked example: agent name, header, logomark, disclaimer, starters, canned
replies, follow-ups, sources, past conversations, greeting. Everything tinted
mixes from the accent rather than naming a colour, so re-skinning a customer is
a two-value change.

## Still to decide

Four questions, in §12 of the handoff. The first blocks the event schema:

1. How long is a *recent* conversation versus an *open* one — and analytics has
   to count a conversation on the same boundary.
2. When the floating message appears at all.
3. Whether an agent's own configured buttons replace the contextual suggestions
   or sit alongside them.
4. Keeping the messenger open across page navigation.
