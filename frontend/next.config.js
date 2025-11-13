/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // For GitHub Pages deployment
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
  },
  // Base path for GitHub Pages (your repo name)
  basePath: process.env.NODE_ENV === 'production' ? '/utyagifts' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/utyagifts' : '',
}

module.exports = nextConfig
