import dotenv from 'dotenv';
import { AppError } from '../utils/response';

dotenv.config();

export const config = {
 server: {
 port: parseInt(process.env.PORT || '3000', 10),
 env: process.env.NODE_ENV || 'development',
 apiVersion: process.env.API_VERSION || 'v1',
 },
 supabase: {
 url: process.env.SUPABASE_URL || '',
 anonKey: process.env.SUPABASE_ANON_KEY || '',
 serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
 },
 redis: {
 url: process.env.REDIS_URL || 'redis://localhost:6379',
 },
 openai: {
 apiKey: process.env.OPENAI_API_KEY || '',
 },
 anthropic: {
 apiKey: process.env.ANTHROPIC_API_KEY || '',
 },
 stripe: {
 secretKey: process.env.STRIPE_SECRET_KEY || '',
 webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
 prices: {
 starter: process.env.STRIPE_PRICE_STARTER || '',
 growth: process.env.STRIPE_PRICE_GROWTH || '',
 enterprise: process.env.STRIPE_PRICE_ENTERPRISE || '',
 },
 },
 s3: {
 bucket: process.env.S3_BUCKET || '',
 region: process.env.S3_REGION || 'us-east-1',
 accessKey: process.env.S3_ACCESS_KEY || '',
 secretKey: process.env.S3_SECRET_KEY || '',
 },
 email: {
 apiKey: process.env.RESEND_API_KEY || '',
 from: process.env.EMAIL_FROM || 'noreply@brandlens.ai',
 },
 rateLimit: {
 windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
 maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
 },
 cors: {
 origin: (process.env.CORS_ORIGIN || 'http://localhost:3001').split(',').map(s => s.trim()),
 },
 jwt: {
 secret: process.env.JWT_SECRET || '',
 accessExpiry: process.env.JWT_EXPIRY || '15m',
 refreshExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
 },
};

export function validateConfig(): void {
 const required = [
 { key: 'SUPABASE_URL', value: config.supabase.url },
 { key: 'SUPABASE_ANON_KEY', value: config.supabase.anonKey },
 { key: 'SUPABASE_SERVICE_ROLE_KEY', value: config.supabase.serviceRoleKey },
 { key: 'REDIS_URL', value: config.redis.url },
 { key: 'JWT_SECRET', value: config.jwt.secret },
 ];

 for (const item of required) {
 if (!item.value) {
 throw new AppError(`Missing required environment variable: ${item.key}`, 500);
 }
 }
}
