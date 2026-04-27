"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import ProductImage from "@/components/ProductImage";
import type { TopProductCardData } from "@/types/top-products-home";

type Props = {
  items: TopProductCardData[];
};

export default function TopProductsHomeClient({ items }: Props) {
  return (
    <section
      className="w-full border-t border-white bg-[#FAFAFA] py-12 sm:py-16"
      aria-label="Top products"
    >
      <div className="mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex w-full min-w-0 max-w-full flex-wrap items-end justify-between gap-3 sm:mb-7">
          <div className="min-w-0">
            <h2 className="font-heading text-4xl font-extrabold uppercase leading-none tracking-wider text-[#1A1A1A] sm:text-5xl">
              Top Products
            </h2>
            <div className="mt-2 h-1 w-16 bg-[#D52324]" />
            <p className="mt-2 max-w-2xl font-body text-sm leading-snug text-[#6B6B6B] sm:text-base sm:leading-relaxed">
              Six decades of engineering, on the four machines that earned their reputation.
            </p>
          </div>
          <Link
            href="/residential"
            className="flex shrink-0 items-center gap-2 font-heading text-sm font-bold uppercase tracking-widest text-[#D52324] transition hover:underline"
          >
            View All Products
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:gap-3 xl:grid-cols-2">
          {items.map((item) => (
            <TopProductCard key={item.code} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TopProductCard({ item }: { item: TopProductCardData }) {
  const { addItem, isLoading } = useCart();
  const [adding, setAdding] = useState(false);
  const shopHref = `/shop/${encodeURIComponent(item.code)}`;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (adding || isLoading || !item.inStock) return;
    setAdding(true);
    try {
      await addItem({
        product_code: item.code,
        product_name: item.productName,
        product_sku: item.sku,
        product_price: item.price,
        product_formatted_price: item.formattedPrice,
        product_image: item.rawImg || "",
        product_thumbnail: item.rawImg || "",
        quantity: 1,
      });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group flex min-h-0 flex-row items-stretch overflow-hidden rounded-md border border-neutral-200 bg-white shadow-sm transition hover:border-[#D6D6D6] hover:shadow-md">
      <Link
        href={shopHref}
        className="relative h-24 w-24 shrink-0 bg-white sm:h-28 sm:w-28 md:h-32 md:w-32"
      >
        <ProductImage
          src={item.rawImg || undefined}
          alt={item.displayTitle}
          productCode={item.code}
          productSku={item.sku}
          productName={item.displayTitle}
          fill
          className="object-contain p-1 transition-transform duration-200 group-hover:scale-[1.03] sm:p-1.5"
          sizes="(max-width: 640px) 96px, 128px"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-2 pl-2 pr-3 sm:gap-1.5 sm:py-2.5 sm:pl-3 sm:pr-4">
        <Link href={shopHref} className="min-w-0">
          <h3 className="line-clamp-2 font-heading text-[11px] font-bold uppercase leading-tight tracking-wide text-[#1A1A1A] transition group-hover:text-[#D52324] sm:text-xs md:text-sm">
            {item.displayTitle}
          </h3>
        </Link>
        <p className="line-clamp-2 text-[11px] italic leading-snug text-[#565959] sm:text-xs">
          &ldquo;{item.quote}&rdquo;
        </p>
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
          <p className="font-heading text-base font-extrabold tabular-nums leading-none text-[#D52324] sm:text-lg">
            {item.formattedPrice}
          </p>
        </div>
        <p className="text-[10px] leading-tight text-[#6B6B6B] sm:text-[11px]">{item.monthly}</p>
        <p className="text-[9px] font-heading font-bold uppercase leading-tight tracking-wide text-[#565959] sm:text-[10px]">
          ✓ 5-year warranty
        </p>
        <button
          type="button"
          onClick={handleAdd}
          disabled={adding || isLoading || !item.inStock}
          className="mt-0.5 flex min-h-[2.25rem] w-full min-w-0 items-center justify-center gap-1 rounded-full bg-[#D52324] px-2 py-1.5 text-[11px] font-bold text-white shadow-sm transition hover:brightness-[0.95] disabled:cursor-not-allowed disabled:opacity-50 sm:mt-1 sm:min-h-[2.5rem] sm:py-2 sm:text-xs"
        >
          {adding ? (
            "Adding…"
          ) : (
            <>
              Add to Cart
              <svg className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
