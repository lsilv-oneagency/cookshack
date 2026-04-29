import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * TEMPORARY — remove after Miva / firewall allowlist is configured.
 * Shows one outbound IP Vercel uses for this serverless region (may change without Static IPs).
 */
export async function GET() {
  try {
    const r = await fetch("https://api.ipify.org?format=json", {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const data = (await r.json()) as { ip?: string };
    return NextResponse.json({
      ip: data.ip ?? null,
      note:
        "Egress IP seen by api.ipify.org for this invocation; Miva sees the same class of address on server-side fetches. Not stable on Hobby — use Vercel Static IPs for a fixed allowlist.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "probe failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
