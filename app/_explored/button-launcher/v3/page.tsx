"use client";

import { Messenger } from "../Messenger";
import { OrbitPromptsLauncher } from "../OrbitPromptsLauncher";
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

/* v3 — orbiting prompts.

   The starters become the animation. Three icon pods travel a dashed ring
   around the launcher, and the one at the left of the ring names itself in a
   label beside it — so the corner offers one question at a time, in turn.

   Against v2: that shows all three at once and needs the room to do it; this
   shows a third of itself and takes almost none, at the cost of making the
   visitor wait to see the rest. Which is the right trade depends on whether
   the launcher is meant to be scanned or noticed, and that is the thing these
   two are for deciding.

   Same button, same logomark, same panel as the others — the launcher's
   behaviour is the only variable. */

export default function ButtonLauncherV3Page() {
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
          <OrbitPromptsLauncher {...props} starters={STARTERS}>
            {/* Cross-faded rather than swapped, both marks mounted: a swap on
                a control this small reads as a flicker, where two glyphs
                trading opacity reads as one changing its mind. */}
            <span className="relative flex size-full items-center justify-center">
              {/* The logomark. The orb from the composer family was tried
                  here and comes back off: it is a mark that means "an agent is
                  thinking", and a launcher nobody has pressed yet is not
                  thinking about anything — so the animation was making a claim
                  the state didn't support, on top of competing with the three
                  pods already orbiting it. */}
              <img
                src="/tars-logomark.png"
                alt=""
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
          </OrbitPromptsLauncher>
        )}
      />
    </div>
  );
}
