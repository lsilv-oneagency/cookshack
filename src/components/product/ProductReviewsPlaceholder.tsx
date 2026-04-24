/**
 * Full-width reviews *layout* — Cookshack JSON API in this app does not expose review text/ratings.
 * Keeps a credible PDP structure; replace with a reviews provider when available.
 */
export default function ProductReviewsPlaceholder() {
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

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <p className="font-heading text-5xl font-extrabold text-[#1A1A1A]">—</p>
          <p className="text-sm text-[#6B6B6B]">Average rating (not synced)</p>
          <ul className="mt-4 space-y-2">
            {bars.map((b) => (
              <li key={b.stars} className="flex items-center gap-3 text-sm">
                <span className="w-16 text-[#3D3D3D]">
                  {b.stars} star{b.stars !== 1 ? "s" : ""}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#E8E0D8]">
                  <div
                    className="h-full rounded-full bg-[#D52324] transition-all"
                    style={{ width: `${b.pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-xs text-[#9A9A9A]">{b.pct}%</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-dashed border-[#D4C8BE] bg-[#FAFAFA] p-6 text-center sm:p-8">
          <p className="font-heading text-sm font-bold uppercase tracking-wide text-[#1A1A1A]">
            Be the first to share feedback
          </p>
          <p className="mt-2 text-sm text-[#6B6B6B]">
            Review submission will be enabled when your team hooks up ratings to this page.
          </p>
        </div>
      </div>
    </section>
  );
}
