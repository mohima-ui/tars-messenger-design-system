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
  title: "Tars — Composer-based launcher v7",
};

/* v6, with the starters lifted out of the composer.

   Everything else is held still on purpose — same white pane, same unified
   panel, same placement, same scroll-to-expand — so the only thing being
   judged is where the three suggestions live. That is the whole variant.

   Inside the composer, the chips are part of one object: the launcher grows
   and the offer is inside the thing that grew. Outside, they are three pills
   floating over the host page above a pill that never changed size.

   Two consequences worth watching for on this page. The composer no longer
   changes height when you scroll — the 44px the row used to add is gone, so
   the surface the conversation later unfolds out of is the same shape before
   and after the offer appears. And the suggestions read as the page's rather
   than the field's, which is either the point or the problem depending on
   whether a visitor should feel addressed by the site or by a widget.

   Built through a prop rather than a fork, like the rest of the family:
   changes to the glass, the sound or the transcript still land on every
   variant at once. */
export default function ComposerLauncherV7Page() {
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
      <GlassComposer theme="white" orb={false} unified startersOutside />
    </div>
  );
}
