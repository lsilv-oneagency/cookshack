import { IconPhone } from "@/components/icons";

/** Static “expert” strip — no PDP API; matches reference expert callout pattern. */
export default function ProductExpertBand() {
  return (
    <section
      className="rounded-xl border border-[#E8E0D8] bg-gradient-to-r from-[#F7F7F7] to-white p-6 sm:p-8"
      aria-label="Expert help"
    >
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-[#D52324] bg-white font-heading text-2xl font-bold text-[#D52324]">
          CS
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-sm font-bold uppercase tracking-wider text-[#D52324]">Cookshack experts</p>
          <h2 className="mt-1 font-heading text-lg font-extrabold text-[#1A1A1A] sm:text-xl">
            Not sure which smoker or grill fits your kitchen?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#4A4A4A]">
            Our team knows these machines inside and out — from residential backyards to commercial kitchens. Call
            for sizing, installation tips, and honest recommendations.
          </p>
        </div>
        <a
          href="tel:18004230698"
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg border-2 border-[#D52324] bg-white px-5 py-3 font-heading text-sm font-bold uppercase tracking-wider text-[#D52324] transition hover:bg-[#D52324] hover:text-white sm:w-auto"
        >
          <IconPhone className="h-5 w-5" aria-hidden />
          1-800-423-0698
        </a>
      </div>
    </section>
  );
}
