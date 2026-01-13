/** @type {import('next').NextConfig} */
const nextConfig = {
  // 圧縮を有効化
  compress: true,

  // 画像最適化
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
    minimumCacheTTL: 60,
  },

  // 本番環境でソースマップを無効化（セキュリティ向上）
  productionBrowserSourceMaps: false,

  // 実験的機能: パッケージのインポート最適化
  experimental: {
    optimizePackageImports: ["html2canvas", "jspdf"],
  },

  // Turbopack 設定（Next.js 16 ではデフォルト）
  turbopack: {},
};

module.exports = nextConfig;
