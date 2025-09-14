import { NextRequest } from 'next/server';
import { createProxy } from '../../../../lib/proxy';
import { requireAdminAuth } from '../../../../lib/admin-auth';

export async function GET(request: NextRequest) {
  // Check admin authentication
  const authError = requireAdminAuth(request);
  if (authError) {
    return authError;
  }

  // Admin authenticated - proceed with blocklist request
  const endpoint = '/blocklist';
  return createProxy(request, endpoint, 'GET');
}

export async function POST(request: NextRequest) {
  // Check admin authentication
  const authError = requireAdminAuth(request);
  if (authError) {
    return authError;
  }

  // Admin authenticated - proceed with blocklist request
  const endpoint = '/blocklist';
  return createProxy(request, endpoint, 'GET'); // Backend expects GET for blocklist
}