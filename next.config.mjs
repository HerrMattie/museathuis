/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Gebruik de standaard app-router output (GEEN "export")
  experimental: {
    appDir: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
