"use client";

import { useEffect, useRef } from "react";

const VIDEO_SRC = "/videos/hero-grill-sausages.mp4";

/** Full-bleed looping hero video; respects prefers-reduced-motion. */
export default function HeroBackground() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => {
      if (mq.matches) {
        el.pause();
        el.removeAttribute("autoplay");
      } else {
        el.setAttribute("autoplay", "");
        void el.play().catch(() => {});
      }
    };

    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <video
      ref={ref}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster="/images/hero.png"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center"
      aria-hidden
    >
      <source src={VIDEO_SRC} type="video/mp4" />
    </video>
  );
}
