import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    reactStrictMode: false,
    typescript: {
      ignoreBuildErrors: true,
    },
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "**"
        }
      ]
    }
};

export default nextConfig;
