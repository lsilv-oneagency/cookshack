type Props = {
  lines: string[];
  title?: string;
};

/**
 * “Key features” / marketing bullets from Miva custom fields, attributes, or the first list in `descrip`.
 */
export default function ProductKeyFeatures({ lines, title = "Key features" }: Props) {
  if (lines.length === 0) return null;

  return (
    <section
      className="rounded-lg border border-[#E8E0D8] bg-[#FAFAFA] p-4 sm:p-5"
      aria-label={title}
    >
      <h2 className="font-heading text-sm font-extrabold uppercase tracking-wider text-[#1A1A1A]">
        {title}
      </h2>
      <ul className="mt-3 space-y-2.5" role="list">
        {lines.map((line) => (
          <li key={line} className="flex gap-2.5 text-sm leading-snug text-[#3D3D3D]">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D52324]" aria-hidden />
            <span className="min-w-0 flex-1">{line}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
