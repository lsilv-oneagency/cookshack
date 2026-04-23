"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
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

  const rawImg = product.image || product.thumbnail || "";
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
        product_image: rawImg,
        product_thumbnail: product.thumbnail || "",
        quantity: 1,
      });
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link
      href={`/shop/${product.code}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-colors hover:border-neutral-300"
    >
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white">
          <ProductImage
            src={rawImg || undefined}
            alt={product.name}
            productCode={product.code}
            productName={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.02]"
          />
          {!inStock && (
            <div className="absolute left-2 top-2 rounded bg-neutral-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              Out of Stock
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2 text-left">
          {categoryLabel ? (
            <p className="text-xs font-bold text-neutral-900">{categoryLabel}</p>
          ) : null}
          <h3 className="line-clamp-1 text-base font-bold leading-snug text-neutral-900">
            {product.name}
          </h3>
          <CardStarDecor />
          <p className="text-xl font-bold text-neutral-900">{priceDisplay}</p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={adding || isLoading || !inStock}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-[#E85D05] py-3.5 text-sm font-bold text-white transition hover:bg-[#C44A00] disabled:cursor-not-allowed disabled:opacity-50"
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
    </Link>
  );
}
