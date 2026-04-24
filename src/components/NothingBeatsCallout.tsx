/** Light band above Top Products — brand lockup + headline. */
export default function NothingBeatsCallout() {
  return (
    <section
      className="w-full border-t border-[#E8E8E8] bg-[#F5F5F5] py-10 sm:py-12 lg:py-14"
      aria-labelledby="nothing-beats-callout-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <figure className="mx-auto w-full max-w-lg md:mx-0">
            {/* eslint-disable-next-line @next/next/no-img-element -- static public asset; avoid next/image wrapper */}
            <img
              src="/images/cookshack-made-in-ok-logo.png"
              alt="Cookshack Made in Oklahoma — flame and banner logo"
              width={1024}
              height={590}
              className="h-auto w-full object-contain"
              loading="lazy"
              decoding="async"
            />
          </figure>
          <div className="text-center md:text-left">
            <h2
              id="nothing-beats-callout-heading"
              className="font-heading text-4xl font-extrabold normal-case leading-[1.1] text-[#D32F2F] sm:text-5xl lg:text-6xl"
            >
              Nothing beats a Cookshack!
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#4A4A4A] sm:text-lg">
              Consistent, high-volume performance with legendary smoke flavor kitchens can count on.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
