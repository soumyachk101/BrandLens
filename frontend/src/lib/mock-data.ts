import type { Brand, Mention, Competitor, Report, AIQuery, DashboardStats, VisibilityTrend, ModelBreakdown, Alert, User, TeamMember, BillingPlan, Subscription } from "./types";

export const MOCK_USER: User = {
 id: "u-1",
 email: "sarah@agency.com",
 name: "Sarah Chen",
 role: "owner",
 agencyId: "a-1",
};

export const MOCK_BRANDS: Brand[] = [
 {
 id: "b-1",
 name: "Acme SaaS",
 domain: "acmesaas.com",
 keywords: ["Acme SaaS", "project management tool", "team collaboration"],
 competitors: ["notion.so", "asana.com", "monday.com"],
 scanFrequency: "daily",
 description: "Enterprise project management SaaS platform",
 visibilityScore: 78.4,
 sentimentScore: 72.1,
 mentionCount: 1243,
 createdAt: "2024-08-15T10:00:00Z",
 updatedAt: "2024-12-01T08:00:00Z",
 userId: "u-1",
 },
 {
 id: "b-2",
 name: "CloudVault",
 domain: "cloudvault.io",
 keywords: ["CloudVault", "cloud storage", "file backup"],
 competitors: ["dropbox.com", "googledrive.com"],
 scanFrequency: "daily",
 description: "Secure cloud storage for businesses",
 visibilityScore: 65.2,
 sentimentScore: 81.5,
 mentionCount: 876,
 createdAt: "2024-06-20T14:00:00Z",
 updatedAt: "2024-11-28T12:00:00Z",
 userId: "u-1",
 },
 {
 id: "b-3",
 name: "DataPulse",
 domain: "datapulse.ai",
 keywords: ["DataPulse", "AI analytics", "business intelligence"],
 competitors: ["tableau.com", "powerbi.microsoft.com"],
 scanFrequency: "weekly",
 description: "AI-powered business intelligence platform",
 visibilityScore: 42.8,
 sentimentScore: 68.3,
 mentionCount: 534,
 createdAt: "2024-10-01T09:00:00Z",
 updatedAt: "2024-11-30T16:00:00Z",
 userId: "u-1",
 },
];

export const MOCK_MENTIONS: Mention[] = [
 {
 id: "m-1",
 brandId: "b-1",
 source: "reddit",
 url: "https://reddit.com/r/projectmanagement/comments/abc123",
 title: "Best project management tools for remote teams?",
 snippet: "We've been using Acme SaaS for 6 months now and the collaboration features are solid...",
 sentiment: "positive",
 sentimentScore: 0.82,
 author: "pm_enthusiast",
 publishedAt: "2024-12-01T10:30:00Z",
 indexedAt: "2024-12-01T11:00:00Z",
 },
 {
 id: "m-2",
 brandId: "b-1",
 source: "twitter",
 url: "https://twitter.com/user/status/123456",
 title: "Just migrated our team to Acme SaaS",
 snippet: "The API is clean and the integrations work smoothly. Great choice for scaling teams.",
 sentiment: "positive",
 sentimentScore: 0.91,
 author: "techlead_sarah",
 publishedAt: "2024-11-30T15:20:00Z",
 indexedAt: "2024-11-30T15:45:00Z",
 },
 {
 id: "m-3",
 brandId: "b-2",
 source: "news",
 url: "https://techcrunch.com/2024/11/cloudvault-funding",
 title: "CloudVault raises $50M Series B",
 snippet: "The secure cloud storage provider is expanding its enterprise offerings...",
 sentiment: "positive",
 sentimentScore: 0.88,
 publishedAt: "2024-11-29T09:00:00Z",
 indexedAt: "2024-11-29T10:00:00Z",
 },
 {
 id: "m-4",
 brandId: "b-1",
 source: "blog",
 url: "https://techreview.com/acme-saas-review",
 title: "Acme SaaS Review: A Comprehensive Look",
 snippet: "While the interface is intuitive, we found some limitations in the reporting module...",
 sentiment: "neutral",
 sentimentScore: 0.55,
 publishedAt: "2024-11-28T12:00:00Z",
 indexedAt: "2024-11-28T14:00:00Z",
 },
 {
 id: "m-5",
 brandId: "b-3",
 source: "forum",
 url: "https://hackernews.com/item?id=98765",
 title: "Show HN: I built an alternative to DataPulse",
 snippet: "DataPulse is great but the pricing is steep for startups. I built an open source alternative...",
 sentiment: "negative",
 sentimentScore: 0.25,
 publishedAt: "2024-11-27T08:30:00Z",
 indexedAt: "2024-11-27T09:00:00Z",
 },
];

