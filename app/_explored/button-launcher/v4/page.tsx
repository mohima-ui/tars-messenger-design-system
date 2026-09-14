"use client";

import { Messenger } from "../Messenger";
import { ChipCycleLauncher } from "../ChipCycleLauncher";
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

/* v4 — the cycling chip.

   The launcher is a pill with a prompt inside it, and the prompt changes. The
   other three keep their starters somewhere else and share a problem: until
   something reveals them, the corner holds a control with no content. Here the
   content *is* the control.

   The bet is that a visitor who never hovers, never scrolls and never clicks
   still reads three questions. The cost is that only one is offered at a time
   — and pressing the chip sends that one, so reading it and asking it are a
   single decision rather than a suggestion followed by a second step.

   Same panel and same conversation as the others; the launcher is the only
   thing that differs. */

export default function ButtonLauncherV4Page() {
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
          <ChipCycleLauncher {...props} starters={STARTERS} />
        )}
      />
    </div>
  );
}
