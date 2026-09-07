export interface Brand {
 id: string;
 name: string;
 domain: string;
 keywords: string[];
 competitors: string[];
 scanFrequency: "daily" | "weekly" | "biweekly" | "monthly";
 description?: string;
 visibilityScore: number;
 sentimentScore: number;
 mentionCount: number;
 createdAt: string;
 updatedAt: string;
 userId: string;
}

export interface Mention {
 id: string;
 brandId: string;
 source: "reddit" | "twitter" | "news" | "blog" | "forum" | "social";
 url: string;
 title: string;
 snippet: string;
 sentiment: "positive" | "neutral" | "negative";
 sentimentScore: number;
 author?: string;
 publishedAt: string;
 indexedAt: string;
}

export interface Competitor {
 id: string;
 name: string;
 domain: string;
 visibilityScore: number;
 mentionCount: number;
 sentimentScore: number;
 keywordsOverlap: number;
 trend: number;
}

export interface Report {
 id: string;
 brandId: string;
 userId: string;
 title: string;
 period: { start: string; end: string };
 sections: ReportSections;
 status: "pending" | "generating" | "completed" | "failed";
 fileUrl?: string;
 pdfUrl?: string;
 recipients: string[];
 createdAt: string;
 completedAt?: string;
}

export interface ReportSections {
 visibility: boolean;
 sentiment: boolean;
 mentions: boolean;
 competitors: boolean;
 keywords: boolean;
}

export interface AIQuery {
 id: string;
 brandId?: string;
 question: string;
 answer: string;
 mentions: Mention[];
 createdAt: string;
 model: string;
 tokensUsed: number;
}

export interface DashboardStats {
 totalBrands: number;
 totalMentions: number;
 avgVisibilityScore: number;
 avgSentimentScore: number;
 activeAlerts: number;
 reportsGenerated: number;
}

export interface VisibilityTrend {
 date: string;
 score: number;
 brandScore?: number;
}

export interface ModelBreakdown {
 model: string;
 count: number;
 percentage: number;
}

export interface User {
 id: string;
 email: string;
 name: string;
 avatar?: string;
 role: "owner" | "admin" | "member" | "viewer";
 agencyId: string;
}

export interface TeamMember {
 id: string;
 userId: string;
 name: string;
 email: string;
 role: "owner" | "admin" | "member" | "viewer";
 avatar?: string;
 joinedAt: string;
 lastActive?: string;
}

export interface Alert {
 id: string;
 type: "visibility_spike" | "sentiment_drop" | "competitor_change" | "mention_surge" | "scan_failed";
 severity: "low" | "medium" | "high" | "critical";
 message: string;
 brandId: string;
 brandName: string;
 read: boolean;
 createdAt: string;
}

export interface BillingPlan {
 id: string;
 name: string;
 price: number;
 interval: "month" | "year";
 features: string[];
 limits: {
 brands: number;
 queries: number;
 reports: number;
 teamMembers: number;
 };
}

export interface Subscription {
 id: string;
 planId: string;
 status: "active" | "canceled" | "past_due" | "trialing";
 currentPeriodStart: string;
 currentPeriodEnd: string;
 cancelAtPeriodEnd: boolean;
}
