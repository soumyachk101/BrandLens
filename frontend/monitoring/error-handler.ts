// BrandLens API Error Handler Middleware
// Centralized error handling with Sentry integration

import { FastifyRequest, FastifyReply } from 'fastify';
import * as Sentry from '../monitoring/sentry';

export interface AppError extends Error {
 statusCode?: number;
 code?: string;
 isOperational?: boolean;
}

export class BrandLensError extends Error implements AppError {
 statusCode: number;
 code: string;
 isOperational: boolean;

 constructor(
 message: string,
 statusCode: number = 500,
 code: string = 'INTERNAL_ERROR',
 isOperational: boolean = true
 ) {
 super(message);
 this.statusCode = statusCode;
 this.code = code;
 this.isOperational = isOperational;

 Error.captureStackTrace(this, this.constructor);
 }
}

// Common error types
export class ValidationError extends BrandLensError {
 constructor(message: string) {
 super(message, 400, 'VALIDATION_ERROR');
 }
}

export class AuthenticationError extends BrandLensError {
 constructor(message: string = 'Authentication required') {
 super(message, 401, 'AUTHENTICATION_ERROR');
 }
}

export class AuthorizationError extends BrandLensError {
 constructor(message: string = 'Insufficient permissions') {
 super(message, 403, 'AUTHORIZATION_ERROR');
 }
}

export class NotFoundError extends BrandLensError {
 constructor(message: string = 'Resource not found') {
 super(message, 404, 'NOT_FOUND');
 }
}

export class RateLimitError extends BrandLensError {
 constructor(message: string = 'Rate limit exceeded') {
 super(message, 429, 'RATE_LIMIT_EXCEEDED');
 }
}

export class ExternalAPIError extends BrandLensError {
 constructor(message: string, service: string) {
 super(`${service}: ${message}`, 502, 'EXTERNAL_API_ERROR');
 }
}

// Error handler middleware
export function errorHandler(
 error: AppError,
 request: FastifyRequest,
 reply: FastifyReply
): void {
 const statusCode = error.statusCode || 500;
 const code = error.code || 'INTERNAL_ERROR';

 // Log to Sentry in production
 if (process.env.NODE_ENV === 'production' && Sentry.Sentry.Hub) {
 Sentry.Sentry.captureException(error, {
 tags: {
 endpoint: request.url,
 method: request.method,
 code,
 },
 extra: {
 body: request.body,
 query: request.query,
 },
 });
 }

 // Log to console in development
 if (process.env.NODE_ENV !== 'production') {
 console.error(`[${request.method}] ${request.url}`, error);
 }

 const response: any = {
 error: {
 code,
 message: error.message || 'Internal server error',
 },
 };

 // Include stack trace in development
 if (process.env.NODE_ENV !== 'production' && error.stack) {
 response.error.stack = error.stack;
 }

 reply.status(statusCode).send(response);
}

// Not found handler
export function notFoundHandler(
 request: FastifyRequest,
 reply: FastifyReply
): void {
 reply.status(404).send({
 error: {
 code: 'NOT_FOUND',
 message: `Route ${request.method}:${request.url} not found`,
 },
 });
}
