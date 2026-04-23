import type { CSSProperties } from "react";

const WORDMARK_MASK_STYLE: CSSProperties = {
  aspectRatio: "1361.48 / 413.76",
  WebkitMaskImage: "url(/images/logo-cookshack.svg)",
  maskImage: "url(/images/logo-cookshack.svg)",
  WebkitMaskSize: "contain",
  maskSize: "contain",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
};

type WordmarkProps = {
  className?: string;
  /** Use inside a parent with `group` (e.g. home link) for brand-color hover. */
  interactive?: boolean;
};

/** SVG wordmark only — CSS mask + `background-color` (default white). */
export function CookshackWordmark({ className = "", interactive = false }: WordmarkProps) {
  return (
    <span
      className={`block w-auto shrink-0 bg-white ${interactive ? "transition-colors duration-200 group-hover:bg-[#AE1B07]" : ""} ${className}`.trim()}
      style={WORDMARK_MASK_STYLE}
      aria-hidden
    />
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
