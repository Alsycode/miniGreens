import type { NextConfig } from "next";

const ADMIN_APP_URL = process.env.ADMIN_APP_URL ?? "http://localhost:4001";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/dashboard",
        destination: `${ADMIN_APP_URL}/dashboard`,
      },
      {
        source: "/dashboard/:path*",
        destination: `${ADMIN_APP_URL}/dashboard/:path*`,
      },
    ];
  },
};

export default nextConfig;
