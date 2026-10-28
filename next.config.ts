import type { NextConfig } from "next";

// Static export so the game runs anywhere (GitHub Pages included).
// PAGES_BASE_PATH is set by the deploy workflow to "/Voidsworn"; locally it is empty.
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: false,
};

export default nextConfig;
