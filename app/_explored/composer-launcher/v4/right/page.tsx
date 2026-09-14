import { GlassComposer } from "@/components/launcher/GlassComposer";
import { Nav } from "../../../v1/Nav";
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
} from "../../../v1/sections";

export const metadata = {
  title: "Tars — Composer-based launcher v4 · right",
};

/* Beige, anchored bottom-right.

   The corner where a messenger is expected, so it costs nothing to
   understand — and the placement most likely to ship. Worth comparing
   against the glass version at /composer-launcher/v2: the same corner, the same
   geometry, and only the surface differs.

   Same component and same theme as /composer-launcher/v4 — only the placement differs,
   which also means the corner geometry comes with it: 400 x 640 rather than
   the centred 600 x 550, since a launcher hanging from an edge wants to be
   tall and narrow where a centred one wants to be wide. */
export default function ComposerLauncherV4RightPage() {
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
      <GlassComposer theme="beige" align="right" />
    </div>
  );
}
