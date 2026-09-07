export class AppError extends Error {
 constructor(message: string, public statusCode: number, public code: string = 'INTERNAL_ERROR', public details?: Array<{ field: string; message: string }>) {
 super(message);
 this.name = 'AppError';
 Error.captureStackTrace(this, this.constructor);
 }
}

export class BadRequestError extends AppError {
 constructor(message: string = 'Bad request', details?: Array<{ field: string; message: string }>) {
 super(message, 400, 'BAD_REQUEST', details);
 this.name = 'BadRequestError';
 }
}

export class UnauthorizedError extends AppError {
 constructor(message: string = 'Unauthorized') {
 super(message, 401, 'UNAUTHORIZED');
 this.name = 'UnauthorizedError';
 }
}

export class ForbiddenError extends AppError {
 constructor(message: string = 'Forbidden') {
 super(message, 403, 'FORBIDDEN');
 this.name = 'ForbiddenError';
 }
}

export class NotFoundError extends AppError {
 constructor(resource: string = 'Resource') {
 super(`${resource} not found`, 404, 'NOT_FOUND');
 this.name = 'NotFoundError';
 }
}

export class ConflictError extends AppError {
 constructor(message: string = 'Conflict') {
 super(message, 409, 'CONFLICT');
 this.name = 'ConflictError';
 }
}

export class ValidationError extends AppError {
 constructor(message: string = 'Validation failed', details?: Array<{ field: string; message: string }>) {
 super(message, 422, 'VALIDATION_ERROR', details);
 this.name = 'ValidationError';
 }
}

export class RateLimitError extends AppError {
 constructor(message: string = 'Rate limit exceeded') {
 super(message, 429, 'RATE_LIMIT_EXCEEDED');
 this.name = 'RateLimitError';
 }
}

export class ServiceUnavailableError extends AppError {
 constructor(message: string = 'Service unavailable') {
 super(message, 503, 'SERVICE_UNAVAILABLE');
 this.name = 'ServiceUnavailableError';
 }
}

export class DatabaseError extends AppError {
 constructor(message: string = 'Database error') {
 super(message, 500, 'DATABASE_ERROR');
 this.name = 'DatabaseError';
 }
}

export class ExternalAPIError extends AppError {
 constructor(message: string = 'External API error') {
 super(message, 502, 'EXTERNAL_API_ERROR');
 this.name = 'ExternalAPIError';
 }
}