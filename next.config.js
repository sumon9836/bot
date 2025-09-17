/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://interchange.proxy.rlwy.net:24084',
  },
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
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, Cookie' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, Cookie' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
    ];
  },
  // Configure for Replit environment
  devIndicators: {
    buildActivity: false,
  },
  // Allow cross-origin requests for Replit proxy
  allowedDevOrigins: ['http://localhost:5000', 'http://127.0.0.1:5000', 'http://0.0.0.0:5000'],
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