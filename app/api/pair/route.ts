import { NextRequest } from 'next/server';
import { createProxy } from '../../../lib/proxy';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Internal function to check if a number is blocked using createProxy
async function isNumberBlocked(number: string, request: NextRequest): Promise<boolean> {
  try {
    // Clean the phone number for comparison
    const cleanNumber = number.replace(/[^0-9]/g, '');

    // Use createProxy to fetch blocklist for consistent HTTPS validation
    const response = await createProxy(request, '/blocklist', 'GET');

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
  const isBlocked = await isNumberBlocked(number, request);
  if (isBlocked) {
    return Response.json(
      { success: false, error: 'This number is banned from using the service' },
      { status: 403 }
    );
  }

  // Use createProxy for consistent HTTPS validation and error handling
  const endpoint = `/pair?number=${encodeURIComponent(number)}`;
  return createProxy(request, endpoint, 'GET');
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
    const isBlocked = await isNumberBlocked(number, request);
    if (isBlocked) {
      return Response.json(
        { success: false, error: 'This number is banned from using the service' },
        { status: 403 }
      );
    }

    // Use createProxy for consistent HTTPS validation and error handling
    const endpoint = `/pair?number=${encodeURIComponent(number)}`;
    return createProxy(request, endpoint, 'GET'); // Backend expects GET for pair operation
  } catch (error) {
    return Response.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}