export type Platform = "chatgpt" | "claude" | "perplexity" | "google_ai_overview";

export interface BrandMention {
 id: string;
 platform: Platform;
 query: string;
 brandName: string;
 mentioned: boolean;
 snippet: string;
 fullResponse: string;
 sentiment: "positive" | "neutral" | "negative";
 confidence: number;
 position: number;
 competitorsMentioned: string[];
 sourceUrl?: string;
 scannedAt: string;
}

export interface ScanJob {
 id: string;
 brandName: string;
 queries: string[];
 platforms: Platform[];
 status: "pending" | "running" | "completed" | "failed";
 mentions: BrandMention[];
 totalMentions: number;
 visibilityScore: number | null;
 sentimentBreakdown: SentimentBreakdown | null;
 narrativeSummary: string | null;
 createdAt: string;
 startedAt?: string;
 completedAt?: string;
 error?: string;
}

export interface SentimentBreakdown {
 positive: number;
 neutral: number;
 negative: number;
 dominant: "positive" | "neutral" | "negative";
}

export interface VisibilityScore {
 total: number;
 breakdown: {
 mentionRate: number;
 sentimentScore: number;
 positionScore: number;
 platformSpread: number;
 };
 grade: "A" | "B" | "C" | "D" | "F";
}

export interface NarrativeReport {
 executiveSummary: string;
 keyFindings: string[];
 recommendations: string[];
 riskAreas: string[];
 generatedAt: string;
}

export interface ScanRequestBody {
 brandName: string;
 queries: string[];
 platforms?: Platform[];
}

export interface ScanJobResponse {
 job: ScanJob;
}

export interface AiProviderConfig {
 openaiApiKey: string;
 anthropicApiKey: string;
 perplexityApiKey: string;
}
