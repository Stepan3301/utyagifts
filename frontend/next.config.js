/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.NODE_ENV === 'production' && process.env.GITHUB_PAGES === 'true'

const nextConfig = {
  reactStrictMode: true,
  // For static export (GitHub Pages and Netlify)
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
  },
  // Base path only for GitHub Pages (not Netlify)
  // Netlify hosts at root, GitHub Pages uses repo name
  basePath: isGitHubPages ? '/utyagifts' : '',
  assetPrefix: isGitHubPages ? '/utyagifts' : '',
  env: {
    NEXT_PUBLIC_BASE_PATH: isGitHubPages ? '/utyagifts' : '',
  },
}

module.exports = nextConfig
