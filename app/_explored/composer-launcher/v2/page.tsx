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
  title: "Tars — Composer-based launcher v2",
};

/* Same launcher, anchored bottom-right.

   The page and the composer are both imported rather than copied — this file
   is a placement, not a variant of the design. Everything that makes the
   launcher what it is lives in GlassComposer, so a change to the glass, the
   sound or the transcript lands on /composer-launcher, v2 and v3 together, and the only
   thing that can differ between them is the one prop below.

   Right is the conventional corner for a messenger, which is the point of
   testing it against the centred original: it's what visitors' hands expect,
   at the cost of the centred version's claim that this is the page's main
   invitation rather than a widget parked in the corner. */
export default function ComposerLauncherV2Page() {
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
      <GlassComposer align="right" />
    </div>
  );
}
