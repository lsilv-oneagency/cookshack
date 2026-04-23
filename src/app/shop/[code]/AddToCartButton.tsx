"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
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
      await addItem({
        product_code: product.code,
        product_name: product.name,
        product_sku: product.sku,
        product_price: product.price,
        product_formatted_price: product.formatted_price,
        product_image: product.image || "",
        product_thumbnail: product.thumbnail || "",
        quantity,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quantity */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-heading font-bold text-[#1A1A1A] tracking-wide uppercase">
          Qty
        </span>
        <div className="flex items-center border border-[#D4C8BE] rounded overflow-hidden bg-white">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 flex items-center justify-center text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F0EBE3] transition font-bold text-xl"
          >
            −
          </button>
          <span className="w-12 text-center font-bold text-[#1A1A1A] text-base">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 flex items-center justify-center text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F0EBE3] transition font-bold text-xl"
          >
            +
          </button>
        </div>
      </div>

      {/* Add to cart button */}
      <button
        onClick={handleAdd}
        disabled={adding || isLoading || !inStock}
        className={`w-full py-4 font-heading font-bold text-base tracking-widest uppercase transition-all active:scale-[0.98] flex items-center justify-center gap-2 rounded ${
          added
            ? "bg-green-700 text-white"
            : inStock
            ? "bg-[#AE1B07] text-white hover:bg-[#8E1405]"
            : "bg-[#D4C8BE] text-[#9A9A9A] cursor-not-allowed"
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
        <a href="tel:18004230698" className="text-[#AE1B07] font-semibold hover:text-[#8E1405] transition">
          Call 1-800-423-0698
        </a>
      </p>
    </div>
  );
}
