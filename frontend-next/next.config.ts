import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "http", hostname: "localhost", port: "8000" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000" },
    ],
  },
  async redirects() {
    return [
      { source: "/adoptar", destination: "/refugios", permanent: false },
      { source: "/donar", destination: "/refugios", permanent: false },
      { source: "/transparencia", destination: "/refugios", permanent: false },
      { source: "/albergues", destination: "/refugios", permanent: false },
      { source: "/albergues/:slug", destination: "/refugios/:slug", permanent: false },
    ];
  },
};

export default nextConfig;
