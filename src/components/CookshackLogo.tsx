import type { CSSProperties } from "react";

/** Shared mask fields — two layers share viewBox, align when stacked. */
const MASK_LAYERS: CSSProperties = {
  WebkitMaskSize: "contain",
  maskSize: "contain",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
};

const LETTERS_MASK: CSSProperties = {
  ...MASK_LAYERS,
  WebkitMaskImage: "url(/images/logo-cookshack-letters.svg)",
  maskImage: "url(/images/logo-cookshack-letters.svg)",
};

const FLAME_MASK: CSSProperties = {
  ...MASK_LAYERS,
  WebkitMaskImage: "url(/images/logo-cookshack-flame.svg)",
  maskImage: "url(/images/logo-cookshack-flame.svg)",
};

const WORDMARK_ASPECT: CSSProperties = { aspectRatio: "1361.48 / 413.76" };

type WordmarkProps = {
  className?: string;
  /** Use inside a parent with `group` (e.g. home link) for brand-color hover. */
  interactive?: boolean;
};

/**
 * Wordmark: “COOKSHACK” letters (white) + flame (#D52324), two aligned CSS masks.
 */
export function CookshackWordmark({ className = "", interactive = false }: WordmarkProps) {
  const letterHover = interactive
    ? "bg-white transition-colors duration-200 group-hover:bg-[#D52324]"
    : "bg-white";
  return (
    <span
      className={`relative block w-auto shrink-0 ${className}`.trim()}
      style={WORDMARK_ASPECT}
      aria-hidden
    >
      <span
        className={`pointer-events-none absolute inset-0 ${letterHover}`}
        style={LETTERS_MASK}
      />
      <span
        className="pointer-events-none absolute inset-0 bg-[#D52324]"
        style={FLAME_MASK}
      />
    </span>
  );
}

type LockupProps = {
  wordmarkClassName?: string;
  showTagline?: boolean;
  taglineClassName?: string;
  interactive?: boolean;
  align?: "center" | "start";
};

/** Wordmark + “Nothing Beats A Cookshack!” */
export function CookshackLogoLockup({
  wordmarkClassName = "",
  showTagline = true,
  taglineClassName = "",
  interactive = false,
  align = "center",
}: LockupProps) {
  const alignCls = align === "center" ? "items-center" : "items-start";
  return (
    <span className={`flex flex-col gap-0.5 leading-none ${alignCls}`}>
      <CookshackWordmark className={wordmarkClassName} interactive={interactive} />
      {showTagline ? (
        <span className={(taglineClassName || "").trim() || undefined}>Nothing Beats A Cookshack!</span>
      ) : null}
    </span>
  );
}
