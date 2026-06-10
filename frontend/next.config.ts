import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // PWA later: add next-pwa or a custom service worker when offline support is required.
};

export default nextConfig;
