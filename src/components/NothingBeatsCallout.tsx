"use client";

import { useEffect, useRef, useState } from "react";
import { CookshackWordmark } from "@/components/CookshackLogo";

const NOTHING_BEATS_BG = "/images/nothing-beats-bg.png";
const BG_WIDTH = 1024;
const BG_HEIGHT = 576;

/** Parallax strength (px shift per “viewport center vs content” unit). Tuned to stay subtle. */
const PARALLAX_STRENGTH = 0.12;

/**
 * Full-bleed background (`object-cover`) + light scroll parallax. Respects `prefers-reduced-motion`.
 */
export default function NothingBeatsCallout() {
  const sectionRef = useRef<HTMLElement>(null);
  const [parallaxY, setParallaxY] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onMq = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onMq);

    if (mq.matches) {
      return () => mq.removeEventListener("change", onMq);
    }

    const update = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const blockCenterY = rect.top + rect.height / 2;
      const viewportCenterY = vh / 2;
      // Background moves slightly opposite to scroll direction through the section (depth illusion).
      const shift = (viewportCenterY - blockCenterY) * PARALLAX_STRENGTH;
      setParallaxY(shift);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      mq.removeEventListener("change", onMq);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative isolate w-full overflow-hidden border-t border-[#E8E8E8] py-10 sm:py-12 lg:py-14"
      aria-labelledby="nothing-beats-callout-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div
          className="h-full w-full will-change-transform"
          style={
            reduceMotion
              ? undefined
              : { transform: `translate3d(0, ${parallaxY}px, 0) scale(1.08)` }
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static asset; cover fills section */}
          <img
            src={NOTHING_BEATS_BG}
            alt=""
            width={BG_WIDTH}
            height={BG_HEIGHT}
            className="h-full min-h-full w-full min-w-full object-cover object-center"
            decoding="async"
          />
        </div>
      </div>
      <div className="relative z-0 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <figure
            className="mx-auto w-full max-w-lg drop-shadow-sm md:mx-0"
            aria-label="Cookshack — Made in Oklahoma"
          >
            <div className="flex flex-col items-center gap-3 md:items-start">
              {/*
                Vector wordmark: white “COOKSHACK” letters + red flame (see CookshackLogo masks),
                replaces raster logo with black type on this dark band.
              */}
              <CookshackWordmark className="w-full max-w-[min(100%,22rem)] sm:max-w-md" />
              <p className="w-full text-center font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-[#D52324] sm:text-[11px] md:text-left">
                Made in Oklahoma
              </p>
            </div>
          </figure>
          <div className="text-center md:text-left">
            <h2
              id="nothing-beats-callout-heading"
              className="font-heading text-4xl font-extrabold normal-case leading-[1.1] text-[#D52324] drop-shadow-sm sm:text-5xl lg:text-6xl"
            >
              Nothing beats a Cookshack!
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-200 sm:text-lg">
              Consistent, high-volume performance with legendary smoke flavor kitchens can count on.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
