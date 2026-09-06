export interface Agency {
 id: string;
 name: string;
 email: string;
 plan: 'starter' | 'growth' | 'agency';
 whiteLabelConfig?: WhiteLabelConfig;
 createdAt: Date;
}

export interface WhiteLabelConfig {
 logo?: string;
 primaryColor?: string;
 companyName?: string;
 supportEmail?: string;
}

export interface Brand {
 id: string;
 agencyId: string;
 name: string;
 industry: string;
 keywords: string[];
 competitors: string[];
 createdAt: Date;
}

export interface AIQuery {
 id: string;
 brandId: string;
 platform: 'chatgpt' | 'perplexity' | 'claude' | 'google_ai';
 queryText: string;
 aiResponse: string;
 mentions: Mention[];
 sentimentScore?: number;
 createdAt: Date;
}

export interface Mention {
 id: string;
 brandId: string;
 queryId: string;
 platform: string;
 context: string;
 sentiment: 'positive' | 'neutral' | 'negative';
 confidenceScore: number;
 createdAt: Date;
}

export interface Report {
 id: string;
 brandId: string;
 reportType: 'weekly' | 'monthly' | 'quarterly';
 period: string;
 data: any;
 pdfUrl?: string;
 sentAt?: Date;
 createdAt: Date;
}

export interface Competitor {
 id: string;
 brandId: string;
 name: string;
 mentionCount: number;
 visibilityScore: number;
 createdAt: Date;
}

export interface Subscription {
 id: string;
 agencyId: string;
 plan: string;
 status: 'active' | 'canceled' | 'past_due';
 currentPeriodStart: Date;
 currentPeriodEnd: Date;
 createdAt: Date;
}
