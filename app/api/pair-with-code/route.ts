
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://tramway.proxy.rlwy.net:12332';

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

    // Send to backend
    const response = await fetch(`${BACKEND_URL}/pair-with-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ number, code }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to pair device' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Pair with code error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
