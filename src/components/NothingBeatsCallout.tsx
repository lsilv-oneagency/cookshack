"use client";

import { useEffect, useRef, useState } from "react";

const NOTHING_BEATS_BG = "/images/nothing-beats-bg.png";
const BG_WIDTH = 1024;
const BG_HEIGHT = 576;

/** Full lockup in `public/images/` (flame + wordmark + “Made in Oklahoma”); use design export dimensions for stable layout. */
const MADE_IN_OK_LOGO = "/images/cookshack-made-in-ok-logo.png";
const MADE_IN_OK_W = 3425;
const MADE_IN_OK_H = 1009;

/** Parallax strength (px shift per “viewport center vs content” unit). Tuned to stay subtle. */
const PARALLAX_STRENGTH = 0.12;

type MadeInOkLockupProps = {
  className: string;
  width: number;
  height: number;
};

/**
 * Same box as a static <img>; recolors near-black wordmark to white, keeps red. Client-only;
 * falls back to the original PNG if canvas write fails.
 */
function MadeInOkLockupWhiteWordmark({ className, width, height }: MadeInOkLockupProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (!w || !h) return;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, w, h);
      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        if (a < 8) continue;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const isLikelyRed = r > 70 && r > g * 1.1 && r > b * 1.1;
        if (isLikelyRed) continue;
        const max = Math.max(r, g, b);
        if (max < 80 && r + g + b < 200) {
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
        }
      }
      ctx.putImageData(new ImageData(data, w, h), 0, 0);
      try {
        setDataUrl(canvas.toDataURL("image/png"));
      } catch {
        // tainted or unsupported: keep unprocessed `src` below
      }
    };
    img.src = MADE_IN_OK_LOGO;
  }, []);

  return (
    <img
      src={dataUrl ?? MADE_IN_OK_LOGO}
      alt="Cookshack Made in Oklahoma — flame and wordmark"
      width={width}
      height={height}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}

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
          <figure className="mx-auto w-full max-w-lg drop-shadow-sm md:mx-0">
            <MadeInOkLockupWhiteWordmark
              width={MADE_IN_OK_W}
              height={MADE_IN_OK_H}
              className="h-auto w-full object-contain"
            />
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
