// BrandLens Error Logging Utility
// Centralized logging with levels and structured output

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
 level: LogLevel;
 message: string;
 timestamp: string;
 context?: Record<string, any>;
 error?: Error;
}

class Logger {
 private enabled: boolean;

 constructor() {
 this.enabled = true;
 }

 private formatLog(entry: LogEntry): void {
 const timestamp = entry.timestamp;
 const context = entry.context ? JSON.stringify(entry.context) : '';

 switch (entry.level) {
 case 'debug':
 console.debug(`[${timestamp}] [DEBUG] ${entry.message}`, context);
 break;
 case 'info':
 console.info(`[${timestamp}] [INFO] ${entry.message}`, context);
 break;
 case 'warn':
 console.warn(`[${timestamp}] [WARN] ${entry.message}`, context);
 break;
 case 'error':
 console.error(
 `[${timestamp}] [ERROR] ${entry.message}`,
 context,
 entry.error || ''
 );
 break;
 }
 }

 debug(message: string, context?: Record<string, any>): void {
 if (process.env.NODE_ENV !== 'production') {
 this.formatLog({
 level: 'debug',
 message,
 timestamp: new Date().toISOString(),
 context,
 });
 }
 }

 info(message: string, context?: Record<string, any>): void {
 this.formatLog({
 level: 'info',
 message,
 timestamp: new Date().toISOString(),
 context,
 });
 }

 warn(message: string, context?: Record<string, any>): void {
 this.formatLog({
 level: 'warn',
 message,
 timestamp: new Date().toISOString(),
 context,
 });
 }

 error(message: string, error?: Error, context?: Record<string, any>): void {
 this.formatLog({
 level: 'error',
 message,
 timestamp: new Date().toISOString(),
 context,
 error,
 });

 // Send to Sentry in production
 if (process.env.NODE_ENV === 'production' && error) {
 import('./sentry').then(({ Sentry }) => {
 Sentry.Sentry.captureException(error, {
 extra: context,
 tags: { message },
 });
 });
 }
 }
}

export const logger = new Logger();
