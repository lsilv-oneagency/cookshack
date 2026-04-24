"use client";

import type { ReactNode } from "react";
import HeroBackground from "@/components/HeroBackground";
import { pullUnderHeaderClass } from "@/lib/header-offset";

/** Match `<main>` offset in `layout.tsx` — pull band under fixed glass header so backdrop + media read together. */
const UNDER_FIXED_HEADER = pullUnderHeaderClass;

/** Catalog / shop header — `hero-grill-sausages.mp4` under glass + scrim (same asset as home hero). */
export default function CatalogHeroBand({
  children,
  paddingClassName = "py-10 sm:py-14",
}: {
  children: ReactNode;
  paddingClassName?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden border-b border-[#2B2B2B] ${UNDER_FIXED_HEADER}`}
    >
      <HeroBackground />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[#0a0a0a]/86 via-[#1A1A1A]/74 to-[#0a0a0a]/88"
        aria-hidden
      />
      <div
        className={`relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 ${paddingClassName} [&_nav]:justify-center`}
      >
        {children}
      </div>
    </div>
  );
}
