import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, generateTokens } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/response';
import { signupSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
 try {
 const body = await request.json();
 const parsed = signupSchema.safeParse(body);

 if (!parsed.success) {
 return errorResponse('VALIDATION_ERROR', 'Validation failed', 422, parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })));
 }

 const existing = await prisma.agencies.findFirst({ where: { email: parsed.data.email } });
 if (existing) {
 return errorResponse('VALIDATION_ERROR', 'An account with this email already exists', 422);
 }

 const password_hash = await hashPassword(parsed.data.password);
 const agency = await prisma.agencies.create({
 data: {
 name: parsed.data.name,
 email: parsed.data.email,
 password_hash,
 plan: 'starter',
 api_key: `sk_live_${crypto.randomUUID().replace(/-/g, '')}`,
 email_verified: true,
 },
 select: {
 id: true,
 name: true,
 email: true,
 plan: true,
 white_label_config: true,
 api_key: true,
 created_at: true,
 password_hash: false,
 },
 });

 const tokens = generateTokens(agency.id, agency.email, agency.plan);

 return successResponse({ agency, ...tokens }, undefined, 201);
 } catch (error) {
 console.error('Signup error:', error);
 return errorResponse('INTERNAL_ERROR', 'Failed to create account', 500);
 }
}
