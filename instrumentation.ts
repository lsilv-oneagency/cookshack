/** Edge-safe entry — Node `fs` lives inside `register()` so Turbopack does not bundle it for Edge. */

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "edge") {
    return;
  }

  const [{ default: fs }, { default: path }, { fileURLToPath }] = await Promise.all([
    import("node:fs"),
    import("node:path"),
    import("node:url"),
  ]);

  /** Walk up until a Next config exists (compiled `import.meta.url` often lives under `.next/`). */
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

  const fromFile = dirWithNextConfig(path.dirname(fileURLToPath(import.meta.url)));
  const fromCwd = dirWithNextConfig(process.cwd());
  const REPO_ROOT = fs.existsSync(path.join(fromFile, ".env.local"))
    ? fromFile
    : fs.existsSync(path.join(fromCwd, ".env.local"))
      ? fromCwd
      : fromFile;

  function mergeEnvFile(filePath: string): void {
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
      if (!key) continue;
      if (key.startsWith("MIVA_")) {
        process.env[key] = val;
      }
    }
  }

  mergeEnvFile(path.join(REPO_ROOT, ".env"));
  mergeEnvFile(path.join(REPO_ROOT, ".env.local"));
}