export const MOCK_COMPETITORS: Competitor[] = [
 { id: "c-1", name: "Notion", domain: "notion.so", visibilityScore: 92.1, mentionCount: 3421, sentimentScore: 85.2, keywordsOverlap: 65, trend: 3.2 },
 { id: "c-2", name: "Asana", domain: "asana.com", visibilityScore: 87.5, mentionCount: 2890, sentimentScore: 78.9, keywordsOverlap: 58, trend: 1.1 },
 { id: "c-3", name: "Monday.com", domain: "monday.com", visibilityScore: 83.2, mentionCount: 2156, sentimentScore: 74.3, keywordsOverlap: 52, trend: -0.8 },
 { id: "c-4", name: "Dropbox", domain: "dropbox.com", visibilityScore: 71.0, mentionCount: 1823, sentimentScore: 82.1, keywordsOverlap: 15, trend: 2.4 },
];

export const MOCK_REPORTS: Report[] = [
 { id: "r-1", brandId: "b-1", userId: "u-1", title: "Acme SaaS - November 2024 Visibility Report", period: { start: "2024-11-01", end: "2024-11-30" }, sections: { visibility: true, sentiment: true, mentions: true, competitors: true, keywords: true }, status: "completed", pdfUrl: "/reports/r-1.pdf", recipients: ["sarah@agency.com"], createdAt: "2024-12-01T08:00:00Z", completedAt: "2024-12-01T08:05:00Z" },
 { id: "r-2", brandId: "b-1", userId: "u-1", title: "Acme SaaS - Q4 2024 Competitive Analysis", period: { start: "2024-10-01", end: "2024-12-01" }, sections: { visibility: true, sentiment: false, mentions: true, competitors: true, keywords: false }, status: "completed", pdfUrl: "/reports/r-2.pdf", recipients: ["sarah@agency.com", "team@agency.com"], createdAt: "2024-12-02T09:00:00Z", completedAt: "2024-12-02T09:12:00Z" },
 { id: "r-3", brandId: "b-2", userId: "u-1", title: "CloudVault - Monthly Sentiment Report", period: { start: "2024-11-01", end: "2024-11-30" }, sections: { visibility: false, sentiment: true, mentions: true, competitors: false, keywords: true }, status: "generating", recipients: ["sarah@agency.com"], createdAt: "2024-12-03T10:00:00Z" },
 { id: "r-4", brandId: "b-1", userId: "u-1", title: "Acme SaaS - Weekly Mentions Digest", period: { start: "2024-11-25", end: "2024-12-01" }, sections: { visibility: true, sentiment: true, mentions: true, competitors: false, keywords: true }, status: "pending", recipients: [], createdAt: "2024-12-03T11:00:00Z" },
];

export const MOCK_QUERIES: AIQuery[] = [
 { id: "q-1", brandId: "b-1", question: "What is our overall visibility trend in the last 30 days?", answer: "Your visibility score has increased by 12% over the past 30 days, moving from 66.4 to 78.4. This improvement is primarily driven by increased mentions in tech publications and positive sentiment on social media platforms.", mentions: [MOCK_MENTIONS[0], MOCK_MENTIONS[1]], createdAt: "2024-12-01T10:00:00Z", model: "claude-3.5-sonnet", tokensUsed: 1240 },
 { id: "q-2", brandId: "b-1", question: "How does our sentiment compare to Notion?", answer: "Your sentiment score of 72.1% is lower than Notion's 85.2%. The gap is mainly due to recent neutral/negative mentions about pricing on Reddit and HackerNews. Consider addressing pricing transparency in your marketing.", mentions: [MOCK_MENTIONS[3]], createdAt: "2024-11-30T14:00:00Z", model: "claude-3.5-sonnet", tokensUsed: 980 },
 { id: "q-3", brandId: "b-2", question: "Which keywords are driving the most visibility for CloudVault?", answer: "The top keywords are 'secure cloud storage' (34% of mentions), 'enterprise file backup' (22%), and 'encrypted cloud' (18%). These keywords show strong growth in the last quarter.", mentions: [MOCK_MENTIONS[2]], createdAt: "2024-11-29T11:00:00Z", model: "claude-3.5-sonnet", tokensUsed: 856 },
];

