import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
