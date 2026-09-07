import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { config } from '../../config/env';

const genAI = new GoogleGenerativeAI(config.google.apiKey);

export interface GoogleMessage {
 role: 'user' | 'model';
 parts: { text: string }[];
}

export interface GoogleChatOptions {
 model?: string;
 temperature?: number;
 maxTokens?: number;
 topP?: number;
}

export interface GoogleChatResult {
 content: string;
 model: string;
 tokensUsed: {
 prompt: number;
 completion: number;
 total: number;
 };
 latencyMs: number;
}

const DEFAULT_MODEL = 'gemini-1.5-pro';
const DEFAULT_OPTIONS: Required<Omit<GoogleChatOptions, 'model'>> = {
 temperature: 0.7,
 maxTokens: 4096,
 topP: 1,
};

export async function googleChat(
 messages: GoogleMessage[],
 options: GoogleChatOptions = {},
): Promise<GoogleChatResult> {
 const modelName = options.model || DEFAULT_MODEL;
 const opts = { ...DEFAULT_OPTIONS, ...options };
 const startTime = Date.now();

 try {
 const model = genAI.getGenerativeModel({ model: modelName });

 // Combine messages into a single prompt for Gemini
 const prompt = messages
 .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.parts.map((p) => p.text).join('\n')}`)
 .join('\n\n');

 const result = await model.generateContent({
 contents: messages.map((m) => ({ role: m.role === 'user' ? 'user' : 'model', parts: m.parts })),
 generationConfig: {
 temperature: opts.temperature,
 maxOutputTokens: opts.maxTokens,
 topP: opts.topP,
 responseMimeType: 'text/plain',
 },
 });

 const response = await result.response;
 const content = response.text();

 return {
 content,
 model: modelName,
 tokensUsed: {
 prompt: response.usageMetadata?.promptTokenCount ?? 0,
 completion: response.usageMetadata?.candidatesTokenCount ?? 0,
 total: (response.usageMetadata?.promptTokenCount ?? 0) + (response.usageMetadata?.candidatesTokenCount ?? 0),
 },
 latencyMs: Date.now() - startTime,
 };
 } catch (error) {
 const latencyMs = Date.now() - startTime;
 const errorMessage = error instanceof Error ? error.message : String(error);

 console.error('[Google AI] Chat completion failed:', {
 model: modelName,
 latencyMs,
 error: errorMessage,
 });

 throw new Error(`Google AI error: ${errorMessage}`);
 }
}

export async function googleChatJSON<T = any>(
 messages: GoogleMessage[],
 options: GoogleChatOptions = {},
): Promise<T & { rawText: string; tokensUsed: GoogleChatResult['tokensUsed']; latencyMs: number }> {
 const result = await googleChat(
 messages.map((m) => ({ ...m, parts: [{ text: m.parts.map((p) => p.text).join('') + '\n\nRespond ONLY with valid JSON.' }] })),
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
 throw new Error(`Google AI returned invalid JSON: ${result.content.slice(0, 200)}`);
 }
}

export function getGoogleClient(): GoogleGenerativeAI {
 return genAI;
}