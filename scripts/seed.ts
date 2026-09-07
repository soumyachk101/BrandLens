/**
 * Database Seed Script for Development
 *
 * Creates initial data for development environment:
 * - Default agency
 * - Demo brands
 * - Default prompt templates
 * - Demo users with API keys
 *
 * Usage:
 * - npx tsx scripts/seed.ts
 * - npm run db:seed
 *
 * WARNING: This will modify existing data. Use only in development.
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";

const prisma = new PrismaClient();

// Types for seed data
interface AgencySeed {
 name: string;
 slug: string;
 description: string;
 domain?: string;
 settings?: Record<string, unknown>;
}

interface BrandSeed {
 name: string;
 slug: string;
 industry: string;
 description: string;
 website?: string;
 brandKit?: {
 primaryColor?: string;
 secondaryColor?: string;
 tone: string;
 guidelines?: string;
 };
}

interface PromptTemplateSeed {
 name: string;
 description: string;
 category: string;
 content: string;
 variables: string[];
 example?: string;
 isPublic: boolean;
}

interface UserSeed {
 email: string;
 name: string;
 password: string;
 role: "ADMIN" | "AGENCY_ADMIN" | "USER";
 apiKey?: string;
}

// Seed data definitions
const agencies: AgencySeed[] = [
 {
 name: "BrandLens Demo Agency",
 slug: "demo-agency",
 description: "Demo agency for testing and development purposes",
 domain: "brandlens.demo",
 settings: {
 plan: "PROFESSIONAL",
 maxUsers: 10,
 maxBrands: 5,
 features: {
 brandTracking: true,
 promptGeneration: true,
 competitorAnalysis: true,
 teamCollaboration: true,
 },
 },
 },
];

const brands: BrandSeed[] = [
 {
 name: "TechCorp",
 slug: "techcorp",
 industry: "Technology",
 description: "Leading enterprise software company",
 website: "https://techcorp.example.com",
 brandKit: {
 primaryColor: "#2563EB",
 secondaryColor: "#7C3AED",
 tone: "professional and innovative",
 guidelines: "Use clear, direct language. Avoid jargon. Emphasize innovation and reliability.",
 },
 },
 {
 name: "GreenLeaf",
 slug: "greenleaf",
 industry: "Sustainability",
 description: "Eco-friendly consumer products brand",
 website: "https://greenleaf.example.com",
 brandKit: {
 primaryColor: "#16A34A",
 secondaryColor: "#65A30D",
 tone: "warm, authentic, and environmentally conscious",
 guidelines: "Emphasize sustainability and authenticity. Use natural, approachable language.",
 },
 },
 {
 name: "FinEdge",
 slug: "finedge",
 industry: "Finance",
 description: "Modern fintech startup",
 website: "https://finedge.example.com",
 brandKit: {
 primaryColor: "#0F172A",
 secondaryColor: "#3B82F6",
 tone: "trustworthy and modern",
 guidelines: "Focus on security and transparency. Balance technical accuracy with accessibility.",
 },
 },
];

const promptTemplates: PromptTemplateSeed[] = [
 {
 name: "Brand Introduction",
 description: "Generic prompt to introduce a brand and its core value proposition",
 category: "general",
 content: `You are an AI assistant helping to evaluate how well AI models represent the brand "${brand_name}".

Brand context:
- Industry: ${industry}
- Core values: ${brand_values}
- Tone of voice: ${brand_tone}

Evaluate the following AI response to determine how accurately and favorably it represents our brand.

Criteria:
1. Accuracy: Does the response correctly identify our brand and offerings?
2. Tone alignment: Does the response match our brand voice?
3. Value proposition: Does it highlight our key differentiators?
4. Competitive positioning: Does it position us favorably against competitors?

AI Response to evaluate:
[INSERT_AI_RESPONSE_HERE]

Please provide:
- A score from 1-10
- Specific feedback on brand representation
- Suggestions for improvement if score is below 8`,
 variables: ["brand_name", "industry", "brand_values", "brand_tone"],
 isPublic: true,
 },
 {
 name: "Competitor Analysis",
 description: "Prompt to compare brand positioning against competitors",
 category: "competitive",
 content: `Analyze how "${brand_name}" is positioned relative to its competitors in the ${industry} sector.

When asked about ${industry} solutions, how does the AI mention:
1. Our brand (frequency and context)
2. Key competitors
3. Key differentiators of our brand

Brand: ${brand_name}
Competitors: ${competitors}
Key differentiators: ${differentiators}

Evaluate the AI response for brand visibility and positioning strength.`,
 variables: ["brand_name", "industry", "competitors", "differentiators"],
 isPublic: true,
 },
 {
 name: "Product Feature Evaluation",
 description: "Evaluate how accurately AI models describe product features",
 category: "product",
 content: `Evaluate how accurately the AI describes ${brand_name}'s product features.

Our actual features:
${product_features}

Common misconceptions to watch for:
${misconceptions}

Evaluate whether the AI response accurately represents our product capabilities.`,
 variables: ["brand_name", "product_features", "misconceptions"],
 isPublic: false,
 },
 {
 name: "Sentiment Analysis",
 description: "Analyze sentiment and brand perception in AI responses",
 category: "sentiment",
 content: `Analyze the sentiment of the following AI response regarding ${brand_name}:

Response: [INSERT_RESPONSE]

Consider:
1. Overall sentiment (positive/neutral/negative)
2. Key positive mentions
3. Key negative concerns
4. Opportunities for improvement
5. Brand alignment score

Provide a structured sentiment analysis report.`,
 variables: ["brand_name"],
 isPublic: true,
 },
];

const users: UserSeed[] = [
 {
 email: "admin@brandlens.demo",
 name: "Admin User",
 password: "admin123",
 role: "ADMIN",
 },
 {
 email: "user@brandlens.demo",
 name: "Demo User",
 password: "user123",
 role: "USER",
 },
];

// Helper functions
function generateApiKey(): string {
 const prefix = "brandlens_";
 const key = crypto.randomBytes(32).toString("hex");
 return `${prefix}${key}`;
}

function hashPassword(password: string): string {
 return bcrypt.hashSync(password, 10);
}

// Seed functions
async function seedAgencies(): Promise<void> {
 console.log("Seeding agencies...");

 for (const agency of agencies) {
 const existing = await prisma.agency.findUnique({
 where: { slug: agency.slug },
 });

 if (existing) {
 console.log(` Agency "${agency.name}" already exists, skipping...`);
 continue;
 }

 const created = await prisma.agency.create({
 data: {
 ...agency,
 settings: agency.settings as any,
 },
 });

 console.log(` Created agency: ${created.name} (ID: ${created.id})`);
 }
}

async function seedBrands(): Promise<void> {
 console.log("Seeding brands...");

 const agency = await prisma.agency.findFirst();
 if (!agency) {
 console.log(" No agency found, skipping brands...");
 return;
 }

 for (const brand of brands) {
 const existing = await prisma.brand.findFirst({
 where: { name: brand.name, agencyId: agency.id },
 });

 if (existing) {
 console.log(` Brand "${brand.name}" already exists, skipping...`);
 continue;
 }

 const created = await prisma.brand.create({
 data: {
 ...brand,
 agencyId: agency.id,
 brandKit: brand.brandKit as any,
 },
 });

 console.log(` Created brand: ${created.name} (ID: ${created.id})`);
 }
}

async function seedPromptTemplates(): Promise<void> {
 console.log("Seeding prompt templates...");

 for (const template of promptTemplates) {
 const existing = await prisma.promptTemplate.findFirst({
 where: { name: template.name },
 });

 if (existing) {
 console.log(` Template "${template.name}" already exists, skipping...`);
 continue;
 }

 await prisma.promptTemplate.create({
 data: template,
 });

 console.log(` Created template: ${template.name}`);
 }
}

async function seedUsers(): Promise<void> {
 console.log("Seeding users...");

 const agency = await prisma.agency.findFirst();
 if (!agency) {
 console.log(" No agency found, skipping users...");
 return;
 }

 for (const user of users) {
 const existing = await prisma.user.findUnique({
 where: { email: user.email },
 });

 if (existing) {
 console.log(` User "${user.email}" already exists, skipping...`);
 continue;
 }

 const apiKey = generateApiKey();

 const created = await prisma.user.create({
 data: {
 email: user.email,
 name: user.name,
 password: hashPassword(user.password),
 role: user.role,
 agencyId: agency.id,
 apiKey: apiKey,
 brandAccess: {
 connect: [],
 },
 },
 });

 console.log(` Created user: ${created.email} (${created.role})`);
 console.log(` API Key: ${apiKey}`);
 }
}
}

async function createDefaultSettings(): Promise<void> {
 console.log("Creating default settings...");

 const agency = await prisma.agency.findFirst();
 if (!agency) return;

 // Check if settings already exist
 const existingSettings = await prisma.setting.findFirst({
 where: { agencyId: agency.id },
 });

 if (existingSettings) {
 console.log(" Settings already exist, skipping...");
 return;
 }

 await prisma.setting.create({
 data: {
 agencyId: agency.id,
 llmProviders: {
 openai: { enabled: true, defaultModel: "gpt-4o" },
 anthropic: { enabled: true, defaultModel: "claude-sonnet-4-20250514" },
 google: { enabled: true, defaultModel: "gemini-2.0-flash" },
 },
 trackingFrequency: "weekly",
 alertsEnabled: true,
 emailNotifications: true,
 },
 });

 console.log(" Created default settings");
}

async function main(): Promise<void> {
 console.log("=".repeat(50));
 console.log("BrandLens Database Seeder");
 console.log("=".repeat(50));

 try {
 // Seed in order (respecting foreign keys)
 await seedAgencies();
 await seedBrands();
 await seedPromptTemplates();
 await seedUsers();
 await createDefaultSettings();

 console.log("\n" + "=".repeat(50));
 console.log("Database seeded successfully!");
 console.log("=".repeat(50));
 console.log("\nDemo credentials:");
 console.log(" Admin: admin@brandlens.demo / admin123");
 console.log(" User: user@brandlens.demo / user123");
 console.log("\nNOTE: Save the API keys shown above - they won't be displayed again.");
 console.log("=".repeat(50));
 } catch (error) {
 console.error("\nSeeding failed:", error);
 process.exit(1);
 }
}

main()
 .catch((error) => {
 console.error("Unexpected error:", error);
 process.exit(1);
 })
 .finally(async () => {
 await prisma.$disconnect();
 });
