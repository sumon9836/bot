import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

// In-memory session store (in production, use Redis or database)
const activeSessions = new Map<string, { expires: number; created: number }>();

// Clean up expired sessions every hour
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(activeSessions.entries());
  for (const [token, session] of entries) {
    if (session.expires < now) {
      activeSessions.delete(token);
    }
  }
}, 60 * 60 * 1000); // 1 hour

export function generateSecureToken(): string {
  return randomBytes(32).toString('hex');
}

export function createSession(token: string, expirationHours: number = 24): void {
  const now = Date.now();
  const expires = now + (expirationHours * 60 * 60 * 1000);
  
  activeSessions.set(token, {
    expires,
    created: now
  });
}

export function validateSession(token: string): boolean {
  const session = activeSessions.get(token);
  if (!session) {
    return false;
  }
  
  if (session.expires < Date.now()) {
    activeSessions.delete(token);
    return false;
  }
  
  return true;
}

export function destroySession(token: string): void {
  activeSessions.delete(token);
}

export function isAdminAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get('admin_session')?.value;
  if (!token) {
    return false;
  }
  
  return validateSession(token);
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
  const now = Date.now();
  let oldestSession: number | null = null;
  
  const sessions = Array.from(activeSessions.values());
  for (const session of sessions) {
    if (oldestSession === null || session.created < oldestSession) {
      oldestSession = session.created;
    }
  }
  
  return {
    activeSessions: activeSessions.size,
    oldestSession
  };
}