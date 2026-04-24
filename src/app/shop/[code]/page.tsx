import type { Metadata } from "next";
import type { MivaProduct } from "@/types/miva";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getCategoryProducts,
  getProductByCode,
  getRelatedProducts,
  getShelfMateCompanionsFromCatalog,
} from "@/lib/miva-client";
import {
  getProductCustomFieldRows,
  isFeatureFieldRow,
  isSeoMetadataRow,
  partitionWhatsInTheBoxRows,
} from "@/lib/miva-custom-fields";
import { getProductDimensionRows } from "@/lib/miva-product-dimensions";
import { getProductFeatureData } from "@/lib/miva-product-features";
import {
  filterNativeRowsForStorefrontPdp,
  getNativeProductDetailRows,
  mergeDetailRows,
} from "@/lib/miva-native-product-details";
import { getAllProductImagePaths, getPrimaryProductImagePath } from "@/lib/miva-product-images";
import {
  filterStorefrontProducts,
  isNonPurchasableStorefrontProduct,
  isPdpRelatedPair,
} from "@/lib/miva-storefront-visibility";
import AddToCartButton from "./AddToCartButton";
import PdpBreadcrumb from "@/components/product/PdpBreadcrumb";
import PdpProductRatingLine from "@/components/product/PdpProductRatingLine";
import ProductDetailGallery from "@/components/product/ProductDetailGallery";
import ProductCustomFieldsTable from "@/components/product/ProductCustomFieldsTable";
import ProductBuyBoxAttributes from "@/components/product/ProductBuyBoxAttributes";
import ProductKeyFeatures from "@/components/product/ProductKeyFeatures";
import FrequentlyBoughtTogether from "@/components/product/FrequentlyBoughtTogether";
import ProductCarouselSection from "@/components/product/ProductCarouselSection";
import ProductExpertBand from "@/components/product/ProductExpertBand";
import ProductReviewsPlaceholder from "@/components/product/ProductReviewsPlaceholder";
import WhatsInTheBoxSection from "@/components/product/WhatsInTheBoxSection";
import AffirmProductMessaging from "@/components/product/AffirmProductMessaging";
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
        <PdpBreadcrumb productName="Product" />
        <div className="min-h-[50vh] bg-[#F3F3F3]">
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

  /* Native Miva fields include useful rows (categories, options, ship-box dims) and admin rows we hide on PDP. */
  const nativeDetailRows = filterNativeRowsForStorefrontPdp(getNativeProductDetailRows(product));
  const mergedForBuyBox = mergeDetailRows(specWithoutFeatures, nativeDetailRows).slice(0, 4);
  const specTableRows = mergeDetailRows(
    mergeDetailRows(specWithoutFeatures, nativeDetailRows),
    getProductDimensionRows(product)
  );

  /** Same category on the PDP — used to group FBT with other members of that Miva category. */
  const firstActiveCategory = product.categories?.find((c) => c?.code && c.active);

  const fbtCompanions: MivaProduct[] = [];
  let fbtIncludedCategorySkus = false;
  const fbtSeen = new Set<string>([product.code.toLowerCase()]);
  const pushFbt = (p: MivaProduct, fromCategoryList: boolean) => {
    if (fbtCompanions.length >= 2) return;
    const key = p.code.toLowerCase();
    if (fbtSeen.has(key)) return;
    fbtSeen.add(key);
    fbtCompanions.push(p);
    if (fromCategoryList) fbtIncludedCategorySkus = true;
  };

  // 1) Primary: other purchasable SKUs in the same category(ies) as this product (Miva grouping).
  for (const c of product.categories ?? []) {
    if (!c?.code || fbtCompanions.length >= 2) break;
    try {
      const res = await getCategoryProducts(c.code, { count: 48, sort: "disp_order" });
      for (const p of filterStorefrontProducts(res.data || [])) {
        if (fbtCompanions.length >= 2) break;
        if (p.code.toLowerCase() === product.code.toLowerCase()) continue;
        pushFbt(p, true);
      }
    } catch {
      // ignore
    }
  }
  if (fbtCompanions.length < 2 && product.cancat_code) {
    const cancat = product.cancat_code;
    const alreadyQueried = (product.categories ?? []).some(
      (c) => c?.code && c.code.toLowerCase() === cancat.toLowerCase()
    );
    if (!alreadyQueried) {
      try {
        const res = await getCategoryProducts(cancat, { count: 48, sort: "disp_order" });
        for (const p of filterStorefrontProducts(res.data || [])) {
          if (fbtCompanions.length >= 2) break;
          if (p.code.toLowerCase() === product.code.toLowerCase()) continue;
          pushFbt(p, true);
        }
      } catch {
        // ignore
      }
    }
  }

  // 2) Top up from related (admin + same-category engine) if the category list did not yield two companions.
  const related = await getRelatedProducts(product.code, 20, product);
  if (fbtCompanions.length < 2) {
    for (const p of related) {
      if (fbtCompanions.length >= 2) break;
      pushFbt(p, false);
    }
  }

  // 3) Full-catalog scan — same JSON as PDP; per-category API often returns 0 peers even when
  //    other SKUs share category/cancat on the cached product list.
  if (fbtCompanions.length === 0) {
    for (const p of await getShelfMateCompanionsFromCatalog(product, 2)) {
      if (fbtCompanions.length >= 2) break;
      pushFbt(p, false);
    }
    if (fbtCompanions.length > 0) {
      const anySameCollection = fbtCompanions.some((c) => isPdpRelatedPair(product, c));
      if (anySameCollection) fbtIncludedCategorySkus = true;
    }
  }

  const fbtCodes = new Set(fbtCompanions.map((p) => p.code.toLowerCase()));
  const relatedForCarousels = related.filter((p) => !fbtCodes.has(p.code.toLowerCase()));
  const alsoViewed = relatedForCarousels.slice(0, 6);
  const moreToExplore = relatedForCarousels.slice(6, 14);

  let fbtGroup: { name: string; href: string } | undefined;
  if (fbtCompanions.length > 0) {
    if (fbtIncludedCategorySkus && firstActiveCategory) {
      fbtGroup = {
        name: firstActiveCategory.name,
        href: `/category/${encodeURIComponent(firstActiveCategory.code)}`,
      };
    } else if (fbtIncludedCategorySkus && !firstActiveCategory && product.cancat_code) {
      fbtGroup = {
        name: "This category",
        href: `/category/${encodeURIComponent(product.cancat_code)}`,
      };
    } else if (
      fbtCompanions.some((c) => isPdpRelatedPair(product, c)) &&
      firstActiveCategory
    ) {
      fbtGroup = {
        name: firstActiveCategory.name,
        href: `/category/${encodeURIComponent(firstActiveCategory.code)}`,
      };
    }
  }

  return (
    <>
      <PdpBreadcrumb productName={product.name} />

      <div className="min-h-screen bg-[#F3F3F3]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
          <div className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm sm:p-6 lg:grid lg:grid-cols-2 lg:gap-8 lg:p-8">
            <ProductDetailGallery
              images={images}
              productName={product.name}
              productCode={product.code}
              productSku={product.sku}
            />

            <div className="mt-6 flex min-w-0 flex-col gap-4 sm:mt-0 lg:gap-4">
              {product.categories && product.categories.length > 0 && (
                <p className="text-sm text-[#D52324]">
                  {product.categories
                    .filter((c) => c.active && c.code)
                    .slice(0, 4)
                    .map((c, i) => (
                      <span key={c.code}>
                        {i > 0 && " · "}
                        <Link
                          href={`/category/${encodeURIComponent(c.code)}`}
                          className="font-medium hover:underline"
                        >
                          {c.name}
                        </Link>
                      </span>
                    ))}
                </p>
              )}

              <h1 className="text-xl font-bold leading-snug text-[#0F1111] sm:text-2xl lg:text-[1.75rem] lg:leading-tight">
                {product.name}
              </h1>

              <PdpProductRatingLine product={product} />

              <div className="h-px w-full bg-neutral-200" aria-hidden />

              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-bold tabular-nums text-[#0F1111] sm:text-4xl">
                  {product.formatted_price || `$${product.price?.toFixed(2)}`}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded px-2.5 py-0.5 text-sm font-bold ${
                    inStock ? "bg-[#B7D6B7] text-[#0F5132]" : "bg-red-100 text-red-800"
                  }`}
                >
                  {inStock && <IconCheckCircle className="h-4 w-4 shrink-0" aria-hidden />}
                  {inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              <AffirmProductMessaging
                className="mt-1"
                amountCents={Math.max(0, Math.round((product.price ?? 0) * 100))}
                sku={product.sku?.trim() || product.code}
              />

              <p className="text-sm text-[#565959]">
                <span className="font-medium text-[#0F1111]">FREE shipping</span> on many qualifying orders to the lower
                48.
              </p>
              <p className="text-sm text-[#565959]">
                Questions?{" "}
                <a
                  href="tel:18004230698"
                  className="font-semibold text-[#D52324] hover:underline"
                >
                  1-800-423-0698
                </a>{" "}
                · Expert support
              </p>

              <div className="h-px w-full bg-neutral-200" aria-hidden />

              <ProductKeyFeatures lines={featureLines} />

              <div>
                <ProductBuyBoxAttributes
                  sku={product.sku}
                  weightLbs={product.weight > 0 ? product.weight : undefined}
                  customRows={mergedForBuyBox}
                />
              </div>

              <div className="pt-1">
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
                    className="rounded border border-neutral-200 bg-[#F7F8F8] p-2 text-center sm:p-2.5"
                  >
                    <div className="mb-0.5 flex justify-center text-[#D52324]">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <p className="text-[8px] font-bold uppercase leading-tight tracking-wider text-[#0F1111] sm:text-[9px]">
                      {label}
                    </p>
                    <p className="mt-0.5 text-[7px] text-[#565959] sm:text-[8px]">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-4 sm:mt-5 sm:space-y-5">
            {fbtCompanions.length > 0 ? (
              <FrequentlyBoughtTogether main={product} companions={fbtCompanions} group={fbtGroup} />
            ) : (
              <section
                className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm sm:p-6"
                aria-labelledby="fbt-heading-empty"
              >
                <h2
                  id="fbt-heading-empty"
                  className="text-lg font-bold text-[#0F1111] sm:text-xl"
                >
                  Frequently bought together
                </h2>
                <div className="mt-2 h-0.5 w-12 bg-[#D52324]" aria-hidden />
                <p className="mt-3 max-w-2xl text-sm text-[#565959]">
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
              <section
                className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm sm:p-6"
                aria-label="Product description"
              >
                <h2 className="text-lg font-bold text-[#0F1111] sm:text-xl">Product details</h2>
                <div className="mt-2 h-0.5 w-12 bg-[#D52324]" aria-hidden />
                <div
                  className="prose prose-sm mt-5 max-w-none text-[#0F1111] sm:prose-base prose-headings:font-bold prose-a:text-[#D52324] prose-a:no-underline hover:prose-a:underline"
                  dangerouslySetInnerHTML={{ __html: longDescrip }}
                />
              </section>
            )}

            <ProductReviewsPlaceholder product={product} />

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
