import { FastifyInstance, FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { ZodError } from 'zod';
import * as Sentry from '@sentry/node';
import { AppError } from '../utils/response';
import { config } from '../config/env';

export function registerErrorHandler(app: FastifyInstance): void {
 app.setErrorHandler((error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply) => {
 const requestId = (request as unknown as { requestId?: string }).requestId || 'unknown';

 // Log to console
 request.log.error({
 requestId,
 err: error,
 stack: error.stack,
 message: error.message,
 });

 // Report to Sentry for non-client errors
 if (!isClientError(error)) {
 Sentry.captureException(error, {
 extra: { requestId, url: request.url, method: request.method },
 });
 }

 // Handle specific error types
 if (error instanceof ZodError) {
 return reply.status(422).send({
 success: false,
 error: {
 code: 'VALIDATION_ERROR',
 message: 'Validation failed',
 details: error.errors.map((e) => ({
 field: e.path.join('.'),
 message: e.message,
 })),
 request_id: requestId,
 },
 });
 }

 if (error instanceof AppError) {
 return reply.status(error.statusCode).send({
 success: false,
 error: {
 code: error.code,
 message: error.message,
 details: error.details,
 request_id: requestId,
 },
 });
 }

 // Fastify validation errors
 if ('statusCode' in error && typeof error.statusCode === 'number' && error.statusCode < 500) {
 return reply.status(error.statusCode).send({
 success: false,
 error: {
 code: error.code || 'CLIENT_ERROR',
 message: error.message,
 request_id: requestId,
 },
 });
 }

 // Generic server error
 return reply.status(500).send({
 success: false,
 error: {
 code: 'INTERNAL_ERROR',
 message:
 config.server.env === 'production'
 ? 'An unexpected error occurred.'
 : error.message,
 details: config.server.env === 'production' ? undefined : error.stack ? [error.stack] : undefined,
 request_id: requestId,
 },
 });
 });
}

function isClientError(error: Error): boolean {
 if (error instanceof AppError && error.statusCode < 500) return true;
 if ('statusCode' in error && typeof (error as { statusCode?: number }).statusCode === 'number') {
 const status = (error as { statusCode: number }).statusCode;
 return status >= 400 && status < 500;
 }
 return false;
}