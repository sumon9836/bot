/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://tramway.proxy.rlwy.net:12332',
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
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
          // More restrictive CORS for production
          { key: 'Access-Control-Allow-Origin', value: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '*' },
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
  // Allow connections from any host (required for Replit proxy)
  async generateBuildId() {
    return 'replit-build';
  },
};

module.exports = nextConfig;