/**
 * OpenAI GPT-4o Client
 *
 * Provides a typed interface for interacting with OpenAI's chat completions API.
 * Supports GPT-4o, GPT-4o-mini, and GPT-4-turbo models with structured output,
 * streaming, and function calling. Handles retries, timeouts, and error normalization.
 */

import OpenAI from 'openai';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OpenAIMessage {
 role: 'system' | 'user' | 'assistant';
 content: string;
}

export interface OpenAIChatOptions {
 model?: string;
 temperature?: number;
 maxTokens?: number;
 topP?: number;
 responseFormat?: 'text' | 'json_object';
 stop?: string[];
 user?: string;
 tools?: OpenAI.Chat.Completions.ChatCompletionToolParam[];
 toolChoice?: OpenAI.Chat.Completions.ChatCompletionToolChoiceOptionParam;
 timeoutMs?: number;
}

export interface OpenAIChatResult {
 content: string;
 model: string;
 tokensUsed: {
 prompt: number;
 completion: number;
 total: number;
 };
 finishReason: string;
 latencyMs: number;
 toolCalls?: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[];
 raw: OpenAI.Chat.Completions.ChatCompletion;
}

export interface OpenAIVisionOptions {
 model?: string;
 maxTokens?: number;
 detail?: 'low' | 'high' | 'auto';
 temperature?: number;
 timeoutMs?: number;
}

export interface OpenAIVisionMessage {
 role: 'user';
 content: [
 { type: 'text'; text: string },
 { type: 'image_url'; image_url: { url: string; detail?: 'low' | 'high' | 'auto' } }
 ];
}

// ─── Client ──────────────────────────────────────────────────────────────────

let openaiClient: OpenAI | null = null;

/**
 * Gets or creates the OpenAI client singleton.
 * Requires OPENAI_API_KEY environment variable.
 */
export function getOpenAIClient(): OpenAI {
 if (!openaiClient) {
 const apiKey = process.env.OPENAI_API_KEY;
 if (!apiKey) {
 throw new Error('OPENAI_API_KEY is not set in environment variables');
 }
 openaiClient = new OpenAI({
 apiKey,
 timeout: 60_000, // 60s default timeout
 });
 }
 return openaiClient;
}

/**
 * Resets the client singleton (useful for testing).
 */
export function resetOpenAIClient(): void {
 openaiClient = null;
}

// ─── Chat Completions ─────────────────────────────────────────────────────────

const DEFAULT_CHAT_OPTIONS: Required<Omit<OpenAIChatOptions, 'tools' | 'toolChoice'>> = {
 model: 'gpt-4o',
 temperature: 0.7,
 maxTokens: 4096,
 topP: 1,
 responseFormat: 'text',
 stop: [],
 user: 'brandlens-backend',
 timeoutMs: 60_000,
};

/**
 * Sends a chat completion request to OpenAI.
 *
 * @param messages - Array of messages for the conversation
 * @param options - Optional configuration overrides
 * @returns Parsed chat completion result
 */
export async function openaiChat(
 messages: OpenAIMessage[],
 options: OpenAIChatOptions = {},
): Promise<OpenAIChatResult> {
 const client = getOpenAIClient();
 const opts = { ...DEFAULT_CHAT_OPTIONS, ...options } as Required<
 Omit<OpenAIChatOptions, 'tools' | 'toolChoice'>
 > & { tools?: OpenAI.Chat.Completions.ChatCompletionToolParam[]; toolChoice?: OpenAI.Chat.Completions.ChatCompletionToolChoiceOptionParam };

 const startTime = Date.now();

 try {
 const params: OpenAI.Chat.ChatCompletionCreateParams = {
 model: opts.model,
 messages: messages.map((m) => ({
 role: m.role,
 content: m.content,
 })) as OpenAI.Chat.ChatCompletionMessageParam[],
 temperature: opts.temperature,
 max_tokens: opts.maxTokens,
 top_p: opts.topP,
 stop: opts.stop.length > 0 ? opts.stop : undefined,
 user: opts.user,
 ...(opts.responseFormat === 'json_object'
 ? { response_format: { type: 'json_object' } as const }
 : {}),
 ...(opts.tools ? { tools: opts.tools } : {}),
 ...(opts.toolChoice ? { tool_choice: opts.toolChoice } : {}),
 };

 const response = await client.chat.completions.create(params, {
 timeout: opts.timeoutMs,
 });

 const choice = response.choices[0];
 if (!choice) {
 throw new Error('OpenAI returned an empty choices array');
 }

 const content = choice.message.content ?? '';
 const usage = response.usage;

 return {
 content,
 model: response.model,
 tokensUsed: {
 prompt: usage?.prompt_tokens ?? 0,
 completion: usage?.completion_tokens ?? 0,
 total: usage?.total_tokens ?? 0,
 },
 finishReason: choice.finish_reason ?? 'unknown',
 latencyMs: Date.now() - startTime,
 toolCalls: choice.message.tool_calls ?? undefined,
 raw: response,
 };
 } catch (error) {
 const latencyMs = Date.now() - startTime;
 const errorMessage = error instanceof Error ? error.message : String(error);

 // Normalize known OpenAI errors
 let normalizedError = error;
 if (error instanceof OpenAI.APIError) {
 normalizedError = new Error(
 `OpenAI API error (${error.status}): ${error.message}`,
 );
 (normalizedError as any).statusCode = error.status;
 (normalizedError as any).type = error.type;
 (normalizedError as any).latencyMs = latencyMs;
 }

 console.error('[OpenAI] Chat completion failed:', {
 model: opts.model,
 latencyMs,
 error: errorMessage,
 messagesPreview: messages.map((m) => ({
 role: m.role,
 content: m.content.slice(0, 100),
 })),
 });

 throw normalizedError;
 }
}

