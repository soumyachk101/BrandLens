import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
 if (num >= 1000000) {
 return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
 }
 if (num >= 1000) {
 return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
 }
 return num.toString();
}

export function formatPercent(value: number): string {
 return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function getSentimentColor(score: number): string {
 if (score >= 80) return "#059669";
 if (score >= 60) return "#10B981";
 if (score >= 40) return "#64748B";
 if (score >= 20) return "#F97316";
 return "#DC2626";
}

export function getSentimentLabel(score: number): string {
 if (score >= 80) return "Very Positive";
 if (score >= 60) return "Positive";
 if (score >= 40) return "Neutral";
 if (score >= 20) return "Negative";
 return "Very Negative";
}

export function formatDate(date: Date | string): string {
 const d = new Date(date);
 return d.toLocaleDateString("en-US", {
 month: "short",
 day: "numeric",
 year: "numeric",
 });
}

export function formatDateTime(date: Date | string): string {
 const d = new Date(date);
 return d.toLocaleDateString("en-US", {
 month: "short",
 day: "numeric",
 year: "numeric",
 hour: "2-digit",
 minute: "2-digit",
 });
}
