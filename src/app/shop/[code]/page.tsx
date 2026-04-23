import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProductByCode, getProducts } from "@/lib/miva-client";
import AddToCartButton from "./AddToCartButton";
import ProductImage from "@/components/ProductImage";
import ProductCard from "@/components/ProductCard";
import CatalogHeroBand from "@/components/CatalogHeroBand";
import { IconArrowUturnLeft, IconCheckCircle, IconPhone, IconTruck } from "@/components/icons";

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  try {
    const res = await getProductByCode(decodeURIComponent(code));
    const p = res.data;
    return {
      title: p?.name || "Product",
      description: `${p?.name} — ${p?.descrip?.replace(/<[^>]*>/g, "").slice(0, 140) || "Shop Cookshack products."}`,
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { code } = await params;

  let product: Awaited<ReturnType<typeof getProductByCode>>["data"];
  try {
    const res = await getProductByCode(decodeURIComponent(code));
    product = res.data;
  } catch {
    notFound();
  }

  if (!product) notFound();

  const proxyImg = (path: string) =>
    path
      ? `/api/img?p=${encodeURIComponent(path.startsWith("http") ? path : path.replace(/^\//, ""))}`
      : "";

  const images = [product.image, ...(product.productimagedata?.map((i) => i.image) || [])]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .map(proxyImg);

  const mainImage = images[0];
  const inStock = product.inv1 === undefined || product.inv1 > 0;

  let related: Awaited<ReturnType<typeof getProducts>>["data"] = [];
  try {
    const res = await getProducts({ count: 5 });
    related = (res.data || []).filter((p) => p.code !== product!.code).slice(0, 4);
  } catch {}

  return (
    <>
      {/* Breadcrumb bar */}
      <CatalogHeroBand paddingClassName="py-3">
        <nav className="flex items-center gap-2 text-xs text-[#6B6B6B]">
          <Link href="/" className="hover:text-[#AE1B07] transition">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#AE1B07] transition">Shop</Link>
          <span>/</span>
          <span className="text-[#9A9A9A] truncate max-w-xs">{product.name}</span>
        </nav>
      </CatalogHeroBand>

      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid lg:grid-cols-2 gap-10 xl:gap-16">

            {/* ── Images ── */}
            <div className="space-y-3">
              <div className="relative aspect-square bg-white border border-[#E8E0D8] rounded overflow-hidden">
                <ProductImage
                  src={mainImage}
                  alt={product.name}
                  productCode={product.code}
                  productName={product.name}
                  fill
                  className="object-contain p-6"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(0, 4).map((img, i) => (
                    <div
                      key={i}
                      className="relative aspect-square bg-white border border-[#E8E0D8] rounded overflow-hidden hover:border-[#AE1B07] transition cursor-pointer"
                    >
                      <Image
                        src={img}
                        alt={`${product.name} view ${i + 1}`}
                        fill
                        className="object-contain p-2"
                        sizes="120px"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Details ── */}
            <div className="flex flex-col gap-5">
              {product.sku && (
                <p className="text-xs text-[#9A9A9A] font-mono tracking-wider">SKU: {product.sku}</p>
              )}

              <h1 className="font-heading font-extrabold text-[#1A1A1A] text-2xl sm:text-3xl lg:text-4xl tracking-wider uppercase leading-tight">
                {product.name}
              </h1>

              {/* Price + stock */}
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-heading font-extrabold text-4xl text-[#1A1A1A]">
                  {product.formatted_price || `$${product.price?.toFixed(2)}`}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-heading font-bold tracking-wider uppercase px-3 py-1 rounded ${
                    inStock
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {inStock && <IconCheckCircle className="w-4 h-4 shrink-0" aria-hidden />}
                  {inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              {product.weight > 0 && (
                <p className="text-sm text-[#6B6B6B]">
                  Weight:{" "}
                  <span className="font-semibold text-[#3D3D3D]">{product.weight} lbs</span>
                </p>
              )}

              {/* Add to cart */}
              <div className="border-t border-b border-[#E8E0D8] py-5">
                <AddToCartButton product={product} inStock={inStock} />
              </div>

              {/* Trust signals */}
              <div className="grid grid-cols-3 gap-3">
                {(
                  [
                    { Icon: IconTruck, label: "Free Shipping", sub: "On qualifying orders" },
                    { Icon: IconArrowUturnLeft, label: "Easy Returns", sub: "30-day guarantee" },
                    { Icon: IconPhone, label: "Expert Support", sub: "1-800-423-0698" },
                  ] as const
                ).map(({ Icon, label, sub }) => (
                  <div key={label} className="bg-white border border-[#E8E0D8] rounded p-3 text-center">
                    <div className="flex justify-center mb-1 text-[#AE1B07]">
                      <Icon className="w-6 h-6" aria-hidden />
                    </div>
                    <p className="text-[10px] font-heading font-bold text-[#1A1A1A] uppercase tracking-wider">{label}</p>
                    <p className="text-[9px] text-[#9A9A9A] mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              {product.descrip && (
                <div className="border-t border-[#E8E0D8] pt-5">
                  <h2 className="font-heading font-bold text-[#1A1A1A] text-lg tracking-wider uppercase mb-3">
                    Description
                  </h2>
                  <div
                    className="prose prose-sm max-w-none text-[#3D3D3D] leading-relaxed prose-headings:font-heading prose-headings:uppercase prose-headings:tracking-wide prose-a:text-[#AE1B07] prose-a:no-underline hover:prose-a:underline"
                    dangerouslySetInnerHTML={{ __html: product.descrip }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── Related Products ── */}
          {related.length > 0 && (
            <section className="mt-20">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#1A1A1A] tracking-wider uppercase">
                    You Might Also Like
                  </h2>
                  <div className="w-12 h-1 bg-[#AE1B07] mt-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
                {related.map((p) => (
                  <ProductCard key={p.code} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
