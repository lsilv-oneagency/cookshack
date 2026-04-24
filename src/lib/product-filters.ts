import type { MivaProduct } from "@/types/miva";
import { getProductCustomFieldRows } from "@/lib/miva-custom-fields";

/** Price buckets aligned with Cookshack reference UI (inclusive min, inclusive max). */
export const PRICE_FILTER_RANGES: { id: string; label: string; min: number; max: number }[] = [
  { id: "p1", label: "$5.00 - $10.00", min: 5, max: 10 },
  { id: "p2", label: "$10.01 - $15.00", min: 10.01, max: 15 },
  { id: "p3", label: "$15.01 - $35.00", min: 15.01, max: 35 },
  { id: "p4", label: "$35.01 - $45.00", min: 35.01, max: 45 },
  { id: "p5", label: "$45.01 - $55.00", min: 45.01, max: 55 },
];

/** “4 & Up” → minimum average stars */
export const RATING_FILTER_OPTIONS: { id: string; label: string; minRating: number }[] = [
  { id: "r4", label: "4 & Up", minRating: 4 },
  { id: "r3", label: "3 & Up", minRating: 3 },
  { id: "r2", label: "2 & Up", minRating: 2 },
  { id: "r1", label: "1 & Up", minRating: 1 },
];

/**
 * Parse 0–5 average from custom fields when Miva/review modules expose it.
 */
export function getProductAverageRating(product: MivaProduct): number | null {
  const rows = getProductCustomFieldRows(product);
  for (const r of rows) {
    const key = `${r.code} ${r.label}`.toLowerCase();
    if (!/avg|average|rating|review|stars?|bv_|yotpo|powerreviews/i.test(key)) continue;
    const raw = r.value.replace(/,/g, ".").replace(/[^0-9.]/g, " ");
    const m = raw.match(/\d+(\.\d+)?/);
    if (!m) continue;
    const n = parseFloat(m[0]);
    if (!Number.isNaN(n) && n >= 0 && n <= 5) return Math.min(5, Math.max(0, n));
  }
  return null;
}

export function productPriceInSelectedRanges(
  price: number,
  selectedRangeIds: Set<string>
): boolean {
  if (selectedRangeIds.size === 0) return true;
  for (const id of selectedRangeIds) {
    const r = PRICE_FILTER_RANGES.find((x) => x.id === id);
    if (r && price >= r.min && price <= r.max) return true;
  }
  return false;
}

export function productMatchesRatingFilters(
  rating: number | null,
  selectedRatingIds: Set<string>
): boolean {
  if (selectedRatingIds.size === 0) return true;
  if (rating == null) return false;
  for (const id of selectedRatingIds) {
    const opt = RATING_FILTER_OPTIONS.find((x) => x.id === id);
    if (opt && rating >= opt.minRating) return true;
  }
  return false;
}

export function sortProducts(products: MivaProduct[], sort: string): MivaProduct[] {
  const copy = [...products];
  switch (sort) {
    case "name:d":
      return copy.sort((a, b) => b.name.localeCompare(a.name));
    case "price":
      return copy.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    case "price:d":
      return copy.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    case "name":
    default:
      return copy.sort((a, b) => a.name.localeCompare(b.name));
  }
}
