import type { Metadata } from "next";
import Link from "next/link";
import { getProducts } from "@/lib/miva-client";
import ProductGrid from "@/components/ProductGrid";
import Pagination from "@/components/Pagination";
import CatalogHeroBand from "@/components/CatalogHeroBand";
import SortSelect from "./SortSelect";

export const metadata: Metadata = {
  title: "Shop All Products",
  description: "Browse the complete Cookshack catalog — smokers, grills, pizza ovens, sauces, wood & pellets, and more.",
};


const PAGE_SIZE = 24;

interface PageProps {
  searchParams: Promise<{ sort?: string; offset?: string }>;
}

export default async function ShopPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sort = params.sort || "name";
  const offset = parseInt(params.offset || "0");

  let products: Awaited<ReturnType<typeof getProducts>>["data"] = [];
  let totalCount = 0;
  let error = "";

  try {
    const res = await getProducts({ count: PAGE_SIZE, offset, sort });
    products = res.data || [];
    totalCount = res.total_count || 0;
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load products";
  }

  return (
    <>
      {/* Page header */}
      <CatalogHeroBand paddingClassName="py-10">
        <nav className="flex items-center gap-2 text-xs text-[#6B6B6B] mb-4">
          <Link href="/" className="hover:text-[#AE1B07] transition">Home</Link>
          <span>/</span>
          <span className="text-[#9A9A9A]">All Products</span>
        </nav>
        <h1 className="font-heading font-extrabold text-white text-4xl sm:text-5xl tracking-wider uppercase">
          All Products
        </h1>
        {totalCount > 0 && (
          <p className="text-[#6B6B6B] text-sm mt-2">
            {totalCount.toLocaleString()} products in our catalog
          </p>
        )}
      </CatalogHeroBand>

      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Controls */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <p className="text-sm text-[#6B6B6B]">
              {totalCount > 0 && `Showing ${offset + 1}–${Math.min(offset + PAGE_SIZE, totalCount)} of ${totalCount}`}
            </p>
            <div className="flex items-center gap-3">
              <label htmlFor="sort" className="text-sm text-[#6B6B6B] font-medium whitespace-nowrap">
                Sort by:
              </label>
              <SortSelect value={sort} />
            </div>
          </div>

          {error ? (
            <div className="bg-white border border-red-200 rounded p-8 text-center">
              <p className="font-heading font-bold text-red-700 text-lg uppercase tracking-wide mb-1">
                Unable to Load Products
              </p>
              <p className="text-sm text-red-500 mb-3">{error}</p>
              <p className="text-xs text-[#9A9A9A]">
                Ensure your Miva API credentials are configured in <code className="bg-gray-100 px-1 rounded">.env.local</code>
              </p>
            </div>
          ) : (
            <ProductGrid products={products} />
          )}

          <Pagination total={totalCount} count={PAGE_SIZE} offset={offset} />
        </div>
      </div>
    </>
  );
}
