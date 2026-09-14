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
  title: "Tars — Composer-based launcher v5",
};

/* The centred launcher in the neutral near-black.

   The argument for this one over the other two: it's the only theme with no
   hue in it. 22,22,24 is effectively achromatic, so there is nothing in the
   surface to clash with a tenant's brand — where the smoked glass leans cool
   and the beige leans warm, and each will fight some brand somewhere.

   Dark rather than light on purpose. A white page tolerates a dark panel
   better than a dark page tolerates a white one, so if the launcher has to
   drop onto sites nobody has seen yet, this is the side of the fence to be
   on.

   Placement and geometry are identical to /composer-launcher — same component, same
   numbers, same motion. Only the palette differs, which is what makes the
   three comparable. */
export default function ComposerLauncherV5Page() {
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
      <GlassComposer theme="neutral" />
    </div>
  );
}
