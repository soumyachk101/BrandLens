import { z } from "zod";

export const BrandSchema = z.object({
 name: z.string().min(1, "Brand name is required").max(100),
 domain: z.string().url("Invalid domain URL"),
 keywords: z.array(z.string().min(1)).min(1, "At least one keyword required").max(20),
 competitors: z.array(z.string().url()).max(10),
 scanFrequency: z.enum(["daily", "weekly", "biweekly", "monthly"]),
 description: z.string().max(500).optional(),
});

export const ReportSchema = z.object({
 title: z.string().min(1).max(200),
 brandId: z.string().uuid(),
 period: z.object({
 start: z.date(),
 end: z.date(),
 }),
 sections: z.object({
 visibility: z.boolean().default(true),
 sentiment: z.boolean().default(true),
 mentions: z.boolean().default(true),
 competitors: z.boolean().default(true),
 keywords: z.boolean().default(true),
 }),
 recipients: z.array(z.string().email()).max(20),
});

export const QuerySchema = z.object({
 brandId: z.string().uuid().optional(),
 question: z.string().min(1, "Question is required").max,
});

export type BrandInput = z.infer<typeof BrandSchema>;
export type ReportInput = z.infer<typeof ReportSchema>;
export type QueryInput = z.infer<typeof QuerySchema>;
