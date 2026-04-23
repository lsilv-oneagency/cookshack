"use client";

import { useState } from "react";
import Image from "next/image";

// ── Product type detector for last-resort placeholder ────────────────────────
function getProductType(code: string, name: string) {
  const c = code.toUpperCase();
  const n = name.toUpperCase();

  if (c.startsWith("SM") || n.includes("SMOKETTE") || n.includes("AMERIQUE") || (n.includes("SMOKER") && !n.includes("RECIPE")))
    return { label: "Smoker Oven", accent: "#E85D05" };
  if (c.startsWith("FEC") || n.includes("FAST EDDY"))
    return { label: "Commercial", accent: "#C44A00" };
  if (c.startsWith("PG") || (n.includes("PELLET") && n.includes("GRILL")))
    return { label: "Pellet Grill", accent: "#F48C06" };
  if (n.includes("PIZZA") || n.includes("WOOD FIRE"))
    return { label: "Pizza Oven", accent: "#AE2012" };
  if (n.includes("SAUCE") || n.includes("SPICE") || n.includes("RUB"))
    return { label: "Sauces", accent: "#E85D05" };
  if (n.includes("WOOD") || (n.includes("PELLET") && !c.startsWith("PG")))
    return { label: "Wood & Pellets", accent: "#C44A00" };
  if (n.includes("RECIPE") || c.startsWith("RECIPES_"))
    return { label: "Recipe", accent: "#4A7A3A" };
  if (n.includes("COOKBOOK"))
    return { label: "Cookbook", accent: "#4A5A7A" };
  if (c.startsWith("PV") || c.startsWith("PM") || c.startsWith("PA") || n.includes("FUSE") || n.includes("CASTER") || n.includes("SHAFT") || n.includes("MOTOR"))
    return { label: "Part", accent: "#6B6B6B" };

  return { label: "Product", accent: "#E85D05" };
}

// Build a proxied URL for any image path (handles Basic Auth transparently)
export function mivaImgUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return "";
  const trimmed = pathOrUrl.trim();
  // Callers sometimes pre-build `/api/img?p=…`; never double-wrap (would 404).
  if (trimmed.startsWith("/api/img")) {
    return trimmed;
  }
  // Already an absolute URL pointing elsewhere — use as-is
  if (trimmed.startsWith("http") && !trimmed.includes(process.env.NEXT_PUBLIC_STORE_URL || "NOOP")) {
    return trimmed;
  }
  const path = trimmed.startsWith("http")
    ? new URL(trimmed).pathname
    : trimmed.replace(/^\//, "");
  return `/api/img?p=${encodeURIComponent(path)}`;
}

// Miva product graphics are often mm5/graphics/00000001/1/{code}.png or .jpg
function codeBasedImgQuery(code: string, ext: "png" | "jpg") {
  return `/api/img?p=${encodeURIComponent(`mm5/graphics/00000001/1/${code}.${ext}`)}`;
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
  // Stage 1–2: Fallback — {code}.png then {code}.jpg
  // Stage 3: Branded placeholder
  const [stage, setStage] = useState(0);

  const stage0Url = src ? mivaImgUrl(src) : null;
  const stage1Url = codeBasedImgQuery(productCode, "png");
  const stage2Url = codeBasedImgQuery(productCode, "jpg");

  // If API gave us nothing, skip straight to code-based fallback
  const effectiveStage = stage === 0 && !stage0Url ? 1 : stage;
  const effectiveUrl =
    effectiveStage === 0
      ? stage0Url
      : effectiveStage === 1
        ? stage1Url
        : effectiveStage === 2
          ? stage2Url
          : null;

  const advance = () => setStage((s) => s + 1);

  const type = getProductType(productCode, productName);

  // Placeholder (stage 3+)
  if (effectiveStage >= 3 || !effectiveUrl) {
    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-2"
        style={{ background: "linear-gradient(145deg, #ffffff, #f5f5f5)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 19px,rgba(0,0,0,0.04) 20px),repeating-linear-gradient(90deg,transparent,transparent 19px,rgba(0,0,0,0.04) 20px)",
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
