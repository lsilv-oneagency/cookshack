import type { MivaProduct } from "@/types/miva";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: MivaProduct[];
  loading?: boolean;
  categoryLabel?: string;
}

function SkeletonCard() {
  return (
    <div className="flex animate-pulse flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="flex flex-col gap-4 p-5">
        <div className="aspect-square rounded-xl bg-neutral-100" />
        <div className="space-y-2">
          <div className="h-3 w-1/4 rounded bg-neutral-100" />
          <div className="h-4 w-4/5 rounded bg-neutral-100" />
          <div className="flex gap-0.5 pt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-3.5 w-3.5 rounded-sm bg-neutral-100" />
            ))}
          </div>
          <div className="h-6 w-1/3 rounded bg-neutral-100" />
        </div>
        <div className="mt-auto h-12 rounded-xl bg-neutral-100" />
      </div>
    </div>
  );
}

export default function ProductGrid({ products, loading = false, categoryLabel }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="col-span-full py-20 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
          <svg className="h-10 w-10 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <p className="font-heading text-lg font-bold uppercase tracking-wide text-neutral-900">No Products Found</p>
        <p className="mt-1 text-sm text-neutral-500">Try a different category or search term.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id || product.code}
          product={product}
          categoryLabel={categoryLabel}
        />
      ))}
    </div>
  );
}
