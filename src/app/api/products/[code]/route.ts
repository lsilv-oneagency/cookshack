import { NextRequest, NextResponse } from "next/server";
import { getProductByCode } from "@/lib/miva-client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const result = await getProductByCode(decodeURIComponent(code));
  if (result.data) {
    return NextResponse.json(result);
  }
  if (result.error_message) {
    return NextResponse.json(result, { status: 502 });
  }
  return NextResponse.json(result, { status: 404 });
}
