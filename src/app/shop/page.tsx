import type { Metadata } from "next";
import Link from "next/link";
import { getAllActiveCategories, getAllStorefrontProducts } from "@/lib/miva-client";
import CatalogProductBrowser from "@/components/catalog/CatalogProductBrowser";
import type { MivaCategory, MivaProduct } from "@/types/miva";
import CatalogHeroBand from "@/components/CatalogHeroBand";

export const metadata: Metadata = {
  title: "Shop All Products",
  description:
    "Browse the complete Cookshack catalog — smokers, grills, pizza ovens, sauces, wood & pellets, and more.",
};

interface PageProps {
  searchParams: Promise<{ sort?: string }>;
}

export default async function ShopPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const initialSort = params.sort || "name";

  let products: MivaProduct[] = [];
  let allCategories: MivaCategory[] = [];
  let error = "";

  try {
    const [p, cats] = await Promise.all([
      getAllStorefrontProducts(),
      getAllActiveCategories(),
    ]);
    products = p;
    allCategories = cats;
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load products";
  }

  const totalCount = products.length;

  return (
    <>
      <CatalogHeroBand paddingClassName="py-10">
        <nav className="mb-4 flex items-center gap-2 text-xs text-[#6B6B6B]">
          <Link href="/" className="transition hover:text-[#D52324]">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#9A9A9A]">All Products</span>
        </nav>
        <h1 className="font-heading text-4xl font-extrabold tracking-wider text-white sm:text-5xl">
          All Products
        </h1>
        {totalCount > 0 && (
          <p className="mt-2 text-sm text-[#6B6B6B]">
            {totalCount.toLocaleString()} products in our catalog
          </p>
        )}
      </CatalogHeroBand>

      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {error ? (
            <div className="rounded border border-red-200 bg-white p-8 text-center">
              <p className="mb-1 font-heading text-lg font-bold tracking-wide text-red-700 uppercase">
                Unable to Load Products
              </p>
              <p className="mb-3 text-sm text-red-500">{error}</p>
              <p className="text-xs text-[#9A9A9A]">
                Ensure your Miva API credentials are configured in{" "}
                <code className="rounded bg-gray-100 px-1">.env.local</code>
              </p>
            </div>
          ) : products.length === 0 ? (
            <p className="text-center text-[#6B6B6B]">No products available.</p>
          ) : (
            <CatalogProductBrowser
              products={products}
              categoryName="All Products"
              currentCategoryCode=""
              allCategories={allCategories}
              initialSort={initialSort}
            />
          )}
        </div>
      </div>
    </>
  );
}
