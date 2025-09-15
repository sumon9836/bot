import { NextRequest } from 'next/server';
import { createProxy } from '../../../../lib/proxy';
import { requireAdminAuth } from '../../../../lib/admin-auth';

export async function POST(request: NextRequest) {
  // Check admin authentication
  const authError = requireAdminAuth(request);
  if (authError) {
    return authError;
  }

  try {
    const body = await request.json();
    const { number } = body;

    if (!number) {
      return Response.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const endpoint = `/block?number=${encodeURIComponent(number)}`;
    const proxyResponse = await createProxy(request, endpoint, 'GET');
    
    // Ensure consistent response format for frontend
    if (proxyResponse.status === 200) {
      return Response.json({ success: true, message: 'User blocked successfully' });
    } else {
      const errorData = await proxyResponse.json();
      return Response.json({ success: false, error: errorData.error || 'Failed to block user' }, { status: proxyResponse.status });
    }
  } catch (error) {
    return Response.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}