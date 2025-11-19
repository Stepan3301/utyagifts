/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // For static export (GitHub Pages and Netlify)
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
  },
  // Base path only for GitHub Pages (not Netlify)
  // Netlify hosts at root, GitHub Pages uses repo name
  basePath: process.env.NODE_ENV === 'production' && process.env.GITHUB_PAGES === 'true' ? '/utyagifts' : '',
  assetPrefix: process.env.NODE_ENV === 'production' && process.env.GITHUB_PAGES === 'true' ? '/utyagifts' : '',
}

module.exports = nextConfig
