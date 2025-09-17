
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

// Backend URL configuration with fallback
const BACKEND_URL = process.env.BACKEND_URL || 'http://interchange.proxy.rlwy.net:24084';

export async function createProxy(request: NextRequest, endpoint: string, method: string = 'GET') {
  try {
    const url = `${BACKEND_URL}${endpoint}`;
    console.log(`Proxying ${method} request to: ${url}`);

    // Get request body for POST/PUT requests
    let body: string | undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        body = await request.text();
      } catch (err) {
        console.warn('Could not read request body:', err);
      }
    }

    // Copy headers from original request
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      // Skip headers that shouldn't be forwarded
      if (!['host', 'connection', 'transfer-encoding', 'content-length'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    // Set content type for POST requests
    if (body && !headers['content-type']) {
      headers['content-type'] = 'application/json';
    }

    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    console.log(`Backend response status: ${response.status}`);

    // Get response data
    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch (err) {
      // If not valid JSON, treat as plain text
      responseData = responseText;
    }

    console.log('Backend response data:', responseData);

    // Return the response
    return NextResponse.json(responseData, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error: any) {
    console.error('Proxy error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Proxy request failed',
        details: error.toString()
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
