type Props = {
  title: string;
  intro?: string;
};

export default function MarketingPlaceholder({
  title,
  intro = "This page is being updated. For immediate help, call 1-800-423-0698 (Mon–Fri, 8am–5pm CT).",
}: Props) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-extrabold uppercase tracking-wide text-[#1A1A1A] sm:text-4xl">
        {title}
      </h1>
      <p className="mt-6 font-body text-base leading-relaxed text-[#565959]">{intro}</p>
    </section>
  );
}
