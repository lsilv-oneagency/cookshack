"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { SHOP_NAV_CATEGORIES } from "@/lib/shop-nav-categories";
import type { MivaProduct } from "@/types/miva";

const ALL = "all" as const;
type FilterId = typeof ALL | string;

type Props = {
  /** Curated “All” list (featured + fill) — not the full catalog. */
  allProducts: MivaProduct[];
};

/**
 * “All” uses the curated `allProducts` slice. A shop-nav filter loads products with the same
 * Miva path as `/category/[code]`: `getAllCategoryProducts` (see `api/home-browse-category`).
 */
export default function BrowseProductsWithFilters({ allProducts }: Props) {
  const [active, setActive] = useState<FilterId>(ALL);
  /** Fetched from API by category `code` — `undefined` = not loaded yet, `[]` = loaded empty. */
  const [cache, setCache] = useState<Record<string, MivaProduct[] | undefined>>({});
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const filters: { id: FilterId; label: string }[] = useMemo(
    () => [
      { id: ALL, label: "All" },
      ...SHOP_NAV_CATEGORIES.map((c) => ({
        id: c.categoryCode,
        label: c.label,
      })),
    ],
    []
  );

  useEffect(() => {
    if (active === ALL) {
      return;
    }
    if (cache[active] !== undefined) {
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(
          `/api/home-browse-category?code=${encodeURIComponent(active)}`
        );
        const data = (await res.json()) as {
          products?: MivaProduct[];
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok) {
          throw new Error(data.error || "Request failed");
        }
        setCache((m) => ({ ...m, [active]: data.products ?? [] }));
      } catch (e) {
        if (cancelled) return;
        setLoadError(
          e instanceof Error ? e.message : "Could not load this category"
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [active, cache]);

  const visible = useMemo((): MivaProduct[] => {
    if (active === ALL) {
      return allProducts;
    }
    return cache[active] ?? [];
  }, [active, allProducts, cache]);

  const showLoading =
    active !== ALL && cache[active] === undefined && loading;
  const showError =
    active !== ALL && loadError && cache[active] === undefined;

  if (allProducts.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-white py-16 sm:py-20" aria-label="Browse products by category">
      <div className="mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex w-full min-w-0 max-w-full items-end justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h2 className="font-heading text-4xl font-extrabold uppercase leading-none tracking-wider text-[#1A1A1A] sm:text-5xl">
              Browse Products
            </h2>
            <div className="mt-3 h-1 w-16 bg-[#D52324]" />
            <p className="mt-3 font-body text-sm text-[#6B6B6B]">
              Discover Cookshack&apos;s industry-leading smokers, wood-fired ovens, and premium fuels.
            </p>
          </div>
          <Link
            href="/shop"
            className="shrink-0 flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-widest text-[#D52324] transition hover:underline"
          >
            View All Products
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <fieldset className="m-0 mb-8 block w-full min-w-0 border-0 p-0 [min-inline-size:0]">
          <legend className="sr-only">Filter by category</legend>
          <div
            className="flex w-full min-w-full max-w-full touch-pan-x flex-nowrap items-stretch justify-start gap-1 overflow-x-auto overscroll-x-contain pb-0.5 sm:gap-1.5 md:justify-between [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#2E2E2E]/25"
          >
            {filters.map(({ id, label }) => {
              const inputId = `browse-products-cat-${id === ALL ? "all" : id}`;
              return (
                <div key={id} className="contents">
                  <input
                    id={inputId}
                    type="radio"
                    name="browse-products-category"
                    value={id}
                    checked={active === id}
                    onChange={() => {
                      setLoadError(null);
                      setActive(id);
                    }}
                    className="peer sr-only"
                  />
                  <label
                    htmlFor={inputId}
                    className="shrink-0 cursor-pointer whitespace-nowrap rounded border border-[#E0E0E0] bg-white px-2 py-1.5 font-heading text-[9px] font-bold uppercase leading-none tracking-tight text-[#1A1A1A] transition peer-checked:border-[#D52324] peer-checked:bg-[#D52324] peer-checked:text-white hover:border-[#D52324] hover:text-[#D52324] sm:px-2.5 sm:py-1.5 sm:text-[10px] sm:tracking-wide peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#D52324]"
                  >
                    {label}
                  </label>
                </div>
              );
            })}
          </div>
        </fieldset>

        {showError && (
          <p className="mb-4 text-center font-body text-sm text-red-600">
            {loadError}{" "}
            <button
              type="button"
              onClick={() => {
                setLoadError(null);
                setCache((m) => {
                  const n = { ...m };
                  delete n[active];
                  return n;
                });
              }}
              className="font-heading font-bold text-[#D52324] underline"
            >
              Try again
            </button>
          </p>
        )}

        {showLoading && (
          <>
            <p className="mb-2 text-center font-body text-sm text-[#6B6B6B]">
              Loading products…
            </p>
            <div
              className="grid w-full min-w-0 grid-cols-2 gap-4 opacity-40 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4"
              aria-hidden
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] rounded border border-[#E8E8E8] bg-[#F4F4F4]"
                />
              ))}
            </div>
          </>
        )}

        {!showLoading && !showError && visible.length === 0 && active !== ALL && (
          <p className="text-center font-body text-sm text-[#6B6B6B]">
            No products in this category.{" "}
            <Link href="/shop" className="font-heading font-bold text-[#D52324] hover:underline">
              Browse the shop
            </Link>
            .
          </p>
        )}

        {!showLoading && visible.length > 0 && (
          <div className="grid w-full min-w-0 grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {visible.map((p) => (
              <ProductCard key={p.id || p.code} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
