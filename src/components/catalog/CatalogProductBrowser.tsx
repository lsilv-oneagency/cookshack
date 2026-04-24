"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import type { MivaCategory, MivaProduct } from "@/types/miva";
import {
  getProductAverageRating,
  PRICE_FILTER_RANGES,
  productMatchesRatingFilters,
  productPriceInSelectedRanges,
  RATING_FILTER_OPTIONS,
  sortProducts,
} from "@/lib/product-filters";

const PAGE_SIZE = 24;

function buildCategoryNav(
  categories: MivaCategory[]
): { byParent: Map<number, MivaCategory[]>; roots: MivaCategory[] } {
  const active = categories.filter((c) => c.active);
  const byParent = new Map<number, MivaCategory[]>();
  for (const c of active) {
    const pid = c.parent_id ?? 0;
    if (!byParent.has(pid)) byParent.set(pid, []);
    byParent.get(pid)!.push(c);
  }
  for (const arr of byParent.values()) {
    arr.sort((a, b) => (a.disp_order ?? 0) - (b.disp_order ?? 0));
  }
  let roots = byParent.get(0) ?? [];
  if (roots.length === 0 && active.length > 0) {
    const minDepth = Math.min(...active.map((c) => c.depth ?? 0));
    roots = active.filter((c) => (c.depth ?? 0) === minDepth).sort((a, b) => (a.disp_order ?? 0) - (b.disp_order ?? 0));
  }
  return { byParent, roots };
}

function ancestorCodesToExpand(categories: MivaCategory[], currentCode: string): Set<string> {
  if (!currentCode) {
    return new Set();
  }
  const byId = new Map(categories.map((c) => [c.id, c]));
  const byCode = new Map(categories.map((c) => [c.code, c]));
  const set = new Set<string>();
  let cur: MivaCategory | undefined = byCode.get(currentCode);
  while (cur) {
    const pid = cur.parent_id;
    if (pid == null || pid === 0) break;
    const parent = byId.get(pid);
    if (!parent) break;
    set.add(parent.code);
    cur = parent;
  }
  return set;
}

type Props = {
  products: MivaProduct[];
  categoryName: string;
  currentCategoryCode: string;
  allCategories: MivaCategory[];
  initialSort: string;
};

/**
 * Filter sidebar (rating, price, category tree) + sort + paged product grid. Used on
 * `/shop` and `/category/[code]`.
 */
