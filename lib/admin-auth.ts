import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHmac } from 'crypto';

// JWT-like token system for serverless environments
interface TokenPayload {
  created: number;
  expires: number;
  type: 'admin';
}

function getSecret(): string {
  // For production, require JWT_SECRET to be set
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required for production');
    }
    return process.env.JWT_SECRET;
  }
  // For development, fallback to ADMIN_PASSWORD or default
  return process.env.JWT_SECRET || process.env.ADMIN_PASSWORD || 'dev-secret-not-for-production';
}

function createJWTLikeToken(payload: TokenPayload): string {
  const secret = getSecret();
  const data = JSON.stringify(payload);
  const signature = createHmac('sha256', secret).update(data).digest('hex');
  return Buffer.from(JSON.stringify({ data, signature })).toString('base64');
}

function verifyJWTLikeToken(token: string): TokenPayload | null {
  try {
    const secret = getSecret();
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const { data, signature } = decoded;
    
    // Verify signature
    const expectedSignature = createHmac('sha256', secret).update(data).digest('hex');
    if (signature !== expectedSignature) {
      return null;
    }
    
    const payload: TokenPayload = JSON.parse(data);
    
    // Check expiration
    if (payload.expires < Date.now()) {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
}

export function generateSecureToken(): string {
  const payload: TokenPayload = {
    created: Date.now(),
    expires: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    type: 'admin'
  };
  return createJWTLikeToken(payload);
}

export function createSession(token: string, expirationHours: number = 24): void {
  // Token creation is now handled in generateSecureToken
  // This function is kept for compatibility
}

export function validateSession(token: string): boolean {
  const payload = verifyJWTLikeToken(token);
  return payload !== null && payload.type === 'admin';
}

export function destroySession(token: string): void {
  // With JWT-like tokens, we can't really "destroy" them
  // They expire naturally. For immediate logout, we'd need a blacklist
  // For now, this is a no-op
}

export function isAdminAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get('admin_session')?.value;
  if (!token) {
    console.log('No admin session token found');
    return false;
  }
  
  console.log('Validating admin session token:', token.substring(0, 8) + '...');
  const isValid = validateSession(token);
  console.log('Session validation result:', isValid);
  return isValid;
}

export function requireAdminAuth(request: NextRequest): NextResponse | null {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json(
      { success: false, error: 'Admin authentication required' },
      { status: 401 }
    );
  }
  return null;
}

export function getSessionInfo(): { activeSessions: number; oldestSession: number | null } {
  // With JWT-like tokens, we can't track active sessions in memory
  // This is kept for compatibility but returns default values
  return {
    activeSessions: 0,
    oldestSession: null
  };
}