import type { MivaProduct } from "@/types/miva";
import { getProductAverageRating } from "@/lib/product-filters";
import { AmazonStyleStarRow, StarGlyph } from "@/components/product/ReviewStarsAmazon";

/** Buy box: half-stars + average from Miva custom fields (when `getProductAverageRating` finds a value). */
export default function PdpProductRatingLine({ product }: { product: MivaProduct }) {
  const avg = getProductAverageRating(product);

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm" aria-label={`${product.name} — ratings`}>
      <div className="flex items-center gap-2" aria-hidden>
        {avg != null ? (
          <>
            <AmazonStyleStarRow value={avg} size="md" />
            <span className="text-xs font-bold text-[#0F1111]">{avg.toFixed(1)}</span>
          </>
        ) : (
          <div className="flex items-center gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <StarGlyph key={i} fill={0} size="md" />
            ))}
            <span className="ml-1 text-xs text-[#9A9A9A]">No rating in feed</span>
          </div>
        )}
      </div>
      <a href="#pdp-reviews" className="text-xs font-medium text-[#D52324] hover:underline">
        Customer reviews
      </a>
    </div>
  );
}
