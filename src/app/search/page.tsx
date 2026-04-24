import type { Metadata } from "next";
import Link from "next/link";
import { searchProducts } from "@/lib/miva-client";
import ProductGrid from "@/components/ProductGrid";
import Pagination from "@/components/Pagination";
import CatalogHeroBand from "@/components/CatalogHeroBand";
import SearchForm from "./SearchForm";
import { IconMagnifyingGlass } from "@/components/icons";

interface PageProps {
  searchParams: Promise<{ q?: string; offset?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: "${q}"` : "Search Cookshack Products",
    description: q ? `Search results for "${q}" at Cookshack` : "Search our full catalog of BBQ smokers, grills, and accessories.",
  };
}

const PAGE_SIZE = 24;

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const offset = parseInt(params.offset || "0");

  let products: Awaited<ReturnType<typeof searchProducts>>["data"] = [];
  let totalCount = 0;
  let error = "";

  if (query) {
    try {
      const res = await searchProducts(query, { count: PAGE_SIZE, offset });
      products = res.data || [];
      totalCount = res.total_count || 0;
    } catch (e) {
      error = e instanceof Error ? e.message : "Search failed";
    }
  }

  return (
    <>
      <CatalogHeroBand paddingClassName="py-10 sm:py-14">
        <nav className="flex items-center gap-2 text-xs text-[#6B6B6B] mb-4">
          <Link href="/" className="hover:text-[#D52324] transition">Home</Link>
          <span>/</span>
          <span className="text-[#9A9A9A]">Search</span>
        </nav>
        <h1 className="font-heading font-extrabold text-white text-4xl sm:text-5xl tracking-wider uppercase">
          {query ? `Results for "${query}"` : "Search Products"}
        </h1>
        {totalCount > 0 && (
          <p className="text-[#6B6B6B] text-sm mt-2">
            {totalCount.toLocaleString()} products found
          </p>
        )}
      </CatalogHeroBand>

      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8">
            <SearchForm initialQuery={query} />
          </div>

          {!query ? (
            <div className="text-center py-20">
              <IconMagnifyingGlass className="w-16 h-16 mx-auto mb-4 text-[#D52324]" aria-hidden />
              <p className="font-heading font-bold text-[#1A1A1A] text-xl tracking-wide uppercase mb-2">
                Find Your Next Cookshack
              </p>
              <p className="text-[#6B6B6B] text-sm">
                Search by product name, model number, or SKU
              </p>
            </div>
          ) : error ? (
            <div className="bg-white border border-red-200 rounded p-8 text-center">
              <p className="font-heading font-bold text-red-700 uppercase tracking-wide">{error}</p>
            </div>
          ) : (
            <>
              <ProductGrid products={products} />
              <Pagination total={totalCount} count={PAGE_SIZE} offset={offset} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
