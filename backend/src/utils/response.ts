import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { AppError, NotFoundError } from './errors';

export function successResponse<T>(
 reply: FastifyReply,
 data: T,
 statusCode = 200,
 meta?: Record<string, unknown>,
): void {
 const body: Record<string, unknown> = { success: true, data };
 if (meta) body.meta = meta;
 reply.status(statusCode).send(body);
}

export function errorResponse(
 reply: FastifyReply,
 message: string,
 statusCode = 500,
 code = 'INTERNAL_ERROR',
 details?: Array<{ field: string; message: string }>,
 requestId?: string,
): void {
 reply.status(statusCode).send({
 success: false,
 error: {
 code,
 message,
 details: details || [],
 request_id: requestId || 'unknown',
 },
 });
}

export function handleZodError(error: z.ZodError): AppError {
 const details = error.errors.map((e) => ({
 field: e.path.join('.'),
 message: e.message,
 }));
 return new AppError('Validation failed', 422, 'VALIDATION_ERROR', details);
}

export function paginatedResponse<T>(
 reply: FastifyReply,
 data: T[],
 page: number,
 limit: number,
 total: number,
): void {
 const totalPages = Math.ceil(total / limit);
 successResponse(reply, data, 200, { page, limit, total, total_pages: totalPages });
}

export function notFoundResponse(reply: FastifyReply, resource: string): void {
 errorResponse(reply, `${resource} not found`, 404, 'NOT_FOUND');
}

export function badRequestResponse(reply: FastifyReply, message: string): void {
 errorResponse(reply, message, 400, 'BAD_REQUEST');
}

export function unauthorizedResponse(reply: FastifyReply): void {
 errorResponse(reply, 'Unauthorized', 401, 'UNAUTHORIZED');
}

export function forbiddenResponse(reply: FastifyReply): void {
 errorResponse(reply, 'Forbidden', 403, 'FORBIDDEN');
}

export function createdResponse<T>(reply: FastifyReply, data: T): void {
 successResponse(reply, data, 201);
}

export function acceptedResponse<T>(reply: FastifyReply, data: T): void {
 successResponse(reply, data, 202);
}

export function noContentResponse(reply: FastifyReply): void {
 reply.status(204).send();
}
