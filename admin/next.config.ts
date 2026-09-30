import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Local dev only: on Vercel leave unset so assets load from the deployment itself.
  ...(process.env.NODE_ENV !== "production" || process.env.ADMIN_ASSET_PREFIX
    ? {
        assetPrefix: process.env.ADMIN_ASSET_PREFIX ?? "http://localhost:4001",
        crossOrigin: "anonymous" as const,
      }
    : {}),
  turbopack: {
    // Allow Turbopack to resolve files in the parent monorepo (src/types etc.)
    root: path.join(__dirname, ".."),
    resolveAlias: {
      "@mobile/types": path.join(__dirname, "../src/types/index.ts"),
      "@mobile/database": path.join(__dirname, "../src/types/database.ts"),
    },
  },
};

export default nextConfig;
