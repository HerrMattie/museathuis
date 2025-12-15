/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Sta Unsplash toe
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co', // Sta Supabase toe
      },
    ],
  },
};

export default nextConfig;
