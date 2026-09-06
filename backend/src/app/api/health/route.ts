import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
 try {
 await prisma.$queryRaw`SELECT 1`;

 return NextResponse.json({
 status: 'healthy',
 version: '0.1.0',
 timestamp: new Date().toISOString(),
 services: {
 database: 'healthy',
 },
 });
 } catch {
 return NextResponse.json(
 {
 status: 'unhealthy',
 version: '0.1.0',
 timestamp: new Date().toISOString(),
 services: {
 database: 'unhealthy',
 },
 },
 { status: 503 },
 );
 }
}
