import { NextRequest, NextResponse } from 'next/server';
import { generateSecureToken, createSession } from '../../../../lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { password } = body;

    // Check if ADMIN_PASSWORD is set and matches
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      return NextResponse.json(
        { success: false, error: 'Admin authentication not configured' },
        { status: 500 }
      );
    }

    if (!password || password.trim() !== adminPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin password' },
        { status: 401 }
      );
    }

    // Generate secure session token (JWT-like)
    const sessionToken = generateSecureToken(); // Already includes 24 hours expiry

    // If password matches, set secure authentication cookie and return success
    const response = NextResponse.json(
      { success: true, message: 'Login successful' },
      { status: 200 }
    );

    // Set secure session cookie
    const isProduction = !!(process.env.VERCEL || process.env.NODE_ENV === 'production');
    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: isProduction, // Secure cookies for production (HTTPS)
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error during authentication' },
      { status: 500 }
    );
  }
}