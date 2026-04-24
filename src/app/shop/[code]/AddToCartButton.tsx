"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { getAllProductImagePaths } from "@/lib/miva-product-images";
import type { MivaProduct } from "@/types/miva";

interface Props {
  product: MivaProduct;
  inStock: boolean;
}

export default function AddToCartButton({ product, inStock }: Props) {
  const { addItem, isLoading } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    if (adding || !inStock) return;
    setAdding(true);
    try {
      const paths = getAllProductImagePaths(product);
      await addItem({
        product_code: product.code,
        product_name: product.name,
        product_sku: product.sku,
        product_price: product.price,
        product_formatted_price: product.formatted_price,
        product_image: paths[0] || product.image || "",
        product_thumbnail: paths[1] || paths[0] || product.thumbnail || "",
        quantity,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-4 rounded-md border border-neutral-200 bg-[#FEFEFE] p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-bold text-[#0F1111]">Quantity</span>
        <div className="flex h-8 items-center overflow-hidden rounded-md border border-neutral-300 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="flex h-full w-8 items-center justify-center text-[#0F1111] transition hover:bg-neutral-100"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="min-w-9 px-1 text-center text-sm font-bold tabular-nums text-[#0F1111]">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="flex h-full w-8 items-center justify-center text-[#0F1111] transition hover:bg-neutral-100"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleAdd}
        disabled={adding || isLoading || !inStock}
        className={`flex w-full items-center justify-center gap-2 rounded-full py-3 text-base font-bold shadow-sm transition active:scale-[0.99] ${
          added
            ? "bg-green-700 text-white"
            : inStock
              ? "bg-[#D52324] text-white hover:brightness-[0.95]"
              : "cursor-not-allowed bg-neutral-200 text-[#6B6B6B]"
        }`}
      >
        {adding ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Adding to Cart...
          </>
        ) : added ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Added to Cart!
          </>
        ) : !inStock ? (
          "Out of Stock"
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Add to Cart
          </>
        )}
      </button>

      {/* Phone CTA */}
      <p className="text-xs text-[#9A9A9A] text-center">
        Questions?{" "}
        <a href="tel:18004230698" className="text-[#D52324] font-semibold hover:underline transition">
          Call 1-800-423-0698
        </a>
      </p>
    </div>
  );
}
