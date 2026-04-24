"use client";

import { useEffect } from "react";
import Script from "next/script";

const AFFIRM_PUBLIC_KEY = process.env.NEXT_PUBLIC_AFFIRM_PUBLIC_KEY;

type AffirmWin = { affirm?: { ui?: { refresh: () => void } } };

function refreshAffirmUi() {
  if (typeof window === "undefined") return;
  try {
    (window as AffirmWin).affirm?.ui?.refresh();
  } catch {
    // Affirm not ready or blocked
  }
}

type Props = {
  /** Integer cents, e.g. 12999 for $129.99 (Affirm `data-amount` requirement) */
  amountCents: number;
  sku: string;
  className?: string;
};

/**
 * Renders official Affirm “as low as” / Pay with Affirm marketing on the PDP when
 * `NEXT_PUBLIC_AFFIRM_PUBLIC_KEY` is set (from your Affirm dashboard).
 * Configure Affirm in Miva so checkout can complete an Affirm loan.
 */
export default function AffirmProductMessaging({ amountCents, sku, className = "" }: Props) {
  const enabled = Boolean(AFFIRM_PUBLIC_KEY && AFFIRM_PUBLIC_KEY.length > 0) && amountCents > 0;

  useEffect(() => {
    if (!enabled) return;
    refreshAffirmUi();
  }, [amountCents, sku, enabled]);

  if (!enabled) {
    return null;
  }

  return (
    <div className={className}>
      <Script
        id="affirm-js"
        src={`https://cdn1.affirm.com/js/v2/affirm.js?public_api_key=${encodeURIComponent(AFFIRM_PUBLIC_KEY!)}`}
        strategy="afterInteractive"
        onLoad={refreshAffirmUi}
      />
      <div
        className="affirm-as-low-as min-h-6 text-sm leading-snug text-[#565959] [&_a]:text-[#D52324] [&_a]:underline"
        data-amount={String(amountCents)}
        data-sku={sku}
        data-page-type="product"
      />
    </div>
  );
}