/**
 * Sends a chat completion request expecting structured JSON output.
 * Parses the response content as JSON automatically.
 *
 * @param messages - Array of messages
 * @param options - Optional configuration (responseFormat is always json_object)
 * @returns Parsed JSON result
 */
export async function openaiChatJSON<T = any>(
 messages: OpenAIMessage[],
 options: Omit<OpenAIChatOptions, 'responseFormat'> = {},
): Promise<T & { rawText: string; tokensUsed: OpenAIChatResult['tokensUsed']; latencyMs: number }> {
 const result = await openaiChat(messages, {
 ...options,
 responseFormat: 'json_object',
 temperature: 0.3, // Lower temperature for deterministic JSON
 });

 try {
 const parsed = JSON.parse(result.content);
 return {
 ...parsed,
 rawText: result.content,
 tokensUsed: result.tokensUsed,
 latencyMs: result.latencyMs,
 };
 } catch {
 throw new Error(
 `OpenAI returned invalid JSON: ${result.content.slice(0, 200)}`,
 );
 }
}

// ─── Vision / Image Analysis ─────────────────────────────────────────────────

const DEFAULT_VISION_OPTIONS: Required<Omit<OpenAIVisionOptions, 'detail'>> = {
 model: 'gpt-4o',
 maxTokens: 4096,
 temperature: 0.7,
 timeoutMs: 90_000,
};

/**
 * Sends a vision request to GPT-4o with an image and optional text prompt.
 *
 * @param imageUrl - URL or base64 data URI of the image
 * @param prompt - Text prompt to accompany the image
 * @param options - Optional configuration overrides
 * @returns Parsed chat completion result (same shape as openaiChat)
 */
export async function openaiVision(
 imageUrl: string,
 prompt: string,
 options: OpenAIVisionOptions = {},
): Promise<OpenAIChatResult> {
 const client = getOpenAIClient();
 const opts = { ...DEFAULT_VISION_OPTIONS, ...options };
 const startTime = Date.now();

 try {
 const response = await client.chat.completions.create(
 {
 model: opts.model,
 max_tokens: opts.maxTokens,
 temperature: opts.temperature,
 messages: [
 {
 role: 'user',
 content: [
 { type: 'text', text: prompt },
 {
 type: 'image_url',
 image_url: {
 url: imageUrl,
 detail: opts.detail ?? 'auto',
 },
 },
 ],
 },
 ],
 },
 {
 timeout: opts.timeoutMs,
 },
 );

 const choice = response.choices[0];
 if (!choice) {
 throw new Error('OpenAI vision returned an empty choices array');
 }

 return {
 content: choice.message.content ?? '',
 model: response.model,
 tokensUsed: {
 prompt: response.usage?.prompt_tokens ?? 0,
 completion: response.usage?.completion_tokens ?? 0,
 total: response.usage?.total_tokens ?? 0,
 },
 finishReason: choice.finish_reason ?? 'unknown',
 latencyMs: Date.now() - startTime,
 raw: response,
 };
 } catch (error) {
 const latencyMs = Date.now() - startTime;
 const errorMessage = error instanceof Error ? error.message : String(error);

 console.error('[OpenAI] Vision request failed:', {
 model: opts.model,
 latencyMs,
 error: errorMessage,
 });

 if (error instanceof OpenAI.APIError) {
 const normalized = new Error(
 `OpenAI vision error (${error.status}): ${error.message}`,
 );
 (normalized as any).statusCode = error.status;
 throw normalized;
 }

 throw error;
 }
}

