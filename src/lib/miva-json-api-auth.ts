import { createHmac } from "crypto";

/**
 * `X-Miva-API-Authorization` value for a JSON body string. Must match `miva-client` behavior:
 * plain `MIVA {token}` when no signing key; otherwise HMAC over the exact request body bytes.
 */
export function mivaJsonApiAuthorizationHeader(
  requestBody: string,
  apiToken: string,
  signingKeyBase64: string,
  digest: string = "sha256"
): string {
  const key = signingKeyBase64.trim();
  const token = apiToken.trim();
  if (!key) {
    return `MIVA ${token}`;
  }

  const algo = digest.trim().toLowerCase() === "sha1" ? "sha1" : "sha256";
  const keyBuffer = Buffer.from(key, "base64");
  const signature = createHmac(algo, keyBuffer).update(requestBody).digest("base64");
  const digestLabel = algo === "sha1" ? "SHA1" : "SHA256";
  return `MIVA-HMAC-${digestLabel} ${token}:${signature}`;
}
