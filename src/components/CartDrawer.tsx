"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { mivaImgUrl } from "@/components/ProductImage";
import { IconPhoto, IconShoppingCart } from "@/components/icons";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, total, itemCount } = useCart();
  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || "";

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeCart]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-[#111111] flex flex-col shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2B2B2B]">
          <div className="flex items-center gap-3">
            <h2 className="font-heading font-bold text-white text-xl tracking-wider uppercase">
              Your Cart
            </h2>
            {itemCount > 0 && (
              <span className="bg-[#E85D05] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 text-[#6B6B6B] hover:text-white hover:bg-[#2B2B2B] rounded transition"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-5 py-16">
              <IconShoppingCart className="w-16 h-16 text-[#E85D05]" aria-hidden />
              <div>
                <p className="font-heading font-bold text-white text-lg tracking-wide uppercase">
                  Your cart is empty
                </p>
                <p className="text-sm text-[#6B6B6B] mt-1">Add some Cookshack products!</p>
              </div>
              <button
                onClick={closeCart}
                className="px-6 py-2.5 bg-[#E85D05] text-white text-xs font-heading font-bold tracking-widest uppercase hover:bg-[#C44A00] transition rounded"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => {
              const rawImg = (item.product_image || item.product_thumbnail || "").trim();
              const imgUrl = rawImg ? mivaImgUrl(rawImg) : "";

              return (
                <div key={item.product_code} className="flex gap-4 p-3 bg-[#1A1A1A] border border-[#2B2B2B] rounded">
                  {/* Image */}
                  <div className="relative w-20 h-20 flex-shrink-0 bg-[#2B2B2B] rounded overflow-hidden">
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={item.product_name}
                        fill
                        className="object-contain p-1.5"
                        sizes="80px"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#6B6B6B]">
                        <IconPhoto className="w-8 h-8" aria-hidden />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/shop/${item.product_code}`}
                      onClick={closeCart}
                      className="text-sm font-heading font-bold text-white uppercase tracking-wide line-clamp-2 hover:text-[#E85D05] transition leading-snug"
                    >
                      {item.product_name}
                    </Link>
                    {item.product_sku && (
                      <p className="text-[10px] text-[#6B6B6B] font-mono mt-0.5">{item.product_sku}</p>
                    )}
                    <p className="text-sm font-bold text-[#E85D05] mt-1">{item.product_formatted_price}</p>

                    <div className="flex items-center justify-between mt-2">
                      {/* Qty */}
                      <div className="flex items-center border border-[#3D3D3D] rounded overflow-hidden bg-[#2B2B2B]">
                        <button
                          onClick={() => updateQty(item.product_code, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-[#9A9A9A] hover:text-white hover:bg-[#3D3D3D] transition text-sm font-bold"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.product_code, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-[#9A9A9A] hover:text-white hover:bg-[#3D3D3D] transition text-sm font-bold"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">${item.total.toFixed(2)}</span>
                        <button
                          onClick={() => removeItem(item.product_code)}
                          className="p-1 text-[#3D3D3D] hover:text-red-400 transition"
                          aria-label="Remove"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#2B2B2B] px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#9A9A9A] font-heading uppercase tracking-wider">Subtotal</span>
              <span className="font-heading font-extrabold text-2xl text-white">${total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-[#6B6B6B] text-center">
              Shipping & taxes calculated at checkout
            </p>
            <a
              href={`${storeUrl}/checkout`}
              className="block w-full py-4 text-center bg-[#E85D05] text-white font-heading font-bold tracking-widest uppercase text-sm hover:bg-[#C44A00] active:scale-[0.98] transition-all rounded"
            >
              Proceed to Checkout
            </a>
            <Link
              href="/cart"
              onClick={closeCart}
              className="block w-full py-3 text-center text-xs font-heading font-bold tracking-widest uppercase text-[#9A9A9A] hover:text-white transition"
            >
              View Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
