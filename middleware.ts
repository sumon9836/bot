import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return handleCorsForApi(request);
  }

  return NextResponse.next();
}

function handleCorsForApi(request: NextRequest) {
  const response = NextResponse.next();

  // Get allowed origins from environment - production requires explicit configuration
  let allowedOrigins: string[] = [];
  
  if (process.env.ALLOWED_ORIGINS) {
    allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
  } else if (process.env.NODE_ENV === 'production') {
    // In production, require explicit ALLOWED_ORIGINS configuration
    console.error('CORS Error: ALLOWED_ORIGINS environment variable is required in production');
    allowedOrigins = []; // Deny all by default in production
  } else {
    // Development defaults only
    allowedOrigins = [
      'http://localhost:5000',
      'http://127.0.0.1:5000',
      'http://0.0.0.0:5000',
    ];
  }

  // Add current Replit domain if available
  if (process.env.REPLIT_DOMAINS) {
    const replitDomains = process.env.REPLIT_DOMAINS.split(',');
    replitDomains.forEach(domain => {
      allowedOrigins.push(`https://${domain}`);
    });
  }

  const origin = request.headers.get('origin');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const preflightResponse = new NextResponse(null, { status: 200 });
    
    if (origin && allowedOrigins.includes(origin)) {
      preflightResponse.headers.set('Access-Control-Allow-Origin', origin);
      preflightResponse.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    
    preflightResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    preflightResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    preflightResponse.headers.set('Access-Control-Max-Age', '86400');
    preflightResponse.headers.set('Cache-Control', 'no-store, max-age=0');
    
    return preflightResponse;
  }

  // Set CORS headers for actual requests
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  response.headers.set('Vary', 'Origin');

  return response;
}

export const config = {
  matcher: '/api/:path*',
};