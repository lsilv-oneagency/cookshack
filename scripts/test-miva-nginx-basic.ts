/**
 * Standalone probe: nginx Basic in front of Miva (same header as miva-client /api/img).
 *
 *   npx --yes tsx scripts/test-miva-nginx-basic.ts
 *
 * Loads `.env.local` with a line parser (no dotenv-expand), then applies the same
 * `normalizeMivaHttpPassword` as the app. Does not print the password.
 */

import fs from "fs";
import path from "path";
import { normalizeMivaHttpPassword, mivaBasicAuthHeader } from "../src/lib/miva-http-credentials";
import { mivaJsonApiAuthorizationHeader } from "../src/lib/miva-json-api-auth";

function loadDotEnvFile(filePath: string): void {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"') && val.length >= 2) ||
      (val.startsWith("'") && val.endsWith("'") && val.length >= 2)
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

async function main(): Promise<void> {
  const root = path.join(__dirname, "..");
  loadDotEnvFile(path.join(root, ".env.local"));
  loadDotEnvFile(path.join(root, ".env"));

  const base = (process.env.MIVA_STORE_URL || "").trim().replace(/\/$/, "");
  const user = (process.env.MIVA_HTTP_USER || "").trim();
  const passRaw = process.env.MIVA_HTTP_PASS ?? "";
  const passNorm = normalizeMivaHttpPassword(passRaw);

  if (!base) {
    console.error("MIVA_STORE_URL is not set");
    process.exit(1);
  }
  if (!user || !passNorm) {
    const envLocal = path.join(root, ".env.local");
    console.error("MIVA_HTTP_USER and MIVA_HTTP_PASS must both be set for this test.");
    console.error(`Checked: ${envLocal} (exists: ${fs.existsSync(envLocal)})`);
    if (!passNorm) {
      console.error(
        "MIVA_HTTP_PASS is missing or empty. Add a line to .env.local, e.g. MIVA_HTTP_PASS='...$...' (single quotes keep $ literal) or use \\$ before each $ if unquoted."
      );
    }
    process.exit(1);
  }

  const hadBackslashDollar = /\\\$/.test(passRaw.trim());
  console.log("Probe:", `${base}/mm5/json.mvc`);
  console.log("User:", user);
  console.log(
    "Password: length raw=",
    passRaw.trim().length,
    "normalized=",
    passNorm.length,
    hadBackslashDollar ? "(had \\$ sequences, normalized to $)" : "(no \\$ in raw env value)"
  );

  const auth = mivaBasicAuthHeader(user, passRaw.trim());
  const target = `${base}/mm5/json.mvc`;

  for (const method of ["HEAD", "GET"] as const) {
    const res = await fetch(target, {
      method,
      headers: { Authorization: auth },
      redirect: "manual",
      signal: AbortSignal.timeout(12_000),
    });
    const www = res.headers.get("www-authenticate");
    console.log(`${method}: HTTP`, res.status, www ? `WWW-Authenticate: ${www.slice(0, 80)}` : "");
    if (res.status !== 405 && res.status !== 501) break;
  }

  const token = (process.env.MIVA_API_TOKEN || "").trim();
  const storeCode = (process.env.MIVA_STORE_CODE || "").trim();
  const signingKey = (process.env.MIVA_SIGNING_KEY || "").trim();
  const digest = (process.env.MIVA_SIGNING_DIGEST || "sha256").trim() || "sha256";

  const postBody = JSON.stringify({
    Store_Code: storeCode,
    Miva_Request_Timestamp: Math.floor(Date.now() / 1000),
    Function: "ProductList_Load_Query",
    Count: 1,
    Offset: 0,
    Filter: [{ name: "active", operator: "EQ", value: true }],
  });
  const xMivaAuth = mivaJsonApiAuthorizationHeader(postBody, token, signingKey, digest);

  console.log(
    "Miva API auth:",
    signingKey ? `HMAC (${digest})` : "plain MIVA {token} (no MIVA_SIGNING_KEY)"
  );

  const post = await fetch(target, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "X-Miva-API-Authorization": xMivaAuth,
    },
    body: postBody,
    redirect: "manual",
    signal: AbortSignal.timeout(12_000),
  });
  const postText = await post.text();
  const postSnippet = postText.slice(0, 200).replace(/\s+/g, " ");
  console.log("POST json.mvc:", post.status, postSnippet || "(empty body)");

  if (!post.ok) {
    if (post.status === 401) {
      console.error("FAIL: HTTP 401 — nginx Basic and/or Miva rejected the request.");
    } else {
      console.error("FAIL: HTTP", post.status);
    }
    process.exit(1);
  }

  let mivaJson: { success?: unknown; error_code?: string; error_message?: string } = {};
  try {
    mivaJson = JSON.parse(postText) as typeof mivaJson;
  } catch {
    console.error("FAIL: response was not JSON.");
    process.exit(1);
  }

  const ok =
    mivaJson.success === true || mivaJson.success === 1 || mivaJson.success === "1";
  console.log("---");
  console.log("Nginx Basic (host in front of Miva): OK (HTTP 200 on POST)");
  if (ok) {
    console.log("Miva JSON API: OK (success in body).");
    return;
  }

  console.error("Miva JSON API: denied —", mivaJson.error_code, "—", mivaJson.error_message || "");
  console.error(
    "Hints: token must match the signing key; Store_Code must match Admin; token needs ProductList_Load_Query permission; if the token is unsigned-only, remove MIVA_SIGNING_KEY."
  );
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
