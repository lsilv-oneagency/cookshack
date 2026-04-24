type Props = {
  lines: string[];
  title?: string;
};

/**
 * “Key features” / marketing bullets from Miva custom fields, attributes, or the first list in `descrip`.
 */
export default function ProductKeyFeatures({ lines, title = "About this item" }: Props) {
  if (lines.length === 0) return null;

  return (
    <section
      className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm sm:p-5"
      aria-label={title}
    >
      <h2 className="text-base font-bold text-[#0F1111]">{title}</h2>
      <ul className="mt-3 list-none space-y-2.5" role="list">
        {lines.map((line) => (
          <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-[#0F1111]">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D52324]" aria-hidden />
            <span className="min-w-0 flex-1">{line}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
