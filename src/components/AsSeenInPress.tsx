import { Fragment } from "react";

/**
 * Press / media row — “As seen in” with a scrolling logo strip. Between audience split and
 * featured product. Marquee uses plain CSS (not Tailwind motion-*) so it always shows.
 */
const PRESS_OUTLETS = [
  "AmazingRibs",
  "Food & Wine",
  "Bon Appétit",
  "Serious Eats",
  "Cook's Illustrated",
  "BBQ Industry Magazine",
] as const;

function PressLine({ suffix }: { suffix: "a" | "b" }) {
  return (
    <div className="flex shrink-0 items-center gap-3 pl-4 sm:gap-5 sm:pl-8 md:gap-8 md:pl-10">
      {PRESS_OUTLETS.map((name, i) => (
        <Fragment key={`${suffix}-${name}-${i}`}>
          {i > 0 && (
            <span className="select-none text-base font-light text-white/30 sm:text-lg" aria-hidden>
              |
            </span>
          )}
          <span
            className="whitespace-nowrap font-heading text-sm font-extrabold tracking-wide text-white opacity-50 transition-opacity duration-200 hover:opacity-100 sm:text-base md:text-lg"
          >
            {name}
          </span>
        </Fragment>
      ))}
    </div>
  );
}

export default function AsSeenInPress() {
  return (
    <section
      className="relative z-0 w-full border-t border-b border-[#2E2E2E] bg-[#0a0a0a] py-8 sm:py-10"
      aria-labelledby="as-seen-in-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 text-center sm:mb-5">
          <h4
            id="as-seen-in-heading"
            className="font-heading text-sm font-extrabold tracking-[0.28em] text-white/80 sm:text-base"
          >
            As seen in
          </h4>
          <div
            className="mx-auto mt-3 h-0.5 w-16 max-w-full bg-[#D52324] sm:mt-4 sm:w-20"
            aria-hidden
          />
        </div>

        <p className="sr-only">Featured in {PRESS_OUTLETS.join(", ")}.</p>

        {/* Animated row — see globals.css; hidden only via @media when reduced motion */}
        <div className="as-seen-in-marquee-wrap" aria-hidden="true">
          <div className="as-seen-in-marquee-track">
            <PressLine suffix="a" />
            <PressLine suffix="b" />
          </div>
        </div>

        {/* non-JS fallback when prefers-reduced-motion */}
        <div className="as-seen-in-static text-sm sm:text-base" aria-hidden="true">
          {PRESS_OUTLETS.map((name, i) => (
            <span key={name} className="inline-flex items-center">
              {i > 0 && <span className="mx-1.5 text-white/30 sm:mx-2.5">|</span>}
              <span className="font-heading font-extrabold tracking-wide text-white opacity-50 transition-opacity duration-200 hover:opacity-100">
                {name}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
