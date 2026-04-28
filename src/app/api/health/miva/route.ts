import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PROBE_PATH = "/mm5/json.mvc";

function isBasicAuthChallenge(wwwAuthenticate: string | null): boolean {
  if (!wwwAuthenticate) return false;
  return /\bbasic\b/i.test(wwwAuthenticate);
}

/**
 * Secured probe: HEAD/GET `MIVA_STORE_URL/mm5/json.mvc` without API or Basic credentials.
 * Detects HTTP 401 + `WWW-Authenticate: Basic` so you know whether to set `MIVA_HTTP_*` on the host.
 *
 * Enable by setting `MIVA_DIAGNOSTIC_SECRET`, then call:
 *   curl -sS -H "Authorization: Bearer YOUR_SECRET" "https://your-app/api/health/miva"
 */
export async function GET(request: NextRequest) {
  const secret = process.env.MIVA_DIAGNOSTIC_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const auth = request.headers.get("authorization")?.trim();
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawUrl = process.env.MIVA_STORE_URL?.trim();
  if (!rawUrl) {
    return NextResponse.json(
      { error: "MIVA_STORE_URL is not set", basicAuthChallenge: false as const },
      { status: 503 }
    );
  }

  const base = rawUrl.replace(/\/$/, "");
  const target = `${base}${PROBE_PATH}`;
  let hostname: string;
  try {
    hostname = new URL(base).hostname;
  } catch {
    return NextResponse.json(
      { error: "MIVA_STORE_URL is not a valid URL", basicAuthChallenge: false as const },
      { status: 503 }
    );
  }

  const probe = async (method: "HEAD" | "GET") =>
    fetch(target, {
      method,
      redirect: "manual",
      signal: AbortSignal.timeout(12_000),
    });

  let res: Response;
  try {
    res = await probe("HEAD");
    if (res.status === 405 || res.status === 501) {
      res = await probe("GET");
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Probe failed";
    console.warn("[miva-health] probe error", { hostname, message });
    return NextResponse.json(
      {
        host: hostname,
        error: message,
        basicAuthChallenge: false as const,
      },
      { status: 502 }
    );
  }

  const wwwAuthenticate = res.headers.get("www-authenticate");
  const basicAuthChallenge = res.status === 401 && isBasicAuthChallenge(wwwAuthenticate);

  console.info("[miva-health]", {
    host: hostname,
    httpStatus: res.status,
    basicAuthChallenge,
    hasWwwAuthenticate: Boolean(wwwAuthenticate),
  });

  const body = {
    host: hostname,
    path: PROBE_PATH,
    httpStatus: res.status,
    wwwAuthenticate: wwwAuthenticate ?? null,
    basicAuthChallenge,
    configureHttpBasicOnHost: basicAuthChallenge,
  };

  return NextResponse.json(body, { status: 200 });
}
