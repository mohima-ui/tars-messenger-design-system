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
  title: "Tars — Composer-based launcher v3",
};

/* Same launcher, anchored bottom-left.

   A placement, not a variant of the design — the page and the composer are
   both imported, so everything that makes the launcher what it is lives in
   GlassComposer and the only thing that can differ between /composer-launcher, v2 and
   v3 is the prop below. The `left` geometry, insets and entrance direction
   were already defined alongside `right`; this file is what finally uses
   them.

   Left is the interesting one to test precisely because it's unconventional.
   Bottom-right is where hands expect a messenger, so v2 costs nothing to
   understand; bottom-left has to earn its place, and what it buys is the
   right-hand side of the page — where CTAs, pricing tables and nav actions
   usually sit — staying clear. */
export default function ComposerLauncherV3Page() {
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
      <GlassComposer align="left" />
    </div>
  );
}
