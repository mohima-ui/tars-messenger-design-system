import { GlassComposer } from "@/components/launcher/GlassComposer";
import { BRIGHTLINE_ACCENT, BRIGHTLINE_ACCENT_LITE, BRIGHTLINE_CONTENT } from "./content";

export const metadata = {
  title: "Brightline — client demo",
};

/* The composer launcher on Brightline's actual website — no rebuild this
   time. The whole page is their real site, screen-captured (Sep 2026) and
   cropped section by section (browser chrome and the repeated sticky nav
   trimmed from every shot but the first) rather than recreated in code, so
   every pixel is exactly what's on brightline.com. Same tenant contract as
   GP ([[project-tenant-demos]]): the only thing that's actually built is the
   composer line at the bottom, running Design's untouched defaults —
   composer, white theme, centered, no greeting — themed to Brightline's own
   accent and carrying Brightline's own words. */
const SECTIONS = [
  "01-hero.jpg",
  "02-section.jpg",
  "03-section.jpg",
  "04-section.jpg",
  "05-section.jpg",
  "06-section.jpg",
  "07-section.jpg",
  "08-section.jpg",
  "09-section.jpg",
  "10-section.jpg",
  "11-section.jpg",
  "12-section.jpg",
];

export default function BrightlineDemo() {
  return (
    <div className="min-h-screen bg-[#FBFAF4]">
      {SECTIONS.map((f) => (
        <img key={f} src={`/brightline/screens/${f}`} alt="" className="block w-full" />
      ))}

      {/* The tenant line, untouched — Design's own defaults: composer,
          white theme, unified, centered, no orb, no greeting. */}
      <GlassComposer
        theme="white"
        unified
        orb={false}
        /* Brightline's own call on how much of their page the open window is
           allowed to take: 580 centred against the default's 620, 700 in a
           corner against its 720. Shorter in both, and the corner keeps the
           extra room it gets for hanging off an edge rather than sitting over
           what someone was reading. */
        unifiedHeight={{ center: 580, left: 700, right: 700 }}
        accent={BRIGHTLINE_ACCENT}
        accentLite={BRIGHTLINE_ACCENT_LITE}
        content={BRIGHTLINE_CONTENT}
      />
    </div>
  );
}
