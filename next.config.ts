import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the dev server to be reached from other origins (LAN IP / tunnels),
  // otherwise Next.js blocks its dev runtime cross-origin and nothing hydrates.
  // Dev-only - has no effect on production builds. Add hosts as needed.
  allowedDevOrigins: ["10.76.60.130", "10.254.109.60", "*.sriharan.me"],
};

export default nextConfig;
