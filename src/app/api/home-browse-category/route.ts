import { NextRequest, NextResponse } from "next/server";
import { getAllCategoryProducts } from "@/lib/miva-client";
import { filterStorefrontProducts } from "@/lib/miva-storefront-visibility";
import { SHOP_NAV_CATEGORIES } from "@/lib/shop-nav-categories";

const ALLOWED = new Set(
  SHOP_NAV_CATEGORIES.map((c) => c.categoryCode.toLowerCase())
);

/** Same Miva source as `/category/[code]`, but limit row count on the home grid. */
const HOME_BROWSE_MAX = 48;

/**
 * Same product source as `/category/[code]`: Miva `CategoryProductList` for a shop-nav category.
 * Whitelisted codes only; used by the home “Browse Products” filter.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.trim() ?? "";
  if (!code || !ALLOWED.has(code.toLowerCase())) {
    return NextResponse.json(
      { error: "Invalid or unsupported category" },
      { status: 400 }
    );
  }
  try {
    const raw = await getAllCategoryProducts(code, "name");
    const products = filterStorefrontProducts(raw).slice(0, HOME_BROWSE_MAX);
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json(
      { error: "Failed to load category products" },
      { status: 502 }
    );
  }
}
