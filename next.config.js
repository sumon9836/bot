/** @type {import('next').NextConfig} */
const nextConfig = {
  // BACKEND_URL moved to server-side only for security (lib/proxy.ts)
  // Replit and Vercel proxy configuration
  async rewrites() {
    return [];
  },
  // Fix cross-origin issues for development
  ...(process.env.NODE_ENV === 'development' ? {
    crossOrigin: 'anonymous',
  } : {}),
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
      // CORS now handled by middleware.ts for proper origin validation
    ];
  },
  // Configure for Replit environment
  devIndicators: {
    buildActivity: false,
  },
  // Disable Next.js integrated ESLint to use ESLint 9 flat config
  eslint: {
    ignoreDuringBuilds: true,
  },
  // CORS origins now handled by middleware.ts with proper validation
  // Allow connections from any host (required for Replit proxy)
  async generateBuildId() {
    return 'replit-build';
  },
  // Experimental settings for Replit compatibility
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Output configuration for serverless functions
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
};

module.exports = nextConfig;