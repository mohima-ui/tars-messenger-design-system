import { GlassComposer } from "@/components/launcher/GlassComposer";
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

export const metadata = {
  title: "Tars — Composer-based launcher v4",
};

/* The centred launcher in beige rather than smoked glass.

   Placement is identical to /composer-launcher — this variant changes one thing, and
   holding everything else still is what makes it a comparison rather than a
   second design. Same component, same geometry, same motion; only the
   palette differs.

   The glass is still glass: the pane is translucent and blurred, just held
   against a light wall instead of a dark one. That's the part worth judging
   here — a pale pane has to work harder to separate from a pale page, where
   the dark version got that separation for free. */
export default function ComposerLauncherV4Page() {
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
      <GlassComposer theme="beige" />
    </div>
  );
}
