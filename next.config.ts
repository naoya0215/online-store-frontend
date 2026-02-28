import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/storage/**',
      },
      // HTTPS版（必要に応じて）
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '',
        pathname: '/storage/**',
      },
    ],
  },
};

export default nextConfig;
