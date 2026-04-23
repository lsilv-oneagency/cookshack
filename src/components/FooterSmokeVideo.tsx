"use client";

import { useEffect, useRef } from "react";

const SMOKE_MP4 = "/images/smoke-header.mp4";
const SMOKE_MOV = "/images/smoke.mov";

/** Looping smoke behind footer content; respects prefers-reduced-motion. */
export default function FooterSmokeVideo() {
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
    <div className="pointer-events-none absolute inset-0 z-0 min-h-[280px] overflow-hidden" aria-hidden>
      <video
        ref={ref}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 min-h-full min-w-full object-cover object-center opacity-[0.72] contrast-110 brightness-115 saturate-110"
        src={SMOKE_MP4}
      >
        <source src={SMOKE_MP4} type="video/mp4" />
        <source src={SMOKE_MOV} type="video/quicktime" />
      </video>
    </div>
  );
}
