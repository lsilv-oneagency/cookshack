"use client";

import { Fragment, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { mivaImgUrl } from "@/components/ProductImage";
import { getPrimaryProductImagePath } from "@/lib/miva-product-images";
import type { CartItem, MivaProduct } from "@/types/miva";

/** All product thumbs use the same box (px). */
const THUMB = "h-[160px] w-[160px] sm:h-[168px] sm:w-[168px]";

function priceNum(p: MivaProduct): number {
  return typeof p.price === "number" && !Number.isNaN(p.price) ? p.price : 0;
}

function formatMoney(p: MivaProduct): string {
  return p.formatted_price || `$${priceNum(p).toFixed(2)}`;
}

type Props = {
  main: MivaProduct;
  companions: MivaProduct[];
  /** When set, explains that companions are from the same Miva category / collection as this product. */
  group?: { name: string; href: string };
};

export default function FrequentlyBoughtTogether({ main, companions, group }: Props) {
  const { addItem, isLoading } = useCart();
  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    const s: Record<string, boolean> = {};
    for (const c of companions) {
      s[c.code] = true;
    }
    return s;
  });
  const [busy, setBusy] = useState(false);

  const items = useMemo(() => [main, ...companions], [main, companions]);

  const total = useMemo(() => {
    let t = priceNum(main);
    for (const c of companions) {
      if (selected[c.code]) t += priceNum(c);
    }
    return t;
  }, [main, companions, selected]);

  const toggle = (code: string) => {
    setSelected((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const handleAddAll = async () => {
    if (busy || isLoading) return;
    setBusy(true);
    const payloads: Omit<CartItem, "total">[] = [
      {
        product_code: main.code,
        product_name: main.name,
        product_sku: main.sku,
        product_price: priceNum(main),
        product_formatted_price: main.formatted_price,
        product_image: main.image || "",
        product_thumbnail: main.thumbnail || "",
        quantity: 1,
      },
    ];
    for (const c of companions) {
      if (!selected[c.code]) continue;
      payloads.push({
        product_code: c.code,
        product_name: c.name,
        product_sku: c.sku,
        product_price: priceNum(c),
        product_formatted_price: c.formatted_price,
        product_image: c.image || "",
        product_thumbnail: c.thumbnail || "",
        quantity: 1,
      });
    }
    try {
      for (let i = 0; i < payloads.length; i++) {
        await addItem(payloads[i], { openCart: i === payloads.length - 1 });
      }
    } finally {
      setBusy(false);
    }
  };

  if (companions.length === 0) return null;

  const imgSrc = (p: MivaProduct) => {
    const path = getPrimaryProductImagePath(p);
    return path ? mivaImgUrl(path) : "";
  };

  return (
    <section className="border-t border-[#E8E0D8] pt-10" aria-labelledby="fbt-heading">
      <h2
        id="fbt-heading"
        className="font-heading text-xl font-extrabold uppercase tracking-wider text-[#1A1A1A] sm:text-2xl"
      >
        Frequently bought together
      </h2>
      {group ? (
        <p className="mt-2 text-sm text-[#6B6B6B]">
          Grouped with other items in{" "}
          <Link href={group.href} className="font-heading font-bold text-[#D52324] hover:underline">
            {group.name}
          </Link>{" "}
          — the same category as this product in the store.
        </p>
      ) : (
        <p className="mt-2 text-sm text-[#6B6B6B]">
          Select add-ons and add everything to your cart in one step.
        </p>
      )}

      <div className="mt-8 flex w-full flex-col gap-6 lg:flex-row lg:items-start lg:gap-4">
        {/* Three equal `flex-1` columns + 1rem gutters; + sits in 1rem track matching image height on sm+ */}
        <div className="flex min-w-0 flex-1 flex-col items-stretch gap-4 sm:flex-row sm:items-start">
          {items.map((p, idx) => (
            <Fragment key={p.code}>
              {idx > 0 && (
                <div
                  className="flex shrink-0 items-center justify-center self-center sm:h-[168px] sm:w-4 sm:self-start"
                  aria-hidden
                >
                  <span className="text-2xl font-light leading-none text-[#9A9A9A]">+</span>
                </div>
              )}
              <div className="flex min-w-0 flex-1 basis-0 flex-col items-center">
                <Link
                  href={`/shop/${encodeURIComponent(p.code)}`}
                  className={`relative mx-auto block shrink-0 overflow-hidden rounded-lg border border-[#E8E0D8] bg-white ${THUMB}`}
                >
                  {imgSrc(p) ? (
                    <Image
                      src={imgSrc(p)}
                      alt=""
                      width={168}
                      height={168}
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-[#9A9A9A]">
                      No image
                    </div>
                  )}
                </Link>

                <div className="mx-auto mt-3 min-h-[2.75rem] w-full max-w-[168px] px-0.5 text-center">
                  {p === main ? (
                    <span className="font-heading text-xs font-bold uppercase leading-tight tracking-wide text-[#D52324]">
                      This item
                    </span>
                  ) : (
                    <Link
                      href={`/shop/${encodeURIComponent(p.code)}`}
                      className="line-clamp-2 inline-block w-full text-xs font-medium leading-snug text-[#1A1A1A] hover:text-[#D52324] hover:underline"
                    >
                      {p.name}
                    </Link>
                  )}
                </div>

                <p className="mt-2 h-6 font-heading text-sm font-bold tabular-nums text-[#1A1A1A]">
                  {formatMoney(p)}
                </p>

                <div className="mt-2 flex h-8 w-full max-w-[168px] items-center justify-center self-center">
                  {p !== main ? (
                    <label className="flex cursor-pointer items-center justify-center gap-2 text-xs text-[#3D3D3D]">
                      <input
                        type="checkbox"
                        className="h-4 w-4 shrink-0 rounded border-[#C9C0B7] accent-[#D52324] focus:ring-2 focus:ring-[#D52324]/30"
                        checked={!!selected[p.code]}
                        onChange={() => toggle(p.code)}
                      />
                      <span className="whitespace-nowrap">Add to order</span>
                    </label>
                  ) : (
                    <span className="pointer-events-none invisible select-none text-xs" aria-hidden>
                      Add to order
                    </span>
                  )}
                </div>
              </div>
            </Fragment>
          ))}
        </div>

        {/* CTA: same vertical rhythm as image column (top-aligned with row) */}
        <div className="w-full shrink-0 rounded-lg border border-[#E8E0D8] bg-[#F7F7F7] p-5 lg:w-[min(100%,20rem)] lg:shrink-0">
          <p className="text-xs font-heading font-bold uppercase tracking-wide text-[#6B6B6B]">
            Combined price
          </p>
          <p className="mt-1 font-heading text-3xl font-extrabold tabular-nums text-[#1A1A1A]">
            ${total.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-[#9A9A9A]">Items shown before shipping &amp; tax</p>
          <button
            type="button"
            onClick={handleAddAll}
            disabled={busy || isLoading}
            className="mt-4 w-full rounded bg-[#D52324] py-3.5 font-heading text-sm font-bold uppercase tracking-widest text-white transition hover:brightness-[0.94] disabled:opacity-50"
          >
            {busy ? "Adding…" : "Add all to cart"}
          </button>
        </div>
      </div>
    </section>
  );
}
