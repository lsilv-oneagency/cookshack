import { NextResponse } from "next/server";
import { getCategories } from "@/lib/miva-client";

export async function GET() {
  try {
    const result = await getCategories();
    return NextResponse.json(result, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (error) {
    console.error("[API] categories error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
