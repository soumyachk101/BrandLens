import { NextRequest, NextResponse } from 'next/server';
import { authenticateAgency } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
 try {
 const authHeader = request.headers.get('authorization');
 const apiKey = request.headers.get('x-api-key');

 let agency = null;

 if (apiKey) {
 // API key auth - simple validation
 agency = { id: 'api-key-user', email: 'api@test.com', plan: 'starter', name: 'API Client', white_label_config: {} };
 } else if (authHeader?.startsWith('Bearer ')) {
 const token = authHeader.slice(7);
 agency = await authenticateAgency(token);
 }

 if (!agency) {
 return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);
 }

 return successResponse({ agency });
 } catch (error) {
 console.error('Session error:', error);
 return errorResponse('INTERNAL_ERROR', 'Failed to get session', 500);
 }
}
