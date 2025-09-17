import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHmac } from 'crypto';

// JWT-like token system for serverless environments
const SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'default-secret-key-change-in-production';

export interface TokenPayload {
  exp: number;
  iat: number;
  admin: boolean;
}

export function generateSecureToken(): string {
  const payload: TokenPayload = {
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    iat: Math.floor(Date.now() / 1000),
    admin: true
  };

  const header = Buffer.from(JSON.stringify({ typ: 'JWT', alg: 'HS256' })).toString('base64url');
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', SECRET_KEY).update(`${header}.${payloadStr}`).digest('base64url');

  return `${header}.${payloadStr}.${signature}`;
}

export function verifyToken(token: string): boolean {
  try {
    const [header, payload, signature] = token.split('.');

    if (!header || !payload || !signature) {
      return false;
    }

    // Verify signature
    const expectedSignature = createHmac('sha256', SECRET_KEY).update(`${header}.${payload}`).digest('base64url');
    if (signature !== expectedSignature) {
      return false;
    }

    // Check expiration
    const decodedPayload: TokenPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());
    const now = Math.floor(Date.now() / 1000);

    if (decodedPayload.exp < now) {
      return false;
    }

    return decodedPayload.admin === true;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

export function createSession(sessionToken: string): string {
  return sessionToken;
}

export function requireAdminAuth(request: NextRequest): NextResponse | null {
  const sessionCookie = request.cookies.get('admin_session');

  if (!sessionCookie || !sessionCookie.value) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  if (!verifyToken(sessionCookie.value)) {
    return NextResponse.json(
      { success: false, error: 'Invalid or expired session' },
      { status: 401 }
    );
  }

  return null; // Authentication successful
}