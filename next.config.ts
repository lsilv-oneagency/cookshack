import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

/** Pin project root so a stray `~/package-lock.json` does not confuse tracing / Turbopack. */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const storeUrl = (process.env.MIVA_STORE_URL || "").trim();
let storeHostname = "";
try {
  storeHostname = new URL(storeUrl).hostname;
} catch {}

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  turbopack: { root: projectRoot },
  images: {
    remotePatterns: [
      // Allow images from the configured Miva store
      ...(storeHostname
        ? [{ protocol: "https" as const, hostname: storeHostname }]
        : []),
      // Allow any https image during development/demo
      { protocol: "https" as const, hostname: "**" },
    ],
  },
};

export default nextConfig;
