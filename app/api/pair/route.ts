import { NextRequest } from 'next/server';
import { createProxy } from '../../../lib/proxy';

const BACKEND_URL = process.env.BACKEND_URL || 'http://tramway.proxy.rlwy.net:12332';

// Internal function to check if a number is blocked
async function isNumberBlocked(number: string): Promise<boolean> {
  try {
    // Clean the phone number for comparison
    const cleanNumber = number.replace(/[^0-9]/g, '');

    // Fetch blocklist from backend internally
    const response = await fetch(`${BACKEND_URL}/blocklist`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      // If we can't check blocklist, allow the attempt (backend will handle it)
      return false;
    }

    const blockedUsers = await response.json();

    // Check if user is in the blocklist
    if (typeof blockedUsers === 'object' && blockedUsers !== null) {
      return !!blockedUsers[cleanNumber];
    }

    return false;
  } catch (error) {
    console.error('Error checking blocklist:', error);
    // If we can't check, allow the attempt (backend will handle it)
    return false;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const number = searchParams.get('number');

  if (!number) {
    return Response.json(
      { success: false, error: 'Phone number is required' },
      { status: 400 }
    );
  }

  // Check if number is blocked before forwarding to backend
  const isBlocked = await isNumberBlocked(number);
  if (isBlocked) {
    return Response.json(
      { success: false, error: 'This number is banned from using the service' },
      { status: 403 }
    );
  }

  try {
    const response = await fetch(`${BACKEND_URL}/pair?number=${encodeURIComponent(number)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return Response.json(
        { success: false, error: result.error || 'Failed to get pairing code' },
        { status: response.status }
      );
    }

    return Response.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Pair API error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { number } = body;

    if (!number) {
      return Response.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Check if number is blocked before forwarding to backend
    const isBlocked = await isNumberBlocked(number);
    if (isBlocked) {
      return Response.json(
        { success: false, error: 'This number is banned from using the service' },
        { status: 403 }
      );
    }

    try {
      const response = await fetch(`${BACKEND_URL}/pair?number=${encodeURIComponent(number)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        return Response.json(
          { success: false, error: result.error || 'Failed to get pairing code' },
          { status: response.status }
        );
      }

      return Response.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Pair API error:', error);
      return Response.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      );
    }
  } catch (error) {
    return Response.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}