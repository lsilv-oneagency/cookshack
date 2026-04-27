import { NextResponse } from "next/server";

export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/", request.url));
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const raw = formData.get("email");
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  if (!trimmed) {
    return NextResponse.redirect(new URL("/?newsletter=invalid", request.url), 303);
  }

  return NextResponse.redirect(new URL("/?newsletter=thanks", request.url), 303);
}
