import type { MivaProduct } from "@/types/miva";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: MivaProduct[];
  loading?: boolean;
}

function SkeletonCard() {
  return (
    <div className="flex flex-col bg-white border border-[#E8E0D8] rounded overflow-hidden animate-pulse">
      <div className="aspect-square bg-[#F0EBE3]" />
      <div className="p-4 space-y-3">
        <div className="h-2.5 bg-[#E8E0D8] rounded w-1/3" />
        <div className="h-4 bg-[#E8E0D8] rounded w-4/5" />
        <div className="h-3 bg-[#E8E0D8] rounded w-full" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-5 bg-[#E8E0D8] rounded w-1/3" />
          <div className="h-7 bg-[#E8E0D8] rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid({ products, loading = false }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20 col-span-full">
        <div className="w-20 h-20 bg-[#F0EBE3] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-[#C4B9AE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="font-heading font-bold text-[#1A1A1A] tracking-wide uppercase">No Products Found</p>
        <p className="text-sm text-[#9A9A9A] mt-1">Try a different category or search term.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
      {products.map((product) => (
        <ProductCard key={product.id || product.code} product={product} />
      ))}
    </div>
  );
}
