/**
 * HTTP Basic in front of Miva/nginx. Passwords often contain `$`; env files use `\$` so
 * dotenv-expand does not treat `$foo` as a variable. If a stray backslash remains before `$`,
 * nginx receives the wrong secret and returns 401.
 */
export function normalizeMivaHttpPassword(raw: string): string {
  let s = raw.trim();
  s = s.replace(/\\\$/g, "$");
  return s;
}

export function mivaBasicAuthHeader(user: string, passwordRaw: string): string {
  const u = user.trim();
  const p = normalizeMivaHttpPassword(passwordRaw);
  return "Basic " + Buffer.from(`${u}:${p}`, "utf8").toString("base64");
}
