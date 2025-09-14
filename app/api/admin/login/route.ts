import { NextRequest } from 'next/server';
import { createProxy } from '../../../../lib/proxy';

export async function POST(request: NextRequest) {
  const endpoint = '/admin/login';
  return createProxy(request, endpoint, 'POST');
}