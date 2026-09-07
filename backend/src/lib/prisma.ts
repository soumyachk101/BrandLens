import { PrismaClient, Prisma } from '@prisma/client';

declare global {
 var __prisma: PrismaClient | undefined;
}

export const prisma =
 global.__prisma ??
 new PrismaClient({
 log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
 });

if (process.env.NODE_ENV !== 'production') {
 global.__prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
 try {
 await prisma.$connect();
 } catch (error) {
 console.error('Failed to connect to database:', error);
 throw error;
 }
}

export async function disconnectDatabase(): Promise<void> {
 try {
 await prisma.$disconnect();
 } catch (error) {
 console.error('Failed to disconnect from database:', error);
 }
}

export async function checkDatabaseHealth(): Promise<boolean> {
 try {
 await prisma.$queryRaw`SELECT 1`;
 return true;
 } catch {
 return false;
 }
}

export type { Prisma };
export { PrismaClient } from '@prisma/client';