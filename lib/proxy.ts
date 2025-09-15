import { NextRequest, NextResponse } from 'next/server';

// Production validation - check environment variable directly before applying defaults
if (process.env.NODE_ENV === 'production') {
  const envBackendUrl = process.env.BACKEND_URL;
  
  if (!envBackendUrl) {
    throw new Error('BACKEND_URL environment variable is required in production environment');
  }
  
  if (!envBackendUrl.startsWith('https://')) {
    throw new Error('BACKEND_URL must use HTTPS in production environment for security');
  }
}

const BACKEND_URL = process.env.BACKEND_URL || 'http://tramway.proxy.rlwy.net:12332';

export async function createProxy(
  request: NextRequest,
  endpoint: string,
  method: string = 'GET'
): Promise<NextResponse> {
  try {
    const url = `${BACKEND_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward cookies for authentication
    const cookies = request.headers.get('cookie');
    if (cookies) {
      headers['Cookie'] = cookies;
    }

    // Prepare request body
    let body: string | undefined;
    if (method !== 'GET' && request.body) {
      body = await request.text();
    }

    console.log(`Proxying ${method} request to: ${url}`);

    const response = await fetch(url, {
      method,
      headers,
      body,
      cache: 'no-store',
      // Add timeout for better error handling
      signal: AbortSignal.timeout(25000),
    });

    const responseText = await response.text();
    console.log(`Backend response status: ${response.status}`);

    // Try to parse as JSON, fallback to text
    let responseData: any;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    // Forward response with appropriate headers
    const responseHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0',
    };

    // Forward Set-Cookie headers for authentication
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      responseHeaders['Set-Cookie'] = setCookie;
    }

    return NextResponse.json(
      responseData,
      { 
        status: response.status,
        headers: responseHeaders
      }
    );

  } catch (error) {
    console.error('Proxy error:', error);
    console.error('Backend URL:', BACKEND_URL);
    console.error('Full URL:', `${BACKEND_URL}${endpoint}`);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Network error',
        message: `Failed to connect to backend server: ${error instanceof Error ? error.message : 'Unknown error'}`
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0'
        }
      }
    );
  }
}