// ─── Embeddings ───────────────────────────────────────────────────────────────

const DEFAULT_EMBEDDING_OPTIONS = {
 model: 'text-embedding-3-small' as const,
 dimensions: 1536,
 timeoutMs: 30_000,
};

export interface OpenAIEmbeddingOptions {
 model?: string;
 dimensions?: number;
 timeoutMs?: number;
}

export interface OpenAIEmbeddingResult {
 embedding: number[];
 model: string;
 tokensUsed: number;
 latencyMs: number;
}

/**
 * Generates text embeddings using OpenAI's embedding models.
 *
 * @param text - Text to embed (max ~8191 tokens for text-embedding-3-small)
 * @param options - Optional configuration
 * @returns Embedding vector and metadata
 */
export async function openaiEmbed(
 text: string,
 options: OpenAIEmbeddingOptions = {},
): Promise<OpenAIEmbeddingResult> {
 const client = getOpenAIClient();
 const opts = { ...DEFAULT_EMBEDDING_OPTIONS, ...options };
 const startTime = Date.now();

 try {
 const response = await client.embeddings.create(
 {
 model: opts.model,
 input: text,
 dimensions: opts.dimensions,
 },
 {
 timeout: opts.timeoutMs,
 },
 );

 const embedding = response.data[0];
 if (!embedding) {
 throw new Error('OpenAI embeddings returned empty data');
 }

 return {
 embedding: embedding.embedding,
 model: response.model,
 tokensUsed: response.usage?.total_tokens ?? 0,
 latencyMs: Date.now() - startTime,
 };
 } catch (error) {
 const latencyMs = Date.now() - startTime;
 console.error('[OpenAI] Embedding failed:', {
 model: opts.model,
 latencyMs,
 error: error instanceof Error ? error.message : String(error),
 });
 throw error;
 }
}

// ─── Moderation ───────────────────────────────────────────────────────────────

export interface OpenAIModerationResult {
 flagged: boolean;
 categories: Record<string, boolean>;
 categoryScores: Record<string, number>;
 latencyMs: number;
}

const DEFAULT_MODERATION_OPTIONS = {
 model: 'omni-moderation-latest' as const,
 timeoutMs: 15_000,
};

/**
 * Runs OpenAI content moderation on text.
 *
 * @param text - Text to check for policy violations
 * @param options - Optional configuration
 * @returns Moderation result with flags and scores
 */
export async function openaiModerate(
 text: string,
 options: { timeoutMs?: number } = {},
): Promise<OpenAIModerationResult> {
 const client = getOpenAIClient();
 const startTime = Date.now();

 try {
 const response = await client.moderations.create(
 {
 model: DEFAULT_MODERATION_OPTIONS.model,
 input: text,
 },
 {
 timeout: options.timeoutMs ?? DEFAULT_MODERATION_OPTIONS.timeoutMs,
 },
 );

 const result = response.results[0];
 if (!result) {
 throw new Error('OpenAI moderation returned empty results');
 }

 return {
 flagged: result.flagged,
 categories: result.categories as Record<string, boolean>,
 categoryScores: result.category_scores as Record<string, number>,
 latencyMs: Date.now() - startTime,
 };
 } catch (error) {
 const latencyMs = Date.now() - startTime;
 console.error('[OpenAI] Moderation failed:', {
 latencyMs,
 error: error instanceof Error ? error.message : String(error),
 });
 throw error;
 }
}

// ─── Token Estimation ────────────────────────────────────────────────────────

/**
 * Rough estimation of token count for a given text.
 * Uses the rule of thumb: ~4 characters per token for English text.
 */
export function estimateTokens(text: string): number {
 return Math.ceil(text.length / 4);
}

/**
 * Estimates the total token count for a list of messages.
 */
export function estimateMessageTokens(messages: OpenAIMessage[]): number {
 // Rough overhead per message (role + formatting) + content tokens
 const overheadPerMessage = 4; // , , etc.
 return messages.reduce(
 (total, msg) => total + estimateTokens(msg.content) + overheadPerMessage,
 0,
 ) + 2; // priming tokens
}
