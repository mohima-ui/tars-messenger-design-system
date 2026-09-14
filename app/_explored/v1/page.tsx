import { Nav } from "./Nav";
import { SonarOrb } from "./SonarOrb";
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
} from "./sections";

export const metadata = {
  title: "Tars 3.0 — Customer experience built around outcomes",
};

/* The full hellotars.com scroll, rebuilt section by section, with the Sonar
   Orb launcher variant riding along at the bottom-right. */
export default function Tars3Page() {
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
      <SonarOrb />
    </div>
  );
}
