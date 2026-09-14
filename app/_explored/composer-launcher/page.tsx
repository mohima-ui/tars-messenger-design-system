import { GlassComposer } from "@/components/launcher/GlassComposer";
import { Nav } from "../v1/Nav";
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
} from "../v1/sections";

export const metadata = {
  title: "Tars — Composer-based launcher",
};

/* Host page for the composer-based launcher + messenger direction.

   The same marketing scroll as /v1 — imported rather than copied, so the two
   backdrops can't drift apart and a fix to a section lands on both. What's
   missing is deliberate: no launcher, no orb, no greeting, no chat. This is an
   empty stage for the new design to be built on. */
export default function ComposerLauncherPage() {
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
      <GlassComposer />
    </div>
  );
}
