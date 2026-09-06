export const APP_NAME = "BrandLens";

export const BRAND_COLORS = {
 primary: "#8B5CF6",
 primaryLight: "#A78BFA",
 primaryDark: "#7C3AED",
 secondary: "#6366F1",
 accent: "#EC4899",
 neutral: "#6B7280",
} as const;

export const TYPOGRAPHY = {
 heading: { name: "Inter", fallback: ["system-ui", "sans-serif"] },
 body: { name: "Inter", fallback: ["system-ui", "sans-serif"] },
 mono: { name: "JetBrains Mono", fallback: ["monospace"] },
} as const;

export const AI_MODELS = {
 colors: "gpt-image-1",
 voice: "gpt-4o",
 fullBrand: "gpt-4o",
} as const;

export const PASSWORD_MIN_LENGTH = 8;

export const GENERATION_STEPS = [
 "Analyzing brand inputs",
 "Generating color palette",
 "Selecting typography",
 "Crafting brand voice",
 "Finalizing brand identity",
] as const;
