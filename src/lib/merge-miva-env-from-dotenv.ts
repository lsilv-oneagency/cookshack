import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

let didMerge = false;

function dirWithNextConfig(startDir: string): string {
  let dir = path.resolve(startDir);
  for (let i = 0; i < 28; i++) {
    if (
      fs.existsSync(path.join(dir, "next.config.ts")) ||
      fs.existsSync(path.join(dir, "next.config.mjs")) ||
      fs.existsSync(path.join(dir, "next.config.js"))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(startDir);
}

function parseAndApplyMivaLines(text: string): void {
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
    if (key.startsWith("MIVA_")) {
      process.env[key] = val;
    }
  }
}

/**
 * Ensures `MIVA_*` from this repo’s `.env` / `.env.local` are on `process.env` even when Next
 * inferred the wrong root for its own dotenv pass (e.g. `~/package-lock.json`).
 * No-op after first call.
 */
export function mergeMivaEnvFromRepoOnce(): void {
  if (didMerge) return;
  didMerge = true;

  const fromHere = dirWithNextConfig(path.dirname(fileURLToPath(import.meta.url)));
  const fromCwd = dirWithNextConfig(process.cwd());
  const repo = fs.existsSync(path.join(fromHere, ".env.local"))
    ? fromHere
    : fs.existsSync(path.join(fromCwd, ".env.local"))
      ? fromCwd
      : fromHere;

  const envPath = path.join(repo, ".env");
  const localPath = path.join(repo, ".env.local");
  if (fs.existsSync(envPath)) parseAndApplyMivaLines(fs.readFileSync(envPath, "utf8"));
  if (fs.existsSync(localPath)) parseAndApplyMivaLines(fs.readFileSync(localPath, "utf8"));
}
