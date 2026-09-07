import * as Sentry from '@sentry/node';
import { config } from '../../config/env';

export function initSentry(): void {
 if (!config.sentry.dsn) {
 console.log('[Sentry] DSN not configured, skipping initialization');
 return;
 }

 Sentry.init({
 dsn: config.sentry.dsn,
 environment: config.sentry.environment,
 tracesSampleRate: config.server.env === 'production' ? 0.1 : 1.0,
 profilesSampleRate: config.server.env === 'production' ? 0.1 : 1.0,
 ignoreErrors: [
 'ValidationError',
 'ZodError',
 'ECONNREFUSED',
 'ECONNRESET',
 'EPIPE',
 'ERR_TLS_CERT_ALTNAME_INVALID',
 ],
 beforeSend(event) {
 // Filter out sensitive data
 if (event.request) {
 delete event.request.cookies;
 delete event.request.headers?.authorization;
 delete event.request.headers?.['x-api-key'];
 }
 return event;
 },
 });

 console.log('[Sentry] Initialized successfully');
}

export { Sentry };