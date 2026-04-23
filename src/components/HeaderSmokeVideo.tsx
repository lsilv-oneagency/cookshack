"use client";

import { useEffect, useRef } from "react";

/** Lightweight smoke loop for nav (small MP4 only). */
const SMOKE_MP4 = "/images/smoke-header.mp4";

/** Subtle looping smoke behind the glass nav; respects prefers-reduced-motion. */
export default function HeaderSmokeVideo() {
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
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <video
        ref={ref}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover object-center opacity-55 contrast-110 brightness-110"
      >
        <source src={SMOKE_MP4} type="video/mp4" />
      </video>
    </div>
  );
}
