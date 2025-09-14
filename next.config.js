/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://tramway.proxy.rlwy.net:12332',
  },
  // Allow all hosts for Replit proxy environment
  async rewrites() {
    return [];
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
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