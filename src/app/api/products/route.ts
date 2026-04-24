import { NextRequest, NextResponse } from "next/server";
import { getProducts, searchProducts, getCategoryProducts } from "@/lib/miva-client";
import { filterStorefrontProducts } from "@/lib/miva-storefront-visibility";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const count = parseInt(searchParams.get("count") || "24");
  const offset = parseInt(searchParams.get("offset") || "0");
  const sort = searchParams.get("sort") || "name";
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  try {
    let result;

    if (search) {
      result = await searchProducts(search, { count, offset });
    } else if (category) {
      result = await getCategoryProducts(category, { count, offset, sort });
    } else {
      result = await getProducts({ count, offset, sort });
    }

    result = {
      ...result,
      data: filterStorefrontProducts(result.data || []),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] products error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch products" },
      { status: 500 }
    );
  }
}
