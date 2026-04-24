type Props = {
  text: string;
};

/** Match reference “What’s in the box” when a Miva custom field supplies copy. */
export default function WhatsInTheBoxSection({ text }: Props) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const lines = trimmed
    .split(/\n+/)
    .map((l) => l.replace(/^•\s*/, "").trim())
    .filter(Boolean);

  return (
    <section
      className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm sm:p-6"
      aria-labelledby="witb-heading"
    >
      <h2
        id="witb-heading"
        className="text-lg font-bold text-[#0F1111] sm:text-xl"
      >
        What&apos;s in the box
      </h2>
      <div className="mt-2 h-0.5 w-12 bg-[#D52324]" aria-hidden />
      {lines.length > 1 ? (
        <ul className="mt-5 list-inside list-disc space-y-2 text-sm leading-relaxed text-[#0F1111] sm:columns-1">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 text-sm leading-relaxed text-[#0F1111]">{trimmed}</p>
      )}
    </section>
  );
}
