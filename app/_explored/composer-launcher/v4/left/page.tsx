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
  title: "Tars — Composer-based launcher v4 · left",
};

/* Beige, anchored bottom-left.

   Unconventional, and what it buys is the right-hand side of the page
   staying clear — where CTAs, pricing tables and nav actions usually sit.
   The glass equivalent is at /composer-launcher/v3.

   Same component and same theme as /composer-launcher/v4 — only the placement differs,
   which also means the corner geometry comes with it: 400 x 640 rather than
   the centred 600 x 550, since a launcher hanging from an edge wants to be
   tall and narrow where a centred one wants to be wide. */
export default function ComposerLauncherV4LeftPage() {
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
      <GlassComposer theme="beige" align="left" />
    </div>
  );
}
