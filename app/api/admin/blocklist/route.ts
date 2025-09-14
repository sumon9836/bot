import { NextRequest } from 'next/server';
import { createProxy } from '../../../../lib/proxy';

export async function GET(request: NextRequest) {
  // Admin blocklist requires authentication - proxy handles cookie forwarding
  const endpoint = '/blocklist';
  return createProxy(request, endpoint, 'GET');
}

export async function POST(request: NextRequest) {
  // Admin blocklist requires authentication - proxy handles cookie forwarding  
  const endpoint = '/blocklist';
  return createProxy(request, endpoint, 'GET'); // Backend expects GET for blocklist
}