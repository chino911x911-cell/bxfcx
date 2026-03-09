import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    'preview-chat-82efd71c-3b5e-4325-b7bc-31facae03b08.space.z.ai',
    '.space.z.ai',
  ],
};

export default nextConfig;
