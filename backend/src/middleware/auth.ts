import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient, getServiceRoleClient } from '../../utils/supabase';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, createdResponse, handleZodError } from '../../utils/response';
import { AppError, NotFoundError } from '../../utils/errors';
import { AuthUser, ApiResponse } from '../../types';
import { config } from '../../config/env';

const supabase = getSupabaseClient();

export async function authenticate(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
 const authHeader = request.headers.authorization;

 if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
 throw new AppError('Missing or invalid Authorization header', 401, 'UNAUTHORIZED');
 }

 const token = authHeader.slice(7);

 try {
 const { data, error } = await supabase!.auth.getUser(token);

 if (error || !data.user) {
 throw new AppError('Invalid or expired token', 401, 'UNAUTHORIZED');
 }

 const user = data.user;

 const { data: profile, error: profileError } = await supabase!
 .from('agency_users')
 .select('agency_id, role, permissions')
 .eq('user_id', user.id)
 .maybeSingle();

 if (profileError || !profile) {
 throw new AppError('User profile not found', 403, 'FORBIDDEN');
 }

 const agencyId = profile.agency_id;

 const { data: agency, error: agencyError } = await supabase!
 .from('agencies')
 .select('id, plan')
 .eq('id', agencyId)
 .maybeSingle();

 if (agencyError || !agency) {
 throw new AppError('Agency not found', 403, 'FORBIDDEN');
 }

 const authenticatedUser: AuthUser = {
 id: user.id,
 agency_id: agencyId,
 email: user.email || '',
 role: profile.role || 'viewer',
 permissions: Array.isArray(profile.permissions) ? profile.permissions : [],
 };

 (request as unknown as { user: AuthUser }).user = authenticatedUser;
 } catch (err) {
 if (err instanceof AppError) throw err;
 throw new AppError('Authentication failed', 401, 'UNAUTHORIZED');
 }
}

export async function authenticateApiKey(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
 const apiKey = request.headers['x-api-key'];

 if (!apiKey || typeof apiKey !== 'string') {
 throw new AppError('Missing x-api-key header', 401, 'UNAUTHORIZED');
 }

 try {
 const { data, error } = await supabase!
 .from('agencies')
 .select('id, plan, name, api_key')
 .eq('api_key', apiKey)
 .maybeSingle();

 if (error || !data) {
 throw new AppError('Invalid API key', 401, 'UNAUTHORIZED');
 }

 const authenticatedUser: AuthUser = {
 id: data.id,
 agency_id: data.id,
 email: '',
 role: 'admin',
 permissions: ['brands:read', 'brands:write', 'reports:read', 'reports:write'],
 };

 (request as unknown as { user: AuthUser }).user = authenticatedUser;
 } catch (err) {
 if (err instanceof AppError) throw err;
 throw new AppError('Authentication failed', 401, 'UNAUTHORIZED');
 }
}

export function requireRole(allowedRoles: string[]) {
 return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
 const user = (request as unknown as { user?: AuthUser }).user;

 if (!user) {
 throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
 }

 if (!allowedRoles.includes(user.role)) {
 throw new AppError('Insufficient permissions', 403, 'FORBIDDEN');
 }
 };
}

export function requirePermission(permission: string) {
 return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
 const user = (request as unknown as { user?: AuthUser }).user;

 if (!user) {
 throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
 }

 if (!user.permissions.includes(permission) && user.role !== 'admin') {
 throw new AppError(`Missing permission: ${permission}`, 403, 'FORBIDDEN');
 }
 };
}