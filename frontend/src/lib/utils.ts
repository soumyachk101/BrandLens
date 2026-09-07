import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
 if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
 if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
 return num.toLocaleString();
}

export function formatDate(date: Date | string | number): string {
 const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
 return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(date: Date | string | number): string {
 const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
 return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function formatCurrency(amount: number, currency = "USD"): string {
 return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function formatPercent(value: number, decimals = 1): string {
 return `${value.toFixed(decimals)}%`;
}

export function formatCompactNumber(num: number): string {
 return new Intl.NumberFormat("en-US", { notation: "compact" }).format(num);
}
