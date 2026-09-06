import { NextResponse } from 'next/server';

export async function GET() {
 return NextResponse.json({
 success: true,
 data: [
 {
 platform: 'chatgpt',
 status: 'operational',
 latency_ms: 2100,
 last_checked: new Date().toISOString(),
 rate_limits: {
 requests_per_minute: 3500,
 tokens_per_minute: 150000,
 },
 },
 {
 platform: 'perplexity',
 status: 'operational',
 latency_ms: 1800,
 last_checked: new Date().toISOString(),
 rate_limits: {
 requests_per_minute: 50,
 tokens_per_minute: 200000,
 },
 },
 {
 platform: 'claude',
 status: 'operational',
 latency_ms: 2200,
 last_checked: new Date().toISOString(),
 rate_limits: {
 requests_per_minute: 4000,
 tokens_per_minute: 400000,
 },
 },
 {
 platform: 'gemini',
 status: 'operational',
 latency_ms: 1500,
 last_checked: new Date().toISOString(),
 rate_limits: {
 requests_per_minute: 60,
 tokens_per_minute: 320000,
 },
 },
 {
 platform: 'deepseek',
 status: 'operational',
 latency_ms: 1200,
 last_checked: new Date().toISOString(),
 rate_limits: {
 requests_per_minute: 200,
 tokens_per_minute: 100000,
 },
 },
 ],
 });
}
