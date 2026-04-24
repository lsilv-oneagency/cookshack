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
    <section className="border-t border-[#E8E0D8] pt-10" aria-labelledby="witb-heading">
      <h2
        id="witb-heading"
        className="font-heading text-xl font-extrabold uppercase tracking-wider text-[#1A1A1A] sm:text-2xl"
      >
        What&apos;s in the box
      </h2>
      {lines.length > 1 ? (
        <ul className="mt-5 list-inside list-disc space-y-2 text-sm leading-relaxed text-[#3D3D3D] sm:columns-1">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 text-sm leading-relaxed text-[#3D3D3D]">{trimmed}</p>
      )}
    </section>
  );
}
