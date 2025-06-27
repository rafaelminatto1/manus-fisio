/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produção otimizada
  poweredByHeader: false,
  reactStrictMode: true,
  
  // ✅ OTIMIZAÇÃO: Configuração atualizada para Next.js 15.3.4
  serverExternalPackages: ['@supabase/supabase-js'],
  
  // Configuração de build
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  
  // ✅ CORREÇÃO CRÍTICA: Credenciais removidas - usar apenas variáveis de ambiente
  typescript: {
    // Não ignorar erros de build - forçar qualidade
    ignoreBuildErrors: false,
  },
  
  eslint: {
    // Não ignorar durante builds - garantir qualidade
    ignoreDuringBuilds: false,
  },
  
  // Otimização de imagens
  images: {
    domains: ['images.unsplash.com', 'avatars.githubusercontent.com', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
  },
  
  // ✅ OTIMIZAÇÃO: Headers de segurança melhorados
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors 'none';",
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/icons/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Rewrites para API
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  
  // Redirects para SEO
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth/login',
        permanent: true,
      },
      {
        source: '/dashboard',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // ✅ OTIMIZAÇÃO: Compilador otimizado
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig; 