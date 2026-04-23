import { NextRequest, NextResponse } from "next/server";
import { addBasketItem } from "@/lib/miva-client";

export async function POST(request: NextRequest) {
  const sessionId = request.headers.get("x-basket-session") || "";

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { product_code, quantity = 1, attributes = [] } = body;

    if (!product_code) {
      return NextResponse.json({ error: "product_code is required" }, { status: 400 });
    }

    const result = await addBasketItem(sessionId, product_code, quantity, attributes);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] add basket item error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add item" },
      { status: 500 }
    );
  }
}
