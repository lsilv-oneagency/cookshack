import type { MivaProduct } from "@/types/miva";

/**
 * Some Miva “products” are content (recipes, articles) — same API as sellable SKUs.
 * They should not appear in shop/search/related or as buyable PDPs.
 */
const EXCLUDED_CODE_PREFIXES = ["RECIPES_", "RECIPE_"];

/** Category codes that are recipe / content-only (not equipment) — adjust to match your Miva. */
const EXCLUDED_CATEGORY_CODES = new Set(
  [
    "ctgy_recipes",
    "sub_ctgy_recipes",
    "cat_recipes",
    "recipes",
  ].map((c) => c.toLowerCase())
);

export function isNonPurchasableStorefrontProduct(p: MivaProduct): boolean {
  const code = (p.code || "").toUpperCase();
  for (const pre of EXCLUDED_CODE_PREFIXES) {
    if (code.startsWith(pre)) return true;
  }
  if (p.categories?.length) {
    for (const c of p.categories) {
      if (c?.code && EXCLUDED_CATEGORY_CODES.has(c.code.toLowerCase())) {
        return true;
      }
    }
  }
  return false;
}

export function filterStorefrontProducts(products: MivaProduct[]): MivaProduct[] {
  return products.filter((p) => !isNonPurchasableStorefrontProduct(p));
}

/**
 * True if both products share at least one Miva category assignment.
 * Used so “related” / FBT isn’t filled from unrelated departments (e.g. grill + recipe).
 */
export function productsShareAtLeastOneCategory(a: MivaProduct, b: MivaProduct): boolean {
  const codesA = new Set(
    (a.categories ?? [])
      .map((c) => c.code?.toLowerCase())
      .filter((c): c is string => Boolean(c))
  );
  if (codesA.size === 0) return false;
  for (const c of b.categories ?? []) {
    const code = c.code?.toLowerCase();
    if (code && codesA.has(code)) return true;
  }
  return false;
}

/**
 * True if two products should appear together for PDP related / FBT: same Miva category
 * assignment, or the same default catalog category (cancat) when category arrays are sparse.
 */
export function isPdpRelatedPair(main: MivaProduct, other: MivaProduct): boolean {
  if (productsShareAtLeastOneCategory(main, other)) return true;
  if (
    main.cancat_code &&
    other.cancat_code &&
    main.cancat_code.toLowerCase() === other.cancat_code.toLowerCase()
  ) {
    return true;
  }
  return false;
}
