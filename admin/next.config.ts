import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  assetPrefix: process.env.ADMIN_ASSET_PREFIX ?? "http://localhost:4001",
  crossOrigin: "anonymous",
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
