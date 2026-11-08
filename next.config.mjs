/** @type {import('next').NextConfig} */
const nextConfig = {
  // TasteCode opens production HTML as a local file during capture. Keep the
  // stylesheet and runtime chunk URLs resolvable beside that HTML document.
  assetPrefix: './',
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
