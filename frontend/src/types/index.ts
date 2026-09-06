export interface BrandProfile {
 id: string;
 name: string;
 description: string;
 targetAudience: string;
 personality: string;
 createdAt: string;
 updatedAt: string;
}

export interface BrandColors {
 id: string;
 profileId: string;
 primary: string;
 secondary: string;
 accent: string;
 neutral: string;
}

export interface BrandTypography {
 id: string;
 profileId: string;
 headingFont: string;
 bodyFont: string;
}

export interface BrandVoice {
 id: string;
 profileId: string;
 tone: string;
 keywords: string[];
 tagline: string;
}

export type GenerationStatus = "draft" | "generating" | "completed" | "failed";

export interface GenerationJob {
 id: string;
 profileId: string;
 status: GenerationStatus;
 progress: number;
 error?: string;
 result?: unknown;
}
