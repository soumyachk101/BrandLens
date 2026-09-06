import { Router, Response, NextFunction } from 'express';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { getSupabaseClient, getServiceRoleClient } from '../../utils/supabase';
import { sendSuccess, sendError } from '../../utils/response';
import { config } from '../../../config/env';
import { AuthUser } from '../../types';

const supabase = getSupabaseClient();

export async function authenticate(
 req: Request,
 res: Response,
 next: NextFunction
): Promise<void> {
 try {
 const authHeader = req.headers.authorization;

 if (!authHeader || !authHeader.startsWith('Bearer ')) {
 throw createAuthError('Missing or invalid Authorization header', 'UNAUTHORIZED', 401);
 }

 const token = authHeader.slice(7);

 const { data, error } = await supabase.auth.getUser(token);

 if (error || !data.user) {
 throw createAuthError('Invalid or expired token', 'UNAUTHORIZED', 401);
 }

 const user = data.user;

 const { data: profile, error: profileError } = await supabase
 .from('agency_users')
 .select('agency_id, role, permissions')
 .eq('user_id', user.id)
 .maybeSingle();

 if (profileError || !profile) {
 throw createAuthError('User profile not found', 'FORBIDDEN', 403);
 }

 const agencyId = profile.agency_id;

 const { data: agency, error: agencyError } = await supabase
 .from('agencies')
 .select('id, plan')
 .eq('id', agencyId)
 .maybeSingle();

 if (agencyError || !agency) {
 throw createAuthError('Agency not found', 'FORBIDDEN', 403);
 }

 const authenticatedUser: AuthUser = {
 id: user.id,
 agency_id: agencyId,
 email: user.email || '',
 role: profile.role || 'viewer',
 permissions: Array.isArray(profile.permissions) ? profile.permissions : [],
 };

 (req as unknown as { user: AuthUser }).user = authenticatedUser;

 next();
 } catch (err) {
 const error = err as Error & { statusCode?: number; code?: string };
 next(createAuthError(error.message, error.code || 'UNAUTHORIZED', error.statusCode || 401));
 }
}

export async function authenticateApiKey(
 req: Request,
 res: Response,
 next: NextFunction
): Promise<void> {
 try {
 const apiKey = req.headers['x-api-key'];

 if (!apiKey || typeof apiKey !== 'string') {
 throw createAuthError('Missing x-api-key header', 'UNAUTHORIZED', 401);
 }

 const { data, error } = await supabase
 .from('agencies')
 .select('id, plan, name, api_key')
 .eq('api_key', apiKey)
 .maybeSingle();

 if (error || !data) {
 throw createAuthError('Invalid API key', 'UNAUTHORIZED', 401);
 }

 const authenticatedUser: AuthUser = {
 id: data.id,
 agency_id: data.id,
 email: '',
 role: 'admin',
 permissions: ['brands:read', 'brands:write', 'reports:read', 'reports:write'],
 };

 (req as unknown as { user: AuthUser }).user = authenticatedUser;

 next();
 } catch (err) {
 const error = err as Error & { statusCode?: number; code?: string };
 next(createAuthError(error.message, error.code || 'UNAUTHORIZED', error.statusCode || 401));
 }
}

export function requireRole(allowedRoles: string[]) {
 return (req: Request, res: Response, next: NextFunction) => {
 const user = (req as unknown as { user?: AuthUser }).user;

 if (!user) {
 res.status(401).json({
 success: false,
 error: {
 code: 'UNAUTHORIZED',
 message: 'Authentication required',
 request_id: getRequestId(req),
 },
 });
 return;
 }

 if (!allowedRoles.includes(user.role)) {
 res.status(403).json({
 success: false,
 error: {
 code: 'FORBIDDEN',
 message: 'Insufficient permissions',
 request_id: getRequestId(req),
 },
 });
 return;
 }

 next();
 };
}

export function requirePermission(permission: string) {
 return (req: Request, res: Response, next: NextFunction) => {
 const user = (req as unknown as { user?: AuthUser }).user;

 if (!user) {
 res.status(401).json({
 success: false,
 error: {
 code: 'UNAUTHORIZED',
 message: 'Authentication required',
 request_id: getRequestId(req),
 },
 });
 return;
 }

 if (!user.permissions.includes(permission) && user.role !== 'admin') {
 res.status(403).json({
 success: false,
 error: {
 code: 'FORBIDDEN',
 message: `Missing permission: ${permission}`,
 request_id: getRequestId(req),
 },
 });
 return;
 }

 next();
 };
}

function createAuthError(
 message: string,
 code: string,
 statusCode: number
): AppError {
 const error = new AppError(message, statusCode);
 (error as Error & { code: string }).code = code;
 return error;
}

function getRequestId(req: Request): string {
 return (req as unknown as { requestId?: string }).requestId || `req_${Date.now().toString(36)}`;
}

export class AppError extends Error {
 statusCode: number;
 code: string;
 details?: Array<{ field: string; message: string }>;

 constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: Array<{ field: string; message: string }>) {
 super(message);
 this.statusCode = statusCode;
 this.code = code;
 this.details = details;
 this.name = 'AppError';
 }
}
