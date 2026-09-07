import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 output: "standalone",
 images: { remotePatterns: [] },
 eslint: { ignoreDuringBuilds: true },
 typescript: { ignoreBuildErrors: true },
 experimental: { typedRoutes: true },
};

export default nextConfig;
