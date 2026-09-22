import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1MB, which rejects most real phone photos outright.
      // Capped at 4mb (not higher) because Vercel serverless functions
      // hard-cap request bodies at 4.5MB regardless of this setting.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
