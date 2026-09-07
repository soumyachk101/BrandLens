import OpenAI from 'openai';
import { config } from '../../config/env';

const openaiClient = new OpenAI({
 apiKey: config.perplexity.apiKey || 'demo',
 baseURL: 'https://api.perplexity.ai',
});

export interface PerplexityOptions {
 model?: string;
 temperature?: number;
 maxTokens?: number;
 topP?: number;
}

export interface PerplexityResult {
 content: string;
 model: string;
 tokensUsed: {
 prompt: number;
 completion: number;
 total: number;
 };
 latencyMs: number;
 citations?: string[];
}

const DEFAULT_MODEL = 'llama-3.1-sonar-large-128k-online';
const DEFAULT_OPTIONS: Required<Omit<PerplexityOptions, 'model'>> = {
 temperature: 0.7,
 maxTokens: 4096,
 topP: 1,
};

export async function perplexityChat(
 messages: Array<{ role: string; content: string }>,
 options: PerplexityOptions = {},
): Promise<PerplexityResult> {
 const model = options.model || DEFAULT_MODEL;
 const opts = { ...DEFAULT_OPTIONS, ...options };
 const startTime = Date.now();

 try {
 const response = await openaiClient.chat.completions.create({
 model,
 messages,
 temperature: opts.temperature,
 max_tokens: opts.maxTokens,
 top_p: opts.topP,
 });

 const content = response.choices[0]?.message?.content ?? '';
 const usage = response.usage;

 return {
 content,
 model: response.model,
 tokensUsed: {
 prompt: usage?.prompt_tokens ?? 0,
 completion: usage?.completion_tokens ?? 0,
 total: usage?.total_tokens ?? 0,
 },
 latencyMs: Date.now() - startTime,
 citations: [],
 };
 } catch (error) {
 const latencyMs = Date.now() - startTime;
 const errorMessage = error instanceof Error ? error.message : String(error);

 console.error('[Perplexity] Chat completion failed:', {
 model,
 latencyMs,
 error: errorMessage,
 });

 throw new Error(`Perplexity API error: ${errorMessage}`);
 }
}

export async function perplexityChatJSON<T = any>(
 messages: Array<{ role: string; content: string }>,
 options: PerplexityOptions = {},
): Promise<T & { rawText: string; tokensUsed: PerplexityResult['tokensUsed']; latencyMs: number }> {
 const result = await perplexityChat(
 messages.map((m) => ({ ...m, content: m.content + '\n\nRespond ONLY with valid JSON.' })),
 { ...options, temperature: 0.3 },
 );

 try {
 const parsed = JSON.parse(result.content);
 return {
 ...parsed,
 rawText: result.content,
 tokensUsed: result.tokensUsed,
 latencyMs: result.latencyMs,
 };
 } catch {
 throw new Error(`Perplexity returned invalid JSON: ${result.content.slice(0, 200)}`);
 }
}