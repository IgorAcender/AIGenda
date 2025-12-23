/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['antd', '@ant-design/icons'],
  output: 'standalone',
  
  // Otimizações de performance
  compiler: {
    // Remove console.log em produção
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  // Configurações de build otimizadas
  swcMinify: true,
  productionBrowserSourceMaps: false,
  
  // Limite de tamanho de página
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },

  // Otimizar imagens
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
  },

  // Experimental features para performance
  experimental: {
    optimizePackageImports: ['antd', '@ant-design/icons'],
    esmExternals: 'loose',
  },

  // Incrementar timeouts
  staticPageGenerationTimeout: 120,
}

module.exports = nextConfig
