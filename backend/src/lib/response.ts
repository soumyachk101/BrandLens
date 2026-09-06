import { NextResponse } from 'next/server';

export function successResponse<T>(data: T, meta?: Record<string, any>, statusCode = 200): NextResponse {
 const body: any = { success: true, data };
 if (meta) body.meta = meta;
 return NextResponse.json(body, { status: statusCode });
}

export function errorResponse(
 code: string,
 message: string,
 statusCode: number,
 details?: any[],
): NextResponse {
 return NextResponse.json(
 {
 success: false,
 error: {
 code,
 message,
 details: details || [],
 request_id: crypto.randomUUID(),
 },
 },
 { status: statusCode },
 );
}
