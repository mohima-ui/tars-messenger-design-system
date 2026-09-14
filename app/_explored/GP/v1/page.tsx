import { ArrowRight } from "lucide-react";
import { GlassComposer } from "@/components/launcher/GlassComposer";
import { GP_ACCENT, GP_ACCENT_LITE, GP_CONTENT } from "./content";
import { GpNav } from "./Nav";

export const metadata = {
  title: "Global Payments — client demo",
};

/* The composer launcher on Global Payments' actual website.

   Rebuilt against screenshots of globalpayments.com/en-gb (Aug 2026) — same
   sections in the same order, with the photography cropped straight out of
   the captures (public/gp/*). The point is that the launcher demo reads as
   "our widget on their site", not "our widget on a site we invented".

   The hero is the one compromise: its headline and buttons are baked into
   the capture, so the real, clickable buttons are laid exactly over the
   printed ones. Both scale with the same box, so the registration holds. */

const GP_GREEN = "#00d264";

const LOGOS = [
  "TRUIST PARK",
  "VW",
  "NICK THE FISH",
  "bira",
  "virgin atlantic",
  "THE KINGS ARMS",
];

const PRODUCTS = [
  {
    title: "Card machines",
    body: "Discover a range of card machines for businesses of any size.",
    img: "/gp/prod-card.jpg",
  },
  {
    title: "Online payments",
    body: "Accept online payments any time — from anywhere in the world.",
    img: "/gp/prod-online.jpg",
  },
  {
    title: "POS systems",
    body: "Choose from a range of POS systems to fit your business type.",
    img: "/gp/prod-pos.jpg",
  },
];

const GOALS = [
  "View payment information",
  "Resolve disputes quickly",
  "Understand sales trends and activity",
  "Gain competitive insights",
  "Get business funding—fast",
];

const INDUSTRIES = [
  "Restaurant",
  "Retail",
  "Healthcare",
  "Education",
  "Stadia and venue",
  "Events",
  "Transportation",
  "Public sector",
];

const HELP = [
  "Accept payments online",
  "Explore payments for retailers",
  "Get actionable insights",
  "Get payments for your restaurant",
];

const FOCUS = [
  {
    img: "/gp/focus1.jpg",
    tag: "Article",
    meta: "Payments | Commerce | Enterprise",
    title: "5 ways to improve your authorisation rates",
  },
  {
    img: "/gp/focus2.jpg",
    tag: "Case study",
    meta: "Payments | Stadia",
    title: "SSE case study",
  },
];

