"use client";

import { useState } from "react";
import Image from "next/image";

// ── Product type detector for last-resort placeholder ────────────────────────
function getProductType(code: string, name: string) {
  const c = code.toUpperCase();
  const n = name.toUpperCase();

  if (c.startsWith("SM") || n.includes("SMOKETTE") || n.includes("AMERIQUE") || (n.includes("SMOKER") && !n.includes("RECIPE")))
    return { label: "Smoker Oven", bg: "#1A0A00", accent: "#E85D04" };
  if (c.startsWith("FEC") || n.includes("FAST EDDY"))
    return { label: "Commercial", bg: "#0D0D0D", accent: "#C44A00" };
  if (c.startsWith("PG") || (n.includes("PELLET") && n.includes("GRILL")))
    return { label: "Pellet Grill", bg: "#130800", accent: "#F48C06" };
  if (n.includes("PIZZA") || n.includes("WOOD FIRE"))
    return { label: "Pizza Oven", bg: "#1A0000", accent: "#AE2012" };
  if (n.includes("SAUCE") || n.includes("SPICE") || n.includes("RUB"))
    return { label: "Sauces", bg: "#1A0800", accent: "#E85D04" };
  if (n.includes("WOOD") || (n.includes("PELLET") && !c.startsWith("PG")))
    return { label: "Wood & Pellets", bg: "#0D0800", accent: "#C44A00" };
  if (n.includes("RECIPE") || c.startsWith("RECIPES_"))
    return { label: "Recipe", bg: "#0D1A0D", accent: "#4A7A3A" };
  if (n.includes("COOKBOOK"))
    return { label: "Cookbook", bg: "#0D0D1A", accent: "#4A5A7A" };
  if (c.startsWith("PV") || c.startsWith("PM") || c.startsWith("PA") || n.includes("FUSE") || n.includes("CASTER") || n.includes("SHAFT") || n.includes("MOTOR"))
    return { label: "Part", bg: "#111111", accent: "#6B6B6B" };

  return { label: "Product", bg: "#1A1A1A", accent: "#E85D04" };
}

// Build a proxied URL for any image path (handles Basic Auth transparently)
export function mivaImgUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return "";
  // Already an absolute URL pointing elsewhere — use as-is
  if (pathOrUrl.startsWith("http") && !pathOrUrl.includes(process.env.NEXT_PUBLIC_STORE_URL || "NOOP")) {
    return pathOrUrl;
  }
  const path = pathOrUrl.startsWith("http")
    ? new URL(pathOrUrl).pathname
    : pathOrUrl.replace(/^\//, "");
  return `/api/img?p=${encodeURIComponent(path)}`;
}

// Derive the most likely Miva image path for a product by its code
function guessProductImagePath(code: string): string {
  // Miva stores product images at mm5/graphics/00000001/1/{code}.png (or .jpg)
  return `mm5/graphics/00000001/1/${code}.png`;
}

interface Props {
  src?: string;          // From Miva API image/thumbnail field (relative or absolute)
  alt: string;
  productCode: string;
  productName: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

export default function ProductImage({
  src,
  alt,
  productCode,
  productName,
  fill = true,
  sizes,
  className = "",
  priority = false,
}: Props) {
  // Stage 0: API-provided image URL (proxied)
  // Stage 1: Fallback — construct from product code
  // Stage 2: Branded placeholder
  const [stage, setStage] = useState(0);

  const stage0Url = src ? mivaImgUrl(src) : null;
  const stage1Url = `/api/img?p=${encodeURIComponent(guessProductImagePath(productCode))}`;

  // If API gave us nothing, skip straight to code-based fallback
  const effectiveStage = stage === 0 && !stage0Url ? 1 : stage;
  const effectiveUrl = effectiveStage === 0 ? stage0Url : effectiveStage === 1 ? stage1Url : null;

  const advance = () => setStage((s) => s + 1);

  const type = getProductType(productCode, productName);

  // Placeholder (stage 2)
  if (effectiveStage >= 2 || !effectiveUrl) {
    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-2"
        style={{ background: `linear-gradient(145deg, ${type.bg}, #1a1a1a)` }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 19px,rgba(255,255,255,0.3) 20px),repeating-linear-gradient(90deg,transparent,transparent 19px,rgba(255,255,255,0.3) 20px)",
          }}
        />
        <div
          className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: `${type.accent}22`, border: `1px solid ${type.accent}44` }}
        >
          <svg className="w-6 h-6" fill="none" stroke={type.accent} strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <span
          className="relative z-10 text-[9px] font-heading font-bold tracking-[0.2em] uppercase text-center leading-tight"
          style={{ color: type.accent }}
        >
          {type.label}
        </span>
        <span className="relative z-10 text-[7px] font-mono tracking-wider text-center" style={{ color: `${type.accent}60` }}>
          {productCode}
        </span>
      </div>
    );
  }

  return (
    <Image
      key={effectiveUrl}
      src={effectiveUrl}
      alt={alt}
      fill={fill}
      sizes={sizes}
      className={className}
      priority={priority}
      onError={advance}
      unoptimized
    />
  );
}
