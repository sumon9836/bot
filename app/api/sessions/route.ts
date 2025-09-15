import { NextRequest } from 'next/server';
import { createProxy } from '../../../lib/proxy';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const endpoint = '/sessions';
  return createProxy(request, endpoint, 'GET');
}