export default function GlobalPaymentsDemo() {
  return (
    <div className="min-h-screen bg-white text-[#14142b]">
      <GpNav />

      <main>
        {/* ——— Hero — the capture, with live buttons registered over the
            printed ones. aspect-ratio keeps the two aligned at any width. */}
        <section className="relative w-full" style={{ aspectRatio: "2000 / 906" }}>
          <img
            src="/gp/hero.jpg"
            alt="A waiter takes a card payment at a café table"
            className="absolute inset-0 size-full object-cover"
          />
          {/* Slightly larger than the printed buttons and backdrop-blurred, so
              the print underneath smears away instead of ghosting beside any
              subpixel misregistration. */}
          <a
            href="#"
            className="absolute flex items-center justify-center rounded-full text-[clamp(11px,1.15vw,17px)] font-medium text-white transition-transform hover:-translate-y-px"
            style={{
              backgroundColor: GP_ACCENT,
              left: "36.2%",
              top: "68.2%",
              width: "14%",
              height: "11%",
            }}
          >
            Contact sales
          </a>
          <a
            href="#"
            className="absolute flex items-center justify-center rounded-full border border-white bg-white/5 text-[clamp(11px,1.15vw,17px)] font-medium text-white backdrop-blur-md transition-colors hover:bg-white/15"
            style={{
              left: "50.7%",
              top: "68.2%",
              width: "13.3%",
              height: "11%",
            }}
          >
            Get a quote
          </a>
        </section>

        {/* ——— Pay the way they want ——— */}
        <section className="mx-auto max-w-6xl px-8 py-24 text-center">
          <h2 className="mx-auto max-w-3xl text-balance text-5xl font-light leading-[1.12] tracking-tight md:text-6xl">
            Let your customers <span className="font-extrabold">pay the way they want</span>
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-pretty text-[19px] leading-relaxed text-[#3c3c5c]">
            Everything you need to accept payments. We make it simple and
            safe—and you&rsquo;ll get paid fast.
          </p>
          <div className="mt-16 grid gap-10 text-left md:grid-cols-3">
            {PRODUCTS.map((p) => (
              <a key={p.title} href="#" className="group">
                <h3
                  className="text-[26px] font-bold group-hover:underline"
                  style={{ color: GP_ACCENT }}
                >
                  {p.title}
                </h3>
                <p className="mt-3 min-h-14 text-[17px] leading-relaxed text-[#3c3c5c]">
                  {p.body}
                </p>
                <img
                  src={p.img}
                  alt=""
                  className="mt-5 aspect-[427/430] w-full object-cover"
                />
              </a>
            ))}
          </div>
        </section>

        {/* ——— Logos + case study ——— */}
        <section className="mx-auto max-w-7xl px-8 pb-24 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-6">
            {LOGOS.map((l, i) => (
              <span
                key={l}
                className={`text-[19px] font-bold tracking-tight ${
                  i === 0 ? "border-b-2 pb-2 text-[#2d1b69]" : "text-[#b9b9c9]"
                }`}
                style={i === 0 ? { borderColor: GP_ACCENT } : undefined}
              >
                {l}
              </span>
            ))}
          </div>

          <div className="mt-20 grid items-center gap-14 md:grid-cols-[440px_1fr]">
            <img
              src="/gp/case-truist.jpg"
              alt="Self-service concession kiosks at Truist Park"
              className="w-full object-cover"
            />
            <figure>
              <blockquote className="text-pretty text-[27px] font-normal leading-snug tracking-tight">
                &ldquo;With Global Payments, we have a partnership built on
                innovation and collaboration that will help us shape the future
                of ballpark concessions in Atlanta.&rdquo;
              </blockquote>
              <figcaption className="mt-6 text-[17px]">
                <span className="font-bold">Derek Schiller</span>, President and
                CEO, Atlanta Braves
              </figcaption>
              <a href="#" className="mt-8 inline-flex items-center gap-4 text-[19px] font-medium">
                Read the case study
                <span
                  className="grid size-10 place-items-center rounded-full transition-transform group-hover:translate-x-0.5"
                  style={{ backgroundColor: GP_GREEN }}
                >
                  <ArrowRight className="size-5 text-[#04210f]" strokeWidth={2.5} aria-hidden />
                </span>
              </a>
            </figure>
          </div>
        </section>

        {/* ——— Genius mobile pay ——— */}
        <section className="mx-auto grid max-w-7xl items-center gap-16 px-8 py-16 md:grid-cols-2">
          <img
            src="/gp/genius.jpg"
            alt="A contactless card tapped on a phone running Genius"
            className="w-full rounded-3xl object-cover"
          />
          <div className="max-w-xl">
            <h2 className="text-5xl font-extrabold tracking-tight md:text-6xl">
              Genius mobile pay
            </h2>
            <p className="mt-6 text-[19px] leading-relaxed text-[#3c3c5c]">
              Genius mobile pay lets you accept payments how, when and where you
              want, with just your smartphone.
            </p>
            <a
              href="#"
              className="mt-9 inline-block rounded-full px-9 py-4 text-[17px] font-medium text-white transition-transform hover:-translate-y-px"
              style={{ backgroundColor: GP_ACCENT }}
            >
              Learn more
            </a>
          </div>
        </section>

        {/* ——— Preferred payment methods ——— */}
        <section className="mx-auto grid max-w-7xl items-center gap-16 px-8 py-24 md:grid-cols-2">
          <div className="max-w-xl">
            <h2 className="text-balance text-5xl font-light leading-[1.1] tracking-tight md:text-[56px]">
              <span className="font-extrabold">Preferred payment methods,</span>{" "}
              in your neighbourhood and around the world
            </h2>
            <p className="mt-8 text-[19px] leading-relaxed text-[#3c3c5c]">
              Accept all the major payment methods—including the newest ways to
              pay.
            </p>
            <p className="mt-5 text-[19px] leading-relaxed text-[#3c3c5c]">
              Apple Pay. Google Pay. Scan to pay. And wherever payments go next.
              We handle it all so you can focus on your business.
            </p>
            <a
              href="#"
              className="mt-9 inline-flex items-center gap-3 text-[17px] font-extrabold uppercase tracking-wide"
            >
              More on payment methods
              <ArrowRight className="size-5" style={{ color: GP_ACCENT }} strokeWidth={2.5} aria-hidden />
            </a>
          </div>
          <img
            src="/gp/methods.jpg"
            alt="Checkout with card, wallet and scan-to-pay options"
            className="w-full object-contain"
          />
        </section>

        {/* ——— Your goals. Our tools. ——— */}
        <section className="mx-auto grid max-w-7xl items-center gap-16 px-8 py-16 md:grid-cols-2">
          <img
            src="/gp/goals.jpg"
            alt="A shop owner reviews performance on a laptop"
            className="mx-auto aspect-square w-full max-w-[560px] rounded-full object-cover"
          />
          <div className="max-w-xl">
            <h2 className="text-5xl font-light tracking-tight md:text-6xl">
              Your goals. <span className="font-extrabold">Our tools.</span>
            </h2>
            <p className="mt-6 text-[19px] leading-relaxed text-[#3c3c5c]">
              Our productivity and performance tools, combined with our expert
              insight and guidance, help you build your business, whatever
              stage you&rsquo;re at.
            </p>
            <ul className="mt-9 space-y-5">
              {GOALS.map((g) => (
                <li key={g}>
                  <a
                    href="#"
                    className="inline-flex items-center gap-3 text-[18px] font-extrabold uppercase tracking-wide hover:opacity-70"
                  >
                    {g}
                    <ArrowRight className="size-5" style={{ color: GP_ACCENT }} strokeWidth={2.5} aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ——— Tailored to your industry ——— */}
        <section className="mx-auto max-w-7xl px-8 py-24 text-center">
          <h2 className="text-5xl font-extrabold tracking-tight md:text-6xl">
            Tailored to your industry
          </h2>
          <p className="mx-auto mt-7 max-w-3xl text-pretty text-[19px] leading-relaxed text-[#3c3c5c]">
            Restaurants to retail. Healthcare to education. Every industry has
            its own needs. That&rsquo;s why we provide specialist expertise, and
            industry-specific functionality, across hundreds of verticals.
          </p>
          <div className="mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-4">
            {INDUSTRIES.map((tag) => (
              <a
                key={tag}
                href="#"
                className="rounded-full border-2 px-7 py-3 text-[17px] font-bold transition-colors hover:bg-[#292EFF] hover:text-white"
                style={{ borderColor: GP_ACCENT }}
              >
                {tag}
              </a>
            ))}
          </div>
          <img
            src="/gp/industry.jpg"
            alt="A bartender rings up an order on a POS terminal"
            className="mt-14 w-full object-cover"
          />
        </section>

        {/* ——— Payments in Focus ——— */}
        <section className="mx-auto max-w-7xl px-8 py-24">
          <p className="text-[15px] font-bold uppercase tracking-[0.08em]">
            Payments in focus
          </p>
          <h2 className="mt-4 text-5xl font-extrabold tracking-tight md:text-6xl">
            Stay ahead. Stay informed.
          </h2>
          <p className="mt-6 text-[19px] text-[#3c3c5c]">
            Subscribe to{" "}
            <a href="#" className="underline" style={{ color: GP_ACCENT }}>
              Payments in Focus
            </a>
            , and stay ahead of the latest trends.
          </p>
          <a
            href="#"
            className="mt-8 inline-block rounded-full border-2 px-9 py-4 text-[17px] font-bold transition-colors hover:bg-[#292EFF] hover:text-white"
            style={{ borderColor: GP_ACCENT, color: GP_ACCENT }}
          >
            Subscribe now
          </a>

          <div className="mt-16 grid gap-10 md:grid-cols-2">
            {FOCUS.map((f) => (
              <a key={f.title} href="#" className="group">
                <img src={f.img} alt="" className="w-full object-cover" />
                <p className="mt-5 flex items-center gap-3 text-[15px] text-[#3c3c5c]">
                  <span
                    className="rounded-full border-2 px-4 py-1.5 font-bold text-[#14142b]"
                    style={{ borderColor: GP_ACCENT }}
                  >
                    {f.tag}
                  </span>
                  {f.meta}
                </p>
                <h3 className="mt-4 text-[27px] font-extrabold tracking-tight group-hover:underline">
                  {f.title}
                </h3>
              </a>
            ))}
          </div>
        </section>

        {/* ——— Tell us how we can help ——— */}
        <section className="mx-auto grid max-w-7xl items-center gap-16 px-8 pb-28 pt-8 md:grid-cols-2">
          <img
            src="/gp/help.jpg"
            alt="A bike-shop owner takes a contactless payment"
            className="w-full object-cover"
          />
          <div className="max-w-xl">
            <h2 className="text-5xl font-light tracking-tight">
              Tell us how <span className="font-extrabold">we can help</span>
            </h2>
            <ul className="mt-10">
              {HELP.map((h) => (
                <li key={h} className="border-b border-[#14142b]/60">
                  <a
                    href="#"
                    className="group flex items-center justify-between gap-6 py-5 text-[21px]"
                  >
                    {h}
                    <span
                      className="grid size-10 shrink-0 place-items-center rounded-full transition-transform group-hover:translate-x-0.5"
                      style={{ backgroundColor: GP_GREEN }}
                    >
                      <ArrowRight className="size-5 text-[#04210f]" strokeWidth={2.5} aria-hidden />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      {/* ——— Footer ——— */}
      <footer className="bg-black text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-8 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr_0.8fr]">
          <a href="#" className="flex items-start text-[24px] tracking-tight">
            <span className="mr-1 grid size-7 translate-y-0.5 place-items-center rounded-full border-2 border-white text-[16px] font-bold">
              g
            </span>
            <span className="font-bold">lobal</span>
            <span className="font-light">payments</span>
          </a>
          <ul className="space-y-4 text-[16px]">
            {["In-person payments", "Payments", "Online payments", "Partners"].map((l) => (
              <li key={l}>
                <a href="#" className="hover:underline">{l}</a>
              </li>
            ))}
          </ul>
          <ul className="space-y-4 text-[16px]">
            {["Careers ↗", "Investor Relations ↗", "Notices and Policies ↗", "Accessibility"].map(
              (l) => (
                <li key={l}>
                  <a href="#" className="hover:underline">{l}</a>
                </li>
              ),
            )}
          </ul>
          <div>
            <p className="text-[17px] font-bold">Already a customer?</p>
            <a
              href="#"
              className="mt-5 inline-block rounded-full border border-white px-9 py-3 text-[16px] font-medium hover:bg-white/10"
            >
              Log in
            </a>
          </div>
          <div>
            <p className="text-[17px] font-bold">Connect</p>
            {/* Brand glyphs as text — this lucide release dropped its brand
                icon set, and four tiny monograms carry the row fine. */}
            <ul className="mt-5 space-y-4 text-[15px]">
              {[
                ["in", "LinkedIn"],
                ["𝕏", "X (Twitter)"],
                ["f", "Facebook"],
                ["▶", "YouTube"],
              ].map(([glyph, label]) => (
                <li key={label} className="flex items-center gap-3">
                  <span className="grid size-5 place-items-center text-[13px] font-bold" aria-hidden>
                    {glyph}
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-[#1c1c1e] py-10 text-[14px] leading-relaxed text-[#9a9aa6]">
          <div className="mx-auto max-w-7xl space-y-4 px-8">
            <p>
              Global Payments is a trading name of GPUK LLP. GPUK LLP is
              authorised by the Financial Conduct Authority under the Payment
              Services Regulations 2017 (504290) for the provision of payment
              services. Registered Office: Granite House, Granite Way, Syston,
              Leicester, LE7 1PL.
            </p>
            <p>
              Design-system demo built from public screenshots — not affiliated
              with or endorsed by Global Payments Inc.
            </p>
            <p className="pt-2">
              © 2026 GPUK LLP. All rights reserved. &nbsp;
              <a href="#" className="underline">Privacy Statement</a> &nbsp;|&nbsp;{" "}
              <a href="#" className="underline">Terms of Use</a> &nbsp;|&nbsp;{" "}
              <a href="#" className="underline">GDPR</a> &nbsp;|&nbsp;{" "}
              <a href="#" className="underline">Cookie Settings</a>
            </p>
          </div>
        </div>
      </footer>

      {/* The tenant line — unchanged. The page around it is the variable. */}
      <GlassComposer
        theme="white"
        unified
        orb={false}
        accent={GP_ACCENT}
        accentLite={GP_ACCENT_LITE}
        content={GP_CONTENT}
      />
    </div>
  );
}
