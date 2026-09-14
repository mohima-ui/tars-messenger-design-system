"use client";

import { Messenger } from "../Messenger";
import { RiseLauncher } from "../RiseLauncher";
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

/* v5 — the rising prompts.

   The launcher lets its starters go one at a time: each climbs out of the
   button, drifts past the corner and fades, and the next follows. Nothing is
   revealed and nothing is dismissed — the offer is simply always in progress.

   Against the rest of the family: v1 and v2 hold their prompts behind a
   gesture, v3 parks them on a ring, v4 keeps one permanently in a pill. This
   is the only one that shows every starter without being asked and without
   taking any lasting space, which is also its weakness — a question you were
   reading will leave. The column freezes under the pointer to make that
   survivable.

   Same panel and same conversation as the others; the launcher is the only
   thing that differs. */

export default function ButtonLauncherV5Page() {
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
          <RiseLauncher {...props} starters={STARTERS}>
            <span className="relative flex size-full items-center justify-center">
              <img
                src="/tars-logomark.png"
                alt=""
                className="absolute size-full transition-opacity duration-200"
                style={{ opacity: props.open ? 0 : 1 }}
              />

              {/* A chevron, not a cross: the thread goes back down to where it
                  came from rather than being thrown away. */}
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
          </RiseLauncher>
        )}
      />
    </div>
  );
}