export default function CatalogProductBrowser({
  products,
  categoryName,
  currentCategoryCode,
  allCategories,
  initialSort,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [sort, setSort] = useState(initialSort);
  const [priceSelected, setPriceSelected] = useState<Set<string>>(() => new Set());
  const [ratingSelected, setRatingSelected] = useState<Set<string>>(() => new Set());
  const [expandedNav, setExpandedNav] = useState<Set<string>>(
    () => ancestorCodesToExpand(allCategories, currentCategoryCode)
  );
  const [page, setPage] = useState(1);

  const { byParent, roots } = useMemo(() => buildCategoryNav(allCategories), [allCategories]);

  const hasAnyRating = useMemo(
    () => products.some((p) => getProductAverageRating(p) != null),
    [products]
  );

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const price = typeof p.price === "number" ? p.price : 0;
      if (!productPriceInSelectedRanges(price, priceSelected)) return false;
      const r = getProductAverageRating(p);
      if (!productMatchesRatingFilters(r, ratingSelected)) return false;
      return true;
    });
  }, [products, priceSelected, ratingSelected]);

  const sorted = useMemo(() => sortProducts(filtered, sort), [filtered, sort]);

  const totalFiltered = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const pageClamped = Math.min(page, totalPages);
  const offset = (pageClamped - 1) * PAGE_SIZE;
  const pageSlice = sorted.slice(offset, offset + PAGE_SIZE);

  const pageNumbers = useMemo(() => {
    const tp = totalPages;
    const cp = pageClamped;
    if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1);
    if (cp <= 4) return [1, 2, 3, 4, 5, 6, 7].filter((n) => n <= tp);
    if (cp >= tp - 3) return Array.from({ length: 7 }, (_, i) => tp - 6 + i).filter((n) => n >= 1);
    return Array.from({ length: 7 }, (_, i) => cp - 3 + i);
  }, [totalPages, pageClamped]);

  const togglePrice = useCallback((id: string) => {
    setPriceSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
    setPage(1);
  }, []);

  const toggleRating = useCallback((id: string) => {
    setRatingSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
    setPage(1);
  }, []);

  const toggleExpand = useCallback((code: string) => {
    setExpandedNav((prev) => {
      const n = new Set(prev);
      if (n.has(code)) n.delete(code);
      else n.add(code);
      return n;
    });
  }, []);

  const onSortChange = (value: string) => {
    setSort(value);
    setPage(1);
    const params = new URLSearchParams();
    params.set("sort", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="lg:flex lg:items-start lg:gap-10">
      {/* Sidebar — matches reference: Filters + Rating + Price + Categories */}
      <aside className="mb-8 w-full shrink-0 lg:sticky lg:top-28 lg:mb-0 lg:w-64 lg:self-start" aria-label="Product filters">
        <h2 className="font-heading text-lg font-extrabold tracking-wide text-[#1A1A1A]">Filters</h2>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-[#6B6B6B]">Average Rating</h3>
          {!hasAnyRating && (
            <p className="mt-1 text-xs text-[#9A9A9A]">Average ratings are not in the product feed yet. Checkboxes are disabled until review data is connected.</p>
          )}
          <ul className="mt-3 space-y-2.5">
            {RATING_FILTER_OPTIONS.map((opt) => (
              <li key={opt.id}>
                <label
                  className={`flex cursor-pointer items-center gap-2.5 text-sm ${
                    hasAnyRating ? "text-[#3D3D3D]" : "cursor-not-allowed text-[#B0B0B0]"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-[#C9C0B7] text-[#D52324] focus:ring-[#D52324]/30"
                    checked={ratingSelected.has(opt.id)}
                    disabled={!hasAnyRating}
                    onChange={() => toggleRating(opt.id)}
                  />
                  {opt.label}
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 border-t border-[#E8E0D8] pt-6">
          <h3 className="text-sm font-medium text-[#6B6B6B]">Price</h3>
          <ul className="mt-3 space-y-2.5">
            {PRICE_FILTER_RANGES.map((r) => (
              <li key={r.id}>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#3D3D3D]">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-[#C9C0B7] text-[#D52324] focus:ring-[#D52324]/30"
                    checked={priceSelected.has(r.id)}
                    onChange={() => togglePrice(r.id)}
                  />
                  {r.label}
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 border-t border-[#E8E0D8] pt-6">
          <h2 className="font-heading text-base font-extrabold tracking-wide text-[#1A1A1A]">Categories</h2>
          <nav className="mt-2" aria-label="Category list">
            {roots.map((cat) => (
              <CategoryNavBlock
                key={cat.code}
                cat={cat}
                depth={0}
                currentCode={currentCategoryCode}
                byParent={byParent}
                expanded={expandedNav}
                onToggle={toggleExpand}
              />
            ))}
          </nav>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-[#6B6B6B]">
            {products.length === 0
              ? "No products in this category."
              : totalFiltered > 0
                ? `Showing ${offset + 1}–${Math.min(offset + PAGE_SIZE, totalFiltered)} of ${totalFiltered}`
                : "No products match the selected filters."}
          </p>
          <div className="flex items-center gap-3">
            <label htmlFor="cat-sort" className="text-sm font-medium text-[#6B6B6B]">
              Sort:
            </label>
            <select
              id="cat-sort"
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              className="rounded border border-[#D4C8BE] bg-white px-3 py-1.5 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#D52324]"
            >
              <option value="name">Name A–Z</option>
              <option value="name:d">Name Z–A</option>
              <option value="price">Price: Low to High</option>
              <option value="price:d">Price: High to Low</option>
            </select>
          </div>
        </div>

        <ProductGrid products={pageSlice} categoryLabel={categoryName} />

        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
            <button
              type="button"
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={pageClamped === 1}
              className="rounded border border-transparent p-2 text-[#6B6B6B] transition hover:border-[#E8E0D8] hover:bg-white hover:text-[#D52324] disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Previous page"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {pageNumbers.map((pNum) => (
              <button
                key={pNum}
                type="button"
                onClick={() => {
                  setPage(pNum);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`h-9 w-9 rounded text-sm font-heading font-bold tracking-wide transition ${
                  pNum === pageClamped
                    ? "bg-[#D52324] text-white"
                    : "border border-transparent text-[#6B6B6B] hover:border-[#E8E0D8] hover:text-[#1A1A1A]"
                }`}
              >
                {pNum}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={pageClamped === totalPages}
              className="rounded border border-transparent p-2 text-[#6B6B6B] transition hover:border-[#E8E0D8] hover:bg-white hover:text-[#D52324] disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Next page"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}

function CategoryNavBlock({
  cat,
  depth,
  currentCode,
  byParent,
  expanded,
  onToggle,
}: {
  cat: MivaCategory;
  depth: number;
  currentCode: string;
  byParent: Map<number, MivaCategory[]>;
  expanded: Set<string>;
  onToggle: (code: string) => void;
}) {
  const children = byParent.get(cat.id) ?? [];
  const hasChildren = children.length > 0;
  const isCurrent = cat.code === currentCode;
  const pad = Math.min(depth * 12, 36);

  return (
    <div>
      <div
        className="flex min-h-[2.75rem] items-center justify-between gap-2 border-b border-[#E8E0D8]"
        style={{ paddingLeft: pad }}
      >
        <Link
          href={`/category/${encodeURIComponent(cat.code)}`}
          className={`flex-1 py-2.5 text-sm leading-snug transition ${
            isCurrent ? "font-bold text-[#1A1A1A]" : "font-normal text-[#6B6B6B] hover:text-[#D52324]"
          }`}
        >
          {cat.name}
        </Link>
        {hasChildren && (
          <button
            type="button"
            className="shrink-0 py-2 text-sm text-[#9A9A9A] hover:text-[#1A1A1A]"
            aria-expanded={expanded.has(cat.code) ? "true" : "false"}
            onClick={() => onToggle(cat.code)}
          >
            {expanded.has(cat.code) ? "−" : "+"}
          </button>
        )}
      </div>
      {hasChildren && expanded.has(cat.code) && (
        <div className="border-b border-[#E8E0D8] pb-0">
          {children.map((ch) => (
            <CategoryNavBlock
              key={ch.code}
              cat={ch}
              depth={depth + 1}
              currentCode={currentCode}
              byParent={byParent}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
