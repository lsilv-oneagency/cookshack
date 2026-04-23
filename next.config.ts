import type { NextConfig } from "next";

const storeUrl = process.env.MIVA_STORE_URL || "";
let storeHostname = "";
try {
  storeHostname = new URL(storeUrl).hostname;
} catch {}

const nextConfig: NextConfig = {
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
