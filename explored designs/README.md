# Explored

Everything that was tried on the way to Messenger 3.0, kept out of the build.

The underscore is what does it: Next opts a `_folder` and everything under it
out of routing entirely — and the `3` in front only sorts it below the two
shipping sections in a file listing, so nothing in here is built, bundled or deployed —
and none of it is deleted either. It stays in the repo as the record of how
the shipping design was arrived at, because the questions come back. Someone
asks why the launcher is a composer rather than a button, or why the unread
badge is a filled disc and not a red one, and the honest answer is a page
showing the eight that were drawn before it.

## Bringing a route back

Rename the folder and the routes return at their old paths:

    mv "explored designs" app/explored   # everything back, at /explored/*

Or lift out just the one you need:

    mv explored designs/design/unread-lab "app/design/unread-lab"

The index at `_explored/page.tsx` lists all of it, grouped, with a line on
what each was trying to answer. Its internal links assume the `/explored`
prefix, so they work as soon as the folder is un-prefixed.

## What's in here

- **Labs** — one open question each: unread indicators, launcher composition,
  button styles, the footer strip, the floating message.
- **Tools** — Configure (contextual suggestions) and Analytics (the launcher
  funnel, per customer and per surface). Built alongside the design; not part
  of the handoff.
- **Composer launcher** — six bets on the input-bar launcher, settled by
  `/design`.
- **Button launcher** — five animation bets on the classic corner button.
- **Earlier work** — the design-system component pages, the explorations set,
  the v1 messenger demo, `/web`, the widget lab, the GP tenant demo.

## Shared code is not in here

`GlassComposer`, `ConfigurePanel` and `DashboardRails` live in `components/`,
because the shipping routes import them too. Nothing under `_explored` is
imported by anything that ships.
