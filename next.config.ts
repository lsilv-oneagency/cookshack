import type { NextConfig } from "next";

const storeUrl = process.env.MIVA_STORE_URL || "";
let storeHostname = "";
try {
  storeHostname = new URL(storeUrl).hostname;
} catch {}

const legacyBase = (process.env.NEXT_PUBLIC_STORE_URL || "").replace(/\/$/, "");

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
  async redirects() {
    if (!legacyBase) return [];
    const paths = [
      "/recipes",
      "/support",
      "/order-history",
      "/sign-in",
      "/privacy-policy",
      "/terms-of-service",
    ];
    return paths.map((source) => ({
      source,
      destination: `${legacyBase}${source}`,
      permanent: false,
    }));
  },
};

export default nextConfig;
