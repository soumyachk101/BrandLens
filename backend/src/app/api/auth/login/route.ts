import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, generateTokens } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/response';
import { z } from 'zod';

const loginSchema = z.object({
 email: z.string().email('Invalid email address'),
 password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
 try {
 const body = await request.json();
 const parsed = loginSchema.safeParse(body);

 if (!parsed.success) {
 return errorResponse('VALIDATION_ERROR', 'Validation failed', 422, parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })));
 }

 const agency = await prisma.agencies.findFirst({
 where: { email: parsed.data.email },
 });

 if (!agency) {
 return errorResponse('UNAUTHORIZED', 'Invalid email or password', 401);
 }

 const valid = await comparePassword(parsed.data.password, agency.password_hash);
 if (!valid) {
 return errorResponse('UNAUTHORIZED', 'Invalid email or password', 401);
 }

 await prisma.agencies.update({
 where: { id: agency.id },
 data: { last_login_at: new Date() },
 });

 const agencyData = {
 id: agency.id,
 name: agency.name,
 email: agency.email,
 plan: agency.plan,
 white_label_config: agency.white_label_config,
 api_key: agency.api_key,
 created_at: agency.created_at,
 };

 const tokens = generateTokens(agency.id, agency.email, agency.plan);

 return successResponse({ agency: agencyData, ...tokens });
 } catch (error) {
 console.error('Login error:', error);
 return errorResponse('INTERNAL_ERROR', 'Login failed', 500);
 }
}
