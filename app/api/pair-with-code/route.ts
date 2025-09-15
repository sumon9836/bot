
import { NextRequest, NextResponse } from 'next/server';
import { createProxy } from '../../../lib/proxy';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { number, code } = body;

    if (!number || !code) {
      return NextResponse.json(
        { success: false, error: 'Phone number and code are required' },
        { status: 400 }
      );
    }

    // Use createProxy for consistent HTTPS validation and error handling
    const tempRequest = new Request(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify({ number, code })
    });
    
    return createProxy(tempRequest as NextRequest, '/pair-with-code', 'POST');

  } catch (error) {
    console.error('Pair with code error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
