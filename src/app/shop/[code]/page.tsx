import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoryProducts, getProductByCode, getRelatedProducts } from "@/lib/miva-client";
import {
  getProductCustomFieldRows,
  isFeatureFieldRow,
  isSeoMetadataRow,
  partitionWhatsInTheBoxRows,
} from "@/lib/miva-custom-fields";
import { getProductDimensionRows } from "@/lib/miva-product-dimensions";
import { getProductFeatureData } from "@/lib/miva-product-features";
import { getNativeProductDetailRows, mergeDetailRows } from "@/lib/miva-native-product-details";
import { getAllProductImagePaths, getPrimaryProductImagePath } from "@/lib/miva-product-images";
import {
  filterStorefrontProducts,
  isNonPurchasableStorefrontProduct,
} from "@/lib/miva-storefront-visibility";
import AddToCartButton from "./AddToCartButton";
import CatalogHeroBand from "@/components/CatalogHeroBand";
import ProductDetailGallery from "@/components/product/ProductDetailGallery";
import ProductCustomFieldsTable from "@/components/product/ProductCustomFieldsTable";
import ProductBuyBoxAttributes from "@/components/product/ProductBuyBoxAttributes";
import ProductKeyFeatures from "@/components/product/ProductKeyFeatures";
import FrequentlyBoughtTogether from "@/components/product/FrequentlyBoughtTogether";
import ProductCarouselSection from "@/components/product/ProductCarouselSection";
import ProductExpertBand from "@/components/product/ProductExpertBand";
import ProductReviewsPlaceholder from "@/components/product/ProductReviewsPlaceholder";
import WhatsInTheBoxSection from "@/components/product/WhatsInTheBoxSection";
import { IconArrowUturnLeft, IconCheckCircle, IconPhone, IconTruck } from "@/components/icons";

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  try {
    const res = await getProductByCode(decodeURIComponent(code));
    const p = res.data;
    if (p && isNonPurchasableStorefrontProduct(p)) {
      return { title: "Not found" };
    }
    const title = (p?.page_title && p.page_title.trim()) || p?.name || "Product";
    const site =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
    const primary = p && getPrimaryProductImagePath(p);
    const ogPath = primary
      ? `${site.replace(/\/$/, "")}/api/img?p=${encodeURIComponent(primary.replace(/^\//, ""))}`
      : null;
    return {
      title,
      description: `${p?.name} — ${p?.descrip?.replace(/<[^>]*>/g, "").slice(0, 140) || "Shop Cookshack products."}`,
      openGraph: site && ogPath ? { images: [{ url: ogPath }] } : undefined,
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { code } = await params;
  const productCode = decodeURIComponent(code);

  let product: Awaited<ReturnType<typeof getProductByCode>>["data"];
  let loadError: string | null = null;

  try {
    const res = await getProductByCode(productCode);
    product = res.data;
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Failed to load product";
  }

  if (loadError) {
    return (
      <>
        <CatalogHeroBand paddingClassName="py-3">
          <nav className="flex items-center gap-2 text-xs text-[#6B6B6B]">
            <Link href="/" className="hover:text-[#D52324] transition">
              Home
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-[#D52324] transition">
              Shop
            </Link>
            <span>/</span>
            <span className="text-[#9A9A9A]">Product</span>
          </nav>
        </CatalogHeroBand>
        <div className="min-h-[50vh] bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <p className="mb-3 font-heading font-bold uppercase tracking-wide text-[#1A1A1A]">Unable to load product</p>
            <p className="mb-6 mx-auto max-w-md text-[#6B6B6B]">{loadError}</p>
            <p className="mb-8 max-w-md mx-auto text-sm text-[#9A9A9A]">
              Copy your <code className="rounded bg-[#F5F5F5] px-1 text-xs">MIVA_*</code> values from{" "}
              <code className="rounded bg-[#F5F5F5] px-1 text-xs">.env.local</code> into Vercel (Production and
              Preview), then redeploy.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded bg-[#D52324] px-6 py-3 font-heading text-sm font-bold uppercase tracking-widest text-white transition hover:brightness-[0.94]"
            >
              Back to shop
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    notFound();
  }

  if (isNonPurchasableStorefrontProduct(product)) {
    notFound();
  }

  const proxyImg = (path: string) =>
    path
      ? `/api/img?p=${encodeURIComponent(path.startsWith("http") ? path : path.replace(/^\//, ""))}`
      : "";

  const images = getAllProductImagePaths(product)
    .filter(Boolean)
    .map(proxyImg);

  const inStock = product.inv1 === undefined || product.inv1 > 0;

  const allCustomRaw = getProductCustomFieldRows(product);
  const allCustomRows = allCustomRaw.filter((r) => !isSeoMetadataRow(r));
  const { specRows: specAfterBox, boxText } = partitionWhatsInTheBoxRows(allCustomRows);
  const specWithoutFeatures = specAfterBox.filter((r) => !isFeatureFieldRow(r));
  const featureCustomRows = allCustomRows.filter(isFeatureFieldRow);
  const { lines: featureLines, descripForLongCopy } = getProductFeatureData(product, featureCustomRows);
  const longDescrip = descripForLongCopy ?? product.descrip;

  const nativeDetailRows = getNativeProductDetailRows(product);
  const mergedForBuyBox = mergeDetailRows(specWithoutFeatures, nativeDetailRows).slice(0, 4);
  const specTableRows = mergeDetailRows(
    mergeDetailRows(specWithoutFeatures, nativeDetailRows),
    getProductDimensionRows(product)
  );

  const related = await getRelatedProducts(product.code, 20, product);
  let fbtCompanions = related.slice(0, 2);

  // When related() is still short, pull shelf-mates from the same Miva category / default category so the FBT block can populate.
  if (fbtCompanions.length < 2) {
    const taken = new Set(
      [product.code, ...fbtCompanions.map((p) => p.code)].map((c) => c.toLowerCase())
    );
    const addFromCategory = async (categoryCode: string) => {
      if (fbtCompanions.length >= 2) return;
      try {
        const res = await getCategoryProducts(categoryCode, { count: 32, sort: "disp_order" });
        for (const p of filterStorefrontProducts(res.data || [])) {
          if (fbtCompanions.length >= 2) break;
          const key = p.code.toLowerCase();
          if (taken.has(key)) continue;
          taken.add(key);
          fbtCompanions = [...fbtCompanions, p];
        }
      } catch {
        // ignore
      }
    };
    for (const c of product.categories ?? []) {
      if (c?.code) await addFromCategory(c.code);
    }
    if (fbtCompanions.length < 2 && product.cancat_code) {
      await addFromCategory(product.cancat_code);
    }
  }

  const fbtCodes = new Set(fbtCompanions.map((p) => p.code.toLowerCase()));
  const relatedForCarousels = related.filter((p) => !fbtCodes.has(p.code.toLowerCase()));
  const alsoViewed = relatedForCarousels.slice(0, 6);
  const moreToExplore = relatedForCarousels.slice(6, 14);

  const firstActiveCategory = product.categories?.find((c) => c?.code && c.active);

  return (
    <>
      <CatalogHeroBand paddingClassName="py-3">
        <nav className="flex items-center gap-2 text-xs text-[#6B6B6B]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#D52324] transition">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#D52324] transition">
            Shop
          </Link>
          <span>/</span>
          <span className="max-w-xs truncate text-[#9A9A9A]">{product.name}</span>
        </nav>
      </CatalogHeroBand>

      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          {/* Buy box — gallery + summary */}
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
            <ProductDetailGallery
              images={images}
              productName={product.name}
              productCode={product.code}
            />

            <div className="flex min-w-0 flex-col gap-5">
              <h1 className="font-heading text-2xl font-extrabold uppercase leading-tight tracking-wide text-[#1A1A1A] sm:text-3xl lg:text-4xl">
                {product.name}
              </h1>

              {product.categories && product.categories.length > 0 && (
                <p className="text-xs text-[#6B6B6B]">
                  {product.categories
                    .filter((c) => c.active && c.code)
                    .slice(0, 4)
                    .map((c, i) => (
                      <span key={c.code}>
                        {i > 0 && " · "}
                        <Link
                          href={`/category/${encodeURIComponent(c.code)}`}
                          className="font-heading font-bold uppercase tracking-wide text-[#D52324] hover:underline"
                        >
                          {c.name}
                        </Link>
                      </span>
                    ))}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4">
                <span className="font-heading text-4xl font-extrabold text-[#1A1A1A]">
                  {product.formatted_price || `$${product.price?.toFixed(2)}`}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded px-3 py-1 font-heading text-xs font-bold uppercase tracking-wider ${
                    inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"
                  }`}
                >
                  {inStock && <IconCheckCircle className="h-4 w-4 shrink-0" aria-hidden />}
                  {inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              <p className="text-sm text-[#6B6B6B]">
                Free shipping on many orders · Expert support{" "}
                <a href="tel:18004230698" className="whitespace-nowrap font-semibold text-[#D52324] hover:underline">
                  1-800-423-0698
                </a>
              </p>

              <ProductKeyFeatures lines={featureLines} />

              <div className="pt-1">
                <ProductBuyBoxAttributes
                  sku={product.sku}
                  weightLbs={product.weight > 0 ? product.weight : undefined}
                  customRows={mergedForBuyBox}
                />
              </div>

              <div className="border-t border-b border-[#E8E0D8] py-5">
                <AddToCartButton product={product} inStock={inStock} />
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {(
                  [
                    { Icon: IconTruck, label: "Free Shipping", sub: "On qualifying orders" },
                    { Icon: IconArrowUturnLeft, label: "Easy Returns", sub: "Hassle-free" },
                    { Icon: IconPhone, label: "Expert Support", sub: "Mon–Fri CT" },
                  ] as const
                ).map(({ Icon, label, sub }) => (
                  <div
                    key={label}
                    className="rounded border border-[#E8E0D8] bg-white p-2.5 text-center sm:p-3"
                  >
                    <div className="mb-1 flex justify-center text-[#D52324]">
                      <Icon className="h-6 w-6" aria-hidden />
                    </div>
                    <p className="font-heading text-[9px] font-bold uppercase tracking-wider text-[#1A1A1A] sm:text-[10px]">
                      {label}
                    </p>
                    <p className="mt-0.5 text-[8px] text-[#9A9A9A] sm:text-[9px]">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Full-width sections — reference-style PDP stack */}
          <div className="mt-12 space-y-12 sm:mt-16 sm:space-y-16">
            {fbtCompanions.length > 0 ? (
              <FrequentlyBoughtTogether main={product} companions={fbtCompanions} />
            ) : (
              <section
                className="border-t border-[#E8E0D8] pt-10"
                aria-labelledby="fbt-heading-empty"
              >
                <h2
                  id="fbt-heading-empty"
                  className="font-heading text-xl font-extrabold uppercase tracking-wider text-[#1A1A1A] sm:text-2xl"
                >
                  Frequently bought together
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-[#6B6B6B]">
                  We could not find other products in the same category to bundle with this item yet. Browse the shop or
                  your category to add compatible accessories and add-ons.
                </p>
                {firstActiveCategory ? (
                  <Link
                    href={`/category/${encodeURIComponent(firstActiveCategory.code)}`}
                    className="mt-5 inline-flex font-heading text-sm font-bold uppercase tracking-widest text-[#D52324] hover:underline"
                  >
                    Shop this category
                  </Link>
                ) : (
                  <Link
                    href="/shop"
                    className="mt-5 inline-flex font-heading text-sm font-bold uppercase tracking-widest text-[#D52324] hover:underline"
                  >
                    Continue shopping
                  </Link>
                )}
              </section>
            )}

            {alsoViewed.length > 0 && (
              <ProductCarouselSection
                sectionId="also-viewed"
                title="Customers also viewed"
                subtitle="More gear from the Cookshack catalog"
                products={alsoViewed}
              />
            )}

            <ProductExpertBand />

            {specTableRows.length > 0 && <ProductCustomFieldsTable rows={specTableRows} />}

            {boxText && <WhatsInTheBoxSection text={boxText} />}

            {longDescrip && longDescrip.trim().length > 0 && (
              <section className="border-t border-[#E8E0D8] pt-10" aria-label="Product description">
                <h2 className="font-heading text-xl font-extrabold uppercase tracking-wider text-[#1A1A1A] sm:text-2xl">
                  Product details
                </h2>
                <div
                  className="prose prose-sm mt-6 max-w-none text-[#3D3D3D] sm:prose-base prose-headings:font-heading prose-headings:uppercase prose-headings:tracking-wide prose-a:text-[#D52324] prose-a:no-underline hover:prose-a:underline"
                  dangerouslySetInnerHTML={{ __html: longDescrip }}
                />
              </section>
            )}

            <ProductReviewsPlaceholder />

            {moreToExplore.length > 0 && (
              <ProductCarouselSection
                sectionId="more-explore"
                title="More to explore"
                products={moreToExplore}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
