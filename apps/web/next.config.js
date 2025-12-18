/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Generate static HTML/CSS/JS instead of server-side rendering
  reactStrictMode: true,
  swcMinify: true,
  distDir: 'out',  // Explicitly set output directory to 'out/'
  images: {
    unoptimized: true,  // Required for static export (no image optimization at build time)
  },
  trailingSlash: true,  // Ensure consistent URL handling
  skipTrailingSlashRedirect: true,  // Prevent redirect issues
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
};

module.exports = nextConfig;
