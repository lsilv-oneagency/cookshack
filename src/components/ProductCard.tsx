"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import ProductImage from "./ProductImage";
import type { MivaProduct } from "@/types/miva";

interface ProductCardProps {
  product: MivaProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, isLoading } = useCart();
  const [adding, setAdding] = useState(false);
  const [imgError] = useState(false);

  // Build a proxied image URL when the API provides one.
  // ProductImage will also try the code-based path automatically if this is empty.
  const rawImg = product.image || product.thumbnail || "";
  const imageUrl = rawImg
    ? `/api/img?p=${encodeURIComponent(rawImg.startsWith("http") ? rawImg : rawImg.replace(/^\//, ""))}`
    : undefined;

  const inStock = product.inv1 === undefined || product.inv1 > 0;

  void imgError; // kept for future real-image error tracking

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (adding || isLoading || !inStock) return;
    setAdding(true);
    try {
      await addItem({
        product_code: product.code,
        product_name: product.name,
        product_sku: product.sku,
        product_price: product.price,
        product_formatted_price: product.formatted_price,
        product_image: rawImg,
        product_thumbnail: product.thumbnail || "",
        quantity: 1,
      });
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link
      href={`/shop/${product.code}`}
      className="group flex flex-col bg-white border border-[#E8E0D8] hover:border-[#E85D04] shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden rounded"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <ProductImage
          src={imageUrl}
          alt={product.name}
          productCode={product.code}
          productName={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
        />

        {!inStock && (
          <div className="absolute top-2 left-2 bg-[#6B6B6B] text-white text-[10px] font-heading font-bold tracking-wider uppercase px-2 py-1 rounded">
            Out of Stock
          </div>
        )}

        {/* Quick-add hover overlay on desktop */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3 hidden sm:flex items-end">
          <button
            onClick={handleAdd}
            disabled={adding || !inStock}
            className="w-full py-2 bg-[#E85D04] text-white text-xs font-heading font-bold tracking-widest uppercase hover:bg-[#C44A00] transition disabled:opacity-50 disabled:cursor-not-allowed rounded flex items-center justify-center gap-2"
          >
            {adding ? (
              <>
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Adding...
              </>
            ) : (
              <>Add to Cart</>
            )}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {product.sku && (
          <p className="text-[10px] text-[#9A9A9A] font-mono tracking-wider">SKU: {product.sku}</p>
        )}
        <h3 className="text-sm font-heading font-bold tracking-wide text-[#1A1A1A] uppercase leading-snug line-clamp-2 group-hover:text-[#E85D04] transition">
          {product.name}
        </h3>

        {product.descrip && (
          <p className="text-xs text-[#6B6B6B] line-clamp-2 leading-relaxed hidden sm:block font-body">
            {product.descrip.replace(/<[^>]*>/g, "")}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="font-heading font-extrabold text-lg text-[#1A1A1A]">
            {product.formatted_price || `$${product.price?.toFixed(2)}`}
          </span>
          {/* Mobile add button */}
          <button
            onClick={handleAdd}
            disabled={adding || isLoading || !inStock}
            className="sm:hidden flex items-center gap-1 px-3 py-1.5 text-[10px] font-heading font-bold tracking-widest uppercase bg-[#E85D04] text-white rounded hover:bg-[#C44A00] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {adding ? (
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <>+ Add</>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
