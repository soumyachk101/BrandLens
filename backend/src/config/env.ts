import dotenv from 'dotenv';
import { AppError } from '../utils/response';

dotenv.config();

export const config = {
 server: {
 port: parseInt(process.env.PORT || '3000', 10),
 env: process.env.NODE_ENV || 'development',
 apiVersion: process.env.API_VERSION || 'v1',
 corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:3001').split(',').map((s) => s.trim()),
 },
 database: {
 url: process.env.DATABASE_URL || '',
 },
 redis: {
 url: process.env.REDIS_URL || 'redis://localhost:6379',
 },
 jwt: {
 secret: process.env.JWT_SECRET || '',
 accessExpiry: process.env.JWT_EXPIRY || '15m',
 refreshExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
 },
 openai: {
 apiKey: process.env.OPENAI_API_KEY || '',
 },
 anthropic: {
 apiKey: process.env.ANTHROPIC_API_KEY || '',
 },
 google: {
 apiKey: process.env.GOOGLE_API_KEY || '',
 },
 perplexity: {
 apiKey: process.env.PERPLEXITY_API_KEY || '',
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
 r2: {
 accountId: process.env.R2_ACCOUNT_ID || '',
 accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
 secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
 bucket: process.env.R2_BUCKET || '',
 },
 email: {
 apiKey: process.env.RESEND_API_KEY || '',
 from: process.env.EMAIL_FROM || 'noreply@brandlens.ai',
 },
 sentry: {
 dsn: process.env.SENTRY_DSN || '',
 environment: process.env.SENTRY_ENVIRONMENT || 'development',
 },
 rateLimit: {
 windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
 maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
 },
 logLevel: process.env.LOG_LEVEL || 'info',
};

export function validateConfig(): void {
 const required: Array<{ key: string; value: string }> = [
 { key: 'DATABASE_URL', value: config.database.url },
 { key: 'REDIS_URL', value: config.redis.url },
 { key: 'JWT_SECRET', value: config.jwt.secret },
 ];

 for (const item of required) {
 if (!item.value) {
 throw new AppError(`Missing required environment variable: ${item.key}`, 500);
 }
 }
}
