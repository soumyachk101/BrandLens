import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface JWTPayload {
 sub: string;
 agency_id: string;
 plan: string;
 role: string;
 permissions: string[];
 iat: number;
 exp: number;
}

export function generateTokens(agencyId: string, email: string, plan: string) {
 const payload = {
 sub: agencyId,
 agency_id: agencyId,
 plan,
 role: 'admin',
 permissions: ['brands:read', 'brands:write', 'reports:read', 'reports:write'],
 };

 const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
 const refreshToken = jwt.sign({ ...payload, type: 'refresh' }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

 return { access_token: accessToken, refresh_token: refreshToken };
}

export function verifyAccessToken(token: string): JWTPayload | null {
 try {
 return jwt.verify(token, JWT_SECRET) as JWTPayload;
 } catch {
 return null;
 }
}

export function hashPassword(password: string): Promise<string> {
 return bcrypt.hash(password, 10);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
 return bcrypt.compare(password, hash);
}

export async function getAgencyByApiKey(apiKey: string) {
 return prisma.agencies.findFirst({
 where: { api_key: apiKey, email_verified: true },
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
}

export async function authenticateAgency(token: string | null) {
 if (!token) return null;

 try {
 const payload = verifyAccessToken(token);
 if (!payload) return null;

 const agency = await prisma.agencies.findFirst({
 where: { id: payload.sub, email_verified: true },
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

 return agency;
 } catch {
 return null;
 }
}
