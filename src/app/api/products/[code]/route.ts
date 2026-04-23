import { NextRequest, NextResponse } from "next/server";
import { getProductByCode } from "@/lib/miva-client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  try {
    const result = await getProductByCode(decodeURIComponent(code));
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] product detail error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Product not found" },
      { status: 404 }
    );
  }
}
