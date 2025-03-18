import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Add pdfjs-dist to external packages for Server Components
    serverComponentsExternalPackages: ["pdfjs-dist"],
  } /* config options here */,
};

export default nextConfig;
