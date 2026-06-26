import type { NextConfig } from "next";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: join(fileURLToPath(new URL(".", import.meta.url)), "..", "..")
  }
};

export default nextConfig;
