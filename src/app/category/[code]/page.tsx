import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoryByCode, getCategoryProducts } from "@/lib/miva-client";
import ProductGrid from "@/components/ProductGrid";
import Pagination from "@/components/Pagination";
import CatalogHeroBand from "@/components/CatalogHeroBand";
import SortSelect from "./SortSelect";

interface PageProps {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ sort?: string; offset?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  try {
    const res = await getCategoryByCode(decodeURIComponent(code));
    const cat = res.data;
    return {
      title: cat?.name || "Category",
      description: `Shop Cookshack ${cat?.name || "products"} — ${cat?.descrip?.replace(/<[^>]*>/g, "").slice(0, 130) || ""}`,
    };
  } catch {
    return { title: "Category" };
  }
}

const PAGE_SIZE = 24;

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { code } = await params;
  const sp = await searchParams;
  const sort = sp.sort || "name";
  const offset = parseInt(sp.offset || "0");

  const decodedCode = decodeURIComponent(code);

  let category: Awaited<ReturnType<typeof getCategoryByCode>>["data"];
  let products: Awaited<ReturnType<typeof getCategoryProducts>>["data"] = [];
  let totalCount = 0;
  let error = "";
  let categoryLoadError = "";

  try {
    const catRes = await getCategoryByCode(decodedCode);
    category = catRes.data;
  } catch (e) {
    categoryLoadError = e instanceof Error ? e.message : "Failed to load category";
  }

  if (categoryLoadError) {
    return (
      <>
        <CatalogHeroBand paddingClassName="py-10 sm:py-14">
          <nav className="flex items-center gap-2 text-xs text-[#6B6B6B] mb-4">
            <Link href="/" className="hover:text-[#D52324] transition">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#9A9A9A]">Category</span>
          </nav>
          <h1 className="font-heading font-extrabold text-white text-2xl sm:text-3xl tracking-wider uppercase">
            Unable to load category
          </h1>
        </CatalogHeroBand>
        <div className="bg-white min-h-[40vh]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <p className="text-[#6B6B6B] mb-4 max-w-lg mx-auto">{categoryLoadError}</p>
            <p className="text-sm text-[#9A9A9A] mb-8 max-w-md mx-auto">
              Check that Vercel has the same <code className="text-xs bg-[#F5F5F5] px-1 rounded">MIVA_*</code> variables as your local{" "}
              <code className="text-xs bg-[#F5F5F5] px-1 rounded">.env.local</code>.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#D52324] text-white font-heading font-bold tracking-widest uppercase text-sm rounded hover:brightness-[0.94] transition"
            >
              Back to shop
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (!category) {
    notFound();
  }

  try {
    const prodRes = await getCategoryProducts(decodedCode, { count: PAGE_SIZE, offset, sort });
    products = prodRes.data || [];
    totalCount = prodRes.total_count || 0;
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load products";
  }

  return (
    <>
      {/* Category header */}
      <CatalogHeroBand paddingClassName="py-10 sm:py-14">
        <nav className="flex items-center gap-2 text-xs text-[#6B6B6B] mb-4">
          <Link href="/" className="hover:text-[#D52324] transition">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#D52324] transition">Shop</Link>
          <span>/</span>
          <span className="text-[#9A9A9A]">{category.name}</span>
        </nav>
        <h1 className="font-heading font-extrabold text-white text-4xl sm:text-5xl tracking-wider uppercase leading-tight">
          {category.name}
        </h1>
        {category.descrip && (
          <p
            className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#9A9A9A]"
            dangerouslySetInnerHTML={{ __html: category.descrip }}
          />
        )}
        {totalCount > 0 && (
          <p className="text-[#6B6B6B] text-xs mt-3">
            {totalCount.toLocaleString()} products
          </p>
        )}
      </CatalogHeroBand>

      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Sort controls */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <p className="text-sm text-[#6B6B6B]">
              {totalCount > 0 && `Showing ${offset + 1}–${Math.min(offset + PAGE_SIZE, totalCount)} of ${totalCount}`}
            </p>
            <div className="flex items-center gap-3">
              <label htmlFor="sort" className="text-sm text-[#6B6B6B] font-medium">Sort:</label>
              <SortSelect value={sort} />
            </div>
          </div>

          {error ? (
            <div className="bg-white border border-red-200 rounded p-8 text-center">
              <p className="font-heading font-bold text-red-700 uppercase tracking-wide">{error}</p>
            </div>
          ) : (
            <ProductGrid products={products} categoryLabel={category.name} />
          )}

          <Pagination total={totalCount} count={PAGE_SIZE} offset={offset} />
        </div>
      </div>
    </>
  );
}
