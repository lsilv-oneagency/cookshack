import { NextRequest, NextResponse } from "next/server";
import { mivaBasicAuthHeader, normalizeMivaHttpPassword } from "@/lib/miva-http-credentials";

// Image proxy — fetches Miva-hosted images server-side (adding Basic Auth if needed)
// Usage: /api/img?p=mm5/graphics/00000001/1/SM025.png
export async function GET(request: NextRequest) {
  const { mergeMivaEnvFromRepoOnce } = await import("@/lib/merge-miva-env-from-dotenv");
  mergeMivaEnvFromRepoOnce();
  const path = request.nextUrl.searchParams.get("p");

  if (!path) {
    return new NextResponse("Missing path", { status: 400 });
  }

  const storeUrl = (process.env.MIVA_STORE_URL || "").trim();
  const httpUser = (process.env.MIVA_HTTP_USER || "").trim();
  const httpPassRaw = process.env.MIVA_HTTP_PASS || "";
  const httpPassNorm = normalizeMivaHttpPassword(httpPassRaw);

  // Only proxy paths from our store domain
  const url = path.startsWith("http") ? path : `${storeUrl}/${path.replace(/^\//, "")}`;

  try {
    const headers: Record<string, string> = {};
    if (httpUser && httpPassNorm) {
      headers["Authorization"] = mivaBasicAuthHeader(httpUser, httpPassRaw.trim());
    }

    const upstream = await fetch(url, {
      headers,
      redirect: "manual",
      next: { revalidate: 86400 },
    });

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
