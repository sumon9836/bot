import { NextRequest, NextResponse } from 'next/server';
import { createProxy } from '../../../../lib/proxy';

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

    // If password matches, set authentication cookie and return success
    const response = NextResponse.json(
      { success: true, message: 'Login successful' },
      { status: 200 }
    );

    // Set secure authentication cookie
    response.cookies.set('admin_auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
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