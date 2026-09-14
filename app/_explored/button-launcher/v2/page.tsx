"use client";

import { Messenger } from "../Messenger";
import { PulseLauncher } from "../PulseLauncher";
import { STARTERS } from "@/components/launcher/GlassComposer";
import { Nav } from "../../v1/Nav";
import {
  Hero,
  LogoStrip,
  WrongThing,
  OneThread,
  TwoFrontDoors,
  BelieveMeasure,
  RealResults,
  Integrations,
  PrivacySecurity,
  FinalCTA,
  Footer,
} from "../../v1/sections";

/* v2 — the pulse.

   The same launcher, the opposite gesture. v1 puts a small presence in orbit
   around the button; this pushes rings away from it. An orbit is a companion
   and a pulse is a signal, so this is the louder of the two by nature — which
   is the thing being tested, not a fault to tune out.

   Everything else is held identical to v1 on purpose: same button, same
   logomark, same starter shelf on hover, same panel. If the two feel
   different, the ring is the only thing that can be responsible. */

export default function ButtonLauncherV2Page() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <main>
        <Hero />
        <LogoStrip />
        <WrongThing />
        <OneThread />
        <TwoFrontDoors />
        <BelieveMeasure />
        <RealResults />
        <Integrations />
        <PrivacySecurity />
        <FinalCTA />
      </main>
      <Footer />

      <Messenger
        launcher={(props) => (
          <PulseLauncher {...props} starters={STARTERS}>
            {/* Cross-faded rather than swapped, both marks mounted: a swap on
                a control this small reads as a flicker, where two glyphs
                trading opacity reads as one changing its mind. */}
            <span className="relative flex size-full items-center justify-center">
              {/* The logomark, not a chat bubble.

                  The trade is real: a bubble says "messaging" in any market
                  without being read, where a logo says who rather than what
                  and a visitor who doesn't know Tars learns nothing from it.
                  What buys it back here is the orbit — the ring around the
                  button is what says something is alive and waiting, so the
                  glyph no longer has to carry that on its own and can spend
                  itself on recall instead.

                  The mark is white-on-transparent over the accent disc rather
                  than the full-colour logo: the disc is already the brand
                  colour, and a purple mark on a purple button is a logo
                  hiding on its own background. */}
              <img
                src="/tars-logomark.png"
                alt=""
                /* Filling the button rather than sitting in it. The mark's
                   own artwork carries its padding — it is a glyph on a
                   transparent square — so a size-6 image inside a 44px disc
                   was that padding twice and the logo ended up a third of the
                   button. At full size the drawn mark lands where a 24px icon
                   would have, and the disc reads as branded rather than as a
                   button with a sticker on it. */
                className="absolute size-full transition-opacity duration-200"
                style={{ opacity: props.open ? 0 : 1 }}
              />

              {/* A chevron, not a cross. A cross says the conversation is
                  being dismissed; a chevron says it is going back down to
                  where it came from, which is what happens — the thread
                  survives. */}
              <svg
                className="absolute transition-opacity duration-200"
                style={{ opacity: props.open ? 1 : 0 }}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </PulseLauncher>
        )}
      />
    </div>
  );
}
