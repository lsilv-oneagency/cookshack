"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import ProductImage from "@/components/ProductImage";
import { IconShoppingCart } from "@/components/icons";

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
        className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-[#E8E0D8] bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E0D8] px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-xl font-bold tracking-wider text-[#1A1A1A] uppercase">
              Your Cart
            </h2>
            {itemCount > 0 && (
              <span className="rounded-full bg-[#D52324] px-2 py-0.5 text-xs font-bold text-white">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="rounded p-2 text-[#6B6B6B] transition hover:bg-[#F0EBE3] hover:text-[#1A1A1A]"
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
            <div className="flex h-full flex-col items-center justify-center gap-5 py-16 text-center">
              <IconShoppingCart className="h-16 w-16 text-[#D52324]" aria-hidden />
              <div>
                <p className="font-heading text-lg font-bold tracking-wide text-[#1A1A1A] uppercase">
                  Your cart is empty
                </p>
                <p className="mt-1 text-sm text-[#6B6B6B]">Add some Cookshack products!</p>
              </div>
              <button
                onClick={closeCart}
                className="px-6 py-2.5 bg-[#D52324] text-white text-xs font-heading font-bold tracking-widest uppercase hover:brightness-[0.94] transition rounded"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => {
              const rawImg = (item.product_image || item.product_thumbnail || "").trim();

              return (
                <div
                  key={item.product_code}
                  className="flex gap-4 rounded-lg border border-[#E8E0D8] bg-[#FAFAFA] p-3"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded border border-[#E8E0D8] bg-white">
                    <ProductImage
                      src={rawImg || undefined}
                      alt={item.product_name}
                      productCode={item.product_code}
                      productName={item.product_name}
                      fill
                      className="object-contain p-1.5"
                      sizes="80px"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/shop/${item.product_code}`}
                      onClick={closeCart}
                      className="line-clamp-2 font-heading text-sm font-bold uppercase leading-snug tracking-wide text-[#1A1A1A] transition hover:text-[#D52324]"
                    >
                      {item.product_name}
                    </Link>
                    {item.product_sku && (
                      <p className="text-[10px] text-[#6B6B6B] font-mono mt-0.5">{item.product_sku}</p>
                    )}
                    <p className="text-sm font-bold text-[#D52324] mt-1">{item.product_formatted_price}</p>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center overflow-hidden rounded border border-[#D4C8BE] bg-white">
                        <button
                          onClick={() => updateQty(item.product_code, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center text-sm font-bold text-[#6B6B6B] transition hover:bg-[#F0EBE3] hover:text-[#1A1A1A]"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-[#1A1A1A]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.product_code, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center text-sm font-bold text-[#6B6B6B] transition hover:bg-[#F0EBE3] hover:text-[#1A1A1A]"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#1A1A1A]">
                          ${item.total.toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeItem(item.product_code)}
                          className="p-1 text-[#9A9A9A] transition hover:text-red-600"
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
          <div className="space-y-4 border-t border-[#E8E0D8] bg-white px-6 py-5">
            <div className="flex items-center justify-between">
              <span className="font-heading text-sm uppercase tracking-wider text-[#6B6B6B]">Subtotal</span>
              <span className="font-heading text-2xl font-extrabold text-[#1A1A1A]">
                ${total.toFixed(2)}
              </span>
            </div>
            <p className="text-center text-xs text-[#6B6B6B]">
              Shipping & taxes calculated at checkout
            </p>
            <a
              href={`${storeUrl}/checkout`}
              className="block w-full rounded bg-[#D52324] py-4 text-center font-heading text-sm font-bold uppercase tracking-widest text-white transition-all hover:brightness-[0.94] active:scale-[0.98]"
            >
              Proceed to Checkout
            </a>
            <Link
              href="/cart"
              onClick={closeCart}
              className="block w-full py-3 text-center font-heading text-xs font-bold uppercase tracking-widest text-[#6B6B6B] transition hover:text-[#D52324]"
            >
              View Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
