import type { MivaCategory } from "@/types/miva";
import { SHOP_NAV_CATEGORIES } from "@/lib/shop-nav-categories";

/**
 * Hero H1 + breadcrumbs for `/category/[code]`.
 * Prefer storefront labels (nav / bento) for the known seven categories, then Miva
 * `page_title` / `name` so sub-categories and API quirks still read correctly.
 */
export function getCategoryHeroTitle(miva: MivaCategory): string {
  const code = miva.code?.toLowerCase() ?? "";
  const nav = SHOP_NAV_CATEGORIES.find(
    (c) => c.categoryCode.toLowerCase() === code
  );
  if (nav) {
    return (nav.cardTitle ?? nav.label).trim();
  }
  const fromPage = miva.page_title?.replace(/\s+/g, " ").trim();
  if (fromPage) {
    return fromPage;
  }
  const n = miva.name?.replace(/\s+/g, " ").trim();
  if (n) {
    return n;
  }
  return miva.code;
}
