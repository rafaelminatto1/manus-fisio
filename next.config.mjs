import withPWA from 'next-pwa'
import withBundleAnalyzer from '@next/bundle-analyzer'

const pwaConfig = withPWA({
  dest: 'public',
  disable: true, // Temporarily disable PWA to fix build issues
  register: true,
  skipWaiting: true,
})

const bundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration
  compress: true,
  poweredByHeader: false,
  
  // Experimental features
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-icons',
      '@heroicons/react',
      'lucide-react',
    ],
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    domains: [
      'supabase.co',
      'hycudcwtuocmufahpsnmr.supabase.co',
      'img.youtube.com',
      'i.ytimg.com'
    ],
  },

  // Environment variables
  env: {
    CUSTOM_KEY: 'manus-fisio',
  },

  // Headers for security
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
        ],
      },
    ]
  },

  // Output configuration
  output: 'standalone',
  
  // Typescript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
}

export default bundleAnalyzerConfig(pwaConfig(nextConfig))