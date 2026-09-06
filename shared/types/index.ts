export type BrandProfile = {
 id: string;
 name: string;
 description: string;
 targetAudience: string;
 personality: string;
 createdAt: string;
 updatedAt: string;
};

export type BrandColors = {
 id: string;
 profileId: string;
 primary: string;
 secondary: string;
 accent: string;
 neutral: string;
};

export type BrandTypography = {
 id: string;
 profileId: string;
 headingFont: string;
 bodyFont: string;
};

export type BrandVoice = {
 id: string;
 profileId: string;
 tone: string;
 keywords: string[];
 tagline: string;
};

export type GenerationStatus = "draft" | "generating" | "completed" | "failed";

export type GenerationJob = {
 id: string;
 profileId: string;
 status: GenerationStatus;
 progress: number;
 error?: string;
 result?: unknown;
};
