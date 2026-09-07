import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import { config } from '../config/env';

export async function registerCors(app: Fastify): Promise<void> {
 await app.register(cors, {
 origin: config.server.corsOrigin,
 credentials: true,
 allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-Id'],
 exposedHeaders: ['X-Request-Id', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
 });
}

export async function registerRateLimit(app: Fastify): Promise<void> {
 await app.register(rateLimit, {
 global: true,
 windowMs: config.rateLimit.windowMs,
 max: config.rateLimit.maxRequests,
 keyGenerator: (request: FastifyRequest) => {
 const apiKey = request.headers['x-api-key'] as string | undefined;
 const authHeader = request.headers.authorization;
 if (apiKey) return `api:${apiKey}`;
 if (authHeader?.startsWith('Bearer ')) return `user:${authHeader.slice(7)}`;
 return `ip:${request.ip}`;
 },
 allowList: (request: FastifyRequest) => {
 const forwarded = request.headers['x-forwarded-for'];
 const ip = forwarded
 ? Array.isArray(forwarded)
 ? forwarded[0]
 : forwarded
 : request.ip;
 return ip === '127.0.0.1' || ip === '::1';
 },
 addHeaders: {
 rateLimit: true,
 remaining: true,
 reset: true,
 },
 });
}

export async function registerJwt(app: Fastify): Promise<void> {
 await app.register(jwt, {
 secret: config.jwt.secret,
 sign: {
 expiresIn: config.jwt.accessExpiry,
 },
 verify: {
 maxAge: config.jwt.refreshExpiry,
 },
 });
}
