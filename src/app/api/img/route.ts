import { NextRequest, NextResponse } from "next/server";

const STORE_URL = process.env.MIVA_STORE_URL || "";
const HTTP_USER = process.env.MIVA_HTTP_USER || "";
/** Required when `MIVA_HTTP_USER` is set; same as JSON client — use `.env.local`, never commit. */
const HTTP_PASS = process.env.MIVA_HTTP_PASS || "";

// Image proxy — fetches Miva-hosted images server-side (adding Basic Auth if needed)
// Usage: /api/img?p=mm5/graphics/00000001/1/SM025.png
export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("p");

  if (!path) {
    return new NextResponse("Missing path", { status: 400 });
  }

  // Only proxy paths from our store domain
  const url = path.startsWith("http") ? path : `${STORE_URL}/${path.replace(/^\//, "")}`;

  try {
    const headers: Record<string, string> = {};
    if (HTTP_USER && HTTP_PASS) {
      headers["Authorization"] =
        "Basic " + Buffer.from(`${HTTP_USER}:${HTTP_PASS}`).toString("base64");
    }

    const upstream = await fetch(url, { headers, next: { revalidate: 86400 } });

    if (!upstream.ok) {
      return new NextResponse(null, { status: upstream.status });
    }

    const contentType = upstream.headers.get("content-type") || "image/png";
    const buffer = await upstream.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new NextResponse("Image fetch failed", { status: 502 });
  }
}
