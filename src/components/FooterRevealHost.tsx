"use client";

import { usePathname } from "next/navigation";
import { useState, useLayoutEffect, useRef, type ReactNode } from "react";

/** First paint: reserve scroll space so layout doesn’t jump before ResizeObserver runs. */
const DEFAULT_SPACER_PX = 520;

type Props = { children: ReactNode };

/**
 * Sits the global footer in a `fixed` layer with `z-0` so `<main className="... z-10">` (above in the stack)
 * visually covers it. A transparent, in-flow spacer (height = measured footer) matches the footer’s real height
 * so the document can scroll until the site “lifts” and the footer is uncovered.
 */
export default function FooterRevealHost({ children }: Props) {
  const pathname = usePathname();
  const innerRef = useRef<HTMLDivElement>(null);
  const [spacerPx, setSpacerPx] = useState(DEFAULT_SPACER_PX);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const read = () => {
      const h = Math.round(el.getBoundingClientRect().height);
      if (h > 0) setSpacerPx(h);
    };

    read();
    const ro = new ResizeObserver(() => read());
    ro.observe(el);
    window.addEventListener("resize", read);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", read);
    };
  }, [pathname]);

  return (
    <>
      <div
        className="pointer-events-none shrink-0"
        style={{ height: spacerPx }}
        aria-hidden
        data-footerspacer
      />
      <div
        className="pointer-events-none fixed bottom-0 left-0 right-0 z-0 w-full"
        data-footer-fixed
      >
        <div ref={innerRef} className="pointer-events-auto w-full">
          {children}
        </div>
      </div>
    </>
  );
}
