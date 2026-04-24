import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAllActiveCategories,
  getAllCategoryProducts,
  getCategoryByCode,
} from "@/lib/miva-client";
import { getCategoryHeroTitle } from "@/lib/category-hero-title";
import { filterStorefrontProducts } from "@/lib/miva-storefront-visibility";
import type { MivaCategory } from "@/types/miva";
import CatalogHeroBand from "@/components/CatalogHeroBand";
import CategoryShopClient from "@/components/category/CategoryShopClient";

interface PageProps {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  try {
    const res = await getCategoryByCode(decodeURIComponent(code));
    const cat = res.data;
    const title = cat ? getCategoryHeroTitle(cat) : "Category";
    const plain = cat?.descrip?.replace(/<[^>]*>/g, "") ?? "";
    return {
      title,
      description: `Shop Cookshack ${title} — ${plain.slice(0, 130)}`.trim(),
    };
  } catch {
    return { title: "Category" };
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { code } = await params;
  const sp = await searchParams;
  const initialSort = sp.sort || "name";

  const decodedCode = decodeURIComponent(code);

  let category: Awaited<ReturnType<typeof getCategoryByCode>>["data"];
  let products: Awaited<ReturnType<typeof getAllCategoryProducts>> = [];
  let allCategories: MivaCategory[] = [];
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

  const heroTitle = getCategoryHeroTitle(category);

  try {
    const [rawProducts, cats] = await Promise.all([
      getAllCategoryProducts(decodedCode, "name"),
      getAllActiveCategories(),
    ]);
    products = filterStorefrontProducts(rawProducts);
    allCategories = cats;
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load products";
  }

  return (
    <>
      {/* Category header */}
      <CatalogHeroBand
        key={decodedCode}
        paddingClassName="py-10 sm:py-14"
      >
        <nav className="flex items-center gap-2 text-xs text-[#6B6B6B] mb-4">
          <Link href="/" className="hover:text-[#D52324] transition">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#D52324] transition">Shop</Link>
          <span>/</span>
          <span className="text-[#9A9A9A]">{heroTitle}</span>
        </nav>
        <h1 className="font-heading font-extrabold text-white text-4xl sm:text-5xl tracking-wider uppercase leading-tight">
          {heroTitle}
        </h1>
        {category.descrip && (
          <p
            className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#9A9A9A]"
            dangerouslySetInnerHTML={{ __html: category.descrip }}
          />
        )}
        {products.length > 0 && (
          <p className="text-[#6B6B6B] text-xs mt-3">
            {products.length.toLocaleString()} products
          </p>
        )}
      </CatalogHeroBand>

      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {error ? (
            <div className="bg-white border border-red-200 rounded p-8 text-center">
              <p className="font-heading font-bold text-red-700 uppercase tracking-wide">{error}</p>
            </div>
          ) : (
            <CategoryShopClient
              products={products}
              categoryName={heroTitle}
              currentCategoryCode={category.code}
              allCategories={allCategories}
              initialSort={initialSort}
            />
          )}
        </div>
      </div>
    </>
  );
}
