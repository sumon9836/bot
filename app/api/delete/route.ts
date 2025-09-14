import { NextRequest } from 'next/server';
import { createProxy } from '../../../lib/proxy';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const number = searchParams.get('number');
  
  if (!number) {
    return Response.json(
      { success: false, error: 'Phone number is required' },
      { status: 400 }
    );
  }

  const endpoint = `/delete?number=${encodeURIComponent(number)}`;
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

    const endpoint = `/delete?number=${encodeURIComponent(number)}`;
    return createProxy(request, endpoint, 'GET'); // Backend expects GET for delete
  } catch (error) {
    return Response.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}