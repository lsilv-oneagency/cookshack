import type { MivaProduct } from "@/types/miva";

type Props = {
  product?: Pick<MivaProduct, "name" | "code">;
};

/**
 * Full-width reviews *layout* — Cookshack JSON API in this app does not expose review text/ratings.
 * Keeps a credible PDP structure; replace with a reviews provider when available.
 */
export default function ProductReviewsPlaceholder({ product }: Props) {
  const reviewMail = `mailto:info@cookshack.com?subject=${encodeURIComponent("Product review")}&body=${encodeURIComponent(
    product ? `Product: ${product.name} (${product.code})` : ""
  )}`;

  const bars = [
    { stars: 5, pct: 0 },
    { stars: 4, pct: 0 },
    { stars: 3, pct: 0 },
    { stars: 2, pct: 0 },
    { stars: 1, pct: 0 },
  ];

  return (
    <section className="border-t border-[#E8E0D8] pt-10" aria-labelledby="reviews-heading">
      <h2
        id="reviews-heading"
        className="font-heading text-xl font-extrabold uppercase tracking-wider text-[#1A1A1A] sm:text-2xl"
      >
        Customer reviews
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-[#6B6B6B]">
        Star ratings and written reviews are not loaded on this headless storefront yet. When you connect a review
        service or Miva’s review data to the API, this block can show live feedback — the layout is ready.
      </p>

      <div className="mt-8 grid w-full min-w-0 grid-cols-1 grid-rows-[auto_auto] gap-8 sm:gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-0">
        {/* Explicit column 1: rating snapshot */}
        <div
          className="min-w-0 lg:pr-10"
          role="group"
          aria-label="Rating summary and distribution"
        >
          <p className="font-heading text-5xl font-extrabold text-[#1A1A1A]">—</p>
          <p className="text-sm text-[#6B6B6B]">Average rating (not synced)</p>
          <ul className="mt-4 space-y-2" role="list">
            {bars.map((b) => (
              <li key={b.stars} className="grid grid-cols-[4.5rem_1fr_2.25rem] items-center gap-x-3 text-sm">
                <span className="text-[#3D3D3D]">
                  {b.stars} star{b.stars !== 1 ? "s" : ""}
                </span>
                <div className="h-2 min-w-0 overflow-hidden rounded-full bg-[#E8E0D8]">
                  <div
                    className="h-full rounded-full bg-[#D52324] transition-all"
                    style={{ width: `${b.pct}%` }}
                  />
                </div>
                <span className="text-right text-xs tabular-nums text-[#9A9A9A]">{b.pct}%</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Explicit column 2: review CTA — vertical rule only between columns on lg+ */}
        <div
          className="min-w-0 border-t border-[#E8E0D8] pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0"
          role="group"
          aria-label="Write a review"
        >
          <div className="flex h-full min-h-0 flex-col justify-center rounded-lg border border-dashed border-[#D4C8BE] bg-[#FAFAFA] p-6 sm:p-8">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-[#1A1A1A]">
              Review this product
            </h3>
            <p className="mt-2 text-sm text-[#6B6B6B]">Share your thoughts with other customers</p>
            <a
              href={reviewMail}
              className="mt-5 flex w-full items-center justify-center rounded-full border border-[#B8B8B8] bg-white py-2.5 text-sm font-medium text-[#1A1A1A] shadow-sm transition hover:border-[#888888] hover:bg-white"
            >
              Write a customer review
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
