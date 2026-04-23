import { NextRequest, NextResponse } from "next/server";
import { createBasket, getBasket } from "@/lib/miva-client";

export async function POST() {
  try {
    const result = await createBasket();
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] create basket error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create basket" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const sessionId = request.headers.get("x-basket-session") || "";

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  try {
    const result = await getBasket(sessionId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] get basket error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch basket" },
      { status: 500 }
    );
  }
}
