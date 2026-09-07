import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../config/env';

const anthropic = new Anthropic({
 apiKey: config.anthropic.apiKey,
});

export interface AnthropicMessage {
 role: 'user' | 'assistant';
 content: string;
}

export interface AnthropicChatOptions {
 model?: string;
 temperature?: number;
 maxTokens?: number;
 topP?: number;
 stopSequences?: string[];
}

export interface AnthropicChatResult {
 content: string;
 model: string;
 stopReason: string;
 tokensUsed: {
 prompt: number;
 completion: number;
 total: number;
 };
 latencyMs: number;
 raw: Anthropic.Message;
}

const DEFAULT_MODEL = 'claude-sonnet-4-5-20250929';
const DEFAULT_OPTIONS: Required<Omit<AnthropicChatOptions, 'stopSequences'>> = {
 model: DEFAULT_MODEL,
 temperature: 0.7,
 maxTokens: 4096,
 topP: 1,
};

export async function anthropicChat(
 messages: AnthropicMessage[],
 options: AnthropicChatOptions = {},
): Promise<AnthropicChatResult> {
 const opts = { ...DEFAULT_OPTIONS, ...options };
 const startTime = Date.now();

 try {
 const lastMessage = messages[messages.length - 1];
 const response = (await anthropic.messages.create({
 model: opts.model,
 max_tokens: opts.maxTokens,
 temperature: opts.temperature,
 top_p: opts.topP,
 stop_sequences: opts.stopSequences,
 messages: messages.map((m) => ({
 role: m.role,
 content: m.content,
 })),
 })) as Anthropic.Message;

 const content = response.content[0];
 if (!content || content.type !== 'text') {
 throw new Error('Anthropic returned empty text content');
 }

 return {
 content: content.text,
 model: response.model,
 stopReason: response.stop_reason ?? 'unknown',
 tokensUsed: {
 prompt: response.usage.input_tokens,
 completion: response.usage.output_tokens,
 total: response.usage.input_tokens + response.usage.output_tokens,
 },
 latencyMs: Date.now() - startTime,
 raw: response,
 };
 } catch (error) {
 const latencyMs = Date.now() - startTime;
 const errorMessage = error instanceof Error ? error.message : String(error);

 console.error('[Anthropic] Chat completion failed:', {
 model: opts.model,
 latencyMs,
 error: errorMessage,
 });

 throw new Error(`Anthropic API error: ${errorMessage}`);
 }
}

export async function anthropicChatJSON<T = any>(
 messages: AnthropicMessage[],
 options: AnthropicChatOptions = {},
): Promise<T & { rawText: string; tokensUsed: AnthropicChatResult['tokensUsed']; latencyMs: number }> {
 const result = await anthropicChat(
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
 throw new Error(`Anthropic returned invalid JSON: ${result.content.slice(0, 200)}`);
 }
}

export function getAnthropicClient(): Anthropic {
 return anthropic;
}