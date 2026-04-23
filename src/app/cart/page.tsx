"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { mivaImgUrl } from "@/components/ProductImage";
import CatalogHeroBand from "@/components/CatalogHeroBand";
import { IconLockClosed, IconPhone, IconPhoto, IconShoppingCart } from "@/components/icons";

export default function CartPage() {
  const { items, removeItem, updateQty, total, clearCart } = useCart();
  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || "";

  return (
    <>
      <CatalogHeroBand paddingClassName="py-10">
        <nav className="flex items-center gap-2 text-xs text-[#6B6B6B] mb-4">
          <Link href="/" className="hover:text-[#AE1B07] transition">Home</Link>
          <span>/</span>
          <span className="text-[#9A9A9A]">Cart</span>
        </nav>
        <div className="flex items-center justify-between">
          <h1 className="font-heading font-extrabold text-white text-4xl sm:text-5xl tracking-wider uppercase">
            Shopping Cart
          </h1>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-[#6B6B6B] hover:text-red-400 transition font-medium"
            >
              Clear Cart
            </button>
          )}
        </div>
      </CatalogHeroBand>

      <div className="bg-white min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {items.length === 0 ? (
            <div className="text-center py-24">
              <IconShoppingCart className="w-20 h-20 mx-auto mb-6 text-[#AE1B07]" aria-hidden />
              <h2 className="font-heading font-extrabold text-[#1A1A1A] text-2xl tracking-wider uppercase mb-2">
                Your Cart is Empty
              </h2>
              <p className="text-[#6B6B6B] mb-8 text-sm">
                Looks like you haven&apos;t added anything yet.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#AE1B07] text-white font-heading font-bold tracking-widest uppercase text-sm hover:bg-[#8E1405] transition rounded"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Items list */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => {
                  const rawImg = (item.product_image || item.product_thumbnail || "").trim();
                  const imgUrl = rawImg ? mivaImgUrl(rawImg) : "";

                  return (
                    <div key={item.product_code} className="flex gap-5 p-5 bg-white border border-[#E8E0D8] rounded shadow-sm hover:border-[#AE1B07]/30 transition">
                      <div className="relative w-24 h-24 flex-shrink-0 bg-white border border-[#E8E0D8] rounded overflow-hidden">
                        {imgUrl ? (
                          <Image
                            src={imgUrl}
                            alt={item.product_name}
                            fill
                            className="object-contain p-2"
                            sizes="96px"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#F0EBE3] text-[#9A9A9A]">
                            <IconPhoto className="w-10 h-10" aria-hidden />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/shop/${item.product_code}`}
                          className="text-sm font-heading font-bold text-[#1A1A1A] uppercase tracking-wide hover:text-[#AE1B07] transition line-clamp-2 leading-snug"
                        >
                          {item.product_name}
                        </Link>
                        {item.product_sku && (
                          <p className="text-[10px] text-[#9A9A9A] font-mono mt-0.5">{item.product_sku}</p>
                        )}
                        <p className="text-sm font-bold text-[#AE1B07] mt-1">{item.product_formatted_price}</p>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-[#D4C8BE] rounded overflow-hidden bg-white">
                            <button
                              onClick={() => updateQty(item.product_code, item.quantity - 1)}
                              className="w-9 h-9 flex items-center justify-center text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#E8E0D8] transition font-bold"
                            >
                              −
                            </button>
                            <span className="w-10 text-center text-sm font-bold text-[#1A1A1A]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQty(item.product_code, item.quantity + 1)}
                              className="w-9 h-9 flex items-center justify-center text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#E8E0D8] transition font-bold"
                            >
                              +
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-heading font-extrabold text-lg text-[#1A1A1A]">
                              ${item.total.toFixed(2)}
                            </span>
                            <button
                              onClick={() => removeItem(item.product_code)}
                              className="p-1.5 text-[#C4B9AE] hover:text-red-500 hover:bg-red-50 rounded transition"
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
                })}
              </div>

              {/* Order summary */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-[#E8E0D8] rounded shadow-sm p-6 sticky top-24">
                  <h2 className="font-heading font-bold text-[#1A1A1A] text-lg tracking-wider uppercase mb-5 pb-3 border-b border-[#E8E0D8]">
                    Order Summary
                  </h2>

                  <div className="space-y-2.5 text-sm mb-5">
                    {items.map((item) => (
                      <div key={item.product_code} className="flex justify-between text-[#6B6B6B]">
                        <span className="line-clamp-1 mr-2 flex-1">{item.product_name} × {item.quantity}</span>
                        <span className="flex-shrink-0 font-medium text-[#3D3D3D]">${item.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#E8E0D8] pt-4 mb-5">
                    <div className="flex justify-between items-center">
                      <span className="font-heading font-bold text-[#1A1A1A] uppercase tracking-wide text-sm">Subtotal</span>
                      <span className="font-heading font-extrabold text-2xl text-[#1A1A1A]">${total.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-[#9A9A9A] mt-1">
                      Shipping & taxes calculated at checkout
                    </p>
                  </div>

                  <a
                    href={`${storeUrl}/checkout`}
                    className="block w-full py-4 text-center bg-[#AE1B07] text-white font-heading font-bold tracking-widest uppercase text-sm hover:bg-[#8E1405] active:scale-[0.98] transition-all rounded"
                  >
                    Proceed to Checkout
                  </a>

                  <Link
                    href="/shop"
                    className="block w-full py-3 text-center text-xs font-heading font-bold tracking-widest uppercase text-[#6B6B6B] hover:text-[#AE1B07] transition mt-2"
                  >
                    Continue Shopping
                  </Link>

                  <div className="mt-4 pt-4 border-t border-[#E8E0D8] flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-[#9A9A9A]">
                    <span className="inline-flex items-center gap-1.5">
                      <IconLockClosed className="w-4 h-4 text-[#6B6B6B]" aria-hidden />
                      Secure Checkout
                    </span>
                    <span>·</span>
                    <a href="tel:18004230698" className="inline-flex items-center gap-1.5 hover:text-[#AE1B07] transition">
                      <IconPhone className="w-4 h-4 text-[#6B6B6B]" aria-hidden />
                      1-800-423-0698
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