export const MOCK_DASHBOARD_STATS: DashboardStats = {
 totalBrands: 3,
 totalMentions: 1243,
 avgVisibilityScore: 62.1,
 avgSentimentScore: 73.9,
 activeAlerts: 2,
 reportsGenerated: 12,
};

export const MOCK_VISIBILITY_TRENDS: VisibilityTrend[] = [
 { date: "2024-06-01", score: 45.2, brandScore: 45.2 },
 { date: "2024-07-01", score: 48.1, brandScore: 48.1 },
 { date: "2024-08-01", score: 52.3, brandScore: 52.3 },
 { date: "2024-09-01", score: 55.7, brandScore: 55.7 },
 { date: "2024-10-01", score: 61.2, brandScore: 61.2 },
 { date: "2024-11-01", score: 66.4, brandScore: 66.4 },
 { date: "2024-12-01", score: 71.8, brandScore: 71.8 },
];

export const MOCK_MODEL_BREAKDOWN: ModelBreakdown[] = [
 { model: "ChatGPT", count: 342, percentage: 38.2 },
 { model: "Claude", count: 287, percentage: 32.0 },
 { model: "Gemini", count: 156, percentage: 17.4 },
 { model: "Perplexity", count: 89, percentage: 9.9 },
 { model: "Other", count: 23, percentage: 2.5 },
];

export const MOCK_ALERTS: Alert[] = [
 { id: "a-1", type: "sentiment_drop", severity: "high", message: "Sentiment for Acme SaaS dropped 15% in the last 24 hours due to pricing discussions on Reddit", brandId: "b-1", brandName: "Acme SaaS", read: false, createdAt: "2024-12-01T08:00:00Z" },
 { id: "a-2", type: "mention_surge", severity: "medium", message: "CloudVault mentions increased by 340% following the funding announcement", brandId: "b-2", brandName: "CloudVault", read: false, createdAt: "2024-11-29T10:00:00Z" },
 { id: "a-3", type: "visibility_spike", severity: "low", message: "DataPulse visibility increased 8% after the AI Analytics Summit", brandId: "b-3", brandName: "DataPulse", read: true, createdAt: "2024-11-28T14:00:00Z" },
];

export const MOCK_TEAM: TeamMember[] = [
 { id: "t-1", userId: "u-1", name: "Sarah Chen", email: "sarah@agency.com", role: "owner", avatar: null, joinedAt: "2024-01-15T00:00:00Z", lastActive: "2024-12-01T08:30:00Z" },
 { id: "t-2", userId: "u-2", name: "Marcus Johnson", email: "marcus@agency.com", role: "admin", joinedAt: "2024-03-01T00:00:00Z", lastActive: "2024-11-30T17:00:00Z" },
 { id: "t-3", userId: "u-3", name: "Emily Rodriguez", email: "emily@agency.com", role: "member", joinedAt: "2024-05-10T00:00:00Z", lastActive: "2024-11-29T12:00:00Z" },
];

export const MOCK_PLANS: BillingPlan[] = [
 { id: "starter", name: "Starter", price: 29, interval: "month", features: ["3 Brands", "100 AI Queries/mo", "5 Reports/mo", "1 Team Member", "Email Support"], limits: { brands: 3, queries: 100, reports: 5, teamMembers: 1 } },
 { id: "pro", name: "Pro", price: 79, interval: "month", features: ["10 Brands", "500 AI Queries/mo", "25 Reports/mo", "5 Team Members", "Priority Support", "White-label Reports"], limits: { brands: 10, queries: 500, reports: 25, teamMembers: 5 } },
 { id: "enterprise", name: "Enterprise", price: 149, interval: "month", features: ["Unlimited Brands", "Unlimited Queries", "Unlimited Reports", "Unlimited Team Members", "Dedicated Support", "Custom Integrations", "SLA"], limits: { brands: -1, queries: -1, reports: -1, teamMembers: -1 } },
];

export const MOCK_SUBSCRIPTION: Subscription = {
 id: "sub-1",
 planId: "pro",
 status: "active",
 currentPeriodStart: "2024-12-01",
 currentPeriodEnd: "2025-01-01",
 cancelAtPeriodEnd: false,
};
