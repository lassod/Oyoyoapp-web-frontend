/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
  async redirects() {
    return [
      // Public handles belong to the creator app; the marketing domain is
      // also a convenient entry point when someone types or shares a handle.
      { source: "/@:username", destination: "https://app.oyoyoapp.com/@:username", permanent: true },
    ];
  },
};

export default nextConfig;
