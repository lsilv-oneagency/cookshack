"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { getProductFeatureTeaser } from "@/lib/miva-product-features";
import { getPrimaryProductImagePath } from "@/lib/miva-product-images";
import ProductImage from "./ProductImage";
import type { MivaProduct } from "@/types/miva";

interface ProductCardProps {
  product: MivaProduct;
  /** e.g. category name when listing within a category */
  categoryLabel?: string;
}

/** Decorative stars only (no review data from API); matches reference card rhythm */
function CardStarDecor() {
  return (
    <div className="flex gap-0.5 text-neutral-900" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
          <path
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 00-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 00-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 00.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            fill={i < 2 ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  );
}

export default function ProductCard({ product, categoryLabel }: ProductCardProps) {
  const { addItem, isLoading } = useCart();
  const [adding, setAdding] = useState(false);
  const featureLine = useMemo(() => getProductFeatureTeaser(product), [product]);

  const shopHref = `/shop/${encodeURIComponent(product.code)}`;
  const rawImg = getPrimaryProductImagePath(product);
  const inStock = product.inv1 === undefined || product.inv1 > 0;
  const priceDisplay = product.formatted_price || `$${product.price?.toFixed(2) ?? "—"}`;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (adding || isLoading || !inStock) return;
    setAdding(true);
    try {
      await addItem({
        product_code: product.code,
        product_name: product.name,
        product_sku: product.sku,
        product_price: product.price,
        product_formatted_price: product.formatted_price,
        product_image: rawImg || product.image || "",
        product_thumbnail: product.thumbnail || rawImg || "",
        quantity: 1,
      });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-md border border-neutral-200 bg-white p-2.5 shadow-sm transition hover:border-[#D6D6D6] hover:shadow-md sm:p-3">
      <Link href={shopHref} className="flex min-h-0 flex-1 flex-col gap-2.5 text-left">
        <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-white">
          <ProductImage
            src={rawImg || undefined}
            alt={product.name}
            productCode={product.code}
            productSku={product.sku}
            productName={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-2 transition-transform duration-200 group-hover:scale-[1.02]"
          />
          {!inStock && (
            <div className="absolute left-1.5 top-1.5 rounded-sm bg-[#0F1111] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Out of Stock
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-1.5">
          {categoryLabel ? (
            <p className="line-clamp-1 text-xs font-bold text-[#0F1111]">{categoryLabel}</p>
          ) : null}
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-[#0F1111] sm:min-h-0">
            {product.name}
          </h3>
          {featureLine ? (
            <p className="line-clamp-2 text-xs leading-snug text-[#565959]">{featureLine}</p>
          ) : null}
          <CardStarDecor />
          <p className="pt-0.5 text-lg font-bold tabular-nums text-[#0F1111]">{priceDisplay}</p>
        </div>
      </Link>

      <button
        type="button"
        onClick={handleAdd}
        disabled={adding || isLoading || !inStock}
        className="mt-2 flex min-h-[2.25rem] w-full items-center justify-center gap-1.5 rounded-full bg-[#D52324] py-1.5 text-xs font-bold text-white shadow-sm transition hover:brightness-[0.95] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[2.5rem] sm:py-2 sm:text-sm"
      >
        {adding ? (
          <>
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Adding…
          </>
        ) : (
          <>
            Add to Cart
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </>
        )}
      </button>
    </div>
  );
}
