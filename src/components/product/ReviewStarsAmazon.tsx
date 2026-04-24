/** Half-star 5.0 display, brand red #D52324 — shared by PDP row and reviews block. */

export function StarGlyph({ fill, size = "lg" }: { fill: number; size?: "sm" | "md" | "lg" }) {
  const f = Math.min(1, Math.max(0, fill));
  const box =
    size === "sm" ? "h-3.5 w-3.5" : size === "md" ? "h-5 w-5" : "h-6 w-6 sm:h-7 sm:w-7";
  return (
    <span className={`relative inline-block shrink-0 ${box}`} aria-hidden>
      <svg className="h-full w-full text-[#D5D5D5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path
          strokeWidth={1.2}
          strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 00-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 00-.84-.61l1.285-5.386a.563.563 0 00-.182-.557l-4.204-3.602a.563.563 0 00.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
        />
      </svg>
      {f > 0 && (
        <span
          className="absolute left-0 top-0 h-full max-w-full overflow-hidden"
          style={{ width: `${f * 100}%` }}
        >
          <svg className={`text-[#D52324] ${box}`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 00-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 00-.84-.61l1.285-5.386a.563.563 0 00-.182-.557l-4.204-3.602a.563.563 0 00.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </span>
      )}
    </span>
  );
}

export function AmazonStyleStarRow({ value, size = "lg" }: { value: number; size?: "sm" | "md" | "lg" }) {
  const v = Math.min(5, Math.max(0, value));
  return (
    <div className="flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => {
        const rem = v - i;
        const fill = rem >= 1 ? 1 : rem > 0 ? rem : 0;
        return <StarGlyph key={i} fill={fill} size={size} />;
      })}
    </div>
  );
}

export function RedStarsSm({ value }: { value: number }) {
  const v = Math.min(5, Math.max(0, value));
  return (
    <div className="flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => {
        const rem = v - i;
        const fill = rem >= 1 ? 1 : rem > 0 ? rem : 0;
        return <StarGlyph key={i} fill={fill} size="sm" />;
      })}
    </div>
  );
}
