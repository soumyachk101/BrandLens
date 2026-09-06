import { z } from 'zod';
import { handleZodError } from './response';

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
 try {
 return schema.parse(data);
 } catch (error) {
 if (error instanceof z.ZodError) {
 throw handleZodError(error);
 }
 throw error;
 }
}

export function validateQuery<T>(schema: z.ZodSchema<T>, query: Record<string, unknown>): T {
 return validate(schema, query);
}

export function validateBody<T>(schema: z.ZodSchema<T>, body: Record<string, unknown>): T {
 return validate(schema, body);
}

export function validateParams<T>(schema: z.ZodSchema<T>, params: Record<string, unknown>): T {
 return validate(schema, params);
}

// Common validation schemas
export const uuidSchema = z.string().uuid();
export const paginationSchema = z.object({
 page: z.coerce.number().int().positive().default(1),
 limit: z.coerce.number().int().positive().max(100).default(20),
 sort: z.string().optional(),
 order: z.enum(['asc', 'desc']).default('desc'),
});

export const dateRangeSchema = z.object({
 from: z.string().datetime().optional(),
 to: z.string().datetime().optional(),
});
