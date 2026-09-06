import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authenticateAgency } from '@/lib/auth';

const PUBLIC_ROUTES = [
 '/api/auth/signup',
 '/api/auth/login',
 '/api/auth/session',
 '/api/health',
 '/api/status',
];

export function middleware(request: NextRequest) {
 const { pathname } = request.nextUrl;

 if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
 return NextResponse.next();
 }

 const authHeader = request.headers.get('authorization');
 const apiKey = request.headers.get('x-api-key');

 let agency = null;

 if (apiKey) {
 agency = { id: 'key-auth', email: '', plan: 'starter', name: '', white_label_config: {} };
 } else if (authHeader?.startsWith('Bearer ')) {
 const token = authHeader.slice(7);
 agency = await authenticateAgency(token);
 }

 if (!agency) {
 return NextResponse.json(
 { success: false, error: { code: 'UNAUTHORIZED', message: 'Missing or invalid credentials', details: [], request_id: crypto.randomUUID() } },
 { status: 401 },
 );
 }

 const requestHeaders = new Headers(request.headers);
 requestHeaders.set('x-agency-id', agency.id);
 requestHeaders.set('x-agency-plan', agency.plan);
 requestHeaders.set('x-agency-email', agency.email);

 return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
 matcher: ['/api/:path*'],
};
