// BrandLens Sentry Integration
// Setup: import { initSentry } from './sentry' in main entry point

import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export function initSentry(): void {
 if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
 Sentry.init({
 dsn: process.env.SENTRY_DSN,
 environment: process.env.NODE_ENV,
 release: process.env.npm_package_version || '0.0.0',

 // Performance monitoring
 tracesSampleRate: 0.1, // 10% of transactions
 profilesSampleRate: 0.1, // 10% of profiles

 integrations: [
 nodeProfilingIntegration(),
 ],

 // Filter out noise
 ignoreErrors: [
 'ValidationError',
 'ZodError',
 ],

 // Before sending events
 beforeSend(event, hint) {
 // Scrub sensitive data
 if (event.request) {
 delete event.request.cookies;
 if (event.request.headers) {
 delete event.request.headers.authorization;
 delete event.request.headers['x-api-key'];
 }
 }
 return event;
 },

 // Enable debug logging in development
 debug: process.env.NODE_ENV !== 'production',
 });
 }
}

export { Sentry };
