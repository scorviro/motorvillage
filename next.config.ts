import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Cache all WebP frames for 1 year (immutable)
        source: "/motovillagedesktop/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  // Enable compression
  compress: true,
};

export default nextConfig;
